import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";
import {
  abiCoder,
  combineAllowedCalls,
  LOCAL_PRIVATE_KEYS,
  provider,
  signLSP6ExecuteRelayCall,
} from "../../utils/helpers";
import {
  LSP7Mintable,
  LSP7MintableInit__factory,
  LSP7Mintable__factory,
} from "../../../types";
import { BigNumber } from "ethers";
import { EIP191Signer } from "@lukso/eip191-signer.js";

export const shouldBehaveLikeBatchExecute = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>
) => {
  describe("when using batch `execute(bytes[])`", () => {
    let context: LSP6TestContext;

    // a fictional DAI token on LUKSO
    let lyxDaiToken: LSP7Mintable,
      // a basic sample token
      metaCoin: LSP7Mintable,
      // a token that can be used as credits for a LUKSO relay service.
      // Inspired from https://github.com/lykhonis/relayer
      rLyxToken: LSP7Mintable;

    before(async () => {
      context = await buildContext(ethers.utils.parseEther("50"));

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
      ];

      const permissionsValues = [ALL_PERMISSIONS];

      await setupKeyManager(context, permissionKeys, permissionsValues);

      // deploy some sample LSP7 tokens and mint some tokens to the UP
      lyxDaiToken = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        "LYX DAI Invented Token",
        "LYXDAI",
        context.accounts[0].address,
        false
      );

      metaCoin = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        "Meta Coin",
        "MTC",
        context.accounts[0].address,
        false
      );

      rLyxToken = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        "LUKSO Relay Token",
        "rLYX",
        context.accounts[0].address,
        false
      );

      await lyxDaiToken.mint(
        context.universalProfile.address,
        100,
        false,
        "0x"
      );
      await metaCoin.mint(context.universalProfile.address, 100, false, "0x");
      await rLyxToken.mint(context.universalProfile.address, 100, false, "0x");
    });

    describe("example scenarios", () => {
      it("should send LYX to 3x different addresses", async () => {
        const { universalProfile, owner } = context;

        const recipients = [
          context.accounts[1].address,
          context.accounts[2].address,
          context.accounts[3].address,
        ];

        const amounts = [
          ethers.utils.parseEther("1"),
          ethers.utils.parseEther("2"),
          ethers.utils.parseEther("3"),
        ];

        const batchExecutePayloads = recipients.map((recipient, index) => {
          return universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, recipient, amounts[index], "0x"]
          );
        });

        const tx = await context.keyManager
          .connect(context.owner)
          ["execute(uint256[],bytes[])"]([0, 0, 0], batchExecutePayloads);

        await expect(tx).to.changeEtherBalance(
          context.universalProfile.address,
          ethers.utils.parseEther("-6")
        );
        await expect(tx).to.changeEtherBalances(recipients, amounts);
      });

      it("should send LYX + some LSP7 tokens to the same address", async () => {
        expect(
          await lyxDaiToken.balanceOf(context.universalProfile.address)
        ).to.equal(100);

        const recipient = context.accounts[1].address;
        const lyxAmount = ethers.utils.parseEther("3");
        const lyxDaiAmount = 25;

        const lyxDaiTransferPayload = lyxDaiToken.interface.encodeFunctionData(
          "transfer",
          [
            context.universalProfile.address,
            recipient,
            lyxDaiAmount,
            true,
            "0x",
          ]
        );

        const payloads = [
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, recipient, lyxAmount, "0x"]
          ),
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              lyxDaiToken.address,
              0,
              lyxDaiTransferPayload,
            ]
          ),
        ];

        const tx = await context.keyManager
          .connect(context.owner)
          ["execute(uint256[],bytes[])"]([0, 0], payloads);

        await expect(tx).to.changeEtherBalance(recipient, lyxAmount);
        expect(await lyxDaiToken.balanceOf(recipient)).to.equal(lyxDaiAmount);
      });

      it("should send 3x different tokens to the same recipient", async () => {
        const recipient = context.accounts[1].address;

        const recipientLyxDaiBalanceBefore = await lyxDaiToken.balanceOf(
          recipient
        );
        const recipientMetaCoinBalanceBefore = await metaCoin.balanceOf(
          recipient
        );
        const recipientRLyxBalanceBefore = await rLyxToken.balanceOf(recipient);

        const lyxDaiAmount = 25;
        const metaCoinAmount = 50;
        const rLyxAmount = 75;

        // prettier-ignore
        const lyxDaiTransferPayload = lyxDaiToken.interface.encodeFunctionData(
          "transfer",
          [context.universalProfile.address, recipient, lyxDaiAmount, true, "0x"]
        );

        // prettier-ignore
        const metaCoinTransferPayload = metaCoin.interface.encodeFunctionData(
          "transfer",
          [context.universalProfile.address, recipient, metaCoinAmount, true, "0x"]
        );

        const rLYXTransferPayload = metaCoin.interface.encodeFunctionData(
          "transfer",
          [context.universalProfile.address, recipient, rLyxAmount, true, "0x"]
        );

        const payloads = [
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, lyxDaiToken.address, 0, lyxDaiTransferPayload] // prettier-ignore
          ),
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, metaCoin.address, 0, metaCoinTransferPayload]
          ),
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, rLyxToken.address, 0, rLYXTransferPayload]
          ),
        ];

        await context.keyManager
          .connect(context.owner)
          ["execute(uint256[],bytes[])"]([0, 0, 0], payloads);

        expect(await lyxDaiToken.balanceOf(recipient)).to.equal(
          recipientLyxDaiBalanceBefore.add(lyxDaiAmount)
        );
        expect(await metaCoin.balanceOf(recipient)).to.equal(
          recipientMetaCoinBalanceBefore.add(metaCoinAmount)
        );
        expect(await rLyxToken.balanceOf(recipient)).to.equal(
          recipientRLyxBalanceBefore.add(rLyxAmount)
        );
      });

      it("should 1) deploy a LSP7 Token (as minimal proxy), 2) initialize it, and 3) set the token metadata", async () => {
        const lsp7MintableBase = await new LSP7MintableInit__factory(
          context.accounts[0]
        ).deploy();

        const lsp7TokenProxyBytecode = String(
          "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3"
        ).replace(
          "bebebebebebebebebebebebebebebebebebebebe",
          lsp7MintableBase.address.substring(2)
        );

        const lsp7ProxyDeploymentPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CREATE,
              ethers.constants.AddressZero,
              0,
              lsp7TokenProxyBytecode,
            ]
          );

        const futureTokenAddress = await context.keyManager
          .connect(context.owner)
          .callStatic["execute(bytes)"](lsp7ProxyDeploymentPayload);
        let futureTokenInstance = await new LSP7MintableInit__factory(
          context.accounts[0]
        ).attach(futureTokenAddress);

        const lsp7InitializePayload =
          futureTokenInstance.interface.encodeFunctionData("initialize", [
            "My LSP7 UP Token",
            "UPLSP7",
            context.universalProfile.address,
            false,
          ]);

        // use interface of an existing token contract
        const initializePayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, futureTokenAddress, 0, lsp7InitializePayload]
          );

        const tokenMetadataValue =
          "0x6f357c6aba20e595da5f38e6c75326802bbf871b4d98b5bfab27812a5456139e3ec087f4697066733a2f2f516d6659696d3146647a645a6747314a50484c46785a3964575a7761616f68596e4b626174797871553144797869";

        const lsp7SetDataPayload =
          futureTokenInstance.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [ERC725YDataKeys.LSP4["LSP4Metadata"], tokenMetadataValue]
          );
        const setTokenMetadataPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, futureTokenAddress, 0, lsp7SetDataPayload]
          );

        const tx = await context.keyManager
          .connect(context.owner)
          ["execute(uint256[],bytes[])"](
            [0, 0, 0],
            [
              // Step 1 - deploy Token contract as proxy
              lsp7ProxyDeploymentPayload,
              // Step 2 - initialize Token contract
              initializePayload,
              // Step 3 - set Token Metadata
              setTokenMetadataPayload,
            ]
          );

        // CHECK that token contract has been deployed
        await expect(tx)
          .to.emit(context.universalProfile, "ContractCreated")
          .withArgs(
            OPERATION_TYPES.CREATE,
            ethers.utils.getAddress(futureTokenAddress),
            0
          );

        // CHECK initialize parameters have been set correctly
        const nameResult = await futureTokenInstance["getData(bytes32)"](
          ERC725YDataKeys.LSP4["LSP4TokenName"]
        );
        const symbolResult = await futureTokenInstance["getData(bytes32)"](
          ERC725YDataKeys.LSP4["LSP4TokenSymbol"]
        );

        expect(ethers.utils.toUtf8String(nameResult)).to.equal(
          "My LSP7 UP Token"
        );
        expect(ethers.utils.toUtf8String(symbolResult)).to.equal("UPLSP7");
        expect(await futureTokenInstance.owner()).to.equal(
          context.universalProfile.address
        );

        // CHECK LSP4 token metadata has been set
        expect(
          await futureTokenInstance["getData(bytes32)"](
            ERC725YDataKeys.LSP4["LSP4Metadata"]
          )
        ).to.equal(tokenMetadataValue);
      });

      it("should 1) deploy a LSP7 token, 2) mint some tokens, 3) `transferBatch(...)` to multiple recipients", async () => {
        // step 1 - deploy token contract
        const lsp7ConstructorArguments = abiCoder.encode(
          ["string", "string", "address", "bool"],
          [
            "My UP LSP7 Token",
            "UPLSP7",
            context.universalProfile.address,
            false,
          ]
        );

        const lsp7DeploymentPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CREATE,
              ethers.constants.AddressZero,
              0,
              LSP7Mintable__factory.bytecode +
                lsp7ConstructorArguments.substring(2),
            ]
          );

        // we simulate deploying the token contract to know the future address of the LSP7 Token contract,
        // so that we can then pass the token address to the `to` parameter of ERC725X.execute(...)
        // in the 2nd and 3rd payloads of the LSP6 batch `execute(bytes[])`
        const futureTokenAddress = await context.keyManager
          .connect(context.owner)
          .callStatic["execute(bytes)"](lsp7DeploymentPayload);

        // step 2 - mint some tokens
        // use the interface of an existing token for encoding the function call
        const lsp7MintingPayload = lyxDaiToken.interface.encodeFunctionData(
          "mint",
          [context.universalProfile.address, 3_000, false, "0x"]
        );

        // step 3 - transfer batch to multiple addresses
        const sender = context.universalProfile.address;
        const recipients = [
          context.accounts[1].address,
          context.accounts[2].address,
          context.accounts[3].address,
        ];
        const amounts = [1_000, 1_000, 1_000];

        const lsp7TransferBatchPayload =
          lyxDaiToken.interface.encodeFunctionData("transferBatch", [
            [sender, sender, sender], // address[] memory from,
            recipients, // address[] memory to,
            amounts, // uint256[] memory amount,
            [true, true, true], // bool[] memory force,
            ["0x", "0x", "0x"], // bytes[] memory data
          ]);

        const payloads = [
          // step 1 - deploy token contract
          lsp7DeploymentPayload,
          // step 2 - mint some tokens for the UP
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, futureTokenAddress, 0, lsp7MintingPayload]
          ),
          // step 3 - `transferBatch(...)` the tokens to multiple addresses
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              futureTokenAddress,
              0,
              lsp7TransferBatchPayload,
            ]
          ),
        ];

        const tx = await context.keyManager
          .connect(context.owner)
          ["execute(uint256[],bytes[])"]([0, 0, 0], payloads);

        // CHECK for `ContractCreated` event
        await expect(tx)
          .to.emit(context.universalProfile, "ContractCreated")
          .withArgs(
            OPERATION_TYPES.CREATE,
            ethers.utils.getAddress(futureTokenAddress),
            0
          );

        // CHECK for tokens balances of recipients
        const createdTokenContract = await new LSP7Mintable__factory(
          context.accounts[0]
        ).attach(futureTokenAddress);
        expect([
          await createdTokenContract.balanceOf(recipients[0]),
          await createdTokenContract.balanceOf(recipients[1]),
          await createdTokenContract.balanceOf(recipients[2]),
        ]).to.deep.equal(amounts);
      });
    });

    describe("when specifying msg.value", () => {
      describe("when all the payloads are setData(...)", () => {
        describe("if specifying 0 for each values[index]", () => {
          it("should revert and not leave any funds locked on the Key Manager", async () => {
            const amountToFund = ethers.utils.parseEther("5");

            const dataKeys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key1")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key2")),
            ];
            const dataValues = ["0xaaaaaaaa", "0xbbbbbbbb"];

            const keyManagerBalanceBefore = await ethers.provider.getBalance(
              context.keyManager.address
            );

            const firstSetDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKeys[0], dataValues[0]]
              );

            const secondSetDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKeys[1], dataValues[1]]
              );

            // this error occurs when calling `setData(...)` with msg.value,
            // since these functions on ERC725Y are not payable
            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](
                  [0, 0],
                  [firstSetDataPayload, secondSetDataPayload],
                  { value: amountToFund }
                )
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "LSP6BatchExcessiveValueSent"
              )
              .withArgs(0, amountToFund);

            const keyManagerBalanceAfter = await ethers.provider.getBalance(
              context.keyManager.address
            );

            expect(keyManagerBalanceAfter).to.equal(keyManagerBalanceBefore);

            // the Key Manager must not hold any funds and must always forward any funds sent to it.
            // it's balance must always be 0 after any execution
            expect(
              await provider.getBalance(context.keyManager.address)
            ).to.equal(0);
          });
        });

        describe("if specifying some value for each values[index]", () => {
          it("should revert LSP6 `_executePayload` error since `setData(...)` is not payable", async () => {
            const amountToFund = ethers.utils.parseEther("2");

            const dataKeys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key1")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key2")),
            ];
            const dataValues = ["0xaaaaaaaa", "0xbbbbbbbb"];

            const keyManagerBalanceBefore = await ethers.provider.getBalance(
              context.keyManager.address
            );

            const firstSetDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKeys[0], dataValues[0]]
              );

            const secondSetDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKeys[1], dataValues[1]]
              );

            // this error occurs when calling `setData(...)` with msg.value,
            // since these functions on ERC725Y are not payable
            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](
                  [1, 1],
                  [firstSetDataPayload, secondSetDataPayload],
                  { value: amountToFund }
                )
            ).to.be.revertedWith(
              "LSP6: Unknown Error occured when calling the linked target contract"
            );

            const keyManagerBalanceAfter = await ethers.provider.getBalance(
              context.keyManager.address
            );

            expect(keyManagerBalanceAfter).to.equal(keyManagerBalanceBefore);

            // the Key Manager must not hold any funds and must always forward any funds sent to it.
            // it's balance must always be 0 after any execution
            expect(
              await provider.getBalance(context.keyManager.address)
            ).to.equal(0);
          });
        });
      });

      describe("when sending 2x payloads, 1st for `setData`, 2nd for `execute`", () => {
        describe("when `msgValues[1]` is zero for `setData(...)`", () => {
          it("should pass", async () => {
            const recipient = context.accounts[5].address;

            const dataKey = ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("Sample Data Key")
            );
            const dataValue = ethers.utils.hexlify(
              ethers.utils.randomBytes(10)
            );

            const msgValues = [
              ethers.BigNumber.from(0),
              ethers.BigNumber.from("5"),
            ];

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKey, dataValue]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [OPERATION_TYPES.CALL, recipient, msgValues[1], "0x"]
              ),
            ];

            const totalValues = msgValues.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](msgValues, payloads, {
                  value: totalValues,
                })
            ).to.changeEtherBalances(
              [context.universalProfile.address, recipient],
              [0, msgValues[1]]
            );
            expect(
              await context.universalProfile["getData(bytes32)"](dataKey)
            ).to.equal(dataValue);
          });
        });

        describe("when `msgValues[1]` is NOT zero for `setData(...)`", () => {
          it("should revert with default LSP6 `executePayload(...)` error message", async () => {
            const recipient = context.accounts[5].address;

            const dataKey = ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("Sample Data Key")
            );
            const dataValue = ethers.utils.hexlify(
              ethers.utils.randomBytes(10)
            );

            const msgValues = [
              ethers.BigNumber.from(5),
              ethers.BigNumber.from("5"),
            ];

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [dataKey, dataValue]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [OPERATION_TYPES.CALL, recipient, msgValues[1], "0x"]
              ),
            ];

            const totalValues = msgValues.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](msgValues, payloads, {
                  value: totalValues,
                })
            ).to.be.revertedWith(
              "LSP6: Unknown Error occured when calling the linked target contract"
            );
          });
        });
      });

      describe("when sending 3x payloads", () => {
        describe("when total `values[]` is LESS than `msg.value`", () => {
          it("should revert because insufficent `msg.value`", async () => {
            const firstRecipient = context.accounts[3].address;
            const secondRecipient = context.accounts[4].address;
            const thirdRecipient = context.accounts[5].address;

            const amountsToTransfer = [
              ethers.utils.parseEther("1"),
              ethers.utils.parseEther("1"),
              ethers.utils.parseEther("1"),
            ];

            const values = [
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
            ];

            const totalValues = values.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            // total of values[] - 1. To check we are not sending enough fuds
            const msgValue = totalValues.sub(1);

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  firstRecipient,
                  amountsToTransfer[0],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  secondRecipient,
                  amountsToTransfer[1],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  thirdRecipient,
                  amountsToTransfer[2],
                  "0x",
                ]
              ),
            ];

            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](values, payloads, {
                  value: msgValue,
                })
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "LSP6BatchInsufficientValueSent"
              )
              .withArgs(totalValues, msgValue);
          });
        });

        describe("when total `values[]` is MORE than `msg.value`", () => {
          it("should revert to not leave any remaining funds on the Key Manager", async () => {
            const firstRecipient = context.accounts[3].address;
            const secondRecipient = context.accounts[4].address;
            const thirdRecipient = context.accounts[5].address;

            const amountsToTransfer = [
              ethers.utils.parseEther("1"),
              ethers.utils.parseEther("1"),
              ethers.utils.parseEther("1"),
            ];

            const values = [
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
            ];

            const totalValues = values.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            // total of values[] + 1. To check we cannot send to much funds and leave some in the Key Manager
            const msgValue = totalValues.add(1);

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  firstRecipient,
                  amountsToTransfer[0],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  secondRecipient,
                  amountsToTransfer[1],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  thirdRecipient,
                  amountsToTransfer[2],
                  "0x",
                ]
              ),
            ];

            await expect(
              context.keyManager
                .connect(context.owner)
                ["execute(uint256[],bytes[])"](values, payloads, {
                  value: msgValue,
                })
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "LSP6BatchExcessiveValueSent"
              )
              .withArgs(totalValues, msgValue);
          });
        });

        describe("when total `values[]` is EQUAL to `msg.value`", () => {
          it("should pass", async () => {
            const firstRecipient = context.accounts[3].address;
            const secondRecipient = context.accounts[4].address;
            const thirdRecipient = context.accounts[5].address;

            const amountsToTransfer = [
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
            ];

            const values = [
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
              ethers.utils.parseEther("2"),
            ];

            const totalValues = values.reduce((accumulator, currentValue) =>
              accumulator.add(currentValue)
            );

            const payloads = [
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  firstRecipient,
                  amountsToTransfer[0],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  secondRecipient,
                  amountsToTransfer[1],
                  "0x",
                ]
              ),
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [
                  OPERATION_TYPES.CALL,
                  thirdRecipient,
                  amountsToTransfer[2],
                  "0x",
                ]
              ),
            ];

            let tx = await context.keyManager
              .connect(context.owner)
              ["execute(uint256[],bytes[])"](values, payloads, {
                value: totalValues,
              });

            await expect(tx).to.changeEtherBalances(
              [
                context.universalProfile.address,
                firstRecipient,
                secondRecipient,
                thirdRecipient,
              ],
              [
                0,
                amountsToTransfer[0],
                amountsToTransfer[1],
                amountsToTransfer[2],
              ]
            );
          });
        });
      });
    });

    describe("when one of the payload reverts", () => {
      it("should revert the whole transaction if first payload reverts", async () => {
        const upBalance = await provider.getBalance(
          context.universalProfile.address
        );

        const validAmount = ethers.utils.parseEther("1");
        expect(validAmount).to.be.lt(upBalance); // sanity check

        // make it revert by sending too much value than the actual balance
        const invalidAmount = upBalance.add(10);

        const randomRecipient = ethers.Wallet.createRandom().address;

        const failingTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, "0x"]
          );

        const firstTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        const secondTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        await expect(
          context.keyManager
            .connect(context.owner)
            ["execute(uint256[],bytes[])"](
              [0, 0, 0],
              [
                failingTransferPayload,
                firstTransferPayload,
                secondTransferPayload,
              ]
            )
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          "ERC725X_InsufficientBalance"
        );
      });

      it("should revert the whole transaction if last payload reverts", async () => {
        const upBalance = await provider.getBalance(
          context.universalProfile.address
        );

        const validAmount = ethers.utils.parseEther("1");
        expect(validAmount).to.be.lt(upBalance); // sanity check

        // make it revert by sending too much value than the actual balance
        const invalidAmount = upBalance.add(10);

        const randomRecipient = ethers.Wallet.createRandom().address;

        const failingTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, "0x"]
          );

        const firstTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        const secondTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        await expect(
          context.keyManager
            .connect(context.owner)
            ["execute(uint256[],bytes[])"](
              [0, 0, 0],
              [
                firstTransferPayload,
                secondTransferPayload,
                failingTransferPayload,
              ]
            )
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          "ERC725X_InsufficientBalance"
        );
      });
    });
  });

  describe("when using batch `executeRelayCall([],[],[],[])", () => {
    let context: LSP6TestContext;

    let minter: SignerWithAddress;
    let tokenRecipient: SignerWithAddress;

    let tokenContract: LSP7Mintable;

    before(async () => {
      context = await buildContext(ethers.utils.parseEther("100"));

      minter = context.accounts[1];
      tokenRecipient = context.accounts[2];

      // deploy token contract
      tokenContract = await new LSP7Mintable__factory(
        context.accounts[0]
      ).deploy(
        "My LSP7 Token",
        "LSP7",
        context.universalProfile.address,
        false
      );

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
      ];

      const permissionsValues = [ALL_PERMISSIONS];

      await setupKeyManager(context, permissionKeys, permissionsValues);
    });

    it("should revert when there are not the same number of elements for each parameters", async () => {
      // these are dummy values parameters. The aim is to check that it reverts in the first place.
      const signatures = [
        "0x" + "aa".repeat(65),
        "0x" + "bb".repeat(65),
        "0x" + "cc".repeat(65),
      ];
      const nonces = [0, 1, 2];
      const values = [0, 0, 0];
      const payloads = ["0xcafecafe", "0xbeefbeef"];

      await expect(
        context.keyManager
          .connect(context.owner)
          ["executeRelayCall(bytes[],uint256[],uint256[],bytes[])"](
            signatures,
            nonces,
            values,
            payloads
          )
      ).to.be.revertedWithCustomError(
        context.keyManager,
        "BatchExecuteRelayCallParamsLengthMismatch"
      );
    });

    it("should revert when we are specifying the same signature twice", async () => {
      const recipient = context.accounts[1].address;
      const amountForRecipient = ethers.utils.parseEther("1");

      const transferLyxPayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, recipient, amountForRecipient, "0x"]
        );

      const ownerNonce = await context.keyManager.getNonce(
        context.owner.address,
        0
      );

      const transferLyxSignature = await signLSP6ExecuteRelayCall(
        context.keyManager,
        ownerNonce.toHexString(),
        LOCAL_PRIVATE_KEYS.ACCOUNT0,
        0,
        transferLyxPayload
      );

      // these steps (before running the batch executeRelayCall([],[],[]) on the KeyManager)
      // describe why the execution fails with `InvalidRelayNonce` error.
      // the Key Manager recovers the address based on:
      // - the signature provided
      // - the encoded message generated internally using:
      //        `abi.encodePacked(LSP6_VERSION, block.chainid,nonce, msg.value, payload);`
      //
      // the address is recovered as follow:
      //    `address signer = address(this).toDataWithIntendedValidator(encodedMessage).recover(signature);`
      //
      // when running the second payload in the batch execution, the Key Manager will recover a different signer address, because:
      //    - the encodedMessage generated internally includes nonce = 1
      //    - the signature provided was for an encoded message with nonce = 0 (same signature as the first payload)
      //
      // because no encoded message with nonce = 1 was signed, and the signature provided was for an encoded message with nonce = 0,
      // the KeyManager ends up recovering a random address (since the signature and the encoded message are not 'related to each other')
      // Therefore, the Key Manager try to verify the nonce of a different address than the one that signed the message, and the nonce is invalid.
      const eip191 = new EIP191Signer();

      let encodedMessage = ethers.utils.solidityPack(
        ["uint256", "uint256", "uint256", "uint256", "bytes"],
        [6, 31337, ownerNonce.add(1), 0, transferLyxPayload]
      );

      const hashedDataWithIntendedValidator =
        eip191.hashDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage
        );

      const incorrectRecoveredAddress = await eip191.recover(
        hashedDataWithIntendedValidator,
        transferLyxSignature
      );

      // the transaction will revert with InvalidNonce because it will check the nonce of
      // the incorrectly recovered address (as explained above)
      await expect(
        context.keyManager
          .connect(context.owner)
          ["executeRelayCall(bytes[],uint256[],uint256[],bytes[])"](
            [transferLyxSignature, transferLyxSignature],
            [ownerNonce, ownerNonce.add(1)],
            [0, 0],
            [transferLyxPayload, transferLyxPayload]
          )
      )
        .to.be.revertedWithCustomError(context.keyManager, "InvalidRelayNonce")
        .withArgs(
          incorrectRecoveredAddress,
          ownerNonce.add(1),
          transferLyxSignature
        );
    });

    it("should 1) give the permission to someone to mint, 2) let the controller mint, 3) remove the permission to the controller to mint", async () => {
      let signatures: string[];
      let nonces: BigNumber[];
      let payloads: string[];
      const tokensToMint = 1_000;

      // step 1 - give minter permissions to mint
      const giveMinterPermissionsPayload =
        context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [
            [
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
                minter.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
                minter.address.substring(2),
            ],
            [
              PERMISSIONS.CALL,
              combineAllowedCalls(
                [INTERFACE_IDS.LSP7DigitalAsset],
                [tokenContract.address],
                [tokenContract.interface.getSighash("mint")]
              ),
            ],
          ]
        );

      const ownerNonce = await context.keyManager.getNonce(
        context.owner.address,
        0
      );
      const ownerGivePermissionsSignature = await signLSP6ExecuteRelayCall(
        context.keyManager,
        ownerNonce.toHexString(),
        LOCAL_PRIVATE_KEYS.ACCOUNT0,
        0,
        giveMinterPermissionsPayload
      );

      // Step 2 - let minter mint
      const minterMintPayload = tokenContract.interface.encodeFunctionData(
        "mint",
        [tokenRecipient.address, tokensToMint, true, "0x"]
      );
      const executePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, tokenContract.address, 0, minterMintPayload]
        );

      const minterNonce = await context.keyManager.getNonce(minter.address, 0);
      const minterMintSignature = await signLSP6ExecuteRelayCall(
        context.keyManager,
        minterNonce.toHexString(),
        LOCAL_PRIVATE_KEYS.ACCOUNT1,
        0,
        executePayload
      );

      // Step 3 - remove minter permissions to mint
      const removeMinterPermissionsPayload =
        context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [
            [
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
                minter.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
                minter.address.substring(2),
            ],
            ["0x", "0x"],
          ]
        );
      const newOwnerNonce = ownerNonce.add(1);
      const ownerRemovePermissionsSignature = await signLSP6ExecuteRelayCall(
        context.keyManager,
        newOwnerNonce.toHexString(),
        LOCAL_PRIVATE_KEYS.ACCOUNT0,
        0,
        removeMinterPermissionsPayload
      );

      await context.keyManager
        .connect(context.owner)
        ["executeRelayCall(bytes[],uint256[],uint256[],bytes[])"](
          [
            ownerGivePermissionsSignature,
            minterMintSignature,
            ownerRemovePermissionsSignature,
          ],
          [ownerNonce, minterNonce, newOwnerNonce],
          [0, 0, 0],
          [
            giveMinterPermissionsPayload,
            executePayload,
            removeMinterPermissionsPayload,
          ]
        );

      // CHECK that the recipient received its tokens
      expect(await tokenContract.balanceOf(tokenRecipient.address)).to.equal(
        tokensToMint
      );

      // CHECK that the minter does not have permissions anymore
      expect(
        await context.universalProfile["getData(bytes32[])"]([
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            minter.address.substring(2),
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            minter.address.substring(2),
        ])
      ).to.deep.equal(["0x", "0x"]);

      // CHECK that the minter cannot mint anymore
      await expect(
        context.keyManager.connect(minter)["execute(bytes)"](executePayload)
      )
        .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
        .withArgs(minter.address);
    });

    describe("when specifying msg.value", () => {
      describe("when total `values[]` is LESS than `msg.value`", () => {
        it("should revert because insufficent `msg.value`", async () => {
          const firstRecipient = context.accounts[1].address;
          const secondRecipient = context.accounts[2].address;
          const thirdRecipient = context.accounts[3].address;

          const transferAmounts = [
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
          ];

          const values = [
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
          ];

          const totalValues = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue)
          );

          // give to much and check that no funds can remain on the Key Manager
          const amountToFund = totalValues.sub(1);

          const firstLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, firstRecipient, transferAmounts[0], "0x"]
            );

          const secondLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, secondRecipient, transferAmounts[1], "0x"]
            );

          const thirdLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, thirdRecipient, transferAmounts[2], "0x"]
            );

          const ownerNonce = await context.keyManager.getNonce(
            context.owner.address,
            0
          );

          const firstTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[0],
            firstLyxTransfer
          );
          const secondTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.add(1).toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[1],
            secondLyxTransfer
          );
          const thirdTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.add(2).toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[2],
            thirdLyxTransfer
          );

          await expect(
            context.keyManager
              .connect(context.owner)
              ["executeRelayCall(bytes[],uint256[],uint256[],bytes[])"](
                [
                  firstTransferLyxSignature,
                  secondTransferLyxSignature,
                  thirdTransferLyxSignature,
                ],
                [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)],
                values,
                [firstLyxTransfer, secondLyxTransfer, thirdLyxTransfer],
                { value: amountToFund }
              )
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "LSP6BatchInsufficientValueSent"
            )
            .withArgs(totalValues, amountToFund);
        });
      });

      describe("when total `values[]` is MORE than `msg.value`", () => {
        it("should revert to not leave any remaining funds on the Key Manager", async () => {
          const firstRecipient = context.accounts[1].address;
          const secondRecipient = context.accounts[2].address;
          const thirdRecipient = context.accounts[3].address;

          const transferAmounts = [
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
          ];

          const values = [
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
          ];

          const totalValues = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue)
          );

          // give to much and check that no funds can remain on the Key Manager
          const amountToFund = totalValues.add(1);

          const firstLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, firstRecipient, transferAmounts[0], "0x"]
            );

          const secondLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, secondRecipient, transferAmounts[1], "0x"]
            );

          const thirdLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, thirdRecipient, transferAmounts[2], "0x"]
            );

          const ownerNonce = await context.keyManager.getNonce(
            context.owner.address,
            0
          );

          const firstTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[0],
            firstLyxTransfer
          );
          const secondTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.add(1).toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[1],
            secondLyxTransfer
          );
          const thirdTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.add(2).toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[2],
            thirdLyxTransfer
          );

          await expect(
            context.keyManager
              .connect(context.owner)
              ["executeRelayCall(bytes[],uint256[],uint256[],bytes[])"](
                [
                  firstTransferLyxSignature,
                  secondTransferLyxSignature,
                  thirdTransferLyxSignature,
                ],
                [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)],
                values,
                [firstLyxTransfer, secondLyxTransfer, thirdLyxTransfer],
                { value: amountToFund }
              )
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "LSP6BatchExcessiveValueSent"
            )
            .withArgs(totalValues, amountToFund);
        });
      });

      describe("when total `values[]` is EQUAL to `msg.value`", () => {
        it("should pass", async () => {
          const firstRecipient = context.accounts[1].address;
          const secondRecipient = context.accounts[2].address;
          const thirdRecipient = context.accounts[3].address;

          const transferAmounts = [
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
          ];

          const values = [
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
            ethers.utils.parseEther("1"),
          ];

          const amountToFund = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue)
          );

          const firstLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, firstRecipient, transferAmounts[0], "0x"]
            );

          const secondLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, secondRecipient, transferAmounts[1], "0x"]
            );

          const thirdLyxTransfer =
            context.universalProfile.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, thirdRecipient, transferAmounts[2], "0x"]
            );

          const ownerNonce = await context.keyManager.getNonce(
            context.owner.address,
            0
          );

          const firstTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[0],
            firstLyxTransfer
          );
          const secondTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.add(1).toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[1],
            secondLyxTransfer
          );
          const thirdTransferLyxSignature = await signLSP6ExecuteRelayCall(
            context.keyManager,
            ownerNonce.add(2).toHexString(),
            LOCAL_PRIVATE_KEYS.ACCOUNT0,
            values[2],
            thirdLyxTransfer
          );

          let tx = await context.keyManager
            .connect(context.owner)
            ["executeRelayCall(bytes[],uint256[],uint256[],bytes[])"](
              [
                firstTransferLyxSignature,
                secondTransferLyxSignature,
                thirdTransferLyxSignature,
              ],
              [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)],
              values,
              [firstLyxTransfer, secondLyxTransfer, thirdLyxTransfer],
              { value: amountToFund }
            );

          await expect(tx).to.changeEtherBalances(
            [
              context.universalProfile.address,
              firstRecipient,
              secondRecipient,
              thirdRecipient,
            ],
            [0, values[0], values[1], values[2]]
          );
        });
      });
    });

    describe("when one of the payload reverts", () => {
      it("should revert the whole transaction if first payload reverts", async () => {
        const upBalance = await provider.getBalance(
          context.universalProfile.address
        );

        const validAmount = ethers.utils.parseEther("1");
        expect(validAmount).to.be.lt(upBalance); // sanity check

        // make it revert by sending too much value than the actual balance
        const invalidAmount = upBalance.add(10);

        const randomRecipient = ethers.Wallet.createRandom().address;

        const failingTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, "0x"]
          );

        const firstTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        const secondTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        const ownerNonce = await context.keyManager.getNonce(
          context.owner.address,
          0
        );

        const nonces = [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)];

        // prettier-ignore
        const signatures = [
                signLSP6ExecuteRelayCall(context.keyManager, nonces[0].toHexString(), LOCAL_PRIVATE_KEYS.ACCOUNT0, 0, failingTransferPayload),
              signLSP6ExecuteRelayCall(context.keyManager, nonces[1].toHexString(), LOCAL_PRIVATE_KEYS.ACCOUNT0, 0, firstTransferPayload),
              signLSP6ExecuteRelayCall(context.keyManager, nonces[2].toHexString(), LOCAL_PRIVATE_KEYS.ACCOUNT0, 0, secondTransferPayload),
            ];

        // prettier-ignore
        const payloads = [failingTransferPayload, firstTransferPayload, secondTransferPayload];

        await expect(
          context.keyManager
            .connect(context.owner)
            ["executeRelayCall(bytes[],uint256[],uint256[],bytes[])"](
              signatures,
              nonces,
              [0, 0, 0],
              payloads
            )
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          "ERC725X_InsufficientBalance"
        );
      });

      it("should revert the whole transaction if last payload reverts", async () => {
        const upBalance = await provider.getBalance(
          context.universalProfile.address
        );

        const validAmount = ethers.utils.parseEther("1");
        expect(validAmount).to.be.lt(upBalance); // sanity check

        // make it revert by sending too much value than the actual balance
        const invalidAmount = upBalance.add(10);

        const randomRecipient = ethers.Wallet.createRandom().address;

        const failingTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, "0x"]
          );

        const firstTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        const secondTransferPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, randomRecipient, validAmount, "0x"]
          );

        const ownerNonce = await context.keyManager.getNonce(
          context.owner.address,
          0
        );

        const nonces = [ownerNonce, ownerNonce.add(1), ownerNonce.add(2)];
        const values = [0, 0, 0];

        // prettier-ignore
        const signatures = [
          signLSP6ExecuteRelayCall(context.keyManager, nonces[0].toHexString(), LOCAL_PRIVATE_KEYS.ACCOUNT0, 0, firstTransferPayload),
          signLSP6ExecuteRelayCall(context.keyManager, nonces[1].toHexString(), LOCAL_PRIVATE_KEYS.ACCOUNT0, 0, secondTransferPayload),
          signLSP6ExecuteRelayCall(context.keyManager, nonces[2].toHexString(), LOCAL_PRIVATE_KEYS.ACCOUNT0, 0, failingTransferPayload),
        ];

        // prettier-ignore
        const payloads = [firstTransferPayload, secondTransferPayload, failingTransferPayload];

        await expect(
          context.keyManager
            .connect(context.owner)
            ["executeRelayCall(bytes[],uint256[],uint256[],bytes[])"](
              signatures,
              nonces,
              values,
              payloads
            )
        ).to.be.revertedWithCustomError(
          context.universalProfile,
          "ERC725X_InsufficientBalance"
        );
      });
    });
  });
};
