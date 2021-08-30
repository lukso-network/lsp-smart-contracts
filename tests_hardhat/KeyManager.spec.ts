
// const truffleAssert = require('truffle-assertions');
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert } from "chai";
import * as test from "hardhat";

import {
    ERC725Account, ERC725Account__factory,
    KeyManager, KeyManager__factory,
    TargetContract, TargetContract__factory,
    Reentrancy, Reentrancy__factory
} from "../build/types";

import { expectRevert } from "@openzeppelin/test-helpers";
import { Signer } from "ethers";

// const KeyManagerHelper = artifacts.require("KeyManagerHelper");

// permission keys
const KEY_PERMISSIONS = '0x4b80742d0000000082ac0000';      // AddressPermissions:Permissions:<address> --> bytes1
const KEY_ALLOWEDADDRESSES = '0x4b80742d00000000c6dd0000'; // AddressPermissions:AllowedAddresses:<address> --> address[]
const KEY_ALLOWEDFUNCTIONS = '0x4b80742d000000008efe0000';

// Permissions
const ALL_PERMISSIONS          = ethers.BigNumber.from(0xff).toNumber()
const PERMISSION_SETDATA       = ethers.BigNumber.from(0x04).toNumber();   // 0000 0100
const PERMISSION_CALL          = ethers.BigNumber.from(0x08).toNumber();   // 0000 1000
const PERMISSION_TRANSFERVALUE = ethers.BigNumber.from(0x40).toNumber();   // 0100 0000

// Operations
const OPERATION_CALL         = 0
const OPERATION_DELEGATECALL = 1
const OPERATION_DEPLOY       = 2

// Other
const EMPTY_PAYLOAD = "0x"
const DUMMY_PAYLOAD = "0xaabbccdd123456780000000000"
const ONE_ETH = ethers.utils.parseEther("1");

let allowedAddresses = [
    "0xcafecafecafecafecafecafecafecafecafecafe",
    "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd"
];

// let allowedFunctions = [
//     "0xaabbccdd",   // placeholder
//     web3.eth.abi.encodeFunctionSignature('setName(string)'),
//     web3.eth.abi.encodeFunctionSignature('setNumber(uint256)')
// ]

