abi_dir=( ./android/abi/* )
bin_dir=( ./android/bin/* )
n=${#abi_dir[@]}               # assume they're the same length
for (( i = 0; i < n; i++ )); do
    abi_file="${abi_dir[i]}"
    bin_file="${bin_dir[i]}"
    
    web3j generate solidity \
        --abiFile="$abi_file" \
        --binFile="$bin_file" \
        -o ./scripts/java/src/main/java/network/lukso/up/contracts \
        -p network.lukso.up.contracts
done