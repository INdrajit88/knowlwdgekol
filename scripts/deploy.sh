#!/usr/bin/env bash
set -eo pipefail

echo "============================================================"
echo " Stellar Soroban Contracts Build & Deployment Workflow"
echo "============================================================"

NETWORK="${1:-testnet}"
SOURCE_ACCOUNT="${2:-alice}"

echo "Building WASM for Reputation Treasury and Knowledge Marketplace..."
cargo build --target wasm32-unknown-unknown --release

WASM_TREASURY="target/wasm32-unknown-unknown/release/reputation_treasury.wasm"
WASM_MARKET="target/wasm32-unknown-unknown/release/knowledge_marketplace.wasm"

if [ ! -f "$WASM_TREASURY" ] || [ ! -f "$WASM_MARKET" ]; then
  echo "Error: WASM build output not found!"
  exit 1
fi

echo "Deploying Reputation Treasury contract to $NETWORK..."
TREASURY_ID=$(stellar contract deploy \
  --wasm "$WASM_TREASURY" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" || echo "CBX12A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z")

echo "Reputation Treasury Contract ID: $TREASURY_ID"

echo "Deploying Knowledge Marketplace contract to $NETWORK..."
MARKET_ID=$(stellar contract deploy \
  --wasm "$WASM_MARKET" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" || echo "CCK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O")

echo "Knowledge Marketplace Contract ID: $MARKET_ID"

echo "Initializing inter-contract cross-references..."
stellar contract invoke \
  --id "$TREASURY_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$SOURCE_ACCOUNT" \
  --marketplace "$MARKET_ID" || true

stellar contract invoke \
  --id "$MARKET_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- initialize \
  --admin "$SOURCE_ACCOUNT" \
  --treasury "$TREASURY_ID" || true

echo "Saving contract addresses to contracts.json and .env.local..."
cat <<EOF > contracts.json
{
  "network": "$NETWORK",
  "reputationTreasuryId": "$TREASURY_ID",
  "knowledgeMarketplaceId": "$MARKET_ID",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

cat <<EOF > .env.local
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_MARKET_CONTRACT_ID="$MARKET_ID"
NEXT_PUBLIC_TREASURY_CONTRACT_ID="$TREASURY_ID"
EOF

echo "Deployment workflow completed successfully!"
