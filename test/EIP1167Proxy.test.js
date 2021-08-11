const { assert } = require("chai");
const { web3 } = require("openzeppelin-test-helpers/src/setup");
const truffleAssert = require('truffle-assertions');

const LSP3Account = artifacts.require("LSP3Account");
const LSP3AccountInit = artifacts.require("LSP3AccountInit");
// const UniversalReceiver = artifacts.require("BasicUniversalReceiver")
// const KeyManager = artifacts.require("KeyManager");

/**
 * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
 *                      10 x Opcodes (in hex) to copy runtime code 
 *                           into memory and return it
 *                             |                  |
 *///                          V                  V
const runtimeCodeTemplate = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3"

contract("> LSP3Account via EIP1167 Proxy + initializer (using Truffle)", async (accounts) => {
    
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

        minimalProxy = await LSP3AccountInit.at(transaction.contractAddress)
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
            let currentOwner = await minimalProxy.owner.call()
            // `initialize` function as constructor
            await minimalProxy.initialize(owner)
            let newOwner = await minimalProxy.owner.call()
            assert.notEqual(newOwner, currentOwner, "Contract owner has not changed")
            assert.equal(newOwner, owner, "Contract owner should be `accounts[0]`")
        })

        it("Should not allow to initialize twice", async () => {
            await truffleAssert.fails(
                minimalProxy.initialize("0xcafecafecafecafecafecafecafecafecafecafe"),
                truffleAssert.ErrorType.REVERT
            )
        })

        it("Should `setData` in Key-Value store via proxy", async () => {
            let key = "0xcafe"
            let value = "0xbeef"

            let initialValue = await minimalProxy.getData(key)
            assert.isNull(initialValue, "there should be no value initially set for key '0xcafe'")

            await minimalProxy.setData(key, value)

            let result = await minimalProxy.getData(key)
            assert.equal(result, value, "not the same value in storage for key '0xcafe'")
        })
    })

    xcontext("> ERC165 (supported standards)", async () => {

    })

    xcontext("> ERC1271 (signatures)", async () => {

    })

    xcontext("> Storages test", async () => {

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
        console.log(minimalProxy.handleRevert)
        let gasCost = await minimalProxy.methods.initialize(owner).estimateGas({ from: owner })
        console.log("gasCost: ", gasCost)
        await minimalProxy.methods.initialize(owner).send({ from: owner, gas: 260_000 })
        let result = await minimalProxy.methods.owner().call()
        console.log("result: ", result)
    })
})

contract.skip("EIP1167 Proxy Contract", async (accounts) => {
    
    let erc725Account,
        minimalProxy

    let oldERC725Address

    const owner = accounts[0]

    before(async () => {
        erc725Account = await ERC725Account.new(owner, { from: owner })
        // oldERC725Address = erc725Account.address

        let dataABI = runtimeCodeTemplate.replace(
            "bebebebebebebebebebebebebebebebebebebebe",
            erc725Account.address.substr(2)
        )

        console.log(dataABI)
        console.log(erc725Account.address)
        
        let tx = await web3.eth.sendTransaction({
            from: owner,
            data: dataABI
        })

        minimalProxy = tx.contractAddress
    })

    it("Should replace `bebe...` with erc725 account address", async () => {
        let result = runtimeCodeTemplate.replace(
            "bebebebebebebebebebebebebebebebebebebebe",
            erc725Account.address
        )

        assert.equal(
            result,
            "0x3d602d80600a3d3981f3363d3d373d3d3d363d73" + erc725Account.address + "5af43d82803e903d91602b57fd5bf3"
        )
    })

    it("Should have deployed the minimal proxy", async () => {
        console.log("minimalProxy: ", minimalProxy)
    })

    xit("Should interact via minimal proxy", async () => {
        erc725AccountInit.contract.options.address = minimalProxy
        erc725AccountInit.contract._address = minimalProxy
        erc725AccountInit.address = minimalProxy
        await erc725AccountInit.setData('0xcafe', '0xbeef')

        let result = await erc725AccountInit.getData.call('0xcafe')
        console.log("result: ", result)
        assert.equal(result, '0xbeef')
    })

    xit("Should work", async () => {
        erc725AccountInit.contract.options.address = oldERC725Address
        erc725AccountInit.contract._address = oldERC725Address
        erc725AccountInit.address = oldERC725Address
        let result = await erc725AccountInit.getData.call('0xcafe')
        console.log("result: ", result)
    })

    it("Should interact with erc725 via minimalProxy", async () => {
        let myProxy = new web3.eth.Contract(ERC725Account.abi, minimalProxy)
        // call init function
        await myProxy.methods.setData('0xcafe', '0xbeef').send({ from: owner })

        let result = await myProxy.methods.getData('0xcafe').call()
        console.log("result: ", result)
        assert.equal(result, '0xbeef')
    })

})