const { assert } = require("chai");
const { assertion } = require("openzeppelin-test-helpers/src/expectRevert");
const truffleAssert = require('truffle-assertions');

const Account = artifacts.require("LSP3Account");
const KeyManager = artifacts.require('BasicKeyManager');

const KEY_PERMISSIONS = '0x4b80742d0000000082ac0000'; // AddressPermissions:Permissions:<address>
const KEY_ALLOWEDADDRESSES = '0x4b80742d00000000c6dd0000'; // AddressPermissions:AllowedAddresses:<address>
const KEY_ALLOWEDFUNCTIONS = '0x4b80742d000000008efe0000'; // AddressPermissions:AllowedFunctions:<address>
const KEY_ALLOWEDSTANDARDS = '0x4b80742d000000003efa0000'; // AddressPermissions:AllowedStandards:<address>

// Utilities
const removeAddressPrefix = address => address.replace('0x', '')
const convertDecimalsToHex = decimalValue => "0x" + decimalValue.toString(16)``
const convertHexToBin = hexValue => parseInt(hexValue, 16).toString(2).substr(-8)

// Permissions
const ALL_PERMISSIONS = "0xffff"
const PERMISSION_CHANGE_KEYS = "0x01"
const PERMISSION_EXECUTE = "0x04";
const PERMISSION_TRANSFER_VALUE = "0x08"
const PERMISSION_CHANGE_KEYS_AND_TRANSFER_VALUE = "0x09"

// Roles
const ADMIN_ROLE = "0xffff"
const EXECUTOR_ROLE = "0x0004"

// keccak256("EXECUTOR_ROLE")
// const EXECUTOR_ROLE = "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
// const ADMIN_ROLE = "0x00";

contract("BasicKeyManager", async (accounts) => {

    let keyManager, account;
    const owner = accounts[2];
    const secondOwner = accounts[4];
    const executor = accounts[5];

    beforeEach(async () => {
        account = await Account.new(owner, {from: owner});

        // owner sets himself all key roles
        await account.setData(KEY_PERMISSIONS + removeAddressPrefix(owner), ALL_PERMISSIONS, {from: owner});
        
        /** @todo next key type */
        // await account.setData(KEY_ALLOWEDADDRESSES + owner.replace('0x', ''), ['0xffff....'], {from: owner});

        keyManager = await KeyManager.new(account.address);

        // make keyManager owner of the account
        await account.transferOwnership(keyManager.address, {from: owner});
    });

    it('check that the owner of the Account is the KeyManager', async () => {
        assert.equal(await account.owner(), keyManager.address);
    });

    it("check owner has all Roles sets (via ERC725Y)", async () => {
        let permissions = await account.getData(KEY_PERMISSIONS + removeAddressPrefix(owner))
        assert.equal(permissions, ALL_PERMISSIONS, "Owner should have all permissions set")
    })
    
    it("check owner has all roles sets (via KeyManager)", async () => {
        let permissions = await keyManager.getPermissions(owner)
        assert.equal(permissions, ALL_PERMISSIONS, "Owner should have all permissions set")
    })

    it("Check owner has permission CHANGE_KEYS", async () => {
        let permissions = await keyManager.getPermissions(owner)
        let result = await keyManager._verifyOnePermissionSet.call(
            permissions.toString(), 
            PERMISSION_CHANGE_KEYS, 
            { from: owner }
        )
        assert.equal(result, true, "owner should be allowed to change keys")
    })

    it("Check owner has permission EXECUTE", async () => {
        let permissions = await keyManager.getPermissions(owner)
        let result = await keyManager._verifyOnePermissionSet.call(
            permissions.toString(), 
            PERMISSION_EXECUTE, 
            { from: owner }
        )
        assert.equal(result, true, "owner should be allowed to perform `execute(...)`")
    })

    it("Check owner has permission PERMISSION_TRANSFER_VALUE", async () => {
        let permissions = await keyManager.getPermissions(owner)
        let result = await keyManager._verifyOnePermissionSet.call(
            permissions.toString(), 
            PERMISSION_TRANSFER_VALUE, 
            { from: owner }
        )
        assert.equal(result, true, "owner should be allowed to transfer ethers")
    })
    
    it("Check two permissions at once", async () => {
        let permissions = await keyManager.getPermissions(owner)
        let result = await keyManager._verifyAllPermissionsSet.call(
            permissions.toString(), 
            PERMISSION_CHANGE_KEYS_AND_TRANSFER_VALUE, 
            { from: owner }
        )
        assert.equal(result, true, "owner should have both permissions CHANGE_KEYS & PERMISSION_TRANSFER_VALUE")
    })
        
    it("Should not be allowed to verify two permissions", async () => {
        let permissions = await keyManager.getPermissions(owner)
 
        await truffleAssert.reverts(
            keyManager._verifyOnePermissionSet.call(
                permissions.toString(), 
                PERMISSION_CHANGE_KEYS_AND_TRANSFER_VALUE, 
                { from: owner }
            ),
            "Trying to check more than one permission"
        )
    })

    it('should be able to add second owner', async () => {
        await keyManager.setRole(secondOwner, ADMIN_ROLE, {from: owner});
        let permissionsSecondOwner = await keyManager.getPermissions(secondOwner);
        
        assert.equal(
            permissionsSecondOwner.toString(),
            ADMIN_ROLE,
            "not the right permissions set for second owner"
        )
    
    })

    it("second owner should be able to add executor", async () => {
        await keyManager.setRole(executor, EXECUTOR_ROLE, {from: secondOwner});
        let permissionsExecutor = await keyManager.getPermissions(executor);

        assert.equal(
            permissionsExecutor.toString(),
            EXECUTOR_ROLE,
            "not the right permissions set for executor"
        )
    })
    
});
