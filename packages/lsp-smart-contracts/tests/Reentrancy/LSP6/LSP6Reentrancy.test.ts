import { expect } from 'chai';
import {
  hexlify,
  keccak256,
  parseEther,
  solidityPacked,
  toUtf8Bytes,
  ZeroAddress,
  ZeroHash,
} from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { EIP191Signer } from '@lukso/eip191-signer.js';

// setup
import { LSP6TestContext } from '../../utils/context';
import { buildReentrancyContext } from './reentrancyHelpers';

// tests
import { testSingleExecuteToSingleExecute } from './SingleExecuteToSingleExecute.test';
import { testSingleExecuteRelayCallToSingleExecute } from './SingleExecuteRelayCallToSingleExecute.test';
import { testSingleExecuteToSingleExecuteRelayCall } from './SingleExecuteToSingleExecuteRelayCall.test';
import { testSingleExecuteRelayCallToSingleExecuteRelayCall } from './SingleExecuteRelayCallToSingleExecuteRelayCall.test';
import { testSingleExecuteToBatchExecute } from './SingleExecuteToBatchExecute.test';
import { testSingleExecuteToBatchExecuteRelayCall } from './SingleExecuteToBatchExecuteRelayCall.test';

import { ERC725YDataKeys, LSP1_TYPE_IDS } from '../../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { ALL_PERMISSIONS, CALLTYPE, PERMISSIONS } from '@lukso/lsp6-contracts';
import { LSP25_VERSION } from '@lukso/lsp25-contracts';

import {
  combineAllowedCalls,
  combineCallTypes,
  combinePermissions,
  encodeCompactBytesArray,
  LOCAL_PRIVATE_KEYS,
  provider,
} from '../../utils/helpers';

import { setupKeyManager } from '../../utils/fixtures';
import { ethers } from 'hardhat';