describe("KeyManager", () => {
    let abiCoder;
    let accounts: SignerWithAddress[] = [];

    let erc725Account: ERC725Account, 
        keyManager: KeyManager,
        targetContract: TargetContract,
        maliciousContract: Reentrancy;

    let owner: SignerWithAddress,
        app: SignerWithAddress,
        user: SignerWithAddress,
        externalApp: SignerWithAddress,
        newUser: SignerWithAddress;

    beforeAll(async () => {
        abiCoder = await ethers.utils.defaultAbiCoder;
        accounts = await ethers.getSigners();

        owner = accounts[0];
        app = accounts[1];
        user = accounts[2];
        externalApp = accounts[3];
        user = accounts[4];
        newUser = accounts[5];

        erc725Account = await new ERC725Account__factory(owner).deploy(owner.address);
        keyManager = await new KeyManager__factory(owner).deploy(erc725Account.address);
        targetContract = await new TargetContract__factory(owner).deploy();
        maliciousContract = await new Reentrancy__factory(accounts[6]).deploy(keyManager.address);
        // owner permissions
        await erc725Account.setData(KEY_PERMISSIONS + owner.address.substr(2), ALL_PERMISSIONS, { from: owner.address });

        // app permissions
        let appPermissions = ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL);
        await erc725Account.setData(KEY_PERMISSIONS + app.address.substr(2), appPermissions, { from: owner.address });
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + app.address.substr(2), 
            abiCoder.encode(['address[]'], [[targetContract.address, user.address]])
        );
        await erc725Account.setData( // do not allow the app to `setNumber` on TargetContract
            KEY_ALLOWEDFUNCTIONS + app.address.substr(2),
            abiCoder.encode(['bytes4[]'], [[targetContract.interface.getSighash('setName(string)')]])
        );

        // user permissions
        let userPermissions = ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + user.address.substr(2), userPermissions, { from: owner.address })  
        
        // externalApp permissions
        let externalAppPermissions = ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL)
        await erc725Account.setData(KEY_PERMISSIONS + externalApp.address.substr(2), externalAppPermissions, { from: owner.address })
        await erc725Account.setData(
            KEY_ALLOWEDADDRESSES + externalApp.address.substr(2), 
            abiCoder.encode(['address[]'], [[targetContract.address, user.address]])
        );
        await erc725Account.setData( // do not allow the externalApp to `setNumber` on TargetContract
            KEY_ALLOWEDFUNCTIONS + externalApp.address.substr(2),
            abiCoder.encode(['bytes4[]'], [[targetContract.interface.getSighash('setName(string)')]])
        );

        // workaround to test security
        await erc725Account.setData(
            KEY_PERMISSIONS + newUser.address.substr(2), 
            ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL + PERMISSION_TRANSFERVALUE)
        );

        // switch account management to KeyManager
        await erc725Account.transferOwnership(keyManager.address, { from: owner.address });
    });

    beforeEach(async () => {
        erc725Account.connect(owner.address);
        keyManager.connect(owner.address);

        await targetContract.setName("Simple Contract Name");
        await targetContract.setNumber(5);
    })

    // ensures owner is still erc725Account\'s admin (=all permissions)
    it("ensures owner is still erc725Account\'s admin (=all permissions)", async () => {
        let permissions = await erc725Account.getData(KEY_PERMISSIONS + owner.address.substr(2))
        assert.equal(permissions, "0xff", "Owner should have all permissions set");
    })

    describe("> testing permissions: CHANGEKEYS, SETDATA", () => {

        it("Owner should be allowed to change keys", async () => {
            let key = KEY_PERMISSIONS + app.address.substr(2)

            let payload = erc725Account.interface.encodeFunctionData(
                "setData", 
                [key, PERMISSION_SETDATA]
            );

            let result = await keyManager.callStatic.execute(payload, { from: owner.address })
            assert.isTrue(result)

            await keyManager.execute(payload, { from: owner.address });
            let fetchedResult = await erc725Account.callStatic.getData(key);
            assert.equal(fetchedResult, PERMISSION_SETDATA);
        });

        it("App should not be allowed to change keys", async () => {
            // malicious app trying to set all permissions
            let dangerousPayload = erc725Account.interface.encodeFunctionData(
                "setData",
                [KEY_PERMISSIONS + app.address.substr(2), ALL_PERMISSIONS]
            )

            await expectRevert.unspecified(
                keyManager.connect(app.address).execute(dangerousPayload)
                // "KeyManager:_checkPermissions: Not authorized to change keys"
            );
        })

        it("Owner should be allowed to setData", async () => {
            let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP3Profile"));
            let value = ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes("https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg")
            );
            
            let payload = erc725Account.interface.encodeFunctionData(
                "setData",
                [key, value]
            );
        
            let callResult = await keyManager.callStatic.execute(payload, { from: owner.address });
            assert.isTrue(callResult);

            await keyManager.execute(payload, { from: owner.address });
            let fetchedResult = await erc725Account.callStatic.getData(key);
            assert.equal(fetchedResult, value);
        });

        it("App should be allowed to setData", async () => {
            let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP3Profile"));
            let value = ethers.utils.hexlify(
                ethers.utils.toUtf8Bytes("https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg")
            );
            
            let payload = erc725Account.interface.encodeFunctionData(
                "setData",
                [key, value]
            );

            keyManager.connect(app.address)
            let callResult = await keyManager.callStatic.execute(payload);
            assert.isTrue(callResult);

            await keyManager.execute(payload);
            let fetchedResult = await erc725Account.callStatic.getData(key);
            assert.equal(fetchedResult, value);
        
        });

    });

    describe("> testing permissions: CALL, DELEGATECALL, DEPLOY", () => {

        it("Owner should be allowed to make a CALL", async () => {
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute", 
                [OPERATION_CALL, "0xcafecafecafecafecafecafecafecafecafecafe", 0, DUMMY_PAYLOAD]
            );
            
            let result = await keyManager.callStatic.execute(executePayload, { from: owner.address })
            assert.isTrue(result);
        });
    
        it("App should be allowed to make a CALL", async () => {
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, targetContract.interface.encodeFunctionData("setName", ["Example"])]
            )
    
            keyManager.connect(app.address);
            let executeResult = await keyManager.callStatic.execute(executePayload);
            assert.isTrue(executeResult);
        });
    
        it("App should not be allowed to make a DELEGATECALL", async () => {
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_DELEGATECALL, "0xcafecafecafecafecafecafecafecafecafecafe", 0, DUMMY_PAYLOAD]
            );
    
            await expectRevert.unspecified(
                keyManager.connect(app.address).execute(executePayload)
                // "KeyManager:_checkPermissions: not authorized to perform DELEGATECALL"
            );
        });
    
        it("App should not be allowed to DEPLOY a contract", async () => {
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_DEPLOY, "0x0000000000000000000000000000000000000000", 0, DUMMY_PAYLOAD]
            );
    
            await expectRevert.unspecified(
                keyManager.connect(app.address).execute(executePayload),
                // "KeyManager:_checkPermissions: not authorized to perform DEPLOY"
            );  
        });

    });
    
    describe("> testing permission: TRANSFERVALUE", () => {

        /** @debug fix error with provider to get balances */
        xit("Owner should be allowed to transfer ethers to app", async () => {        
            // let initialAccountBalance = await provider.getBalance(erc725Account.address);
            // let initialAppBalance = await provider.getBalance(app.address);
    
            // let transferPayload = erc725Account.interface.encodeFunctionData(
            //     "execute",
            //     [OPERATION_CALL, app.address, ethers.utils.parseEther("3"), EMPTY_PAYLOAD]
            // );
    
            // let callResult = await keyManager.callStatic.execute(transferPayload, { from: owner.address });
            // assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract");
    
            // await keyManager.execute(transferPayload);
    
            // let newAccountBalance = await provider.getBalance(erc725Account.address);
            // assert.isBelow(parseInt(newAccountBalance), parseInt(initialAccountBalance), "ERC725 Account's balance should have decreased");
            
            // let newAppBalance = await provider.getBalance(app.address);
            // assert.isAbove(parseInt(newAppBalance), parseInt(initialAppBalance), "ERC725 Account's balance should have decreased");
        });
    
        /** @debug fix error with provider to get balances */
        xit("App should not be allowed to transfer ethers", async () => {
    
            // let initialAccountBalance = await web3.eth.getBalance(erc725Account.address)
            // let initialUserBalance = await web3.eth.getBalance(user)
    
            // let transferPayload = erc725Account.contract.methods.execute(
            //     OPERATION_CALL,
            //     user,
            //     web3.utils.toWei("3", "ether"),
            //     EMPTY_PAYLOAD
            // ).encodeABI()
    
            // await truffleAssert.fails(
            //     keyManager.execute(transferPayload, { from: app }),
            //     // truffleAssert.ErrorType.REVERT,
            //     "KeyManager:_checkPermissions: Not authorized to transfer ethers"
            // )
    
            // let newAccountBalance = await web3.eth.getBalance(erc725Account.address)
            // let newUserBalance = await web3.eth.getBalance(user)
    
            // assert.equal(initialAccountBalance, newAccountBalance, "ERC725 Account's balance should have remained the same")
            // assert.equal(initialUserBalance, newUserBalance, "User's balance should have remained the same")
        })

    });

    describe("> testing permissions: ALLOWEDADDRESSES", () => {

        it("All addresses whitelisted = Owner should be allowed to interact with any address", async () => { 
            let payload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, "0xcafecafecafecafecafecafecafecafecafecafe", 0, DUMMY_PAYLOAD]
            );

            let result = await keyManager.callStatic.execute(payload);
            assert.isTrue(result);

            let secondPayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd", 0, DUMMY_PAYLOAD]
            );

            let secondResult = await keyManager.callStatic.execute(secondPayload);
            assert.isTrue(secondResult);
        });
       
        it("App should be allowed to interact with `TargetContract`", async () => { 
            let payload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, EMPTY_PAYLOAD],
            );

            keyManager.connect(app.address);
            let result = await keyManager.callStatic.execute(payload);
            assert.isTrue(result);
        });
       
        it("App should be allowed to interact with `user`", async () => { 
            let payload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, user.address, 0, EMPTY_PAYLOAD]
            );

            keyManager.connect(app.address);
            let result = await keyManager.callStatic.execute(payload);
            assert.isTrue(result);
        });
       
        it("App should not be allowed to interact with `0xdeadbeef...` (not allowed address)", async () => { 
            let payload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef", 0, DUMMY_PAYLOAD]
            );
            
            await expectRevert.unspecified(
                keyManager.connect(app.address).execute(payload),
                // "KeyManager:_checkPermissions: not authorized to perform DEPLOY"
            );  
        });
    });
    
    describe("> testing permissions: ALLOWEDFUNCTIONS", () => {

        it("App should not be allowed to run a non-allowed function (function signature = `0xbeefbeef`)", async () => {
            let payload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, "0xbeefbeef123456780000000000"]
            )
    
            await expectRevert.unspecified(
                keyManager.connect(app.address).execute(payload)
                // "KeyManager:_checkPermissions: Not authorised to run this function"
            );
        });

    });

    describe("> testing: ALL ADDRESSES + FUNCTIONS whitelisted", () => {

        it("Should pass if no addresses / functions are stored for a user", async () => {     
            let randomPayload = "0xfafbfcfd1201456875dd";
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, "0xcafecafecafecafecafecafecafecafecafecafe", 0, randomPayload]
            );

            keyManager.connect(user.address);
            let callResult = await keyManager.callStatic.execute(executePayload);
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > RandomAddress");
        });
    });

    describe("> testing external contract's state change", () => {

        it("Owner should be allowed to set `name` variable in simple contract", async () => {        
            let initialName = await targetContract.callStatic.getName();
            let newName = "Updated Name";
    
            let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [newName]);
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, targetContractPayload]
            );
    
            let callResult = await keyManager.callStatic.execute(executePayload);
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract");
    
            await keyManager.execute(executePayload);
            let result = await targetContract.callStatic.getName();
            assert.notEqual(result, initialName, "name variable in TargetContract should have changed");
            assert.equal(result, newName, `name variable in TargetContract should now be ${newName}`);
        })
    
        it("App should be allowed to set `name` variable in TargetContract", async () => {
            let initialName = await targetContract.callStatic.getName();
            let newName = "Updated Name";
    
            let targetContractPayload = targetContract.interface.encodeFunctionData(
                "setName",
                [newName]
            );
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, targetContractPayload]
            );
    
            let callResult = await keyManager.callStatic.execute(executePayload);
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract");
    
            await keyManager.execute(executePayload);
            let result = await targetContract.callStatic.getName();
            assert.notEqual(result, initialName, "name variable in TargetContract should have changed");
            assert.equal(result, newName, `name variable in TargetContract should now be ${newName}`);
        })
    
        it("Owner should be allowed to set `number` variable from TargetContract", async () => {
            let initialNumber = await targetContract.callStatic.getNumber();
            let newNumber = 18;
    
            let targetContractPayload = targetContract.interface.encodeFunctionData("setNumber", [newNumber]);
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, targetContractPayload]
            );
    
            let callResult = await keyManager.callStatic.execute(executePayload);
            assert.isTrue(callResult, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract");

            await keyManager.execute(executePayload)
            let result = await targetContract.callStatic.getNumber()
            assert.notEqual(
                parseInt(ethers.BigNumber.from(result).toNumber(), 10), 
                ethers.BigNumber.from(initialNumber).toNumber(), 
                "number variable in TargetContract should have changed"
            );
            assert.equal(
                parseInt(ethers.BigNumber.from(result).toNumber(), 10), 
                newNumber, 
                `name variable in TargetContract should now be ${newNumber}`
            );
        })
    
        it("App should not be allowed to set `number` variable in simple contract", async () => {
            let initialNumber = await targetContract.callStatic.getNumber();
            let newNumber = 18;
    
            let targetContractPayload = targetContract.interface.encodeFunctionData(
                "setNumber",
                [newNumber]
            );
            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, targetContractPayload]
            );
    
            await expectRevert.unspecified(
                keyManager.connect(app.address).execute(executePayload),
            );
    
            let result = await targetContract.callStatic.getNumber();
            assert.notEqual(
                parseInt(ethers.BigNumber.from(result).toNumber(), 10),
                newNumber,
                "number variable in TargetContract should not have changed"
            );
            assert.equal(
                parseInt(ethers.BigNumber.from(result).toNumber(), 10),
                ethers.BigNumber.from(initialNumber).toNumber(),
                "number variable in TargetContract should have remained the same"
            );
        })

    });

    describe("> testing other revert causes", () => {

        it("Should revert because of wrong operation type", async () => {
            let payload = erc725Account.interface.encodeFunctionData(
                "execute",
                [5648941657, targetContract.address, 0, "0x"]
            );
            

            await expectRevert.unspecified(
                keyManager.execute(payload)
                // "KeyManager:_checkPermissions: Invalid operation type"
            );
        });

        it("Should revert because calling an unexisting function in ERC725", async () => {
            await expectRevert.unspecified(
                keyManager.execute("0xbad000000000000000000000000bad")
                // "KeyManager:_checkPermissions: unknown function selector from ERC725 account"
            );
        });

    });

    
    describe("> testing `executeRelay(...)`", () => {
            
        /** @debug concatenate the hex in the message for the signature correctly */
        xit("should execute a signed tx successfully", async () => {

            let targetContractPayload = targetContract.interface.encodeFunctionData(
                "setName",
                ["Another name"]
            )
            let nonce = await keyManager.callStatic.getNonce(externalApp.address)
    
            let executeRelayedCallPayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, targetContractPayload]
            );

            let signature = await externalApp.signMessage(
                ethers.utils.keccak256(
                    ethers.utils.hexConcat([keyManager.address, executeRelayedCallPayload, nonce])
                )
            );

            let result = await keyManager.callStatic.executeRelayedCall(
                executeRelayedCallPayload,
                keyManager.address,
                nonce,
                signature
            );
            assert.isTrue(result, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract");

        });

        /** @debug concatenate the hex in the message for the signature correctly */
        xit("Should allow to `setName` via `executeRelay`", async () => {

            let newName = "Dagobah";

            let targetContractPayload = targetContract.interface.encodeFunctionData(
                "setName",
                [newName]
            );  
            let nonce = await keyManager.callStatic.getNonce(externalApp.address);
    
            let executeRelayedCallPayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, targetContractPayload]
            );

            let signature = await externalApp.signMessage(
                ethers.utils.keccak256(keyManager.address, { t: 'bytes', v: executeRelayedCallPayload }, nonce)
            );

            let result = await keyManager.callStatic.executeRelayedCall(
                executeRelayedCallPayload,
                keyManager.address,
                nonce,
                signature
            );
            assert.isTrue(result, "Low Level Call failed (=returned `false`) for: KeyManager > ERC725Account > TargetContract")

            await keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature);
            let endResult = await targetContract.callStatic.getName();
            assert.equal(endResult, newName, "Name on TargetContract has not changed");
        });

        it("Should not allow to `setNumber` via `executeRelay`", async () => {

            let currentNumber = await targetContract.callStatic.getNumber();

            let targetContractPayload = targetContract.interface.encodeFunctionData(
                "setNumber",
                [2354]
            );    
            let nonce = await keyManager.callStatic.getNonce(externalApp.address)
    
            let executeRelayedCallPayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [
                    OPERATION_CALL,
                    targetContract.address,
                    0,
                    targetContractPayload
                ]
            );

            let signature = await externalApp.signMessage(
                ethers.utils.keccak256(keyManager.address, { t: 'bytes', v: executeRelayedCallPayload }, nonce)
            );

            await expectRevert.unspecified(
                keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature)
                // "KeyManager:_checkPermissions: Not authorised to run this function"
            );``

            let endResult = await targetContract.callStatic.getNumber();
            assert.equal(endResult.toString(), currentNumber.toString(), "Number on TargetContract should have not changed");
        })
        
    });

    describe("> testing Security", () => {

        it("Should revert because caller has no permissions set", async () => {
            let targetContractPayload = targetContract.interface.encodeFunctionData(
                "setName",
                ["New Contract Name"]
            );

            let executePayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, targetContract.address, 0, targetContractPayload]
            );

            await expectRevert.unspecified(
                keyManager.connect(accounts[6].address).execute(executePayload)
                // "KeyManager:_getUserPermissions: no permissions set for this user / caller"
            );
        })

        /** @debug find way to get accounts balances */
        xit('Permissions should prevent ReEntrancy and stop contract from re-calling and re-transfering ETH.', async () => {
            // we assume the owner is not aware that some malicious code is present at the recipient address (the recipient being a smart contract)
            // the owner simply aims to transfer 1 ether from his ERC725 Account to the recipient address (= the malicious contract)
            let transferPayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, maliciousContract.address, ONE_ETH, EMPTY_PAYLOAD]
            );

            let executePayload = keyManager.interface.encodeFunctionData("execute", transferPayload);
            // load the malicious payload, that will be executed in the fallback function (every time the contract receives ethers)
            await maliciousContract.loadPayload(executePayload);

            // let initialAccountBalance = await web3.eth.getBalance(erc725Account.address)
            // let initialAttackerBalance = await web3.eth.getBalance(maliciousContract.address)
            // console.log("ERC725's initial account balance: ", initialAccountBalance)
            // console.log("Attacker's initial balance: ", initialAttackerBalance)

            // // try to drain funds via ReEntrancy
            // await keyManager.execute(transferPayload, { from: owner })

            // let newAccountBalance = await web3.eth.getBalance(erc725Account.address)
            // let newAttackerBalance = await web3.eth.getBalance(maliciousContract.address)
            // console.log("ERC725 account balance: ", newAccountBalance)
            // console.log("Attacker balance: ", newAttackerBalance)

            // assert.equal(newAccountBalance, initialAccountBalance - ONE_ETH, "ERC725's account sent more than one ETH!")
            // assert.equal(newAttackerBalance, ONE_ETH, "Attacker's account received more than one ETH!")
        });

        /** @debug no permission set for this user */
        xit("Replay Attack should fail because of invalid nonce", async () => {
            
            let nonce = await keyManager.callStatic.getNonce(newUser.address);

            let executeRelayedCallPayload = erc725Account.interface.encodeFunctionData(
                "execute",
                [OPERATION_CALL, maliciousContract.address, ONE_ETH, DUMMY_PAYLOAD]
            );

            let signature = await newUser.signMessage(
                ethers.utils.keccak256(keyManager.address, { t: 'bytes', v: executeRelayedCallPayload }, nonce)
            )

            // first call
            let result = await keyManager.callStatic.executeRelayedCall(
                executeRelayedCallPayload,
                keyManager.address,
                nonce,
                signature
            );
            assert.isTrue(result, "Low Level Call failed (=returned `false`) for: KeyManager:_checkPermissionsRelay > ERC725Account")
            
            await keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature);

            // 2nd call = replay attack
            await expectRevert.unspecified(
                keyManager.executeRelayedCall(executeRelayedCallPayload, keyManager.address, nonce, signature)
                // "KeyManager:executeRelayedCall: Incorrect nonce"
            );
        });

    });

});