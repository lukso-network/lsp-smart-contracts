import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// types
import {
  UniversalProfile,
  LSP7Tester,
  LSP7Tester__factory,
  LSP8Tester,
  LSP8Tester__factory,
  LSP9Vault,
  LSP1UniversalReceiverDelegateVault,
  LSP7MintWhenDeployed__factory,
  LSP7MintWhenDeployed,
  LSP1UniversalReceiverDelegateVault__factory,
} from '../../types';

import { ARRAY_LENGTH, LSP1_HOOK_PLACEHOLDER, abiCoder } from '../utils/helpers';

// constants
import {
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  LSP1_TYPE_IDS,
  LSP8_TOKEN_ID_TYPES,
} from '../../constants';
import { callPayload, getLSP5MapAndArrayKeysValue } from '../utils/fixtures';
import { BigNumber, BytesLike, Transaction } from 'ethers';

export type LSP1TestAccounts = {
  owner1: SignerWithAddress;
  random: SignerWithAddress;
  any: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP1TestAccounts> => {
  const [owner1, random, any] = await ethers.getSigners();
  return {
    owner1,
    random,
    any,
  };
};

// Random Token IDs
// prettier-ignore
export const TOKEN_ID = {
  ONE: "0xad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5",
  TWO: "0xd4d1a59767271eefdc7830a772b9732a11d503531d972ab8c981a6b1c0e666e5",
  THREE: "0x3672b35640006da199633c5c75015da83589c4fb84ef8276b18076529e3d3196",
  FOUR: "0x80a6c6138772c2d7c710a3d49f4eea603028994b7e390f670dd68566005417f0",
  FIVE: "0x5c6f8b1aed769a328dad1ae15220e93730cdd52cb12817ae5fd8c15023d660d3",
  SIX: "0x65ce3c3668a850c4f9fce91762a3fb886380399f02a9eb1495055234e7c0287a",
  SEVEN: "0x00121ee2bd9802ce88a413ac1851c8afe6fe7474fb5d1b7da4475151b013da53",
  EIGHT: "0x367f9d97f8dd1bece61f8b74c5db7616958147682674fd32de73490bd6347f60",
};

export type LSP1TestContext = {
  accounts: LSP1TestAccounts;
  universalProfile: UniversalProfile;
  lsp9Vault1: LSP9Vault;
  lsp9Vault2: LSP9Vault;
  lsp1universalReceiverDelegateVault: LSP1UniversalReceiverDelegateVault;
};

export const shouldBehaveLikeLSP1Delegate = (buildContext: () => Promise<LSP1TestContext>) => {
  let context: LSP1TestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when testing ERC165 standard', () => {
    it('should support ERC165 interface', async () => {
      const result = await context.lsp1universalReceiverDelegateVault.supportsInterface(
        INTERFACE_IDS.ERC165,
      );
      expect(result).to.be.true;
    });

    it('should support LSP1Delegate interface', async () => {
      const result = await context.lsp1universalReceiverDelegateVault.supportsInterface(
        INTERFACE_IDS.LSP1UniversalReceiverDelegate,
      );
      expect(result).to.be.true;
    });
  });

  describe('When testing EOA call to URD through the UR function', () => {
    describe('when calling with tokens typeId', () => {
      it('should return error message', async () => {
        const URD_TypeIds = [
          LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification,
          LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
          LSP1_TYPE_IDS.LSP8Tokens_RecipientNotification,
          LSP1_TYPE_IDS.LSP8Tokens_SenderNotification,
        ];

        for (let i = 0; i < URD_TypeIds.length; i++) {
          await expect(
            context.lsp9Vault1
              .connect(context.accounts.any)
              .universalReceiver(URD_TypeIds[i], '0x'),
          )
            .to.be.revertedWithCustomError(
              context.lsp1universalReceiverDelegateVault,
              'CannotRegisterEOAsAsAssets',
            )
            .withArgs(context.accounts.any.address);
        }
      });
    });

    describe('when calling with vaults sender and recipient typeIds', () => {
      it("should pass and return 'LSP1: typeId out of scope'", async () => {
        const Vault_TypeIds = [
          LSP1_TYPE_IDS.LSP14OwnershipTransferred_RecipientNotification,
          LSP1_TYPE_IDS.LSP14OwnershipTransferred_SenderNotification,
        ];

        for (let i = 0; i < Vault_TypeIds.length; i++) {
          const universalReceiverCalldata = context.lsp9Vault2.interface.encodeFunctionData(
            'universalReceiver',
            [Vault_TypeIds[i], '0x'],
          );

          const result = await context.universalProfile
            .connect(context.accounts.owner1)
            .callStatic.execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              universalReceiverCalldata,
            );

          const [decodedResult] = abiCoder.decode(['bytes'], result);

          const [resultDelegate, resultTypeID] = abiCoder.decode(['bytes', 'bytes'], decodedResult);

          expect(resultDelegate).to.equal(
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP1: typeId out of scope')),
          );

          expect(resultTypeID).to.equal('0x');
        }
      });
    });

    describe('when calling with random bytes32 typeId', () => {
      describe('when caller is an EOA', () => {
        it('should not revert with custom error `CannotRegisterEOAsAsAssets` if its a random typeId', async () => {
          await expect(
            context.lsp9Vault1
              .connect(context.accounts.any)
              .universalReceiver(LSP1_HOOK_PLACEHOLDER, '0x'),
          ).to.not.be.reverted;
        });

        it('should revert with custom error `CannotRegisterEOAsAsAssets` if its a typeId of LSP7/LSP8', async () => {
          await expect(
            context.lsp9Vault1
              .connect(context.accounts.any)
              .callStatic.universalReceiver(LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification, '0x'),
          )
            .to.be.revertedWithCustomError(
              context.lsp1universalReceiverDelegateVault,
              'CannotRegisterEOAsAsAssets',
            )
            .withArgs(context.accounts.any.address);
        });
      });

      describe('when caller is a contract', () => {
        it("should pass and return 'LSP1: typeId out of scope'", async () => {
          const universalReceiverCalldata = context.lsp9Vault2.interface.encodeFunctionData(
            'universalReceiver',
            [LSP1_HOOK_PLACEHOLDER, '0x'],
          );

          const result = await context.universalProfile
            .connect(context.accounts.owner1)
            .callStatic.execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault2.address,
              0,
              universalReceiverCalldata,
            );

          const [decodedResult] = abiCoder.decode(['bytes'], result);

          const [resultDelegate, resultTypeID] = abiCoder.decode(['bytes', 'bytes'], decodedResult);

          expect(resultDelegate).to.equal(
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP1: typeId out of scope')),
          );

          expect(resultTypeID).to.equal('0x');
        });
      });
    });
  });

  describe('when testing LSP7-DigitalAsset', () => {
    let lsp7TokenA: LSP7Tester, lsp7TokenB: LSP7Tester, lsp7TokenC: LSP7Tester;
    before(async () => {
      lsp7TokenA = await new LSP7Tester__factory(context.accounts.random).deploy(
        'TokenAlpha',
        'TA',
        context.accounts.random.address,
      );

      lsp7TokenB = await new LSP7Tester__factory(context.accounts.random).deploy(
        'TokenBeta',
        'TB',
        context.accounts.random.address,
      );

      lsp7TokenC = await new LSP7Tester__factory(context.accounts.random).deploy(
        'TokenGamma',
        'TA',
        context.accounts.random.address,
      );
    });

    describe('when minting tokens', () => {
      describe('when tokens are minted through the constructor (on LSP7 deployment)', () => {
        let deployedLSP7Token: LSP7MintWhenDeployed;

        before('deploy LSP7 token which mint tokens in `constructor`', async () => {
          deployedLSP7Token = await new LSP7MintWhenDeployed__factory(context.accounts.any).deploy(
            'LSP7 Token',
            'TKN',
            context.lsp9Vault1.address,
          );
        });

        after('clear LSP5 storage', async () => {
          // cleanup and reset the `LSP5ReceivedAssets[]` length, index and map value to 0x
          const setDataPayload = context.lsp9Vault1.interface.encodeFunctionData('setDataBatch', [
            [
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00'.repeat(16),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssetsMap'] +
                deployedLSP7Token.address.substring(2),
            ],
            ['0x', '0x', '0x'],
          ]);

          // vault is owned by UP so we need to execute via the UP
          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, setDataPayload);
        });

        it('it should have registered the token in LSP5ReceivedAssets Map and Array', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, deployedLSP7Token);

          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ethers.utils.hexZeroPad(ethers.utils.hexValue(1), 16));
          expect(elementAddress).to.equal(deployedLSP7Token.address);
        });
      });

      describe('when minting 10 tokenA to lsp9Vault1', () => {
        before(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData('mint', [
            context.lsp9Vault1.address,
            '10',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenA.address, abi),
            );
        });
        it('should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenA.address);
        });
      });

      describe('when minting 10 tokenB to lsp9Vault1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('mint', [
            context.lsp9Vault1.address,
            '10',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi),
            );
        });
        it('should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('when minting 10 of the same tokenB to lsp9Vault1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('mint', [
            context.lsp9Vault1.address,
            '10',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi),
            );
        });
        it('should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('when minting 10 tokenC to lsp9Vault1', () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData('mint', [
            context.lsp9Vault1.address,
            '10',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenC.address, abi),
            );
        });
        it('should register lsp5keys: arrayLength 3, index 2, tokenC address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });
      });
    });

    describe('when burning tokens', () => {
      describe('when burning 10 tokenC (last token) from lsp9Vault1', () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData('burn', [
            context.lsp9Vault1.address,
            '10',
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenC.address, abi),
            );
        });
        it('should update lsp5keys: arrayLength 2, no map, no tokenC address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenC.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000002',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal('0x');
        });
      });

      describe('when burning 10 tokenA (first token) from lsp9Vault1', () => {
        before(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData('burn', [
            context.lsp9Vault1.address,
            '10',
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenA.address, abi),
            );
        });

        it('should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it('should update lsp5keys: arrayLength 1, no map, no tokenA address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenA.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000001',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });
      });

      describe('when burning 10 (half of the amount) tokenB from lsp9Vault1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('burn', [
            context.lsp9Vault1.address,
            '10',
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi),
            );
        });
        it('should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('when burning 10 (remaining) tokenB from lsp9Vault1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('burn', [
            context.lsp9Vault1.address,
            '10',
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi),
            );
        });
        it('should update lsp5keys: arrayLength 0, no map, no tokenB address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenB.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000000',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal('0x');
        });
      });
    });

    describe('when transferring tokens', () => {
      it('should fund the universalProfle with 10 tokens (each) to test token transfers (TokenA, TokenB, TokenC)', async () => {
        await lsp7TokenA
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, '10', false, '0x');

        await lsp7TokenB
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, '10', false, '0x');

        await lsp7TokenC
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, '10', false, '0x');
      });

      it('should register lsp5keys: arrayLength 3, index [1,2,3], [tokenA, tokenB, tokenC] addresses in Vault1 ', async () => {
        const [indexInMapTokenA, interfaceIdTokenA, arrayLength, elementAddressTokenA] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenA);

        const [indexInMapTokenB, interfaceIdTokenB, , elementAddressTokenB] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);

        const [indexInMapTokenC, interfaceIdTokenC, , elementAddressTokenC] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenC);

        expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
        expect(indexInMapTokenA).to.equal(0);
        expect(indexInMapTokenB).to.equal(1);
        expect(indexInMapTokenC).to.equal(2);
        expect(interfaceIdTokenA).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
        expect(interfaceIdTokenB).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
        expect(interfaceIdTokenC).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
        expect(elementAddressTokenA).to.equal(lsp7TokenA.address);
        expect(elementAddressTokenB).to.equal(lsp7TokenB.address);
        expect(elementAddressTokenC).to.equal(lsp7TokenC.address);
      });

      describe('When transferring 10 (all) token A from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            '10',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenA.address, abi),
            );
        });

        it('should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenC);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });

        it('should update lsp5keys: arrayLength 2, no map, no tokenA address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenA.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000002',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenA.address);
        });
      });

      describe('When transferring 5 (half of amount) token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            '5',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi),
            );
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it('should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('When transferring 4 (few) token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            '4',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi),
            );
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('When transferring 1 (remaining) token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            '1',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenB.address, abi),
            );
        });

        it('should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenB.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000001',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('When transferring 10 (all) token C from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            '10',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp7TokenC.address, abi),
            );
        });

        it('should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenB.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000001',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp5keys : arrayLength 3, index = 2, tokenC address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp7TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });
      });

      describe('When transferring 1 (few) token B from UP2 to UP1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('transfer', [
            context.lsp9Vault2.address,
            context.lsp9Vault1.address,
            '1',
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault2.address,
              0,
              callPayload(context.lsp9Vault2, lsp7TokenB.address, abi),
            );
        });

        it('should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp7TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });
    });

    describe('when removing all keys', () => {
      before(async () => {
        const abi1 = lsp7TokenB.interface.encodeFunctionData('burn', [
          context.lsp9Vault1.address,
          '1',
          '0x',
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(
            OPERATION_TYPES.CALL,
            context.lsp9Vault1.address,
            0,
            callPayload(context.lsp9Vault1, lsp7TokenB.address, abi1),
          );

        const abi2 = lsp7TokenB.interface.encodeFunctionData('burn', [
          context.lsp9Vault2.address,
          '9',
          '0x',
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(
            OPERATION_TYPES.CALL,
            context.lsp9Vault2.address,
            0,
            callPayload(context.lsp9Vault2, lsp7TokenB.address, abi2),
          );

        const abi3 = lsp7TokenA.interface.encodeFunctionData('burn', [
          context.lsp9Vault2.address,
          '10',
          '0x',
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(
            OPERATION_TYPES.CALL,
            context.lsp9Vault2.address,
            0,
            callPayload(context.lsp9Vault2, lsp7TokenA.address, abi3),
          );

        const abi4 = lsp7TokenC.interface.encodeFunctionData('burn', [
          context.lsp9Vault2.address,
          '10',
          '0x',
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(
            OPERATION_TYPES.CALL,
            context.lsp9Vault2.address,
            0,
            callPayload(context.lsp9Vault2, lsp7TokenC.address, abi4),
          );
      });
      it('should remove all lsp5 keys on both UP', async () => {
        const arrayLengthUP1 = await context.lsp9Vault1.getData(
          ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
        );

        const arrayLengthUP2 = await context.lsp9Vault2.getData(
          ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
        );

        expect(arrayLengthUP1).to.equal(ARRAY_LENGTH.ZERO);
        expect(arrayLengthUP2).to.equal(ARRAY_LENGTH.ZERO);
      });
    });
  });

  describe('testing values set under `LSP5ReceivedAssets[]`', () => {
    let context: LSP1TestContext;
    let token: LSP7Tester;
    let arrayKey: BytesLike;
    let arrayIndexKey: BytesLike;
    let assetMapKey: BytesLike;

    before(async () => {
      // start with a fresh empty context
      context = await buildContext();

      token = await new LSP7Tester__factory(context.accounts.random).deploy(
        'Example LSP7 token',
        'EL7T',
        context.accounts.random.address,
      );

      arrayKey = ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length;
      arrayIndexKey = ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '0'.repeat(32);
      assetMapKey = ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + token.address.substring(2);
    });

    describe('when the Map value of LSP5ReceivedAssetsMap is less than 20 bytes', () => {
      let tokenTransferTx: Transaction;
      let balance: BigNumber;

      before(async () => {
        await token
          .connect(context.accounts.owner1)
          .mint(context.lsp9Vault1.address, 100, true, '0x');

        const vaultSetDataCalldata = context.lsp9Vault1.interface.encodeFunctionData('setData', [
          ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + token.address.substring(2),
          '0xcafecafecafecafe',
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, vaultSetDataCalldata);

        expect(
          await context.lsp9Vault1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xcafecafecafecafe',
        ]);

        balance = await token.balanceOf(context.lsp9Vault1.address);

        const tokenTransferCalldata = token.interface.encodeFunctionData('transfer', [
          context.lsp9Vault1.address,
          context.accounts.owner1.address,
          balance,
          true,
          '0x',
        ]);

        const vaultTokenTransferCalldata = context.lsp9Vault1.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, token.address, 0, tokenTransferCalldata],
        );

        tokenTransferTx = await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, vaultTokenTransferCalldata);
      });

      it('should pass', async () => {
        expect(tokenTransferTx).to.not.be.reverted;
      });

      it('should emit UniversalReceiver event', async () => {
        const tokensSentBytes32Value = ethers.utils.hexZeroPad(balance.toHexString(), 32);

        const tokenTransferData = abiCoder.encode(
          ['address', 'address', 'uint256', 'bytes'],
          [
            context.lsp9Vault1.address,
            context.accounts.owner1.address,
            tokensSentBytes32Value,
            '0x',
          ],
        );

        const lsp1ReturnedData = ethers.utils.defaultAbiCoder.encode(
          ['string', 'bytes'],
          ['LSP5: Error generating data key/value pairs', '0x'],
        );

        await expect(tokenTransferTx)
          .to.emit(context.lsp9Vault1, 'UniversalReceiver')
          .withArgs(
            token.address,
            0,
            LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
            tokenTransferData,
            lsp1ReturnedData,
          );
      });

      it("shouldn't de-register the asset", async () => {
        expect(
          await context.lsp9Vault1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xcafecafecafecafe',
        ]);
      });
    });

    describe('when the Map value of LSP5ReceivedAssetsMap is bigger than 20 bytes, (valid `(byte4,uint128)` tuple  + extra bytes)', () => {
      let tokenTransferTx: Transaction;
      let balance: BigNumber;

      before(async () => {
        await token
          .connect(context.accounts.owner1)
          .mint(context.lsp9Vault1.address, 100, true, '0x');

        const vaultSetDataCalldata = context.lsp9Vault1.interface.encodeFunctionData('setData', [
          ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + token.address.substring(2),
          '0xdaa746b700000000000000000000000000000000cafecafe',
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, vaultSetDataCalldata);

        expect(
          await context.lsp9Vault1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xdaa746b700000000000000000000000000000000cafecafe',
        ]);

        balance = await token.balanceOf(context.lsp9Vault1.address);

        const tokenTransferCalldata = token.interface.encodeFunctionData('transfer', [
          context.lsp9Vault1.address,
          context.accounts.owner1.address,
          balance,
          true,
          '0x',
        ]);

        const vaultTokenTransferCalldata = context.lsp9Vault1.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, token.address, 0, tokenTransferCalldata],
        );

        tokenTransferTx = await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, vaultTokenTransferCalldata);
      });

      it('should pass', async () => {
        expect(tokenTransferTx).to.not.be.reverted;
      });

      it('should emit UniversalReceiver event', async () => {
        const tokensSentBytes32Value = ethers.utils.hexZeroPad(balance.toHexString(), 32);

        const tokenTransferData = abiCoder.encode(
          ['address', 'address', 'uint256', 'bytes'],
          [
            context.lsp9Vault1.address,
            context.accounts.owner1.address,
            tokensSentBytes32Value,
            '0x',
          ],
        );

        const lsp1ReturnedData = ethers.utils.defaultAbiCoder.encode(
          ['string', 'bytes'],
          ['LSP5: Error generating data key/value pairs', '0x'],
        );

        await expect(tokenTransferTx)
          .to.emit(context.lsp9Vault1, 'UniversalReceiver')
          .withArgs(
            token.address,
            0,
            LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
            tokenTransferData,
            lsp1ReturnedData,
          );
      });

      it('should not de-register the asset', async () => {
        expect(
          await context.lsp9Vault1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xdaa746b700000000000000000000000000000000cafecafe',
        ]);
      });
    });

    describe('when the Map value of LSP5ReceivedAssetsMap is 20 random bytes', () => {
      let tokenTransferTx: Transaction;
      let balance: BigNumber;

      before(async () => {
        await token
          .connect(context.accounts.owner1)
          .mint(context.lsp9Vault1.address, 100, true, '0x');

        const vaultSetDataCalldata = context.lsp9Vault1.interface.encodeFunctionData('setData', [
          ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + token.address.substring(2),
          '0xcafecafecafecafecafecafecafecafecafecafe',
        ]);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, vaultSetDataCalldata);

        expect(
          await context.lsp9Vault1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xcafecafecafecafecafecafecafecafecafecafe',
        ]);

        balance = await token.balanceOf(context.lsp9Vault1.address);

        const tokenTransferCalldata = token.interface.encodeFunctionData('transfer', [
          context.lsp9Vault1.address,
          context.accounts.owner1.address,
          balance,
          true,
          '0x',
        ]);

        const vaultTokenTransferCalldata = context.lsp9Vault1.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, token.address, 0, tokenTransferCalldata],
        );

        tokenTransferTx = await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, vaultTokenTransferCalldata);
      });

      it('should pass', async () => {
        expect(tokenTransferTx).to.not.be.reverted;
      });

      it('should emit UniversalReceiver event', async () => {
        const tokensSentBytes32Value = ethers.utils.hexZeroPad(balance.toHexString(), 32);

        const tokenTransferData = abiCoder.encode(
          ['address', 'address', 'uint256', 'bytes'],
          [
            context.lsp9Vault1.address,
            context.accounts.owner1.address,
            tokensSentBytes32Value,
            '0x',
          ],
        );

        const lsp1ReturnedData = ethers.utils.defaultAbiCoder.encode(
          ['string', 'bytes'],
          ['LSP5: Error generating data key/value pairs', '0x'],
        );

        await expect(tokenTransferTx)
          .to.emit(context.lsp9Vault1, 'UniversalReceiver')
          .withArgs(
            token.address,
            0,
            LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
            tokenTransferData,
            lsp1ReturnedData,
          );
      });

      it("shouldn't de-register the asset", async () => {
        expect(
          await context.lsp9Vault1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xcafecafecafecafecafecafecafecafecafecafe',
        ]);
      });
    });
  });

  describe('when testing LSP8-IdentifiableDigitalAsset', () => {
    let lsp8TokenA: LSP8Tester, lsp8TokenB: LSP8Tester, lsp8TokenC: LSP8Tester;
    before(async () => {
      lsp8TokenA = await new LSP8Tester__factory(context.accounts.random).deploy(
        'TokenAlpha',
        'TA',
        context.accounts.random.address,
        LSP8_TOKEN_ID_TYPES.UNIQUE_ID,
      );

      lsp8TokenB = await new LSP8Tester__factory(context.accounts.random).deploy(
        'TokenBeta',
        'TB',
        context.accounts.random.address,
        LSP8_TOKEN_ID_TYPES.UNIQUE_ID,
      );

      lsp8TokenC = await new LSP8Tester__factory(context.accounts.random).deploy(
        'TokenGamma',
        'TA',
        context.accounts.random.address,
        LSP8_TOKEN_ID_TYPES.UNIQUE_ID,
      );
    });

    describe('when minting tokens', () => {
      describe('when minting tokenId 1 of tokenA to lsp9Vault1', () => {
        before(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData('mint', [
            context.lsp9Vault1.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenA.address, abi),
            );
        });
        it('should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenA.address);
        });
      });

      describe('when minting tokenId 1 of tokenB to lsp9Vault1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('mint', [
            context.lsp9Vault1.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi),
            );
        });
        it('should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('when minting tokenId 2 of tokenB (another) to lsp9Vault1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('mint', [
            context.lsp9Vault1.address,
            TOKEN_ID.TWO,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi),
            );
        });
        it('should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('when minting tokenId 1 of tokenC to lsp9Vault1', () => {
        before(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData('mint', [
            context.lsp9Vault1.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenC.address, abi),
            );
        });
        it('should register lsp5keys: arrayLength 3, index 2, tokenC address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });
      });
    });

    describe('when burning tokens', () => {
      describe('when burning tokenId 1 (all balance) of tokenC (last token) from lsp9Vault1', () => {
        before(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData('burn', [TOKEN_ID.ONE, '0x']);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenC.address, abi),
            );
        });
        it('should update lsp5keys: arrayLength 2, no map, no tokenC address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenC.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000002',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal('0x');
        });
      });

      describe('when burning tokenId 1 (all balance) of tokenA (first token) from lsp9Vault1', () => {
        before(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData('burn', [TOKEN_ID.ONE, '0x']);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenA.address, abi),
            );
        });

        it('should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it('should update lsp5keys: arrayLength 1, no map, no tokenA address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenA.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000001',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });
      });

      describe('when burning 1 tokenId (not all balance) of tokenB from lsp9Vault1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('burn', [TOKEN_ID.ONE, '0x']);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi),
            );
        });
        it('should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('when burning all tokenB from lsp9Vault1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('burn', [TOKEN_ID.TWO, '0x']);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi),
            );
        });
        it('should update lsp5keys: arrayLength 0, no map, no tokenB address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenB.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000000',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal('0x');
        });
      });
    });

    describe('when transferring tokens', () => {
      it('should fund the universalProfle with tokens to test token transfers (TokenA, TokenB, TokenC)', async () => {
        // 1 tokenId of TokenA
        await lsp8TokenA
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.ONE, false, '0x');

        // 3 tokenIds of TokenB
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.ONE, false, '0x');
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.TWO, false, '0x');
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.THREE, false, '0x');

        // 1 tokenId of TokenC
        await lsp8TokenC
          .connect(context.accounts.random)
          .mint(context.lsp9Vault1.address, TOKEN_ID.ONE, false, '0x');
      });

      it('should register lsp5keys: arrayLength 3, index [1,2,3], [tokenA, tokenB, tokenC] addresses in Vault1 ', async () => {
        const [indexInMapTokenA, interfaceIdTokenA, arrayLength, elementAddressTokenA] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenA);

        const [indexInMapTokenB, interfaceIdTokenB, , elementAddressTokenB] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);

        const [indexInMapTokenC, interfaceIdTokenC, , elementAddressTokenC] =
          await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenC);

        expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
        expect(indexInMapTokenA).to.equal(0);
        expect(indexInMapTokenB).to.equal(1);
        expect(indexInMapTokenC).to.equal(2);
        expect(interfaceIdTokenA).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
        expect(interfaceIdTokenB).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
        expect(interfaceIdTokenC).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
        expect(elementAddressTokenA).to.equal(lsp8TokenA.address);
        expect(elementAddressTokenB).to.equal(lsp8TokenB.address);
        expect(elementAddressTokenC).to.equal(lsp8TokenC.address);
      });

      describe('When transferring tokenId 1 (all) of token A from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenA.address, abi),
            );
        });

        it('should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenC);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });

        it('should update lsp5keys: arrayLength 2, no map, no tokenA address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenA.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000002',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp5keys: arrayLength 1, index 0, tokenA address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenA.address);
        });
      });

      describe('When transferring tokenId 1 (not all balance) of token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi),
            );
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it('should register lsp5keys: arrayLength 2, index 1, tokenB address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('When transferring tokenId 2 (not all balance) of token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.TWO,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi),
            );
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('When transferring tokenId 3 (remaining balance) of token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.THREE,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenB.address, abi),
            );
        });

        it('should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenB.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000001',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('When transferring tokenId 1 (all balance) of token C from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData('transfer', [
            context.lsp9Vault1.address,
            context.lsp9Vault2.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault1.address,
              0,
              callPayload(context.lsp9Vault1, lsp8TokenC.address, abi),
            );
        });

        it('should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in Vault1', async () => {
          const [mapValue, arrayLength, elementAddress] = await context.lsp9Vault1.getDataBatch([
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenB.address.substr(2),
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00000000000000000000000000000001',
          ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp5keys : arrayLength 3, index = 2, tokenC address in Vault2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault2, lsp8TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });
      });

      describe('When transferring 1 tokenId (not all balance) of token B from UP2 to UP1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('transfer', [
            context.lsp9Vault2.address,
            context.lsp9Vault1.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.universalProfile
            .connect(context.accounts.owner1)
            .execute(
              OPERATION_TYPES.CALL,
              context.lsp9Vault2.address,
              0,
              callPayload(context.lsp9Vault2, lsp8TokenB.address, abi),
            );
        });

        it('should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in Vault1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.lsp9Vault1, lsp8TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });
    });
  });

  describe('when URD has no permissions', () => {
    before('deploying new URD', async () => {
      const newURD = await new LSP1UniversalReceiverDelegateVault__factory(
        context.accounts.owner1,
      ).deploy();

      const LSP9_setDataCalldata = context.lsp9Vault1.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
        newURD.address,
      ]);

      await context.universalProfile
        .connect(context.accounts.owner1)
        .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, LSP9_setDataCalldata);

      await context.universalProfile
        .connect(context.accounts.owner1)
        .execute(OPERATION_TYPES.CALL, context.lsp9Vault2.address, 0, LSP9_setDataCalldata);
    });

    describe('when receiving LSP7', () => {
      it('should not revert', async () => {
        const LSP7 = await new LSP7MintWhenDeployed__factory(context.accounts.owner1).deploy(
          'MyToken',
          'MTK',
          context.lsp9Vault1.address,
        );

        const LSP7_TransferCalldata = LSP7.interface.encodeFunctionData('transfer', [
          context.lsp9Vault1.address,
          context.lsp9Vault2.address,
          1,
          false,
          '0x',
        ]);

        const LSP9_ExecuteCalldata = context.lsp9Vault1.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          LSP7.address,
          0,
          LSP7_TransferCalldata,
        ]);

        expect(await LSP7.balanceOf(context.lsp9Vault1.address)).to.equal(1000);
        expect(await LSP7.balanceOf(context.lsp9Vault2.address)).to.equal(0);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, LSP9_ExecuteCalldata);

        expect(await LSP7.balanceOf(context.lsp9Vault1.address)).to.equal(999);
        expect(await LSP7.balanceOf(context.lsp9Vault2.address)).to.equal(1);
      });
    });

    describe('when receiving LSP8', () => {
      it('should not revert', async () => {
        const LSP8 = await new LSP8Tester__factory(context.accounts.owner1).deploy(
          'MyToken',
          'MTK',
          context.lsp9Vault1.address,
          LSP8_TOKEN_ID_TYPES.NUMBER,
        );
        await LSP8.mint(context.lsp9Vault1.address, '0x' + '0'.repeat(64), false, '0x');

        const LSP8_TransferCalldata = LSP8.interface.encodeFunctionData('transfer', [
          context.lsp9Vault1.address,
          context.lsp9Vault2.address,
          '0x' + '0'.repeat(64),
          false,
          '0x',
        ]);

        const LSP9_ExecuteCalldata = context.lsp9Vault1.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          LSP8.address,
          0,
          LSP8_TransferCalldata,
        ]);

        expect(await LSP8.tokenOwnerOf('0x' + '0'.repeat(64))).to.equal(context.lsp9Vault1.address);

        await context.universalProfile
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, context.lsp9Vault1.address, 0, LSP9_ExecuteCalldata);

        expect(await LSP8.tokenOwnerOf('0x' + '0'.repeat(64))).to.equal(context.lsp9Vault2.address);
      });
    });
  });
};
