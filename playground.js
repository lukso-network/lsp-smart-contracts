const Web3 = require('web3')
const ERC725_JSON = require('./build/contracts/ERC725.json')

const web3 = new Web3('https://rinkeby.infura.io/v3/dd1bc3dffc394e85a9dd9b29bbf98a28')

const ERC725 = new web3.eth.Contract(ERC725_JSON.abi)

let setDataFunction = {
    inputs: [
      { internalType: 'bytes32', name: '_key', type: 'bytes32' },
      { internalType: 'bytes', name: '_value', type: 'bytes' }
    ],
    name: 'setData',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
}

let executeFunction = {
    inputs: [
      {
        internalType: "uint256",
        name: "_operation",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256"
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes"
      }
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function"
}

let transferOwnershipFunction = {
    inputs: [
      { internalType: "address", name: "newOwner", type: "address" }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
}

let setDataSignature = web3.eth.abi.encodeFunctionSignature(setDataFunction)
let executeSignature = web3.eth.abi.encodeFunctionSignature(executeFunction)
let transferOwnershipSignature = web3.eth.abi.encodeFunctionSignature(transferOwnershipFunction)

// console.log("setData: ", setDataSignature)
// console.log("execute: ", executeSignature)
// console.log("transferOwnership: ", transferOwnershipSignature)

// 0x7f23690c
// 0x4b80742d0000000082ac0000cafecafecafecafecafecafecafecafecafecafe
// 0x0000000000000000000000000000000000000000000000000000000000000040   -> memory pointer ???
// 0x0000000000000000000000000000000000000000000000000000000000000001   -> bytes array length
// 0x0400000000000000000000000000000000000000000000000000000000000000   -> bytes array itself
let setDataPayload = ERC725.methods.setData("0x4b80742d0000000082ac0000cafecafecafecafecafecafecafecafecafecafe", "0x04").encodeABI()
console.log("setData payload: ", setDataPayload)

// 0x44c028fe
// 0x0000000000000000000000000000000000000000000000000000000000000001 -> arg 1 (_operation)
// 0x000000000000000000000000beefbeefbeefbeefbeefbeefbeefbeefbeefbeef -> arg 2 (_to)
// 0x0000000000000000000000000000000000000000000000000000000000000000 -> arg 3 (_value)
// 0x0000000000000000000000000000000000000000000000000000000000000080 -> (???)
// 0x0000000000000000000000000000000000000000000000000000000000000004 -> arg 4 length (_data.length)
// 0xaabbccdd00000000000000000000000000000000000000000000000000000000 -> arg 4 (_data)
let executeDataPayload = ERC725.methods.execute(1, "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef", 0, "0xaabbccdd").encodeABI()
console.log("execute payload: ", executeDataPayload)

// 0x100000000000000000000000000000000000000000000000000000000