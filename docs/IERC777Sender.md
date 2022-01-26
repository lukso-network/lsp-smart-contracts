# IERC777Sender







*Interface of the ERC777TokensSender standard as defined in the EIP. {IERC777} Token holders can be notified of operations performed on their tokens by having a contract implement this interface (contract holders can be their own implementer) and registering it on the https://eips.ethereum.org/EIPS/eip-1820[ERC1820 global registry]. See {IERC1820Registry} and {ERC1820Implementer}.*

## Methods

### tokensToSend

```solidity
function tokensToSend(address operator, address from, address to, uint256 amount, bytes userData, bytes operatorData) external nonpayable
```



*Called by an {IERC777} token contract whenever a registered holder&#39;s (`from`) tokens are about to be moved or destroyed. The type of operation is conveyed by `to` being the zero address or not. This call occurs _before_ the token contract&#39;s state is updated, so {IERC777-balanceOf}, etc., can be used to query the pre-operation state. This function may revert to prevent the operation from being executed.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| operator | address | undefined
| from | address | undefined
| to | address | undefined
| amount | uint256 | undefined
| userData | bytes | undefined
| operatorData | bytes | undefined




