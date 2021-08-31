const { assert } = require("chai");
const truffleAssert = require('truffle-assertions');

const ERC725Account = artifacts.require("LSP3Account");
const KeyManager = artifacts.require("KeyManager");
const KeyManagerHelper = artifacts.require("KeyManagerHelper");
const TargetContract = artifacts.require("TargetContract");
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
const DUMMY_PAYLOAD = "0xaabbccdd123456780000000000"
const ONE_ETH = web3.utils.toWei("1", "ether")
const DUMMY_PRIVATEKEY = '0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe';

let allowedAddresses = [
    web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe"),
    web3.utils.toChecksumAddress("0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd")
]

let allowedFunctions = [
    "0xaabbccdd",   // placeholder
    web3.eth.abi.encodeFunctionSignature('setName(string)'),
    web3.eth.abi.encodeFunctionSignature('setNumber(uint256)')
]

contract("KeyManagerHelper", async (accounts) => {

    let keyManagerHelper,
        erc725Account

    const owner = accounts[0]
    const app = accounts[1]
    const user = accounts[2]

    before(async () => {
        erc725Account = await ERC725Account.new(owner, { from: owner })

        keyManagerHelper = await KeyManagerHelper.new(erc725Account.address)
        
        await erc725Account.setData(KEY_PERMISSIONS + owner.substr(2), ALL_PERMISSIONS, { from: owner })
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + owner.substr(2), 
            web3.eth.abi.encodeParameter('address[]', allowedAddresses)
        )
        await erc725Account.setData(
            KEY_ALLOWEDFUNCTIONS + owner.substr(2), 
            web3.eth.abi.encodeParameter('bytes4[]', allowedFunctions)
        )

    })

    context("Reading ERC725's account storage", async () => {

        it("_getAllowedAddresses(...) - Should return list of owner's allowed addresses", async () => {
            let bytesResult = await keyManagerHelper.getAllowedAddresses(owner, { from: owner });
            let allowedOwnerAddresses = web3.eth.abi.decodeParameter('address[]', bytesResult)

            assert.deepEqual(
                allowedOwnerAddresses, 
                allowedAddresses
            )
        })

        it("_getAllowedAddresses(...) - Should return no addresses for app", async () => {
            let bytesResult = await keyManagerHelper.getAllowedAddresses(app);
            assert.isNull(bytesResult)

            let resultFromAccount = await erc725Account.getData(KEY_ALLOWEDADDRESSES + app.substr(2))
            assert.isNull(resultFromAccount)
        })

        it("_getAllowedFunctions(...) - Should return list of owner's allowed functions", async () => {
            let bytesResult = await keyManagerHelper.getAllowedFunctions(owner);
            let allowedOwnerFunctions = web3.eth.abi.decodeParameter('bytes4[]', bytesResult)

            assert.deepEqual(
                allowedOwnerFunctions,
                allowedFunctions,
                "not the same result fetched from KeyManager"
            )

            let resultFromAccount = await erc725Account.getData(KEY_ALLOWEDFUNCTIONS + owner.substr(2))
            let decodedResultFromAccount = web3.eth.abi.decodeParameter('bytes4[]', resultFromAccount)

            assert.deepEqual(
                decodedResultFromAccount,
                allowedFunctions,
                "not the same result fetched from ERC725Y"
            )

            // also make sure that both functions from keyManager and from erc725 account return the same thing
            assert.equal(bytesResult, resultFromAccount, "KeyManager and ERC725 account do not return the same result")
        })

        it("_getAllowedFunctions(...) - Should return no functions selectors for app.", async () => {
            let bytesResult = await keyManagerHelper.getAllowedFunctions(app);
            assert.isNull(bytesResult)

            let resultFromAccount = await erc725Account.getData(KEY_ALLOWEDFUNCTIONS + app.substr(2))
            assert.isNull(resultFromAccount)
        })

    })

    context("Reading User's permissions", async () => {

        it("Should return 0xff for owner", async () => {
            assert.equal(
                await keyManagerHelper.getUserPermissions(owner),
                ALL_PERMISSIONS
            ) 
        })

    })

    context("Testing permissions for allowed addresses / function", async () => {

        it("_isAllowedAddress(...) - Should return `true` for address listed in owner's allowed addresses", async () => {
            assert.isTrue(
                await keyManagerHelper.isAllowedAddress.call(
                    owner,
                    web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe")
                )
            )
        })

        it("_isAllowedAddress(...) - Should return `false` for address not listed in owner's allowed addresses", async () => {
            assert.isFalse(
                await keyManagerHelper.isAllowedAddress.call(
                    owner,
                    web3.utils.toChecksumAddress("0xdeadbeefdeadbeefdeaddeadbeefdeadbeefdead")
                )
            )
        })

        it("_isAllowedAddress(...) - Should return `true`, user has all addresses whitelisted (= no list of allowed address)", async () => {
            // assuming a scenario user wants to interact with app on via ERC725 account
            assert.isTrue(await keyManagerHelper.isAllowedAddress.call(user, app))
        })

    })

})

