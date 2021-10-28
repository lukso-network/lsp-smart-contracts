import { ethers } from "hardhat";
import { LSP4CompatibilityTester, LSP4CompatibilityTester__factory } from "../../build/types";

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
      const data = await context.lsp4Compatibility.getData([
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4TokenName")),
      ]);
      const nameAsBytes = data[0];
      expect(ethers.utils.toUtf8String(nameAsBytes)).toEqual(context.deployParams.name);
    });

    it("should allow reading symbol", async () => {
      // using compatibility getter -> returns(string)
      const symbolAsString = await context.lsp4Compatibility.symbol();
      expect(symbolAsString).toEqual(context.deployParams.symbol);

      // using getData -> returns(bytes)
      const data = await context.lsp4Compatibility.getData([
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP4TokenSymbol")),
      ]);
      const symbolAsBytes = data[0];
      expect(ethers.utils.toUtf8String(symbolAsBytes)).toEqual(context.deployParams.symbol);
    });
  });
});
