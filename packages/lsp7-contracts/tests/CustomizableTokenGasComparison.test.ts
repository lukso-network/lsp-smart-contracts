import { expect } from 'chai';
import { parseEther } from 'ethers';
import { network } from 'hardhat';
import type { HardhatEthers, HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/types';
import {
    type LSP7MintableInit,
    LSP7MintableInit__factory,
    type CustomizableTokenInit,
    LSP7CustomizableTokenInit__factory,
} from '../types/ethers-contracts/index.js';

import { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts/constants';

import { deployProxy } from '../../lsp-smart-contracts/tests/utils/fixtures.js';

describe('Gas Comparison: LSP7MintableInit vs CustomizableTokenInit', () => {
    let ethers: HardhatEthers;
    let owner: HardhatEthersSigner;
    let recipient: HardhatEthersSigner;

    const TOKEN_NAME = 'Test Token';
    const TOKEN_SYMBOL = 'TEST';
    const INITIAL_MINT_AMOUNT = parseEther('1000');
    const TRANSFER_AMOUNT = parseEther('100');

    before(async () => {
        ({ ethers } = await network.connect());
        [owner, recipient] = await ethers.getSigners();
    });

    describe('Deployment and Initialization', () => {
        it('should deploy both contracts as minimal proxies and compare gas costs', async () => {
            // Deploy base implementation contracts
            const lsp7MintableInitBase = await new LSP7MintableInit__factory(owner).deploy();
            const customizableTokenInitBase = await new LSP7CustomizableTokenInit__factory(owner).deploy();

            const lsp7MintableInitBaseAddress = await lsp7MintableInitBase.getAddress();
            const customizableTokenInitBaseAddress = await customizableTokenInitBase.getAddress();

            console.log('\n=== Implementation Deployment ===');
            console.log('LSP7MintableInit implementation:', lsp7MintableInitBaseAddress);
            console.log('CustomizableTokenInit implementation:', customizableTokenInitBaseAddress);

            // Deploy minimal proxies
            const lsp7MintableProxyAddress = await deployProxy(lsp7MintableInitBaseAddress, owner);
            const customizableTokenProxyAddress = await deployProxy(
                customizableTokenInitBaseAddress,
                owner,
            );

            console.log('\n=== Proxy Deployment ===');
            console.log('LSP7MintableInit proxy:', lsp7MintableProxyAddress);
            console.log('CustomizableTokenInit proxy:', customizableTokenProxyAddress);

            // Attach contracts to proxy addresses
            const lsp7MintableInit: LSP7MintableInit = LSP7MintableInit__factory.connect(
                lsp7MintableProxyAddress,
                owner,
            );
            const customizableTokenInit: CustomizableTokenInit = LSP7CustomizableTokenInit__factory.connect(
                customizableTokenProxyAddress,
                owner,
            );

            // Initialize LSP7MintableInit
            const lsp7InitTx = await lsp7MintableInit.initialize(
                TOKEN_NAME,
                TOKEN_SYMBOL,
                owner.address,
                LSP4_TOKEN_TYPES.TOKEN,
                false, // isNonDivisible
                true, // mintable
            );
            const lsp7InitReceipt = await lsp7InitTx.wait();
            const lsp7InitGasUsed = lsp7InitReceipt?.gasUsed || 0n;

            console.log('\n=== Initialization Gas Costs ===');
            console.log('LSP7MintableInit initialization gas:', lsp7InitGasUsed.toString());

            // Initialize CustomizableTokenInit
            const customizableInitTx = await customizableTokenInit.initialize(
                TOKEN_NAME,
                TOKEN_SYMBOL,
                owner.address,
                LSP4_TOKEN_TYPES.TOKEN,
                false, // isNonDivisible
                {
                    isMintable: true,
                    initialMintAmount: INITIAL_MINT_AMOUNT,
                }, // MintableParams
                {
                    isTransferable: true,
                    transferLockStart: 0n,
                    transferLockEnd: 0n,
                }, // NonTransferableParams
                {
                    tokenBalanceCap: 0n,
                    tokenSupplyCap: 0n,
                }, // CappedParams
            );
            const customizableInitReceipt = await customizableInitTx.wait();
            const customizableInitGasUsed = customizableInitReceipt?.gasUsed || 0n;

            console.log('CustomizableTokenInit initialization gas:', customizableInitGasUsed.toString());
            console.log(
                'Gas difference (CustomizableTokenInit - LSP7MintableInit):',
                (customizableInitGasUsed - lsp7InitGasUsed).toString(),
            );

            // Verify initialization
            expect(await lsp7MintableInit.owner()).to.equal(owner.address);
            expect(await customizableTokenInit.owner()).to.equal(owner.address);
            expect(await lsp7MintableInit.isMintable()).to.be.true;
            expect(await customizableTokenInit.isMintable()).to.be.true;
            expect(await customizableTokenInit.isTransferable()).to.be.true;

            // Verify initial mint for CustomizableTokenInit
            expect(await customizableTokenInit.balanceOf(owner.address)).to.equal(INITIAL_MINT_AMOUNT);
            expect(await customizableTokenInit.totalSupply()).to.equal(INITIAL_MINT_AMOUNT);

            // Mint tokens to LSP7MintableInit
            const lsp7MintTx = await lsp7MintableInit.mint(owner.address, INITIAL_MINT_AMOUNT, true, '0x');
            const lsp7MintReceipt = await lsp7MintTx.wait();
            const lsp7MintGasUsed = lsp7MintReceipt?.gasUsed || 0n;

            console.log('\n=== Minting Gas Costs ===');
            console.log('LSP7MintableInit mint gas:', lsp7MintGasUsed.toString());

            // Mint additional tokens to CustomizableTokenInit (to match the same total)
            const customizableMintTx = await customizableTokenInit.mint(
                owner.address,
                INITIAL_MINT_AMOUNT,
                true,
                '0x',
            );
            const customizableMintReceipt = await customizableMintTx.wait();
            const customizableMintGasUsed = customizableMintReceipt?.gasUsed || 0n;

            console.log('CustomizableTokenInit mint gas:', customizableMintGasUsed.toString());
            console.log(
                'Gas difference (CustomizableTokenInit - LSP7MintableInit):',
                (customizableMintGasUsed - lsp7MintGasUsed).toString(),
            );

            // Verify balances
            expect(await lsp7MintableInit.balanceOf(owner.address)).to.equal(INITIAL_MINT_AMOUNT);
            expect(await customizableTokenInit.balanceOf(owner.address)).to.equal(
                INITIAL_MINT_AMOUNT * 2n,
            );

            // Perform transfers and compare gas costs
            console.log('\n=== Transfer Gas Costs ===');

            // Transfer from LSP7MintableInit
            const lsp7TransferTx = await lsp7MintableInit.transfer(
                owner.address,
                recipient.address,
                TRANSFER_AMOUNT,
                true,
                '0x',
            );
            const lsp7TransferReceipt = await lsp7TransferTx.wait();
            const lsp7TransferGasUsed = lsp7TransferReceipt?.gasUsed || 0n;

            console.log('LSP7MintableInit transfer gas:', lsp7TransferGasUsed.toString());

            // Transfer from CustomizableTokenInit
            const customizableTransferTx = await customizableTokenInit.transfer(
                owner.address,
                recipient.address,
                TRANSFER_AMOUNT,
                true,
                '0x',
            );
            const customizableTransferReceipt = await customizableTransferTx.wait();
            const customizableTransferGasUsed = customizableTransferReceipt?.gasUsed || 0n;

            console.log('CustomizableTokenInit transfer gas:', customizableTransferGasUsed.toString());
            console.log(
                'Gas difference (CustomizableTokenInit - LSP7MintableInit):',
                (customizableTransferGasUsed - lsp7TransferGasUsed).toString(),
            );

            // Verify transfers
            expect(await lsp7MintableInit.balanceOf(recipient.address)).to.equal(TRANSFER_AMOUNT);
            expect(await customizableTokenInit.balanceOf(recipient.address)).to.equal(TRANSFER_AMOUNT);
            expect(await lsp7MintableInit.balanceOf(owner.address)).to.equal(
                INITIAL_MINT_AMOUNT - TRANSFER_AMOUNT,
            );
            expect(await customizableTokenInit.balanceOf(owner.address)).to.equal(
                INITIAL_MINT_AMOUNT * 2n - TRANSFER_AMOUNT,
            );

            console.log('\n=== Summary ===');
            console.log('Total initialization gas difference:', (customizableInitGasUsed - lsp7InitGasUsed).toString());
            console.log('Total mint gas difference:', (customizableMintGasUsed - lsp7MintGasUsed).toString());
            console.log('Total transfer gas difference:', (customizableTransferGasUsed - lsp7TransferGasUsed).toString());
        });
    });
});
