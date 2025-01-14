import { ethers } from 'hardhat';
import { assert, expect } from 'chai';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { toBigInt, type BytesLike, type ContractTransactionResponse } from 'ethers';

// types
import {
  LSP7Tester,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
  UniversalReceiverDelegateRevert,
  UniversalReceiverDelegateRevert__factory,
  TokenReceiverWithLSP1Revert,
  TokenReceiverWithLSP1Revert__factory,
  LSP7DigitalAsset,
} from '../../typechain';

// constants
import { ERC725YDataKeys, INTERFACE_IDS, LSP1_TYPE_IDS, SupportedStandards } from '../../constants';

import { abiCoder } from '../utils/helpers';
import { AddressZero } from '../LSP17Extensions/helpers/utils';
import { build } from 'unbuild';

export type LSP7TestAccounts = {
  owner: SignerWithAddress;

  tokenReceiver: SignerWithAddress;
  anotherTokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  operatorWithLowAuthorizedAmount: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7TestAccounts> => {
  const [
    owner,
    tokenReceiver,
    anotherTokenReceiver,
    operator,
    operatorWithLowAuthorizedAmount,
    anyone,
  ] = await ethers.getSigners();
  return {
    owner,
    tokenReceiver,
    anotherTokenReceiver,
    operator,
    operatorWithLowAuthorizedAmount,
    anyone,
  };
};

export type LSP7DeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  lsp4TokenType?: number;
};

export type LSP7TestContext = {
  accounts: LSP7TestAccounts;
  lsp7: LSP7Tester;
  deployParams: LSP7DeployParams;
  initialSupply: bigint;
};

export type ExpectedError = {
  error: string;
  args: string[];
};

