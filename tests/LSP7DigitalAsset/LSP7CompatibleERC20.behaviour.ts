import { ethers } from 'hardhat';
import { expect } from 'chai';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, ContractTransaction } from 'ethers';
import type { TransactionResponse } from '@ethersproject/abstract-provider';

import { INTERFACE_IDS, SupportedStandards } from '../../constants';
import {
  CheckInterface__factory,
  LSP7CompatibleERC20,
  LSP7CompatibleERC20Tester,
  TokenReceiverWithLSP1,
  TokenReceiverWithLSP1__factory,
  TokenReceiverWithoutLSP1,
  TokenReceiverWithoutLSP1__factory,
  UniversalReceiverDelegateRevert,
  UniversalReceiverDelegateRevert__factory,
} from '../../types';
import { ERC725YDataKeys } from '../../constants';

type LSP7CompatibleERC20TestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
  operator: SignerWithAddress;
  anotherOperator: SignerWithAddress;
  anyone: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7CompatibleERC20TestAccounts> => {
  const [owner, tokenReceiver, operator, anotherOperator, anyone] = await ethers.getSigners();
  return { owner, tokenReceiver, operator, anotherOperator, anyone };
};

export type LSP7CompatibleERC20DeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP7CompatibleERC20TestContext = {
  accounts: LSP7CompatibleERC20TestAccounts;
  lsp7CompatibleERC20: LSP7CompatibleERC20Tester;
  deployParams: LSP7CompatibleERC20DeployParams;
  initialSupply: BigNumber;
};

export type ExpectedError = {
  error: string;
  args: string[];
};

