import { ethers } from "hardhat";
import { expect } from "chai";
import {
  LSP1UniversalReceiverDelegateUP__factory,
  LSP16UniversalFactory,
  LSP16UniversalFactory__factory,
  UniversalProfileInit,
  UniversalProfileInit__factory,
  LSP1UniversalReceiverDelegateUP,
  UniversalProfile,
  UniversalProfile__factory,
  PayableContract,
  PayableContract__factory,
  FallbackContract,
  FallbackContract__factory,
  ImplementationTester,
  ImplementationTester__factory,
  FallbackInitializer,
  FallbackInitializer__factory,
} from "../../types";

import web3 from "web3";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { provider, AddressOffset } from "../utils/helpers";

import { bytecode as UniversalProfileBytecode } from "../../artifacts/contracts/UniversalProfile.sol/UniversalProfile.json";
import { bytecode as LSP6KeyManagerBytecode } from "../../artifacts/contracts/LSP6KeyManager/LSP6KeyManager.sol/LSP6KeyManager.json";
import { bytecode as PayableContractBytecode } from "../../artifacts/contracts/Mocks/PayableContract.sol/PayableContract.json";
import { bytecode as ImplementationTesterBytecode } from "../../artifacts/contracts/Mocks/ImplementationTester.sol/ImplementationTester.json";
import { bytecode as FallbackInitializerBytecode } from "../../artifacts/contracts/Mocks/FallbackInitializer.sol/FallbackInitializer.json";

type UniversalFactoryTestAccounts = {
  random: SignerWithAddress;
  deployer1: SignerWithAddress;
  deployer2: SignerWithAddress;
  deployer3: SignerWithAddress;
  deployer4: SignerWithAddress;
};

const getNamedAccounts = async () => {
  const [random, deployer1, deployer2, deployer3, deployer4] =
    await ethers.getSigners();
  return { random, deployer1, deployer2, deployer3, deployer4 };
};

type UniversalFactoryTestContext = {
  accounts: UniversalFactoryTestAccounts;
  universalFactory: LSP16UniversalFactory;
};

