import { ethers } from "hardhat";
import { expect } from "chai";
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
  LSP0ERC725Account,
  LSP0ERC725Account__factory,
} from "../../types";

// helpers
import {
  ARRAY_LENGTH,
  TOKEN_ID,
  LSP1_HOOK_PLACEHOLDER,
  abiCoder,
} from "../utils/helpers";

// constants
import {
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  LSP1_TYPE_IDS,
} from "../../constants";

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

  before(async () => {
    context = await buildContext();
  });

  describe("when testing ERC165 standard", () => {
    it("should support ERC165 interface", async () => {
      const result =
        await context.lsp1universalReceiverDelegateUP.supportsInterface(
          INTERFACE_IDS.ERC165
        );
      expect(result).to.be.true;
    });

    it("should support LSP1 interface", async () => {
      const result =
        await context.lsp1universalReceiverDelegateUP.supportsInterface(
          INTERFACE_IDS.LSP1UniversalReceiver
        );
      expect(result).to.be.true;
    });
  });

  describe("When testing EOA call to URD through the UR function", () => {
    describe("when calling with token/vault typeId", () => {
      it("should revert with custom error", async () => {
        let URD_TypeIds = [
          LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification,
          LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
          LSP1_TYPE_IDS.LSP8Tokens_RecipientNotification,
          LSP1_TYPE_IDS.LSP8Tokens_SenderNotification,
          LSP1_TYPE_IDS.LSP14OwnershipTransferred_RecipientNotification,
          LSP1_TYPE_IDS.LSP14OwnershipTransferred_SenderNotification,
        ];

        for (let i = 0; i < URD_TypeIds.length; i++) {
          await expect(
            context.universalProfile1
              .connect(context.accounts.any)
              .universalReceiver(URD_TypeIds[i], "0x")
          )
            .to.be.revertedWithCustomError(
              context.lsp1universalReceiverDelegateUP,
              "CannotRegisterEOAsAsAssets"
            )
            .withArgs(context.accounts.any.address);
        }
      });
    });

    describe("when calling with random bytes32 typeId", () => {
      it("should pass and return typeId out of scope return value", async () => {
        let result = await context.universalProfile1
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

  describe("when testing LSP0-ERC725Account", () => {
    describe("when accepting ownership of an LSP0", () => {
      let sentUniversalProfile: LSP0ERC725Account;
      before(async () => {
        sentUniversalProfile = await new LSP0ERC725Account__factory(
          context.accounts.owner1
        ).deploy(context.accounts.owner1.address);
      });

      it("should not register universal profile as received vault", async () => {
        const acceptingUniversalProfile: LSP0ERC725Account =
          context.universalProfile1;
        const acceptingUniversalProfileKM: LSP6KeyManager =
          context.lsp6KeyManager1;

        await sentUniversalProfile
          .connect(context.accounts.owner1)
          .transferOwnership(acceptingUniversalProfile.address);

        const acceptOwnershipPayload =
          sentUniversalProfile.interface.encodeFunctionData("acceptOwnership");
        const payloadToExecute =
          acceptingUniversalProfile.interface.encodeFunctionData(
            "execute(uint256,address,uint256,bytes)",
            [0, sentUniversalProfile.address, 0, acceptOwnershipPayload]
          );

        await acceptingUniversalProfileKM
          .connect(context.accounts.owner1)
          ["execute(bytes)"](payloadToExecute);

        const receivedVaultsKeys = [
          ERC725YDataKeys.LSP10["LSP10Vaults[]"].length,
          ERC725YDataKeys.LSP10["LSP10Vaults[]"].index + "0".repeat(32),
          ERC725YDataKeys.LSP10.LSP10VaultsMap +
            sentUniversalProfile.address.substring(2),
        ];
        const receivedVaultsValues = ["0x", "0x", "0x"];

        expect(
          await acceptingUniversalProfile["getData(bytes32[])"](
            receivedVaultsKeys
          )
        ).to.deep.equal(receivedVaultsValues);
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
      describe("when calling `mint(...)` with `amount == 0` and a `to == universalProfile`", () => {
        it("should revert and not register any LSP5ReceivedAssets[]", async () => {
          await expect(
            lsp7TokenA
              .connect(context.accounts.random)
              .mint(context.universalProfile1.address, 0, false, "0x")
          )
            .to.emit(lsp7TokenA, "Transfer")
            .withArgs(
              context.accounts.random.address,
              ethers.constants.AddressZero,
              context.universalProfile1.address,
              0,
              false,
              "0x"
            );

          const result = await context.universalProfile1["getData(bytes32)"](
            ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length
          );

          expect(result).to.equal("0x");
        });
      });

      describe("when minting 10 tokenA to universalProfile1", () => {
        before(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenA.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenA
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenA.address);
        });
      });

      describe("when minting 10 tokenB to universalProfile1", () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("when minting 10 of the same tokenB to universalProfile1", () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("when minting 10 tokenC to universalProfile1", () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenC.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 3, index 2, tokenC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenC
            );
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });
      });
    });

    describe("when burning tokens", () => {
      describe("when calling `burn(...)` with `amount == 0` and a `to == a universalProfile`", () => {
        it("should revert and not remove any LSP5ReceivedAssets[] on the UP", async () => {
          const lsp5ReceivedAssetsArrayLength = await context.universalProfile1[
            "getData(bytes32)"
          ](ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length);

          const abi = lsp7TokenC.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "0",
            "0x",
          ]);

          await expect(
            context.lsp6KeyManager1
              .connect(context.accounts.owner1)
              ["execute(bytes)"](
                callPayload(context.universalProfile1, lsp7TokenA.address, abi)
              )
          )
            .to.emit(lsp7TokenA, "Transfer")
            .withArgs(
              context.universalProfile1.address,
              context.universalProfile1.address,
              ethers.constants.AddressZero,
              "0",
              false,
              "0x"
            );

          // CHECK that LSP5ReceivedAssets[] has not changed
          expect(
            await context.universalProfile1["getData(bytes32)"](
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length
            )
          ).to.equal(lsp5ReceivedAssetsArrayLength);
        });
      });

      describe("when burning 10 tokenC (last token) from universalProfile1", () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "10",
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenC.address, abi)
            );
        });

        it("should update lsp5keys: arrayLength 2, no map, no tokenC address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenC.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000002",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal("0x");
        });
      });

      describe("when burning 10 tokenA (first token) from universalProfile1", () => {
        before(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "10",
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it("should update lsp5keys: arrayLength 1, no map, no tokenA address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenA.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });
      });

      describe("when burning 10 (half of the amount) tokenB from universalProfile1", () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "10",
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("when burning 10 (remaining) tokenB from universalProfile1", () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("burn", [
            context.universalProfile1.address,
            "10",
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 0, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenB.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000000",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal("0x");
        });
      });
    });

    describe("when transferring tokens", () => {
      describe("when calling `transfer(...)` with `amount == 0` and `to == universalProfile`", () => {
        it("should revert", async () => {
          const lsp5ReceivedAssetsArrayLength = await context.universalProfile1[
            "getData(bytes32)"
          ](ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length);

          await expect(
            lsp7TokenA
              .connect(context.accounts.random)
              .transfer(
                context.accounts.random.address,
                context.universalProfile1.address,
                0,
                false,
                "0x"
              )
          )
            .to.emit(lsp7TokenA, "Transfer")
            .withArgs(
              context.accounts.random.address,
              context.accounts.random.address,
              context.universalProfile1.address,
              0,
              false,
              "0x"
            );

          // CHECK that LSP5ReceivedAssets[] has not changed
          expect(
            await context.universalProfile1["getData(bytes32)"](
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length
            )
          ).to.equal(lsp5ReceivedAssetsArrayLength);
        });
      });

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
            context.universalProfile1.address,
            context.universalProfile2.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenC
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });

        it("should update lsp5keys: arrayLength 2, no map, no tokenA address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenA.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000002",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenA
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenA.address);
        });
      });

      describe("When transferring 5 (half of amount) token B from UP1 to UP2", () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.universalProfile1.address,
            context.universalProfile2.address,
            "5",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("When transferring 4 (few) token B from UP1 to UP2", () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.universalProfile1.address,
            context.universalProfile2.address,
            "4",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("When transferring 1 (remaining) token B from UP1 to UP2", () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.universalProfile1.address,
            context.universalProfile2.address,
            "1",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenB.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenB.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe("When transferring 10 (all) token C from UP1 to UP2", () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData("transfer", [
            context.universalProfile1.address,
            context.universalProfile2.address,
            "10",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp7TokenC.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp7TokenB.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp5keys : arrayLength 3, index = 2, tokenC address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp7TokenC
            );
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });
      });

      describe("When transferring 1 (few) token B from UP2 to UP1", () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData("transfer", [
            context.universalProfile2.address,
            context.universalProfile1.address,
            "1",
            false,
            "0x",
          ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            ["execute(bytes)"](
              callPayload(context.universalProfile2, lsp7TokenB.address, abi)
            );
        });

        it("should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp7TokenB
            );
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
          context.universalProfile1.address,
          "1",
          "0x",
        ]);

        await context.lsp6KeyManager1
          .connect(context.accounts.owner1)
          ["execute(bytes)"](
            callPayload(context.universalProfile1, lsp7TokenB.address, abi1)
          );

        const abi2 = lsp7TokenB.interface.encodeFunctionData("burn", [
          context.universalProfile2.address,
          "9",
          "0x",
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          ["execute(bytes)"](
            callPayload(context.universalProfile2, lsp7TokenB.address, abi2)
          );

        const abi3 = lsp7TokenA.interface.encodeFunctionData("burn", [
          context.universalProfile2.address,
          "10",
          "0x",
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          ["execute(bytes)"](
            callPayload(context.universalProfile2, lsp7TokenA.address, abi3)
          );

        const abi4 = lsp7TokenC.interface.encodeFunctionData("burn", [
          context.universalProfile2.address,
          "10",
          "0x",
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          ["execute(bytes)"](
            callPayload(context.universalProfile2, lsp7TokenC.address, abi4)
          );
      });
      it("should remove all lsp5 keys on both UP", async () => {
        const arrayLengthUP1 = await context.universalProfile1[
          "getData(bytes32)"
        ](ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length);

        const arrayLengthUP2 = await context.universalProfile2[
          "getData(bytes32)"
        ](ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length);

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
      describe("when minting tokenId 1 of tokenA to universalProfile1", () => {
        before(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenA.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenA
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenA.address);
        });
      });

      describe("when minting tokenId 1 of tokenB to universalProfile1", () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("when minting tokenId 2 of tokenB (another) to universalProfile1", () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            TOKEN_ID.TWO,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("when minting tokenId 1 of tokenC to universalProfile1", () => {
        before(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData("mint", [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenC.address, abi)
            );
        });
        it("should register lsp5keys: arrayLength 3, index 2, tokenC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenC
            );
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
      describe("when burning tokenId 1 (all balance) of tokenC (last token) from universalProfile1", () => {
        before(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenC.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 2, no map, no tokenC address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenC.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000002",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal("0x");
        });
      });

      describe("when burning tokenId 1 (all balance) of tokenA (first token) from universalProfile1", () => {
        before(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it("should update lsp5keys: arrayLength 1, no map, no tokenA address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenA.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });
      });

      describe("when burning 1 tokenId (not all balance) of tokenB from universalProfile1", () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("burn", [
            TOKEN_ID.ONE,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });
        it("should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe("when burning all tokenB from universalProfile1", () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData("burn", [
            TOKEN_ID.TWO,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });
        it("should update lsp5keys: arrayLength 0, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenB.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenA.address, abi)
            );
        });

        it("should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenC
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });

        it("should update lsp5keys: arrayLength 2, no map, no tokenA address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenA.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000002",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp5keys: arrayLength 1, index 0, tokenA address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenA
            );
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it("should register lsp5keys: arrayLength 2, index 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenB
            );
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.TWO,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset
          );
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenB
            );
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.THREE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenB.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenB.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });

        it("should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenB
            );
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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp8TokenC.address, abi)
            );
        });

        it("should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap +
                lsp8TokenB.address.substr(2),
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].length,
              ERC725YDataKeys.LSP5["LSP5ReceivedAssets[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp5keys : arrayLength 3, index = 2, tokenC address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile2,
              lsp8TokenC
            );
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
            context.universalProfile2.address,
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            "0x",
          ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            ["execute(bytes)"](
              callPayload(context.universalProfile2, lsp8TokenB.address, abi)
            );
        });

        it("should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(
              context.universalProfile1,
              lsp8TokenB
            );
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

  describe("when testing LSP9-Vault", () => {
    let lsp9VaultA: LSP9Vault, lsp9VaultB: LSP9Vault, lsp9VaultC: LSP9Vault;

    before(async () => {
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
        before(async () => {
          await lsp9VaultA
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          let executePayload =
            context.universalProfile1.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                lsp9VaultA.address,
                0,
                lsp9VaultA.interface.getSighash("acceptOwnership"),
              ]
            );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](executePayload);
        });

        it("should register lsp10key: arrayLength 1, index 0, VaultA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultA
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp9VaultA.address);
        });
      });

      describe("When transfering Ownership of VaultB to UP1", () => {
        before(async () => {
          await lsp9VaultB
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          let executePayload =
            context.universalProfile1.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                lsp9VaultB.address,
                0,
                lsp9VaultB.interface.getSighash("acceptOwnership"),
              ]
            );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](executePayload);
        });

        it("should register lsp10key: arrayLength 1, index 0, VaultA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp9VaultB.address);
        });
      });

      describe("When transfering Ownership of VaultC to UP1", () => {
        before(async () => {
          await lsp9VaultC
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          let executePayload =
            context.universalProfile1.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                lsp9VaultC.address,
                0,
                lsp9VaultC.interface.getSighash("acceptOwnership"),
              ]
            );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](executePayload);
        });

        it("should register lsp10key: arrayLength 1, index 0, VaultA address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultC
            );
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp9VaultC.address);
        });
      });
    });

    describe("when transferring ownership of vaults from UP to UP", () => {
      describe("When transfering Ownership of VaultA from UP1 to UP2", () => {
        before(async () => {
          const abi = lsp9VaultA.interface.encodeFunctionData(
            "transferOwnership",
            [context.universalProfile2.address]
          );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp9VaultA.address, abi)
            );

          let executePayload =
            context.universalProfile2.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                lsp9VaultA.address,
                0,
                lsp9VaultA.interface.getSighash("acceptOwnership"),
              ]
            );

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            ["execute(bytes)"](executePayload);
        });

        it("should pop and swap VaultA with VaultC, lsp10keys (VaultC should become first vault) : arrayLength 2, index = 0, VaultC address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultC
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp9VaultC.address);
        });

        it("should register lsp10key: arrayLength 1, index 0, VaultA address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile2,
              lsp9VaultA
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp9VaultA.address);
        });
      });

      describe("When transfering Ownership of VaultB from UP1 to UP2", () => {
        before(async () => {
          const abi = lsp9VaultB.interface.encodeFunctionData(
            "transferOwnership",
            [context.universalProfile2.address]
          );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp9VaultB.address, abi)
            );

          let executePayload =
            context.universalProfile2.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                lsp9VaultB.address,
                0,
                lsp9VaultB.interface.getSighash("acceptOwnership"),
              ]
            );

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            ["execute(bytes)"](executePayload);
        });

        it("should update lsp10keys (no pop and swap as VaultB has the last index): arrayLength 1, no map, no VaultB address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP10.LSP10VaultsMap +
                lsp9VaultB.address.substr(2),
              ERC725YDataKeys.LSP10["LSP10Vaults[]"].length,
              ERC725YDataKeys.LSP10["LSP10Vaults[]"].index +
                "00000000000000000000000000000001",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp10key: arrayLength 2, index 1, VaultB address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile2,
              lsp9VaultB
            );
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp9VaultB.address);
        });
      });

      describe("When transfering Ownership of VaultC from UP1 to UP2", () => {
        before(async () => {
          const abi = lsp9VaultC.interface.encodeFunctionData(
            "transferOwnership",
            [context.universalProfile2.address]
          );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](
              callPayload(context.universalProfile1, lsp9VaultC.address, abi)
            );

          let executePayload =
            context.universalProfile2.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                lsp9VaultC.address,
                0,
                lsp9VaultC.interface.getSighash("acceptOwnership"),
              ]
            );

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            ["execute(bytes)"](executePayload);
        });

        it("should remove all lsp10keys : arrayLength 0, no map, no VaultC address in UP1", async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1["getData(bytes32[])"]([
              ERC725YDataKeys.LSP10.LSP10VaultsMap +
                lsp9VaultB.address.substr(2),
              ERC725YDataKeys.LSP10["LSP10Vaults[]"].length,
              ERC725YDataKeys.LSP10["LSP10Vaults[]"].index +
                "00000000000000000000000000000000",
            ]);

          expect(mapValue).to.equal("0x");
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal("0x");
        });

        it("should register lsp10key: arrayLength 3, index 2, VaultC address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile2,
              lsp9VaultC
            );
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp9VaultC.address);
        });
      });

      describe("When transferring Ownership of VaultB from UP2 to UP1", () => {
        before(async () => {
          const abi = lsp9VaultB.interface.encodeFunctionData(
            "transferOwnership",
            [context.universalProfile1.address]
          );

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            ["execute(bytes)"](
              callPayload(context.universalProfile2, lsp9VaultB.address, abi)
            );

          let executePayload =
            context.universalProfile1.interface.encodeFunctionData(
              "execute(uint256,address,uint256,bytes)",
              [
                OPERATION_TYPES.CALL,
                lsp9VaultB.address,
                0,
                lsp9VaultB.interface.getSighash("acceptOwnership"),
              ]
            );

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            ["execute(bytes)"](executePayload);
        });
        it("should register lsp10key (UP1 able to re-write) : arrayLength 1, index 0, VaultB address in UP1", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile1,
              lsp9VaultB
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp9VaultB.address);
        });
      });
    });

    describe("when transferring ownership of vaults from UP to EOA", () => {
      describe("When transfering Ownership of VaultA from UP2 to EOA", () => {
        before(async () => {
          const abi = lsp9VaultA.interface.encodeFunctionData(
            "transferOwnership",
            [context.accounts.any.address]
          );

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            ["execute(bytes)"](
              callPayload(context.universalProfile2, lsp9VaultA.address, abi)
            );

          await lsp9VaultA.connect(context.accounts.any).acceptOwnership();
        });

        it("should pop and swap VaultA with VaultC, lsp10keys (VaultC should become first vault) : arrayLength 1, index = 0, VaultC address in UP2", async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(
              context.universalProfile2,
              lsp9VaultC
            );
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp9VaultC.address);
        });
      });
    });

    describe("when deploying vault to a UP directly", () => {
      let lsp9VaultD: LSP9Vault;

      before(async () => {
        lsp9VaultD = await new LSP9Vault__factory(
          context.accounts.random
        ).deploy(context.universalProfile1.address);
      });

      it("should register the data key relevant to the vault deployed in the UP storage", async () => {
        const [indexInMap, interfaceId, arrayLength, elementAddress] =
          await getLSP10MapAndArrayKeysValue(
            context.universalProfile1,
            lsp9VaultD
          );

        expect(indexInMap).to.equal(1);
        expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
        expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
        expect(elementAddress).to.equal(lsp9VaultD.address);
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

    it("should have registered the LSP1 interface", async () => {
      expect(
        await context.lsp1universalReceiverDelegateUP.supportsInterface(
          INTERFACE_IDS.LSP1UniversalReceiver
        )
      );
    });
  });
};
