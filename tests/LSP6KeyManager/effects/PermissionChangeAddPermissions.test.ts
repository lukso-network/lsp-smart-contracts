import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
} from "../../../constants";

// helpers
import { NotAuthorisedError } from "../../utils/helpers";

export const shouldBehaveLikePermissionChangeOrAddPermissions = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  let canOnlyAddPermissions: SignerWithAddress,
    canOnlyChangePermissions: SignerWithAddress,
    // address being used to CHANGE (= edit) permissions
    addressToEditPermissions: SignerWithAddress,
    addressWithZeroHexPermissions: SignerWithAddress;

  beforeEach(async () => {
    context = await buildContext();

    canOnlyAddPermissions = context.accounts[1];
    canOnlyChangePermissions = context.accounts[2];
    addressToEditPermissions = context.accounts[3];
    addressWithZeroHexPermissions = context.accounts[4];

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        canOnlyAddPermissions.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        canOnlyChangePermissions.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressToEditPermissions.address.substring(2),
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        addressWithZeroHexPermissions.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS_SET,
      ethers.utils.hexZeroPad(PERMISSIONS.ADDPERMISSIONS, 32),
      ethers.utils.hexZeroPad(PERMISSIONS.CHANGEPERMISSIONS, 32),
      // placeholder permission
      ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32),
      // 0x0000... = similar to empty, or 'no permissions set'
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe("when setting one permission key", () => {
    describe("when caller is an address with ALL PERMISSIONS", () => {
      it("should be allowed to ADD permissions", async () => {
        let newController = new ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newController.address.substr(2);

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [[key], [ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32)]]
        );

        await context.keyManager.connect(context.owner).execute(payload);

        const [result] = await context.universalProfile.callStatic.getData([
          key,
        ]);
        expect(result).toEqual(
          ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32)
        );
      });

      it("should be allowed to CHANGE permissions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressToEditPermissions.address.substring(2);

        let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [[key], [value]]
        );

        await context.keyManager.connect(context.owner).execute(payload);

        const [result] = await context.universalProfile.callStatic.getData([
          key,
        ]);
        expect(result).toEqual(value);
      });
    });

    describe("when caller is an address with permission ADDPERMISSIONS", () => {
      it("should be allowed to add permissions", async () => {
        let newController = new ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newController.address.substring(2);

        let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [[key], [value]]
        );

        await context.keyManager
          .connect(canOnlyAddPermissions)
          .execute(payload);

        const [result] = await context.universalProfile.callStatic.getData([
          key,
        ]);
        expect(result).toEqual(value);
      });
      it("should not be allowed to CHANGE permission", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressToEditPermissions.address.substring(2);

        let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [[key], [value]]
        );

        try {
          await context.keyManager
            .connect(canOnlyAddPermissions)
            .execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(
              canOnlyAddPermissions.address,
              "CHANGEPERMISSIONS"
            )
          );
        }
      });
    });

    describe("when caller is an address with permission CHANGEPERMISSION", () => {
      it("should not be allowed to ADD permissions", async () => {
        let newController = new ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newController.address.substr(2);

        let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [[key], [value]]
        );

        try {
          await context.keyManager
            .connect(canOnlyChangePermissions)
            .execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(
              canOnlyChangePermissions.address,
              "ADDPERMISSIONS"
            )
          );
        }
      });

      it("should not be allowed to set (= ADD) permissions for an address that has 32 x 0 bytes (0x0000...0000) as permission value", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressWithZeroHexPermissions.address.substring(2);
        let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [[key], [value]]
        );

        try {
          await context.keyManager
            .connect(canOnlyChangePermissions)
            .execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(
              canOnlyChangePermissions.address,
              "ADDPERMISSIONS"
            )
          );
        }
      });

      it("should be allowed to CHANGE permissions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressToEditPermissions.address.substring(2);

        let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData",
          [[key], [value]]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        let [result] = await context.universalProfile.callStatic.getData([key]);
        expect(result).toEqual(value);
      });
    });
  });
};
