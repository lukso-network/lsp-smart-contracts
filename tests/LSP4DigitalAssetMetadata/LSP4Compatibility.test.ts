import { ethers } from "hardhat";
import {
  LSP4CompatibilityTester,
  LSP4CompatibilityTester__factory,
} from "../../types";

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

type LSP4CompatibilityTestAccounts = {
  owner: SignerWithAddress;
};

const getNamedAccounts = async () => {
  const [owner] = await ethers.getSigners();
  return { owner };
};

type LSP4CompatibilityTestContext = {
  accounts: LSP4CompatibilityTestAccounts;
  lsp4Compatibility: LSP4CompatibilityTester;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
  };
};

describe("LSP4Compatibility", () => {
  const buildTestContext = async (): Promise<LSP4CompatibilityTestContext> => {
    const accounts = await getNamedAccounts();
    const deployParams = {
      name: "Much compat",
      symbol: "WOW",
      newOwner: accounts.owner.address,
    };

    const lsp4Compatibility = await new LSP4CompatibilityTester__factory(
      accounts.owner
    ).deploy(deployParams.name, deployParams.symbol, deployParams.newOwner);

    return { accounts, lsp4Compatibility, deployParams };
  };

  describe("when using LSP4Compatibility", () => {
    let context: LSP4CompatibilityTestContext;
    beforeEach(async () => {
      context = await buildTestContext();
    });

    it("should allow reading name", async () => {
      // using compatibility getter -> returns(string)
      const nameAsString = await context.lsp4Compatibility.name();
      expect(nameAsString).toEqual(context.deployParams.name);

      // using getData -> returns(bytes)
      const nameAsBytes = await context.lsp4Compatibility["getData(bytes32)"](
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4TokenName")),
      );

      expect(ethers.utils.toUtf8String(nameAsBytes)).toEqual(
        context.deployParams.name
      );
    });

    it("should allow reading symbol", async () => {
      // using compatibility getter -> returns(string)
      const symbolAsString = await context.lsp4Compatibility.symbol();
      expect(symbolAsString).toEqual(context.deployParams.symbol);

      // using getData -> returns(bytes)
      const symbolAsBytes = await context.lsp4Compatibility["getData(bytes32)"](
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4TokenSymbol")),
      );

      expect(ethers.utils.toUtf8String(symbolAsBytes)).toEqual(
        context.deployParams.symbol
      );
    });
  });
});
