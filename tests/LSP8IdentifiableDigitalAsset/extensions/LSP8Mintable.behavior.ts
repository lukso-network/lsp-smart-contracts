import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { LSP8Mintable } from "../../../types";

export type LSP8MintableTestAccounts = {
  owner: SignerWithAddress;
  tokenReceiver: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP8MintableTestAccounts> => {
  const [owner, tokenReceiver] = await ethers.getSigners();
  return { owner, tokenReceiver };
};

export type LSP8MintableDeployParams = {
  name: string;
  symbol: string;
  newOwner: string;
};

export type LSP8MintableTestContext = {
  accounts: LSP8MintableTestAccounts;
  lsp8Mintable: LSP8Mintable;
  deployParams: LSP8MintableDeployParams;
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
      const randomTokenId = ethers.utils.randomBytes(32);

      const preMintTotalSupply = await context.lsp8Mintable.totalSupply();

      await context.lsp8Mintable.mint(
        context.accounts.tokenReceiver.address,
        randomTokenId,
        true, // beneficiary is an EOA, so we need to force minting
        "0x"
      );

      let postMintTotalSupply = await context.lsp8Mintable.totalSupply();
      expect(postMintTotalSupply).toEqual(preMintTotalSupply.add(1));
    });

    it("tokenReceiver balance should have increased", async () => {
      const tokenReceiverBalance = await context.lsp8Mintable.balanceOf(
        context.accounts.tokenReceiver.address
      );

      expect(tokenReceiverBalance.toNumber()).toEqual(1);
    });
  });

  describe("when non-owner minting tokens", () => {
    it("should revert", async () => {
      const randomTokenId = ethers.utils.randomBytes(32);

      // use any other account
      const nonOwner = context.accounts.tokenReceiver;

      await expect(
        context.lsp8Mintable
          .connect(nonOwner)
          .mint(
            context.accounts.tokenReceiver.address,
            randomTokenId,
            true,
            "0x"
          )
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });
  });
};
