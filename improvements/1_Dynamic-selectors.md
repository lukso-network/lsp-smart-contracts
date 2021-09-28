# Improvement 1 - Use computed function selectors

## Problem

Currently, function selectors for the ERC725 / LSP3 account (setData, execute, transferOwnership) are hardcoded in the KeyManager.
This might cause conflict. The selectors on the actual ERC725 / LSP3 contract might not match if:
- an extended version of ERC725 is used: sinc these 3 functions are marked as `virtual`, they can be overwritten with different param types. This would then change their function selectors)
- the core ERC725 contract (X or Y) introduces new breaking change.

This lead to make it hard to keep track of them manually.

## Proposed Solution

Define these variables as `immutable` and compute their value using the Solidity syntax `account.setData.selector`

## What has changed?

- Selectors are now defined as `account.setData.selector`, instead of being hardcoded
- The `account` variable is now of type `ERC725`, not `ERC725Y` (see also constructor / initiliazer)
- The `account` variable is wrapped around `ERC725Y` so that it can be used by the library `ERC725Utils`

## To test

- [x] do all the tests pass after changing the code?
- [] more tests to check if the selectors retrieved by Solidity match.