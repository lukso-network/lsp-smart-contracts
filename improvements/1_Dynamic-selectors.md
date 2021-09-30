# Improvement 1 - Use computed function selectors

## Problem

Currently, ERC725 Account's function selectors (`setData`, `execute`, `transferOwnership`) are hardcoded in the KeyManager.
This might cause conflict in the future. 

The selectors on the actual ERC725 / LSP3 contract might not match if **the core ERC725 contract (X or Y) introduces new breaking change.**.

There would be the need to recalculate + add the new selectors manually every time ERC725 changes.
This makes it hard to keep track of.

## Proposed Solution

Define these variables as `immutable` and compute their value using the Solidity syntax `account.setData.selector`

## What has changed?

- Selectors are now defined as `account.setData.selector`, instead of being hardcoded
- The `account` variable is now of type `ERC725`, not `ERC725Y` (so to compute the selectors of both X and Y)
- The `account` variable is wrapped around `ERC725Y` so it can be used by the `ERC725Utils` library

## To test

- [x] do all the tests pass after changing the code?
- [] more tests to check if the selectors retrieved by Solidity match.