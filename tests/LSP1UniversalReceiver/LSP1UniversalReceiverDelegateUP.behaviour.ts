import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// types
import {
  LSP1UniversalReceiverDelegateUP,
  UniversalProfile,
  LSP6KeyManager,
  LSP7Tester,
  LSP7Tester__factory,
  LSP8Tester,
  LSP8Tester__factory,
  LSP9Vault,
  LSP9Vault__factory,
} from "../../types";

// helpers
import { ARRAY_LENGTH, TOKEN_ID } from "../utils/helpers";

// constants
import { ERC725YKeys, INTERFACE_IDS, OPERATION_TYPES } from "../../constants";

// fixtures
import {
  callPayload,
  getLSP10MapAndArrayKeysValue,
  getLSP5MapAndArrayKeysValue,
} from "../utils/fixtures";

export type LSP1TestAccounts = {
  owner1: SignerWithAddress;
  owner2: SignerWithAddress;
  random: SignerWithAddress;
  any: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP1TestAccounts> => {
  const [owner1, owner2, random, any] = await ethers.getSigners();
  return {
    owner1,
    owner2,
    random,
    any,
  };
};

export type LSP1DelegateTestContext = {
  accounts: LSP1TestAccounts;
  universalProfile1: UniversalProfile;
  lsp6KeyManager1: LSP6KeyManager;
  universalProfile2: UniversalProfile;
  lsp6KeyManager2: LSP6KeyManager;
  lsp1universalReceiverDelegateUP: LSP1UniversalReceiverDelegateUP;
};

export const shouldBehaveLikeLSP1Delegate = (
  buildContext: () => Promise<LSP1DelegateTestContext>
) => {
  let context: LSP1DelegateTestContext;

  beforeAll(async () => {
    context = await buildContext();
  });

  describe("when testing ERC165 standard", () => {
    it("should support ERC165 interface", async () => {
      const result =
        await context.lsp1universalReceiverDelegateUP.supportsInterface(
          INTERFACE_IDS.ERC165
        );
      expect(result).toBeTruthy();
    });

    it("should support LSP1Delegate interface", async () => {
      const result =
        await context.lsp1universalReceiverDelegateUP.supportsInterface(
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
      describe("when minting 10 tokenA to universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenA.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenA
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenA.address);
        });
      });

      describe("when minting 10 tokenB to universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("when minting 10 of the same tokenB to universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("when minting 10 tokenC to universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenC.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 3, index 2, tokenC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenC
            );
          expect(indexInMap).toEqual(2);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(elementAddress).toEqual(lsp7TokenC.address);
        });
      });
    });

    describe("when burning tokens", () => {
      describe("when burning 10 tokenC (last token) from universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "10",
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenC.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 2, no map, no tokenC address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

      describe("when burning 10 tokenA (first token) from universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "10",
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });

        it("should update lsp5keys: arrayLength 1, no map, no tokenA address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

      describe("when burning 10 (half of the amount) tokenB from universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "10",
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("when burning 10 (remaining) tokenB from universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "10",
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 0, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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
          .mint(context.universalProfile1.address, "10", false, "0x");

        await lsp7TokenB
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, "10", false, "0x");

        await lsp7TokenC
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, "10", false, "0x");
      });

      it("should register lsp5keys: arrayLength 3, index [1,2,3], [tokenA, tokenB, tokenC] addresses in UP1 ", async () => {
        const [
          indexInMapTokenA,
          interfaceIdTokenA,
          arrayLength,
          elementAddressTokenA,
        ] = await getLSP5MapAndArrayKeysValue(
          context.universalProfile1,
          lsp7TokenA
        );

        const [indexInMapTokenB, interfaceIdTokenB, , elementAddressTokenB] =
          await getLSP5MapAndArrayKeysValue(
            context.universalProfile1,
            lsp7TokenB
          );

        const [indexInMapTokenC, interfaceIdTokenC, , elementAddressTokenC] =
          await getLSP5MapAndArrayKeysValue(
            context.universalProfile1,
            lsp7TokenC
          );

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
            context.universalProfile1.address,
            context.universalProfile2.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenC
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenC.address);
        });

        it("should update lsp5keys: arrayLength 2, no map, no tokenA address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenA
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp7TokenA.address);
        });
      });

      describe("When transferring 5 (half of amount) token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.universalProfile1.address,
            context.universalProfile2.address,
            "5",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("When transferring 4 (few) token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.universalProfile1.address,
            context.universalProfile2.address,
            "4",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("When transferring 1 (remaining) token B from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.universalProfile1.address,
            context.universalProfile2.address,
            "1",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp7TokenB.address);
        });
      });

      describe("When transferring 10 (all) token C from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("transfer", [
            context.universalProfile1.address,
            context.universalProfile2.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp7TokenC.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

        it("should register lsp5keys : arrayLength 3, index = 2, tokenC address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenC
            );
          expect(indexInMap).toEqual(2);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(elementAddress).toEqual(lsp7TokenC.address);
        });
      });

      describe("When transferring 1 (few) token B from UP2 to UP1", () => {
        beforeAll(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.universalProfile2.address,
            context.universalProfile1.address,
            "1",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(
              callPayload(context.universalProfile2, lsp7TokenB.address, abi)
            );
        });

        it("should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
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
          context.universalProfile1.address,
          "1",
          "0x",
        ]);

        await context.lsp6KeyManager1
          .connect(context.accounts.owner1)
          .execute(
            callPayload(context.universalProfile1, lsp7TokenB.address, abi1)
          );

        const abi2 = lsp7TokenB.interface.encodeFunctionData("burn", [
          context.universalProfile2.address,
          "9",
          "0x",
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          .execute(
            callPayload(context.universalProfile2, lsp7TokenB.address, abi2)
          );

        const abi3 = lsp7TokenA.interface.encodeFunctionData("burn", [
          context.universalProfile2.address,
          "10",
          "0x",
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          .execute(
            callPayload(context.universalProfile2, lsp7TokenA.address, abi3)
          );

        const abi4 = lsp7TokenC.interface.encodeFunctionData("burn", [
          context.universalProfile2.address,
          "10",
          "0x",
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          .execute(
            callPayload(context.universalProfile2, lsp7TokenC.address, abi4)
          );
      });
      it("should remove all lsp5 keys on both UP", async () => {
        const arrayLengthUP1 = await context.universalProfile1[
          "getData(bytes32)"
        ](ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length);

        const arrayLengthUP2 = await context.universalProfile2[
          "getData(bytes32)"
        ](ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length);

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
      describe("when minting tokenId 1 of tokenA to universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenA.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenA
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp8TokenA.address);
        });
      });

      describe("when minting tokenId 1 of tokenB to universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("when minting tokenId 2 of tokenB (another) to universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            TOKEN_ID.TWO,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("when minting tokenId 1 of tokenC to universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenC.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 3, index 2, tokenC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenC
            );
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
      describe("when burning tokenId 1 (all balance) of tokenC (last token) from universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenC.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 2, no map, no tokenC address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

      describe("when burning tokenId 1 (all balance) of tokenA (first token) from universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });

        it("should update lsp5keys: arrayLength 1, no map, no tokenA address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

      describe("when burning 1 tokenId (not all balance) of tokenB from universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });
      });

      describe("when burning all tokenB from universalProfile1", () => {
        beforeAll(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("burn", [
            TOKEN_ID.TWO,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 0, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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
          .mint(context.universalProfile1.address, TOKEN_ID.ONE, false, "0x");

        // 3 tokenIds of TokenB
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, TOKEN_ID.ONE, false, "0x");
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, TOKEN_ID.TWO, false, "0x");
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, TOKEN_ID.THREE, false, "0x");

        // 1 tokenId of TokenC
        await lsp8TokenC
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, TOKEN_ID.ONE, false, "0x");
      });

      it("should register lsp5keys: arrayLength 3, index [1,2,3], [tokenA, tokenB, tokenC] addresses in UP1 ", async () => {
        const [
          indexInMapTokenA,
          interfaceIdTokenA,
          arrayLength,
          elementAddressTokenA,
        ] = await getLSP5MapAndArrayKeysValue(
          context.universalProfile1,
          lsp8TokenA
        );

        const [indexInMapTokenB, interfaceIdTokenB, , elementAddressTokenB] =
          await getLSP5MapAndArrayKeysValue(
            context.universalProfile1,
            lsp8TokenB
          );

        const [indexInMapTokenC, interfaceIdTokenC, , elementAddressTokenC] =
          await getLSP5MapAndArrayKeysValue(
            context.universalProfile1,
            lsp8TokenC
          );

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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenC
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenC.address);
        });

        it("should update lsp5keys: arrayLength 2, no map, no tokenA address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenA
            );
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenB
            );
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.TWO,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp8TokenB.address);
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenB
            );
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.THREE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenB
            );
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp8TokenC.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
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

        it("should register lsp5keys : arrayLength 3, index = 2, tokenC address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenC
            );
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
            context.universalProfile2.address,
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(
              callPayload(context.universalProfile2, lsp8TokenB.address, abi)
            );
        });

        it("should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
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

  describe("when testing LSP9-Vault", () => {
    let lsp9VaultA: LSP9Vault, lsp9VaultB: LSP9Vault, lsp9VaultC: LSP9Vault;

    beforeAll(async () => {
      lsp9VaultA = await new LSP9Vault__factory(context.accounts.random).deploy(
        context.accounts.random.address
      );

      lsp9VaultB = await new LSP9Vault__factory(context.accounts.random).deploy(
        context.accounts.random.address
      );

      lsp9VaultC = await new LSP9Vault__factory(context.accounts.random).deploy(
        context.accounts.random.address
      );
    });

    describe("when transferring ownership of vaults from EOA to UP", () => {
      describe("When transfering Ownership of VaultA to UP1", () => {
        beforeAll(async () => {
          await lsp9VaultA
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          let executePayload =
            context.universalProfile1.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              lsp9VaultA.address,
              0,
              lsp9VaultA.interface.getSighash("claimOwnership"),
            ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(executePayload);
        });

        it("should register lsp10key: arrayLength 1, index 0, VaultA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultA
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp9VaultA.address);
        });
      });

      describe("When transfering Ownership of VaultB to UP1", () => {
        beforeAll(async () => {
          await lsp9VaultB
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          let executePayload =
            context.universalProfile1.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              lsp9VaultB.address,
              0,
              lsp9VaultB.interface.getSighash("claimOwnership"),
            ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(executePayload);
        });

        it("should register lsp10key: arrayLength 1, index 0, VaultA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp9VaultB.address);
        });
      });

      describe("When transfering Ownership of VaultC to UP1", () => {
        beforeAll(async () => {
          await lsp9VaultC
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          let executePayload =
            context.universalProfile1.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              lsp9VaultC.address,
              0,
              lsp9VaultC.interface.getSighash("claimOwnership"),
            ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(executePayload);
        });

        it("should register lsp10key: arrayLength 1, index 0, VaultA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultC
            );
          expect(indexInMap).toEqual(2);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(elementAddress).toEqual(lsp9VaultC.address);
        });
      });
    });

    describe("when transferring ownership of vaults from UP to UP", () => {
      describe("When transfering Ownership of VaultA from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp9VaultA.interface.encodeFunctionData(
            "transferOwnership",
            [context.universalProfile2.address]
          );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp9VaultA.address, abi)
            );

          let executePayload =
            context.universalProfile2.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              lsp9VaultA.address,
              0,
              lsp9VaultA.interface.getSighash("claimOwnership"),
            ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(executePayload);
        });

        it("should pop and swap VaultA with VaultC, lsp10keys (VaultC should become first vault) : arrayLength 2, index = 0, VaultC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultC
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp9VaultC.address);
        });

        it("should register lsp10key: arrayLength 1, index 0, VaultA address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile2,
              lsp9VaultA
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp9VaultA.address);
        });
      });

      describe("When transfering Ownership of VaultB from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp9VaultB.interface.encodeFunctionData(
            "transferOwnership",
            [context.universalProfile2.address]
          );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp9VaultB.address, abi)
            );

          let executePayload =
            context.universalProfile2.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              lsp9VaultB.address,
              0,
              lsp9VaultB.interface.getSighash("claimOwnership"),
            ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(executePayload);
        });

        it("should update lsp10keys (no pop and swap as VaultB has the last index): arrayLength 1, no map, no VaultB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YKeys.LSP10.LSP10VaultsMap + lsp9VaultB.address.substr(2),
              ERC725YKeys.LSP10["LSP10Vaults[]"].length,
              ERC725YKeys.LSP10["LSP10Vaults[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual("0x");
        });

        it("should register lsp10key: arrayLength 2, index 1, VaultB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile2,
              lsp9VaultB
            );
          expect(indexInMap).toEqual(1);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.TWO);
          expect(elementAddress).toEqual(lsp9VaultB.address);
        });
      });

      describe("When transfering Ownership of VaultC from UP1 to UP2", () => {
        beforeAll(async () => {
          const abi = lsp9VaultC.interface.encodeFunctionData(
            "transferOwnership",
            [context.universalProfile2.address]
          );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(
              callPayload(context.universalProfile1, lsp9VaultC.address, abi)
            );

          let executePayload =
            context.universalProfile2.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              lsp9VaultC.address,
              0,
              lsp9VaultC.interface.getSighash("claimOwnership"),
            ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(executePayload);
        });

        it("should remove all lsp10keys : arrayLength 0, no map, no VaultC address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YKeys.LSP10.LSP10VaultsMap + lsp9VaultB.address.substr(2),
              ERC725YKeys.LSP10["LSP10Vaults[]"].length,
              ERC725YKeys.LSP10["LSP10Vaults[]"].index +
                "00000000000000000000000000000000",
            ]);

          expect(mapValue).toEqual("0x");
          expect(arrayLength).toEqual(ARRAY_LENGTH.ZERO);
          expect(elementAddress).toEqual("0x");
        });

        it("should register lsp10key: arrayLength 3, index 2, VaultC address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile2,
              lsp9VaultC
            );
          expect(indexInMap).toEqual(2);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.THREE);
          expect(elementAddress).toEqual(lsp9VaultC.address);
        });
      });

      describe("When transferring Ownership of VaultB from UP2 to UP1", () => {
        beforeAll(async () => {
          const abi = lsp9VaultB.interface.encodeFunctionData(
            "transferOwnership",
            [context.universalProfile1.address]
          );

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(
              callPayload(context.universalProfile2, lsp9VaultB.address, abi)
            );

          let executePayload =
            context.universalProfile1.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              lsp9VaultB.address,
              0,
              lsp9VaultB.interface.getSighash("claimOwnership"),
            ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(executePayload);
        });
        it("should register lsp10key (UP1 able to re-write) : arrayLength 1, index 0, VaultB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultB
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp9VaultB.address);
        });
      });
    });

    describe("when transferring ownership of vaults from UP to EOA", () => {
      describe("When transfering Ownership of VaultA from UP2 to EOA", () => {
        beforeAll(async () => {
          const abi = lsp9VaultA.interface.encodeFunctionData(
            "transferOwnership",
            [context.accounts.any.address]
          );

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(
              callPayload(context.universalProfile2, lsp9VaultA.address, abi)
            );

          await lsp9VaultA.connect(context.accounts.any).claimOwnership();
        });

        it("should pop and swap VaultA with VaultC, lsp10keys (VaultC should become first vault) : arrayLength 1, index = 0, VaultC address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile2,
              lsp9VaultC
            );
          expect(indexInMap).toEqual(0);
          expect(interfaceId).toEqual(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).toEqual(ARRAY_LENGTH.ONE);
          expect(elementAddress).toEqual(lsp9VaultC.address);
        });
      });
    });
  });
};

export type LSP1DelegateInitializeTestContext = {
  lsp1universalReceiverDelegateUP: LSP1UniversalReceiverDelegateUP;
};

export const shouldInitializeLikeLSP1Delegate = (
  buildContext: () => Promise<LSP1DelegateInitializeTestContext>
) => {
  let context: LSP1DelegateInitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should have registered the ERC165 interface", async () => {
      expect(
        await context.lsp1universalReceiverDelegateUP.supportsInterface(
          INTERFACE_IDS.ERC165
        )
      );
    });

    it("should have registered the LSP1Delegate interface", async () => {
      expect(
        await context.lsp1universalReceiverDelegateUP.supportsInterface(
          INTERFACE_IDS.LSP1UniversalReceiverDelegate
        )
      );
    });
  });
};
