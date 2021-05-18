const { assert } = require("chai");

const Account = artifacts.require("LSP3Account");
const KeyManager = artifacts.require("KeyManager");

// permission keys
const KEY_PERMISSIONS = '0x4b80742d0000000082ac0000'; // AddressPermissions:Permissions:<address>

// Permissions
const ALL_PERMISSIONS = "0xff"
const PERMISSION_SETDATA = 0x04;   // 0000 0100
const PERMISSION_CALL    = 0x08;   // 0000 1000

// Operations
const OPERATION_CALL         = 0
const OPERATION_DELEGATECALL = 1
const OPERATION_DEPLOY       = 2

contract("KeyManager", async (accounts) => {
    
    let keyManager, account

    const owner = accounts[0]
    const app = accounts[1]

    beforeEach(async () => {
        // owner permissions
        account = await Account.new(owner, { from: owner })
        let key = KEY_PERMISSIONS + owner.substr(2)
        await account.setData(key, ALL_PERMISSIONS, { from: owner })

        // default third party app permissions
        await account.setData(KEY_PERMISSIONS + app.substr(2), PERMISSION_CALL, { from: owner })
        
        keyManager = await KeyManager.new(account.address)
        await account.transferOwnership(keyManager.address, { from: owner })
    })

    xit('ensures the KeyManager is the new Account\'s owner', async () => {
        assert.equal(await account.owner(), keyManager.address);
    });

    xit("ensures owner is still Account\'s admin (=all permissions)", async () => {
        let permissions = await account.getData(KEY_PERMISSIONS + owner.substr(2))
        assert.equal(permissions, ALL_PERMISSIONS, "Owner should have all permissions set")
    })

    /** @todo differentiate between the keys and a random setData */
    xit("Owner should be allowed to setData", async () => {
        let setDataPayload = account.contract.methods.setData(KEY_PERMISSIONS + app.substr(2), PERMISSION_SETDATA).encodeABI()
        let isAllowed = await keyManager.execute.call(setDataPayload, { from: owner })
        assert.isTrue(isAllowed, "owner should be allowed to setData")
    })

    xit("App should not be allowed to setData", async () => {
        let setDataPayload = account.contract.methods.setData(KEY_PERMISSIONS + app.substr(2), PERMISSION_SETDATA).encodeABI()
        let isAllowed = await keyManager.execute.call(setDataPayload, { from: app })
        assert.isNotTrue(isAllowed, "App should not be allowed to setData")
    })

    it("Owner should be allowed to execute", async () => {
        let executePayload = account.contract.methods.execute(0, "0xc00ffeebeefbeefbeefbeefbeefbebeefc00ffee", 0, "0xaabbccdd").encodeABI()
        let isAllowed = await keyManager.execute.call(executePayload, { from: owner })
        assert.isTrue(isAllowed, "owner should be allowed to execute")
    })

    it("App should be allowed to make a CALL", async () => {
        let executePayload = account.contract.methods.execute(
            OPERATION_CALL, 
            "0xc00ffeebeefbeefbeefbeefbeefbebeefc00ffee", 
            0, 
            "0xaabbccdd"
        ).encodeABI()

        let isAllowed = await keyManager.execute.call(executePayload, { from: app })
        assert.isTrue(isAllowed, "App should be allowed to make a CALL")
    })

    it("App should not be allowed to make a DELEGATECALL", async () => {
        let executePayload = account.contract.methods.execute(
            OPERATION_DELEGATECALL, 
            "0xc00ffeebeefbeefbeefbeefbeefbebeefc00ffee", 
            0, 
            "0xaabbccdd"
        ).encodeABI()
        
        let isAllowed = await keyManager.execute.call(executePayload, { from: app })
        assert.isFalse(isAllowed, "App should not be allowed to make a DELEGATECALL")
    })

    it("App should not be allowed to DEPLOY a contract", async () => {
        let executePayload = account.contract.methods.execute(
            OPERATION_DEPLOY, 
            "0x0000000000000000000000000000000000000000", 
            0, 
            "0xaabbccdd"
        ).encodeABI()

        let isAllowed = await keyManager.execute.call(executePayload, { from: app })
        assert.isFalse(isAllowed, "App should not be allowed to DEPLOY a contract")
    })
})