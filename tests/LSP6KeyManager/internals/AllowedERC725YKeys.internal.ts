import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  SupportedStandards,
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6InternalsTestContext } from "../../utils/context";
import { setupKeyManagerHelper } from "../../utils/fixtures";

// helpers
import { abiCoder, NotAllowedERC725YKeyError } from "../../utils/helpers";

export const testAllowedERC725YKeysInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>
) => {
  let context: LSP6InternalsTestContext;

  describe("keyType: Singleton", () => {
    let controllerCanSetOneKey: SignerWithAddress;

    const customKey1 = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("CustomKey1")
    );

    const encodedAllowedERC725YKeys = abiCoder.encode(
      ["bytes32[]"],
      [[customKey1]]
    );

    beforeEach(async () => {
      context = await buildContext();

      controllerCanSetOneKey = context.accounts[1];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controllerCanSetOneKey.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          controllerCanSetOneKey.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.SETDATA,
        encodedAllowedERC725YKeys,
      ];

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("getAllowedERC725YKeysFor(...)", () => {
      it("should return the same list of allowed ERC725Y Keys", async () => {
        let bytesResult =
          await context.keyManagerInternalTester.getAllowedERC725YKeysFor(
            controllerCanSetOneKey.address
          );

        let [decodedResult] = abiCoder.decode(["bytes32[]"], bytesResult);

        const expectedResult = [customKey1];

        expect(decodedResult).toEqual(expectedResult);
      });
    });

    describe("verifyAllowedERC725YKeys(...)", () => {
      it("should revert even if list contains one allowed key", async () => {
        let inputKeys = [
          customKey1,
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
        ];

        await expect(
          context.keyManagerInternalTester.verifyAllowedERC725YKeys(
            controllerCanSetOneKey.address,
            inputKeys
          )
        ).toBeRevertedWith(
          NotAllowedERC725YKeyError(
            controllerCanSetOneKey.address,
            inputKeys[1]
          )
        );
      });
    });
  });

  describe("_countZeroBytes(...)", () => {
    beforeEach(async () => {
      context = await buildContext();
    });

    describe("test against LSP2 key types", () => {
      const SINGLETON_KEY = ERC725YKeys.LSP3["LSP3Profile"];

      const ARRAY_KEY =
        ERC725YKeys.LSP4["LSP4Creators[]"].index + "00".repeat(16);

      const MAPPING_KEY =
        SupportedStandards.LSP3UniversalProfile.key.substring(0, 34) +
        "00".repeat(16);

      const BYTES20_MAPPING_KEY =
        ERC725YKeys.LSP5["LSP5ReceivedAssetsMap"].substring(0, 18) +
        "00".repeat(24);

      it(
        "Singleton: should return 0 for `LSP3Profile` -> " + SINGLETON_KEY,
        async () => {
          let result =
            await context.keyManagerInternalTester.countTrailingZeroBytes(
              SINGLETON_KEY
            );

          expect(result.toNumber()).toEqual(0);
        }
      );

      it(
        "Array: should return 16 for `LSP4Creators[]` -> " + ARRAY_KEY,
        async () => {
          let result =
            await context.keyManagerInternalTester.countTrailingZeroBytes(
              ARRAY_KEY
            );

          expect(result.toNumber()).toEqual(16);
        }
      );

      it(
        "Mapping: should return 16 for `SupportedStandards:...` -> " +
          MAPPING_KEY,
        async () => {
          let result =
            await context.keyManagerInternalTester.countTrailingZeroBytes(
              MAPPING_KEY
            );

          expect(result.toNumber()).toEqual(16);
        }
      );

      it(
        "Bytes20Mapping: should return 16 for `LSP5ReceivedAssetsMap:...` -> " +
          BYTES20_MAPPING_KEY,
        async () => {
          let result =
            await context.keyManagerInternalTester.countTrailingZeroBytes(
              BYTES20_MAPPING_KEY
            );

          expect(result.toNumber()).toEqual(24);
        }
      );
    });
  });
};
