import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  BasicUniversalReceiver,
  BasicUniversalReceiver__factory,
  UniversalProfile__factory,
  UniversalReceiverAddressStore,
  UniversalReceiverAddressStore__factory,
  UniversalReceiverTester,
  UniversalReceiverTester__factory,
} from "../../types";

import { ERC725YKeys } from "../utils/constants";
import { ERC777TokensRecipient as TOKENS_RECIPIENT_INTERFACE_HASH } from "../utils/helpers";

describe("Receivers", () => {
  let uni: BasicUniversalReceiver;
  let accounts: SignerWithAddress[] = [];
  let signer: SignerWithAddress;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    signer = accounts[1];
  });

  beforeEach(async () => {
    uni = await new BasicUniversalReceiver__factory(signer).deploy();
  });

  it("Can check for implementing interface", async () => {
    let tx = await uni.universalReceiver(TOKENS_RECIPIENT_INTERFACE_HASH, "0x");
    let txReceipt = await tx.wait();

    let result = await uni.callStatic.universalReceiver(TOKENS_RECIPIENT_INTERFACE_HASH, "0x");

    expect(result).toEqual(TOKENS_RECIPIENT_INTERFACE_HASH);
  });

  it("Contract can check for implementing interface with Bytes32", async () => {
    let checker: UniversalReceiverTester = await new UniversalReceiverTester__factory(
      signer
    ).deploy();
    let tx = await checker.functions.checkImplementation(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    let txReceipt = await tx.wait();

    let res = await checker.callStatic.checkImplementation(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    expect(res).toBeTruthy();
  });

  it("Contract can check for implementing interface with Low Level call", async () => {
    let checker = await new UniversalReceiverTester__factory(signer).deploy();
    let tx = await checker.lowLevelCheckImplementation(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    let txReceipt = await tx.wait();

    let res = await checker.callStatic.lowLevelCheckImplementation(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    expect(res).toBeTruthy();
  });

  it("Use delegate and test if it can store addresses", async () => {
    const signerAddress = accounts[1];
    let account = await new UniversalProfile__factory(signer).deploy(signer.address);
    let checker = await new UniversalReceiverTester__factory(signer).deploy();
    let checker2 = await new UniversalReceiverTester__factory(signer).deploy();
    let checker3 = await new UniversalReceiverTester__factory(signer).deploy();
    let delegate: UniversalReceiverAddressStore = await new UniversalReceiverAddressStore__factory(
      signer
    ).deploy(account.address);

    // set uni receiver delegate
    await account
      .connect(signerAddress)
      .setData([ERC725YKeys.LSP0["LSP1UniversalReceiverDelegate"]], [delegate.address]);

    await checker.lowLevelCheckImplementation(account.address, TOKENS_RECIPIENT_INTERFACE_HASH);
    await checker.checkImplementation(account.address, TOKENS_RECIPIENT_INTERFACE_HASH);
    await checker2.checkImplementation(account.address, TOKENS_RECIPIENT_INTERFACE_HASH);
    await checker3.checkImplementation(account.address, TOKENS_RECIPIENT_INTERFACE_HASH);

    expect(await delegate.callStatic.containsAddress(checker.address)).toBeTruthy();
    expect(await delegate.callStatic.containsAddress(checker2.address)).toBeTruthy();
    expect(await delegate.callStatic.containsAddress(checker3.address)).toBeTruthy();
    expect(await (await delegate.callStatic.getIndex(checker2.address)).toNumber()).toEqual(1);
  });
});
