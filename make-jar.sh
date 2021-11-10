#!/usr/bin/env bash

set -e

sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install solc

curl -L get.web3j.io | sh && source ~/.web3j/source.sh

export destination=./java/src/main/java/network/lukso/up/contracts
export package=network.lukso.up.contracts

solc --abi --bin \
    solidity-bytes-utils/="$(pwd)"/node_modules/solidity-bytes-utils/ \
    @openzeppelin/="$(pwd)"/node_modules/@openzeppelin/ \
    ../submodules="$(pwd)"/submodules \
    contracts/LSP3-UniversalProfile.sol \
    contracts/LSP6-KeyManager/LSP6-KeyManager.sol \
    contracts/LSP1-UniversalReceiver/LSP1-UniversalReceiverDelegate.sol \
    contracts/LSP7-DigitalAsset/LSP7-DigitalAsset.sol \
    contracts/LSP7-DigitalAsset/extensions/LSP7-CappedSupply.sol \
    contracts/LSP8-IdentifiableDigitalAsset/LSP8-IdentifiableDigitalAsset.sol \
    contracts/LSP8-IdentifiableDigitalAsset/extensions/LSP8-CappedSupply.sol \
    contracts/LSP3-UniversalProfileInit.sol \
    contracts/LSP6-KeyManager/LSP6-KeyManagerInit.sol \
    contracts/LSP1-UniversalReceiver/LSP1-UniversalReceiverDelegateInit.sol \
    contracts/LSP7-DigitalAsset/LSP7-DigitalAssetInit.sol \
    contracts/LSP7-DigitalAsset/extensions/LSP7-CappedSupplyInit.sol \
    contracts/LSP8-IdentifiableDigitalAsset/LSP8-IdentifiableDigitalAssetInit.sol \
    contracts/LSP8-IdentifiableDigitalAsset/extensions/LSP8-CappedSupplyInit.sol \
    contracts/LSP7-DigitalAsset/extensions/LSP7-CompatibilityForERC20.sol \
    contracts/LSP8-IdentifiableDigitalAsset/extensions/LSP8-CompatibilityForERC721.sol \
    -o ./output/

FILES=(
    UniversalProfile 
    KeyManager 
    UniversalReceiverDelegate
    LSP7 
    LSP7CappedSupply 
    LSP8 
    LSP8CappedSupply
    UniversalProfileInit
    KeyManagerInit
    UniversalReceiverDelegateInit
    LSP7Init
    LSP7CappedSupplyInit
    LSP8Init
    LSP8CappedSupplyInit
    LSP7CompatibilityForERC20
    LSP8CompatibilityForERC721
)

for (( ii=0; ii<${#FILES[@]}; ii++ ));
do
    export binSource=./output/${FILES[$ii]}.bin # source of compiled contracts
    export abiSource=./output/${FILES[$ii]}.abi
    web3j generate solidity --abiFile=$abiSource --binFile=$binSource -o $destination -p $package
done

rm -Rf ./output