contract("KeyManager", async (accounts) => {
    
    let keyManager, 
        erc725Account,
        targetContract,
        maliciousContract,
        externalApp,
        newUser

    const owner = accounts[0]
    const app = accounts[1]
    const user = accounts[2]
    
    before(async () => {
        erc725Account = await ERC725Account.new(owner, { from: owner })
        keyManager = await KeyManager.new(erc725Account.address)
        targetContract = await TargetContract.deployed()
        maliciousContract = await Reentrancy.new(keyManager.address)

        // externalApp = await web3.eth.accounts.wallet.create(1)[0].address
        externalApp = await web3.eth.accounts.privateKeyToAccount(DUMMY_PRIVATEKEY)
        console.log("externalApp", externalApp)
        // owner permissions
        await erc725Account.setData(KEY_PERMISSIONS + owner.substr(2), ALL_PERMISSIONS, { from: owner })

        // app permissions
        let appPermissions = web3.utils.toHex(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + app.substr(2), appPermissions, { from: owner })
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + app.substr(2), 
            web3.eth.abi.encodeParameter('address[]', [targetContract.address, user])
        )
        await erc725Account.setData( // do not allow the app to `setNumber` on TargetContract
            KEY_ALLOWEDFUNCTIONS + app.substr(2),
            web3.eth.abi.encodeParameter('bytes4[]', [web3.eth.abi.encodeFunctionSignature('setName(string)')])
        )

        // user permissions
        let userPermissions = web3.utils.toHex(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + user.substr(2), userPermissions, { from: owner })  
        
        // externalApp permissions
        let externalAppPermissions = web3.utils.toHex(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + externalApp.address.substr(2), externalAppPermissions, { from: owner })
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + externalApp.address.substr(2), 
            web3.eth.abi.encodeParameter('address[]', [targetContract.address, user])
        )
        await erc725Account.setData( // do not allow the externalApp to `setNumber` on TargetContract
            KEY_ALLOWEDFUNCTIONS + externalApp.address.substr(2),
            web3.eth.abi.encodeParameter('bytes4[]', [web3.eth.abi.encodeFunctionSignature('setName(string)')])
        )
        
        // workaround to test security
        // await web3.eth.accounts.wallet.add('0x09e910621c2e988e9f7f6ffcd7024f54ec1461fa6e86a4b545e9e1fe21c28866')
        // newUser = await web3.eth.accounts.wallet[1].address
        // await erc725Account.setData(
        //     KEY_PERMISSIONS + newUser.substr(2), 
        //     web3.utils.toHex(PERMISSION_SETDATA + PERMISSION_CALL + PERMISSION_TRANSFERVALUE), 
        //     { from: owner }
        // )

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
        await targetContract.setName("Simple Contract Name")
        await targetContract.setNumber(5)
    })

    it("ensures owner is still erc725Account\'s admin (=all permissions)", async () => {
        let permissions = await erc725Account.getData(KEY_PERMISSIONS + owner.substr(2))
        assert.equal(permissions, ALL_PERMISSIONS, "Owner should have all permissions set")
    })

    context("> testing permissions: CHANGEKEYS, SETDATA", async () => {
        
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
                "KeyManager:_checkPermissions: Not authorized to change keys"
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

    })

    context("> testing permissions: CALL, DELEGATECALL, DEPLOY", async () => {

        it("Owner should be allowed to make a CALL", async () => {
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL, 
                web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe"), 
                0, 
                DUMMY_PAYLOAD
            ).encodeABI()
            
            await truffleAssert.passes(
                keyManager.execute.call(executePayload, { from: owner }),
                'Owner should be allowed to perform a CALL to another contract via its ERC725 Account'
            )
        })
    
        it("App should be allowed to make a CALL", async () => {
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL, 
                web3.utils.toChecksumAddress(targetContract.address), 
                0, 
                targetContract.contract.methods.setName("Example").encodeABI()
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
                DUMMY_PAYLOAD
            ).encodeABI()
    
            await truffleAssert.fails(
                keyManager.execute.call(executePayload, { from: app }),
                truffleAssert.ErrorType.REVERT,
                "KeyManager:_checkPermissions: not authorized to perform DELEGATECALL"
            )    
        })
    
        it("App should not be allowed to DEPLOY a contract", async () => {
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_DEPLOY, 
                "0x0000000000000000000000000000000000000000", 
                0, 
                DUMMY_PAYLOAD
            ).encodeABI()
    
            await truffleAssert.fails(
                keyManager.execute.call(executePayload, { from: app }),
                truffleAssert.ErrorType.REVERT,
                "KeyManager:_checkPermissions: not authorized to perform DEPLOY"
            )
        })

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
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract")
    
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


    context("> testing permissions: ALLOWEDADDRESSES", async () => {
    
        it("All addresses whitelisted = Owner should be allowed to interact with any address", async () => {
            let payload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                web3.utils.toChecksumAddress("0xcafecafecafecafecafecafecafecafecafecafe"),
                0,
                DUMMY_PAYLOAD
            ).encodeABI()
    
            await truffleAssert.passes(
                keyManager.execute.call(payload, { from: owner }),
                "Could not interact with 0xcafecafe... - Owner should be allowed to interact with any address"
            )

            let secondPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                web3.utils.toChecksumAddress("0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd"),
                0,
                DUMMY_PAYLOAD
            ).encodeABI()
    
            await truffleAssert.passes(
                keyManager.execute.call(secondPayload, { from: owner }),
                "Could not interact with 0xabcdabcd... - Owner should be allowed to interact with any address"
            )
        })
    
        it("App should be allowed to interact with `TargetContract`", async () => {
            let payload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address, 
                0, 
                EMPTY_PAYLOAD
            ).encodeABI()
    
            await truffleAssert.passes(
                keyManager.execute.call(payload, { from: app }),
                "Could not interact with TargetContract - App should be allowed to interact with this contract"
            )
        })

        it("App should be allowed to interact with `user`", async () => {
            let payload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                user, 
                0, 
                EMPTY_PAYLOAD
            ).encodeABI()
    
            await truffleAssert.passes(
                keyManager.execute.call(payload, { from: app }),
                "Could not interact with `user` - App should be allowed to interact with this EOA"
            )
        })

        it("App should not be allowed to interact with `0xdeadbeef...` (not allowed address)", async () => {
            let payload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                web3.utils.toChecksumAddress("0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"), 
                0, 
                DUMMY_PAYLOAD
            ).encodeABI()
    
            await truffleAssert.fails(
                keyManager.execute.call(payload, { from: app }),
                "KeyManager:_checkPermissions: Not authorized to interact with this address"
            )
        })

    })

    context("> testing permissions: ALLOWEDFUNCTIONS", async () => {

        it("App should not be allowed to run a non-allowed function (function signature = `0xbeefbeef`)", async () => {
            let payload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                "0xbeefbeef123456780000000000"
            ).encodeABI()
    
            await truffleAssert.fails(
                keyManager.execute.call(payload, { from: app }),
                // truffleAssert.ErrorType.REVERT,
                "KeyManager:_checkPermissions: Not authorised to run this function"
            )
        })

        /** @todo */
        // it("All functions whitelisted = owner should be allowed to call any functions in TargetContract", async () => {

        // })

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
            let initialName = await targetContract.getName()
            let newName = "Updated Name"
    
            let targetContractPayload = targetContract.contract.methods.setName(newName).encodeABI()
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                targetContractPayload
            ).encodeABI()
    
            let callResult = await keyManager.execute.call(executePayload, { from: owner })
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract")
            
            await truffleAssert.passes(
                keyManager.execute(executePayload, { from: owner }),
                "Should not have reverted"
            )
    
            let result = await targetContract.getName()
            assert.notEqual(result, initialName, "name variable in TargetContract should have changed")
            assert.equal(result, newName, `name variable in TargetContract should now be ${newName}`)
        })
    
        it("App should be allowed to set `name` variable in TargetContract", async () => {
            let initialName = await targetContract.getName()
            let newName = "Updated Name"
    
            let targetContractPayload = targetContract.contract.methods.setName(newName).encodeABI()
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                targetContractPayload
            ).encodeABI()
    
            let callResult = await keyManager.execute.call(executePayload, { from: owner })
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract")
    
            await truffleAssert.passes(
                keyManager.execute(executePayload, { from: owner }),
                "Should not have reverted"
            )
    
            let result = await targetContract.getName()
            assert.notEqual(result, initialName, "name variable in TargetContract should have changed")
            assert.equal(result, newName, `name variable in TargetContract should now be ${newName}`)
        })
    
        it("Owner should be allowed to set `number` variable from TargetContract", async () => {
            let initialNumber = await targetContract.getNumber()
            let newNumber = 18
    
            let targetContractPayload = targetContract.contract.methods.setNumber(newNumber).encodeABI()
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                targetContractPayload
            ).encodeABI()
    
            let callResult = await keyManager.execute.call(executePayload, { from: owner })
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract")
    
            await truffleAssert.passes(
                keyManager.execute(executePayload, { from: owner }),
                "Should not have reverted"
            )
    
            let result = await targetContract.getNumber()
            assert.notEqual(parseInt(result, 10), initialNumber.toString(), "number variable in TargetContract should have changed")
            assert.equal(parseInt(result, 10), newNumber, `name variable in TargetContract should now be ${newNumber}`)
        })
    
        it("App should not be allowed to set `number` variable in simple contract", async () => {
            let initialNumber = await targetContract.getNumber()
            let newNumber = 18
    
            let targetContractPayload = targetContract.contract.methods.setNumber(newNumber).encodeABI()
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                targetContractPayload
            ).encodeABI()
    
            await truffleAssert.fails(
                keyManager.execute(executePayload, { from: app }),
                "KeyManager:_checkPermissions: Not authorised to run this function"
            )
    
            let result = await targetContract.getNumber()
            assert.notEqual(parseInt(result,10), newNumber.toString(), "number variable in TargetContract should not have changed")
            assert.equal(parseInt(result,10), initialNumber.toString(), "number variable in TargetContract should have remained the same")
        })

    })

    context("> testing other revert causes", async () => {

        it("Should revert because of wrong operation type", async () => {
            let payload = erc725Account.contract.methods.execute(
                5648941657,
                targetContract.address,
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

    context("> testing `executeRelay(...)`", async () => {

        it.only("Compare signature", async () => {
            let staticAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
            let payload = `0x44c028fe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000009fbda871d559710256a2502a2517b794b482db40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000064c47f00270000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c416e6f74686572206e616d65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;
            let nonce = 0;
            let output = web3.utils.soliditySha3(staticAddress, { t: 'bytes', v: payload }, nonce);
            
            let signature = web3.eth.accounts.sign(
                web3.utils.soliditySha3(staticAddress, { t: 'bytes', v: payload }, nonce),
                DUMMY_PRIVATEKEY
            ).signature

            let hashStaticAddress 


            console.log(output);
            // console.log(web3.utils.toHex(output, true));
            // console.log(web3.utils.toHex(staticAddress, true));
            // console.log(web3.utils.toHex({ t: 'bytes', v: payload }, true));
            // console.log(web3.utils.toHex(nonce, true));
            console.log("signature: ", signature)
        })
            
        it("should execute a signed tx successfully", async () => {

            let targetContractPayload = targetContract.contract.methods.setName("Another name").encodeABI()    
            let nonce = await keyManager.getNonce.call(externalApp.address)
            console.log("nonce: ", nonce)
            let executeRelayedCallPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                targetContractPayload
            ).encodeABI()
            console.log("executeRelayedCallPayload: ", executeRelayedCallPayload)
                
            let signature = web3.eth.accounts.sign(
                web3.utils.soliditySha3(keyManager.address, { t: 'bytes', v: executeRelayedCallPayload }, nonce),
                DUMMY_PRIVATEKEY
            ).signature

            console.log("signature: ", signature)

            let result = await keyManager.executeRelayedCall.call(
                executeRelayedCallPayload,
                keyManager.address,
                nonce,
                signature
            )
            assert.isTrue(result, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract")

            await truffleAssert.passes(
                keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature),
                "Should not have reverted"
            )
        })

        it("Should allow to `setName` via `executeRelay`", async () => {

            let newName = "Dagobah"

            let targetContractPayload = targetContract.contract.methods.setName(newName).encodeABI()    
            let nonce = await keyManager.getNonce.call(externalApp.address)
    
            let executeRelayedCallPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                targetContractPayload
            ).encodeABI()

            let signature = web3.eth.accounts.sign(
                web3.utils.soliditySha3(keyManager.address, { t: 'bytes', v: executeRelayedCallPayload }, nonce),
                DUMMY_PRIVATEKEY
            ).signature

            let result = await keyManager.executeRelayedCall.call(
                executeRelayedCallPayload,
                keyManager.address,
                nonce,
                signature
            )
            assert.isTrue(result, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract")

            await truffleAssert.passes(
                keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature),
                "Should not have reverted"
            )

            let endResult = await targetContract.getName.call()

            assert.equal(endResult, newName, "Name on TargetContract has not changed")
        })

        it("Should not allow to `setNumber` via `executeRelay`", async () => {

            let currentNumber = await targetContract.getNumber.call()

            let targetContractPayload = targetContract.contract.methods.setNumber(2354).encodeABI()    
            let nonce = await keyManager.getNonce.call(externalApp.address)
    
            let executeRelayedCallPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                targetContractPayload
            ).encodeABI()

            let signature = web3.eth.accounts.wallet[externalApp].sign(
                web3.utils.soliditySha3(keyManager.address, { t: 'bytes', v: executeRelayedCallPayload }, nonce)
            ).signature

            await truffleAssert.fails(
                keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature),
                "KeyManager:_checkPermissions: Not authorised to run this function"
            )

            let endResult = await targetContract.getNumber.call()
            assert.equal(endResult.toString(), currentNumber.toString(), "Number on TargetContract should have not changed")
        })
        
    })

    context("> testing Security", async () => {

        it("Should revert because caller has no permissions set", async () => {
            let targetContractPayload = targetContract.contract.methods.setName("Another name").encodeABI()
            let executePayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                targetContract.address,
                0,
                targetContractPayload
            ).encodeABI()

            await truffleAssert.fails(
                keyManager.execute(executePayload, { from: accounts[3] }),
                "KeyManager:_getUserPermissions: no permissions set for this user / caller"
            )
        })

        it('Permissions should prevent ReEntrancy and prevent contract from re-calling and re-transfering ETH.', async () => {
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

        it("Replay Attack should fail because of invalid nonce", async () => {
            
            let nonce = await keyManager.getNonce.call(newUser)

            let executeRelayedCallPayload = erc725Account.contract.methods.execute(
                OPERATION_CALL,
                maliciousContract.address,
                ONE_ETH,
                DUMMY_PAYLOAD
            ).encodeABI()

            let signature = web3.eth.accounts.wallet[newUser].sign(
                web3.utils.soliditySha3(keyManager.address, { t: 'bytes', v: executeRelayedCallPayload }, nonce)
            ).signature

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
                "KeyManager:executeRelayedCall: Incorrect nonce"
            )
        })
    })

})