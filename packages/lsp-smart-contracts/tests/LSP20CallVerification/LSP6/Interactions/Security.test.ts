import { expect } from 'chai';
import { ethers, artifacts } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  FirstToCallLSP20,
  Reentrancy,
  Reentrancy__factory,
  SecondToCallLSP20,
  SecondToCallLSP20__factory,
  FirstToCallLSP20__factory,
  TargetContract,
  TargetContract__factory,
  UniversalReceiverDelegateDataUpdater__factory,
} from '../../../../types';

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  LSP1_TYPE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
  CALLTYPE,
} from '../../../../constants';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';

// helpers
import {
  provider,
  combinePermissions,
  EMPTY_PAYLOAD,
  combineAllowedCalls,
  combineCallTypes,
  encodeCompactBytesArray,
} from '../../../utils/helpers';

export const testSecurityScenarios = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  let signer: SignerWithAddress, addressWithNoPermissions: SignerWithAddress;

  let attacker: SignerWithAddress;

  let targetContract: TargetContract, maliciousContract: Reentrancy;

  before(async () => {
    context = await buildContext();

    signer = context.accounts[1];
    addressWithNoPermissions = context.accounts[3];

    attacker = context.accounts[4];

    targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

    maliciousContract = await new Reentrancy__factory(attacker).deploy(context.keyManager.address);

    const permissionKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + signer.address.substring(2),
      ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + signer.address.substring(2),
    ];

    const permissionValues = [
      ALL_PERMISSIONS,
      combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      combineAllowedCalls(
        // TODO: test reentrancy against the bits for the allowed calls
        [
          combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
          combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
        ],
        [signer.address, ethers.constants.AddressZero],
        ['0xffffffff', '0xffffffff'],
        ['0xffffffff', '0xffffffff'],
      ),
    ];

    await setupKeyManager(context, permissionKeys, permissionValues);

    // Fund Universal Profile with some LYXe
    await context.mainController.sendTransaction({
      to: context.universalProfile.address,
      value: ethers.utils.parseEther('10'),
    });
  });

  it('Should revert when caller has no permissions set', async () => {
    const targetContractPayload = targetContract.interface.encodeFunctionData('setName', [
      'New Contract Name',
    ]);

    await expect(
      context.universalProfile
        .connect(addressWithNoPermissions)
        .execute(OPERATION_TYPES.CALL, targetContract.address, 0, targetContractPayload),
    )
      .to.be.revertedWithCustomError(context.keyManager, 'NoPermissionsSet')
      .withArgs(addressWithNoPermissions.address);
  });

  it('Should revert when caller calls the KeyManager through `ERC725X.execute`', async () => {
    const lsp20VerifyCallPayload = context.keyManager.interface.encodeFunctionData(
      'lsp20VerifyCall',
      [
        context.accounts[2].address,
        context.keyManager.address,
        context.accounts[2].address,
        0,
        '0xaabbccdd',
      ], // random arguments
    );

    await expect(
      context.universalProfile
        .connect(context.mainController)
        .execute(OPERATION_TYPES.CALL, context.keyManager.address, 0, lsp20VerifyCallPayload),
    ).to.be.revertedWithCustomError(context.keyManager, 'CallingKeyManagerNotAllowed');
  });

  describe('when sending LYX to a contract', () => {
    it('Permissions should prevent ReEntrancy and stop malicious contract with a re-entrant receive() function.', async () => {
      // the Universal Profile wants to send 1 x LYX from its UP to another smart contract
      // we assume the UP owner is not aware that some malicious code is present
      // in the fallback function of the target (= recipient) contract
      const transferPayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        maliciousContract.address,
        ethers.utils.parseEther('1'),
        EMPTY_PAYLOAD,
      ]);

      const executePayload = context.keyManager.interface.encodeFunctionData('execute', [
        transferPayload,
      ]);
      // load the malicious payload, that will be executed in the receive function
      // every time the contract receives LYX
      await maliciousContract.loadPayload(executePayload);

      const initialAccountBalance = await provider.getBalance(context.universalProfile.address);
      const initialAttackerContractBalance = await provider.getBalance(maliciousContract.address);

      // send LYX to malicious contract
      // at this point, the malicious contract receive function try to drain funds by re-entering the KeyManager
      // this should not be possible since it does not have the permission `REENTRANCY`
      await expect(context.keyManager.connect(context.mainController).execute(transferPayload))
        .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
        .withArgs(maliciousContract.address, 'REENTRANCY');

      const newAccountBalance = await provider.getBalance(context.universalProfile.address);
      const newAttackerContractBalance = await provider.getBalance(maliciousContract.address);

      expect(newAccountBalance).to.equal(initialAccountBalance);
      expect(newAttackerContractBalance).to.equal(initialAttackerContractBalance);
    });
  });

  describe('when reentering execute function', () => {
    it('should allow the URD to use `setData(..)` through the LSP6', async () => {
      const universalReceiverDelegateDataUpdater =
        await new UniversalReceiverDelegateDataUpdater__factory(context.mainController).deploy();

      const randomHardcodedKey = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes('some random data key'),
      );
      const randomHardcodedValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes('some random text for the data value'),
      );

      const setDataPayload = context.universalProfile.interface.encodeFunctionData('setDataBatch', [
        [
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            universalReceiverDelegateDataUpdater.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
            universalReceiverDelegateDataUpdater.address.substring(2),
        ],
        [
          universalReceiverDelegateDataUpdater.address,
          combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.REENTRANCY),
          encodeCompactBytesArray([randomHardcodedKey]),
        ],
      ]);

      await context.keyManager.connect(context.mainController).execute(setDataPayload);

      const universalReceiverDelegatePayload =
        universalReceiverDelegateDataUpdater.interface.encodeFunctionData(
          'universalReceiverDelegate',
          [
            ethers.constants.AddressZero,
            0,
            LSP1_TYPE_IDS.LSP7Tokens_SenderNotification,
            '0xcafecafecafecafe',
          ],
        );

      const executePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        universalReceiverDelegateDataUpdater.address,
        ethers.utils.parseEther('0'),
        universalReceiverDelegatePayload,
      ]);

      await context.keyManager.connect(context.mainController).execute(executePayload);

      expect(await context.universalProfile.getData(randomHardcodedKey)).to.equal(
        randomHardcodedValue,
      );
    });
  });

  describe('when chaining reentrancy', () => {
    let firstReentrant: FirstToCallLSP20;
    let secondReentrant: SecondToCallLSP20;

    before(async () => {
      secondReentrant = await new SecondToCallLSP20__factory(context.accounts[0]).deploy(
        context.universalProfile.address,
      );
      firstReentrant = await new FirstToCallLSP20__factory(context.accounts[0]).deploy(
        context.universalProfile.address,
        secondReentrant.address,
      );

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          firstReentrant.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          secondReentrant.address.substring(2),
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
            const firstTargetSelector = firstReentrant.interface.encodeFunctionData('firstTarget');

            await expect(
              context.universalProfile
                .connect(context.mainController)
                .execute(OPERATION_TYPES.CALL, firstReentrant.address, 0, firstTargetSelector),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(secondReentrant.address, 'REENTRANCY');
          });
        });

        describe('when the secondReentrant is granted REENTRANCY Permission', () => {
          before(async () => {
            const permissionKeys = [
              ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
                secondReentrant.address.substring(2),
            ];

            const permissionValues = [
              combinePermissions(PERMISSIONS.SUPER_SETDATA, PERMISSIONS.REENTRANCY),
            ];

            await setupKeyManager(context, permissionKeys, permissionValues);
          });

          it('should pass and setData from the second reentrantCall on the UniversalProfile correctly', async () => {
            const firstTargetSelector = firstReentrant.interface.encodeFunctionData('firstTarget');

            await context.universalProfile
              .connect(context.mainController)
              .execute(OPERATION_TYPES.CALL, firstReentrant.address, 0, firstTargetSelector);

            const result = await context.universalProfile['getData(bytes32)'](
              ethers.constants.HashZero,
            );

            expect(result).to.equal('0xaabbccdd');
          });
        });
      });
    });

    describe('when calling the lsp20 functions by an address other than the target', () => {
      it('should pass and not modify _reentrancyStatus when verfying that the owner have permission to execute a payload, ', async () => {
        const emptyCallPayload = context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          context.accounts[5].address,
          0,
          EMPTY_PAYLOAD,
        ]);

        const tx = await context.keyManager.lsp20VerifyCall(
          context.mainController.address,
          context.universalProfile.address,
          context.mainController.address,
          0,
          emptyCallPayload,
        );

        await tx.wait();

        const _reentrancyStatusSlotNumber = Number.parseInt(
          (
            await artifacts.getBuildInfo(
              'contracts/LSP6KeyManager/LSP6KeyManager.sol:LSP6KeyManager',
            )
          )?.output.contracts[
            'contracts/LSP6KeyManager/LSP6KeyManager.sol'
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
          ].LSP6KeyManager.storageLayout.storage.filter((elem) => {
            if (elem.label === '_reentrancyStatus') return elem;
          })[0].slot,
        );

        const _reentrancyStatusPackedWithAddress = await provider.getStorageAt(
          context.keyManager.address,
          _reentrancyStatusSlotNumber,
        );

        // Extract the two characters representing the boolean value
        // since its packed with an address
        const _reentrancyStatusHex = _reentrancyStatusPackedWithAddress.slice(10, 12);

        // Convert the hexadecimal value to a boolean
        const _reentrancyStatus = Boolean(parseInt(_reentrancyStatusHex, 16));

        expect(_reentrancyStatus).to.be.false;
      });
    });
  });
};
