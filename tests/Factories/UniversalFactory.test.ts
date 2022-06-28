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
  PayableContract,
  PayableContract__factory,
  FallbackContract,
  FallbackContract__factory,
  ImplementationTester,
  ImplementationTester__factory,
} from "../../types";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { provider, AddressOffset } from "../utils/helpers";

import { bytecode as UniversalProfileBytecode } from "../../artifacts/contracts/UniversalProfile.sol/UniversalProfile.json";
import { bytecode as UniversalProfileInitBytecode } from "../../artifacts/contracts/UniversalProfileInit.sol/UniversalProfileInit.json";
import { bytecode as PayableContractBytecode } from "../../artifacts/contracts/Helpers/PayableContract.sol/PayableContract.json";
import { bytecode as FallbackContractBytecode } from "../../artifacts/contracts/Helpers/FallbackContract.sol/FallbackContract.json";
import { bytecode as ImplementationTesterBytecode } from "../../artifacts/contracts/Helpers/ImplementationTester.sol/ImplementationTester.json";

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
    let payableContract: PayableContract;
    let fallbackContract: FallbackContract;
    let implementationTester: ImplementationTester;

    beforeAll(async () => {
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
    });

    describe("When Using Normal contracts", () => {
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

        const calulcatedAddress =
          await context.universalFactory.calculateAddress(
            bytecodeHash,
            salt,
            "0x"
          );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2(UPBytecode, salt, "0x");

        expect(calulcatedAddress).toEqual(contractCreated);
      });

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

        const calulcatedAddress =
          await context.universalFactory.calculateAddress(
            bytecodeHash,
            salt,
            initializeCallData
          );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2(
            ImplementationTesterBytecode,
            salt,
            initializeCallData
          );

        expect(calulcatedAddress).toEqual(contractCreated);
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
          await context.universalFactory.calculateAddress(
            bytecodeHash,
            salt1,
            "0x"
          );

        const calulcatedAddressSalt2 =
          await context.universalFactory.calculateAddress(
            bytecodeHash,
            salt2,
            "0x"
          );

        let equalAddresses = calulcatedAddressSalt1 == calulcatedAddressSalt2;

        expect(equalAddresses).toBeFalsy();
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
          await context.universalFactory.calculateAddress(
            bytecodeHash,
            salt,
            "0x"
          );

        const calculatedAddressInitializableTrue =
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
          await context.universalFactory.calculateAddress(
            bytecodeHash1,
            salt,
            "0x"
          );

        const calulcatedAddressBytecode2 =
          await context.universalFactory.calculateAddress(
            bytecodeHash2,
            salt,
            "0x"
          );

        let equalAddresses =
          calulcatedAddressBytecode1 == calulcatedAddressBytecode2;

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
          context.universalFactory.deployCreate2(proxyBytecode, salt, "0x")
        ).toBeRevertedWith("Minimal Proxies deployment not allowed");

        await expect(
          context.universalFactory.deployCreate2(proxyBytecode, salt, "0x")
        ).toBeRevertedWith("Minimal Proxies deployment not allowed");
      });

      it("should revert when deploying a CREATE2 contract with the same bytecode and salt ", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        await context.universalFactory.deployCreate2(UPBytecode, salt, "0x");

        await expect(
          context.universalFactory.deployCreate2(UPBytecode, salt, "0x")
        ).toBeRevertedWith("Create2: Failed on deploy");
      });

      it("should revert when sending value while deploying a non payable constructor contract", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["OtherSalt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          ethers.constants.AddressZero.substr(2);

        await expect(
          context.universalFactory.deployCreate2(UPBytecode, salt, "0x", {
            value: 100,
          })
        ).toBeRevertedWith("Create2: Failed on deploy");
      });

      it("should pass when sending value while deploying a payable constructor contract", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["OtherSalt"]);

        // imported
        PayableContractBytecode;

        const valueSent = 100;

        const contractCreated =
          await context.universalFactory.callStatic.deployCreate2(
            PayableContractBytecode,
            salt,
            "0x",
            {
              value: 100,
            }
          );

        await context.universalFactory.deployCreate2(
          PayableContractBytecode,
          salt,
          "0x",
          {
            value: valueSent,
          }
        );

        const balance = (await provider.getBalance(contractCreated)).toNumber();
        expect(balance).toEqual(valueSent);
      });

      it("should revert when deploying a CREATE2 contract and passing calldata for a non-existing function where fallback function doesn't exist", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt10"]);

        let RandomCalldata = "0xcafecafe";

        // imported
        PayableContractBytecode;

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer2)
            .deployCreate2(PayableContractBytecode, salt, RandomCalldata)
        ).toBeRevertedWith("Transaction reverted without a reason string");
      });

      it("should pass when deploying a CREATE2 contract and passing calldata for a non-existing function where fallback function exist", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt11"]);

        let RandomCalldata = "0xcafecafe";

        // imported
        FallbackContractBytecode;

        await context.universalFactory
          .connect(context.accounts.deployer2)
          .deployCreate2(FallbackContractBytecode, salt, RandomCalldata);
      });

      it("should deploy an un-initializable CREATE2 contract and get the owner successfully", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let UPBytecode =
          UniversalProfileBytecode +
          AddressOffset +
          context.accounts.deployer3.address.substr(2);

        const contractCreatedAddress =
          await context.universalFactory.callStatic.deployCreate2(
            UPBytecode,
            salt,
            "0x"
          );
        await context.universalFactory.deployCreate2(UPBytecode, salt, "0x");
        const universalProfile = universalProfileConstructor.attach(
          contractCreatedAddress
        );
        const owner = await universalProfile.callStatic.owner();
        expect(owner).toEqual(context.accounts.deployer3.address);
      });

      it("should deploy an initializable CREATE2 contract and get the owner successfully", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let initializeCallData =
          implementationTester.interface.encodeFunctionData("initialize", [
            context.accounts.deployer1.address,
          ]);

        const contractCreatedAddress =
          await context.universalFactory.callStatic.deployCreate2(
            ImplementationTesterBytecode,
            salt,
            initializeCallData
          );

        await context.universalFactory.deployCreate2(
          ImplementationTesterBytecode,
          salt,
          initializeCallData
        );

        const factoryTesterContract = implementationTester.attach(
          contractCreatedAddress
        );
        const owner = await factoryTesterContract.callStatic.owner();
        expect(owner).toEqual(context.accounts.deployer1.address);
      });
    });

    describe("When Using Proxy contracts", () => {
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

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2Proxy(
            universalProfileBaseContract.address,
            salt,
            initializeCallData
          );

        expect(calculatedAddress).toEqual(contractCreated);
      });

      it("should calculate the address of a proxy correctly if it's not initializable", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        const calculatedAddress =
          await context.universalFactory.calculateProxyAddress(
            universalReceiverDelegate.address,
            salt,
            "0x"
          );

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2Proxy(
            universalReceiverDelegate.address,
            salt,
            "0x"
          );

        expect(calculatedAddress).toEqual(contractCreated);
      });

      it("should calculate a different address of a proxy if the `salt` changed", async () => {
        let salt1 = ethers.utils.solidityKeccak256(["string"], ["Salt1"]);
        let salt2 = ethers.utils.solidityKeccak256(["string"], ["Salt2"]);

        const calculatedAddressSalt1 =
          await context.universalFactory.calculateProxyAddress(
            universalProfileBaseContract.address,
            salt1,
            "0x"
          );

        const calculatedAddressSalt2 =
          await context.universalFactory.calculateProxyAddress(
            universalProfileBaseContract.address,
            salt2,
            "0x"
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
            "0x"
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

      it("should revert when deploying a CREATE2 proxy contract with the same `baseContract` and salt ", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        await context.universalFactory.deployCreate2Proxy(
          universalProfileBaseContract.address,
          salt,
          "0x"
        );

        await expect(
          context.universalFactory.deployCreate2Proxy(
            universalProfileBaseContract.address,
            salt,
            "0x"
          )
        ).toBeRevertedWith("ERC1167: create2 failed");
      });

      it("should return the value back if sent to a proxy non-initializable", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2Proxy(
            universalReceiverDelegate.address,
            salt,
            "0x"
          );

        let oldBalance = await provider.getBalance(
          context.accounts.deployer1.address
        );

        const tx = await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployCreate2Proxy(universalReceiverDelegate.address, salt, "0x", {
            value: ethers.utils.parseEther("1300"),
          });

        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed.toNumber();
        const gasPrice = tx.gasPrice.toNumber();

        let newBalance = await provider.getBalance(
          context.accounts.deployer1.address
        );

        const oldBalanceMinusGas = oldBalance - gasUsed * gasPrice;

        expect(parseInt(newBalance)).toEqual(oldBalanceMinusGas);
      });

      it("should revert when deploying a proxy and sending value to a non payable function in deployCreate2Proxy", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let PayableFalseCalldata =
          payableContract.interface.encodeFunctionData("payableFalse");

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer1)
            .deployCreate2Proxy(
              payableContract.address,
              salt,
              PayableFalseCalldata,
              {
                value: 100,
              }
            )
        ).toBeRevertedWith("Transaction reverted without a reason string");
      });

      it("should pass when deploying a proxy and sending value to a payable function in deployCreate2Proxy", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let PayableTrueCalldata =
          payableContract.interface.encodeFunctionData("payableTrue");

        const contractCreated = await context.universalFactory
          .connect(context.accounts.deployer1)
          .callStatic.deployCreate2Proxy(
            payableContract.address,
            salt,
            PayableTrueCalldata
          );

        let valueSent = 100;

        await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployCreate2Proxy(
            payableContract.address,
            salt,
            PayableTrueCalldata,
            {
              value: valueSent,
            }
          );

        let balance = (await provider.getBalance(contractCreated)).toNumber();
        expect(balance).toEqual(valueSent);
      });

      it("should revert when deploying a proxy and passing calldata for a non-existing function where fallback function doesn't exist", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let RandomCalldata = "0xcafecafe";

        await expect(
          context.universalFactory
            .connect(context.accounts.deployer1)
            .deployCreate2Proxy(payableContract.address, salt, RandomCalldata)
        ).toBeRevertedWith("Transaction reverted without a reason string");
      });

      it("should pass when deploying a proxy and passing calldata for a non-existing function where fallback function exist", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt"]);

        let RandomCalldata = "0xcafecafe";

        await context.universalFactory
          .connect(context.accounts.deployer1)
          .deployCreate2Proxy(fallbackContract.address, salt, RandomCalldata);
      });

      it("should deploy an un-initializable CREATE2 proxy contract and get the default owner successfully", async () => {
        let salt = ethers.utils.solidityKeccak256(["string"], ["Salt#2"]);

        const contractCreatedAddress =
          await context.universalFactory.callStatic.deployCreate2Proxy(
            universalProfileBaseContract.address,
            salt,
            "0x"
          );

        await context.universalFactory.deployCreate2Proxy(
          universalProfileBaseContract.address,
          salt,
          "0x"
        );

        const universalProfile = universalProfileBaseContract.attach(
          contractCreatedAddress
        );

        const owner = await universalProfile.callStatic.owner();
        expect(owner).toEqual(ethers.constants.AddressZero);
      });

      it("should deploy an initializable CREATE2 proxy contract and get the owner successfully", async () => {
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
});
