import { ethers } from "hardhat";
import { expect } from "chai";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { 
    LSP6KeyManager,
    LSP6KeyManager__factory,
    LSP7Tester,
    LSP7Tester__factory,
    LSP8Tester,
    LSP8Tester__factory
} from "../types";
import { ERC725YKeys, ALL_PERMISSIONS, PERMISSIONS } from "../constants";

export type LSP6ControlledToken = {
    accounts: SignerWithAddress[];
    token: LSP7Tester | LSP8Tester;
    keyManager: LSP6KeyManager;
}

describe("When deploying LSP7 with LSP6 as owner", () => {

    let context: LSP6ControlledToken;

    before(async () => {
        const accounts = await ethers.getSigners();
        
        const lsp7 = await new LSP7Tester__factory(accounts[0])
            .deploy("name", "symbol", accounts[0].address);
        
        const keyManager = await new LSP6KeyManager__factory(accounts[0])
            .deploy(lsp7.address);
        
        const keys = [
            ERC725YKeys.LSP6["AddressPermissions[]"].length,
            ERC725YKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexValue(0), 16).substring(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] + accounts[0].address.substring(2)
        ];
        
        const values = [
            ethers.utils.hexZeroPad(ethers.utils.hexValue(1), 32),
            accounts[0].address,
            ALL_PERMISSIONS
        ];

        await lsp7.connect(accounts[0])["setData(bytes32[],bytes[])"](keys, values);
        await lsp7.connect(accounts[0]).transferOwnership(keyManager.address);

        context = {
            accounts,
            token: lsp7,
            keyManager
        };
    });

    it("should have lsp6 as owner of the lsp7", async () => {
        expect(await context.token.owner()).to.be.equal(context.keyManager.address)
    });

    it("should set the necessary controller permissions correctly", async () => {
        const keys = [
            ERC725YKeys.LSP6["AddressPermissions[]"].length,
            ERC725YKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexValue(0), 16).substring(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2)
        ];
        
        const values = [
            ethers.utils.hexZeroPad(ethers.utils.hexValue(1), 32),
            context.accounts[0].address,
            ALL_PERMISSIONS
        ];

        expect(await context.token["getData(bytes32[])"](keys)).to.be.deep.equal(values);
    });

    describe("using execute(..) in lSP7 through LSP6", () => {
        it("should revert", async () => {
            const newTokenContract = await new LSP7Tester__factory(context.accounts[0])
                .deploy(
                    "NewTokenName",
                    "NewTokenSymbol",
                    context.accounts[0].address
                );
            const mintPayload = newTokenContract.interface.encodeFunctionData(
                "mint",
                [
                    context.accounts[0].address,
                    1000,
                    true,
                    "0x"
                ]
            );
            
            const ABI = ["function execute(uint256 operation, address to, uint256 value, bytes calldata data) external;"];
            const ERC725XInterface = new ethers.utils.Interface(ABI);
            const payload = ERC725XInterface.encodeFunctionData(
                "execute",
                [
                    0,
                    newTokenContract.address,
                    0,
                    mintPayload
                ]
            );

            const executePayload = context.keyManager
                .connect(context.accounts[0])
                .execute(payload);
            
            await expect(executePayload)
                .to.be.revertedWith("LSP6: Unknown Error occured when calling the linked target contract");
        });
    });

    describe("using renounceOwnership(..) in LSP7 through LSP6", () => {
        it("should revert", async () => {
            const renounceOwnershipPayload = context.token.interface.encodeFunctionData("renounceOwnership")

            const executeRenounceOwnershipPayload = context.keyManager
                .connect(context.accounts[0])
                .execute(renounceOwnershipPayload);
            
            await expect(executeRenounceOwnershipPayload)
                .to.be.revertedWithCustomError(
                    context.keyManager,
                    "InvalidERC725Function"
                )
                .withArgs(renounceOwnershipPayload);
        });
    });

    describe("using transferOwnership(..) in LSP7 through LSP6", () => {
        it("should revert", async () => {
            const transferOwnershipPayload = context.token.interface.encodeFunctionData("transferOwnership", [context.accounts[0].address])

            await context.keyManager
                .connect(context.accounts[0])
                .execute(transferOwnershipPayload);
            
            expect(await context.token.owner())
                .to.equal(context.accounts[0].address);
        });
    });

    describe("using setData(..) in lSP7 through LSP6", () => {
        it("should allow first controller to add a new controller", async () => {
            // Create a payload that adds new controller with set data permission
            const keys = [
                ERC725YKeys.LSP6["AddressPermissions[]"].length,
                ERC725YKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexValue(1), 16).substring(2),
                ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[1].address.substring(2)
            ];
            const values = [
                ethers.utils.hexZeroPad(ethers.utils.hexValue(2), 32),
                context.accounts[1].address,
                PERMISSIONS.SETDATA
            ];
            const payload = context.token.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [
                    keys,
                    values
                ]
            );

            // Check that a new controller was added and other controllers remained intact
            const keysToCheck = [
                ERC725YKeys.LSP6["AddressPermissions[]"].length,
                ERC725YKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexValue(0), 16).substring(2),
                ERC725YKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexValue(1), 16).substring(2),
                ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2),
                ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[1].address.substring(2)
            ];
            const valuesToCheck = [
                ethers.utils.hexZeroPad(ethers.utils.hexValue(2), 32),
                context.accounts[0].address,
                context.accounts[1].address,
                ALL_PERMISSIONS,
                PERMISSIONS.SETDATA
            ];

            await context.keyManager
                .connect(context.accounts[0])
                .execute(payload);
            
            expect(await context.token["getData(bytes32[])"](keysToCheck)).to.be.deep.equal(valuesToCheck);
        });

        it("should allow second controller to use setData", async () => {
            const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString"));
            const value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SecondRandomString"));
            const payload = context.token.interface.encodeFunctionData(
                "setData(bytes32,bytes)", [key, value]
            );

            await context.keyManager
                .connect(context.accounts[1])
                .execute(payload);
            
            expect(await context.token["getData(bytes32)"](key)).to.be.equal(value);
        });

        it("should restrict second controller with AllowedERC725YKeys", async () => {
            const key = ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] + context.accounts[1].address.substring(2);
            const value = ethers.utils.defaultAbiCoder.encode(
                [
                    "bytes32[]"
                ],
                [
                    [
                        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0,34) + ethers.utils.hexZeroPad(ethers.utils.hexValue(0), 16).substring(2)
                    ]
                ]
            );
            const payload = context.token.interface.encodeFunctionData(
                "setData(bytes32,bytes)", [key, value]
            );

            await context.keyManager
                .connect(context.accounts[0])
                .execute(payload);

            expect(await context.token["getData(bytes32)"](key)).to.be.equal(value);
        });

        it("should change allowed keys", async () => {
            const keys = [
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ethers.utils.hexZeroPad(ethers.utils.hexValue(0), 16).substring(2),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ethers.utils.hexZeroPad(ethers.utils.hexValue(1), 16).substring(2),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ethers.utils.hexZeroPad(ethers.utils.hexValue(2), 16).substring(2),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ethers.utils.hexZeroPad(ethers.utils.hexValue(3), 16).substring(2),
            ];
            const values = [
                ethers.utils.hexZeroPad(ethers.utils.hexValue(4), 32),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString0")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString1")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString2")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString3")),
            ];
            const payload = context.token.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])", [keys, values]
            );

            await context.keyManager
                .connect(context.accounts[1])
                .execute(payload);

            expect(await context.token["getData(bytes32[])"](keys)).to.be.deep.equal(values);
        });

        it("should revert when trying to change a key that is not allowed", async () => {
            const keys = [
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + ethers.utils.hexZeroPad(ethers.utils.hexValue(0), 18).substring(2),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + ethers.utils.hexZeroPad(ethers.utils.hexValue(1), 18).substring(2),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + ethers.utils.hexZeroPad(ethers.utils.hexValue(2), 18).substring(2),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + ethers.utils.hexZeroPad(ethers.utils.hexValue(3), 18).substring(2),
            ];
            const values = [
                ethers.utils.hexZeroPad(ethers.utils.hexValue(4), 32),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString0")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString1")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString2")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString3")),
            ];
            const payload = context.token.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])", [keys, values]
            );

            const executePayload = context.keyManager
                .connect(context.accounts[1])
                .execute(payload);

            await expect(executePayload)
                .to.be.revertedWithCustomError(
                    context.keyManager,
                    "NotAllowedERC725YKey"
                )
                .withArgs(
                    context.accounts[1].address,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + ethers.utils.hexZeroPad(ethers.utils.hexValue(0), 18).substring(2)
                );
        });
    });

});