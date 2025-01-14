import { expect } from 'chai';
import { ethers } from 'hardhat';

// constants
import { ERC725YDataKeys } from '../../../../constants';
import { OPERATION_TYPES } from '@lukso/lsp0-contracts';
import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';

// setup
import { LSP6TestContext } from '../../../utils/context';
import { setupKeyManager } from '../../../utils/fixtures';
import { abiCoder, provider } from '../../../utils/helpers';
import {
  LSP7Mintable,
  LSP7MintableInit,
  LSP7MintableInit__factory,
  LSP7Mintable__factory,
} from '../../../../typechain';

export const shouldBehaveLikeBatchExecute = (
  buildContext: (initialFunding?: bigint) => Promise<LSP6TestContext>,
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
    context = await buildContext(ethers.parseEther('50'));

    // main controller permissions are already set in the fixture
    await setupKeyManager(context, [], []);

    // deploy some sample LSP7 tokens and mint some tokens to the UP
    lyxDaiToken = await new LSP7Mintable__factory(context.accounts[0]).deploy(
      'LYX DAI Invented Token',
      'LYXDAI',
      context.accounts[0].address,
      LSP4_TOKEN_TYPES.TOKEN,
      false,
    );

    metaCoin = await new LSP7Mintable__factory(context.accounts[0]).deploy(
      'Meta Coin',
      'MTC',
      context.accounts[0].address,
      LSP4_TOKEN_TYPES.TOKEN,
      false,
    );

    rLyxToken = await new LSP7Mintable__factory(context.accounts[0]).deploy(
      'LUKSO Relay Token',
      'rLYX',
      context.accounts[0].address,
      LSP4_TOKEN_TYPES.TOKEN,
      false,
    );

    await lyxDaiToken.mint(await context.universalProfile.getAddress(), 100, false, '0x');
    await metaCoin.mint(await context.universalProfile.getAddress(), 100, false, '0x');
    await rLyxToken.mint(await context.universalProfile.getAddress(), 100, false, '0x');
  });

  describe('example scenarios', () => {
    it('should send LYX to 3x different addresses', async () => {
      const { universalProfile } = context;

      const operations = [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL];

      const recipients = [
        context.accounts[1].address,
        context.accounts[2].address,
        context.accounts[3].address,
      ];

      const amounts = [ethers.parseEther('1'), ethers.parseEther('2'), ethers.parseEther('3')];

      const data = ['0x', '0x', '0x'];

      const tx = await universalProfile
        .connect(context.mainController)
        .executeBatch(operations, recipients, amounts, data);

      await expect(tx).to.changeEtherBalance(
        await context.universalProfile.getAddress(),
        ethers.parseEther('-6'),
      );
      await expect(tx).to.changeEtherBalances(recipients, amounts);
    });

    it('should send LYX + some LSP7 tokens to the same address', async () => {
      const { universalProfile } = context;

      const recipient = context.accounts[1].address;
      const lyxAmount = ethers.parseEther('3');
      const daiAmount = 25;

      // CHECK balance fo LYX and DAI before transfer
      expect(await lyxDaiToken.balanceOf(await context.universalProfile.getAddress())).to.equal(
        100,
      );
      expect(await lyxDaiToken.balanceOf(recipient)).to.equal(0);

      const lyxDaiTransferPayload = lyxDaiToken.interface.encodeFunctionData('transfer', [
        await context.universalProfile.getAddress(),
        recipient,
        daiAmount,
        true,
        '0x',
      ]);

      const operationTypes = [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL];

      const targets = [recipient, lyxDaiToken.target];

      const values = [lyxAmount, 0];

      const payloads = [
        // LYX transfer (no data)
        '0x',
        // token transfer payload
        lyxDaiTransferPayload,
      ];

      const tx = await universalProfile
        .connect(context.mainController)
        .executeBatch(operationTypes, targets, values, payloads);

      await expect(tx).to.changeEtherBalances(
        [recipient, await universalProfile.getAddress()],
        [lyxAmount, `-${lyxAmount}`],
      );
      expect(await lyxDaiToken.balanceOf(recipient)).to.equal(daiAmount);
      expect(await lyxDaiToken.balanceOf(await universalProfile.getAddress())).to.equal(75);
    });

    it('should send 3x different tokens to the same recipient', async () => {
      const { universalProfile } = context;

      const recipient = context.accounts[1].address;

      const universalProfileLyxDaiBalanceBefore = await lyxDaiToken.balanceOf(
        await universalProfile.getAddress(),
      );
      const recipientLyxDaiBalanceBefore = await lyxDaiToken.balanceOf(recipient);
      const universalProfileMetaCoinBalanceBefore = await metaCoin.balanceOf(
        await universalProfile.getAddress(),
      );
      const recipientMetaCoinBalanceBefore = await metaCoin.balanceOf(recipient);
      const universalProfileRLyxBalanceBefore = await rLyxToken.balanceOf(
        await universalProfile.getAddress(),
      );
      const recipientRLyxBalanceBefore = await rLyxToken.balanceOf(recipient);

      const lyxDaiAmount = 25;
      const metaCoinAmount = 50;
      const rLyxAmount = 75;

      // prettier-ignore
      const lyxDaiTransferPayload = lyxDaiToken.interface.encodeFunctionData(
        "transfer",
        [await context.universalProfile.getAddress(), recipient, lyxDaiAmount, true, "0x"]
      );

      // prettier-ignore
      const metaCoinTransferPayload = metaCoin.interface.encodeFunctionData(
        "transfer",
        [await context.universalProfile.getAddress(), recipient, metaCoinAmount, true, "0x"]
      );

      const rLYXTransferPayload = metaCoin.interface.encodeFunctionData('transfer', [
        await context.universalProfile.getAddress(),
        recipient,
        rLyxAmount,
        true,
        '0x',
      ]);

      const operationTypes = [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL];

      const targets = [lyxDaiToken.target, metaCoin.target, rLyxToken.target];

      const values = [0, 0, 0];

      const payloads = [lyxDaiTransferPayload, metaCoinTransferPayload, rLYXTransferPayload];

      await universalProfile
        .connect(context.mainController)
        .executeBatch(operationTypes, targets, values, payloads);

      expect(await lyxDaiToken.balanceOf(await universalProfile.getAddress())).to.equal(
        universalProfileLyxDaiBalanceBefore - BigInt(lyxDaiAmount),
      );
      expect(await lyxDaiToken.balanceOf(recipient)).to.equal(
        recipientLyxDaiBalanceBefore + BigInt(lyxDaiAmount),
      );
      expect(await metaCoin.balanceOf(await universalProfile.getAddress())).to.equal(
        universalProfileMetaCoinBalanceBefore - BigInt(metaCoinAmount),
      );
      expect(await metaCoin.balanceOf(recipient)).to.equal(
        recipientMetaCoinBalanceBefore + BigInt(metaCoinAmount),
      );
      expect(await rLyxToken.balanceOf(await universalProfile.getAddress())).to.equal(
        universalProfileRLyxBalanceBefore - BigInt(rLyxAmount),
      );
      expect(await rLyxToken.balanceOf(recipient)).to.equal(
        recipientRLyxBalanceBefore + BigInt(rLyxAmount),
      );
    });

    it('should 1) deploy a LSP7 Token (as minimal proxy), 2) initialize it, and 3) set the token metadata', async () => {
      const lsp7MintableBase = await new LSP7MintableInit__factory(context.accounts[0]).deploy();

      const lsp7TokenProxyBytecode = String(
        '0x3d602d80600a3d3981f3363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe5af43d82803e903d91602b57fd5bf3',
      ).replace(
        'bebebebebebebebebebebebebebebebebebebebe',
        (await lsp7MintableBase.getAddress()).substring(2),
      );

      const futureTokenAddress = await context.universalProfile
        .connect(context.mainController)
        .execute.staticCall(OPERATION_TYPES.CREATE, ethers.ZeroAddress, 0, lsp7TokenProxyBytecode);

      const futureTokenInstance = new LSP7MintableInit__factory(context.accounts[0]).attach(
        futureTokenAddress,
      ) as LSP7MintableInit;

      const lsp7InitializePayload = futureTokenInstance.interface.encodeFunctionData('initialize', [
        'My LSP7 UP Token',
        'UPLSP7',
        await context.universalProfile.getAddress(),
        LSP4_TOKEN_TYPES.TOKEN,
        false,
      ]);

      // use interface of an existing token contract
      const tokenMetadataValue =
        '0x6f357c6aba20e595da5f38e6c75326802bbf871b4d98b5bfab27812a5456139e3ec087f4697066733a2f2f516d6659696d3146647a645a6747314a50484c46785a3964575a7761616f68596e4b626174797871553144797869';

      const lsp7SetDataPayload = futureTokenInstance.interface.encodeFunctionData('setData', [
        ERC725YDataKeys.LSP4['LSP4Metadata'],
        tokenMetadataValue,
      ]);

      const tx = await context.universalProfile
        .connect(context.mainController)
        .executeBatch(
          [OPERATION_TYPES.CREATE, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
          [ethers.ZeroAddress, futureTokenAddress, futureTokenAddress],
          [0, 0, 0],
          [lsp7TokenProxyBytecode, lsp7InitializePayload, lsp7SetDataPayload],
        );

      // CHECK that token contract has been deployed
      await expect(tx).to.emit(context.universalProfile, 'ContractCreated').withArgs(
        OPERATION_TYPES.CREATE,
        ethers.getAddress(futureTokenAddress),
        0,
        ethers.zeroPadValue('0x00', 32), // salt
      );

      // CHECK initialize parameters have been set correctly
      const nameResult = await futureTokenInstance.getData(ERC725YDataKeys.LSP4['LSP4TokenName']);
      const symbolResult = await futureTokenInstance.getData(
        ERC725YDataKeys.LSP4['LSP4TokenSymbol'],
      );

      expect(ethers.toUtf8String(nameResult)).to.equal('My LSP7 UP Token');
      expect(ethers.toUtf8String(symbolResult)).to.equal('UPLSP7');
      expect(await futureTokenInstance.owner()).to.equal(
        await context.universalProfile.getAddress(),
      );

      // CHECK LSP4 token metadata has been set
      expect(await futureTokenInstance.getData(ERC725YDataKeys.LSP4['LSP4Metadata'])).to.equal(
        tokenMetadataValue,
      );
    });

    it('should 1) deploy a LSP7 token, 2) mint some tokens, 3) `transferBatch(...)` to multiple recipients', async () => {
      // step 1 - deploy token contract
      const lsp7ConstructorArguments = abiCoder.encode(
        ['string', 'string', 'address', 'uint256', 'bool'],
        [
          'My UP LSP7 Token',
          'UPLSP7',
          await context.universalProfile.getAddress(),
          LSP4_TOKEN_TYPES.TOKEN,
          false,
        ],
      );

      // we simulate deploying the token contract to know the future address of the LSP7 Token contract,
      // so that we can then pass the token address to the `to` parameter of ERC725X.execute(...)
      // in the 2nd and 3rd payloads of the LSP6 batch `execute(bytes[])`
      const futureTokenAddress = await context.universalProfile
        .connect(context.mainController)
        .execute.staticCall(
          OPERATION_TYPES.CREATE,
          ethers.ZeroAddress,
          0,
          LSP7Mintable__factory.bytecode + lsp7ConstructorArguments.substring(2),
        );

      // step 2 - mint some tokens
      // use the interface of an existing token for encoding the function call
      const lsp7MintingPayload = lyxDaiToken.interface.encodeFunctionData('mint', [
        await context.universalProfile.getAddress(),
        3_000,
        false,
        '0x',
      ]);

      // step 3 - transfer batch to multiple addresses
      const sender = await context.universalProfile.getAddress();
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

      const tx = await context.universalProfile
        .connect(context.mainController)
        .executeBatch(
          [OPERATION_TYPES.CREATE, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
          [ethers.ZeroAddress, futureTokenAddress, futureTokenAddress],
          [0, 0, 0],
          [
            LSP7Mintable__factory.bytecode + lsp7ConstructorArguments.substring(2),
            lsp7MintingPayload,
            lsp7TransferBatchPayload,
          ],
        );

      // CHECK for `ContractCreated` event
      await expect(tx).to.emit(context.universalProfile, 'ContractCreated').withArgs(
        OPERATION_TYPES.CREATE,
        ethers.getAddress(futureTokenAddress),
        0,
        ethers.zeroPadValue('0x00', 32), // salt
      );

      // CHECK for tokens balances of recipients
      const createdTokenContract = (await new LSP7Mintable__factory(context.accounts[0]).attach(
        futureTokenAddress,
      )) as LSP7Mintable;
      expect([
        await createdTokenContract.balanceOf(recipients[0]),
        await createdTokenContract.balanceOf(recipients[1]),
        await createdTokenContract.balanceOf(recipients[2]),
      ]).to.deep.equal(amounts);
    });
  });

  describe('when wrong parameters are passed', () => {
    it('should revert if the passed arrays are empty', async () => {
      await expect(
        context.universalProfile.executeBatch([], [], [], []),
      ).to.be.revertedWithCustomError(context.keyManager, 'ERC725X_ExecuteParametersEmptyArray');
    });

    it('should revert if an array length is different than others', async () => {
      const operationTypes = [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL];
      const calees = [
        context.accounts[0].address,
        context.accounts[1].address,
        context.accounts[2].address,
      ];
      const values = [0, 0, 0];
      const callDatas = ['0x', '0x', '0x'];

      await expect(
        context.universalProfile.executeBatch(
          operationTypes.slice(0, -1),
          calees,
          values,
          callDatas,
        ),
      ).to.be.revertedWithCustomError(
        context.keyManager,
        'ERC725X_ExecuteParametersLengthMismatch',
      );

      await expect(
        context.universalProfile.executeBatch(
          operationTypes,
          calees.slice(0, -1),
          values,
          callDatas,
        ),
      ).to.be.revertedWithCustomError(
        context.keyManager,
        'ERC725X_ExecuteParametersLengthMismatch',
      );

      await expect(
        context.universalProfile.executeBatch(
          operationTypes,
          calees,
          values.slice(0, -1),
          callDatas,
        ),
      ).to.be.revertedWithCustomError(
        context.keyManager,
        'ERC725X_ExecuteParametersLengthMismatch',
      );

      await expect(
        context.universalProfile.executeBatch(
          operationTypes,
          calees,
          values,
          callDatas.slice(0, -1),
        ),
      ).to.be.revertedWithCustomError(
        context.keyManager,
        'ERC725X_ExecuteParametersLengthMismatch',
      );
    });
  });

  describe('when one of the payload reverts', () => {
    it('should revert the whole transaction if first payload reverts', async () => {
      const upBalance = await provider.getBalance(await context.universalProfile.getAddress());

      const validAmount = ethers.parseEther('1');
      expect(validAmount).to.be.lt(upBalance); // sanity check

      // make it revert by sending too much value than the actual balance
      const invalidAmount = upBalance + BigInt(10);

      const randomRecipient = ethers.Wallet.createRandom().address;

      await expect(
        context.universalProfile
          .connect(context.mainController)
          .executeBatch(
            [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
            [randomRecipient, randomRecipient, randomRecipient],
            [invalidAmount, validAmount, validAmount],
            ['0x', '0x', '0x'],
          ),
      ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_InsufficientBalance');
    });

    it('should revert the whole transaction if last payload reverts', async () => {
      const upBalance = await provider.getBalance(await context.universalProfile.getAddress());

      const validAmount = ethers.parseEther('1');
      expect(validAmount).to.be.lt(upBalance); // sanity check

      // make it revert by sending too much value than the actual balance
      const invalidAmount = upBalance + BigInt(10);

      const randomRecipient = ethers.Wallet.createRandom().address;

      await expect(
        context.universalProfile
          .connect(context.mainController)
          .executeBatch(
            [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
            [randomRecipient, randomRecipient, randomRecipient],
            [invalidAmount, validAmount, validAmount],
            ['0x', '0x', '0x'],
          ),
      ).to.be.revertedWithCustomError(context.universalProfile, 'ERC725X_InsufficientBalance');
    });
  });

  describe('when one of the payload is a delegate call', () => {
    it('should revert the whole transaction', async () => {
      const upBalance = await provider.getBalance(await context.universalProfile.getAddress());

      const validAmount = ethers.parseEther('1');
      expect(validAmount).to.be.lt(upBalance); // sanity check

      const randomRecipient = ethers.Wallet.createRandom().address;

      await expect(
        context.universalProfile
          .connect(context.mainController)
          .executeBatch(
            [OPERATION_TYPES.CALL, OPERATION_TYPES.DELEGATECALL, OPERATION_TYPES.CALL],
            [randomRecipient, randomRecipient, randomRecipient],
            [validAmount, validAmount, validAmount],
            ['0x', '0x', '0x'],
          ),
      ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');
    });

    it('should revert the whole transaction when calling through `batchCalls`', async () => {
      const upBalance = await provider.getBalance(await context.universalProfile.getAddress());

      const validAmount = ethers.parseEther('1');
      expect(validAmount).to.be.lt(upBalance); // sanity check

      const randomRecipient = ethers.Wallet.createRandom().address;

      const calldata = context.universalProfile.interface.encodeFunctionData('executeBatch', [
        [OPERATION_TYPES.CALL, OPERATION_TYPES.DELEGATECALL, OPERATION_TYPES.CALL],
        [randomRecipient, randomRecipient, randomRecipient],
        [validAmount, validAmount, validAmount],
        ['0x', '0x', '0x'],
      ]);

      await expect(
        context.universalProfile.connect(context.mainController).batchCalls([calldata]),
      ).to.be.revertedWithCustomError(context.keyManager, 'DelegateCallDisallowedViaKeyManager');
    });
  });
};
