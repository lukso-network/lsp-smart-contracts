import { ethers } from 'hardhat';
import { expect } from 'chai';
import { BytesLike } from 'ethers';
import { LSP6InternalsTestContext } from '../../utils/context';
import { encodeCompactBytesArray } from '../../utils/helpers';

export type DataKey = {
  length: BytesLike;
  key: BytesLike;
};

export const testAllowedERC725YDataKeysInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>,
) => {
  describe('Testing CheckAllowedERC725YDataKeys', () => {
    let context: LSP6InternalsTestContext;

    let dataKeys: {
      firstDynamicKey: DataKey;
      secondDynamicKey: DataKey;
      thirdDynamicKey: DataKey;
      fourthDynamicKey: DataKey;
      firstFixedKey: DataKey;
      secondFixedKey: DataKey;
      thirdFixedKey: DataKey;
      fourthFixedKey: DataKey;
    };

    let dataKeysToReturn: BytesLike[];
    let compactBytesArray_2d: BytesLike;
    let compactBytesArray_2f: BytesLike;
    let compactBytesArray_2d_2f: BytesLike;
    let compactBytesArray_mixed_d_f: BytesLike;

    before(async () => {
      context = await buildContext();

      dataKeys = {
        firstDynamicKey: {
          length: '0x0011',
          key: '0xaf449139942203369080622073bf7f2dab',
        },
        secondDynamicKey: {
          length: '0x0001',
          key: '0x1c',
        },
        thirdDynamicKey: {
          length: '0x001c',
          key: '0x4f042128e305e375c54b8782c3f9f1bde93f3586649d48db9c68beef',
        },
        fourthDynamicKey: {
          length: '0x0015',
          key: '0xe6e8c1d23558e2a87caf19b7cc928eff323881d3e6',
        },
        firstFixedKey: {
          length: '0x0020',
          key: '0xcbfb606f69bb97c04cbaea2a8b7cb13a2e229fafa3fb3be6db11d96ee3add114',
        },
        secondFixedKey: {
          length: '0x0020',
          key: '0xa2c116feaaf87e499ac78081e8ce74b0a85627265144d605904971a89f81220a',
        },
        thirdFixedKey: {
          length: '0x0020',
          key: '0x7b68176ed8c5774f16c8040df3f2c4aac9959612242613785716c4263670fe18',
        },
        fourthFixedKey: {
          length: '0x0020',
          key: '0x2b58178172d258515ef1d9e7c467f6f6a09510e863ef5ad383dbfc50721183df',
        },
      };

      dataKeysToReturn = [
        '0x6fae27edb0b5020ca98b9af9014331fcc79241c7f12d6afbcaea07f00e53b45d',
        '0xfd63b8f031e1f4c43fbb4956e08c686aa350a051d4d3e77a1e1c7f70366207b2',
        '0xf4fafa18dc0e9916a17a5d14b39a4dc68fb56cfaf964aceca8456b424331adb4',
        '0x92f9ce0fd87f5477d0aec48786bfebf80a51700879505dea17852f0777b114d3',
        '0x0c02c965d192a6666110f3806dc2cd489ce2f7ca43f08a9ff33ad74d2fb30dc7',
        '0x108eae0761cc2f55fab5acf94bc557dd0e550e60be19de83c513cd17821227a8',
        '0xe2bfbedc99949767be4c79d5d10deaffc1c207560d29e4070f450faabb562d3b',
        '0xe5f29667509d955384331154d9fa3b9e53ae230c44e722983a42f4d9608ef9b6',
        '0x9fedfe7c7366c70c52b6f11531196d0c5baa77abd16117ae30dc4eeb16dd6da2',
        '0x8741530fb57ca8556c5e7b45ffac62c178d8c0ff070ff1c99652e3f099997fa6',
      ];

      compactBytesArray_2d =
        dataKeys.firstDynamicKey.length +
        dataKeys.firstDynamicKey.key.toString().substring(2) +
        dataKeys.secondDynamicKey.length.toString().substring(2) +
        dataKeys.secondDynamicKey.key.toString().substring(2);

      compactBytesArray_2f =
        dataKeys.firstFixedKey.length +
        dataKeys.firstFixedKey.key.toString().substring(2) +
        dataKeys.secondFixedKey.length.toString().substring(2) +
        dataKeys.secondFixedKey.key.toString().substring(2);

      compactBytesArray_2d_2f =
        dataKeys.firstDynamicKey.length +
        dataKeys.firstDynamicKey.key.toString().substring(2) +
        dataKeys.secondDynamicKey.length.toString().substring(2) +
        dataKeys.secondDynamicKey.key.toString().substring(2) +
        dataKeys.firstFixedKey.length.toString().substring(2) +
        dataKeys.firstFixedKey.key.toString().substring(2) +
        dataKeys.secondFixedKey.length.toString().substring(2) +
        dataKeys.secondFixedKey.key.toString().substring(2);

      compactBytesArray_mixed_d_f =
        dataKeys.firstDynamicKey.length +
        dataKeys.firstDynamicKey.key.toString().substring(2) +
        dataKeys.firstFixedKey.length.toString().substring(2) +
        dataKeys.firstFixedKey.key.toString().substring(2) +
        dataKeys.secondDynamicKey.length.toString().substring(2) +
        dataKeys.secondDynamicKey.key.toString().substring(2) +
        dataKeys.thirdDynamicKey.length.toString().substring(2) +
        dataKeys.thirdDynamicKey.key.toString().substring(2) +
        dataKeys.secondFixedKey.length.toString().substring(2) +
        dataKeys.secondFixedKey.key.toString().substring(2) +
        dataKeys.fourthDynamicKey.length.toString().substring(2) +
        dataKeys.fourthDynamicKey.key.toString().substring(2) +
        dataKeys.thirdFixedKey.length.toString().substring(2) +
        dataKeys.thirdFixedKey.key.toString().substring(2);
    });

    describe('`isCompactBytesArrayOfAllowedERC725YDataKeys(..)`', () => {
      it('should return `false` if element is 0x0000 (zero length elements not allowed)', async () => {
        const allowedERC25YDataKeys = '0x0000';
        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedERC725YDataKeys(
            allowedERC25YDataKeys,
          );
        expect(result).to.be.false;
      });

      it('should return `false` if there are just 2 x length bytes but not followed by the value (the allowed ERC725Y Data Key)', async () => {
        const allowedCalls = '0x0020';
        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedERC725YDataKeys(
            allowedCalls,
          );
        expect(result).to.be.false;
      });

      it('should return `false` if there are just 2 x length bytes equal to `0x0002`', async () => {
        const allowedCalls = '0x0002';
        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedERC725YDataKeys(
            allowedCalls,
          );
        expect(result).to.be.false;
      });

      it('should return `true` for a CompactBytesArray containing 2 dynamic keys', async () => {
        const result =
          await context.keyManagerInternalTester.callStatic.isCompactBytesArrayOfAllowedERC725YDataKeys(
            compactBytesArray_2d,
          );

        expect(result).to.be.true;
      });

      it('should return `true` for a CompactBytesArray containing 2 fixed keys', async () => {
        const result =
          await context.keyManagerInternalTester.callStatic.isCompactBytesArrayOfAllowedERC725YDataKeys(
            compactBytesArray_2f,
          );

        expect(result).to.be.true;
      });

      it('should return `true` for a CompactBytesArray containing 2 dynamic keys and 2 fixed keys', async () => {
        const result =
          await context.keyManagerInternalTester.callStatic.isCompactBytesArrayOfAllowedERC725YDataKeys(
            compactBytesArray_2d_2f,
          );

        expect(result).to.be.true;
      });

      it('should return `true` for a CompactBytesArray with mixed dynamic and fixed keys', async () => {
        const result =
          await context.keyManagerInternalTester.callStatic.isCompactBytesArrayOfAllowedERC725YDataKeys(
            compactBytesArray_mixed_d_f,
          );

        expect(result).to.be.true;
      });

      it('should return `false` if the CompactBytesArray contains a zero length data key', async () => {
        const data = encodeCompactBytesArray([
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1st Data Key')),
          '0x',
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('2nd Data Key')),
        ]);

        const result =
          await context.keyManagerInternalTester.callStatic.isCompactBytesArrayOfAllowedERC725YDataKeys(
            data,
          );
        expect(result).to.be.false;
      });

      it('should return `false` if the CompactBytesArray contains an entry larger than 32 bytes', async () => {
        const data = encodeCompactBytesArray([
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1st Data Key')),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('2nd Data Key')),
          ethers.utils.hexlify(ethers.utils.randomBytes(33)),
        ]);

        const result =
          await context.keyManagerInternalTester.callStatic.isCompactBytesArrayOfAllowedERC725YDataKeys(
            data,
          );
        expect(result).to.be.false;
      });

      it('should return `false` if the CompactBytesArray contains a data key with a length byte that does not correspond to the length of its element', async () => {
        let data = encodeCompactBytesArray([
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1st Data Key')),
          ethers.utils.hexlify(ethers.utils.randomBytes(10)), // <-- replace length byte here
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('3rd Data Key')),
        ]);

        // replace the length byte of the 2nd data key with a different value
        data = data.replace(/000a/g, '0030');

        const result =
          await context.keyManagerInternalTester.callStatic.isCompactBytesArrayOfAllowedERC725YDataKeys(
            data,
          );
        expect(result).to.be.false;
      });
    });

    describe('`verifyAllowedERC725YSingleKey(..)`', () => {
      describe('checking a CompactBytesArray containing 2 dynamic keys', () => {
        it('checking first dynamic key: should return true', async () => {
          const checkedDataKey =
            dataKeys.firstDynamicKey.key +
            ethers.utils
              .hexlify(
                ethers.utils.randomBytes(
                  ethers.BigNumber.from(32).sub(dataKeys.firstDynamicKey.length).toNumber(),
                ),
              )
              .substring(2);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_2d,
            ),
          ).to.not.be.reverted;
        });

        it('checking second dynamic key: should return true', async () => {
          const checkedDataKey =
            dataKeys.secondDynamicKey.key +
            ethers.utils
              .hexlify(
                ethers.utils.randomBytes(
                  ethers.BigNumber.from(32).sub(dataKeys.secondDynamicKey.length).toNumber(),
                ),
              )
              .substring(2);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_2d,
            ),
          ).to.not.be.reverted;
        });

        it('checking 10 random data keys: all should return false', async () => {
          for (let i = 0; i < 10; i++) {
            const dataKeyToCheck = dataKeysToReturn[i];

            await expect(
              context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
                context.universalProfile.address,
                dataKeyToCheck,
                compactBytesArray_2d,
              ),
            )
              .to.be.revertedWithCustomError(
                context.keyManagerInternalTester,
                'NotAllowedERC725YDataKey',
              )
              .withArgs(context.universalProfile.address, dataKeyToCheck);
          }
        });
      });

      describe('checking a CompactBytesArray containing 2 fixed keys', () => {
        it('checking first fixed key: should return true', async () => {
          const checkedDataKey = dataKeys.firstFixedKey.key;

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_2f,
            ),
          ).to.not.be.reverted;
        });

        it('checking second fixed key: should return true', async () => {
          const checkedDataKey = dataKeys.secondFixedKey.key;

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_2f,
            ),
          ).to.not.be.reverted;
        });

        it('checking 10 random data keys: all should return false', async () => {
          for (let i = 0; i < 10; i++) {
            const dataKeyToCheck = dataKeysToReturn[i];

            await expect(
              context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
                context.universalProfile.address,
                dataKeyToCheck,
                compactBytesArray_2f,
              ),
            )
              .to.be.revertedWithCustomError(
                context.keyManagerInternalTester,
                'NotAllowedERC725YDataKey',
              )
              .withArgs(context.universalProfile.address, dataKeyToCheck);
          }
        });
      });

      describe('checking a CompactBytesArray containing 2 dynamic keys and 2 fixed keys', () => {
        it('checking first dynamic key: should return true', async () => {
          const checkedDataKey =
            dataKeys.firstDynamicKey.key +
            ethers.utils
              .hexlify(
                ethers.utils.randomBytes(
                  ethers.BigNumber.from(32).sub(dataKeys.firstDynamicKey.length).toNumber(),
                ),
              )
              .substring(2);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_2d_2f,
            ),
          ).to.not.be.reverted;
        });

        it('checking second dynamic key: should return true', async () => {
          const checkedDataKey =
            dataKeys.secondDynamicKey.key +
            ethers.utils
              .hexlify(
                ethers.utils.randomBytes(
                  ethers.BigNumber.from(32).sub(dataKeys.secondDynamicKey.length).toNumber(),
                ),
              )
              .substring(2);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_2d_2f,
            ),
          ).to.not.be.reverted;
        });

        it('checking first fixed key: should return true', async () => {
          const checkedDataKey = dataKeys.firstFixedKey.key;

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_2d_2f,
            ),
          ).to.not.be.reverted;
        });

        it('checking second fixed key: should return true', async () => {
          const checkedDataKey = dataKeys.secondFixedKey.key;

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_2d_2f,
            ),
          ).to.not.be.reverted;
        });

        it('checking 10 random data keys: all should return false', async () => {
          for (let i = 0; i < 10; i++) {
            const dataKeyToCheck = dataKeysToReturn[i];

            await expect(
              context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
                context.universalProfile.address,
                dataKeyToCheck,
                compactBytesArray_2d_2f,
              ),
            )
              .to.be.revertedWithCustomError(
                context.keyManagerInternalTester,
                'NotAllowedERC725YDataKey',
              )
              .withArgs(context.universalProfile.address, dataKeyToCheck);
          }
        });
      });

      describe('checking a CompactBytesArray containing mixed dynamic and fixed keys', () => {
        it('checking first dynamic key: should return true', async () => {
          const checkedDataKey =
            dataKeys.firstDynamicKey.key +
            ethers.utils
              .hexlify(
                ethers.utils.randomBytes(
                  ethers.BigNumber.from(32).sub(dataKeys.firstDynamicKey.length).toNumber(),
                ),
              )
              .substring(2);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_mixed_d_f,
            ),
          ).to.not.be.reverted;
        });

        it('checking second dynamic key: should return true', async () => {
          const checkedDataKey =
            dataKeys.secondDynamicKey.key +
            ethers.utils
              .hexlify(
                ethers.utils.randomBytes(
                  ethers.BigNumber.from(32).sub(dataKeys.secondDynamicKey.length).toNumber(),
                ),
              )
              .substring(2);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_mixed_d_f,
            ),
          ).to.not.be.reverted;
        });

        it('checking third dynamic key: should return true', async () => {
          const checkedDataKey =
            dataKeys.thirdDynamicKey.key +
            ethers.utils
              .hexlify(
                ethers.utils.randomBytes(
                  ethers.BigNumber.from(32).sub(dataKeys.thirdDynamicKey.length).toNumber(),
                ),
              )
              .substring(2);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_mixed_d_f,
            ),
          ).to.not.be.reverted;
        });

        it('checking fourth dynamic key: should return true', async () => {
          const checkedDataKey =
            dataKeys.fourthDynamicKey.key +
            ethers.utils
              .hexlify(
                ethers.utils.randomBytes(
                  ethers.BigNumber.from(32).sub(dataKeys.fourthDynamicKey.length).toNumber(),
                ),
              )
              .substring(2);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_mixed_d_f,
            ),
          ).to.not.be.reverted;
        });

        it('checking first fixed key: should return true', async () => {
          const checkedDataKey = dataKeys.firstFixedKey.key;

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_mixed_d_f,
            ),
          ).to.not.be.reverted;
        });

        it('checking second fixed key: should return true', async () => {
          const checkedDataKey = dataKeys.secondFixedKey.key;

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_mixed_d_f,
            ),
          ).to.not.be.reverted;
        });

        it('checking third fixed key: should return true', async () => {
          const checkedDataKey = dataKeys.thirdFixedKey.key;

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              checkedDataKey,
              compactBytesArray_mixed_d_f,
            ),
          ).to.not.be.reverted;
        });

        it('checking 10 random data keys: all should return false', async () => {
          for (let i = 0; i < 10; i++) {
            const dataKeyToCheck = dataKeysToReturn[i];

            await expect(
              context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
                context.universalProfile.address,
                dataKeyToCheck,
                compactBytesArray_mixed_d_f,
              ),
            )
              .to.be.revertedWithCustomError(
                context.keyManagerInternalTester,
                'NotAllowedERC725YDataKey',
              )
              .withArgs(context.universalProfile.address, dataKeyToCheck);
          }
        });

        it('should revert if compactBytesArray length element is superior at 32', async () => {
          const dynamicKeyOfLength33 = ethers.utils.hexlify(ethers.utils.randomBytes(33));
          const compactBytesArray_with_invalid_length = encodeCompactBytesArray([
            dataKeys.firstDynamicKey.key,
            dynamicKeyOfLength33,
            dataKeys.thirdDynamicKey.key,
          ]);

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              dataKeys.firstFixedKey.key,
              compactBytesArray_with_invalid_length,
            ),
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              'InvalidEncodedAllowedERC725YDataKeys',
            )
            .withArgs(compactBytesArray_with_invalid_length, "couldn't DECODE from storage");
        });
      });

      describe('checking a CompactBytesArray of AllowedERC725YDataKeys containing `0x0000`', () => {
        let context: LSP6InternalsTestContext;

        before(async () => {
          context = await buildContext();
        });

        it('should revert when passing `bytes32(0)` as input data key', async () => {
          const compactBytesArrayOfAllowedERC725YDataKeys = '0x0000';
          const inputDataKey = '0x0000000000000000000000000000000000000000000000000000000000000000';

          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YSingleKey(
              context.universalProfile.address,
              inputDataKey,
              compactBytesArrayOfAllowedERC725YDataKeys,
            ),
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              'InvalidEncodedAllowedERC725YDataKeys',
            )
            .withArgs(compactBytesArrayOfAllowedERC725YDataKeys, "couldn't DECODE from storage");
        });
      });
    });

    describe('`verifyAllowedERC725YDataKeys(..)`', () => {
      describe('checking a CompactBytesArray containing 2 dynamic keys', () => {
        it('checking an array of valid keys: should return true', async () => {
          const checkedDataKeys = [
            dataKeys.firstDynamicKey.key +
              ethers.utils
                .hexlify(
                  ethers.utils.randomBytes(
                    ethers.BigNumber.from(32).sub(dataKeys.firstDynamicKey.length).toNumber(),
                  ),
                )
                .substring(2),
            dataKeys.secondDynamicKey.key +
              ethers.utils
                .hexlify(
                  ethers.utils.randomBytes(
                    ethers.BigNumber.from(32).sub(dataKeys.secondDynamicKey.length).toNumber(),
                  ),
                )
                .substring(2),
          ];

          expect(
            await context.keyManagerInternalTester.verifyAllowedERC725YDataKeys(
              context.universalProfile.address,
              checkedDataKeys,
              compactBytesArray_2d,
              [false, false],
              0,
            ),
          ).to.not.be.reverted;
        });

        it('checking an array of invalid keys: all should return false', async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YDataKeys(
              context.universalProfile.address,
              dataKeysToReturn,
              compactBytesArray_2d,
              Array(dataKeysToReturn.length).fill(false),
              0,
            ),
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              'NotAllowedERC725YDataKey',
            )
            .withArgs(context.universalProfile.address, dataKeysToReturn[0]);
        });
      });

      describe('checking a CompactBytesArray containing 2 fixed keys', () => {
        it('checking an array of valid keys: should return true', async () => {
          const checkedDataKeys = [dataKeys.firstFixedKey.key, dataKeys.secondFixedKey.key];

          expect(
            await context.keyManagerInternalTester.verifyAllowedERC725YDataKeys(
              context.universalProfile.address,
              checkedDataKeys,
              compactBytesArray_2f,
              Array(dataKeysToReturn.length).fill(false),
              0,
            ),
          ).to.not.be.reverted;
        });

        it('checking an array of invalid keys: all should return false', async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YDataKeys(
              context.universalProfile.address,
              dataKeysToReturn,
              compactBytesArray_2f,
              Array(dataKeysToReturn.length).fill(false),
              0,
            ),
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              'NotAllowedERC725YDataKey',
            )
            .withArgs(context.universalProfile.address, dataKeysToReturn[0]);
        });
      });

      describe('checking a CompactBytesArray containing 2 dynamic keys and 2 fixed keys', () => {
        it('checking an array of valid keys: should return true', async () => {
          const checkedDataKeys = [
            dataKeys.firstDynamicKey.key +
              ethers.utils
                .hexlify(
                  ethers.utils.randomBytes(
                    ethers.BigNumber.from(32).sub(dataKeys.firstDynamicKey.length).toNumber(),
                  ),
                )
                .substring(2),
            dataKeys.secondDynamicKey.key +
              ethers.utils
                .hexlify(
                  ethers.utils.randomBytes(
                    ethers.BigNumber.from(32).sub(dataKeys.secondDynamicKey.length).toNumber(),
                  ),
                )
                .substring(2),
            dataKeys.firstFixedKey.key,
            dataKeys.secondFixedKey.key,
          ];

          expect(
            await context.keyManagerInternalTester.verifyAllowedERC725YDataKeys(
              context.universalProfile.address,
              checkedDataKeys,
              compactBytesArray_2d_2f,
              Array(checkedDataKeys.length).fill(false),
              0,
            ),
          ).to.not.be.reverted;
        });

        it('checking an array of invalid keys: all should return false', async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YDataKeys(
              context.universalProfile.address,
              dataKeysToReturn,
              compactBytesArray_2d_2f,
              Array(dataKeysToReturn.length).fill(false),
              0,
            ),
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              'NotAllowedERC725YDataKey',
            )
            .withArgs(context.universalProfile.address, dataKeysToReturn[0]);
        });
      });

      describe('checking a CompactBytesArray containing mixed dynamic and fixed keys', () => {
        it('checking an array of valid keys: should return true', async () => {
          const checkedDataKeys = [
            dataKeys.firstDynamicKey.key +
              ethers.utils
                .hexlify(
                  ethers.utils.randomBytes(
                    ethers.BigNumber.from(32).sub(dataKeys.firstDynamicKey.length).toNumber(),
                  ),
                )
                .substring(2),
            dataKeys.firstFixedKey.key,
            dataKeys.secondDynamicKey.key +
              ethers.utils
                .hexlify(
                  ethers.utils.randomBytes(
                    ethers.BigNumber.from(32).sub(dataKeys.secondDynamicKey.length).toNumber(),
                  ),
                )
                .substring(2),
            dataKeys.thirdDynamicKey.key +
              ethers.utils
                .hexlify(
                  ethers.utils.randomBytes(
                    ethers.BigNumber.from(32).sub(dataKeys.thirdDynamicKey.length).toNumber(),
                  ),
                )
                .substring(2),
            dataKeys.secondFixedKey.key,
            dataKeys.fourthDynamicKey.key +
              ethers.utils
                .hexlify(
                  ethers.utils.randomBytes(
                    ethers.BigNumber.from(32).sub(dataKeys.fourthDynamicKey.length).toNumber(),
                  ),
                )
                .substring(2),
            dataKeys.thirdFixedKey.key,
          ];

          expect(
            await context.keyManagerInternalTester.verifyAllowedERC725YDataKeys(
              context.universalProfile.address,
              checkedDataKeys,
              compactBytesArray_mixed_d_f,
              Array(checkedDataKeys.length).fill(false),
              0,
            ),
          ).to.not.be.reverted;
        });

        it('checking an array of invalid keys: all should return false', async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedERC725YDataKeys(
              context.universalProfile.address,
              dataKeysToReturn,
              compactBytesArray_mixed_d_f,
              Array(dataKeysToReturn.length).fill(false),
              0,
            ),
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              'NotAllowedERC725YDataKey',
            )
            .withArgs(context.universalProfile.address, dataKeysToReturn[0]);
        });
      });
    });
  });
};
