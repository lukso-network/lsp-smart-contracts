import { expect } from 'chai';
import { ethers } from 'hardhat';
import { BigNumber } from 'ethers';

// constants
import { ALL_PERMISSIONS, ERC725YDataKeys, OPERATION_TYPES } from '../../../constants';

// setup
import { LSP6TestContext } from '../../utils/context';
import { setupKeyManager } from '../../utils/fixtures';
import { abiCoder, provider } from '../../utils/helpers';
import { LSP7Mintable, LSP7MintableInit__factory, LSP7Mintable__factory } from '../../../types';

export const shouldBehaveLikeBatchExecute = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
) => {
  let context: LSP6TestContext;

  // a fictional DAI token on LUKSO
  let lyxDaiToken: LSP7Mintable,
    // a basic sample token
    metaCoin: LSP7Mintable,
    // a token that can be used as credits for a LUKSO relay service.
    // Inspired from https://github.com/lykhonis/relayer
    rLyxToken: LSP7Mintable;

  before(async () => {
    context = await buildContext(ethers.utils.parseEther('50'));

    const permissionKeys = [
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        context.mainController.address.substring(2),
    ];

    const permissionsValues = [ALL_PERMISSIONS];

    await setupKeyManager(context, permissionKeys, permissionsValues);

    // deploy some sample LSP7 tokens and mint some tokens to the UP
    lyxDaiToken = await new LSP7Mintable__factory(context.accounts[0]).deploy(
      'LYX DAI Invented Token',
      'LYXDAI',
      context.accounts[0].address,
      false,
    );

    metaCoin = await new LSP7Mintable__factory(context.accounts[0]).deploy(
      'Meta Coin',
      'MTC',
      context.accounts[0].address,
      false,
    );

    rLyxToken = await new LSP7Mintable__factory(context.accounts[0]).deploy(
      'LUKSO Relay Token',
      'rLYX',
      context.accounts[0].address,
      false,
    );

    await lyxDaiToken.mint(context.universalProfile.address, 100, false, '0x');
    await metaCoin.mint(context.universalProfile.address, 100, false, '0x');
    await rLyxToken.mint(context.universalProfile.address, 100, false, '0x');
  });

  describe('example scenarios', () => {
    it('should send LYX to 3x different addresses', async () => {
      const { universalProfile } = context;

      const recipients = [
        context.accounts[1].address,
        context.accounts[2].address,
        context.accounts[3].address,
      ];

      const amounts = [
        ethers.utils.parseEther('1'),
        ethers.utils.parseEther('2'),
        ethers.utils.parseEther('3'),
      ];

      const batchExecutePayloads = recipients.map((recipient, index) => {
        return universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          recipient,
          amounts[index],
          '0x',
        ]);
      });

      const tx = await context.keyManager
        .connect(context.mainController)
        .executeBatch([0, 0, 0], batchExecutePayloads);

      await expect(tx).to.changeEtherBalance(
        context.universalProfile.address,
        ethers.utils.parseEther('-6'),
      );
      await expect(tx).to.changeEtherBalances(recipients, amounts);
    });

    it('should send LYX + some LSP7 tokens to the same address', async () => {
      expect(await lyxDaiToken.balanceOf(context.universalProfile.address)).to.equal(100);

      const recipient = context.accounts[1].address;
      const lyxAmount = ethers.utils.parseEther('3');
      const lyxDaiAmount = 25;

      const lyxDaiTransferPayload = lyxDaiToken.interface.encodeFunctionData('transfer', [
        context.universalProfile.address,
        recipient,
        lyxDaiAmount,
        true,
        '0x',
      ]);

      const payloads = [
        context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          recipient,
          lyxAmount,
          '0x',
        ]),
        context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          lyxDaiToken.address,
          0,
          lyxDaiTransferPayload,
        ]),
      ];

      const tx = await context.keyManager
        .connect(context.mainController)
        .executeBatch([0, 0], payloads);

      await expect(tx).to.changeEtherBalance(recipient, lyxAmount);
      expect(await lyxDaiToken.balanceOf(recipient)).to.equal(lyxDaiAmount);
    });

    it('should send 3x different tokens to the same recipient', async () => {
      const recipient = context.accounts[1].address;

      const recipientLyxDaiBalanceBefore = await lyxDaiToken.balanceOf(recipient);
      const recipientMetaCoinBalanceBefore = await metaCoin.balanceOf(recipient);
      const recipientRLyxBalanceBefore = await rLyxToken.balanceOf(recipient);

      const lyxDaiAmount = 25;
      const metaCoinAmount = 50;
      const rLyxAmount = 75;

      // prettier-ignore
      const lyxDaiTransferPayload = lyxDaiToken.interface.encodeFunctionData(
        "transfer",
        [context.universalProfile.address, recipient, lyxDaiAmount, true, "0x"]
      );

      // prettier-ignore
      const metaCoinTransferPayload = metaCoin.interface.encodeFunctionData(
        "transfer",
        [context.universalProfile.address, recipient, metaCoinAmount, true, "0x"]
      );

      const rLYXTransferPayload = metaCoin.interface.encodeFunctionData('transfer', [
        context.universalProfile.address,
        recipient,
        rLyxAmount,
        true,
        '0x',
      ]);

      const payloads = [
        context.universalProfile.interface.encodeFunctionData(
          'execute',
          [OPERATION_TYPES.CALL, lyxDaiToken.address, 0, lyxDaiTransferPayload], // prettier-ignore
        ),
        context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          metaCoin.address,
          0,
          metaCoinTransferPayload,
        ]),
        context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          rLyxToken.address,
          0,
          rLYXTransferPayload,
        ]),
      ];

      await context.keyManager.connect(context.mainController).executeBatch([0, 0, 0], payloads);

      expect(await lyxDaiToken.balanceOf(recipient)).to.equal(
        recipientLyxDaiBalanceBefore.add(lyxDaiAmount),
      );
      expect(await metaCoin.balanceOf(recipient)).to.equal(
        recipientMetaCoinBalanceBefore.add(metaCoinAmount),
      );
      expect(await rLyxToken.balanceOf(recipient)).to.equal(
        recipientRLyxBalanceBefore.add(rLyxAmount),
      );
    });

    it('should 1) deploy a LSP7 Token (as minimal proxy), 2) initialize it, and 3) set the token metadata', async () => {
      const lsp7MintableBase = await new LSP7MintableInit__factory(context.accounts[0]).deploy();

      const lsp7TokenProxyBytecode = String(
        '0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3',
      ).replace('bebebebebebebebebebebebebebebebebebebebe', lsp7MintableBase.address.substring(2));

      const lsp7ProxyDeploymentPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [OPERATION_TYPES.CREATE, ethers.constants.AddressZero, 0, lsp7TokenProxyBytecode],
      );

      const callResult = await context.keyManager
        .connect(context.mainController)
        .callStatic.execute(lsp7ProxyDeploymentPayload);

      const [futureTokenAddress] = abiCoder.decode(['bytes'], callResult);

      const futureTokenInstance = await new LSP7MintableInit__factory(context.accounts[0]).attach(
        futureTokenAddress,
      );

      const lsp7InitializePayload = futureTokenInstance.interface.encodeFunctionData('initialize', [
        'My LSP7 UP Token',
        'UPLSP7',
        context.universalProfile.address,
        false,
      ]);

      // use interface of an existing token contract
      const initializePayload = context.universalProfile.interface.encodeFunctionData('execute', [
        OPERATION_TYPES.CALL,
        futureTokenAddress,
        0,
        lsp7InitializePayload,
      ]);

      const tokenMetadataValue =
        '0x6f357c6aba20e595da5f38e6c75326802bbf871b4d98b5bfab27812a5456139e3ec087f4697066733a2f2f516d6659696d3146647a645a6747314a50484c46785a3964575a7761616f68596e4b626174797871553144797869';

      const lsp7SetDataPayload = futureTokenInstance.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP4['LSP4Metadata'],
        tokenMetadataValue,
      ]);
      const setTokenMetadataPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [OPERATION_TYPES.CALL, futureTokenAddress, 0, lsp7SetDataPayload],
      );

      const tx = await context.keyManager.connect(context.mainController).executeBatch(
        [0, 0, 0],
        [
          // Step 1 - deploy Token contract as proxy
          lsp7ProxyDeploymentPayload,
          // Step 2 - initialize Token contract
          initializePayload,
          // Step 3 - set Token Metadata
          setTokenMetadataPayload,
        ],
      );

      // CHECK that token contract has been deployed
      await expect(tx)
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(futureTokenAddress),
          0,
          ethers.utils.hexZeroPad('0x00', 32),
        );

      // CHECK initialize parameters have been set correctly
      const nameResult = await futureTokenInstance.getData(ERC725YDataKeys.LSP4['LSP4TokenName']);
      const symbolResult = await futureTokenInstance.getData(
        ERC725YDataKeys.LSP4['LSP4TokenSymbol'],
      );

      expect(ethers.utils.toUtf8String(nameResult)).to.equal('My LSP7 UP Token');
      expect(ethers.utils.toUtf8String(symbolResult)).to.equal('UPLSP7');
      expect(await futureTokenInstance.owner()).to.equal(context.universalProfile.address);

      // CHECK LSP4 token metadata has been set
      expect(await futureTokenInstance.getData(ERC725YDataKeys.LSP4['LSP4Metadata'])).to.equal(
        tokenMetadataValue,
      );
    });

    it('should 1) deploy a LSP7 token, 2) mint some tokens, 3) `transferBatch(...)` to multiple recipients', async () => {
      // step 1 - deploy token contract
      const lsp7ConstructorArguments = abiCoder.encode(
        ['string', 'string', 'address', 'bool'],
        ['My UP LSP7 Token', 'UPLSP7', context.universalProfile.address, false],
      );

      const lsp7DeploymentPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [
          OPERATION_TYPES.CREATE,
          ethers.constants.AddressZero,
          0,
          LSP7Mintable__factory.bytecode + lsp7ConstructorArguments.substring(2),
        ],
      );

      // we simulate deploying the token contract to know the future address of the LSP7 Token contract,
      // so that we can then pass the token address to the `to` parameter of ERC725X.execute(...)
      // in the 2nd and 3rd payloads of the LSP6 batch `execute(bytes[])`
      const callResult = await context.keyManager
        .connect(context.mainController)
        .callStatic.execute(lsp7DeploymentPayload);

      const [futureTokenAddress] = abiCoder.decode(['bytes'], callResult);

      // step 2 - mint some tokens
      // use the interface of an existing token for encoding the function call
      const lsp7MintingPayload = lyxDaiToken.interface.encodeFunctionData('mint', [
        context.universalProfile.address,
        3_000,
        false,
        '0x',
      ]);

      // step 3 - transfer batch to multiple addresses
      const sender = context.universalProfile.address;
      const recipients = [
        context.accounts[1].address,
        context.accounts[2].address,
        context.accounts[3].address,
      ];
      const amounts = [1_000, 1_000, 1_000];

      const lsp7TransferBatchPayload = lyxDaiToken.interface.encodeFunctionData('transferBatch', [
        [sender, sender, sender], // address[] memory from,
        recipients, // address[] memory to,
        amounts, // uint256[] memory amount,
        [true, true, true], // bool[] memory force,
        ['0x', '0x', '0x'], // bytes[] memory data
      ]);

      const payloads = [
        // step 1 - deploy token contract
        lsp7DeploymentPayload,
        // step 2 - mint some tokens for the UP
        context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          futureTokenAddress,
          0,
          lsp7MintingPayload,
        ]),
        // step 3 - `transferBatch(...)` the tokens to multiple addresses
        context.universalProfile.interface.encodeFunctionData('execute', [
          OPERATION_TYPES.CALL,
          futureTokenAddress,
          0,
          lsp7TransferBatchPayload,
        ]),
      ];

      const tx = await context.keyManager
        .connect(context.mainController)
        .executeBatch([0, 0, 0], payloads);

      // CHECK for `ContractCreated` event
      await expect(tx)
        .to.emit(context.universalProfile, 'ContractCreated')
        .withArgs(
          OPERATION_TYPES.CREATE,
          ethers.utils.getAddress(futureTokenAddress),
          0,
          ethers.utils.hexZeroPad('0x00', 32),
        );

      // CHECK for tokens balances of recipients
      const createdTokenContract = await new LSP7Mintable__factory(context.accounts[0]).attach(
        futureTokenAddress,
      );
      expect([
        await createdTokenContract.balanceOf(recipients[0]),
        await createdTokenContract.balanceOf(recipients[1]),
        await createdTokenContract.balanceOf(recipients[2]),
      ]).to.deep.equal(amounts);
    });
  });

  describe('when specifying msg.value', () => {
    describe('when all the payloads are setData(...)', () => {
      describe('if specifying 0 for each values[index]', () => {
        it('should revert and not leave any funds locked on the Key Manager', async () => {
          const amountToFund = ethers.utils.parseEther('5');

          const dataKeys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key1')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key2')),
          ];
          const dataValues = ['0xaaaaaaaa', '0xbbbbbbbb'];

          const keyManagerBalanceBefore = await ethers.provider.getBalance(
            context.keyManager.address,
          );

          const firstSetDataPayload = context.universalProfile.interface.encodeFunctionData(
            'setData',
            [dataKeys[0], dataValues[0]],
          );

          const secondSetDataPayload = context.universalProfile.interface.encodeFunctionData(
            'setData',
            [dataKeys[1], dataValues[1]],
          );

          // this error occurs when calling `setData(...)` with msg.value,
          // since these functions on ERC725Y are not payable
          await expect(
            context.keyManager
              .connect(context.mainController)
              .executeBatch([0, 0], [firstSetDataPayload, secondSetDataPayload], {
                value: amountToFund,
              }),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'LSP6BatchExcessiveValueSent')
            .withArgs(0, amountToFund);

          const keyManagerBalanceAfter = await ethers.provider.getBalance(
            context.keyManager.address,
          );

          expect(keyManagerBalanceAfter).to.equal(keyManagerBalanceBefore);

          // the Key Manager must not hold any funds and must always forward any funds sent to it.
          // it's balance must always be 0 after any execution
          expect(await provider.getBalance(context.keyManager.address)).to.equal(0);
        });
      });

      describe('if specifying some value for each values[index]', () => {
        it('should pass when sending value while setting data', async () => {
          const msgValues = [ethers.utils.parseEther('2'), ethers.utils.parseEther('2')];
          const totalMsgValue = msgValues.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          const dataKeys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key1')),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key2')),
          ];
          const dataValues = ['0xaaaaaaaa', '0xbbbbbbbb'];

          const firstSetDataPayload = context.universalProfile.interface.encodeFunctionData(
            'setData',
            [dataKeys[0], dataValues[0]],
          );

          const secondSetDataPayload = context.universalProfile.interface.encodeFunctionData(
            'setData',
            [dataKeys[1], dataValues[1]],
          );

          await expect(
            context.keyManager
              .connect(context.mainController)
              .executeBatch(msgValues, [firstSetDataPayload, secondSetDataPayload], {
                value: totalMsgValue,
              }),
          ).to.changeEtherBalances([context.universalProfile.address], [totalMsgValue]);

          expect(await context.universalProfile.getDataBatch(dataKeys)).to.deep.equal(dataValues);
        });
      });
    });

    describe('when sending 2x payloads, 1st for `setData`, 2nd for `execute`', () => {
      describe('when `msgValues[1]` is zero for `setData(...)`', () => {
        it('should pass', async () => {
          const recipient = context.accounts[5].address;

          const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Sample Data Key'));
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(10));

          const msgValues = [ethers.BigNumber.from(0), ethers.BigNumber.from('5')];

          const payloads = [
            context.universalProfile.interface.encodeFunctionData('setData', [dataKey, dataValue]),
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              recipient,
              msgValues[1],
              '0x',
            ]),
          ];

          const totalValues = msgValues.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          await expect(
            context.keyManager.connect(context.mainController).executeBatch(msgValues, payloads, {
              value: totalValues,
            }),
          ).to.changeEtherBalances([context.universalProfile.address, recipient], msgValues);

          expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);
        });
      });

      describe('when `msgValues[1]` is NOT zero for `setData(...)`', () => {
        it('should pass and increase the UP balance', async () => {
          const recipient = context.accounts[5].address;

          const dataKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Sample Data Key'));
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(10));

          const msgValues = [ethers.BigNumber.from(5), ethers.BigNumber.from('5')];

          const payloads = [
            context.universalProfile.interface.encodeFunctionData('setData', [dataKey, dataValue]),
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              recipient,
              msgValues[1],
              '0x',
            ]),
          ];

          const totalValues = msgValues.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          await context.keyManager
            .connect(context.mainController)
            .executeBatch(msgValues, payloads, {
              value: totalValues,
            });

          await expect(
            context.keyManager.connect(context.mainController).executeBatch(msgValues, payloads, {
              value: totalValues,
            }),
          ).to.changeEtherBalances([context.universalProfile.address, recipient], msgValues);

          expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);
        });
      });
    });

    describe('when sending 3x payloads', () => {
      describe('when total `values[]` is LESS than `msg.value`', () => {
        it('should revert because insufficent `msg.value`', async () => {
          const firstRecipient = context.accounts[3].address;
          const secondRecipient = context.accounts[4].address;
          const thirdRecipient = context.accounts[5].address;

          const amountsToTransfer = [
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ];

          const values = [
            ethers.utils.parseEther('2'),
            ethers.utils.parseEther('2'),
            ethers.utils.parseEther('2'),
          ];

          const totalValues = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          // total of values[] - 1. To check we are not sending enough fuds
          const msgValue = totalValues.sub(1);

          const payloads = [
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              firstRecipient,
              amountsToTransfer[0],
              '0x',
            ]),
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              secondRecipient,
              amountsToTransfer[1],
              '0x',
            ]),
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              thirdRecipient,
              amountsToTransfer[2],
              '0x',
            ]),
          ];

          await expect(
            context.keyManager.connect(context.mainController).executeBatch(values, payloads, {
              value: msgValue,
            }),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'LSP6BatchInsufficientValueSent')
            .withArgs(totalValues, msgValue);
        });
      });

      describe('when total `values[]` is MORE than `msg.value`', () => {
        it('should revert to not leave any remaining funds on the Key Manager', async () => {
          const firstRecipient = context.accounts[3].address;
          const secondRecipient = context.accounts[4].address;
          const thirdRecipient = context.accounts[5].address;

          const amountsToTransfer = [
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
            ethers.utils.parseEther('1'),
          ];

          const values = [
            ethers.utils.parseEther('2'),
            ethers.utils.parseEther('2'),
            ethers.utils.parseEther('2'),
          ];

          const totalValues = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          // total of values[] + 1. To check we cannot send to much funds and leave some in the Key Manager
          const msgValue = totalValues.add(1);

          const payloads = [
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              firstRecipient,
              amountsToTransfer[0],
              '0x',
            ]),
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              secondRecipient,
              amountsToTransfer[1],
              '0x',
            ]),
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              thirdRecipient,
              amountsToTransfer[2],
              '0x',
            ]),
          ];

          await expect(
            context.keyManager.connect(context.mainController).executeBatch(values, payloads, {
              value: msgValue,
            }),
          )
            .to.be.revertedWithCustomError(context.keyManager, 'LSP6BatchExcessiveValueSent')
            .withArgs(totalValues, msgValue);
        });
      });

      describe('when total `values[]` is EQUAL to `msg.value`', () => {
        it('should pass', async () => {
          const firstRecipient = context.accounts[3].address;
          const secondRecipient = context.accounts[4].address;
          const thirdRecipient = context.accounts[5].address;

          const amountsToTransfer = [
            ethers.utils.parseEther('2'),
            ethers.utils.parseEther('2'),
            ethers.utils.parseEther('2'),
          ];

          const values = [
            ethers.utils.parseEther('2'),
            ethers.utils.parseEther('2'),
            ethers.utils.parseEther('2'),
          ];

          const totalValues = values.reduce((accumulator, currentValue) =>
            accumulator.add(currentValue),
          );

          const payloads = [
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              firstRecipient,
              amountsToTransfer[0],
              '0x',
            ]),
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              secondRecipient,
              amountsToTransfer[1],
              '0x',
            ]),
            context.universalProfile.interface.encodeFunctionData('execute', [
              OPERATION_TYPES.CALL,
              thirdRecipient,
              amountsToTransfer[2],
              '0x',
            ]),
          ];

          const tx = await context.keyManager
            .connect(context.mainController)
            .executeBatch(values, payloads, {
              value: totalValues,
            });

          await expect(tx).to.changeEtherBalances(
            [context.universalProfile.address, firstRecipient, secondRecipient, thirdRecipient],
            [0, amountsToTransfer[0], amountsToTransfer[1], amountsToTransfer[2]],
          );
        });
      });
    });
  });

  describe('when one of the payload reverts', () => {
    it('should revert the whole transaction if first payload reverts', async () => {
      const upBalance = await provider.getBalance(context.universalProfile.address);

      const validAmount = ethers.utils.parseEther('1');
      expect(validAmount).to.be.lt(upBalance); // sanity check

      // make it revert by sending too much value than the actual balance
      const invalidAmount = upBalance.add(10);

      const randomRecipient = ethers.Wallet.createRandom().address;

      const failingTransferPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, '0x'],
      );

      const firstTransferPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [OPERATION_TYPES.CALL, randomRecipient, validAmount, '0x'],
      );

      const secondTransferPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [OPERATION_TYPES.CALL, randomRecipient, validAmount, '0x'],
      );

      await expect(
        context.keyManager
          .connect(context.mainController)
          .executeBatch(
            [0, 0, 0],
            [failingTransferPayload, firstTransferPayload, secondTransferPayload],
          ),
      ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_InsufficientBalance');
    });

    it('should revert the whole transaction if last payload reverts', async () => {
      const upBalance = await provider.getBalance(context.universalProfile.address);

      const validAmount = ethers.utils.parseEther('1');
      expect(validAmount).to.be.lt(upBalance); // sanity check

      // make it revert by sending too much value than the actual balance
      const invalidAmount = upBalance.add(10);

      const randomRecipient = ethers.Wallet.createRandom().address;

      const failingTransferPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [OPERATION_TYPES.CALL, randomRecipient, invalidAmount, '0x'],
      );

      const firstTransferPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [OPERATION_TYPES.CALL, randomRecipient, validAmount, '0x'],
      );

      const secondTransferPayload = context.universalProfile.interface.encodeFunctionData(
        'execute',
        [OPERATION_TYPES.CALL, randomRecipient, validAmount, '0x'],
      );

      await expect(
        context.keyManager
          .connect(context.mainController)
          .executeBatch(
            [0, 0, 0],
            [firstTransferPayload, secondTransferPayload, failingTransferPayload],
          ),
      ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_InsufficientBalance');
    });
  });
};
