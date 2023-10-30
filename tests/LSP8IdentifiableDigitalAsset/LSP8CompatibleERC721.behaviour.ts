import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

import {
  LSP8CompatibleERC721Tester,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithLSP1WithERC721ReceivedRevert,
  TokenReceiverWithLSP1WithERC721ReceivedRevert__factory,
  TokenReceiverWithLSP1WithERC721ReceivedInvalid,
  TokenReceiverWithLSP1WithERC721ReceivedInvalid__factory,
  TokenReceiverWithLSP1WithERC721Received,
  TokenReceiverWithLSP1WithERC721Received__factory,
  TokenReceiverWithoutLSP1WithERC721ReceivedRevert,
  TokenReceiverWithoutLSP1WithERC721ReceivedRevert__factory,
  TokenReceiverWithoutLSP1WithERC721ReceivedInvalid,
  TokenReceiverWithoutLSP1WithERC721ReceivedInvalid__factory,
  TokenReceiverWithoutLSP1WithERC721Received,
  TokenReceiverWithoutLSP1WithERC721Received__factory,
  UniversalReceiverDelegateRevert,
  UniversalReceiverDelegateRevert__factory,
} from '../../types';
import { tokenIdAsBytes32 } from '../utils/tokens';
import { ERC725YDataKeys, INTERFACE_IDS, SupportedStandards } from '../../constants';

import type { BytesLike } from 'ethers';
import type { TransactionResponse } from '@ethersproject/abstract-provider';

export type LSP8CompatibleERC721TestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  anotherOperator: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP8CompatibleERC721TestAccounts> => {
  const [owner, tokenReceiver, operator, anotherOperator, anyone] = await ethers.getSigners();
  return { owner, tokenReceiver, operator, anotherOperator, anyone };
};

type LSP8CompatibleERC721DeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  lsp4MetadataValue: string;
  tokenIdType: number;
};

export type LSP8CompatibleERC721TestContext = {
  accounts: LSP8CompatibleERC721TestAccounts;
  lsp8CompatibleERC721: LSP8CompatibleERC721Tester;
  deployParams: LSP8CompatibleERC721DeployParams;
};

export type ExpectedError = {
  error: string;
  args: string[];
};

const mintedTokenId = '10';
const neverMintedTokenId = '1010110';

