const { assert, expect } = require("chai");
const { web3 } = require("openzeppelin-test-helpers/src/setup");
const { BN, ether } = require("@openzeppelin/test-helpers");
const truffleAssert = require('truffle-assertions');
const { calculateCreate2 } = require('eth-create2-calculator')

const LSP3Account = artifacts.require("LSP3Account");
const LSP3AccountInit = artifacts.require("LSP3AccountInit");
// const UniversalReceiver = artifacts.require("BasicUniversalReceiver")
// const KeyManager = artifacts.require("KeyManager");

/**
 * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
 *                      10 x hex Opcodes to copy runtime code 
 *                           into memory and return it
 *                             |                  |
 *///                          V                  V
const runtimeCodeTemplate = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3"

// Interfaces IDs
const ERC165_INTERFACE_ID = "0x01ffc9a7"
const ERC725X_INTERFACE_ID = "0x44c028fe"
const ERC725Y_INTERFACE_ID = "0x2bd57b73"
const ERC1271_INTERFACE_ID = "0x1626ba7e"
const LSP1_INTERFACE_ID = "0x6bb56a14"

// From LSP3Account.test.js
const ERC1271_MAGIC_VALUE = '0x1626ba7e';
const ERC1271_FAIL_VALUE = '0xffffffff';
const DUMMY_PRIVATEKEY = '0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe';
const DUMMY_SIGNER = web3.eth.accounts.wallet.add(DUMMY_PRIVATEKEY);

async function deployLSP3Proxy(_lsp3AccountInitArtifact, _lsp3AccountInitAddress, _deployer) {
    // give +3% more gas to ensure it deploys
    let deploymentCost = parseInt(await _lsp3AccountInitArtifact.new.estimateGas() * 1.03)
    let proxyRuntimeCode = runtimeCodeTemplate.replace(
        "bebebebebebebebebebebebebebebebebebebebe", 
        _lsp3AccountInitAddress.substr(2)
    )

    let transaction = await web3.eth.sendTransaction({ 
        from: _deployer, 
        data: proxyRuntimeCode, 
        gas: deploymentCost 
    })

    let proxyContract = await _lsp3AccountInitArtifact.at(transaction.contractAddress)
    return proxyContract
}

