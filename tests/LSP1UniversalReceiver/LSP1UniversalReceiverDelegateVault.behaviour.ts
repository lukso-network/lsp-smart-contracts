import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// types
import {
  UniversalProfile,
  LSP7Tester,
  LSP7Tester__factory,
  LSP8Tester,
  LSP8Tester__factory,
  LSP9Vault,
  LSP1UniversalReceiverDelegateVault,
} from "../../types";

import { ARRAY_LENGTH, TOKEN_ID } from "../utils/helpers";

// constants
import { ERC725YKeys, INTERFACE_IDS, OPERATION_TYPES } from "../../constants";
import { callPayload, getLSP5MapAndArrayKeysValue } from "../utils/fixtures";

export type LSP1TestAccounts = {
  owner1: SignerWithAddress;
  random: SignerWithAddress;
  any: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP1TestAccounts> => {
  const [owner1, random, any] = await ethers.getSigners();
  return {
    owner1,
    random,
    any,
  };
};

export type LSP1TestContext = {
  accounts: LSP1TestAccounts;
  universalProfile: UniversalProfile;
  lsp9Vault1: LSP9Vault;
  lsp9Vault2: LSP9Vault;
  lsp1universalReceiverDelegateVault: LSP1UniversalReceiverDelegateVault;
};

export const shouldBehaveLikeLSP1Delegate = (
  buildContext: () => Promise<LSP1TestContext>
) => {
  let context: LSP1TestContext;

  beforeAll(async () => {
    context = await buildContext();
  });

  describe("when testing ERC165 standard", () => {
    it("should support ERC165 interface", async () => {
      const result =
        await context.lsp1universalReceiverDelegateVault.supportsInterface(
          INTERFACE_IDS.ERC165
        );
      expect(result).toBeTruthy();
    });

    it("should support LSP1Delegate interface", async () => {
      const result =
        await context.lsp1universalReceiverDelegateVault.supportsInterface(
          INTERFACE_IDS.LSP1UniversalReceiverDelegate
        );
      expect(result).toBeTruthy();
    });
  });

  describe("when testing LSP7-DigitalAsset", () => {
    let lsp7TokenA: LSP7Tester, lsp7TokenB: LSP7Tester, lsp7TokenC: LSP7Tester;
    beforeAll(async () => {
      lsp7TokenA = await new LSP7Tester__factory(
        context.accounts.random
      ).deploy("TokenAlpha", "TA", context.accounts.random.address);

      lsp7TokenB = await new LSP7Tester__factory(
        context.accounts.random
      ).deploy("TokenBeta", "TB", context.accounts.random.address);

      lsp7TokenC = await new LSP7Tester__factory(
        context.accounts.random
      ).deploy("TokenGamma", "TA", context.accounts.random.address);
    });

    describe("when minting tokens", () => {
      describe("when minting 10 tokenA to lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData("mint", [
            context.lsp9Vault1.address,
            "10",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenA.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenA);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenA.address);
        });
      });

      describe("when minting 10 tokenB to lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("mint", [
            context.lsp9Vault1.address,
            "10",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("when minting 10 of the same tokenB to lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("mint", [
            context.lsp9Vault1.address,
            "10",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("when minting 10 tokenC to lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("mint", [
            context.lsp9Vault1.address,
            "10",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenC.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 3, index 2, tokenC address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenC);
          expect(indexInMap).toEqual(2);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(elementAddress).toEqual(lsp7TokenC.address);
        });
      });
    });

    describe("when burning tokens", () => {
      describe("when burning 10 tokenC (last token) from lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("burn", [
            context.lsp9Vault1.address,
            "10",
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenC.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 2, no map, no tokenC address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenC.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000002",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual("0x");
        });
      });

      describe("when burning 10 tokenA (first token) from lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData("burn", [
            context.lsp9Vault1.address,
            "10",
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });

        it("should update lsp5keys: arrayLength 1, no map, no tokenA address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenA.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual("0x");
        });
      });

      describe("when burning 10 (half of the amount) tokenB from lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("burn", [
            context.lsp9Vault1.address,
            "10",
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("when burning 10 (remaining) tokenB from lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("burn", [
            context.lsp9Vault1.address,
            "10",
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 0, no map, no tokenB address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenB.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000000",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
          expect(elementAddress).toEqual("0x");
        });
      });
    });

    describe("when transferring tokens", () => {
      it("should fund the universalProfle with 10 tokens (each) to test token transfers (TokenA, TokenB, TokenC)", async () => {
        await lsp7TokenA
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, "10", false, "0x");

        await lsp7TokenB
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, "10", false, "0x");

        await lsp7TokenC
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, "10", false, "0x");
      });

      it("should register lsp5keys: arrayLength 3, index [1,2,3], [tokenA, tokenB, tokenC] addresses in Vault1 ", async () => {
        const [
          indexInMapTokenA,
          interfaceIdTokenA,
          arrayLength,
          elementAddressTokenA,
        ] = await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenA);

        const [indexInMapTokenB, interfaceIdTokenB, , elementAddressTokenB] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);

        const [indexInMapTokenC, interfaceIdTokenC, , elementAddressTokenC] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenC);

        expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
        expect(indexInMapTokenA).toEqual(0);
        expect(indexInMapTokenB).toEqual(1);
        expect(indexInMapTokenC).toEqual(2);
        expect(interfaceIdTokenA).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
        expect(interfaceIdTokenB).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
        expect(interfaceIdTokenC).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
        expect(elementAddressTokenA).toEqual(lsp7TokenA.address);
        expect(elementAddressTokenB).toEqual(lsp7TokenB.address);
        expect(elementAddressTokenC).toEqual(lsp7TokenC.address);
      });

      describe("When transferring 10 (all) token A from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            "10",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenC);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenC.address);
        });

        it("should update lsp5keys: arrayLength 2, no map, no tokenA address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenA.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000002",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual("0x");
        });

        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenA);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenA.address);
        });
      });

      describe("When transferring 5 (half of amount) token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            "5",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("When transferring 4 (few) token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            "4",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("When transferring 1 (remaining) token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            "1",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenB.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual("0x");
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("When transferring 10 (all) token C from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            "10",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenC.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenB.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
          expect(elementAddress).toEqual("0x");
        });

        it("should register lsp5keys : arrayLength 3, index = 2, tokenC address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenC);
          expect(indexInMap).toEqual(2);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(elementAddress).toEqual(lsp7TokenC.address);
        });
      });

      describe("When transferring 1 (few) token B from UP2 to UP1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.lsp9Vault2.address,
            context.lsp9Vault1.address,
            "1",
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault2.address,
              0,
              callPayload(context.lsp9Vault2, lsp7TokenB.address, abi)
            );
        });

        it("should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });
    });

    describe("when removing all keys", () => {
      beforeAll(async () => {
        const abi1 = lsp7TokenB.interface.encodeFunctionData("burn", [
          context.lsp9Vault1.address,
          "1",
          "0x",
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(
            OPERATION_TYPES.CALL,
            context.lsp9Vault1.address,
            0,
            callPayload(context.lsp9Vault1, lsp7TokenB.address, abi1)
          );

        const abi2 = lsp7TokenB.interface.encodeFunctionData("burn", [
          context.lsp9Vault2.address,
          "9",
          "0x",
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(
            OPERATION_TYPES.CALL,
            context.lsp9Vault2.address,
            0,
            callPayload(context.lsp9Vault2, lsp7TokenB.address, abi2)
          );

        const abi3 = lsp7TokenA.interface.encodeFunctionData("burn", [
          context.lsp9Vault2.address,
          "10",
          "0x",
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(
            OPERATION_TYPES.CALL,
            context.lsp9Vault2.address,
            0,
            callPayload(context.lsp9Vault2, lsp7TokenA.address, abi3)
          );

        const abi4 = lsp7TokenC.interface.encodeFunctionData("burn", [
          context.lsp9Vault2.address,
          "10",
          "0x",
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(
            OPERATION_TYPES.CALL,
            context.lsp9Vault2.address,
            0,
            callPayload(context.lsp9Vault2, lsp7TokenC.address, abi4)
          );
      });
      it("should remove all lsp5 keys on both UP", async () => {
        const arrayLengthUP1 = await context.lsp9Vault1["getData(bytes32)"](
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length
        );

        const arrayLengthUP2 = await context.lsp9Vault2["getData(bytes32)"](
          ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length
        );

        expect(arrayLengthUP1).toEqual(ARRAY_LENGTH.ZERO);
        expect(arrayLengthUP2).toEqual(ARRAY_LENGTH.ZERO);
      });
    });
  });

  describe("when testing LSP8-IdentifiableDigitalAsset", () => {
    let lsp8TokenA: LSP8Tester, lsp8TokenB: LSP8Tester, lsp8TokenC: LSP8Tester;
    beforeAll(async () => {
      lsp8TokenA = await new LSP8Tester__factory(
        context.accounts.random
      ).deploy("TokenAlpha", "TA", context.accounts.random.address);

      lsp8TokenB = await new LSP8Tester__factory(
        context.accounts.random
      ).deploy("TokenBeta", "TB", context.accounts.random.address);

      lsp8TokenC = await new LSP8Tester__factory(
        context.accounts.random
      ).deploy("TokenGamma", "TA", context.accounts.random.address);
    });

    describe("when minting tokens", () => {
      describe("when minting tokenId 1 of tokenA to lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData("mint", [
            context.lsp9Vault1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenA.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenA);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp8TokenA.address);
        });
      });

      describe("when minting tokenId 1 of tokenB to lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("mint", [
            context.lsp9Vault1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("when minting tokenId 2 of tokenB (another) to lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("mint", [
            context.lsp9Vault1.address,
            TOKEN_ID.TWO,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("when minting tokenId 1 of tokenC to lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData("mint", [
            context.lsp9Vault1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenC.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 3, index 2, tokenC address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenC);
          expect(indexInMap).toEqual(2);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(elementAddress).toEqual(lsp8TokenC.address);
        });
      });
    });

    describe("when burning tokens", () => {
      describe("when burning tokenId 1 (all balance) of tokenC (last token) from lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenC.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 2, no map, no tokenC address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenC.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000002",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual("0x");
        });
      });

      describe("when burning tokenId 1 (all balance) of tokenA (first token) from lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });

        it("should update lsp5keys: arrayLength 1, no map, no tokenA address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenA.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual("0x");
        });
      });

      describe("when burning 1 tokenId (not all balance) of tokenB from lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("when burning all tokenB from lsp9Vault1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("burn", [
            TOKEN_ID.TWO,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 0, no map, no tokenB address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenB.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000000",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
          expect(elementAddress).toEqual("0x");
        });
      });
    });

    describe("when transferring tokens", () => {
      it("should fund the universalProfle with tokens to test token transfers (TokenA, TokenB, TokenC)", async () => {
        // 1 tokenId of TokenA
        await lsp8TokenA
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.ONE, false, "0x");

        // 3 tokenIds of TokenB
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.ONE, false, "0x");
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.TWO, false, "0x");
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.THREE, false, "0x");

        // 1 tokenId of TokenC
        await lsp8TokenC
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.ONE, false, "0x");
      });

      it("should register lsp5keys: arrayLength 3, index [1,2,3], [tokenA, tokenB, tokenC] addresses in Vault1 ", async () => {
        const [
          indexInMapTokenA,
          interfaceIdTokenA,
          arrayLength,
          elementAddressTokenA,
        ] = await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenA);

        const [indexInMapTokenB, interfaceIdTokenB, , elementAddressTokenB] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);

        const [indexInMapTokenC, interfaceIdTokenC, , elementAddressTokenC] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenC);

        expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
        expect(indexInMapTokenA).toEqual(0);
        expect(indexInMapTokenB).toEqual(1);
        expect(indexInMapTokenC).toEqual(2);
        expect(interfaceIdTokenA).toEqual(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset
        );
        expect(interfaceIdTokenB).toEqual(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset
        );
        expect(interfaceIdTokenC).toEqual(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset
        );
        expect(elementAddressTokenA).toEqual(lsp8TokenA.address);
        expect(elementAddressTokenB).toEqual(lsp8TokenB.address);
        expect(elementAddressTokenC).toEqual(lsp8TokenC.address);
      });

      describe("When transferring tokenId 1 (all) of token A from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenC);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenC.address);
        });

        it("should update lsp5keys: arrayLength 2, no map, no tokenA address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenA.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000002",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual("0x");
        });

        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenA);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp8TokenA.address);
        });
      });

      describe("When transferring tokenId 1 (not all balance) of token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("When transferring tokenId 2 (not all balance) of token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.TWO,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("When transferring tokenId 3 (remaining balance) of token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.THREE,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenB.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual("0x");
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("When transferring tokenId 1 (all balance) of token C from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData("transfer", [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenC.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in Vault1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.lsp9Vault1["getData(bytes32[])"]([
              ERC725YKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenB.address.substr(2),
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
          expect(elementAddress).toEqual("0x");
        });

        it("should register lsp5keys : arrayLength 3, index = 2, tokenC address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenC);
          expect(indexInMap).toEqual(2);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(elementAddress).toEqual(lsp8TokenC.address);
        });
      });

      describe("When transferring 1 tokenId (not all balance) of token B from UP2 to UP1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("transfer", [
            context.lsp9Vault2.address,
            context.lsp9Vault1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault2.address,
              0,
              callPayload(context.lsp9Vault2, lsp8TokenB.address, abi)
            );
        });

        it("should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in Vault1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });
    });
  });
};
