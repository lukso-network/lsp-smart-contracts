import { ethers } from "hardhat";
import {
  LSP1UniversalReceiverDelegateUP__factory,
  UniversalFactory,
  UniversalFactory__factory,
  UniversalProfileInit,
  UniversalProfileInit__factory,
  LSP1UniversalReceiverDelegateUP,
  UniversalProfile,
  UniversalProfile__factory,
} from "../../types";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { provider } from "../utils/helpers";

import { bytecode as UniversalProfileBytecode } from "../../artifacts/contracts/UniversalProfile.sol/UniversalProfile.json";
import { bytecode as UniversalProfileInitBytecode } from "../../artifacts/contracts/UniversalProfileInit.sol/UniversalProfileInit.json";

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
  universalFactory: UniversalFactory;
};

describe("UniversalFactory contract", () => {
  const buildTestContext = async (): Promise<UniversalFactoryTestContext> => {
    const accounts = await getNamedAccounts();

    const universalFactory = await new UniversalFactory__factory(
      accounts.random
    ).deploy();

    return { accounts, universalFactory };
  };

  describe("When Using UniversalFactory", () => {
    let context: UniversalFactoryTestContext;
    let universalProfileConstructor: UniversalProfile;
    let universalProfileBaseContract: UniversalProfileInit;
    let universalReceiverDelegate: LSP1UniversalReceiverDelegateUP;
    let ZeroAddress: string;
    beforeAll(async () => {
      context = await buildTestContext();
      ZeroAddress = "0x0000000000000000000000000000000000000000";
      universalProfileConstructor = await new UniversalProfile__factory(
        context.accounts.random
      ).deploy(ZeroAddress);

      universalProfileBaseContract = await new UniversalProfileInit__factory(
        context.accounts.random
      ).deploy();

      await universalProfileBaseContract.initialize(ZeroAddress);

      universalReceiverDelegate =
        await new LSP1UniversalReceiverDelegateUP__factory(
          context.accounts.random
        ).deploy();
    });

    it("should calculate the address of a non-initializable contract that will deployed with CREATE2 correctly", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let UPBytecode =
        UniversalProfileBytecode +
        "000000000000000000000000" +
        ZeroAddress.substr(2);

      let bytecodeHash = ethers.utils.solidityKeccak256(
        ["bytes"],
        [UPBytecode]
      );

      const calulcatedAddress = await context.universalFactory.calculateAddress(
        bytecodeHash,
        salt,
        []
      );

      const addressCreated = await context.universalFactory
        .connect(context.accounts.deployer1)
        .callStatic.deployCreate2(UPBytecode, salt, []);

      expect(calulcatedAddress).toEqual(addressCreated);
    });

    it("should calculate the address of an initializable contract that will deployed with CREATE2 correctly", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let UPBytecode = UniversalProfileInitBytecode;

      let initializeCallData =
        universalProfileBaseContract.interface.encodeFunctionData(
          "initialize",
          [context.accounts.deployer1.address]
        );

      let bytecodeHash = ethers.utils.solidityKeccak256(
        ["bytes"],
        [UPBytecode]
      );

      const calulcatedAddress = await context.universalFactory.calculateAddress(
        bytecodeHash,
        salt,
        initializeCallData
      );

      const addressCreated = await context.universalFactory
        .connect(context.accounts.deployer1)
        .callStatic.deployCreate2(UPBytecode, salt, initializeCallData);

      expect(calulcatedAddress).toEqual(addressCreated);
    });

    it("should calculate a different address of a a contract that will deployed with CREATE2 if the salt changed", async () => {
      let salt1 = ethers.utils.solidityKeccak256(["string"], ["Salt1"]);
      let salt2 = ethers.utils.solidityKeccak256(["string"], ["Salt2"]);

      let UPBytecode =
        UniversalProfileBytecode +
        "000000000000000000000000" +
        ZeroAddress.substr(2);

      let bytecodeHash = ethers.utils.solidityKeccak256(
        ["bytes"],
        [UPBytecode]
      );

      const calulcatedAddressSalt1 =
        await context.universalFactory.calculateAddress(
          bytecodeHash,
          salt1,
          []
        );

      const calulcatedAddressSalt2 =
        await context.universalFactory.calculateAddress(
          bytecodeHash,
          salt2,
          []
        );

      let equalAddresses = calulcatedAddressSalt1 == calulcatedAddressSalt2;

      expect(equalAddresses).toBeFalsy();
    });

    it("should calculate a different address of a a contract that will deployed with CREATE2 if its initializable or not", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let UPBytecode =
        UniversalProfileBytecode +
        "000000000000000000000000" +
        ZeroAddress.substr(2);

      let bytecodeHash = ethers.utils.solidityKeccak256(
        ["bytes"],
        [UPBytecode]
      );

      let initializeCallData =
        universalProfileBaseContract.interface.encodeFunctionData(
          "initialize",
          [context.accounts.deployer1.address]
        );

      const calculatedAddressInitializableTrue =
        await context.universalFactory.calculateAddress(bytecodeHash, salt, []);

      const calculatedAddressInitializableFalse =
        await context.universalFactory.calculateAddress(
          bytecodeHash,
          salt,
          initializeCallData
        );

      let equalAddresses =
        calculatedAddressInitializableTrue ==
        calculatedAddressInitializableFalse;

      expect(equalAddresses).toBeFalsy();
    });

    it("should calculate a different address of a a contract that will deployed with CREATE2 if the bytecode changed", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let UPBytecode1 =
        UniversalProfileBytecode +
        "000000000000000000000000" +
        ZeroAddress.substr(2);

      let bytecodeHash1 = ethers.utils.solidityKeccak256(
        ["bytes"],
        [UPBytecode1]
      );

      let UPBytecode2 =
        UniversalProfileBytecode +
        "cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

      let bytecodeHash2 = ethers.utils.solidityKeccak256(
        ["bytes"],
        [UPBytecode2]
      );

      const calulcatedAddressBytecode1 =
        await context.universalFactory.calculateAddress(
          bytecodeHash1,
          salt,
          []
        );

      const calulcatedAddressBytecode2 =
        await context.universalFactory.calculateAddress(
          bytecodeHash2,
          salt,
          []
        );

      let equalAddresses =
        calulcatedAddressBytecode1 == calulcatedAddressBytecode2;

      expect(equalAddresses).toBeFalsy();
    });

    it("should calculate the address of a proxy correctly if it's initializable", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let initializeCallData =
        universalProfileBaseContract.interface.encodeFunctionData(
          "initialize",
          [context.accounts.deployer1.address]
        );

      const calculatedAddress =
        await context.universalFactory.calculateProxyAddress(
          universalProfileBaseContract.address,
          salt,
          initializeCallData
        );

      const addressCreated = await context.universalFactory
        .connect(context.accounts.deployer1)
        .callStatic.deployCreate2Proxy(
          universalProfileBaseContract.address,
          salt,
          initializeCallData
        );

      expect(calculatedAddress).toEqual(addressCreated);
    });

    it("should calculate the address of a proxy correctly if it's not initializable", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      const calculatedAddress =
        await context.universalFactory.calculateProxyAddress(
          universalReceiverDelegate.address,
          salt,
          []
        );

      const addressCreated = await context.universalFactory
        .connect(context.accounts.deployer1)
        .callStatic.deployCreate2Proxy(
          universalReceiverDelegate.address,
          salt,
          []
        );

      expect(calculatedAddress).toEqual(addressCreated);
    });

    it("should return the value back if sent to a proxy non-initializable", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      const addressCreated = await context.universalFactory
        .connect(context.accounts.deployer1)
        .callStatic.deployCreate2Proxy(
          universalReceiverDelegate.address,
          salt,
          []
        );

      let oldBalance = await provider.getBalance(
        context.accounts.deployer1.address
      );

      const tx = await context.universalFactory
        .connect(context.accounts.deployer1)
        .deployCreate2Proxy(universalReceiverDelegate.address, salt, [], {
          value: ethers.utils.parseEther("1300"),
        });

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.toNumber();
      const gasPrice = tx.gasPrice.toNumber();

      let newBalance = await provider.getBalance(
        context.accounts.deployer1.address
      );

      const oldBalanceAndGas = oldBalance - gasUsed * gasPrice;

      expect(parseInt(newBalance)).toEqual(oldBalanceAndGas);
    });

    it("should calculate a different address of a proxy if the `salt` changed", async () => {
      let salt1 = ethers.utils.solidityKeccak256(["string"], ["Salt1"]);
      let salt2 = ethers.utils.solidityKeccak256(["string"], ["Salt2"]);

      const calculatedAddressSalt1 =
        await context.universalFactory.calculateProxyAddress(
          universalProfileBaseContract.address,
          salt1,
          []
        );

      const calculatedAddressSalt2 =
        await context.universalFactory.calculateProxyAddress(
          universalProfileBaseContract.address,
          salt2,
          []
        );

      let equalAddresses = calculatedAddressSalt1 == calculatedAddressSalt2;

      expect(equalAddresses).toBeFalsy();
    });

    it("should calculate a different address of a proxy if its initializable or not ", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let initializeCallData =
        universalProfileBaseContract.interface.encodeFunctionData(
          "initialize",
          [context.accounts.deployer1.address]
        );

      const calculatedAddressInitializableTrue =
        await context.universalFactory.calculateProxyAddress(
          universalProfileBaseContract.address,
          salt,
          initializeCallData
        );

      const calculatedAddressInitializableFalse =
        await context.universalFactory.calculateProxyAddress(
          universalProfileBaseContract.address,
          salt,
          []
        );

      let equalAddresses =
        calculatedAddressInitializableTrue ==
        calculatedAddressInitializableFalse;

      expect(equalAddresses).toBeFalsy();
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
        await context.universalFactory.calculateProxyAddress(
          universalProfileBaseContract.address,
          salt,
          initializeCallData1
        );

      const calulcatedAddressinitializeCallData2 =
        await context.universalFactory.calculateProxyAddress(
          universalProfileBaseContract.address,
          salt,
          initializeCallData2
        );

      let equalAddresses =
        calulcatedAddressinitializeCallData1 ==
        calulcatedAddressinitializeCallData2;

      expect(equalAddresses).toBeFalsy();
    });

    it("should calculate a different address of a proxy if the `baseContract` changed", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let initializeCallData =
        universalProfileBaseContract.interface.encodeFunctionData(
          "initialize",
          [context.accounts.deployer1.address]
        );

      const calulcatedAddressBaseContract1 =
        await context.universalFactory.calculateProxyAddress(
          universalProfileBaseContract.address,
          salt,
          initializeCallData
        );

      const calulcatedAddressBaseContract2 =
        await context.universalFactory.calculateProxyAddress(
          universalReceiverDelegate.address,
          salt,
          initializeCallData
        );

      let equalAddresses =
        calulcatedAddressBaseContract1 == calulcatedAddressBaseContract2;

      expect(equalAddresses).toBeFalsy();
    });

    it("should revert when deploying a minimal proxy from `deployCreate2` function ", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      const eip1167RuntimeCodeTemplate =
        "0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3";

      // deploy proxy contract
      let proxyBytecode = eip1167RuntimeCodeTemplate.replace(
        "bebebebebebebebebebebebebebebebebebebebe",
        universalProfileBaseContract.address.substr(2)
      );

      await expect(
        context.universalFactory.deployCreate2(proxyBytecode, salt, [])
      ).toBeRevertedWith("Minimal Proxies deployment not allowed");

      await expect(
        context.universalFactory.deployCreate2(proxyBytecode, salt, [])
      ).toBeRevertedWith("Minimal Proxies deployment not allowed");
    });

    it("should revert when deploying a create2 contract with the same `initCode` and salt ", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let UPBytecode =
        UniversalProfileBytecode +
        "000000000000000000000000" +
        ZeroAddress.substr(2);

      await context.universalFactory.deployCreate2(UPBytecode, salt, []);

      await expect(
        context.universalFactory.deployCreate2(UPBytecode, salt, [])
      ).toBeRevertedWith("Create2: Failed on deploy");
    });

    it("should revert when deploying a create2 proxy contract with the same `baseContract` and salt ", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      await context.universalFactory.deployCreate2Proxy(
        universalProfileBaseContract.address,
        salt,
        []
      );

      await expect(
        context.universalFactory.deployCreate2Proxy(
          universalProfileBaseContract.address,
          salt,
          []
        )
      ).toBeRevertedWith("ERC1167: create2 failed");
    });

    it("should deploy an un-initializable create2 contract successfully", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

      let UPBytecode =
        UniversalProfileBytecode +
        "000000000000000000000000" +
        context.accounts.deployer3.address.substr(2);

      const contractCreatedAddress =
        await context.universalFactory.callStatic.deployCreate2(
          UPBytecode,
          salt,
          []
        );
      await context.universalFactory.deployCreate2(UPBytecode, salt, []);
      const universalProfile = universalProfileConstructor.attach(
        contractCreatedAddress
      );
      const owner = await universalProfile.callStatic.owner();
      expect(owner).toEqual(context.accounts.deployer3.address);
    });

    it("should deploy an initializable create2 contract successfully", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);
      const UPInitBytecode = UniversalProfileInitBytecode;

      let initializeCallData =
        universalProfileBaseContract.interface.encodeFunctionData(
          "initialize",
          [context.accounts.deployer1.address]
        );

      const contractCreatedAddress =
        await context.universalFactory.callStatic.deployCreate2(
          UPInitBytecode,
          salt,
          initializeCallData
        );

      await context.universalFactory.deployCreate2(
        UPInitBytecode,
        salt,
        initializeCallData
      );

      const universalProfile = universalProfileBaseContract.attach(
        contractCreatedAddress
      );
      const owner = await universalProfile.callStatic.owner();
      expect(owner).toEqual(context.accounts.deployer1.address);
    });

    it("should deploy an un-initializable create2 proxy contract successfully", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt#2"]);

      const contractCreatedAddress =
        await context.universalFactory.callStatic.deployCreate2Proxy(
          universalProfileBaseContract.address,
          salt,
          []
        );

      await context.universalFactory.deployCreate2Proxy(
        universalProfileBaseContract.address,
        salt,
        []
      );

      const universalProfile = universalProfileBaseContract.attach(
        contractCreatedAddress
      );

      const owner = await universalProfile.callStatic.owner();
      expect(owner).toEqual(ZeroAddress);
    });

    it("should deploy an initializable create2 proxy contract successfully", async () => {
      let salt = ethers.utils.solidityKeccak256(["string"], ["Salt#3"]);

      let initializeCallData =
        universalProfileBaseContract.interface.encodeFunctionData(
          "initialize",
          [context.accounts.deployer4.address]
        );

      const contractCreatedAddress =
        await context.universalFactory.callStatic.deployCreate2Proxy(
          universalProfileBaseContract.address,
          salt,
          initializeCallData
        );

      await context.universalFactory.deployCreate2Proxy(
        universalProfileBaseContract.address,
        salt,
        initializeCallData
      );

      const universalProfile = universalProfileBaseContract.attach(
        contractCreatedAddress
      );

      const owner = await universalProfile.callStatic.owner();
      expect(owner).toEqual(context.accounts.deployer4.address);
    });
  });
});
