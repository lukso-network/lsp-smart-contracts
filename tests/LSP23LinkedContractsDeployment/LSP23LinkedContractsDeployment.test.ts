import { ethers } from 'hardhat';
import { expect } from 'chai';

import { LinkedContractsFactory } from '../../typechain-types';
import { ERC725YDataKeys } from '../../constants';
import {
  calculateProxiesAddresses,
  create16BytesUint,
  createDataKey,
  deployImplementationContracts,
} from './helpers';

describe('UniversalProfileDeployer', function () {
  it.only('for non-proxies deployment', async function () {
    const [allPermissionsSigner, universalReceiver, recoverySigner] = await ethers.getSigners();

    const keyManagerBytecode = (await ethers.getContractFactory('ReceiveContract')).bytecode;
    const universalProfileBytecode = (await ethers.getContractFactory('ReceiveContract')).bytecode;
    const { upPostDeploymentModule, LinkedContractsFactory } =
      await deployImplementationContracts();

    const salt = ethers.utils.randomBytes(32);

    const primaryContractDeployment: LinkedContractsFactory.PrimaryContractDeploymentStruct = {
      salt,
      fundingAmount: 0,
      creationBytecode: universalProfileBytecode,
    };

    const secondaryContractDeployment: LinkedContractsFactory.SecondaryContractDeploymentInitStruct =
      {
        fundingAmount: 0,
        creationBytecode: keyManagerBytecode,
        addPrimaryContractAddress: false,
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

    const encodedBytes = ethers.utils.defaultAbiCoder.encode(types, [
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
        ethers.utils.randomBytes(32), // LSP3Metadata
        universalReceiver.address, // URD Address
        allPermissionsSignerPermissionsValue, // URD Permissions
        allPermissionsSignerPermissionsValue, // Recovery Address permissions
        allPermissionsSignerPermissionsValue, // Signers permissions
        ethers.utils.defaultAbiCoder.encode(['uint256'], [3]), // Address Permissions array length
        universalReceiver.address,
        recoverySigner.address,
        allPermissionsSigner.address,
      ],
    ]);

    // get the address of the UP and the KeyManager contracts
    const [upContract, keyManagerContract] =
      await LinkedContractsFactory.callStatic.deployContracts(
        primaryContractDeployment,
        secondaryContractDeployment,
        ethers.constants.AddressZero,
        '0x',
      );

    console.log('upContract', upContract);

    // await LinkedContractsFactory.deployERC1167Proxies(
    //   primaryContractDeployment,
    //   secondaryContractDeployment,
    //   upPostDeploymentModule.address,
    //   encodedBytes,
    // );

    // const upProxyOwner = await upContract.owner();
    // const keyManagerProxyOwner = await keyManagerContract.target();

    // const [expectedUpAddress, expectedKeyManagerAddress] =
    //   await LinkedContractsFactory.computeAddresses(
    //     primaryContractDeployment,
    //     secondaryContractDeployment,
    //     upPostDeploymentModule.address,
    //     encodedBytes,
    //   );

    // expect(upContract).to.equal(expectedUpAddress);
    // expect(upContract).to.equal(expectedUpAddress);
    // expect(upContract).to.equal(expectedUpAddress);

    // expect(keyManagerContract).to.equal(expectedKeyManagerAddress);
    // expect(keyManagerContract).to.equal(expectedKeyManagerAddress);
    // expect(keyManagerContract).to.equal(expectedKeyManagerAddress);

    // expect(upProxyOwner).to.equal(keyManagerProxy.address);
    // expect(upProxyOwner).to.equal(keyManagerProxy.address);
    // expect(keyManagerProxyOwner).to.equal(upProxy.address);
    // expect(keyManagerProxyOwner).to.equal(upProxy.address);
  });
  describe('for proxies deployment', function () {
    it('should deploy proxies for Universal Profile and Key Manager', async function () {
      const [allPermissionsSigner, universalReceiver, recoverySigner] = await ethers.getSigners();

      const {
        keyManagerInit,
        universalProfileInit,
        LinkedContractsFactory,
        upPostDeploymentModule,
        UniversalProfileInitFactory,
        KeyManagerInitFactory,
      } = await deployImplementationContracts();

      const salt = ethers.utils.randomBytes(32);

      const primaryContractDeploymentInit: LinkedContractsFactory.PrimaryContractDeploymentInitStruct =
        {
          salt,
          fundingAmount: 0,
          implementationContract: universalProfileInit.address,
          initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
            upPostDeploymentModule.address,
          ]),
        };

      const secondaryContractDeploymentInit: LinkedContractsFactory.SecondaryContractDeploymentInitStruct =
        {
          fundingAmount: 0,
          implementationContract: keyManagerInit.address,
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

      const encodedBytes = ethers.utils.defaultAbiCoder.encode(types, [
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
          ethers.utils.randomBytes(32), // LSP3Metadata
          universalReceiver.address, // URD Address
          allPermissionsSignerPermissionsValue, // URD Permissions
          allPermissionsSignerPermissionsValue, // Recovery Address permissions
          allPermissionsSignerPermissionsValue, // Signers permissions
          ethers.utils.defaultAbiCoder.encode(['uint256'], [3]), // Address Permissions array length
          universalReceiver.address,
          recoverySigner.address,
          allPermissionsSigner.address,
        ],
      ]);

      // get the address of the UP and the KeyManager contracts
      const [upAddress, keyManagerAddress] =
        await LinkedContractsFactory.callStatic.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          upPostDeploymentModule.address,
          encodedBytes,
        );

      await LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        upPostDeploymentModule.address,
        encodedBytes,
      );

      const upProxy = UniversalProfileInitFactory.attach(upAddress);
      const keyManagerProxy = KeyManagerInitFactory.attach(keyManagerAddress);

      const upProxyOwner = await upProxy.owner();
      const keyManagerProxyOwner = await keyManagerProxy.target();

      const [expectedUpProxyAddress, expectedKeyManagerProxyAddress] =
        await LinkedContractsFactory.computeERC1167Addresses(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          upPostDeploymentModule.address,
          encodedBytes,
        );

      const [calculatedUpProxyAddress, calculatedKMProxyAddress] = await calculateProxiesAddresses(
        primaryContractDeploymentInit.salt,
        primaryContractDeploymentInit.implementationContract,
        secondaryContractDeploymentInit.implementationContract,
        secondaryContractDeploymentInit.initializationCalldata,
        secondaryContractDeploymentInit.addPrimaryContractAddress,
        secondaryContractDeploymentInit.extraInitializationParams,
        upPostDeploymentModule.address,
        encodedBytes,
        LinkedContractsFactory.address,
      );

      expect(upAddress).to.equal(expectedUpProxyAddress);
      expect(upAddress).to.equal(expectedUpProxyAddress);
      expect(upAddress).to.equal(calculatedUpProxyAddress);

      expect(keyManagerAddress).to.equal(expectedKeyManagerProxyAddress);
      expect(keyManagerAddress).to.equal(expectedKeyManagerProxyAddress);
      expect(keyManagerAddress).to.equal(calculatedKMProxyAddress);

      expect(upProxyOwner).to.equal(keyManagerProxy.address);
      expect(upProxyOwner).to.equal(keyManagerProxy.address);
      expect(keyManagerProxyOwner).to.equal(upProxy.address);
      expect(keyManagerProxyOwner).to.equal(upProxy.address);
    });
    it('should revert if the sent value is not equal to the sum of primary and secondary funding amounts', async function () {
      const primaryFundingAmount = ethers.utils.parseEther('1');
      const secondaryFundingAmount = ethers.utils.parseEther('1');

      const {
        LinkedContractsFactory,
        upPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.utils.randomBytes(32);

      const primaryContractDeploymentInit: LinkedContractsFactory.PrimaryContractDeploymentInitStruct =
        {
          salt,
          fundingAmount: primaryFundingAmount,
          implementationContract: universalProfileInit.address,
          initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
            upPostDeploymentModule.address,
          ]),
        };

      const secondaryContractDeploymentInit: LinkedContractsFactory.SecondaryContractDeploymentInitStruct =
        {
          fundingAmount: secondaryFundingAmount,
          implementationContract: keyManagerInit.address,
          addPrimaryContractAddress: true,
          initializationCalldata: '0xc4d66de8',
          extraInitializationParams: '0x',
        };

      const types = ['bytes32[]', 'bytes[]'];

      const encodedBytes = ethers.utils.defaultAbiCoder.encode(types, [
        [
          ERC725YDataKeys.LSP3.LSP3Profile, // LSP3Metadata
        ],
        [
          ethers.utils.randomBytes(32), // LSP3Metadata
        ],
      ]);

      await expect(
        LinkedContractsFactory.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          upPostDeploymentModule.address,
          encodedBytes,
          { value: primaryFundingAmount }, // Only sending primary funding amount
        ),
      ).to.be.revertedWithCustomError(LinkedContractsFactory, 'InvalidValueSum');

      // Sending more than required
      await expect(
        LinkedContractsFactory.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          upPostDeploymentModule.address,
          encodedBytes,
          {
            value: primaryFundingAmount
              .add(secondaryFundingAmount)
              .add(ethers.utils.parseEther('0.1')),
          }, // Sending extra 0.1 ETH
        ),
      ).to.be.revertedWithCustomError(LinkedContractsFactory, 'InvalidValueSum');
    });
    it('should successfully deploy primary and secondary proxies with the correct values', async function () {
      const {
        LinkedContractsFactory,
        upPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.utils.randomBytes(32);
      const primaryFundingAmount = ethers.utils.parseEther('1');
      const secondaryFundingAmount = ethers.utils.parseEther('0'); // key manager does not accept funds

      const primaryContractDeploymentInit: LinkedContractsFactory.PrimaryContractDeploymentInitStruct =
        {
          salt,
          fundingAmount: primaryFundingAmount,
          implementationContract: universalProfileInit.address,
          initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
            upPostDeploymentModule.address,
          ]),
        };

      const secondaryContractDeploymentInit: LinkedContractsFactory.SecondaryContractDeploymentInitStruct =
        {
          fundingAmount: secondaryFundingAmount,
          implementationContract: keyManagerInit.address,
          addPrimaryContractAddress: true,
          initializationCalldata: '0xc4d66de8',
          extraInitializationParams: '0x',
        };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.utils.defaultAbiCoder.encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.utils.randomBytes(32)],
      ]);

      const [primaryAddress, secondaryAddress] =
        await LinkedContractsFactory.callStatic.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          upPostDeploymentModule.address,
          encodedBytes,
          { value: primaryFundingAmount.add(secondaryFundingAmount) },
        );

      await LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        upPostDeploymentModule.address,
        encodedBytes,
        { value: primaryFundingAmount.add(secondaryFundingAmount) },
      );

      const primaryAddressBalance = await ethers.provider.getBalance(primaryAddress);
      const secondaryAddressBalance = await ethers.provider.getBalance(secondaryAddress);

      expect(primaryAddressBalance).to.equal(primaryFundingAmount);
      expect(primaryAddress).to.not.equal(ethers.constants.AddressZero);

      expect(secondaryAddressBalance).to.equal(secondaryFundingAmount);
      expect(secondaryAddress).to.not.equal(ethers.constants.AddressZero);
    });
    it('should successfully deploy primary and secondary proxies', async function () {
      const {
        LinkedContractsFactory,
        upPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.utils.randomBytes(32);
      const primaryFundingAmount = ethers.utils.parseEther('1');
      const secondaryFundingAmount = ethers.utils.parseEther('0');

      const primaryContractDeploymentInit = {
        salt,
        fundingAmount: primaryFundingAmount,
        implementationContract: universalProfileInit.address,
        initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
          upPostDeploymentModule.address,
        ]),
      };

      const secondaryContractDeploymentInit = {
        fundingAmount: secondaryFundingAmount,
        implementationContract: keyManagerInit.address,
        addPrimaryContractAddress: true,
        initializationCalldata: '0xc4d66de8',
        extraInitializationParams: '0x',
      };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.utils.defaultAbiCoder.encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.utils.randomBytes(32)],
      ]);

      const [primaryAddress, secondaryAddress] =
        await LinkedContractsFactory.callStatic.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          upPostDeploymentModule.address,
          encodedBytes,
          { value: primaryFundingAmount.add(secondaryFundingAmount) },
        );

      await LinkedContractsFactory.callStatic.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        upPostDeploymentModule.address,
        encodedBytes,
        { value: primaryFundingAmount.add(secondaryFundingAmount) },
      );

      expect(primaryAddress).to.not.equal(ethers.constants.AddressZero);
      expect(secondaryAddress).to.not.equal(ethers.constants.AddressZero);
    });
    it('should emit DeployedERC1167Proxies event with correct parameters', async function () {
      const {
        LinkedContractsFactory,
        upPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.utils.randomBytes(32);
      const primaryFundingAmount = ethers.utils.parseEther('1');
      const secondaryFundingAmount = ethers.utils.parseEther('0');

      const primaryContractDeploymentInit = {
        salt,
        fundingAmount: primaryFundingAmount,
        implementationContract: universalProfileInit.address,
        initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
          upPostDeploymentModule.address,
        ]),
      };

      const secondaryContractDeploymentInit = {
        fundingAmount: secondaryFundingAmount,
        implementationContract: keyManagerInit.address,
        addPrimaryContractAddress: true,
        initializationCalldata: '0xc4d66de8',
        extraInitializationParams: '0x',
      };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.utils.defaultAbiCoder.encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.utils.randomBytes(32)],
      ]);

      const [primaryAddress, secondaryAddress] =
        await LinkedContractsFactory.callStatic.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          upPostDeploymentModule.address,
          encodedBytes,
          { value: primaryFundingAmount.add(secondaryFundingAmount) },
        );

      const tx = await LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        upPostDeploymentModule.address,
        encodedBytes,
        { value: primaryFundingAmount.add(secondaryFundingAmount) },
      );

      const receipt = await tx.wait();
      const event = receipt.events?.find((e) => e.event === 'DeployedERC1167Proxies');

      expect(event).to.not.be.undefined;

      const args = event.args;

      expect(args[0]).to.equal(primaryAddress);
      expect(args[1]).to.equal(secondaryAddress);

      expect(args[2].salt).to.deep.equal(ethers.utils.hexlify(primaryContractDeploymentInit.salt));
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
        LinkedContractsFactory,
        upPostDeploymentModule,
        universalProfileInit,
        keyManagerInit,
      } = await deployImplementationContracts();

      const salt = ethers.utils.randomBytes(32);
      const primaryFundingAmount = ethers.utils.parseEther('1');
      const secondaryFundingAmount = 0;

      const primaryContractDeploymentInit = {
        salt,
        fundingAmount: primaryFundingAmount,
        implementationContract: universalProfileInit.address,
        initializationCalldata: universalProfileInit.interface.encodeFunctionData('initialize', [
          upPostDeploymentModule.address,
        ]),
      };

      const secondaryContractDeploymentInit = {
        fundingAmount: secondaryFundingAmount,
        implementationContract: keyManagerInit.address,
        addPrimaryContractAddress: true,
        initializationCalldata: '0xc4d66de8',
        extraInitializationParams: '0x',
      };

      const types = ['bytes32[]', 'bytes[]'];
      const encodedBytes = ethers.utils.defaultAbiCoder.encode(types, [
        [ERC725YDataKeys.LSP3.LSP3Profile],
        [ethers.utils.randomBytes(32)],
      ]);

      await LinkedContractsFactory.deployERC1167Proxies(
        primaryContractDeploymentInit,
        secondaryContractDeploymentInit,
        upPostDeploymentModule.address,
        encodedBytes,
        { value: primaryFundingAmount.add(secondaryFundingAmount) },
      );

      await expect(
        LinkedContractsFactory.deployERC1167Proxies(
          primaryContractDeploymentInit,
          secondaryContractDeploymentInit,
          upPostDeploymentModule.address,
          encodedBytes,
          { value: primaryFundingAmount.add(secondaryFundingAmount) },
        ),
      ).to.be.revertedWith('ERC1167: create2 failed');
    });
  });
});
