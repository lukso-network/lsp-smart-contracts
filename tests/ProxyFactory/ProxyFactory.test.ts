import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  ProxyFactory,
  ProxyFactory__factory,
  UniversalProfileInit,
  UniversalProfileInit__factory,
} from "../../types";

describe("Testing ProxyFactory", () => {
  let accounts: SignerWithAddress[];
  let factory: ProxyFactory;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    factory = await new ProxyFactory__factory(accounts[0]).deploy();
  });

  describe("Deploying a UP", () => {
    let universalProfileBase: UniversalProfileInit;

    beforeAll(async () => {
      // Deploy the base contract
      universalProfileBase = await new UniversalProfileInit__factory(
        accounts[0]
      ).deploy();
      // Initialize the base contract
      await universalProfileBase
        .connect(accounts[0])
        .initialize("0x0000000000000000000000000000000000000000");
    });

    it("Deploy a proxy UniversalProfile", async () => {
      const ownerOfProxy = accounts[1].address;
      let InitializeAbi = universalProfileBase.interface.encodeFunctionData(
        "initialize",
        [ownerOfProxy]
      );
      const UniversalProfileAddress = await factory
        .connect(accounts[1])
        .callStatic.createProxyWithInitialize(
          universalProfileBase.address,
          InitializeAbi
        );
      await factory
        .connect(accounts[1])
        .createProxyWithInitialize(universalProfileBase.address, InitializeAbi);

      const universalProfile = universalProfileBase.attach(
        UniversalProfileAddress
      );

      const owner = await universalProfile.callStatic.owner();
      expect(owner).toEqual(ownerOfProxy);
    });
  });
});
