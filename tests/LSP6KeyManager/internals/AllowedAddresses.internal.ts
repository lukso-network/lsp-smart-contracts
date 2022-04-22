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
      ethers.utils.hexZeroPad(PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE, 32),
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
      expect([bytesResult]).toEqual(["0x"]);

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
    it("should not revert for address listed in allowed addresses list", async () => {
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

      try {
        await context.keyManagerInternalTester.verifyAllowedAddress(
          canCallOnlyTwoAddresses.address,
          disallowedAddress
        );
      } catch (error) {
        expect(error.message).toMatch(
          NotAllowedAddressError(
            canCallOnlyTwoAddresses.address,
            disallowedAddress
          )
        );
      }
    });

    it("should not revert when user has no address listed (= all addresses whitelisted)", async () => {
      let randomAddress = ethers.Wallet.createRandom().address.toLowerCase();

      await context.keyManagerInternalTester.verifyAllowedAddress(
        context.owner.address,
        randomAddress
      );
    });
  });
};
