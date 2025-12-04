import { expect } from 'chai';
import type { HardhatEthers, HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import { hexlify, randomBytes } from 'ethers';

import {
  LSP8TransferOwnerChange__factory,
  UniversalReceiverDelegateTokenReentrant__factory,
} from '../../types/ethers-contracts/index.js';
import { type UniversalProfile } from '../../../universalprofile-contracts/types/ethers-contracts/index.js';
import { type LSP6KeyManager } from '../../../lsp6-contracts/types/ethers-contracts/index.js';
import { type LSP8Mintable } from '../../../lsp8-contracts/types/ethers-contracts/index.js';

import { setupProfileWithKeyManagerWithURD } from '../utils/fixtures.js';
import { ERC725YDataKeys } from '../../constants.js';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { PERMISSIONS, CALLTYPE } from '@lukso/lsp6-contracts';
import { combineAllowedCalls, combinePermissions } from '../utils/helpers.js';

export type LSP8MintableTestAccounts = {
  owner: HardhatEthersSigner;
  tokenReceiver: HardhatEthersSigner;
  profileOwner: HardhatEthersSigner;
};

export const getNamedAccounts = async (
  ethers: HardhatEthers,
): Promise<LSP8MintableTestAccounts> => {
  const [owner, tokenReceiver, profileOwner] = await ethers.getSigners();
  return { owner, tokenReceiver, profileOwner };
};

export type LSP8MintableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  lsp4TokenType: number;
  lsp8TokenIdFormat: number;
};

export type LSP8MintableTestContext = {
  ethers: HardhatEthers;
  accounts: LSP8MintableTestAccounts;
  lsp8Mintable: LSP8Mintable;
  deployParams: LSP8MintableDeployParams;
};

export const shouldBehaveLikeLSP8Mintable = (
  buildContext: () => Promise<LSP8MintableTestContext>,
) => {
  let context: LSP8MintableTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when owner minting tokens', () => {
    it('total supply should have increased', async () => {
      const randomTokenId = randomBytes(32);

      const preMintTotalSupply = await context.lsp8Mintable.totalSupply();

      await context.lsp8Mintable.mint(
        context.accounts.tokenReceiver.address,
        randomTokenId,
        true, // beneficiary is an EOA, so we need to force minting
        '0x',
      );

      const postMintTotalSupply = await context.lsp8Mintable.totalSupply();
      expect(postMintTotalSupply).to.equal(preMintTotalSupply + BigInt(1));
    });

    it('tokenReceiver balance should have increased', async () => {
      const tokenReceiverBalance = await context.lsp8Mintable.balanceOf(
        context.accounts.tokenReceiver.address,
      );

      expect(tokenReceiverBalance).to.equal(1);
    });
  });

  describe('when non-owner minting tokens', () => {
    it('should revert', async () => {
      const randomTokenId = randomBytes(32);

      // use any other account
      const nonOwner = context.accounts.tokenReceiver;

      await expect(
        context.lsp8Mintable
          .connect(nonOwner)
          .mint(context.accounts.tokenReceiver.address, randomTokenId, true, '0x'),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('when owner try to re-enter function through the UniversalReceiverDelegate', () => {
    let universalProfile: UniversalProfile;
    let lsp6KeyManager: LSP6KeyManager;

    before(async () => {
      const [UP, KM] = await setupProfileWithKeyManagerWithURD(context.accounts.profileOwner);

      universalProfile = UP as UniversalProfile;
      lsp6KeyManager = KM as LSP6KeyManager;

      await context.lsp8Mintable
        .connect(context.accounts.owner)
        .transferOwnership(await universalProfile.getAddress());

      const URDTokenReentrant = await new UniversalReceiverDelegateTokenReentrant__factory(
        context.accounts.profileOwner,
      ).deploy();

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
            [await context.lsp8Mintable.getAddress()],
            ['0xffffffff'],
            ['0xffffffff'],
          ),
          await URDTokenReentrant.getAddress(),
        ],
      ]);

      await lsp6KeyManager.connect(context.accounts.profileOwner).execute(setDataPayload);
    });
    it('should pass', async () => {
      const randomTokenId = randomBytes(32);
      const secondRandomTokenId = randomBytes(32);

      const reentrantMintPayload = context.lsp8Mintable.interface.encodeFunctionData('mint', [
        universalProfile.target,
        secondRandomTokenId,
        false,
        '0x',
      ]);

      const mintPayload = context.lsp8Mintable.interface.encodeFunctionData('mint', [
        universalProfile.target,
        randomTokenId,
        false,
        reentrantMintPayload,
      ]);

      const executePayload = universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        await context.lsp8Mintable.getAddress(),
        0,
        mintPayload,
      ]);

      await lsp6KeyManager.connect(context.accounts.profileOwner).execute(executePayload);

      const balanceOfUP = await context.lsp8Mintable.balanceOf(universalProfile.target);

      const tokenIdsOfUP = await context.lsp8Mintable.tokenIdsOf(universalProfile.target);

      expect(balanceOfUP).to.equal(2);
      expect(tokenIdsOfUP[0]).to.equal(hexlify(randomTokenId));
      expect(tokenIdsOfUP[1]).to.equal(hexlify(secondRandomTokenId));
    });
  });
  describe('when there is an owner change in the _beforeTokenTransfer hook', () => {
    it('should revert', async () => {
      // deploy LSP8TransferOwnerChange contract
      const lsp8TransferOwnerChange = await new LSP8TransferOwnerChange__factory(
        context.accounts.owner,
      ).deploy(
        'RandomName',
        'RandomSymbol',
        context.accounts.owner.address,
        0, // token type
        0, // token id format
      );

      const randomTokenId = hexlify(randomBytes(32));

      // // mint a token tokenReceiver
      await lsp8TransferOwnerChange.connect(context.accounts.owner).mint(
        context.accounts.tokenReceiver.address,
        randomTokenId,
        true, // beneficiary is an EOA, so we need to force minting
        '0x',
      );

      // transfer ownership to lsp8TransferOwnerChange
      await expect(
        lsp8TransferOwnerChange
          .connect(context.accounts.tokenReceiver)
          .transfer(
            context.accounts.tokenReceiver.address,
            context.accounts.owner.address,
            randomTokenId,
            true,
            '0x',
          ),
      )
        .to.be.revertedWithCustomError(lsp8TransferOwnerChange, 'LSP8TokenOwnerChanged')
        .withArgs(
          randomTokenId,
          context.accounts.tokenReceiver.address,
          await lsp8TransferOwnerChange.getAddress(),
        );
    });
  });
};
