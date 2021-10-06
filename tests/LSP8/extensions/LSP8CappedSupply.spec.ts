import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { LSP8CappedSupplyTester, LSP8CappedSupplyTester__factory } from "../../../build/types";

describe("LSP8CappedSupply", () => {
  type TestAccounts = {
    owner: SignerWithAddress;
    tokenReceiver: SignerWithAddress;
  };
  let accounts: TestAccounts;

  let lsp8CappedSupply: LSP8CappedSupplyTester;
  const deployParams = {
    name: "capped supply",
    symbol: "CAP",
    tokenSupplyCap: ethers.BigNumber.from("2"),
  };

  beforeAll(async () => {
    const [owner, tokenReceiver] = await ethers.getSigners();
    accounts = { owner, tokenReceiver };

    lsp8CappedSupply = await new LSP8CappedSupplyTester__factory(owner).deploy(
      deployParams.name,
      deployParams.symbol,
      deployParams.tokenSupplyCap
    );
  });

  it("should allow reading tokenSupplyCap", async () => {
    const tokenSupplyCap = await lsp8CappedSupply.tokenSupplyCap();
    expect(tokenSupplyCap).toEqual(deployParams.tokenSupplyCap);
  });

  describe("when minting tokens", () => {
    const mintedTokenIds = Array(deployParams.tokenSupplyCap.toNumber())
      .fill(null)
      .map((_, i) => ethers.utils.keccak256(i));

    it("should allow minting amount up to tokenSupplyCap", async () => {
      for (let i = 0; i < mintedTokenIds.length; i++) {
        const preTotalSupply = await lsp8CappedSupply.totalSupply();

        const tokenId = mintedTokenIds[i];
        await lsp8CappedSupply.mint(accounts.tokenReceiver.address, tokenId);

        const postTotalSupply = await lsp8CappedSupply.totalSupply();
        expect(postTotalSupply).toEqual(preTotalSupply.add(1));
      }
    });

    describe("when cap has been reached", () => {
      const anotherTokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("VIP token"));

      it("should error when minting more than tokenSupplyCapTokens", async () => {
        const tokenSupplyCap = await lsp8CappedSupply.tokenSupplyCap();
        const preTotalSupply = await lsp8CappedSupply.totalSupply();
        expect(preTotalSupply.sub(tokenSupplyCap).toString()).toEqual("0");

        await expect(
          lsp8CappedSupply.mint(accounts.tokenReceiver.address, anotherTokenId)
        ).toBeRevertedWith("LSP8CappedSupply: tokenSupplyCap reached");
      });

      it("should allow minting after burning", async () => {
        const tokenSupplyCap = await lsp8CappedSupply.tokenSupplyCap();
        const preBurnTotalSupply = await lsp8CappedSupply.totalSupply();
        expect(preBurnTotalSupply.sub(preBurnTotalSupply).toString()).toEqual("0");

        await lsp8CappedSupply.burn(mintedTokenIds[0]);

        const postBurnTotalSupply = await lsp8CappedSupply.totalSupply();
        expect(postBurnTotalSupply).toEqual(preBurnTotalSupply.sub(1));

        await lsp8CappedSupply.mint(accounts.tokenReceiver.address, anotherTokenId);

        const postMintTotalSupply = await lsp8CappedSupply.totalSupply();
        expect(postMintTotalSupply.sub(preBurnTotalSupply).toString()).toEqual("0");
      });
    });
  });
});
