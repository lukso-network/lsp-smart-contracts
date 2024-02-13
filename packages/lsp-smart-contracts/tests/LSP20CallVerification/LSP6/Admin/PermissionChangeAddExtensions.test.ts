import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// constants
import { ERC725YDataKeys, ALL_PERMISSIONS, PERMISSIONS } from '../../../../constants';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import {
  combinePermissions,
  encodeCompactBytesArray,
  getRandomAddresses,
} from '../../../utils/helpers';

export const shouldBehaveLikePermissionChangeOrAddExtensions = (
  buildContext: () => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  describe('setting Extension Handler keys (CHANGE vs ADD)', () => {
    let canAddAndChangeExtensions: SignerWithAddress,
      canOnlyAddExtensions: SignerWithAddress,
      canOnlyChangeExtensions: SignerWithAddress,
      canOnlySuperSetData: SignerWithAddress,
      canOnlySetData: SignerWithAddress,
      canOnlyCall;

    let permissionArrayKeys: string[] = [];
    let permissionArrayValues: string[] = [];

    // Generate few bytes32 Extension Handler dataKeys
    let extensionHandlerKey1,
      extensionHandlerKey2,
      extensionHandlerKey3,
      extensionHandlerKey4,
      extensionHandlerKey5;

    // Generate few addresses to be used as dataValue for Extension Handler dataKeys
    let extensionA, extensionB, extensionC, extensionD;

    before(async () => {
      context = await buildContext();

      extensionHandlerKey1 =
        ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(4)).substring(2) + // function selector
        '00000000000000000000000000000000'; // zero padded

      extensionHandlerKey2 =
        ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(4)).substring(2) + // function selector
        '00000000000000000000000000000000'; // zero padded

      extensionHandlerKey3 =
        ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(4)).substring(2) + // function selector
        '00000000000000000000000000000000'; // zero padded

      extensionHandlerKey4 =
        ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(4)).substring(2) + // function selector
        '00000000000000000000000000000000'; // zero padded

      extensionHandlerKey5 =
        ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
        ethers.utils.hexlify(ethers.utils.randomBytes(4)).substring(2) + // function selector
        '00000000000000000000000000000000'; // zero padded

      [extensionA, extensionB, extensionC, extensionD] = getRandomAddresses(4);

      canAddAndChangeExtensions = context.accounts[1];
      canOnlyAddExtensions = context.accounts[2];
      canOnlyChangeExtensions = context.accounts[3];
      canOnlySuperSetData = context.accounts[4];
      canOnlySetData = context.accounts[5];
      canOnlyCall = context.accounts[6];

      let permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canAddAndChangeExtensions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyAddExtensions.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canOnlyChangeExtensions.address.substring(2),
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
        combinePermissions(PERMISSIONS.ADDEXTENSIONS, PERMISSIONS.CHANGEEXTENSIONS),
        PERMISSIONS.ADDEXTENSIONS,
        PERMISSIONS.CHANGEEXTENSIONS,
        PERMISSIONS.SUPER_SETDATA,
        PERMISSIONS.SETDATA,
        encodeCompactBytesArray([
          // Adding the Extension Handler Keys as AllowedERC725YDataKey to test if it break the behavior
          ERC725YDataKeys.LSP17.LSP17ExtensionPrefix,
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
        canAddAndChangeExtensions.address,
        canOnlyAddExtensions.address,
        canOnlyChangeExtensions.address,
        canOnlySuperSetData.address,
        canOnlySetData.address,
        canOnlyCall.address,
      ];

      permissionKeys = permissionKeys.concat(permissionArrayKeys);
      permissionValues = permissionValues.concat(permissionArrayValues);

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when setting one ExtensionHandler key', () => {
      describe('when caller is an address with ALL PERMISSIONS', () => {
        it('should be allowed to ADD a ExtensionHandler key', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: extensionA,
          };

          await context.universalProfile
            .connect(context.mainController)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to edit a ExtensionHandler key', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: extensionB,
          };

          await context.universalProfile
            .connect(context.mainController)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to remove a ExtensionHandler key set', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: '0x',
          };

          await context.universalProfile
            .connect(context.mainController)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });
      });

      describe('when caller is an address with ADD/CHANGE Extensions permission', () => {
        it('should be allowed to ADD a ExtensionHandler key', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey1,
            dataValue: extensionA,
          };

          await context.universalProfile
            .connect(canAddAndChangeExtensions)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to edit a ExtensionHandler key', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey1,
            dataValue: extensionB,
          };

          await context.universalProfile
            .connect(canAddAndChangeExtensions)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to remove a ExtensionHandler key set', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey1,
            dataValue: '0x',
          };

          await context.universalProfile
            .connect(canAddAndChangeExtensions)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });
      });

      describe('when caller is an address with ADDExtensions permission', () => {
        it('should be allowed to ADD a ExtensionHandler key', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: extensionA,
          };

          await context.universalProfile
            .connect(canOnlyAddExtensions)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);
          expect(result).to.equal(payloadParam.dataValue);
        });

        it("should NOT be allowed to edit the ExtensionHandler key set even if it's setting existing data", async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: extensionA,
          };

          await expect(
            context.universalProfile
              .connect(canOnlyAddExtensions)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddExtensions.address, 'CHANGEEXTENSIONS');
        });

        it('should NOT be allowed to edit the ExtensionHandler key set', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: extensionB,
          };

          await expect(
            context.universalProfile
              .connect(canOnlyAddExtensions)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddExtensions.address, 'CHANGEEXTENSIONS');
        });

        it('should NOT be allowed to remove a ExtensionHandler key set', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: '0x',
          };

          await expect(
            context.universalProfile
              .connect(canOnlyAddExtensions)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyAddExtensions.address, 'CHANGEEXTENSIONS');
        });
      });

      describe('when caller is an address with CHANGEExtensions permission', () => {
        it('should NOT be allowed to ADD another ExtensionHandler key', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey1,
            dataValue: extensionA,
          };

          await expect(
            context.universalProfile
              .connect(canOnlyChangeExtensions)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyChangeExtensions.address, 'ADDEXTENSIONS');
        });

        it('should be allowed to edit the ExtensionHandler key set', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: extensionD,
          };

          await context.universalProfile
            .connect(canOnlyChangeExtensions)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);

          expect(result).to.equal(payloadParam.dataValue);
        });

        it('should be allowed to remove the ExtensionHandler key set', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: '0x',
          };

          await context.universalProfile
            .connect(canOnlyChangeExtensions)
            .setData(payloadParam.dataKey, payloadParam.dataValue);

          const result = await context.universalProfile.getData(payloadParam.dataKey);

          expect(result).to.equal(payloadParam.dataValue);
        });
      });

      describe('when caller is an address with SUPER_SETDATA permission', () => {
        before(async () => {
          // Adding am extensionHandler data key by the owner to test if address with SUPER_SETDATA
          // can CHANGE its content
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: extensionB,
          };

          await context.universalProfile
            .connect(context.mainController)
            .setData(payloadParam.dataKey, payloadParam.dataValue);
        });
        it('should NOT be allowed to ADD another ExtensionHandler key', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey1,
            dataValue: extensionA,
          };

          await expect(
            context.universalProfile
              .connect(canOnlySuperSetData)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySuperSetData.address, 'ADDEXTENSIONS');
        });

        it('should NOT be allowed to edit the ExtensionHandler key set', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: extensionB,
          };

          await expect(
            context.universalProfile
              .connect(canOnlySuperSetData)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySuperSetData.address, 'CHANGEEXTENSIONS');
        });

        it('should NOT be allowed to remove the ExtensionHandler key set', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: '0x',
          };

          await expect(
            context.universalProfile
              .connect(canOnlySuperSetData)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySuperSetData.address, 'CHANGEEXTENSIONS');
        });
      });

      describe('when caller is an address with SETDATA permission with LSP0_EXTENSIONSHANDLER_Prefix as allowedKey', () => {
        before(async () => {
          // Adding an extensionHandler data key by the owner to test if address with SETDATA
          // can CHANGE its content
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: extensionB,
          };

          await context.universalProfile
            .connect(context.mainController)
            .setData(payloadParam.dataKey, payloadParam.dataValue);
        });

        it('should NOT be allowed to ADD another ExtensionHandler key even when ExtensionHandler key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: extensionA,
          };

          await expect(
            context.universalProfile
              .connect(canOnlySetData)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'ADDEXTENSIONS');
        });

        it('should NOT be allowed to edit ExtensionHandler key even when ExtensionHandler key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: extensionA,
          };

          await expect(
            context.universalProfile
              .connect(canOnlySetData)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'CHANGEEXTENSIONS');
        });

        it('should NOT be allowed to remove the ExtensionHandler key set even when ExtensionHandler key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: '0x',
          };

          await expect(
            context.universalProfile
              .connect(canOnlySetData)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlySetData.address, 'CHANGEEXTENSIONS');
        });
      });

      describe('when caller is an address with CALL permission (Without SETDATA)', () => {
        before(async () => {
          // Adding an extensionHandler data key by the owner to test if address with CALL
          // can CHANGE its content
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: extensionB,
          };

          await context.universalProfile
            .connect(context.mainController)
            .setData(payloadParam.dataKey, payloadParam.dataValue);
        });

        it('should NOT be allowed to ADD another ExtensionHandler key', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey5,
            dataValue: extensionA,
          };

          await expect(
            context.universalProfile
              .connect(canOnlyCall)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyCall.address, 'ADDEXTENSIONS');
        });

        it('should NOT be allowed to edit ExtensionHandler key even when ExtensionHandler key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: extensionA,
          };

          await expect(
            context.universalProfile
              .connect(canOnlyCall)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyCall.address, 'CHANGEEXTENSIONS');
        });

        it('should NOT be allowed to remove the ExtensionHandler key set even when ExtensionHandler key is allowed in AllowedERC725YDataKey', async () => {
          const payloadParam = {
            dataKey: extensionHandlerKey2,
            dataValue: '0x',
          };

          await expect(
            context.universalProfile
              .connect(canOnlyCall)
              .setData(payloadParam.dataKey, payloadParam.dataValue),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canOnlyCall.address, 'CHANGEEXTENSIONS');
        });
      });
    });

    describe('when setting mixed keys (ExtensionHandler + AddressPermission + ERC725Y Data Key)', () => {
      describe('when caller is an address with ALL PERMISSIONS', () => {
        it('should be allowed to ADD a ExtensionHandler, AddressPermission and ERC725Y Data Key', async () => {
          const payloadParam = {
            dataKeys: [
              extensionHandlerKey5,
              ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
            ],
            dataValues: [
              extensionA,
              ethers.utils.hexZeroPad(ethers.utils.hexlify(7), 16),
              '0xaabbccdd',
            ],
          };

          await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);

          const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

          expect(result).to.deep.equal(payloadParam.dataValues);
        });

        it('should be allowed to edit a ExtensionHandler key already set and add new AddressPermission and ERC725Y Data Key ', async () => {
          const payloadParam = {
            dataKeys: [
              extensionHandlerKey5,
              ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
            ],
            dataValues: [
              extensionB,
              ethers.utils.hexZeroPad(ethers.utils.hexlify(8), 16),
              '0xaabb',
            ],
          };

          await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);

          const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

          expect(result).to.deep.equal(payloadParam.dataValues);
        });

        it('should be allowed to remove a ExtensionHandler key already set and add new AddressPermission and ERC725Y Data Key ', async () => {
          const payloadParam = {
            dataKeys: [
              extensionHandlerKey5,
              ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
            ],
            dataValues: ['0x', ethers.utils.hexZeroPad(ethers.utils.hexlify(7), 16), '0x'],
          };

          await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);

          const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

          expect(result).to.deep.equal(payloadParam.dataValues);
        });
      });

      describe('when caller is an address with ADD/CHANGE Extensions permission ', () => {
        describe('when adding a ExtensionHandler, AddressPermission and ERC725Y Data Key', () => {
          it("should revert because of caller don't have EDITPERMISSIONS Permission", async () => {
            const payloadParam = {
              dataKeys: [
                extensionHandlerKey5,
                ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [
                extensionA,
                ethers.utils.hexZeroPad(ethers.utils.hexlify(7), 16),
                '0xaabbccdd',
              ],
            };

            await expect(
              context.universalProfile
                .connect(canAddAndChangeExtensions)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canAddAndChangeExtensions.address, 'EDITPERMISSIONS');
          });
        });

        describe('when adding a ExtensionHandler and ERC725Y Data Key', () => {
          it("should revert because of caller don't have SETDATA Permission", async () => {
            const payloadParam = {
              dataKeys: [
                extensionHandlerKey5,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [extensionA, '0xaabbccdd'],
            };

            await expect(
              context.universalProfile
                .connect(canAddAndChangeExtensions)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canAddAndChangeExtensions.address, 'SETDATA');
          });
        });

        describe('when adding and changing in same tx ExtensionHandler', () => {
          it('should pass', async () => {
            const payloadParam = {
              dataKeys: [extensionHandlerKey5, extensionHandlerKey5],
              dataValues: [extensionA, extensionB],
            };

            await context.universalProfile
              .connect(canAddAndChangeExtensions)
              .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);

            const [result] = await context.universalProfile.getDataBatch([
              payloadParam.dataKeys[0],
            ]);

            expect(result).to.equal(payloadParam.dataValues[1]);
          });
        });
      });

      describe('when caller is an address with ADD Extensions permission ', () => {
        before(async () => {
          // Nullfying the value of ExtensionHandler keys to test that we cannot add them
          const payloadParam = {
            dataKeys: [extensionHandlerKey1, extensionHandlerKey2],
            dataValues: ['0x', '0x'],
          };

          await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);
        });
        describe('when adding multiple ExtensionHandler keys', () => {
          it('should pass', async () => {
            const payloadParam = {
              dataKeys: [extensionHandlerKey1, extensionHandlerKey2],
              dataValues: [extensionA, extensionB],
            };

            await context.universalProfile
              .connect(canOnlyAddExtensions)
              .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);

            const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

            expect(result).to.deep.equal(payloadParam.dataValues);
          });
        });

        describe('when adding and changing ExtensionHandler keys in 1 tx ', () => {
          it("should revert because caller don't have CHANGE Extensions permission", async () => {
            const payloadParam = {
              dataKeys: [extensionHandlerKey3, extensionHandlerKey1],
              dataValues: [extensionC, extensionD],
            };

            await expect(
              context.universalProfile
                .connect(canOnlyAddExtensions)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddExtensions.address, 'CHANGEEXTENSIONS');
          });
        });

        describe('when adding a ExtensionHandler and ERC725Y Data Key', () => {
          it("should revert because of caller don't have SETDATA Permission", async () => {
            const payloadParam = {
              dataKeys: [
                extensionHandlerKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [extensionA, '0xaabbccdd'],
            };

            await expect(
              context.universalProfile
                .connect(canOnlyAddExtensions)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddExtensions.address, 'SETDATA');
          });
        });
      });

      describe('when caller is an address with CHANGE Extensions permission ', () => {
        describe('when changing multiple ExtensionHandler keys', () => {
          it('should pass', async () => {
            const payloadParam = {
              dataKeys: [
                // All these keys have their values set in previous tests
                extensionHandlerKey5,
                extensionHandlerKey1,
                extensionHandlerKey2,
              ],
              dataValues: [extensionA, extensionB, extensionC],
            };

            await context.universalProfile
              .connect(canOnlyChangeExtensions)
              .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);

            const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

            expect(result).to.deep.equal(payloadParam.dataValues);
          });
        });

        describe('when changing multiple ExtensionHandler keys with adding ERC725Y Data Key', () => {
          it("should revert because caller don't have SETDATA permission", async () => {
            const payloadParam = {
              dataKeys: [
                // All these keys have their values set in previous tests
                extensionHandlerKey5,
                extensionHandlerKey1,
                extensionHandlerKey2,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [extensionA, extensionB, extensionC, '0xaabbccdd'],
            };

            await expect(
              context.universalProfile
                .connect(canOnlyChangeExtensions)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyChangeExtensions.address, 'SETDATA');
          });
        });

        describe('when changing multiple ExtensionHandler keys with adding a ExtensionHandler key', () => {
          it("should revert because caller don't have ADDExtensions permission", async () => {
            const payloadParam = {
              dataKeys: [
                // All these keys have their values set in previous tests
                extensionHandlerKey5,
                extensionHandlerKey1,
                extensionHandlerKey2,
                // ExtensionHandler key to ADD
                extensionHandlerKey4,
              ],
              dataValues: [extensionA, extensionB, extensionC, extensionD],
            };

            await expect(
              context.universalProfile
                .connect(canOnlyChangeExtensions)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyChangeExtensions.address, 'ADDEXTENSIONS');
          });
        });

        describe('when changing (removing) multiple ExtensionHandler keys', () => {
          it('should pass', async () => {
            const payloadParam = {
              dataKeys: [
                // All these keys have their values set in previous tests
                extensionHandlerKey5,
                extensionHandlerKey1,
                extensionHandlerKey2,
              ],
              dataValues: ['0x', '0x', '0x'],
            };

            await context.universalProfile
              .connect(canOnlyChangeExtensions)
              .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);

            const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

            expect(result).to.deep.equal(payloadParam.dataValues);
          });
        });

        describe('when adding ExtensionHandler keys ', () => {
          it("should revert because caller don't have ADD Extensions permission", async () => {
            const payloadParam = {
              dataKeys: [extensionHandlerKey1, extensionHandlerKey2],
              dataValues: [extensionC, extensionD],
            };

            await expect(
              context.universalProfile
                .connect(canOnlyChangeExtensions)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyChangeExtensions.address, 'ADDEXTENSIONS');
          });
        });

        describe('when adding a ExtensionHandler and ERC725Y Data Key', () => {
          it("should revert because of caller don't have SETDATA Permission", async () => {
            const payloadParam = {
              dataKeys: [
                extensionHandlerKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [extensionA, '0xaabbccdd'],
            };

            await expect(
              context.universalProfile
                .connect(canOnlyAddExtensions)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlyAddExtensions.address, 'SETDATA');
          });
        });
      });

      describe('when caller is an address with SUPER SETDATA permission ', () => {
        describe('when adding ExtensionHandler keys ', () => {
          it("should revert because caller don't have ADD Extensions permission", async () => {
            const payloadParam = {
              dataKeys: [extensionHandlerKey1, extensionHandlerKey2],
              dataValues: [extensionC, extensionD],
            };

            await expect(
              context.universalProfile
                .connect(canOnlySuperSetData)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySuperSetData.address, 'ADDEXTENSIONS');
          });
        });
        describe('when Adding multiple ExtensionHandler keys with adding ERC725Y Data Key', () => {
          it("should revert because caller don't have ADDExtensions permission", async () => {
            const payloadParam = {
              dataKeys: [
                extensionHandlerKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [extensionA, '0xaabbccdd'],
            };

            await expect(
              context.universalProfile
                .connect(canOnlySuperSetData)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySuperSetData.address, 'ADDEXTENSIONS');
          });
        });
      });

      describe('when caller is an address with SETDATA permission with ExtensionHandler keys as AllowedERC725YDataKeys ', () => {
        describe('when adding ExtensionHandler keys ', () => {
          it("should revert because caller don't have ADD Extensions permission and ExtensionHandler keys are not part of AllowedERC725YDataKeys", async () => {
            const payloadParam = {
              dataKeys: [extensionHandlerKey5, extensionHandlerKey2],
              dataValues: [extensionC, extensionD],
            };

            await expect(
              context.universalProfile
                .connect(canOnlySetData)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'ADDEXTENSIONS');
          });
        });

        describe('when Adding multiple ExtensionHandler keys with adding other allowedERC725YDataKey', () => {
          it("should revert because caller don't have ADDExtensions permission", async () => {
            const payloadParam = {
              dataKeys: [
                extensionHandlerKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyKey')),
              ],
              dataValues: [extensionA, '0xaabbccdd'],
            };

            await expect(
              context.universalProfile
                .connect(canOnlySetData)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canOnlySetData.address, 'ADDEXTENSIONS');
          });
        });

        describe('When granting the caller ADDExtensions permission', () => {
          before(async () => {
            const payloadParam = {
              dataKeys: [
                ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                  canOnlySetData.address.substring(2),
              ],
              dataValues: [combinePermissions(PERMISSIONS.ADDEXTENSIONS, PERMISSIONS.SETDATA)],
            };

            await context.universalProfile
              .connect(context.mainController)
              .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);
          });
          describe('When adding ExtensionHandler key and one of his allowedERC725Y Data Key', () => {
            it('should pass', async () => {
              const payloadParam = {
                dataKeys: [
                  extensionHandlerKey4,
                  ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFirstKey')),
                ],
                dataValues: [extensionA, '0xaabbccdd'],
              };

              await context.universalProfile
                .connect(canOnlySetData)
                .setDataBatch(payloadParam.dataKeys, payloadParam.dataValues);

              const result = await context.universalProfile.getDataBatch(payloadParam.dataKeys);

              expect(result).to.deep.equal(payloadParam.dataValues);
            });
          });
        });
      });
    });

    describe('when setting random bytes under the LSP17Extension data key ', () => {
      it('should be allowed to set a 20 bytes long address', async () => {
        const key =
          ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
          ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);
        const value = ethers.Wallet.createRandom().address.toLowerCase();

        await context.universalProfile.connect(context.mainController).setData(key, value);

        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      it('should be allowed to set a 21 bytes long address', async () => {
        const key =
          ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
          ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);
        const value = ethers.Wallet.createRandom().address.toLowerCase() + '00';

        await context.universalProfile.connect(context.mainController).setData(key, value);

        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });

      it('should revert when setting a random 10 bytes value', async () => {
        const key =
          ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
          ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);
        const randomValue = '0xcafecafecafecafecafe';

        await expect(
          context.universalProfile.connect(context.mainController).setData(key, randomValue),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
          .withArgs(key, randomValue);
      });

      it('should revert when setting a random 30 bytes value', async () => {
        const key =
          ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
          ethers.utils.hexlify(ethers.utils.randomBytes(20)).substring(2);
        const randomValue = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

        await expect(
          context.universalProfile.connect(context.mainController).setData(key, randomValue),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'InvalidDataValuesForDataKeys')
          .withArgs(key, randomValue);
      });
    });
  });
};
