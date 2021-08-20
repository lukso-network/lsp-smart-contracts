#!/usr/bin/env bash

set -e

sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install solc

solc --abi --bin @openzeppelin/="$(pwd)"/node_modules/@openzeppelin/ ../submodules="$(pwd)"/submodules solidity-bytes-utils/="$(pwd)"/node_modules/solidity-bytes-utils/ -o ./output/ contracts/LSP3Account.sol contracts/KeyManager/KeyManager.sol contracts/UniversalReceiver/BasicUniversalReceiver.sol

export destination=./src/main/java
export package=network.lukso.up.contracts

FILES=(KeyManager LSP3Account BasicUniversalReceiver ERC725Account)

export binSource=./output/LSP3Account.bin # source of compiled contracts
export abiSource=./output/LSP3Account.abi
web3j generate solidity --abiFile=$abiSource --binFile=$binSource -o $destination -p $package

export binSource=./output/KeyManager.bin # source of compiled contracts
export abiSource=./output/KeyManager.abi
web3j generate solidity --abiFile=$abiSource --binFile=$binSource -o $destination -p $package

export binSource=./output/BasicUniversalReceiver.bin # source of compiled contracts
export abiSource=./output/BasicUniversalReceiver.abi
web3j generate solidity --abiFile=$abiSource --binFile=$binSource -o $destination -p $package

export binSource=./output/ERC725Account.bin # source of compiled contracts
export abiSource=./output/ERC725Account.abi
web3j generate solidity --abiFile=$abiSource --binFile=$binSource -o $destination -p $package

rm -Rf ./output

export inputsPath=./src/main/java/network/lukso/up/contracts/

mkdir jar
jar cf ./jar/BasicUniversalReceiver.jar $inputsPath/BasicUniversalReceiver.java
jar cf ./jar/ERC725Account.jar $inputsPath/ERC725Account.java
jar cf ./jar/KeyManager.jar $inputsPath/KeyManager.java
jar cf ./jar/LSP3Account.jar $inputsPath/LSP3Account.java