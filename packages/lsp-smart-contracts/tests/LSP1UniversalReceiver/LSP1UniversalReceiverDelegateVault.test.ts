import { ERC725YDataKeys } from '../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';

import {
  LSP1TestContext,
  getNamedAccounts,
  shouldBehaveLikeLSP1Delegate,
} from './LSP1UniversalReceiverDelegateVault.behaviour';
import { ethers } from 'hardhat';

describe('LSP1UniversalReceiverDelegateVault', () => {
  describe('when testing deployed contract', () => {
    const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
      const accounts = await getNamedAccounts();

      const LSP1UniversalReceiverDelegateVault__factory = await ethers.getContractFactory(
        'LSP1UniversalReceiverDelegateVault',
        accounts[0],
      );
      const UniversalProfile__factory = await ethers.getContractFactory(
        'UniversalProfile',
        accounts[0],
      );
      const LSP9Vault__factory = await ethers.getContractFactory('LSP9Vault', accounts[0]);

      // deploying 1 UP, 2 Vaults

      const lsp1universalReceiverDelegateVault =
        await LSP1UniversalReceiverDelegateVault__factory.deploy();
      const universalProfile = await UniversalProfile__factory.deploy(accounts.owner1.address);
      const lsp9Vault1 = await LSP9Vault__factory.deploy(await universalProfile.getAddress());
      const lsp9Vault2 = await LSP9Vault__factory.deploy(await universalProfile.getAddress());

      // Setting lsp1UniversalReceiverDelegateVault as URD for the Vault

      const abi = lsp9Vault1.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
        await lsp1universalReceiverDelegateVault.getAddress(),
      ]);

      await universalProfile
        .connect(accounts.owner1)
        ['execute(uint256,address,uint256,bytes)'](
          OPERATION_TYPES.CALL,
          await lsp9Vault1.getAddress(),
          0,
          abi,
        );

      await universalProfile
        .connect(accounts.owner1)
        ['execute(uint256,address,uint256,bytes)'](
          OPERATION_TYPES.CALL,
          await lsp9Vault2.getAddress(),
          0,
          abi,
        );

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
