import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract, TargetContract__factory } from "../../../types";

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
import { abiCoder, NotAllowedAddressError } from "../../utils/helpers";

export const testAllowedAddressesInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>
) => {
  let context: LSP6InternalsTestContext;

  describe("testing abi-encoded array of `address[]`", () => {
    let canCallOnlyTwoAddresses: SignerWithAddress;

    let allowedEOA: SignerWithAddress,
      notAllowedEOA: SignerWithAddress,
      allowedTargetContract: TargetContract,
      notAllowedTargetContract: TargetContract;

    beforeEach(async () => {
      context = await buildContext();

      canCallOnlyTwoAddresses = context.accounts[1];
      allowedEOA = context.accounts[2];
      notAllowedEOA = context.accounts[3];

      allowedTargetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      notAllowedTargetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      let permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canCallOnlyTwoAddresses.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          canCallOnlyTwoAddresses.address.substring(2),
      ];

      let permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        abiCoder.encode(
          ["address[]"],
          [[allowedEOA.address, allowedTargetContract.address]]
        ),
      ];

      await setupKeyManagerHelper(context, permissionsKeys, permissionsValues);
    });

    describe("`getAllowedAddressesFor(...)`", () => {
      it("should return the same list of allowed addresses", async () => {
        let bytesResult =
          await context.keyManagerInternalTester.getAllowedAddressesFor(
            canCallOnlyTwoAddresses.address
          );

        let decodedResult = abiCoder.decode(["address[]"], bytesResult);

        let expectedResult = [
          await ethers.utils.getAddress(allowedEOA.address),
          await ethers.utils.getAddress(allowedTargetContract.address),
        ];

        expect(decodedResult).toEqual([expectedResult]);
      });

      it("should return no bytes when no allowed addresses are set", async () => {
        let bytesResult =
          await context.keyManagerInternalTester.getAllowedAddressesFor(
            context.owner.address
          );
        expect(bytesResult).toEqual("0x");

        let resultFromAccount = await context.universalProfile[
          "getData(bytes32)"
        ](
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            context.owner.address.substring(2)
        );
        expect(resultFromAccount).toEqual("0x");
      });
    });

    describe("`verifyAllowedAddressesFor(...)`", () => {
      it("should not revert for an address listed in allowed addresses list", async () => {
        await context.keyManagerInternalTester.verifyAllowedAddress(
          canCallOnlyTwoAddresses.address,
          allowedEOA.address
        );
        await context.keyManagerInternalTester.verifyAllowedAddress(
          canCallOnlyTwoAddresses.address,
          allowedTargetContract.address
        );
      });

      it("should revert for address not listed in allowed addresses list", async () => {
        let disallowedAddress = ethers.utils.getAddress(
          "0xdeadbeefdeadbeefdeaddeadbeefdeadbeefdead"
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedAddress(
            canCallOnlyTwoAddresses.address,
            disallowedAddress
          )
        ).toBeRevertedWith(
          NotAllowedAddressError(
            canCallOnlyTwoAddresses.address,
            disallowedAddress
          )
        );
      });

      it("should not revert when user has no address listed (= all addresses whitelisted)", async () => {
        let randomAddress = ethers.Wallet.createRandom().address.toLowerCase();

        await context.keyManagerInternalTester.verifyAllowedAddress(
          context.owner.address,
          randomAddress
        );
      });
    });
  });

  describe.skip("testing 'zero bytes' stored under AddressPermission:AllowedAddresses:<address>", () => {
    type ControllersContext = {
      noBytes: SignerWithAddress;
      oneZeroByte: SignerWithAddress;
      tenZeroBytes: SignerWithAddress;
      twentyZeroBytes: SignerWithAddress;
      thirtyTwoZeroBytes: SignerWithAddress;
      fourtyZeroBytes: SignerWithAddress;
      sixtyFourZeroBytes: SignerWithAddress;
      hundredZeroBytes: SignerWithAddress;
    };

    let controller: ControllersContext;

    const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();

    beforeAll(async () => {
      context = await buildContext();

      controller = {
        noBytes: context.accounts[1],
        oneZeroByte: context.accounts[2],
        tenZeroBytes: context.accounts[3],
        twentyZeroBytes: context.accounts[4],
        thirtyTwoZeroBytes: context.accounts[5],
        fourtyZeroBytes: context.accounts[6],
        sixtyFourZeroBytes: context.accounts[7],
        hundredZeroBytes: context.accounts[8],
      };

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ...Object.values(controller).map(
          (controller) =>
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            controller.address.substring(2)
        ),
        ...Object.values(controller).map(
          (controller) =>
            ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            controller.address.substring(2)
        ),
      ];

      let permissionValues = [ALL_PERMISSIONS_SET];

      for (let ii = 0; ii < Object.values(controller).length; ii++) {
        permissionValues.push(
          ethers.utils.hexZeroPad(
            PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
            32
          )
        );
      }

      permissionValues = permissionValues.concat([
        "0x",
        "0x" + "00".repeat(1),
        "0x" + "00".repeat(10),
        "0x" + "00".repeat(20),
        "0x" + "00".repeat(32),
        "0x" + "00".repeat(40),
        "0x" + "00".repeat(64),
        "0x" + "00".repeat(100),
      ]);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    it("noBytes", async () => {
      await context.keyManagerInternalTester.verifyAllowedAddress(
        controller.noBytes.address,
        randomAddress
      );
    });

    it("oneZeroByte", async () => {
      await context.keyManagerInternalTester.verifyAllowedAddress(
        controller.oneZeroByte.address,
        randomAddress
      );
    });

    it("tenZeroBytes", async () => {
      await context.keyManagerInternalTester.verifyAllowedAddress(
        controller.tenZeroBytes.address,
        randomAddress
      );
    });

    it("twentyZeroBytes", async () => {
      await context.keyManagerInternalTester.verifyAllowedAddress(
        controller.twentyZeroBytes.address,
        randomAddress
      );
    });

    it("thirtyTwoZeroBytes", async () => {
      await context.keyManagerInternalTester.verifyAllowedAddress(
        controller.thirtyTwoZeroBytes.address,
        randomAddress
      );
    });

    it("fourtyZeroBytes", async () => {
      await context.keyManagerInternalTester.verifyAllowedAddress(
        controller.fourtyZeroBytes.address,
        randomAddress
      );
    });

    it("sixtyFourZeroBytes", async () => {
      await context.keyManagerInternalTester.verifyAllowedAddress(
        controller.sixtyFourZeroBytes.address,
        randomAddress
      );
    });

    it("hundredZeroBytes", async () => {
      await context.keyManagerInternalTester.verifyAllowedAddress(
        controller.hundredZeroBytes.address,
        randomAddress
      );
    });
  });

  describe.skip("testing random values under the key `AddressPermissions:AllowedAddress:<address>`", () => {
    type ControllersContext = {
      emptyABIEncodedArray: SignerWithAddress;
      emptyABIEncodedArrayWithMoreZeros: SignerWithAddress;
      shortBytes: SignerWithAddress;
      longBytes: SignerWithAddress;
      multipleOf32Bytes: SignerWithAddress;
    };

    let controller: ControllersContext;

    const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();

    beforeAll(async () => {
      context = await buildContext();

      controller = {
        emptyABIEncodedArray: context.accounts[1],
        emptyABIEncodedArrayWithMoreZeros: context.accounts[2],
        shortBytes: context.accounts[3],
        longBytes: context.accounts[4],
        multipleOf32Bytes: context.accounts[5],
      };

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.emptyABIEncodedArray.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.emptyABIEncodedArrayWithMoreZeros.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.shortBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.longBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.multipleOf32Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.emptyABIEncodedArray.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.emptyABIEncodedArrayWithMoreZeros.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.shortBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.longBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.multipleOf32Bytes.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        "0xaabbccdd",
        "0x1234567890abcdef1234567890abcdef",
        "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0Ee7A142d267C1f36714E4a8F75612F20a79720",
      ];

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("`verifyAllowedAddressesFor(...)`", () => {
      /** @reverts NotAllowedAddress */
      it("what happen for emptyABIEncodedArray?", async () => {
        await context.keyManagerInternalTester.verifyAllowedAddress(
          controller.emptyABIEncodedArray.address,
          randomAddress
        );
      });

      /** @reverts NotAllowedAddress */
      it("what happen for emptyABIEncodedArrayWithMoreZeros?", async () => {
        await context.keyManagerInternalTester.verifyAllowedAddress(
          controller.emptyABIEncodedArrayWithMoreZeros.address,
          randomAddress
        );
      });

      /** @fail Transaction reverted and Hardhat couldn't infer the reason */
      it("what happen for shortBytes?", async () => {
        await context.keyManagerInternalTester.verifyAllowedAddress(
          controller.shortBytes.address,
          randomAddress
        );
      });

      /** @fail Transaction reverted and Hardhat couldn't infer the reason */
      it("what happen for longBytes?", async () => {
        await context.keyManagerInternalTester.verifyAllowedAddress(
          controller.longBytes.address,
          randomAddress
        );
      });

      /** @fail Transaction reverted and Hardhat couldn't infer the reason */
      it("what happen for multipleOf32Bytes?", async () => {
        await context.keyManagerInternalTester.verifyAllowedAddress(
          controller.multipleOf32Bytes.address,
          randomAddress
        );
      });
    });
  });
};
