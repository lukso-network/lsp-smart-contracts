import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YKeys,
  OPERATION_TYPES,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";
import { abiCoder } from "../../utils/helpers";
import { LSP7Mintable, LSP7MintableInit__factory, LSP7Mintable__factory } from "../../../types";

export const shouldBehaveLikeBatchExecute = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  // a fictional DAI token on LUKSO
  let lyxDaiToken: LSP7Mintable,
    // a basic sample token
    metaCoin: LSP7Mintable,
    // a token that can be used as credits for a LUKSO relay service.
    // Inspired from https://github.com/lykhonis/relayer
    rLyxToken: LSP7Mintable;

  beforeEach(async () => {
    context = await buildContext();

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
    ];

    const permissionsValues = [ALL_PERMISSIONS];

    await setupKeyManager(context, permissionKeys, permissionsValues);

    // fund the UP with some native tokens
    await context.owner.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther("50"),
    });

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

    await lyxDaiToken.mint(context.universalProfile.address, 100, false, "0x");
    await metaCoin.mint(context.universalProfile.address, 100, false, "0x");
    await rLyxToken.mint(context.universalProfile.address, 100, false, "0x");
  });

  describe("when using batch `execute(bytes[])`", () => {
    describe("when caller has ALL_PERMISSIONS", () => {
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
          ["execute(bytes[])"](batchExecutePayloads);

        expect(tx).to.changeEtherBalance(owner, ethers.utils.parseEther("-6"));
        expect(tx).to.changeEtherBalance(recipients, amounts);
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
          ["execute(bytes[])"](payloads);

        expect(await lyxDaiToken.balanceOf(recipient)).to.equal(lyxDaiAmount);
        expect(tx).to.changeEtherBalance(recipient, lyxAmount);
      });

      it("should send 3x different tokens to the same recipient", async () => {
        const recipient = context.accounts[1].address;

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
          ["execute(bytes[])"](payloads);

        expect(await lyxDaiToken.balanceOf(recipient)).to.equal(lyxDaiAmount);
        expect(await metaCoin.balanceOf(recipient)).to.equal(metaCoinAmount);
        expect(await rLyxToken.balanceOf(recipient)).to.equal(rLyxAmount);
      });

      it("should 1) deploy a LSP7 Token (as minimal proxy), 2) initialize it, and 3) set the token metadata", async () => {
        const lsp7MintableBase = await new LSP7MintableInit__factory(context.accounts[0]).deploy()

        const lsp7TokenProxyBytecode =
          String("0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3").replace(
            "bebebebebebebebebebebebebebebebebebebebe",
            lsp7MintableBase.address.substring(2)
          );

        const lsp7ProxyDeploymentPayload = context.universalProfile.interface.encodeFunctionData("execute(uint256,address,uint256,bytes)", [
          OPERATION_TYPES.CREATE,
          ethers.constants.AddressZero,
          0,
          lsp7TokenProxyBytecode
        ]);

        const futureTokenAddress = await context.keyManager.connect(context.owner).callStatic["execute(bytes)"](lsp7ProxyDeploymentPayload)
        let futureTokenInstance = await new LSP7MintableInit__factory(context.accounts[0]).attach(futureTokenAddress)

        const lsp7InitializePayload = futureTokenInstance.interface.encodeFunctionData("initialize", [
          "My LSP7 UP Token", "UPLSP7", context.universalProfile.address, false
        ])

        // use interface of an existing token contract
        const initializePayload = context.universalProfile.interface.encodeFunctionData("execute(uint256,address,uint256,bytes)", [
          OPERATION_TYPES.CALL,
          futureTokenAddress,
          0,
          lsp7InitializePayload
        ])

        const tokenMetadataValue = "0x6f357c6aba20e595da5f38e6c75326802bbf871b4d98b5bfab27812a5456139e3ec087f4697066733a2f2f516d6659696d3146647a645a6747314a50484c46785a3964575a7761616f68596e4b626174797871553144797869"

        const lsp7SetDataPayload = futureTokenInstance.interface.encodeFunctionData("setData(bytes32,bytes)", [
          ERC725YKeys.LSP4["LSP4Metadata"],
          tokenMetadataValue
        ])
        const setTokenMetadataPayload = context.universalProfile.interface.encodeFunctionData("execute(uint256,address,uint256,bytes)", [
          OPERATION_TYPES.CALL,
          futureTokenAddress,
          0,
          lsp7SetDataPayload
        ])

        const tx = await context.keyManager.connect(context.owner)["execute(bytes[])"]([
          // Step 1 - deploy Token contract as proxy
          lsp7ProxyDeploymentPayload, 
          // Step 2 - initialize Token contract
          initializePayload,
          // Step 3 - set Token Metadata
          setTokenMetadataPayload
        ])

        // CHECK that token contract has been deployed
        expect(tx).to.emit(context.universalProfile, "ContractCreated").withArgs(OPERATION_TYPES.CREATE, futureTokenAddress, 0)
        
        // CHECK initialize parameters have been set correctly
        const nameResult = await futureTokenInstance["getData(bytes32)"](ERC725YKeys.LSP4["LSP4TokenName"])
        const symbolResult = await futureTokenInstance["getData(bytes32)"](ERC725YKeys.LSP4["LSP4TokenSymbol"])

        expect(ethers.utils.toUtf8String(nameResult)).to.equal("My LSP7 UP Token")
        expect(ethers.utils.toUtf8String(symbolResult)).to.equal("UPLSP7")
        expect(await futureTokenInstance.owner()).to.equal(context.universalProfile.address)

        // CHECK LSP4 token metadata has been set
        expect(await futureTokenInstance["getData(bytes32)"](ERC725YKeys.LSP4["LSP4Metadata"])).to.equal(tokenMetadataValue)
      })

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
          const futureTokenAddress = await context.keyManager.connect(context.owner).callStatic["execute(bytes)"](lsp7DeploymentPayload)
          console.log("futureTokenAddress: ", futureTokenAddress)

          // step 2 - mint some tokens
          // use the interface of an existing token for encoding the function call
          const lsp7MintingPayload = lyxDaiToken.interface.encodeFunctionData("mint", [
            context.universalProfile.address,
            3_000,
            false,
            "0x"
          ])

          // step 3 - transfer batch to multiple addresses
          const sender = context.universalProfile.address;
          const recipients = [context.accounts[1].address, context.accounts[2].address, context.accounts[3].address]
          const amounts = [1_000, 1_000, 1_000];

          const lsp7TransferBatchPayload = lyxDaiToken.interface.encodeFunctionData("transferBatch", [
            [sender, sender, sender],  // address[] memory from,
            recipients,  // address[] memory to,
            amounts,  // uint256[] memory amount,
            [true, true, true],  // bool[] memory force,
            ["0x", "0x", "0x"]  // bytes[] memory data
          ])

        const payloads = [
          // step 1 - deploy token contract
          lsp7DeploymentPayload,
          // step 2 - mint some tokens for the UP
          context.universalProfile.interface.encodeFunctionData("execute(uint256,address,uint256,bytes)", [
            OPERATION_TYPES.CALL,
            futureTokenAddress,
            0,
            lsp7MintingPayload
          ]),
          // step 3 - `transferBatch(...)` the tokens to multiple addresses
          context.universalProfile.interface.encodeFunctionData("execute(uint256,address,uint256,bytes)", [
            OPERATION_TYPES.CALL,
            futureTokenAddress,
            0,
            lsp7TransferBatchPayload
          ]),
        ];

        const tx = await context.keyManager.connect(context.owner)["execute(bytes[])"](payloads);

        // CHECK for `ContractCreated` event
        expect(tx).to.emit(context.universalProfile, "ContractCreated").withArgs(OPERATION_TYPES.CREATE, ethers.utils.getAddress(futureTokenAddress), 0)

        // CHECK for tokens balances of recipients
        const createdTokenContract = await new LSP7Mintable__factory(context.accounts[0]).attach(futureTokenAddress)
        expect([
          await createdTokenContract.balanceOf(recipients[0]),
          await createdTokenContract.balanceOf(recipients[1]),
          await createdTokenContract.balanceOf(recipients[2]),
        ]).to.deep.equal(amounts)
      });
      
    });
  });
};