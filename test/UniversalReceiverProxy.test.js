const { assert } = require("chai")
const { web3 } = require("openzeppelin-test-helpers/src/setup")
const truffleAssert = require('truffle-assertions')
const { deployProxy, runtimeCodeTemplate } = require("./utils/proxy")

const UniReceiver = artifacts.require("BasicUniversalReceiver")
const UniversalReceiverTester = artifacts.require("UniversalReceiverTester")
const UniversalReceiverAddressStore = artifacts.require("UniversalReceiverAddressStore")
const UniversalReceiverAddressStoreInit = artifacts.require("UniversalReceiverAddressStoreInit")
const Account = artifacts.require("LSP3Account")

// keccak256("ERC777TokensRecipient")
const TOKENS_RECIPIENT_INTERFACE_HASH = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
// keccak256("LSP1UniversalReceiverDelegate")
const UNIVERSALRECEIVER_KEY = '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47';

contract("Receivers with Proxy (using Truffle)", accounts => {

    const owner = accounts[0]

    let lsp3Account,
        uniAddressStoreMaster,
        uniAddressStoreProxy

    before(async () => {
        lsp3Account = await Account.new(owner)
        uniAddressStoreMaster = await UniversalReceiverAddressStoreInit.new()
        uniAddressStoreProxy = await deployProxy(
            UniversalReceiverAddressStoreInit,
            uniAddressStoreMaster.address,
            owner
        )
    })

    context("UniversalReceiverAddressStore", async () => {

        it("should be cheaper to deploy via proxy", async () => {
            // Deploying entire contract
            let contractDeploymentCost = await UniversalReceiverAddressStore.new.estimateGas(lsp3Account.address)
        
            // Deploying via Proxy
            let masterContract = await UniversalReceiverAddressStoreInit.new(lsp3Account.address)
            let proxyRuntimeCode = runtimeCodeTemplate.replace(
                "bebebebebebebebebebebebebebebebebebebebe",
                masterContract.address.substr(2)
            )
            let tx = await web3.eth.sendTransaction({ from: owner, data: proxyRuntimeCode })
            let proxy = await UniversalReceiverAddressStoreInit.at(tx.contractAddress)
        
            let proxyDeploymentCost = tx.gasUsed
            let initializeCost = await proxy.initialize.estimateGas(lsp3Account.address)
            let totalProxyCost = proxyDeploymentCost + initializeCost

            assert.isBelow(totalProxyCost, contractDeploymentCost, "Deploying via proxy not cheaper in gas")
        
            // console.log("UniversalReceiverAddressStore deployment cost: ", contractDeploymentCost, "\n")

            // console.log("proxy deployment cost: ", proxyDeploymentCost)
            // console.log("initialize gas cost: ", initializeCost)
            // console.log("--------------------------------------------------")
            // console.log("total: ", totalProxyCost)
            // console.log("\n > Gas saved = ", contractDeploymentCost - totalProxyCost, "(", parseInt(((totalProxyCost * 100) / contractDeploymentCost) - 100), "%)")
            // console.log("\n NB: logic contract `UniversalReceiverAddressStoreInit` deployment cost: ", await UniversalReceiverAddressStoreInit.new.estimateGas(), " (only once)")
        })

        it("Should call the `initialize(...)` function", async () => {
            let currentAccount = await uniAddressStoreProxy.account.call()
            await uniAddressStoreProxy.initialize(lsp3Account.address)
            let newAccount = await uniAddressStoreProxy.account.call()
            
            assert.notEqual(newAccount, currentAccount, "Associated account has not changed")
            assert.equal(newAccount, lsp3Account.address, "Associated account should be `lsp3Account.address`")
        })

        it("should not allow to initialize twice", async () => {
            await truffleAssert.fails(
                uniAddressStoreProxy.initialize("0xcafecafecafecafecafecafecafecafecafecafe"),
                "Initializable: contract is already initialized"
            )
        })

        it("Use delegate and test if it can store addresses", async () => {
            let account = await Account.new(accounts[1])
            let checker = await UniversalReceiverTester.new()
            let checker2 = await UniversalReceiverTester.new()
            let checker3 = await UniversalReceiverTester.new()

            let delegate = await deployProxy(
                UniversalReceiverAddressStoreInit,
                uniAddressStoreMaster.address,
                accounts[1]
            )
            await delegate.initialize(account.address)

            // set uni receiver delegate
            account.setData(UNIVERSALRECEIVER_KEY, delegate.address, { from: accounts[1] });
            
            await checker.lowLevelCheckImplementation(
                account.address,
                TOKENS_RECIPIENT_INTERFACE_HASH
            );
    
            await checker.checkImplementation(
                account.address,
                TOKENS_RECIPIENT_INTERFACE_HASH
            );
            await checker2.checkImplementation(
                account.address,
                TOKENS_RECIPIENT_INTERFACE_HASH
            );
            await checker3.checkImplementation(
                account.address,
                TOKENS_RECIPIENT_INTERFACE_HASH
            );
    
            assert.isTrue(await delegate.containsAddress(checker.address));
            assert.isTrue(await delegate.containsAddress(checker2.address));
            assert.isTrue(await delegate.containsAddress(checker3.address));
            assert.equal(await delegate.getIndex(checker2.address), '1');
        })

    })

})