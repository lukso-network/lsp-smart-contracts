import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import {
  ERC165CheckerCustomTest,
  ERC165CheckerCustomTest__factory,
  ERC725,
  ERC725__factory,
  NoSupportsInterfaceWithoutFallback,
  NoSupportsInterfaceWithoutFallback__factory,
  NoSupportsInterfaceWithFallback,
  NoSupportsInterfaceWithFallback__factory,
  SupportsInterfaceOnlyERC165,
  SupportsInterfaceOnlyERC165__factory,
  SupportsInterfaceRevert,
  SupportsInterfaceRevert__factory,
  SupportsInterfaceOnlyLSP0,
  SupportsInterfaceOnlyLSP0__factory,
} from "../../types";

// utils
import { INTERFACE_IDS } from "../../constants";

describe("Test Custom implementation of ERC165Checker", () => {
  let accounts: SignerWithAddress[];
  let contract: ERC165CheckerCustomTest;
  let erc725: ERC725;
  let noSupportsInterfaceWithFallback: NoSupportsInterfaceWithFallback;
  let noSupportsInterfaceWithoutFallback: NoSupportsInterfaceWithoutFallback;
  let supportsInterfaceOnlyERC165: SupportsInterfaceOnlyERC165;
  let supportsInterfaceOnlyLSP0: SupportsInterfaceOnlyLSP0;
  let supportsInterfaceRevert: SupportsInterfaceRevert;

  before(async () => {
    accounts = await ethers.getSigners();
    contract = await new ERC165CheckerCustomTest__factory(accounts[0]).deploy();

    noSupportsInterfaceWithFallback =
      await new NoSupportsInterfaceWithFallback__factory(accounts[0]).deploy();

    noSupportsInterfaceWithoutFallback =
      await new NoSupportsInterfaceWithoutFallback__factory(
        accounts[0]
      ).deploy();

    supportsInterfaceOnlyERC165 =
      await new SupportsInterfaceOnlyERC165__factory(accounts[0]).deploy();

    supportsInterfaceOnlyLSP0 = await new SupportsInterfaceOnlyLSP0__factory(
      accounts[0]
    ).deploy();

    supportsInterfaceRevert = await new SupportsInterfaceRevert__factory(
      accounts[0]
    ).deploy();

    erc725 = await new ERC725__factory(accounts[0]).deploy(accounts[0].address);
  });

  it("Calling an EOA", async () => {
    const result1 = await contract.supportsERC165Interface(
      accounts[1].address,
      INTERFACE_IDS.ERC165
    );
    const result2 = await contract.supportsERC165Interface(
      accounts[1].address,
      INTERFACE_IDS.LSP8IdentifiableDigitalAsset
    );
    expect(result1).to.be.false;
    expect(result2).to.be.false;
  });

  it("Calling a contract without a fallback function that doesn't include `supportsInterface(..)` function", async () => {
    const result1 = await contract.supportsERC165Interface(
      noSupportsInterfaceWithoutFallback.address,
      INTERFACE_IDS.ERC165
    );
    expect(result1).to.be.false;

    const result2 = await contract.supportsERC165Interface(
      noSupportsInterfaceWithoutFallback.address,
      INTERFACE_IDS.LSP1UniversalReceiver
    );
    expect(result2).to.be.false;
  });

  it("Calling a contract with a fallback function that doesn't include `supportsInterface(..)` function", async () => {
    const result1 = await contract.supportsERC165Interface(
      noSupportsInterfaceWithFallback.address,
      INTERFACE_IDS.ERC165
    );

    expect(result1).to.be.false;

    const result2 = await contract.supportsERC165Interface(
      noSupportsInterfaceWithFallback.address,
      INTERFACE_IDS.LSP1UniversalReceiver
    );

    expect(result2).to.be.false;
  });

  it("Calling a contract that include `supportsInterface(..)` function that reverts", async () => {
    const result1 = await contract.supportsERC165Interface(
      supportsInterfaceRevert.address,
      INTERFACE_IDS.ERC165
    );

    expect(result1).to.be.false;

    const result2 = await contract.supportsERC165Interface(
      supportsInterfaceRevert.address,
      INTERFACE_IDS.LSP1UniversalReceiver
    );

    expect(result2).to.be.false;
  });

  it("Calling a contract that include `supportsInterface(..)` function that only supports ERC165", async () => {
    const result1 = await contract.supportsERC165Interface(
      supportsInterfaceOnlyERC165.address,
      INTERFACE_IDS.ERC165
    );

    expect(result1).to.be.true;

    const result2 = await contract.supportsERC165Interface(
      supportsInterfaceOnlyERC165.address,
      INTERFACE_IDS.LSP1UniversalReceiver
    );

    expect(result2).to.be.false;
  });

  it("Calling a contract that include `supportsInterface(..)` function that only supports LSP0", async () => {
    const result1 = await contract.supportsERC165Interface(
      supportsInterfaceOnlyLSP0.address,
      INTERFACE_IDS.ERC165
    );

    expect(result1).to.be.false;

    const result2 = await contract.supportsERC165Interface(
      supportsInterfaceOnlyLSP0.address,
      INTERFACE_IDS.LSP0ERC725Account
    );

    expect(result2).to.be.true;
  });

  it("Calling a contract that include `supportsInterface(..)` function that supports ERC725 and ERC165", async () => {
    const result1 = await contract.supportsERC165Interface(
      erc725.address,
      INTERFACE_IDS.ERC165
    );

    expect(result1).to.be.true;

    const result2 = await contract.supportsERC165Interface(
      erc725.address,
      INTERFACE_IDS.ERC725X
    );

    expect(result2).to.be.true;

    const result3 = await contract.supportsERC165Interface(
      erc725.address,
      INTERFACE_IDS.ERC725Y
    );

    expect(result3).to.be.true;
  });

  it("Calling a random/pre-compiled contract addresses", async () => {
    const precompiledAddress = [
      "0x0000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000003",
      "0x0000000000000000000000000000000000000004",
      "0x0000000000000000000000000000000000000005",
      "0x0000000000000000000000000000000000000006",
      "0x0000000000000000000000000000000000000007",
      "0x0000000000000000000000000000000000000008",
      "0x0000000000000000000000000000000000000009",
      "0x0000000000000000000000000000000000000010",
      "0x0000000000000000000000000000000000000011",
      "0x0000000000000000000000000000000000000012",
      "0x0000000000000000000000000000000000000013",
      "0x0000000000000000000000000000000000000014",
      "0x0000000000000000000000000000000000000015",
      "0x0000000000000000000000000000000000000016",
      "0x0000000000000000000000000000000000000017",
      "0x0000000000000000000000000000000000000018",
      "0x0000000000000000000000000000000000000019",
      "0x0000000000000000000000000000000000000020",
    ];

    for (let i = 0; i < precompiledAddress.length; i++) {
      const result1 = await contract.supportsERC165Interface(
        precompiledAddress[i],
        INTERFACE_IDS.ERC165
      );

      // The call on precomiled contracts: 0x0..02, 0x0..03, 0x0..04 will always return true
      if (i > 1 && i < 5) {
        expect(result1).to.be.true;
      } else {
        expect(result1).to.be.false;
      }

      const result2 = await contract.supportsERC165Interface(
        precompiledAddress[i],
        INTERFACE_IDS.LSP0ERC725Account
      );

      // The call on precomiled contracts: 0x0..02, 0x0..03, 0x0..04 will always return true
      if (i > 1 && i < 5) {
        expect(result2).to.be.true;
      } else {
        expect(result2).to.be.false;
      }
    }
  });

  it.skip("Calling a pre-compiled contract addresses 0x0.02, 0x0.04 and 0x0.04", async () => {
    const precompiledAddress = [
      "0x0000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000003",
      "0x0000000000000000000000000000000000000004",
    ];

    for (let i = 0; i < precompiledAddress.length; i++) {
      for (let ii = 0; ii < 1000; ii++) {
        const result = await contract.supportsERC165Interface(
          precompiledAddress[i],
          ethers.utils.hexlify(ethers.utils.randomBytes(4))
        );
        expect(result).to.be.true;
      }
    }
  });
});
