import { expect } from 'chai';

import {
  LSP6KeyManager,
  UniversalProfile,
  LSP11BasicSocialRecoveryInit__factory,
} from '../../types';

import {
  getNamedAccounts,
  shouldInitializeLikeLSP11,
  LSP11TestContext,
  shouldBehaveLikeLSP11,
} from './LSP11BasicSocialRecovery.behaviour';

import {
  setupProfileWithKeyManagerWithURD,
  deployProxy,
  grantLSP11PermissionViaKeyManager,
} from '../utils/fixtures';

describe('LSP11BasicSocialRecoveryInit with proxy', () => {
  const buildTestContext = async (): Promise<LSP11TestContext> => {
    const accounts = await getNamedAccounts();

    const [UP, KM] = await setupProfileWithKeyManagerWithURD(accounts.owner);

    const universalProfile = UP as UniversalProfile;
    const lsp6KeyManager = KM as LSP6KeyManager;

    const deployParams = {
      owner: universalProfile,
      target: universalProfile,
    };

    const lsp11BasicSocialRecoveryInit = await new LSP11BasicSocialRecoveryInit__factory(
      accounts.owner,
    ).deploy();

    const lsp11BasicSocialRecoveryProxy = await deployProxy(
      lsp11BasicSocialRecoveryInit.address,
      accounts.owner,
    );

    const lsp11BasicSocialRecovery = lsp11BasicSocialRecoveryInit.attach(
      lsp11BasicSocialRecoveryProxy,
    );

    await grantLSP11PermissionViaKeyManager(
      accounts.owner,
      universalProfile,
      lsp6KeyManager,
      lsp11BasicSocialRecovery.address,
    );

    return {
      accounts,
      lsp11BasicSocialRecovery,
      deployParams,
      universalProfile,
      lsp6KeyManager,
    };
  };

  const initializeProxy = async (context: LSP11TestContext) => {
    return context.lsp11BasicSocialRecovery['initialize(address,address)'](
      context.deployParams.owner.address,
      context.deployParams.target.address,
    );
  };

  describe('When deploying the contract as proxy', () => {
    let context: LSP11TestContext;

    before(async () => {
      context = await buildTestContext();
    });

    describe('When initializing the proxy contract', () => {
      shouldInitializeLikeLSP11(async () => {
        const { lsp11BasicSocialRecovery, deployParams } = context;
        const initializeTransaction = await initializeProxy(context);

        return {
          lsp11BasicSocialRecovery,
          deployParams,
          initializeTransaction,
        };
      });
    });

    describe('When calling initialize more than once', () => {
      it('should revert', async () => {
        await expect(initializeProxy(context)).to.be.revertedWith(
          'Initializable: contract is already initialized',
        );
      });
    });
  });

  describe('When testing deployed contract', () => {
    shouldBehaveLikeLSP11(() =>
      buildTestContext().then(async (context) => {
        await initializeProxy(context);

        return context;
      }),
    );
  });
});
