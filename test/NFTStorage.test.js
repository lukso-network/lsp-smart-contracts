const { assert } = require('chai')
const MerkleTools = require('merkle-tools');
const NFTStorageMerkle = artifacts.require('NFTStorageMerkle')
const NFTStoragePatricia = artifacts.require('NFTStoragePatricia')


const treeOptions = {
    hashType: 'SHA3-256'
}

var merkleTree = new MerkleTools()

String.prototype.hex = () => { return web3.utils.stringToHex(this) }

contract('NFTStorageMerkle', async (accounts) => {

    context('Testing Merkle Tree', async () => {

        let owner = accounts[0]
        let nftList = [
            accounts[1],
            accounts[2],
            accounts[3],
            accounts[4], // verify this leaf
            accounts[5],
            accounts[6],
            accounts[7],
            accounts[8],
        ]

        let nftStorage

        before(async () => {
            nftStorage = await NFTStorageMerkle.new({ from: owner })

            merkleTree.addLeaves(nftList, true)
            merkleTree.makeTree()
        })

        it("Should return 8 for leaves count", async () => {
            let count = merkleTree.getLeafCount()
            assert.equal(count, 8, "not the same number of leaves")
        })

        it.only("Should return the right address", async () => {
            let firstNFT = merkleTree.getLeaf(0)

            console.log("nftList[0]: ", nftList[0])
            console.log("nftList[0] hash: ", web3.utils.sha3(nftList[0]))
            console.log("firstNFT: ", firstNFT)
            console.log("firstNFT: ", firstNFT.toString('hex'))

            // assert.equal(
            //     web3.utils.sha3(firstNFT.toString('hex')), 
            //     web3.utils.sha3(web3.utils.toChecksumAddress(nftList[0])),
            //     "Not the same NFT address retrieved"
            // )
        })

        xit("Should verify the proof in the smart contract", async () => {
            let root = merkleTree.getMerkleRoot()
            console.log("root: ", root)

            let leaf = nftList[3]
            console.log("leaf: ", leaf)

            let proof = merkleTree.getProof(3)
            console.log("proof: ", proof)
        })
    })
})

// contract('NFTStoragePatricia', async (accounts) => {

//     context('Testing Patricia Tree', async () => {

//         let owner = accounts[0]
//         let nftList = {
//             'nft1': web3.utils.toChecksumAddress(accounts[1]),
//             'nft2': web3.utils.toChecksumAddress(accounts[2]),
//             'nft3': web3.utils.toChecksumAddress(accounts[3]),
//             'nft4': web3.utils.toChecksumAddress(accounts[4]),
//             'nft5': web3.utils.toChecksumAddress(accounts[5]),
//         }
    
//         let nftStorage
    
//         before(async () => {
//             nftStorage = await NFTStoragePatricia.new({ from: owner })
//         })

//         describe("insert()", async () => {
//             it('should insert a nft address in the patricia tree', async () => {
//                 let key = web3.utils.sha3(nftList['nft1'])
//                 let value = nftList['nft1']
//                 await nftStorage.addNFT(key, value, { from: owner })
    
//                 let result = web3.utils.toChecksumAddress(
//                     await nftStorage.getNFT(key)
//                 )
    
//                 assert.equal(result, value, "Not the same data")
//             })
    
//             it('should insert 50 NFTs at once in the patricia tree', async () => {
//                 for (let ii = 1; ii <= 50; ii++) {
//                     let value = web3.eth.accounts.create().address
//                     let key = web3.utils.sha3(value)
//                     await nftStorage.addNFT(key, value, { from: owner })
//                 }
//             })
//         })
    
//         describe("doesInclude()", async () => {
            
//             it('should return true for an included NFT', async () => {
//                 let key = web3.utils.sha3(nftList['nft2'])
//                 let value = nftList['nft2']
//                 await nftStorage.addNFT(key, value, { from: owner })

//                 let result = await nftStorage.doesInclude.call(key)
//                 assert.isTrue(result, "Should have returned true, as the NFT was inserted in the Patricia tree before")
//             })

//             it('should return false for a non included NFT', async () => {
//                 let key = web3.utils.sha3(nftList['nft3'])
//                 let result = await nftStorage.doesInclude.call(key)
//                 assert.isFalse(result, "Should have returned false, as the NFT was never included in the Patricia tree")
//             })

//         })

//         describe("verifying proof", async () => {

//         })


//     })

    

   
// })