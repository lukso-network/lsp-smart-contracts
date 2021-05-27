const KeyManager = artifacts.require("KeyManager")
const ERC725Utils = artifacts.require("ERC725Utils")
const SimpleContract = artifacts.require("SimpleContract")

module.exports = function (deployer, network, accounts) {

    let owner = accounts[0]
    
    deployer.deploy(ERC725Utils)
    deployer.link(ERC725Utils, KeyManager)
    deployer.deploy(KeyManager, owner)

    deployer.deploy(SimpleContract)
};