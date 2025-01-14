import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

import {
  LSP16UniversalFactory,
  LSP16UniversalFactory__factory,
  Account,
  Account__factory,
  AccountInit,
  AccountInit__factory,
  PayableContract,
  PayableContract__factory,
  NonPayableContract__factory,
  ImplementationTester,
  ImplementationTester__factory,
  FallbackInitializer,
  FallbackInitializer__factory,
  ContractNoConstructor__factory,
  ContractNoConstructor,
  FallbackContract,
  FallbackContract__factory,
} from '../typechain';

import { UniversalProfile } from '../../../typechain';
import { AbiCoder, concat } from 'ethers';

const abiCoder = new AbiCoder();

const AccountBytecode = Account__factory.bytecode;
const NonPayableConstructorBytecode = NonPayableContract__factory.bytecode;
const ImplementationTesterBytecode = ImplementationTester__factory.bytecode;
const FallbackInitializerBytecode = FallbackInitializer__factory.bytecode;

type UniversalFactoryTestAccounts = {
  random: SignerWithAddress;
  deployer1: SignerWithAddress;
  deployer2: SignerWithAddress;
  deployer3: SignerWithAddress;
  deployer4: SignerWithAddress;
};

const getNamedAccounts = async () => {
  const [random, deployer1, deployer2, deployer3, deployer4] = await ethers.getSigners();
  return { random, deployer1, deployer2, deployer3, deployer4 };
};

type UniversalFactoryTestContext = {
  accounts: UniversalFactoryTestAccounts;
  universalFactory: LSP16UniversalFactory;
};

