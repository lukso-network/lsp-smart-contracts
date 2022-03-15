import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// setup
import { LSP6InternalsTestContext } from "../../utils/context";
import { setupKeyManagerHelper } from "../../utils/fixtures";

// constants
import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  OPERATIONS,
  PERMISSIONS,
} from "../../../constants";

const abiCoder = ethers.utils.defaultAbiCoder;

export const testReadingPermissionsInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>
) => {
  let context: LSP6InternalsTestContext;

  describe("`getPermissionsFor(...)` -> reading permissions", () => {
    let addressCanSetData: SignerWithAddress,
      addressCanSetDataAndCall: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      addressCanSetData = context.accounts[1];
      addressCanSetDataAndCall = context.accounts[2];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanSetData.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanSetDataAndCall.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32),
      ];

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    it("Should return ALL_PERMISSIONS for owner", async () => {
      expect(
        await context.keyManagerHelper.getAddressPermissions(
          context.owner.address
        )
      ).toEqual(ALL_PERMISSIONS_SET); // ALL_PERMISSIONS = "0xffff..."
    });

    it("Should return SETDATA", async () => {
      expect(
        await context.keyManagerHelper.getAddressPermissions(
          addressCanSetData.address
        )
      ).toEqual(ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32));
    });

    it("Should return SETDATA + CALL", async () => {
      expect(
        await context.keyManagerHelper.getAddressPermissions(
          addressCanSetDataAndCall.address
        )
      ).toEqual(
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32)
      );
    });
  });

  describe("`getPermissionsFor(...)` -> reading empty permissions", () => {
    let moreThan32EmptyBytes: SignerWithAddress,
      lessThan32EmptyBytes: SignerWithAddress,
      oneEmptyByte: SignerWithAddress;

    const expectedEmptyPermission = abiCoder.encode(
      ["bytes32"],
      ["0x0000000000000000000000000000000000000000000000000000000000000000"]
    );

    beforeEach(async () => {
      context = await buildContext();

      moreThan32EmptyBytes = context.accounts[1];
      lessThan32EmptyBytes = context.accounts[2];
      oneEmptyByte = context.accounts[3];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          moreThan32EmptyBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          lessThan32EmptyBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          oneEmptyByte.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS_SET,
        "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "0x000000000000000000000000000000",
        "0x00",
      ];

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    it("should cast permissions to 32 bytes when reading permissions stored as more than 32 empty bytes", async () => {
      const result = await context.keyManagerHelper.getAddressPermissions(
        moreThan32EmptyBytes.address
      );
      expect(result).toEqual(expectedEmptyPermission);
    });

    it("should cast permissions to 32 bytes when reading permissions stored as less than 32 empty bytes", async () => {
      const result = await context.keyManagerHelper.getAddressPermissions(
        lessThan32EmptyBytes.address
      );
      expect(result).toEqual(expectedEmptyPermission);
    });

    it("should cast permissions to 32 bytes when reading permissions stored as one empty byte", async () => {
      const result = await context.keyManagerHelper.getAddressPermissions(
        oneEmptyByte.address
      );
      expect(result).toEqual(expectedEmptyPermission);
    });
  });
};
