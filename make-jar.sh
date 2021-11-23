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
    @erc725/smart-contracts/="$(pwd)"/node_modules/@erc725/smart-contracts/ \
    contracts/UniversalProfile.sol \
    contracts/LSP6KeyManager/LSP6KeyManager.sol \
    contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegate.sol \
    contracts/LSP7DigitalAsset/extensions/LSP7Mintable.sol.sol \
    contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Mintable.sol.sol \
    contracts/UniversalProfileInit.sol \
    contracts/LSP6KeyManager/LSP6KeyManagerInit.sol \
    contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateInit.sol \
    contracts/LSP7DigitalAsset/extensions/LSP7MintableInit.sol.sol \
    contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8MintableInit.sol.sol \
    contracts/LSP7DigitalAsset/extensions/LSP7CompatibilityForERC20.sol \
    contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721.sol \
    -o ./output/

FILES=(
    UniversalProfile
    LSP6KeyManager
    LSP1UniversalReceiverDelegate
    LSP7Mintable
    LSP8Mintable
    UniversalProfileInit
    LSP6KeyManagerInit
    LSP1UniversalReceiverDelegateInit
    LSP7MintableInit
    LSP8MintableInit
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