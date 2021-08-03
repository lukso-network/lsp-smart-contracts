const { assert } = require('chai')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')
const truffleAssert = require('truffle-assertions');

const NFTStorageMerkle = artifacts.require('NFTStorageMerkle')
const NFTStoragePatricia = artifacts.require('NFTStoragePatricia')

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
        let leaves
        let merkletree

        before(async () => {
            nftStorage = await NFTStorageMerkle.new({ from: owner })

            leaves = nftList.map(x => keccak256(x))
            merkletree = new MerkleTree(leaves, keccak256, { sortPairs: true })

        })

        it("Display Merkle Tree in CLI", async () => {
            console.log(merkletree.toString())
        })

        it("Should return 8 for leaves count", async () => {
            let count = merkletree.getHexLeaves().length
            assert.equal(count, 8, "not the same number of leaves")
        })

        it("Keccak256 hash should match for the first NFT address", async () => {
            let firstNFT = merkletree.getHexLeaves()[0]
            
            assert.equal(
                firstNFT,
                web3.utils.sha3(nftList[0]),
                "Not the same keccak256 hash"
            )
        })

        it("Should verify the proof in the smart contract", async () => {
            let root = merkletree.getHexRoot()
            let leaf = merkletree.getHexLeaves()[3]
            let proof = merkletree.getHexProof(leaf)

            let result = await nftStorage.verifyMerkleProof(proof, root, leaf)
            assert.isTrue(result, "Merkle Proof invalid")
            
        })
    })
})

contract('NFTStoragePatricia', async (accounts) => {

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
            nftStorage = await NFTStoragePatricia.new({ from: owner })
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

        describe("verifying proof", async () => {

            it("Should verify the proof for an included NFT", async () => {
                let rootHash = await nftStorage.getRootHash.call()

                let key = web3.utils.sha3(nftList['nft2'])
                let fetched = await nftStorage.getProof.call(key)

                let branchMask = fetched[0]
                let siblings = fetched[1]

                await truffleAssert.passes(
                    nftStorage.verifyPatriciaProof(
                        rootHash, 
                        key, 
                        nftList['nft2'],
                        branchMask,
                        siblings
                    )
                )
                
            })
        })

        it("Should fail to verify the proof for a non-included NFT", async () => {
            let rootHash = await nftStorage.getRootHash.call()

            let key = web3.utils.sha3("0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef")
            let fetched = await nftStorage.getProof.call(key)

            let branchMask = fetched[0]
            let siblings = fetched[1]

            await truffleAssert.fails(
                nftStorage.verifyPatriciaProof(
                    rootHash, 
                    key, 
                    "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
                    branchMask,
                    siblings
                )
            )
            
        })


    })


})