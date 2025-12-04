import { expect } from 'chai';
import type { HardhatEthers, HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';

import {
  type UniversalReceiverDelegateTokenReentrant,
  UniversalReceiverDelegateTokenReentrant__factory,
} from '../../types/ethers-contracts/index.js';
import { type LSP7Mintable } from '../../../lsp7-contracts/types/ethers-contracts/index.js';
import { type UniversalProfileInit } from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import { type LSP6KeyManagerInit } from '../../../lsp6-contracts/types/ethers-contracts/index.js';

import { setupProfileWithKeyManagerWithURD } from '../utils/fixtures.js';

import { ERC725YDataKeys } from '../../constants.js';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';
import { combineAllowedCalls, combinePermissions } from '../utils/helpers.js';
import { toBigInt } from 'ethers';

export type LSP7MintableTestAccounts = {
  owner: HardhatEthersSigner;
  tokenReceiver: HardhatEthersSigner;
  profileOwner: HardhatEthersSigner;
};

export const getNamedAccounts = async (
  ethers: HardhatEthers,
): Promise<LSP7MintableTestAccounts> => {
  const [owner, tokenReceiver, profileOwner] = await ethers.getSigners();
  return { owner, tokenReceiver, profileOwner };
};

export type LSP7MintableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  isNFT: boolean;
  lsp4TokenType: number;
  mintable: boolean;
};

export type LSP7MintableTestContext = {
  ethers: HardhatEthers;
  accounts: LSP7MintableTestAccounts;
  lsp7Mintable: LSP7Mintable;
  deployParams: LSP7MintableDeployParams;
};

export const shouldBehaveLikeLSP7Mintable = (
  buildContext: () => Promise<LSP7MintableTestContext>,
) => {
  let context: LSP7MintableTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when owner minting tokens', () => {
    it('should increase the total supply', async () => {
      const amountToMint = BigInt(100);
      const preTotalSupply = await context.lsp7Mintable.totalSupply();

      await context.lsp7Mintable.mint(
        context.accounts.tokenReceiver.address,
        amountToMint,
        true, // beneficiary is an EOA, so we need to force minting
        '0x',
      );

      const postTotalSupply = await context.lsp7Mintable.totalSupply();
      expect(postTotalSupply).to.equal(preTotalSupply + amountToMint);
    });

    it('should increase the tokenReceiver balance', async () => {
      const amountToMint = toBigInt('100');

      const tokenReceiverBalance = await context.lsp7Mintable.balanceOf(
        context.accounts.tokenReceiver.address,
      );

      expect(tokenReceiverBalance).to.equal(amountToMint);
    });
  });

  describe('when non-owner minting tokens', () => {
    it('should revert', async () => {
      const amountToMint = toBigInt('100');

      // use any other account
      const nonOwner = context.accounts.tokenReceiver;

      await expect(
        context.lsp7Mintable.connect(nonOwner).mint(nonOwner.address, amountToMint, true, '0x'),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('when owner try to re-enter mint function through the UniversalReceiverDelegate', () => {
    let universalProfile: UniversalProfileInit;
    let lsp6KeyManager: LSP6KeyManagerInit;

    before(async () => {
      const [UP, KM] = await setupProfileWithKeyManagerWithURD(context.accounts.profileOwner);

      universalProfile = UP as UniversalProfileInit;
      lsp6KeyManager = KM as LSP6KeyManagerInit;

      await context.lsp7Mintable
        .connect(context.accounts.owner)
        .transferOwnership(await universalProfile.getAddress());

      const URDTokenReentrant = (await new UniversalReceiverDelegateTokenReentrant__factory(
        context.accounts.profileOwner,
      ).deploy()) as UniversalReceiverDelegateTokenReentrant;

      const setDataPayload = universalProfile.interface.encodeFunctionData('setDataBatch', [
        [
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            (await URDTokenReentrant.getAddress()).substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            (await URDTokenReentrant.getAddress()).substring(2),
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
        ],
        [
          combinePermissions(PERMISSIONS.CALL, PERMISSIONS.REENTRANCY),
          combineAllowedCalls(
            [CALLTYPE.CALL],
            [await context.lsp7Mintable.getAddress()],
            ['0xffffffff'],
            ['0xffffffff'],
          ),
          await URDTokenReentrant.getAddress(),
        ],
      ]);

      await lsp6KeyManager.connect(context.accounts.profileOwner).execute(setDataPayload);
    });

    it('should pass', async () => {
      const firstAmount = 50;
      const secondAmount = 150;
      const reentrantMintPayload = context.lsp7Mintable.interface.encodeFunctionData('mint', [
        await universalProfile.getAddress(),
        firstAmount,
        false,
        '0x',
      ]);
      const mintPayload = context.lsp7Mintable.interface.encodeFunctionData('mint', [
        await universalProfile.getAddress(),
        secondAmount,
        false,
        reentrantMintPayload,
      ]);
      const executePayload = universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        await context.lsp7Mintable.getAddress(),
        0,
        mintPayload,
      ]);
      await lsp6KeyManager.connect(context.accounts.profileOwner).execute(executePayload);
      const balanceOfUP = await context.lsp7Mintable.balanceOf(await universalProfile.getAddress());
      expect(balanceOfUP).to.equal(firstAmount + secondAmount);
    });
  });
};
