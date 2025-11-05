import { expect } from 'chai';
import type { NetworkHelpers } from '@nomicfoundation/hardhat-network-helpers/types';
import type { HardhatEthers, HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { hexlify, keccak256, randomBytes, toBigInt, toUtf8Bytes, ZeroAddress } from 'ethers';

// types
import {
  type NotImplementingVerifyCall,
  NotImplementingVerifyCall__factory,
  type ImplementingFallback,
  ImplementingFallback__factory,
  type FallbackReturnSuccessValue,
  FallbackReturnSuccessValue__factory,
  type OwnerWithURD,
  OwnerWithURD__factory,
  type FirstCallReturnExpandedInvalidValue,
  FirstCallReturnExpandedInvalidValue__factory,
  type FirstCallReturnInvalidValue,
  FirstCallReturnInvalidValue__factory,
  type SecondCallReturnFailureValue,
  SecondCallReturnFailureValue__factory,
  type FirstCallReturnSuccessValue,
  FirstCallReturnSuccessValue__factory,
  type BothCallReturnSuccessValue,
  BothCallReturnSuccessValue__factory,
  type SecondCallReturnExpandedSuccessValue,
  SecondCallReturnExpandedSuccessValue__factory,
} from '../../types/ethers-contracts/index.js';
import {
  UniversalProfile,
  UniversalProfile__factory,
} from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import { LSP0ERC725Account } from '../../../lsp0-contracts/types/ethers-contracts/index.js';

// constants
import { LSP1_TYPE_IDS } from '../../constants.js';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { abiCoder } from '../utils/helpers.js';

export type LSP20TestContext = {
  accounts: HardhatEthersSigner[];
  universalProfile: UniversalProfile | LSP0ERC725Account;
  deployParams: { owner: HardhatEthersSigner };
};

export const shouldBehaveLikeLSP20 = (buildContext: () => Promise<LSP20TestContext>) => {
  let networkHelpers: NetworkHelpers;
  let ethers: HardhatEthers;
  let context: LSP20TestContext;

  before(async () => {
    const { network } = await import('hardhat');
    ({ ethers, networkHelpers } = await network.connect());
    context = await buildContext();
  });

  describe('when testing lsp20 integration', () => {
    describe('when owner is an EOA', () => {
      describe('when calling `setData(bytes32,bytes)`', () => {
        const dataKey = keccak256(toUtf8Bytes('RandomKey1'));
        const dataValue = hexlify(randomBytes(50));

        it('should pass when owner calls', async () => {
          await context.universalProfile
            .connect(context.deployParams.owner)
            .setData(dataKey, dataValue);

          expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);
        });

        it('should revert when non-owner calls', async () => {
          await expect(
            context.universalProfile.connect(context.accounts[1]).setData(dataKey, dataValue),
          )
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
            .withArgs(context.deployParams.owner.address);
        });
      });

      describe('when calling `setData(bytes32[],bytes[])` array', () => {
        const dataKey = keccak256(toUtf8Bytes('RandomKey2'));
        const dataValue = hexlify(randomBytes(50));

        it('should pass when owner calls', async () => {
          await context.universalProfile
            .connect(context.deployParams.owner)
            .setDataBatch([dataKey], [dataValue]);

          expect(await context.universalProfile.getDataBatch([dataKey])).to.deep.equal([dataValue]);
        });

        it('should revert when non-owner calls', async () => {
          await expect(
            context.universalProfile
              .connect(context.accounts[1])
              .setDataBatch([dataKey], [dataValue]),
          )
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
            .withArgs(context.deployParams.owner.address);
        });
      });

      describe('when calling `execute(...)`', () => {
        it('should pass when owner calls', async () => {
          const executeParams = {
            operation: OPERATION_TYPES.CALL,
            address: context.accounts[1].address,
            value: 0,
            data: '0x',
          };

          await expect(
            context.universalProfile
              .connect(context.deployParams.owner)
              .execute(
                executeParams.operation,
                executeParams.address,
                executeParams.value,
                executeParams.data,
              ),
          )
            .to.emit(context.universalProfile, 'Executed')
            .withArgs(OPERATION_TYPES.CALL, context.accounts[1].address, 0, '0x00000000');
        });

        it('when calling should revert when non-owner calls', async () => {
          const executeParams = {
            operation: OPERATION_TYPES.CALL,
            address: context.accounts[1].address,
            value: 0,
            data: '0x',
          };

          await expect(
            context.universalProfile
              .connect(context.accounts[1])
              .execute(
                executeParams.operation,
                executeParams.address,
                executeParams.value,
                executeParams.data,
              ),
          )
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
            .withArgs(context.deployParams.owner.address);
        });
      });

      describe('when calling `execute([],[],[],[])` Array', () => {
        it('should pass when the owner is calling', async () => {
          const operationsType = [OPERATION_TYPES.CALL];
          const recipients = [context.accounts[1].address];
          const values = [0];
          const datas = ['0x'];

          const tx = await context.universalProfile
            .connect(context.deployParams.owner)
            .executeBatch(operationsType, recipients, values, datas);

          await expect(tx)
            .to.emit(context.universalProfile, 'Executed')
            .withArgs(OPERATION_TYPES.CALL, context.accounts[1].address, 0, '0x00000000');
        });

        it('should revert when the non-owner is calling', async () => {
          const operationsType = [OPERATION_TYPES.CALL];
          const recipients = [context.accounts[1].address];
          const values = [toBigInt('0')];
          const datas = ['0x'];

          await expect(
            context.universalProfile
              .connect(context.accounts[3])
              .executeBatch(operationsType, recipients, values, datas),
          )
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
            .withArgs(context.deployParams.owner.address);
        });
      });

      describe('when calling `transferOwnership(...)`', () => {
        it('should pass when the owner is calling', async () => {
          const newOwner = context.accounts[1].address;

          await expect(
            context.universalProfile
              .connect(context.deployParams.owner)
              .transferOwnership(newOwner),
          ).to.emit(context.universalProfile, 'OwnershipTransferStarted');
        });

        it('should revert when the non-owner is calling', async () => {
          const newOwner = context.accounts[1].address;

          await expect(
            context.universalProfile.connect(context.accounts[3]).transferOwnership(newOwner),
          )
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
            .withArgs(context.deployParams.owner.address);
        });
      });

      describe('when calling `renounceOwnership`', () => {
        it('should pass when the owner is calling', async () => {
          await networkHelpers.mine(500);

          await expect(
            context.universalProfile.connect(context.deployParams.owner).renounceOwnership(),
          ).to.emit(context.universalProfile, 'RenounceOwnershipStarted');
        });

        it('should revert when the non-owner is calling', async () => {
          await networkHelpers.mine(100);

          await expect(context.universalProfile.connect(context.accounts[3]).renounceOwnership())
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
            .withArgs(context.deployParams.owner.address);
        });

        describe('when caller is not owner', () => {
          let newContractOwner: OwnerWithURD;

          before('Use custom owner that implements LSP1', async () => {
            newContractOwner = await new OwnerWithURD__factory(context.accounts[0]).deploy(
              await context.universalProfile.getAddress(),
            );

            await context.universalProfile
              .connect(context.deployParams.owner)
              .transferOwnership(await newContractOwner.getAddress());

            await newContractOwner.acceptOwnership();
          });

          after('`renounceOwnership()` was used, build new context', async () => {
            context = await buildContext();
          });

          // TODO: fix Error: VM Exception while processing transaction: reverted with an unrecognized custom error
          // (return data: 0x1b08094200000000000000000000000000000000000000000000000000000000000000d3000000000000000000000000000000000000000000000000000000000000019b)
          it.skip('should renounce ownership of the contract and call the URD of the previous owner', async () => {
            await context.universalProfile.connect(context.accounts[0]).renounceOwnership();

            await networkHelpers.mine(199);

            const tx = context.universalProfile.connect(context.accounts[0]).renounceOwnership();

            await expect(tx)
              .to.emit(newContractOwner, 'UniversalReceiver')
              .withArgs(
                await context.universalProfile.getAddress(),
                0,
                LSP1_TYPE_IDS.LSP0OwnershipTransferred_SenderNotification,
                abiCoder.encode(
                  ['address', 'address'],
                  [await newContractOwner.getAddress(), ZeroAddress],
                ),
                '0x',
              );
          });
        });
      });
    });

    describe('when the owner is a contract', () => {
      describe("that doesn't implement the verifyCall function", () => {
        let ownerContract: NotImplementingVerifyCall;

        before('deploying a new owner', async () => {
          ownerContract = await new NotImplementingVerifyCall__factory(
            context.deployParams.owner,
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(await ownerContract.getAddress());

          await ownerContract
            .connect(context.deployParams.owner)
            .acceptOwnership(context.universalProfile.target);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should revert when calling LSP0 function', async () => {
          const dataKey = keccak256(toUtf8Bytes('RandomKey1'));
          const dataValue = hexlify(randomBytes(50));

          await expect(context.universalProfile.setData(dataKey, dataValue))
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20CallingVerifierFailed')
            .withArgs(false);
        });
      });

      describe("that implement the fallback function that doesn't return anything", () => {
        let ownerContract: ImplementingFallback;

        before('deploying a new owner', async () => {
          ownerContract = await new ImplementingFallback__factory(
            context.deployParams.owner,
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(await ownerContract.getAddress());

          await ownerContract.acceptOwnership(context.universalProfile.target);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should revert when calling LSP0 function', async () => {
          const dataKey = keccak256(toUtf8Bytes('RandomKey1'));
          const dataValue = hexlify(randomBytes(50));

          await expect(
            context.universalProfile.setData(dataKey, dataValue),
          ).to.be.revertedWithoutReason(ethers);
        });
      });

      describe('that implement the fallback that return the success value', () => {
        let ownerContract: FallbackReturnSuccessValue;

        before('deploying a new owner', async () => {
          ownerContract = await new FallbackReturnSuccessValue__factory(
            context.deployParams.owner,
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(await ownerContract.getAddress());

          await ownerContract.acceptOwnership(context.universalProfile.target);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should pass when calling LSP0 function', async () => {
          const dataKey = keccak256(toUtf8Bytes('RandomKey1'));
          const dataValue = hexlify(randomBytes(50));

          await expect(context.universalProfile.setData(dataKey, dataValue)).to.emit(
            ownerContract,
            'FallbackCalled',
          );
        });
      });

      describe('that implements verifyCall but return an expanded bytes32 value', () => {
        let ownerContract: FirstCallReturnExpandedInvalidValue;

        before('deploying a new owner', async () => {
          ownerContract = await new FirstCallReturnExpandedInvalidValue__factory(
            context.deployParams.owner,
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(await ownerContract.getAddress());

          await ownerContract.acceptOwnership(context.universalProfile.target);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should revert when calling `setData(bytes32,bytes)`', async () => {
          const dataKey = keccak256(toUtf8Bytes('RandomKey1'));
          const dataValue = hexlify(randomBytes(50));

          await expect(
            context.universalProfile.setData(dataKey, dataValue),
          ).to.be.revertedWithoutReason(ethers);
        });
      });

      describe("that implements verifyCall but doesn't return success value", () => {
        let ownerContract: FirstCallReturnInvalidValue;

        before('deploying a new owner', async () => {
          ownerContract = await new FirstCallReturnInvalidValue__factory(
            context.deployParams.owner,
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(await ownerContract.getAddress());

          await ownerContract.acceptOwnership(context.universalProfile.target);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should revert when calling `setData(bytes32,bytes)`', async () => {
          const dataKey = keccak256(toUtf8Bytes('RandomKey1'));
          const dataValue = hexlify(randomBytes(50));

          await expect(context.universalProfile.setData(dataKey, dataValue))
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20CallVerificationFailed')
            .withArgs(false, '0xaabbccdd');
        });
      });

      describe("that implements verifyCall that returns a valid success value but doesn't invoke verifyCallResult", () => {
        let firstCallReturnSuccessValueContract: FirstCallReturnSuccessValue;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          firstCallReturnSuccessValueContract = await new FirstCallReturnSuccessValue__factory(
            context.accounts[0],
          ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            firstCallReturnSuccessValueContract.target,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = keccak256(toUtf8Bytes('My Key'));
          const value = hexlify(randomBytes(500));

          await expect(newUniversalProfile.connect(context.accounts[3]).setData(key, value))
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, value);

          const result = await newUniversalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('that implements verifyCall that returns a valid success value with additional data after the first 32 bytes', () => {
        let firstCallReturnSuccessValueContract: FirstCallReturnSuccessValue;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          firstCallReturnSuccessValueContract = await new FirstCallReturnSuccessValue__factory(
            context.accounts[0],
          ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            firstCallReturnSuccessValueContract.target,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = keccak256(toUtf8Bytes('My Key'));
          const value = hexlify(randomBytes(500));

          await expect(newUniversalProfile.connect(context.accounts[3]).setData(key, value))
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, value);

          const result = await newUniversalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('that implements verifyCall and verifyCallResult and both return success value', () => {
        let bothCallReturnSuccessValueContract: BothCallReturnSuccessValue;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          bothCallReturnSuccessValueContract = await new BothCallReturnSuccessValue__factory(
            context.accounts[0],
          ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            bothCallReturnSuccessValueContract.target,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = keccak256(toUtf8Bytes('My Key'));
          const value = hexlify(randomBytes(500));

          await expect(newUniversalProfile.connect(context.accounts[3]).setData(key, value))
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, value);

          const result = await newUniversalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('that implements verifyCall and verifyCallResult and both return success value plus additional data', () => {
        let bothCallReturnSuccessValueContract: BothCallReturnSuccessValue;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          bothCallReturnSuccessValueContract = await new BothCallReturnSuccessValue__factory(
            context.accounts[0],
          ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            bothCallReturnSuccessValueContract.target,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = keccak256(toUtf8Bytes('My Key'));
          const value = hexlify(randomBytes(500));

          await expect(newUniversalProfile.connect(context.accounts[3]).setData(key, value))
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, value);

          const result = await newUniversalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('that implements verifyCallResult but return fail value', () => {
        let secondCallReturnFailureContract: SecondCallReturnFailureValue;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          secondCallReturnFailureContract = await new SecondCallReturnFailureValue__factory(
            context.accounts[0],
          ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            secondCallReturnFailureContract.target,
          );
        });

        it('should revert when calling `setData(bytes32,bytes)`', async () => {
          const key = keccak256(toUtf8Bytes('My Key'));
          const value = hexlify(randomBytes(500));

          await expect(
            newUniversalProfile.connect(context.accounts[3]).setData(key, value),
          ).to.be.revertedWithCustomError(newUniversalProfile, 'LSP20CallVerificationFailed');
        });
      });

      describe('that implements verifyCallResult but return an expanded success value', () => {
        let secondCallReturnExpandedValueContract: SecondCallReturnExpandedSuccessValue;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          secondCallReturnExpandedValueContract =
            await new SecondCallReturnExpandedSuccessValue__factory(context.accounts[0]).deploy();

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            secondCallReturnExpandedValueContract.target,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = keccak256(toUtf8Bytes('My Key'));
          const value = hexlify(randomBytes(500));

          await expect(newUniversalProfile.connect(context.accounts[3]).setData(key, value))
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, value);

          const result = await newUniversalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });
    });
  });
};
