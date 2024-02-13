import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, ALL_PERMISSIONS, PERMISSIONS } from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

// helpers
import {
  combinePermissions,
  encodeCompactBytesArray,
  getRandomAddresses,
} from '../../utils/helpers';

export const shouldBehaveLikePermissionChangeOrAddURD = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  describe('setting UniversalReceiverDelegate keys (CHANGE vs ADD)', () => {
    let canAddAndChangeUniversalReceiverDelegate: SignerWithAddress,
      canOnlyAddUniversalReceiverDelegate: SignerWithAddress,
      canOnlyChangeUniversalReceiverDelegate: SignerWithAddress,
      canOnlySuperSetData: SignerWithAddress,
      canOnlySetData: SignerWithAddress,
      canOnlyCall;

    let permissionArrayKeys: string[] = [];
    let permissionArrayValues: string[] = [];

    // Generate few bytes32 LSP1UniversalReceiverDelegate dataKeys
    let universalReceiverDelegateKey1,
      universalReceiverDelegateKey2,
      universalReceiverDelegateKey3,
      universalReceiverDelegateKey4;

    // Generate few addresses to be used as dataValue for LSP1 Keys
    let universalReceiverDelegateA,
      universalReceiverDelegateB,
      universalReceiverDelegateC,
      universalReceiverDelegateD;

    before(async () => {
      context = await buildContext();

      universalReceiverDelegateKey1 =
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(32)).substring(2, 42);

      universalReceiverDelegateKey2 =
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(32)).substring(2, 42);

      universalReceiverDelegateKey3 =
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(32)).substring(2, 42);

      universalReceiverDelegateKey4 =
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(32)).substring(2, 42);

      [
        universalReceiverDelegateA,
        universalReceiverDelegateB,
        universalReceiverDelegateC,
        universalReceiverDelegateD,
      ] = getRandomAddresses(4);

      canAddAndChangeUniversalReceiverDelegate = context.accounts[1];
      canOnlyAddUniversalReceiverDelegate = context.accounts[2];
      canOnlyChangeUniversalReceiverDelegate = context.accounts[3];
      canOnlySuperSetData = context.accounts[4];
      canOnlySetData = context.accounts[5];
      canOnlyCall = context.accounts[6];

      let permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canAddAndChangeUniversalReceiverDelegate.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyAddUniversalReceiverDelegate.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyChangeUniversalReceiverDelegate.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlySuperSetData.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlySetData.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
          canOnlySetData.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + canOnlyCall.address.substring(2),
      ];

      let permissionValues = [
        ALL_PERMISSIONS,
        combinePermissions(
          PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE,
          PERMISSIONS.CHANGEUNIVERSALRECEIVERDELEGATE,
        ),
        PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE,
        PERMISSIONS.CHANGEUNIVERSALRECEIVERDELEGATE,
        PERMISSIONS.SUPER_SETDATA,
        PERMISSIONS.SETDATA,
        encodeCompactBytesArray([
          // Adding the LSP1 Keys as AllowedERC725YDataKey to test if it break the behavior
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix,
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFirstKey')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyThirdKey')),
        ]),
        PERMISSIONS.CALL,
      ];

      permissionArrayKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000000',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000001',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000002',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000003',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000004',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000005',
        ERC725YDataKeys.LSP6['AddressPermissions[]'].index + '00000000000000000000000000000006',
      ];

      permissionArrayValues = [
        ethers.utils.hexZeroPad(ethers.utils.hexlify(7), 16),
        context.mainController.address,
        canAddAndChangeUniversalReceiverDelegate.address,
        canOnlyAddUniversalReceiverDelegate.address,
        canOnlyChangeUniversalReceiverDelegate.address,
        canOnlySuperSetData.address,
        canOnlySetData.address,
        canOnlyCall.address,
      ];

      permissionKeys = permissionKeys.concat(permissionArrayKeys);
      permissionValues = permissionValues.concat(permissionArrayValues);

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when setting one UniversalReceiverDelegate key', () => {
      describe('when caller is an address with ALL PERMISSIONS', () => {
        it('should be allowed to ADD a UniversalReceiverDelegate key', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to edit a UniversalReceiverDelegate key', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: universalReceiverDelegateB,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to remove a UniversalReceiverDelegate key set', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: '0x',
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });
      });

      describe('when caller is an address with ADD/CHANGE UniversalReceiverDelegate permission', () => {
        it('should be allowed to ADD a UniversalReceiverDelegate key', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey1,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager
            .connect(canAddAndChangeUniversalReceiverDelegate)
            .execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to edit a UniversalReceiverDelegate key', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey1,
            dataValue: universalReceiverDelegateB,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager
            .connect(canAddAndChangeUniversalReceiverDelegate)
            .execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to remove a UniversalReceiverDelegate key set', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey1,
            dataValue: '0x',
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager
            .connect(canAddAndChangeUniversalReceiverDelegate)
            .execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });
      });

      describe('when caller is an address with ADDUniversalReceiverDelegate permission', () => {
        it('should be allowed to ADD a UniversalReceiverDelegate key', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(canOnlyAddUniversalReceiverDelegate).execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it("should NOT be allowed to edit the UniversalReceiverDelegate key set even if it's setting existing data", async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(
            context.keyManager.connect(canOnlyAddUniversalReceiverDelegate).execute(payload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(
              canOnlyAddUniversalReceiverDelegate.address,
              'CHANGEUNIVERSALRECEIVERDELEGATE',
            );
        });

        it('should NOT be allowed to edit the UniversalReceiverDelegate key set', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: universalReceiverDelegateB,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(
            context.keyManager.connect(canOnlyAddUniversalReceiverDelegate).execute(payload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(
              canOnlyAddUniversalReceiverDelegate.address,
              'CHANGEUNIVERSALRECEIVERDELEGATE',
            );
        });

        it('should NOT be allowed to remove a UniversalReceiverDelegate key set', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: '0x',
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(
            context.keyManager.connect(canOnlyAddUniversalReceiverDelegate).execute(payload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(
              canOnlyAddUniversalReceiverDelegate.address,
              'CHANGEUNIVERSALRECEIVERDELEGATE',
            );
        });
      });

      describe('when caller is an address with CHANGEUniversalReceiverDelegate permission', () => {
        it('should NOT be allowed to ADD another UniversalReceiverDelegate key', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey1,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(
            context.keyManager.connect(canOnlyChangeUniversalReceiverDelegate).execute(payload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(
              canOnlyChangeUniversalReceiverDelegate.address,
              'ADDUNIVERSALRECEIVERDELEGATE',
            );
        });

        it('should be allowed to edit the UniversalReceiverDelegate key set', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: universalReceiverDelegateD,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(canOnlyChangeUniversalReceiverDelegate).execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);

          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to remove the UniversalReceiverDelegate key set', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: '0x',
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(canOnlyChangeUniversalReceiverDelegate).execute(payload);

          const result = await context.universalProfile.getData(payloadParam.dataKey);

          expect(result).to.equal(payloadParam.dataValue);
        });
      });

      describe('when caller is an address with SUPER_SETDATA permission', () => {
        before(async () => {
          // Adding a LSP1 data key by the owner to test if address with SUPER_SETDATA
          // can CHANGE its content
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: universalReceiverDelegateB,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);
        });
        it('should NOT be allowed to ADD another UniversalReceiverDelegate key', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey1,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlySuperSetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySuperSetData.address, 'ADDUNIVERSALRECEIVERDELEGATE');
        });

        it('should NOT be allowed to edit the UniversalReceiverDelegate key set', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: universalReceiverDelegateB,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlySuperSetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySuperSetData.address, 'CHANGEUNIVERSALRECEIVERDELEGATE');
        });

        it('should NOT be allowed to remove the UniversalReceiverDelegate key set', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: '0x',
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlySuperSetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySuperSetData.address, 'CHANGEUNIVERSALRECEIVERDELEGATE');
        });
      });

      describe('when caller is an address with SETDATA permission with LSP1URDPrefix as allowedKey', () => {
        before(async () => {
          // Adding a LSP1 data key by the owner to test if address with SETDATA
          // can CHANGE its content
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: universalReceiverDelegateB,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);
        });

        it('should NOT be allowed to ADD another UniversalReceiverDelegate key even when UniversalReceiverDelegate key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDUNIVERSALRECEIVERDELEGATE');
        });

        it('should NOT be allowed to edit UniversalReceiverDelegate key even when UniversalReceiverDelegate key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'CHANGEUNIVERSALRECEIVERDELEGATE');
        });

        it('should NOT be allowed to remove the UniversalReceiverDelegate key set even when UniversalReceiverDelegate key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: '0x',
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlySetData).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'CHANGEUNIVERSALRECEIVERDELEGATE');
        });
      });

      describe('when caller is an address with CALL permission (Without SETDATA)', () => {
        before(async () => {
          // Adding a LSP1 data key by the owner to test if address with CALL
          // can CHANGE its content
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: universalReceiverDelegateB,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);
        });

        it('should NOT be allowed to ADD another UniversalReceiverDelegate key', async () => {
          const payloadParam = {
            dataKey: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlyCall).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyCall.address, 'ADDUNIVERSALRECEIVERDELEGATE');
        });

        it('should NOT be allowed to edit UniversalReceiverDelegate key even when UniversalReceiverDelegate key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: universalReceiverDelegateA,
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlyCall).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyCall.address, 'CHANGEUNIVERSALRECEIVERDELEGATE');
        });

        it('should NOT be allowed to remove the UniversalReceiverDelegate key set even when UniversalReceiverDelegate key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: universalReceiverDelegateKey2,
            dataValue: '0x',
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setData', [
            payloadParam.dataKey,
            payloadParam.dataValue,
          ]);

          await expect(context.keyManager.connect(canOnlyCall).execute(payload))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyCall.address, 'CHANGEUNIVERSALRECEIVERDELEGATE');
        });
      });
    });

    describe('when setting mixed keys (UniversalReceiverDelegate + AddressPermission + ERC725Y Data Key)', () => {
      describe('when caller is an address with ALL PERMISSIONS', () => {
        it('should be allowed to ADD a UniversalReceiverDelegate, AddressPermission and ERC725Y Data Key', async () => {
          const payloadParam = {
            dataKeys: [
              ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
              ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
            ],
            dataValues: [
              universalReceiverDelegateA,
              ethers.utils.hexZeroPad(ethers.utils.hexlify(7), 16),
              '0xaabbccdd',
            ],
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            payloadParam.dataKeys,
            payloadParam.dataValues,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

          expect(result).to.deep.equal(payloadParam.dataValues);
        });

        it('should be allowed to edit a UniversalReceiverDelegate Key already set and add new AddressPermission and ERC725Y Data Key ', async () => {
          const payloadParam = {
            dataKeys: [
              ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
              ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
            ],
            dataValues: [
              universalReceiverDelegateB,
              ethers.utils.hexZeroPad(ethers.utils.hexlify(8), 16),
              '0xaabb',
            ],
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            payloadParam.dataKeys,
            payloadParam.dataValues,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

          expect(result).to.deep.equal(payloadParam.dataValues);
        });

        it('should be allowed to remove a UniversalReceiverDelegate Key already set and add new AddressPermission and ERC725Y Data Key ', async () => {
          const payloadParam = {
            dataKeys: [
              ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
              ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
            ],
            dataValues: ['0x', ethers.utils.hexZeroPad(ethers.utils.hexlify(7), 16), '0x'],
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            payloadParam.dataKeys,
            payloadParam.dataValues,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);

          const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

          expect(result).to.deep.equal(payloadParam.dataValues);
        });
      });

      describe('when caller is an address with ADD/CHANGE UniversalReceiverDelegate permission ', () => {
        describe('when adding a UniversalReceiverDelegate, AddressPermission and ERC725Y Data Key', () => {
          it("should revert because of caller don't have EDITPERMISSIONS Permission", async () => {
            const payloadParam = {
              dataKeys: [
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [
                universalReceiverDelegateA,
                ethers.utils.hexZeroPad(ethers.utils.hexlify(7), 16),
                '0xaabbccdd',
              ],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(
              context.keyManager.connect(canAddAndChangeUniversalReceiverDelegate).execute(payload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canAddAndChangeUniversalReceiverDelegate.address, 'EDITPERMISSIONS');
          });
        });

        describe('when adding a UniversalReceiverDelegate and ERC725Y Data Key', () => {
          it("should revert because of caller don't have SETDATA Permission", async () => {
            const payloadParam = {
              dataKeys: [
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [universalReceiverDelegateA, '0xaabbccdd'],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(
              context.keyManager.connect(canAddAndChangeUniversalReceiverDelegate).execute(payload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canAddAndChangeUniversalReceiverDelegate.address, 'SETDATA');
          });
        });

        describe('when adding and changing in same tx UniversalReceiverDelegate', () => {
          it('should pass', async () => {
            const payloadParam = {
              dataKeys: [
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
              ],
              dataValues: [universalReceiverDelegateA, universalReceiverDelegateB],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await context.keyManager
              .connect(canAddAndChangeUniversalReceiverDelegate)
              .execute(payload);

            const [result] = await context.universalProfile.getDataBatch([
              payloadParam.dataKeys[0],
            ]);

            expect(result).to.equal(payloadParam.dataValues[1]);
          });
        });
      });

      describe('when caller is an address with ADD UniversalReceiverDelegate permission ', () => {
        before(async () => {
          // Nullfying the value of UniversalReceiverDelegate keys to test that we cannot add them
          const payloadParam = {
            dataKeys: [universalReceiverDelegateKey1, universalReceiverDelegateKey2],
            dataValues: ['0x', '0x'],
          };

          const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
            payloadParam.dataKeys,
            payloadParam.dataValues,
          ]);

          await context.keyManager.connect(context.mainController).execute(payload);
        });
        describe('when adding multiple UniversalReceiverDelegate keys', () => {
          it('should pass', async () => {
            const payloadParam = {
              dataKeys: [universalReceiverDelegateKey1, universalReceiverDelegateKey2],
              dataValues: [universalReceiverDelegateA, universalReceiverDelegateB],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await context.keyManager.connect(canOnlyAddUniversalReceiverDelegate).execute(payload);

            const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

            expect(result).to.deep.equal(payloadParam.dataValues);
          });
        });

        describe('when adding and changing UniversalReceiverDelegate keys in 1 tx ', () => {
          it("should revert because caller don't have CHANGE UniversalReceiverDelegate permission", async () => {
            const payloadParam = {
              dataKeys: [universalReceiverDelegateKey3, universalReceiverDelegateKey1],
              dataValues: [universalReceiverDelegateC, universalReceiverDelegateD],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(
              context.keyManager.connect(canOnlyAddUniversalReceiverDelegate).execute(payload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(
                canOnlyAddUniversalReceiverDelegate.address,
                'CHANGEUNIVERSALRECEIVERDELEGATE',
              );
          });
        });

        describe('when adding a UniversalReceiverDelegate and ERC725Y Data Key', () => {
          it("should revert because of caller don't have SETDATA Permission", async () => {
            const payloadParam = {
              dataKeys: [
                universalReceiverDelegateKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [universalReceiverDelegateA, '0xaabbccdd'],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(
              context.keyManager.connect(canOnlyAddUniversalReceiverDelegate).execute(payload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddUniversalReceiverDelegate.address, 'SETDATA');
          });
        });
      });

      describe('when caller is an address with CHANGE UniversalReceiverDelegate permission ', () => {
        describe('when changing multiple UniversalReceiverDelegate keys', () => {
          it('should pass', async () => {
            const payloadParam = {
              dataKeys: [
                // All these keys have their values set in previous tests
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                universalReceiverDelegateKey1,
                universalReceiverDelegateKey2,
              ],
              dataValues: [
                universalReceiverDelegateA,
                universalReceiverDelegateB,
                universalReceiverDelegateC,
              ],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await context.keyManager
              .connect(canOnlyChangeUniversalReceiverDelegate)
              .execute(payload);

            const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

            expect(result).to.deep.equal(payloadParam.dataValues);
          });
        });

        describe('when changing multiple UniversalReceiverDelegate keys with adding ERC725Y Data Key', () => {
          it("should revert because caller don't have SETDATA permission", async () => {
            const payloadParam = {
              dataKeys: [
                // All these keys have their values set in previous tests
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                universalReceiverDelegateKey1,
                universalReceiverDelegateKey2,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [
                universalReceiverDelegateA,
                universalReceiverDelegateB,
                universalReceiverDelegateC,
                '0xaabbccdd',
              ],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(
              context.keyManager.connect(canOnlyChangeUniversalReceiverDelegate).execute(payload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyChangeUniversalReceiverDelegate.address, 'SETDATA');
          });
        });

        describe('when changing multiple UniversalReceiverDelegate keys with adding a UniversalReceiverDelegate Key', () => {
          it("should revert because caller don't have ADDUniversalReceiverDelegate permission", async () => {
            const payloadParam = {
              dataKeys: [
                // All these keys have their values set in previous tests
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                universalReceiverDelegateKey1,
                universalReceiverDelegateKey2,
                // UniversalReceiverDelegate key to ADD
                universalReceiverDelegateKey4,
              ],
              dataValues: [
                universalReceiverDelegateA,
                universalReceiverDelegateB,
                universalReceiverDelegateC,
                universalReceiverDelegateD,
              ],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(
              context.keyManager.connect(canOnlyChangeUniversalReceiverDelegate).execute(payload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(
                canOnlyChangeUniversalReceiverDelegate.address,
                'ADDUNIVERSALRECEIVERDELEGATE',
              );
          });
        });

        describe('when changing (removing) multiple UniversalReceiverDelegate keys', () => {
          it('should pass', async () => {
            const payloadParam = {
              dataKeys: [
                // All these keys have their values set in previous tests
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                universalReceiverDelegateKey1,
                universalReceiverDelegateKey2,
              ],
              dataValues: ['0x', '0x', '0x'],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await context.keyManager
              .connect(canOnlyChangeUniversalReceiverDelegate)
              .execute(payload);

            const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

            expect(result).to.deep.equal(payloadParam.dataValues);
          });
        });

        describe('when adding UniversalReceiverDelegate keys ', () => {
          it("should revert because caller don't have ADD UniversalReceiverDelegate permission", async () => {
            const payloadParam = {
              dataKeys: [universalReceiverDelegateKey1, universalReceiverDelegateKey2],
              dataValues: [universalReceiverDelegateC, universalReceiverDelegateD],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(
              context.keyManager.connect(canOnlyChangeUniversalReceiverDelegate).execute(payload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(
                canOnlyChangeUniversalReceiverDelegate.address,
                'ADDUNIVERSALRECEIVERDELEGATE',
              );
          });
        });

        describe('when adding a UniversalReceiverDelegate and ERC725Y Data Key', () => {
          it("should revert because of caller don't have SETDATA Permission", async () => {
            const payloadParam = {
              dataKeys: [
                universalReceiverDelegateKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [universalReceiverDelegateA, '0xaabbccdd'],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(
              context.keyManager.connect(canOnlyAddUniversalReceiverDelegate).execute(payload),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddUniversalReceiverDelegate.address, 'SETDATA');
          });
        });
      });

      describe('when caller is an address with SUPER SETDATA permission ', () => {
        describe('when adding UniversalReceiverDelegate keys ', () => {
          it("should revert because caller don't have ADD UniversalReceiverDelegate permission", async () => {
            const payloadParam = {
              dataKeys: [universalReceiverDelegateKey1, universalReceiverDelegateKey2],
              dataValues: [universalReceiverDelegateC, universalReceiverDelegateD],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(context.keyManager.connect(canOnlySuperSetData).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySuperSetData.address, 'ADDUNIVERSALRECEIVERDELEGATE');
          });
        });
        describe('when Adding multiple UniversalReceiverDelegate keys with adding ERC725Y Data Key', () => {
          it("should revert because caller don't have ADDUniversalReceiverDelegate permission", async () => {
            const payloadParam = {
              dataKeys: [
                universalReceiverDelegateKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [universalReceiverDelegateA, '0xaabbccdd'],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(context.keyManager.connect(canOnlySuperSetData).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySuperSetData.address, 'ADDUNIVERSALRECEIVERDELEGATE');
          });
        });
      });

      describe('when caller is an address with SETDATA permission with UniversalReceiverDelegate keys as AllowedERC725YDataKeys ', () => {
        describe('when adding UniversalReceiverDelegate keys ', () => {
          it("should revert because caller don't have ADD UniversalReceiverDelegate permission and UniversalReceiverDelegate keys are not part of AllowedERC725YDataKeys", async () => {
            const payloadParam = {
              dataKeys: [
                ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
                universalReceiverDelegateKey2,
              ],
              dataValues: [universalReceiverDelegateC, universalReceiverDelegateD],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(context.keyManager.connect(canOnlySetData).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'ADDUNIVERSALRECEIVERDELEGATE');
          });
        });

        describe('when Adding multiple UniversalReceiverDelegate keys with adding other allowedERC725YDataKey', () => {
          it("should revert because caller don't have ADDUniversalReceiverDelegate permission", async () => {
            const payloadParam = {
              dataKeys: [
                universalReceiverDelegateKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [universalReceiverDelegateA, '0xaabbccdd'],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await expect(context.keyManager.connect(canOnlySetData).execute(payload))
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'ADDUNIVERSALRECEIVERDELEGATE');
          });
        });

        describe('When granting the caller ADDUniversalReceiverDelegate permission', () => {
          before(async () => {
            const payloadParam = {
              dataKeys: [
                ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                  canOnlySetData.address.substring(2),
              ],
              dataValues: [
                combinePermissions(PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE, PERMISSIONS.SETDATA),
              ],
            };

            const payload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
              payloadParam.dataKeys,
              payloadParam.dataValues,
            ]);

            await context.keyManager.connect(context.mainController).execute(payload);
          });
          describe('When adding UniversalReceiverDelegate key and one of his allowedERC725Y Data Key', () => {
            it('should pass', async () => {
              const payloadParam = {
                dataKeys: [
                  universalReceiverDelegateKey4,
                  ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFirstKey')),
                ],
                dataValues: [universalReceiverDelegateA, '0xaabbccdd'],
              };

              const payload = context.universalProfile.interface.encodeFunctionData(
                'setDataBatch',
                [payloadParam.dataKeys, payloadParam.dataValues],
              );

              await context.keyManager.connect(canOnlySetData).execute(payload);

              const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

              expect(result).to.deep.equal(payloadParam.dataValues);
            });
          });
        });
      });
    });
  });
};
