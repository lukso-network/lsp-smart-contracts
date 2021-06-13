const NFTStorage = artifacts.require('NFTStorage')

module.exports = function (deployer, network, accounts) {

    let owner = accounts[0]

    deployer.deploy(NFTStorage, owner)
}