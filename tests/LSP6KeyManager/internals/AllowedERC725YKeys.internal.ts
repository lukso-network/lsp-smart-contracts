import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
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
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        encodedAllowedERC725YKeys,
      ];

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("getAllowedERC725YKeysFor(...)", () => {
      it("should return the same list of allowed ERC725Y Keys", async () => {
        let bytesResult =
          await context.keyManagerHelper.getAllowedERC725YKeysFor(
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
          context.keyManagerHelper.verifyAllowedERC725YKeys(
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
};
