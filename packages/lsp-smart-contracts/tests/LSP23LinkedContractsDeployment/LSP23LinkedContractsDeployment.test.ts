import { ethers } from 'hardhat';
import { expect } from 'chai';

import {
  KeyManagerWithExtraParams,
  LSP6KeyManager,
  UniversalProfile,
  ILSP23LinkedContractsFactory,
} from '../../typechain';

import { ERC725YDataKeys } from '../../constants';
import {
  calculateProxiesAddresses,
  create16BytesUint,
  createDataKey,
  deployImplementationContracts,
} from './helpers';
import { EventLog } from 'ethers';

describe('UniversalProfileDeployer', function () {
  describe('for non-proxies deployment', async function () {
    it('should deploy both contract (with no value)', async function () {
      const [allPermissionsSigner, universalReceiver, recoverySigner] = await ethers.getSigners();

      const KeyManagerFactory = await ethers.getContractFactory(
        '@lukso/lsp6-contracts/contracts/LSP6KeyManager.sol:LSP6KeyManager',
      );
      const UniversalProfileFactory = await ethers.getContractFactory(
        '@lukso/universalprofile-contracts/contracts/UniversalProfile.sol:UniversalProfile',
      );

      const keyManagerBytecode = KeyManagerFactory.bytecode;
      const universalProfileBytecode = UniversalProfileFactory.bytecode;

      const { upPostDeploymentModule, LSP23LinkedContractsFactory } =
        await deployImplementationContracts();

      // universalProfileCreationCode = universalProfileBytecode + abi encoded address of upInitPostDeploymentModule
      const universalProfileCreationCode =
        universalProfileBytecode +
        ethers.AbiCoder.defaultAbiCoder()
          .encode(['address'], [await upPostDeploymentModule.getAddress()])
          .slice(2);

      const salt = ethers.randomBytes(32);

      const primaryContractDeployment: ILSP23LinkedContractsFactory.PrimaryContractDeploymentStruct =
        {
          salt,
          fundingAmount: 0,
          creationBytecode: universalProfileCreationCode,
        };

      const secondaryContractDeployment: ILSP23LinkedContractsFactory.SecondaryContractDeploymentStruct =
        {
          fundingAmount: ethers.toBigInt(0),
          creationBytecode: keyManagerBytecode,
          addPrimaryContractAddress: true,
          extraConstructorParams: '0x',
        };

      const recoveryAddressPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        recoverySigner.address,
      );
      const universalReceiverPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        universalReceiver.address,
      );
      const allPermissionsSignerPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        allPermissionsSigner.address,
      );

      const allPermissionsSignerPermissionsValue =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const types = ['bytes32[]', 'bytes[]'];

      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [
          ERC725YDataKeys.LSP3.LSP3Profile, // LSP3Metadata
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate, // URD Address
          universalReceiverPermissionsKey, // URD Permissions
          recoveryAddressPermissionsKey, // Recovery Address permissions
          allPermissionsSignerPermissionsKey, // Signers permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length, // Number of address with permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(0), // Index of the first address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(1), // Index of the second address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(2), // Index of the third address
        ],
        [
          ethers.randomBytes(32), // LSP3Metadata
          universalReceiver.address, // URD Address
          allPermissionsSignerPermissionsValue, // URD Permissions
          allPermissionsSignerPermissionsValue, // Recovery Address permissions
          allPermissionsSignerPermissionsValue, // Signers permissions
          ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [3]), // Address Permissions array length
          universalReceiver.address,
          recoverySigner.address,
          allPermissionsSigner.address,
        ],
      ]);

      // get the address of the UP and the KeyManager contracts
      const [upContract, keyManagerContract] =
        await LSP23LinkedContractsFactory.deployContracts.staticCall(
          primaryContractDeployment,
          secondaryContractDeployment,
          await upPostDeploymentModule.getAddress(),
          encodedBytes,
        );

      await LSP23LinkedContractsFactory.deployContracts(
        primaryContractDeployment,
        secondaryContractDeployment,
        await upPostDeploymentModule.getAddress(),
        encodedBytes,
        {
          // Need to specify gasLimit, otherwise Hardhat reverts strangely with the following error:
          // InvalidInputError: Transaction gas limit is 30915224 and exceeds block gas limit of 30000000
          gasLimit: 30_000_000,
        },
      );

      const [expectedUpAddress, expectedKeyManagerAddress] =
        await LSP23LinkedContractsFactory.computeAddresses(
          primaryContractDeployment,
          secondaryContractDeployment,
          await upPostDeploymentModule.getAddress(),
          encodedBytes,
        );

      expect(upContract).to.equal(expectedUpAddress);
      expect(keyManagerContract).to.equal(expectedKeyManagerAddress);

      const keyManagerInstance = KeyManagerFactory.attach(
        keyManagerContract,
      ) as unknown as LSP6KeyManager;
      const universalProfileInstance = UniversalProfileFactory.attach(
        upContract,
      ) as unknown as UniversalProfile;

      // CHECK that the UP is owned by the KeyManager contract
      expect(await universalProfileInstance.owner()).to.equal(keyManagerContract);

      // CHECK that the `target()` of the KeyManager contract is the UP contract
      expect(await keyManagerInstance['target()'].staticCall()).to.equal(upContract);
    });

    it('should deploy both contract (with value)', async function () {
      const [allPermissionsSigner, universalReceiver, recoverySigner] = await ethers.getSigners();

      const universalProfileFundAmount = ethers.parseEther('1');

      const keyManagerBytecode = (
        await ethers.getContractFactory(
          '@lukso/lsp6-contracts/contracts/LSP6KeyManager.sol:LSP6KeyManager',
        )
      ).bytecode;
      const universalProfileBytecode = (
        await ethers.getContractFactory(
          '@lukso/universalprofile-contracts/contracts/UniversalProfile.sol:UniversalProfile',
        )
      ).bytecode;

      const { upPostDeploymentModule, LSP23LinkedContractsFactory } =
        await deployImplementationContracts();

      // universalProfileCreationCode = universalProfileBytecode + abi encoded address of upInitPostDeploymentModule
      const universalProfileCreationCode =
        universalProfileBytecode +
        ethers.AbiCoder.defaultAbiCoder()
          .encode(['address'], [await upPostDeploymentModule.getAddress()])
          .slice(2);

      const salt = ethers.randomBytes(32);

      const primaryContractDeployment: ILSP23LinkedContractsFactory.PrimaryContractDeploymentStruct =
        {
          salt,
          fundingAmount: universalProfileFundAmount,
          creationBytecode: universalProfileCreationCode,
        };

      const secondaryContractDeployment: ILSP23LinkedContractsFactory.SecondaryContractDeploymentStruct =
        {
          fundingAmount: 0,
          creationBytecode: keyManagerBytecode,
          addPrimaryContractAddress: true,
          extraConstructorParams: '0x',
        };

      const recoveryAddressPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        recoverySigner.address,
      );
      const universalReceiverPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        universalReceiver.address,
      );
      const allPermissionsSignerPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        allPermissionsSigner.address,
      );

      const allPermissionsSignerPermissionsValue =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const types = ['bytes32[]', 'bytes[]'];

      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [
          ERC725YDataKeys.LSP3.LSP3Profile, // LSP3Metadata
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate, // URD Address
          universalReceiverPermissionsKey, // URD Permissions
          recoveryAddressPermissionsKey, // Recovery Address permissions
          allPermissionsSignerPermissionsKey, // Signers permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length, // Number of address with permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(0), // Index of the first address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(1), // Index of the second address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(2), // Index of the third address
        ],
        [
          ethers.randomBytes(32), // LSP3Metadata
          universalReceiver.address, // URD Address
          allPermissionsSignerPermissionsValue, // URD Permissions
          allPermissionsSignerPermissionsValue, // Recovery Address permissions
          allPermissionsSignerPermissionsValue, // Signers permissions
          ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [3]), // Address Permissions array length
          universalReceiver.address,
          recoverySigner.address,
          allPermissionsSigner.address,
        ],
      ]);

      // get the address of the UP and the KeyManager contracts
      const [upContract, keyManagerContract] =
        await LSP23LinkedContractsFactory.deployContracts.staticCall(
          primaryContractDeployment,
          secondaryContractDeployment,
          await upPostDeploymentModule.getAddress(),
          encodedBytes,
          { value: universalProfileFundAmount },
        );

      const [expectedUpAddress, expectedKeyManagerAddress] =
        await LSP23LinkedContractsFactory.computeAddresses(
          primaryContractDeployment,
          secondaryContractDeployment,
          await upPostDeploymentModule.getAddress(),
          encodedBytes,
        );

      expect(upContract).to.equal(expectedUpAddress);

      expect(keyManagerContract).to.equal(expectedKeyManagerAddress);
    });
    it('should revert when values are wrong', async function () {
      const [allPermissionsSigner, universalReceiver, recoverySigner] = await ethers.getSigners();

      const universalProfileFundAmount = ethers.parseEther('1');

      const keyManagerBytecode = (
        await ethers.getContractFactory(
          '@lukso/lsp6-contracts/contracts/LSP6KeyManager.sol:LSP6KeyManager',
        )
      ).bytecode;
      const universalProfileBytecode = (
        await ethers.getContractFactory(
          '@lukso/universalprofile-contracts/contracts/UniversalProfile.sol:UniversalProfile',
        )
      ).bytecode;

      const { upPostDeploymentModule, LSP23LinkedContractsFactory } =
        await deployImplementationContracts();

      // universalProfileCreationCode = universalProfileBytecode + abi encoded address of upInitPostDeploymentModule
      const universalProfileCreationCode =
        universalProfileBytecode +
        ethers.AbiCoder.defaultAbiCoder()
          .encode(['address'], [await upPostDeploymentModule.getAddress()])
          .slice(2);

      const salt = ethers.randomBytes(32);

      const primaryContractDeployment: ILSP23LinkedContractsFactory.PrimaryContractDeploymentStruct =
        {
          salt,
          fundingAmount: universalProfileFundAmount,
          creationBytecode: universalProfileCreationCode,
        };

      const secondaryContractDeployment: ILSP23LinkedContractsFactory.SecondaryContractDeploymentStruct =
        {
          fundingAmount: 0,
          creationBytecode: keyManagerBytecode,
          addPrimaryContractAddress: true,
          extraConstructorParams: '0x',
        };

      const recoveryAddressPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        recoverySigner.address,
      );
      const universalReceiverPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        universalReceiver.address,
      );
      const allPermissionsSignerPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        allPermissionsSigner.address,
      );

      const allPermissionsSignerPermissionsValue =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const types = ['bytes32[]', 'bytes[]'];

      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [
          ERC725YDataKeys.LSP3.LSP3Profile, // LSP3Metadata
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate, // URD Address
          universalReceiverPermissionsKey, // URD Permissions
          recoveryAddressPermissionsKey, // Recovery Address permissions
          allPermissionsSignerPermissionsKey, // Signers permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length, // Number of address with permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(0), // Index of the first address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(1), // Index of the second address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(2), // Index of the third address
        ],
        [
          ethers.randomBytes(32), // LSP3Metadata
          universalReceiver.address, // URD Address
          allPermissionsSignerPermissionsValue, // URD Permissions
          allPermissionsSignerPermissionsValue, // Recovery Address permissions
          allPermissionsSignerPermissionsValue, // Signers permissions
          ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [3]), // Address Permissions array length
          universalReceiver.address,
          recoverySigner.address,
          allPermissionsSigner.address,
        ],
      ]);

      // get the address of the UP and the KeyManager contracts
      await expect(
        LSP23LinkedContractsFactory.deployContracts.staticCall(
          primaryContractDeployment,
          secondaryContractDeployment,
          await upPostDeploymentModule.getAddress(),
          encodedBytes,
          { value: universalProfileFundAmount + ethers.parseEther('0.1') },
        ),
      ).to.be.revertedWithCustomError(LSP23LinkedContractsFactory, 'InvalidValueSum');
    });
    it('should be able to deploy secondary contract with extra constructor params', async function () {
      const [allPermissionsSigner, universalReceiver, recoverySigner] = await ethers.getSigners();

      const KeyManagerFactory = await ethers.getContractFactory('KeyManagerWithExtraParams');
      const UniversalProfileFactory = await ethers.getContractFactory(
        '@lukso/universalprofile-contracts/contracts/UniversalProfile.sol:UniversalProfile',
      );

      let keyManagerBytecode = KeyManagerFactory.bytecode;
      const universalProfileBytecode = UniversalProfileFactory.bytecode;

      const { upPostDeploymentModule, LSP23LinkedContractsFactory } =
        await deployImplementationContracts();

      // universalProfileCreationCode = universalProfileBytecode + abi encoded address of upInitPostDeploymentModule
      const universalProfileCreationCode =
        universalProfileBytecode +
        ethers.AbiCoder.defaultAbiCoder()
          .encode(['address'], [await upPostDeploymentModule.getAddress()])
          .slice(2);

      const salt = ethers.randomBytes(32);

      const primaryContractDeployment: ILSP23LinkedContractsFactory.PrimaryContractDeploymentStruct =
        {
          salt,
          fundingAmount: 0,
          creationBytecode: universalProfileCreationCode,
        };

      const firstAddress = ethers.hexlify(ethers.randomBytes(20));

      const secondaryContractFirstParam = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address'],
        [firstAddress],
      );

      const lastAddress = ethers.hexlify(ethers.randomBytes(20));

      const secondaryContractLastParam = ethers.AbiCoder.defaultAbiCoder().encode(
        ['address'],
        [lastAddress],
      );

      keyManagerBytecode = keyManagerBytecode + secondaryContractFirstParam.slice(2);

      const secondaryContractDeployment: ILSP23LinkedContractsFactory.SecondaryContractDeploymentStruct =
        {
          fundingAmount: 0,
          creationBytecode: keyManagerBytecode,
          addPrimaryContractAddress: true,
          extraConstructorParams: secondaryContractLastParam,
        };

      const recoveryAddressPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        recoverySigner.address,
      );
      const universalReceiverPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        universalReceiver.address,
      );
      const allPermissionsSignerPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        allPermissionsSigner.address,
      );

      const allPermissionsSignerPermissionsValue =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const types = ['bytes32[]', 'bytes[]'];

      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [
          ERC725YDataKeys.LSP3.LSP3Profile, // LSP3Metadata
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate, // URD Address
          universalReceiverPermissionsKey, // URD Permissions
          recoveryAddressPermissionsKey, // Recovery Address permissions
          allPermissionsSignerPermissionsKey, // Signers permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length, // Number of address with permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(0), // Index of the first address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(1), // Index of the second address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(2), // Index of the third address
        ],
        [
          ethers.randomBytes(32), // LSP3Metadata
          universalReceiver.address, // URD Address
          allPermissionsSignerPermissionsValue, // URD Permissions
          allPermissionsSignerPermissionsValue, // Recovery Address permissions
          allPermissionsSignerPermissionsValue, // Signers permissions
          ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [3]), // Address Permissions array length
          universalReceiver.address,
          recoverySigner.address,
          allPermissionsSigner.address,
        ],
      ]);

      // get the address of the UP and the KeyManager contracts
      const [upContract, keyManagerContract] =
        await LSP23LinkedContractsFactory.deployContracts.staticCall(
          primaryContractDeployment,
          secondaryContractDeployment,
          await upPostDeploymentModule.getAddress(),
          encodedBytes,
        );

      await LSP23LinkedContractsFactory.deployContracts(
        primaryContractDeployment,
        secondaryContractDeployment,
        await upPostDeploymentModule.getAddress(),
        encodedBytes,
        {
          // Need to specify gasLimit, otherwise Hardhat reverts strangely with the following error:
          // InvalidInputError: Transaction gas limit is 30915224 and exceeds block gas limit of 30000000
          gasLimit: 30_000_000,
        },
      );

      const [expectedUpAddress, expectedKeyManagerAddress] =
        await LSP23LinkedContractsFactory.computeAddresses(
          primaryContractDeployment,
          secondaryContractDeployment,
          await upPostDeploymentModule.getAddress(),
          encodedBytes,
        );

      expect(upContract).to.equal(expectedUpAddress);
      expect(keyManagerContract).to.equal(expectedKeyManagerAddress);

      const keyManagerInstance = KeyManagerFactory.attach(
        keyManagerContract,
      ) as unknown as KeyManagerWithExtraParams;
      const universalProfileInstance = UniversalProfileFactory.attach(
        upContract,
      ) as unknown as UniversalProfile;

      // CHECK that the UP is owned by the KeyManager contract
      expect(await universalProfileInstance.owner()).to.equal(keyManagerContract);

      // CHECK that the `target()` of the KeyManager contract is the UP contract
      expect(await keyManagerInstance['target()'].staticCall()).to.equal(upContract);

      expect(await keyManagerInstance.FIRST_PARAM()).to.deep.equal(firstAddress);
      expect(await keyManagerInstance.LAST_PARAM()).to.deep.equal(lastAddress);
    });
  });
  describe('for proxies deployment', function () {
    it('should deploy proxies for Universal Profile and Key Manager', async function () {
      const [allPermissionsSigner, universalReceiver, recoverySigner] = await ethers.getSigners();

      const {
        keyManagerInit,
        universalProfileInit,
        LSP23LinkedContractsFactory,
        upInitPostDeploymentModule,
        UniversalProfileInitFactory,
        KeyManagerInitFactory,
      } = await deployImplementationContracts();

      const salt = ethers.randomBytes(32);

      const primaryContractDeploymentInit: ILSP23LinkedContractsFactory.PrimaryContractDeploymentInitStruct =
        {
          salt,
          fundingAmount: 0,
          implementationContract: await universalProfileInit.getAddress(),
          initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
            await upInitPostDeploymentModule.getAddress(),
          ]),
        };

      const secondaryContractDeploymentInit: ILSP23LinkedContractsFactory.SecondaryContractDeploymentInitStruct =
        {
          fundingAmount: 0,
          implementationContract: await keyManagerInit.getAddress(),
          addPrimaryContractAddress: true,
          initializationCalldata: '0xc4d66de8',
          extraInitializationParams: '0x',
        };

      const recoveryAddressPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        recoverySigner.address,
      );
      const universalReceiverPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        universalReceiver.address,
      );
      const allPermissionsSignerPermissionsKey = createDataKey(
        '0x4b80742de2bf82acb3630000',
        allPermissionsSigner.address,
      );

      const allPermissionsSignerPermissionsValue =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      const types = ['bytes32[]', 'bytes[]'];

      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [
          ERC725YDataKeys.LSP3.LSP3Profile, // LSP3Metadata
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate, // URD Address
          universalReceiverPermissionsKey, // URD Permissions
          recoveryAddressPermissionsKey, // Recovery Address permissions
          allPermissionsSignerPermissionsKey, // Signers permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].length, // Number of address with permissions
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(0), // Index of the first address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(1), // Index of the second address
          ERC725YDataKeys.LSP6['AddressPermissions[]'].index + create16BytesUint(2), // Index of the third address
        ],
        [
          ethers.randomBytes(32), // LSP3Metadata
          universalReceiver.address, // URD Address
          allPermissionsSignerPermissionsValue, // URD Permissions
          allPermissionsSignerPermissionsValue, // Recovery Address permissions
          allPermissionsSignerPermissionsValue, // Signers permissions
          ethers.AbiCoder.defaultAbiCoder().encode(['uint256'], [3]), // Address Permissions array length
          universalReceiver.address,
          recoverySigner.address,
          allPermissionsSigner.address,
        ],
      ]);

      // get the address of the UP and the KeyManager contracts
      const [upAddress, keyManagerAddress] =
        await LSP23LinkedContractsFactory.deployERC1167Proxies.staticCall(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
        );

      await LSP23LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        await upInitPostDeploymentModule.getAddress(),
        encodedBytes,
      );

      const upProxy = UniversalProfileInitFactory.attach(upAddress) as UniversalProfile;
      const keyManagerProxy = KeyManagerInitFactory.attach(
        keyManagerAddress,
      ) as unknown as LSP6KeyManager;

      const upProxyOwner = await upProxy.owner();
      const keyManagerProxyOwner = await keyManagerProxy['target()'].staticCall();

      const [expectedUpProxyAddress, expectedKeyManagerProxyAddress] =
        await LSP23LinkedContractsFactory.computeERC1167Addresses(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
        );

      const [calculatedUpProxyAddress, calculatedKMProxyAddress] = await calculateProxiesAddresses(
        primaryContractDeploymentInit.salt,
        primaryContractDeploymentInit.implementationContract,
        secondaryContractDeploymentInit.implementationContract,
        secondaryContractDeploymentInit.initializationCalldata,
        secondaryContractDeploymentInit.addPrimaryContractAddress,
        secondaryContractDeploymentInit.extraInitializationParams,
        await upInitPostDeploymentModule.getAddress(),
        encodedBytes,
        await LSP23LinkedContractsFactory.getAddress(),
      );

      expect(upAddress).to.equal(expectedUpProxyAddress);
      expect(upAddress).to.equal(expectedUpProxyAddress);
      expect(upAddress).to.equal(calculatedUpProxyAddress);

      expect(keyManagerAddress).to.equal(expectedKeyManagerProxyAddress);
      expect(keyManagerAddress).to.equal(expectedKeyManagerProxyAddress);
      expect(keyManagerAddress).to.equal(calculatedKMProxyAddress);

      expect(upProxyOwner).to.equal(await keyManagerProxy.getAddress());
      expect(upProxyOwner).to.equal(await keyManagerProxy.getAddress());
      expect(keyManagerProxyOwner).to.equal(await upProxy.getAddress());
      expect(keyManagerProxyOwner).to.equal(await upProxy.getAddress());
    });
    it('should revert if the sent value is not equal to the sum of primary and secondary funding amounts', async function () {
      const primaryFundingAmount = ethers.parseEther('1');
      const secondaryFundingAmount = ethers.parseEther('1');

      const {
        LSP23LinkedContractsFactory,
        upInitPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.randomBytes(32);

      const primaryContractDeploymentInit: ILSP23LinkedContractsFactory.PrimaryContractDeploymentInitStruct =
        {
          salt,
          fundingAmount: primaryFundingAmount,
          implementationContract: await universalProfileInit.getAddress(),
          initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
            await upInitPostDeploymentModule.getAddress(),
          ]),
        };

      const secondaryContractDeploymentInit: ILSP23LinkedContractsFactory.SecondaryContractDeploymentInitStruct =
        {
          fundingAmount: secondaryFundingAmount,
          implementationContract: await keyManagerInit.getAddress(),
          addPrimaryContractAddress: true,
          initializationCalldata: '0xc4d66de8',
          extraInitializationParams: '0x',
        };

      const types = ['bytes32[]', 'bytes[]'];

      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [
          ERC725YDataKeys.LSP3.LSP3Profile, // LSP3Metadata
        ],
        [
          ethers.randomBytes(32), // LSP3Metadata
        ],
      ]);

      await expect(
        LSP23LinkedContractsFactory.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
          { value: primaryFundingAmount }, // sending primary funding amount
        ),
      ).to.be.revertedWithCustomError(LSP23LinkedContractsFactory, 'InvalidValueSum');

      // Sending more than required
      await expect(
        LSP23LinkedContractsFactory.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
          {
            value: primaryFundingAmount + secondaryFundingAmount + ethers.parseEther('0.1'),
          }, // Sending extra 0.1 ETH
        ),
      ).to.be.revertedWithCustomError(LSP23LinkedContractsFactory, 'InvalidValueSum');
    });
    it('should successfully deploy primary and secondary proxies with the correct values', async function () {
      const {
        LSP23LinkedContractsFactory,
        upInitPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.randomBytes(32);
      const primaryFundingAmount = ethers.parseEther('1');
      const secondaryFundingAmount = ethers.parseEther('0'); // key manager does not accept funds

      const primaryContractDeploymentInit: ILSP23LinkedContractsFactory.PrimaryContractDeploymentInitStruct =
        {
          salt,
          fundingAmount: primaryFundingAmount,
          implementationContract: await universalProfileInit.getAddress(),
          initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
            await upInitPostDeploymentModule.getAddress(),
          ]),
        };

      const secondaryContractDeploymentInit: ILSP23LinkedContractsFactory.SecondaryContractDeploymentInitStruct =
        {
          fundingAmount: secondaryFundingAmount,
          implementationContract: await keyManagerInit.getAddress(),
          addPrimaryContractAddress: true,
          initializationCalldata: '0xc4d66de8',
          extraInitializationParams: '0x',
        };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.randomBytes(32)],
      ]);

      const [primaryAddress, secondaryAddress] =
        await LSP23LinkedContractsFactory.deployERC1167Proxies.staticCall(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
          { value: primaryFundingAmount + secondaryFundingAmount },
        );

      await LSP23LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        await upInitPostDeploymentModule.getAddress(),
        encodedBytes,
        { value: primaryFundingAmount + secondaryFundingAmount },
      );

      const primaryAddressBalance = await ethers.provider.getBalance(primaryAddress);
      const secondaryAddressBalance = await ethers.provider.getBalance(secondaryAddress);

      expect(primaryAddressBalance).to.equal(primaryFundingAmount);
      expect(primaryAddress).to.not.equal(ethers.ZeroAddress);

      expect(secondaryAddressBalance).to.equal(secondaryFundingAmount);
      expect(secondaryAddress).to.not.equal(ethers.ZeroAddress);
    });
    it('should successfully deploy primary and secondary proxies', async function () {
      const {
        LSP23LinkedContractsFactory,
        upInitPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.randomBytes(32);
      const primaryFundingAmount = ethers.parseEther('1');
      const secondaryFundingAmount = ethers.parseEther('0');

      const primaryContractDeploymentInit = {
        salt,
        fundingAmount: primaryFundingAmount,
        implementationContract: await universalProfileInit.getAddress(),
        initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
          await upInitPostDeploymentModule.getAddress(),
        ]),
      };

      const secondaryContractDeploymentInit = {
        fundingAmount: secondaryFundingAmount,
        implementationContract: await keyManagerInit.getAddress(),
        addPrimaryContractAddress: true,
        initializationCalldata: '0xc4d66de8',
        extraInitializationParams: '0x',
      };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.randomBytes(32)],
      ]);

      const [primaryAddress, secondaryAddress] =
        await LSP23LinkedContractsFactory.deployERC1167Proxies.staticCall(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
          { value: primaryFundingAmount + secondaryFundingAmount },
        );

      await LSP23LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        await upInitPostDeploymentModule.getAddress(),
        encodedBytes,
        { value: primaryFundingAmount + secondaryFundingAmount, gasLimit: 30_000_000 },
      );

      expect(primaryAddress).to.not.equal(ethers.ZeroAddress);
      expect(secondaryAddress).to.not.equal(ethers.ZeroAddress);
    });

    it('should deploy proxies with correct initialization calldata (with secondary contract contains extraParams)', async function () {
      const { LSP23LinkedContractsFactory, upInitPostDeploymentModule, universalProfileInit } =
        await deployImplementationContracts();

      const KeyManagerWithExtraParamsFactory = await ethers.getContractFactory(
        'KeyManagerInitWithExtraParams',
      );
      const keyManagerWithExtraParamsFactory = await KeyManagerWithExtraParamsFactory.deploy();
      await keyManagerWithExtraParamsFactory.waitForDeployment();

      const salt = ethers.hexlify(ethers.randomBytes(32));
      const primaryFundingAmount = ethers.parseEther('1');
      const secondaryFundingAmount = ethers.parseEther('0');

      const primaryContractDeploymentInit = {
        salt,
        fundingAmount: primaryFundingAmount,
        implementationContract: await universalProfileInit.getAddress(),
        initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
          await upInitPostDeploymentModule.getAddress(),
        ]),
      };

      const firstAddress = ethers.hexlify(ethers.randomBytes(20));
      const firstParam = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [firstAddress]);

      const initializeWithExtraParamsSelector = '0x00dc68f1';
      const initializationDataWithSelector =
        initializeWithExtraParamsSelector + firstParam.slice(2);

      const lastAddress = ethers.hexlify(ethers.randomBytes(20));
      const lastParam = ethers.AbiCoder.defaultAbiCoder().encode(['address'], [lastAddress]);

      const secondaryContractDeploymentInit = {
        fundingAmount: secondaryFundingAmount,
        implementationContract: keyManagerWithExtraParamsFactory.target,
        addPrimaryContractAddress: true,
        initializationCalldata: initializationDataWithSelector,
        extraInitializationParams: lastParam,
      };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.randomBytes(32)],
      ]);

      const [primaryAddress, secondaryAddress] =
        await LSP23LinkedContractsFactory.deployERC1167Proxies.staticCall(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
          { value: primaryFundingAmount + secondaryFundingAmount },
        );

      await LSP23LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        await upInitPostDeploymentModule.getAddress(),
        encodedBytes,
        { value: primaryFundingAmount + secondaryFundingAmount, gasLimit: 30_000_000 },
      );

      const keyManagerWithExtraParams = KeyManagerWithExtraParamsFactory.attach(secondaryAddress);

      expect(await keyManagerWithExtraParams.firstParam()).to.deep.equal(firstAddress);
      expect(await keyManagerWithExtraParams.lastParam()).to.deep.equal(lastAddress);

      expect(primaryAddress).to.not.equal(ethers.ZeroAddress);
      expect(secondaryAddress).to.not.equal(ethers.ZeroAddress);
    });
    it('should emit DeployedERC1167Proxies event with correct parameters', async function () {
      const {
        LSP23LinkedContractsFactory,
        upInitPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.randomBytes(32);
      const primaryFundingAmount = ethers.parseEther('1');
      const secondaryFundingAmount = ethers.parseEther('0');

      const primaryContractDeploymentInit = {
        salt,
        fundingAmount: primaryFundingAmount,
        implementationContract: await universalProfileInit.getAddress(),
        initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
          await upInitPostDeploymentModule.getAddress(),
        ]),
      };

      const secondaryContractDeploymentInit = {
        fundingAmount: secondaryFundingAmount,
        implementationContract: await keyManagerInit.getAddress(),
        addPrimaryContractAddress: true,
        initializationCalldata: '0xc4d66de8',
        extraInitializationParams: '0x',
      };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.randomBytes(32)],
      ]);

      const [primaryAddress, secondaryAddress] =
        await LSP23LinkedContractsFactory.deployERC1167Proxies.staticCall(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
          { value: primaryFundingAmount + secondaryFundingAmount },
        );

      const tx = await LSP23LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        await upInitPostDeploymentModule.getAddress(),
        encodedBytes,
        { value: primaryFundingAmount + secondaryFundingAmount },
      );

      const receipt = await tx.wait();
      // const event = receipt.events?.find((e) => e.event === 'DeployedERC1167Proxies');
      const event = receipt.logs.find((e: EventLog) => e.eventName === 'DeployedERC1167Proxies');

      expect(event).to.not.be.undefined;

      const args = (event as EventLog).args;

      expect(args[0]).to.equal(primaryAddress);
      expect(args[1]).to.equal(secondaryAddress);

      expect(args[2].salt).to.deep.equal(ethers.hexlify(primaryContractDeploymentInit.salt));
      expect(args[2].fundingAmount).to.deep.equal(primaryContractDeploymentInit.fundingAmount);
      expect(args[2].implementationContract).to.deep.equal(
        primaryContractDeploymentInit.implementationContract,
      );
      expect(args[2].initializationCalldata).to.deep.equal(
        primaryContractDeploymentInit.initializationCalldata,
      );
    });
    it('should revert if trying to deploy twice with the same deployment info', async function () {
      const {
        LSP23LinkedContractsFactory,
        upInitPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.randomBytes(32);
      const primaryFundingAmount = ethers.parseEther('1');
      const secondaryFundingAmount = 0;

      const primaryContractDeploymentInit = {
        salt,
        fundingAmount: primaryFundingAmount,
        implementationContract: await universalProfileInit.getAddress(),
        initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
          await upInitPostDeploymentModule.getAddress(),
        ]),
      };

      const secondaryContractDeploymentInit = {
        fundingAmount: secondaryFundingAmount,
        implementationContract: await keyManagerInit.getAddress(),
        addPrimaryContractAddress: true,
        initializationCalldata: '0xc4d66de8',
        extraInitializationParams: '0x',
      };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.AbiCoder.defaultAbiCoder().encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.randomBytes(32)],
      ]);

      await LSP23LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        await upInitPostDeploymentModule.getAddress(),
        encodedBytes,
        { value: primaryFundingAmount + BigInt(secondaryFundingAmount) },
      );

      await expect(
        LSP23LinkedContractsFactory.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          await upInitPostDeploymentModule.getAddress(),
          encodedBytes,
          { value: primaryFundingAmount + BigInt(secondaryFundingAmount) },
        ),
      ).to.be.revertedWith('ERC1167: create2 failed');
    });
  });
});
