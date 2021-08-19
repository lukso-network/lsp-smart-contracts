const { web3 } = require("openzeppelin-test-helpers/src/setup");

/**
 * @see https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
 *                      10 x hex Opcodes to copy runtime code
 *                           into memory and return it
 *                             |                  |
 *///                          V                  V
const runtimeCodeTemplate = "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";

async function deployProxy(_masterInterface, _masterAddress, _deployer) {
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

async function deployProxyWeb3(_masterInterface, _masterAddress, _deployer) {
    // let masterContract = new web3.eth.contractAddress(_masterInterface.abi)
    // let expectedDeploymentCost = await masterContract.deployProxy()
}

module.exports = {
    runtimeCodeTemplate,
    deployProxy
}