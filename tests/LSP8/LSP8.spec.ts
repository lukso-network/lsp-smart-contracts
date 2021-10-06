import { waffleJest } from "@ethereum-waffle/jest";
import { ethers } from "hardhat";
import { LSP8Tester__factory, LSP8InitTester__factory } from "../../build/types";
import { deployProxy } from "../utils/proxy";
import {
  getNamedAccounts,
  shouldBehaveLikeLSP8,
  LSP8TestAccounts,
  LSP8TestContext,
} from "./LSP8.behaviour";

expect.extend(waffleJest);

describe("LSP8", () => {
  let accounts: LSP8TestAccounts;
  beforeAll(async () => {
    accounts = await getNamedAccounts();
  });

  describe("when using LSP8 contract with constructor", () => {
    const buildTestContext = async () => {
      const deployParams = {
        name: "LSP8 - deployed with constructor",
        symbol: "NFT",
        newOwner: accounts.owner.address,
      };
      const lsp8 = await new LSP8Tester__factory(accounts.owner).deploy(
        deployParams.name,
        deployParams.symbol,
        deployParams.newOwner
      );

      return { accounts, lsp8, deployParams };
    };

    describe("when deploying the contract", () => {
      let context: LSP8TestContext;

      beforeEach(async () => {
        context = await buildTestContext();
      });

      it("should have set expected entries with ERC725Y.setData", async () => {
        const lsp8SupportedStandardsKey =
          "0xeafec4d89fa9619884b6b89135626455000000000000000000000000d9bfeb57";
        const lsp8SupportedStandardsValue = "0xd9bfeb57";
        await expect(context.lsp8.deployTransaction).toHaveEmittedWith(
          context.lsp8,
          "DataChanged",
          [lsp8SupportedStandardsKey, lsp8SupportedStandardsValue]
        );

        const nameKey = "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1";
        await expect(context.lsp8.deployTransaction).toHaveEmittedWith(
          context.lsp8,
          "DataChanged",
          [nameKey, ethers.utils.hexlify(ethers.utils.toUtf8Bytes(context.deployParams.name))]
        );

        const symbolKey = "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756";
        await expect(context.lsp8.deployTransaction).toHaveEmittedWith(
          context.lsp8,
          "DataChanged",
          [symbolKey, ethers.utils.hexlify(ethers.utils.toUtf8Bytes(context.deployParams.symbol))]
        );
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8(buildTestContext);
    });
  });

  describe("when using LSP8 contract with proxy", () => {
    const buildTestContext = async () => {
      const deployParams = {
        name: "LSP8 - deployed with constructor",
        symbol: "NFT",
        newOwner: accounts.owner.address,
      };

      const lsp8TesterInit = await new LSP8InitTester__factory(accounts.owner).deploy();
      const lsp8Proxy = await deployProxy(lsp8TesterInit.address, accounts.owner);
      const lsp8 = lsp8TesterInit.attach(lsp8Proxy);

      return { accounts, lsp8, deployParams };
    };

    describe("when initializing contract as proxy", () => {
      let context: LSP8TestContext;

      beforeAll(async () => {
        context = await buildTestContext();
      });

      it("should have set expected entries with ERC725Y.setData", async () => {
        const initializeTransaction = await context.lsp8["initialize(string,string,address)"](
          context.deployParams.name,
          context.deployParams.symbol,
          context.deployParams.newOwner
        );

        const lsp8SupportedStandardsKey =
          "0xeafec4d89fa9619884b6b89135626455000000000000000000000000d9bfeb57";
        const lsp8SupportedStandardsValue = "0xd9bfeb57";
        await expect(initializeTransaction).toHaveEmittedWith(context.lsp8, "DataChanged", [
          lsp8SupportedStandardsKey,
          lsp8SupportedStandardsValue,
        ]);

        const nameKey = "0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1";
        await expect(initializeTransaction).toHaveEmittedWith(context.lsp8, "DataChanged", [
          nameKey,
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes(context.deployParams.name)),
        ]);

        const symbolKey = "0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756";
        await expect(initializeTransaction).toHaveEmittedWith(context.lsp8, "DataChanged", [
          symbolKey,
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes(context.deployParams.symbol)),
        ]);
      });

      it("should revert when `initialize` is called more than once", async () => {
        await expect(
          context.lsp8["initialize(string,string,address)"](
            context.deployParams.name,
            context.deployParams.symbol,
            context.deployParams.newOwner
          )
        ).toBeRevertedWith("Initializable: contract is already initialized");
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP8(() =>
        buildTestContext().then(async (context) => {
          await context.lsp8["initialize(string,string,address)"](
            context.deployParams.name,
            context.deployParams.symbol,
            context.deployParams.newOwner
          );

          return context;
        })
      );
    });
  });
});
