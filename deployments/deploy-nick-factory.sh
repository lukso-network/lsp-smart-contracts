set -a
source deployments/.env
set +a

FACTORY=0x4e59b44847b379578588920ca78fbf26c0b4956c
FACTORY_DEPLOYMENT_SIGNER_ADDRESS=0x3fab184622dc19b6109349b94811493bf2a45362

# gasPrice (100 gwei) * gasLimit (100000) = 0.01 ether (native token)
FEE=0.01ether

RAW_TX=0xf8a58085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba02222222222222222222222222222222222222222222222222222222222222222a02222222222222222222222222222222222222222222222222222222222222222

# 0) already there?
FACTORY_CODE=$(cast code "$FACTORY" --rpc-url "$RPC_URL")
if [ "$FACTORY_CODE" = "0x" ]; then
  echo "Factory contract does not exist at address $FACTORY on RPC $RPC_URL."
  echo "➡️ Deploying factory contract..."
else
  echo "Factory contract already exists at address $FACTORY on RPC $RPC_URL."
  echo "❌ Aborting deployment."
  exit 1
fi

# 1) fund the keyless deployer so it can pay for the presigned tx
cast send "$FACTORY_DEPLOYMENT_SIGNER_ADDRESS" \
  --value "$FEE" \
  --rpc-url "$RPC_URL" \
  --private-key "$DEPLOYER_PK"

# 2) broadcast the Arachnid presigned raw tx
cast publish "$RAW_TX" --rpc-url "$RPC_URL"

# 3) verify: expect non-empty bytecode starting with 0x7fff...
FACTORY_CODE=$(cast code "$FACTORY" --rpc-url "$RPC_URL")
if [ "$FACTORY_CODE" = "0x" ]; then
  echo "🏭❌ Nick Factory was not deployed at address $FACTORY on RPC $RPC_URL."
  exit 1
else
  echo "🏭✅ Nick Factory deployed successfully at address $FACTORY on RPC $RPC_URL."
  exit 0
fi
