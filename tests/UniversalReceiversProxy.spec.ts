import { Signer } from "@ethersproject/abstract-signer";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  LSP3AccountInit,
  LSP3AccountInit__factory,
  UniversalReceiverAddressStoreInit,
  UniversalReceiverAddressStoreInit__factory,
} from "../build/types";

const { deployProxy, runtimeCodeTemplate } = require("./utils/proxy");

// const UniReceiver = artifacts.require("BasicUniversalReceiver");
// const UniversalReceiverTester = artifacts.require("UniversalReceiverTester");
// const UniversalReceiverAddressStore = artifacts.require("UniversalReceiverAddressStore");
// const UniversalReceiverAddressStoreInit = artifacts.require("UniversalReceiverAddressStoreInit");
// const Account = artifacts.require("LSP3Account");

// keccak256("ERC777TokensRecipient")
const TOKENS_RECIPIENT_INTERFACE_HASH =
  "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
// keccak256("LSP1UniversalReceiverDelegate")
const UNIVERSALRECEIVER_KEY = "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47";

describe.skip("Receivers as Proxies", () => {
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress, signer: SignerWithAddress;

  let lsp3AccountMaster: LSP3AccountInit,
    uniAddressStoreMaster: UniversalReceiverAddressStoreInit,
    proxyLsp3Account: LSP3AccountInit,
    proxyUniAddressStore: UniversalReceiverAddressStoreInit;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];
    signer = accounts[1];
  });

  it("test", async () => {});
});
