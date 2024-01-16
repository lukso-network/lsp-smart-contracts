# Loop through deployment files and recover address of deployed contracts
for jsonFile in deployments/luksoMainnet/*.json; do
  if [ -f "$jsonFile" ]; then
    CONTRACT_ADDRESS=$(cat $jsonFile | jq -r '.address')
    npx hardhat verify $CONTRACT_ADDRESS --network luksoMainnet
  fi
done;
