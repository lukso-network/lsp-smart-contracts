import { ERC725YDataKeys, OPERATION_TYPES } from '../../constants';
import {
  LSP1UniversalReceiverDelegateVault__factory,
  UniversalProfile__factory,
  LSP9Vault__factory,
} from '../../types';

import {
  LSP1TestContext,
  getNamedAccounts,
  shouldBehaveLikeLSP1Delegate,
} from './LSP1UniversalReceiverDelegateVault.behaviour';

describe('LSP1UniversalReceiverDelegateVault', () => {
  describe('when testing deployed contract', () => {
    const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
      const accounts = await getNamedAccounts();

      // deploying 1 UP, 2 Vaults

      const lsp1universalReceiverDelegateVault =
        await new LSP1UniversalReceiverDelegateVault__factory(accounts.any).deploy();

      const universalProfile = await new UniversalProfile__factory(accounts.any).deploy(
        accounts.owner1.address,
      );

      const lsp9Vault1 = await new LSP9Vault__factory(accounts.any).deploy(
        universalProfile.address,
      );

      const lsp9Vault2 = await new LSP9Vault__factory(accounts.any).deploy(
        universalProfile.address,
      );

      // Setting lsp1UniversalReceiverDelegateVault as URD for the Vault

      const abi = lsp9Vault1.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
        lsp1universalReceiverDelegateVault.address,
      ]);

      await universalProfile
        .connect(accounts.owner1)
        .execute(OPERATION_TYPES.CALL, lsp9Vault1.address, 0, abi);

      await universalProfile
        .connect(accounts.owner1)
        .execute(OPERATION_TYPES.CALL, lsp9Vault2.address, 0, abi);

      return {
        accounts,
        universalProfile,
        lsp9Vault1,
        lsp9Vault2,
        lsp1universalReceiverDelegateVault,
      };
    };
    // executing tests with the context above
    shouldBehaveLikeLSP1Delegate(buildLSP1TestContext);
  });
});
