import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LSP6Signer } from '@lukso/lsp6-signer.js';

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  ERC1271_VALUES,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

export const shouldBehaveLikePermissionSign = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress,
    nonSigner: SignerWithAddress,
    noPermissionsSet: SignerWithAddress;

  const dataToSign = "0xcafecafe";

  before(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    nonSigner = context.accounts[2];
    noPermissionsSet = context.accounts[3];

    const permissionsKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        signer.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        nonSigner.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      PERMISSIONS.SIGN,
      PERMISSIONS.CALL,
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe("when address has ALL PERMISSIONS", () => {

    describe("should verify the signature, regardless of how it was signed", () => {
      it("e.g: with Ethereum signed message", async () => {
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await signer.signMessage(dataToSign);
    
        const result = await context.keyManager.callStatic.isValidSignature(
          messageHash,
          signature
        );
        expect(result).to.equal(ERC1271_VALUES.MAGIC_VALUE);
      })

      it("e.g: with LSP6Signer '\x19LSP6 ExecuteRelayCall\n'", async () => {
        const OWNER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        const lsp6Signer = new LSP6Signer();
        const signedMessage = await lsp6Signer.sign(dataToSign, OWNER_PRIVATE_KEY);
        const result = await context.keyManager.callStatic.isValidSignature(
          signedMessage.messageHash,
          signedMessage.signature
        );
        expect(result).to.equal(ERC1271_VALUES.MAGIC_VALUE);
      })
    })
  })

  describe("when address has permission SIGN", () => {
    describe("should verify the signature, regardless of how it was signed", () => {
      it("e.g: Ethereum signed message", async () => {
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await signer.signMessage(dataToSign);
    
        const result = await context.keyManager.callStatic.isValidSignature(
          messageHash,
          signature
        );
        expect(result).to.equal(ERC1271_VALUES.MAGIC_VALUE);
      })
  
      it("e.g: with LSP6Signer '\x19LSP6 ExecuteRelayCall\n'", async () => {
        const SIGNER_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
        const lsp6Signer = new LSP6Signer();
        const messageHash = lsp6Signer.hashMessage(dataToSign);
        const signedMessage = await lsp6Signer.sign(dataToSign, SIGNER_PRIVATE_KEY);
    
        const result = await context.keyManager.callStatic.isValidSignature(
          signedMessage.messageHash,
          signedMessage.signature
        );
        expect(result).to.equal(ERC1271_VALUES.MAGIC_VALUE);
      })
    })
  })

  describe("when address does not have permission SIGN", () => {

    describe("should fail when verifying a signature, regardless of how it was signed", () => {
      it("e.g: with Ethereum signed message '\x19LSP6 ExecuteRelayCall\n'", async () => {
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await nonSigner.signMessage(dataToSign);
  
        const result = await context.keyManager.callStatic.isValidSignature(
          messageHash,
          signature
        );
        expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
      })
  
      it("e.g: with LSP6Signer", async () => {
        const OWNER_PRIVATE_KEY = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
        const lsp6Signer = new LSP6Signer();
        const messageHash = lsp6Signer.hashMessage(dataToSign);
        const signedMessage = await lsp6Signer.sign(messageHash, OWNER_PRIVATE_KEY);
    
        const result = await context.keyManager.callStatic.isValidSignature(
          signedMessage.messageHash,
          signedMessage.signature
        );
        expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
      })
    })
    
  })

};
