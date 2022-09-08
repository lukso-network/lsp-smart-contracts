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
import { abiCoder, ARRAY_INDEX, ARRAY_LENGTH } from "./utils/helpers";
import { BytesLike } from "ethers";

export type LSP6ControlledToken = {
    accounts: SignerWithAddress[];
    token: LSP7Tester | LSP8Tester;
    keyManager: LSP6KeyManager;
}

const buildContext = async () => {
    const accounts = await ethers.getSigners();
    
    const lsp7 = await new LSP7Tester__factory(accounts[0])
        .deploy("name", "symbol", accounts[0].address);
    
    const keyManager = await new LSP6KeyManager__factory(accounts[0])
        .deploy(lsp7.address);
    
    const keys = [
        ERC725YKeys.LSP6["AddressPermissions[]"].length,
        ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.ZERO,
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] + accounts[0].address.substring(2)
    ];
    
    const values = [
        ARRAY_LENGTH.ONE,
        accounts[0].address,
        ALL_PERMISSIONS
    ];

    await lsp7.connect(accounts[0])["setData(bytes32[],bytes[])"](keys, values);
    await lsp7.connect(accounts[0]).transferOwnership(keyManager.address);

    return {
        accounts,
        token: lsp7,
        keyManager
    };
}

const addControllerWithPermission = async (
    context: LSP6ControlledToken,
    account: SignerWithAddress,
    arrayLength,
    arrayIndex: BytesLike,
    permissions: BytesLike
) => {
    const keys = [
        ERC725YKeys.LSP6["AddressPermissions[]"].length,
        ERC725YKeys.LSP6["AddressPermissions[]"].index + arrayIndex,
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] + account.address.substring(2)
    ];
                
    const values = [
        arrayLength,
        account.address,
        permissions
    ];

    const payload = context.token.interface.encodeFunctionData(
        "setData(bytes32[],bytes[])", [keys, values]
    );
    
    await context.keyManager
        .connect(context.accounts[0])
        .execute(payload);
};