describe('UniversalFactory contract', () => {
  const buildTestContext = async (): Promise<UniversalFactoryTestContext> => {
    const accounts = await getNamedAccounts();

    const universalFactory = await new LSP16UniversalFactory__factory(accounts.random).deploy();

    return { accounts, universalFactory };
  };

  describe('When using LSP16UniversalFactory', () => {
    let context: UniversalFactoryTestContext;
    let accountConstructor: Account;
    let accountBaseContract: AccountInit;
    let contractNoConstructor: ContractNoConstructor;
    let payableContract: PayableContract;
    let fallbackContract: FallbackContract;
    let implementationTester: ImplementationTester;
    let fallbackInitializer: FallbackInitializer;

    before(async () => {
      context = await buildTestContext();

      accountConstructor = await new Account__factory(context.accounts.random).deploy(
        context.accounts.random.address,
      );

      accountBaseContract = await new AccountInit__factory(context.accounts.random).deploy();

      contractNoConstructor = await new ContractNoConstructor__factory(
        context.accounts.random,
      ).deploy();

      payableContract = await new PayableContract__factory(context.accounts.random).deploy();

      fallbackContract = await new FallbackContract__factory(context.accounts.random).deploy();

      implementationTester = await new ImplementationTester__factory(
        context.accounts.random,
      ).deploy();

      fallbackInitializer = await new FallbackInitializer__factory(
        context.accounts.random,
      ).deploy();
    });

    describe('when using deployCreate2', () => {
      it('should calculate the address of a non-initializable contract correctly', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const randomAddress = ethers.Wallet.createRandom();

        // Set the Owner as the ZeroAddress
        const UPBytecode = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [randomAddress.address]),
        ]);

        const bytecodeHash = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode]);

        const calulcatedAddress = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt,
          false,
          '0x',
        );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployCreate2.staticCall(UPBytecode, salt);

        expect(calulcatedAddress).to.equal(contractCreated);
      });

      it('should calculate the same address of a contract if the initializeCalldata changed and the contract is not initializable', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const randomAddress = ethers.Wallet.createRandom();

        const UPBytecode = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [randomAddress.address]),
        ]);

        const bytecodeHash = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode]);

        const calulcatedAddressSalt1 = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt,
          false,
          '0xaabbccdd',
        );

        const calulcatedAddressSalt2 = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt,
          false,
          '0xddccbbaa',
        );

        const equalAddresses = calulcatedAddressSalt1 == calulcatedAddressSalt2;

        expect(equalAddresses).to.be.true;
      });

      it('should calculate a different address of a contract if the salt changed', async () => {
        const salt1 = ethers.solidityPackedKeccak256(['string'], ['Salt1']);
        const salt2 = ethers.solidityPackedKeccak256(['string'], ['Salt2']);

        const UPBytecode = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [ethers.ZeroAddress]),
        ]);

        const bytecodeHash = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode]);

        const calulcatedAddressSalt1 = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt1,
          false,
          '0x',
        );

        const calulcatedAddressSalt2 = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt2,
          false,
          '0x',
        );

        const equalAddresses = calulcatedAddressSalt1 == calulcatedAddressSalt2;

        expect(equalAddresses).to.be.false;
      });

      it('should calculate a different address of a contract if the bytecode changed', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const UPBytecode1 = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [ethers.ZeroAddress]),
        ]);

        const bytecodeHash1 = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode1]);

        const UPBytecode2 = concat([
          AccountBytecode,
          abiCoder.encode(['address'], ['0xcafecafecafecafecafecafecafecafecafecafe']),
        ]);

        const bytecodeHash2 = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode2]);

        const calulcatedAddressBytecode1 = await context.universalFactory.computeAddress(
          bytecodeHash1,
          salt,
          false,
          '0x',
        );

        const calulcatedAddressBytecode2 = await context.universalFactory.computeAddress(
          bytecodeHash2,
          salt,
          false,
          '0x',
        );

        const equalAddresses = calulcatedAddressBytecode1 == calulcatedAddressBytecode2;

        expect(equalAddresses).to.be.false;
      });

      it('should revert when deploying a non-initializable contract with the same bytecode and salt ', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const randomAddress = ethers.Wallet.createRandom();

        const UPBytecode = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [randomAddress.address]),
        ]);

        await context.universalFactory.deployCreate2(UPBytecode, salt);

        await expect(context.universalFactory.deployCreate2(UPBytecode, salt)).to.be.revertedWith(
          'Create2: Failed on deploy',
        );
      });

      it('should revert when sending value while deploying a non payable non-initializable contract', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['OtherSalt']);

        const KMBytecode = concat([
          NonPayableConstructorBytecode,
          abiCoder.encode(['address'], [ethers.ZeroAddress]),
        ]);

        await expect(
          context.universalFactory.deployCreate2(KMBytecode, salt, {
            value: 100,
          }),
        ).to.be.revertedWith('Create2: Failed on deploy');
      });

      it('should pass when sending value while deploying a payable non-initializable contract', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['OtherSalt']);

        const valueSent = 100;

        const contractCreated = await context.universalFactory.deployCreate2.staticCall(
          PayableContract__factory.bytecode,
          salt,
          {
            value: 100,
          },
        );

        await context.universalFactory.deployCreate2(PayableContract__factory.bytecode, salt, {
          value: valueSent,
        });

        const balance = await ethers.provider.getBalance(contractCreated);
        expect(balance).to.equal(valueSent);
      });

      it('should deploy an un-initializable contract and get the owner successfully', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const UPBytecode = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [context.accounts.deployer3.address]),
        ]);

        const contractCreatedAddress = await context.universalFactory.deployCreate2.staticCall(
          UPBytecode,
          salt,
        );

        const generatedSalt = await context.universalFactory.generateSalt(salt, false, '0x');

        await expect(context.universalFactory.deployCreate2(UPBytecode, salt))
          .to.emit(context.universalFactory, 'ContractCreated')
          .withArgs(contractCreatedAddress, salt, generatedSalt, false, '0x');

        const universalProfile = accountConstructor.attach(
          contractCreatedAddress,
        ) as UniversalProfile;

        const owner = await universalProfile.owner();
        expect(owner).to.equal(context.accounts.deployer3.address);
      });
    });

    describe('when using deployCreate2AndInitialize', () => {
      it('should calculate the address of an initializable contract correctly', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const initializeCallData = implementationTester.interface.encodeFunctionData('initialize', [
          ethers.ZeroAddress,
        ]);

        const bytecodeHash = ethers.solidityPackedKeccak256(
          ['bytes'],
          [ImplementationTester__factory.bytecode],
        );

        const calulcatedAddress = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt,
          true,
          initializeCallData,
        );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployCreate2AndInitialize.staticCall(
            ImplementationTesterBytecode,
            salt,
            initializeCallData,
            0,
            0,
          );

        expect(calulcatedAddress).to.equal(contractCreated);
      });

      it('should calculate a different address of a contract if the salt changed', async () => {
        const salt1 = ethers.solidityPackedKeccak256(['string'], ['Salt1']);
        const salt2 = ethers.solidityPackedKeccak256(['string'], ['Salt2']);

        const UPBytecode = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [ethers.ZeroAddress]),
        ]);

        const bytecodeHash = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode]);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const calulcatedAddressSalt1 = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt1,
          true,
          initializeCallData,
        );

        const calulcatedAddressSalt2 = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt2,
          true,
          initializeCallData,
        );

        const equalAddresses = calulcatedAddressSalt1 == calulcatedAddressSalt2;

        expect(equalAddresses).to.be.false;
      });

      it('should calculate a different address of a contract if the initializeCalldata changed', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const UPBytecode = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [ethers.ZeroAddress]),
        ]);

        const bytecodeHash = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode]);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const calculatedAddressInitializableFalse = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt,
          true,
          '0xaabbccdd',
        );

        const calculatedAddressInitializableTrue = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt,
          true,
          initializeCallData,
        );

        const equalAddresses =
          calculatedAddressInitializableTrue == calculatedAddressInitializableFalse;

        expect(equalAddresses).to.be.false;
      });

      it('should calculate a different address of a contract if the bytecode changed', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const UPBytecode1 = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [ethers.ZeroAddress]),
        ]);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const bytecodeHash1 = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode1]);

        const UPBytecode2 = concat([
          AccountBytecode,
          abiCoder.encode(['address'], ['0xcafecafecafecafecafecafecafecafecafecafe']),
        ]);

        const bytecodeHash2 = ethers.solidityPackedKeccak256(['bytes'], [UPBytecode2]);

        const calulcatedAddressBytecode1 = await context.universalFactory.computeAddress(
          bytecodeHash1,
          salt,
          true,
          initializeCallData,
        );

        const calulcatedAddressBytecode2 = await context.universalFactory.computeAddress(
          bytecodeHash2,
          salt,
          true,
          initializeCallData,
        );

        const equalAddresses = calulcatedAddressBytecode1 == calulcatedAddressBytecode2;

        expect(equalAddresses).to.be.false;
      });

      it('should revert when deploying an initializable contract with the same bytecode and salt ', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salting']);

        const fallbackInitializerBytecode = FallbackInitializerBytecode;

        await context.universalFactory.deployCreate2AndInitialize(
          fallbackInitializerBytecode,
          salt,
          '0xaabbccdd',
          0,
          0,
        );

        await expect(
          context.universalFactory.deployCreate2AndInitialize(
            fallbackInitializerBytecode,
            salt,
            '0xaabbccdd',
            0,
            0,
          ),
        ).to.be.revertedWith('Create2: Failed on deploy');
      });

      it('should revert when deploying an initializable contract with sending value unmatched to the msgValue arguments', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const UPBytecode = concat([
          AccountBytecode,
          abiCoder.encode(['address'], [ethers.ZeroAddress]),
        ]);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        await expect(
          context.universalFactory.deployCreate2AndInitialize(
            UPBytecode,
            salt,
            initializeCallData,
            1,
            2,
            { value: 2 },
          ),
        ).to.be.revertedWithCustomError(context.universalFactory, 'InvalidValueSum');
      });

      it('should pass when deploying an initializable contract without passing an initialize calldata', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const fallbackInitializerBytecode = FallbackInitializerBytecode;

        const contractCreated =
          await context.universalFactory.deployCreate2AndInitialize.staticCall(
            fallbackInitializerBytecode,
            salt,
            '0x', // empty initializeCallData
            0,
            0,
          );

        await context.universalFactory.deployCreate2AndInitialize(
          fallbackInitializerBytecode,
          salt,
          '0x', // empty initializeCallData
          0,
          0,
        );

        const fallbackInitializerCreated = fallbackInitializer.attach(
          contractCreated,
        ) as FallbackInitializer;

        const caller = await fallbackInitializerCreated.caller();
        expect(caller).to.equal(await context.universalFactory.getAddress());
      });

      it('should pass when deploying an initializable contract that constructor and initialize function is payable', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const PayableTrueCalldata = payableContract.interface.encodeFunctionData('payableTrue');

        const valueSentToConstructor = 100;
        const valueSentToInitialize = 200;
        const sumValueSent = valueSentToConstructor + valueSentToInitialize;

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployCreate2AndInitialize.staticCall(
            PayableContract__factory.bytecode,
            salt,
            PayableTrueCalldata,
            valueSentToConstructor,
            valueSentToInitialize,
            { value: sumValueSent },
          );

        await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployCreate2AndInitialize(
            PayableContract__factory.bytecode,
            salt,
            PayableTrueCalldata,
            valueSentToConstructor,
            valueSentToInitialize,
            { value: sumValueSent },
          );

        const balance = await ethers.provider.getBalance(contractCreated);
        expect(balance).to.equal(sumValueSent);
      });

      it('should deploy an initializable CREATE2 contract and emit the event and get the owner successfully', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const initializeCallData = implementationTester.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const contractCreatedAddress =
          await context.universalFactory.deployCreate2AndInitialize.staticCall(
            ImplementationTesterBytecode,
            salt,
            initializeCallData,
            0,
            0,
          );

        const generatedSalt = await context.universalFactory.generateSalt(
          salt,
          true,
          initializeCallData,
        );

        await expect(
          context.universalFactory.deployCreate2AndInitialize(
            ImplementationTesterBytecode,
            salt,
            initializeCallData,
            0,
            0,
          ),
        )
          .to.emit(context.universalFactory, 'ContractCreated')
          .withArgs(contractCreatedAddress, salt, generatedSalt, true, initializeCallData);

        const factoryTesterContract = implementationTester.attach(
          contractCreatedAddress,
        ) as ImplementationTester;
        const owner = await factoryTesterContract.owner();
        expect(owner).to.equal(context.accounts.deployer1.address);
      });
    });

    describe('when using deployERC1167Proxy', () => {
      it("should calculate the address of a proxy correctly if it's not initializable", async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const calculatedAddress = await context.universalFactory.computeERC1167Address(
          await contractNoConstructor.getAddress(),
          salt,
          false,
          '0x',
        );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployERC1167Proxy.staticCall(contractNoConstructor.target, salt);

        expect(calculatedAddress).to.equal(contractCreated);
      });

      it('should calculate a different address of a proxy if the `salt` changed', async () => {
        const salt1 = ethers.solidityPackedKeccak256(['string'], ['Salt1']);
        const salt2 = ethers.solidityPackedKeccak256(['string'], ['Salt2']);

        const calculatedAddressSalt1 = await context.universalFactory.computeERC1167Address(
          accountBaseContract.target,
          salt1,
          false,
          '0x',
        );

        const calculatedAddressSalt2 = await context.universalFactory.computeERC1167Address(
          accountBaseContract.target,
          salt2,
          false,
          '0x',
        );

        const equalAddresses = calculatedAddressSalt1 == calculatedAddressSalt2;

        expect(equalAddresses).to.be.false;
      });

      it("should calculate the same address of a proxy if the initializeCalldata changed (because it's not initializable)", async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const calculatedAddressInitializableTrue =
          await context.universalFactory.computeERC1167Address(
            accountBaseContract.target,
            salt,
            false,
            initializeCallData,
          );

        const calculatedAddressInitializableFalse =
          await context.universalFactory.computeERC1167Address(
            accountBaseContract.target,
            salt,
            false,
            '0xaabb',
          );

        const equalAddresses =
          calculatedAddressInitializableTrue == calculatedAddressInitializableFalse;

        expect(equalAddresses).to.be.true;
      });

      it('should calculate a different address of a proxy if the `baseContract` changed', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const calulcatedAddressBaseContract1 = await context.universalFactory.computeERC1167Address(
          accountBaseContract.target,
          salt,
          false,
          '0x',
        );

        const calulcatedAddressBaseContract2 = await context.universalFactory.computeERC1167Address(
          await contractNoConstructor.getAddress(),
          salt,
          false,
          '0x',
        );

        const equalAddresses = calulcatedAddressBaseContract1 == calulcatedAddressBaseContract2;

        expect(equalAddresses).to.be.false;
      });

      it('should revert when deploying a proxy contract with the same `baseContract` and salt ', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        await context.universalFactory.deployERC1167Proxy(accountBaseContract.target, salt);

        await expect(
          context.universalFactory.deployERC1167Proxy(accountBaseContract.target, salt),
        ).to.be.revertedWith('ERC1167: create2 failed');
      });

      it('should deploy an un-initializable CREATE2 proxy contract and emit the event and get the default owner successfully', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt#2']);

        const contractCreatedAddress = await context.universalFactory.deployERC1167Proxy.staticCall(
          accountBaseContract.target,
          salt,
        );

        const generatedSalt = await context.universalFactory.generateSalt(salt, false, '0x');

        await expect(context.universalFactory.deployERC1167Proxy(accountBaseContract.target, salt))
          .to.emit(context.universalFactory, 'ContractCreated')
          .withArgs(contractCreatedAddress, salt, generatedSalt, false, '0x');

        const universalProfile = accountBaseContract.attach(
          contractCreatedAddress,
        ) as UniversalProfile;

        const owner = await universalProfile.owner();
        expect(owner).to.equal(ethers.ZeroAddress);
      });
    });

    describe('when using deployERC1167ProxyAndInitialize', () => {
      it("should calculate the address of a proxy correctly if it's initializable", async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const calculatedAddress = await context.universalFactory.computeERC1167Address(
          accountBaseContract.target,
          salt,
          true,
          initializeCallData,
        );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployERC1167ProxyAndInitialize.staticCall(
            accountBaseContract.target,
            salt,
            initializeCallData,
          );

        expect(calculatedAddress).to.equal(contractCreated);
      });

      it('should calculate a different address of a proxy if the `salt` changed', async () => {
        const salt1 = ethers.solidityPackedKeccak256(['string'], ['Salt1']);
        const salt2 = ethers.solidityPackedKeccak256(['string'], ['Salt2']);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const calculatedAddressSalt1 = await context.universalFactory.computeERC1167Address(
          accountBaseContract.target,
          salt1,
          true,
          initializeCallData,
        );

        const calculatedAddressSalt2 = await context.universalFactory.computeERC1167Address(
          accountBaseContract.target,
          salt2,
          true,
          initializeCallData,
        );

        const equalAddresses = calculatedAddressSalt1 == calculatedAddressSalt2;

        expect(equalAddresses).to.be.false;
      });

      it('should calculate a different address of a proxy if the `initializeCallData` changed', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const initializeCallData1 = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const initializeCallData2 = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer2.address,
        ]);

        const calulcatedAddressinitializeCallData1 =
          await context.universalFactory.computeERC1167Address(
            accountBaseContract.target,
            salt,
            true,
            initializeCallData1,
          );

        const calulcatedAddressinitializeCallData2 =
          await context.universalFactory.computeERC1167Address(
            accountBaseContract.target,
            salt,
            true,
            initializeCallData2,
          );

        const equalAddresses =
          calulcatedAddressinitializeCallData1 == calulcatedAddressinitializeCallData2;

        expect(equalAddresses).to.be.false;
      });

      it('should calculate a different address of a proxy if the `baseContract` changed', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        const calulcatedAddressBaseContract1 = await context.universalFactory.computeERC1167Address(
          accountBaseContract.target,
          salt,
          true,
          initializeCallData,
        );

        const calulcatedAddressBaseContract2 = await context.universalFactory.computeERC1167Address(
          await contractNoConstructor.getAddress(),
          salt,
          true,
          initializeCallData,
        );

        const equalAddresses = calulcatedAddressBaseContract1 == calulcatedAddressBaseContract2;

        expect(equalAddresses).to.be.false;
      });

      it('should revert when deploying a proxy contract with the same `baseContract` and salt ', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer1.address,
        ]);

        await context.universalFactory.deployERC1167ProxyAndInitialize(
          accountBaseContract.target,
          salt,
          initializeCallData,
        );

        await expect(
          context.universalFactory.deployERC1167ProxyAndInitialize(
            accountBaseContract.target,
            salt,
            initializeCallData,
          ),
        ).to.be.revertedWith('ERC1167: create2 failed');
      });

      it('should pass and initialize local variable when sending value while deploying a CREATE2 proxy without `initializeCallData`', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const contractCreated =
          await context.universalFactory.deployERC1167ProxyAndInitialize.staticCall(
            fallbackInitializer.target,
            salt,
            '0x',
            {
              value: ethers.parseEther('1300'),
            },
          );

        await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployERC1167ProxyAndInitialize(fallbackInitializer.target, salt, '0x', {
            value: ethers.parseEther('1300'),
          });

        const fallbackInitializerCreated = fallbackInitializer.attach(
          contractCreated,
        ) as FallbackInitializer;

        const caller = await fallbackInitializerCreated.caller();
        expect(caller).to.equal(await context.universalFactory.getAddress());
      });

      it('should revert when deploying a proxy and sending value to a non payable function in deployERC1167Proxy', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const PayableFalseCalldata = payableContract.interface.encodeFunctionData('payableFalse');

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer1)
            .deployERC1167ProxyAndInitialize(payableContract.target, salt, PayableFalseCalldata, {
              value: 100,
            }),
        ).to.be.revertedWithCustomError(context.universalFactory, 'ContractInitializationFailed');
      });

      it('should pass when deploying a proxy and sending value to a payable function in deployERC1167Proxy', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const PayableTrueCalldata = payableContract.interface.encodeFunctionData('payableTrue');

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployERC1167ProxyAndInitialize.staticCall(
            payableContract.target,
            salt,
            PayableTrueCalldata,
          );

        const valueSent = 100;

        await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployERC1167ProxyAndInitialize(payableContract.target, salt, PayableTrueCalldata, {
            value: valueSent,
          });

        const balance = await ethers.provider.getBalance(contractCreated);
        expect(balance).to.equal(valueSent);
      });

      it("should revert when deploying a proxy and passing calldata for a non-existing function where fallback function doesn't exist", async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const RandomCalldata = '0xcafecafe';

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer1)
            .deployERC1167ProxyAndInitialize(payableContract.target, salt, RandomCalldata),
        ).to.be.revertedWithCustomError(context.universalFactory, 'ContractInitializationFailed');
      });

      it('should pass when deploying a proxy and passing calldata for a non-existing function where fallback function exist', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt']);

        const RandomCalldata = '0xcafecafe';

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer1)
            .deployERC1167ProxyAndInitialize(fallbackContract.target, salt, RandomCalldata),
        ).to.not.be.reverted;
      });

      it('should deploy an initializable CREATE2 proxy contract and emit the event and get the owner successfully', async () => {
        const salt = ethers.solidityPackedKeccak256(['string'], ['Salt#3']);

        const initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
          context.accounts.deployer4.address,
        ]);

        const contractCreatedAddress =
          await context.universalFactory.deployERC1167ProxyAndInitialize.staticCall(
            accountBaseContract.target,
            salt,
            initializeCallData,
          );

        const generatedSalt = await context.universalFactory.generateSalt(
          salt,
          true,
          initializeCallData,
        );

        await expect(
          context.universalFactory.deployERC1167ProxyAndInitialize(
            accountBaseContract.target,
            salt,
            initializeCallData,
          ),
        )
          .to.emit(context.universalFactory, 'ContractCreated')
          .withArgs(contractCreatedAddress, salt, generatedSalt, true, initializeCallData);

        const universalProfile = accountBaseContract.attach(
          contractCreatedAddress,
        ) as UniversalProfile;

        const owner = await universalProfile.owner();
        expect(owner).to.equal(context.accounts.deployer4.address);
      });
    });

    describe('when testing edge cases', () => {
      describe('When deploying initializable minimal proxies via deployERC1167ProxyAndInitialize', () => {
        let salt;
        let initializeCallData;
        let contractCreatedWithdeployERC1167ProxyAndInitialize;
        before(async () => {
          salt = ethers.solidityPackedKeccak256(['string'], ['SaltEdge']);

          initializeCallData = accountBaseContract.interface.encodeFunctionData('initialize', [
            context.accounts.deployer1.address,
          ]);

          contractCreatedWithdeployERC1167ProxyAndInitialize =
            await context.universalFactory.deployERC1167ProxyAndInitialize.staticCall(
              accountBaseContract.target,
              salt,
              initializeCallData,
            );
        });

        it('should result in a different address if deployed without initializing with deployERC1167Proxy function', async () => {
          const contractCreatedWithdeployERC1167Proxy =
            await context.universalFactory.deployERC1167Proxy.staticCall(
              accountBaseContract.target,
              salt,
            );

          const equalAddresses =
            contractCreatedWithdeployERC1167ProxyAndInitialize ==
            contractCreatedWithdeployERC1167Proxy;

          expect(equalAddresses).to.be.false;
        });

        it('should result in a diffferent address if deployed without initializing with deployCreate2 function', async () => {
          const eip1167RuntimeCodeTemplate =
            '0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3';

          // deploy proxy contract
          const proxyBytecode = eip1167RuntimeCodeTemplate.replace(
            'bebebebebebebebebebebebebebebebebebebebe',
            (accountBaseContract.target as string).substring(2),
          );

          const contractCreatedWithDeployCreate2 =
            await context.universalFactory.deployCreate2.staticCall(proxyBytecode, salt);

          const equalAddresses =
            contractCreatedWithdeployERC1167ProxyAndInitialize == contractCreatedWithDeployCreate2;

          expect(equalAddresses).to.be.false;
        });
        it('should result in the same address if deployed with initializing with deployCreate2AndInitialize function', async () => {
          const eip1167RuntimeCodeTemplate =
            '0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3';

          // deploy proxy contract
          const proxyBytecode = eip1167RuntimeCodeTemplate.replace(
            'bebebebebebebebebebebebebebebebebebebebe',
            (accountBaseContract.target as string).substring(2),
          );

          const contractCreatedWithdeployCreate2AndInitialize =
            await context.universalFactory.deployCreate2AndInitialize.staticCall(
              proxyBytecode,
              salt,
              initializeCallData,
              0,
              0,
            );

          const equalAddresses =
            contractCreatedWithdeployERC1167ProxyAndInitialize ==
            contractCreatedWithdeployCreate2AndInitialize;

          expect(equalAddresses).to.be.true;
        });
      });
    });

    describe('`generateSalt(...)`', () => {
      it('should generate the same salt as with `ethers.keccak256`', async () => {
        const providedSalt = '0x7d1f4b76de4cdffc4ebac16883d3a7c9cbd95b6130494c4ad48e6a8e24083572';

        const initializeCallData =
          '0xc4d66de8000000000000000000000000d208a16f18a3bab276dff0b62ef591a846c86cba';

        const generatedSalt = ethers.keccak256(
          ethers.solidityPacked(
            ['bool', 'bytes', 'bytes32'],
            [true, initializeCallData, providedSalt],
          ),
        );

        expect(
          await context.universalFactory.generateSalt(providedSalt, true, initializeCallData),
        ).to.equal(generatedSalt);
      });

      it('should generate the same salt as with `web3.keccak256`', async () => {
        const providedSalt = '0x7d1f4b76de4cdffc4ebac16883d3a7c9cbd95b6130494c4ad48e6a8e24083572';

        const initializeCallData =
          '0xc4d66de8000000000000000000000000d208a16f18a3bab276dff0b62ef591a846c86cba';

        const generatedSalt = ethers.keccak256(
          ethers.solidityPacked(
            ['bool', 'bytes', 'bytes32'],
            [true, initializeCallData, providedSalt],
          ),
        );

        expect(
          await context.universalFactory.generateSalt(providedSalt, true, initializeCallData),
        ).to.equal(generatedSalt);
      });
    });
  });
});
