// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import {Address} from "@openzeppelin/contracts/utils/Address.sol";

import "../../../contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol";
import "../../../contracts/Mocks/NonPayableFallback.sol";
import "../../../contracts/Mocks/FallbackInitializer.sol";
import "../../../contracts/LSP0ERC725Account/LSP0ERC725Account.sol";
import "../../../contracts/LSP0ERC725Account/LSP0ERC725AccountInit.sol";

contract LSP16UniversalProfileTest is Test {
    LSP16UniversalFactory public lsp16;
    NonPayableFallback public nonPayableFallbackContract;
    FallbackInitializer public fallbackInitializer;
    LSP0ERC725Account public lsp0;
    LSP0ERC725AccountInit public lsp0Init;

    bytes public nonPayableFallbackBytecode =
        type(NonPayableFallback).creationCode;

    bytes32 public uniqueInitializableSalt;
    bytes32 public uniqueNonInitializableSalt;
    bytes public initializeCallDataBytes =
        abi.encodePacked(block.timestamp, block.difficulty, block.number);
    bytes32 public randomBytes32ForSalt = keccak256(initializeCallDataBytes);

    uint256 public testCounter;

    function setUp() public {
        lsp16 = new LSP16UniversalFactory();

        nonPayableFallbackContract = new NonPayableFallback();
        fallbackInitializer = new FallbackInitializer();
        lsp0Init = new LSP0ERC725AccountInit();
        lsp0 = new LSP0ERC725Account(address(20));

        uniqueInitializableSalt = lsp16.generateSalt(
            randomBytes32ForSalt,
            true,
            initializeCallDataBytes
        );
        uniqueNonInitializableSalt = lsp16.generateSalt(
            randomBytes32ForSalt,
            false,
            ""
        );
    }

    // testing that salt initialized with initializable == true cannot be the same as one with initializable == false
    function testInitializableSaltAlwaysUnique(
        bytes memory initializeCallData,
        bytes32 providedSalt
    ) public view {
        bytes32 salt = lsp16.generateSalt(
            providedSalt,
            false,
            initializeCallData
        );
        assert(salt != uniqueInitializableSalt);
    }

    // testing that salt initialized with initializable == false cannot be the same as one with initializable == true
    function testNonInitializableSaltAlwaysUnique(
        bytes memory initializeCallData,
        bytes32 providedSalt
    ) public view {
        bytes32 salt = lsp16.generateSalt(
            providedSalt,
            true,
            initializeCallData
        );
        assert(salt != uniqueNonInitializableSalt);
    }

    // testing that with when initializeCallDataBytes is different salt cannot be the same
    function testSaltAlwaysUniqueWithDifferentRandomBytes(
        bytes memory initializeCallData
    ) public view {
        if (keccak256(initializeCallDataBytes) == keccak256(initializeCallData))
            return;
        bytes32 salt = lsp16.generateSalt(
            randomBytes32ForSalt,
            true,
            initializeCallData
        );
        assert(salt != uniqueInitializableSalt);
    }

    // testing that when randomBytes32ForSalt is different salt cannot be the same
    function testSaltAlwaysUniqueWithDifferentRandomSalt(
        bytes32 providedSalt
    ) public view {
        if (randomBytes32ForSalt == providedSalt) return;
        bytes32 salt = lsp16.generateSalt(
            providedSalt,
            true,
            initializeCallDataBytes
        );
        assert(salt != uniqueInitializableSalt);
    }

    function testdeployERC1167ProxyWithUPInit() public {
        bytes32 salt = lsp16.generateSalt(bytes32(++testCounter), false, "");

        (bool success, bytes memory returnData) = address(lsp16).call(
            abi.encodeWithSignature(
                "deployERC1167Proxy(address,bytes32)",
                address(lsp0Init),
                salt
            )
        );
        Address.verifyCallResult(
            success,
            returnData,
            "call should have succeeded"
        );
    }

    function testdeployERC1167ProxyAndInitializeShouldNotKeepValueWithUPInit(
        uint256 valueToTransfer,
        bytes memory initializeCalldata
    ) public {
        vm.deal(address(this), valueToTransfer);

        assert(address(this).balance == valueToTransfer);

        bytes32 salt = lsp16.generateSalt(
            bytes32(++testCounter),
            true,
            initializeCalldata
        );
        bytes memory lsp0Initbytes = abi.encodeWithSignature(
            "initialize(address)",
            address(this)
        );

        (bool success, bytes memory returndata) = address(lsp16).call{
            value: valueToTransfer
        }(
            abi.encodeWithSignature(
                "deployERC1167ProxyAndInitialize(address,bytes32,bytes)",
                address(lsp0Init),
                salt,
                lsp0Initbytes
            )
        );
        Address.verifyCallResult(
            success,
            returndata,
            "call should have succeeded"
        );
        assert(address(lsp16).balance == 0);
    }

    function testDeployCreate2ShouldNotKeepValueWithUP(
        uint256 valueToTransfer
    ) public {
        vm.deal(address(this), valueToTransfer);
        assert(address(this).balance == valueToTransfer);

        bytes32 salt = lsp16.generateSalt(bytes32(++testCounter), false, "");

        (bool success, bytes memory returnData) = address(lsp16).call{
            value: valueToTransfer
        }(
            abi.encodeWithSignature(
                "deployCreate2(bytes,bytes32)",
                abi.encodePacked(
                    type(LSP0ERC725Account).creationCode,
                    abi.encode(address(this))
                ),
                salt
            )
        );
        Address.verifyCallResult(
            success,
            returnData,
            "call should have succeeded"
        );
        require(
            address(lsp16).balance == 0,
            "LSP16 should not have any balance"
        );
    }

    function testdeployCreate2AndInitializeShouldNotKeepValueWithUPInit(
        uint128 valueForInitializer,
        bytes4 initilializerBytes
    ) public {
        vm.deal(address(this), valueForInitializer);
        assert(address(this).balance == valueForInitializer);

        bytes32 salt = lsp16.generateSalt(
            bytes32(++testCounter),
            true,
            bytes("randomBytes")
        );

        (bool success, bytes memory returndata) = address(lsp16).call{
            value: valueForInitializer
        }(
            abi.encodeWithSignature(
                "deployCreate2AndInitialize(bytes,bytes32,bytes,uint256,uint256)",
                type(LSP0ERC725AccountInit).creationCode,
                salt,
                _removeRandomByteFromBytes4(initilializerBytes),
                0, // constructor is not payable
                valueForInitializer
            )
        );
        Address.verifyCallResult(
            success,
            returndata,
            "call should have succeeded"
        );
        require(
            address(lsp16).balance == 0,
            "LSP16 should not have any balance"
        );
    }

    function testdeployERC1167ProxyShouldNotKeepValueWithNonPayableFallback(
        uint256 valueToTransfer
    ) public {
        vm.deal(address(this), valueToTransfer);

        assert(address(this).balance == valueToTransfer);

        (bool success, ) = address(lsp16).call{value: valueToTransfer}(
            abi.encodeWithSignature(
                "deployERC1167Proxy(address,bytes32)",
                address(nonPayableFallbackContract),
                abi.encodePacked("fallback()")
            )
        );
        if (success && valueToTransfer > 0) {
            revert("call should have failed");
        }

        require(
            address(lsp16).balance == 0,
            "LSP16 should not have any balance"
        );
    }

    function testdeployERC1167ProxyAndInitializeShouldNotKeepValueWithNonPayableFallback(
        uint256 valueToTransfer
    ) public {
        vm.deal(address(this), valueToTransfer);

        assert(address(this).balance == valueToTransfer);

        bytes memory initializeCalldata = abi.encodePacked(
            "initialize(address)",
            address(this)
        );
        bytes32 salt = lsp16.generateSalt(
            bytes32(++testCounter),
            true,
            initializeCalldata
        );

        (bool success, ) = address(lsp16).call{value: valueToTransfer}(
            abi.encodeWithSignature(
                "deployERC1167ProxyAndInitialize(address,bytes32,bytes)",
                address(lsp0Init),
                salt,
                initializeCalldata
            )
        );
        if (success && valueToTransfer > 0) {
            revert("call should have failed");
        }

        require(
            address(lsp16).balance == 0,
            "LSP16 should not have any balance"
        );
    }

    function testDeployCreate2ShouldNotKeepValueWithNonPayableFallback(
        uint256 valueToTransfer
    ) public {
        vm.deal(address(this), valueToTransfer);

        assert(address(this).balance == valueToTransfer);

        (bool success, ) = address(lsp16).call{value: valueToTransfer}(
            abi.encodeWithSignature(
                "deployCreate2(address,bytes32)",
                nonPayableFallbackBytecode,
                bytes32(0)
            )
        );
        if (success && valueToTransfer > 0) {
            revert("call should have failed");
        }

        require(
            address(lsp16).balance == 0,
            "LSP16 should not have any balance"
        );
    }

    function testdeployCreate2AndInitializeShouldNotKeepValueWithNonPayableFallback(
        uint128 valueForConstructor,
        uint128 valueForInitializer,
        bytes calldata initializeCalldata
    ) public {
        uint256 valueToTransfer = uint256(valueForConstructor) +
            uint256(valueForInitializer);

        vm.deal(address(this), valueToTransfer);
        assert(address(this).balance == valueToTransfer);

        bytes32 salt = lsp16.generateSalt(
            bytes32(++testCounter),
            true,
            initializeCalldata
        );

        (bool success, ) = address(lsp16).call{value: valueToTransfer}(
            abi.encodeWithSignature(
                "deployCreate2AndInitialize(bytes,bytes32,bytes,uint256,uint256)",
                type(NonPayableFallback).creationCode,
                salt,
                initializeCalldata,
                valueForConstructor,
                bytes("fallback()")
            )
        );
        if (success && valueToTransfer > 0) {
            revert("call should have failed");
        }
        require(
            address(lsp16).balance == 0,
            "LSP16 should not have any balance"
        );
    }

    function testcomputeAddressShouldReturnCorrectUPAddressWithdeployCreate2AndInitialize(
        bytes32 providedSalt,
        uint256 valueForInitializer,
        bytes4 initilializerBytes
    ) public {
        vm.deal(address(this), valueForInitializer);
        assert(address(this).balance == valueForInitializer);

        bytes memory initializeCallData = _removeRandomByteFromBytes4(
            initilializerBytes
        );

        address expectedAddress = lsp16.computeAddress(
            keccak256(type(LSP0ERC725AccountInit).creationCode),
            providedSalt,
            true,
            initializeCallData
        );
        (bool success, bytes memory returnedData) = address(lsp16).call{
            value: valueForInitializer
        }(
            abi.encodeWithSignature(
                "deployCreate2AndInitialize(bytes,bytes32,bytes,uint256,uint256)",
                type(LSP0ERC725AccountInit).creationCode,
                providedSalt,
                initializeCallData,
                0,
                valueForInitializer
            )
        );

        Address.verifyCallResult(
            success,
            returnedData,
            "call should have succeeded"
        );

        address returnedAddress = abi.decode(returnedData, (address));
        assert(expectedAddress == returnedAddress);
    }

    function testcomputeAddressShouldReturnCorrectUPAddressWithDeployCreate2(
        bytes32 providedSalt,
        uint256 valueForConstructor
    ) public {
        vm.deal(address(this), valueForConstructor);
        assert(address(this).balance == valueForConstructor);

        address expectedAddress = lsp16.computeAddress(
            keccak256(
                abi.encodePacked(
                    type(LSP0ERC725Account).creationCode,
                    abi.encode(address(this))
                )
            ),
            providedSalt,
            false,
            ""
        );
        (bool success, bytes memory returnedData) = address(lsp16).call{
            value: valueForConstructor
        }(
            abi.encodeWithSignature(
                "deployCreate2(bytes,bytes32)",
                abi.encodePacked(
                    type(LSP0ERC725Account).creationCode,
                    abi.encode(address(this))
                ),
                providedSalt
            )
        );
        Address.verifyCallResult(
            success,
            returnedData,
            "call should have succeeded"
        );

        address returnedAddress = abi.decode(returnedData, (address));
        assert(expectedAddress == returnedAddress);
    }

    function testcomputeERC1167AddressWithdeployERC1167ProxyAndInitialize(
        bytes32 providedSalt,
        uint256 valueForInitializer,
        bytes4 initilializerBytes
    ) public {
        vm.deal(address(this), valueForInitializer);
        assert(address(this).balance == valueForInitializer);

        bytes memory initializeCallData = _removeRandomByteFromBytes4(
            initilializerBytes
        );

        address expectedAddress = lsp16.computeERC1167Address(
            address(lsp0Init),
            providedSalt,
            true,
            initializeCallData
        );
        (bool success, bytes memory returnedData) = address(lsp16).call{
            value: valueForInitializer
        }(
            abi.encodeWithSignature(
                "deployERC1167ProxyAndInitialize(address,bytes32,bytes)",
                address(lsp0Init),
                providedSalt,
                initializeCallData
            )
        );
        Address.verifyCallResult(
            success,
            returnedData,
            "call should have succeeded"
        );

        address returnedAddress = abi.decode(returnedData, (address));
        assert(expectedAddress == returnedAddress);
    }

    function testcomputeERC1167AddressWithdeployERC1167Proxy(
        bytes32 providedSalt
    ) public {
        address expectedAddress = lsp16.computeERC1167Address(
            address(lsp0),
            providedSalt,
            false,
            ""
        );
        (bool success, bytes memory returnedData) = address(lsp16).call(
            abi.encodeWithSignature(
                "deployERC1167Proxy(address,bytes32)",
                address(lsp0),
                providedSalt
            )
        );
        Address.verifyCallResult(
            success,
            returnedData,
            "call should have succeeded"
        );

        address returnedAddress = abi.decode(returnedData, (address));
        assert(expectedAddress == returnedAddress);
    }

    /**
     * @dev Randomly removes one byte from the input bytes4 .
     * @param input The bytes4 input to remove byte from
     * @return result The new bytes which is a bytes array of length 3, it is the input bytes4 but one byte removed randomly
     */
    function _removeRandomByteFromBytes4(
        bytes4 input
    ) internal view returns (bytes memory) {
        uint256 randomByteIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp))
        ) % 4;
        bytes memory result = new bytes(3);
        for (uint8 i = 0; i < 3; i++) {
            if (i < randomByteIndex) {
                result[i] = input[i];
            } else {
                result[i] = input[i + 1];
            }
        }
        return result;
    }
}
