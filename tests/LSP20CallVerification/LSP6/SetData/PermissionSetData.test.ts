import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { encodeData, ERC725JSONSchema } from '@erc725/erc725.js';

import { ExecutorLSP20, ExecutorLSP20__factory } from '../../../../types';

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  OPERATION_TYPES,
} from '../../../../constants';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import {
  getRandomAddresses,
  combinePermissions,
  encodeCompactBytesArray,
} from '../../../utils/helpers';

const BasicUPSetup_Schema: ERC725JSONSchema[] = [
  {
    name: 'LSP3Profile',
    key: ERC725YDataKeys.LSP3['LSP3Profile'],
    keyType: 'Singleton',
    valueContent: 'JSONURL',
    valueType: 'bytes',
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
    keyType: 'Singleton',
    valueContent: 'Address',
    valueType: 'address',
  },
  {
    name: 'LSP12IssuedAssets[]',
    key: ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].length,
    keyType: 'Array',
    valueContent: 'Number',
    valueType: 'uint256',
  },
];

export const shouldBehaveLikePermissionSetData = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  describe('when caller is an EOA', () => {
    let canSetDataWithAllowedERC725YDataKeys: SignerWithAddress,
      canSetDataWithoutAllowedERC725YDataKeys: SignerWithAddress,
      cannotSetData: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canSetDataWithAllowedERC725YDataKeys = context.accounts[1];
      canSetDataWithoutAllowedERC725YDataKeys = context.accounts[2];
      cannotSetData = context.accounts[3];

      const permissionsKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canSetDataWithAllowedERC725YDataKeys.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
          canSetDataWithAllowedERC725YDataKeys.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canSetDataWithoutAllowedERC725YDataKeys.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + cannotSetData.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.CALL),
        encodeCompactBytesArray([
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
          ERC725YDataKeys.LSP3.LSP3Profile,
          ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index,
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFirstKey')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyThirdKey')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFourthKey')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFifthKey')),
        ]),
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.CALL),
        PERMISSIONS.CALL,
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe('when setting one key', () => {
      describe('For UP owner', () => {
        it('should pass', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key'));
          const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Hello Lukso!'));

          await context.universalProfile.connect(context.mainController).setData(key, value);

          const fetchedResult = await context.universalProfile.callStatic['getData(bytes32)'](key);
          expect(fetchedResult).to.equal(value);
        });
      });

      describe('For address that has permission SETDATA with AllowedERC725YDataKeys', () => {
        it('should pass', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key'));
          const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Hello Lukso!'));

          await context.universalProfile
            .connect(canSetDataWithAllowedERC725YDataKeys)
            .setData(key, value);
          const fetchedResult = await context.universalProfile.callStatic['getData(bytes32)'](key);
          expect(fetchedResult).to.equal(value);
        });
      });

      describe('For address that has permission SETDATA without any AllowedERC725YDataKeys', () => {
        it('should revert', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key'));
          const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Hello Lukso!'));

          await expect(
            context.universalProfile
              .connect(canSetDataWithoutAllowedERC725YDataKeys)
              .setData(key, value),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NoERC725YDataKeysAllowed')
            .withArgs(canSetDataWithoutAllowedERC725YDataKeys.address);
        });
      });

      describe("For address that doesn't have permission SETDATA", () => {
        it('should not allow', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My First Key'));
          const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Hello Lukso!'));

          await expect(context.universalProfile.connect(cannotSetData).setData(key, value))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(cannotSetData.address, 'SETDATA');
        });
      });
    });

    describe('when setting multiple keys', () => {
      describe('For UP owner', () => {
        it('(should pass): adding 5 singleton keys', async () => {
          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFirstKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyThirdKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFourthKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFifthKey')),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('aaaaaaaaaa')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('bbbbbbbbbb')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('cccccccccc')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('dddddddddd')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('eeeeeeeeee')),
          ];

          await context.universalProfile.connect(context.mainController).setDataBatch(keys, values);

          const fetchedResult = await context.universalProfile.callStatic.getDataBatch(keys);

          expect(fetchedResult).to.deep.equal(values);
        });

        it('(should pass): adding 10 LSP12IssuedAssets', async () => {
          const lsp12IssuedAssets = getRandomAddresses(10);

          const data = [{ keyName: 'LSP12IssuedAssets[]', value: lsp12IssuedAssets }];

          const { keys, values } = encodeData(data, BasicUPSetup_Schema);

          await context.universalProfile.connect(context.mainController).setDataBatch(keys, values);

          const fetchedResult = await context.universalProfile.callStatic.getDataBatch(keys);
          expect(fetchedResult).to.deep.equal(values);
        });

        it('(should pass): setup a basic Universal Profile (`LSP3Profile`, `LSP12IssuedAssets[]` and `LSP1UniversalReceiverDelegate`)', async () => {
          const basicUPSetup = [
            {
              keyName: 'LSP3Profile',
              value: {
                hashFunction: 'keccak256(utf8)',
                hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
                url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
              },
            },
            {
              keyName: 'LSP12IssuedAssets[]',
              value: [
                '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
                '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
              ],
            },
            {
              keyName: 'LSP1UniversalReceiverDelegate',
              value: '0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb',
            },
          ];

          const { keys, values } = encodeData(basicUPSetup, BasicUPSetup_Schema);

          await context.universalProfile.connect(context.mainController).setDataBatch(keys, values);

          const fetchedResult = await context.universalProfile.callStatic.getDataBatch(keys);
          expect(fetchedResult).to.deep.equal(values);
        });
      });

      describe('For address that has permission SETDATA with AllowedERC725YDataKeys', () => {
        it('(should pass): adding 5 singleton keys', async () => {
          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFirstKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyThirdKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFourthKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFifthKey')),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('aaaaaaaaaa')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('bbbbbbbbbb')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('cccccccccc')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('dddddddddd')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('eeeeeeeeee')),
          ];

          await context.universalProfile
            .connect(canSetDataWithAllowedERC725YDataKeys)
            .setDataBatch(keys, values);

          const fetchedResult = await context.universalProfile.callStatic.getDataBatch(keys);

          expect(fetchedResult).to.deep.equal(values);
        });

        it('(should pass): adding 10 LSP12IssuedAssets', async () => {
          const lsp12IssuedAssets = getRandomAddresses(10);

          const data = [{ keyName: 'LSP12IssuedAssets[]', value: lsp12IssuedAssets }];

          const { keys, values } = encodeData(data, BasicUPSetup_Schema);

          await context.universalProfile
            .connect(canSetDataWithAllowedERC725YDataKeys)
            .setDataBatch(keys, values);

          const fetchedResult = await context.universalProfile.callStatic.getDataBatch(keys);
          expect(fetchedResult).to.deep.equal(values);
        });

        it('(should pass): setup a basic Universal Profile (`LSP3Profile`, `LSP12IssuedAssets[]`)', async () => {
          const basicUPSetup = [
            {
              keyName: 'LSP3Profile',
              value: {
                hashFunction: 'keccak256(utf8)',
                hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
                url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
              },
            },
            {
              keyName: 'LSP12IssuedAssets[]',
              value: [
                '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
                '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
              ],
            },
          ];

          const { keys, values } = encodeData(basicUPSetup, BasicUPSetup_Schema);

          await context.universalProfile
            .connect(canSetDataWithAllowedERC725YDataKeys)
            .setDataBatch(keys, values);

          const fetchedResult = await context.universalProfile.callStatic.getDataBatch(keys);
          expect(fetchedResult).to.deep.equal(values);
        });
      });

      describe('For address that has permission SETDATA without AllowedERC725YDataKeys', () => {
        it('(should revert): adding 5 singleton keys', async () => {
          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFirstKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyThirdKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFourthKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFifthKey')),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('aaaaaaaaaa')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('bbbbbbbbbb')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('cccccccccc')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('dddddddddd')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('eeeeeeeeee')),
          ];

          await expect(
            context.universalProfile
              .connect(canSetDataWithoutAllowedERC725YDataKeys)
              .setDataBatch(keys, values),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NoERC725YDataKeysAllowed')
            .withArgs(canSetDataWithoutAllowedERC725YDataKeys.address);
        });

        it('(should revert): adding 10 LSP12IssuedAssets', async () => {
          const lsp12IssuedAssets = getRandomAddresses(10);

          const data = [{ keyName: 'LSP12IssuedAssets[]', value: lsp12IssuedAssets }];

          const { keys, values } = encodeData(data, BasicUPSetup_Schema);

          await expect(
            context.universalProfile
              .connect(canSetDataWithoutAllowedERC725YDataKeys)
              .setDataBatch(keys, values),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NoERC725YDataKeysAllowed')
            .withArgs(canSetDataWithoutAllowedERC725YDataKeys.address);
        });

        it('(should revert): setup a basic Universal Profile (`LSP3Profile`, `LSP12IssuedAssets[]`)', async () => {
          const basicUPSetup = [
            {
              keyName: 'LSP3Profile',
              value: {
                hashFunction: 'keccak256(utf8)',
                hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
                url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
              },
            },
            {
              keyName: 'LSP12IssuedAssets[]',
              value: [
                '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
                '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
              ],
            },
          ];

          const { keys, values } = encodeData(basicUPSetup, BasicUPSetup_Schema);

          await expect(
            context.universalProfile
              .connect(canSetDataWithoutAllowedERC725YDataKeys)
              .setDataBatch(keys, values),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NoERC725YDataKeysAllowed')
            .withArgs(canSetDataWithoutAllowedERC725YDataKeys.address);
        });
      });

      describe("For address that doesn't have permission SETDATA", () => {
        it('(should fail): adding 5 singleton keys', async () => {
          const keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFirstKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MySecondKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyThirdKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFourthKey')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MyFifthKey')),
          ];

          const values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('aaaaaaaaaa')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('bbbbbbbbbb')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('cccccccccc')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('dddddddddd')),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('eeeeeeeeee')),
          ];

          await expect(context.universalProfile.connect(cannotSetData).setDataBatch(keys, values))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(cannotSetData.address, 'SETDATA');
        });

        it('(should fail): adding 10 LSP12IssuedAssets', async () => {
          const lsp12IssuedAssets = getRandomAddresses(10);

          const data = [{ keyName: 'LSP12IssuedAssets[]', value: lsp12IssuedAssets }];

          const { keys, values } = encodeData(data, BasicUPSetup_Schema);

          await expect(context.universalProfile.connect(cannotSetData).setDataBatch(keys, values))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(cannotSetData.address, 'SETDATA');
        });

        it('(should fail): setup a basic Universal Profile (`LSP3Profile`, `LSP12IssuedAssets[]`)', async () => {
          const basicUPSetup = [
            {
              keyName: 'LSP3Profile',
              value: {
                hashFunction: 'keccak256(utf8)',
                hash: '0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361',
                url: 'ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx',
              },
            },
            {
              keyName: 'LSP12IssuedAssets[]',
              value: [
                '0xD94353D9B005B3c0A9Da169b768a31C57844e490',
                '0xDaea594E385Fc724449E3118B2Db7E86dFBa1826',
              ],
            },
          ];

          const { keys, values } = encodeData(basicUPSetup, BasicUPSetup_Schema);
          await expect(context.universalProfile.connect(cannotSetData).setDataBatch(keys, values))
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(cannotSetData.address, 'SETDATA');
        });
      });
    });
  });

  describe('when caller is a contract', () => {
    let contractCanSetData: ExecutorLSP20;

    const hardcodedDataKey = '0x562d53c1631c0c1620e183763f5f6356addcf78f26cbbd0b9eb7061d7c897ea1';
    const hardcodedDataValue = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some value'));

    /**
     * @dev this is necessary when the function being called in the contract
     *  perform a raw / low-level call (in the function body)
     *  otherwise, the deeper layer of interaction (UP.execute) fails
     */
    const GAS_PROVIDED = 500_000;

    before(async () => {
      context = await buildContext();

      contractCanSetData = await new ExecutorLSP20__factory(context.mainController).deploy(
        context.universalProfile.address,
      );

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          contractCanSetData.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
          contractCanSetData.address.substring(2),
      ];

      const compactedAllowedERC725YDataKeys = encodeCompactBytesArray([
        hardcodedDataKey,
        hardcodedDataValue,
      ]);

      const permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.SETDATA,
        compactedAllowedERC725YDataKeys,
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    afterEach(async () => {
      // teardown to start always with empty storage under the hardcoded data key
      await contractCanSetData.setComputedKeyFromParams(hardcodedDataKey, '0x');
    });

    describe('> contract calls', () => {
      it('should allow to set a key hardcoded inside a function of the calling contract', async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(initialStorage).to.equal('0x');

        // make the executor call
        await contractCanSetData.setHardcodedKey();

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(newStorage).to.equal(hardcodedDataValue);
      });

      it('Should allow to set a key computed inside a function of the calling contract', async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(initialStorage).to.equal('0x');

        // make the executor call
        await contractCanSetData.setComputedKey();

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(newStorage).to.equal(hardcodedDataValue);
      });

      it('Should allow to set a key computed from parameters given to a function of the calling contract', async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(initialStorage).to.equal('0x');

        // make the executor call
        await contractCanSetData.setComputedKeyFromParams(hardcodedDataKey, hardcodedDataValue);

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(newStorage).to.equal(hardcodedDataValue);
      });
    });

    describe('> Low-level calls', () => {
      it('Should allow to `setHardcodedKeyRawCall` on UP', async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(initialStorage).to.equal('0x');

        // check if low-level call succeeded
        const result = await contractCanSetData.callStatic.setHardcodedKeyRawCall({
          gasLimit: GAS_PROVIDED,
        });
        expect(result).to.be.true;

        // make the executor call
        await contractCanSetData.setHardcodedKeyRawCall({
          gasLimit: GAS_PROVIDED,
        });

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(newStorage).to.equal(hardcodedDataValue);
      });

      it('Should allow to `setComputedKeyRawCall` on UP', async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(initialStorage).to.equal('0x');

        // make the executor call
        await contractCanSetData.setComputedKeyRawCall({
          gasLimit: GAS_PROVIDED,
        });

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(newStorage).to.equal(hardcodedDataValue);
      });

      it('Should allow to `setComputedKeyFromParamsRawCall` on UP', async () => {
        // check that nothing is set at store[key]
        const initialStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(initialStorage).to.equal('0x');

        // make the executor call
        await contractCanSetData.setComputedKeyFromParamsRawCall(
          hardcodedDataKey,
          hardcodedDataValue,
          {
            gasLimit: GAS_PROVIDED,
          },
        );

        // check that store[key] is now set to value
        const newStorage = await context.universalProfile.callStatic['getData(bytes32)'](
          hardcodedDataKey,
        );
        expect(newStorage).to.equal(hardcodedDataValue);
      });
    });
  });

  describe('when caller is another UniversalProfile (with a KeyManager attached as owner)', () => {
    // UP making the call
    let alice: SignerWithAddress;
    let aliceContext: LSP6TestContext;

    // UP being called
    let bob: SignerWithAddress;
    let bobContext: LSP6TestContext;

    before(async () => {
      aliceContext = await buildContext();
      alice = aliceContext.accounts[0];

      bobContext = await buildContext();
      bob = bobContext.accounts[1];

      const alicePermissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + alice.address.substring(2),
      ];
      const alicePermissionValues = [ALL_PERMISSIONS];

      const bobPermissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + bob.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          aliceContext.universalProfile.address.substring(2),
      ];

      const bobPermissionValues = [ALL_PERMISSIONS, PERMISSIONS.SETDATA];

      await setupKeyManager(aliceContext, alicePermissionKeys, alicePermissionValues);

      await setupKeyManager(bobContext, bobPermissionKeys, bobPermissionValues);
    });

    it('Alice should have ALL PERMISSIONS in her UP', async () => {
      const key =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + alice.address.substring(2);

      const result = await aliceContext.universalProfile.getData(key);
      expect(result).to.equal(ALL_PERMISSIONS);
    });

    it('Bob should have ALL PERMISSIONS in his UP', async () => {
      const key = ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + bob.address.substring(2);

      const result = await bobContext.universalProfile.getData(key);
      expect(result).to.equal(ALL_PERMISSIONS);
    });

    it("Alice's UP should have permission SETDATA on Bob's UP", async () => {
      const key =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        aliceContext.universalProfile.address.substring(2);

      const result = await bobContext.universalProfile.getData(key);
      expect(result).to.equal(PERMISSIONS.SETDATA);
    });

    it("Alice's UP should't be able to `setData(...)` on Bob's UP when it doesn't have any AllowedERC725YDataKeys", async () => {
      const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Alice's Key"));
      const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Alice's Value"));

      const finalSetDataPayload = bobContext.universalProfile.interface.encodeFunctionData(
        'setData',
        [key, value],
      );

      await expect(
        aliceContext.universalProfile
          .connect(alice)
          .execute(
            OPERATION_TYPES.CALL,
            bobContext.universalProfile.address,
            0,
            finalSetDataPayload,
          ),
      )
        .to.be.revertedWithCustomError(bobContext.keyManager, 'NoERC725YDataKeysAllowed')
        .withArgs(aliceContext.universalProfile.address);
    });

    it("Alice's UP should be able to `setData(...)` on Bob's UP when it has AllowedERC725YDataKeys", async () => {
      const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Alice's Key"));
      const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Alice's Value"));

      // Adding `key` to AllowedERC725YDataKeys for Alice
      await bobContext.universalProfile
        .connect(bob)
        .setData(
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
            aliceContext.universalProfile.address.substring(2),
          encodeCompactBytesArray([key]),
        );

      const finalSetDataPayload = bobContext.universalProfile.interface.encodeFunctionData(
        'setData',
        [key, value],
      );

      await aliceContext.universalProfile
        .connect(alice)
        .execute(OPERATION_TYPES.CALL, bobContext.universalProfile.address, 0, finalSetDataPayload);

      const result = await bobContext.universalProfile.getData(key);
      expect(result).to.equal(value);
    });
  });

  describe('when caller has SUPER_SETDATA + some allowed ERC725YDataKeys', () => {
    let caller: SignerWithAddress;

    const AllowedERC725YDataKeys = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My 1st allowed key')),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My 2nd allowed key')),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My 3rd allowed key')),
    ];

    before(async () => {
      context = await buildContext();

      caller = context.accounts[1];

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
          caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.SUPER_SETDATA,
        encodeCompactBytesArray(AllowedERC725YDataKeys),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('when trying to set a disallowed key', () => {
      for (let ii = 1; ii <= 5; ii++) {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`dissallowed key ${ii}`));
        const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(`some value ${ii}`));

        it(`should be allowed to set a disallowed key: ${key}`, async () => {
          await context.universalProfile.connect(caller).setData(key, value);

          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });
      }
    });

    describe('when trying to set an allowed key', () => {
      it('should be allowed to set the 1st allowed key', async () => {
        const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('some value 1'));

        await context.universalProfile.connect(caller).setData(AllowedERC725YDataKeys[0], value);

        const result = await context.universalProfile.getData(AllowedERC725YDataKeys[0]);
        expect(result).to.equal(value);
      });

      it('should be allowed to set the 2nd allowed key', async () => {
        const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('some value 2'));

        await context.universalProfile.connect(caller).setData(AllowedERC725YDataKeys[1], value);

        const result = await context.universalProfile.getData(AllowedERC725YDataKeys[1]);
        expect(result).to.equal(value);
      });

      it('should be allowed to set the 3rd allowed key', async () => {
        const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('some value 3'));

        await context.universalProfile.connect(caller).setData(AllowedERC725YDataKeys[2], value);

        const result = await context.universalProfile.getData(AllowedERC725YDataKeys[2]);
        expect(result).to.equal(value);
      });
    });
  });
};
