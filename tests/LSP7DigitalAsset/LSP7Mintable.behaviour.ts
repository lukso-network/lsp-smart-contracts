import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import {
  LSP7Mintable,
  UniversalProfile,
  LSP6KeyManager,
  UniversalReceiverDelegateTokenReentrant__factory,
} from '../../types';

import { setupProfileWithKeyManagerWithURD } from '../utils/fixtures';

import { PERMISSIONS, ERC725YDataKeys, OPERATION_TYPES, CALLTYPE } from '../../constants';
import { combineAllowedCalls, combinePermissions } from '../utils/helpers';

export type LSP7MintableTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
  profileOwner: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7MintableTestAccounts> => {
  const [owner, tokenReceiver, profileOwner] = await ethers.getSigners();
  return { owner, tokenReceiver, profileOwner };
};

export type LSP7MintableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  isNFT: boolean;
};

export type LSP7MintableTestContext = {
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
      const amountToMint = ethers.BigNumber.from('100');
      const preTotalSupply = await context.lsp7Mintable.totalSupply();

      await context.lsp7Mintable.mint(
        context.accounts.tokenReceiver.address,
        amountToMint,
        true, // beneficiary is an EOA, so we need to force minting
        '0x',
      );

      const postTotalSupply = await context.lsp7Mintable.totalSupply();
      expect(postTotalSupply).to.equal(preTotalSupply.add(amountToMint));
    });

    it('should increase the tokenReceiver balance', async () => {
      const amountToMint = ethers.BigNumber.from('100');

      const tokenReceiverBalance = await context.lsp7Mintable.balanceOf(
        context.accounts.tokenReceiver.address,
      );

      expect(tokenReceiverBalance).to.equal(amountToMint);
    });
  });

  describe('when non-owner minting tokens', () => {
    it('should revert', async () => {
      const amountToMint = ethers.BigNumber.from('100');

      // use any other account
      const nonOwner = context.accounts.tokenReceiver;

      await expect(
        context.lsp7Mintable.connect(nonOwner).mint(nonOwner.address, amountToMint, true, '0x'),
      ).to.be.revertedWithCustomError(context.lsp7Mintable, 'OwnableCallerNotTheOwner');
    });
  });

  describe('when owner try to re-enter mint function through the UniversalReceiverDelegate', () => {
    let universalProfile;
    let lsp6KeyManager;

    before(async () => {
      const [UP, KM] = await setupProfileWithKeyManagerWithURD(context.accounts.profileOwner);

      universalProfile = UP as UniversalProfile;
      lsp6KeyManager = KM as LSP6KeyManager;

      await context.lsp7Mintable
        .connect(context.accounts.owner)
        .transferOwnership(universalProfile.address);

      const URDTokenReentrant = await new UniversalReceiverDelegateTokenReentrant__factory(
        context.accounts.profileOwner,
      ).deploy();

      const setDataPayload = universalProfile.interface.encodeFunctionData('setDataBatch', [
        [
          ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            URDTokenReentrant.address.substring(2),
          ERC725YDataKeys.LSP6['AddressPermissions:AllowedCalls'] +
            URDTokenReentrant.address.substring(2),
          ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
        ],
        [
          combinePermissions(PERMISSIONS.CALL, PERMISSIONS.REENTRANCY),
          combineAllowedCalls(
            [CALLTYPE.CALL],
            [context.lsp7Mintable.address],
            ['0xffffffff'],
            ['0xffffffff'],
          ),
          URDTokenReentrant.address,
        ],
      ]);

      await lsp6KeyManager.connect(context.accounts.profileOwner).execute(setDataPayload);
    });

    it('should pass', async () => {
      const firstAmount = 50;
      const secondAmount = 150;

      const reentrantMintPayload = context.lsp7Mintable.interface.encodeFunctionData('mint', [
        universalProfile.address,
        firstAmount,
        false,
        '0x',
      ]);

      const mintPayload = context.lsp7Mintable.interface.encodeFunctionData('mint', [
        universalProfile.address,
        secondAmount,
        false,
        reentrantMintPayload,
      ]);

      const executePayload = universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        context.lsp7Mintable.address,
        0,
        mintPayload,
      ]);

      await lsp6KeyManager.connect(context.accounts.profileOwner).execute(executePayload);

      const balanceOfUP = await context.lsp7Mintable.callStatic.balanceOf(universalProfile.address);

      expect(balanceOfUP).to.equal(firstAmount + secondAmount);
    });
  });
};
