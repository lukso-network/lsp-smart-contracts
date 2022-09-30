import { ethers } from "hardhat"; 
import { LSP6Signer } from '@lukso/lsp6-signer.js';

import { LSP6KeyManager, LSP6KeyManager__factory, UniversalProfile, UniversalProfile__factory } from "../types"
import { expect } from "chai";
import { ALL_PERMISSIONS, ERC725YKeys, OPERATION_TYPES } from "../constants";
import { setupKeyManager } from "./utils/fixtures";
import { LSP6TestContext } from "./utils/context";

describe("LSP6Signer", () => {
    
    it("should return same signed message hash than LSP6Utils library", async () => {
        const accounts = await ethers.getSigners()

        const keyManager = await new LSP6KeyManager__factory(accounts[0]).deploy(accounts[0].address)
        const lsp6Signer = new LSP6Signer();
        const libraryResult = lsp6Signer.hashMessage("example")

        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("example"))

        const solidityResult = await keyManager["toLSP6SignedMessageHash(bytes)"](ethers.utils.toUtf8Bytes("example"));

        expect(solidityResult).to.equal(libraryResult)
    })

    describe.only("when transferring 1 LYX via `executeRelayCall(...)", () => {

        let context: LSP6TestContext

        let thirdParty = ethers.Wallet.createRandom()

        const buildTestContext = async (): Promise<LSP6TestContext> => {
            const accounts = await ethers.getSigners();
            const owner = accounts[0];
      
            const universalProfile = await new UniversalProfile__factory(
              owner
            ).deploy(owner.address);
            const keyManager = await new LSP6KeyManager__factory(owner).deploy(
              universalProfile.address
            );
      
            return { accounts, owner, universalProfile, keyManager };
        };

        beforeEach(async () => {
            context =  await buildTestContext()

            const permissionsKeys = [
                ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
                context.owner.address.substring(2),
                ERC725YKeys.LSP6["AddressPermissions:Permissions"] + thirdParty.address.substring(2)
            ];
    
            const permissionsValues = [
                ALL_PERMISSIONS,
                ALL_PERMISSIONS,
            ];
  
            await setupKeyManager(context, permissionsKeys, permissionsValues);
    
            await context.owner.sendTransaction({
                to: context.universalProfile.address,
                value: ethers.utils.parseEther("10"),
            });
        })

        it("should revert if tx was signed with Eth Signed Message", async () => {

            const recipient = context.accounts[1].address
            const amount = ethers.utils.parseEther("3")

            let executeRelayCallPayload =
                context.universalProfile.interface.encodeFunctionData("execute", [
                    OPERATION_TYPES.CALL,
                    recipient,
                    amount,
                    "0x",
          ]);

            const HARDHAT_CHAINID = 31337;

            let hash = ethers.utils.solidityKeccak256(
                ["uint256", "address", "uint256", "bytes"],
                [
                    HARDHAT_CHAINID,
                    context.keyManager.address,
                    0,
                    executeRelayCallPayload,
                ]
            );

            // ethereum signed message prefix
            let signature = await context.owner.signMessage(ethers.utils.arrayify(hash));

            await expect(
                context.keyManager.executeRelayCall(
                    signature,
                    0,
                    executeRelayCallPayload
                )
            ).to.be.reverted;

        });

        it("should pass if tx was signed with lsp6-signer library", async () => {
            const lsp6Signer = new LSP6Signer()

            const recipient = context.accounts[1].address
            const amount = ethers.utils.parseEther("3")

            let executeRelayCallPayload =
                context.universalProfile.interface.encodeFunctionData("execute", [
                    OPERATION_TYPES.CALL,
                    recipient,
                    amount,
                    "0x",
          ]);

            const HARDHAT_CHAINID = 31337;

            let hash = ethers.utils.solidityKeccak256(
                ["uint256", "address", "uint256", "bytes"],
                [
                    HARDHAT_CHAINID,
                    context.keyManager.address,
                    0,
                    executeRelayCallPayload,
                ]
            );

            const OWNER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

            // lsp6 signed message prefixed
            let signedMessage = await lsp6Signer.sign(hash, OWNER_PRIVATE_KEY);

            await expect(
                context.keyManager.connect(context.owner).executeRelayCall(
                    signedMessage.signature,
                    0,
                    executeRelayCallPayload
                )
            ).to.not.be.reverted;
        })
    })

})