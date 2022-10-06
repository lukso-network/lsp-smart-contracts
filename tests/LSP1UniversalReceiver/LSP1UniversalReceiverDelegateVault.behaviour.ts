import { ethers } from "hardhat";
import { expect } from "chai";
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

import {
  ARRAY_LENGTH,
  TOKEN_ID,
  LSP1_HOOK_PLACEHOLDER,
  abiCoder,
} from "../utils/helpers";

// constants
import {
  ERC725YKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  LSP1_TYPE_IDS,
} from "../../constants";
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

  before(async () => {
    context = await buildContext();
  });

  describe("when testing ERC165 standard", () => {
    it("should support ERC165 interface", async () => {
      const result =
        await context.lsp1universalReceiverDelegateVault.supportsInterface(
          INTERFACE_IDS.ERC165
        );
      expect(result).to.be.true;
    });

    it("should support LSP1Delegate interface", async () => {
      const result =
        await context.lsp1universalReceiverDelegateVault.supportsInterface(
          INTERFACE_IDS.LSP1UniversalReceiverDelegate
        );
      expect(result).to.be.true;
    });
  });

  describe("When testing EOA call to URD through the UR function", () => {
    describe("when calling with tokens typeId", () => {
      it("should revert with custom error", async () => {
        let URD_TypeIds = [
          LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification,
          LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
          LSP1_TYPE_IDS.LSP8Tokens_RecipientNotification,
          LSP1_TYPE_IDS.LSP8Tokens_SenderNotification,
        ];

        for (let i = 0; i < URD_TypeIds.length; i++) {
          await expect(
            context.lsp9Vault1
              .connect(context.accounts.any)
              .universalReceiver(URD_TypeIds[i], "0x")
          )
            .to.be.revertedWithCustomError(
              context.lsp1universalReceiverDelegateVault,
              "CannotRegisterEOAsAsAssets"
            )
            .withArgs(context.accounts.any.address);
        }
      });
    });

    describe("when calling with vaults sender and recipient typeIds", () => {
      it("should pass and return typeId out of scope return value", async () => {
        let Vault_TypeIds = [
          LSP1_TYPE_IDS.LSP14OwnershipTransferred_RecipientNotification,
          LSP1_TYPE_IDS.LSP14OwnershipTransferred_SenderNotification,
        ];

        for (let i = 0; i < Vault_TypeIds.length; i++) {
          let result = await context.lsp9Vault1
            .connect(context.accounts.any)
            .callStatic.universalReceiver(Vault_TypeIds[i], "0x");

          const [resultDelegate, resultTypeID] = abiCoder.decode(
            ["bytes", "bytes"],
            result
          );

          expect(resultDelegate).to.equal(
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("LSP1: typeId out of scope")
            )
          );

          expect(resultTypeID).to.equal("0x");
        }
      });
    });

    describe("when calling with random bytes32 typeId", () => {
      it("should pass and return typeId out of scope return value", async () => {
        let result = await context.lsp9Vault1
          .connect(context.accounts.any)
          .callStatic.universalReceiver(LSP1_HOOK_PLACEHOLDER, "0x");

        const [resultDelegate, resultTypeID] = abiCoder.decode(
          ["bytes", "bytes"],
          result
        );

        expect(resultDelegate).to.equal(
          ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("LSP1: typeId out of scope")
          )
        );

        expect(resultTypeID).to.equal("0x");
      });
    });
  });

  describe("when testing LSP7-DigitalAsset", () => {
    let lsp7TokenA: LSP7Tester, lsp7TokenB: LSP7Tester, lsp7TokenC: LSP7Tester;
    before(async () => {
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
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenA.address);
        });
      });

      describe("when minting 10 tokenB to lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("when minting 10 of the same tokenB to lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("when minting 10 tokenC to lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });
      });
    });

    describe("when burning tokens", () => {
      describe("when burning 10 tokenC (last token) from lsp9Vault1", () => {
        before(async () => {
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal("0x");
        });
      });

      describe("when burning 10 tokenA (first token) from lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });
      });

      describe("when burning 10 (half of the amount) tokenB from lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("when burning 10 (remaining) tokenB from lsp9Vault1", () => {
        before(async () => {
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal("0x");
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

        expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
        expect(indexInMapTokenA).to.equal(0);
        expect(indexInMapTokenB).to.equal(1);
        expect(indexInMapTokenC).to.equal(2);
        expect(interfaceIdTokenA).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
        expect(interfaceIdTokenB).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
        expect(interfaceIdTokenC).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
        expect(elementAddressTokenA).to.equal(lsp7TokenA.address);
        expect(elementAddressTokenB).to.equal(lsp7TokenB.address);
        expect(elementAddressTokenC).to.equal(lsp7TokenC.address);
      });

      describe("When transferring 10 (all) token A from UP1 to UP2", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenC.address);
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenA.address);
        });
      });

      describe("When transferring 5 (half of amount) token B from UP1 to UP2", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("When transferring 4 (few) token B from UP1 to UP2", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("When transferring 1 (remaining) token B from UP1 to UP2", () => {
        before(async () => {
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("When transferring 10 (all) token C from UP1 to UP2", () => {
        before(async () => {
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp5keys : arrayLength 3, index = 2, tokenC address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });
      });

      describe("When transferring 1 (few) token B from UP2 to UP1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });
    });

    describe("when removing all keys", () => {
      before(async () => {
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

        expect(arrayLengthUP1).to.equal(ARRAY_LENGTH.ZERO);
        expect(arrayLengthUP2).to.equal(ARRAY_LENGTH.ZERO);
      });
    });
  });

  describe("when testing LSP8-IdentifiableDigitalAsset", () => {
    let lsp8TokenA: LSP8Tester, lsp8TokenB: LSP8Tester, lsp8TokenC: LSP8Tester;
    before(async () => {
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
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenA.address);
        });
      });

      describe("when minting tokenId 1 of tokenB to lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("when minting tokenId 2 of tokenB (another) to lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("when minting tokenId 1 of tokenC to lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });
      });
    });

    describe("when burning tokens", () => {
      describe("when burning tokenId 1 (all balance) of tokenC (last token) from lsp9Vault1", () => {
        before(async () => {
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal("0x");
        });
      });

      describe("when burning tokenId 1 (all balance) of tokenA (first token) from lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });
      });

      describe("when burning 1 tokenId (not all balance) of tokenB from lsp9Vault1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("when burning all tokenB from lsp9Vault1", () => {
        before(async () => {
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal("0x");
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

        expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
        expect(indexInMapTokenA).to.equal(0);
        expect(indexInMapTokenB).to.equal(1);
        expect(indexInMapTokenC).to.equal(2);
        expect(interfaceIdTokenA).to.equal(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset
        );
        expect(interfaceIdTokenB).to.equal(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset
        );
        expect(interfaceIdTokenC).to.equal(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset
        );
        expect(elementAddressTokenA).to.equal(lsp8TokenA.address);
        expect(elementAddressTokenB).to.equal(lsp8TokenB.address);
        expect(elementAddressTokenC).to.equal(lsp8TokenC.address);
      });

      describe("When transferring tokenId 1 (all) of token A from UP1 to UP2", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenC.address);
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenA.address);
        });
      });

      describe("When transferring tokenId 1 (not all balance) of token B from UP1 to UP2", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("When transferring tokenId 2 (not all balance) of token B from UP1 to UP2", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("When transferring tokenId 3 (remaining balance) of token B from UP1 to UP2", () => {
        before(async () => {
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("When transferring tokenId 1 (all balance) of token C from UP1 to UP2", () => {
        before(async () => {
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

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp5keys : arrayLength 3, index = 2, tokenC address in Vault2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });
      });

      describe("When transferring 1 tokenId (not all balance) of token B from UP2 to UP1", () => {
        before(async () => {
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
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });
    });
  });
};
