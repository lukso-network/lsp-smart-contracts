// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title contract to deploy contracts with precomputed addresses, using create2 opcode
 * based on https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Create2.sol
 */
contract Create2Factory {
    event ContractCreated(address addr, bytes32 salt);

    /**
     * @dev Deploys a contract using `CREATE2`. The address where the contract
     * will be deployed can be known in advance via {computeAddress}.
     *
     * The bytecode for a contract can be obtained from Solidity with
     * `type(contractName).creationCode`.
     *
     * Requirements:
     *
     * - `bytecode` must not be empty.
     * - `salt` must have not been used for `bytecode` already.
     */
    function deploy(bytes32 salt, bytes memory bytecode) public payable returns (address) {
        address addr;
        uint256 amount = msg.value;

        require(bytecode.length != 0, "Create2: bytecode length is zero");
        // solhint-disable-next-line no-inline-assembly
        assembly {
            addr := create2(amount, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");

        emit ContractCreated(addr, salt);

        return addr;
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via {deploy}. Any change in the
     * `bytecodeHash` or `salt` will result in a new destination address.
     */
    function computeAddress(bytes32 salt, bytes32 bytecodeHash) public view returns (address) {
        return computeAddress(salt, bytecodeHash, address(this));
    }
 
    /**
     * @dev Returns the address where a contract will be stored if deployed via {deploy} from a contract located at
     * `deployer`. If `deployer` is this contract's address, returns the same value as {computeAddress}.
     */
    function computeAddress(bytes32 salt, bytes32 bytecodeHash, address deployer) public pure returns (address) {
        bytes32 _data = keccak256(
            abi.encodePacked(bytes1(0xff), deployer, salt, bytecodeHash)
        );
        return address(uint160(uint256(_data)));
    }
}