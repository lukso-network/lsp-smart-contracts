import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { LSP7Mintable } from "../../../types";

export type LSP7MintableTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP7MintableTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP7MintableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
  isNFT: boolean;
};

export type LSP7MintableTestContext = {
  accounts: LSP7MintableTestAccounts;
  lsp7Mintable: LSP7Mintable;
  deployParams: LSP7MintableDeployParams;
};

export const shouldBehaveLikeLSP7Mintable = (
  buildContext: () => Promise<LSP7MintableTestContext>
) => {
  let context: LSP7MintableTestContext;

  beforeAll(async () => {
    context = await buildContext();
  });

  describe("when owner minting tokens", () => {
    it("should increase the total supply", async () => {
      const amountToMint = ethers.BigNumber.from("100");
      const preTotalSupply = await context.lsp7Mintable.totalSupply();

      await context.lsp7Mintable.mint(
        context.accounts.tokenReceiver.address,
        amountToMint,
        true, // beneficiary is an EOA, so we need to force minting
        "0x"
      );

      let postTotalSupply = await context.lsp7Mintable.totalSupply();
      expect(postTotalSupply).toEqual(preTotalSupply.add(amountToMint));
    });

    it("should increase the tokenReceiver balance", async () => {
      const amountToMint = ethers.BigNumber.from("100");

      const tokenReceiverBalance = await context.lsp7Mintable.balanceOf(
        context.accounts.tokenReceiver.address
      );

      expect(tokenReceiverBalance.toNumber()).toEqual(amountToMint.toNumber());
    });
  });

  describe("when non-owner minting tokens", () => {
    it("should revert", async () => {
      const amountToMint = ethers.BigNumber.from("100");

      // use any other account
      const nonOwner = context.accounts.tokenReceiver;

      await expect(
        context.lsp7Mintable
          .connect(nonOwner)
          .mint(nonOwner.address, amountToMint, true, "0x")
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });
  });
};
