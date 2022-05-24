import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  ERC165CheckerCustomTest,
  ERC165CheckerCustomTest__factory,
  TargetContract,
  TargetContract__factory,
  ERC725,
  ERC725__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
} from "../../types";

// utils
import { INTERFACE_IDS } from "../../constants";

describe("Test Custom implementation of ERC165Checker", () => {
  let accounts: SignerWithAddress[];
  let contract: ERC165CheckerCustomTest;
  let targetContract: TargetContract;
  let erc725: ERC725;
  let contractWithFallback: TokenReceiverWithoutLSP1;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    contract = await new ERC165CheckerCustomTest__factory(accounts[0]).deploy();
    targetContract = await new TargetContract__factory(accounts[0]).deploy();
    contractWithFallback = await new TokenReceiverWithoutLSP1__factory(
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
    expect(result1).toBeFalsy();
    expect(result2).toBeFalsy();
  });

  it("Calling a contract without a fallback function that doesn't support ERC165", async () => {
    const result = await contract.supportsERC165Interface(
      targetContract.address,
      INTERFACE_IDS.ERC165
    );
    expect(result).toBeFalsy();
  });

  it("Calling a contract with a fallback function that doesn't support ERC165", async () => {
    const result = await contract.supportsERC165Interface(
      contractWithFallback.address,
      INTERFACE_IDS.ERC165
    );
    expect(result).toBeFalsy();
  });

  it("Calling a contract that support ERC165 and ERC725X but doesn't support LSP1", async () => {
    const ERC165result = await contract.supportsERC165Interface(
      erc725.address,
      INTERFACE_IDS.ERC165
    );
    expect(ERC165result).toBeTruthy();

    const ERC725Xresult = await contract.supportsERC165Interface(
      erc725.address,
      INTERFACE_IDS.ERC725X
    );
    expect(ERC725Xresult).toBeTruthy();

    const LSP1result = await contract.supportsERC165Interface(
      erc725.address,
      INTERFACE_IDS.LSP1UniversalReceiver
    );
    expect(LSP1result).toBeFalsy();
  });
});
