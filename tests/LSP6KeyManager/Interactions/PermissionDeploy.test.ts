import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { calculateCreate2 } from 'eth-create2-calculator';
import { EIP191Signer } from '@lukso/eip191-signer.js';

import { TargetContract__factory, UniversalProfile__factory } from '../../../types';

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  LSP25_VERSION,
  PERMISSIONS,
  OPERATION_TYPES,
} from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

import { abiCoder, combinePermissions, LOCAL_PRIVATE_KEYS, provider } from '../../utils/helpers';
import { BigNumber } from 'ethers';

export const shouldBehaveLikePermissionDeploy = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  let addressCanDeploy: SignerWithAddress,
    addressCanDeployAndTransferValue: SignerWithAddress,
    addressCanDeployAndSuperTransferValue: SignerWithAddress,
    addressCannotDeploy: SignerWithAddress;

  before(async () => {
    context = await buildContext(ethers.utils.parseEther('100'));

    addressCanDeploy = context.accounts[1];
    addressCanDeployAndTransferValue = context.accounts[2];
    addressCanDeployAndSuperTransferValue = context.accounts[3];
    addressCannotDeploy = context.accounts[4];

    const permissionKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanDeploy.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanDeployAndTransferValue.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanDeployAndSuperTransferValue.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCannotDeploy.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      combinePermissions(PERMISSIONS.DEPLOY, PERMISSIONS.EXECUTE_RELAY_CALL),
      combinePermissions(
        PERMISSIONS.DEPLOY,
        PERMISSIONS.TRANSFERVALUE,
        PERMISSIONS.EXECUTE_RELAY_CALL,
      ),
      combinePermissions(
        PERMISSIONS.DEPLOY,
        PERMISSIONS.SUPER_TRANSFERVALUE,
        PERMISSIONS.EXECUTE_RELAY_CALL,
      ),
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe('when caller has ALL PERMISSIONS', () => {
    it('should be allowed to deploy a contract with CREATE', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE,
        ethers.constants.AddressZero,
        0,
        contractBytecodeToDeploy, // init code
      ]);

      // do first a callstatic to retrieve the address of the contract expected to be deployed
      // so we can check it against the address emitted in the ContractCreated event
      const result = await context.keyManager
        .connect(context.mainController)
        .callStatic.execute(payload);

      const [expectedContractAddress] = abiCoder.decode(['bytes'], result);

      await expect(context.keyManager.connect(context.mainController).execute(payload))
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          0,
          ethers.utils.hexZeroPad('0x00', 32),
        );
    });

    it('should be allowed to deploy + fund a contract with CREATE', async () => {
      // deploy a UP from another UP and check that the new UP is funded + its owner was set
      const initialUpOwner = context.mainController.address;

      // generate the init code that contains the constructor args with the initial UP owner
      const upDeploymentTx = new UniversalProfile__factory(
        context.accounts[0],
      ).getDeployTransaction(initialUpOwner);

      const contractBytecodeToDeploy = upDeploymentTx.data;
      const fundingAmount = ethers.utils.parseEther('10');

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE,
        ethers.constants.AddressZero,
        fundingAmount,
        contractBytecodeToDeploy, // init code
      ]);

      // do first a callstatic to retrieve the address of the contract expected to be deployed
      // so we can check it against the address emitted in the ContractCreated event
      const callResult = await context.keyManager
        .connect(context.mainController)
        .callStatic.execute(payload);

      const [expectedContractAddress] = abiCoder.decode(['bytes'], callResult);

      await expect(context.keyManager.connect(context.mainController).execute(payload))
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          fundingAmount,
          ethers.utils.hexZeroPad('0x00', 32),
        );

      // check that the newly deployed contract (UP) has the correct owner
      const newUp = new UniversalProfile__factory(context.accounts[0]).attach(
        expectedContractAddress,
      );
      expect(await newUp.owner()).to.equal(initialUpOwner);

      // check that the newly deployed contract (UP) has beedn funded with the correct balance
      expect(await provider.getBalance(expectedContractAddress)).to.equal(fundingAmount);
    });

    it('should be allowed to deploy a contract with CREATE2', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;
      const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE2,
        ethers.constants.AddressZero,
        0,
        contractBytecodeToDeploy + salt.substring(2),
      ]);

      const preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy,
      ).toLowerCase();

      await expect(context.keyManager.connect(context.mainController).execute(payload))
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(OPERATION_TYPES.CREATE2, ethers.utils.getAddress(preComputedAddress), 0, salt);
    });

    it('should be allowed to deploy + fund a contract with CREATE2', async () => {
      // deploy a UP from another UP and check that the new UP is funded + its owner was set
      const initialUpOwner = context.mainController.address;

      // generate the init code that contains the constructor args with the initial UP owner
      const upDeploymentTx = new UniversalProfile__factory(
        context.accounts[0],
      ).getDeployTransaction(initialUpOwner);

      const contractBytecodeToDeploy = upDeploymentTx.data;
      const fundingAmount = ethers.utils.parseEther('10');

      const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE2,
        ethers.constants.AddressZero,
        fundingAmount,
        contractBytecodeToDeploy + salt.substring(2),
      ]);

      const preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy,
      ).toLowerCase();

      await expect(context.keyManager.connect(context.mainController).execute(payload))
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE2,
          ethers.utils.getAddress(preComputedAddress),
          fundingAmount,
          salt,
        );

      // check that the newly deployed contract (UP) has the correct owner
      const newUp = new UniversalProfile__factory(context.accounts[0]).attach(preComputedAddress);

      expect(await newUp.owner()).to.equal(initialUpOwner);

      // check that the newly deployed contract (UP) has beedn funded with the correct balance
      expect(await provider.getBalance(preComputedAddress)).to.equal(fundingAmount);
    });
  });

  describe('when caller has permission DEPLOY', () => {
    it('should be allowed to deploy a contract with CREATE', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE,
        ethers.constants.AddressZero,
        0,
        contractBytecodeToDeploy,
      ]);

      const result = await context.keyManager.connect(addressCanDeploy).callStatic.execute(payload);

      const [expectedContractAddress] = abiCoder.decode(['bytes'], result);

      await expect(context.keyManager.connect(addressCanDeploy).execute(payload))
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          0,
          ethers.utils.hexZeroPad('0x00', 32),
        );
    });

    it('should revert with error `NotAuthorised(SUPER_TRANSFERVALUE)` when trying to deploy + fund a contract with CREATE', async () => {
      // deploy a UP from another UP and check that the new UP is funded + its owner was set
      const initialUpOwner = context.mainController.address;

      // generate the init code that contains the constructor args with the initial UP owner
      const upDeploymentTx = new UniversalProfile__factory(
        context.accounts[0],
      ).getDeployTransaction(initialUpOwner);

      const contractBytecodeToDeploy = upDeploymentTx.data;
      const fundingAmount = ethers.utils.parseEther('10');

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE,
        ethers.constants.AddressZero,
        fundingAmount,
        contractBytecodeToDeploy, // init code
      ]);

      await expect(context.keyManager.connect(addressCanDeploy).execute(payload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
        .withArgs(addressCanDeploy.address, 'SUPER_TRANSFERVALUE');
    });

    it('should be allowed to deploy a contract with CREATE2', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;
      const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE2,
        ethers.constants.AddressZero,
        0,
        contractBytecodeToDeploy + salt.substring(2),
      ]);

      const preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy,
      ).toLowerCase();

      await expect(context.keyManager.connect(addressCanDeploy).execute(payload))
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(OPERATION_TYPES.CREATE2, ethers.utils.getAddress(preComputedAddress), 0, salt);
    });

    it('should revert with error `NotAuthorised(SUPER_TRANSFERVALUE)` when trying to deploy + fund a contract with CREATE2', async () => {
      // deploy a UP from another UP and check that the new UP is funded + its owner was set
      const initialUpOwner = context.mainController.address;

      // generate the init code that contains the constructor args with the initial UP owner
      const upDeploymentTx = new UniversalProfile__factory(
        context.accounts[0],
      ).getDeployTransaction(initialUpOwner);

      const contractBytecodeToDeploy = upDeploymentTx.data;
      const fundingAmount = ethers.utils.parseEther('10');

      const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE2,
        ethers.constants.AddressZero,
        fundingAmount,
        contractBytecodeToDeploy + salt.substring(2),
      ]);

      await expect(context.keyManager.connect(addressCanDeploy).execute(payload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
        .withArgs(addressCanDeploy.address, 'SUPER_TRANSFERVALUE');
    });
  });

  describe('when caller has permissions DEPLOY + TRANSFERVALUE', () => {
    it('should be allowed to deploy a contract with CREATE', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE,
        ethers.constants.AddressZero,
        0,
        contractBytecodeToDeploy, // init code
      ]);

      // do first a callstatic to retrieve the address of the contract expected to be deployed
      // so we can check it against the address emitted in the ContractCreated event
      const result = await context.keyManager
        .connect(addressCanDeployAndTransferValue)
        .callStatic.execute(payload);

      const [expectedContractAddress] = abiCoder.decode(['bytes'], result);

      await expect(context.keyManager.connect(addressCanDeployAndTransferValue).execute(payload))
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          0,
          ethers.utils.hexZeroPad('0x00', 32),
        );
    });

    it('should revert with error `NotAuthorised(SUPER_TRANSFERVALUE)` when trying to deploy + fund a contract with CREATE', async () => {
      // deploy a UP from another UP and check that the new UP is funded + its owner was set
      const initialUpOwner = context.mainController.address;

      // generate the init code that contains the constructor args with the initial UP owner
      const upDeploymentTx = new UniversalProfile__factory(
        context.accounts[0],
      ).getDeployTransaction(initialUpOwner);

      const contractBytecodeToDeploy = upDeploymentTx.data;
      const fundingAmount = ethers.utils.parseEther('10');

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE,
        ethers.constants.AddressZero,
        fundingAmount,
        contractBytecodeToDeploy, // init code
      ]);

      await expect(context.keyManager.connect(addressCanDeployAndTransferValue).execute(payload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
        .withArgs(addressCanDeployAndTransferValue.address, 'SUPER_TRANSFERVALUE');
    });

    it('should be allowed to deploy a contract with CREATE2', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;
      const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE2,
        ethers.constants.AddressZero,
        0,
        contractBytecodeToDeploy + salt.substring(2),
      ]);

      const preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy,
      ).toLowerCase();

      await expect(context.keyManager.connect(addressCanDeployAndTransferValue).execute(payload))
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(OPERATION_TYPES.CREATE2, ethers.utils.getAddress(preComputedAddress), 0, salt);
    });

    it('should revert with error `NotAuthorised(SUPER_TRANSFERVALUE)` when trying to deploy + fund a contract with CREATE2', async () => {
      // deploy a UP from another UP and check that the new UP is funded + its owner was set
      const initialUpOwner = context.mainController.address;

      // generate the init code that contains the constructor args with the initial UP owner
      const upDeploymentTx = new UniversalProfile__factory(
        context.accounts[0],
      ).getDeployTransaction(initialUpOwner);

      const contractBytecodeToDeploy = upDeploymentTx.data;
      const fundingAmount = ethers.utils.parseEther('10');

      const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE2,
        ethers.constants.AddressZero,
        fundingAmount,
        contractBytecodeToDeploy + salt.substring(2),
      ]);

      await expect(context.keyManager.connect(addressCanDeployAndTransferValue).execute(payload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
        .withArgs(addressCanDeployAndTransferValue.address, 'SUPER_TRANSFERVALUE');
    });
  });

  describe('when caller has permissions DEPLOY + SUPER_TRANSFERVALUE', () => {
    it('should be allowed to deploy a contract with CREATE', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE,
        ethers.constants.AddressZero,
        0,
        contractBytecodeToDeploy, // init code
      ]);

      // do first a callstatic to retrieve the address of the contract expected to be deployed
      // so we can check it against the address emitted in the ContractCreated event
      const result = await context.keyManager
        .connect(addressCanDeployAndSuperTransferValue)
        .callStatic.execute(payload);

      const [expectedContractAddress] = abiCoder.decode(['bytes'], result);

      await expect(
        context.keyManager.connect(addressCanDeployAndSuperTransferValue).execute(payload),
      )
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          0,
          ethers.utils.hexZeroPad('0x00', 32),
        );
    });

    it('should be allowed to deploy + fund a contract with CREATE', async () => {
      // deploy a UP from another UP and check that the new UP is funded + its owner was set
      const initialUpOwner = context.mainController.address;

      // generate the init code that contains the constructor args with the initial UP owner
      const upDeploymentTx = new UniversalProfile__factory(
        context.accounts[0],
      ).getDeployTransaction(initialUpOwner);

      const contractBytecodeToDeploy = upDeploymentTx.data;
      const fundingAmount = ethers.utils.parseEther('10');

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE,
        ethers.constants.AddressZero,
        fundingAmount,
        contractBytecodeToDeploy, // init code
      ]);

      // do first a callstatic to retrieve the address of the contract expected to be deployed
      // so we can check it against the address emitted in the ContractCreated event
      const result = await context.keyManager
        .connect(addressCanDeployAndSuperTransferValue)
        .callStatic.execute(payload);

      const [expectedContractAddress] = abiCoder.decode(['bytes'], result);

      await expect(
        context.keyManager.connect(addressCanDeployAndSuperTransferValue).execute(payload),
      )
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(expectedContractAddress),
          fundingAmount,
          ethers.utils.hexZeroPad('0x00', 32),
        );

      // check that the newly deployed contract (UP) has the correct owner
      const newUp = new UniversalProfile__factory(context.accounts[0]).attach(
        expectedContractAddress,
      );
      expect(await newUp.owner()).to.equal(initialUpOwner);

      // check that the newly deployed contract (UP) has beedn funded with the correct balance
      expect(await provider.getBalance(expectedContractAddress)).to.equal(fundingAmount);
    });

    it('should be allowed to deploy a contract with CREATE2', async () => {
      const contractBytecodeToDeploy = TargetContract__factory.bytecode;
      const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE2,
        ethers.constants.AddressZero,
        0,
        contractBytecodeToDeploy + salt.substring(2),
      ]);

      const preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy,
      ).toLowerCase();

      await expect(
        context.keyManager.connect(addressCanDeployAndSuperTransferValue).execute(payload),
      )
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(OPERATION_TYPES.CREATE2, ethers.utils.getAddress(preComputedAddress), 0, salt);
    });

    it('should be allowed to deploy + fund a contract with CREATE2', async () => {
      // deploy a UP from another UP and check that the new UP is funded + its owner was set
      const initialUpOwner = context.mainController.address;

      // generate the init code that contains the constructor args with the initial UP owner
      const upDeploymentTx = new UniversalProfile__factory(
        context.accounts[0],
      ).getDeployTransaction(initialUpOwner);

      const contractBytecodeToDeploy = upDeploymentTx.data;
      const fundingAmount = ethers.utils.parseEther('10');

      const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

      const payload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CREATE2,
        ethers.constants.AddressZero,
        fundingAmount,
        contractBytecodeToDeploy + salt.substring(2),
      ]);

      const preComputedAddress = calculateCreate2(
        context.universalProfile.address,
        salt,
        contractBytecodeToDeploy,
      ).toLowerCase();

      await expect(
        context.keyManager.connect(addressCanDeployAndSuperTransferValue).execute(payload),
      )
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE2,
          ethers.utils.getAddress(preComputedAddress),
          fundingAmount,
          salt,
        );

      // check that the newly deployed contract (UP) has the correct owner
      const newUp = new UniversalProfile__factory(context.accounts[0]).attach(preComputedAddress);

      expect(await newUp.owner()).to.equal(initialUpOwner);

      // check that the newly deployed contract (UP) has beedn funded with the correct balance
      expect(await provider.getBalance(preComputedAddress)).to.equal(fundingAmount);
    });
  });

  describe('when caller does not have permission DEPLOY', () => {
    describe('-> interacting via execute(...)', () => {
      it('should revert when trying to deploy a contract via CREATE', async () => {
        const contractBytecodeToDeploy = TargetContract__factory.bytecode;

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CREATE,
          ethers.constants.AddressZero,
          0,
          contractBytecodeToDeploy,
        ]);

        await expect(context.keyManager.connect(addressCannotDeploy).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCannotDeploy.address, 'DEPLOY');
      });

      it('should revert when trying to deploy a contract via CREATE2', async () => {
        const contractBytecodeToDeploy = TargetContract__factory.bytecode;
        const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CREATE2,
          ethers.constants.AddressZero,
          0,
          contractBytecodeToDeploy + salt.substring(2),
        ]);

        await expect(context.keyManager.connect(addressCannotDeploy).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(addressCannotDeploy.address, 'DEPLOY');
      });
    });

    describe('-> interacting via executeRelayCall(...)', () => {
      describe('when deploying a contract via CREATE', () => {
        describe('when signing with Ethereum Signed Message', () => {
          it('should recover the wrong signer address and revert with `NoPermissionsSet`', async () => {
            const contractBytecodeToDeploy = TargetContract__factory.bytecode;

            const nonce = await context.keyManager.callStatic.getNonce(
              addressCannotDeploy.address,
              0,
            );

            const validityTimestamps = 0;

            const payload = context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CREATE,
              ethers.constants.AddressZero,
              0,
              contractBytecodeToDeploy,
            ]);

            const HARDHAT_CHAINID = 31337;
            const valueToSend = 0;

            const encodedMessage = ethers.utils.solidityPack(
              ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
              [LSP25_VERSION, HARDHAT_CHAINID, nonce, validityTimestamps, valueToSend, payload],
            );

            const ethereumSignature = await addressCannotDeploy.signMessage(encodedMessage);

            const eip191Signer = new EIP191Signer();

            const incorrectSignerAddress = eip191Signer.recover(
              eip191Signer.hashDataWithIntendedValidator(
                context.keyManager.address,
                encodedMessage,
              ),
              ethereumSignature,
            );

            await expect(
              context.keyManager
                .connect(addressCannotDeploy)
                .executeRelayCall(ethereumSignature, nonce, validityTimestamps, payload, {
                  value: valueToSend,
                }),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NoPermissionsSet')
              .withArgs(incorrectSignerAddress);
          });
        });

        describe("when signing with EIP191Signer '\\x19\\x00'", () => {
          it('should revert with `NotAuthorised` with correct signer address but missing permission DEPLOY', async () => {
            const contractBytecodeToDeploy = TargetContract__factory.bytecode;

            const nonce = await context.keyManager.callStatic.getNonce(
              addressCannotDeploy.address,
              0,
            );

            const validityTimestamps = 0;

            const payload = context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CREATE,
              ethers.constants.AddressZero,
              0,
              contractBytecodeToDeploy,
            ]);

            const HARDHAT_CHAINID = 31337;
            const valueToSend = 0;

            const encodedMessage = ethers.utils.solidityPack(
              ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
              [LSP25_VERSION, HARDHAT_CHAINID, nonce, validityTimestamps, valueToSend, payload],
            );

            const eip191Signer = new EIP191Signer();

            const { signature } = eip191Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT4,
            );

            await expect(
              context.keyManager
                .connect(addressCannotDeploy)
                .executeRelayCall(signature, nonce, validityTimestamps, payload, {
                  value: valueToSend,
                }),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(addressCannotDeploy.address, 'DEPLOY');
          });
        });
      });

      describe('when deploying a contract via CREATE2', () => {
        describe('when signing with Ethereum Signed Message', () => {
          it('should recover the wrong signer address and revert with `NoPermissionsSet`', async () => {
            const contractBytecodeToDeploy = TargetContract__factory.bytecode;
            const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

            const nonce = await context.keyManager.callStatic.getNonce(
              addressCannotDeploy.address,
              0,
            );

            const validityTimestamps = 0;

            const payload = context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CREATE2,
              ethers.constants.AddressZero,
              0,
              contractBytecodeToDeploy + salt.substring(2),
            ]);

            const HARDHAT_CHAINID = 31337;
            const valueToSend = 0;

            const encodedMessage = ethers.utils.solidityPack(
              ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
              [LSP25_VERSION, HARDHAT_CHAINID, nonce, validityTimestamps, valueToSend, payload],
            );

            const ethereumSignature = await addressCannotDeploy.signMessage(encodedMessage);

            const eip191Signer = new EIP191Signer();
            const incorrectSignerAddress = eip191Signer.recover(
              eip191Signer.hashDataWithIntendedValidator(
                context.keyManager.address,
                encodedMessage,
              ),
              ethereumSignature,
            );

            await expect(
              context.keyManager
                .connect(addressCannotDeploy)
                .executeRelayCall(ethereumSignature, nonce, validityTimestamps, payload, {
                  value: valueToSend,
                }),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NoPermissionsSet')
              .withArgs(incorrectSignerAddress);
          });
        });

        describe("when signing with EIP191Signer '\\x19\\x00'", () => {
          it('should revert with `NotAuthorised` with correct signer address but missing permission DEPLOY', async () => {
            const contractBytecodeToDeploy = TargetContract__factory.bytecode;
            const salt = ethers.utils.hexlify(ethers.utils.randomBytes(32));

            const nonce = await context.keyManager.callStatic.getNonce(
              addressCannotDeploy.address,
              0,
            );

            const validityTimestamps = 0;

            const payload = context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CREATE2,
              ethers.constants.AddressZero,
              0,
              contractBytecodeToDeploy + salt.substring(2),
            ]);

            const HARDHAT_CHAINID = 31337;
            const valueToSend = 0;

            const encodedMessage = ethers.utils.solidityPack(
              ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
              [LSP25_VERSION, HARDHAT_CHAINID, nonce, validityTimestamps, valueToSend, payload],
            );

            const lsp6Signer = new EIP191Signer();

            const { signature } = lsp6Signer.signDataWithIntendedValidator(
              context.keyManager.address,
              encodedMessage,
              LOCAL_PRIVATE_KEYS.ACCOUNT4,
            );

            await expect(
              context.keyManager
                .connect(addressCannotDeploy)
                .executeRelayCall(signature, nonce, validityTimestamps, payload, {
                  value: valueToSend,
                }),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(addressCannotDeploy.address, 'DEPLOY');
          });
        });
      });
    });
  });
};
