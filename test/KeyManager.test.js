const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

const ERC725Account = artifacts.require("LSP3Account");
const KeyManager = artifacts.require("KeyManager");
const SimpleContract = artifacts.require("SimpleContract")

// permission keys
const KEY_PERMISSIONS = '0x4b80742d0000000082ac0000';      // AddressPermissions:Permissions:<address> --> bytes1
const KEY_ALLOWEDADDRESSES = '0x4b80742d00000000c6dd0000'; // AddressPermissions:AllowedAddresses:<address> --> address[]
const KEY_ALLOWEDFUNCTIONS = '0x4b80742d000000008efe0000';

// Permissions
const ALL_PERMISSIONS = "0xff"
const PERMISSION_SETDATA = 0x04;   // 0000 0100
const PERMISSION_CALL    = 0x08;   // 0000 1000

// Operations
const OPERATION_CALL         = 0
const OPERATION_DELEGATECALL = 1
const OPERATION_DEPLOY       = 2

// Other
const DATA_PLACEHOLDER = "0xaabbccdd123456780000000000"

let computeKey = (key, address) => key + address.subtr(2)

let allowedAddresses = [
    web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe"),
    web3.utils.toChecksumAddress("0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd")
]

let allowedFunctions = [
    "0xaabbccdd",
    web3.eth.abi.encodeFunctionSignature('getName()'),
    web3.eth.abi.encodeFunctionSignature('setName(string)'),
    web3.eth.abi.encodeFunctionSignature('getNumber()'),
    web3.eth.abi.encodeFunctionSignature('setNumber(uint)')
]

contract("KeyManager", async (accounts) => {
    
    let keyManager, 
        simpleContract,
        erc725Account

    const owner = accounts[0]
    const app = accounts[1]

    before(async () => {
        simpleContract = await SimpleContract.deployed()
        allowedAddresses.push(simpleContract.address)
        
        // owner permissions
        erc725Account = await ERC725Account.new(owner, { from: owner })
        await erc725Account.setData(KEY_PERMISSIONS + owner.substr(2), ALL_PERMISSIONS, { from: owner })
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + owner.substr(2), 
            web3.eth.abi.encodeParameter('address[]', allowedAddresses)
        )
        await erc725Account.setData(
            KEY_ALLOWEDFUNCTIONS + owner.substr(2),
            web3.eth.abi.encodeParameter('bytes4[]', allowedFunctions)
        )

        // default third party app permissions
        let appPermissions = web3.utils.toHex(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + app.substr(2), appPermissions, { from: owner })
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + app.substr(2), 
            web3.eth.abi.encodeParameter('address[]', allowedAddresses)
        )
        await erc725Account.setData( // do not allow the app to run get/setNumber on SimpleContract
            KEY_ALLOWEDFUNCTIONS + app.substr(2),
            web3.eth.abi.encodeParameter('bytes4[]', allowedFunctions.slice(0, 2))
        )
        
        keyManager = await KeyManager.new(erc725Account.address)
        await erc725Account.transferOwnership(keyManager.address, { from: owner })
    })

    it("ensures owner is still erc725Account\'s admin (=all permissions)", async () => {
        let permissions = await erc725Account.getData(KEY_PERMISSIONS + owner.substr(2))
        assert.equal(permissions, ALL_PERMISSIONS, "Owner should have all permissions set")
    })

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
            DATA_PLACEHOLDER
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

    it("Owner should be allowed to interact with 1st allowed address from list", async () => {
        let payload = erc725Account.contract.methods.execute(
            OPERATION_CALL,
            allowedAddresses[0],
            0,
            DATA_PLACEHOLDER
        ).encodeABI()

        await truffleAssert.passes(
            keyManager.execute.call(payload, { from: owner }),
            "Owner should be allowed to interact with the 1st address from the list"
        )
    })

    it("Owner should be allowed to interact with 2nd address from the list", async () => {
        let payload = erc725Account.contract.methods.execute(
            OPERATION_CALL,
            allowedAddresses[1],
            0,
            DATA_PLACEHOLDER
        ).encodeABI()

        await truffleAssert.passes(
            keyManager.execute.call(payload, { from: owner }),
            "Owner should be allowed to interact with the 2nd address from the list"
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

    it("App should not be allowed to run function with signature `0xbeefbeef`", async () => {
        let payload = erc725Account.contract.methods.execute(
            OPERATION_CALL,
            allowedAddresses[0],
            0,
            "0xbeefbeef123456780000000000"
        ).encodeABI()

        await truffleAssert.fails(
            keyManager.execute.call(payload, { from: app }),
            truffleAssert.ErrorType.REVERT,
            "KeyManager:execute: Not authorised to run this function"
        )
    })

    it("Owner should be allowed to set `name` variable in simple contract", async () => {        
        let initialName = await simpleContract.getName()
        let newName = "Updated Name"

        let simpleContractPayload = simpleContract.contract.methods.setName(newName).encodeABI()
        let executePayload = erc725Account.contract.methods.execute(
            OPERATION_CALL,
            simpleContract.address,
            0,
            simpleContractPayload
        ).encodeABI()

        let callResult = await keyManager.execute.call(executePayload, { from: owner })
        assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for following chained calls: KeyManager > ERC725Account > SimpleContract")
        
        await truffleAssert.passes(
            keyManager.execute(executePayload, { from: owner }),
            "Should have not reverted"
        )

        let result = await simpleContract.getName()
        assert.notEqual(result, initialName, "name variable in SimpleContract should have changed")
        assert.equal(result, newName, `name variable in SimpleContract should now be ${newName}`)
    })

    it.only("App should not be allowed to set `number` variable in simple contract", async () => {
        let initialNumber = await simpleContract.getNumber()
        let newNumber = 18

        let simpleContractPayload = simpleContract.contract.methods.setNumber(newNumber).encodeABI()
        let executePayload = erc725Account.contract.methods.execute(
            OPERATION_CALL,
            simpleContract.address,
            0,
            simpleContractPayload
        ).encodeABI()

        await truffleAssert.fails(
            keyManager.execute(executePayload, { from: app }),
            truffleAssert.ErrorType.REVERT,
            "KeyManager:execute: Not authorised to run this function"
        )

        let result = await simpleContract.getNumber()
        assert.notEqual(result, newNumber.toString(), "number variable in SimpleContract should not have changed")
        assert.equal(result, initialNumber.toString(), "number variable in SimpleContract should have remained the same")
    })
})