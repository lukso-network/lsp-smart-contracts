import { ethers } from "hardhat";
import { ERC725Y__factory, LSP7Tester__factory, LSP7InitTester__factory } from "../../build/types";
import { deployProxy } from "../utils/proxy";
import {
  getNamedAccounts,
  shouldBehaveLikeLSP7,
  shouldInitializeLikeLSP7,
  LSP7TestAccounts,
  LSP7TestContext,
} from "./LSP7.behaviour";

describe("LSP7", () => {
  describe("when using LSP7 contract with constructor", () => {
    const buildTestContext = async (): Promise<LSP7TestContext> => {
      const accounts = await getNamedAccounts();
      const initialSupply = ethers.BigNumber.from("3");
      const deployParams = {
        name: "LSP7 - deployed with constructor",
        symbol: "NFT",
        newOwner: accounts.owner.address,
      };
      const lsp7 = await new LSP7Tester__factory(accounts.owner).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner
      );

      await lsp7.mint(
        accounts.owner.address,
        initialSupply,
        true,
        ethers.utils.toUtf8Bytes("mint tokens for the owner")
      );

      return { accounts, lsp7, deployParams, initialSupply };
    };

    describe("when deploying the contract", () => {
      let context: LSP7TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      it("should have set expected entries with ERC725Y.setData", async () => {
        const lsp7SupportedStandardsKey =
          "0xeafec4d89fa9619884b6b8913562645500000000000000000000000074ac49b0";
        const lsp7SupportedStandardsValue = "0x74ac49b0";
        await expect(context.lsp7.deployTransaction).toHaveEmittedWith(
          context.lsp7,
          "DataChanged",
          [lsp7SupportedStandardsKey, lsp7SupportedStandardsValue]
        );

        const nameKey = "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1";
        await expect(context.lsp7.deployTransaction).toHaveEmittedWith(
          context.lsp7,
          "DataChanged",
          [nameKey, ethers.utils.hexlify(ethers.utils.toUtf8Bytes(context.deployParams.name))]
        );

        const symbolKey = "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756";
        await expect(context.lsp7.deployTransaction).toHaveEmittedWith(
          context.lsp7,
          "DataChanged",
          [symbolKey, ethers.utils.hexlify(ethers.utils.toUtf8Bytes(context.deployParams.symbol))]
        );
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP7(buildTestContext);
    });
  });

  describe("when using LSP7 contract with proxy", () => {
    const buildTestContext = async (): Promise<LSP7TestContext> => {
      const accounts = await getNamedAccounts();
      const initialSupply = ethers.BigNumber.from("3");
      const deployParams = {
        name: "LSP7 - deployed with constructor",
        symbol: "NFT",
        newOwner: accounts.owner.address,
      };

      const lsp7TesterInit = await new LSP7InitTester__factory(accounts.owner).deploy();
      const lsp7Proxy = await deployProxy(lsp7TesterInit.address, accounts.owner);
      const lsp7 = lsp7TesterInit.attach(lsp7Proxy);

      await lsp7.mint(
        accounts.owner.address,
        initialSupply,
        true,
        ethers.utils.toUtf8Bytes("mint tokens for the owner")
      );

      return { accounts, lsp7, deployParams, initialSupply };
    };

    const initializeProxy = async (context: LSP7TestContext) => {
      return context.lsp7["initialize(string,string,address)"](
        context.deployParams.name,
        context.deployParams.symbol,
        context.deployParams.newOwner
      );
    };

    describe("when deploying the contract as proxy", () => {
      let context: LSP7TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP7(async () => {
          const initializeTransaction = await initializeProxy(context);

          return {
            erc725Y: ERC725Y__factory.connect(context.lsp7.address, context.accounts.owner),
            initializeTransaction,
            expectedSetData: {
              name: context.deployParams.name,
              symbol: context.deployParams.symbol,
            },
          };
        });
      });

      describe("when calling initialize more than once", () => {
        it("should revert", async () => {
          await initializeProxy(context);

          await expect(initializeProxy(context)).toBeRevertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP7(() =>
        buildTestContext().then(async (context) => {
          await initializeProxy(context);

          return context;
        })
      );
    });
  });
});
