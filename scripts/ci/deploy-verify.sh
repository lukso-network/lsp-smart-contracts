# This shell script provides a simple way to deploy + verify lsp-smart-contracts
# options:
#   -c: name of the contract to deploy + verify
#   -n: network to deploy + verify the contract on

cmd_description="options:\n
    -c: name of the contract to deploy + verify\n
    -n: network to deploy + verify the contract on"

error_header="deploy-verify.sh cmd failed\n----------\n"

# Check that we have passed the right arguments to the shell command
if [ $# -eq 0 ]
  then
    echo $error_header "error: no arguments supplied"
    echo $cmd_description + "\n"
    exit 1
fi


while getopts c:d:n: flag
do
    case "${flag}" in
        c) contract=${OPTARG};;
        n) network=${OPTARG};;
    esac
done

if [ -z "$contract" ]
  then
    echo $error_header"error: No contract name specified. Use the option below:\n"
    echo "    -c: name of the contract to deploy + verify\n"
    exit 1
fi

if [ -z "$network" ]
  then
    echo $error_header"error: No network specified. Use the option below:\n"
    echo "    -n: network to deploy + verify the contract on\n"
    exit 1
fi

# Save the output of the deployment in a text file.
npx hardhat deploy --network ${network} --tags ${contract} --reset >> deployment.txt
CONTRACT_ADDRESS=$(grep -o -E '0x(\w|\s){40}' deployment.txt | tail -n 1)

# Verify UniversalProfile with constructor arguments
if [ "${contract}" = "UniversalProfile" ]
then 
    npx hardhat verify $CONTRACT_ADDRESS $DEPLOYER_ADDRESS --network luksoTestnet --contract contracts/UniversalProfile.sol:UniversalProfile

# Verify LSP6KeyManager contracts with constructor arguments
elif [ "${contract}" = "LSP6KeyManager" ]
then
    # specify the contract as UniversalProfile and LSP0ERC725Account have the same runtime code.
    LINKED_UP_IN_CONSTRUCTOR=$(grep -o -E '0x(\w|\s){40}' deployment.txt | head -n 2 | tail -n 1)
    npx hardhat verify $CONTRACT_ADDRESS $LINKED_UP_IN_CONSTRUCTOR --network luksoTestnet

# Verify LSP7Mintable contract with constructor arguments
elif [ "${contract}" = "LSP7Mintable" ]
then
    # LSP7 constructor takes a boolean parameter that error when passed as CLI argument.
    # Create js file with constructor arguments to bypass this error.
    echo "module.exports = [ 'LSP7 Mintable', 'LSP7M', '$DEPLOYER_ADDRESS', false ];" >> lsp7arguments.js
    npx hardhat verify $CONTRACT_ADDRESS --network luksoTestnet --constructor-args lsp7arguments.js

# Verify LSP8Mintable contract with constructor arguments
elif [ "${contract}" = "LSP8Mintable" ]
then
    npx hardhat verify $CONTRACT_ADDRESS 'LSP8 Mintable' 'LSP8M' $DEPLOYER_ADDRESS --network luksoTestnet

# Verify LSP9Vault contract with constructor arguments
elif [ "${contract}" = "LSP9Vault" ]
then
    npx hardhat verify $CONTRACT_ADDRESS $DEPLOYER_ADDRESS --network luksoTestnet

# Default: verify contract without any constructor arguments (LSP!UniversalReceiverDelegate of UP or Vault)
else
    npx hardhat verify $CONTRACT_ADDRESS --network luksoTestnet
fi


rm deployment.txt
