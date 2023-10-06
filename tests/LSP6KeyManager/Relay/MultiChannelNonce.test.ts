import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EIP191Signer } from '@lukso/eip191-signer.js';

import { TargetContract, TargetContract__factory } from '../../../types';

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  OPERATION_TYPES,
  LSP25_VERSION,
  PERMISSIONS,
  CALLTYPE,
} from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';
import { LOCAL_PRIVATE_KEYS, combineAllowedCalls, combinePermissions } from '../../utils/helpers';

export const shouldBehaveLikeMultiChannelNonce = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress, relayer: SignerWithAddress;
  let targetContract: TargetContract;

  before(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    relayer = context.accounts[2];

    targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

    const permissionKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + signer.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + signer.address.substring(2),
    ];

    const permissionsValues = [
      ALL_PERMISSIONS,
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
      combineAllowedCalls(
        [CALLTYPE.CALL],
        [targetContract.address],
        ['0xffffffff'],
        ['0xffffffff'],
      ),
    ];

    await setupKeyManager(context, permissionKeys, permissionsValues);
  });

  describe('when calling `getNonce(...)` with a channel ID greater than 2 ** 128', () => {
    it('should revert', async () => {
      const channelId = ethers.BigNumber.from(2).pow(129);

      await expect(context.keyManager.getNonce(signer.address, channelId)).to.be.revertedWithPanic;
    });
  });

  describe('testing sequential nonces (channel = 0)', () => {
    const channelId = 0;

    [
      { callNb: 'First', newName: 'Yamen', expectedNonce: 1 },
      { callNb: 'Second', newName: 'Nour', expectedNonce: 2 },
      { callNb: 'Third', newName: 'Huss', expectedNonce: 3 },
      { callNb: 'Fourth', newName: 'Moussa', expectedNonce: 4 },
    ].forEach(({ callNb, newName, expectedNonce }) => {
      // prettier-ignore
      it(`${callNb} call > nonce should increment from ${expectedNonce - 1} to ${expectedNonce}`, async () => {
        const latestNonce = await context.keyManager.callStatic.getNonce(
          signer.address,
          channelId
        );

        const validityTimestamps = 0;

        const targetContractPayload =
          targetContract.interface.encodeFunctionData("setName", [newName]);

        const executeRelayCallPayload =
          context.universalProfile.interface.encodeFunctionData(
            "execute",
            [
              OPERATION_TYPES.CALL,
              targetContract.address,
              0,
              targetContractPayload,
            ]
          );

        const HARDHAT_CHAINID = 31337;
        const valueToSend = 0;

        const encodedMessage = ethers.utils.solidityPack(
          ["uint256", "uint256", "uint256", "uint256", "uint256", "bytes"],
          [
            LSP25_VERSION,
            HARDHAT_CHAINID,
            latestNonce,
            validityTimestamps,
            valueToSend,
            executeRelayCallPayload,
          ]
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1
        );

        await context.keyManager.executeRelayCall(
          signature,
          latestNonce,
          validityTimestamps,
          executeRelayCallPayload,
          { value: valueToSend }
        );

        const fetchedName = await targetContract.callStatic.getName();
        const nonceAfter = await context.keyManager.callStatic.getNonce(
          signer.address,
          0
        );

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(latestNonce.add(1)); // ensure the nonce incremented
      });
    });
  });

  describe('out of order execution (channel = n)', () => {
    const nonces = [0, 1];

    describe('channel 1', () => {
      const channelId = 1;
      const names = ['Fabian', 'Yamen'];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        const nonceBefore = await context.keyManager.callStatic.getNonce(signer.address, channelId);

        const validityTimestamps = 0;

        const newName = names[0];

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          newName,
        ]);
        const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload],
        );

        const HARDHAT_CHAINID = 31337;
        const valueToSend = 0;

        const encodedMessage = ethers.utils.solidityPack(
          ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
          [
            LSP25_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            validityTimestamps,
            valueToSend,
            executeRelayCallPayload,
          ],
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1,
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, validityTimestamps, executeRelayCallPayload, {
            value: valueToSend,
          });

        const fetchedName = await targetContract.callStatic.getName();
        const nonceAfter = await context.keyManager.callStatic.getNonce(signer.address, channelId);

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        const nonceBefore = await context.keyManager.getNonce(signer.address, channelId);

        const validityTimestamps = 0;

        const newName = names[1];

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          newName,
        ]);
        const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload],
        );

        const HARDHAT_CHAINID = 31337;
        const valueToSend = 0;

        const encodedMessage = ethers.utils.solidityPack(
          ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
          [
            LSP25_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            validityTimestamps,
            valueToSend,
            executeRelayCallPayload,
          ],
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1,
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, validityTimestamps, executeRelayCallPayload, {
            value: valueToSend,
          });

        const fetchedName = await targetContract.callStatic.getName();
        const nonceAfter = await context.keyManager.callStatic.getNonce(signer.address, channelId);

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe('channel 2', () => {
      const channelId = 2;
      const names = ['Hugo', 'Reto'];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        const nonceBefore = await context.keyManager.getNonce(signer.address, channelId);

        const validityTimestamps = 0;

        const newName = names[0];

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          newName,
        ]);
        const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload],
        );

        const HARDHAT_CHAINID = 31337;
        const valueToSend = 0;

        const encodedMessage = ethers.utils.solidityPack(
          ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
          [
            LSP25_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            validityTimestamps,
            valueToSend,
            executeRelayCallPayload,
          ],
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1,
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, validityTimestamps, executeRelayCallPayload, {
            value: valueToSend,
          });

        const fetchedName = await targetContract.callStatic.getName();
        const nonceAfter = await context.keyManager.callStatic.getNonce(signer.address, channelId);

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        const nonceBefore = await context.keyManager.getNonce(signer.address, channelId);

        const validityTimestamps = 0;

        const newName = names[1];

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          newName,
        ]);
        const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload],
        );

        const HARDHAT_CHAINID = 31337;
        const valueToSend = 0;

        const encodedMessage = ethers.utils.solidityPack(
          ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
          [
            LSP25_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            validityTimestamps,
            valueToSend,
            executeRelayCallPayload,
          ],
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1,
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, validityTimestamps, executeRelayCallPayload, {
            value: valueToSend,
          });

        const fetchedName = await targetContract.callStatic.getName();
        const nonceAfter = await context.keyManager.callStatic.getNonce(signer.address, channelId);

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe('channel 3', () => {
      const channelId = 3;
      const names = ['Jean', 'Lenny'];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        const nonceBefore = await context.keyManager.getNonce(signer.address, channelId);

        const validityTimestamps = 0;

        const newName = names[0];

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          newName,
        ]);
        const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload],
        );

        const HARDHAT_CHAINID = 31337;
        const valueToSend = 0;

        const encodedMessage = ethers.utils.solidityPack(
          ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
          [
            LSP25_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            validityTimestamps,
            valueToSend,
            executeRelayCallPayload,
          ],
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1,
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, validityTimestamps, executeRelayCallPayload, {
            value: valueToSend,
          });

        const fetchedName = await targetContract.callStatic.getName();
        const nonceAfter = await context.keyManager.callStatic.getNonce(signer.address, channelId);

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        const nonceBefore = await context.keyManager.getNonce(signer.address, channelId);

        const validityTimestamps = 0;

        const newName = names[1];

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          newName,
        ]);
        const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload],
        );

        const HARDHAT_CHAINID = 31337;
        const valueToSend = 0;

        const encodedMessage = ethers.utils.solidityPack(
          ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
          [
            LSP25_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            validityTimestamps,
            valueToSend,
            executeRelayCallPayload,
          ],
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1,
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, validityTimestamps, executeRelayCallPayload, {
            value: valueToSend,
          });

        const fetchedName = await targetContract.callStatic.getName();
        const nonceAfter = await context.keyManager.callStatic.getNonce(signer.address, channelId);

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe('channel 15', () => {
      const channelId = 15;

      it('First call > nonce should increment from 0 to 1', async () => {
        const nonceBefore = await context.keyManager.getNonce(signer.address, channelId);

        const validityTimestamps = 0;

        const newName = 'Lukasz';

        const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
          newName,
        ]);
        const executeRelayCallPayload = context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload],
        );

        const HARDHAT_CHAINID = 31337;
        const valueToSend = 0;

        const encodedMessage = ethers.utils.solidityPack(
          ['uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bytes'],
          [
            LSP25_VERSION,
            HARDHAT_CHAINID,
            nonceBefore,
            validityTimestamps,
            valueToSend,
            executeRelayCallPayload,
          ],
        );

        const eip191Signer = new EIP191Signer();

        const { signature } = await eip191Signer.signDataWithIntendedValidator(
          context.keyManager.address,
          encodedMessage,
          LOCAL_PRIVATE_KEYS.ACCOUNT1,
        );

        await context.keyManager
          .connect(relayer)
          .executeRelayCall(signature, nonceBefore, validityTimestamps, executeRelayCallPayload, {
            value: valueToSend,
          });

        const fetchedName = await targetContract.callStatic.getName();
        const nonceAfter = await context.keyManager.callStatic.getNonce(signer.address, channelId);

        expect(fetchedName).to.equal(newName);
        expect(nonceAfter).to.equal(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });
  });
};
