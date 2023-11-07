import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { FakeContract, smock } from '@defi-wonderland/smock';

// types
import {
  UniversalProfile,
  UniversalProfile__factory,
  NotImplementingVerifyCall,
  NotImplementingVerifyCall__factory,
  ImplementingFallback,
  ImplementingFallback__factory,
  FallbackReturnSuccessValue,
  FallbackReturnSuccessValue__factory,
  FirstCallReturnExpandedFailValue,
  FirstCallReturnExpandedFailValue__factory,
  FirstCallReturnFailValue,
  FirstCallReturnFailValue__factory,
  LSP0ERC725Account,
  ILSP20CallVerifier,
  ILSP20CallVerifier__factory,
  OwnerWithURD,
  OwnerWithURD__factory,
} from '../../types';

// constants
import { LSP1_TYPE_IDS, LSP20_SUCCESS_VALUES, OPERATION_TYPES } from '../../constants';
import { abiCoder } from './..//utils/helpers';

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
        const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('RandomKey1'));
        const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

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
        const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('RandomKey2'));
        const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

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
          const values = [ethers.BigNumber.from('0')];
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
          await network.provider.send('hardhat_mine', [ethers.utils.hexValue(500)]);

          await expect(
            context.universalProfile.connect(context.deployParams.owner).renounceOwnership(),
          ).to.emit(context.universalProfile, 'RenounceOwnershipStarted');
        });

        it('should revert when the non-owner is calling', async () => {
          await network.provider.send('hardhat_mine', [ethers.utils.hexValue(100)]);

          await expect(context.universalProfile.connect(context.accounts[3]).renounceOwnership())
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
            .withArgs(context.deployParams.owner.address);
        });

        describe('when caller is not owner', () => {
          let newContractOwner: OwnerWithURD;

          before('Use custom owner that implements LSP1', async () => {
            newContractOwner = await new OwnerWithURD__factory(context.accounts[0]).deploy(
              context.universalProfile.address,
            );

            await context.universalProfile
              .connect(context.deployParams.owner)
              .transferOwnership(newContractOwner.address);

            await newContractOwner.acceptOwnership();
          });

          after('`renounceOwnership()` was used, build new context', async () => {
            context = await buildContext();
          });

          it('should renounce ownership of the contract and call the URD of the previous owner', async () => {
            await context.universalProfile.connect(context.accounts[0]).renounceOwnership();

            await network.provider.send('hardhat_mine', [ethers.utils.hexValue(199)]);

            const tx = await context.universalProfile
              .connect(context.accounts[0])
              .renounceOwnership();

            await expect(tx)
              .to.emit(newContractOwner, 'UniversalReceiver')
              .withArgs(
                context.universalProfile.address,
                0,
                LSP1_TYPE_IDS.LSP0OwnershipTransferred_SenderNotification,
                abiCoder.encode(
                  ['address', 'address'],
                  [newContractOwner.address, ethers.constants.AddressZero],
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
            .transferOwnership(ownerContract.address);

          await ownerContract
            .connect(context.deployParams.owner)
            .acceptOwnership(context.universalProfile.address);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should revert when calling LSP0 function', async () => {
          const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

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
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should revert when calling LSP0 function', async () => {
          const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

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
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should pass when calling LSP0 function', async () => {
          const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(context.universalProfile.setData(dataKey, dataValue)).to.emit(
            ownerContract,
            'FallbackCalled',
          );
        });
      });

      describe('that implements verifyCall but return an expanded bytes32 value', () => {
        let ownerContract: FirstCallReturnExpandedFailValue;

        before('deploying a new owner', async () => {
          ownerContract = await new FirstCallReturnExpandedFailValue__factory(
            context.deployParams.owner,
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should revert when calling `setData(bytes32,bytes)`', async () => {
          const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(
            context.universalProfile.setData(dataKey, dataValue),
          ).to.be.revertedWithoutReason();
        });
      });

      describe("that implements verifyCall but doesn't return success value", () => {
        let ownerContract: FirstCallReturnFailValue;

        before('deploying a new owner', async () => {
          ownerContract = await new FirstCallReturnFailValue__factory(
            context.deployParams.owner,
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        after('reverting to previous owner', async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile.connect(context.deployParams.owner).acceptOwnership();
        });

        it('should revert when calling `setData(bytes32,bytes)`', async () => {
          const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('RandomKey1'));
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(context.universalProfile.setData(dataKey, dataValue))
            .to.be.revertedWithCustomError(context.universalProfile, 'LSP20CallVerificationFailed')
            .withArgs(false, '0xaabbccdd');
        });
      });

      describe("that implements verifyCall that returns a valid success value but doesn't invoke verifyCallResult", () => {
        let firstCallReturnSuccessValueContract: FakeContract;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          firstCallReturnSuccessValueContract = await smock.fake(ILSP20CallVerifier__factory.abi);
          firstCallReturnSuccessValueContract.lsp20VerifyCall.returns(
            LSP20_SUCCESS_VALUES.VERIFY_CALL.NO_POST_VERIFICATION,
          );

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            firstCallReturnSuccessValueContract.address,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(newUniversalProfile.connect(context.accounts[3]).setData(key, value))
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

          const result = await newUniversalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('that implements verifyCall that returns a valid success value with additional data after the first 32 bytes', () => {
        let firstCallReturnSuccessValueContract: FakeContract;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          firstCallReturnSuccessValueContract = await smock.fake(ILSP20CallVerifier__factory.abi);
          firstCallReturnSuccessValueContract.lsp20VerifyCall.returns(
            LSP20_SUCCESS_VALUES.VERIFY_CALL.NO_POST_VERIFICATION +
              '0'.repeat(56) +
              '0xcafecafecafecafecafecafecafecafecafecafe' +
              '0'.repeat(24),
          );

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            firstCallReturnSuccessValueContract.address,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(
            newUniversalProfile.connect(context.accounts[3])['setData(bytes32,bytes)'](key, value),
          )
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

          const result = await newUniversalProfile['getData(bytes32)'](key);
          expect(result).to.equal(value);
        });
      });

      describe('that implements verifyCall and verifyCallResult and both return success value', () => {
        let bothCallReturnSuccessValueContract: FakeContract<ILSP20CallVerifier>;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          bothCallReturnSuccessValueContract = await smock.fake(ILSP20CallVerifier__factory.abi);
          bothCallReturnSuccessValueContract.lsp20VerifyCall.returns(
            LSP20_SUCCESS_VALUES.VERIFY_CALL.WITH_POST_VERIFICATION,
          );
          bothCallReturnSuccessValueContract.lsp20VerifyCallResult.returns(
            LSP20_SUCCESS_VALUES.VERIFY_CALL_RESULT,
          );

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            bothCallReturnSuccessValueContract.address,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(newUniversalProfile.connect(context.accounts[3]).setData(key, value))
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

          const result = await newUniversalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('that implements verifyCall and verifyCallResult and both return success value plus additional data', () => {
        let bothCallReturnSuccessValueContract: FakeContract<ILSP20CallVerifier>;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          bothCallReturnSuccessValueContract = await smock.fake(ILSP20CallVerifier__factory.abi);
          bothCallReturnSuccessValueContract.lsp20VerifyCall.returns(
            LSP20_SUCCESS_VALUES.VERIFY_CALL.WITH_POST_VERIFICATION +
              '0'.repeat(56) +
              '0xcafecafecafecafecafecafecafecafecafecafe' +
              '0'.repeat(24),
          );
          bothCallReturnSuccessValueContract.lsp20VerifyCallResult.returns(
            LSP20_SUCCESS_VALUES.VERIFY_CALL_RESULT +
              '0'.repeat(56) +
              '0xcafecafecafecafecafecafecafecafecafecafe' +
              '0'.repeat(24),
          );

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            bothCallReturnSuccessValueContract.address,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(
            newUniversalProfile.connect(context.accounts[3])['setData(bytes32,bytes)'](key, value),
          )
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

          const result = await newUniversalProfile['getData(bytes32)'](key);
          expect(result).to.equal(value);
        });
      });

      describe('that implements verifyCallResult but return fail value', () => {
        let secondCallReturnFailureContract: FakeContract<ILSP20CallVerifier>;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          secondCallReturnFailureContract = await smock.fake(ILSP20CallVerifier__factory.abi);
          secondCallReturnFailureContract.lsp20VerifyCall.returns(
            LSP20_SUCCESS_VALUES.VERIFY_CALL.WITH_POST_VERIFICATION,
          );
          secondCallReturnFailureContract.lsp20VerifyCallResult.returns('0x00000000');

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            secondCallReturnFailureContract.address,
          );
        });

        it('should revert when calling `setData(bytes32,bytes)`', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(
            newUniversalProfile.connect(context.accounts[3]).setData(key, value),
          ).to.be.revertedWithCustomError(newUniversalProfile, 'LSP20CallVerificationFailed');
        });
      });

      describe('that implements verifyCallResult but return an expanded success value', () => {
        let secondCallReturnExpandedValueContract: FakeContract<ILSP20CallVerifier>;
        let newUniversalProfile: UniversalProfile;

        before(async () => {
          secondCallReturnExpandedValueContract = await smock.fake(ILSP20CallVerifier__factory.abi);
          secondCallReturnExpandedValueContract.lsp20VerifyCall.returns(
            LSP20_SUCCESS_VALUES.VERIFY_CALL.WITH_POST_VERIFICATION,
          );
          secondCallReturnExpandedValueContract.lsp20VerifyCallResult.returns(
            ethers.utils.solidityPack(
              ['bytes4', 'bytes28'],
              [LSP20_SUCCESS_VALUES.VERIFY_CALL_RESULT, '0x' + '0'.repeat(56)],
            ),
          );

          newUniversalProfile = await new UniversalProfile__factory(context.accounts[0]).deploy(
            secondCallReturnExpandedValueContract.address,
          );
        });

        it('should pass when calling `setData(bytes32,bytes)`', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(newUniversalProfile.connect(context.accounts[3]).setData(key, value))
            .to.emit(newUniversalProfile, 'DataChanged')
            .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

          const result = await newUniversalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });
    });
  });
};
