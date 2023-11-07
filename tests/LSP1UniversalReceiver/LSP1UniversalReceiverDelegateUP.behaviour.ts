import { ethers, network } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// types
import {
  LSP1UniversalReceiverDelegateUP,
  UniversalProfile,
  LSP6KeyManager,
  LSP7Tester,
  LSP7Tester__factory,
  LSP8Tester,
  LSP8Tester__factory,
  LSP9Vault,
  LSP9Vault__factory,
  LSP0ERC725Account,
  LSP0ERC725Account__factory,
  GenericExecutor,
  GenericExecutor__factory,
  UniversalProfile__factory,
  LSP6KeyManager__factory,
  LSP1UniversalReceiverDelegateUP__factory,
  LSP7MintWhenDeployed__factory,
  LSP7MintWhenDeployed,
  GenericExecutorWithBalanceOfFunction,
  GenericExecutorWithBalanceOfFunction__factory,
} from '../../types';

// helpers
import { ARRAY_LENGTH, LSP1_HOOK_PLACEHOLDER, abiCoder } from '../utils/helpers';

// constants
import {
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  LSP1_TYPE_IDS,
  LSP8_TOKEN_ID_TYPES,
} from '../../constants';

// fixtures
import { callPayload, getLSP5MapAndArrayKeysValue, setupKeyManager } from '../utils/fixtures';
import { LSP6TestContext } from '../utils/context';
import { BigNumber, BytesLike, Transaction } from 'ethers';

export type LSP1TestAccounts = {
  owner1: SignerWithAddress;
  owner2: SignerWithAddress;
  random: SignerWithAddress;
  any: SignerWithAddress;
};

export type LSP1DelegateTestContext = {
  accounts: LSP1TestAccounts;
  universalProfile1: UniversalProfile;
  lsp6KeyManager1: LSP6KeyManager;
  universalProfile2: UniversalProfile;
  lsp6KeyManager2: LSP6KeyManager;
  lsp1universalReceiverDelegateUP: LSP1UniversalReceiverDelegateUP;
};

/**
 * Returns the LSP10 arraylength, elementAddress, index and interfaceId of the vault provided
 * for the account provided.
 */
async function getLSP10MapAndArrayKeysValue(account, lsp9Vault) {
  const mapValue = await account.getData(
    ethers.utils.hexConcat([ERC725YDataKeys.LSP10.LSP10VaultsMap, lsp9Vault.address]),
  );

  const indexInHex = '0x' + mapValue.substr(10, mapValue.length);
  const interfaceId = mapValue.substr(0, 10);
  const indexInNumber = ethers.BigNumber.from(indexInHex).toNumber();

  const rawIndexInArray = ethers.utils.hexZeroPad(ethers.utils.hexValue(indexInNumber), 16);

  const elementInArrayKey = ethers.utils.hexConcat([
    ERC725YDataKeys.LSP10['LSP10Vaults[]'].index,
    rawIndexInArray,
  ]);

  const arrayKey = ERC725YDataKeys.LSP10['LSP10Vaults[]'].length;
  const [arrayLength, _elementAddress] = await account.getDataBatch([arrayKey, elementInArrayKey]);

  let elementAddress = _elementAddress;

  if (elementAddress != '0x') {
    elementAddress = ethers.utils.getAddress(elementAddress);
  }
  return [indexInNumber, interfaceId, arrayLength, elementAddress];
}

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