export const shouldBehaveLikeLSP8CompatibleERC721 = (
  buildContext: () => Promise<LSP8CompatibleERC721TestContext>,
) => {
  let context: LSP8CompatibleERC721TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe('when setting data', () => {
    it('should not allow to update the `LSP8TokenIdType` after deployment', async () => {
      await expect(
        context.lsp8CompatibleERC721.setData(ERC725YDataKeys.LSP8.LSP8TokenIdType, '0xdeadbeef'),
      ).to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8TokenIdTypeNotEditable');
    });
  });

  describe('when setting data', () => {
    it('should not allow to update the `LSP8TokenIdType` after deployment', async () => {
      await expect(
        context.lsp8CompatibleERC721.setData(ERC725YDataKeys.LSP8.LSP8TokenIdType, '0xdeadbeef'),
      ).to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8TokenIdTypeNotEditable');
    });
  });

  describe('when checking supported ERC165 interfaces', () => {
    it('should support ERC721', async () => {
      expect(await context.lsp8CompatibleERC721.supportsInterface(INTERFACE_IDS.ERC721)).to.equal(
        true,
      );
    });

    it('should support ERC721Metadata', async () => {
      expect(
        await context.lsp8CompatibleERC721.supportsInterface(INTERFACE_IDS.ERC721Metadata),
      ).to.equal(true);
    });
  });

  describe('name', () => {
    it('should allow reading name', async () => {
      // using compatibility getter -> returns(string)
      const nameAsString = await context.lsp8CompatibleERC721.name();
      expect(nameAsString).to.equal(context.deployParams.name);

      // using getData -> returns(bytes)
      const nameAsBytes = await context.lsp8CompatibleERC721['getData(bytes32)'](
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('LSP4TokenName')),
      );
      expect(ethers.utils.toUtf8String(nameAsBytes)).to.equal(context.deployParams.name);
    });
  });

  describe('symbol', () => {
    it('should allow reading symbol', async () => {
      // using compatibility getter -> returns(string)
      const symbolAsString = await context.lsp8CompatibleERC721.symbol();
      expect(symbolAsString).to.equal(context.deployParams.symbol);

      // using getData -> returns(bytes)
      const symbolAsBytes = await context.lsp8CompatibleERC721['getData(bytes32)'](
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('LSP4TokenSymbol')),
      );
      expect(ethers.utils.toUtf8String(symbolAsBytes)).to.equal(context.deployParams.symbol);
    });
  });

  describe('tokenURI', () => {
    it('should allow reading tokenURI', async () => {
      // using compatibility getter -> returns(string)
      const tokenURIAsString = await context.lsp8CompatibleERC721.tokenURI(mintedTokenId);
      // offset = bytes4(hashSig) + bytes32(contentHash) -> 4 + 32 = 36 + 2 for prefix = 38
      const offset = 36 * 2 + 2;
      expect(tokenURIAsString).to.equal(
        ethers.utils.toUtf8String(`0x${context.deployParams.lsp4MetadataValue.slice(offset)}`),
      );

      // using getData -> returns(bytes)
      const lsp4MetadataValueAsBytes = await context.lsp8CompatibleERC721['getData(bytes32)'](
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('LSP4Metadata')),
      );
      expect(lsp4MetadataValueAsBytes).to.equal(context.deployParams.lsp4MetadataValue);
    });
  });

  describe('ownerOf', () => {
    describe('when tokenId has not been minted', () => {
      it('should revert', async () => {
        await expect(context.lsp8CompatibleERC721.ownerOf(neverMintedTokenId))
          .to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8NonExistentTokenId')
          .withArgs(tokenIdAsBytes32(neverMintedTokenId));
      });
    });

    describe('when tokenId has been minted', () => {
      it('should return owner address', async () => {
        await context.lsp8CompatibleERC721.mint(
          context.accounts.owner.address,
          mintedTokenId,
          ethers.utils.toUtf8Bytes('mint a token for the owner'),
        );

        expect(await context.lsp8CompatibleERC721.ownerOf(mintedTokenId)).to.equal(
          context.accounts.owner.address,
        );
      });
    });
  });

  describe('approve', () => {
    describe('when tokenId has not been minted', () => {
      it('should revert', async () => {
        await expect(
          context.lsp8CompatibleERC721
            .connect(context.accounts.anyone)
            .approve(context.accounts.operator.address, neverMintedTokenId),
        )
          .to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8NonExistentTokenId')
          .withArgs(tokenIdAsBytes32(neverMintedTokenId));
      });
    });

    describe('when the tokenId has been minted', () => {
      beforeEach(async () => {
        await context.lsp8CompatibleERC721.mint(
          context.accounts.owner.address,
          mintedTokenId,
          ethers.utils.toUtf8Bytes('mint a token for the owner'),
        );
      });

      describe('when caller is not owner of tokenId', () => {
        it('should revert', async () => {
          await expect(
            context.lsp8CompatibleERC721
              .connect(context.accounts.anyone)
              .approve(context.accounts.operator.address, mintedTokenId),
          )
            .to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8NotTokenOwner')
            .withArgs(
              context.accounts.owner.address,
              tokenIdAsBytes32(mintedTokenId),
              context.accounts.anyone.address,
            );
        });
      });

      describe('when caller is owner of tokenId', () => {
        describe('when operator is not the zero address', () => {
          it('should succeed', async () => {
            const operator = context.accounts.operator.address;
            const tokenId = mintedTokenId;

            const tx = await context.lsp8CompatibleERC721.approve(operator, tokenId);

            await expect(tx)
              .to.emit(context.lsp8CompatibleERC721, 'AuthorizedOperator')
              .withArgs(operator, context.accounts.owner.address, tokenIdAsBytes32(tokenId), '0x');

            await expect(tx)
              .to.emit(context.lsp8CompatibleERC721, 'Approval')
              .withArgs(context.accounts.owner.address, operator, ethers.BigNumber.from(tokenId));
          });

          describe('when approving an LSP1 contract', () => {
            it('should succeed and inform the operator', async () => {
              const tokenReceiverWithLSP1: TokenReceiverWithLSP1 =
                await new TokenReceiverWithLSP1__factory(context.accounts.owner).deploy();
              const operator = tokenReceiverWithLSP1.address;
              const tokenOwner = context.accounts.owner.address;
              const tokenId = mintedTokenId;

              const tx = await context.lsp8CompatibleERC721.approve(operator, tokenId, {
                gasLimit: 2000000,
              });

              await expect(tx)
                .to.emit(context.lsp8CompatibleERC721, 'AuthorizedOperator')
                .withArgs(operator, tokenOwner, tokenIdAsBytes32(tokenId), '0x');

              await expect(tx).to.emit(tokenReceiverWithLSP1, 'UniversalReceiver');

              expect(
                await context.lsp8CompatibleERC721.isOperatorFor(
                  operator,
                  tokenIdAsBytes32(tokenId),
                ),
              ).to.be.true;
            });

            it('should succeed and inform the operator even if the operator revert', async () => {
              const operatorThatReverts: UniversalReceiverDelegateRevert =
                await new UniversalReceiverDelegateRevert__factory(context.accounts.owner).deploy();
              const operator = operatorThatReverts.address;
              const tokenOwner = context.accounts.owner.address;
              const tokenId = mintedTokenId;

              const tx = await context.lsp8CompatibleERC721.approve(operator, tokenId);

              await expect(tx)
                .to.emit(context.lsp8CompatibleERC721, 'AuthorizedOperator')
                .withArgs(operator, tokenOwner, tokenIdAsBytes32(tokenId), '0x');

              expect(
                await context.lsp8CompatibleERC721.isOperatorFor(
                  operator,
                  tokenIdAsBytes32(tokenId),
                ),
              ).to.be.true;
            });
          });
        });

        describe('when operator is the zero address', () => {
          it('should revert', async () => {
            const operator = ethers.constants.AddressZero;
            const tokenId = mintedTokenId;

            await expect(
              context.lsp8CompatibleERC721.approve(operator, tokenId),
            ).to.be.revertedWithCustomError(
              context.lsp8CompatibleERC721,
              'LSP8CannotUseAddressZeroAsOperator',
            );
          });
        });
      });
    });
  });

  describe('setApprovalForAll', () => {
    const tokenIds = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NFT 1')),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NFT 2')),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NFT 3')),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NFT 4')),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NFT 5')),
    ];

    beforeEach(async () => {
      tokenIds.map(async (tokenId) => {
        const txParams = {
          to: context.accounts.owner.address,
          tokenId: tokenId,
          data: ethers.utils.toUtf8Bytes(`mint tokenId ${tokenId} for the owner`),
        };

        await context.lsp8CompatibleERC721
          .connect(context.accounts.owner)
          .mint(txParams.to, txParams.tokenId, txParams.data);
      });

      await context.lsp8CompatibleERC721
        .connect(context.accounts.owner)
        .setApprovalForAll(context.accounts.operator.address, true);
    });

    it('should be able to set approval for operator', async () => {
      const tx = await context.lsp8CompatibleERC721
        .connect(context.accounts.operator)
        .approve(context.accounts.anyone.address, tokenIds[0]);

      await expect(tx)
        .to.emit(context.lsp8CompatibleERC721, 'Approval')
        .withArgs(context.accounts.owner.address, context.accounts.anyone.address, tokenIds[0]);
    });

    describe('when calling setApprovalForAll with true', () => {
      it('should revert when trying to pass caller address as operator', async () => {
        await expect(
          context.lsp8CompatibleERC721
            .connect(context.accounts.owner)
            .setApprovalForAll(context.accounts.owner.address, true),
        ).to.be.revertedWith('LSP8CompatibleERC721: approve to caller');
      });

      it('should have emitted an ApprovalForAll event', async () => {
        const txParams = {
          to: context.accounts.owner.address,
          tokenId: 5,
          data: ethers.utils.toUtf8Bytes(`mint tokenId 5 for the owner`),
        };

        await context.lsp8CompatibleERC721
          .connect(context.accounts.owner)
          .mint(txParams.to, txParams.tokenId, txParams.data);

        const tx = await context.lsp8CompatibleERC721
          .connect(context.accounts.owner)
          .setApprovalForAll(context.accounts.operator.address, true);

        expect(tx)
          .to.emit(context.lsp8CompatibleERC721, 'ApprovalForAll')
          .withArgs(context.accounts.owner.address, context.accounts.operator.address, true);
      });

      describe('when calling isApprovedForAll', () => {
        it('should return true for operator', async () => {
          const result = await context.lsp8CompatibleERC721.isApprovedForAll(
            context.accounts.owner.address,
            context.accounts.operator.address,
          );

          expect(result).to.be.true;
        });

        it('should return false for non-operator', async () => {
          const result = await context.lsp8CompatibleERC721.isApprovedForAll(
            context.accounts.owner.address,
            context.accounts.anyone.address,
          );

          expect(result).to.be.false;
        });
      });
    });

    describe('when operator transfer tokenId', () => {
      [
        { tokenId: tokenIds[0] },
        { tokenId: tokenIds[1] },
        { tokenId: tokenIds[2] },
        { tokenId: tokenIds[3] },
        { tokenId: tokenIds[4] },
      ].forEach((testCase) => {
        describe(`for tokenId ${testCase.tokenId}:`, () => {
          it('should have transferred successfully with `transferFrom(...)` (changed token owner)', async () => {
            const sender = context.accounts.owner.address;
            const recipient = context.accounts.tokenReceiver.address;

            await context.lsp8CompatibleERC721
              .connect(context.accounts.operator)
              .transferFrom(sender, recipient, testCase.tokenId);

            const newTokenOwner = await context.lsp8CompatibleERC721.ownerOf(testCase.tokenId);
            expect(newTokenOwner).to.equal(context.accounts.tokenReceiver.address);
          });

          it('should have emitted a Transfer event', async () => {
            const sender = context.accounts.owner.address;
            const recipient = context.accounts.tokenReceiver.address;

            const tx = await context.lsp8CompatibleERC721
              .connect(context.accounts.operator)
              .transferFrom(sender, recipient, testCase.tokenId);

            expect(tx)
              .to.emit(context.lsp8CompatibleERC721, 'Transfer(address,address,uint256)')
              .withArgs(sender, recipient, testCase.tokenId);
          });

          it('should have cleared operators array', async () => {
            // add 3 x individual operators per tokenId to test if the operators array is cleared
            // once the tokenId has been transferred by operator that is approvedForAll
            // const operatorsPerTokenIds = getRandomAddresses(1);
            const operatorsPerTokenIdsBefore = [
              '0xcafecafecafecafecafecafecafecafecafecafe',
              '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
              '0xf00df00df00df00df00df00df00df00df00df00d',
            ];

            await context.lsp8CompatibleERC721
              .connect(context.accounts.owner)
              .approve(operatorsPerTokenIdsBefore[0], testCase.tokenId);

            await context.lsp8CompatibleERC721
              .connect(context.accounts.owner)
              .approve(operatorsPerTokenIdsBefore[1], testCase.tokenId);

            await context.lsp8CompatibleERC721
              .connect(context.accounts.owner)
              .approve(operatorsPerTokenIdsBefore[2], testCase.tokenId);

            const sender = context.accounts.owner.address;
            const recipient = context.accounts.tokenReceiver.address;

            await context.lsp8CompatibleERC721
              .connect(context.accounts.operator)
              .transferFrom(sender, recipient, testCase.tokenId);

            const operatorsForTokenIdAfter = await context.lsp8CompatibleERC721.getOperatorsOf(
              testCase.tokenId,
            );

            expect(operatorsForTokenIdAfter).to.deep.equal([]);
          });
        });
      });
    });

    describe('when calling setApprovalForAll with false (removing operator full approval)', () => {
      beforeEach(async () => {
        await context.lsp8CompatibleERC721
          .connect(context.accounts.owner)
          .setApprovalForAll(context.accounts.operator.address, false);
      });

      [
        { tokenId: tokenIds[0] },
        { tokenId: tokenIds[1] },
        { tokenId: tokenIds[2] },
        { tokenId: tokenIds[3] },
        { tokenId: tokenIds[4] },
      ].forEach((testCase) => {
        it('should return false when calling isApprovedForAll for operator', async () => {
          const result = await context.lsp8CompatibleERC721.isApprovedForAll(
            context.accounts.owner.address,
            context.accounts.operator.address,
          );

          expect(result).to.be.false;
        });

        it(`should revert when operator try to transfer tokenId ${testCase.tokenId} with transferFrom(...)`, async () => {
          const tokenIdAsBytes32 = ethers.utils.hexZeroPad(
            ethers.utils.hexValue(ethers.BigNumber.from(testCase.tokenId)),
            32,
          );

          await expect(
            context.lsp8CompatibleERC721
              .connect(context.accounts.operator)
              .transferFrom(
                context.accounts.owner.address,
                context.accounts.tokenReceiver.address,
                testCase.tokenId,
              ),
          )
            .to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8NotTokenOperator')
            .withArgs(tokenIdAsBytes32, context.accounts.operator.address);
        });
      });
    });
  });

  describe('getApproved', () => {
    describe('when tokenId has not been minted', () => {
      it('should revert', async () => {
        await expect(context.lsp8CompatibleERC721.getApproved(neverMintedTokenId))
          .to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8NonExistentTokenId')
          .withArgs(tokenIdAsBytes32(neverMintedTokenId));
      });
    });

    describe('when tokenId has been minted', () => {
      beforeEach(async () => {
        await context.lsp8CompatibleERC721.mint(
          context.accounts.owner.address,
          mintedTokenId,
          ethers.utils.toUtf8Bytes('mint a token for the owner'),
        );
      });

      describe('when there have been no approvals for the tokenId', () => {
        it('should return address(0)', async () => {
          expect(await context.lsp8CompatibleERC721.getApproved(mintedTokenId)).to.equal(
            ethers.constants.AddressZero,
          );
        });
      });

      describe('when one account has been approved for the tokenId', () => {
        it('should return the operator address', async () => {
          await context.lsp8CompatibleERC721.approve(
            context.accounts.operator.address,
            tokenIdAsBytes32(mintedTokenId),
          );

          expect(await context.lsp8CompatibleERC721.getApproved(mintedTokenId)).to.equal(
            context.accounts.operator.address,
          );
        });
      });

      describe('when many context.accounts have been approved for the tokenId', () => {
        it('should return the last new authorized operator', async () => {
          const operatorFirstAndThirdCall = context.accounts.operator.address;
          const operatorSecondCall = context.accounts.anotherOperator.address;

          await context.lsp8CompatibleERC721.approve(
            operatorFirstAndThirdCall,
            tokenIdAsBytes32(mintedTokenId),
          );
          await context.lsp8CompatibleERC721.approve(
            operatorSecondCall,
            tokenIdAsBytes32(mintedTokenId),
          );

          expect(await context.lsp8CompatibleERC721.getApproved(mintedTokenId)).to.equal(
            context.accounts.anotherOperator.address,
          );
        });
      });
    });
  });

  describe('mint', () => {
    describe('when a token is minted', () => {
      it('should have expected events', async () => {
        const txParams = {
          to: context.accounts.owner.address,
          tokenId: mintedTokenId,
          data: ethers.utils.toUtf8Bytes('mint a token for the owner'),
        };
        const operator = context.accounts.owner;

        const tx = await context.lsp8CompatibleERC721
          .connect(operator)
          .mint(txParams.to, txParams.tokenId, txParams.data);

        await expect(tx)
          .to.emit(
            context.lsp8CompatibleERC721,
            'Transfer(address,address,address,bytes32,bool,bytes)',
          )
          .withArgs(
            operator.address,
            ethers.constants.AddressZero,
            txParams.to,
            tokenIdAsBytes32(txParams.tokenId),
            true,
            ethers.utils.hexlify(txParams.data),
          );

        await expect(tx)
          .to.emit(context.lsp8CompatibleERC721, 'Transfer(address,address,uint256)')
          .withArgs(
            ethers.constants.AddressZero,
            txParams.to,
            ethers.BigNumber.from(txParams.tokenId),
          );
      });
    });
  });

  describe('burn', () => {
    describe('when a token is burned', () => {
      beforeEach(async () => {
        await context.lsp8CompatibleERC721.mint(
          context.accounts.owner.address,
          mintedTokenId,
          ethers.utils.toUtf8Bytes('mint a token for the owner'),
        );
      });

      it('should have expected events', async () => {
        const txParams = {
          tokenId: mintedTokenId,
          data: ethers.utils.toUtf8Bytes('burn a token from the owner'),
        };
        const operator = context.accounts.owner;

        const tx = await context.lsp8CompatibleERC721
          .connect(operator)
          .burn(txParams.tokenId, txParams.data);

        await expect(tx)
          .to.emit(
            context.lsp8CompatibleERC721,
            'Transfer(address,address,address,bytes32,bool,bytes)',
          )
          .withArgs(
            operator.address,
            operator.address,
            ethers.constants.AddressZero,
            tokenIdAsBytes32(txParams.tokenId),
            false,
            ethers.utils.hexlify(txParams.data),
          );
        await expect(tx)
          .to.emit(context.lsp8CompatibleERC721, 'Transfer(address,address,uint256)')
          .withArgs(
            operator.address,
            ethers.constants.AddressZero,
            ethers.BigNumber.from(txParams.tokenId),
          );
      });
    });
  });

  describe('transfers', () => {
    type TestDeployedContracts = {
      tokenReceiverWithLSP1: TokenReceiverWithLSP1;
      tokenReceiverWithoutLSP1: TokenReceiverWithoutLSP1;
      tokenReceiverWithLSP1WithoutERC721Receiver: TokenReceiverWithLSP1;
      tokenReceiverWithLSP1WithERC721ReceivedRevert: TokenReceiverWithLSP1WithERC721ReceivedRevert;
      tokenReceiverWithLSP1WithERC721ReceivedInvalid: TokenReceiverWithLSP1WithERC721ReceivedInvalid;
      tokenReceiverWithLSP1WithERC721Received: TokenReceiverWithLSP1WithERC721Received;
      tokenReceiverWithoutLSP1WithoutERC721Received: TokenReceiverWithoutLSP1;
      tokenReceiverWithoutLSP1WithERC721ReceivedRevert: TokenReceiverWithoutLSP1WithERC721ReceivedRevert;
      tokenReceiverWithoutLSP1WithERC721ReceivedInvalid: TokenReceiverWithoutLSP1WithERC721ReceivedInvalid;
      tokenReceiverWithoutLSP1WithERC721Received: TokenReceiverWithoutLSP1WithERC721Received;
    };
    let deployedContracts: TestDeployedContracts;

    beforeEach(async () => {
      // for `transfer` and `transferFrom` scenarios
      deployedContracts = {
        tokenReceiverWithLSP1: await new TokenReceiverWithLSP1__factory(
          context.accounts.owner,
        ).deploy(),
        tokenReceiverWithoutLSP1: await new TokenReceiverWithoutLSP1__factory(
          context.accounts.owner,
        ).deploy(),
        // for `safeTransferFrom` scenarios
        tokenReceiverWithLSP1WithoutERC721Receiver: await new TokenReceiverWithLSP1__factory(
          context.accounts.owner,
        ).deploy(),
        tokenReceiverWithLSP1WithERC721ReceivedRevert:
          await new TokenReceiverWithLSP1WithERC721ReceivedRevert__factory(
            context.accounts.owner,
          ).deploy(),
        tokenReceiverWithLSP1WithERC721ReceivedInvalid:
          await new TokenReceiverWithLSP1WithERC721ReceivedInvalid__factory(
            context.accounts.owner,
          ).deploy(),
        tokenReceiverWithLSP1WithERC721Received:
          await new TokenReceiverWithLSP1WithERC721Received__factory(
            context.accounts.owner,
          ).deploy(),
        tokenReceiverWithoutLSP1WithoutERC721Received: await new TokenReceiverWithoutLSP1__factory(
          context.accounts.owner,
        ).deploy(),
        tokenReceiverWithoutLSP1WithERC721ReceivedRevert:
          await new TokenReceiverWithoutLSP1WithERC721ReceivedRevert__factory(
            context.accounts.owner,
          ).deploy(),
        tokenReceiverWithoutLSP1WithERC721ReceivedInvalid:
          await new TokenReceiverWithoutLSP1WithERC721ReceivedInvalid__factory(
            context.accounts.owner,
          ).deploy(),
        tokenReceiverWithoutLSP1WithERC721Received:
          await new TokenReceiverWithoutLSP1WithERC721Received__factory(
            context.accounts.owner,
          ).deploy(),
      };

      // setup so we have a token to transfer
      await context.lsp8CompatibleERC721.mint(
        context.accounts.owner.address,
        mintedTokenId,
        ethers.utils.toUtf8Bytes('mint a token for the owner'),
      );

      // setup so we can observe approvals being cleared during transfer tests
      await context.lsp8CompatibleERC721.approve(context.accounts.operator.address, mintedTokenId);
    });

    type TransferTxParams = {
      operator: string;
      from: string;
      to: string;
      tokenId: BytesLike;
      data?: BytesLike;
    };

    const transferSuccessScenario = async (
      { operator, from, to, tokenId, data }: TransferTxParams,
      transferFn: string,
      force: boolean,
      expectedData: string,
    ) => {
      // pre-conditions
      const preOwnerOf = await context.lsp8CompatibleERC721.ownerOf(tokenId);
      expect(preOwnerOf).to.equal(from);

      // effect
      const txArgs = [from, to, tokenId];
      if (data) txArgs.push(data);

      const tx = await context.lsp8CompatibleERC721[transferFn](...txArgs);

      await expect(tx)
        .to.emit(
          context.lsp8CompatibleERC721,
          'Transfer(address,address,address,bytes32,bool,bytes)',
        )
        .withArgs(operator, from, to, tokenIdAsBytes32(tokenId), force, expectedData);

      await expect(tx)
        .to.emit(context.lsp8CompatibleERC721, 'Transfer(address,address,uint256)')
        .withArgs(from, to, ethers.BigNumber.from(tokenId));

      await expect(tx)
        .to.emit(context.lsp8CompatibleERC721, 'RevokedOperator')
        .withArgs(context.accounts.operator.address, from, tokenIdAsBytes32(tokenId), false, '0x');

      // post-conditions
      const postOwnerOf = await context.lsp8CompatibleERC721.ownerOf(tokenId);
      expect(postOwnerOf).to.equal(to);
    };

    describe('transferFrom', () => {
      const transferFn = 'transferFrom';
      const force = true;
      const expectedData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(''));

      describe('when the from address is the tokenId owner', () => {
        describe('when `to` is an EOA', () => {
          it('should allow transfering the tokenId', async () => {
            const txParams = {
              operator: context.accounts.owner.address,
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              tokenId: mintedTokenId,
            };

            await transferSuccessScenario(txParams, transferFn, force, expectedData);
          });
        });

        describe('when `to` is a contract', () => {
          describe('when receiving contract supports LSP1', () => {
            it('should allow transfering the tokenId', async () => {
              const txParams = {
                operator: context.accounts.owner.address,
                from: context.accounts.owner.address,
                to: deployedContracts.tokenReceiverWithLSP1.address,
                tokenId: mintedTokenId,
              };

              await transferSuccessScenario(txParams, transferFn, force, expectedData);
            });
          });

          describe('when receiving contract does not support LSP1', () => {
            it('should allow transfering the tokenId', async () => {
              const txParams = {
                operator: context.accounts.owner.address,
                from: context.accounts.owner.address,
                to: deployedContracts.tokenReceiverWithoutLSP1.address,
                tokenId: mintedTokenId,
              };

              await transferSuccessScenario(txParams, transferFn, force, expectedData);
            });
          });
        });
      });

      describe('when the from address is not the tokenId owner', () => {
        it('should revert', async () => {
          const txParams = {
            operator: context.accounts.owner.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
          };

          // pre-conditions
          const preOwnerOf = await context.lsp8CompatibleERC721.ownerOf(txParams.tokenId);

          await expect(
            context.lsp8CompatibleERC721[transferFn](txParams.from, txParams.to, txParams.tokenId),
          )
            .to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8NotTokenOwner')
            .withArgs(
              context.accounts.owner.address,
              tokenIdAsBytes32(txParams.tokenId).toString(),
              txParams.from,
            );

          // post-conditions
          const postOwnerOf = await context.lsp8CompatibleERC721.ownerOf(txParams.tokenId);
          expect(postOwnerOf).to.equal(preOwnerOf);
        });
      });
    });

    describe('safeTransferFrom(address,address,uint256)', () => {
      const transferFn = 'safeTransferFrom(address,address,uint256)';

      describe('when the from address is the tokenId owner', () => {
        describe('when `to` is an EOA', () => {
          it('should pass', async () => {
            const txParams = {
              operator: context.accounts.owner.address,
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              tokenId: mintedTokenId,
            };

            await transferSuccessScenario(txParams, transferFn, true, '0x');
          });
        });

        describe('when `to` is a contract', () => {
          describe('when the receiving contract supports LSP1', () => {
            describe('when the receiving contract does not implement `onERC721Received`', () => {
              it('should fail and revert', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1WithoutERC721Receiver.address,
                  tokenId: mintedTokenId,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.reverted;
              });
            });

            describe('when the receiving contract implements `onERC721Received`', () => {
              it('should fail if the `onERC721Received` function reverts + bubble up the error', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1WithERC721ReceivedRevert.address,
                  tokenId: mintedTokenId,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.revertedWith(
                  'TokenReceiverWithLSP1WithERC721ReceivedRevert: transfer rejected',
                );
              });

              it('should fail and revert if the `onERC721Received` function does not returns the correct bytes4 magic value', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1WithERC721ReceivedInvalid.address,
                  tokenId: mintedTokenId,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.revertedWith(
                  'LSP8CompatibleERC721: transfer to non ERC721Receiver implementer',
                );
              });

              it('should pass if the `onERC721Received` function returns the correct bytes4 magic value', async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1WithERC721Received.address,
                  tokenId: mintedTokenId,
                };

                await transferSuccessScenario(txParams, transferFn, true, '0x');
              });
            });
          });

          describe('when the receiving contract does not support LSP1', () => {
            describe('when the receiving contract does not implement `onERC721Received`', () => {
              it('should fail and revert', async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1WithoutERC721Received.address,
                  tokenId: mintedTokenId,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.reverted;
              });
            });

            describe('when the receiving contract implements `onERC721Received`', () => {
              it('should fail if the `onERC721Received` function reverts + bubble up the error', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1WithERC721ReceivedRevert.address,
                  tokenId: mintedTokenId,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.revertedWith(
                  'TokenReceiverWithLSP1WithERC721ReceivedRevert: transfer rejected',
                );
              });

              it('should fail and revert if the `onERC721Received` function does not returns the correct bytes4 magic value', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1WithERC721ReceivedInvalid.address,
                  tokenId: mintedTokenId,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.revertedWith(
                  'LSP8CompatibleERC721: transfer to non ERC721Receiver implementer',
                );
              });

              it('should pass if the `onERC721Received` function returns the correct bytes4 magic value', async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1WithERC721Received.address,
                  tokenId: mintedTokenId,
                };

                await transferSuccessScenario(txParams, transferFn, true, '0x');
              });
            });
          });
        });
      });

      describe('when the from address is not the tokenId owner', () => {
        it('should revert', async () => {
          const txParams = {
            operator: context.accounts.owner.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
          };

          // pre-conditions
          const preOwnerOf = await context.lsp8CompatibleERC721.ownerOf(txParams.tokenId);

          await expect(
            context.lsp8CompatibleERC721[transferFn](txParams.from, txParams.to, txParams.tokenId),
          )
            .to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8NotTokenOwner')
            .withArgs(
              context.accounts.owner.address,
              tokenIdAsBytes32(txParams.tokenId).toString(),
              txParams.from,
            );

          // post-conditions
          const postOwnerOf = await context.lsp8CompatibleERC721.ownerOf(txParams.tokenId);
          expect(postOwnerOf).to.equal(preOwnerOf);
        });
      });
    });

    describe('safeTransferFrom(address,address,uint256,bytes)', () => {
      const transferFn = 'safeTransferFrom(address,address,uint256,bytes)';
      const expectedData = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(`custom-data-${Date.now()}`),
      );

      describe('when the from address is the tokenId owner', () => {
        describe('when `to` is an EOA', () => {
          it('should pass', async () => {
            const txParams = {
              operator: context.accounts.owner.address,
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              tokenId: mintedTokenId,
              data: expectedData,
            };

            await transferSuccessScenario(txParams, transferFn, true, expectedData);
          });
        });

        describe('when `to` is a contract', () => {
          describe('when the receiving contract supports LSP1', () => {
            describe('when the receiving contract does not implement `onERC721Received`', () => {
              it('should fail and revert', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1WithoutERC721Receiver.address,
                  tokenId: mintedTokenId,
                  data: expectedData,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.reverted;
              });
            });

            describe('when the receiving contract implements `onERC721Received`', () => {
              it('should fail if the `onERC721Received` function reverts + bubble up the error', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1WithERC721ReceivedRevert.address,
                  tokenId: mintedTokenId,
                  data: expectedData,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.revertedWith(
                  'TokenReceiverWithLSP1WithERC721ReceivedRevert: transfer rejected',
                );
              });

              it('should fail and revert if the `onERC721Received` function does not returns the correct bytes4 magic value', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1WithERC721ReceivedInvalid.address,
                  tokenId: mintedTokenId,
                  data: expectedData,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.revertedWith(
                  'LSP8CompatibleERC721: transfer to non ERC721Receiver implementer',
                );
              });

              it('should pass if the `onERC721Received` function returns the correct bytes4 magic value', async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1WithERC721Received.address,
                  tokenId: mintedTokenId,
                  data: expectedData,
                };

                await transferSuccessScenario(txParams, transferFn, true, expectedData);
              });
            });
          });

          describe('when the receiving contract does not support LSP1', () => {
            describe('when the receiving contract does not implement `onERC721Received`', () => {
              it('should fail and revert', async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1WithoutERC721Received.address,
                  tokenId: mintedTokenId,
                  data: expectedData,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.reverted;
              });
            });

            describe('when the receiving contract implements `onERC721Received`', () => {
              it('should fail if the `onERC721Received` function reverts + bubble up the error', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1WithERC721ReceivedRevert.address,
                  tokenId: mintedTokenId,
                  data: expectedData,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.revertedWith(
                  'TokenReceiverWithLSP1WithERC721ReceivedRevert: transfer rejected',
                );
              });

              it('should fail and revert if the `onERC721Received` function does not returns the correct bytes4 magic value', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1WithERC721ReceivedInvalid.address,
                  tokenId: mintedTokenId,
                  data: expectedData,
                };

                await expect(
                  context.lsp8CompatibleERC721['safeTransferFrom(address,address,uint256)'](
                    txParams.from,
                    txParams.to,
                    txParams.tokenId,
                  ),
                ).to.be.revertedWith(
                  'LSP8CompatibleERC721: transfer to non ERC721Receiver implementer',
                );
              });

              it('should pass if the `onERC721Received` function returns the correct bytes4 magic value', async () => {
                const txParams = {
                  operator: context.accounts.owner.address,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1WithERC721Received.address,
                  tokenId: mintedTokenId,
                  data: expectedData,
                };

                await transferSuccessScenario(txParams, transferFn, true, expectedData);
              });
            });
          });
        });
      });

      describe('when the from address is not the tokenId owner', () => {
        it('should revert', async () => {
          const txParams = {
            operator: context.accounts.owner.address,
            from: context.accounts.anyone.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            tokenId: mintedTokenId,
            data: expectedData,
          };

          // pre-conditions
          const preOwnerOf = await context.lsp8CompatibleERC721.ownerOf(txParams.tokenId);

          await expect(
            context.lsp8CompatibleERC721[transferFn](
              txParams.from,
              txParams.to,
              txParams.tokenId,
              txParams.data,
            ),
          )
            .to.be.revertedWithCustomError(context.lsp8CompatibleERC721, 'LSP8NotTokenOwner')
            .withArgs(
              context.accounts.owner.address,
              tokenIdAsBytes32(txParams.tokenId).toString(),
              txParams.from,
            );

          // post-conditions
          const postOwnerOf = await context.lsp8CompatibleERC721.ownerOf(txParams.tokenId);
          expect(postOwnerOf).to.equal(preOwnerOf);
        });
      });
    });
  });
};