export const shouldBehaveLikeLSP7CompatibleERC20 = (
  buildContext: () => Promise<LSP7CompatibleERC20TestContext>,
) => {
  let context: LSP7CompatibleERC20TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe('approve', () => {
    describe('when operator is the zero address', () => {
      it('should revert', async () => {
        await expect(
          context.lsp7CompatibleERC20.approve(ethers.constants.AddressZero, context.initialSupply),
        ).to.be.revertedWithCustomError(
          context.lsp7CompatibleERC20,
          'LSP7CannotUseAddressZeroAsOperator',
        );
      });
    });

    describe('when the operator had no authorized amount', () => {
      it('should succeed by setting the given amount', async () => {
        const operator = context.accounts.operator.address;
        const tokenOwner = context.accounts.owner.address;
        const authorizedAmount = 1;

        const preAllowance = await context.lsp7CompatibleERC20.allowance(tokenOwner, operator);
        expect(preAllowance).to.equal(0);

        const tx = await context.lsp7CompatibleERC20.approve(operator, authorizedAmount);

        await expect(tx)
          .to.emit(context.lsp7CompatibleERC20, 'AuthorizedOperator')
          .withArgs(operator, tokenOwner, authorizedAmount, '0x');

        await expect(tx)
          .to.emit(context.lsp7CompatibleERC20, 'Approval')
          .withArgs(tokenOwner, operator, authorizedAmount);

        const postAllowance = await context.lsp7CompatibleERC20.allowance(tokenOwner, operator);
        expect(postAllowance).to.equal(authorizedAmount);
      });

      describe('approving an LSP1 contract', () => {
        it('should succeed and inform the operator', async () => {
          const tokenReceiverWithLSP1: TokenReceiverWithLSP1 =
            await new TokenReceiverWithLSP1__factory(context.accounts.owner).deploy();
          const operator = tokenReceiverWithLSP1.address;
          const tokenOwner = context.accounts.owner.address;
          const amount = 1;

          const tx = await context.lsp7CompatibleERC20.approve(operator, amount, {
            gasLimit: 2000000,
          });

          await expect(tx)
            .to.emit(context.lsp7CompatibleERC20, 'AuthorizedOperator')
            .withArgs(operator, tokenOwner, amount, '0x');

          await expect(tx).to.emit(tokenReceiverWithLSP1, 'UniversalReceiver');

          expect(
            await context.lsp7CompatibleERC20.authorizedAmountFor(operator, tokenOwner),
          ).to.equal(amount);
        });

        it('should succeed and inform the operator even if the operator revert', async () => {
          const operatorThatReverts: UniversalReceiverDelegateRevert =
            await new UniversalReceiverDelegateRevert__factory(context.accounts.owner).deploy();
          const operator = operatorThatReverts.address;
          const tokenOwner = context.accounts.owner.address;
          const amount = 1;

          const tx = await context.lsp7CompatibleERC20.approve(operator, amount);

          await expect(tx)
            .to.emit(context.lsp7CompatibleERC20, 'AuthorizedOperator')
            .withArgs(operator, tokenOwner, amount, '0x');

          expect(
            await context.lsp7CompatibleERC20.authorizedAmountFor(operator, tokenOwner),
          ).to.equal(amount);
        });
      });
    });

    describe('when the operator had an authorized amount', () => {
      describe('when the operator authorized amount is changed to another non-zero value', () => {
        it('should succeed by replacing the existing amount with the given amount', async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const previouslyAuthorizedAmount = '20';
          const authorizedAmount = '1';

          await context.lsp7CompatibleERC20.approve(operator, previouslyAuthorizedAmount);

          const preAllowance = await context.lsp7CompatibleERC20.allowance(tokenOwner, operator);
          expect(preAllowance).to.equal(previouslyAuthorizedAmount);

          const tx = await context.lsp7CompatibleERC20.approve(operator, authorizedAmount);

          await expect(tx)
            .to.emit(context.lsp7CompatibleERC20, 'AuthorizedOperator')
            .withArgs(operator, tokenOwner, authorizedAmount, '0x');

          await expect(tx)
            .to.emit(context.lsp7CompatibleERC20, 'Approval')
            .withArgs(tokenOwner, operator, authorizedAmount);

          const postAllowance = await context.lsp7CompatibleERC20.allowance(tokenOwner, operator);
          expect(postAllowance).to.equal(authorizedAmount);
        });
      });

      describe('when the operator authorized amount is changed to zero', () => {
        it('should succeed by replacing the existing amount with the given amount', async () => {
          const operator = context.accounts.operator.address;
          const tokenOwner = context.accounts.owner.address;
          const previouslyAuthorizedAmount = '20';
          const authorizedAmount = '0';

          await context.lsp7CompatibleERC20.approve(operator, previouslyAuthorizedAmount);

          const preAllowance = await context.lsp7CompatibleERC20.allowance(tokenOwner, operator);
          expect(preAllowance).to.equal(previouslyAuthorizedAmount);

          const tx = await context.lsp7CompatibleERC20.approve(operator, authorizedAmount);

          await expect(tx)
            .to.emit(context.lsp7CompatibleERC20, 'RevokedOperator')
            .withArgs(operator, tokenOwner, false, '0x');

          await expect(tx)
            .to.emit(context.lsp7CompatibleERC20, 'Approval')
            .withArgs(tokenOwner, operator, authorizedAmount);

          const postAllowance = await context.lsp7CompatibleERC20.allowance(tokenOwner, operator);
          expect(postAllowance).to.equal(authorizedAmount);
        });

        describe('changing the allowance of an LSP1 contract to zero', () => {
          it('should succeed and not inform the operator', async () => {
            const tokenReceiverWithLSP1: TokenReceiverWithLSP1 =
              await new TokenReceiverWithLSP1__factory(context.accounts.owner).deploy();
            const operator = tokenReceiverWithLSP1.address;
            const tokenOwner = context.accounts.owner.address;

            const tx = await context.lsp7CompatibleERC20.approve(operator, 0, {
              gasLimit: 2000000,
            });

            await expect(tx)
              .to.emit(context.lsp7CompatibleERC20, 'RevokedOperator')
              .withArgs(operator, tokenOwner, false, '0x');

            expect(tx).to.not.emit(tokenReceiverWithLSP1, 'UniversalReceiver');

            expect(
              await context.lsp7CompatibleERC20.authorizedAmountFor(operator, tokenOwner),
            ).to.equal(ethers.constants.Zero);
          });

          it('should succeed and inform the operator even if the operator revert', async () => {
            const operatorThatReverts: UniversalReceiverDelegateRevert =
              await new UniversalReceiverDelegateRevert__factory(context.accounts.owner).deploy();
            const operator = operatorThatReverts.address;
            const tokenOwner = context.accounts.owner.address;

            const tx = await context.lsp7CompatibleERC20.approve(operator, 0);

            await expect(tx)
              .to.emit(context.lsp7CompatibleERC20, 'RevokedOperator')
              .withArgs(operator, tokenOwner, false, '0x');

            expect(
              await context.lsp7CompatibleERC20.authorizedAmountFor(operator, tokenOwner),
            ).to.equal(ethers.constants.Zero);
          });
        });
      });
    });
  });

  describe('allowance', () => {
    describe('when operator has been approved', () => {
      it('should return approval amount', async () => {
        await context.lsp7CompatibleERC20.approve(
          context.accounts.operator.address,
          context.initialSupply,
        );

        expect(
          await context.lsp7CompatibleERC20.allowance(
            context.accounts.owner.address,
            context.accounts.operator.address,
          ),
        ).to.equal(context.initialSupply);
      });
    });

    describe('when operator has not been approved', () => {
      it('should return zero', async () => {
        expect(
          await context.lsp7CompatibleERC20.allowance(
            context.accounts.owner.address,
            context.accounts.anyone.address,
          ),
        ).to.equal(ethers.constants.Zero);
      });
    });
  });

  describe('mint', () => {
    describe('when a token is minted', () => {
      it('should have expected events', async () => {
        const txParams = {
          to: context.accounts.owner.address,
          amount: context.initialSupply,
          data: ethers.utils.toUtf8Bytes('mint tokens for the owner'),
        };
        const operator = context.accounts.owner;

        const tx = await context.lsp7CompatibleERC20
          .connect(operator)
          .mint(txParams.to, txParams.amount, txParams.data);

        await expect(tx)
          .to.emit(
            context.lsp7CompatibleERC20,
            'Transfer(address,address,address,uint256,bool,bytes)',
          )
          .withArgs(
            operator.address,
            ethers.constants.AddressZero,
            txParams.to,
            txParams.amount,
            true,
            ethers.utils.hexlify(txParams.data),
          );

        await expect(tx)
          .to.emit(context.lsp7CompatibleERC20, 'Transfer(address,address,uint256)')
          .withArgs(ethers.constants.AddressZero, txParams.to, txParams.amount);
      });
    });
  });

  describe('burn', () => {
    describe('when a token is burned', () => {
      beforeEach(async () => {
        await context.lsp7CompatibleERC20.mint(
          context.accounts.owner.address,
          context.initialSupply,
          ethers.utils.toUtf8Bytes('mint tokens for owner'),
        );
      });

      it('should have expected events', async () => {
        const txParams = {
          from: context.accounts.owner.address,
          amount: context.initialSupply,
          data: ethers.utils.toUtf8Bytes('burn tokens from the owner'),
        };
        const operator = context.accounts.owner;

        const tx = await context.lsp7CompatibleERC20
          .connect(operator)
          .burn(txParams.from, txParams.amount, txParams.data);

        await expect(tx)
          .to.emit(
            context.lsp7CompatibleERC20,
            'Transfer(address,address,address,uint256,bool,bytes)',
          )
          .withArgs(
            operator.address,
            txParams.from,
            ethers.constants.AddressZero,
            txParams.amount,
            false,
            ethers.utils.hexlify(txParams.data),
          );

        await expect(tx)
          .to.emit(context.lsp7CompatibleERC20, 'Transfer(address,address,uint256)')
          .withArgs(txParams.from, ethers.constants.AddressZero, txParams.amount);
      });
    });
  });

  describe('transfers', () => {
    type TestDeployedContracts = {
      tokenReceiverWithLSP1: TokenReceiverWithLSP1;
      tokenReceiverWithoutLSP1: TokenReceiverWithoutLSP1;
    };
    let deployedContracts: TestDeployedContracts;

    beforeEach(async () => {
      deployedContracts = {
        tokenReceiverWithLSP1: await new TokenReceiverWithLSP1__factory(
          context.accounts.owner,
        ).deploy(),
        tokenReceiverWithoutLSP1: await new TokenReceiverWithoutLSP1__factory(
          context.accounts.owner,
        ).deploy(),
      };
    });

    beforeEach(async () => {
      // setup so we have tokens to transfer
      await context.lsp7CompatibleERC20.mint(
        context.accounts.owner.address,
        context.initialSupply,
        ethers.utils.toUtf8Bytes('mint tokens for the owner'),
      );

      // setup so we can observe allowance values during transfer tests
      await context.lsp7CompatibleERC20.approve(
        context.accounts.operator.address,
        context.initialSupply,
      );
    });

    type TransferParams = {
      // we make the operator of type SignerWithAddress because it is used to sign the transaction
      // when calling the contract via `contractName.connect(operator).functionName(...)`
      operator: SignerWithAddress;
      from: string;
      to: string;
      amount: BigNumber;
      force?: boolean;
      data?: string;
    };

    const transferSuccessScenario = async (
      txParams: TransferParams,
      sendTransaction: () => Promise<ContractTransaction>,
      expectedData: string,
    ) => {
      // pre-conditions
      const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
      const preAllowance = await context.lsp7CompatibleERC20.allowance(
        txParams.from,
        txParams.operator.address,
      );

      // effect
      const tx = await sendTransaction();
      await expect(tx)
        .to.emit(
          context.lsp7CompatibleERC20,
          'Transfer(address,address,address,uint256,bool,bytes)',
        )
        .withArgs(
          txParams.operator.address,
          txParams.from,
          txParams.to,
          txParams.amount,
          txParams.force ?? true,
          expectedData,
        );

      await expect(tx)
        .to.emit(context.lsp7CompatibleERC20, 'Transfer(address,address,uint256)')
        .withArgs(txParams.from, txParams.to, txParams.amount);

      // post-conditions
      const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
      expect(postBalanceOf).to.equal(preBalanceOf.sub(txParams.amount));

      if (txParams.operator.address !== txParams.from) {
        const postAllowance = await context.lsp7CompatibleERC20.allowance(
          txParams.from,
          txParams.operator.address,
        );
        expect(postAllowance).to.equal(preAllowance.sub(txParams.amount));

        // check for ERC20 Approval event
        await expect(tx)
          .to.emit(context.lsp7CompatibleERC20, 'Approval(address,address,uint256)')
          .withArgs(txParams.from, txParams.operator.address, postAllowance);
      }

      // if the recipient is a contract that implements LSP1,
      // CHECK that it emitted the UniversalReceiver event on the receiver end.
      const erc165Checker = await new CheckInterface__factory(context.accounts.owner).deploy();

      const isLSP1Recipient = await erc165Checker.supportsERC165InterfaceUnchecked(
        txParams.to,
        INTERFACE_IDS.LSP1UniversalReceiver,
      );

      if (isLSP1Recipient) {
        const receiver = await new TokenReceiverWithLSP1__factory(context.accounts.owner).attach(
          txParams.to,
        );

        await expect(tx).to.emit(receiver, 'UniversalReceiver');
      }
    };

    describe('ERC20 -> `transfer(address,uint256)`', () => {
      describe('when sender has enough balance', () => {
        const transferAmount = ethers.BigNumber.from('10');

        describe('when `to` is an EOA', () => {
          it('should allow transfering the tokens', async () => {
            const txParams = {
              operator: context.accounts.owner,
              from: context.accounts.owner.address,
              to: context.accounts.tokenReceiver.address,
              amount: transferAmount,
            };

            await transferSuccessScenario(
              txParams,
              () =>
                context.lsp7CompatibleERC20
                  .connect(txParams.operator)
                  ['transfer(address,uint256)'](txParams.to, txParams.amount),
              '0x',
            );
          });
        });

        describe('when `to` is a contract', () => {
          describe('when receiving contract supports LSP1', () => {
            it('should allow transfering the tokens', async () => {
              const txParams = {
                operator: context.accounts.owner,
                from: context.accounts.owner.address,
                to: deployedContracts.tokenReceiverWithLSP1.address,
                amount: transferAmount,
              };

              await transferSuccessScenario(
                txParams,
                () =>
                  context.lsp7CompatibleERC20
                    .connect(txParams.operator)
                    ['transfer(address,uint256)'](txParams.to, txParams.amount),
                '0x',
              );
            });
          });

          describe('when receiving contract does not support LSP1', () => {
            it('should allow transfering the tokens', async () => {
              const txParams = {
                operator: context.accounts.owner,
                from: context.accounts.owner.address,
                to: deployedContracts.tokenReceiverWithoutLSP1.address,
                amount: transferAmount,
              };

              await transferSuccessScenario(
                txParams,
                () =>
                  context.lsp7CompatibleERC20
                    .connect(txParams.operator)
                    ['transfer(address,uint256)'](txParams.to, txParams.amount),
                '0x',
              );
            });
          });
        });
      });

      describe('when sender does not have enough balance', () => {
        it("should revert with `LSP7AmountExceedsBalance` error if sending more tokens than the tokenOwner's balance", async () => {
          const ownerBalance = await context.lsp7CompatibleERC20.balanceOf(
            context.accounts.owner.address,
          );

          const txParams = {
            operator: context.accounts.owner,
            from: context.accounts.owner.address,
            to: deployedContracts.tokenReceiverWithoutLSP1.address,
            amount: ownerBalance.add(1),
          };

          // pre-conditions
          const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

          await expect(
            context.lsp7CompatibleERC20
              .connect(txParams.operator)
              ['transferFrom(address,address,uint256)'](
                txParams.from,
                txParams.to,
                txParams.amount,
              ),
          )
            .to.be.revertedWithCustomError(context.lsp7CompatibleERC20, 'LSP7AmountExceedsBalance')
            .withArgs(ownerBalance.toHexString(), txParams.from, txParams.amount.toHexString());

          // post-conditions
          const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
          expect(postBalanceOf).to.equal(preBalanceOf);
        });
      });
    });

    describe('ERC20 -> `transferFrom(address,address,uint256)`', () => {
      describe('when sender has enough balance', () => {
        const transferAmount = ethers.BigNumber.from('10');

        describe('when caller (msg.sender) is the `from` address', () => {
          describe('when `to` is an EOA', () => {
            it('should allow transfering the tokens', async () => {
              const txParams = {
                operator: context.accounts.owner,
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: transferAmount,
              };

              await transferSuccessScenario(
                txParams,
                () =>
                  context.lsp7CompatibleERC20
                    .connect(txParams.operator)
                    .transferFrom(txParams.from, txParams.to, txParams.amount),
                '0x',
              );
            });
          });

          describe('when `to` is a contract', () => {
            describe('when receiving contract supports LSP1', () => {
              it('should allow transfering the tokens', async () => {
                const txParams = {
                  operator: context.accounts.owner,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1.address,
                  amount: transferAmount,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      .transferFrom(txParams.from, txParams.to, txParams.amount),
                  '0x',
                );
              });
            });

            describe('when receiving contract does not support LSP1', () => {
              it('should allow transfering the tokens', async () => {
                const txParams = {
                  operator: context.accounts.owner,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1.address,
                  amount: transferAmount,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      .transferFrom(txParams.from, txParams.to, txParams.amount),
                  '0x',
                );
              });
            });
          });
        });

        describe('when caller (msg.sender) is an operator (= Not the `from` address)', () => {
          describe('when `to` is an EOA', () => {
            it('should allow transfering the tokens', async () => {
              const txParams = {
                operator: context.accounts.operator,
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: transferAmount,
              };

              await transferSuccessScenario(
                txParams,
                () =>
                  context.lsp7CompatibleERC20
                    .connect(txParams.operator)
                    .transferFrom(txParams.from, txParams.to, txParams.amount),
                '0x',
              );
            });
          });

          describe('when `to` is a contract', () => {
            describe('when receiving contract supports LSP1', () => {
              it('should allow transfering the tokens', async () => {
                const txParams = {
                  operator: context.accounts.operator,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1.address,
                  amount: transferAmount,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      .transferFrom(txParams.from, txParams.to, txParams.amount),
                  '0x',
                );
              });
            });

            describe('when receiving contract does not support LSP1', () => {
              it('should allow transfering the tokens', async () => {
                const txParams = {
                  operator: context.accounts.operator,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1.address,
                  amount: transferAmount,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      .transferFrom(txParams.from, txParams.to, txParams.amount),
                  '0x',
                );
              });
            });
          });
        });
      });

      describe('when sender does not have enough balance', () => {
        describe('when caller (msg.sender) is the `from` address', () => {
          it("should revert with `LSP7AmountExceedsBalance` error if sending more tokens than the tokenOwner's balance", async () => {
            const ownerBalance = await context.lsp7CompatibleERC20.balanceOf(
              context.accounts.owner.address,
            );

            const txParams = {
              operator: context.accounts.owner,
              from: context.accounts.owner.address,
              to: deployedContracts.tokenReceiverWithoutLSP1.address,
              amount: ownerBalance.add(1),
            };

            // pre-conditions
            const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

            await expect(
              context.lsp7CompatibleERC20
                .connect(txParams.operator)
                .transferFrom(txParams.from, txParams.to, txParams.amount),
            )
              .to.be.revertedWithCustomError(
                context.lsp7CompatibleERC20,
                'LSP7AmountExceedsBalance',
              )
              .withArgs(ownerBalance.toHexString(), txParams.from, txParams.amount.toHexString());

            // post-conditions
            const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
            expect(postBalanceOf).to.equal(preBalanceOf);
          });
        });

        describe('when caller (msg.sender) is an operator (= Not the `from` address)', () => {
          it("should revert with `LSP7AmountExceedsAuthorizedAmount` error if sending more tokens than the tokenOwner's balance", async () => {
            const ownerBalance = await context.lsp7CompatibleERC20.balanceOf(
              context.accounts.owner.address,
            );

            const txParams = {
              operator: context.accounts.operator,
              from: context.accounts.owner.address,
              to: deployedContracts.tokenReceiverWithoutLSP1.address,
              amount: ownerBalance.add(1),
            };

            // pre-conditions
            const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

            await expect(
              context.lsp7CompatibleERC20
                .connect(txParams.operator)
                .transferFrom(txParams.from, txParams.to, txParams.amount),
            )
              .to.be.revertedWithCustomError(
                context.lsp7CompatibleERC20,
                'LSP7AmountExceedsAuthorizedAmount',
              )
              .withArgs(
                context.accounts.owner.address,
                ownerBalance.toHexString(),
                txParams.operator.address,
                txParams.amount.toHexString(),
              );

            // post-conditions
            const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
            expect(postBalanceOf).to.equal(preBalanceOf);
          });
        });
      });
    });

    describe('LSP7 -> `transfer(address,address,uint256,bool,bytes)`', () => {
      const expectedData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP7 token transfer'));

      describe('when sender has enough balance', () => {
        const transferAmount = ethers.BigNumber.from('10');

        describe('when caller (msg.sender) is the `from` address', () => {
          describe('when `to` is an EOA', () => {
            it('should allow transfering the tokens with `force` param = true', async () => {
              const txParams = {
                operator: context.accounts.owner,
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: transferAmount,
                force: true,
                data: expectedData,
              };

              await transferSuccessScenario(
                txParams,
                () =>
                  context.lsp7CompatibleERC20
                    .connect(txParams.operator)
                    ['transfer(address,address,uint256,bool,bytes)'](
                      txParams.from,
                      txParams.to,
                      txParams.amount,
                      txParams.force,
                      txParams.data,
                    ),
                expectedData,
              );
            });

            it('should NOT allow transfering the tokens with `force` param = false', async () => {
              const txParams = {
                operator: context.accounts.owner,
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: transferAmount,
                force: false,
                data: expectedData,
              };

              // pre-conditions
              const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

              await expect(
                context.lsp7CompatibleERC20
                  .connect(txParams.operator)
                  ['transfer(address,address,uint256,bool,bytes)'](
                    txParams.from,
                    txParams.to,
                    txParams.amount,
                    txParams.force,
                    txParams.data,
                  ),
              )
                .to.be.revertedWithCustomError(
                  context.lsp7CompatibleERC20,
                  'LSP7NotifyTokenReceiverIsEOA',
                )
                .withArgs(txParams.to);

              // post-conditions
              const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
              expect(postBalanceOf).to.equal(preBalanceOf);
            });
          });

          describe('when `to` is a contract', () => {
            describe('when receiving contract supports LSP1', () => {
              it('should allow transfering the tokens with `force` param = true', async () => {
                const txParams = {
                  operator: context.accounts.owner,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1.address,
                  amount: transferAmount,
                  force: true,
                  data: expectedData,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      ['transfer(address,address,uint256,bool,bytes)'](
                        txParams.from,
                        txParams.to,
                        txParams.amount,
                        txParams.force,
                        txParams.data,
                      ),
                  expectedData,
                );
              });

              it('should allow transfering the tokens with `force` param = false', async () => {
                const txParams = {
                  operator: context.accounts.owner,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1.address,
                  amount: transferAmount,
                  force: false,
                  data: expectedData,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      ['transfer(address,address,uint256,bool,bytes)'](
                        txParams.from,
                        txParams.to,
                        txParams.amount,
                        txParams.force,
                        txParams.data,
                      ),
                  expectedData,
                );
              });
            });

            describe('when receiving contract does not support LSP1', () => {
              it('should allow transfering the tokens with `force` param = true', async () => {
                const txParams = {
                  operator: context.accounts.owner,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1.address,
                  amount: transferAmount,
                  force: true,
                  data: expectedData,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      ['transfer(address,address,uint256,bool,bytes)'](
                        txParams.from,
                        txParams.to,
                        txParams.amount,
                        txParams.force,
                        txParams.data,
                      ),
                  expectedData,
                );
              });

              it('should NOT allow transfering the tokens with `force` param = false', async () => {
                const txParams = {
                  operator: context.accounts.owner,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1.address,
                  amount: transferAmount,
                  force: false,
                  data: expectedData,
                };

                // pre-conditions
                const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

                await expect(
                  context.lsp7CompatibleERC20
                    .connect(txParams.operator)
                    ['transfer(address,address,uint256,bool,bytes)'](
                      txParams.from,
                      txParams.to,
                      txParams.amount,
                      txParams.force,
                      txParams.data,
                    ),
                )
                  .to.be.revertedWithCustomError(
                    context.lsp7CompatibleERC20,
                    'LSP7NotifyTokenReceiverContractMissingLSP1Interface',
                  )
                  .withArgs(txParams.to);

                // post-conditions
                const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
                expect(postBalanceOf).to.equal(preBalanceOf);
              });
            });
          });
        });

        describe('when caller (msg.sender) is an operator (= Not the `from` address)', () => {
          describe('when `to` is an EOA', () => {
            it('should allow transfering the tokens with `force` param = true', async () => {
              const txParams = {
                operator: context.accounts.operator,
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: transferAmount,
                force: true,
                data: expectedData,
              };

              await transferSuccessScenario(
                txParams,
                () =>
                  context.lsp7CompatibleERC20
                    .connect(txParams.operator)
                    ['transfer(address,address,uint256,bool,bytes)'](
                      txParams.from,
                      txParams.to,
                      txParams.amount,
                      txParams.force,
                      txParams.data,
                    ),
                expectedData,
              );
            });

            it('should NOT allow transfering the tokens with `force` param = false', async () => {
              const txParams = {
                operator: context.accounts.operator,
                from: context.accounts.owner.address,
                to: context.accounts.tokenReceiver.address,
                amount: transferAmount,
                force: false,
                data: expectedData,
              };

              // pre-conditions
              const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

              await expect(
                context.lsp7CompatibleERC20
                  .connect(txParams.operator)
                  ['transfer(address,address,uint256,bool,bytes)'](
                    txParams.from,
                    txParams.to,
                    txParams.amount,
                    txParams.force,
                    txParams.data,
                  ),
              )
                .to.be.revertedWithCustomError(
                  context.lsp7CompatibleERC20,
                  'LSP7NotifyTokenReceiverIsEOA',
                )
                .withArgs(txParams.to);

              // post-conditions
              const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
              expect(postBalanceOf).to.equal(preBalanceOf);
            });
          });

          describe('when `to` is a contract', () => {
            describe('when receiving contract supports LSP1', () => {
              it('should allow transfering the tokens with `force` param = true', async () => {
                const txParams = {
                  operator: context.accounts.operator,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1.address,
                  amount: transferAmount,
                  force: true,
                  data: expectedData,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      ['transfer(address,address,uint256,bool,bytes)'](
                        txParams.from,
                        txParams.to,
                        txParams.amount,
                        txParams.force,
                        txParams.data,
                      ),
                  expectedData,
                );
              });

              it('should allow transfering the tokens with `force` param = false', async () => {
                const txParams = {
                  operator: context.accounts.operator,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithLSP1.address,
                  amount: transferAmount,
                  force: false,
                  data: expectedData,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      ['transfer(address,address,uint256,bool,bytes)'](
                        txParams.from,
                        txParams.to,
                        txParams.amount,
                        txParams.force,
                        txParams.data,
                      ),
                  expectedData,
                );
              });
            });

            describe('when receiving contract does not support LSP1', () => {
              it('should allow transfering the tokens with `force` param = true', async () => {
                const txParams = {
                  operator: context.accounts.operator,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1.address,
                  amount: transferAmount,
                  force: true,
                  data: expectedData,
                };

                await transferSuccessScenario(
                  txParams,
                  () =>
                    context.lsp7CompatibleERC20
                      .connect(txParams.operator)
                      ['transfer(address,address,uint256,bool,bytes)'](
                        txParams.from,
                        txParams.to,
                        txParams.amount,
                        txParams.force,
                        txParams.data,
                      ),
                  expectedData,
                );
              });

              it('should NOT allow transfering the tokens with `force` param = false', async () => {
                const txParams = {
                  operator: context.accounts.operator,
                  from: context.accounts.owner.address,
                  to: deployedContracts.tokenReceiverWithoutLSP1.address,
                  amount: transferAmount,
                  force: false,
                  data: expectedData,
                };

                // pre-conditions
                const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

                await expect(
                  context.lsp7CompatibleERC20
                    .connect(txParams.operator)
                    ['transfer(address,address,uint256,bool,bytes)'](
                      txParams.from,
                      txParams.to,
                      txParams.amount,
                      txParams.force,
                      txParams.data,
                    ),
                )
                  .to.be.revertedWithCustomError(
                    context.lsp7CompatibleERC20,
                    'LSP7NotifyTokenReceiverContractMissingLSP1Interface',
                  )
                  .withArgs(txParams.to);

                // post-conditions
                const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
                expect(postBalanceOf).to.equal(preBalanceOf);
              });
            });
          });
        });
      });

      describe('when sender does not have enough balance', () => {
        describe('when caller (msg.sender) is the `from` address', () => {
          it("should revert with `LSP7AmountExceedsBalance` error if sending more tokens than the tokenOwner's balance", async () => {
            const ownerBalance = await context.lsp7CompatibleERC20.balanceOf(
              context.accounts.owner.address,
            );

            const txParams = {
              operator: context.accounts.owner,
              from: context.accounts.owner.address,
              to: deployedContracts.tokenReceiverWithoutLSP1.address,
              amount: ownerBalance.add(1),
              force: true,
              data: expectedData,
            };

            // pre-conditions
            const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

            await expect(
              context.lsp7CompatibleERC20
                .connect(txParams.operator)
                ['transfer(address,address,uint256,bool,bytes)'](
                  txParams.from,
                  txParams.to,
                  txParams.amount,
                  txParams.force,
                  txParams.data,
                ),
            )
              .to.be.revertedWithCustomError(
                context.lsp7CompatibleERC20,
                'LSP7AmountExceedsBalance',
              )
              .withArgs(ownerBalance.toHexString(), txParams.from, txParams.amount.toHexString());

            // post-conditions
            const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
            expect(postBalanceOf).to.equal(preBalanceOf);
          });
        });

        describe('when caller (msg.sender) is an operator (= Not the `from` address)', () => {
          it("should revert with `LSP7AmountExceedsAuthorizedAmount` error if sending more tokens than the tokenOwner's balance", async () => {
            const ownerBalance = await context.lsp7CompatibleERC20.balanceOf(
              context.accounts.owner.address,
            );

            const txParams = {
              operator: context.accounts.operator,
              from: context.accounts.owner.address,
              to: deployedContracts.tokenReceiverWithoutLSP1.address,
              amount: ownerBalance.add(1),
              force: true,
              data: expectedData,
            };

            // pre-conditions
            const preBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);

            await expect(
              context.lsp7CompatibleERC20
                .connect(txParams.operator)
                ['transfer(address,address,uint256,bool,bytes)'](
                  txParams.from,
                  txParams.to,
                  txParams.amount,
                  txParams.force,
                  txParams.data,
                ),
            )
              .to.be.revertedWithCustomError(
                context.lsp7CompatibleERC20,
                'LSP7AmountExceedsAuthorizedAmount',
              )
              .withArgs(
                context.accounts.owner.address,
                ownerBalance.toHexString(),
                txParams.operator.address,
                txParams.amount.toHexString(),
              );

            // post-conditions
            const postBalanceOf = await context.lsp7CompatibleERC20.balanceOf(txParams.from);
            expect(postBalanceOf).to.equal(preBalanceOf);
          });
        });
      });
    });
  });
};

