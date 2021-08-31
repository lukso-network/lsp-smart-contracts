const UniReceiver = artifacts.require("BasicUniversalReceiver");
const UniversalReceiverTester = artifacts.require("UniversalReceiverTester");
const UniversalReceiverAddressStore = artifacts.require(
  "UniversalReceiverAddressStore"
);
const Account = artifacts.require("LSP3Account");
// const ExternalReceiver = artifacts.require("ExternalReceiver");
// const DelegateReceiver = artifacts.require("DelegateReceiver");
// const BasicBareReceiver = artifacts.require("BasicBareReceiver");

// keccak256("ERC777TokensRecipient")
const TOKENS_RECIPIENT_INTERFACE_HASH =
  "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";

// keccak256("LSP1UniversalReceiverDelegate")
const UNIVERSALRECEIVER_KEY =
  "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47";

const {
  BN,
  ether,
  expectRevert,
  expectEvent,
} = require("openzeppelin-test-helpers");

contract("Receivers", (accounts) => {
  let uni = {};

  beforeEach(async () => {
    uni = await UniReceiver.new();
  });

  it("Can check for implementing interface", async () => {
    let tx = await uni.universalReceiver(TOKENS_RECIPIENT_INTERFACE_HASH, "0x");
    console.log(
      "Directly checking for implementing interface costs: ",
      tx.receipt.gasUsed
    );
    let res = await uni.universalReceiver.call(
      TOKENS_RECIPIENT_INTERFACE_HASH,
      "0x"
    );
    assert.equal(res, TOKENS_RECIPIENT_INTERFACE_HASH);
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
    let checker = await UniversalReceiverTester.new();
    let tx = await checker.checkImplementation(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    console.log(
      "Contract checking for implementing interface using bytes32 costs: ",
      tx.receipt.gasUsed
    );
    let res = await checker.checkImplementation.call(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    assert.isTrue(res);
  });

  it("Contract can check for implementing interface with Low Level call", async () => {
    let checker = await UniversalReceiverTester.new();
    let tx = await checker.lowLevelCheckImplementation(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    console.log(
      "Contract checking for implementing interface using low level and bytes32 costs: ",
      tx.receipt.gasUsed
    );
    let res = await checker.lowLevelCheckImplementation.call(
      uni.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    assert.isTrue(res);
  });

  it("Use delegate and test if it can store addresses", async () => {
    let account = await Account.new(accounts[1]);
    let checker = await UniversalReceiverTester.new();
    let checker2 = await UniversalReceiverTester.new();
    let checker3 = await UniversalReceiverTester.new();
    let delegate = await UniversalReceiverAddressStore.new(account.address);

    // set uni receiver delegate
    account.setData(UNIVERSALRECEIVER_KEY, delegate.address, {
      from: accounts[1],
    });

    await checker.lowLevelCheckImplementation(
      account.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );

    await checker.checkImplementation(
      account.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    await checker2.checkImplementation(
      account.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );
    await checker3.checkImplementation(
      account.address,
      TOKENS_RECIPIENT_INTERFACE_HASH
    );

    assert.isTrue(await delegate.containsAddress(checker.address));
    assert.isTrue(await delegate.containsAddress(checker2.address));
    assert.isTrue(await delegate.containsAddress(checker3.address));
    assert.equal(await delegate.getIndex(checker2.address), "1");
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
