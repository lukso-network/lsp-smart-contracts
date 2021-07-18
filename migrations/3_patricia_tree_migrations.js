const PatriciaTree = artifacts.require('PatriciaTree')
const NFTStoragePatricia = artifacts.require('NFTStoragePatricia')

module.exports = function (deployer, network, accounts) {
    let owner = accounts[0]
    deployer.deploy(PatriciaTree)
    deployer.link(PatriciaTree, NFTStoragePatricia)
    deployer.deploy(NFTStoragePatricia, owner)
}