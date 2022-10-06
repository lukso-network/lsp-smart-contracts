import { ethers } from "hardhat";
import { LSP6Signer } from "@lukso/lsp6-signer.js";

import {
  LSP6KeyManager,
  LSP6KeyManager__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from "../types";
import { expect } from "chai";
import { ALL_PERMISSIONS, ERC725YKeys, OPERATION_TYPES } from "../constants";
import { setupKeyManager } from "./utils/fixtures";
import { LSP6TestContext } from "./utils/context";

describe("LSP6Signer", () => {
  it("should return same signed message hash than LSP6Utils library", async () => {
    const accounts = await ethers.getSigners();

    const keyManager = await new LSP6KeyManager__factory(accounts[0]).deploy(
      accounts[0].address
    );
    const lsp6Signer = new LSP6Signer();
    const libraryResult = lsp6Signer.hashMessage("example");

    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("example"));

    const solidityResult = await keyManager["toLSP6SignedMessageHash(bytes)"](
      ethers.utils.toUtf8Bytes("example")
    );

    expect(solidityResult).to.equal(libraryResult);
  });
});
