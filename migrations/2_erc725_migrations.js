const BasicKeyManager = artifacts.require("BasicKeyManager")
const ERC725Utils = artifacts.require("ERC725Utils")

module.exports = function (deployer, network, accounts) {

    let owner = accounts[2]
    
    deployer.deploy(ERC725Utils)
    deployer.link(ERC725Utils, BasicKeyManager)
    deployer.deploy(BasicKeyManager, owner)
};