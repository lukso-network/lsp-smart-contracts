#!/usr/bin/env sh

for abi_file in ./android/abi/*; do
    bin_file="./android/bin/$(basename $abi_file .abi).bin"

    web3j generate solidity \
        --abiFile="$abi_file" \
        --binFile="$bin_file" \
        -o ./scripts/java/src/main/java/network/lukso/up/contracts \
        -p network.lukso.up.contracts
done