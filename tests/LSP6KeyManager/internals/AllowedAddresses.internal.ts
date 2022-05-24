import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { TargetContract, TargetContract__factory } from "../../../types";

// constants
import { ALL_PERMISSIONS, ERC725YKeys, PERMISSIONS } from "../../../constants";

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
        ALL_PERMISSIONS,
        ethers.utils.hexZeroPad(
          parseInt(Number(PERMISSIONS.CALL)) +
            parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
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

  describe("testing 'zero bytes' stored under AddressPermission:AllowedAddresses:<address>", () => {
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

    const zeroBytesValues = [
      "0x",
      "0x" + "00".repeat(1),
      "0x" + "00".repeat(10),
      "0x" + "00".repeat(20),
      "0x" + "00".repeat(32),
      "0x" + "00".repeat(40),
      "0x" + "00".repeat(64),
      "0x" + "00".repeat(100),
    ];

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

      let permissionValues = [ALL_PERMISSIONS];

      for (let ii = 0; ii < Object.values(controller).length; ii++) {
        permissionValues.push(
          ethers.utils.hexZeroPad(
            parseInt(Number(PERMISSIONS.CALL)) +
              parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
            32
          )
        );
      }

      permissionValues = permissionValues.concat(zeroBytesValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("`verifyAllowedAddressesFor(...)`", () => {
      describe("should not revert and consider the stored value as all addresses whitelisted for:", () => {
        it(`noBytes -> ${zeroBytesValues[0]}`, async () => {
          await context.keyManagerInternalTester.verifyAllowedAddress(
            controller.noBytes.address,
            randomAddress
          );
        });

        it(`oneZeroByte -> ${zeroBytesValues[1]}`, async () => {
          await context.keyManagerInternalTester.verifyAllowedAddress(
            controller.oneZeroByte.address,
            randomAddress
          );
        });

        it(`tenZeroBytes -> ${zeroBytesValues[2]}`, async () => {
          await context.keyManagerInternalTester.verifyAllowedAddress(
            controller.tenZeroBytes.address,
            randomAddress
          );
        });

        it(`twentyZeroBytes -> ${zeroBytesValues[3]}`, async () => {
          await context.keyManagerInternalTester.verifyAllowedAddress(
            controller.twentyZeroBytes.address,
            randomAddress
          );
        });
      });

      describe("should revert with NotAllowedAddress(...) error for:", () => {
        it(`thirtyTwoZeroBytes -> ${zeroBytesValues[4]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedAddress(
              controller.thirtyTwoZeroBytes.address,
              randomAddress
            )
          ).toBeRevertedWith(
            NotAllowedAddressError(
              controller.thirtyTwoZeroBytes.address,
              ethers.utils.getAddress(randomAddress)
            )
          );
        });

        it(`fourtyZeroBytes -> ${zeroBytesValues[5]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedAddress(
              controller.fourtyZeroBytes.address,
              randomAddress
            )
          ).toBeRevertedWith(
            NotAllowedAddressError(
              controller.fourtyZeroBytes.address,
              ethers.utils.getAddress(randomAddress)
            )
          );
        });

        it(`sixtyFourZeroBytes -> ${zeroBytesValues[6]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedAddress(
              controller.sixtyFourZeroBytes.address,
              randomAddress
            )
          ).toBeRevertedWith(
            NotAllowedAddressError(
              controller.sixtyFourZeroBytes.address,
              ethers.utils.getAddress(randomAddress)
            )
          );
        });

        it(`hundredZeroBytes -> ${zeroBytesValues[7]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedAddress(
              controller.hundredZeroBytes.address,
              randomAddress
            )
          ).toBeRevertedWith(
            NotAllowedAddressError(
              controller.hundredZeroBytes.address,
              ethers.utils.getAddress(randomAddress)
            )
          );
        });
      });
    });
  });

  describe("testing random values under the key `AddressPermissions:AllowedAddress:<address>`", () => {
    type ControllersContext = {
      emptyABIEncodedArray: SignerWithAddress;
      emptyABIEncodedArrayWithMoreZeros: SignerWithAddress;
      multipleOf32Bytes: SignerWithAddress;
      shortBytes: SignerWithAddress;
      longBytes: SignerWithAddress;
    };

    const randomValues = [
      "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000a0Ee7A142d267C1f36714E4a8F75612F20a79720",
      "0xaabbccdd",
      "0x1234567890abcdef1234567890abcdef",
    ];

    let controller: ControllersContext;

    const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();

    beforeAll(async () => {
      context = await buildContext();

      controller = {
        emptyABIEncodedArray: context.accounts[1],
        emptyABIEncodedArrayWithMoreZeros: context.accounts[2],
        multipleOf32Bytes: context.accounts[3],
        shortBytes: context.accounts[4],
        longBytes: context.accounts[5],
      };

      let permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.emptyABIEncodedArray.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.emptyABIEncodedArrayWithMoreZeros.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.multipleOf32Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.shortBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controller.longBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.emptyABIEncodedArray.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.emptyABIEncodedArrayWithMoreZeros.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.multipleOf32Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.shortBytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          controller.longBytes.address.substring(2),
      ];

      let permissionValues = [
        ALL_PERMISSIONS,
        ethers.utils.hexZeroPad(
          parseInt(Number(PERMISSIONS.CALL)) +
            parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
          32
        ),
        ethers.utils.hexZeroPad(
          parseInt(Number(PERMISSIONS.CALL)) +
            parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
          32
        ),
        ethers.utils.hexZeroPad(
          parseInt(Number(PERMISSIONS.CALL)) +
            parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
          32
        ),
        ethers.utils.hexZeroPad(
          parseInt(Number(PERMISSIONS.CALL)) +
            parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
          32
        ),
        ethers.utils.hexZeroPad(
          parseInt(Number(PERMISSIONS.CALL)) +
            parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
          32
        ),
      ];

      permissionValues = permissionValues.concat(randomValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("`verifyAllowedAddressesFor(...)`", () => {
      describe("should revert with NotAllowedAddress(...) error for:", () => {
        it(`emptyABIEncodedArray -> ${randomValues[0]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedAddress(
              controller.emptyABIEncodedArray.address,
              randomAddress
            )
          ).toBeRevertedWith(
            NotAllowedAddressError(
              controller.emptyABIEncodedArray.address,
              ethers.utils.getAddress(randomAddress)
            )
          );
        });

        it(`emptyABIEncodedArrayWithMoreZeros -> ${randomValues[1]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedAddress(
              controller.emptyABIEncodedArrayWithMoreZeros.address,
              randomAddress
            )
          ).toBeRevertedWith(
            NotAllowedAddressError(
              controller.emptyABIEncodedArrayWithMoreZeros.address,
              ethers.utils.getAddress(randomAddress)
            )
          );
        });

        it(`multipleOf32Bytes -> ${randomValues[2]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedAddress(
              controller.multipleOf32Bytes.address,
              randomAddress
            )
          ).toBeRevertedWith(
            NotAllowedAddressError(
              controller.multipleOf32Bytes.address,
              ethers.utils.getAddress(randomAddress)
            )
          );
        });
      });

      describe("should not revert and consider the stored value as all addresses whitelisted for:", () => {
        it(`shortBytes -> ${randomValues[3]}`, async () => {
          await context.keyManagerInternalTester.verifyAllowedAddress(
            controller.shortBytes.address,
            randomAddress
          );
        });

        it(`longBytes -> ${randomValues[4]}`, async () => {
          await context.keyManagerInternalTester.verifyAllowedAddress(
            controller.longBytes.address,
            randomAddress
          );
        });
      });
    });
  });
};
