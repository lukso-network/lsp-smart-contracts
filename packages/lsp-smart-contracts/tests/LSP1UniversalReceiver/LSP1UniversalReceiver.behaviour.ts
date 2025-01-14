import { expect } from 'chai';
import { parseEther } from 'ethers';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

// types
import {
  UniversalProfile,
  UniversalReceiverTester,
  UniversalReceiverDelegateRevert__factory,
  UniversalReceiverDelegateRevert,
} from '../../typechain';

// helpers
import { abiCoder, LSP1_HOOK_PLACEHOLDER } from '../utils/helpers';

// constants
import { ERC725YDataKeys } from '../../constants';

export type LSP1TestContext = {
  accounts: SignerWithAddress[];
  // contract that implement the LSP1 - Universal Receiver interface
  lsp1Implementation: UniversalProfile;
  // contract that call the `universalReceiver(...)` function (for testing)
  lsp1Checker: UniversalReceiverTester;
};

export const shouldBehaveLikeLSP1 = (buildContext: () => Promise<LSP1TestContext>) => {
  let context: LSP1TestContext;

  let lsp1ImplementationAddress: string;
  let lsp1CheckerAddress: string;

  describe('when calling the `universalReceiver(...)` function', () => {
    const valueSent = 0;

    before(async () => {
      context = await buildContext();
      lsp1ImplementationAddress = await context.lsp1Implementation.getAddress();
      lsp1CheckerAddress = await context.lsp1Checker.getAddress();
    });

    describe('from an EOA', () => {
      it('should emit a UniversalReceiver(...) event with correct topics', async () => {
        const caller = context.accounts[2];
        const data = '0xaabbccdd';

        await expect(
          context.lsp1Implementation
            .connect(caller)
            .universalReceiver(LSP1_HOOK_PLACEHOLDER, data, {
              value: valueSent,
            }),
        )
          .to.emit(context.lsp1Implementation, 'UniversalReceiver')
          .withArgs(
            // from
            caller.address,
            // value
            valueSent,
            // typeId
            LSP1_HOOK_PLACEHOLDER,
            // receivedData
            data,
            // returnedValue
            abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
          );
      });
    });

    describe('from a Contract', () => {
      describe('via a contract call - `contract.universalReceiver(...)`', () => {
        it('should emit an UniversalReceiver(...) event', async () => {
          await expect(
            context.lsp1Checker.checkImplementation(
              lsp1ImplementationAddress,
              LSP1_HOOK_PLACEHOLDER,
            ),
          )
            .to.emit(context.lsp1Implementation, 'UniversalReceiver')
            .withArgs(
              // from
              lsp1CheckerAddress,
              // value
              valueSent,
              // typeId
              LSP1_HOOK_PLACEHOLDER,
              // receivedData
              '0x',
              // returnedValue
              abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
            );
        });
      });

      describe('via a low-level call - `address(contract).call(...)`', () => {
        it('should emit an UniversalReceiver(...) event', async () => {
          await expect(
            context.lsp1Checker.checkImplementationLowLevelCall(
              lsp1ImplementationAddress,
              LSP1_HOOK_PLACEHOLDER,
            ),
          )
            .to.emit(context.lsp1Implementation, 'UniversalReceiver')
            .withArgs(
              // from
              lsp1CheckerAddress,
              // value
              valueSent,
              // typeId
              LSP1_HOOK_PLACEHOLDER,
              // receivedData
              '0x',
              // returnedValue
              abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
            );
        });
      });

      /**
       * @todo
       * test returned value of the `universalReceiver(...)` function
       * using `lsp1Checker.callImplementationAndReturn(...)`
       *
       */
    });

    describe('to test typeId delegate feature', () => {
      let revertableURD: UniversalReceiverDelegateRevert;

      describe('when setting a revertable typeId', () => {
        before(async () => {
          context = await buildContext();

          revertableURD = await new UniversalReceiverDelegateRevert__factory(
            context.accounts[1],
          ).deploy();

          await context.lsp1Implementation
            .connect(context.accounts[0])
            .setData(
              ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
                LSP1_HOOK_PLACEHOLDER.substring(2, 42),
              await revertableURD.getAddress(),
            );
        });

        it('should revert', async () => {
          const caller = context.accounts[2];
          const data = '0xaabbccdd';

          await expect(
            context.lsp1Implementation
              .connect(caller)
              .universalReceiver(LSP1_HOOK_PLACEHOLDER, data),
          ).to.be.revertedWith('I Revert');
        });
      });
    });
  });

  describe('when calling the `universalReceiver(...)` function while sending native tokens', () => {
    const valueSent = parseEther('3');

    before(async () => {
      context = await buildContext();
      lsp1ImplementationAddress = await context.lsp1Implementation.getAddress();
      lsp1CheckerAddress = await context.lsp1Checker.getAddress();
    });

    describe('from an EOA', () => {
      it('should emit a UniversalReceiver(...) event with correct topics', async () => {
        const caller = context.accounts[2];

        await expect(
          context.lsp1Implementation
            .connect(caller)
            .universalReceiver(LSP1_HOOK_PLACEHOLDER, '0x', {
              value: valueSent,
            }),
        )
          .to.emit(context.lsp1Implementation, 'UniversalReceiver')
          .withArgs(
            caller.address,
            valueSent,
            LSP1_HOOK_PLACEHOLDER,
            '0x',
            abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
          );
      });
    });

    describe('from a Contract', () => {
      before(async () => {
        await context.accounts[0].sendTransaction({
          to: lsp1CheckerAddress,
          value: parseEther('50'),
        });
      });

      describe('via a contract call - `contract.universalReceiver(...)`', () => {
        it('should emit an UniversalReceiver(...) event', async () => {
          await expect(
            context.lsp1Checker.checkImplementation(
              lsp1ImplementationAddress,
              LSP1_HOOK_PLACEHOLDER,
              { value: valueSent },
            ),
          )
            .to.emit(context.lsp1Implementation, 'UniversalReceiver')
            .withArgs(
              // from
              lsp1CheckerAddress,
              // value
              valueSent,
              // typeId
              LSP1_HOOK_PLACEHOLDER,
              // receivedData
              '0x',
              // returnedValue
              abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
            );
        });
      });

      describe('via a low-level call - `address(contract).call(...)`', () => {
        it('should emit an UniversalReceiver(...) event', async () => {
          await expect(
            context.lsp1Checker.checkImplementationLowLevelCall(
              lsp1ImplementationAddress,
              LSP1_HOOK_PLACEHOLDER,
              { value: valueSent },
            ),
          )
            .to.emit(context.lsp1Implementation, 'UniversalReceiver')
            .withArgs(
              // from
              lsp1CheckerAddress,
              // value
              valueSent,
              // typeId
              LSP1_HOOK_PLACEHOLDER,
              // receivedData
              '0x',
              // returnedValue
              abiCoder.encode(['bytes', 'bytes'], ['0x', '0x']),
            );
        });
      });
    });
  });
};