describe("When deploying LSP7 with LSP6 as owner", () => {

    let context: LSP6ControlledToken;

    before(async () => {
        context = await buildContext();
    });

    it("should have lsp6 as owner of the lsp7", async () => {
        expect(await context.token.owner()).to.be.equal(context.keyManager.address)
    });

    it("should set the necessary controller permissions correctly", async () => {
        const keys = [
            ERC725YKeys.LSP6["AddressPermissions[]"].length,
            ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.ZERO,
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2)
        ];
        
        const values = [
            ARRAY_LENGTH.ONE,
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
        it("should change the owner of LSP7 contract", async () => {
            const transferOwnershipPayload = context.token.interface.encodeFunctionData("transferOwnership", [context.accounts[0].address])

            await context.keyManager
                .connect(context.accounts[0])
                .execute(transferOwnershipPayload);
            
            expect(await context.token.owner())
                .to.equal(context.accounts[0].address);
        });
    });

    describe("using setData(..) in lSP7 through LSP6", () => {
        before(async () => {
            context = await buildContext();
        });

        describe("testing CHANGEOWNER permission", () => {
            before(async () => {
                await addControllerWithPermission(
                    context,
                    context.accounts[1],
                    ARRAY_LENGTH.TWO,
                    ARRAY_INDEX.ONE,
                    PERMISSIONS.CHANGEOWNER
                );
            });

            it("should add the new controller without changing other controllers", async () => {
                // Check that a new controller was added and other controllers remained intact
                const keys = [
                    ERC725YKeys.LSP6["AddressPermissions[]"].length,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.ZERO,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.ONE,
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2),
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[1].address.substring(2),
                ];
                const values = [
                    ARRAY_LENGTH.TWO,
                    context.accounts[0].address,
                    context.accounts[1].address,
                    ALL_PERMISSIONS,
                    PERMISSIONS.CHANGEOWNER,
                ];
            
                expect(await context.token["getData(bytes32[])"](keys)).to.be.deep.equal(values);
            });

            it("should revert when trying to use `renounceOwnership()`", async () => {
                const renounceOwnershipPayload = context.token.interface.encodeFunctionData("renounceOwnership")
    
                const executeRenounceOwnershipPayload = context.keyManager
                    .connect(context.accounts[1])
                    .execute(renounceOwnershipPayload);
                
                await expect(executeRenounceOwnershipPayload)
                    .to.be.revertedWithCustomError(
                        context.keyManager,
                        "InvalidERC725Function"
                    )
                    .withArgs(renounceOwnershipPayload);
            });

            it("should revert if the caller doesn't have CHANGEOWNER permission when using `transferOwnership(..)`", async () => {
                const transferOwnershipPayload = context.token.interface.encodeFunctionData("transferOwnership", [context.accounts[1].address])

                const transferOwnership = context.keyManager
                    .connect(context.accounts[2])
                    .execute(transferOwnershipPayload);
            
                expect(transferOwnership)
                    .to.be.revertedWithCustomError(
                        context.keyManager,
                        "NoPermissionsSet"
                    )
                    .withArgs(context.accounts[2].address);
            });

            it("should change the owner of LSP7 contract when using `transferOwnership(..)`", async () => {
                const transferOwnershipPayload = context.token.interface.encodeFunctionData("transferOwnership", [context.accounts[1].address])

                await context.keyManager
                    .connect(context.accounts[1])
                    .execute(transferOwnershipPayload);
            
                expect(await context.token.owner())
                    .to.equal(context.accounts[1].address);
            });

            after(async () => {
                await context.token
                    .connect(context.accounts[1])
                    .transferOwnership(context.keyManager.address);
            });
        })

        describe("testing CHANGEPERMISSIONS permission", () => {
            before(async () => {
                await addControllerWithPermission(
                    context,
                    context.accounts[2],
                    ARRAY_LENGTH.THREE,
                    ARRAY_INDEX.TWO,
                    PERMISSIONS.CHANGEPERMISSIONS
                );
            });

            it("should add the new controller without changing other controllers", async () => {
                // Check that a new controller was added and other controllers remained intact
                const keys = [
                    ERC725YKeys.LSP6["AddressPermissions[]"].length,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.ZERO,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.ONE,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.TWO,
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2),
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[1].address.substring(2),
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[2].address.substring(2),
                ];
                const values = [
                    ARRAY_LENGTH.THREE,
                    context.accounts[0].address,
                    context.accounts[1].address,
                    context.accounts[2].address,
                    ALL_PERMISSIONS,
                    PERMISSIONS.CHANGEOWNER,
                    PERMISSIONS.CHANGEPERMISSIONS,
                ];
            
                expect(await context.token["getData(bytes32[])"](keys)).to.be.deep.equal(values);
            });

            it("should revert if caller doesn't have CHANGEPERMISSION permission", async () => {
                const key = ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2);
                const value = PERMISSIONS.CALL;
                const payload = context.token.interface.encodeFunctionData(
                    "setData(bytes32,bytes)", [key, value]
                );

                const changePermission = context.keyManager
                    .connect(context.accounts[1])
                    .execute(payload);
                
                await expect(changePermission)
                    .to.be.revertedWithCustomError(
                        context.keyManager,
                        "NotAuthorised"
                    )
                    .withArgs(
                        context.accounts[1].address,
                        "CHANGEPERMISSIONS"
                    );
            });

            it("should change ALL_PERMISSIONS to CALL permission of the address", async () => {
                const key = ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2);
                const value = PERMISSIONS.CALL;
                const payload = context.token.interface.encodeFunctionData(
                    "setData(bytes32,bytes)", [key, value]
                );

                await context.keyManager
                    .connect(context.accounts[2])
                    .execute(payload);
                
                expect(await context.token["getData(bytes32)"](key))
                    .to.equal(value);
            });

            it("should add back ALL_PERMISSIONS of the address", async () => {
                const key = ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2);
                const value = ALL_PERMISSIONS;
                const payload = context.token.interface.encodeFunctionData(
                    "setData(bytes32,bytes)", [key, value]
                );

                await context.keyManager
                    .connect(context.accounts[2])
                    .execute(payload);
                
                expect(await context.token["getData(bytes32)"](key))
                    .to.equal(value);

            });
        });

        describe("testing SETDATA permission", () => {
            before(async () => {
                await addControllerWithPermission(
                    context,
                    context.accounts[3],
                    ARRAY_LENGTH.FOUR,
                    ARRAY_INDEX.THREE,
                    PERMISSIONS.SETDATA
                );
            });

            it("should add the new controller without changing other controllers", async () => {
                // Check that a new controller was added and other controllers remained intact
                const keys = [
                    ERC725YKeys.LSP6["AddressPermissions[]"].length,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.ZERO,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.ONE,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.TWO,
                    ERC725YKeys.LSP6["AddressPermissions[]"].index + ARRAY_INDEX.THREE,
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[0].address.substring(2),
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[1].address.substring(2),
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[2].address.substring(2),
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + context.accounts[3].address.substring(2),
                ];
                const values = [
                    ARRAY_LENGTH.FOUR,
                    context.accounts[0].address,
                    context.accounts[1].address,
                    context.accounts[2].address,
                    context.accounts[3].address,
                    ALL_PERMISSIONS,
                    PERMISSIONS.CHANGEOWNER,
                    PERMISSIONS.CHANGEPERMISSIONS,
                    PERMISSIONS.SETDATA,
                ];
            
                expect(await context.token["getData(bytes32[])"](keys)).to.be.deep.equal(values);
            });

            it("should allow second controller to use setData", async () => {
                const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString"));
                const value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SecondRandomString"));
                const payload = context.token.interface.encodeFunctionData(
                    "setData(bytes32,bytes)", [key, value]
                );

                await context.keyManager
                    .connect(context.accounts[3])
                    .execute(payload);
            
                expect(await context.token["getData(bytes32)"](key)).to.be.equal(value);
            });

            it("should restrict second controller with AllowedERC725YKeys", async () => {
                const key = ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] + context.accounts[3].address.substring(2);
                const value = abiCoder.encode(
                    [
                        "bytes32[]"
                    ],
                    [
                        [
                            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ARRAY_INDEX.ZERO
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
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ARRAY_INDEX.ZERO,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ARRAY_INDEX.ONE,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ARRAY_INDEX.TWO,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 34) + ARRAY_INDEX.THREE,
                ];
                const values = [
                    ARRAY_LENGTH.FOUR,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString0")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString1")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString2")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString3")),
                ];
                const payload = context.token.interface.encodeFunctionData(
                    "setData(bytes32[],bytes[])", [keys, values]
                );

                await context.keyManager
                    .connect(context.accounts[3])
                    .execute(payload);

                expect(await context.token["getData(bytes32[])"](keys)).to.be.deep.equal(values);
            });

            it("should revert when trying to change a key that is not allowed", async () => {
                const keys = [
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + '1000' + ARRAY_INDEX.ZERO,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + '0100' + ARRAY_INDEX.ONE,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + '0010' + ARRAY_INDEX.TWO,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + '0001' + ARRAY_INDEX.THREE,
                ];
                const values = [
                    ARRAY_LENGTH.FOUR,
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString0")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString1")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString2")),
                    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString3")),
                ];
                const payload = context.token.interface.encodeFunctionData(
                    "setData(bytes32[],bytes[])", [keys, values]
                );

                const executePayload = context.keyManager
                    .connect(context.accounts[3])
                    .execute(payload);

                await expect(executePayload)
                    .to.be.revertedWithCustomError(
                        context.keyManager,
                        "NotAllowedERC725YKey"
                    )
                    .withArgs(
                        context.accounts[3].address,
                        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString")).substring(0, 30) + '1000' + ARRAY_INDEX.ZERO
                    );
            });
            
        });
    });

});