import { expect } from 'chai';
import { ethers } from 'hardhat';

import {
  LSP17ExtendableTester,
  LSP17ExtendableTester__factory,
  EmitEventExtension,
  EmitEventExtension__factory,
  RevertErrorsTestExtension,
  RevertErrorsTestExtension__factory,
} from '../../types';

describe('LSP17Extendable - Basic Implementation', () => {
  let accounts;

  let lsp17Implementation: LSP17ExtendableTester;
  let exampleExtension: EmitEventExtension;
  let errorsExtension: RevertErrorsTestExtension;

  const selectorWithExtensionAndNoTransferValue =
    EmitEventExtension__factory.createInterface().getSighash('emitEvent');
  const selectorWithNoExtension = '0xdeadbeef';

  // selectors to test that errors are bubbled up to the contract
  const revertErrorsExtensionInterface = RevertErrorsTestExtension__factory.createInterface();

  const selectorRevertCustomError =
    revertErrorsExtensionInterface.getSighash('revertWithCustomError');

  const selectorRevertErrorString =
    revertErrorsExtensionInterface.getSighash('revertWithErrorString');

  const selectorRevertPanicError =
    revertErrorsExtensionInterface.getSighash('revertWithPanicError');

  const selectorRevertNoErrorData =
    revertErrorsExtensionInterface.getSighash('revertWithNoErrorData');

  before('setup', async () => {
    accounts = await ethers.getSigners();

    lsp17Implementation = await new LSP17ExtendableTester__factory(accounts[0]).deploy();
    exampleExtension = await new EmitEventExtension__factory(accounts[0]).deploy();
    errorsExtension = await new RevertErrorsTestExtension__factory(accounts[0]).deploy();

    await lsp17Implementation.setExtension(
      selectorWithExtensionAndNoTransferValue,
      exampleExtension.address,
      false,
    );

    await lsp17Implementation.setExtension(
      selectorRevertCustomError,
      errorsExtension.address,
      false,
    );
    await lsp17Implementation.setExtension(
      selectorRevertErrorString,
      errorsExtension.address,
      false,
    );
    await lsp17Implementation.setExtension(
      selectorRevertPanicError,
      errorsExtension.address,
      false,
    );
    await lsp17Implementation.setExtension(
      selectorRevertNoErrorData,
      errorsExtension.address,
      false,
    );
  });

  // make sure storage is cleared before running each test
  afterEach(async () => {
    await lsp17Implementation.setStorageData('0x');
    await lsp17Implementation.setAnotherStorageData('0x');
  });

  describe('when there is no extension set', () => {
    it('should revert with error `NoExtensionFoundForFunctionSelector', async () => {
      await expect(
        accounts[0].sendTransaction({
          to: lsp17Implementation.address,
          data: selectorWithNoExtension,
        }),
      ).to.be.revertedWithCustomError(lsp17Implementation, 'NoExtensionFoundForFunctionSelector');
    });
  });

  describe('when there is an extension set', () => {
    describe('if the extension does not revert', () => {
      it('should pass and not revert', async () => {
        await expect(
          accounts[0].sendTransaction({
            to: lsp17Implementation.address,
            data: selectorWithExtensionAndNoTransferValue,
          }),
        ).to.emit(exampleExtension, 'EventEmittedInExtension');
      });

      describe('if there is any code logic that run after extension was called', () => {
        it("should have updated the contract's storage after the fallback LSP17 function ran", async () => {
          const storageBefore = await lsp17Implementation.getStorageData();
          expect(storageBefore).to.equal('0x');

          const anotherStorageBefore = await lsp17Implementation.getAnotherStorageData();
          expect(anotherStorageBefore).to.equal('0x');

          await accounts[0].sendTransaction({
            to: lsp17Implementation.address,
            data: selectorWithExtensionAndNoTransferValue,
          });

          const storageAfter = await lsp17Implementation.getStorageData();
          expect(storageAfter).to.equal('updated BEFORE calling `_fallbackLSP17Extendable`');

          const anotherStorageAfter = await lsp17Implementation.getAnotherStorageData();
          expect(anotherStorageAfter).to.equal('updated AFTER calling `_fallbackLSP17Extendable`');
        });
      });
    });

    describe('if the extension revert', () => {
      it('should bubble up custom errors', async () => {
        await expect(
          accounts[0].sendTransaction({
            to: lsp17Implementation.address,
            data: selectorRevertCustomError,
          }),
        )
          .to.be.revertedWithCustomError(errorsExtension, 'SomeCustomError')
          .withArgs(lsp17Implementation.address);
      });

      it('should bubble up revert errors string', async () => {
        await expect(
          accounts[0].sendTransaction({
            to: lsp17Implementation.address,
            data: selectorRevertErrorString,
          }),
        ).to.be.revertedWith('some error message');
      });

      it('should bubble up Panic type errors with their code', async () => {
        await expect(
          accounts[0].sendTransaction({
            to: lsp17Implementation.address,
            data: selectorRevertPanicError,
          }),
        ).to.be.revertedWithPanic('0x11' || 17);
      });

      it('should not bubble up anything with empty error data (`revert()`)', async () => {
        await expect(
          accounts[0].sendTransaction({
            to: lsp17Implementation.address,
            data: selectorRevertNoErrorData,
          }),
        ).to.be.reverted;
      });
    });
  });
});
