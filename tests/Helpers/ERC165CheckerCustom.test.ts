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

  it("should return false when calling supportsInterface on an EOA", async () => {
    expect(
      await contract.supportsERC165Interface(
        accounts[1].address,
        INTERFACE_IDS.ERC165
      )
    ).to.be.false;

    expect(
      await contract.supportsERC165Interface(
        accounts[1].address,
        INTERFACE_IDS.LSP8IdentifiableDigitalAsset
      )
    ).to.be.false;
  });

  it("should return false when calling supportsInterface on a contract without a fallback function that doesn't include `supportsInterface(..)` function", async () => {
    expect(
      await contract.supportsERC165Interface(
        noSupportsInterfaceWithoutFallback.address,
        INTERFACE_IDS.ERC165
      )
    ).to.be.false;

    expect(
      await contract.supportsERC165Interface(
        noSupportsInterfaceWithoutFallback.address,
        INTERFACE_IDS.LSP1UniversalReceiver
      )
    ).to.be.false;
  });

  it("should return false when calling supportsInterface on a contract with a fallback function that doesn't include `supportsInterface(..)` function", async () => {
    expect(
      await contract.supportsERC165Interface(
        noSupportsInterfaceWithFallback.address,
        INTERFACE_IDS.ERC165
      )
    ).to.be.false;

    expect(
      await contract.supportsERC165Interface(
        noSupportsInterfaceWithFallback.address,
        INTERFACE_IDS.LSP1UniversalReceiver
      )
    ).to.be.false;
  });

  it("should return false when calling supportsInterface on a contract that include `supportsInterface(..)` function and reverts", async () => {
    expect(
      await contract.supportsERC165Interface(
        supportsInterfaceRevert.address,
        INTERFACE_IDS.ERC165
      )
    ).to.be.false;

    expect(
      await contract.supportsERC165Interface(
        supportsInterfaceRevert.address,
        INTERFACE_IDS.LSP1UniversalReceiver
      )
    ).to.be.false;
  });

  it("should return true for ERC165InterfaceId and false for LSP1InterfaceId when calling supportsInterface on a contract that include `supportsInterface(..)` function and only supports ERC165", async () => {
    expect(
      await contract.supportsERC165Interface(
        supportsInterfaceOnlyERC165.address,
        INTERFACE_IDS.ERC165
      )
    ).to.be.true;

    expect(
      await contract.supportsERC165Interface(
        supportsInterfaceOnlyERC165.address,
        INTERFACE_IDS.LSP1UniversalReceiver
      )
    ).to.be.false;
  });

  it("should return false for ERC165InterfaceId and true for LSP0InterfaceId when calling supportsInterface on a contract that include `supportsInterface(..)` function and only supports LSP0", async () => {
    expect(
      await contract.supportsERC165Interface(
        supportsInterfaceOnlyLSP0.address,
        INTERFACE_IDS.ERC165
      )
    ).to.be.false;

    expect(
      await contract.supportsERC165Interface(
        supportsInterfaceOnlyLSP0.address,
        INTERFACE_IDS.LSP0ERC725Account
      )
    ).to.be.true;
  });

  it("should return true for when calling supportsInterface on a contract that include `supportsInterface(..)` function and supports ERC725 and ERC165", async () => {
    expect(
      await contract.supportsERC165Interface(
        erc725.address,
        INTERFACE_IDS.ERC165
      )
    ).to.be.true;

    expect(
      await contract.supportsERC165Interface(
        erc725.address,
        INTERFACE_IDS.ERC725X
      )
    ).to.be.true;

    expect(
      await contract.supportsERC165Interface(
        erc725.address,
        INTERFACE_IDS.ERC725Y
      )
    ).to.be.true;
  });

  it("should return false on pre-compiled contract addresses 0x0...01, and 0x0...05 till 0x0...09 with ANY bytes4 interface ID", async () => {
    const precompiledAddress = [
      "0x0000000000000000000000000000000000000001",
      "0x0000000000000000000000000000000000000005",
      "0x0000000000000000000000000000000000000006",
      "0x0000000000000000000000000000000000000007",
      "0x0000000000000000000000000000000000000008",
      "0x0000000000000000000000000000000000000009",
    ];

    for (let i = 0; i < precompiledAddress.length; i++) {
      for (let ii = 0; ii < 100; ii++) {
        const result = await contract.supportsERC165Interface(
          precompiledAddress[i],
          ethers.utils.hexlify(ethers.utils.randomBytes(4))
        );
        expect(result).to.be.false;
      }
    }
  });

  it("should always return true on pre-compiled contract addresses 0x0...02, 0x0...03 and 0x0...04 with ANY bytes4 interface ID", async () => {
    const precompiledAddress = [
      "0x0000000000000000000000000000000000000002",
      "0x0000000000000000000000000000000000000003",
      "0x0000000000000000000000000000000000000004",
    ];

    for (let i = 0; i < precompiledAddress.length; i++) {
      for (let ii = 0; ii < 100; ii++) {
        const result = await contract.supportsERC165Interface(
          precompiledAddress[i],
          ethers.utils.hexlify(ethers.utils.randomBytes(4))
        );
        expect(result).to.be.true;
      }
    }
  });
});
