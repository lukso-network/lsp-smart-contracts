import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EIP191Signer } from "@lukso/eip191-signer.js";

import { LSP8Mintable, LSP8Mintable__factory, TargetContract, TargetContract__factory } from "../../../types";

// constants
import {
  ERC725YKeys,
  OPERATION_TYPES,
  LSP6_VERSION,
  PERMISSIONS,
  INTERFACE_IDS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import { abiCoder, LOCAL_PRIVATE_KEYS } from "../../utils/helpers";

export const shouldBehaveLikeAllowedFunctions = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let addressCanCallAnyFunctions: SignerWithAddress,
    addressCanCallOnlyOneFunction: SignerWithAddress;

  let targetContract: TargetContract;

  beforeEach(async () => {
    context = await buildContext();

    addressCanCallAnyFunctions = context.accounts[1];
    addressCanCallOnlyOneFunction = context.accounts[2];

    targetContract = await new TargetContract__factory(
      context.accounts[0]
    ).deploy();

    let permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanCallAnyFunctions.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressCanCallOnlyOneFunction.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
        addressCanCallOnlyOneFunction.address.substring(2),
    ];

    let permissionsValues = [
      PERMISSIONS.CALL,
      PERMISSIONS.CALL,
      "0x1c" + "ffffffff" + "ffffffffffffffffffffffffffffffffffffffff" + targetContract.interface.getSighash("setName").substring(2)
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe("when interacting via `execute(...)`", () => {
    describe("when caller has nothing listed under AllowedFunctions", () => {
      describe("when calling a contract", () => {
        it("should pass when calling any function (eg: `setName(...)`)", async () => {
          let initialName = await targetContract.callStatic.getName();
          let newName = "Updated Name";

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setName", [newName]);

          let executePayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          await context.keyManager
            .connect(addressCanCallAnyFunctions)
            .execute(executePayload);

          let result = await targetContract.callStatic.getName();
          expect(result).to.not.equal(initialName);
          expect(result).to.equal(newName);
        });

        it("should pass when calling any function (eg: `setNumber(...)`)", async () => {
          let initialNumber = await targetContract.callStatic.getNumber();
          let newNumber = 18;

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setNumber", [
              newNumber,
            ]);
          let executePayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          await context.keyManager
            .connect(addressCanCallAnyFunctions)
            .execute(executePayload);

          let result = await targetContract.callStatic.getNumber();
          expect(result).to.not.equal(initialNumber);
          expect(result).to.equal(newNumber);
        });
      });
    });

    describe("when caller has 1 x bytes4 function selector listed under AllowedFunctions", () => {
      describe("when calling a contract", () => {
        it("should pass when the bytes4 selector of the function called is listed in its AllowedFunctions", async () => {
          let initialName = await targetContract.callStatic.getName();
          let newName = "Updated Name";

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setName", [newName]);

          let executePayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          await context.keyManager
            .connect(addressCanCallOnlyOneFunction)
            .execute(executePayload);

          let result = await targetContract.callStatic.getName();
          expect(result).to.not.equal(initialName);
          expect(result).to.equal(newName);
        });

        it("should revert when the bytes4 selector of the function called is NOT listed in its AllowedFunctions", async () => {
          let initialNumber = await targetContract.callStatic.getNumber();
          let newNumber = 18;

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setNumber", [
              newNumber,
            ]);
          let executePayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          await expect(
            context.keyManager
              .connect(addressCanCallOnlyOneFunction)
              .execute(executePayload)
          )
            .to.be.revertedWith("not allowed call")

          let result = await targetContract.callStatic.getNumber();
          expect(result).to.not.equal(newNumber);
          expect(result).to.equal(initialNumber);
        });
      });

      it("should revert when passing a random bytes payload with a random function selector", async () => {
        const randomPayload =
          "0xbaadca110000000000000000000000000000000000000000000000000000000123456789";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATION_TYPES.CALL, targetContract.address, 0, randomPayload]
        );

        await expect(
          context.keyManager
            .connect(addressCanCallOnlyOneFunction)
            .execute(payload)
        )
          .to.be.revertedWith("not allowed call");
      });
    });
  });

  describe("when interacting via `executeRelayCall(...)`", () => {
    const channelId = 0;

    describe("when signer has 1 x bytes4 function selector listed under AllowedFunctions", () => {
      describe("when calling a contract", () => {
        it("`setName(...)` - should pass when the bytes4 selector of the function called is listed in its AllowedFunctions", async () => {
          let newName = "Dagobah";

          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setName", [newName]);
          let nonce = await context.keyManager.callStatic.getNonce(
            addressCanCallOnlyOneFunction.address,
            channelId
          );

          let executeRelayCallPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          const HARDHAT_CHAINID = 31337;
          let valueToSend = 0;

          let encodedMessage = ethers.utils.solidityPack(
            ["uint256", "uint256", "uint256", "uint256", "bytes"],
            [
              LSP6_VERSION,
              HARDHAT_CHAINID,
              nonce,
              valueToSend,
              executeRelayCallPayload,
            ]
          );

          let eip191Signer = new EIP191Signer();

          let { signature } = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            encodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT2
          );

          await context.keyManager.executeRelayCall(
            signature,
            nonce,
            executeRelayCallPayload,
            { value: valueToSend }
          );
          let endResult = await targetContract.callStatic.getName();
          expect(endResult).to.equal(newName);
        });

        it("`setNumber(...)` - should revert when the bytes4 selector of the function called is NOT listed in its AllowedFunctions", async () => {
          let currentNumber = await targetContract.callStatic.getNumber();

          let nonce = await context.keyManager.callStatic.getNonce(
            addressCanCallOnlyOneFunction.address,
            channelId
          );
          let targetContractPayload =
            targetContract.interface.encodeFunctionData("setNumber", [2354]);

          let executeRelayCallPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]);

          const HARDHAT_CHAINID = 31337;
          let valueToSend = 0;

          let encodedMessage = ethers.utils.solidityPack(
            ["uint256", "uint256", "uint256", "uint256", "bytes"],
            [
              LSP6_VERSION,
              HARDHAT_CHAINID,
              nonce,
              valueToSend,
              executeRelayCallPayload,
            ]
          );

          let eip191Signer = new EIP191Signer();

          let { signature } = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            encodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT2
          );

          await expect(
            context.keyManager.executeRelayCall(
              signature,
              nonce,
              executeRelayCallPayload,
              { value: valueToSend }
            )
          )
            .to.be.revertedWith("not allowed call")

          let endResult = await targetContract.callStatic.getNumber();
          expect(endResult.toString()).to.equal(currentNumber.toString());
        });
      });
    });
  });

  describe("allowed to call only `mint(...)` function on LSP8 contracts", () => {

    let addressCanCallOnlyMintOnLSP8: SignerWithAddress;
    let lsp8Contract: LSP8Mintable

    const tokenId = "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef"

    beforeEach(async () => {
      context = await buildContext();

      addressCanCallOnlyMintOnLSP8 = context.accounts[1]

      lsp8Contract = await new LSP8Mintable__factory(context.accounts[0]).deploy("LSP8 NFT", "NFT", context.accounts[0].address)
      await lsp8Contract.connect(context.accounts[0]).mint(
        context.universalProfile.address,
        tokenId,
        true,
        "0x"
      )

      let permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanCallOnlyMintOnLSP8.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          addressCanCallOnlyMintOnLSP8.address.substring(2),
      ];
  
      let permissionsValues = [
        PERMISSIONS.CALL,
        "0x1c" + INTERFACE_IDS.LSP8IdentifiableDigitalAsset.substring(2) + "ffffffffffffffffffffffffffffffffffffffff" + lsp8Contract.interface.getSighash("transfer").substring(2)
      ];
  
      await setupKeyManager(context, permissionsKeys, permissionsValues);
    })

    it("allow to call transfer(...)", async () => {
      console.log(lsp8Contract.interface)

      // let mintPayload = lsp8Contract.interface.encodeFunctionData("transfer(address,address,bytes32,bool,bytes)", [
      //   // address from,
      //   context.universalProfile.address,
      //   // address to,
      //   context.accounts[5],
      //   // bytes32 tokenId,
      //   "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
      //   // bool force,
      //   true,
      //   // bytes memory data
      //   "0x"
      // ])

      //   let executePayload =
      //       context.universalProfile.interface.encodeFunctionData("execute", [
      //         OPERATION_TYPES.CALL,
      //         lsp8Contract.address,
      //         0,
      //         mintPayload,
      //       ]);

          // await context.keyManager
          //   .connect(addressCanCallAnyFunctions)
          //   .execute(executePayload);
    })

    it("should not allow to call transfer(...)", async () => {

    })
  })
};