export type LSP7InitializeTestContext = {
  lsp7CompatibleERC20: LSP7CompatibleERC20;
  deployParams: LSP7CompatibleERC20DeployParams;
  initializeTransaction: TransactionResponse;
};

export const shouldInitializeLikeLSP7CompatibleERC20 = (
  buildContext: () => Promise<LSP7InitializeTestContext>,
) => {
  let context: LSP7InitializeTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('should support ERC20 interface', async () => {
      expect(await context.lsp7CompatibleERC20.supportsInterface(INTERFACE_IDS.ERC20)).to.be.true;
    });

    it('should support ERC20Metadata interface', async () => {
      expect(await context.lsp7CompatibleERC20.supportsInterface(INTERFACE_IDS.ERC20Metadata)).to.be
        .true;
    });

    it('should support LSP7 interface', async () => {
      expect(await context.lsp7CompatibleERC20.supportsInterface(INTERFACE_IDS.LSP7DigitalAsset)).to
        .be.true;
    });

    it('should have set expected entries with ERC725Y.setData', async () => {
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7CompatibleERC20, 'DataChanged')
        .withArgs(
          SupportedStandards.LSP4DigitalAsset.key,
          SupportedStandards.LSP4DigitalAsset.value,
        );
      expect(
        await context.lsp7CompatibleERC20.getData(SupportedStandards.LSP4DigitalAsset.key),
      ).to.equal(SupportedStandards.LSP4DigitalAsset.value);

      const nameKey = ERC725YDataKeys.LSP4.LSP4TokenName;
      const expectedNameValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.name),
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7CompatibleERC20, 'DataChanged')
        .withArgs(nameKey, expectedNameValue);
      expect(await context.lsp7CompatibleERC20.getData(nameKey)).to.equal(expectedNameValue);

      const symbolKey = ERC725YDataKeys.LSP4.LSP4TokenSymbol;
      const expectedSymbolValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(context.deployParams.symbol),
      );
      await expect(context.initializeTransaction)
        .to.emit(context.lsp7CompatibleERC20, 'DataChanged')
        .withArgs(symbolKey, expectedSymbolValue);
      expect(await context.lsp7CompatibleERC20.getData(symbolKey)).to.equal(expectedSymbolValue);
    });

    describe('when using the functions from IERC20Metadata', () => {
      it('should allow reading `name()`', async () => {
        // using compatibility getter -> returns(string)
        const nameAsString = await context.lsp7CompatibleERC20.name();
        expect(nameAsString).to.equal(context.deployParams.name);

        // using getData -> returns(bytes)
        const nameAsBytes = await context.lsp7CompatibleERC20.getData(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('LSP4TokenName')),
        );

        expect(ethers.utils.toUtf8String(nameAsBytes)).to.equal(context.deployParams.name);
      });

      it('should allow reading `symbol()`', async () => {
        // using compatibility getter -> returns(string)
        const symbolAsString = await context.lsp7CompatibleERC20.symbol();
        expect(symbolAsString).to.equal(context.deployParams.symbol);

        // using getData -> returns(bytes)
        const symbolAsBytes = await context.lsp7CompatibleERC20.getData(
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes('LSP4TokenSymbol')),
        );

        expect(ethers.utils.toUtf8String(symbolAsBytes)).to.equal(context.deployParams.symbol);
      });
    });
  });
};