contract("LSP3Account via EIP1167 Proxy + initializer (using Truffle)", async (accounts) => {
    
    let lsp3Account,
        proxy

    const owner = accounts[0]

    before(async() => {
        lsp3Account = await LSP3AccountInit.new()
        proxy = await deployLSP3Proxy(LSP3AccountInit, lsp3Account.address, owner)
        // fund with some money for testing `execute`
        await web3.eth.sendTransaction({ from: owner, to: DUMMY_SIGNER.address, value: web3.utils.toWei("10", "ether") })
    })

    it("Should replace `bebebebebebe...` with LSP3Account address", async () => {
        let result = runtimeCodeTemplate.replace(
            "bebebebebebebebebebebebebebebebebebebebe",
            lsp3Account.address
        )

        assert.equal(
            result,
            "0x3d602d80600a3d3981f3363d3d373d3d3d363d73" + lsp3Account.address + "5af43d82803e903d91602b57fd5bf3"
        )
    })

    context("> Accounts Deployment", async () => {
        
        // test that it cost less gas to deploy via proxy than the whole contract
        it("Should be cheaper to deploy via proxy", async () => {
            // Deploying whole LSP3 Account (not using `initialize` function)
            let lsp3DeploymentCost = await LSP3Account.new.estimateGas(owner)
        
            // Deploying via Proxy
            let newLSP3AccountInit = await LSP3AccountInit.new() // 1) deploy logic contract
            
            let proxyRuntimeCode = runtimeCodeTemplate.replace( // 2) setup proxy contract code + deploy
                "bebebebebebebebebebebebebebebebebebebebe", 
                newLSP3AccountInit.address.substr(2)
            )
            let transaction = await web3.eth.sendTransaction({ from: owner, data: proxyRuntimeCode })
            let proxy = await LSP3AccountInit.at(transaction.contractAddress)
            
            let proxyDeploymentCost = transaction.gasUsed
            let initializeGasCost = await proxy.initialize.estimateGas(owner) // 3) initialize contract (alternative to constructors)
            let totalProxyCost = proxyDeploymentCost + initializeGasCost

            assert.isBelow(totalProxyCost, lsp3DeploymentCost, "Deploying via proxy not cheaper in gas")

            console.log("LSP3Account deployment cost: ", lsp3DeploymentCost, "\n")

            console.log("proxy deployment cost: ", proxyDeploymentCost)
            console.log("initialize gas cost: ", initializeGasCost)
            console.log("--------------------------------------------------")
            console.log("total: ", totalProxyCost)
            console.log("\n > Gas saved = ", lsp3DeploymentCost - totalProxyCost, "(", parseInt(((totalProxyCost * 100) / lsp3DeploymentCost) - 100), "%)")
            console.log("\n NB: logic contract `LSP3AccountInit` deployment cost: ", await LSP3AccountInit.new.estimateGas(), " (only once)")
            
        })

        it("Should call the `initialize(...)` function and return the right owner", async () => {
            let currentOwner = await proxy.owner.call()
            // `initialize` function as constructor
            await proxy.initialize(owner)
            let newOwner = await proxy.owner.call()
            assert.notEqual(newOwner, currentOwner, "Contract owner has not changed")
            assert.equal(newOwner, owner, "Contract owner should be `accounts[0]`")
        })

        it("Should not allow to initialize twice", async () => {
            await truffleAssert.fails(
                proxy.initialize("0xcafecafecafecafecafecafecafecafecafecafe"),
                "Initializable: contract is already initialized"
            )
        })

    })

    context("> ERC165 (supported standards)", async () => {
        it("Should support ERC165", async () => {
            let result = await proxy.supportsInterface.call(ERC165_INTERFACE_ID)
            assert.isTrue(result, "does not support interface `ERC165`")
        })

        it("Should support ERC725X", async () => {
            let result = await proxy.supportsInterface.call(ERC725X_INTERFACE_ID)
            assert.isTrue(result, "does not support interface `ERC725X`")    
        })

        it("Should support ERC725Y", async () => {
            let result = await proxy.supportsInterface.call(ERC725Y_INTERFACE_ID)
            assert.isTrue(result, "does not support interface `ERC725Y`")    
        })

        it("Should support ERC1271", async () => {
            let result = await proxy.supportsInterface.call(ERC1271_INTERFACE_ID)
            assert.isTrue(result, "does not support interface `ERC1271`")    
        })

        xit("Should support LSP1", async () => {
            let result = await proxy.supportsInterface.call(LSP1_INTERFACE_ID)
            assert.isTrue(result, "does not support interface `LSP1`")    
        })
    })

    context("> ERC1271 (signatures)", async () => {

        it("Can verify signature from owner", async () => {
            const proxy = await deployLSP3Proxy(LSP3AccountInit, lsp3Account.address, DUMMY_SIGNER.address)
            await proxy.initialize(DUMMY_SIGNER.address)
            const dataToSign = '0xcafecafe';
            const signature = DUMMY_SIGNER.sign(dataToSign)

            const result = await proxy.isValidSignature.call(signature.messageHash, signature.signature)
            assert.equal(result, ERC1271_MAGIC_VALUE, "Should define the signature as valid")
        })

        it("Should fail when verifying signature from not-owner", async () => {
            const proxy = await deployLSP3Proxy(LSP3AccountInit, lsp3Account.address, owner)
            await proxy.initialize(owner)
            const dataToSign = '0xcafecafe'
            const signature = DUMMY_SIGNER.sign(dataToSign)

            const result = await proxy.isValidSignature.call(signature.messageHash, signature.signature)
            assert.equal(result, ERC1271_FAIL_VALUE, "Should define the signature as invalid")
        })
    })

    context("> Testing storage", async () => {
        
        let count = 1000000000;

        it("Should `setData` in Key-Value store via proxy (item 1)", async () => {
            let key = "0xcafe"
            let value = "0xbeef"

            let initialValue = await proxy.getData(key)
            assert.isNull(initialValue, "there should be no value initially set for key '0xcafe'")

            await proxy.setData(key, value)

            let result = await proxy.getData(key)
            assert.equal(result, value, "not the same value in storage for key '0xcafe'")
        })
        
        it("Store 32 bytes item 2", async () => {
            let key = web3.utils.numberToHex(count++)
            let value = web3.utils.numberToHex(count++)
            await proxy.setData(key, value, { from: owner })

            assert.equal(await proxy.getData(key), value)
        })

        it("Store 32 bytes item 3", async () => {
            let key = web3.utils.numberToHex(count++)
            let value = web3.utils.numberToHex(count++)
            await proxy.setData(key, value, { from: owner })

            assert.equal(await proxy.getData(key), value)
        })

        it("Store 32 bytes item 4", async () => {
            let key = web3.utils.numberToHex(count++)
            let value = web3.utils.numberToHex(count++)
            await proxy.setData(key, value, { from: owner })

            assert.equal(await proxy.getData(key), value)
        })

        it("Store 32 bytes item 5", async () => {
            let key = web3.utils.numberToHex(count++)
            let value = web3.utils.numberToHex(count++)
            await proxy.setData(key, value, { from: owner })

            assert.equal(await proxy.getData(key), value)
        })

        it("Store a long URL as bytes item 6", async () => {
            let url = 'https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD'
            let key = web3.utils.numberToHex(count++)
            let value = web3.utils.utf8ToHex(url)
            await proxy.setData(key, value, { from: owner })

            assert.equal(await proxy.getData(key), value)
        })

        it("Store 32 bytes item 7", async () => {
            let key = web3.utils.numberToHex(count)
            let value = web3.utils.numberToHex(count)
            await proxy.setData(key, value, { from: owner })

            assert.equal(await proxy.getData(key), value)
        })

        it("dataCount should be 8", async () => {
            // 8 because the ERC725Type is already set by the ERC725Account implementation
            assert.equal(await proxy.dataCount(), 8);
        })

        it("Update 32 bytes item 7", async () => {
            let key = web3.utils.numberToHex(count)
            let value = web3.utils.numberToHex(count)
            await proxy.setData(key, value, { from: owner })

            assert.equal(await proxy.getData(key), value)
        })

        it("dataCount should remain 8 (after updating item 7)", async () => {
            assert.equal(await proxy.dataCount(), 8)

            let keys = await proxy.allDataKeys()
            assert.equal(keys.length, 8)

            // console.log('Stored keys', keys)
        })

        it("Store multiple 32 bytes item 9-11", async () => {
            let keys = [];
            let values = [];
            // increase
            count++
            for (let i = 9; i <= 11; i++) {
                keys.push(web3.utils.numberToHex(count++))
                values.push(web3.utils.numberToHex(count + 1000))
            }
            await proxy.setDataMultiple(keys, values, { from: owner })
            // console.log(await proxy.getDataMultiple(keys))
            assert.deepEqual(await proxy.getDataMultiple(keys), values)
        })

        it("dataCount should be 11", async () => {
            assert.equal(await proxy.dataCount(), 11)

            let keys = await proxy.allDataKeys()
            assert.equal(keys.length, 11)

            // console.log('Stored keys', keys)
        })


    })

    context("> Interactions with Accounts contracts", async () => {
        const newOwner = accounts[1]
        let LSP3Proxy

        beforeEach(async () => {
            LSP3Proxy = await deployLSP3Proxy(LSP3AccountInit, lsp3Account.address, owner)
            await LSP3Proxy.initialize(owner)
        })

        it("Upgrade ownership correctly", async () => {
            await LSP3Proxy.transferOwnership(newOwner, { from: owner })
            const lsp3ProxyOwner = await LSP3Proxy.owner.call()
            assert.equal(lsp3ProxyOwner, newOwner, "Address should match")
        })

        it("Refuse upgrades from non-onwer", async () => {
            await truffleAssert.reverts(
                LSP3Proxy.transferOwnership(newOwner, { from: newOwner, gas: 100000 }),
            )
        })

        it("Owner can set data", async () => {
            const key = web3.utils.asciiToHex("Important Data");
            const value = web3.utils.asciiToHex("Important Data");

            await LSP3Proxy.setData(key, value, { from: owner })

            let fetchedValue = await LSP3Proxy.getData.call(key)
            assert.equal(fetchedValue, value);
        })

        it("Fails when non-owner sets data", async () => {
            const key = web3.utils.asciiToHex("Important Data");
            const value = web3.utils.asciiToHex("Important Data");

            await truffleAssert.reverts(
                LSP3Proxy.setData(key, value, { from: newOwner })
            )
        })

        it("Fails when non-owner sets data multiple", async () => {
            const key = web3.utils.asciiToHex("Important Data");
            const value = web3.utils.asciiToHex("Important Data");

            await truffleAssert.reverts(
                LSP3Proxy.setDataMultiple([key], [value], { from: newOwner })
            )
        })

        it("Allows owner to execute calls", async () => {
            const recipient = accounts[6];
            const amount = ether("3");
            const OPERATION_CALL = 0x0;

            await web3.eth.sendTransaction({ from: owner, to: LSP3Proxy.address, value: amount })
            
            const recipientBalanceBefore = await web3.eth.getBalance(recipient);
            await LSP3Proxy.execute(OPERATION_CALL, recipient, amount, "0x0", { from: owner })
            const recipientBalanceAfter = await web3.eth.getBalance(recipient);

            assert.isTrue(
                new BN(recipientBalanceBefore).add(amount)
                    .eq(new BN(recipientBalanceAfter))
            )
        })

        it("Fails with non-owner executing", async () => {
            const recipient = accounts[6];
            const amount = ether("3");
            const OPERATION_CALL = 0x0;

            await web3.eth.sendTransaction({ from: owner, to: LSP3Proxy.address, value: amount })
            
            await truffleAssert.reverts(
                LSP3Proxy.execute(OPERATION_CALL, recipient, amount, "0x0", { from: newOwner })
            )
        })

        it("Allows owner to execute create", async () => {
            const OPERATION_CREATE2 = 0x2
            const bytecode = "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6"
            const salt = "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe"
            
            const expectedAddress = calculateCreate2(LSP3Proxy.address, salt, bytecode)

            // deploy with added 32 byte salt
            let receipt = await LSP3Proxy.execute(
                OPERATION_CREATE2,
                '0x0000000000000000000000000000000000000000', // zero address
                '0', // value
                bytecode + salt.substr(2), // contract bytecode + 32 bytes salt
                { from: owner }
            )

            assert.equal(receipt.logs[1].event, 'ContractCreated');
            assert.equal(receipt.logs[1].args.contractAddress, expectedAddress);
        })
    })

    context.skip( "> Universal Receiver", async () => {
        
        it("Call account and check for 'UniversalReceiver' event", async () => {
            
        })

        it("Call account and check for 'ReceivedERC777' event in external account", async () => {

        })

        it("Mint ERC777 and LSP4 to LSP3 account", async () => {

        })

        it("Transfer ERC777 and LSP4 to LSP3 account", async () => {

        })

        it("Mint ERC777 and LSP4 to LSP3 account and delegate to UniversalReceiverAddressStore", async () => {

        })

        it("Transfer ERC777 and LSP4 from LSP3 account with delegate to UniversalReceiverAddressStore", async () => {

        })

        it("Transfer from ERC777 and LSP4 to account and delegate to UniversalReceiverAddressStore", async () => {

        })
    })
    
})

contract("> LSP3Account via EIP1167 Proxy + initializer (using Web3)", async (accounts) => {

    let lsp3Account,
        minimalProxy

    const owner = accounts[0]

    before(async() => {
        lsp3Account = await LSP3AccountInit.new()
        
        let proxyRuntimeCode = runtimeCodeTemplate.replace("bebebebebebebebebebebebebebebebebebebebe", lsp3Account.address.substr(2))
        let transaction = await web3.eth.sendTransaction({
            from: owner,
            data: proxyRuntimeCode
        })

        minimalProxy = await new web3.eth.Contract(LSP3AccountInit.abi, transaction.contractAddress)

        // enable to return error reason string
        minimalProxy.handleRevert = true
    })

    it("Should initialize via Web3", async () => {
        let gasCost = await minimalProxy.methods.initialize(owner).estimateGas({ from: owner })
        console.log("gasCost: ", gasCost)
        await minimalProxy.methods.initialize(owner).send({ from: owner, gas: 260_000 })
        let result = await minimalProxy.methods.owner().call()
        console.log("result: ", result)
    })
})