export const shouldBehaveLikeLSP6ReentrancyScenarios = (
  buildContext: (initialFunding?: bigint) => Promise<LSP6TestContext>,
) => {
  describe('Basic Reentrancy Scenarios', () => {
    let context: LSP6TestContext;

    let signer: SignerWithAddress, relayer: SignerWithAddress, attacker: SignerWithAddress;

    let maliciousContract;

    let Reentrancy__factory;

    before(async () => {
      context = await buildContext();

      signer = context.accounts[1];
      relayer = context.accounts[2];
      attacker = context.accounts[4];

      Reentrancy__factory = await ethers.getContractFactory('Reentrancy', context.accounts[0]);

      maliciousContract = await Reentrancy__factory.deploy(await context.keyManager.getAddress());

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + signer.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + signer.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        combinePermissions(
          PERMISSIONS.CALL,
          PERMISSIONS.TRANSFERVALUE,
          PERMISSIONS.EXECUTE_RELAY_CALL,
        ),
        combineAllowedCalls(
          // TODO: test reentrancy against the bits for the allowed calls
          [
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
          ],
          [signer.address, ZeroAddress],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);

      // Fund Universal Profile with some LYXe
      await context.mainController.sendTransaction({
        to: await context.universalProfile.getAddress(),
        value: parseEther('10'),
      });
    });

    describe('when sending LYX to a contract', () => {
      it('Permissions should prevent ReEntrancy and stop malicious contract with a re-entrant receive() function.', async () => {
        // the Universal Profile wants to send 1 x LYX from its UP to another smart contract
        // we assume the UP owner is not aware that some malicious code is present
        // in the fallback function of the target (= recipient) contract
        const transferPayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await maliciousContract.getAddress(),
          parseEther('1'),
          '0x',
        ]);

        const executePayload = context.keyManager.interface.encodeFunctionData('execute', [
          transferPayload,
        ]);
        // load the malicious payload, that will be executed in the receive function
        // every time the contract receives LYX
        await maliciousContract.loadPayload(executePayload);

        const initialAccountBalance = await provider.getBalance(
          await context.universalProfile.getAddress(),
        );
        const initialAttackerContractBalance = await provider.getBalance(
          await maliciousContract.getAddress(),
        );

        // send LYX to malicious contract
        // at this point, the malicious contract receive function try to drain funds by re-entering the KeyManager
        // this should not be possible since it does not have the permission `REENTRANCY`
        await expect(context.keyManager.connect(context.mainController).execute(transferPayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(await maliciousContract.getAddress(), 'REENTRANCY');

        const newAccountBalance = await provider.getBalance(
          await context.universalProfile.getAddress(),
        );
        const newAttackerContractBalance = await provider.getBalance(
          await maliciousContract.getAddress(),
        );

        expect(newAccountBalance).to.equal(initialAccountBalance);
        expect(newAttackerContractBalance).to.equal(initialAttackerContractBalance);
      });

      describe('when calling via `executeRelayCall(...)`', () => {
        const channelId = 0;

        it('Replay Attack should fail because of invalid nonce', async () => {
          const nonce = await context.keyManager.getNonce(signer.address, channelId);

          const validityTimestamps = 0;

          const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
            'execute',
            [OPERATION_TYPES.CALL, signer.address, parseEther('1'), '0x'],
          );

          const HARDHAT_CHAINID = 31337;
          const valueToSend = 0;

          const encodedMessage = solidityPacked(
            ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
            [
              LSP25_VERSION,
              HARDHAT_CHAINID,
              nonce,
              validityTimestamps,
              valueToSend,
              executeRelayCallPayload,
            ],
          );

          const eip191Signer = new EIP191Signer();

          const { signature } = await eip191Signer.signDataWithIntendedValidator(
            await context.keyManager.getAddress(),
            encodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT1,
          );

          // first call
          await context.keyManager
            .connect(relayer)
            .executeRelayCall(signature, nonce, validityTimestamps, executeRelayCallPayload, {
              value: valueToSend,
            });

          // 2nd call = replay attack
          await expect(
            context.keyManager
              .connect(relayer)
              .executeRelayCall(signature, nonce, validityTimestamps, executeRelayCallPayload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'InvalidRelayNonce')
            .withArgs(signer.address, nonce, signature);
        });
      });
    });

    describe('when reentering execute function', () => {
      it('should revert if reentered from a random address', async () => {
        const transferPayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await maliciousContract.getAddress(),
          parseEther('1'),
          '0x',
        ]);

        const executePayload = context.keyManager.interface.encodeFunctionData('execute', [
          transferPayload,
        ]);

        await maliciousContract.loadPayload(executePayload);

        await expect(context.keyManager.connect(context.mainController).execute(transferPayload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
          .withArgs(await maliciousContract.getAddress(), 'REENTRANCY');
      });

      it('should pass when reentered by URD and the URD has REENTRANCY permission', async () => {
        const URDDummy = await Reentrancy__factory.deploy(await context.keyManager.getAddress());

        const setDataPayload = context.universalProfile.interface.encodeFunctionData(
          'setDataBatch',
          [
            [
              ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
              ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                (await URDDummy.getAddress()).substring(2),
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
                (await URDDummy.getAddress()).substring(2),
            ],
            [
              await URDDummy.getAddress(),
              combinePermissions(PERMISSIONS.TRANSFERVALUE, PERMISSIONS.REENTRANCY),
              combineAllowedCalls(
                [combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL)],
                [await URDDummy.getAddress()],
                ['0xffffffff'],
                ['0xffffffff'],
              ),
            ],
          ],
        );

        await context.keyManager.connect(context.mainController).execute(setDataPayload);

        const transferPayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await URDDummy.getAddress(),
          parseEther('1'),
          '0x',
        ]);

        const executePayload = context.keyManager.interface.encodeFunctionData('execute', [
          transferPayload,
        ]);

        await URDDummy.loadPayload(executePayload);

        const initialAccountBalance = await provider.getBalance(
          await context.universalProfile.getAddress(),
        );
        const initialAttackerContractBalance = await provider.getBalance(
          await maliciousContract.getAddress(),
        );

        await context.keyManager.connect(context.mainController).execute(transferPayload);

        const newAccountBalance = await provider.getBalance(
          await context.universalProfile.getAddress(),
        );
        const newAttackerContractBalance = await provider.getBalance(await URDDummy.getAddress());

        expect(newAccountBalance).to.equal(initialAccountBalance - parseEther('2'));
        expect(newAttackerContractBalance).to.equal(
          initialAttackerContractBalance + parseEther('2'),
        );
      });

      it('should allow the URD to use `setData(..)` through the LSP6', async () => {
        const UniversalReceiverDelegateDataUpdater__factory = await ethers.getContractFactory(
          'UniversalReceiverDelegateDataUpdater',
          context.accounts[0],
        );
        const universalReceiverDelegateDataUpdater =
          await UniversalReceiverDelegateDataUpdater__factory.deploy();

        const randomHardcodedKey = keccak256(toUtf8Bytes('some random data key'));
        const randomHardcodedValue = hexlify(toUtf8Bytes('some random text for the data value'));

        const setDataPayload = context.universalProfile.interface.encodeFunctionData(
          'setDataBatch',
          [
            [
              ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
              ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                (await universalReceiverDelegateDataUpdater.getAddress()).substring(2),
              ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
                (await universalReceiverDelegateDataUpdater.getAddress()).substring(2),
            ],
            [
              await universalReceiverDelegateDataUpdater.getAddress(),
              combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.REENTRANCY),
              encodeCompactBytesArray([randomHardcodedKey]),
            ],
          ],
        );

        await context.keyManager.connect(context.mainController).execute(setDataPayload);

        const universalReceiverDelegatePayload =
          universalReceiverDelegateDataUpdater.interface.encodeFunctionData(
            'universalReceiverDelegate',
            [ZeroAddress, 0, LSP1_TYPE_IDS.LSP7Tokens_SenderNotification, '0xcafecafecafecafe'],
          );

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          await universalReceiverDelegateDataUpdater.getAddress(),
          parseEther('0'),
          universalReceiverDelegatePayload,
        ]);

        await context.keyManager.connect(context.mainController).execute(executePayload);

        expect(await context.universalProfile.getData(randomHardcodedKey)).to.equal(
          randomHardcodedValue,
        );
      });
    });

    describe('when chaining reentrancy', () => {
      let firstReentrant;
      let secondReentrant;

      before(async () => {
        const SecondToCallLSP6__factory = await ethers.getContractFactory(
          'SecondToCallLSP6',
          context.accounts[0],
        );
        secondReentrant = await SecondToCallLSP6__factory.deploy(
          await context.keyManager.getAddress(),
        );

        const FirstToCallLSP6__factory = await ethers.getContractFactory(
          'FirstToCallLSP6',
          context.accounts[0],
        );
        firstReentrant = await FirstToCallLSP6__factory.deploy(
          await context.keyManager.getAddress(),
          await secondReentrant.getAddress(),
        );

        const permissionKeys = [
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            context.mainController.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            (await firstReentrant.getAddress()).substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            (await secondReentrant.getAddress()).substring(2),
        ];

        const permissionValues = [
          ALL_PERMISSIONS,
          combinePermissions(PERMISSIONS.SUPER_CALL, PERMISSIONS.REENTRANCY),
          combinePermissions(PERMISSIONS.SUPER_SETDATA),
        ];

        await setupKeyManager(context, permissionKeys, permissionValues);
      });

      describe('when executing reentrant calls from two different contracts', () => {
        describe('when the firstReentrant execute its first reentrant call to the UniversalProfile successfully', () => {
          describe('when the secondReentrant is not granted REENTRANCY Permission', () => {
            it('shoul fail stating that the caller (secondReentrant) is not authorised (no reentrancy permission)', async () => {
              const firstTargetSelector =
                firstReentrant.interface.encodeFunctionData('firstTarget');

              const payload = context.universalProfile.interface.encodeFunctionData('execute', [
                OPERATION_TYPES.CALL,
                await firstReentrant.getAddress(),
                0,
                firstTargetSelector,
              ]);

              await expect(context.keyManager.connect(context.mainController).execute(payload))
                .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
                .withArgs(await secondReentrant.getAddress(), 'REENTRANCY');
            });
          });

          describe('when the secondReentrant is granted REENTRANCY Permission', () => {
            before(async () => {
              const permissionKeys = [
                ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                  (await secondReentrant.getAddress()).substring(2),
              ];

              const permissionValues = [
                combinePermissions(PERMISSIONS.SUPER_SETDATA, PERMISSIONS.REENTRANCY),
              ];

              await setupKeyManager(context, permissionKeys, permissionValues);
            });

            it('should pass and setData from the second reentrantCall on the UniversalProfile correctly', async () => {
              const firstTargetSelector =
                firstReentrant.interface.encodeFunctionData('firstTarget');

              const payload = context.universalProfile.interface.encodeFunctionData('execute', [
                OPERATION_TYPES.CALL,
                await firstReentrant.getAddress(),
                0,
                firstTargetSelector,
              ]);

              await context.keyManager.connect(context.mainController).execute(payload);

              const result = await context.universalProfile['getData(bytes32)'](ZeroHash);

              expect(result).to.equal('0xaabbccdd');
            });
          });
        });
      });
    });
  });

  describe('first call through `execute(bytes)`, second call through `execute(bytes)`', () => {
    testSingleExecuteToSingleExecute(buildContext, buildReentrancyContext);
  });

  describe('first call through `executeRelayCall(bytes,uint256,bytes)`, second call through `execute(bytes)`', () => {
    testSingleExecuteRelayCallToSingleExecute(buildContext, buildReentrancyContext);
  });

  describe('first call through `execute(bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`', () => {
    testSingleExecuteToSingleExecuteRelayCall(buildContext, buildReentrancyContext);
  });

  describe('first call through `executeRelayCall(bytes,uint256,bytes)`, second call through `executeRelayCall(bytes,uint256,bytes)`', () => {
    testSingleExecuteRelayCallToSingleExecuteRelayCall(buildContext, buildReentrancyContext);
  });

  describe('first call through `execute(bytes)`, second call through `execute(uint256[],bytes[])`', () => {
    testSingleExecuteToBatchExecute(buildContext, buildReentrancyContext);
  });

  describe('first call through `execute(bytes)`, second call through `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`', () => {
    testSingleExecuteToBatchExecuteRelayCall(buildContext, buildReentrancyContext);
  });
};
