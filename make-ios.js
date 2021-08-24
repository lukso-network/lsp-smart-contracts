'use strict';

const fs = require('fs');

// 1) Get content of the JSON files
const erc725Account = fs.readFileSync('./build/contracts/ERC725.json')
const lsp3Account = fs.readFileSync('./build/contracts/LSP3Account.json')
const universalReceiver = fs.readFileSync('./build/contracts/BasicUniversalReceiver.json')
const keyManager = fs.readFileSync('./build/contracts/KeyManager.json')

// 2) Inside these files, grab the `.abi` object
const erc725ABI = JSON.parse(erc725Account).abi;
const lsp3ABI = JSON.parse(lsp3Account).abi;
const universalReceiverABI = JSON.parse(universalReceiver).abi;
const keyManagerABI = JSON.parse(keyManager).abi;

let upSwiftFile = './ios/upcontracts.swift';

let fileContents = 
`
public final class UpContractAbi : String {
    public static let ERC_725_ABI = "${JSON.stringify(erc725ABI).replace(/"/g, '\\"')}"
    public static let KEY_MANAGER_ABI = "${JSON.stringify(lsp3ABI).replace(/"/g, '\\"')}"
    public static let LSP3_ABI = "${JSON.stringify(universalReceiverABI).replace(/"/g, '\\"')}"
    public static let UNIVERSAL_RECEIVER_ABI = "${JSON.stringify(keyManagerABI).replace(/"/g, '\\"')}"
}
`

// 3) Save to these files
fs.appendFile(upSwiftFile, fileContents, (err) => {
    if (err) console.log(err)
});