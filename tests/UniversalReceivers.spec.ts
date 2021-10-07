import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  ERC725Utils,
  BasicUniversalReceiver,
  BasicUniversalReceiver__factory,
  UniversalReceiverAddressStore,
  UniversalReceiverAddressStore__factory,
  UniversalReceiverTester,
  UniversalReceiverTester__factory,
} from "../build/types";

// helpers
import { deployERC725Utils, deployUniversalProfile } from "./utils/deploy";

// constants
import { LSP2Keys } from "./utils/lsp2schema";

// keccak256("ERC777TokensRecipient")
const TOKENS_RECIPIENT_INTERFACE_HASH = LSP2Keys.ERC777TokensRecipient;

describe("Receivers", () => {
  let uni: BasicUniversalReceiver;
  let accounts: SignerWithAddress[] = [];
  let signer: SignerWithAddress;
  let erc725Utils: ERC725Utils;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    signer = accounts[1];
    erc725Utils = await deployERC725Utils();
  });

  beforeEach(async () => {
    uni = await new BasicUniversalReceiver__factory(signer).deploy();
  });

  it("Can check for implementing interface", async () => {
    let tx = await uni.universalReceiver(TOKENS_RECIPIENT_INTERFACE_HASH, "0x");
    let txReceipt = await tx.wait();

    console.log(
      "Directly checking for implementing interface costs: ",
      txReceipt.gasUsed.toNumber()
    );

    let result = await uni.callStatic.universalReceiver(TOKENS_RECIPIENT_INTERFACE_HASH, "0x");

    expect(result).toEqual(TOKENS_RECIPIENT_INTERFACE_HASH);
  });

  // it("Can check for implementing interface with Bytes", async () => {
  //     let tx = await uni.universalReceiver(TOKENS_RECIPIENT_INTERFACE_HASH, "0x");
  //     console.log(
  //         "Directly checking for implementing interface using bytes costs: ",
  //         tx.receipt.gasUsed
  //     );
  //     let res = await uni.universalReceiverBytes.call(TOKENS_RECIPIENT_INTERFACE_HASH, "0x");
  //     assert.equal(res, TOKENS_RECIPIENT_INTERFACE_HASH);
  // });

  it("Contract can check for implementing interface with Bytes32", async () => {
    let checker: UniversalReceiverTester = await new UniversalReceiverTester__factory(
      signer
    ).deploy();
    let tx = await checker.functions.checkImplementation(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    let txReceipt = await tx.wait();

    console.log(
      "Contract checking for implementing interface using bytes32 costs: ",
      txReceipt.gasUsed
    );

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

    console.log(
      "Contract checking for implementing interface using low level and bytes32 costs: ",
      txReceipt.gasUsed
    );

    let res = await checker.callStatic.lowLevelCheckImplementation(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    expect(res).toBeTruthy();
  });

  it("Use delegate and test if it can store addresses", async () => {
    const signerAddress = accounts[1];
    let account = await deployUniversalProfile(erc725Utils.address, signer);
    let checker = await new UniversalReceiverTester__factory(signer).deploy();
    let checker2 = await new UniversalReceiverTester__factory(signer).deploy();
    let checker3 = await new UniversalReceiverTester__factory(signer).deploy();
    let delegate: UniversalReceiverAddressStore = await new UniversalReceiverAddressStore__factory(
      signer
    ).deploy(account.address);

    // set uni receiver delegate
    await account
      .connect(signerAddress)
      .setData([LSP2Keys.UniversalReceiverDelegate], [delegate.address]);

    await checker.lowLevelCheckImplementation(account.address, TOKENS_RECIPIENT_INTERFACE_HASH);
    await checker.checkImplementation(account.address, TOKENS_RECIPIENT_INTERFACE_HASH);
    await checker2.checkImplementation(account.address, TOKENS_RECIPIENT_INTERFACE_HASH);
    await checker3.checkImplementation(account.address, TOKENS_RECIPIENT_INTERFACE_HASH);

    expect(await delegate.callStatic.containsAddress(checker.address)).toBeTruthy();
    expect(await delegate.callStatic.containsAddress(checker2.address)).toBeTruthy();
    expect(await delegate.callStatic.containsAddress(checker3.address)).toBeTruthy();
    expect(await (await delegate.callStatic.getIndex(checker2.address)).toNumber()).toEqual(1);
  });

  // it("Contract can check for implementing interface with Bytes", async () => {
  //     let checker = await UniversalReceiverTester.new();
  //     let tx = await checker.checkImplementationBytes(
  //         uni.address,
  //         TOKENS_RECIPIENT_INTERFACE_HASH
  //     );
  //     console.log(
  //         "Contract checking for implementing interface using bytes return costs: ",
  //         tx.receipt.gasUsed
  //     );
  //     let res = await checker.checkImplementation.call(
  //         uni.address,
  //         TOKENS_RECIPIENT_INTERFACE_HASH
  //     );
  //     assert.isTrue(res);
  // });

  // it("Contract can check for implementing interface with Low Level cal + Bytes", async () => {
  //     let checker = await UniversalReceiverTester.new();
  //     let tx = await checker.lowLevelCheckImplementationBytes(
  //         uni.address,
  //         TOKENS_RECIPIENT_INTERFACE_HASH
  //     );
  //     console.log(
  //         "Contract checking for implementing interface using low level and bytes return costs: ",
  //         tx.receipt.gasUsed
  //     );
  //     let res = await checker.checkImplementation.call(
  //         uni.address,
  //         TOKENS_RECIPIENT_INTERFACE_HASH
  //     );
  //     assert.isTrue(res);
  // });
});
