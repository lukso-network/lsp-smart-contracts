const { assert } = require('chai')
const NFTStorage = artifacts.require('NFTStorage')

String.prototype.hex = () => { return web3.utils.stringToHex(this) }

contract('NFTStorage', async (accounts) => {

    context('Testing Patricia Tree', async () => {

        let owner = accounts[0]
        let nftList = {
            'nft1': web3.utils.toChecksumAddress(accounts[1]),
            'nft2': web3.utils.toChecksumAddress(accounts[2]),
            'nft3': web3.utils.toChecksumAddress(accounts[3]),
            'nft4': web3.utils.toChecksumAddress(accounts[4]),
            'nft5': web3.utils.toChecksumAddress(accounts[5]),
        }
    
        let nftStorage
    
        before(async () => {
            nftStorage = await NFTStorage.new({ from: owner })
        })

        describe("insert()", async () => {
            it('should insert a nft address in the patricia tree', async () => {
                let key = web3.utils.sha3(nftList['nft1'])
                let value = nftList['nft1']
                await nftStorage.addNFT(key, value, { from: owner })
    
                let result = web3.utils.toChecksumAddress(
                    await nftStorage.getNFT(key)
                )
    
                assert.equal(result, value, "Not the same data")
            })
    
            it('should insert 50 NFTs at once in the patricia tree', async () => {
                for (let ii = 1; ii <= 50; ii++) {
                    let value = web3.eth.accounts.create().address
                    let key = web3.utils.sha3(value)
                    await nftStorage.addNFT(key, value, { from: owner })
                }
            })
        })
    
        describe("doesInclude()", async () => {
            
            it('should return true for an included NFT', async () => {
                let key = web3.utils.sha3(nftList['nft2'])
                let value = nftList['nft2']
                await nftStorage.addNFT(key, value, { from: owner })

                let result = await nftStorage.doesInclude.call(key)
                assert.isTrue(result, "Should have returned true, as the NFT was inserted in the Patricia tree before")
            })

            it('should return false for a non included NFT', async () => {
                let key = web3.utils.sha3(nftList['nft3'])
                let result = await nftStorage.doesInclude.call(key)
                assert.isFalse(result, "Should have returned false, as the NFT was never included in the Patricia tree")
            })

        })



    })

    

   
})