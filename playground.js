const Web3 = require('web3')
const ERC725_JSON = require('./build/contracts/ERC725.json')
const KeyManager_JSON = require('./build/contracts/KeyManager.json')
const {calculateCreate2} = require('eth-create2-calculator')


const web3 = new Web3('https://rinkeby.infura.io/v3/dd1bc3dffc394e85a9dd9b29bbf98a28')

const ERC725 = new web3.eth.Contract(ERC725_JSON.abi)
const KeyManager = new web3.eth.Contract(KeyManager_JSON.abi)

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

// 0x7f23690c                                                           -> selector (setData)
// 0x4b80742d0000000082ac0000cafecafecafecafecafecafecafecafecafecafe
// 0x0000000000000000000000000000000000000000000000000000000000000040   -> memory pointer ???
// 0x0000000000000000000000000000000000000000000000000000000000000001   -> bytes array length
// 0x0400000000000000000000000000000000000000000000000000000000000000   -> bytes array itself
let setDataPayload = ERC725.methods.setData("0x4b80742d0000000082ac0000cafecafecafecafecafecafecafecafecafecafe", "0x04").encodeABI()
console.log("setData payload: ", setDataPayload)

// 0x44c028fe                                                         -> selector (execute)
// 0x0000000000000000000000000000000000000000000000000000000000000001 -> arg 1 (_operation)
// 0x000000000000000000000000c00ffeebeefbeefbeefbeefbeefbebeefc00ffee -> arg 2 (_to)
// 0x0000000000000000000000000000000000000000000000000000000000000012 -> arg 3 (_value)
// 0x0000000000000000000000000000000000000000000000000000000000000080 -> (???)
// 0x0000000000000000000000000000000000000000000000000000000000000004 -> arg 4 length (_data.length)
// 0xaabbccdd00000000000000000000000000000000000000000000000000000000 -> arg 4 (_data)
let executeDataPayload = ERC725.methods.execute(0, "0xc00ffeebeefbeefbeefbeefbeefbebeefc00ffee", web3.utils.toWei("1", "ether"), "0xaabbccdd").encodeABI()
console.log("execute payload: ", executeDataPayload)

let signature = web3.eth.abi.encodeFunctionSignature({
    "inputs": [],
    "name": "getNumber",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  })
//   console.log("signature: ", signature)

// 0x100000000000000000000000000000000000000000000000000000000
const someByteCode = '0x608060405234801561001057600080fd5b50610520806100206000396000f3fe6080604052600436106100345760003560e01c8063481286e61461003957806378065306146100be578063cdcb760a14610163575b600080fd5b34801561004557600080fd5b5061007c6004803603604081101561005c57600080fd5b810190808035906020019092919080359060200190929190505050610268565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156100ca57600080fd5b50610121600480360360608110156100e157600080fd5b810190808035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061027d565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6102266004803603604081101561017957600080fd5b8101908080359060200190929190803590602001906401000000008111156101a057600080fd5b8201836020820111156101b257600080fd5b803590602001918460018302840111640100000000831117156101d457600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610346565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600061027583833061027d565b905092915050565b60008060ff60f81b83868660405160200180857effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681526001018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1660601b81526014018381526020018281526020019450505050506040516020818303038152906040528051906020012090508060001c9150509392505050565b60008060003490506000845114156103c6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f437265617465323a2062797465636f6465206c656e677468206973207a65726f81525060200191505060405180910390fd5b8484516020860183f59150600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610474576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260198152602001807f437265617465323a204661696c6564206f6e206465706c6f790000000000000081525060200191505060405180910390fd5b7fc16bb3dbd36917c7aa3e76b988c2cd35e74bb230a02fef61e7376d8b4bfaea778286604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a181925050509291505056fea26469706673582212208e45d684157bfc10076a3d284f8c3899cd5ecf31abade0a086223e0886a8a68164736f6c63430006010033'
const deployerContract = '0x0a481e47Fcf329d0CafDd74A46f54f21eeDF5d68'
// console.log(calculateCreate2(deployerContract, '', someByteCode))

let newAccount = web3.eth.accounts.create()
// let executeRelayedCallPayload = KeyManager.methods.executeRelayedCall()
// 0x44c028fe
// 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c00ffeebeefbeefbeefbeefbeefbebeefc00ffee0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004aabbccdd00000000000000000000000000000000000000000000000000000000