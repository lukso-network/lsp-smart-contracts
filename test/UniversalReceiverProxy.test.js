const { web3 } = require("openzeppelin-test-helpers/src/setup")
const { runtimeCodeTemplate } = require("./utils/proxy")

const UniReceiver = artifacts.require("BasicUniversalReceiver")
const UniversalReceiverTester = artifacts.require("UniversalReceiverTester")
const UniversalReceiverAddressStore = artifacts.require("UniversalReceiverAddressStore")
const UniversalReceiverAddressStoreInit = artifacts.require("UniversalReceiverAddressStoreInit")
const Account = artifacts.require("LSP3Account")

// keccak256("ERC777TokensRecipient")
const TOKENS_RECIPIENT_INTERFACE_HASH = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";

contract("Receivers with Proxy (using Truffle)", accounts => {

    const deployUniReceiverAddressStoreProxy = async (_masterInterface, _masterAddress, _deployer) => {
        // give +3% more gas to ensure it deploys
        let deploymentCost = parseInt(await _masterInterface.new.estimateGas() * 1.03)
        let proxyRuntimeCode = runtimeCodeTemplate.replace(
            "bebebebebebebebebebebebebebebebebebebebe",
            _masterAddress.substr(2)
        )

        let tx = await web3.eth.sendTransaction({
            from: _deployer,
            data: proxyRuntimeCode,
            gas: deploymentCost
        })

        let proxyContract = await _masterInterface.new(tx.contractAddress)
        return proxyContract
    }

    const owner = accounts[0]

    let lsp3Account,
        uniAddressStoreMaster,
        uniAddressStoreProxy

    before(async () => {
        lsp3Account = await Account.new(owner)
        uniAddressStoreMaster = await UniversalReceiverAddressStoreInit.new()
        uniAddressStoreProxy = await deployUniReceiverAddressStoreProxy(
            UniversalReceiverAddressStoreInit,
            uniAddressStoreMaster.address,
            owner
        )
    })

    beforeEach(async () => {
        
    })

    context("UniversalReceiverAddressStore", async () => {

        it("should be cheaper to deploy via proxy", async () => {
            let contractDeploymentCost = await UniversalReceiverAddressStore.new.estimateGas(lsp3Account.address)
        
            
        })

    })

    xit("should not be able to initialize twice", async () => {

    })

    xit("Can check for implementing interface", async () => {
        let tx = await instance.universalReceiver(TOKENS_RECIPIENT_INTERFACE_HASH, "0x")
        console.log(
            "Directly checking for implementing interface costs: ",
            tx.receipt.gasUsed
        )
        let res = await instance.universalReceiver.call(TOKENS_RECIPIENT_INTERFACE_HASH, "0x");
        assert.equal(res, TOKENS_RECIPIENT_INTERFACE_HASH)
    })

    xit("Contract can check for implementing interface with Bytes32", async () => {

    })

    xit("Contract can check for implementing interface with Low Level call", async () => {

    })

    xit("Use delegate and test if it can store addresses", async () => {

    })    

})