import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

// constants
import { LSP1_TYPE_IDS } from '../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { abiCoder } from '../utils/helpers';

export type LSP20TestContext = {
  accounts: SignerWithAddress[];
  universalProfile;
  deployParams: { owner: SignerWithAddress };
};

export const shouldBehaveLikeLSP20 = (buildContext: () => Promise<LSP20TestContext>) => {
  let context: LSP20TestContext;

  let NotImplementingVerifyCall__factory,
    ImplementingFallback__factory,
    FallbackReturnSuccessValue__factory,
    OwnerWithURD__factory,
    UniversalProfile__factory,
    FirstCallReturnExpandedInvalidValue__factory,
    FirstCallReturnInvalidValue__factory,
    SecondCallReturnFailureValue__factory,
    FirstCallReturnSuccessValue__factory,
    BothCallReturnSuccessValue__factory,
    SecondCallReturnExpandedSuccessValue__factory;

  before(async () => {
    context = await buildContext();

    NotImplementingVerifyCall__factory = await ethers.getContractFactory(
      'NotImplementingVerifyCall',
      context.accounts[0],
    );
    ImplementingFallback__factory = await ethers.getContractFactory(
      'ImplementingFallback',
      context.accounts[0],
    );
    FallbackReturnSuccessValue__factory = await ethers.getContractFactory(
      'FallbackReturnSuccessValue',
      context.accounts[0],
    );
    OwnerWithURD__factory = await ethers.getContractFactory('OwnerWithURD', context.accounts[0]);
    UniversalProfile__factory = await ethers.getContractFactory(
      'UniversalProfile',
      context.accounts[0],
    );
    FirstCallReturnExpandedInvalidValue__factory = await ethers.getContractFactory(
      'FirstCallReturnExpandedInvalidValue',
      context.accounts[0],
    );
    FirstCallReturnInvalidValue__factory = await ethers.getContractFactory(
      'FirstCallReturnInvalidValue',
      context.accounts[0],
    );
    SecondCallReturnFailureValue__factory = await ethers.getContractFactory(
      'SecondCallReturnFailureValue',
      context.accounts[0],
    );
    FirstCallReturnSuccessValue__factory = await ethers.getContractFactory(
      'FirstCallReturnSuccessValue',
      context.accounts[0],
    );
    BothCallReturnSuccessValue__factory = await ethers.getContractFactory(
      'BothCallReturnSuccessValue',
      context.accounts[0],
    );
    SecondCallReturnExpandedSuccessValue__factory = await ethers.getContractFactory(
      'SecondCallReturnExpandedSuccessValue',
      context.accounts[0],
    );
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
          let newContractOwner;

          before('Use custom owner that implements LSP1', async () => {
            newContractOwner = await OwnerWithURD__factory.deploy(
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
        let ownerContract;

        before('deploying a new owner', async () => {
          ownerContract = await NotImplementingVerifyCall__factory.deploy();

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
        let ownerContract;

        before('deploying a new owner', async () => {
          ownerContract = await ImplementingFallback__factory.deploy();

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
        let ownerContract;

        before('deploying a new owner', async () => {
          ownerContract = await FallbackReturnSuccessValue__factory.deploy();

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
        let ownerContract;

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
        let ownerContract;

        before('deploying a new owner', async () => {
          ownerContract = await FirstCallReturnInvalidValue__factory.deploy();

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
        let firstCallReturnSuccessValueContract;
        let newUniversalProfile;

        before(async () => {
          firstCallReturnSuccessValueContract = await FirstCallReturnSuccessValue__factory.deploy();

          newUniversalProfile = await UniversalProfile__factory.deploy();
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
        let firstCallReturnSuccessValueContract;
        let newUniversalProfile;

        before(async () => {
          firstCallReturnSuccessValueContract = await FirstCallReturnSuccessValue__factory.deploy();

          newUniversalProfile = await UniversalProfile__factory.deploy(
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
        let bothCallReturnSuccessValueContract;
        let newUniversalProfile;

        before(async () => {
          bothCallReturnSuccessValueContract = await BothCallReturnSuccessValue__factory.deploy();

          newUniversalProfile = await UniversalProfile__factory.deploy(
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
        let bothCallReturnSuccessValueContract;
        let newUniversalProfile;

        before(async () => {
          bothCallReturnSuccessValueContract = await BothCallReturnSuccessValue__factory.deploy();

          newUniversalProfile = await UniversalProfile__factory.deploy(
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
        let secondCallReturnFailureContract;
        let newUniversalProfile;

        before(async () => {
          secondCallReturnFailureContract = await SecondCallReturnFailureValue__factory.deploy();

          newUniversalProfile = await UniversalProfile__factory.deploy(
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
        let secondCallReturnExpandedValueContract;
        let newUniversalProfile;

        before(async () => {
          secondCallReturnExpandedValueContract =
            await SecondCallReturnExpandedSuccessValue__factory.deploy();

          newUniversalProfile = await UniversalProfile__factory.deploy(
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