export const shouldBehaveLikeLSP7 = (buildContext: () => Promise<LSP7TestContext>) => {
  let context: LSP7TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe('when minting tokens', () => {
    describe('when `amount == 0`', () => {
      it('should revert if `force == false`', async () => {
        const txParams = {
          to: context.accounts.anotherTokenReceiver.address,
          amount: 0,
          force: false,
          data: '0x',
        };

        await expect(
          context.lsp7
            .connect(context.accounts.anyone)
            .mint(txParams.to, txParams.amount, txParams.force, txParams.data),
        )
          .to.be.revertedWithCustomError(context.lsp7, 'LSP7NotifyTokenReceiverIsEOA')
          .withArgs(txParams.to);
      });

      it('should pass if `force == true`', async () => {
        const txParams = {
          to: context.accounts.anotherTokenReceiver.address,
          amount: 0,
          force: true,
          data: '0x',
        };

        await expect(
          context.lsp7
            .connect(context.accounts.anyone)
            .mint(txParams.to, txParams.amount, txParams.force, txParams.data),
        )
          .to.emit(context.lsp7, 'Transfer')
          .withArgs(
            context.accounts.anyone.address,
            ethers.ZeroAddress,
            txParams.to,
            txParams.amount,
            txParams.force,
            txParams.data,
          );
      });
    });

    describe('when `to` is the zero address', () => {
      it('should revert', async () => {
        const txParams = {
          to: ethers.ZeroAddress,
          amount: ethers.toBigInt('1'),
          force: true,
          data: '0x',
        };

        await expect(
          context.lsp7.mint(txParams.to, txParams.amount, txParams.force, txParams.data),
        ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotSendWithAddressZero');
      });
    });

    describe('when `to` is not the zero address', () => {
      it('should mint the token amount', async () => {
        const txParams = {
          to: context.accounts.tokenReceiver.address,
          amount: ethers.toBigInt('1'),
          force: true,
          data: ethers.toUtf8Bytes('we need more tokens'),
        };

        // pre-conditions
        const preBalanceOf = await context.lsp7.balanceOf(txParams.to);

        // effects
        await context.lsp7.mint(txParams.to, txParams.amount, txParams.force, txParams.data);

        // post-conditions
        const postBalanceOf = await context.lsp7.balanceOf(txParams.to);
        expect(postBalanceOf).to.equal(preBalanceOf + txParams.amount);
      });
    });
  });

  describe('when tokens have been minted', () => {
    describe('totalSupply', () => {
      it('should return total token supply', async () => {
        expect(await context.lsp7.totalSupply()).to.equal(context.initialSupply);
      });
    });

    describe('balanceOf', () => {
      describe('when the given address owns tokens', () => {
        it('should return the owned token count', async () => {
          expect(await context.lsp7.balanceOf(context.accounts.owner.address)).to.equal(
            context.initialSupply,
          );
        });
      });

      describe('when the given address does not own tokens', () => {
        it('should return zero', async () => {
          expect(await context.lsp7.balanceOf(context.accounts.anyone.address)).to.equal(
            ethers.ZeroAddress,
          );
        });
      });
    });

    describe('decimals', () => {
      it('should return 18 as default value', async () => {
        expect(await context.lsp7.decimals()).to.equal(18);
      });
    });

    describe('authorizeOperator', () => {
      describe('without sending data', () => {
        describe('when operator is not the zero address', () => {
          it('should succeed', async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;
            const amount = context.initialSupply;

            const tx = await context.lsp7.authorizeOperator(operator, amount, '0x');

            await expect(tx)
              .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
              .withArgs(operator, tokenOwner, amount, '0x');

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
          });

          describe('when operator is already authorized', () => {
            beforeEach(async () => {
              await context.lsp7.authorizeOperator(
                context.accounts.operator.address,
                context.initialSupply,
                '0x',
              );
            });

            it('should succeed', async () => {
              const operator = context.accounts.operator.address;
              const tokenOwner = context.accounts.owner.address;
              const amount = context.initialSupply + BigInt(1);

              await context.lsp7.authorizeOperator(operator, amount, '0x');

              const tx = await context.lsp7.authorizeOperator(operator, amount, '0x');

              await expect(tx)
                .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
                .withArgs(operator, tokenOwner, amount, '0x');

              expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
            });

            it('should add the operator to the list of operators', async () => {
              const operator = context.accounts.operator.address;
              const tokenOwner = context.accounts.owner.address;

              expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([operator]);
            });
          });
        });

        describe('when operator is the zero address', () => {
          it('should revert', async () => {
            const operator = ethers.ZeroAddress;

            await expect(
              context.lsp7.authorizeOperator(operator, context.initialSupply, '0x'),
            ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotUseAddressZeroAsOperator');
          });
        });

        describe('when operator is the token owner', () => {
          it('should revert', async () => {
            const operator = context.accounts.owner.address;

            await expect(
              context.lsp7.authorizeOperator(operator, context.initialSupply, '0x'),
            ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenOwnerCannotBeOperator');
          });
        });
      });

      describe('with sending data and notifying an LSP1 contract', () => {
        it('should succeed and inform the operator', async () => {
          const tokenReceiverWithLSP1: TokenReceiverWithLSP1 =
            await new TokenReceiverWithLSP1__factory(context.accounts.owner).deploy();
          const operator = await tokenReceiverWithLSP1.getAddress();
          const tokenOwner = context.accounts.owner.address;
          const amount = context.initialSupply;

          const tx = await context.lsp7.authorizeOperator(operator, amount, '0xaabbccdd', {
            gasLimit: 2000000,
          });

          await expect(tx)
            .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
            .withArgs(operator, tokenOwner, amount, '0xaabbccdd');

          await expect(tx).to.emit(tokenReceiverWithLSP1, 'UniversalReceiver');

          expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
        });

        it('should succeed and inform the operator even if the operator revert', async () => {
          const operatorThatReverts: UniversalReceiverDelegateRevert =
            await new UniversalReceiverDelegateRevert__factory(context.accounts.owner).deploy();
          const operator = await operatorThatReverts.getAddress();
          const tokenOwner = context.accounts.owner.address;
          const amount = context.initialSupply;

          const tx = await context.lsp7.authorizeOperator(operator, amount, '0xaabbccdd');

          await expect(tx)
            .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
            .withArgs(operator, tokenOwner, amount, '0xaabbccdd');

          expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
        });
      });
    });

    describe('increaseAllowance', () => {
      beforeEach(async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        const tx = await context.lsp7.authorizeOperator(operator, amount, '0x');

        await expect(tx)
          .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
          .withArgs(operator, tokenOwner, amount, '0x');

        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
      });

      describe('when the sender has enough balance (more than the `addedAmount` to add for the operator)', () => {
        const addedAmount = ethers.toBigInt('1');

        beforeEach('pre-checks', async () => {
          const senderBalance = await context.lsp7.balanceOf(context.accounts.owner.address);

          expect(senderBalance).to.be.greaterThanOrEqual(addedAmount);
        });

        describe('when there was no allowance before for the operator (`authorizedAmountFor` operator = 0)', () => {
          it('should revert', async () => {
            const newOperator = context.accounts.anyone.address;

            await expect(context.lsp7.increaseAllowance(newOperator, addedAmount, '0x'))
              .to.be.revertedWithCustomError(
                context.lsp7,
                'OperatorAllowanceCannotBeIncreasedFromZero',
              )
              .withArgs(newOperator);
          });
        });

        describe('when there was an allowance for the operator already (`authorizedAmountFor` operator > 0)', () => {
          it("should increase the operator's allowance by the `addedAmount`", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const allowanceBefore = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const expectedNewAllowance = allowanceBefore + addedAmount;

            const tx = await context.lsp7.increaseAllowance(operator, addedAmount, '0x');

            await expect(tx)
              .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
              .withArgs(operator, tokenOwner, expectedNewAllowance, '0x');

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              expectedNewAllowance,
            );
          });

          it('should not duplicate the existing operator in the list of operators', async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([operator]);
          });
        });
      });

      describe('when the sender does not have enough balance (less than the `addedAmount` to add for the operator)', () => {
        let addedAmountLargerThanBalance: bigint;

        beforeEach('set `addedAmount` larger than balance', async () => {
          const senderBalance = await context.lsp7.balanceOf(context.accounts.owner.address);

          addedAmountLargerThanBalance = senderBalance + BigInt(5);
        });

        describe('when there was no authorized amount before for the operator (`authorizedAmountFor` operator = 0)', () => {
          it('should revert', async () => {
            const operator = context.accounts.anyone.address;

            await expect(
              context.lsp7.increaseAllowance(operator, addedAmountLargerThanBalance, '0x'),
            )
              .to.be.revertedWithCustomError(
                context.lsp7,
                'OperatorAllowanceCannotBeIncreasedFromZero',
              )
              .withArgs(operator);
          });
        });

        describe('when there was an authorized amount for the operator already (`authorizedAmountFor` operator > 0)', () => {
          it("should increase the operator's allowance by the `addedAmount`", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const allowanceBefore = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const expectedNewAllowance = allowanceBefore + addedAmountLargerThanBalance;

            const tx = await context.lsp7.increaseAllowance(
              operator,
              addedAmountLargerThanBalance,
              '0x',
            );

            await expect(tx)
              .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
              .withArgs(operator, tokenOwner, expectedNewAllowance, '0x');

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              expectedNewAllowance,
            );
          });
        });
      });

      describe('when `operator` param is `msg.sender`', () => {
        it('should revert', async () => {
          const addedAmount = ethers.toBigInt('1');

          await expect(
            context.lsp7.increaseAllowance(context.accounts.owner.address, addedAmount, '0x'),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenOwnerCannotBeOperator');
        });
      });
    });

    describe('decreaseAllowance', () => {
      beforeEach(async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        const tx = await context.lsp7.authorizeOperator(operator, amount, '0x');

        await expect(tx)
          .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
          .withArgs(operator, tokenOwner, amount, '0x');

        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
      });

      describe('when `operator` param is the zero address', () => {
        it('should revert', async () => {
          const tokenOwner = context.accounts.owner.address;
          const subtractedAmount = toBigInt(1);

          await expect(
            context.lsp7.decreaseAllowance(AddressZero, tokenOwner, subtractedAmount, '0x'),
          ).to.be.revertedWithCustomError(
            context.lsp7,
            // Since we can never grant allowance for address(0), address(0) will always have 0 allowance
            // and this error message will always be thrown first
            'LSP7DecreasedAllowanceBelowZero',
          );
        });
      });

      describe('when there was no allowance before for the operator', () => {
        it('should revert', async () => {
          const operator = context.accounts.anyone.address;
          const tokenOwner = context.accounts.owner.address;

          const authorizedAmountFor = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

          const subtractedAmount = authorizedAmountFor + BigInt(1);

          await expect(
            context.lsp7.decreaseAllowance(tokenOwner, operator, subtractedAmount, '0x'),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7DecreasedAllowanceBelowZero');
        });
      });

      describe('when there was an allowance before for the operator', () => {
        describe("when decreasing the operator's allowance by an amount smaller than the full allowance", () => {
          it("should decrease the operator's allowance by the `subtractedAmount` + emit `OperatorAuthorizationChanged` event", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const subtractedAmount = ethers.toBigInt('1');

            const allowanceBefore = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const tx = await context.lsp7.decreaseAllowance(
              operator,
              tokenOwner,
              subtractedAmount,
              '0x',
            );

            const expectedNewAllowance = allowanceBefore - subtractedAmount;

            await expect(tx)
              .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
              .withArgs(operator, tokenOwner, expectedNewAllowance, '0x');

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              expectedNewAllowance,
            );
          });
        });

        describe('when the operator decrease his allowance by an amount smaller than the full allowance', () => {
          it("should decrease the operator's allowance by the `subtractedAmount` + emit `OperatorAuthorizationChanged` event", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const subtractedAmount = toBigInt(1);

            const allowanceBefore = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const tx = await context.lsp7
              .connect(context.accounts.operator)
              .decreaseAllowance(operator, tokenOwner, subtractedAmount, '0x');

            const expectedNewAllowance = allowanceBefore - subtractedAmount;

            await expect(tx)
              .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
              .withArgs(operator, tokenOwner, expectedNewAllowance, '0x');

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              expectedNewAllowance,
            );
          });
        });

        describe("when decreasing the operator's allowance by the full allowance", () => {
          it("should set the operator's allowance to zero + emit `OperatorRevoked` event", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const operatorAllowance = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const tx = await context.lsp7.decreaseAllowance(
              operator,
              tokenOwner,
              operatorAllowance,
              '0x',
            );

            const expectedNewAllowance = 0;

            await expect(tx)
              .to.emit(context.lsp7, 'OperatorRevoked')
              .withArgs(operator, tokenOwner, true, '0x');

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              expectedNewAllowance,
            );
          });
        });
      });

      describe('when `operator` param is `msg.sender`', () => {
        it('should revert', async () => {
          const tokenOwner = context.accounts.owner.address;
          const subtractedAmount = ethers.toBigInt('1');

          await expect(
            context.lsp7.decreaseAllowance(
              context.accounts.owner.address,
              tokenOwner,
              subtractedAmount,
              '0x',
            ),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenOwnerCannotBeOperator');
        });
      });

      describe('when decreasing the operator allowance by an amount larger than the current allowance', () => {
        it('should revert', async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;

          const authorizedAmountFor = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

          const subtractedAmountLargerThanAllowance = authorizedAmountFor + BigInt(5);

          await expect(
            context.lsp7.decreaseAllowance(
              operator,
              tokenOwner,
              subtractedAmountLargerThanAllowance,
              '0x',
            ),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7DecreasedAllowanceBelowZero');
        });
      });
    });
  });

  describe('revokeOperator', () => {
    describe('when operator is not the zero address', () => {
      it('should succeed', async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        // pre-conditions
        await context.lsp7.authorizeOperator(operator, amount, '0x');
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);

        // effects
        const tx = await context.lsp7.revokeOperator(operator, tokenOwner, false, '0x');
        await expect(tx)
          .to.emit(context.lsp7, 'OperatorRevoked')
          .withArgs(operator, tokenOwner, false, '0x');

        // post-conditions
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
          ethers.ZeroAddress,
        );
      });

      it('should remove operator from list of operators', async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        // pre-conditions
        await context.lsp7.authorizeOperator(operator, amount, '0x');
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);

        expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([operator]);

        // effects
        const tx = await context.lsp7.revokeOperator(operator, tokenOwner, false, '0x');
        await expect(tx)
          .to.emit(context.lsp7, 'OperatorRevoked')
          .withArgs(operator, tokenOwner, false, '0x');

        // post-conditions
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(0);

        expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([]);
      });

      it('operator can remove himself from list of operators', async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        // pre-conditions
        await context.lsp7.authorizeOperator(operator, amount, '0x');
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);

        expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([operator]);

        // effects
        const tx = await context.lsp7
          .connect(context.accounts.operator)
          .revokeOperator(operator, tokenOwner, false, '0x');

        await expect(tx)
          .to.emit(context.lsp7, 'OperatorRevoked')
          .withArgs(operator, tokenOwner, false, '0x');

        // post-conditions
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(0);

        expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([]);
      });
    });
  });

  describe('when operator is the zero address', () => {
    it('should revert', async () => {
      const tokenOwner = context.accounts.owner.address;
      const operator = ethers.ZeroAddress;

      await expect(
        context.lsp7.revokeOperator(operator, tokenOwner, false, '0x'),
      ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotUseAddressZeroAsOperator');
    });
  });

  describe('when operator is the token owner', () => {
    it('should revert', async () => {
      const operator = context.accounts.owner.address;

      await expect(
        context.lsp7.revokeOperator(operator, operator, false, '0x'),
      ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenOwnerCannotBeOperator');
    });
  });

  describe('with sending data and notifying an LSP1 contract', () => {
    it('should succeed and inform the operator', async () => {
      const tokenReceiverWithLSP1: TokenReceiverWithLSP1 = await new TokenReceiverWithLSP1__factory(
        context.accounts.owner,
      ).deploy();
      const operator = await tokenReceiverWithLSP1.getAddress();
      const tokenOwner = context.accounts.owner.address;

      const tx = await context.lsp7.revokeOperator(operator, tokenOwner, true, '0xaabbccdd', {
        gasLimit: 2000000,
      });

      await expect(tx)
        .to.emit(context.lsp7, 'OperatorRevoked')
        .withArgs(operator, tokenOwner, true, '0xaabbccdd');

      await expect(tx).to.emit(tokenReceiverWithLSP1, 'UniversalReceiver');

      expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
        ethers.ZeroAddress,
      );
    });

    it('should inform the operator and revert when the operator universalReceiver revert', async () => {
      const operatorThatReverts: TokenReceiverWithLSP1Revert =
        await new TokenReceiverWithLSP1Revert__factory(context.accounts.owner).deploy();

      const tokenOwner = context.accounts.owner.address;
      const operator = await operatorThatReverts.getAddress();

      await context.lsp7.authorizeOperator(operator, 1, '0x');

      await operatorThatReverts.addLSP1Support();

      await expect(
        context.lsp7.revokeOperator(operator, tokenOwner, true, '0xaabbccdd'),
      ).to.be.revertedWith('I reverted');
    });

    it('should inform the operator and revert when the operator universalReceiver revert', async () => {
      const operatorThatReverts: TokenReceiverWithLSP1Revert =
        await new TokenReceiverWithLSP1Revert__factory(context.accounts.owner).deploy();

      const tokenOwner = context.accounts.owner.address;
      const operator = await operatorThatReverts.getAddress();

      await context.lsp7.authorizeOperator(operator, 1, '0x');

      await operatorThatReverts.addLSP1Support();

      await expect(context.lsp7.revokeOperator(operator, tokenOwner, false, '0xaabbccdd')).to.emit(
        context.lsp7,
        'OperatorRevoked',
      );
    });
  });

  describe('authorizedAmountFor', () => {
    describe('when operator is the token owner', () => {
      it('should return the balance of the token owner', async () => {
        expect(
          await context.lsp7.authorizedAmountFor(
            context.accounts.owner.address,
            context.accounts.owner.address,
          ),
        ).to.equal(await context.lsp7.balanceOf(context.accounts.owner.address));
      });
    });

    describe('when operator has not been authorized', () => {
      it('should return zero', async () => {
        expect(
          await context.lsp7.authorizedAmountFor(
            context.accounts.operator.address,
            context.accounts.owner.address,
          ),
        ).to.equal(ethers.ZeroAddress);
      });
    });

    describe('when one account have been authorized', () => {
      it('should return the authorized amount', async () => {
        await context.lsp7.authorizeOperator(
          context.accounts.operator.address,
          context.initialSupply,
          '0x',
        );

        expect(
          await context.lsp7.authorizedAmountFor(
            context.accounts.operator.address,
            context.accounts.owner.address,
          ),
        ).to.equal(context.initialSupply);
      });
    });

    describe('when many accounts have been authorized', () => {
      it('should return the authorized amount for each operator', async () => {
        await context.lsp7.authorizeOperator(
          context.accounts.operator.address,
          context.initialSupply,
          '0x',
        );
        await context.lsp7.authorizeOperator(
          context.accounts.operatorWithLowAuthorizedAmount.address,
          ethers.toBigInt('1'),
          '0x',
        );

        expect(
          await context.lsp7.authorizedAmountFor(
            context.accounts.operator.address,
            context.accounts.owner.address,
          ),
        ).to.equal(context.initialSupply);

        expect(
          await context.lsp7.authorizedAmountFor(
            context.accounts.operatorWithLowAuthorizedAmount.address,
            context.accounts.owner.address,
          ),
        ).to.equal(1);
      });
    });
  });

  describe('transfers', () => {
    type HelperContracts = {
      tokenReceiverWithLSP1: TokenReceiverWithLSP1;
      tokenReceiverWithoutLSP1: TokenReceiverWithoutLSP1;
    };
    let helperContracts: HelperContracts;

    beforeEach(async () => {
      helperContracts = {
        tokenReceiverWithLSP1: await new TokenReceiverWithLSP1__factory(
          context.accounts.owner,
        ).deploy(),
        tokenReceiverWithoutLSP1: await new TokenReceiverWithoutLSP1__factory(
          context.accounts.owner,
        ).deploy(),
      };
    });

    beforeEach(async () => {
      // setup so we can observe operator amounts during transfer tests
      await context.lsp7.authorizeOperator(
        context.accounts.operator.address,
        context.initialSupply,
        '0x',
      );
      await context.lsp7.authorizeOperator(
        context.accounts.operatorWithLowAuthorizedAmount.address,
        ethers.toBigInt('1'),
        '0x',
      );
    });

    describe('transfer', () => {
      type TransferTxParams = {
        from: string;
        to: string;
        amount: bigint;
        force: boolean;
        data: string;
      };

      const transferSuccessScenario = async (
        { from, to, amount, force, data }: TransferTxParams,
        operator: SignerWithAddress,
      ) => {
        // pre-conditions
        const preFromBalanceOf = await context.lsp7.balanceOf(from);
        const preToBalanceOf = await context.lsp7.balanceOf(to);
        const preIsOperatorFor = await context.lsp7.authorizedAmountFor(operator.address, from);

        // effect
        const tx = await context.lsp7.connect(operator).transfer(from, to, amount, force, data);
        await expect(tx)
          .to.emit(context.lsp7, 'Transfer')
          .withArgs(operator.address, from, to, amount, force, data);

        // post-conditions
        const postFromBalanceOf = await context.lsp7.balanceOf(from);
        expect(postFromBalanceOf).to.equal(preFromBalanceOf - amount);

        const postToBalanceOf = await context.lsp7.balanceOf(to);
        expect(postToBalanceOf).to.equal(preToBalanceOf + amount);

        if (operator.address !== from) {
          const postIsOperatorFor = await context.lsp7.authorizedAmountFor(operator.address, from);
          expect(postIsOperatorFor).to.equal(preIsOperatorFor - amount);

          if (postIsOperatorFor == BigInt(0)) {
            await expect(tx)
              .to.emit(context.lsp7, 'OperatorRevoked')
              .withArgs(context.accounts.operator.address, from, false, '0x');
          } else {
            await expect(tx)
              .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
              .withArgs(context.accounts.operator.address, from, postIsOperatorFor, '0x');
          }
        }

        return tx;
      };

      const sendingTransferTransactions = (getOperator: () => SignerWithAddress) => {
        let operator: SignerWithAddress;

        beforeEach(() => {
          // passed as a thunk since other before hooks setup accounts map
          operator = getOperator();
        });

        describe('when using force=true', () => {
          const force = true;
          const data = ethers.hexlify(ethers.toUtf8Bytes('doing a transfer with force'));

          describe('when `to` is an EOA', () => {
            describe('when `to` is not the zero address', () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: context.accounts.tokenReceiver.address,
                  amount: context.initialSupply,
                  force,
                  data,
                };

                await transferSuccessScenario(txParams, operator);
              });
            });

            describe('when `to` is the zero address', () => {
              it('should revert', async () => {
                const txParams: TransferTxParams = {
                  from: operator.address,
                  to: ethers.ZeroAddress,
                  amount: context.initialSupply,
                  force: true,
                  data: '0x',
                };

                await expect(
                  context.lsp7
                    .connect(operator)
                    .transfer(
                      txParams.from,
                      txParams.to,
                      txParams.amount,
                      txParams.force,
                      txParams.data,
                    ),
                ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotSendWithAddressZero');
              });
            });
          });

          describe('when `to` is a contract', () => {
            describe('when receiving contract supports LSP1', () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: await helperContracts.tokenReceiverWithLSP1.getAddress(),
                  amount: context.initialSupply,
                  force,
                  data,
                };

                const tx = await transferSuccessScenario(txParams, operator);

                const typeId = LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification;
                const packedData = abiCoder.encode(
                  ['address', 'address', 'address', 'uint256', 'bytes'],
                  [operator.address, txParams.from, txParams.to, txParams.amount, txParams.data],
                );

                await expect(tx)
                  .to.emit(helperContracts.tokenReceiverWithLSP1, 'UniversalReceiver')
                  .withArgs(await context.lsp7.getAddress(), 0, typeId, packedData, '0x');
              });
            });

            describe('when receiving contract does not support LSP1', () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: await helperContracts.tokenReceiverWithoutLSP1.getAddress(),
                  amount: context.initialSupply,
                  force,
                  data,
                };

                await transferSuccessScenario(txParams, operator);
              });
            });
          });
        });

        describe('when force=false', () => {
          const force = false;
          const data = ethers.hexlify(ethers.toUtf8Bytes('doing a transfer without force'));

          describe('when `to` is an EOA', () => {
            it('should revert', async () => {
              const txParams = {
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: context.initialSupply,
                force,
                data,
              };

              await expect(
                context.lsp7
                  .connect(operator)
                  .transfer(
                    txParams.from,
                    txParams.to,
                    txParams.amount,
                    txParams.force,
                    txParams.data,
                  ),
              )
                .to.be.revertedWithCustomError(context.lsp7, 'LSP7NotifyTokenReceiverIsEOA')
                .withArgs(txParams.to);
            });
          });

          describe('when `to` is a contract', () => {
            describe('when receiving contract supports LSP1', () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: await helperContracts.tokenReceiverWithLSP1.getAddress(),
                  amount: context.initialSupply,
                  force,
                  data,
                };

                const tx = await transferSuccessScenario(txParams, operator);

                const typeId = LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification;
                const packedData = abiCoder.encode(
                  ['address', 'address', 'address', 'uint256', 'bytes'],
                  [operator.address, txParams.from, txParams.to, txParams.amount, txParams.data],
                );

                await expect(tx)
                  .to.emit(helperContracts.tokenReceiverWithLSP1, 'UniversalReceiver')
                  .withArgs(await context.lsp7.getAddress(), 0, typeId, packedData, '0x');
              });
            });

            describe('when receiving contract does not support LSP1', () => {
              it('should revert', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: await helperContracts.tokenReceiverWithoutLSP1.getAddress(),
                  amount: context.initialSupply,
                  force,
                  data,
                };

                await expect(
                  context.lsp7
                    .connect(operator)
                    .transfer(
                      txParams.from,
                      txParams.to,
                      txParams.amount,
                      txParams.force,
                      txParams.data,
                    ),
                )
                  .to.be.revertedWithCustomError(
                    context.lsp7,
                    'LSP7NotifyTokenReceiverContractMissingLSP1Interface',
                  )
                  .withArgs(txParams.to);
              });
            });
          });
        });

        describe('when the given amount is more than balance of tokenOwner', () => {
          it('should revert', async () => {
            const txParams = {
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              amount: context.initialSupply + BigInt(1),
              force: true,
              data: '0x',
            };

            if (txParams.from !== operator.address) {
              await context.lsp7.authorizeOperator(operator.address, txParams.amount, '0x');
            }

            await expect(
              context.lsp7
                .connect(operator)
                .transfer(
                  txParams.from,
                  txParams.to,
                  txParams.amount,
                  txParams.force,
                  txParams.data,
                ),
            )
              .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsBalance')
              .withArgs(
                ethers.toBeHex(context.initialSupply),
                txParams.from,
                ethers.toBeHex(txParams.amount),
              );
          });
        });
      };

      describe('when tokenOwner sends tx', () => {
        sendingTransferTransactions(() => context.accounts.owner);
      });

      describe('when operator sends tx', () => {
        sendingTransferTransactions(() => context.accounts.operator);

        describe('when `from` and `to` address are the same', () => {
          it('should revert', async () => {
            const operator = context.accounts.operator;

            const txParams = {
              from: context.accounts.owner.address,
              to: context.accounts.owner.address,
              amount: ethers.toBigInt('1'),
              force: true,
              data: '0x',
            };

            const preFromBalanceOf = await context.lsp7.balanceOf(txParams.from);
            const preOperatorAllowance = await context.lsp7.authorizedAmountFor(
              operator.address,
              context.accounts.owner.address,
            );

            await context.lsp7
              .connect(operator)
              .transfer(txParams.from, txParams.to, txParams.amount, txParams.force, txParams.data);

            // token owner balance should not have changed
            const postFromBalanceOf = await context.lsp7.balanceOf(txParams.from);
            expect(postFromBalanceOf).to.equal(preFromBalanceOf);

            // operator allowance should not have changed
            const postOperatorAllowance = await context.lsp7.authorizedAmountFor(
              operator.address,
              context.accounts.owner.address,
            );
            expect(postOperatorAllowance).to.equal(preOperatorAllowance - txParams.amount);
          });
        });

        describe('when `amount == 0`', () => {
          it('should revert with `force == false`', async () => {
            const caller = context.accounts.anyone;

            const txParams = {
              from: context.accounts.anyone.address,
              to: context.accounts.anotherTokenReceiver.address,
              amount: ethers.toBigInt(0),
              force: false,
              data: '0x',
            };

            await expect(
              context.lsp7
                .connect(caller)
                .transfer(
                  txParams.from,
                  txParams.to,
                  txParams.amount,
                  txParams.force,
                  txParams.data,
                ),
            )
              .to.be.revertedWithCustomError(context.lsp7, 'LSP7NotifyTokenReceiverIsEOA')
              .withArgs(txParams.to);
          });

          it('should pass with `force == true`', async () => {
            const caller = context.accounts.anyone;

            const txParams = {
              from: context.accounts.anyone.address,
              to: context.accounts.anotherTokenReceiver.address,
              amount: ethers.toBigInt(0),
              force: true,
              data: '0x',
            };

            await transferSuccessScenario(txParams, caller);
          });
        });

        describe('when operator does not have enough authorized amount', () => {
          it('should revert', async () => {
            const operator = context.accounts.operatorWithLowAuthorizedAmount;
            const txParams = {
              from: context.accounts.owner.address,
              to: await helperContracts.tokenReceiverWithoutLSP1.getAddress(),
              amount: context.initialSupply,
              force: true,
              data: '0x',
            };
            const operatorAmount = await context.lsp7.authorizedAmountFor(
              operator.address,
              txParams.from,
            );

            await expect(
              context.lsp7
                .connect(operator)
                .transfer(
                  txParams.from,
                  txParams.to,
                  txParams.amount,
                  txParams.force,
                  txParams.data,
                ),
            )
              .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsAuthorizedAmount')
              .withArgs(
                txParams.from,
                ethers.toBeHex(operatorAmount),
                operator.address,
                ethers.toBeHex(txParams.amount),
              );
          });
        });
      });

      describe('when the caller is not an operator', () => {
        it('should revert', async () => {
          const operator = context.accounts.anyone;
          const txParams = {
            from: context.accounts.owner.address,
            to: context.accounts.tokenReceiver.address,
            amount: context.initialSupply,
            force: true,
            data: '0x',
          };
          const operatorAmount = await context.lsp7.authorizedAmountFor(
            operator.address,
            txParams.from,
          );

          // pre-conditions
          expect(await context.lsp7.authorizedAmountFor(operator.address, txParams.from)).to.equal(
            ethers.ZeroAddress,
          );

          // effects
          await expect(
            context.lsp7
              .connect(operator)
              .transfer(txParams.from, txParams.to, txParams.amount, txParams.force, txParams.data),
          )
            .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsAuthorizedAmount')
            .withArgs(
              txParams.from,
              ethers.toBeHex(operatorAmount),
              operator.address,
              ethers.toBeHex(txParams.amount),
            );
        });
      });
    });

    describe('transferBatch', () => {
      beforeEach(async () => {
        // setup so we can observe operator amounts during transferBatch tests
        await context.lsp7.authorizeOperator(
          context.accounts.operator.address,
          context.initialSupply,
          '0x',
        );
        await context.lsp7.authorizeOperator(
          context.accounts.operatorWithLowAuthorizedAmount.address,
          ethers.toBigInt('1'),
          '0x',
        );
      });

      type TransferBatchTxParams = {
        from: string[];
        to: string[];
        amount: bigint[];
        force: boolean[];
        data: string[];
      };

      const transferBatchSuccessScenario = async (
        { from, to, amount, force, data }: TransferBatchTxParams,
        operator: SignerWithAddress,
      ) => {
        // pre-conditions
        await Promise.all(
          amount.map((_, index) => async () => {
            const preBalanceOf = await context.lsp7.balanceOf(to[index]);
            expect(preBalanceOf).to.equal(ethers.ZeroAddress);
          }),
        );

        // effect
        const tx = await context.lsp7
          .connect(operator)
          .transferBatch(from, to, amount, force, data);

        await Promise.all(
          amount.map(async (_, index) => {
            await expect(tx)
              .to.emit(context.lsp7, 'Transfer')
              .withArgs(
                operator.address,
                from[index],
                to[index],
                amount[index],
                force[index],
                data[index],
              );
          }),
        );

        // post-conditions
        await Promise.all(
          amount.map((_, index) => async () => {
            const postBalanceOf = await context.lsp7.balanceOf(to[index]);
            expect(postBalanceOf).to.equal(amount[index]);

            if (operator.address !== from[index]) {
              const postIsOperatorFor = await context.lsp7.authorizedAmountFor(
                operator.address,
                from[index],
              );
              expect(postIsOperatorFor).to.equal(postIsOperatorFor - amount[index]);

              if (postIsOperatorFor == BigInt(0)) {
                await expect(tx)
                  .to.emit(context.lsp7, 'OperatorRevoked')
                  .withArgs(
                    context.accounts.operator.address,
                    from[index],
                    postIsOperatorFor,
                    false,
                    '',
                  );
              } else {
                await expect(tx)
                  .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
                  .withArgs(context.accounts.operator.address, from, postIsOperatorFor, '');
              }
            }
          }),
        );

        return tx;
      };

      const transferBatchFailScenario = async (
        { from, to, amount, force, data }: TransferBatchTxParams,
        operator: SignerWithAddress,
        expectedError: ExpectedError,
      ) => {
        if (expectedError.args.length > 0)
          await expect(context.lsp7.connect(operator).transferBatch(from, to, amount, force, data))
            .to.be.revertedWithCustomError(context.lsp7, expectedError.error)
            .withArgs(...expectedError.args);
        else
          await expect(
            context.lsp7.connect(operator).transferBatch(from, to, amount, force, data),
          ).to.be.revertedWithCustomError(context.lsp7, expectedError.error);
      };

      const sendingTransferBatchTransactions = (getOperator: () => SignerWithAddress) => {
        let operator: SignerWithAddress;
        beforeEach(() => {
          // passed as a thunk since other before hooks setup accounts map
          operator = getOperator();
        });

        describe('when force=true', () => {
          const data = ethers.hexlify(ethers.toUtf8Bytes('doing a transfer with force'));

          describe('when `to` is an EOA', () => {
            describe('when `to` is the zero address', () => {
              it('should revert', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [context.accounts.tokenReceiver.address, ethers.ZeroAddress],
                  amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                  force: [true, true],
                  data: [data, data],
                };
                const expectedError = 'LSP7CannotSendWithAddressZero';

                await transferBatchFailScenario(txParams, operator, {
                  error: expectedError,
                  args: [],
                });
              });
            });

            describe('when `to` is not the zero address', () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    context.accounts.tokenReceiver.address,
                    context.accounts.anotherTokenReceiver.address,
                  ],
                  amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                  force: [true, true],
                  data: [data, data],
                };

                await transferBatchSuccessScenario(txParams, operator);
              });
            });
          });

          describe('when `to` is a contract', () => {
            describe('when receiving contract supports LSP1', () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    await helperContracts.tokenReceiverWithLSP1.getAddress(),
                    await helperContracts.tokenReceiverWithLSP1.getAddress(),
                  ],
                  amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                  force: [true, true],
                  data: [data, data],
                };

                const tx = await transferBatchSuccessScenario(txParams, operator);

                await Promise.all(
                  txParams.amount.map((_, index) => async () => {
                    const typeId =
                      '0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895';
                    const packedData = abiCoder.encode(
                      ['address', 'address', 'uint256', 'bytes'],
                      [
                        txParams.from[index],
                        txParams.to[index],
                        txParams.amount[index],
                        txParams.data[index],
                      ],
                    );

                    await expect(tx)
                      .to.emit(helperContracts.tokenReceiverWithLSP1, 'UniversalReceiver')
                      .withArgs(await context.lsp7.getAddress(), 0, typeId, packedData, '0x');
                  }),
                );
              });
            });

            describe('when receiving contract does not support LSP1', () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    await helperContracts.tokenReceiverWithoutLSP1.getAddress(),
                    await helperContracts.tokenReceiverWithoutLSP1.getAddress(),
                  ],
                  amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                  force: [true, true],
                  data: [data, data],
                };

                await transferBatchSuccessScenario(txParams, operator);
              });
            });
          });
        });

        describe('when force=false', () => {
          const data = ethers.hexlify(ethers.toUtf8Bytes('doing a transfer without force'));

          describe('when `to` is an EOA', () => {
            it('should revert', async () => {
              const txParams = {
                from: [context.accounts.owner.address, context.accounts.owner.address],
                to: [
                  context.accounts.tokenReceiver.address,
                  context.accounts.anotherTokenReceiver.address,
                ],
                amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                force: [false, false],
                data: [data, data],
              };
              const expectedError = 'LSP7NotifyTokenReceiverIsEOA';

              await transferBatchFailScenario(txParams, operator, {
                error: expectedError,
                args: [txParams.to[0]],
              });
            });
          });

          describe('when `to` is a contract', () => {
            describe('when receiving contract supports LSP1', () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    await helperContracts.tokenReceiverWithLSP1.getAddress(),
                    await helperContracts.tokenReceiverWithLSP1.getAddress(),
                  ],
                  amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                  force: [false, false],
                  data: [data, data],
                };

                await transferBatchSuccessScenario(txParams, operator);
              });
            });

            describe('when receiving contract does not support LSP1', () => {
              it('should revert', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    await helperContracts.tokenReceiverWithoutLSP1.getAddress(),
                    await helperContracts.tokenReceiverWithoutLSP1.getAddress(),
                  ],
                  amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                  force: [false, false],
                  data: [data, data],
                };
                const expectedError = 'LSP7NotifyTokenReceiverContractMissingLSP1Interface';

                await transferBatchFailScenario(txParams, operator, {
                  error: expectedError,
                  args: [txParams.to[0]],
                });
              });
            });
          });
        });

        describe('when force is mixed(true/false) respectively', () => {
          const data = ethers.hexlify(ethers.toUtf8Bytes('doing a transfer without force'));

          describe('when `to` is an EOA', () => {
            it('should revert', async () => {
              const txParams = {
                from: [context.accounts.owner.address, context.accounts.owner.address],
                to: [
                  context.accounts.tokenReceiver.address,
                  context.accounts.anotherTokenReceiver.address,
                ],
                amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                force: [true, false],
                data: [data, data],
              };
              const expectedError = 'LSP7NotifyTokenReceiverIsEOA';

              await transferBatchFailScenario(txParams, operator, {
                error: expectedError,
                args: [txParams.to[1]],
              });
            });
          });

          describe('when `to` is a contract', () => {
            describe("when first receiving contract support LSP1 but the second doesn't", () => {
              it('should allow transfering', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    await helperContracts.tokenReceiverWithLSP1.getAddress(),
                    await helperContracts.tokenReceiverWithoutLSP1.getAddress(),
                  ],
                  amount: [context.initialSupply - BigInt(1), ethers.toBigInt(1)],
                  force: [true, false],
                  data: [data, data],
                };

                const expectedError = 'LSP7NotifyTokenReceiverContractMissingLSP1Interface';

                await transferBatchFailScenario(txParams, operator, {
                  error: expectedError,
                  args: [txParams.to[1]],
                });
              });
            });

            describe('when receiving contract both support LSP1', () => {
              it('should pass regardless of force params', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    await helperContracts.tokenReceiverWithLSP1.getAddress(),
                    await helperContracts.tokenReceiverWithLSP1.getAddress(),
                  ],
                  amount: [context.initialSupply - BigInt(1), BigInt(1)],
                  force: [true, false],
                  data: [data, data],
                };

                await transferBatchSuccessScenario(txParams, operator);
              });
            });
          });
        });

        describe('when the given amount is more than balance of tokenOwner', () => {
          it('should revert', async () => {
            const txParams = {
              from: [context.accounts.owner.address],
              to: [context.accounts.tokenReceiver.address],
              amount: [context.initialSupply + BigInt(1)],
              force: [true],
              data: ['0x'],
            };
            const expectedError = 'LSP7AmountExceedsBalance';

            if (txParams.from.filter((x) => x !== operator.address).length !== 0) {
              const totalAmount = txParams.amount.reduce((acc, amount) => acc + amount, BigInt(0));
              await context.lsp7.authorizeOperator(operator.address, totalAmount, '0x');
            }

            await transferBatchFailScenario(txParams, operator, {
              error: expectedError,
              args: [
                ethers.toBeHex(context.initialSupply),
                txParams.from[0],
                ethers.toBeHex(txParams.amount[0]),
              ],
            });
          });
        });

        describe('when function parameters list length does not match', () => {
          it('should revert', async () => {
            const validTxParams = {
              from: [context.accounts.owner.address, context.accounts.owner.address],
              to: [context.accounts.tokenReceiver.address, context.accounts.tokenReceiver.address],
              amount: [context.initialSupply - BigInt(1), BigInt(1)],
              force: [true, true],
              data: ['0x', '0x'],
            };

            await Promise.all(
              ['from', 'to', 'amount', 'data'].map(async (arrayParam) => {
                await transferBatchFailScenario(
                  {
                    ...validTxParams,
                    [`${arrayParam}`]: [validTxParams[arrayParam][0]],
                  },
                  operator,
                  {
                    error: 'LSP7InvalidTransferBatch',
                    args: [],
                  },
                );
              }),
            );
          });
        });
      };

      describe('when tokenOwner sends tx', () => {
        sendingTransferBatchTransactions(() => context.accounts.owner);
      });

      describe('when operator sends tx', () => {
        sendingTransferBatchTransactions(() => context.accounts.operator);

        describe('when `to` and `from` are the same address', () => {
          it('should pass', async () => {
            const operator = context.accounts.operator;
            const txParams = {
              from: [context.accounts.owner.address, context.accounts.owner.address],
              to: [context.accounts.tokenReceiver.address, context.accounts.owner.address],
              amount: [context.initialSupply - BigInt(1), BigInt(1)],
              force: [true, true],
              data: ['0x', '0x'],
            };
            await transferBatchSuccessScenario(txParams, operator);
          });
        });

        describe('when operator does not have enough authorized amount', () => {
          it('should revert', async () => {
            const operator = context.accounts.operatorWithLowAuthorizedAmount;
            const txParams = {
              from: [context.accounts.owner.address],
              to: [context.accounts.tokenReceiver.address],
              amount: [context.initialSupply],
              force: [true],
              data: ['0x'],
            };
            const expectedError = 'LSP7AmountExceedsAuthorizedAmount';
            const operatorAmount = await context.lsp7.authorizedAmountFor(
              operator.address,
              txParams.from[0],
            );

            await transferBatchFailScenario(txParams, operator, {
              error: expectedError,
              args: [
                txParams.from[0],
                ethers.toBeHex(operatorAmount),
                operator.address,
                ethers.toBeHex(txParams.amount[0]),
              ],
            });
          });
        });

        describe('when the caller is not an operator', () => {
          it('should revert', async () => {
            const operator = context.accounts.anyone;
            const txParams = {
              from: [context.accounts.owner.address],
              to: [context.accounts.tokenReceiver.address],
              amount: [context.initialSupply],
              force: [true],
              data: ['0x'],
            };
            const expectedError = 'LSP7AmountExceedsAuthorizedAmount';
            const operatorAmount = await context.lsp7.authorizedAmountFor(
              operator.address,
              txParams.from[0],
            );

            await transferBatchFailScenario(txParams, operator, {
              error: expectedError,
              args: [
                txParams.from[0],
                ethers.toBeHex(operatorAmount),
                operator.address,
                ethers.toBeHex(txParams.amount[0]),
              ],
            });
          });
        });
      });
    });
  });

  describe('burn', () => {
    describe('when `amount == 0`', () => {
      it('should pass', async () => {
        const caller = context.accounts.anyone;
        const amount = 1;

        await context.lsp7
          .connect(context.accounts.anyone)
          .mint(caller.address, amount, true, '0x');

        await expect(context.lsp7.connect(caller).burn(caller.address, amount, '0x'))
          .to.emit(context.lsp7, 'Transfer')
          .withArgs(caller.address, caller.address, ethers.ZeroAddress, amount, false, '0x');
      });
    });

    describe('when caller is the `from` address', () => {
      describe('when using address(0) as `from` address', () => {
        it('should revert', async () => {
          const caller = context.accounts.anyone;
          const amount = 10;

          await expect(context.lsp7.connect(caller).burn(ethers.ZeroAddress, amount, '0x'))
            .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsAuthorizedAmount')
            .withArgs(
              ethers.ZeroAddress, // tokenOwner
              0, // authorized amount
              caller.address, // operator
              amount, // amount
            );
        });
      });

      describe('when caller has no token balance', () => {
        it('should revert', async () => {
          const caller = context.accounts.anyone;
          const amount = 10;

          await expect(context.lsp7.connect(caller).burn(caller.address, amount, '0x'))
            .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsBalance')
            .withArgs(0, caller.address, amount);
        });
      });

      describe('when caller has some token balance', () => {
        beforeEach(async () => {
          // mint some initial tokens
          await context.lsp7.mint(context.accounts.owner.address, 100, true, '0x');
        });

        describe('when burning all its tokens', () => {
          it('caller balance should then be zero', async () => {
            const caller = context.accounts.owner;
            const amount = await context.lsp7.balanceOf(caller.address);

            await context.lsp7.connect(caller).burn(caller.address, amount, '0x');

            const newBalance = await context.lsp7.balanceOf(caller.address);
            expect(newBalance).to.equal(0);
          });

          it('should have decreased the total supply', async () => {
            const caller = context.accounts.owner;
            const amount = await context.lsp7.balanceOf(caller.address);
            const initialSupply = await context.lsp7.totalSupply();

            await context.lsp7.connect(caller).burn(caller.address, amount, '0x');

            const newSupply = await context.lsp7.totalSupply();
            expect(newSupply).to.equal(initialSupply - amount);
          });

          it('should emit a Transfer event with address(0) for `to`', async () => {
            const caller = context.accounts.owner;
            const amount = await context.lsp7.balanceOf(caller.address);

            await expect(context.lsp7.connect(caller).burn(caller.address, amount, '0x'))
              .to.emit(context.lsp7, 'Transfer')
              .withArgs(caller.address, caller.address, ethers.ZeroAddress, amount, false, '0x');
          });
        });

        describe('when burning less than its tokens balance', () => {
          it('caller balance should then be decreased', async () => {
            const caller = context.accounts.owner;
            const initialBalance = await context.lsp7.balanceOf(caller.address);
            const amount = BigInt(10);

            await context.lsp7.connect(caller).burn(caller.address, amount, '0x');

            const newBalance = await context.lsp7.balanceOf(caller.address);
            expect(newBalance).to.equal(initialBalance - amount);
          });

          it('should have decreased the total supply', async () => {
            const caller = context.accounts.owner;
            const amount = BigInt(10);
            const initialSupply = await context.lsp7.totalSupply();

            await context.lsp7.connect(caller).burn(caller.address, amount, '0x');

            const newSupply = await context.lsp7.totalSupply();
            expect(newSupply).to.equal(initialSupply - amount);
          });

          it('should emit a Transfer event with address(0) for `to`', async () => {
            const caller = context.accounts.owner;
            const amount = 10;

            await expect(context.lsp7.connect(caller).burn(caller.address, amount, '0x'))
              .to.emit(context.lsp7, 'Transfer')
              .withArgs(caller.address, caller.address, ethers.ZeroAddress, amount, false, '0x');
          });
        });

        describe('when burning more than its token balance', () => {
          it('should revert', async () => {
            const caller = context.accounts.owner;
            const balance = await context.lsp7.balanceOf(caller.address);
            const amount = 1000;

            await expect(context.lsp7.connect(caller).burn(caller.address, amount, '0x'))
              .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsBalance')
              .withArgs(balance, caller.address, amount);
          });
        });
      });
    });

    describe('when caller is not an operator for `from`', () => {
      it('should revert', async () => {
        // mint some initial tokens
        await context.lsp7.mint(context.accounts.owner.address, 100, true, '0x');

        const caller = context.accounts.anyone;
        const amount = 10;

        await expect(
          context.lsp7.connect(caller).burn(context.accounts.owner.address, amount, '0x'),
        )
          .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsAuthorizedAmount')
          .withArgs(context.accounts.owner.address, 0, caller.address, amount);
      });
    });

    describe('when caller is an operator for `from`', () => {
      const operatorAllowance = 20;

      beforeEach(async () => {
        // mint some initial tokens
        await context.lsp7.mint(context.accounts.owner.address, 100, true, '0x');

        await context.lsp7.authorizeOperator(
          context.accounts.operator.address,
          operatorAllowance,
          '0x',
        );
      });

      describe('when burning all its allowance', () => {
        it('operator allowance should then be zero', async () => {
          const operator = context.accounts.operator;
          const amount = operatorAllowance;

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newAllowance = await context.lsp7.authorizedAmountFor(
            operator.address,
            context.accounts.owner.address,
          );
          expect(newAllowance).to.equal(0);
        });

        it('operator should have been removed from the list of operators for the token owner', async () => {
          const operator = context.accounts.operator;
          const amount = operatorAllowance;

          const operatorsList = await context.lsp7.getOperatorsOf(context.accounts.owner.address);
          expect(operatorsList).to.include(operator.address);

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const updatedOperatorList = await context.lsp7.getOperatorsOf(
            context.accounts.owner.address,
          );
          expect(updatedOperatorList.length).to.equal(operatorsList.length - 1);
          expect(updatedOperatorList).to.not.include(operator.address);
        });

        it('token owner balance should have decreased', async () => {
          const operator = context.accounts.operator;
          const amount = BigInt(operatorAllowance);
          const initialBalance = await context.lsp7.balanceOf(context.accounts.owner.address);

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newBalance = await context.lsp7.balanceOf(context.accounts.owner.address);
          expect(newBalance).to.equal(initialBalance - amount);
        });

        it('should have decreased the total supply', async () => {
          const operator = context.accounts.operator;
          const amount = BigInt(operatorAllowance);
          const initialSupply = await context.lsp7.totalSupply();

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newSupply = await context.lsp7.totalSupply();
          expect(newSupply).to.equal(initialSupply - amount);
        });

        it('should emit a Transfer event with address(0) for `to`', async () => {
          const operator = context.accounts.operator;
          const amount = operatorAllowance;

          await expect(
            context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x'),
          )
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              operator.address,
              context.accounts.owner.address,
              ethers.ZeroAddress,
              amount,
              false,
              '0x',
            );
        });

        it('should have emitted a `OperatorRevoked` event', async () => {
          const operator = context.accounts.operator;
          const amount = operatorAllowance;

          const operatorsList = await context.lsp7.getOperatorsOf(context.accounts.owner.address);
          expect(operatorsList).to.include(operator.address);

          await expect(
            context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x'),
          )
            .to.emit(context.lsp7, 'OperatorRevoked')
            .withArgs(operator.address, context.accounts.owner.address, false, '0x');
        });
      });

      describe('when burning part of its allowance', () => {
        it('operator allowance should have decreased', async () => {
          const amount = 10;
          assert.isBelow(amount, operatorAllowance);

          const operator = context.accounts.operator;
          const initialAllowance = await context.lsp7.authorizedAmountFor(
            operator.address,
            context.accounts.owner.address,
          );

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newAllowance = await context.lsp7.authorizedAmountFor(
            operator.address,
            context.accounts.owner.address,
          );

          expect(newAllowance).to.equal(initialAllowance - BigInt(amount));
        });

        it('operator should still be in the list of operators for tokenOwner (and not have been removed)', async () => {
          const amount = 10;
          assert.isBelow(amount, operatorAllowance);

          const operator = context.accounts.operator;

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const operatorsList = await context.lsp7.getOperatorsOf(context.accounts.owner.address);
          expect(operatorsList).to.include(operator.address);
        });

        it('token owner balance should have decreased', async () => {
          const amount = 10;
          assert.isBelow(amount, operatorAllowance);

          const operator = context.accounts.operator;
          const initialBalance = await context.lsp7.balanceOf(context.accounts.owner.address);

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newBalance = await context.lsp7.balanceOf(context.accounts.owner.address);
          expect(newBalance).to.equal(initialBalance - BigInt(amount));
        });

        it('should have decreased the total supply', async () => {
          const amount = 10;
          assert.isBelow(amount, operatorAllowance);

          const operator = context.accounts.operator;
          const initialSupply = await context.lsp7.totalSupply();

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newSupply = await context.lsp7.totalSupply();
          expect(newSupply).to.equal(initialSupply - BigInt(amount));
        });

        it('should emit a Transfer event with address(0) for `to`', async () => {
          const amount = 10;
          assert.isBelow(amount, operatorAllowance);

          const operator = context.accounts.operator;

          await expect(
            context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x'),
          )
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              operator.address,
              context.accounts.owner.address,
              ethers.ZeroAddress,
              amount,
              false,
              '0x',
            );
        });

        it("should emit an `OperatorAuthorizationChanged` event with the updated operator's allowance", async () => {
          const amount = 10;
          assert.isBelow(amount, operatorAllowance);

          const operator = context.accounts.operator;

          await expect(
            context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x'),
          )
            .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
            .withArgs(
              operator.address,
              context.accounts.owner.address,
              operatorAllowance - amount,
              '0x',
            );
        });
      });

      describe('when burning more than its allowance', () => {
        it('should revert', async () => {
          const amount = 100;
          assert.isAbove(amount, operatorAllowance);

          await expect(
            context.lsp7
              .connect(context.accounts.operator)
              .burn(context.accounts.owner.address, amount, '0x'),
          )
            .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsAuthorizedAmount')
            .withArgs(
              context.accounts.owner.address,
              operatorAllowance,
              context.accounts.operator.address,
              amount,
            );
        });
      });
    });
  });

  describe('transferOwnership', () => {
    let oldOwner: SignerWithAddress;
    let newOwner: SignerWithAddress;

    before(async () => {
      context = await buildContext();
      oldOwner = context.accounts.owner;
      newOwner = context.accounts.anyone;
    });

    it('should transfer ownership of the contract', async () => {
      await context.lsp7.connect(oldOwner).transferOwnership(newOwner.address);
      expect(await context.lsp7.owner()).to.equal(newOwner.address);
    });

    it('should not allow non-owners to transfer ownership', async () => {
      const newOwner = context.accounts.anyone;
      await expect(
        context.lsp7.connect(newOwner).transferOwnership(newOwner.address),
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });

    describe('after transferring ownership of the contract', () => {
      beforeEach(async () => {
        await context.lsp7.connect(oldOwner).transferOwnership(newOwner.address);
      });

      it('old owner should not be allowed to use `transferOwnership(..)`', async () => {
        const randomAddress = context.accounts.anyone.address;
        await expect(
          context.lsp7.connect(oldOwner).transferOwnership(randomAddress),
        ).to.be.revertedWith('Ownable: caller is not the owner');
      });

      it('old owner should not be allowed to use `renounceOwnership(..)`', async () => {
        await expect(context.lsp7.connect(oldOwner).renounceOwnership()).to.be.revertedWith(
          'Ownable: caller is not the owner',
        );
      });

      it('old owner should not be allowed to use `setData(..)`', async () => {
        const key = ethers.keccak256(ethers.toUtf8Bytes('key'));
        const value = ethers.keccak256(ethers.toUtf8Bytes('value'));
        await expect(context.lsp7.connect(oldOwner).setData(key, value)).to.be.revertedWith(
          'Ownable: caller is not the owner',
        );
      });

      it('new owner should be allowed to use `transferOwnership(..)`', async () => {
        const randomAddress = context.accounts.anyone.address;

        await context.lsp7.connect(newOwner).transferOwnership(randomAddress);

        expect(await context.lsp7.owner()).to.equal(randomAddress);
      });

      it('new owner should be allowed to use `renounceOwnership(..)`', async () => {
        await context.lsp7.connect(newOwner).renounceOwnership();

        expect(await context.lsp7.owner()).to.equal(ethers.ZeroAddress);
      });

      it('new owner should be allowed to use `setData(..)`', async () => {
        const key = ethers.keccak256(ethers.toUtf8Bytes('key'));
        const value = ethers.keccak256(ethers.toUtf8Bytes('value'));
        await context.lsp7.connect(newOwner).setData(key, value);

        expect(await context.lsp7.getData(key)).to.equal(value);
      });
    });
  });

  describe('when calling the contract with empty calldata', () => {
    describe('when making a call without any value', () => {
      it('should revert', async () => {
        await expect(
          context.accounts.anyone.sendTransaction({
            to: await context.lsp7.getAddress(),
          }),
        )
          .to.be.revertedWithCustomError(context.lsp7, 'InvalidFunctionSelector')
          .withArgs('0x00000000');
      });
    });

    describe('when making a call with sending value', () => {
      it('should revert', async () => {
        const amountSent = 200;
        await expect(
          context.accounts.anyone.sendTransaction({
            to: await context.lsp7.getAddress(),
            value: amountSent,
          }),
        ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenContractCannotHoldValue');
      });
    });
  });

  describe('when transferring 0 as amount', () => {
    describe('when the caller is the tokenOwner', () => {
      it('should succeed', async () => {
        const tokenOwner = context.accounts.owner.address;
        const recipient = context.accounts.anyone.address;
        const amount = 0;

        await expect(
          context.lsp7
            .connect(context.accounts.owner)
            .transfer(tokenOwner, recipient, amount, true, '0x'),
        )
          .to.emit(context.lsp7, 'Transfer')
          .withArgs(tokenOwner, tokenOwner, recipient, amount, true, '0x');
      });
    });

    describe('when the caller is the operator', () => {
      describe("when the caller doesn't have an authorized amount", () => {
        it('should revert', async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const recipient = context.accounts.anyone.address;
          const amount = 0;

          await expect(
            context.lsp7
              .connect(context.accounts.operator)
              .transfer(tokenOwner, recipient, amount, true, '0x'),
          )
            .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsAuthorizedAmount')
            .withArgs(tokenOwner, 0, operator, amount);
        });
      });
      describe('when the caller have an authorized amount', () => {
        it('should succeed', async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const recipient = context.accounts.anyone.address;
          const amountAuthorized = 100;
          const amount = 0;

          // pre-conditions
          await context.lsp7
            .connect(context.accounts.owner)
            .authorizeOperator(operator, amountAuthorized, '0x');
          expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
            amountAuthorized,
          );

          await expect(
            context.lsp7
              .connect(context.accounts.operator)
              .transfer(tokenOwner, recipient, amount, true, '0x'),
          )
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(operator, tokenOwner, recipient, amount, true, '0x');
        });
      });
    });

    describe('when making a call with sending value', () => {
      it('should revert', async () => {
        const amountSent = 200;
        await expect(
          context.accounts.anyone.sendTransaction({
            to: await context.lsp7.getAddress(),
            value: amountSent,
          }),
        ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenContractCannotHoldValue');
      });
    });
  });

  describe('batchCalls', () => {
    describe('when using one function', () => {
      describe('using `mint(...)`', () => {
        it('should pass', async () => {
          const mintCalldata = context.lsp7.interface.encodeFunctionData('mint', [
            context.accounts.tokenReceiver.address,
            1,
            true,
            '0x',
          ]);

          await expect(context.lsp7.connect(context.accounts.owner).batchCalls([mintCalldata]))
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              context.accounts.owner.address,
              AddressZero,
              context.accounts.tokenReceiver.address,
              1,
              true,
              '0x',
            );
        });
      });

      describe('using `burn(...)`', () => {
        it('should pass', async () => {
          const burnCalldata = context.lsp7.interface.encodeFunctionData('burn', [
            context.accounts.owner.address,
            1,
            '0x',
          ]);

          await expect(context.lsp7.connect(context.accounts.owner).batchCalls([burnCalldata]))
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              context.accounts.owner.address,
              context.accounts.owner.address,
              AddressZero,
              1,
              false,
              '0x',
            );
        });
      });

      describe('using `transfer(...)`', () => {
        it('should pass', async () => {
          await context.lsp7.mint(context.accounts.tokenReceiver.address, 1, true, '0x');

          const transferCalldata = context.lsp7.interface.encodeFunctionData('transfer', [
            context.accounts.tokenReceiver.address,
            context.accounts.anotherTokenReceiver.address,
            1,
            true,
            '0x',
          ]);

          await expect(
            context.lsp7.connect(context.accounts.tokenReceiver).batchCalls([transferCalldata]),
          )
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              context.accounts.tokenReceiver.address,
              context.accounts.tokenReceiver.address,
              context.accounts.anotherTokenReceiver.address,
              1,
              true,
              '0x',
            );
        });
      });

      describe('using authorizeOperator', () => {
        it('should pass', async () => {
          const authorizeOperatorCalldata = context.lsp7.interface.encodeFunctionData(
            'authorizeOperator',
            [context.accounts.tokenReceiver.address, 1, '0x'],
          );

          await expect(
            context.lsp7.connect(context.accounts.owner).batchCalls([authorizeOperatorCalldata]),
          )
            .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
            .withArgs(
              context.accounts.tokenReceiver.address,
              context.accounts.owner.address,
              1,
              '0x',
            );
        });
      });

      describe('using revokeOperator', () => {
        it('should pass', async () => {
          const revokeOperatorCalldata = context.lsp7.interface.encodeFunctionData(
            'revokeOperator',
            [context.accounts.tokenReceiver.address, context.accounts.owner.address, true, '0x'],
          );

          await expect(
            context.lsp7.connect(context.accounts.owner).batchCalls([revokeOperatorCalldata]),
          )
            .to.emit(context.lsp7, 'OperatorRevoked')
            .withArgs(
              context.accounts.tokenReceiver.address,
              context.accounts.owner.address,
              true,
              '0x',
            );
        });
      });

      describe('using increaseAllowance', () => {
        it('should pass', async () => {
          await context.lsp7.authorizeOperator(context.accounts.tokenReceiver.address, 1, '0x');

          const increaseAllowanceCalldata = context.lsp7.interface.encodeFunctionData(
            'increaseAllowance',
            [context.accounts.tokenReceiver.address, 1, '0x'],
          );

          await expect(
            context.lsp7.connect(context.accounts.owner).batchCalls([increaseAllowanceCalldata]),
          )
            .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
            .withArgs(
              context.accounts.tokenReceiver.address,
              context.accounts.owner.address,
              2,
              '0x',
            );
        });
      });

      describe('using decreaseAllowance', () => {
        it('should pass', async () => {
          await context.lsp7.authorizeOperator(context.accounts.tokenReceiver.address, 1, '0x');

          const decreaseAllowanceCalldata = context.lsp7.interface.encodeFunctionData(
            'decreaseAllowance',
            [context.accounts.tokenReceiver.address, context.accounts.owner.address, 1, '0x'],
          );

          await expect(
            context.lsp7.connect(context.accounts.owner).batchCalls([decreaseAllowanceCalldata]),
          )
            .to.emit(context.lsp7, 'OperatorRevoked')
            .withArgs(
              context.accounts.tokenReceiver.address,
              context.accounts.owner.address,
              true,
              '0x',
            );
        });
      });
    });

    describe('when using multiple functions', () => {
      describe('making 2x `transfer(...)`, 1x `authorizeOperator(...)` & `burn(...)`', () => {
        let mintCalldata: BytesLike;
        let firstTransferCalldata: BytesLike;
        let secondTransferCalldata: BytesLike;
        let authorizeOperatorCalldata: BytesLike;
        let burnCalldata: BytesLike;

        before(async () => {
          mintCalldata = context.lsp7.interface.encodeFunctionData('mint', [
            context.accounts.owner.address,
            4,
            true,
            '0xbeef0001',
          ]);

          firstTransferCalldata = context.lsp7.interface.encodeFunctionData('transfer', [
            context.accounts.owner.address,
            context.accounts.tokenReceiver.address,
            1,
            true,
            '0xcafe0001',
          ]);

          secondTransferCalldata = context.lsp7.interface.encodeFunctionData('transfer', [
            context.accounts.owner.address,
            context.accounts.anotherTokenReceiver.address,
            1,
            true,
            '0xcafe0002',
          ]);

          authorizeOperatorCalldata = context.lsp7.interface.encodeFunctionData(
            'authorizeOperator',
            [context.accounts.anyone.address, 1, '0xfeed0001'],
          );

          burnCalldata = context.lsp7.interface.encodeFunctionData('burn', [
            context.accounts.owner.address,
            1,
            '0xdead0001',
          ]);
        });

        it('should emit mint Transfer event', async () => {
          await expect(
            context.lsp7
              .connect(context.accounts.owner)
              .batchCalls([
                mintCalldata,
                firstTransferCalldata,
                secondTransferCalldata,
                authorizeOperatorCalldata,
                burnCalldata,
              ]),
          )
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              context.accounts.owner.address,
              AddressZero,
              context.accounts.owner.address,
              4,
              true,
              '0xbeef0001',
            );
        });

        it('should emit First Transfer event', async () => {
          await expect(
            context.lsp7
              .connect(context.accounts.owner)
              .batchCalls([
                mintCalldata,
                firstTransferCalldata,
                secondTransferCalldata,
                authorizeOperatorCalldata,
                burnCalldata,
              ]),
          )
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              context.accounts.owner.address,
              context.accounts.owner.address,
              context.accounts.tokenReceiver.address,
              1,
              true,
              '0xcafe0001',
            );
        });

        it('should emit Second Transfer event', async () => {
          await expect(
            context.lsp7
              .connect(context.accounts.owner)
              .batchCalls([
                mintCalldata,
                firstTransferCalldata,
                secondTransferCalldata,
                authorizeOperatorCalldata,
                burnCalldata,
              ]),
          )
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              context.accounts.owner.address,
              context.accounts.owner.address,
              context.accounts.anotherTokenReceiver.address,
              1,
              true,
              '0xcafe0002',
            );
        });

        it('should emit AuthoriseOperator event', async () => {
          await expect(
            context.lsp7
              .connect(context.accounts.owner)
              .batchCalls([
                mintCalldata,
                firstTransferCalldata,
                secondTransferCalldata,
                authorizeOperatorCalldata,
                burnCalldata,
              ]),
          )
            .to.emit(context.lsp7, 'OperatorAuthorizationChanged')
            .withArgs(
              context.accounts.anyone.address,
              context.accounts.owner.address,
              1,
              '0xfeed0001',
            );
        });

        it('should emit burn Transfer event', async () => {
          await expect(
            context.lsp7
              .connect(context.accounts.owner)
              .batchCalls([
                mintCalldata,
                firstTransferCalldata,
                secondTransferCalldata,
                authorizeOperatorCalldata,
                burnCalldata,
              ]),
          )
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(
              context.accounts.owner.address,
              context.accounts.owner.address,
              AddressZero,
              1,
              false,
              '0xdead0001',
            );
        });
      });
    });
  });
};

