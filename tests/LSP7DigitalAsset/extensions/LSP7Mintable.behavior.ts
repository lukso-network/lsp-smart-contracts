import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { LSP7Mintable } from "../../../types";

import type { BigNumber } from "ethers";

export type LSP7MintableTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7MintableTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP7MintableTestContext = {
  accounts: LSP7MintableTestAccounts;
  lsp7Mintable: LSP7Mintable;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
    isNFT: boolean;
  };
};

export const shouldBehaveLikeLSP7Mintable = (
  buildContext: () => Promise<LSP7MintableTestContext>
) => {
  let context: LSP7MintableTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when owner minting tokens", () => {
    it("total supply should have increased", async () => {
      const tokensToMint = 100;
      const preTotalSupply = await context.lsp7Mintable.totalSupply();

      await context.lsp7Mintable.mint(context.accounts.tokenReceiver.address, tokensToMint);

      let postTotalSupply = await context.lsp7Mintable.totalSupply();
      expect(postTotalSupply).toEqual(preTotalSupply.add(tokensToMint));
    });

    // it("owner balance should have increased", async () => {});
  });

  describe("when non-owner minting tokens", () => {
    // it("a non-owner should not be allowed to mint", async () => {});
  });
};
