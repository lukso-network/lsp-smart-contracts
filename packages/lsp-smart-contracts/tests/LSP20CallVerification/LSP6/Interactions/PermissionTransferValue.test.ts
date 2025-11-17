import { expect } from 'chai';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { getAddress, parseEther, toBigInt, Wallet } from 'ethers';

import {
  TargetContract__factory,
  type ExecutorLSP20,
  ExecutorLSP20__factory,
  type TargetPayableContract,
  TargetPayableContract__factory,
  type GraffitiEventExtension,
  GraffitiEventExtension__factory,
  type FallbackContract,
  FallbackContract__factory,
} from '../../../../types/ethers-contracts/index.js';
import {
  type LSP7Mintable,
  LSP7Mintable__factory,
} from '../../../../../lsp7-contracts/types/ethers-contracts/index.js';
import {
  type UniversalProfile,
  UniversalProfile__factory,
} from '../../../../../universalprofile-contracts/types/ethers-contracts/index.js';

// constants
import { ERC725YDataKeys } from '../../../../constants.js';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
import { ALL_PERMISSIONS, PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';

// setup
import type { LSP6TestContext } from '../../../utils/context.js';
import { setupKeyManager } from '../../../utils/fixtures.js';

// helpers
import {
  combinePermissions,
  combineAllowedCalls,
  combineCallTypes,
} from '../../../utils/helpers.js';
import {
  LSP6KeyManager,
  LSP6KeyManager__factory,
} from '../../../../../lsp6-contracts/types/ethers-contracts/index.js';

export const shouldBehaveLikePermissionTransferValue = (
  buildContext: (initialFunding?: bigint) => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  describe('when caller = EOA', () => {
    let canTransferValue: HardhatEthersSigner,
      canTransferValueAndCall: HardhatEthersSigner,
      cannotTransferValue: HardhatEthersSigner;

    let recipient: HardhatEthersSigner;

    let recipientUP: UniversalProfile;

    // used to test when sending data as graffiti
    let graffitiExtension: GraffitiEventExtension;

    before(async () => {
      context = await buildContext(parseEther('100'));

      canTransferValue = context.accounts[1];
      canTransferValueAndCall = context.accounts[2];
      cannotTransferValue = context.accounts[3];
      recipient = context.accounts[4];

      recipientUP = await new UniversalProfile__factory(context.accounts[0]).deploy(
        context.accounts[0].address,
      );

      graffitiExtension = await new GraffitiEventExtension__factory(context.accounts[0]).deploy();

      const lsp17ExtensionDataKeyForGraffiti =
        ERC725YDataKeys.LSP17['LSP17ExtensionPrefix'] +
        '00000000' + // selector for graffiti data,
        '00000000000000000000000000000000'; // zero padded

      await recipientUP
        .connect(context.accounts[0])
        .setData(lsp17ExtensionDataKeyForGraffiti, await graffitiExtension.getAddress());

      // CHECK that a LSP17 Extension is was set for graffiti data `bytes4(0)`
      expect(
        // checksum address retrieved from storage (stored in lower case with hex)
        getAddress(await recipientUP.getData(lsp17ExtensionDataKeyForGraffiti)),
      ).to.equal(await graffitiExtension.getAddress());

      const permissionsKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canTransferValue.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          canTransferValue.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          canTransferValueAndCall.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          canTransferValueAndCall.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          cannotTransferValue.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.TRANSFERVALUE,
        combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [recipient.address, recipientUP.target.toString().toString()],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
        combinePermissions(PERMISSIONS.TRANSFERVALUE, PERMISSIONS.CALL),
        combineAllowedCalls(
          [
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
          ],
          [recipient.address, recipientUP.target.toString()],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
        PERMISSIONS.CALL,
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe('when recipient = EOA', () => {
      describe('when transferring value via `execute(...)`', () => {
        describe('when transferring value without bytes `_data`', () => {
          const data = '0x';

          it('should pass when caller has ALL PERMISSIONS', async () => {
            const amount = parseEther('3');

            /**
             * verify that balances have been updated
             * @see https://hardhat.org/hardhat-chai-matchers/docs/reference#.changeetherbalances
             */
            expect(
              await context.universalProfile
                .connect(context.mainController)
                .execute(OPERATION_TYPES.CALL, recipient.address, amount, data),
            ).to.changeEtherBalances(
              context.ethers,
              [await context.universalProfile.getAddress(), recipient.address],
              [`-${amount}`, amount],
            );
          });

          it('should pass when caller has permission TRANSFERVALUE only', async () => {
            const amount = parseEther('3');

            await expect(
              context.universalProfile
                .connect(canTransferValue)
                .execute(OPERATION_TYPES.CALL, recipient.address, amount, data),
            ).to.changeEtherBalances(
              context.ethers,
              [context.universalProfile, recipient.address],
              [`-${amount}`, amount],
            );
          });

          it('should pass when caller has permission TRANSFERVALUE + CALL', async () => {
            const amount = parseEther('3');

            await expect(
              context.universalProfile
                .connect(canTransferValueAndCall)
                .execute(OPERATION_TYPES.CALL, recipient.address, amount, data),
            ).to.changeEtherBalances(
              context.ethers,
              [context.universalProfile, recipient.address],
              [`-${amount}`, amount],
            );
          });

          it('should fail when caller does not have permission TRANSFERVALUE', async () => {
            const initialBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            const initialBalanceRecipient = await context.ethers.provider.getBalance(
              recipient.address,
            );

            await expect(
              context.universalProfile
                .connect(cannotTransferValue)
                .execute(OPERATION_TYPES.CALL, recipient.address, parseEther('3'), data),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(cannotTransferValue.address, 'TRANSFERVALUE');

            const newBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            const newBalanceRecipient = await context.ethers.provider.getBalance(recipient.address);

            // verify that native token balances have not changed
            expect(newBalanceUP).to.equal(initialBalanceUP);
            expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
          });
        });

        describe('when transferring value with bytes `_data`', () => {
          const data = '0xaabbccdd';

          it('should pass when caller has ALL PERMISSIONS', async () => {
            const initialBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );

            const initialBalanceRecipient = await context.ethers.provider.getBalance(
              recipient.address,
            );

            await context.universalProfile
              .connect(context.mainController)
              .execute(OPERATION_TYPES.CALL, recipient.address, parseEther('3'), data);

            const newBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            expect(newBalanceUP).to.be.lt(initialBalanceUP);

            const newBalanceRecipient = await context.ethers.provider.getBalance(recipient.address);
            expect(newBalanceRecipient).to.be.gt(initialBalanceRecipient);
          });

          it('should pass when caller has permission TRANSFERVALUE + CALL', async () => {
            const amount = parseEther('3');

            await expect(
              context.universalProfile
                .connect(canTransferValueAndCall)
                .execute(OPERATION_TYPES.CALL, recipient.address, amount, data),
            ).to.changeEtherBalances(
              context.ethers,
              [context.universalProfile, recipient.address],
              [`-${amount}`, amount],
            );
          });

          it('should fail when caller has permission TRANSFERVALUE only', async () => {
            const initialBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            const initialBalanceRecipient = await context.ethers.provider.getBalance(
              recipient.address,
            );

            await expect(
              context.universalProfile
                .connect(canTransferValue)
                .execute(OPERATION_TYPES.CALL, recipient.address, parseEther('3'), data),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canTransferValue.address, 'CALL');

            const newBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            const newBalanceRecipient = await context.ethers.provider.getBalance(recipient.address);

            // verify that native token balances have not changed
            expect(newBalanceUP).to.equal(initialBalanceUP);
            expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
          });

          it('should fail when caller does not have permission TRANSFERVALUE', async () => {
            const initialBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            const initialBalanceRecipient = await context.ethers.provider.getBalance(
              recipient.address,
            );

            await expect(
              context.universalProfile
                .connect(cannotTransferValue)
                .execute(OPERATION_TYPES.CALL, recipient.address, parseEther('3'), data),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(cannotTransferValue.address, 'TRANSFERVALUE');

            const newBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            const newBalanceRecipient = await context.ethers.provider.getBalance(recipient.address);

            // verify that native token balances have not changed
            expect(newBalanceUP).to.equal(initialBalanceUP);
            expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
          });
        });

        describe('when transferring value with graffiti `_data` (prefixed with `bytes4(0)`)', () => {
          const data = '0x00000000aabbccdd';

          it('should fail when caller has permission TRANSFERVALUE only', async () => {
            const initialBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            const initialBalanceRecipient = await context.ethers.provider.getBalance(
              recipient.address,
            );

            await expect(
              context.universalProfile
                .connect(canTransferValue)
                .execute(OPERATION_TYPES.CALL, recipient.address, parseEther('3'), data),
            )
              .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
              .withArgs(canTransferValue.address, 'CALL');

            const newBalanceUP = await context.ethers.provider.getBalance(
              await context.universalProfile.getAddress(),
            );
            const newBalanceRecipient = await context.ethers.provider.getBalance(recipient.address);

            // verify that native token balances have not changed
            expect(newBalanceUP).to.equal(initialBalanceUP);
            expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
          });

          it('should pass when caller has permission TRANSFERVALUE + CALL', async () => {
            const amount = parseEther('3');

            await expect(
              context.universalProfile
                .connect(canTransferValueAndCall)
                .execute(OPERATION_TYPES.CALL, recipient.address, amount, data),
            ).to.changeEtherBalances(
              context.ethers,
              [context.universalProfile, recipient.address],
              [`-${amount}`, amount],
            );
          });
        });
      });
    });

    describe('when recipient is a UP', () => {
      describe('when transferring value with graffiti `_data` (prefixed with `bytes4(0)`)', () => {
        const data = '0x00000000aabbccdd';

        it('should fail when caller has permission TRANSFERVALUE only', async () => {
          const initialBalanceUP = await context.ethers.provider.getBalance(
            await context.universalProfile.getAddress(),
          );
          const initialBalanceRecipient = await context.ethers.provider.getBalance(
            recipientUP.target.toString(),
          );

          await expect(
            context.universalProfile
              .connect(canTransferValue)
              .execute(OPERATION_TYPES.CALL, recipientUP.target.toString(), parseEther('3'), data),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAuthorised')
            .withArgs(canTransferValue.address, 'CALL');

          const newBalanceUP = await context.ethers.provider.getBalance(
            await context.universalProfile.getAddress(),
          );
          const newBalanceRecipient = await context.ethers.provider.getBalance(
            recipientUP.target.toString(),
          );

          // verify that native token balances have not changed
          expect(newBalanceUP).to.equal(initialBalanceUP);
          expect(initialBalanceRecipient).to.equal(newBalanceRecipient);
        });

        it('should pass when caller has permission TRANSFERVALUE + CALL', async () => {
          const amount = parseEther('3');

          const tx = context.universalProfile
            .connect(canTransferValueAndCall)
            .execute(OPERATION_TYPES.CALL, recipientUP.target.toString(), amount, data);

          await expect(tx).to.changeEtherBalances(
            context.ethers,
            [context.universalProfile, recipientUP.target.toString()],
            [`-${amount}`, amount],
          );

          // TODO: fix error `EventEmittedInExtension` does not exist
          // await expect(tx).to.emit(graffitiExtension, 'EventEmittedInExtension');
        });
      });
    });
  });

  describe('when caller = contract', () => {
    let contractCanTransferValue: ExecutorLSP20;

    let recipient: string;

    const hardcodedRecipient = '0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe';

    /**
     * @dev this is necessary when the function being called in the contract
     *  perform a raw / low-level call (in the function body)
     *  otherwise, the deeper layer of interaction (UP.execute) fails
     */
    const GAS_PROVIDED = 200_000;

    before(async () => {
      context = await buildContext(parseEther('100'));

      recipient = context.accounts[1].address;

      contractCanTransferValue = await new ExecutorLSP20__factory(context.accounts[0]).deploy(
        await context.universalProfile.getAddress(),
      );

      const permissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          context.mainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          (await contractCanTransferValue.getAddress()).substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          (await contractCanTransferValue.getAddress()).substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.TRANSFERVALUE,
        combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [hardcodedRecipient, recipient],
          ['0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe('> Contract calls', () => {
      it('Should send 1 LYX to an address hardcoded in Executor (`sendOneLyxHardcoded`)', async () => {
        const amount = parseEther('1');

        await expect(
          contractCanTransferValue.sendOneLyxHardcoded({
            gasLimit: GAS_PROVIDED,
          }),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, hardcodedRecipient],
          [
            `-${amount}`, // UP balance should have gone down
            amount, // recipient balance should have gone up
          ],
        );
      });

      it('Should send 1 LYX to an address provided to Executor (`sendOneLyxToRecipient`)', async () => {
        const amount = parseEther('1');

        await expect(
          contractCanTransferValue.sendOneLyxToRecipient(recipient, {
            gasLimit: GAS_PROVIDED,
          }),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, recipient],
          [`-${amount}`, amount],
        );
      });
    });

    describe('> Low-level calls', () => {
      it('Should send 1 LYX to an address hardcoded in Executor (`sendOneLyxHardcodedRawCall`)', async () => {
        const amount = parseEther('1');

        await expect(
          contractCanTransferValue.sendOneLyxHardcodedRawCall({
            gasLimit: GAS_PROVIDED,
          }),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, hardcodedRecipient],
          [`-${amount}`, amount],
        );
      });

      it('Should send 1 LYX to an address provided to Executor (`sendOneLyxToRecipientRawCall`)', async () => {
        const amount = parseEther('1');

        await expect(
          contractCanTransferValue.sendOneLyxToRecipientRawCall(recipient, {
            gasLimit: GAS_PROVIDED,
          }),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, recipient],
          [`-${amount}`, amount],
        );
      });
    });
  });

  describe('when caller is another UP (with a KeyManager as owner)', () => {
    // UP making the call
    let aliceMainController: HardhatEthersSigner;
    let aliceUP: UniversalProfile;

    // UP being called
    let bobMainController: HardhatEthersSigner;
    let bobUP: UniversalProfile;
    let bobKeyManager: LSP6KeyManager;

    before(async () => {
      // re-initialize the top level context
      context = await buildContext();

      // define main controller addresses
      aliceMainController = context.accounts[0];
      bobMainController = context.accounts[1];

      // define UPs
      aliceUP = context.universalProfile;
      aliceKeyManager = context.keyManager;

      bobUP = await new UniversalProfile__factory(bobMainController).deploy(
        bobMainController.address,
        {
          value: parseEther('50'),
        },
      );
      bobKeyManager = await new LSP6KeyManager__factory(bobMainController).deploy(bobUP.target);

      const alicePermissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          aliceMainController.address.substring(2),
      ];
      const alicePermissionValues = [ALL_PERMISSIONS];

      const bobPermissionKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          bobMainController.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
          (await aliceUP.getAddress()).substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
          (await aliceUP.getAddress()).substring(2),
      ];

      const bobPermissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.TRANSFERVALUE,
        combineAllowedCalls(
          [CALLTYPE.VALUE],
          [await aliceUP.getAddress()],
          ['0xffffffff'],
          ['0xffffffff'],
        ),
      ];

      await setupKeyManager(context, alicePermissionKeys, alicePermissionValues);
      await setupKeyManager(
        {
          ethers: context.ethers,
          networkHelpers: context.networkHelpers,
          accounts: context.accounts,
          mainController: bobMainController,
          universalProfile: bobUP,
          keyManager: bobKeyManager,
        },
        bobPermissionKeys,
        bobPermissionValues,
      );
    });

    it('Alice should have ALL PERMISSIONS in her UP', async () => {
      const key =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        aliceMainController.address.substring(2);

      // prettier-ignore
      const result = await aliceUP.getData(key);
      expect(result).to.equal(ALL_PERMISSIONS);
    });

    it('Bob should have ALL PERMISSIONS in his UP', async () => {
      const key =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        bobMainController.address.substring(2);

      const result = await bobUP.getData(key);
      expect(result).to.equal(ALL_PERMISSIONS);
    });

    it("Alice's UP should have permission TRANSFERVALUE on Bob's UP", async () => {
      const key =
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        (await aliceUP.getAddress()).substring(2);

      const result = await bobUP.getData(key);
      expect(result).to.equal(PERMISSIONS.TRANSFERVALUE);
    });

    it("Alice should be able to send 5 LYX from Bob's UP to her UP", async () => {
      const UniversalProfileInterface = UniversalProfile__factory.createInterface();

      const amount = parseEther('5');

      const finalTransferLyxPayload = UniversalProfileInterface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        await aliceUP.getAddress(),
        amount,
        '0x',
      ]);

      await expect(
        aliceUP
          .connect(aliceMainController)
          .execute(OPERATION_TYPES.CALL, await bobUP.getAddress(), 0, finalTransferLyxPayload),
      ).to.changeEtherBalances(context.ethers, [bobUP, aliceUP], [`-${amount}`, amount]);
    });
  });

  describe('when caller has SUPER_TRANSFERVALUE + CALL', () => {
    let caller: HardhatEthersSigner;
    let lsp7Token: LSP7Mintable;
    let targetContract: TargetPayableContract;

    let lyxRecipientEOA: string;
    let lyxRecipientContract: FallbackContract;

    const recipientsEOA: string[] = [
      Wallet.createRandom().address,
      Wallet.createRandom().address,
      Wallet.createRandom().address,
      Wallet.createRandom().address,
      Wallet.createRandom().address,
    ];

    const recipientUPs: string[] = [];

    before(async () => {
      context = await buildContext(parseEther('100'));

      caller = context.accounts[1];

      lsp7Token = await new LSP7Mintable__factory(context.accounts[0]).deploy(
        'LSP7 Token',
        'LSP7',
        context.accounts[0].address,
        LSP4_TOKEN_TYPES.TOKEN,
        false,
        true,
      );

      targetContract = await new TargetPayableContract__factory(context.accounts[0]).deploy();

      lyxRecipientEOA = Wallet.createRandom().address;

      // this contract has a payable fallback function and can receive native tokens
      lyxRecipientContract = await new FallbackContract__factory(context.accounts[0]).deploy();

      await lsp7Token
        .connect(context.accounts[0])
        .mint(await context.universalProfile.getAddress(), 100, false, '0x');

      const permissionsKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + caller.address.substring(2),
      ];

      const permissionsValues = [
        combinePermissions(PERMISSIONS.SUPER_TRANSFERVALUE, PERMISSIONS.CALL),
        // restriction = only a specific address (e.g: an LSP7 contract)
        combineAllowedCalls(
          // TODO: we set the bits for both TRANSFERVALUE + CALL in this test.
          // is the bit for TRANSFERVALUE required as well? (since the controller has SUPER_TRANSFERVALUE)
          [
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
            combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
          ],
          [
            lsp7Token.target.toString() as string,
            await targetContract.getAddress(),
            lyxRecipientEOA,
            lyxRecipientContract.target.toString() as string,
          ],
          ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
          ['0xffffffff', '0xffffffff', '0xffffffff', '0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);

      for (let ii = 0; ii < 5; ii++) {
        const newUP = await new UniversalProfile__factory(context.accounts[0]).deploy(
          context.accounts[0].address,
        );
        recipientUPs.push(newUP.target.toString() as string);
      }
    });

    describe('when sending native tokens without `data`', () => {
      recipientsEOA.forEach((recipient) => {
        it(`should allow to send LYX to any EOA (e.g; at address -> ${recipient})`, async () => {
          const amount = parseEther('1');

          await expect(
            context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, recipient, amount, '0x'),
          ).to.changeEtherBalances(
            context.ethers,
            [context.universalProfile, recipient],
            [`-${amount}`, amount],
          );
        });
      });

      recipientUPs.forEach((recipientUP) => {
        it(`should allow to send LYX to any UP contract (e.g: at address -> ${recipientUP})`, async () => {
          const amount = parseEther('1');

          await expect(
            context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, recipientUP, amount, '0x'),
          ).to.changeEtherBalances(
            context.ethers,
            [context.universalProfile, recipientUP],
            [`-${amount}`, amount],
          );
        });
      });
    });

    describe('when sending native tokens with `data`', () => {
      recipientsEOA.forEach((recipient) => {
        it(`should not allow to send LYX with some \`data\` to a random EOA (e.g: at address -> ${recipient})`, async () => {
          const amount = parseEther('1');
          const data = '0x12345678';

          await expect(
            context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, recipient, amount, data),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
            .withArgs(caller.address, recipient, data);
        });
      });

      recipientUPs.forEach((recipientUP) => {
        it(`should not allow to send LYX with some \`data\` to a random UP (e.g: at address -> ${recipientUP})`, async () => {
          const amount = parseEther('1');
          const data = '0x12345678';

          expect(
            await context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, recipientUP, amount, data),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
            .withArgs(caller.address, recipientUP, data);
        });
      });

      it('should allow to send LYX with some `data` to an EOA listed in the AllowedCalls', async () => {
        const amount = parseEther('1');
        const data = '0x12345678';

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(OPERATION_TYPES.CALL, lyxRecipientEOA, amount, data),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, lyxRecipientEOA],
          [`-${amount}`, amount],
        );
      });

      it('should allow to send LYX with some `data` to a contract listed in the AllowedCalls', async () => {
        const amount = parseEther('1');
        const data = '0x12345678';

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(OPERATION_TYPES.CALL, await lyxRecipientContract.getAddress(), amount, data),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, lyxRecipientContract],
          [`-${amount}`, amount],
        );
      });
    });

    describe('when interacting with some contracts', () => {
      it('should not be allowed to interact with a disallowed LSP7 contract', async () => {
        const newLSP7Token = await new LSP7Mintable__factory(context.accounts[0]).deploy(
          'New LSP7 Token',
          'LSP7TKN',
          context.accounts[0].address,
          LSP4_TOKEN_TYPES.TOKEN,
          false,
          true,
        );

        const lsp7TransferPayload = newLSP7Token.interface.encodeFunctionData('transfer', [
          await context.universalProfile.getAddress(),
          context.accounts[5].address,
          10,
          true, // sending to an EOA
          '0x',
        ]);

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(OPERATION_TYPES.CALL, newLSP7Token.target.toString(), 5, lsp7TransferPayload),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            caller.address,
            newLSP7Token.target.toString(),
            newLSP7Token.interface.getFunction('transfer').selector,
          );
      });

      it('should be allowed to interact with an allowed LSP7 contract', async () => {
        const recipient = context.accounts[5].address;
        const tokenAmount = toBigInt(10);

        const lsp7SenderBalanceBefore = await lsp7Token.balanceOf(
          await context.universalProfile.getAddress(),
        );

        const lsp7RecipientBalanceBefore = await lsp7Token.balanceOf(recipient);

        const lsp7TransferPayload = lsp7Token.interface.encodeFunctionData('transfer', [
          await context.universalProfile.getAddress(),
          recipient,
          tokenAmount,
          true, // sending to an EOA
          '0x',
        ]);

        await context.universalProfile
          .connect(caller)
          .execute(OPERATION_TYPES.CALL, lsp7Token.target.toString(), 0, lsp7TransferPayload);

        const lsp7SenderBalanceAfter = await lsp7Token.balanceOf(
          await context.universalProfile.getAddress(),
        );

        const lsp7RecipientBalanceAfter = await lsp7Token.balanceOf(recipient);

        expect(lsp7SenderBalanceAfter).to.equal(lsp7SenderBalanceBefore - tokenAmount);

        expect(lsp7RecipientBalanceAfter).to.equal(lsp7RecipientBalanceBefore + tokenAmount);
      });

      it('should be allowed to interact with an allowed contract', async () => {
        const newValue = 35;

        const targetPayload = targetContract.interface.encodeFunctionData('updateState', [
          newValue,
        ]);

        await context.universalProfile
          .connect(caller)
          .execute(OPERATION_TYPES.CALL, await targetContract.getAddress(), 0, targetPayload);

        const result = await targetContract.value();
        expect(result).to.equal(newValue);
      });

      it('should be allowed to interact with an allowed contract + send some LYX while calling the function', async () => {
        const newValue = 358;
        const lyxAmount = parseEther('3');

        const targetContractPayload = targetContract.interface.encodeFunctionData('updateState', [
          newValue,
        ]);

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(
              OPERATION_TYPES.CALL,
              await targetContract.getAddress(),
              lyxAmount,
              targetContractPayload,
            ),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, targetContract],
          [`-${lyxAmount}`, lyxAmount],
        );

        const result = await targetContract.value();
        expect(result).to.equal(newValue);
      });

      it('should not be allowed to interact with a not allowed contract + send some LYX while calling the function', async () => {
        const newValue = 8910;
        const lyxAmount = parseEther('3');

        const randomTargetContract = await new TargetPayableContract__factory(
          context.accounts[0],
        ).deploy();

        const targetContractPayload = randomTargetContract.interface.encodeFunctionData(
          'updateState',
          [newValue],
        );

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(
              OPERATION_TYPES.CALL,
              await randomTargetContract.getAddress(),
              lyxAmount,
              targetContractPayload,
            ),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(
            caller.address,
            await randomTargetContract.getAddress(),
            randomTargetContract.interface.getFunction('updateState').selector,
          );
      });
    });
  });

  describe('when caller has TRANSFERVALUE + SUPER_CALL', () => {
    let caller: HardhatEthersSigner;
    let allowedAddress: HardhatEthersSigner;

    before(async () => {
      context = await buildContext(parseEther('100'));

      caller = context.accounts[1];
      allowedAddress = context.accounts[2];

      const permissionsKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + caller.address.substring(2),
      ];

      const permissionsValues = [
        combinePermissions(PERMISSIONS.TRANSFERVALUE, PERMISSIONS.SUPER_CALL),
        combineAllowedCalls(
          // TODO: we set the bits for both TRANSFERVALUE + CALL in this test.
          // is the bit for CALL required as well? (since the controller has SUPER_CALL)
          [combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL)],
          [allowedAddress.address],
          ['0xffffffff'],
          ['0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe('when transferring LYX without `data`', () => {
      it('should not be allowed to transfer LYX to a non-allowed address', async () => {
        const recipient = context.accounts[3].address;
        const amount = parseEther('1');

        const initialBalanceUP = await context.ethers.provider.getBalance(
          await context.universalProfile.getAddress(),
        );

        const initialBalanceRecipient = await context.ethers.provider.getBalance(recipient);

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(OPERATION_TYPES.CALL, recipient, amount, '0x'),
        )
          .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
          .withArgs(caller.address, recipient, '0x00000000');

        const newBalanceUP = await context.ethers.provider.getBalance(
          await context.universalProfile.getAddress(),
        );
        expect(newBalanceUP).to.equal(initialBalanceUP);

        const newBalanceRecipient = await context.ethers.provider.getBalance(recipient);
        expect(newBalanceRecipient).to.equal(initialBalanceRecipient);
      });

      it('should be allowed to transfer LYX to an allowed address', async () => {
        const amount = parseEther('1');

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(OPERATION_TYPES.CALL, allowedAddress.address, amount, '0x'),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, allowedAddress.address],
          [`-${amount}`, amount],
        );
      });
    });

    // TODO: this test overlaps with the one above and pass, but the expected behaviour is not clear
    describe('when transferring LYX with `data`', () => {
      it('should be allowed to transfer LYX to an allowed address while sending some `data`', async () => {
        const amount = parseEther('1');
        const data = '0x12345678';

        await expect(
          context.universalProfile
            .connect(caller)
            .execute(OPERATION_TYPES.CALL, allowedAddress.address, amount, data),
        ).to.changeEtherBalances(
          context.ethers,
          [context.universalProfile, allowedAddress.address],
          [`-${amount}`, amount],
        );
      });
    });

    describe('should be allowed to interact with any contract', () => {
      describe('eg: any TargetContract', () => {
        for (let ii = 1; ii <= 5; ii++) {
          it(`TargetContract nb ${ii}`, async () => {
            const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

            const newValue = 12345;

            const payload = targetContract.interface.encodeFunctionData('setNumber', [newValue]);

            await context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, await targetContract.getAddress(), 0, payload);

            const result = await targetContract.getNumber();
            expect(result).to.equal(newValue);
          });
        }
      });

      describe('eg: any LSP7 Token owned by the UP', () => {
        for (let ii = 1; ii <= 5; ii++) {
          it(`LSP7DigitalAsset nb ${ii}`, async () => {
            const lsp7Token = await new LSP7Mintable__factory(context.accounts[0]).deploy(
              'LSP7 Token',
              'LSP7',
              context.accounts[0].address,
              LSP4_TOKEN_TYPES.TOKEN,
              false,
              true,
            );

            // give some tokens to the UP
            await lsp7Token.mint(await context.universalProfile.getAddress(), 100, false, '0x');

            const tokenRecipient = context.accounts[5].address;
            const tokenAmount = 10;

            const senderTokenBalanceBefore = await lsp7Token.balanceOf(
              await context.universalProfile.getAddress(),
            );
            const recipientTokenBalanceBefore = await lsp7Token.balanceOf(tokenRecipient);
            expect(senderTokenBalanceBefore).to.equal(100);
            expect(recipientTokenBalanceBefore).to.equal(0);

            const tokenTransferPayload = lsp7Token.interface.encodeFunctionData('transfer', [
              await context.universalProfile.getAddress(),
              tokenRecipient,
              tokenAmount,
              true,
              '0x',
            ]);

            await context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, lsp7Token.target.toString(), 0, tokenTransferPayload);

            const senderTokenBalanceAfter = await lsp7Token.balanceOf(
              await context.universalProfile.getAddress(),
            );
            const recipientTokenBalanceAfter = await lsp7Token.balanceOf(tokenRecipient);
            expect(senderTokenBalanceAfter).to.equal(
              senderTokenBalanceBefore - BigInt(tokenAmount),
            );
            expect(recipientTokenBalanceAfter).to.equal(
              recipientTokenBalanceBefore + BigInt(tokenAmount),
            );
          });
        }
      });
    });

    describe('should not be allowed to interact with any contract if sending LYX along the call', () => {
      const lyxAmount = parseEther('1');

      for (let ii = 1; ii <= 5; ii++) {
        it(`Target Payable Contract nb ${ii}`, async () => {
          const targetContract = await new TargetPayableContract__factory(
            context.accounts[0],
          ).deploy();

          const upLyxBalanceBefore = await context.ethers.provider.getBalance(
            await context.universalProfile.getAddress(),
          );
          const targetContractLyxBalanceBefore = await context.ethers.provider.getBalance(
            await targetContract.getAddress(),
          );
          expect(targetContractLyxBalanceBefore).to.equal(0);

          const targetPayload = targetContract.interface.encodeFunctionData('updateState', [35]);

          await expect(
            context.universalProfile
              .connect(caller)
              .execute(
                OPERATION_TYPES.CALL,
                await targetContract.getAddress(),
                lyxAmount,
                targetPayload,
              ),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'NotAllowedCall')
            .withArgs(
              caller.address,
              await targetContract.getAddress(),
              targetContract.interface.getFunction('updateState').selector,
            );

          // verify LYX (native tokens) balances have not changed
          const upLyxBalanceAfter = await context.ethers.provider.getBalance(
            await context.universalProfile.getAddress(),
          );
          expect(upLyxBalanceAfter).to.equal(upLyxBalanceBefore);

          const targetContractLyxBalanceAfter = await context.ethers.provider.getBalance(
            await targetContract.getAddress(),
          );
          expect(targetContractLyxBalanceAfter).to.equal(0);
        });
      }
    });
  });

  describe('when caller has SUPER_TRANSFERVALUE + SUPER_CALL', () => {
    let caller: HardhatEthersSigner;
    let allowedAddress: HardhatEthersSigner;

    before(async () => {
      context = await buildContext(parseEther('100'));

      caller = context.accounts[1];
      allowedAddress = context.accounts[2];

      const permissionsKeys = [
        ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] + caller.address.substring(2),
        ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] + caller.address.substring(2),
      ];

      const permissionsValues = [
        combinePermissions(PERMISSIONS.SUPER_TRANSFERVALUE, PERMISSIONS.SUPER_CALL),
        combineAllowedCalls(
          // TODO: we set the bits for both TRANSFERVALUE + CALL in this test.
          // are both bits required to be set?
          // since the controller already has permissions SUPER_TRANSFERVALUE + SUPER_CALL
          [combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL)],
          [allowedAddress.address],
          ['0xffffffff'],
          ['0xffffffff'],
        ),
      ];

      await setupKeyManager(context, permissionsKeys, permissionsValues);
    });

    describe('should be allowed to send LYX to any address', () => {
      const recipients: string[] = [
        Wallet.createRandom().address,
        Wallet.createRandom().address,
        Wallet.createRandom().address,
        Wallet.createRandom().address,
        Wallet.createRandom().address,
      ];

      recipients.forEach((recipient) => {
        it(`should send LYX to EOA -> ${recipient}`, async () => {
          const amount = parseEther('1');

          await expect(
            context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, recipient, amount, '0x'),
          ).to.changeEtherBalances(
            context.ethers,
            [context.universalProfile, recipient],
            [`-${amount}`, amount],
          );
        });
      });
    });

    describe('should be allowed to interact with any contract', () => {
      describe('eg: any TargetContract', () => {
        for (let ii = 1; ii <= 5; ii++) {
          it(`TargetContract nb ${ii}`, async () => {
            const targetContract = await new TargetContract__factory(context.accounts[0]).deploy();

            const newValue = 12345;

            const payload = targetContract.interface.encodeFunctionData('setNumber', [newValue]);

            await context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, await targetContract.getAddress(), 0, payload);

            const result = await targetContract.getNumber();
            expect(result).to.equal(newValue);
          });
        }
      });

      describe('eg: any LSP7 Token owned by the UP', () => {
        for (let ii = 1; ii <= 5; ii++) {
          it(`LSP7DigitalAsset nb ${ii}`, async () => {
            const lsp7Token = await new LSP7Mintable__factory(context.accounts[0]).deploy(
              'LSP7 Token',
              'LSP7',
              context.accounts[0].address,
              LSP4_TOKEN_TYPES.TOKEN,
              false,
              true,
            );

            // give some tokens to the UP
            await lsp7Token.mint(await context.universalProfile.getAddress(), 100, false, '0x');

            const tokenRecipient = context.accounts[5].address;
            const tokenAmount = 10;

            const senderTokenBalanceBefore = await lsp7Token.balanceOf(
              await context.universalProfile.getAddress(),
            );
            const recipientTokenBalanceBefore = await lsp7Token.balanceOf(tokenRecipient);
            expect(senderTokenBalanceBefore).to.equal(100);
            expect(recipientTokenBalanceBefore).to.equal(0);

            const tokenTransferPayload = lsp7Token.interface.encodeFunctionData('transfer', [
              await context.universalProfile.getAddress(),
              tokenRecipient,
              tokenAmount,
              true,
              '0x',
            ]);

            await context.universalProfile
              .connect(caller)
              .execute(OPERATION_TYPES.CALL, lsp7Token.target.toString(), 0, tokenTransferPayload);

            const senderTokenBalanceAfter = await lsp7Token.balanceOf(
              await context.universalProfile.getAddress(),
            );
            const recipientTokenBalanceAfter = await lsp7Token.balanceOf(tokenRecipient);
            expect(senderTokenBalanceAfter).to.equal(
              senderTokenBalanceBefore - BigInt(tokenAmount),
            );
            expect(recipientTokenBalanceAfter).to.equal(
              recipientTokenBalanceBefore + BigInt(tokenAmount),
            );
          });
        }
      });
    });
  });
};
