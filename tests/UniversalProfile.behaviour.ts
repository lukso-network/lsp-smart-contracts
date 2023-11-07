import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

// types
import {
  UniversalProfile,
  GenericExecutor__factory,
  ERC1271MaliciousMock__factory,
  UniversalReceiverDelegateDataLYX__factory,
  UniversalReceiverDelegateDataLYX,
  EmitEventExtension,
  EmitEventExtension__factory,
  OwnerWithURD__factory,
  OwnerWithURD,
} from '../types';

// helpers
import { LSP1_HOOK_PLACEHOLDER, abiCoder, getRandomAddresses } from './utils/helpers';

// constants
import {
  ERC1271_VALUES,
  ERC725YDataKeys,
  INTERFACE_IDS,
  LSP1_TYPE_IDS,
  OPERATION_TYPES,
  SupportedStandards,
} from '../constants';

export type LSP3TestContext = {
  accounts: SignerWithAddress[];
  universalProfile: UniversalProfile;
  deployParams: { owner: SignerWithAddress; initialFunding?: number };
};

export const shouldBehaveLikeLSP3 = (
  buildContext: (initialFunding?: number) => Promise<LSP3TestContext>,
) => {
  let context: LSP3TestContext;

  before(async () => {
    context = await buildContext(100);
  });

  describe('when using `isValidSignature()` from ERC1271', () => {
    afterEach(async () => {
      context = await buildContext(100);
    });
    it('should verify signature from owner', async () => {
      const signer = context.deployParams.owner;

      const dataToSign = '0xcafecafe';
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(messageHash, signature);
      expect(result).to.equal(ERC1271_VALUES.SUCCESS_VALUE);
    });

    it('should return fail value when verifying signature from non-owner', async () => {
      const signer = context.accounts[1];

      const dataToSign = '0xcafecafe';
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(messageHash, signature);
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });

    it("should return failValue when the owner doesn't have isValidSignature function", async () => {
      const signer = context.accounts[1];

      const genericExecutor = await new GenericExecutor__factory(context.accounts[0]).deploy();

      await context.universalProfile
        .connect(context.accounts[0])
        .transferOwnership(genericExecutor.address);

      const acceptOwnershipPayload =
        context.universalProfile.interface.encodeFunctionData('acceptOwnership');

      await genericExecutor.call(context.universalProfile.address, 0, acceptOwnershipPayload);

      const dataToSign = '0xcafecafe';
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(messageHash, signature);
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });

    it("should return failValue when the owner call isValidSignature function that doesn't return bytes4", async () => {
      const signer = context.accounts[1];

      const maliciousERC1271Wallet = await new ERC1271MaliciousMock__factory(
        context.accounts[0],
      ).deploy();

      await context.universalProfile
        .connect(context.accounts[0])
        .transferOwnership(maliciousERC1271Wallet.address);

      const acceptOwnershipPayload =
        context.universalProfile.interface.encodeFunctionData('acceptOwnership');

      await maliciousERC1271Wallet.call(
        context.universalProfile.address,
        0,
        acceptOwnershipPayload,
      );

      const dataToSign = '0xcafecafe';
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(messageHash, signature);
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });

    it('should return failValue when providing an invalid length signature', async () => {
      const data = '0xcafecafe';
      const messageHash = ethers.utils.hashMessage(data);
      const signature = '0xbadbadbadb';

      const result = await context.universalProfile.isValidSignature(messageHash, signature);
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });
  });

  describe('when interacting with the ERC725Y storage', () => {
    const lsp12IssuedAssetsKeys = [
      ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index + '00000000000000000000000000000000',
      ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index + '00000000000000000000000000000001',
    ];

    const lsp12IssuedAssetsValues = [
      '0xd94353d9b005b3c0a9da169b768a31c57844e490',
      '0xdaea594e385fc724449e3118b2db7e86dfba1826',
    ];

    it('should fail when passing empty arrays of data keys / values', async () => {
      const keys = [];
      const values = [];

      await expect(
        context.universalProfile.setDataBatch(keys, values),
      ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725Y_DataKeysValuesEmptyArray');
    });

    it('should set the 3 x keys for a basic UP setup => `LSP3Profile`, `LSP12IssuedAssets[]` and `LSP1UniversalReceiverDelegate`', async () => {
      const keys = [
        ERC725YDataKeys.LSP3.LSP3Profile,
        ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].length,
        ...lsp12IssuedAssetsKeys,
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
      ];
      const values = [
        '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178',
        '0x0000000000000000000000000000000000000000000000000000000000000002',
        ...lsp12IssuedAssetsValues,
        '0x1183790f29be3cdfd0a102862fea1a4a30b3adab',
      ];

      await context.universalProfile.setDataBatch(keys, values);

      const result = await context.universalProfile.getDataBatch(keys);
      expect(result).to.eql(values);
    });

    it('should add +10 more LSP12IssuedAssets[]', async () => {
      const newIssuedAssets = getRandomAddresses(10);

      const expectedKeysLength = lsp12IssuedAssetsKeys.length + newIssuedAssets.length;
      const expectedValuesLength = lsp12IssuedAssetsValues.length + newIssuedAssets.length;

      for (let ii = 0; ii < newIssuedAssets.length; ii++) {
        const hexIndex = ethers.utils.hexlify(lsp12IssuedAssetsKeys.length);

        lsp12IssuedAssetsKeys.push(
          ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index +
            ethers.utils.hexZeroPad(hexIndex, 16).substring(2),
        );

        lsp12IssuedAssetsValues.push(newIssuedAssets[ii]);
      }
      expect(lsp12IssuedAssetsKeys.length).to.equal(expectedKeysLength);
      expect(lsp12IssuedAssetsValues.length).to.equal(expectedValuesLength);

      const keys = [
        ...lsp12IssuedAssetsKeys,
        ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].length, // update array length
      ];

      const values = [
        ...lsp12IssuedAssetsValues,
        ethers.utils.hexZeroPad(ethers.utils.hexlify(lsp12IssuedAssetsValues.length), 32),
      ];

      await context.universalProfile.setDataBatch(keys, values);

      const result = await context.universalProfile.getDataBatch(keys);
      expect(result).to.eql(values);
    });

    for (let ii = 1; ii <= 8; ii++) {
      it('should add +1 LSP12IssuedAssets', async () => {
        const hexIndex = ethers.utils.hexlify(lsp12IssuedAssetsKeys.length + 1);

        lsp12IssuedAssetsKeys.push(
          ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index +
            ethers.utils.hexZeroPad(hexIndex, 16).substring(2),
        );

        lsp12IssuedAssetsValues.push(ethers.Wallet.createRandom().address.toLowerCase());

        const keys = [
          ...lsp12IssuedAssetsKeys,
          ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].length, // update array length
        ];

        const values = [
          ...lsp12IssuedAssetsValues,
          ethers.utils.hexZeroPad(ethers.utils.hexlify(lsp12IssuedAssetsValues.length), 32),
        ];

        await context.universalProfile.setDataBatch(keys, values);

        const result = await context.universalProfile.getDataBatch(keys);
        expect(result).to.eql(values);
      });
    }

    describe('when setting a data key with a value less than 256 bytes', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(200));

        await expect(context.universalProfile.setData(key, value))
          .to.emit(context.universalProfile, 'DataChanged')
          .withArgs(key, value);

        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when setting a data key with a value more than 256 bytes', () => {
      it('should emit DataChanged event with only the first 256 bytes of the value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

        await expect(context.universalProfile.setData(key, value))
          .to.emit(context.universalProfile, 'DataChanged')
          .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when setting a data key with a value exactly 256 bytes long', () => {
      it('should emit DataChanged event with the whole data value', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        await expect(context.universalProfile.setData(key, value))
          .to.emit(context.universalProfile, 'DataChanged')
          .withArgs(key, value);

        const result = await context.universalProfile.getData(key);
        expect(result).to.equal(value);
      });
    });

    describe('when sending value while setting data', () => {
      describe('when calling setData(..)', () => {
        it('should pass and emit the UniversalReceiver event', async () => {
          const msgValue = ethers.utils.parseEther('2');
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

          await expect(
            context.universalProfile
              .connect(context.accounts[0])
              .setData(key, value, { value: msgValue }),
          )
            .to.emit(context.universalProfile, 'UniversalReceiver')
            .withArgs(
              context.accounts[0].address,
              msgValue,
              LSP1_TYPE_IDS.LSP0ValueReceived,
              context.universalProfile.interface.getSighash('setData'),
              '0x',
            );

          const result = await context.universalProfile.getData(key);
          expect(result).to.equal(value);
        });
      });

      describe('when calling setData(..) Array', () => {
        it('should pass and emit the UniversalReceiver event', async () => {
          const msgValue = ethers.utils.parseEther('2');
          const key = [ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'))];
          const value = [ethers.utils.hexlify(ethers.utils.randomBytes(256))];

          await expect(
            context.universalProfile
              .connect(context.accounts[0])
              .setDataBatch(key, value, { value: msgValue }),
          )
            .to.emit(context.universalProfile, 'UniversalReceiver')
            .withArgs(
              context.accounts[0].address,
              msgValue,
              LSP1_TYPE_IDS.LSP0ValueReceived,
              context.universalProfile.interface.getSighash('setDataBatch'),
              '0x',
            );

          const result = await context.universalProfile.getDataBatch(key);
          expect(result).to.deep.equal(value);
        });
      });
    });
  });

  describe('when calling the contract without any value or data', () => {
    it('should pass and not emit the UniversalReceiver event', async () => {
      const sender = context.accounts[0];
      const amount = 0;

      // prettier-ignore
      await expect(
        sender.sendTransaction({
          to: context.universalProfile.address,
          value: amount,
        })
      ).to.not.be.reverted
        .to.not.emit(context.universalProfile, "UniversalReceiver");
    });
  });

  describe('when sending native tokens to the contract', () => {
    it('should emit the right UniversalReceiver event', async () => {
      const sender = context.accounts[0];
      const amount = ethers.utils.parseEther('5');

      await expect(
        sender.sendTransaction({
          to: context.universalProfile.address,
          value: amount,
        }),
      )
        .to.emit(context.universalProfile, 'UniversalReceiver')
        .withArgs(
          sender.address,
          amount,
          LSP1_TYPE_IDS.LSP0ValueReceived,
          '0x',
          abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
        );
    });

    it('should allow to send a random payload as well, and emit the UniversalReceiver event', async () => {
      const sender = context.accounts[0];
      const amount = ethers.utils.parseEther('5');

      // The payload must be prepended with bytes4(0) to be interpreted as graffiti
      // and not as a function selector
      await expect(
        sender.sendTransaction({
          to: context.universalProfile.address,
          value: amount,
          data: '0x00000000aabbccdd',
        }),
      )
        .to.emit(context.universalProfile, 'UniversalReceiver')
        .withArgs(
          sender.address,
          amount,
          LSP1_TYPE_IDS.LSP0ValueReceived,
          '0x00000000aabbccdd',
          abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
        );
    });
  });

  describe('when sending a random payload, without any value', () => {
    it('should execute the fallback function, but not emit the UniversalReceiver event', async () => {
      // The payload must be prepended with bytes4(0) to be interpreted as graffiti
      // and not as a function selector
      const tx = await context.accounts[0].sendTransaction({
        to: context.universalProfile.address,
        value: 0,
        data: '0x00000000aabbccdd',
      });

      // check that no event was emitted
      await expect(tx).to.not.emit(context.universalProfile, 'UniversalReceiver');
    });
  });

  describe('when using the batch `ERC725X.execute(uint256[],address[],uint256[],bytes[])` function', () => {
    describe('when specifying `msg.value`', () => {
      it('should emit a `UniversalReceiver` event', async () => {
        const operationsType = Array(3).fill(OPERATION_TYPES.CALL);
        const recipients = [
          context.accounts[1].address,
          context.accounts[2].address,
          context.accounts[3].address,
        ];
        const values = Array(3).fill(ethers.BigNumber.from('1'));
        const datas = Array(3).fill('0x');

        const msgValue = ethers.utils.parseEther('10');

        const tx = await context.universalProfile.executeBatch(
          operationsType,
          recipients,
          values,
          datas,
          { value: msgValue },
        );

        await expect(tx)
          .to.emit(context.universalProfile, 'UniversalReceiver')
          .withArgs(
            context.deployParams.owner.address,
            msgValue,
            LSP1_TYPE_IDS.LSP0ValueReceived,
            context.universalProfile.interface.getSighash('executeBatch'),
            '0x',
          );
      });
    });

    describe('when NOT sending any `msg.value`', () => {
      it('should NOT emit a `UniversalReceiver` event', async () => {
        const operationsType = Array(3).fill(OPERATION_TYPES.CALL);
        const recipients = [
          context.accounts[1].address,
          context.accounts[2].address,
          context.accounts[3].address,
        ];
        const values = Array(3).fill(ethers.BigNumber.from('1'));
        const datas = Array(3).fill('0x');

        const msgValue = 0;

        const tx = await context.universalProfile.executeBatch(
          operationsType,
          recipients,
          values,
          datas,
          { value: msgValue },
        );

        await expect(tx).to.not.emit(context.universalProfile, 'UniversalReceiver');
      });
    });
  });

  describe('when using batchCalls function', () => {
    describe('when non-owner is calling', () => {
      it('shoud revert', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
        const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

        const setDataPayload = context.universalProfile.interface.encodeFunctionData('setData', [
          key,
          value,
        ]);

        await expect(
          context.universalProfile.connect(context.accounts[4]).batchCalls([setDataPayload]),
        )
          .to.be.revertedWithCustomError(context.universalProfile, 'LSP20EOACannotVerifyCall')
          .withArgs(context.deployParams.owner.address);
      });
    });

    describe('when the owner is calling', () => {
      describe('when executing one function', () => {
        describe('setData', () => {
          it('should pass', async () => {
            const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
            const value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

            const setDataPayload = context.universalProfile.interface.encodeFunctionData(
              'setData',
              [key, value],
            );

            await context.universalProfile
              .connect(context.deployParams.owner)
              .batchCalls([setDataPayload]);

            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);
          });
        });

        describe('execute', () => {
          it('should pass', async () => {
            const amount = 20;
            const executePayload = context.universalProfile.interface.encodeFunctionData(
              'execute',
              [0, context.accounts[4].address, amount, '0x'],
            );

            await expect(() =>
              context.universalProfile
                .connect(context.deployParams.owner)
                .batchCalls([executePayload]),
            ).to.changeEtherBalances(
              [context.universalProfile.address, context.accounts[4].address],
              [`-${amount}`, amount],
            );
          });
        });
      });

      describe('when executing several functions', () => {
        describe('When transfering lyx, setting data, transferring ownership', () => {
          it('should pass', async () => {
            const amount = 20;
            const executePayload = context.universalProfile.interface.encodeFunctionData(
              'execute',
              [0, context.accounts[5].address, amount, '0x'],
            );

            const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('A new key'));
            const value = ethers.utils.hexlify(ethers.utils.randomBytes(10));

            const setDataPayload = context.universalProfile.interface.encodeFunctionData(
              'setData',
              [key, value],
            );

            const transferOwnershipPayload = context.universalProfile.interface.encodeFunctionData(
              'transferOwnership',
              [context.accounts[8].address],
            );

            expect(await context.universalProfile.callStatic.pendingOwner()).to.equal(
              ethers.constants.AddressZero,
            );

            await expect(() =>
              context.universalProfile
                .connect(context.deployParams.owner)
                .batchCalls([executePayload, setDataPayload, transferOwnershipPayload]),
            ).to.changeEtherBalances(
              [context.universalProfile.address, context.accounts[5].address],
              [`-${amount}`, amount],
            );

            const result = await context.universalProfile.getData(key);
            expect(result).to.equal(value);

            expect(await context.universalProfile.callStatic.pendingOwner()).to.equal(
              context.accounts[8].address,
            );
          });
        });

        describe('When setting data and transferring value in staticcall operation', () => {
          it('should revert', async () => {
            const amount = 100;
            const executePayload = context.universalProfile.interface.encodeFunctionData(
              'execute',
              [3, context.accounts[5].address, amount, '0x'],
            );

            const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Another key'));
            const value = ethers.utils.hexlify(ethers.utils.randomBytes(10));

            const setDataPayload = context.universalProfile.interface.encodeFunctionData(
              'setData',
              [key, value],
            );

            await expect(
              context.universalProfile
                .connect(context.deployParams.owner)
                .batchCalls([setDataPayload, executePayload]),
            ).to.be.revertedWithCustomError(
              context.universalProfile,
              'ERC725X_MsgValueDisallowedInStaticCall',
            );
          });
        });
      });
    });
  });

  describe('when setting a UniversalReceiverDelegate for typeId of LYX receiving', () => {
    let universalReceiverDelegateLYX: UniversalReceiverDelegateDataLYX;
    before(async () => {
      universalReceiverDelegateLYX = await new UniversalReceiverDelegateDataLYX__factory(
        context.accounts[1],
      ).deploy();

      await context.universalProfile
        .connect(context.deployParams.owner)
        .setData(
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
            LSP1_TYPE_IDS.LSP0ValueReceived.substring(2, 42),
          universalReceiverDelegateLYX.address,
        );
    });

    describe('when sending LYX to the receive function', () => {
      it('should react on the call and apply the logic of the URD', async () => {
        const tx = await context.accounts[1].sendTransaction({
          to: context.universalProfile.address,
          value: 5,
        });

        expect(tx).to.emit(context.universalProfile, 'UniversalReceiver');

        const result = await universalReceiverDelegateLYX.lastValueReceived(
          context.universalProfile.address,
        );

        expect(result).to.equal(5);
      });
    });

    describe('when sending empty call to the receive function', () => {
      it('should not react on the call and not emit UniversalReceiver', async () => {
        const tx = await context.accounts[1].sendTransaction({
          to: context.universalProfile.address,
        });

        expect(tx).to.not.emit(context.universalProfile, 'UniversalReceiver');

        const result = await universalReceiverDelegateLYX.callStatic.lastValueReceived(
          context.universalProfile.address,
        );

        expect(result).to.equal(5);
      });
    });

    describe('when calling the UP with graffiti and value', () => {
      it('should react on the call and emit UniversalReceiver', async () => {
        const tx = await context.accounts[1].sendTransaction({
          to: context.universalProfile.address,
          data: '0x00000000aabbccdd',
          value: 7,
        });

        expect(tx).to.emit(context.universalProfile, 'UniversalReceiver');

        const result = await universalReceiverDelegateLYX.callStatic.lastValueReceived(
          context.universalProfile.address,
        );

        expect(result).to.equal(7);
      });
    });

    describe('when calling an extension with value', () => {
      let emitEventExtension: EmitEventExtension;
      let emitEventFunctionSelector;

      before(async () => {
        emitEventExtension = await new EmitEventExtension__factory(context.accounts[0]).deploy();

        emitEventFunctionSelector = '0x7b0cb839';

        const emitEventFunctionExtensionHandlerKey =
          ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
          emitEventFunctionSelector.substring(2) +
          '00000000000000000000000000000000'; // zero padded

        await context.universalProfile
          .connect(context.deployParams.owner)
          .setData(emitEventFunctionExtensionHandlerKey, emitEventExtension.address);
      });

      it('should react on the call and emit UniversalReceiver and run the extension', async () => {
        const tx = await context.accounts[1].sendTransaction({
          to: context.universalProfile.address,
          data: emitEventFunctionSelector,
          value: 10,
        });

        expect(tx).to.emit(context.universalProfile, 'UniversalReceiver');
        expect(tx).to.emit(emitEventExtension, 'EventEmittedInExtension');

        const result = await universalReceiverDelegateLYX.callStatic.lastValueReceived(
          context.universalProfile.address,
        );

        expect(result).to.equal(10);
      });
    });

    describe('when calling the universalReceiver function with Random TypeId and sending', () => {
      it('should react on the call and emit UniversalReceiver', async () => {
        const tx = await context.universalProfile
          .connect(context.accounts[0])
          .universalReceiver(LSP1_HOOK_PLACEHOLDER, '0xaabbccdd', { value: 15 });

        expect(tx)
          .to.emit(context.universalProfile, 'UniversalReceiver')
          .withArgs(
            context.accounts[0].address,
            15,
            LSP1_HOOK_PLACEHOLDER,
            '0xaabbccdd',
            abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
          );

        expect(tx)
          .to.emit(context.universalProfile, 'UniversalReceiver')
          .withArgs(
            context.accounts[0].address,
            15,
            LSP1_TYPE_IDS.LSP0ValueReceived,
            context.universalProfile.interface.getSighash('universalReceiver') +
              abiCoder
                .encode(['bytes32', 'bytes'], [LSP1_HOOK_PLACEHOLDER, '0xaabbccdd'])
                .substr(2),
            abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
          );

        const result = await universalReceiverDelegateLYX.callStatic.lastValueReceived(
          context.universalProfile.address,
        );

        expect(result).to.equal(15);
      });
    });
  });

  describe('when using `renounceOwnership()`', () => {
    describe('when caller is owner', () => {
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
        await newContractOwner.connect(context.accounts[0]).renounceOwnership();

        await network.provider.send('hardhat_mine', [ethers.utils.hexValue(199)]);

        const tx = await newContractOwner.connect(context.accounts[0]).renounceOwnership();

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
};

export const shouldInitializeLikeLSP3 = (buildContext: () => Promise<LSP3TestContext>) => {
  let context: LSP3TestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('should support ERC165 interface', async () => {
      const result = await context.universalProfile.supportsInterface(INTERFACE_IDS.ERC165);
      expect(result).to.be.true;
    });

    it('should support ERC1271 interface', async () => {
      const result = await context.universalProfile.supportsInterface(INTERFACE_IDS.ERC1271);
      expect(result).to.be.true;
    });

    it('should support ERC725X interface', async () => {
      const result = await context.universalProfile.supportsInterface(INTERFACE_IDS.ERC725X);
      expect(result).to.be.true;
    });

    it('should support ERC725Y interface', async () => {
      const result = await context.universalProfile.supportsInterface(INTERFACE_IDS.ERC725Y);
      expect(result).to.be.true;
    });

    it('should support LSP0 (ERC725Account) interface', async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP0ERC725Account,
      );
      expect(result).to.be.true;
    });

    it('should support LSP1 interface', async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP1UniversalReceiver,
      );
      expect(result).to.be.true;
    });

    it('should support LSP14Ownable2Step interface', async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP14Ownable2Step,
      );
      expect(result).to.be.true;
    });

    it('should support LSP17Extendable interface', async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP17Extendable,
      );
      expect(result).to.be.true;
    });

    it('should support LSP20CallVerification interface', async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP20CallVerification,
      );
      expect(result).to.be.true;
    });

    it("should have set key 'SupportedStandards:LSP3UniversalProfile'", async () => {
      const result = await context.universalProfile.getData(SupportedStandards.LSP3Profile.key);

      expect(result).to.equal(SupportedStandards.LSP3Profile.value);
    });
  });
};
