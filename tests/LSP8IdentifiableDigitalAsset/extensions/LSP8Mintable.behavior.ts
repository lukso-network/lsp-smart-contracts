import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { LSP8Mintable } from "../../../types";

import type { BigNumber } from "ethers";

export type LSP8MintableTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP8MintableTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP8MintableTestContext = {
  accounts: LSP8MintableTestAccounts;
  lsp8Mintable: LSP8Mintable;
  deployParams: {
    name: string;
    symbol: string;
    newOwner: string;
  };
};

export const shouldBehaveLikeLSP8Mintable = (
  buildContext: () => Promise<LSP8MintableTestContext>
) => {
  let context: LSP8MintableTestContext;

  beforeAll(async () => {
    context = await buildContext();
  });

  describe("when owner minting tokens", () => {
    it("total supply should have increased", async () => {
      const tokensToMint = "0xad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a5";
      const preTotalSupply = await context.lsp8Mintable.totalSupply();

      await context.lsp8Mintable.mint(
        context.accounts.tokenReceiver.address,
        tokensToMint,
        true,
        "0x"
      );

      let postTotalSupply = await context.lsp8Mintable.totalSupply();
      expect(postTotalSupply).toEqual(preTotalSupply.add(1));
    });

    it("tokenReceiver balance should have increased", async () => {
      const tokenReceiverBalance = await context.lsp8Mintable.balanceOf(
        context.accounts.tokenReceiver.address
      );

      expect(tokenReceiverBalance.toNumber()).toEqual(1);
    });
  });

  describe("when non-owner minting tokens", () => {
    it("a non-owner should not be allowed to mint", async () => {
      const tokensToMint = "0x23f42ca762b34aae3cb582735a74eca0a1ff5f52d509344aa4effc6bfff66c3e";

      await expect(
        context.lsp8Mintable.connect(context.accounts.tokenReceiver.address)
          .mint(context.accounts.tokenReceiver.address, tokensToMint, true, "0x",{gasLimit: 300_000})
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });
  });
};
