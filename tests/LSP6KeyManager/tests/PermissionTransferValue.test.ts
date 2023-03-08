import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EIP191Signer } from "@lukso/eip191-signer.js";
import { BigNumber } from "ethers";
import {
  Executor,
  Executor__factory,
  FallbackContract,
  FallbackContract__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
  TargetContract__factory,
  TargetPayableContract,
  TargetPayableContract__factory,
  UniversalProfile__factory,
} from "../../../types";

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  LSP6_VERSION,
  PERMISSIONS,
  OPERATION_TYPES,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import {
  provider,
  combinePermissions,
  combineAllowedCalls,
  LOCAL_PRIVATE_KEYS,
} from "../../utils/helpers";

const universalProfileInterface = UniversalProfile__factory.createInterface();

export const shouldBehaveLikePermissionTransferValue = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  describe("when caller = EOA", () => {
    let canTransferValue: SignerWithAddress,
      canTransferValueAndCall: SignerWithAddress,
      cannotTransferValue: SignerWithAddress;

    let recipient;

    before(async () => {
      context = await buildContext(ethers.utils.parseEther("100"));

      canTransferValue = context.accounts[1];
      canTransferValueAndCall = context.accounts[2];
      cannotTransferValue = context.accounts[3];
      recipient = context.accounts[4];

      const permissionsKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canTransferValue.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          canTransferValue.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canTransferValueAndCall.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          canTransferValueAndCall.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          cannotTransferValue.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.TRANSFERVALUE,
        combineAllowedCalls(
          ["0xffffffff"],
          [recipient.address],
          ["0xffffffff"]
        ),
        combinePermissions(PERMISSIONS.TRANSFERVALUE, PERMISSIONS.CALL),
        combineAllowedCalls(
          ["0xffffffff"],
          [recipient.address],
          ["0xffffffff"]
        ),
        PERMISSIONS.CALL,
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe("when recipient = EOA", () => {
      describe("when transferring value via `execute(...)`", () => {
        describe("when transferring value without bytes `_data`", () => {
          const data = "0x";

          it("should pass when caller has ALL PERMISSIONS", async () => {
            const amount = ethers.utils.parseEther("3");

            let transferPayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, recipient.address, amount, data]
            );

            /**
             * verify that balances have been updated
             * @see https://hardhat.org/hardhat-chai-matchers/docs/reference#.changeetherbalances
             */
            await expect(() =>
              context.keyManager
                .connect(context.owner)
                ["execute(bytes)"](transferPayload)
            ).to.changeEtherBalances(
              [context.universalProfile.address, recipient.address],
              [`-${amount}`, amount]
            );
          });

          it("should pass when caller has permission TRANSFERVALUE only", async () => {
            const amount = ethers.utils.parseEther("3");

            let transferPayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, recipient.address, amount, data]
            );

            await expect(() =>
              context.keyManager
                .connect(canTransferValue)
                ["execute(bytes)"](transferPayload)
            ).to.changeEtherBalances(
              [context.universalProfile.address, recipient.address],
              [`-${amount}`, amount]
            );
          });

          it("should pass when caller has permission TRANSFERVALUE + CALL", async () => {
            const amount = ethers.utils.parseEther("3");

            let transferPayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, recipient.address, amount, data]
            );

            await expect(() =>
              context.keyManager
                .connect(canTransferValueAndCall)
                ["execute(bytes)"](transferPayload)
            ).to.changeEtherBalances(
              [context.universalProfile.address, recipient.address],
              [`-${amount}`, amount]
            );
          });

          it("should fail when caller does not have permission TRANSFERVALUE", async () => {
            let initialBalanceUP = await provider.getBalance(
              context.universalProfile.address
            );
            let initialBalanceRecipient = await provider.getBalance(
              recipient.address
            );

            let transferPayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                recipient.address,
                ethers.utils.parseEther("3"),
                data,
              ]
            );

            await expect(
              context.keyManager
                .connect(cannotTransferValue)
                ["execute(bytes)"](transferPayload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(cannotTransferValue.address, "TRANSFERVALUE");

            let newBalanceUP = await provider.getBalance(
              context.universalProfile.address
            );
            let newBalanceRecipient = await provider.getBalance(
              recipient.address
            );

            // verify that native token balances have not changed
            expect(newBalanceUP).to.equal(initialBalanceUP);
            expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
          });
        });

        describe("when transferring value with bytes `_data`", () => {
          const data = "0xaabbccdd";

          it("should pass when caller has ALL PERMISSIONS", async () => {
            let initialBalanceUP = await provider.getBalance(
              context.universalProfile.address
            );

            let initialBalanceRecipient = await provider.getBalance(
              recipient.address
            );

            let transferPayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                recipient.address,
                ethers.utils.parseEther("3"),
                data,
              ]
            );

            await context.keyManager
              .connect(context.owner)
              ["execute(bytes)"](transferPayload);

            let newBalanceUP = await provider.getBalance(
              context.universalProfile.address
            );
            expect(newBalanceUP).to.be.lt(initialBalanceUP);

            let newBalanceRecipient = await provider.getBalance(
              recipient.address
            );
            expect(newBalanceRecipient).to.be.gt(initialBalanceRecipient);
          });

          it("should pass when caller has permission TRANSFERVALUE + CALL", async () => {
            const amount = ethers.utils.parseEther("3");

            let transferPayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, recipient.address, amount, data]
            );

            await expect(() =>
              context.keyManager
                .connect(canTransferValueAndCall)
                ["execute(bytes)"](transferPayload)
            ).to.changeEtherBalances(
              [context.universalProfile.address, recipient.address],
              [`-${amount}`, amount]
            );
          });

          it("should fail when caller has permission TRANSFERVALUE only", async () => {
            let initialBalanceUP = await provider.getBalance(
              context.universalProfile.address
            );
            let initialBalanceRecipient = await provider.getBalance(
              recipient.address
            );

            let transferPayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                recipient.address,
                ethers.utils.parseEther("3"),
                data,
              ]
            );

            await expect(
              context.keyManager
                .connect(canTransferValue)
                ["execute(bytes)"](transferPayload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canTransferValue.address, "CALL");

            let newBalanceUP = await provider.getBalance(
              context.universalProfile.address
            );
            let newBalanceRecipient = await provider.getBalance(
              recipient.address
            );

            // verify that native token balances have not changed
            expect(newBalanceUP).to.equal(initialBalanceUP);
            expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
          });

          it("should fail when caller does not have permission TRANSFERVALUE", async () => {
            let initialBalanceUP = await provider.getBalance(
              context.universalProfile.address
            );
            let initialBalanceRecipient = await provider.getBalance(
              recipient.address
            );

            let transferPayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                recipient.address,
                ethers.utils.parseEther("3"),
                data,
              ]
            );

            await expect(
              context.keyManager
                .connect(cannotTransferValue)
                ["execute(bytes)"](transferPayload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(cannotTransferValue.address, "TRANSFERVALUE");

            let newBalanceUP = await provider.getBalance(
              context.universalProfile.address
            );
            let newBalanceRecipient = await provider.getBalance(
              recipient.address
            );

            // verify that native token balances have not changed
            expect(newBalanceUP).to.equal(initialBalanceUP);
            expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
          });
        });
      });

      describe("when transferring value via `executeRelayCall(...)`", () => {
        it("should revert if tx was signed with Eth Signed Message", async () => {
          const amount = ethers.utils.parseEther("3");

          let executeRelayCallPayload =
            universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, recipient.address, amount, "0x"]
            );

          const HARDHAT_CHAINID = 31337;
          let valueToSend = 0;

          let encodedMessage = ethers.utils.solidityPack(
            ["uint256", "uint256", "uint256", "uint256", "bytes"],
            [
              LSP6_VERSION,
              HARDHAT_CHAINID,
              0,
              valueToSend,
              executeRelayCallPayload,
            ]
          );

          // ethereum signed message prefix
          let signature = await context.owner.signMessage(encodedMessage);

          await expect(
            context.keyManager["executeRelayCall(bytes,uint256,bytes)"](
              signature,
              0,
              executeRelayCallPayload,
              { value: valueToSend }
            )
          ).to.be.reverted;
        });

        it("should pass if tx was signed with EIP191Signer '\\x19\\x00' prefix", async () => {
          const eip191Signer = new EIP191Signer();

          const amount = ethers.utils.parseEther("3");

          let executeRelayCallPayload =
            universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, recipient.address, amount, "0x"]
            );

          const HARDHAT_CHAINID = 31337;
          let valueToSend = 0;

          let encodedMessage = ethers.utils.solidityPack(
            ["uint256", "uint256", "uint256", "uint256", "bytes"],
            [
              LSP6_VERSION,
              HARDHAT_CHAINID,
              0,
              valueToSend,
              executeRelayCallPayload,
            ]
          );

          let { signature } = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            encodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT0
          );

          await expect(
            context.keyManager
              .connect(context.owner)
              ["executeRelayCall(bytes,uint256,bytes)"](
                signature,
                0,
                executeRelayCallPayload,
                {
                  value: valueToSend,
                }
              )
          ).to.changeEtherBalances(
            [context.universalProfile.address, recipient.address],
            [`-${amount}`, amount]
          );
        });
      });
    });

    /**
     * @todo when recipient is a contract
     */
  });

  describe("when caller = contract", () => {
    let contractCanTransferValue: Executor;

    let recipient: string;

    const hardcodedRecipient: string =
      "0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe";

    /**
     * @dev this is necessary when the function being called in the contract
     *  perform a raw / low-level call (in the function body)
     *  otherwise, the deeper layer of interaction (UP["execute(bytes)"]) fails
     */
    const GAS_PROVIDED = 200_000;

    before(async () => {
      context = await buildContext(ethers.utils.parseEther("100"));

      recipient = context.accounts[1].address;

      contractCanTransferValue = await new Executor__factory(
        context.accounts[0]
      ).deploy(context.universalProfile.address, context.keyManager.address);

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          contractCanTransferValue.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          contractCanTransferValue.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.TRANSFERVALUE,
        combineAllowedCalls(
          ["0xffffffff", "0xffffffff"],
          [hardcodedRecipient, recipient],
          ["0xffffffff", "0xffffffff"]
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("> Contract calls", () => {
      it("Should send 1 LYX to an address hardcoded in Executor (`sendOneLyxHardcoded`)", async () => {
        const amount = ethers.utils.parseEther("1");

        await expect(() =>
          contractCanTransferValue.sendOneLyxHardcoded({
            gasLimit: GAS_PROVIDED,
          })
        ).to.changeEtherBalances(
          [context.universalProfile.address, hardcodedRecipient],
          [
            `-${amount}`, // UP balance should have gone down
            amount, // recipient balance should have gone up
          ]
        );
      });

      it("Should send 1 LYX to an address provided to Executor (`sendOneLyxToRecipient`)", async () => {
        const amount = ethers.utils.parseEther("1");

        await expect(() =>
          contractCanTransferValue.sendOneLyxToRecipient(recipient, {
            gasLimit: GAS_PROVIDED,
          })
        ).to.changeEtherBalances(
          [context.universalProfile.address, recipient],
          [`-${amount}`, amount]
        );
      });
    });

    describe("> Low-level calls", () => {
      it("Should send 1 LYX to an address hardcoded in Executor (`sendOneLyxHardcodedRawCall`)", async () => {
        const amount = ethers.utils.parseEther("1");

        await expect(() =>
          contractCanTransferValue.sendOneLyxHardcodedRawCall({
            gasLimit: GAS_PROVIDED,
          })
        ).to.changeEtherBalances(
          [context.universalProfile.address, hardcodedRecipient],
          [`-${amount}`, amount]
        );
      });

      it("Should send 1 LYX to an address provided to Executor (`sendOneLyxToRecipientRawCall`)", async () => {
        const amount = ethers.utils.parseEther("1");

        await expect(() =>
          contractCanTransferValue.sendOneLyxToRecipientRawCall(recipient, {
            gasLimit: GAS_PROVIDED,
          })
        ).to.changeEtherBalances(
          [context.universalProfile.address, recipient],
          [`-${amount}`, amount]
        );
      });
    });
  });

  describe("when caller is another UP (with a KeyManager as owner)", () => {
    // UP making the call
    let alice: SignerWithAddress;
    let aliceContext: LSP6TestContext;

    // UP being called
    let bob: SignerWithAddress;
    let bobContext: LSP6TestContext;

    before(async () => {
      aliceContext = await buildContext(ethers.utils.parseEther("50"));
      alice = aliceContext.accounts[0];

      bobContext = await buildContext(ethers.utils.parseEther("50"));
      bob = bobContext.accounts[1];

      const alicePermissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substring(2),
      ];
      const alicePermissionValues = [ALL_PERMISSIONS];

      const bobPermissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          aliceContext.universalProfile.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          aliceContext.universalProfile.address.substring(2),
      ];

      const bobPermissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.TRANSFERVALUE,
        combineAllowedCalls(
          ["0xffffffff"],
          [aliceContext.universalProfile.address],
          ["0xffffffff"]
        ),
      ];

      await setupKeyManager(
        aliceContext,
        alicePermissionKeys,
        alicePermissionValues
      );
      await setupKeyManager(bobContext, bobPermissionKeys, bobPermissionValues);
    });

    it("Alice should have ALL PERMISSIONS in her UP", async () => {
      let key =
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        alice.address.substring(2);

      // prettier-ignore
      const result = await aliceContext.universalProfile["getData(bytes32)"](key);
      expect(result).to.equal(ALL_PERMISSIONS);
    });

    it("Bob should have ALL PERMISSIONS in his UP", async () => {
      let key =
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        bob.address.substring(2);

      const result = await bobContext.universalProfile["getData(bytes32)"](key);
      expect(result).to.equal(ALL_PERMISSIONS);
    });

    it("Alice's UP should have permission TRANSFERVALUE on Bob's UP", async () => {
      let key =
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
        aliceContext.universalProfile.address.substring(2);

      const result = await bobContext.universalProfile["getData(bytes32)"](key);
      expect(result).to.equal(PERMISSIONS.TRANSFERVALUE);
    });

    it("Alice should be able to send 5 LYX from Bob's UP to her UP", async () => {
      const amount = ethers.utils.parseEther("5");

      let finalTransferLyxPayload =
        bobContext.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            OPERATION_TYPES.CALL,
            aliceContext.universalProfile.address,
            amount,
            "0x",
          ]
        );

      let bobKeyManagerPayload =
        bobContext.keyManager.interface.encodeFunctionData("execute(bytes)", [
          finalTransferLyxPayload,
        ]);

      let aliceUniversalProfilePayload =
        aliceContext.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            OPERATION_TYPES.CALL,
            bobContext.keyManager.address,
            0,
            bobKeyManagerPayload,
          ]
        );

      await expect(() =>
        aliceContext.keyManager
          .connect(alice)
          ["execute(bytes)"](aliceUniversalProfilePayload)
      ).to.changeEtherBalances(
        [
          bobContext.universalProfile.address,
          aliceContext.universalProfile.address,
        ],
        [`-${amount}`, amount]
      );
    });
  });

  describe("when caller has SUPER_TRANSFERVALUE + CALL", () => {
    let caller: SignerWithAddress;
    let lsp7Token: LSP7Mintable;
    let targetContract: TargetPayableContract;

    let lyxRecipientEOA: string;
    let lyxRecipientContract: FallbackContract;

    const recipientsEOA: string[] = [
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
      ethers.Wallet.createRandom().address,
    ];

    let recipientUPs: string[] = [];

    before(async () => {
      context = await buildContext(ethers.utils.parseEther("100"));

      caller = context.accounts[1];

      lsp7Token = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        "LSP7 Token",
        "LSP7",
        context.accounts[0].address,
        false
      );

      targetContract = await new TargetPayableContract__factory(
        context.accounts[0]
      ).deploy();

      lyxRecipientEOA = ethers.Wallet.createRandom().address;

      // this contract as a payable fallback function and can receive native tokens
      lyxRecipientContract = await new FallbackContract__factory(
        context.accounts[0]
      ).deploy();

      await lsp7Token
        .connect(context.accounts[0])
        .mint(context.universalProfile.address, 100, false, "0x");

      const permissionsKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          caller.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
      ];

      const permissionsValues = [
        combinePermissions(PERMISSIONS.SUPER_TRANSFERVALUE, PERMISSIONS.CALL),
        // restriction = only a specific address (e.g: an LSP7 contract)
        combineAllowedCalls(
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"],
          [
            lsp7Token.address,
            targetContract.address,
            lyxRecipientEOA,
            lyxRecipientContract.address,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        ),
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);

      for (let ii = 0; ii < 5; ii++) {
        const newUP = await new UniversalProfile__factory(
          context.accounts[0]
        ).deploy(context.accounts[0].address);
        recipientUPs.push(newUP.address);
      }
    });

    describe("when sending native tokens without `data`", () => {
      recipientsEOA.forEach((recipient) => {
        it(`should allow to send LYX to any EOA (e.g; at address -> ${recipient})`, async () => {
          const amount = ethers.utils.parseEther("1");

          let transferPayload = universalProfileInterface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, recipient, amount, "0x"]
          );

          await expect(() =>
            context.keyManager
              .connect(caller)
              ["execute(bytes)"](transferPayload)
          ).to.changeEtherBalances(
            [context.universalProfile.address, recipient],
            [`-${amount}`, amount]
          );
        });
      });

      recipientUPs.forEach((recipientUP) => {
        it(`should allow to send LYX to any UP contract (e.g: at address -> ${recipientUP})`, async () => {
          const amount = ethers.utils.parseEther("1");

          let transferPayload = universalProfileInterface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, recipientUP, amount, "0x"]
          );

          await expect(() =>
            context.keyManager
              .connect(caller)
              ["execute(bytes)"](transferPayload)
          ).to.changeEtherBalances(
            [context.universalProfile.address, recipientUP],
            [`-${amount}`, amount]
          );
        });
      });
    });

    describe("when sending native tokens with `data`", () => {
      recipientsEOA.forEach((recipient) => {
        it(`should not allow to send LYX with some \`data\` to a random EOA (e.g: at address -> ${recipient})`, async () => {
          const amount = ethers.utils.parseEther("1");
          const data = "0x12345678";

          let transferLyxPayload = universalProfileInterface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, recipient, amount, data]
          );

          await expect(
            context.keyManager
              .connect(caller)
              ["execute(bytes)"](transferLyxPayload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAllowedCall")
            .withArgs(caller.address, recipient, data);
        });
      });

      recipientUPs.forEach((recipientUP) => {
        it(`should not allow to send LYX with some \`data\` to a random UP (e.g: at address -> ${recipientUP})`, async () => {
          const amount = ethers.utils.parseEther("1");
          const data = "0x12345678";

          let transferLyxPayload = universalProfileInterface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, recipientUP, amount, data]
          );

          await expect(
            context.keyManager
              .connect(caller)
              ["execute(bytes)"](transferLyxPayload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAllowedCall")
            .withArgs(caller.address, recipientUP, data);
        });
      });

      it("should allow to send LYX with some `data` to an EOA listed in the AllowedCalls", async () => {
        const amount = ethers.utils.parseEther("1");
        const data = "0x12345678";

        let transferLyxPayload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, lyxRecipientEOA, amount, data]
        );

        await expect(
          context.keyManager
            .connect(caller)
            ["execute(bytes)"](transferLyxPayload)
        ).to.changeEtherBalances(
          [context.universalProfile.address, lyxRecipientEOA],
          [`-${amount}`, amount]
        );
      });

      it("should allow to send LYX with some `data` to a contract listed in the AllowedCalls", async () => {
        const amount = ethers.utils.parseEther("1");
        const data = "0x12345678";

        let transferLyxPayload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, lyxRecipientContract.address, amount, data]
        );

        await expect(
          context.keyManager
            .connect(caller)
            ["execute(bytes)"](transferLyxPayload)
        ).to.changeEtherBalances(
          [context.universalProfile.address, lyxRecipientContract.address],
          [`-${amount}`, amount]
        );
      });
    });

    describe("when interacting with some contracts", () => {
      it("should not be allowed to interact with a disallowed LSP7 contract", async () => {
        let newLSP7Token = await new LSP7Mintable__factory(
          context.accounts[0]
        ).deploy(
          "New LSP7 Token",
          "LSP7TKN",
          context.accounts[0].address,
          false
        );

        let lsp7TransferPayload = newLSP7Token.interface.encodeFunctionData(
          "transfer",
          [
            context.universalProfile.address,
            context.accounts[5].address,
            10,
            true, // sending to an EOA
            "0x",
          ]
        );

        let executePayload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, newLSP7Token.address, 5, lsp7TransferPayload]
        );

        await expect(
          context.keyManager.connect(caller)["execute(bytes)"](executePayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAllowedCall")
          .withArgs(
            caller.address,
            newLSP7Token.address,
            newLSP7Token.interface.getSighash("transfer")
          );
      });

      it("should be allowed to interact with an allowed LSP7 contract", async () => {
        let recipient = context.accounts[5].address;
        let tokenAmount = ethers.BigNumber.from(10);

        let lsp7SenderBalanceBefore = await lsp7Token.balanceOf(
          context.universalProfile.address
        );

        let lsp7RecipientBalanceBefore = await lsp7Token.balanceOf(recipient);

        let lsp7TransferPayload = lsp7Token.interface.encodeFunctionData(
          "transfer",
          [
            context.universalProfile.address,
            recipient,
            tokenAmount,
            true, // sending to an EOA
            "0x",
          ]
        );

        let executePayload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, lsp7Token.address, 0, lsp7TransferPayload]
        );

        await context.keyManager
          .connect(caller)
          ["execute(bytes)"](executePayload);

        let lsp7SenderBalanceAfter = await lsp7Token.balanceOf(
          context.universalProfile.address
        );

        let lsp7RecipientBalanceAfter = await lsp7Token.balanceOf(recipient);

        expect(lsp7SenderBalanceAfter).to.equal(
          lsp7SenderBalanceBefore.sub(tokenAmount)
        );

        expect(lsp7RecipientBalanceAfter).to.equal(
          lsp7RecipientBalanceBefore.add(tokenAmount)
        );
      });

      it("should be allowed to interact with an allowed contract", async () => {
        let newValue = 35;

        let targetPayload = targetContract.interface.encodeFunctionData(
          "updateState",
          [newValue]
        );

        let payload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetPayload]
        );

        await context.keyManager.connect(caller)["execute(bytes)"](payload);

        const result = await targetContract.value();
        expect(result).to.equal(newValue);
      });

      it("should be allowed to interact with an allowed contract + send some LYX while calling the function", async () => {
        const newValue = 358;
        const lyxAmount = ethers.utils.parseEther("3");

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "updateState",
          [newValue]
        );

        let executePayload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            OPERATION_TYPES.CALL,
            targetContract.address,
            lyxAmount,
            targetContractPayload,
          ]
        );

        await expect(() =>
          context.keyManager.connect(caller)["execute(bytes)"](executePayload)
        ).to.changeEtherBalances(
          [context.universalProfile.address, targetContract.address],
          [`-${lyxAmount}`, lyxAmount]
        );

        const result = await targetContract.value();
        expect(result).to.equal(newValue);
      });
    });
  });

  describe("when caller has TRANSFERVALUE + SUPER_CALL", () => {
    let caller: SignerWithAddress;
    let allowedAddress: SignerWithAddress;

    before(async () => {
      context = await buildContext(ethers.utils.parseEther("100"));

      caller = context.accounts[1];
      allowedAddress = context.accounts[2];

      const permissionsKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          caller.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
      ];

      const permissionsValues = [
        combinePermissions(PERMISSIONS.TRANSFERVALUE, PERMISSIONS.SUPER_CALL),
        combineAllowedCalls(
          ["0xffffffff"],
          [allowedAddress.address],
          ["0xffffffff"]
        ),
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe("when transferring LYX without `data`", () => {
      it("should not be allowed to transfer LYX to a non-allowed address", async () => {
        const recipient = context.accounts[3].address;
        const amount = ethers.utils.parseEther("1");

        let initialBalanceUP = await provider.getBalance(
          context.universalProfile.address
        );

        let initialBalanceRecipient = await provider.getBalance(recipient);

        let transferPayload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, recipient, amount, "0x"]
        );

        await expect(
          context.keyManager.connect(caller)["execute(bytes)"](transferPayload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAllowedCall")
          .withArgs(caller.address, recipient, "0x00000000");

        let newBalanceUP = await provider.getBalance(
          context.universalProfile.address
        );
        expect(newBalanceUP).to.equal(initialBalanceUP);

        let newBalanceRecipient = await provider.getBalance(recipient);
        expect(newBalanceRecipient).to.equal(initialBalanceRecipient);
      });

      it("should be allowed to transfer LYX to an allowed address", async () => {
        const amount = ethers.utils.parseEther("1");

        let transferPayload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, allowedAddress.address, amount, "0x"]
        );

        await expect(() =>
          context.keyManager.connect(caller)["execute(bytes)"](transferPayload)
        ).to.changeEtherBalances(
          [context.universalProfile.address, allowedAddress.address],
          [`-${amount}`, amount]
        );
      });
    });

    // TODO: this test overlaps with the one above and pass, but the expected behaviour is not clear
    describe("when transferring LYX with `data`", () => {
      it("should be allowed to transfer LYX to an allowed address while sending some `data`", async () => {
        const amount = ethers.utils.parseEther("1");
        const data = "0x12345678";

        let transferPayload = universalProfileInterface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [OPERATION_TYPES.CALL, allowedAddress.address, amount, data]
        );

        await expect(() =>
          context.keyManager.connect(caller)["execute(bytes)"](transferPayload)
        ).to.changeEtherBalances(
          [context.universalProfile.address, allowedAddress.address],
          [`-${amount}`, amount]
        );
      });
    });

    describe("should be allowed to interact with any contract", () => {
      describe("eg: any TargetContract", () => {
        for (let ii = 1; ii <= 5; ii++) {
          it(`TargetContract nb ${ii}`, async () => {
            let targetContract = await new TargetContract__factory(
              context.accounts[0]
            ).deploy();

            let newValue = 12345;

            let payload = targetContract.interface.encodeFunctionData(
              "setNumber",
              [newValue]
            );

            let executePayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, targetContract.address, 0, payload]
            );

            await context.keyManager
              .connect(caller)
              ["execute(bytes)"](executePayload);

            const result = await targetContract.getNumber();
            expect(result).to.equal(newValue);
          });
        }
      });

      describe("eg: any LSP7 Token owned by the UP", () => {
        for (let ii = 1; ii <= 5; ii++) {
          it(`LSP7DigitalAsset nb ${ii}`, async () => {
            let lsp7Token = await new LSP7Mintable__factory(
              context.accounts[0]
            ).deploy("LSP7 Token", "LSP7", context.accounts[0].address, false);

            // give some tokens to the UP
            await lsp7Token.mint(
              context.universalProfile.address,
              100,
              false,
              "0x"
            );

            const tokenRecipient = context.accounts[5].address;
            const tokenAmount = 10;

            const senderTokenBalanceBefore = await lsp7Token.balanceOf(
              context.universalProfile.address
            );
            const recipientTokenBalanceBefore = await lsp7Token.balanceOf(
              tokenRecipient
            );
            expect(senderTokenBalanceBefore).to.equal(100);
            expect(recipientTokenBalanceBefore).to.equal(0);

            let tokenTransferPayload = lsp7Token.interface.encodeFunctionData(
              "transfer",
              [
                context.universalProfile.address,
                tokenRecipient,
                tokenAmount,
                true,
                "0x",
              ]
            );

            let executePayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, lsp7Token.address, 0, tokenTransferPayload]
            );

            await context.keyManager
              .connect(caller)
              ["execute(bytes)"](executePayload);

            const senderTokenBalanceAfter = await lsp7Token.balanceOf(
              context.universalProfile.address
            );
            const recipientTokenBalanceAfter = await lsp7Token.balanceOf(
              tokenRecipient
            );
            expect(senderTokenBalanceAfter).to.equal(
              senderTokenBalanceBefore.sub(tokenAmount)
            );
            expect(recipientTokenBalanceAfter).to.equal(
              recipientTokenBalanceBefore.add(tokenAmount)
            );
          });
        }
      });
    });

    describe("should not be allowed to interact with any contract if sending LYX along the call", () => {
      const lyxAmount = ethers.utils.parseEther("1");

      for (let ii = 1; ii <= 5; ii++) {
        it(`Target Payable Contract nb ${ii}`, async () => {
          let targetContract = await new TargetPayableContract__factory(
            context.accounts[0]
          ).deploy();

          let upLyxBalanceBefore = await provider.getBalance(
            context.universalProfile.address
          );
          let targetContractLyxBalanceBefore = await provider.getBalance(
            targetContract.address
          );
          expect(targetContractLyxBalanceBefore).to.equal(0);

          let targetPayload = targetContract.interface.encodeFunctionData(
            "updateState",
            [35]
          );

          let payload = universalProfileInterface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [
              OPERATION_TYPES.CALL,
              targetContract.address,
              lyxAmount,
              targetPayload,
            ]
          );

          await expect(
            context.keyManager.connect(caller)["execute(bytes)"](payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAllowedCall")
            .withArgs(
              caller.address,
              targetContract.address,
              targetContract.interface.getSighash("updateState")
            );

          // verify LYX (native tokens) balances have not changed
          let upLyxBalanceAfter = await provider.getBalance(
            context.universalProfile.address
          );
          expect(upLyxBalanceAfter).to.equal(upLyxBalanceBefore);

          let targetContractLyxBalanceAfter = await provider.getBalance(
            targetContract.address
          );
          expect(targetContractLyxBalanceAfter).to.equal(0);
        });
      }
    });
  });

  describe("when caller has SUPER_TRANSFERVALUE + SUPER_CALL", () => {
    let caller: SignerWithAddress;
    let allowedAddress: SignerWithAddress;

    before(async () => {
      context = await buildContext(ethers.utils.parseEther("100"));

      caller = context.accounts[1];
      allowedAddress = context.accounts[2];

      const permissionsKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          caller.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
      ];

      const permissionsValues = [
        combinePermissions(
          PERMISSIONS.SUPER_TRANSFERVALUE,
          PERMISSIONS.SUPER_CALL
        ),
        combineAllowedCalls(
          ["0xffffffff"],
          [allowedAddress.address],
          ["0xffffffff"]
        ),
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe("should be allowed to send LYX to any address", () => {
      const recipients: string[] = [
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
        ethers.Wallet.createRandom().address,
      ];

      recipients.forEach((recipient) => {
        it(`should send LYX to EOA -> ${recipient}`, async () => {
          const amount = ethers.utils.parseEther("1");

          let transferPayload = universalProfileInterface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [OPERATION_TYPES.CALL, recipient, amount, "0x"]
          );

          await expect(() =>
            context.keyManager
              .connect(caller)
              ["execute(bytes)"](transferPayload)
          ).to.changeEtherBalances(
            [context.universalProfile.address, recipient],
            [`-${amount}`, amount]
          );
        });
      });
    });

    describe("should be allowed to interact with any contract", () => {
      describe("eg: any TargetContract", () => {
        for (let ii = 1; ii <= 5; ii++) {
          it(`TargetContract nb ${ii}`, async () => {
            let targetContract = await new TargetContract__factory(
              context.accounts[0]
            ).deploy();

            let newValue = 12345;

            let payload = targetContract.interface.encodeFunctionData(
              "setNumber",
              [newValue]
            );

            let executePayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, targetContract.address, 0, payload]
            );

            await context.keyManager
              .connect(caller)
              ["execute(bytes)"](executePayload);

            const result = await targetContract.getNumber();
            expect(result).to.equal(newValue);
          });
        }
      });

      describe("eg: any LSP7 Token owned by the UP", () => {
        for (let ii = 1; ii <= 5; ii++) {
          it(`LSP7DigitalAsset nb ${ii}`, async () => {
            let lsp7Token = await new LSP7Mintable__factory(
              context.accounts[0]
            ).deploy("LSP7 Token", "LSP7", context.accounts[0].address, false);

            // give some tokens to the UP
            await lsp7Token.mint(
              context.universalProfile.address,
              100,
              false,
              "0x"
            );

            const tokenRecipient = context.accounts[5].address;
            const tokenAmount = 10;

            const senderTokenBalanceBefore = await lsp7Token.balanceOf(
              context.universalProfile.address
            );
            const recipientTokenBalanceBefore = await lsp7Token.balanceOf(
              tokenRecipient
            );
            expect(senderTokenBalanceBefore).to.equal(100);
            expect(recipientTokenBalanceBefore).to.equal(0);

            let tokenTransferPayload = lsp7Token.interface.encodeFunctionData(
              "transfer",
              [
                context.universalProfile.address,
                tokenRecipient,
                tokenAmount,
                true,
                "0x",
              ]
            );

            let executePayload = universalProfileInterface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [OPERATION_TYPES.CALL, lsp7Token.address, 0, tokenTransferPayload]
            );

            await context.keyManager
              .connect(caller)
              ["execute(bytes)"](executePayload);

            const senderTokenBalanceAfter = await lsp7Token.balanceOf(
              context.universalProfile.address
            );
            const recipientTokenBalanceAfter = await lsp7Token.balanceOf(
              tokenRecipient
            );
            expect(senderTokenBalanceAfter).to.equal(
              senderTokenBalanceBefore.sub(tokenAmount)
            );
            expect(recipientTokenBalanceAfter).to.equal(
              recipientTokenBalanceBefore.add(tokenAmount)
            );
          });
        }
      });
    });
  });
};
