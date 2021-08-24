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

let filesData = {
    './ios/erc725_abi.txt': JSON.stringify(erc725ABI).replace(/"/g, '\\"'),
    './ios/lsp3_abi.txt': JSON.stringify(lsp3ABI).replace(/"/g, '\\"'),
    './ios/universalreceiver_abi.txt': JSON.stringify(universalReceiverABI).replace(/"/g, '\\"'),
    './ios/keymanager_abi.txt': JSON.stringify(keyManagerABI).replace(/"/g, '\\"'),
}

// 3) Save to these files
for (let [file, content] of Object.entries(filesData)) {
    fs.appendFile(file, content, (err) => {
        if (err) console.log(err)
    });
}