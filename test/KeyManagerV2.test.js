const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

const ERC725Account = artifacts.require("LSP3Account");
const KeyManagerV2 = artifacts.require("KeyManagerV2");
const SimpleContract = artifacts.require("SimpleContract");
const Reentrancy = artifacts.require("Reentrancy");

// permission keys
const KEY_PERMISSIONS = '0x4b80742d0000000082ac0000';      // AddressPermissions:Permissions:<address> --> bytes1
const KEY_ALLOWEDADDRESSES = '0x4b80742d00000000c6dd0000'; // AddressPermissions:AllowedAddresses:<address> --> address[]
const KEY_ALLOWEDFUNCTIONS = '0x4b80742d000000008efe0000';

// Permissions
const ALL_PERMISSIONS          = 0xff
const PERMISSION_SETDATA       = 0x04;   // 0000 0100
const PERMISSION_CALL          = 0x08;   // 0000 1000
const PERMISSION_TRANSFERVALUE = 0x40;   // 0100 0000

// Operations
const OPERATION_CALL         = 0
const OPERATION_DELEGATECALL = 1
const OPERATION_DEPLOY       = 2

// Other
const EMPTY_PAYLOAD = "0x"

contract("KeyManagerV2", async (accounts) => {

    let keyManager, 
        erc725Account,
        simpleContract,
        maliciousContract

    const owner = accounts[0]
    const app = accounts[1]
    const user = accounts[2]

    before(async() => {
        erc725Account = await ERC725Account.new(owner, { from: owner })
        keyManager = await KeyManagerV2.new(erc725Account.address)
        simpleContract = await SimpleContract.deployed()
        maliciousContract = await Reentrancy.new(keyManager.address)

        // owner permissions
        await erc725Account.setData(KEY_PERMISSIONS + owner.substr(2), ALL_PERMISSIONS, { from: owner })

        // app permissions
        let appPermissions = web3.utils.toHex(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + app.substr(2), appPermissions, { from: owner })
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + app.substr(2), 
            web3.eth.abi.encodeParameter('address[]', [simpleContract.address, user])
        )
        await erc725Account.setData( // do not allow the app to `setNumber` on SimpleContract
            KEY_ALLOWEDFUNCTIONS + app.substr(2),
            web3.eth.abi.encodeParameter('bytes4[]', [web3.eth.abi.encodeFunctionSignature('setName(string)')])
        )

        // user permissions
        let userPermissions = web3.utils.toHex(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + user.substr(2), userPermissions, { from: owner })  

        // switch account management to KeyManager
        await erc725Account.transferOwnership(keyManager.address, { from: owner })

        /** @todo find other way to ensure ERC725 Account has always 10 ethers before each test (and not transfer every time test is re-run) */
        await web3.eth.sendTransaction({
            from: owner,
            to: erc725Account.address,
            value: web3.utils.toWei("10", "ether")
        })

    })

    // Always reset default values when deployed after each test
    beforeEach(async() => {
        await simpleContract.setName("Simple Contract Name")
        await simpleContract.setNumber(5)
    })

    context("> testing permission: TRANSFERVALUE", async () => {

        it("Owner should be allowed to transfer ethers to app", async () => {
            let initialAccountBalance = await web3.eth.getBalance(erc725Account.address)
            let initialAppBalance = await web3.eth.getBalance(app)
            
            let transferPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                app,
                web3.utils.toWei("3", "ether"),
                EMPTY_PAYLOAD
            ).encodeABI()

            let callResult = await keyManager.execute.call(transferPayload, { from: owner })
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > SimpleContract")
    
            await truffleAssert.passes(
                keyManager.execute(transferPayload, { from: owner }),
                "Should have not reverted"
            )
    
            let newAccountBalance = await web3.eth.getBalance(erc725Account.address)
            assert.isBelow(parseInt(newAccountBalance), parseInt(initialAccountBalance), "ERC725 Account's balance should have decreased")
            
            let newAppBalance = await web3.eth.getBalance(app)
            assert.isAbove(parseInt(newAppBalance), parseInt(initialAppBalance), "ERC725 Account's balance should have decreased")
        })

        it("App should not be allowed to transfer ethers", async () => {
    
            let initialAccountBalance = await web3.eth.getBalance(erc725Account.address)
            let initialUserBalance = await web3.eth.getBalance(user)
    
            let transferPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                user,
                web3.utils.toWei("3", "ether"),
                EMPTY_PAYLOAD
            ).encodeABI()
    
            await truffleAssert.fails(
                keyManager.execute(transferPayload, { from: app }),
                // truffleAssert.ErrorType.REVERT,
                "KeyManager:_checkPermissions: Not authorized to transfer ethers"
            )
    
            let newAccountBalance = await web3.eth.getBalance(erc725Account.address)
            let newUserBalance = await web3.eth.getBalance(user)
    
            assert.equal(initialAccountBalance, newAccountBalance, "ERC725 Account's balance should have remained the same")
            assert.equal(initialUserBalance, newUserBalance, "User's balance should have remained the same")
        })

    })

    context("> testing: ALL ADDRESSES + FUNCTIONS whitelisted", async () => {
        it("Should pass if no addresses / functions are stored for a user", async () => {     
            let randomPayload = "0xfafbfcfd1201456875dd"
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                web3.eth.accounts.create().address,
                0,
                randomPayload
            ).encodeABI()

            let callResult = await keyManager.execute.call(executePayload, { from: user })
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > RandomAddress")

            await truffleAssert.passes(
                keyManager.execute(executePayload, { from: user }),
                "Should not have reverted"
            )
        })
    })

    context("> testing external contract's state change", async () => {

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
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > SimpleContract")
            
            await truffleAssert.passes(
                keyManager.execute(executePayload, { from: owner }),
                "Should not have reverted"
            )
    
            let result = await simpleContract.getName()
            assert.notEqual(result, initialName, "name variable in SimpleContract should have changed")
            assert.equal(result, newName, `name variable in SimpleContract should now be ${newName}`)
        })
    
        it("App should be allowed to set `name` variable in simple contract", async () => {
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
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > SimpleContract")
    
            await truffleAssert.passes(
                keyManager.execute(executePayload, { from: owner }),
                "Should not have reverted"
            )
    
            let result = await simpleContract.getName()
            assert.notEqual(result, initialName, "name variable in SimpleContract should have changed")
            assert.equal(result, newName, `name variable in SimpleContract should now be ${newName}`)
        })
    
        it("Owner should be allowed to set `number` variable from SimpleContract", async () => {
            let initialNumber = await simpleContract.getNumber()
            let newNumber = 18
    
            let simpleContractPayload = simpleContract.contract.methods.setNumber(newNumber).encodeABI()
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                simpleContract.address,
                0,
                simpleContractPayload
            ).encodeABI()
    
            let callResult = await keyManager.execute.call(executePayload, { from: owner })
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > SimpleContract")
    
            await truffleAssert.passes(
                keyManager.execute(executePayload, { from: owner }),
                "Should not have reverted"
            )
    
            let result = await simpleContract.getNumber()
            assert.notEqual(parseInt(result, 10), initialNumber.toString(), "number variable in SimpleContract should have changed")
            assert.equal(parseInt(result, 10), newNumber, `name variable in SimpleContract should now be ${newNumber}`)
        })
    
        it("App should not be allowed to set `number` variable in simple contract", async () => {
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
                // truffleAssert.ErrorType.REVERT,
                "KeyManager:_checkPermissions: Not authorised to run this function"
            )
    
            let result = await simpleContract.getNumber()
            assert.notEqual(parseInt(result,10), newNumber.toString(), "number variable in SimpleContract should not have changed")
            assert.equal(parseInt(result,10), initialNumber.toString(), "number variable in SimpleContract should have remained the same")
        })

    })

    context("> testing other revert causes", async () => {

        it("Should revert because of wrong operation type", async () => {
            let payload = erc725Account.contract.methods.execute(
                5648941657,
                simpleContract.address,
                0,
                "0x"
            ).encodeABI()
    
            await truffleAssert.fails(
                keyManager.execute(payload, { from: owner }),
                // truffleAssert.ErrorType.REVERT,
                "KeyManager:_checkPermissions: Invalid operation type"
            )
        })

        it("Should revert because calling an unexisting function in ERC725", async () => {
            await truffleAssert.fails(
                keyManager.execute("0xbad0000000000000000000000000bad", { from: owner }),
                // truffleAssert.ErrorType.REVERT,
                "KeyManager:_checkPermissions: unknown function selector from ERC725 account"
            )                
        })

    })

    context("> testing Security", async () => {

        it("Should revert because caller has no permissions set", async () => {
            let simpleContractPayload = simpleContract.contract.methods.setName("Another name").encodeABI()
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                simpleContract.address,
                0,
                simpleContractPayload
            ).encodeABI()

            await truffleAssert.fails(
                keyManager.execute(executePayload, { from: accounts[3] }),
                "KeyManager:_getUserPermissions: no permissions set for this user / caller"
            )
        })

        it('ReEntrancy Guard should prevent contract from re-calling and transfering ETH again.', async () => {
            const ONE_ETH = web3.utils.toWei("1", "ether")
            // we assume the owner is not aware that some malicious code is present at the recipient address (the recipient being a smart contract)
            // the owner simply aims to transfer 1 ether from his ERC725 Account to the recipient address (= the malicious contract)
            let transferPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                maliciousContract.address,
                ONE_ETH,
                EMPTY_PAYLOAD
            ).encodeABI()

            let executePayload = keyManager.contract.methods.execute(transferPayload).encodeABI()
            // load the malicious payload, that will be executed in the fallback function (every time the contract receives ethers)
            await maliciousContract.loadPayload(executePayload)

            let initialAccountBalance = await web3.eth.getBalance(erc725Account.address)
            let initialAttackerBalance = await web3.eth.getBalance(maliciousContract.address)
            console.log("ERC725's initial account balance: ", initialAccountBalance)
            console.log("Attacker's initial balance: ", initialAttackerBalance)

            // try to drain funds via ReEntrancy
            await keyManager.execute(transferPayload, { from: owner })

            let newAccountBalance = await web3.eth.getBalance(erc725Account.address)
            let newAttackerBalance = await web3.eth.getBalance(maliciousContract.address)
            console.log("ERC725 account balance: ", newAccountBalance)
            console.log("Attacker balance: ", newAttackerBalance)

            assert.equal(newAccountBalance, initialAccountBalance - ONE_ETH, "ERC725's account sent more than one ETH!")
            assert.equal(newAttackerBalance, ONE_ETH, "Attacker's account received more than one ETH!")
        })

        xit("Replay Attack should fail because of invalid nonce", async () => {
            const ONE_ETH = web3.utils.toWei("1", "ether")
            
            let externalApp = await web3.eth.accounts.create()
            let nonce = await keyManager.getNonce.call(externalApp.address)
            let { signature } = await web3.eth.accounts.sign(DUMMY_PAYLOAD, externalApp.privateKey)
    
            let executeRelayedCallPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                maliciousContract.address,
                ONE_ETH,
                DUMMY_PAYLOAD
            ).encodeABI()

            // first call
            let result = await keyManager.executeRelayedCall.call(
                executeRelayedCallPayload,
                keyManager.address,
                nonce,
                signature
            )
            assert.isTrue(result, "Low Level Call failed (=returned `false`) for: KeyManager:_checkPermissionsRelay > ERC725Account")
            await truffleAssert.passes(
                keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature),
                "Should not have reverted"
            )

            // 2nd call = replay attack
            await truffleAssert.fails(
                keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature),
                "KeyManager:_checkPermissionsRelayedCall: Incorrect nonce"
            )
        })
    })
})
