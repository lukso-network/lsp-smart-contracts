// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

/// @dev CREATE2 factory - Deterministic Deployment Proxy
/// Also known as EIP7997 or "Nick Factory"
/// For technical details, see: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-7997.md
address constant NICK_FACTORY_ADDRESS = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

/// @dev CREATE2 factory bytecode
/// Note: the factory expects the calldata to be the creation bytecode
/// (followed by the salt, which is not used in this implementation)
/// -------------------------------------------------------------
/// Yul assembly code equivalent:
/// -------------------------------------------------------------
/// ```yul
/// calldatacopy(0, 32, sub(calldatasize(), 32))
/// let result := create2(callvalue(), 0, sub(calldatasize(), 32), calldataload(0))
/// if iszero(result) { revert(0, 0) }
/// mstore(0, result)
/// return(12, 20)
/// ```
/// -------------------------------------------------------------
/// EVM opcodes:
/// -------------------------------------------------------------
/// offset  opcode  operand
/// [00]	PUSH32	ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0
/// [21]	CALLDATASIZE
/// [22]	ADD
/// [23]	PUSH1	00
/// [25]	DUP2
/// [26]	PUSH1	20
/// [28]	DUP3
/// [29]	CALLDATACOPY
/// [2a]	DUP1
/// [2b]	CALLDATALOAD
/// [2c]	DUP3
/// [2d]	DUP3
/// [2e]	CALLVALUE
/// [2f]	CREATE2
/// [30]	DUP1
/// [31]	ISZERO
/// [32]	ISZERO
/// [33]	PUSH1	39
/// [35]	JUMPI
/// [36]	DUP2
/// [37]	DUP3
/// [38]	REVERT
/// [39]	JUMPDEST
/// [3a]	DUP1
/// [3b]	DUP3
/// [3c]	MSTORE
/// [3d]	POP
/// [3e]	POP
/// [3f]	POP
/// [40]	PUSH1	14
/// [42]	PUSH1	0c
/// [44]	RETURN
/// -------------------------------------------------------------
bytes constant NICK_FACTORY_BYTECODE = hex"7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3";
