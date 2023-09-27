import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ALL_PERMISSIONS, ERC725YDataKeys, PERMISSIONS } from '../../../constants';

// setup
import { LSP6InternalsTestContext } from '../../utils/context';
import { setupKeyManagerHelper } from '../../utils/fixtures';

// helpers
import { abiCoder, combinePermissions } from '../../utils/helpers';

export const testReadingPermissionsInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>,
) => {
  let context: LSP6InternalsTestContext;

  describe('`getPermissionsFor(...)` -> reading permissions', () => {
    let addressCanSetData: SignerWithAddress, addressCanSetDataAndCall: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      addressCanSetData = context.accounts[1];
      addressCanSetDataAndCall = context.accounts[2];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanSetData.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanSetDataAndCall.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.SETDATA,
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.CALL),
      ];

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    it('Should return ALL_PERMISSIONS for owner', async () => {
      expect(
        await context.keyManagerInternalTester.getPermissionsFor(context.mainController.address),
      ).to.equal(ALL_PERMISSIONS); // ALL_PERMISSIONS = "0xffff..."
    });

    it('Should return SETDATA', async () => {
      expect(
        await context.keyManagerInternalTester.getPermissionsFor(addressCanSetData.address),
      ).to.equal(PERMISSIONS.SETDATA);
    });

    it('Should return SETDATA + CALL', async () => {
      expect(
        await context.keyManagerInternalTester.getPermissionsFor(addressCanSetDataAndCall.address),
      ).to.equal(combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.CALL));
    });
  });

  describe('`getPermissionsFor(...)` -> reading empty permissions', () => {
    let moreThan32EmptyBytes: SignerWithAddress,
      lessThan32EmptyBytes: SignerWithAddress,
      oneEmptyByte: SignerWithAddress;

    const expectedEmptyPermission = abiCoder.encode(
      ['bytes32'],
      ['0x0000000000000000000000000000000000000000000000000000000000000000'],
    );

    before(async () => {
      context = await buildContext();

      moreThan32EmptyBytes = context.accounts[1];
      lessThan32EmptyBytes = context.accounts[2];
      oneEmptyByte = context.accounts[3];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          moreThan32EmptyBytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          lessThan32EmptyBytes.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + oneEmptyByte.address.substring(2),
      ];

      const permissionValues = [
        '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        '0x000000000000000000000000000000',
        '0x00',
      ];

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    it('should cast permissions to 32 bytes when reading permissions stored as more than 32 empty bytes', async () => {
      const result = await context.keyManagerInternalTester.getPermissionsFor(
        moreThan32EmptyBytes.address,
      );
      expect(result).to.equal(expectedEmptyPermission);
    });

    it('should cast permissions to 32 bytes when reading permissions stored as less than 32 empty bytes', async () => {
      const result = await context.keyManagerInternalTester.getPermissionsFor(
        lessThan32EmptyBytes.address,
      );
      expect(result).to.equal(expectedEmptyPermission);
    });

    it('should cast permissions to 32 bytes when reading permissions stored as one empty byte', async () => {
      const result = await context.keyManagerInternalTester.getPermissionsFor(oneEmptyByte.address);
      expect(result).to.equal(expectedEmptyPermission);
    });
  });

  describe('`includesPermissions(...)`', () => {
    let addressCanSetData: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      addressCanSetData = context.accounts[1];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanSetData.address.substring(2),
      ];

      const permissionValues = [ALL_PERMISSIONS, PERMISSIONS.SETDATA];

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    it('Should return true when checking if has permission SETDATA', async () => {
      const appPermissions = await context.keyManagerInternalTester.getPermissionsFor(
        addressCanSetData.address,
      );

      expect(
        await context.keyManagerInternalTester.hasPermission(appPermissions, PERMISSIONS.SETDATA),
      ).to.be.true;
    });
  });

  describe('AddressPermissions[]', () => {
    let firstBeneficiary: SignerWithAddress,
      secondBeneficiary: SignerWithAddress,
      thirdBeneficiary: SignerWithAddress,
      fourthBeneficiary: SignerWithAddress;

    let permissionArrayKeys: string[] = [];
    let permissionArrayValues: string[] = [];

    before(async () => {
      context = await buildContext();

      firstBeneficiary = context.accounts[1];
      secondBeneficiary = context.accounts[2];
      thirdBeneficiary = context.accounts[3];
      fourthBeneficiary = context.accounts[4];

      let permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          firstBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          secondBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          thirdBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          fourthBeneficiary.address.substring(2),
      ];

      let permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.CALL,
        PERMISSIONS.SETDATA,
        PERMISSIONS.TRANSFERVALUE,
        PERMISSIONS.SIGN,
      ];

      // set AddressPermissions array keys
      permissionArrayKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000000',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000001',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000002',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000003',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000004',
      ];

      // set AddressPermissions array values
      permissionArrayValues = [
        '0x05',
        context.mainController.address,
        firstBeneficiary.address,
        secondBeneficiary.address,
        thirdBeneficiary.address,
        fourthBeneficiary.address,
      ];

      permissionKeys = permissionKeys.concat(permissionArrayKeys);
      permissionValues = permissionValues.concat(permissionArrayValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    it("Value should be 5 for key 'AddressPermissions[]'", async () => {
      const result = await context.universalProfile.getData(
        ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
      );
      expect(result).to.equal('0x05');
    });

    // check array indexes individually
    for (let ii = 1; ii <= 5; ii++) {
      it(`Checking address (=value) stored at AddressPermissions[${ii}]'`, async () => {
        let result = await context.universalProfile.getData(permissionArrayKeys[ii]);
        // raw bytes are stored lower case, so we need to checksum the address retrieved
        result = ethers.utils.getAddress(result);
        expect(result).to.equal(permissionArrayValues[ii]);
      });
    }
  });
};
