# TargetContract







*sample contract to test interaction + state changes:      - directly from Universal Profile      - via KeyManager &gt; UniversalProfile also used to test permissions ALLOWEDADDRESS and ALLOWEDSTANDARDS*

## Methods

### getName

```solidity
function getName() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined

### getNumber

```solidity
function getNumber() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined

### revertCall

```solidity
function revertCall() external pure
```






### setName

```solidity
function setName(string _name) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _name | string | undefined

### setNumber

```solidity
function setNumber(uint256 _newNumber) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _newNumber | uint256 | undefined




