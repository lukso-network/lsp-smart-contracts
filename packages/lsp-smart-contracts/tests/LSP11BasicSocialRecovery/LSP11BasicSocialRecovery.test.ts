import { LSP11BasicSocialRecovery__factory, LSP6KeyManager, UniversalProfile } from '../../types';

import {
  getNamedAccounts,
  shouldInitializeLikeLSP11,
  LSP11TestContext,
  shouldBehaveLikeLSP11,
} from './LSP11BasicSocialRecovery.behaviour';

import {
  setupProfileWithKeyManagerWithURD,
  grantLSP11PermissionViaKeyManager,
} from '../utils/fixtures';

describe('LSP11BasicSocialRecovery with constructor', () => {
  let context: LSP11TestContext;

  const buildTestContext = async (): Promise<LSP11TestContext> => {
    const accounts = await getNamedAccounts();

    const [UP, KM] = await setupProfileWithKeyManagerWithURD(accounts.owner);

    const universalProfile = UP as UniversalProfile;
    const lsp6KeyManager = KM as LSP6KeyManager;

    const deployParams = {
      owner: universalProfile,
      target: universalProfile,
    };

    const lsp11BasicSocialRecovery = await new LSP11BasicSocialRecovery__factory(
      accounts.any,
    ).deploy(deployParams.owner.address, deployParams.target.address);

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

  before(async () => {
    context = await buildTestContext();
  });

  describe('When deploying the contract', () => {
    describe('When initializing the contract', () => {
      shouldInitializeLikeLSP11(async () => {
        const { lsp11BasicSocialRecovery, deployParams } = context;
        return {
          lsp11BasicSocialRecovery,
          deployParams,
          initializeTransaction: context.lsp11BasicSocialRecovery.deployTransaction,
        };
      });
    });
  });

  describe('When testing deployed contract', () => {
    shouldBehaveLikeLSP11(buildTestContext);
  });
});
