const { assert } = require("chai");
const ERC725Account = artifacts.require("LSP3Account");
const truffleAssert = require('truffle-assertions');

const LSP2ISSUEDASSETS_KEY = web3.utils.soliditySha3('LSP2IssuedAssets[]')

contract("ERC725 Account", async (accounts) => {

    let erc725Account
    let LSP2IssuedAssets = []

    const owner = accounts[0]

    before(async () => {
        erc725Account = await ERC725Account.new(owner, { from: owner })
    })

    it("should add 100 LSP2IssuedAssets[]", async () => {
        for (let ii = 0; ii < 100; ii++) {
            let newAsset = web3.eth.accounts.create().address
            LSP2IssuedAssets.push(newAsset)
        }

        await truffleAssert.passes(
            erc725Account.setData(
                LSP2ISSUEDASSETS_KEY, 
                web3.eth.abi.encodeParameter('address[]', LSP2IssuedAssets)
            )
        )

        console.log(LSP2IssuedAssets.length)
    })

    it("Add one more LSP2IssuedAssets[]", async () => {
        let newAsset = web3.eth.accounts.create().address
        LSP2IssuedAssets.push(newAsset)

        await truffleAssert.passes(
            erc725Account.setData(
                LSP2ISSUEDASSETS_KEY, 
                web3.eth.abi.encodeParameter('address[]', LSP2IssuedAssets)
            )
        )

        console.log(LSP2IssuedAssets.length)  
    })
})