describe("UniversalFactory contract", () => {
  const buildTestContext = async (): Promise<UniversalFactoryTestContext> => {
    const accounts = await getNamedAccounts();

    const universalFactory = await new LSP16UniversalFactory__factory(
      accounts.random
    ).deploy();

    return { accounts, universalFactory };
  };

  describe("When using LSP16UniversalFactory", () => {
    let context: UniversalFactoryTestContext;
    let universalProfileConstructor: UniversalProfile;
    let universalProfileBaseContract: UniversalProfileInit;
    let universalReceiverDelegate: LSP1UniversalReceiverDelegateUP;
    let payableContract: PayableContract;
    let fallbackContract: FallbackContract;
    let implementationTester: ImplementationTester;
    let fallbackInitializer: FallbackInitializer;

    before(async () => {
      context = await buildTestContext();

      universalProfileConstructor = await new UniversalProfile__factory(
        context.accounts.random
      ).deploy(ethers.constants.AddressZero);

      universalProfileBaseContract = await new UniversalProfileInit__factory(
        context.accounts.random
      ).deploy();

      universalReceiverDelegate =
        await new LSP1UniversalReceiverDelegateUP__factory(
          context.accounts.random
        ).deploy();

      payableContract = await new PayableContract__factory(
        context.accounts.random
      ).deploy();

      fallbackContract = await new FallbackContract__factory(
        context.accounts.random
      ).deploy();

      implementationTester = await new ImplementationTester__factory(
        context.accounts.random
      ).deploy();

      fallbackInitializer = await new FallbackInitializer__factory(
        context.accounts.random
      ).deploy();
    });

    describe("when using deployCreate2", () => {
      it("should calculate the address of a non-initializable contract correctly", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        // Set the Owner as the ZeroAddress
        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        let bytecodeHash = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode]
        );

        const calulcatedAddress = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt,
          false,
          []
        );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2(UPBytecode, salt);

        expect(calulcatedAddress).to.equal(contractCreated);
      });

      it("should calculate the same address of a contract if the initializeCalldata changed and the contract is not initializable", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        let bytecodeHash = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode]
        );

        const calulcatedAddressSalt1 =
          await context.universalFactory.computeAddress(
            bytecodeHash,
            salt,
            false,
            "0xaabbccdd"
          );

        const calulcatedAddressSalt2 =
          await context.universalFactory.computeAddress(
            bytecodeHash,
            salt,
            false,
            "0xddccbbaa"
          );

        let equalAddresses = calulcatedAddressSalt1 == calulcatedAddressSalt2;

        expect(equalAddresses).to.be.true;
      });

      it("should calculate a different address of a contract if the salt changed", async () => {
        let salt1 = ethers.utils.solidityKeccak256(["string"], ["Salt1"]);
        let salt2 = ethers.utils.solidityKeccak256(["string"], ["Salt2"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        let bytecodeHash = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode]
        );

        const calulcatedAddressSalt1 =
          await context.universalFactory.computeAddress(
            bytecodeHash,
            salt1,
            false,
            "0x"
          );

        const calulcatedAddressSalt2 =
          await context.universalFactory.computeAddress(
            bytecodeHash,
            salt2,
            false,
            "0x"
          );

        let equalAddresses = calulcatedAddressSalt1 == calulcatedAddressSalt2;

        expect(equalAddresses).to.be.false;
      });

      it("should calculate a different address of a contract if the bytecode changed", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode1 =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        let bytecodeHash1 = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode1]
        );

        let UPBytecode2 =
          UniversalProfileBytecode +
          AddressOffset +
          "cafecafecafecafecafecafecafecafecafecafe";

        let bytecodeHash2 = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode2]
        );

        const calulcatedAddressBytecode1 =
          await context.universalFactory.computeAddress(
            bytecodeHash1,
            salt,
            false,
            "0x"
          );

        const calulcatedAddressBytecode2 =
          await context.universalFactory.computeAddress(
            bytecodeHash2,
            salt,
            false,
            "0x"
          );

        let equalAddresses =
          calulcatedAddressBytecode1 == calulcatedAddressBytecode2;

        expect(equalAddresses).to.be.false;
      });

      it("should revert when deploying a non-initializable contract with the same bytecode and salt ", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        await context.universalFactory.deployCreate2(UPBytecode, salt);

        await expect(
          context.universalFactory.deployCreate2(UPBytecode, salt)
        ).to.be.revertedWith("Create2: Failed on deploy");
      });

      it("should revert when sending value while deploying a non payable non-initializable contract", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["OtherSalt"]);

        let KMBytecode =
          LSP6KeyManagerBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        await expect(
          context.universalFactory.deployCreate2(KMBytecode, salt, {
            value: 100,
          })
        ).to.be.revertedWith("Create2: Failed on deploy");
      });

      it("should pass when sending value while deploying a payable non-initializable contract", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["OtherSalt"]);

        // imported
        PayableContractBytecode;

        const valueSent = 100;

        const contractCreated =
          await context.universalFactory.callStatic.deployCreate2(
            PayableContractBytecode,
            salt,
            {
              value: 100,
            }
          );

        await context.universalFactory.deployCreate2(
          PayableContractBytecode,
          salt,
          {
            value: valueSent,
          }
        );

        const balance = (await provider.getBalance(contractCreated)).toNumber();
        expect(balance).to.equal(valueSent);
      });

      it("should deploy an un-initializable contract and get the owner successfully", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          context.accounts.deployer3.address.substr(2);

        const contractCreatedAddress =
          await context.universalFactory.callStatic.deployCreate2(
            UPBytecode,
            salt
          );

        await expect(context.universalFactory.deployCreate2(UPBytecode, salt))
          .to.emit(context.universalFactory, "ContractCreated")
          .withArgs(contractCreatedAddress, salt, false, "0x");

        const universalProfile = universalProfileConstructor.attach(
          contractCreatedAddress
        );

        const owner = await universalProfile.callStatic.owner();
        expect(owner).to.equal(context.accounts.deployer3.address);
      });
    });

    describe("when using deployCreate2AndInitialize", () => {
      it("should calculate the address of an initializable contract correctly", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let initializeCallData =
          implementationTester.interface.encodeFunctionData("initialize", [
            ethers.constants.AddressZero,
          ]);

        let bytecodeHash = ethers.utils.solidityKeccak256(
          ["bytes"],
          [ImplementationTesterBytecode]
        );

        const calulcatedAddress = await context.universalFactory.computeAddress(
          bytecodeHash,
          salt,
          true,
          initializeCallData
        );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2AndInitialize(
            ImplementationTesterBytecode,
            salt,
            initializeCallData,
            0,
            0
          );

        expect(calulcatedAddress).to.equal(contractCreated);
      });

      it("should calculate a different address of a contract if the salt changed", async () => {
        let salt1 = ethers.utils.solidityKeccak256(["string"], ["Salt1"]);
        let salt2 = ethers.utils.solidityKeccak256(["string"], ["Salt2"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        let bytecodeHash = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode]
        );

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        const calulcatedAddressSalt1 =
          await context.universalFactory.computeAddress(
            bytecodeHash,
            salt1,
            true,
            initializeCallData
          );

        const calulcatedAddressSalt2 =
          await context.universalFactory.computeAddress(
            bytecodeHash,
            salt2,
            true,
            initializeCallData
          );

        let equalAddresses = calulcatedAddressSalt1 == calulcatedAddressSalt2;

        expect(equalAddresses).to.be.false;
      });

      it("should calculate a different address of a contract if the initializeCalldata changed", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        let bytecodeHash = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode]
        );

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        const calculatedAddressInitializableFalse =
          await context.universalFactory.computeAddress(
            bytecodeHash,
            salt,
            true,
            "0xaabbccdd"
          );

        const calculatedAddressInitializableTrue =
          await context.universalFactory.computeAddress(
            bytecodeHash,
            salt,
            true,
            initializeCallData
          );

        let equalAddresses =
          calculatedAddressInitializableTrue ==
          calculatedAddressInitializableFalse;

        expect(equalAddresses).to.be.false;
      });

      it("should calculate a different address of a contract if the bytecode changed", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode1 =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        let bytecodeHash1 = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode1]
        );

        let UPBytecode2 =
          UniversalProfileBytecode +
          AddressOffset +
          "cafecafecafecafecafecafecafecafecafecafe";

        let bytecodeHash2 = ethers.utils.solidityKeccak256(
          ["bytes"],
          [UPBytecode2]
        );

        const calulcatedAddressBytecode1 =
          await context.universalFactory.computeAddress(
            bytecodeHash1,
            salt,
            true,
            initializeCallData
          );

        const calulcatedAddressBytecode2 =
          await context.universalFactory.computeAddress(
            bytecodeHash2,
            salt,
            true,
            initializeCallData
          );

        let equalAddresses =
          calulcatedAddressBytecode1 == calulcatedAddressBytecode2;

        expect(equalAddresses).to.be.false;
      });

      it("should revert when deploying an initializable contract with the same bytecode and salt ", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        await context.universalFactory.deployCreate2AndInitialize(
          UPBytecode,
          salt,
          "0x00000000aabbccdd", // send some random data along prepended with `0x00000000`
          0,
          0
        );

        await expect(
          context.universalFactory.deployCreate2AndInitialize(
            UPBytecode,
            salt,
            "0x00000000aabbccdd", // send some random data along prepended with `0x00000000`
            0,
            0
          )
        ).to.be.revertedWith("Create2: Failed on deploy");
      });

      it("should revert when deploying an initializable contract with sending value unmatched to the msgValue arguments", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        await expect(
          context.universalFactory.deployCreate2AndInitialize(
            UPBytecode,
            salt,
            initializeCallData,
            1,
            2,
            { value: 2 }
          )
        ).to.be.revertedWithCustomError(
          context.universalFactory,
          "InvalidValueSum"
        );
      });

      it("should pass when deploying an initializable contract without passing an initialize calldata", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let fallbackInitializerBytecode = FallbackInitializerBytecode;

        const contractCreated =
          await context.universalFactory.callStatic.deployCreate2AndInitialize(
            fallbackInitializerBytecode,
            salt,
            [], // empty initializeCallData
            0,
            0
          );

        await context.universalFactory.deployCreate2AndInitialize(
          fallbackInitializerBytecode,
          salt,
          [], // empty initializeCallData
          0,
          0
        );

        const fallbackInitializerCreated =
          fallbackInitializer.attach(contractCreated);

        let caller = await fallbackInitializerCreated.callStatic.caller();
        expect(caller).to.equal(context.universalFactory.address);
      });

      it("should pass when deploying an initializable contract that constructor and initialize function is payable", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let PayableTrueCalldata =
          payableContract.interface.encodeFunctionData("payableTrue");

        let valueSentToConstructor = 100;
        let valueSentToInitialize = 200;
        let sumValueSent = valueSentToConstructor + valueSentToInitialize;

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2AndInitialize(
            PayableContractBytecode,
            salt,
            PayableTrueCalldata,
            valueSentToConstructor,
            valueSentToInitialize,
            { value: sumValueSent }
          );

        await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployCreate2AndInitialize(
            PayableContractBytecode,
            salt,
            PayableTrueCalldata,
            valueSentToConstructor,
            valueSentToInitialize,
            { value: sumValueSent }
          );

        let balance = (await provider.getBalance(contractCreated)).toNumber();
        expect(balance).to.equal(sumValueSent);
      });

      it("should deploy an initializable CREATE2 contract and emit the event and get the owner successfully", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let initializeCallData =
          implementationTester.interface.encodeFunctionData("initialize", [
            context.accounts.deployer1.address,
          ]);

        const contractCreatedAddress =
          await context.universalFactory.callStatic.deployCreate2AndInitialize(
            ImplementationTesterBytecode,
            salt,
            initializeCallData,
            0,
            0
          );

        await expect(
          context.universalFactory.deployCreate2AndInitialize(
            ImplementationTesterBytecode,
            salt,
            initializeCallData,
            0,
            0
          )
        )
          .to.emit(context.universalFactory, "ContractCreated")
          .withArgs(contractCreatedAddress, salt, true, initializeCallData);

        const factoryTesterContract = implementationTester.attach(
          contractCreatedAddress
        );
        const owner = await factoryTesterContract.callStatic.owner();
        expect(owner).to.equal(context.accounts.deployer1.address);
      });
    });

    describe("when using deployERC1167Proxy", () => {
      it("should calculate the address of a proxy correctly if it's not initializable", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        const calculatedAddress =
          await context.universalFactory.computeERC1167Address(
            universalReceiverDelegate.address,
            salt,
            false,
            "0x"
          );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployERC1167Proxy(
            universalReceiverDelegate.address,
            salt
          );

        expect(calculatedAddress).to.equal(contractCreated);
      });

      it("should calculate a different address of a proxy if the `salt` changed", async () => {
        let salt1 = ethers.utils.solidityKeccak256(["string"], ["Salt1"]);
        let salt2 = ethers.utils.solidityKeccak256(["string"], ["Salt2"]);

        const calculatedAddressSalt1 =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt1,
            false,
            "0x"
          );

        const calculatedAddressSalt2 =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt2,
            false,
            "0x"
          );

        let equalAddresses = calculatedAddressSalt1 == calculatedAddressSalt2;

        expect(equalAddresses).to.be.false;
      });

      it("should calculate the same address of a proxy if the initializeCalldata changed (because it's not initializable)", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        const calculatedAddressInitializableTrue =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt,
            false,
            initializeCallData
          );

        const calculatedAddressInitializableFalse =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt,
            false,
            "0xaabb"
          );

        let equalAddresses =
          calculatedAddressInitializableTrue ==
          calculatedAddressInitializableFalse;

        expect(equalAddresses).to.be.true;
      });

      it("should calculate a different address of a proxy if the `baseContract` changed", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        const calulcatedAddressBaseContract1 =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt,
            false,
            "0x"
          );

        const calulcatedAddressBaseContract2 =
          await context.universalFactory.computeERC1167Address(
            universalReceiverDelegate.address,
            salt,
            false,
            "0x"
          );

        let equalAddresses =
          calulcatedAddressBaseContract1 == calulcatedAddressBaseContract2;

        expect(equalAddresses).to.be.false;
      });

      it("should revert when deploying a proxy contract with the same `baseContract` and salt ", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        await context.universalFactory.deployERC1167Proxy(
          universalProfileBaseContract.address,
          salt
        );

        await expect(
          context.universalFactory.deployERC1167Proxy(
            universalProfileBaseContract.address,
            salt
          )
        ).to.be.revertedWith("ERC1167: create2 failed");
      });

      it("should deploy an un-initializable CREATE2 proxy contract and emit the event and get the default owner successfully", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt#2"]);

        const contractCreatedAddress =
          await context.universalFactory.callStatic.deployERC1167Proxy(
            universalProfileBaseContract.address,
            salt
          );

        await expect(
          context.universalFactory.deployERC1167Proxy(
            universalProfileBaseContract.address,
            salt
          )
        )
          .to.emit(context.universalFactory, "ContractCreated")
          .withArgs(contractCreatedAddress, salt, false, "0x");

        const universalProfile = universalProfileBaseContract.attach(
          contractCreatedAddress
        );

        const owner = await universalProfile.callStatic.owner();
        expect(owner).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("when using deployERC1167ProxyAndInitialize", () => {
      it("should calculate the address of a proxy correctly if it's initializable", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        const calculatedAddress =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt,
            true,
            initializeCallData
          );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployERC1167ProxyAndInitialize(
            universalProfileBaseContract.address,
            salt,
            initializeCallData
          );

        expect(calculatedAddress).to.equal(contractCreated);
      });

      it("should calculate a different address of a proxy if the `salt` changed", async () => {
        let salt1 = ethers.utils.solidityKeccak256(["string"], ["Salt1"]);
        let salt2 = ethers.utils.solidityKeccak256(["string"], ["Salt2"]);

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        const calculatedAddressSalt1 =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt1,
            true,
            initializeCallData
          );

        const calculatedAddressSalt2 =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt2,
            true,
            initializeCallData
          );

        let equalAddresses = calculatedAddressSalt1 == calculatedAddressSalt2;

        expect(equalAddresses).to.be.false;
      });

      it("should calculate a different address of a proxy if the `initializeCallData` changed", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let initializeCallData1 =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        let initializeCallData2 =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer2.address]
          );

        const calulcatedAddressinitializeCallData1 =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt,
            true,
            initializeCallData1
          );

        const calulcatedAddressinitializeCallData2 =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt,
            true,
            initializeCallData2
          );

        let equalAddresses =
          calulcatedAddressinitializeCallData1 ==
          calulcatedAddressinitializeCallData2;

        expect(equalAddresses).to.be.false;
      });

      it("should calculate a different address of a proxy if the `baseContract` changed", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer1.address]
          );

        const calulcatedAddressBaseContract1 =
          await context.universalFactory.computeERC1167Address(
            universalProfileBaseContract.address,
            salt,
            true,
            initializeCallData
          );

        const calulcatedAddressBaseContract2 =
          await context.universalFactory.computeERC1167Address(
            universalReceiverDelegate.address,
            salt,
            true,
            initializeCallData
          );

        let equalAddresses =
          calulcatedAddressBaseContract1 == calulcatedAddressBaseContract2;

        expect(equalAddresses).to.be.false;
      });

      it("should revert when deploying a proxy contract with the same `baseContract` and salt ", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        await context.universalFactory.deployERC1167ProxyAndInitialize(
          universalProfileBaseContract.address,
          salt,
          "0x"
        );

        await expect(
          context.universalFactory.deployERC1167ProxyAndInitialize(
            universalProfileBaseContract.address,
            salt,
            "0x"
          )
        ).to.be.revertedWith("ERC1167: create2 failed");
      });

      it("should pass and initialize local variable when sending value while deploying a CREATE2 proxy without `initializeCallData`", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        const contractCreated =
          await context.universalFactory.callStatic.deployERC1167ProxyAndInitialize(
            fallbackInitializer.address,
            salt,
            "0x",
            {
              value: ethers.utils.parseEther("1300"),
            }
          );

        await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployERC1167ProxyAndInitialize(
            fallbackInitializer.address,
            salt,
            "0x",
            {
              value: ethers.utils.parseEther("1300"),
            }
          );

        const fallbackInitializerCreated =
          fallbackInitializer.attach(contractCreated);

        const caller = await fallbackInitializerCreated.callStatic.caller();
        expect(caller).to.equal(context.universalFactory.address);
      });

      it("should revert when deploying a proxy and sending value to a non payable function in deployERC1167Proxy", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let PayableFalseCalldata =
          payableContract.interface.encodeFunctionData("payableFalse");

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer1)
            .deployERC1167ProxyAndInitialize(
              payableContract.address,
              salt,
              PayableFalseCalldata,
              {
                value: 100,
              }
            )
        ).to.be.revertedWithCustomError(
          context.universalFactory,
          "InitializingContractFailed"
        );
      });

      it("should pass when deploying a proxy and sending value to a payable function in deployERC1167Proxy", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let PayableTrueCalldata =
          payableContract.interface.encodeFunctionData("payableTrue");

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployERC1167ProxyAndInitialize(
            payableContract.address,
            salt,
            PayableTrueCalldata
          );

        let valueSent = 100;

        await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployERC1167ProxyAndInitialize(
            payableContract.address,
            salt,
            PayableTrueCalldata,
            {
              value: valueSent,
            }
          );

        let balance = (await provider.getBalance(contractCreated)).toNumber();
        expect(balance).to.equal(valueSent);
      });

      it("should revert when deploying a proxy and passing calldata for a non-existing function where fallback function doesn't exist", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let RandomCalldata = "0xcafecafe";

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer1)
            .deployERC1167ProxyAndInitialize(
              payableContract.address,
              salt,
              RandomCalldata
            )
        ).to.be.revertedWithCustomError(
          context.universalFactory,
          "InitializingContractFailed"
        );
      });

      it("should pass when deploying a proxy and passing calldata for a non-existing function where fallback function exist", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let RandomCalldata = "0xcafecafe";

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer1)
            .deployERC1167ProxyAndInitialize(
              fallbackContract.address,
              salt,
              RandomCalldata
            )
        ).to.not.be.reverted;
      });

      it("should deploy an initializable CREATE2 proxy contract and emit the event and get the owner successfully", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt#3"]);

        let initializeCallData =
          universalProfileBaseContract.interface.encodeFunctionData(
            "initialize",
            [context.accounts.deployer4.address]
          );

        const contractCreatedAddress =
          await context.universalFactory.callStatic.deployERC1167ProxyAndInitialize(
            universalProfileBaseContract.address,
            salt,
            initializeCallData
          );

        await expect(
          context.universalFactory.deployERC1167ProxyAndInitialize(
            universalProfileBaseContract.address,
            salt,
            initializeCallData
          )
        )
          .to.emit(context.universalFactory, "ContractCreated")
          .withArgs(contractCreatedAddress, salt, true, initializeCallData);

        const universalProfile = universalProfileBaseContract.attach(
          contractCreatedAddress
        );

        const owner = await universalProfile.callStatic.owner();
        expect(owner).to.equal(context.accounts.deployer4.address);
      });
    });

    describe("when testing edge cases", () => {
      describe("When deploying initializable minimal proxies via deployERC1167ProxyAndInitialize", () => {
        let salt;
        let initializeCallData;
        let contractCreatedWithdeployERC1167ProxyAndInitialize;
        before(async () => {
          salt = ethers.utils.solidityKeccak256(["string"], ["SaltEdge"]);

          initializeCallData =
            universalProfileBaseContract.interface.encodeFunctionData(
              "initialize",
              [context.accounts.deployer1.address]
            );

          contractCreatedWithdeployERC1167ProxyAndInitialize =
            await context.universalFactory.callStatic.deployERC1167ProxyAndInitialize(
              universalProfileBaseContract.address,
              salt,
              initializeCallData
            );
        });

        it("should result in a different address if deployed without initializing with deployERC1167Proxy function", async () => {
          const contractCreatedWithdeployERC1167Proxy =
            await context.universalFactory.callStatic.deployERC1167Proxy(
              universalProfileBaseContract.address,
              salt
            );

          let equalAddresses =
            contractCreatedWithdeployERC1167ProxyAndInitialize ==
            contractCreatedWithdeployERC1167Proxy;

          expect(equalAddresses).to.be.false;
        });

        it("should result in a diffferent address if deployed without initializing with deployCreate2 function", async () => {
          const eip1167RuntimeCodeTemplate =
            "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";

          // deploy proxy contract
          let proxyBytecode = eip1167RuntimeCodeTemplate.replace(
            "bebebebebebebebebebebebebebebebebebebebe",
            universalProfileBaseContract.address.substr(2)
          );

          const contractCreatedWithDeployCreate2 =
            await context.universalFactory.callStatic.deployCreate2(
              proxyBytecode,
              salt
            );

          let equalAddresses =
            contractCreatedWithdeployERC1167ProxyAndInitialize ==
            contractCreatedWithDeployCreate2;

          expect(equalAddresses).to.be.false;
        });
        it("should result in the same address if deployed with initializing with deployCreate2AndInitialize function", async () => {
          const eip1167RuntimeCodeTemplate =
            "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";

          // deploy proxy contract
          let proxyBytecode = eip1167RuntimeCodeTemplate.replace(
            "bebebebebebebebebebebebebebebebebebebebe",
            universalProfileBaseContract.address.substr(2)
          );

          const contractCreatedWithdeployCreate2AndInitialize =
            await context.universalFactory.callStatic.deployCreate2AndInitialize(
              proxyBytecode,
              salt,
              initializeCallData,
              0,
              0
            );

          let equalAddresses =
            contractCreatedWithdeployERC1167ProxyAndInitialize ==
            contractCreatedWithdeployCreate2AndInitialize;

          expect(equalAddresses).to.be.true;
        });
      });
    });

    describe("`generateSalt(...)`", () => {
      it("should generate the same salt as with `ethers.utils.keccak256`", async () => {
        const providedSalt =
          "0x7d1f4b76de4cdffc4ebac16883d3a7c9cbd95b6130494c4ad48e6a8e24083572";

        const initializeCallData =
          "0xc4d66de8000000000000000000000000d208a16f18a3bab276dff0b62ef591a846c86cba";

        const generatedSalt = ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ["bool", "bytes", "bytes32"],
            [true, initializeCallData, providedSalt]
          )
        );

        expect(
          await context.universalFactory.generateSalt(
            true,
            initializeCallData,
            providedSalt
          )
        ).to.equal(generatedSalt);
      });

      it("should generate the same salt as with `web3.utils.keccak256`", async () => {
        const providedSalt =
          "0x7d1f4b76de4cdffc4ebac16883d3a7c9cbd95b6130494c4ad48e6a8e24083572";

        const initializeCallData =
          "0xc4d66de8000000000000000000000000d208a16f18a3bab276dff0b62ef591a846c86cba";

        const generatedSalt = web3.utils.keccak256(
          ethers.utils.solidityPack(
            ["bool", "bytes", "bytes32"],
            [true, initializeCallData, providedSalt]
          )
        );

        expect(
          await context.universalFactory.generateSalt(
            true,
            initializeCallData,
            providedSalt
          )
        ).to.equal(generatedSalt);
      });
    });
  });
});
