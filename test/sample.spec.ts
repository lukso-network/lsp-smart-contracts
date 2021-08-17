import { Signer } from "ethers";
import { ethers } from "hardhat";
import { Greeter__factory } from "../types/ethers-contracts";

describe("Greeter", function () {
  let accounts: Signer[];
  beforeEach(async () => {
    accounts = await ethers.getSigners();
  });

  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await new Greeter__factory(accounts[0]);
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).toEqual("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).toEqual("Hola, mundo!");
  });
});
