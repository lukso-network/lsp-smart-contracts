import { LSP7Mintable__factory } from "../../../types";

import { shouldInitializeLikeLSP7 } from "../LSP7DigitalAsset.behaviour";
import {
  getNamedAccounts,
  shouldBehaveLikeLSP7Mintable,
  LSP7MintableTestContext,
} from "./LSP7Mintable.behavior";

describe("LSP7Mintable", () => {
  describe("when using LSP7Mintable with constructor", () => {
    const buildTestContext = async (): Promise<LSP7MintableTestContext> => {
      const accounts = await getNamedAccounts();

      const deployParams = {
        name: "LSP7Mintable - deployed with constructor",
        symbol: "LSP7MNT",
        newOwner: accounts.owner.address,
        isNFT: false,
      };

      const lsp7Mintable = await new LSP7Mintable__factory(accounts.owner).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner,
        deployParams.isNFT
      );

      return { accounts, lsp7Mintable, deployParams };
    };

    describe("when deploying the contract", () => {
      let context: LSP7MintableTestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      shouldInitializeLikeLSP7(async () => {
        const { lsp7Mintable: lsp7, deployParams } = context;
        return {
          lsp7,
          deployParams,
          initializeTransaction: context.lsp7Mintable.deployTransaction,
        };
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP7Mintable(buildTestContext);
    });
  });
});
