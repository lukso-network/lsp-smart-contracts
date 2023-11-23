import { ethers } from 'hardhat';

import {
  shouldInitializeLikeLSP8MetadataContract,
  shouldBehaveLikeLSP8MetadataContract,
  LSP8MetadataContractTestContext,
} from '../LSP8MetadataContract.behaviour';

import { LSP8MetadataContractTester__factory } from '../../../types';

describe('LSP8MetadataContract with constructor', () => {
  const buildContext = async (): Promise<LSP8MetadataContractTestContext> => {
    const accounts = await ethers.getSigners();

    const deployParams = {
      contractOwner: accounts[0],
      referenceContract: ethers.Wallet.createRandom().address,
    };

    const lsp8MetadataContract = await new LSP8MetadataContractTester__factory(accounts[0]).deploy(
      deployParams.contractOwner.address,
      deployParams.referenceContract,
    );

    return {
      lsp8MetadataContract,
      deployParams,
    };
  };

  describe('when deploying the contract', () => {
    shouldInitializeLikeLSP8MetadataContract(buildContext);
  });

  describe('when testing deployed contract', () => {
    shouldBehaveLikeLSP8MetadataContract(buildContext);
  });
});