export const shouldBehaveLikeLSP1Delegate = (
  buildContext: () => Promise<LSP1DelegateTestContext>,
) => {
  let context: LSP1DelegateTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('When testing EOA call to URD through the UR function', () => {
    describe('when calling with token/vault typeId', () => {
      it('should revrt with custom error', async () => {
        const URD_TypeIds = [
          LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification,
          LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
          LSP1_TYPE_IDS.LSP8Tokens_RecipientNotification,
          LSP1_TYPE_IDS.LSP8Tokens_SenderNotification,
          LSP1_TYPE_IDS.LSP9OwnershipTransferred_RecipientNotification,
          LSP1_TYPE_IDS.LSP9OwnershipTransferred_SenderNotification,
        ];

        for (let i = 0; i < URD_TypeIds.length; i++) {
          await expect(
            context.universalProfile1
              .connect(context.accounts.any)
              .universalReceiver(URD_TypeIds[i], '0x'),
          )
            .to.be.revertedWithCustomError(
              context.lsp1universalReceiverDelegateUP,
              'CannotRegisterEOAsAsAssets',
            )
            .withArgs(context.accounts.any.address);
        }
      });
    });

    describe('when calling with random bytes32 typeId', () => {
      describe('when caller is an EOA', () => {
        it('should not revert with custom error `CannotRegisterEOAsAsAssets` if its a random typeId', async () => {
          await expect(
            context.universalProfile1
              .connect(context.accounts.any)
              .universalReceiver(LSP1_HOOK_PLACEHOLDER, '0x'),
          ).to.not.be.reverted;
        });

        it('should revert with custom error `CannotRegisterEOAsAsAssets` if its a typeId of LSP7/LSP8', async () => {
          await expect(
            context.universalProfile1
              .connect(context.accounts.any)
              .callStatic.universalReceiver(LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification, '0x'),
          )
            .to.be.revertedWithCustomError(
              context.lsp1universalReceiverDelegateUP,
              'CannotRegisterEOAsAsAssets',
            )
            .withArgs(context.accounts.any.address);
        });
      });

      describe('when caller is a contract', () => {
        it("should pass and return 'LSP1: typeId out of scope'", async () => {
          const universalReceiverCalldata = context.universalProfile2.interface.encodeFunctionData(
            'universalReceiver',
            [LSP1_HOOK_PLACEHOLDER, '0x'],
          );

          const result = await context.universalProfile1
            .connect(context.accounts.owner1)
            .callStatic.execute(
              OPERATION_TYPES.CALL,
              context.universalProfile2.address,
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

  describe('when testing LSP0-ERC725Account', () => {
    describe('when accepting ownership of an LSP0', () => {
      let sentUniversalProfile: LSP0ERC725Account;
      before(async () => {
        sentUniversalProfile = await new LSP0ERC725Account__factory(context.accounts.owner1).deploy(
          context.accounts.owner1.address,
        );
      });

      it('should not register universal profile as received vault', async () => {
        const acceptingUniversalProfile: LSP0ERC725Account = context.universalProfile1;
        const acceptingUniversalProfileKM: LSP6KeyManager = context.lsp6KeyManager1;

        await sentUniversalProfile
          .connect(context.accounts.owner1)
          .transferOwnership(acceptingUniversalProfile.address);

        const acceptOwnershipPayload =
          sentUniversalProfile.interface.encodeFunctionData('acceptOwnership');
        const payloadToExecute = acceptingUniversalProfile.interface.encodeFunctionData('execute', [
          0,
          sentUniversalProfile.address,
          0,
          acceptOwnershipPayload,
        ]);

        await acceptingUniversalProfileKM
          .connect(context.accounts.owner1)
          .execute(payloadToExecute);

        const receivedVaultsKeys = [
          ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
          ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '0'.repeat(32),
          ERC725YDataKeys.LSP10.LSP10VaultsMap + sentUniversalProfile.address.substring(2),
        ];
        const receivedVaultsValues = ['0x', '0x', '0x'];

        expect(await acceptingUniversalProfile.getDataBatch(receivedVaultsKeys)).to.deep.equal(
          receivedVaultsValues,
        );
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
            context.universalProfile1.address,
          );
        });

        after('clear LSP5 storage', async () => {
          // cleanup and reset the `LSP5ReceivedAssets[]` length, index and map value to 0x
          const setDataPayload = context.universalProfile1.interface.encodeFunctionData(
            'setDataBatch',
            [
              [
                ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
                ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00'.repeat(16),
                ERC725YDataKeys.LSP5['LSP5ReceivedAssetsMap'] +
                  deployedLSP7Token.address.substring(2),
              ],
              ['0x', '0x', '0x'],
            ],
          );

          await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(setDataPayload);
        });

        it('it should have registered the token in LSP5ReceivedAssets Map and Array', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, deployedLSP7Token);

          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ethers.utils.hexZeroPad(ethers.utils.hexValue(1), 16));
          expect(elementAddress).to.equal(deployedLSP7Token.address);
        });
      });

      describe('when calling `mint(...)` with `amount == 0` and a `to == universalProfile`', () => {
        it('should not revert, not register any LSP5ReceivedAssets[] and just emit the `UniversalReceiver` event on the UP', async () => {
          await expect(
            lsp7TokenA
              .connect(context.accounts.random)
              .mint(context.universalProfile1.address, 0, false, '0x'),
          )
            .to.emit(lsp7TokenA, 'Transfer')
            .withArgs(
              context.accounts.random.address,
              ethers.constants.AddressZero,
              context.universalProfile1.address,
              0,
              false,
              '0x',
            );

          const result = await context.universalProfile1.getData(
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
          );

          expect(result).to.equal('0x');
        });
      });

      describe('when minting 10 tokenA to universalProfile1', () => {
        before(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData('mint', [
            context.universalProfile1.address,
            '10',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenA.address, abi));
        });

        it('should register lsp5keys: arrayLength 1, index 0, tokenA address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenA.address);
        });
      });

      describe('when minting 10 tokenB to universalProfile1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('mint', [
            context.universalProfile1.address,
            '10',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenB.address, abi));
        });

        it('should register lsp5keys: arrayLength 2, index 1, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('when minting 10 of the same tokenB to universalProfile1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('mint', [
            context.universalProfile1.address,
            '10',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenB.address, abi));
        });

        it('should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('when minting 10 tokenC to universalProfile1', () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData('mint', [
            context.universalProfile1.address,
            '10',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenC.address, abi));
        });
        it('should register lsp5keys: arrayLength 3, index 2, tokenC address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });
      });
    });

    describe('when burning tokens', () => {
      describe('when calling `burn(...)` with `amount == 0` and a `to == a universalProfile`', () => {
        it('should revert and not remove any LSP5ReceivedAssets[] on the UP', async () => {
          const lsp5ReceivedAssetsArrayLength = await context.universalProfile1['getData(bytes32)'](
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
          );

          const abi = lsp7TokenC.interface.encodeFunctionData('burn', [
            context.universalProfile1.address,
            '0',
            '0x',
          ]);

          await expect(
            context.lsp6KeyManager1
              .connect(context.accounts.owner1)
              .execute(callPayload(context.universalProfile1, lsp7TokenA.address, abi)),
          )
            .to.emit(lsp7TokenA, 'Transfer')
            .withArgs(
              context.universalProfile1.address,
              context.universalProfile1.address,
              ethers.constants.AddressZero,
              '0',
              false,
              '0x',
            );

          // CHECK that LSP5ReceivedAssets[] has not changed
          expect(
            await context.universalProfile1.getData(
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ),
          ).to.equal(lsp5ReceivedAssetsArrayLength);
        });
      });

      describe('when burning 10 tokenC (last token) from universalProfile1', () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData('burn', [
            context.universalProfile1.address,
            '10',
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenC.address, abi));
        });

        it('should update lsp5keys: arrayLength 2, no map, no tokenC address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenC.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000002',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal('0x');
        });
      });

      describe('when burning 10 tokenA (first token) from universalProfile1', () => {
        before(async () => {
          const abi = lsp7TokenA.interface.encodeFunctionData('burn', [
            context.universalProfile1.address,
            '10',
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenA.address, abi));
        });

        it('should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it('should update lsp5keys: arrayLength 1, no map, no tokenA address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenA.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000001',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });
      });

      describe('when burning 10 (half of the amount) tokenB from universalProfile1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('burn', [
            context.universalProfile1.address,
            '10',
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenB.address, abi));
        });
        it('should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('when burning 10 (remaining) tokenB from universalProfile1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('burn', [
            context.universalProfile1.address,
            '10',
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenB.address, abi));
        });
        it('should update lsp5keys: arrayLength 0, no map, no tokenB address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenB.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000000',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal('0x');
        });
      });
    });

    describe('when transferring tokens', () => {
      describe('when calling `transfer(...)` with `amount == 0` and `to == universalProfile`', () => {
        it('should revert', async () => {
          const lsp5ReceivedAssetsArrayLength = await context.universalProfile1['getData(bytes32)'](
            ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
          );

          await expect(
            lsp7TokenA
              .connect(context.accounts.random)
              .transfer(
                context.accounts.random.address,
                context.universalProfile1.address,
                0,
                false,
                '0x',
              ),
          )
            .to.emit(lsp7TokenA, 'Transfer')
            .withArgs(
              context.accounts.random.address,
              context.accounts.random.address,
              context.universalProfile1.address,
              0,
              false,
              '0x',
            );

          // CHECK that LSP5ReceivedAssets[] has not changed
          expect(
            await context.universalProfile1.getData(
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
            ),
          ).to.equal(lsp5ReceivedAssetsArrayLength);
        });
      });

      it('should fund the universalProfle with 10 tokens (each) to test token transfers (TokenA, TokenB, TokenC)', async () => {
        await lsp7TokenA
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, '10', false, '0x');

        await lsp7TokenB
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, '10', false, '0x');

        await lsp7TokenC
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, '10', false, '0x');
      });

      it('should register lsp5keys: arrayLength 3, index [1,2,3], [tokenA, tokenB, tokenC] addresses in UP1 ', async () => {
        const [indexInMapTokenA, interfaceIdTokenA, arrayLength, elementAddressTokenA] =
          await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenA);

        const [indexInMapTokenB, interfaceIdTokenB, , elementAddressTokenB] =
          await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenB);

        const [indexInMapTokenC, interfaceIdTokenC, , elementAddressTokenC] =
          await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenC);

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
            context.universalProfile1.address,
            context.universalProfile2.address,
            '10',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenA.address, abi));
        });

        it('should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenC);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });

        it('should update lsp5keys: arrayLength 2, no map, no tokenA address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenA.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000002',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp5keys: arrayLength 1, index 0, tokenA address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp7TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp7TokenA.address);
        });
      });

      describe('When transferring 5 (half of amount) token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('transfer', [
            context.universalProfile1.address,
            context.universalProfile2.address,
            '5',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenB.address, abi));
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it('should register lsp5keys: arrayLength 2, index 1, tokenB address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('When transferring 4 (few) token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('transfer', [
            context.universalProfile1.address,
            context.universalProfile2.address,
            '4',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenB.address, abi));
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('When transferring 1 (remaining) token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('transfer', [
            context.universalProfile1.address,
            context.universalProfile2.address,
            '1',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenB.address, abi));
        });

        it('should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenB.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000001',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp7TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp7TokenB.address);
        });
      });

      describe('When transferring 10 (all) token C from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp7TokenC.interface.encodeFunctionData('transfer', [
            context.universalProfile1.address,
            context.universalProfile2.address,
            '10',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp7TokenC.address, abi));
        });

        it('should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp7TokenB.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000001',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp5keys : arrayLength 3, index = 2, tokenC address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp7TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp7TokenC.address);
        });
      });

      describe('When transferring 1 (few) token B from UP2 to UP1', () => {
        before(async () => {
          const abi = lsp7TokenB.interface.encodeFunctionData('transfer', [
            context.universalProfile2.address,
            context.universalProfile1.address,
            '1',
            false,
            '0x',
          ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(callPayload(context.universalProfile2, lsp7TokenB.address, abi));
        });

        it('should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp7TokenB);
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
          context.universalProfile1.address,
          '1',
          '0x',
        ]);

        await context.lsp6KeyManager1
          .connect(context.accounts.owner1)
          .execute(callPayload(context.universalProfile1, lsp7TokenB.address, abi1));

        const abi2 = lsp7TokenB.interface.encodeFunctionData('burn', [
          context.universalProfile2.address,
          '9',
          '0x',
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          .execute(callPayload(context.universalProfile2, lsp7TokenB.address, abi2));

        const abi3 = lsp7TokenA.interface.encodeFunctionData('burn', [
          context.universalProfile2.address,
          '10',
          '0x',
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          .execute(callPayload(context.universalProfile2, lsp7TokenA.address, abi3));

        const abi4 = lsp7TokenC.interface.encodeFunctionData('burn', [
          context.universalProfile2.address,
          '10',
          '0x',
        ]);

        await context.lsp6KeyManager2
          .connect(context.accounts.owner2)
          .execute(callPayload(context.universalProfile2, lsp7TokenC.address, abi4));
      });
      it('should remove all lsp5 keys on both UP', async () => {
        const arrayLengthUP1 = await context.universalProfile1['getData(bytes32)'](
          ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
        );

        const arrayLengthUP2 = await context.universalProfile2['getData(bytes32)'](
          ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
        );

        expect(arrayLengthUP1).to.equal(ARRAY_LENGTH.ZERO);
        expect(arrayLengthUP2).to.equal(ARRAY_LENGTH.ZERO);
      });
    });

    describe('when UP does not have any balance of a LSP7 token and transfer with amount == 0', () => {
      let lsp7Token: LSP7Tester;

      before(async () => {
        lsp7Token = await new LSP7Tester__factory(context.accounts.random).deploy(
          'Example LSP7 token',
          'EL7T',
          context.accounts.random.address,
        );
      });

      it("should not revert and return 'LSP5: Error generating data key/value pairs' with empty LSP7 token transfer", async () => {
        const txParams = {
          from: context.universalProfile1.address,
          to: context.accounts.random.address,
          amount: 0,
          allowedNonLSP1Recipient: true,
          data: '0x',
        };

        const emptyTokenTransferPayload = lsp7Token.interface.encodeFunctionData('transfer', [
          txParams.from,
          txParams.to,
          txParams.amount,
          txParams.allowedNonLSP1Recipient,
          txParams.data,
        ]);

        const executePayload = context.universalProfile1.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          lsp7Token.address,
          0,
          emptyTokenTransferPayload,
        ]);

        const tx = context.lsp6KeyManager1.connect(context.accounts.owner1).execute(executePayload);

        const expectedReturnedValues = abiCoder.encode(
          ['bytes', 'bytes'],
          [
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('LSP5: Error generating data key/value pairs'),
            ),
            '0x',
          ],
        );

        // the call to the universalReceiver(...) in LSP7 sends the transfer details as `data` argument
        // all the params are packed/concatenated together.
        const expectedReceivedData = abiCoder.encode(
          ['address', 'address', 'uint256', 'bytes'],
          [txParams.from, txParams.to, txParams.amount, txParams.data],
        );

        // TODO: debug the 4th argument for the receivedData: why is it not empty?
        // receivedData = 0xa513e6e4b8f2a923d98304ec87f64353c4d5c8533c44cdddb6a900fa2b585dd299e03d12fa4293bc0000000000000000000000000000000000000000000000000000000000000000
        await expect(tx)
          .to.emit(context.universalProfile1, 'UniversalReceiver')
          .withArgs(
            lsp7Token.address,
            0,
            LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
            expectedReceivedData,
            expectedReturnedValues,
          );
      });
    });

    describe('when a non-LSP7 token contract calls the `universalReceiver(...)` function', () => {
      let notTokenContract: GenericExecutor;
      let notTokenContractWithBalanceOfFunction: GenericExecutorWithBalanceOfFunction;

      before(async () => {
        notTokenContract = await new GenericExecutor__factory(context.accounts.random).deploy();

        notTokenContractWithBalanceOfFunction =
          await new GenericExecutorWithBalanceOfFunction__factory(context.accounts.random).deploy();
      });

      describe('when a non-LSP7 token contract has `balanceOf(address)` functions', () => {
        it("should not revert and return 'LSP1: full balance is not sent' when calling with typeId == LSP7Tokens_SenderNotification", async () => {
          const universalReceiverPayload = context.universalProfile1.interface.encodeFunctionData(
            'universalReceiver',
            [LSP1_TYPE_IDS.LSP7Tokens_SenderNotification, '0x'],
          );

          // check that it does not revert
          await expect(
            await notTokenContractWithBalanceOfFunction.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            ),
          ).to.not.be.reverted;

          // check that it returns the correct string
          const universalReceiverResult =
            await notTokenContractWithBalanceOfFunction.callStatic.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            );

          const [genericExecutorResult] = abiCoder.decode(['bytes'], universalReceiverResult);

          const [resultDelegate] = abiCoder.decode(['bytes', 'bytes'], genericExecutorResult);

          expect(resultDelegate).to.equal(
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP1: full balance is not sent')),
          );

          // check that the correct string is emitted in the event
          await expect(
            notTokenContractWithBalanceOfFunction.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            ),
          )
            .to.emit(context.universalProfile1, 'UniversalReceiver')
            .withArgs(
              notTokenContractWithBalanceOfFunction.address,
              0,
              LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
              '0x',
              genericExecutorResult,
            );
        });
      });

      describe("when a non-LSP7 token contract doesn't have `balanceOf(address)` functions", () => {
        it("should not revert and return 'LSP1: `balanceOf(address)` function not found' when calling with typeId == LSP7Tokens_SenderNotification", async () => {
          const universalReceiverPayload = context.universalProfile1.interface.encodeFunctionData(
            'universalReceiver',
            [LSP1_TYPE_IDS.LSP7Tokens_SenderNotification, '0x'],
          );

          // check that it does not revert
          await expect(
            await notTokenContract.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            ),
          ).to.not.be.reverted;

          // check that it returns the correct string
          const universalReceiverResult = await notTokenContract.callStatic.call(
            context.universalProfile1.address,
            0,
            universalReceiverPayload,
          );

          const [genericExecutorResult] = abiCoder.decode(['bytes'], universalReceiverResult);

          const [resultDelegate] = abiCoder.decode(['bytes', 'bytes'], genericExecutorResult);

          expect(resultDelegate).to.equal(
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('LSP1: `balanceOf(address)` function not found'),
            ),
          );

          // check that the correct string is emitted in the event
          await expect(
            notTokenContract.call(context.universalProfile1.address, 0, universalReceiverPayload),
          )
            .to.emit(context.universalProfile1, 'UniversalReceiver')
            .withArgs(
              notTokenContract.address,
              0,
              LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
              '0x',
              genericExecutorResult,
            );
        });
      });
    });
  });

  describe('testing values set under `LSP5ReceivedAssets[]`', () => {
    let context: LSP1DelegateTestContext;
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

    describe('when `LSP5ReceivedAssets[]` length value is `max(uint128)`', () => {
      const lsp5ArrayLengthDataKey = ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length;

      // set the `LSP5ReceivedAssets[]` length value to the max(uint128)`
      const lsp5ArrayLengthDataValue = ethers.BigNumber.from(2).pow(128).sub(1);

      before(async () => {
        const setDataPayload = context.universalProfile1.interface.encodeFunctionData('setData', [
          lsp5ArrayLengthDataKey,
          lsp5ArrayLengthDataValue.toHexString(),
        ]);

        await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(setDataPayload);

        // check that the value was set correctly
        expect(await context.universalProfile1.getData(lsp5ArrayLengthDataKey)).to.equal(
          lsp5ArrayLengthDataValue,
        );
      });

      it('should revert when trying to transfer some tokens to UP but UP cannot register any more tokens', async () => {
        // try to transfer (= mint) some tokens to the UP
        // this should revert because the UP cannot register any more tokens
        await expect(token.mint(context.universalProfile1.address, 10_000, false, '0x'))
          .to.emit(context.universalProfile1, 'UniversalReceiver')
          .withArgs(
            token.address,
            0,
            LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification,
            abiCoder.encode(
              ['address', 'address', 'uint256', 'bytes'],
              [ethers.constants.AddressZero, context.universalProfile1.address, 10_000, '0x'],
            ),
            abiCoder.encode(
              ['bytes', 'bytes'],
              [
                ethers.utils.solidityPack(
                  ['string'],
                  ['LSP5: Error generating data key/value pairs'],
                ),
                '0x',
              ],
            ),
          );
      });
    });

    describe('when `LSP5ReceivedAssets[]` length value is `max(uint128) - 1`', () => {
      const lsp5ArrayLengthDataKey = ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length;

      // set the `LSP5ReceivedAssets[]` length value to the max(uint128)`
      const lsp5ArrayLengthDataValue = ethers.BigNumber.from(2).pow(128).sub(2);

      before(async () => {
        const setDataPayload = context.universalProfile1.interface.encodeFunctionData('setData', [
          lsp5ArrayLengthDataKey,
          lsp5ArrayLengthDataValue.toHexString(),
        ]);

        await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(setDataPayload);

        // check that the value was set correctly
        expect(await context.universalProfile1.getData(lsp5ArrayLengthDataKey)).to.equal(
          lsp5ArrayLengthDataValue,
        );
      });

      after(async () => {
        // cleanup and reset the `LSP5ReceivedAssets[]` length, index and map value to 0x
        const setDataPayload = context.universalProfile1.interface.encodeFunctionData(
          'setDataBatch',
          [
            [
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + '00'.repeat(16),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssetsMap'] + token.address.substring(2),
            ],
            ['0x', '0x', '0x'],
          ],
        );

        await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(setDataPayload);
      });

      it('should not revert when trying to transfer some tokens to UP and UP (can register ONLY ONE MORE more tokens)', async () => {
        // try to transfer (= mint) some tokens to the UP
        // this should not revert because the UP can register one more asset
        await token.mint(context.universalProfile1.address, 10_000, false, '0x');

        // check the `LSP5ReceivedAssets[]` length value was set correctly
        expect(await context.universalProfile1.getData(lsp5ArrayLengthDataKey)).to.equal(
          lsp5ArrayLengthDataValue.add(1),
        );

        const index = lsp5ArrayLengthDataValue.toHexString();

        const lsp5ArrayIndexDataKey =
          ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index + index.substring(2);

        // checksummed address of the token
        const storedAssetAddress = ethers.utils.getAddress(
          await context.universalProfile1.getData(lsp5ArrayIndexDataKey),
        );

        // Check the address of the token was added to the `LSP5ReceivedAssets[maxLength - 1]` key
        expect(storedAssetAddress).to.equal(token.address);

        // Check that the correct tuple (interfaceId, index) was set under LSP5ReceivedAssetsMap + token address
        expect(
          await context.universalProfile1.getData(
            ERC725YDataKeys.LSP5['LSP5ReceivedAssetsMap'] + token.address.substring(2),
          ),
        ).to.equal(
          ethers.utils.solidityPack(['bytes4', 'uint128'], [INTERFACE_IDS.LSP7DigitalAsset, index]),
        );
      });
    });

    describe('when the Map value of LSP5ReceivedAssetsMap is less than 20 bytes', () => {
      let tokenTransferTx: Transaction;
      let balance: BigNumber;

      before(async () => {
        await token
          .connect(context.accounts.owner1)
          .mint(context.universalProfile1.address, 100, false, '0x');

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .setData(
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + token.address.substring(2),
            '0xcafecafecafecafe',
          );

        expect(
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xcafecafecafecafe',
        ]);

        balance = await token.balanceOf(context.universalProfile1.address);

        const tokenTransferCalldata = token.interface.encodeFunctionData('transfer', [
          context.universalProfile1.address,
          context.accounts.owner1.address,
          balance,
          true,
          '0x',
        ]);

        tokenTransferTx = await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, token.address, 0, tokenTransferCalldata);
      });

      it('should pass', async () => {
        expect(tokenTransferTx).to.not.be.reverted;
      });

      it('should emit UniversalReceiver event', async () => {
        const tokensSentBytes32Value = ethers.utils.hexZeroPad(balance.toHexString(), 32);

        const tokenTransferData = abiCoder.encode(
          ['address', 'address', 'uint256', 'bytes'],
          [
            context.universalProfile1.address,
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
          .to.emit(context.universalProfile1, 'UniversalReceiver')
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
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
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
          .mint(context.universalProfile1.address, 100, false, '0x');

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .setData(
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + token.address.substring(2),
            '0xdaa746b700000000000000000000000000000000cafecafe',
          );

        expect(
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xdaa746b700000000000000000000000000000000cafecafe',
        ]);

        balance = await token.balanceOf(context.universalProfile1.address);

        const tokenTransferCalldata = token.interface.encodeFunctionData('transfer', [
          context.universalProfile1.address,
          context.accounts.owner1.address,
          balance,
          true,
          '0x',
        ]);

        tokenTransferTx = await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, token.address, 0, tokenTransferCalldata);
      });

      it('should pass', async () => {
        expect(tokenTransferTx).to.not.be.reverted;
      });

      it('should emit UniversalReceiver event', async () => {
        const tokensSentBytes32Value = ethers.utils.hexZeroPad(balance.toHexString(), 32);

        const tokenTransferData = abiCoder.encode(
          ['address', 'address', 'uint256', 'bytes'],
          [
            context.universalProfile1.address,
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
          .to.emit(context.universalProfile1, 'UniversalReceiver')
          .withArgs(
            token.address,
            0,
            LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
            tokenTransferData,
            lsp1ReturnedData,
          );
      });

      it('should not de-register the asset', async () => {
        // expect(
        //   await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        // ).to.deep.equal(['0x' + '00'.repeat(16), '0x', '0x']);

        expect(
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
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
          .mint(context.universalProfile1.address, 100, false, '0x');

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .setData(
            ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + token.address.substring(2),
            '0xcafecafecafecafecafecafecafecafecafecafe',
          );

        expect(
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xcafecafecafecafecafecafecafecafecafecafe',
        ]);

        balance = await token.balanceOf(context.universalProfile1.address);

        const tokenTransferCalldata = token.interface.encodeFunctionData('transfer', [
          context.universalProfile1.address,
          context.accounts.owner1.address,
          balance,
          true,
          '0x',
        ]);

        tokenTransferTx = await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, token.address, 0, tokenTransferCalldata);
      });

      it('should pass', async () => {
        expect(tokenTransferTx).to.not.be.reverted;
      });

      it('should emit UniversalReceiver event', async () => {
        const tokensSentBytes32Value = ethers.utils.hexZeroPad(balance.toHexString(), 32);

        const tokenTransferData = abiCoder.encode(
          ['address', 'address', 'uint256', 'bytes'],
          [
            context.universalProfile1.address,
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
          .to.emit(context.universalProfile1, 'UniversalReceiver')
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
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, assetMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          token.address.toLowerCase(),
          '0xcafecafecafecafecafecafecafecafecafecafe',
        ]);
      });
    });
  });

  describe('testing values set under `LSP10ReceivedVaults[]`', () => {
    let context: LSP1DelegateTestContext;
    let vault: LSP9Vault;
    let arrayKey: BytesLike;
    let arrayIndexKey: BytesLike;
    let vaultMapKey: BytesLike;

    before(async () => {
      // start with a fresh empty context
      context = await buildContext();

      vault = await new LSP9Vault__factory(context.accounts.random).deploy(
        context.accounts.owner1.address,
      );

      arrayKey = ERC725YDataKeys.LSP10['LSP10Vaults[]'].length;
      arrayIndexKey = ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '0'.repeat(32);
      vaultMapKey = ERC725YDataKeys.LSP10.LSP10VaultsMap + vault.address.substring(2);
    });

    describe('when the Map value of LSP10VaultsMap is less than 20 bytes', () => {
      let acceptOwnershipTx: Transaction;

      before(async () => {
        await vault
          .connect(context.accounts.owner1)
          .transferOwnership(context.universalProfile1.address);

        const acceptOwnershipCalldata = vault.interface.encodeFunctionData('acceptOwnership');

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, vault.address, 0, acceptOwnershipCalldata);

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .setData(
            ERC725YDataKeys.LSP10.LSP10VaultsMap + vault.address.substring(2),
            '0xcafecafecafecafe',
          );

        expect(
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, vaultMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          vault.address.toLowerCase(),
          '0xcafecafecafecafe',
        ]);

        const vaultTrasferCalldata = vault.interface.encodeFunctionData('transferOwnership', [
          context.accounts.owner1.address,
        ]);

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, vault.address, 0, vaultTrasferCalldata);

        acceptOwnershipTx = await vault.connect(context.accounts.owner1).acceptOwnership();
      });

      it('it should pass', async () => {
        expect(acceptOwnershipTx).to.not.be.reverted;
      });

      it('it should emit UniversalReceiver event', async () => {
        const lsp1ReturnedData = ethers.utils.defaultAbiCoder.encode(
          ['string', 'bytes'],
          ['LSP10: Error generating data key/value pairs', '0x'],
        );

        await expect(acceptOwnershipTx)
          .to.emit(context.universalProfile1, 'UniversalReceiver')
          .withArgs(
            vault.address,
            0,
            LSP1_TYPE_IDS.LSP9OwnershipTransferred_SenderNotification,
            abiCoder.encode(
              ['address', 'address'],
              [context.universalProfile1.address, context.accounts.owner1.address],
            ),
            lsp1ReturnedData,
          );
      });

      it("shouldn't de-register the asset", async () => {
        expect(
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, vaultMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          vault.address.toLowerCase(),
          '0xcafecafecafecafe',
        ]);
      });
    });

    describe('when the Map value of LSP10VaultsMap is bigger than 20 bytes, (valid `(byte4,uint128)` tuple  + extra bytes)', () => {
      let acceptOwnershipTx: Transaction;

      before(async () => {
        await vault
          .connect(context.accounts.owner1)
          .transferOwnership(context.universalProfile1.address);

        const acceptOwnershipCalldata = vault.interface.encodeFunctionData('acceptOwnership');

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, vault.address, 0, acceptOwnershipCalldata);

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .setData(
            ERC725YDataKeys.LSP10.LSP10VaultsMap + vault.address.substring(2),
            '0x28af17e600000000000000000000000000000000cafecafe',
          );

        expect(
          await context.universalProfile1.getDataBatch([
            ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
            ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '0'.repeat(32),
            ERC725YDataKeys.LSP10.LSP10VaultsMap + vault.address.substring(2),
          ]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          vault.address.toLowerCase(),
          '0x28af17e600000000000000000000000000000000cafecafe',
        ]);

        const vaultTrasferCalldata = vault.interface.encodeFunctionData('transferOwnership', [
          context.accounts.owner1.address,
        ]);

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, vault.address, 0, vaultTrasferCalldata);

        acceptOwnershipTx = await vault.connect(context.accounts.owner1).acceptOwnership();
      });

      it('it should pass', async () => {
        expect(acceptOwnershipTx).to.not.be.reverted;
      });

      it('it should emit UniversalReceiver event', async () => {
        const lsp1ReturnedData = ethers.utils.defaultAbiCoder.encode(
          ['string', 'bytes'],
          ['LSP10: Error generating data key/value pairs', '0x'],
        );

        await expect(acceptOwnershipTx)
          .to.emit(context.universalProfile1, 'UniversalReceiver')
          .withArgs(
            vault.address,
            0,
            LSP1_TYPE_IDS.LSP9OwnershipTransferred_SenderNotification,
            abiCoder.encode(
              ['address', 'address'],
              [context.universalProfile1.address, context.accounts.owner1.address],
            ),
            lsp1ReturnedData,
          );
      });

      it('should de-register the asset properly', async () => {
        // expect(
        //   await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, vaultMapKey]),
        // ).to.deep.equal(['0x' + '00'.repeat(16), '0x', '0x']);
        expect(
          await context.universalProfile1.getDataBatch([
            ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
            ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '0'.repeat(32),
            ERC725YDataKeys.LSP10.LSP10VaultsMap + vault.address.substring(2),
          ]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          vault.address.toLowerCase(),
          '0x28af17e600000000000000000000000000000000cafecafe',
        ]);
      });
    });

    describe('when the Map value of LSP10VaultsMap is 20 random bytes', () => {
      let acceptOwnershipTx: Transaction;

      before(async () => {
        await vault
          .connect(context.accounts.owner1)
          .transferOwnership(context.universalProfile1.address);

        const acceptOwnershipCalldata = vault.interface.encodeFunctionData('acceptOwnership');

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, vault.address, 0, acceptOwnershipCalldata);

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .setData(
            ERC725YDataKeys.LSP10.LSP10VaultsMap + vault.address.substring(2),
            '0xcafecafecafecafecafecafecafecafecafecafe',
          );

        expect(
          await context.universalProfile1.getDataBatch([
            ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
            ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '0'.repeat(32),
            ERC725YDataKeys.LSP10.LSP10VaultsMap + vault.address.substring(2),
          ]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          vault.address.toLowerCase(),
          '0xcafecafecafecafecafecafecafecafecafecafe',
        ]);

        const vaultTrasferCalldata = vault.interface.encodeFunctionData('transferOwnership', [
          context.accounts.owner1.address,
        ]);

        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, vault.address, 0, vaultTrasferCalldata);

        acceptOwnershipTx = await vault.connect(context.accounts.owner1).acceptOwnership();
      });

      it('it should pass', async () => {
        expect(acceptOwnershipTx).to.not.be.reverted;
      });

      it('it should emit UniversalReceiver event', async () => {
        const lsp1ReturnedData = ethers.utils.defaultAbiCoder.encode(
          ['string', 'bytes'],
          ['LSP10: Error generating data key/value pairs', '0x'],
        );

        await expect(acceptOwnershipTx)
          .to.emit(context.universalProfile1, 'UniversalReceiver')
          .withArgs(
            vault.address,
            0,
            LSP1_TYPE_IDS.LSP9OwnershipTransferred_SenderNotification,
            abiCoder.encode(
              ['address', 'address'],
              [context.universalProfile1.address, context.accounts.owner1.address],
            ),
            lsp1ReturnedData,
          );
      });

      it("shouldn't de-register the asset", async () => {
        expect(
          await context.universalProfile1.getDataBatch([arrayKey, arrayIndexKey, vaultMapKey]),
        ).to.deep.equal([
          '0x' + '00'.repeat(15) + '01',
          vault.address.toLowerCase(),
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
      describe('when minting tokenId 1 of tokenA to universalProfile1', () => {
        before(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData('mint', [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenA.address, abi));
        });

        it('should register lsp5keys: arrayLength 1, index 0, tokenA address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenA.address);
        });
      });

      describe('when minting tokenId 1 of tokenB to universalProfile1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('mint', [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenB.address, abi));
        });
        it('should register lsp5keys: arrayLength 2, index 1, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('when minting tokenId 2 of tokenB (another) to universalProfile1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('mint', [
            context.universalProfile1.address,
            TOKEN_ID.TWO,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenB.address, abi));
        });
        it('should keep the same lsp5keys: arrayLength 2, index 1, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('when minting tokenId 1 of tokenC to universalProfile1', () => {
        before(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData('mint', [
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenC.address, abi));
        });
        it('should register lsp5keys: arrayLength 3, index 2, tokenC address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });
      });
    });

    describe('when burning tokens', () => {
      describe('when burning tokenId 1 (all balance) of tokenC (last token) from universalProfile1', () => {
        before(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData('burn', [TOKEN_ID.ONE, '0x']);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenC.address, abi));
        });
        it('should update lsp5keys: arrayLength 2, no map, no tokenC address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenC.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000002',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal('0x');
        });
      });

      describe('when burning tokenId 1 (all balance) of tokenA (first token) from universalProfile1', () => {
        before(async () => {
          const abi = lsp8TokenA.interface.encodeFunctionData('burn', [TOKEN_ID.ONE, '0x']);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenA.address, abi));
        });

        it('should pop and swap TokenA with TokenB, lsp5keys (tokenB should become first token) : arrayLength 1, index = 0, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it('should update lsp5keys: arrayLength 1, no map, no tokenA address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenA.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000001',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });
      });

      describe('when burning 1 tokenId (not all balance) of tokenB from universalProfile1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('burn', [TOKEN_ID.ONE, '0x']);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenB.address, abi));
        });
        it('should keep the same lsp5keys: arrayLength 1, index 0, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('when burning all tokenB from universalProfile1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('burn', [TOKEN_ID.TWO, '0x']);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenB.address, abi));
        });
        it('should update lsp5keys: arrayLength 0, no map, no tokenB address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenB.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000000',
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
          .mint(context.universalProfile1.address, TOKEN_ID.ONE, false, '0x');

        // 3 tokenIds of TokenB
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, TOKEN_ID.ONE, false, '0x');
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, TOKEN_ID.TWO, false, '0x');
        await lsp8TokenB
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, TOKEN_ID.THREE, false, '0x');

        // 1 tokenId of TokenC
        await lsp8TokenC
          .connect(context.accounts.random)
          .mint(context.universalProfile1.address, TOKEN_ID.ONE, false, '0x');
      });

      it('should register lsp5keys: arrayLength 3, index [1,2,3], [tokenA, tokenB, tokenC] addresses in UP1 ', async () => {
        const [indexInMapTokenA, interfaceIdTokenA, arrayLength, elementAddressTokenA] =
          await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenA);

        const [indexInMapTokenB, interfaceIdTokenB, , elementAddressTokenB] =
          await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenB);

        const [indexInMapTokenC, interfaceIdTokenC, , elementAddressTokenC] =
          await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenC);

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
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenA.address, abi));
        });

        it('should pop and swap TokenA with TokenC, lsp5keys (tokenC should become first token) : arrayLength 1, index = 0, tokenC address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenC);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });

        it('should update lsp5keys: arrayLength 2, no map, no tokenA address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenA.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000002',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp5keys: arrayLength 1, index 0, tokenA address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp8TokenA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenA.address);
        });
      });

      describe('When transferring tokenId 1 (not all balance) of token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('transfer', [
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenB.address, abi));
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it('should register lsp5keys: arrayLength 2, index 1, tokenB address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('When transferring tokenId 2 (not all balance) of token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('transfer', [
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.TWO,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenB.address, abi));
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('When transferring tokenId 3 (remaining balance) of token B from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('transfer', [
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.THREE,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenB.address, abi));
        });

        it('should update lsp5keys (no pop and swap as TokenB has the last index): arrayLength 1, no map, no tokenB address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenB.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000001',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });

        it('should keep the same lsp5keys : arrayLength 2, index = 1, tokenB address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp8TokenB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });

      describe('When transferring tokenId 1 (all balance) of token C from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp8TokenC.interface.encodeFunctionData('transfer', [
            context.universalProfile1.address,
            context.universalProfile2.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp8TokenC.address, abi));
        });

        it('should update lsp5keys (no pop and swap as TokenC has the last index): arrayLength 0, no map, no tokenB address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP5.LSP5ReceivedAssetsMap + lsp8TokenB.address.substr(2),
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].length,
              ERC725YDataKeys.LSP5['LSP5ReceivedAssets[]'].index +
                '00000000000000000000000000000001',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp5keys : arrayLength 3, index = 2, tokenC address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile2, lsp8TokenC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp8TokenC.address);
        });
      });

      describe('When transferring 1 tokenId (not all balance) of token B from UP2 to UP1', () => {
        before(async () => {
          const abi = lsp8TokenB.interface.encodeFunctionData('transfer', [
            context.universalProfile2.address,
            context.universalProfile1.address,
            TOKEN_ID.ONE,
            false,
            '0x',
          ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(callPayload(context.universalProfile2, lsp8TokenB.address, abi));
        });

        it('should register lsp5keys (UP1 able to re-register keys) : arrayLength 1, index = 0, tokenB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP5MapAndArrayKeysValue(context.universalProfile1, lsp8TokenB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp8TokenB.address);
        });
      });
    });

    describe('when a non-LSP8 token contract calls the `universalReceiver(...)` function', () => {
      let notTokenContract: GenericExecutor;
      let notTokenContractWithBalanceOfFunction: GenericExecutorWithBalanceOfFunction;

      before(async () => {
        notTokenContract = await new GenericExecutor__factory(context.accounts.random).deploy();

        notTokenContractWithBalanceOfFunction =
          await new GenericExecutorWithBalanceOfFunction__factory(context.accounts.random).deploy();
      });

      describe('when a non-LSP8 token contract has `balanceOf(address)` functions', () => {
        it("should not revert and return 'LSP1: full balance is not sent' when calling with typeId == LSP8Tokens_SenderNotification", async () => {
          const universalReceiverPayload = context.universalProfile1.interface.encodeFunctionData(
            'universalReceiver',
            [LSP1_TYPE_IDS.LSP8Tokens_SenderNotification, '0x'],
          );

          // check that it does not revert
          await expect(
            await notTokenContractWithBalanceOfFunction.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            ),
          ).to.not.be.reverted;

          // check that it returns the correct string
          const universalReceiverResult =
            await notTokenContractWithBalanceOfFunction.callStatic.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            );

          const [genericExecutorResult] = abiCoder.decode(['bytes'], universalReceiverResult);

          const [resultDelegate] = abiCoder.decode(['bytes', 'bytes'], genericExecutorResult);

          expect(resultDelegate).to.equal(
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP1: full balance is not sent')),
          );

          // check that the correct string is emitted in the event
          await expect(
            await notTokenContractWithBalanceOfFunction.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            ),
          )
            .to.emit(context.universalProfile1, 'UniversalReceiver')
            .withArgs(
              notTokenContractWithBalanceOfFunction.address,
              0,
              LSP1_TYPE_IDS.LSP8Tokens_SenderNotification,
              '0x',
              genericExecutorResult,
            );
        });
      });

      describe("when a non-LSP8 token contract doesn't have `balanceOf(address)` functions", () => {
        it("should not revert and return 'LSP1: `balanceOf(address)` function not found' when calling with typeId == LSP8Tokens_SenderNotification", async () => {
          const universalReceiverPayload = context.universalProfile1.interface.encodeFunctionData(
            'universalReceiver',
            [LSP1_TYPE_IDS.LSP8Tokens_SenderNotification, '0x'],
          );

          // check that it does not revert
          await expect(
            await notTokenContract.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            ),
          ).to.not.be.reverted;

          // check that it returns the correct string
          const universalReceiverResult = await notTokenContract.callStatic.call(
            context.universalProfile1.address,
            0,
            universalReceiverPayload,
          );

          const [genericExecutorResult] = abiCoder.decode(['bytes'], universalReceiverResult);

          const [resultDelegate] = abiCoder.decode(['bytes', 'bytes'], genericExecutorResult);

          expect(resultDelegate).to.equal(
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('LSP1: `balanceOf(address)` function not found'),
            ),
          );

          // check that the correct string is emitted in the event
          await expect(
            await notTokenContract.call(
              context.universalProfile1.address,
              0,
              universalReceiverPayload,
            ),
          )
            .to.emit(context.universalProfile1, 'UniversalReceiver')
            .withArgs(
              notTokenContract.address,
              0,
              LSP1_TYPE_IDS.LSP8Tokens_SenderNotification,
              '0x',
              genericExecutorResult,
            );
        });
      });
    });
  });

  describe('when testing LSP9-Vault', () => {
    let lsp9VaultA: LSP9Vault, lsp9VaultB: LSP9Vault, lsp9VaultC: LSP9Vault;

    before(async () => {
      lsp9VaultA = await new LSP9Vault__factory(context.accounts.random).deploy(
        context.accounts.random.address,
      );

      lsp9VaultB = await new LSP9Vault__factory(context.accounts.random).deploy(
        context.accounts.random.address,
      );

      lsp9VaultC = await new LSP9Vault__factory(context.accounts.random).deploy(
        context.accounts.random.address,
      );
    });

    describe('when transferring ownership of vaults from EOA to UP', () => {
      describe('When transfering Ownership of VaultA to UP1', () => {
        before(async () => {
          await lsp9VaultA
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          const executePayload = context.universalProfile1.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp9VaultA.address,
            0,
            lsp9VaultA.interface.getSighash('acceptOwnership'),
          ]);

          await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(executePayload);
        });

        it('should register lsp10key: arrayLength 1, index 0, VaultA address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile1, lsp9VaultA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp9VaultA.address);
        });
      });

      describe('When transfering Ownership of VaultB to UP1', () => {
        before(async () => {
          await lsp9VaultB
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          const executePayload = context.universalProfile1.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp9VaultB.address,
            0,
            lsp9VaultB.interface.getSighash('acceptOwnership'),
          ]);

          await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(executePayload);
        });

        it('should register lsp10key: arrayLength 1, index 0, VaultA address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile1, lsp9VaultB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp9VaultB.address);
        });
      });

      describe('When transfering Ownership of VaultC to UP1', () => {
        before(async () => {
          await lsp9VaultC
            .connect(context.accounts.random)
            .transferOwnership(context.universalProfile1.address);

          const executePayload = context.universalProfile1.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp9VaultC.address,
            0,
            lsp9VaultC.interface.getSighash('acceptOwnership'),
          ]);

          await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(executePayload);
        });

        it('should register lsp10key: arrayLength 1, index 0, VaultA address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile1, lsp9VaultC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp9VaultC.address);
        });
      });
    });

    describe('when transferring ownership of vaults from UP to UP', () => {
      describe('When transfering Ownership of VaultA from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp9VaultA.interface.encodeFunctionData('transferOwnership', [
            context.universalProfile2.address,
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp9VaultA.address, abi));

          const executePayload = context.universalProfile2.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp9VaultA.address,
            0,
            lsp9VaultA.interface.getSighash('acceptOwnership'),
          ]);

          await context.lsp6KeyManager2.connect(context.accounts.owner2).execute(executePayload);
        });

        it('should pop and swap VaultA with VaultC, lsp10keys (VaultC should become first vault) : arrayLength 2, index = 0, VaultC address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile1, lsp9VaultC);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp9VaultC.address);
        });

        it('should register lsp10key: arrayLength 1, index 0, VaultA address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile2, lsp9VaultA);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp9VaultA.address);
        });
      });

      describe('When transfering Ownership of VaultB from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp9VaultB.interface.encodeFunctionData('transferOwnership', [
            context.universalProfile2.address,
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp9VaultB.address, abi));

          const executePayload = context.universalProfile2.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp9VaultB.address,
            0,
            lsp9VaultB.interface.getSighash('acceptOwnership'),
          ]);

          await context.lsp6KeyManager2.connect(context.accounts.owner2).execute(executePayload);
        });

        it('should update lsp10keys (no pop and swap as VaultB has the last index): arrayLength 1, no map, no VaultB address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP10.LSP10VaultsMap + lsp9VaultB.address.substr(2),
              ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
              ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '00000000000000000000000000000001',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp10key: arrayLength 2, index 1, VaultB address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile2, lsp9VaultB);
          expect(indexInMap).to.equal(1);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
          expect(elementAddress).to.equal(lsp9VaultB.address);
        });
      });

      describe('When transfering Ownership of VaultC from UP1 to UP2', () => {
        before(async () => {
          const abi = lsp9VaultC.interface.encodeFunctionData('transferOwnership', [
            context.universalProfile2.address,
          ]);

          await context.lsp6KeyManager1
            .connect(context.accounts.owner1)
            .execute(callPayload(context.universalProfile1, lsp9VaultC.address, abi));

          const executePayload = context.universalProfile2.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp9VaultC.address,
            0,
            lsp9VaultC.interface.getSighash('acceptOwnership'),
          ]);

          await context.lsp6KeyManager2.connect(context.accounts.owner2).execute(executePayload);
        });

        it('should remove all lsp10keys : arrayLength 0, no map, no VaultC address in UP1', async () => {
          const [mapValue, arrayLength, elementAddress] =
            await context.universalProfile1.getDataBatch([
              ERC725YDataKeys.LSP10.LSP10VaultsMap + lsp9VaultB.address.substr(2),
              ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
              ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '00000000000000000000000000000000',
            ]);

          expect(mapValue).to.equal('0x');
          expect(arrayLength).to.equal(ARRAY_LENGTH.ZERO);
          expect(elementAddress).to.equal('0x');
        });

        it('should register lsp10key: arrayLength 3, index 2, VaultC address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile2, lsp9VaultC);
          expect(indexInMap).to.equal(2);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.THREE);
          expect(elementAddress).to.equal(lsp9VaultC.address);
        });
      });

      describe('When transferring Ownership of VaultB from UP2 to UP1', () => {
        before(async () => {
          const abi = lsp9VaultB.interface.encodeFunctionData('transferOwnership', [
            context.universalProfile1.address,
          ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(callPayload(context.universalProfile2, lsp9VaultB.address, abi));

          const executePayload = context.universalProfile1.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp9VaultB.address,
            0,
            lsp9VaultB.interface.getSighash('acceptOwnership'),
          ]);

          await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(executePayload);
        });
        it('should register lsp10key (UP1 able to re-write) : arrayLength 1, index 0, VaultB address in UP1', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile1, lsp9VaultB);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp9VaultB.address);
        });
      });
    });

    describe('when transferring ownership of vaults from UP to EOA', () => {
      describe('When transfering Ownership of VaultA from UP2 to EOA', () => {
        before(async () => {
          const abi = lsp9VaultA.interface.encodeFunctionData('transferOwnership', [
            context.accounts.any.address,
          ]);

          await context.lsp6KeyManager2
            .connect(context.accounts.owner2)
            .execute(callPayload(context.universalProfile2, lsp9VaultA.address, abi));

          await lsp9VaultA.connect(context.accounts.any).acceptOwnership();
        });

        it('should pop and swap VaultA with VaultC, lsp10keys (VaultC should become first vault) : arrayLength 1, index = 0, VaultC address in UP2', async () => {
          const [indexInMap, interfaceId, arrayLength, elementAddress] =
            await getLSP10MapAndArrayKeysValue(context.universalProfile2, lsp9VaultC);
          expect(indexInMap).to.equal(0);
          expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
          expect(arrayLength).to.equal(ARRAY_LENGTH.ONE);
          expect(elementAddress).to.equal(lsp9VaultC.address);
        });
      });
    });

    describe('When renouncing ownership of a vault from UP2', () => {
      let tx: Transaction;
      let someVault: LSP9Vault;
      let dataKeys: string[];
      let dataValues: string[];

      before(async () => {
        let LSP10ArrayLength = await context.universalProfile2.getData(
          ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
        );

        if (LSP10ArrayLength === '0x') {
          LSP10ArrayLength = ARRAY_LENGTH.ZERO;
        }

        someVault = await new LSP9Vault__factory(context.accounts.random).deploy(
          context.universalProfile2.address,
        );

        dataKeys = [
          ERC725YDataKeys.LSP10.LSP10VaultsMap + someVault.address.substring(2),
          ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
          ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + LSP10ArrayLength.substring(2),
        ];

        dataValues = [
          INTERFACE_IDS.LSP9Vault + LSP10ArrayLength.substring(2),
          `0x${ethers.BigNumber.from(LSP10ArrayLength)
            .add(1)
            .toHexString()
            .substring(2)
            .padStart(32, '00')}`,
          someVault.address,
        ];

        expect(await context.universalProfile2.getDataBatch(dataKeys)).to.deep.equal(dataValues);

        const renounceOwnershipCalldata =
          someVault.interface.encodeFunctionData('renounceOwnership');

        // Skip 1000 blocks
        await network.provider.send('hardhat_mine', [ethers.utils.hexValue(1000)]);

        // Call renounceOwnership for the first time
        await context.universalProfile2
          .connect(context.accounts.owner2)
          .execute(OPERATION_TYPES.CALL, someVault.address, 0, renounceOwnershipCalldata);

        // Skip 199 block to reach the time where renouncing ownership can happen
        await network.provider.send('hardhat_mine', [ethers.utils.hexValue(199)]);

        tx = await context.universalProfile2
          .connect(context.accounts.owner2)
          .execute(OPERATION_TYPES.CALL, someVault.address, 0, renounceOwnershipCalldata);
      });

      it('Should emit `UnviersalReceiver` event', async () => {
        // Call renounceOwnership for the second time
        expect(tx)
          .to.emit(context.universalProfile2, 'UniversalReceiver')
          .withArgs(
            someVault.address,
            0,
            LSP1_TYPE_IDS.LSP9OwnershipTransferred_SenderNotification,
            '0x',
            ethers.utils.defaultAbiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
          );
      });

      it('should remove the LSP10 data keys assigned for `someVault`', async () => {
        expect(await context.universalProfile2.getDataBatch(dataKeys)).to.deep.equal([
          '0x',
          `0x${ethers.BigNumber.from(dataValues[1])
            .sub(1)
            .toHexString()
            .substring(2)
            .padStart(32, '00')}`,
          '0x',
        ]);
      });
    });

    describe('when deploying vault to a UP directly', () => {
      let lsp9VaultD: LSP9Vault;

      before(async () => {
        lsp9VaultD = await new LSP9Vault__factory(context.accounts.random).deploy(
          context.universalProfile1.address,
        );
      });

      it('should register the data key relevant to the vault deployed in the UP storage', async () => {
        const [indexInMap, interfaceId, arrayLength, elementAddress] =
          await getLSP10MapAndArrayKeysValue(context.universalProfile1, lsp9VaultD);

        expect(indexInMap).to.equal(1);
        expect(interfaceId).to.equal(INTERFACE_IDS.LSP9Vault);
        expect(arrayLength).to.equal(ARRAY_LENGTH.TWO);
        expect(elementAddress).to.equal(lsp9VaultD.address);
      });
    });

    describe('testing values stored under `LSP10Vaults[]` array length', () => {
      before(async () => {
        // start with a new setup
        context = await buildContext();
      });

      it('should revert if `LSP10Vaults[]` vault value is the max `uint128`', async () => {
        const maxUint128 = ethers.BigNumber.from(2).pow(128).sub(1).toHexString();

        const key = ERC725YDataKeys.LSP10['LSP10Vaults[]'].length;
        const value = maxUint128;

        // force settingup on the UP
        await context.lsp6KeyManager1
          .connect(context.accounts.owner1)
          .execute(context.universalProfile1.interface.encodeFunctionData('setData', [key, value]));

        // check that LSP10Vaults[] length is set to maxUint128
        expect(await context.universalProfile1.getData(key)).to.equal(maxUint128);

        // deploy a Vault setting the UP as owner
        // this should revert because the UP has already the max number of vaults allowed

        const tx = await new LSP9Vault__factory(context.accounts.random).deploy(
          context.universalProfile1.address,
        );

        await expect(tx.deployTransaction)
          .to.emit(context.universalProfile1, 'UniversalReceiver')
          .withArgs(
            tx.address,
            0,
            LSP1_TYPE_IDS.LSP9OwnershipTransferred_RecipientNotification,
            '0x',
            ethers.utils.defaultAbiCoder.encode(
              ['string', 'bytes'],
              ['LSP10: Error generating data key/value pairs', '0x'],
            ),
          );
      });
    });
  });

  describe('when a UP owns a LSP9Vault before having a URD set', () => {
    let testContext: LSP6TestContext;
    let vault: LSP9Vault;
    let lsp1Delegate: LSP1UniversalReceiverDelegateUP;

    before(async () => {
      const signerAddresses = await ethers.getSigners();
      const profileOwner = signerAddresses[0];

      //   1. deploy a UP with a Key Manager but NOT a URD
      const deployedUniversalProfile = await new UniversalProfile__factory(profileOwner).deploy(
        profileOwner.address,
      );
      const deployedKeyManager = await new LSP6KeyManager__factory(profileOwner).deploy(
        deployedUniversalProfile.address,
      );

      testContext = {
        accounts: signerAddresses,
        mainController: profileOwner,
        universalProfile: deployedUniversalProfile,
        keyManager: deployedKeyManager,
      };

      await setupKeyManager(testContext, [], []);

      // 2. deploy a Vault owned by the UP
      vault = await new LSP9Vault__factory(profileOwner).deploy(deployedUniversalProfile.address);

      // 3. deploy a URD and set its address on the UP storage under the LSP1Delegate data key
      lsp1Delegate = await new LSP1UniversalReceiverDelegateUP__factory(profileOwner).deploy();

      const setLSP1DelegatePayload = testContext.universalProfile.interface.encodeFunctionData(
        'setData',
        [ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate, lsp1Delegate.address],
      );

      await testContext.keyManager
        .connect(testContext.mainController)
        .execute(setLSP1DelegatePayload);
    });

    it('check that the LSP9Vault address is not set under LSP10', async () => {
      const lsp10VaultArrayLengthValue = await testContext.universalProfile['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
      );

      expect(lsp10VaultArrayLengthValue).to.equal('0x');

      const lsp10VaultArrayIndexValue = await testContext.universalProfile['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '00'.repeat(16),
      );

      expect(lsp10VaultArrayIndexValue).to.equal('0x');

      const lsp10VaultMapValue = await testContext.universalProfile['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10VaultsMap'] + vault.address.substring(2),
      );

      expect(lsp10VaultMapValue).to.equal('0x');
    });

    it("check that the LSP1Delegate address is set in the UP's storage", async () => {
      const result = await testContext.universalProfile.getData(
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
      );
      // checksum the address
      expect(ethers.utils.getAddress(result)).to.equal(lsp1Delegate.address);
    });

    describe('when transfering + accepting ownership of the Vault', () => {
      it("should not revert and return the string 'LSP1: asset not registered'", async () => {
        const newVaultOwner = testContext.accounts[1];

        // 4. transfer ownership of the Vault to another address
        const transferOwnershipPayload = vault.interface.encodeFunctionData('transferOwnership', [
          newVaultOwner.address,
        ]);

        const executePayload = testContext.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, vault.address, 0, transferOwnershipPayload],
        );

        await testContext.keyManager.connect(testContext.mainController).execute(executePayload);

        // check that the new vault owner is the pending owner
        expect(await vault.pendingOwner()).to.equal(newVaultOwner.address);

        const expectedReturnedValues = abiCoder.encode(
          ['bytes', 'bytes'],
          [
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('LSP10: Error generating data key/value pairs'),
            ),
            '0x',
          ],
        );

        // 5. accept ownership of the Vault
        const acceptOwnershipTx = vault.connect(newVaultOwner).acceptOwnership();

        await expect(acceptOwnershipTx)
          .to.emit(testContext.universalProfile, 'UniversalReceiver')
          .withArgs(
            vault.address,
            0,
            LSP1_TYPE_IDS.LSP9OwnershipTransferred_SenderNotification,
            abiCoder.encode(
              ['address', 'address'],
              [testContext.universalProfile.address, newVaultOwner.address],
            ),
            expectedReturnedValues,
          );

        // check that the new vault owner is the owner
        expect(await vault.owner()).to.equal(newVaultOwner.address);

        // check that LSP10 data keys are still empty
        const lsp10VaultArrayLengthValue = await testContext.universalProfile['getData(bytes32)'](
          ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
        );

        expect(lsp10VaultArrayLengthValue).to.equal('0x');

        const lsp10VaultMapValue = await testContext.universalProfile['getData(bytes32)'](
          ERC725YDataKeys.LSP10['LSP10VaultsMap'] + vault.address.substring(2),
        );

        expect(lsp10VaultMapValue).to.equal('0x');
      });
    });
  });

  describe("when having a Vault set in LSP10 before it's ownership was transfered", () => {
    let vault: LSP9Vault;
    let vaultOwner: SignerWithAddress;
    const bytes16Value1 = '0x' + '00'.repeat(15) + '01';

    before(async () => {
      vaultOwner = context.accounts.any;

      // 1. deploy a Vault owned by someone else
      vault = await new LSP9Vault__factory(vaultOwner).deploy(vaultOwner.address);

      // 2. set the address of the Vault in the UP's storage under the LSP10 data keys
      const lsp10DataKeys = [
        ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
        ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '00'.repeat(16),
        ERC725YDataKeys.LSP10['LSP10VaultsMap'] + vault.address.substring(2),
      ];
      const lsp10DataValues = [
        bytes16Value1,
        vault.address,
        abiCoder.encode(['bytes4', 'uint64'], [INTERFACE_IDS.LSP9Vault, 0]),
      ];

      const setLSP10VaultPayload = context.universalProfile1.interface.encodeFunctionData(
        'setDataBatch',
        [lsp10DataKeys, lsp10DataValues],
      );

      await context.lsp6KeyManager1.connect(context.accounts.owner1).execute(setLSP10VaultPayload);
    });

    it('check that the vault owner', async () => {
      expect(await vault.owner()).to.equal(vaultOwner.address);
    });

    it("check that the LSP10Vault address is set in the UP's storage", async () => {
      const lsp10VaultArrayLengthValue = await context.universalProfile1['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
      );

      expect(lsp10VaultArrayLengthValue).to.equal(bytes16Value1);

      const lsp10VaultArrayIndexValue = await context.universalProfile1['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '00'.repeat(16),
      );

      // checksum the address
      expect(ethers.utils.getAddress(lsp10VaultArrayIndexValue)).to.equal(vault.address);

      const lsp10VaultMapValue = await context.universalProfile1['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10VaultsMap'] + vault.address.substring(2),
      );

      expect(lsp10VaultMapValue).to.equal(
        abiCoder.encode(['bytes4', 'uint64'], [INTERFACE_IDS.LSP9Vault, 0]),
      );
    });

    it("should not revert and return the string 'LSP10: Error generating data key/value pairs'", async () => {
      // 1. transfer ownership of the vault to the UP
      await vault.connect(vaultOwner).transferOwnership(context.universalProfile1.address);

      // check that the UP is the pending owner of the vault
      expect(await vault.pendingOwner()).to.equal(context.universalProfile1.address);

      // 2. UP accepts ownership of the vault
      const acceptOwnershipPayload = vault.interface.getSighash('acceptOwnership');

      const executePayload = context.universalProfile1.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        vault.address,
        0,
        acceptOwnershipPayload,
      ]);

      const acceptOwnershipTx = await context.lsp6KeyManager1
        .connect(context.accounts.owner1)
        .execute(executePayload);

      // check that the UP is now the owner of the vault
      expect(await vault.owner()).to.equal(context.universalProfile1.address);

      const expectedReturnedValues = abiCoder.encode(
        ['bytes', 'bytes'],
        [
          ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes('LSP10: Error generating data key/value pairs'),
          ),
          '0x',
        ],
      );

      // check that the right return string is emitted in the UniversalReceiver event
      await expect(acceptOwnershipTx)
        .to.emit(context.universalProfile1, 'UniversalReceiver')
        .withArgs(
          vault.address,
          0,
          LSP1_TYPE_IDS.LSP9OwnershipTransferred_RecipientNotification,
          abiCoder.encode(
            ['address', 'address'],
            [vaultOwner.address, context.universalProfile1.address],
          ),
          expectedReturnedValues,
        );

      // check that the LSP10Vault address is still set in the UP's storage
      // and that the address is not duplicated
      const lsp10VaultArrayLengthValue = await context.universalProfile1['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10Vaults[]'].length,
      );

      expect(lsp10VaultArrayLengthValue).to.equal(bytes16Value1);

      const lsp10VaultArrayIndexValue = await context.universalProfile1['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10Vaults[]'].index + '00'.repeat(16),
      );

      // checksum the address
      expect(ethers.utils.getAddress(lsp10VaultArrayIndexValue)).to.equal(vault.address);

      const lsp10VaultMapValue = await context.universalProfile1['getData(bytes32)'](
        ERC725YDataKeys.LSP10['LSP10VaultsMap'] + vault.address.substring(2),
      );

      expect(lsp10VaultMapValue).to.equal(
        abiCoder.encode(['bytes4', 'uint64'], [INTERFACE_IDS.LSP9Vault, 0]),
      );
    });
  });

  describe('when UP is owner by an EOA', () => {
    before('deploying new URD', async () => {
      // Transfer ownership of UP1 to EOA1
      await context.universalProfile1
        .connect(context.accounts.owner1)
        .transferOwnership(context.accounts.owner1.address);

      await context.universalProfile1.connect(context.accounts.owner1).acceptOwnership();

      // Transfer ownership of UP2 to EOA2
      await context.universalProfile2
        .connect(context.accounts.owner2)
        .transferOwnership(context.accounts.owner2.address);

      await context.universalProfile2.connect(context.accounts.owner2).acceptOwnership();
    });

    describe('when receiving LSP7', () => {
      it('should not revert', async () => {
        // Deploy LSP7 (mint on SC level 1000 tokens)
        const LSP7 = await new LSP7MintWhenDeployed__factory(context.accounts.owner1).deploy(
          'MyToken',
          'MTK',
          context.universalProfile1.address,
        );

        expect(await LSP7.balanceOf(context.universalProfile1.address)).to.equal(1000);
        expect(await LSP7.balanceOf(context.universalProfile2.address)).to.equal(0);

        // Encode LSP7 tokens tarnsfer (UP1 to UP2)
        const LSP7_TransferCalldata = LSP7.interface.encodeFunctionData('transfer', [
          context.universalProfile1.address,
          context.universalProfile2.address,
          1,
          false,
          '0x',
        ]);

        // Transfer LSP7 tokens
        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, LSP7.address, 0, LSP7_TransferCalldata);

        expect(await LSP7.balanceOf(context.universalProfile1.address)).to.equal(999);
        expect(await LSP7.balanceOf(context.universalProfile2.address)).to.equal(1);
      });
    });

    describe('when receiving LSP8', () => {
      it('should not revert', async () => {
        // Deploy LSP8
        const LSP8 = await new LSP8Tester__factory(context.accounts.owner1).deploy(
          'MyToken',
          'MTK',
          context.universalProfile1.address,
          LSP8_TOKEN_ID_TYPES.NUMBER,
        );
        // Mint token for UP1
        await LSP8.mint(context.universalProfile1.address, '0x' + '0'.repeat(64), true, '0x');

        expect(await LSP8.tokenOwnerOf('0x' + '0'.repeat(64))).to.equal(
          context.universalProfile1.address,
        );

        // Encode LSP8 token tarnsfer (UP1 to UP2)
        const LSP8_TransferCalldata = LSP8.interface.encodeFunctionData('transfer', [
          context.universalProfile1.address,
          context.universalProfile2.address,
          '0x' + '0'.repeat(64),
          false,
          '0x',
        ]);

        // Transfer LSP8 token
        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, LSP8.address, 0, LSP8_TransferCalldata);

        expect(await LSP8.tokenOwnerOf('0x' + '0'.repeat(64))).to.equal(
          context.universalProfile2.address,
        );
      });
    });

    describe('when becoming the owner of the LSP9 Vault', () => {
      it('should not revert', async () => {
        // Deploy LSP9 (UP1 ownwer)
        const LSP9 = await new LSP9Vault__factory(context.accounts.owner1).deploy(
          context.universalProfile1.address,
        );

        expect(await LSP9.owner()).to.equal(context.universalProfile1.address);

        // Encode LSP9 transfer & accept ownership (UP1 to UP2)
        const LSP9_TransferOwnerhsipCalldata = LSP9.interface.encodeFunctionData(
          'transferOwnership',
          [context.universalProfile2.address],
        );
        const LSP9_AcceptOwnerhsipCalldata = LSP9.interface.encodeFunctionData('acceptOwnership');

        // Transfer Ownership of LSP9
        await context.universalProfile1
          .connect(context.accounts.owner1)
          .execute(OPERATION_TYPES.CALL, LSP9.address, 0, LSP9_TransferOwnerhsipCalldata);

        // Accept Ownership of LSP9
        await context.universalProfile2
          .connect(context.accounts.owner2)
          .execute(OPERATION_TYPES.CALL, LSP9.address, 0, LSP9_AcceptOwnerhsipCalldata);

        expect(await LSP9.owner()).to.equal(context.universalProfile2.address);
      });
    });
  });
};

export type LSP1DelegateInitializeTestContext = {
  lsp1universalReceiverDelegateUP: LSP1UniversalReceiverDelegateUP;
};

export const shouldInitializeLikeLSP1Delegate = (
  buildContext: () => Promise<LSP1DelegateInitializeTestContext>,
) => {
  let context: LSP1DelegateInitializeTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('should have registered the ERC165 interface', async () => {
      const result = await context.lsp1universalReceiverDelegateUP.supportsInterface(
        INTERFACE_IDS.ERC165,
      );
      expect(result).to.be.true;
    });

    it('should have registered the LSP1 interface', async () => {
      const result = await context.lsp1universalReceiverDelegateUP.supportsInterface(
        INTERFACE_IDS.LSP1UniversalReceiverDelegate,
      );
      expect(result).to.be.true;
    });
  });
};