export type LSP8InitializeTestContext = {
  lsp8CompatibleERC721: LSP8CompatibleERC721Tester;
  initializeTransaction: TransactionResponse;
  deployParams: LSP8CompatibleERC721DeployParams;
};

export const shouldInitializeLikeLSP8CompatibleERC721 = (
  buildContext: () => Promise<LSP8InitializeTestContext>,
) => {
  let context: LSP8InitializeTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('should support ERC721 interface', async () => {
      expect(await context.lsp8CompatibleERC721.supportsInterface(INTERFACE_IDS.ERC721)).to.be.true;
    });

    it('should support ERC721Metadata interface', async () => {
      expect(await context.lsp8CompatibleERC721.supportsInterface(INTERFACE_IDS.ERC721Metadata)).to
        .be.true;
    });

    it('should support LSP8 interface', async () => {
      expect(
        await context.lsp8CompatibleERC721.supportsInterface(
          INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
        ),
      ).to.be.true;
    });

    it('should have set expected entries with ERC725Y.setData', async () => {
      await expect(context.initializeTransaction)
        .to.emit(context.lsp8CompatibleERC721, 'DataChanged')
        .withArgs(
          SupportedStandards.LSP4DigitalAsset.key,
          SupportedStandards.LSP4DigitalAsset.value,
        );
      expect(
        await context.lsp8CompatibleERC721.getData(SupportedStandards.LSP4DigitalAsset.key),
      ).to.equal(SupportedStandards.LSP4DigitalAsset.value);

      const nameKey = ERC725YDataKeys.LSP4['LSP4TokenName'];
      const expectedNameValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.name),
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp8CompatibleERC721, 'DataChanged')
        .withArgs(nameKey, expectedNameValue);
      expect(await context.lsp8CompatibleERC721.getData(nameKey)).to.equal(expectedNameValue);

      const symbolKey = ERC725YDataKeys.LSP4['LSP4TokenSymbol'];
      const expectedSymbolValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.symbol),
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp8CompatibleERC721, 'DataChanged')
        .withArgs(symbolKey, expectedSymbolValue);
      expect(await context.lsp8CompatibleERC721.getData(symbolKey)).to.equal(expectedSymbolValue);
    });

    describe('when using the functions from IERC721Metadata', () => {
      it('should allow reading `name()`', async () => {
        // using compatibility getter -> returns(string)
        const nameAsString = await context.lsp8CompatibleERC721.name();
        expect(nameAsString).to.equal(context.deployParams.name);

        // using getData -> returns(bytes)
        const nameAsBytes = await context.lsp8CompatibleERC721.getData(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('LSP4TokenName')),
        );

        expect(ethers.utils.toUtf8String(nameAsBytes)).to.equal(context.deployParams.name);
      });

      it('should allow reading `symbol()`', async () => {
        // using compatibility getter -> returns(string)
        const symbolAsString = await context.lsp8CompatibleERC721.symbol();
        expect(symbolAsString).to.equal(context.deployParams.symbol);

        // using getData -> returns(bytes)
        const symbolAsBytes = await context.lsp8CompatibleERC721.getData(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('LSP4TokenSymbol')),
        );

        expect(ethers.utils.toUtf8String(symbolAsBytes)).to.equal(context.deployParams.symbol);
      });
    });
  });
};
