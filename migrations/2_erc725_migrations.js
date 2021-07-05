const BasicKeyManager = artifacts.require("BasicKeyManager")
const KeyManager = artifacts.require("KeyManager")
const KeyManagerHelper = artifacts.require("KeyManagerHelper")

const ERC725Utils = artifacts.require("ERC725Utils")
const SimpleContract = artifacts.require("SimpleContract")

module.exports = function (deployer, network, accounts) {

    let owner = accounts[0]
    deployer.deploy(ERC725Utils)

    // BasicKeyManager = old version
    // KeyManager = new version
    deployer.link(ERC725Utils, BasicKeyManager)
    deployer.link(ERC725Utils, KeyManager)
    deployer.link(ERC725Utils, KeyManagerHelper)

    deployer.deploy(BasicKeyManager, owner)
    deployer.deploy(KeyManager, owner)
    deployer.deploy(KeyManagerHelper, owner)

    deployer.deploy(SimpleContract)
};