export type LSP7InitializeTestContext = {
  lsp7: LSP7DigitalAsset;
  deployParams: LSP7DeployParams;
  initializeTransaction: ContractTransactionResponse;
};

export const shouldInitializeLikeLSP7 = (
  buildContext: () => Promise<LSP7InitializeTestContext>,
) => {
  let context: LSP7InitializeTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('should have registered the ERC165 interface', async () => {
      expect(await context.lsp7.supportsInterface(INTERFACE_IDS.ERC165));
    });

    it('should have registered the ERC725Y interface', async () => {
      expect(await context.lsp7.supportsInterface(INTERFACE_IDS.ERC725Y));
    });

    it('should have registered the LSP7 interface', async () => {
      expect(await context.lsp7.supportsInterface(INTERFACE_IDS.LSP7DigitalAsset));
    });

    it('should have registered the LSP17Extendable interface', async () => {
      expect(await context.lsp7.supportsInterface(INTERFACE_IDS.LSP17Extendable));
    });

    it('should have set expected entries with ERC725Y.setData', async () => {
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7, 'DataChanged')
        .withArgs(
          SupportedStandards.LSP4DigitalAsset.key,
          SupportedStandards.LSP4DigitalAsset.value,
        );
      expect(await context.lsp7.getData(SupportedStandards.LSP4DigitalAsset.key)).to.equal(
        SupportedStandards.LSP4DigitalAsset.value,
      );

      const nameKey = ERC725YDataKeys.LSP4['LSP4TokenName'];
      const expectedNameValue = ethers.hexlify(ethers.toUtf8Bytes(context.deployParams.name));
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7, 'DataChanged')
        .withArgs(nameKey, expectedNameValue);
      expect(await context.lsp7.getData(nameKey)).to.equal(expectedNameValue);

      const symbolKey = ERC725YDataKeys.LSP4['LSP4TokenSymbol'];
      const expectedSymbolValue = ethers.hexlify(ethers.toUtf8Bytes(context.deployParams.symbol));
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7, 'DataChanged')
        .withArgs(symbolKey, expectedSymbolValue);
      expect(await context.lsp7.getData(symbolKey)).to.equal(expectedSymbolValue);

      const tokenTypeKey = ERC725YDataKeys.LSP4['LSP4TokenType'];
      const expectedTokenTypeValue = abiCoder.encode(
        ['uint256'],
        [context.deployParams.lsp4TokenType],
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7, 'DataChanged')
        .withArgs(tokenTypeKey, expectedTokenTypeValue);
      expect(await context.lsp7.getData(tokenTypeKey)).to.equal(expectedTokenTypeValue);
    });
  });
};
