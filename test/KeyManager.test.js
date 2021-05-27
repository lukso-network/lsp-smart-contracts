const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

const ERC725Account = artifacts.require("LSP3Account");
const KeyManager = artifacts.require("KeyManager");
const SimpleContract = artifacts.require("SimpleContract")

// permission keys
const KEY_PERMISSIONS = '0x4b80742d0000000082ac0000';      // AddressPermissions:Permissions:<address> --> bytes1
const KEY_ALLOWEDADDRESSES = '0x4b80742d00000000c6dd0000'; // AddressPermissions:AllowedAddresses:<address> --> address[]

// Permissions
const ALL_PERMISSIONS = "0xff"
const PERMISSION_SETDATA = 0x04;   // 0000 0100
const PERMISSION_CALL    = 0x08;   // 0000 1000

// Operations
const OPERATION_CALL         = 0
const OPERATION_DELEGATECALL = 1
const OPERATION_DEPLOY       = 2

// Other
const DATA_PLACEHOLDER = "0xaabbccdd"

let computeKey = (key, address) => key + address.subtr(2)

let allowedAddresses

contract("KeyManager", async (accounts) => {
    
    let keyManager, simpleContract,
        erc725Account

    const owner = accounts[0]
    const app = accounts[1]

    beforeEach(async () => {
        simpleContract = await SimpleContract.deployed()
        // owner permissions
        erc725Account = await ERC725Account.new(owner, { from: owner })
        await erc725Account.setData(KEY_PERMISSIONS + owner.substr(2), ALL_PERMISSIONS, { from: owner })

        allowedAddresses = [web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe"), SimpleContract.address]
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + owner.substr(2), 
            web3.eth.abi.encodeParameter('address[]', allowedAddresses)
        )

        // default third party app permissions
        let appPermissions = web3.utils.toHex(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + app.substr(2), appPermissions, { from: owner })
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + app.substr(2), 
            web3.eth.abi.encodeParameter('address[]', allowedAddresses)
        )
        
        keyManager = await KeyManager.new(erc725Account.address)
        await erc725Account.transferOwnership(keyManager.address, { from: owner })
    })

    // 0x0000000000000000000000000000000000000000000000000000000000000020
    // 0x0000000000000000000000000000000000000000000000000000000000000080
    // 0x0000000000000000000000000000000000000000000000000000000000000020
    // 0x0000000000000000000000000000000000000000000000000000000000000002 -> array length
    // 0x000000000000000000000000ce3e75a43b0a29292219926eadc8c5585651219c -> first address
    // 0x000000000000000000000000ba61a0b24a228807f23b46064773d28fe51da81c -> second address

    
    // 0x0000000000000000000000000000000000000000000000000000000000000020
    // 0x0000000000000000000000000000000000000000000000000000000000000002
    // 0x000000000000000000000000ce3e75a43b0a29292219926eadc8c5585651219c
    // 0x000000000000000000000000ba61a0b24a228807f23b46064773d28fe51da81c

    it("ensures owner is still erc725Account\'s admin (=all permissions)", async () => {
        let permissions = await erc725Account.getData(KEY_PERMISSIONS + owner.substr(2))
        assert.equal(permissions, ALL_PERMISSIONS, "Owner should have all permissions set")
    })

    /** @todo differentiate between the keys and a random setData */
    it("Owner should be allowed to change keys", async () => {
        let payload = erc725Account.contract.methods.setData(KEY_PERMISSIONS + app.substr(2), PERMISSION_SETDATA).encodeABI()
        
        await truffleAssert.passes(
            keyManager.execute.call(payload, { from: owner }),
            'Owner should be allowed to change keys on ERC725 Account'
        )
    })

    it("App should not be allowed to change keys", async () => {
        // malicious app trying to set all permissions
        let dangerousPayload = erc725Account.contract.methods.setData(KEY_PERMISSIONS + app.substr(2), ALL_PERMISSIONS).encodeABI()
        
        await truffleAssert.fails(
            keyManager.execute.call(dangerousPayload, { from: app }),
            truffleAssert.ErrorType.REVERT,
            "KeyManager:execute: Not authorized to change keys"
        )
    })

    it("Owner should be allowed to setData", async () => {
        let payload = erc725Account.contract.methods.setData(
            web3.utils.sha3("LSP3Profile"), 
            web3.utils.toHex("https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg")
        ).encodeABI()
    
        await truffleAssert.passes(
            keyManager.execute.call(payload, { from: owner }),
            "Owner should be allowed to setData on ERC725 Account"
        )
    })

    it("App should be allowed to setData", async () => {
        let payload = erc725Account.contract.methods.setData(
            web3.utils.sha3("LSP3Profile"), 
            web3.utils.toHex("https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg")
        ).encodeABI()
    
        await truffleAssert.passes(
            keyManager.execute.call(payload, { from: app }),
            "App should be allowed to setData on ERC725 Account"
        )
    })

    it("Owner should be allowed to make a CALL", async () => {
        let executePayload = erc725Account.contract.methods.execute(
            OPERATION_CALL, 
            web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe"), 
            0, 
            DATA_PLACEHOLDER    // placeholder _data
        ).encodeABI()
        
        await truffleAssert.passes(
            keyManager.execute.call(executePayload, { from: owner }),
            'Owner should be allowed to perform a CALL to another contract via its ERC725 Account'
        )
    })

    it("App should be allowed to make a CALL", async () => {
        let executePayload = erc725Account.contract.methods.execute(
            OPERATION_CALL, 
            web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe"), 
            0, 
            DATA_PLACEHOLDER
        ).encodeABI()

        await truffleAssert.passes(
            keyManager.execute.call(executePayload, { from: app }),
            'App should be allowed to perform a CALL to another contract on behalf of owner\'s ERC725 Account'
        );
    })

    it("App should not be allowed to make a DELEGATECALL", async () => {
        let executePayload = erc725Account.contract.methods.execute(
            OPERATION_DELEGATECALL, 
            web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe"), 
            0, 
            DATA_PLACEHOLDER
        ).encodeABI()

        await truffleAssert.fails(
            keyManager.execute.call(executePayload, { from: app }),
            truffleAssert.ErrorType.REVERT,
            "KeyManager:execute: not authorized to perform DELEGATECALL"
        )    
    })

    it("App should not be allowed to DEPLOY a contract", async () => {
        let executePayload = erc725Account.contract.methods.execute(
            OPERATION_DEPLOY, 
            "0x0000000000000000000000000000000000000000", 
            0, 
            DATA_PLACEHOLDER
        ).encodeABI()

        await truffleAssert.fails(
            keyManager.execute.call(executePayload, { from: app }),
            truffleAssert.ErrorType.REVERT,
            "KeyManager:execute: not authorized to perform DEPLOY"
        )
    })

    it("Owner allowed addresses to interact with should match", async () => {
        let allowedOwnerAddresses = await keyManager.getAllowedAddresses(owner);
        assert.deepEqual(
            allowedOwnerAddresses, 
            allowedAddresses
        )
    })

    it("Owner should not be allowed to interact with a not allowed address", async () => {
        let payload = erc725Account.contract.methods.execute(
            OPERATION_CALL,
            web3.utils.toChecksumAddress("0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef"), 
            0, 
            DATA_PLACEHOLDER
        ).encodeABI()

        await truffleAssert.fails(
            keyManager.execute.call(payload, { from: owner }),
            truffleAssert.ErrorType.REVERT,
            "KeyManager:execute: Not authorized to interact with this address"
        )
    })
})