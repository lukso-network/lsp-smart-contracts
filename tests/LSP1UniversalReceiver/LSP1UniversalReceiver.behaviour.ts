import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// types
import { ILSP1UniversalReceiver, UniversalReceiverTester } from "../types";

// helpers
import { LSP1_HOOK_PLACEHOLDER } from "../utils/helpers";

// constants
import { EventSignatures } from "../../constants";

export type LSP1TestContext = {
  accounts: SignerWithAddress[];
  // contract that implement the LSP1 - Universal Receiver interface
  lsp1Implementation: ILSP1UniversalReceiver;
  // contract that call the `universalReceiver(...)` function (for testing)
  lsp1Checker: UniversalReceiverTester;
};

export const shouldBehaveLikeLSP1 = (
  buildContext: () => Promise<LSP1TestContext>
) => {
  let context: LSP1TestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when calling the `universalReceiver(...)` function", () => {
    describe("from an EOA", () => {
      it("should emit a UniversalReceiver(...) event with correct topics", async () => {
        let caller = context.accounts[2];

        let tx = await context.lsp1Implementation
          .connect(caller)
          .universalReceiver(LSP1_HOOK_PLACEHOLDER, "0x");

        let receipt = await tx.wait();

        // event should come from hte lsp1Implementation
        expect(receipt.logs[0].address).toEqual(
          context.lsp1Implementation.address
        );

        // should be the Universal Receiver event (= event signature)
        expect(receipt.logs[0].topics[0]).toEqual(
          EventSignatures.LSP1["UniversalReceiver"]
        );

        // from
        expect(receipt.logs[0].topics[1]).toEqual(
          ethers.utils.hexZeroPad(caller.address.toLowerCase(), 32)
        );

        // typeId
        expect(receipt.logs[0].topics[2]).toEqual(LSP1_HOOK_PLACEHOLDER);

        // receivedData
        expect(receipt.logs[0].data).toEqual(
          "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"
        );
      });
    });

    describe("from a Contract", () => {
      describe("via a contract call - `contract.universalReceiver(...)`", () => {
        it("should emit an UniversalReceiver(...) event", async () => {
          let tx = await context.lsp1Checker.checkImplementation(
            context.lsp1Implementation.address,
            LSP1_HOOK_PLACEHOLDER
          );

          let receipt = await tx.wait();

          // event should come from account
          expect(receipt.logs[0].address).toEqual(
            context.lsp1Implementation.address
          );
          // should be the Universal Receiver event (= event signature)
          expect(receipt.logs[0].topics[0]).toEqual(
            EventSignatures.LSP1["UniversalReceiver"]
          );
          // from
          expect(receipt.logs[0].topics[1]).toEqual(
            ethers.utils.hexZeroPad(
              context.lsp1Checker.address.toLowerCase(),
              32
            )
          );
          // typeId
          expect(receipt.logs[0].topics[2]).toEqual(LSP1_HOOK_PLACEHOLDER);
          // receivedData
          expect(receipt.logs[0].data).toEqual(
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"
          );
        });
      });

      describe("via a low-level call - `address(contract).call(...)`", () => {
        it("should emit an UniversalReceiver(...) event", async () => {
          let tx = await context.lsp1Checker.checkImplementationLowLevelCall(
            context.lsp1Implementation.address,
            LSP1_HOOK_PLACEHOLDER
          );

          let receipt = await tx.wait();

          // event should come from account
          expect(receipt.logs[0].address).toEqual(
            context.lsp1Implementation.address
          );
          // should be the Universal Receiver event (= event signature)
          expect(receipt.logs[0].topics[0]).toEqual(
            EventSignatures.LSP1["UniversalReceiver"]
          );
          // from
          expect(receipt.logs[0].topics[1]).toEqual(
            ethers.utils.hexZeroPad(
              context.lsp1Checker.address.toLowerCase(),
              32
            )
          );
          // typeId
          expect(receipt.logs[0].topics[2]).toEqual(LSP1_HOOK_PLACEHOLDER);
          // receivedData
          expect(receipt.logs[0].data).toEqual(
            "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"
          );
        });
      });

      /**
       * @todo
       * test returned value of the `universalReceiver(...)` function
       * using `lsp1Checker.callImplementationAndReturn(...)`
       *
       */
    });
  });
};
