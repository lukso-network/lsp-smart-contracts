import { ethers } from 'hardhat';
import { assert, expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import type { BigNumber } from 'ethers';
import type { TransactionResponse } from '@ethersproject/abstract-provider';

// types
import {
  LSP7Tester,
  LSP7DigitalAsset,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
} from '../../types';

// constants
import { ERC725YDataKeys, INTERFACE_IDS, LSP1_TYPE_IDS, SupportedStandards } from '../../constants';

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
};

export type LSP7TestContext = {
  accounts: LSP7TestAccounts;
  lsp7: LSP7Tester;
  deployParams: LSP7DeployParams;
  initialSupply: BigNumber;
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
      it('should revert if `allowNonLSP1Recipient == false`', async () => {
        const txParams = {
          to: context.accounts.anotherTokenReceiver.address,
          amount: 0,
          allowNonLSP1Recipient: false,
          data: '0x',
        };

        await expect(
          context.lsp7
            .connect(context.accounts.anyone)
            .mint(txParams.to, txParams.amount, txParams.allowNonLSP1Recipient, txParams.data),
        )
          .to.be.revertedWithCustomError(context.lsp7, 'LSP7NotifyTokenReceiverIsEOA')
          .withArgs(txParams.to);
      });

      it('should pass if `allowNonLSP1Recipient == true`', async () => {
        const txParams = {
          to: context.accounts.anotherTokenReceiver.address,
          amount: 0,
          allowNonLSP1Recipient: true,
          data: '0x',
        };

        await expect(
          context.lsp7
            .connect(context.accounts.anyone)
            .mint(txParams.to, txParams.amount, txParams.allowNonLSP1Recipient, txParams.data),
        )
          .to.emit(context.lsp7, 'Transfer')
          .withArgs(
            context.accounts.anyone.address,
            ethers.constants.AddressZero,
            txParams.to,
            txParams.amount,
            txParams.allowNonLSP1Recipient,
            txParams.data,
          );
      });
    });

    describe('when `to` is the zero address', () => {
      it('should revert', async () => {
        const txParams = {
          to: ethers.constants.AddressZero,
          amount: ethers.BigNumber.from('1'),
          allowNonLSP1Recipient: true,
          data: '0x',
        };

        await expect(
          context.lsp7.mint(
            txParams.to,
            txParams.amount,
            txParams.allowNonLSP1Recipient,
            txParams.data,
          ),
        ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotSendWithAddressZero');
      });
    });

    describe('when `to` is not the zero address', () => {
      it('should mint the token amount', async () => {
        const txParams = {
          to: context.accounts.tokenReceiver.address,
          amount: ethers.BigNumber.from('1'),
          allowNonLSP1Recipient: true,
          data: ethers.utils.toUtf8Bytes('we need more tokens'),
        };

        // pre-conditions
        const preBalanceOf = await context.lsp7.balanceOf(txParams.to);

        // effects
        await context.lsp7.mint(
          txParams.to,
          txParams.amount,
          txParams.allowNonLSP1Recipient,
          txParams.data,
        );

        // post-conditions
        const postBalanceOf = await context.lsp7.balanceOf(txParams.to);
        expect(postBalanceOf).to.equal(preBalanceOf.add(txParams.amount));
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
            ethers.constants.Zero,
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
      describe('when operator is not the zero address', () => {
        it('should succeed', async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const amount = context.initialSupply;

          const tx = await context.lsp7.authorizeOperator(operator, amount);

          await expect(tx)
            .to.emit(context.lsp7, 'AuthorizedOperator')
            .withArgs(operator, tokenOwner, amount);

          expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
        });

        describe('when operator is already authorized', () => {
          beforeEach(async () => {
            await context.lsp7.authorizeOperator(
              context.accounts.operator.address,
              context.initialSupply,
            );
          });

          it('should succeed', async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;
            const amount = context.initialSupply.add(1);

            await context.lsp7.authorizeOperator(operator, amount);

            const tx = await context.lsp7.authorizeOperator(operator, amount);

            await expect(tx)
              .to.emit(context.lsp7, 'AuthorizedOperator')
              .withArgs(operator, tokenOwner, amount);

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
          const operator = ethers.constants.AddressZero;

          await expect(
            context.lsp7.authorizeOperator(operator, context.initialSupply),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotUseAddressZeroAsOperator');
        });
      });

      describe('when operator is the token owner', () => {
        it('should revert', async () => {
          const operator = context.accounts.owner.address;

          await expect(
            context.lsp7.authorizeOperator(operator, context.initialSupply),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenOwnerCannotBeOperator');
        });
      });
    });

    describe('increaseAllowance', () => {
      beforeEach(async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        const tx = await context.lsp7.authorizeOperator(operator, amount);

        await expect(tx)
          .to.emit(context.lsp7, 'AuthorizedOperator')
          .withArgs(operator, tokenOwner, amount);

        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
      });

      describe('when the sender has enough balance (more than the `addedAmount` to add for the operator)', () => {
        const addedAmount = ethers.BigNumber.from('1');

        beforeEach('pre-checks', async () => {
          const senderBalance = await context.lsp7.balanceOf(context.accounts.owner.address);

          expect(senderBalance).to.be.greaterThanOrEqual(addedAmount);
        });

        describe('when there was no allowance before for the operator (`authorizedAmountFor` operator = 0)', () => {
          it('should authorize for the `addedAmount` and add the operator to the list of operators', async () => {
            const oldOperator = context.accounts.operator.address;
            const newOperator = context.accounts.anyone.address;
            const tokenOwner = context.accounts.owner.address;

            const tx = await context.lsp7.increaseAllowance(newOperator, addedAmount);

            await expect(tx)
              .to.emit(context.lsp7, 'AuthorizedOperator')
              .withArgs(newOperator, tokenOwner, addedAmount);

            expect(await context.lsp7.authorizedAmountFor(newOperator, tokenOwner)).to.equal(
              addedAmount,
            );

            expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([
              oldOperator,
              newOperator,
            ]);
          });
        });

        describe('when there was an allowance for the operator already (`authorizedAmountFor` operator > 0)', () => {
          it("should increase the operator's allowance by the `addedAmount`", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const allowanceBefore = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const expectedNewAllowance = allowanceBefore.add(addedAmount);

            const tx = await context.lsp7.increaseAllowance(operator, addedAmount);

            await expect(tx)
              .to.emit(context.lsp7, 'AuthorizedOperator')
              .withArgs(operator, tokenOwner, expectedNewAllowance);

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
        let addedAmountLargerThanBalance: BigNumber;

        beforeEach('set `addedAmount` larger than balance', async () => {
          const senderBalance = await context.lsp7.balanceOf(context.accounts.owner.address);

          addedAmountLargerThanBalance = senderBalance.add(5);
        });

        describe('when there was no authorized amount before for the operator (`authorizedAmountFor` operator = 0)', () => {
          it('should authorize for the `addedAmount`', async () => {
            const operator = context.accounts.anyone.address;
            const tokenOwner = context.accounts.owner.address;

            const tx = await context.lsp7.increaseAllowance(operator, addedAmountLargerThanBalance);

            await expect(tx)
              .to.emit(context.lsp7, 'AuthorizedOperator')
              .withArgs(operator, tokenOwner, addedAmountLargerThanBalance);

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              addedAmountLargerThanBalance,
            );
          });
        });

        describe('when there was an authorized amount for the operator already (`authorizedAmountFor` operator > 0)', () => {
          it("should increase the operator's allowance by the `addedAmount`", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const allowanceBefore = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const expectedNewAllowance = allowanceBefore.add(addedAmountLargerThanBalance);

            const tx = await context.lsp7.increaseAllowance(operator, addedAmountLargerThanBalance);

            await expect(tx)
              .to.emit(context.lsp7, 'AuthorizedOperator')
              .withArgs(operator, tokenOwner, expectedNewAllowance);

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              expectedNewAllowance,
            );
          });
        });
      });

      describe('when `operator` param is the zero address', () => {
        it('should revert', async () => {
          const addedAmount = ethers.BigNumber.from('1');

          await expect(
            context.lsp7.increaseAllowance(ethers.constants.AddressZero, addedAmount),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotUseAddressZeroAsOperator');
        });
      });

      describe('when `operator` param is `msg.sender`', () => {
        it('should revert', async () => {
          const addedAmount = ethers.BigNumber.from('1');

          await expect(
            context.lsp7.increaseAllowance(context.accounts.owner.address, addedAmount),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenOwnerCannotBeOperator');
        });
      });
    });

    describe('decreaseAllowance', () => {
      beforeEach(async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        const tx = await context.lsp7.authorizeOperator(operator, amount);

        await expect(tx)
          .to.emit(context.lsp7, 'AuthorizedOperator')
          .withArgs(operator, tokenOwner, amount);

        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);
      });

      describe('when `operator` param is the zero address', () => {
        it('should revert', async () => {
          const subtractedAmount = ethers.BigNumber.from('1');

          await expect(
            context.lsp7.decreaseAllowance(ethers.constants.AddressZero, subtractedAmount),
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

          const subtractedAmount = authorizedAmountFor.add(1);

          await expect(
            context.lsp7.decreaseAllowance(operator, subtractedAmount),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7DecreasedAllowanceBelowZero');
        });
      });

      describe('when there was an allowance before for the operator', () => {
        describe("when decreasing the operator's allowance by an amount smaller than the full allowance", () => {
          it("should decrease the operator's allowance by the `subtractedAmount` + emit `AuthorizedOperator` event", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const subtractedAmount = ethers.BigNumber.from('1');

            const allowanceBefore = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const tx = await context.lsp7.decreaseAllowance(operator, subtractedAmount);

            const expectedNewAllowance = allowanceBefore.sub(subtractedAmount);

            await expect(tx)
              .to.emit(context.lsp7, 'AuthorizedOperator')
              .withArgs(operator, tokenOwner, expectedNewAllowance);

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              expectedNewAllowance,
            );
          });
        });

        describe("when decreasing the operator's allowance by the full allowance", () => {
          it("should set the operator's allowance to zero + emit `RevokedOperator` event", async () => {
            const operator = context.accounts.operator.address;
            const tokenOwner = context.accounts.owner.address;

            const operatorAllowance = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

            const tx = await context.lsp7.decreaseAllowance(operator, operatorAllowance);

            const expectedNewAllowance = 0;

            await expect(tx)
              .to.emit(context.lsp7, 'RevokedOperator')
              .withArgs(operator, tokenOwner);

            expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
              expectedNewAllowance,
            );
          });
        });
      });

      describe('when `operator` param is `msg.sender`', () => {
        it('should revert', async () => {
          const subtractedAmount = ethers.BigNumber.from('1');

          await expect(
            context.lsp7.decreaseAllowance(context.accounts.owner.address, subtractedAmount),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7TokenOwnerCannotBeOperator');
        });
      });

      describe('when decreasing the operator allowance by an amount larger than the current allowance', () => {
        it('should revert', async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;

          const authorizedAmountFor = await context.lsp7.authorizedAmountFor(operator, tokenOwner);

          const subtractedAmountLargerThanAllowance = authorizedAmountFor.add(5);

          await expect(
            context.lsp7.decreaseAllowance(operator, subtractedAmountLargerThanAllowance),
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
        await context.lsp7.authorizeOperator(operator, amount);
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);

        // effects
        const tx = await context.lsp7.revokeOperator(operator);
        await expect(tx).to.emit(context.lsp7, 'RevokedOperator').withArgs(operator, tokenOwner);

        // post-conditions
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
          ethers.constants.Zero,
        );
      });

      it('should remove operator from list of operators', async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const amount = context.initialSupply;

        // pre-conditions
        await context.lsp7.authorizeOperator(operator, amount);
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(amount);

        expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([operator]);

        // effects
        const tx = await context.lsp7.revokeOperator(operator);
        await expect(tx).to.emit(context.lsp7, 'RevokedOperator').withArgs(operator, tokenOwner);

        // post-conditions
        expect(await context.lsp7.authorizedAmountFor(operator, tokenOwner)).to.equal(
          ethers.constants.Zero,
        );

        expect(await context.lsp7.getOperatorsOf(tokenOwner)).to.deep.equal([]);
      });
    });

    describe('when operator is the zero address', () => {
      it('should revert', async () => {
        const operator = ethers.constants.AddressZero;

        await expect(context.lsp7.revokeOperator(operator)).to.be.revertedWithCustomError(
          context.lsp7,
          'LSP7CannotUseAddressZeroAsOperator',
        );
      });
    });

    describe('when operator is the token owner', () => {
      it('should revert', async () => {
        const operator = context.accounts.owner.address;

        await expect(context.lsp7.revokeOperator(operator)).to.be.revertedWithCustomError(
          context.lsp7,
          'LSP7TokenOwnerCannotBeOperator',
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
          ).to.equal(ethers.constants.Zero);
        });
      });

      describe('when one account have been authorized', () => {
        it('should return the authorized amount', async () => {
          await context.lsp7.authorizeOperator(
            context.accounts.operator.address,
            context.initialSupply,
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
          );
          await context.lsp7.authorizeOperator(
            context.accounts.operatorWithLowAuthorizedAmount.address,
            ethers.BigNumber.from('1'),
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
        );
        await context.lsp7.authorizeOperator(
          context.accounts.operatorWithLowAuthorizedAmount.address,
          ethers.BigNumber.from('1'),
        );
      });

      describe('transfer', () => {
        type TransferTxParams = {
          from: string;
          to: string;
          amount: BigNumber;
          allowNonLSP1Recipient: boolean;
          data: string;
        };

        const transferSuccessScenario = async (
          { from, to, amount, allowNonLSP1Recipient, data }: TransferTxParams,
          operator: SignerWithAddress,
        ) => {
          // pre-conditions
          const preFromBalanceOf = await context.lsp7.balanceOf(from);
          const preToBalanceOf = await context.lsp7.balanceOf(to);
          const preIsOperatorFor = await context.lsp7.authorizedAmountFor(operator.address, from);

          // effect
          const tx = await context.lsp7
            .connect(operator)
            .transfer(from, to, amount, allowNonLSP1Recipient, data);
          await expect(tx)
            .to.emit(context.lsp7, 'Transfer')
            .withArgs(operator.address, from, to, amount, allowNonLSP1Recipient, data);

          // post-conditions
          const postFromBalanceOf = await context.lsp7.balanceOf(from);
          expect(postFromBalanceOf).to.equal(preFromBalanceOf.sub(amount));

          const postToBalanceOf = await context.lsp7.balanceOf(to);
          expect(postToBalanceOf).to.equal(preToBalanceOf.add(amount));

          if (operator.address !== from) {
            const postIsOperatorFor = await context.lsp7.authorizedAmountFor(
              operator.address,
              from,
            );
            expect(postIsOperatorFor).to.equal(preIsOperatorFor.sub(amount));

            if (postIsOperatorFor.eq('0')) {
              await expect(tx)
                .to.emit(context.lsp7, 'RevokedOperator')
                .withArgs(context.accounts.operator.address, from);
            } else {
              await expect(tx)
                .to.emit(context.lsp7, 'AuthorizedOperator')
                .withArgs(context.accounts.operator.address, from, postIsOperatorFor);
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

          describe('when using allowNonLSP1Recipient=true', () => {
            const allowNonLSP1Recipient = true;
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('doing a transfer with allowNonLSP1Recipient'),
            );

            describe('when `to` is an EOA', () => {
              describe('when `to` is not the zero address', () => {
                it('should allow transfering', async () => {
                  const txParams = {
                    from: context.accounts.owner.address,
                    to: context.accounts.tokenReceiver.address,
                    amount: context.initialSupply,
                    allowNonLSP1Recipient,
                    data,
                  };

                  await transferSuccessScenario(txParams, operator);
                });
              });

              describe('when `to` is the zero address', () => {
                it('should revert', async () => {
                  const txParams: TransferTxParams = {
                    from: operator.address,
                    to: ethers.constants.AddressZero,
                    amount: context.initialSupply,
                    allowNonLSP1Recipient: true,
                    data: '0x',
                  };

                  await expect(
                    context.lsp7
                      .connect(operator)
                      .transfer(
                        txParams.from,
                        txParams.to,
                        txParams.amount,
                        txParams.allowNonLSP1Recipient,
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
                    to: helperContracts.tokenReceiverWithLSP1.address,
                    amount: context.initialSupply,
                    allowNonLSP1Recipient,
                    data,
                  };

                  const tx = await transferSuccessScenario(txParams, operator);

                  const typeId = LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification;
                  const packedData = ethers.utils.solidityPack(
                    ['address', 'address', 'uint256', 'bytes'],
                    [txParams.from, txParams.to, txParams.amount, txParams.data],
                  );

                  await expect(tx)
                    .to.emit(helperContracts.tokenReceiverWithLSP1, 'UniversalReceiver')
                    .withArgs(context.lsp7.address, 0, typeId, packedData, '0x');
                });
              });

              describe('when receiving contract does not support LSP1', () => {
                it('should allow transfering', async () => {
                  const txParams = {
                    from: context.accounts.owner.address,
                    to: helperContracts.tokenReceiverWithoutLSP1.address,
                    amount: context.initialSupply,
                    allowNonLSP1Recipient,
                    data,
                  };

                  await transferSuccessScenario(txParams, operator);
                });
              });
            });
          });

          describe('when allowNonLSP1Recipient=false', () => {
            const allowNonLSP1Recipient = false;
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('doing a transfer without allowNonLSP1Recipient'),
            );

            describe('when `to` is an EOA', () => {
              it('should revert', async () => {
                const txParams = {
                  from: context.accounts.owner.address,
                  to: context.accounts.tokenReceiver.address,
                  amount: context.initialSupply,
                  allowNonLSP1Recipient,
                  data,
                };

                await expect(
                  context.lsp7
                    .connect(operator)
                    .transfer(
                      txParams.from,
                      txParams.to,
                      txParams.amount,
                      txParams.allowNonLSP1Recipient,
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
                    to: helperContracts.tokenReceiverWithLSP1.address,
                    amount: context.initialSupply,
                    allowNonLSP1Recipient,
                    data,
                  };

                  const tx = await transferSuccessScenario(txParams, operator);

                  const typeId = LSP1_TYPE_IDS.LSP7Tokens_RecipientNotification;
                  const packedData = ethers.utils.solidityPack(
                    ['address', 'address', 'uint256', 'bytes'],
                    [txParams.from, txParams.to, txParams.amount, txParams.data],
                  );

                  await expect(tx)
                    .to.emit(helperContracts.tokenReceiverWithLSP1, 'UniversalReceiver')
                    .withArgs(context.lsp7.address, 0, typeId, packedData, '0x');
                });
              });

              describe('when receiving contract does not support LSP1', () => {
                it('should revert', async () => {
                  const txParams = {
                    from: context.accounts.owner.address,
                    to: helperContracts.tokenReceiverWithoutLSP1.address,
                    amount: context.initialSupply,
                    allowNonLSP1Recipient,
                    data,
                  };

                  await expect(
                    context.lsp7
                      .connect(operator)
                      .transfer(
                        txParams.from,
                        txParams.to,
                        txParams.amount,
                        txParams.allowNonLSP1Recipient,
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
                amount: context.initialSupply.add(1),
                allowNonLSP1Recipient: true,
                data: '0x',
              };

              if (txParams.from !== operator.address) {
                await context.lsp7.authorizeOperator(operator.address, txParams.amount);
              }

              await expect(
                context.lsp7
                  .connect(operator)
                  .transfer(
                    txParams.from,
                    txParams.to,
                    txParams.amount,
                    txParams.allowNonLSP1Recipient,
                    txParams.data,
                  ),
              )
                .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsBalance')
                .withArgs(
                  context.initialSupply.toHexString(),
                  txParams.from,
                  txParams.amount.toHexString(),
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
                amount: ethers.BigNumber.from('1'),
                allowNonLSP1Recipient: true,
                data: '0x',
              };

              const preFromBalanceOf = await context.lsp7.balanceOf(txParams.from);
              const preOperatorAllowance = await context.lsp7.authorizedAmountFor(
                operator.address,
                context.accounts.owner.address,
              );

              await expect(
                context.lsp7
                  .connect(operator)
                  .transfer(
                    txParams.from,
                    txParams.to,
                    txParams.amount,
                    txParams.allowNonLSP1Recipient,
                    txParams.data,
                  ),
              ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotSendToSelf');

              // token owner balance should not have changed
              const postFromBalanceOf = await context.lsp7.balanceOf(txParams.from);
              expect(postFromBalanceOf).to.equal(preFromBalanceOf);

              // operator allowance should not have changed
              const postOperatorAllowance = await context.lsp7.authorizedAmountFor(
                operator.address,
                context.accounts.owner.address,
              );
              expect(postOperatorAllowance).to.equal(preOperatorAllowance);
            });
          });

          describe('when `amount == 0`', () => {
            it('should revert with `allowNonLSP1Recipient == false`', async () => {
              const caller = context.accounts.anyone;

              const txParams = {
                from: context.accounts.anyone.address,
                to: context.accounts.anotherTokenReceiver.address,
                amount: ethers.BigNumber.from(0),
                allowNonLSP1Recipient: false,
                data: '0x',
              };

              await expect(
                context.lsp7
                  .connect(caller)
                  .transfer(
                    txParams.from,
                    txParams.to,
                    txParams.amount,
                    txParams.allowNonLSP1Recipient,
                    txParams.data,
                  ),
              )
                .to.be.revertedWithCustomError(context.lsp7, 'LSP7NotifyTokenReceiverIsEOA')
                .withArgs(txParams.to);
            });

            it('should pass with `allowNonLSP1Recipient == true`', async () => {
              const caller = context.accounts.anyone;

              const txParams = {
                from: context.accounts.anyone.address,
                to: context.accounts.anotherTokenReceiver.address,
                amount: ethers.BigNumber.from(0),
                allowNonLSP1Recipient: true,
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
                to: helperContracts.tokenReceiverWithoutLSP1.address,
                amount: context.initialSupply,
                allowNonLSP1Recipient: true,
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
                    txParams.allowNonLSP1Recipient,
                    txParams.data,
                  ),
              )
                .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsAuthorizedAmount')
                .withArgs(
                  txParams.from,
                  operatorAmount.toHexString(),
                  operator.address,
                  txParams.amount.toHexString(),
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
              allowNonLSP1Recipient: true,
              data: '0x',
            };
            const operatorAmount = await context.lsp7.authorizedAmountFor(
              operator.address,
              txParams.from,
            );

            // pre-conditions
            expect(
              await context.lsp7.authorizedAmountFor(operator.address, txParams.from),
            ).to.equal(ethers.constants.Zero);

            // effects
            await expect(
              context.lsp7
                .connect(operator)
                .transfer(
                  txParams.from,
                  txParams.to,
                  txParams.amount,
                  txParams.allowNonLSP1Recipient,
                  txParams.data,
                ),
            )
              .to.be.revertedWithCustomError(context.lsp7, 'LSP7AmountExceedsAuthorizedAmount')
              .withArgs(
                txParams.from,
                operatorAmount.toHexString(),
                operator.address,
                txParams.amount.toHexString(),
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
          );
          await context.lsp7.authorizeOperator(
            context.accounts.operatorWithLowAuthorizedAmount.address,
            ethers.BigNumber.from('1'),
          );
        });

        type TransferBatchTxParams = {
          from: string[];
          to: string[];
          amount: BigNumber[];
          allowNonLSP1Recipient: boolean[];
          data: string[];
        };

        const transferBatchSuccessScenario = async (
          { from, to, amount, allowNonLSP1Recipient, data }: TransferBatchTxParams,
          operator: SignerWithAddress,
        ) => {
          // pre-conditions
          await Promise.all(
            amount.map((_, index) => async () => {
              const preBalanceOf = await context.lsp7.balanceOf(to[index]);
              expect(preBalanceOf).to.equal(ethers.constants.Zero);
            }),
          );

          // effect
          const tx = await context.lsp7
            .connect(operator)
            .transferBatch(from, to, amount, allowNonLSP1Recipient, data);

          await Promise.all(
            amount.map(async (_, index) => {
              await expect(tx)
                .to.emit(context.lsp7, 'Transfer')
                .withArgs(
                  operator.address,
                  from[index],
                  to[index],
                  amount[index],
                  allowNonLSP1Recipient[index],
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
                expect(postIsOperatorFor).to.equal(postIsOperatorFor.sub(amount[index]));

                if (postIsOperatorFor.eq('0')) {
                  await expect(tx)
                    .to.emit(context.lsp7, 'RevokedOperator')
                    .withArgs(context.accounts.operator.address, from[index], postIsOperatorFor);
                } else {
                  await expect(tx)
                    .to.emit(context.lsp7, 'AuthorizedOperator')
                    .withArgs(context.accounts.operator.address, from, postIsOperatorFor);
                }
              }
            }),
          );

          return tx;
        };

        const transferBatchFailScenario = async (
          { from, to, amount, allowNonLSP1Recipient, data }: TransferBatchTxParams,
          operator: SignerWithAddress,
          expectedError: ExpectedError,
        ) => {
          if (expectedError.args.length > 0)
            await expect(
              context.lsp7
                .connect(operator)
                .transferBatch(from, to, amount, allowNonLSP1Recipient, data),
            )
              .to.be.revertedWithCustomError(context.lsp7, expectedError.error)
              .withArgs(...expectedError.args);
          else
            await expect(
              context.lsp7
                .connect(operator)
                .transferBatch(from, to, amount, allowNonLSP1Recipient, data),
            ).to.be.revertedWithCustomError(context.lsp7, expectedError.error);
        };

        const sendingTransferBatchTransactions = (getOperator: () => SignerWithAddress) => {
          let operator: SignerWithAddress;
          beforeEach(() => {
            // passed as a thunk since other before hooks setup accounts map
            operator = getOperator();
          });

          describe('when allowNonLSP1Recipient=true', () => {
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('doing a transfer with allowNonLSP1Recipient'),
            );

            describe('when `to` is an EOA', () => {
              describe('when `to` is the zero address', () => {
                it('should revert', async () => {
                  const txParams = {
                    from: [context.accounts.owner.address, context.accounts.owner.address],
                    to: [context.accounts.tokenReceiver.address, ethers.constants.AddressZero],
                    amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                    allowNonLSP1Recipient: [true, true],
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
                    amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                    allowNonLSP1Recipient: [true, true],
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
                      helperContracts.tokenReceiverWithLSP1.address,
                      helperContracts.tokenReceiverWithLSP1.address,
                    ],
                    amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                    allowNonLSP1Recipient: [true, true],
                    data: [data, data],
                  };

                  const tx = await transferBatchSuccessScenario(txParams, operator);

                  await Promise.all(
                    txParams.amount.map((_, index) => async () => {
                      const typeId =
                        '0x29ddb589b1fb5fc7cf394961c1adf5f8c6454761adf795e67fe149f658abe895';
                      const packedData = ethers.utils.solidityPack(
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
                        .withArgs(context.lsp7.address, 0, typeId, packedData, '0x');
                    }),
                  );
                });
              });

              describe('when receiving contract does not support LSP1', () => {
                it('should allow transfering', async () => {
                  const txParams = {
                    from: [context.accounts.owner.address, context.accounts.owner.address],
                    to: [
                      helperContracts.tokenReceiverWithoutLSP1.address,
                      helperContracts.tokenReceiverWithoutLSP1.address,
                    ],
                    amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                    allowNonLSP1Recipient: [true, true],
                    data: [data, data],
                  };

                  await transferBatchSuccessScenario(txParams, operator);
                });
              });
            });
          });

          describe('when allowNonLSP1Recipient=false', () => {
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('doing a transfer without allowNonLSP1Recipient'),
            );

            describe('when `to` is an EOA', () => {
              it('should revert', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    context.accounts.tokenReceiver.address,
                    context.accounts.anotherTokenReceiver.address,
                  ],
                  amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                  allowNonLSP1Recipient: [false, false],
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
                      helperContracts.tokenReceiverWithLSP1.address,
                      helperContracts.tokenReceiverWithLSP1.address,
                    ],
                    amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                    allowNonLSP1Recipient: [false, false],
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
                      helperContracts.tokenReceiverWithoutLSP1.address,
                      helperContracts.tokenReceiverWithoutLSP1.address,
                    ],
                    amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                    allowNonLSP1Recipient: [false, false],
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

          describe('when allowNonLSP1Recipient is mixed(true/false) respectively', () => {
            const data = ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes('doing a transfer without allowNonLSP1Recipient'),
            );

            describe('when `to` is an EOA', () => {
              it('should revert', async () => {
                const txParams = {
                  from: [context.accounts.owner.address, context.accounts.owner.address],
                  to: [
                    context.accounts.tokenReceiver.address,
                    context.accounts.anotherTokenReceiver.address,
                  ],
                  amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                  allowNonLSP1Recipient: [true, false],
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
                      helperContracts.tokenReceiverWithLSP1.address,
                      helperContracts.tokenReceiverWithoutLSP1.address,
                    ],
                    amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                    allowNonLSP1Recipient: [true, false],
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
                it('should pass regardless of allowNonLSP1Recipient params', async () => {
                  const txParams = {
                    from: [context.accounts.owner.address, context.accounts.owner.address],
                    to: [
                      helperContracts.tokenReceiverWithLSP1.address,
                      helperContracts.tokenReceiverWithLSP1.address,
                    ],
                    amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                    allowNonLSP1Recipient: [true, false],
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
                amount: [context.initialSupply.add(1)],
                allowNonLSP1Recipient: [true],
                data: ['0x'],
              };
              const expectedError = 'LSP7AmountExceedsBalance';

              if (txParams.from.filter((x) => x !== operator.address).length !== 0) {
                const totalAmount = txParams.amount.reduce(
                  (acc, amount) => acc.add(amount),
                  ethers.BigNumber.from('0'),
                );
                await context.lsp7.authorizeOperator(operator.address, totalAmount);
              }

              await transferBatchFailScenario(txParams, operator, {
                error: expectedError,
                args: [
                  context.initialSupply.toHexString(),
                  txParams.from[0],
                  txParams.amount[0].toHexString(),
                ],
              });
            });
          });

          describe('when function parameters list length does not match', () => {
            it('should revert', async () => {
              const validTxParams = {
                from: [context.accounts.owner.address, context.accounts.owner.address],
                to: [
                  context.accounts.tokenReceiver.address,
                  context.accounts.tokenReceiver.address,
                ],
                amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                allowNonLSP1Recipient: [true, true],
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
            it('should revert', async () => {
              const operator = context.accounts.operator;
              const txParams = {
                from: [context.accounts.owner.address, context.accounts.owner.address],
                to: [context.accounts.tokenReceiver.address, context.accounts.owner.address],
                amount: [context.initialSupply.sub(1), ethers.BigNumber.from('1')],
                allowNonLSP1Recipient: [true, true],
                data: ['0x', '0x'],
              };
              const expectedError = 'LSP7CannotSendToSelf';

              await transferBatchFailScenario(txParams, operator, {
                error: expectedError,
                args: [],
              });
            });
          });

          describe('when operator does not have enough authorized amount', () => {
            it('should revert', async () => {
              const operator = context.accounts.operatorWithLowAuthorizedAmount;
              const txParams = {
                from: [context.accounts.owner.address],
                to: [context.accounts.tokenReceiver.address],
                amount: [context.initialSupply],
                allowNonLSP1Recipient: [true],
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
                  operatorAmount.toHexString(),
                  operator.address,
                  txParams.amount[0].toHexString(),
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
                allowNonLSP1Recipient: [true],
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
                  operatorAmount.toHexString(),
                  operator.address,
                  txParams.amount[0].toHexString(),
                ],
              });
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
          .withArgs(
            caller.address,
            caller.address,
            ethers.constants.AddressZero,
            amount,
            false,
            '0x',
          );
      });
    });
    describe('when caller is the `from` address', () => {
      describe('when using address(0) as `from` address', () => {
        it('should revert', async () => {
          const caller = context.accounts.anyone;
          const amount = 10;

          await expect(
            context.lsp7.connect(caller).burn(ethers.constants.AddressZero, amount, '0x'),
          ).to.be.revertedWithCustomError(context.lsp7, 'LSP7CannotSendWithAddressZero');
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
            expect(newSupply).to.equal(initialSupply.sub(amount));
          });

          it('should emit a Transfer event with address(0) for `to`', async () => {
            const caller = context.accounts.owner;
            const amount = await context.lsp7.balanceOf(caller.address);

            await expect(context.lsp7.connect(caller).burn(caller.address, amount, '0x'))
              .to.emit(context.lsp7, 'Transfer')
              .withArgs(
                caller.address,
                caller.address,
                ethers.constants.AddressZero,
                amount,
                false,
                '0x',
              );
          });
        });

        describe('when burning less than its tokens balance', () => {
          it('caller balance should then be decreased', async () => {
            const caller = context.accounts.owner;
            const initialBalance = await context.lsp7.balanceOf(caller.address);
            const amount = 10;

            await context.lsp7.connect(caller).burn(caller.address, amount, '0x');

            const newBalance = await context.lsp7.balanceOf(caller.address);
            expect(newBalance).to.equal(initialBalance.sub(amount));
          });

          it('should have decreased the total supply', async () => {
            const caller = context.accounts.owner;
            const amount = 10;
            const initialSupply = await context.lsp7.totalSupply();

            await context.lsp7.connect(caller).burn(caller.address, amount, '0x');

            const newSupply = await context.lsp7.totalSupply();
            expect(newSupply).to.equal(initialSupply.sub(amount));
          });

          it('should emit a Transfer event with address(0) for `to`', async () => {
            const caller = context.accounts.owner;
            const amount = 10;

            await expect(context.lsp7.connect(caller).burn(caller.address, amount, '0x'))
              .to.emit(context.lsp7, 'Transfer')
              .withArgs(
                caller.address,
                caller.address,
                ethers.constants.AddressZero,
                amount,
                false,
                '0x',
              );
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

        await context.lsp7.authorizeOperator(context.accounts.operator.address, operatorAllowance);
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

        it('token owner balance should have decreased', async () => {
          const operator = context.accounts.operator;
          const amount = operatorAllowance;
          const initialBalance = await context.lsp7.balanceOf(context.accounts.owner.address);

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newBalance = await context.lsp7.balanceOf(context.accounts.owner.address);
          expect(newBalance).to.equal(initialBalance.sub(amount));
        });

        it('should have decreased the total supply', async () => {
          const operator = context.accounts.operator;
          const amount = operatorAllowance;
          const initialSupply = await context.lsp7.totalSupply();

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newSupply = await context.lsp7.totalSupply();
          expect(newSupply).to.equal(initialSupply.sub(amount));
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
              ethers.constants.AddressZero,
              amount,
              false,
              '0x',
            );
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

          expect(newAllowance).to.equal(initialAllowance.sub(amount));
        });

        it('token owner balance should have decreased', async () => {
          const amount = 10;
          assert.isBelow(amount, operatorAllowance);

          const operator = context.accounts.operator;
          const initialBalance = await context.lsp7.balanceOf(context.accounts.owner.address);

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newBalance = await context.lsp7.balanceOf(context.accounts.owner.address);
          expect(newBalance).to.equal(initialBalance.sub(amount));
        });

        it('should have decreased the total supply', async () => {
          const amount = 10;
          assert.isBelow(amount, operatorAllowance);

          const operator = context.accounts.operator;
          const initialSupply = await context.lsp7.totalSupply();

          await context.lsp7.connect(operator).burn(context.accounts.owner.address, amount, '0x');

          const newSupply = await context.lsp7.totalSupply();
          expect(newSupply).to.equal(initialSupply.sub(amount));
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
              ethers.constants.AddressZero,
              amount,
              false,
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
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key'));
        const value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('value'));
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

        expect(await context.lsp7.owner()).to.equal(ethers.constants.AddressZero);
      });

      it('new owner should be allowed to use `setData(..)`', async () => {
        const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key'));
        const value = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('value'));
        await context.lsp7.connect(newOwner).setData(key, value);

        expect(await context.lsp7.getData(key)).to.equal(value);
      });
    });
  });
};

export type LSP7InitializeTestContext = {
  lsp7: LSP7DigitalAsset;
  deployParams: LSP7DeployParams;
  initializeTransaction: TransactionResponse;
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
      const expectedNameValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.name),
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7, 'DataChanged')
        .withArgs(nameKey, expectedNameValue);
      expect(await context.lsp7.getData(nameKey)).to.equal(expectedNameValue);

      const symbolKey = ERC725YDataKeys.LSP4['LSP4TokenSymbol'];
      const expectedSymbolValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.symbol),
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7, 'DataChanged')
        .withArgs(symbolKey, expectedSymbolValue);
      expect(await context.lsp7.getData(symbolKey)).to.equal(expectedSymbolValue);
    });
  });
};
