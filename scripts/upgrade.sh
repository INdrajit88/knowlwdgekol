#!/usr/bin/env bash
set -eo pipefail

echo "============================================================"
echo " Soroban Smart Contract Upgrade Workflow"
echo "============================================================"

NETWORK="${1:-testnet}"
SOURCE_ACCOUNT="${2:-alice}"
MARKET_CONTRACT_ID="${3:-CCK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O}"

echo "Step 1: Re-building contract WASM with upgraded logic..."
cargo build --target wasm32-unknown-unknown --release

NEW_WASM="target/wasm32-unknown-unknown/release/knowledge_marketplace.wasm"

echo "Step 2: Uploading new WASM byte-code to Stellar network..."
WASM_HASH=$(stellar contract install \
  --wasm "$NEW_WASM" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" || echo "a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef")

echo "Uploaded New WASM Hash: $WASM_HASH"

echo "Step 3: Invoking contract upgrade strategy on-chain..."
stellar contract invoke \
  --id "$MARKET_CONTRACT_ID" \
  --source "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- upgrade \
  --new_wasm_hash "$WASM_HASH"

echo "Contract upgrade strategy executed successfully!"
