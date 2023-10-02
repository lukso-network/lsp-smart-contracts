import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EIP191Signer } from '@lukso/eip191-signer.js';

import {
  LSP7Mintable,
  LSP7Mintable__factory,
  LSP8Mintable,
  LSP8Mintable__factory,
  TargetContract,
  TargetContract__factory,
} from '../../../types';

// constants
import {
  ERC725YDataKeys,
  OPERATION_TYPES,
  LSP25_VERSION,
  PERMISSIONS,
  INTERFACE_IDS,
  CALLTYPE,
  LSP8_TOKEN_ID_TYPES,
} from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';

// helpers
import { LOCAL_PRIVATE_KEYS, combineAllowedCalls, combinePermissions } from '../../utils/helpers';

export const shouldBehaveLikeAllowedFunctions = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  let addressWithNoAllowedFunctions: SignerWithAddress,
    addressCanCallOnlyOneFunction: SignerWithAddress;

  let targetContract: TargetContract;

  before(async () => {
    context = await buildContext();

    addressWithNoAllowedFunctions = context.accounts[1];
    addressCanCallOnlyOneFunction = context.accounts[2];

    targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

    const permissionsKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressWithNoAllowedFunctions.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        addressCanCallOnlyOneFunction.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
        addressCanCallOnlyOneFunction.address.substring(2),
    ];

    const permissionsValues = [
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
      combineAllowedCalls(
        [CALLTYPE.CALL],
        ['0xffffffffffffffffffffffffffffffffffffffff'],
        ['0xffffffff'],
        [targetContract.interface.getSighash('setName')],
      ),
    ];

    await setupKeyManager(context, permissionsKeys, permissionsValues);
  });

  describe('when interacting via `execute(...)`', () => {
    describe('when caller has nothing listed under allowedCalls', () => {
      describe('when calling a contract', () => {
        it('should revert when calling any function (eg: `setName(...)`)', async () => {
          const newName = 'Updated Name';

          const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
            newName,
          ]);

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

          await expect(
            context.keyManager.connect(addressWithNoAllowedFunctions).execute(executePayload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
            .withArgs(addressWithNoAllowedFunctions.address);
        });

        it('should revert when calling any function (eg: `setNumber(...)`)', async () => {
          const newNumber = 18;

          const targetContractPayload = targetContract.interface.encodeFunctionData('setNumber', [
            newNumber,
          ]);
          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

          await expect(
            context.keyManager.connect(addressWithNoAllowedFunctions).execute(executePayload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NoCallsAllowed')
            .withArgs(addressWithNoAllowedFunctions.address);
        });
      });
    });

    describe('when caller has 1 x bytes4 function selector listed under AllowedFunctions', () => {
      describe('when calling a contract', () => {
        it('should pass when the bytes4 selector of the function called is listed in its AllowedFunctions', async () => {
          const initialName = await targetContract.callStatic.getName();
          const newName = 'Updated Name';

          const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
            newName,
          ]);

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

          await context.keyManager.connect(addressCanCallOnlyOneFunction).execute(executePayload);

          const result = await targetContract.callStatic.getName();
          expect(result).to.not.equal(initialName);
          expect(result).to.equal(newName);
        });

        it('should revert when the bytes4 selector of the function called is NOT listed in its AllowedFunctions', async () => {
          const initialNumber = await targetContract.callStatic.getNumber();
          const newNumber = 18;

          const targetContractPayload = targetContract.interface.encodeFunctionData('setNumber', [
            newNumber,
          ]);
          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

          await expect(
            context.keyManager.connect(addressCanCallOnlyOneFunction).execute(executePayload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
            .withArgs(
              addressCanCallOnlyOneFunction.address,
              targetContract.address,
              targetContract.interface.getSighash('setNumber'),
            );

          const result = await targetContract.callStatic.getNumber();
          expect(result).to.not.equal(newNumber);
          expect(result).to.equal(initialNumber);
        });
      });

      it('should revert when passing a random bytes payload with a random function selector', async () => {
        const randomPayload =
          '0xbaadca110000000000000000000000000000000000000000000000000000000123456789';

        const payload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          targetContract.address,
          0,
          randomPayload,
        ]);

        await expect(context.keyManager.connect(addressCanCallOnlyOneFunction).execute(payload))
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            addressCanCallOnlyOneFunction.address,
            targetContract.address,
            randomPayload.slice(0, 10),
          );
      });
    });
  });

  describe('when interacting via `executeRelayCall(...)`', () => {
    const channelId = 0;

    describe('when signer has 1 x bytes4 function selector listed under AllowedFunctions', () => {
      describe('when calling a contract', () => {
        it('`setName(...)` - should pass when the bytes4 selector of the function called is listed in its AllowedFunctions', async () => {
          const newName = 'Dagobah';

          const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
            newName,
          ]);
          const nonce = await context.keyManager.callStatic.getNonce(
            addressCanCallOnlyOneFunction.address,
            channelId,
          );

          const validityTimestamps = 0;

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
              nonce,
              validityTimestamps,
              valueToSend,
              executeRelayCallPayload,
            ],
          );

          const eip191Signer = new EIP191Signer();

          const { signature } = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            encodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT2,
          );

          await context.keyManager.executeRelayCall(
            signature,
            nonce,
            validityTimestamps,
            executeRelayCallPayload,
            { value: valueToSend },
          );
          const endResult = await targetContract.callStatic.getName();
          expect(endResult).to.equal(newName);
        });

        it('`setNumber(...)` - should revert when the bytes4 selector of the function called is NOT listed in its AllowedFunctions', async () => {
          const currentNumber = await targetContract.callStatic.getNumber();

          const nonce = await context.keyManager.callStatic.getNonce(
            addressCanCallOnlyOneFunction.address,
            channelId,
          );

          const validityTimestamps = 0;

          const targetContractPayload = targetContract.interface.encodeFunctionData('setNumber', [
            2354,
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
              nonce,
              validityTimestamps,
              valueToSend,
              executeRelayCallPayload,
            ],
          );

          const eip191Signer = new EIP191Signer();

          const { signature } = await eip191Signer.signDataWithIntendedValidator(
            context.keyManager.address,
            encodedMessage,
            LOCAL_PRIVATE_KEYS.ACCOUNT2,
          );

          await expect(
            context.keyManager.executeRelayCall(
              signature,
              nonce,
              validityTimestamps,
              executeRelayCallPayload,
              { value: valueToSend },
            ),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
            .withArgs(
              addressCanCallOnlyOneFunction.address,
              targetContract.address,
              targetContract.interface.getSighash('setNumber'),
            );

          const endResult = await targetContract.callStatic.getNumber();
          expect(endResult.toString()).to.equal(currentNumber.toString());
        });
      });
    });
  });

  describe('allowed to call only `transfer(...)` function on LSP8 contracts', () => {
    let addressCanCallOnlyTransferOnLSP8: SignerWithAddress;
    let addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8: SignerWithAddress;

    let lsp7Contract: LSP7Mintable;
    let lsp8Contract: LSP8Mintable;

    const tokenIdToTransfer = '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef';

    const tokenIdToApprove = '0xf00df00df00df00df00df00df00df00df00df00df00df00df00df00df00df00d';

    before(async () => {
      context = await buildContext();

      addressCanCallOnlyTransferOnLSP8 = context.accounts[1];
      addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8 = context.accounts[2];

      lsp7Contract = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        'LSP7 Token',
        'TKN',
        context.accounts[0].address,
        false,
      );

      lsp8Contract = await new LSP8Mintable__factory(context.accounts[0]).deploy(
        'LSP8 NFT',
        'NFT',
        context.accounts[0].address,
        LSP8_TOKEN_ID_TYPES.UNIQUE_ID,
      );

      await lsp7Contract
        .connect(context.accounts[0])
        .mint(context.universalProfile.address, 100, false, '0x');

      // mint some NFTs for the UP
      [tokenIdToTransfer, tokenIdToApprove].forEach(async (tokenId) => {
        await lsp8Contract
          .connect(context.accounts[0])
          .mint(context.universalProfile.address, tokenId, true, '0x');
      });

      await lsp7Contract
        .connect(context.accounts[0])
        .transferOwnership(context.universalProfile.address);

      const permissionsKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanCallOnlyTransferOnLSP8.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          addressCanCallOnlyTransferOnLSP8.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8.address.substring(2),
      ];

      const permissionsValues = [
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
        // LSP8:ANY:transfer(…)
        combineAllowedCalls(
          [CALLTYPE.CALL],
          ['0xffffffffffffffffffffffffffffffffffffffff'],
          [INTERFACE_IDS.LSP8IdentifiableDigitalAsset],
          [lsp8Contract.interface.getSighash('transfer')],
        ),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.EXECUTE_RELAY_CALL),
        // LSP7:ANY:ANY + LSP8:ANY: authorizeOperator(…)
        combineAllowedCalls(
          [CALLTYPE.CALL, CALLTYPE.CALL],
          [
            '0xffffffffffffffffffffffffffffffffffffffff',
            '0xffffffffffffffffffffffffffffffffffffffff',
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.LSP8IdentifiableDigitalAsset],
          ['0xffffffff', lsp8Contract.interface.getSighash('authorizeOperator')],
        ),
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe('when caller can only call `transfer(...)` on LSP8 contracts only', () => {
      it('should revert with `NotAllowedCall` when calling `authorizeOperator(...)` on LSP8 contract', async () => {
        const operator = context.accounts[8].address;

        const authorizeOperatorPayload = lsp8Contract.interface.encodeFunctionData(
          'authorizeOperator',
          [operator, tokenIdToTransfer, '0x'],
        );

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          lsp8Contract.address,
          0,
          authorizeOperatorPayload,
        ]);

        await expect(
          context.keyManager.connect(addressCanCallOnlyTransferOnLSP8).execute(executePayload),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            addressCanCallOnlyTransferOnLSP8.address,
            lsp8Contract.address,
            lsp8Contract.interface.getSighash('authorizeOperator'),
          );
      });

      it('should pass when calling `transfer(...)` on LSP8 contract', async () => {
        const recipient = context.accounts[5].address;

        const transferPayload = lsp8Contract.interface.encodeFunctionData('transfer', [
          context.universalProfile.address,
          recipient,
          tokenIdToTransfer,
          true,
          '0x',
        ]);

        const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          lsp8Contract.address,
          0,
          transferPayload,
        ]);

        await context.keyManager.connect(addressCanCallOnlyTransferOnLSP8).execute(executePayload);

        expect(await lsp8Contract.tokenOwnerOf(tokenIdToTransfer)).to.equal(recipient);
      });
    });

    describe('when caller can all any functions on LSP7 contracts, but only `authorizeOperator(...)` on LSP8 contracts', () => {
      describe('when interacting with LSP7 contract', () => {
        it('should pass when calling `mint(...)`', async () => {
          const recipient = context.accounts[4].address;
          const amount = 10;

          const mintPayload = lsp7Contract.interface.encodeFunctionData('mint', [
            recipient,
            amount,
            true,
            '0x',
          ]);

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp7Contract.address,
            0,
            mintPayload,
          ]);

          await context.keyManager
            .connect(addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8)
            .execute(executePayload);

          expect(await lsp7Contract.balanceOf(recipient)).to.equal(amount);
        });

        it('should pass when calling `transfer(...)`', async () => {
          const recipient = context.accounts[4].address;

          const previousUPTokenBalance = await lsp7Contract.balanceOf(
            context.universalProfile.address,
          );

          const previousRecipientTokenBalance = await lsp7Contract.balanceOf(recipient);

          const amount = 10;

          const transferPayload = lsp7Contract.interface.encodeFunctionData('transfer', [
            context.universalProfile.address,
            recipient,
            amount,
            true,
            '0x',
          ]);

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp7Contract.address,
            0,
            transferPayload,
          ]);

          await context.keyManager
            .connect(addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8)
            .execute(executePayload);

          // CHECK that UP token balance has decreased
          expect(await lsp7Contract.balanceOf(context.universalProfile.address)).to.equal(
            previousUPTokenBalance.sub(amount),
          );

          // CHECK that recipient token balance has increased
          expect(await lsp7Contract.balanceOf(recipient)).to.equal(
            previousRecipientTokenBalance.add(amount),
          );
        });

        it('should pass when calling `authorizeOperator(...)`', async () => {
          const operator = context.accounts[6].address;
          const amount = 10;

          const authorizeOperatorPayload = lsp7Contract.interface.encodeFunctionData(
            'authorizeOperator',
            [operator, amount, '0x'],
          );

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp7Contract.address,
            0,
            authorizeOperatorPayload,
          ]);

          await context.keyManager
            .connect(addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8)
            .execute(executePayload);

          expect(
            await lsp7Contract.authorizedAmountFor(operator, context.universalProfile.address),
          ).to.equal(amount);
        });

        it('should pass when calling `setData(...)`', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Token Icon'));

          const value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(':)'));

          const setDataPayload = lsp7Contract.interface.encodeFunctionData('setData', [key, value]);

          const payload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp7Contract.address,
            0,
            setDataPayload,
          ]);

          await context.keyManager
            .connect(addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8)
            .execute(payload);

          expect(await lsp7Contract.callStatic.getData(key)).to.equal(value);
        });
      });

      describe('when interacting lsp8 contract', async () => {
        it('should revert when calling `transfer(...)`', async () => {
          const recipient = context.accounts[4].address;

          const transferPayload = lsp8Contract.interface.encodeFunctionData('transfer', [
            context.universalProfile.address,
            recipient,
            tokenIdToTransfer,
            true,
            '0x',
          ]);

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp8Contract.address,
            0,
            transferPayload,
          ]);

          await expect(
            context.keyManager
              .connect(addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8)
              .execute(executePayload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
            .withArgs(
              addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8.address,
              lsp8Contract.address,
              lsp8Contract.interface.getSighash('transfer'),
            );
        });

        it('should revert when calling `mint(...)`', async () => {
          const randomTokenId = ethers.utils.hexlify(ethers.utils.randomBytes(32));

          const recipient = context.accounts[4].address;
          const mintPayload = lsp8Contract.interface.encodeFunctionData('mint', [
            recipient,
            randomTokenId,
            true,
            '0x',
          ]);

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp8Contract.address,
            0,
            mintPayload,
          ]);

          await expect(
            context.keyManager
              .connect(addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8)
              .execute(executePayload),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
            .withArgs(
              addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8.address,
              lsp8Contract.address,
              lsp8Contract.interface.getSighash('mint'),
            );
        });

        it('should pass when calling `authorizeOperator(...)`', async () => {
          const recipient = context.accounts[4].address;

          const authorizeOperatorPayload = lsp8Contract.interface.encodeFunctionData(
            'authorizeOperator',
            [recipient, tokenIdToApprove, '0x'],
          );

          const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
            OPERATION_TYPES.CALL,
            lsp8Contract.address,
            0,
            authorizeOperatorPayload,
          ]);

          await context.keyManager
            .connect(addressCanCallAnyLSP7FunctionAndOnlyAuthorizeOperatorOnLSP8)
            .execute(executePayload);

          expect(await lsp8Contract.isOperatorFor(recipient, tokenIdToApprove)).to.be.true;
        });
      });
    });
  });
};
