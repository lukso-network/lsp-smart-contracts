import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// types
import { ILSP1UniversalReceiver, UniversalReceiverTester } from "../types";

// helpers
import { abiCoder, LSP1_HOOK_PLACEHOLDER } from "../utils/helpers";

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
    const valueSent = 0;

    describe("from an EOA", () => {
      it("should emit a UniversalReceiver(...) event with correct topics", async () => {
        let caller = context.accounts[2];

        let tx = await context.lsp1Implementation
          .connect(caller)
          .universalReceiver(LSP1_HOOK_PLACEHOLDER, "0x", {
            value: valueSent,
          });

        let receipt = await tx.wait();

        // event should come from the lsp1Implementation
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

        // value + receivedData (any parameter not index)
        const dataField = abiCoder.encode(
          ["uint256", "bytes"],
          [valueSent, "0x"]
        );
        expect(receipt.logs[0].data).toEqual(dataField);
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

          // value + receivedData (any parameter not index)
          const dataField = abiCoder.encode(
            ["uint256", "bytes"],
            [valueSent, "0x"]
          );
          expect(receipt.logs[0].data).toEqual(dataField);
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

          // value + receivedData (any parameter not index)
          const dataField = abiCoder.encode(
            ["uint256", "bytes"],
            [valueSent, "0x"]
          );
          expect(receipt.logs[0].data).toEqual(dataField);
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

  describe("when calling the `universalReceiver(...)` function while sending native tokens", () => {
    const valueSent = ethers.utils.parseEther("3");

    describe("from an EOA", () => {
      it("should emit a UniversalReceiver(...) event with correct topics", async () => {
        let caller = context.accounts[2];

        let tx = await context.lsp1Implementation
          .connect(caller)
          .universalReceiver(LSP1_HOOK_PLACEHOLDER, "0x", {
            value: valueSent,
          });

        let receipt = await tx.wait();

        // event should come from the lsp1Implementation
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

        // value + receivedData (any parameter not index)
        const dataField = abiCoder.encode(
          ["uint256", "bytes"],
          [valueSent.toHexString(), "0x"]
        );
        expect(receipt.logs[0].data).toEqual(dataField);
      });
    });

    describe("from a Contract", () => {
      beforeEach(async () => {
        await context.accounts[0].sendTransaction({
          to: context.lsp1Checker.address,
          value: ethers.utils.parseEther("5"),
        });
      });

      describe("via a contract call - `contract.universalReceiver(...)`", () => {
        it("should emit an UniversalReceiver(...) event", async () => {
          let tx = await context.lsp1Checker.checkImplementation(
            context.lsp1Implementation.address,
            LSP1_HOOK_PLACEHOLDER,
            { value: valueSent }
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

          // value + receivedData (any parameter not index)
          const dataField = abiCoder.encode(
            ["uint256", "bytes"],
            [valueSent.toHexString(), "0x"]
          );
          expect(receipt.logs[0].data).toEqual(dataField);
        });
      });

      describe("via a low-level call - `address(contract).call(...)`", () => {
        it("should emit an UniversalReceiver(...) event", async () => {
          let tx = await context.lsp1Checker.checkImplementationLowLevelCall(
            context.lsp1Implementation.address,
            LSP1_HOOK_PLACEHOLDER,
            { value: valueSent }
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

          // value + receivedData (any parameter not index)
          const dataField = abiCoder.encode(
            ["uint256", "bytes"],
            [valueSent.toHexString(), "0x"]
          );
          expect(receipt.logs[0].data).toEqual(dataField);
        });
      });
    });
  });
};
