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

  describe("isEncodedArray(...)", () => {
    describe("testing different zero bytes 00 of various length", () => {
      it("should return false for 1 x empty zero bytes", async () => {
        const data = "0x00";
        const result = await lsp2Utils.isEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return false for 10 x empty zero bytes", async () => {
        const data = "0x00000000000000000000";
        const result = await lsp2Utils.isEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return false for 20 x empty zero bytes", async () => {
        const data = "0x0000000000000000000000000000000000000000";
        const result = await lsp2Utils.isEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return false for 30 x empty zero bytes", async () => {
        const data =
          "0x000000000000000000000000000000000000000000000000000000000000";
        const result = await lsp2Utils.isEncodedArray(data);
        expect(result).toBeFalsy();
      });

      it("should return true for 32 x empty zero bytes", async () => {
        const data =
          "0x0000000000000000000000000000000000000000000000000000000000000000";
        const result = await lsp2Utils.isEncodedArray(data);
        expect(result).toBeTruthy();
      });

      it("should return true for 40 x empty zero bytes", async () => {
        const data =
          "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        const result = await lsp2Utils.isEncodedArray(data);
        expect(result).toBeTruthy();
      });

      it("should return true for 64 x empty zero bytes", async () => {
        const data = "0x" + "00".repeat(64);
        const result = await lsp2Utils.isEncodedArray(data);
        expect(result).toBeTruthy();
      });

      it("should return true for 100 x empty zero bytes", async () => {
        const data = "0x" + "00".repeat(100);
        const result = await lsp2Utils.isEncodedArray(data);
        expect(result).toBeTruthy();
      });
    });

    describe("testing various non-zero bytes input", () => {
      describe("when less than 32 bytes", () => {
        it("should return false with 4x random bytes", async () => {
          const data = "0xaabbccdd";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeFalsy();
        });

        it("should return false with 16x random bytes", async () => {
          const data = "0x1234567890abcdef1234567890abcdef";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeFalsy();
        });
      });

      describe("when abi-encoded array, with length = 0", () => {
        it("should return true with 64 bytes -> offset = 0x20, length = 0 (null)", async () => {
          const data =
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeTruthy();
        });

        it("should return true with 64 bytes -> offset = 0x20, length = 0 (null) + 10x extra zero bytes", async () => {
          const data =
            "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeTruthy();
        });

        it("should return true with 64 bytes -> offset = 0x20, length = 0 (null) + 10x extra random bytes", async () => {
          const data =
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000aaaabbbbccccddddeeee";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeTruthy();
        });
      });

      describe("when abi-encoded array, with length = 1", () => {
        it("should return true with 1x array element - offset = 0x20, length = 1", async () => {
          const data =
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0Ee7A142d267C1f36714E4a8F75612F20a79720";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeTruthy();
        });

        it("should return true with 1x array element - offset = 0x20, length = 1, +5 custom bytes in the end", async () => {
          const data =
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0Ee7A142d267C1f36714E4a8F75612F20a79720ffffffffff";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeTruthy();
        });

        it("should return true with 1x array element - offset = 0x25 (+ 5 custom bytes in between), length = 1", async () => {
          const data =
            "0x0000000000000000000000000000000000000000000000000000000000000025ffffffffff0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0Ee7A142d267C1f36714E4a8F75612F20a79720";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeTruthy();
        });
      });

      describe("when not correctly abi-encoded array, with length = 1", () => {
        it("should return false with 1x array element - offset = 0x20, length = 1, but 31 bytes only", async () => {
          const data =
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0Ee7A142d267C1f36714E4a8F75612F20a797";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeFalsy();
        });

        it("should return false with 1x array element - offset = 0x20, length = 1, but 30 bytes only", async () => {
          const data =
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0Ee7A142d267C1f36714E4a8F75612F20a7";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeFalsy();
        });
      });

      describe("when correctly abi-encoded array, but the length does not match the number of elements", () => {
        it("should return false when 1x array element, but length = 2", async () => {
          const data =
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000cafecafecafecafecafecafecafecafecafecafe";
          const result = await lsp2Utils.isEncodedArray(data);
          expect(result).toBeFalsy();
        });
      });
    });
  });
});
