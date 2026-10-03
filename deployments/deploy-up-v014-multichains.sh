#!/usr/bin/env bash
set -Eeuo pipefail

: "${DEPLOYER_PK:?DEPLOYER_PK must be exported}"

CHAINS_WITH_ERRORS=()

deployToEvmChain() {
    local RPC_URL=$1
    local CHAIN_ID=$2
    local CHAIN_NAME=$3
    local HAD_ERRORS=false

    echo "⛓️ Deploying Universal Profile Stack to $CHAIN_NAME"

    if FOUNDRY_PROFILE=deployments forge script deployments/scripts/DeployUniversalProfileStack.s.sol \
        --rpc-url "$RPC_URL" --broadcast --private-key "$DEPLOYER_PK"; then
        if ! bash deployments/write-deployment-records.sh --chain-id "$CHAIN_ID" --rpc-url "$RPC_URL"; then
            echo "⚠️ Failed to write Universal Profile deployment records for $CHAIN_NAME; continuing."
            HAD_ERRORS=true
        fi

        if ! bash deployments/verify-contract.sh --all-up-contracts --chain "$CHAIN_NAME"; then
            echo "⚠️ Universal Profile verification failed for $CHAIN_NAME; continuing."
            HAD_ERRORS=true
        fi
    else
        echo "❌ Universal Profile deployment failed for $CHAIN_NAME; continuing with token deployments."
        HAD_ERRORS=true
    fi

    echo "⛓️ Deploying Token Implementation Contracts to $CHAIN_NAME"

    if FOUNDRY_PROFILE=deployments forge script deployments/scripts/DeployTokenImplementationContracts.s.sol \
        --rpc-url "$RPC_URL" --broadcast --private-key "$DEPLOYER_PK"; then
        if ! bash deployments/write-deployment-records.sh --chain-id "$CHAIN_ID" --rpc-url "$RPC_URL"; then
            echo "⚠️ Failed to write token deployment records for $CHAIN_NAME; continuing."
            HAD_ERRORS=true
        fi

        if ! bash deployments/verify-contract.sh --all-token-contracts --chain "$CHAIN_NAME"; then
            echo "⚠️ Token verification failed for $CHAIN_NAME; continuing."
            HAD_ERRORS=true
        fi
    else
        echo "❌ Token deployment failed for $CHAIN_NAME; continuing with the next chain."
        HAD_ERRORS=true
    fi

    if [[ "$HAD_ERRORS" == true ]]; then
        CHAINS_WITH_ERRORS+=("$CHAIN_NAME")
        echo "⚠️ Finished $CHAIN_NAME with errors."
    else
        echo "✅ Deployed and verified all contracts on $CHAIN_NAME."
    fi

    echo "--------------------------------------------------"
}

# Add the a list of RPC URLs, chain ID, and chain name as follows to deploy across multiple chains at once:
# ----------------------------------------------------------
# deployToEvmChain "https://mainnet.megaeth.com/rpc" 4326 "MegaETH"
# deployToEvmChain "https://rpc.monad.xyz" 143 "Monad"
# deployToEvmChain "https://rpc.katanarpc.com/" 747474 "Katana" 
# deployToEvmChain "https://rpc.plume.org" 98866 "Plume Mainnet" 
# deployToEvmChain "https://mainnet.mode.network/" 34443 "Mode"
# deployToEvmChain "https://evmrpc.0g.ai" 16661 "0G Mainnet"
# ...

if (( ${#CHAINS_WITH_ERRORS[@]} > 0 )); then
    echo "⚠️ All chains were processed, but these chains had errors:"
    printf '  - %s\n' "${CHAINS_WITH_ERRORS[@]}"
else
    echo "✅ All chains were processed successfully."
fi
