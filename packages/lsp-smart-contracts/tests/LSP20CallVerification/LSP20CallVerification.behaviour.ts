import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

// types
import {
  NotImplementingVerifyCall,
  NotImplementingVerifyCall__factory,
  ImplementingFallback,
  ImplementingFallback__factory,
  FallbackReturnSuccessValue,
  FallbackReturnSuccessValue__factory,
  LSP0ERC725Account,
  OwnerWithURD,
  OwnerWithURD__factory,
  UniversalProfile,
  UniversalProfile__factory,
  FirstCallReturnExpandedInvalidValue,
  FirstCallReturnExpandedInvalidValue__factory,
  FirstCallReturnInvalidValue,
  FirstCallReturnInvalidValue__factory,
  SecondCallReturnFailureValue__factory,
  SecondCallReturnFailureValue,
  FirstCallReturnSuccessValue,
  FirstCallReturnSuccessValue__factory,
  BothCallReturnSuccessValue,
  BothCallReturnSuccessValue__factory,
  SecondCallReturnExpandedSuccessValue,
  SecondCallReturnExpandedSuccessValue__factory,
} from '../../typechain';

// constants
import { LSP1_TYPE_IDS } from '../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { abiCoder } from '../utils/helpers';

export type LSP20TestContext = {
  accounts: SignerWithAddress[];
  universalProfile: UniversalProfile | LSP0ERC725Account;
  deployParams: { owner: SignerWithAddress };
};

export const shouldBehaveLikeLSP20 = (buildContext: () => Promise<LSP20TestContext>) => {
  let context: LSP20TestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when testing lsp20 integration', () => {
    describe('when owner is an EOA', () => {
      describe('when calling `setData(bytes32,bytes)`', () => {
        const dataKey = ethers.keccak256(ethers.toUtf8Bytes('RandomKey1'));
        const dataValue = ethers.hexlify(ethers.randomBytes(50));

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
        const dataKey = ethers.keccak256(ethers.toUtf8Bytes('RandomKey2'));
        const dataValue = ethers.hexlify(ethers.randomBytes(50));

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
          const values = [ethers.toBigInt('0')];
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
          await network.provider.send('hardhat_mine', [ethers.toQuantity(500)]);

          await expect(
            context.universalProfile.connect(context.deployParams.owner).renounceOwnership(),
          ).to.emit(context.universalProfile, 'RenounceOwnershipStarted');
        });

        it('should revert when the non-owner is calling', async () => {
          await network.provider.send('hardhat_mine', [ethers.toQuantity(100)]);

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

          it('should renounce ownership of the contract and call the URD of the previous owner', async () => {
            await context.universalProfile.connect(context.accounts[0]).renounceOwnership();

            await network.provider.send('hardhat_mine', [ethers.toQuantity(199)]);

            const tx = await context.universalProfile
              .connect(context.accounts[0])
              .renounceOwnership();

            await expect(tx)
              .to.emit(newContractOwner, 'UniversalReceiver')
              .withArgs(
                await context.universalProfile.getAddress(),
                0,
                LSP1_TYPE_IDS.LSP0OwnershipTransferred_SenderNotification,
                abiCoder.encode(
                  ['address', 'address'],
                  [await newContractOwner.getAddress(), ethers.ZeroAddress],
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
          const dataKey = ethers.keccak256(ethers.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.hexlify(ethers.randomBytes(50));

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
          const dataKey = ethers.keccak256(ethers.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.hexlify(ethers.randomBytes(50));

          await expect(
            context.universalProfile.setData(dataKey, dataValue),
          ).to.be.revertedWithoutReason();
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
          const dataKey = ethers.keccak256(ethers.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.hexlify(ethers.randomBytes(50));

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
          const dataKey = ethers.keccak256(ethers.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.hexlify(ethers.randomBytes(50));

          await expect(
            context.universalProfile.setData(dataKey, dataValue),
          ).to.be.revertedWithoutReason();
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
          const dataKey = ethers.keccak256(ethers.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.hexlify(ethers.randomBytes(50));

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
          const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
          const value = ethers.hexlify(ethers.randomBytes(500));

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
          const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
          const value = ethers.hexlify(ethers.randomBytes(500));

          await expect(
            newUniversalProfile.connect(context.accounts[3])['setData(bytes32,bytes)'](key, value),
          )
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, value);

          const result = await newUniversalProfile['getData(bytes32)'](key);
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
          const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
          const value = ethers.hexlify(ethers.randomBytes(500));

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
          const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
          const value = ethers.hexlify(ethers.randomBytes(500));

          await expect(
            newUniversalProfile.connect(context.accounts[3])['setData(bytes32,bytes)'](key, value),
          )
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, value);

          const result = await newUniversalProfile['getData(bytes32)'](key);
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
          const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
          const value = ethers.hexlify(ethers.randomBytes(500));

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
          const key = ethers.keccak256(ethers.toUtf8Bytes('My Key'));
          const value = ethers.hexlify(ethers.randomBytes(500));

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
