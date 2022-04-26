import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  LSP2UtilsLibraryTester,
  LSP2UtilsLibraryTester__factory,
} from "../../types";

describe("LSP2Utils", () => {
  let accounts: SignerWithAddress[];
  let lsp2Utils: LSP2UtilsLibraryTester;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    lsp2Utils = await new LSP2UtilsLibraryTester__factory(accounts[0]).deploy();
  });

  describe("isABIEncodedArray(...)", () => {
    describe("testing different zero bytes 00 of various length", () => {
      it("should return false for 1 x empty zero bytes", async () => {
        const data = "0x00";
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return false for 10 x empty zero bytes", async () => {
        const data = "0x00000000000000000000";
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return false for 20 x empty zero bytes", async () => {
        const data = "0x0000000000000000000000000000000000000000";
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return false for 30 x empty zero bytes", async () => {
        const data =
          "0x000000000000000000000000000000000000000000000000000000000000";
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return false for 30 x empty zero bytes", async () => {
        const data =
          "0x000000000000000000000000000000000000000000000000000000000000";
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return true for 32 x empty zero bytes", async () => {
        const data =
          "0x0000000000000000000000000000000000000000000000000000000000000000";
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeTruthy();
      });

      it("should return true for 40 x empty zero bytes", async () => {
        const data =
          "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeTruthy();
      });

      it("should return true for 64 x empty zero bytes", async () => {
        const data = "0x" + "00".repeat(64);
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeTruthy();
      });

      it("should return true for 100 x empty zero bytes", async () => {
        const data = "0x" + "00".repeat(100);
        const result = await lsp2Utils.isABIEncodedArray(data);
        expect(result).toBeTruthy();
      });
    });

    describe("testing various non-zero bytes input", () => {
      // @todo
    });
  });
});
