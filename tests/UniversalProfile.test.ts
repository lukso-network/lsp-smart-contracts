import { ethers } from "hardhat";
import { expect } from "chai";
import {
  LSP0ERC725Account,
  UniversalProfileInit__factory,
  UniversalProfile__factory,
  UniversalReceiverTester__factory,
} from "../types";
import { deployProxy } from "./utils/fixtures";

import {
  LSP1TestContext,
  shouldBehaveLikeLSP1,
} from "./LSP1UniversalReceiver/LSP1UniversalReceiver.behaviour";

import {
  LSP17TestContext,
  shouldBehaveLikeLSP17,
} from "./LSP17ContractExtension/LSP17Extendable.behaviour";

import {
  LSP20TestContext,
  shouldBehaveLikeLSP20,
} from "./LSP20CallVerification/LSP20CallVerification.behaviour";

import {
  LSP3TestContext,
  shouldInitializeLikeLSP3,
  shouldBehaveLikeLSP3,
} from "./UniversalProfile.behaviour";
import { provider } from "./utils/helpers";
import { BigNumber } from "ethers";
import {
  LSP14CombinedWithLSP20TestContext,
  shouldBehaveLikeLSP14CombinedWithLSP20,
} from "./LSP20CallVerification/LSP14CombinedWithLSP20.behaviour";

describe("UniversalProfile", () => {
  describe("when using UniversalProfile contract with constructor", () => {
    const buildLSP3TestContext = async (
      initialFunding?: number
    ): Promise<LSP3TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
        initialFunding,
      };
      const universalProfile = await new UniversalProfile__factory(
        accounts[0]
      ).deploy(deployParams.owner.address, {
        value: initialFunding,
      });

      return { accounts, universalProfile, deployParams };
    };

    const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
      const accounts = await ethers.getSigners();

      const lsp1Implementation = await new UniversalProfile__factory(
        accounts[0]
      ).deploy(accounts[0].address);

      const lsp1Checker = await new UniversalReceiverTester__factory(
        accounts[0]
      ).deploy();

      return { accounts, lsp1Implementation, lsp1Checker };
    };

    const buildLSP14CombinedWithLSP20TestContext = async (
      initialFunding?: number | BigNumber
    ): Promise<LSP14CombinedWithLSP20TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
        initialFunding,
      };

      const contract = await new UniversalProfile__factory(accounts[0]).deploy(
        deployParams.owner.address,
        { value: initialFunding }
      );

      const onlyOwnerRevertString = "Ownable: caller is not the owner";

      return { accounts, contract, deployParams, onlyOwnerRevertString };
    };

    const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
      };
      const contract = await new UniversalProfile__factory(accounts[0]).deploy(
        deployParams.owner.address
      );

      return { accounts, contract, deployParams };
    };

    const buildLSP20TestContext = async (): Promise<LSP20TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
      };
      const universalProfile = await new UniversalProfile__factory(
        accounts[0]
      ).deploy(deployParams.owner.address);

      return { accounts, universalProfile, deployParams };
    };

    [
      { initialFunding: undefined },
      { initialFunding: 0 },
      { initialFunding: 5 },
    ].forEach((testCase) => {
      describe("when deploying the contract with or without value", () => {
        let context: LSP3TestContext;

        before(async () => {
          context = await buildLSP3TestContext(testCase.initialFunding);
        });

        it(`should have deployed with the correct funding amount (${testCase.initialFunding})`, async () => {
          const balance = await provider.getBalance(
            context.universalProfile.address
          );
          expect(balance).to.equal(testCase.initialFunding || 0);
        });
      });
    });

    describe("when deploying the contract", () => {
      let context: LSP3TestContext;

      before(async () => {
        context = await buildLSP3TestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP3(async () => context);
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP3(buildLSP3TestContext);
      shouldBehaveLikeLSP1(buildLSP1TestContext);
      shouldBehaveLikeLSP14CombinedWithLSP20(
        buildLSP14CombinedWithLSP20TestContext
      );
      shouldBehaveLikeLSP17(buildLSP17TestContext);
      shouldBehaveLikeLSP20(buildLSP20TestContext);
    });
  });

  describe("when using UniversalProfile contract with proxy", () => {
    const buildLSP3TestContext = async (
      initialFunding?: number
    ): Promise<LSP3TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
        initialFunding,
      };
      const universalProfileInit = await new UniversalProfileInit__factory(
        accounts[0]
      ).deploy();

      const universalProfileProxy = await deployProxy(
        universalProfileInit.address,
        accounts[0]
      );

      const universalProfile = universalProfileInit.attach(
        universalProfileProxy
      );

      return { accounts, universalProfile, deployParams };
    };

    const initializeProxy = async (context: LSP3TestContext) => {
      return context.universalProfile["initialize(address)"](
        context.deployParams.owner.address,
        { value: context.deployParams.initialFunding }
      );
    };

    const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
      const accounts = await ethers.getSigners();

      const universalProfileInit = await new UniversalProfileInit__factory(
        accounts[0]
      ).deploy();
      const universalProfileProxy = await deployProxy(
        universalProfileInit.address,
        accounts[0]
      );

      const lsp1Implementation = universalProfileInit.attach(
        universalProfileProxy
      );

      await lsp1Implementation.initialize(accounts[0].address);

      const lsp1Checker = await new UniversalReceiverTester__factory(
        accounts[0]
      ).deploy();

      return { accounts, lsp1Implementation, lsp1Checker };
    };

    const buildLSP14CombinedWithLSP20TestContext = async (
      initialFunding?: number | BigNumber
    ): Promise<LSP14CombinedWithLSP20TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
        initialFunding: initialFunding,
      };

      const universalProfileInit = await new UniversalProfileInit__factory(
        accounts[0]
      ).deploy();

      const universalProfileProxy = await deployProxy(
        universalProfileInit.address,
        accounts[0]
      );

      const universalProfile = universalProfileInit.attach(
        universalProfileProxy
      );

      const onlyOwnerRevertString = "Ownable: caller is not the owner";

      return {
        accounts,
        contract: universalProfile,
        deployParams,
        onlyOwnerRevertString,
      };
    };

    const buildLSP17TestContext = async (): Promise<LSP17TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
      };

      const universalProfileInit = await new UniversalProfileInit__factory(
        accounts[0]
      ).deploy();

      const universalProfileProxy = await deployProxy(
        universalProfileInit.address,
        accounts[0]
      );

      const universalProfile = universalProfileInit.attach(
        universalProfileProxy
      );

      return { accounts, contract: universalProfile, deployParams };
    };

    const buildLSP20TestContext = async (): Promise<LSP20TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
      };

      const universalProfileInit = await new UniversalProfileInit__factory(
        accounts[0]
      ).deploy();

      const universalProfileProxy = await deployProxy(
        universalProfileInit.address,
        accounts[0]
      );

      const universalProfile = universalProfileInit.attach(
        universalProfileProxy
      );

      return { accounts, universalProfile: universalProfile, deployParams };
    };

    describe("when deploying the base implementation contract", () => {
      it("prevent any address from calling the initialize(...) function on the implementation", async () => {
        const accounts = await ethers.getSigners();

        const universalProfileInit = await new UniversalProfileInit__factory(
          accounts[0]
        ).deploy();

        const randomCaller = accounts[1];

        await expect(
          universalProfileInit.initialize(randomCaller.address)
        ).to.be.revertedWith("Initializable: contract is already initialized");
      });
    });

    [
      { initialFunding: undefined },
      { initialFunding: 0 },
      { initialFunding: 5 },
    ].forEach((testCase) => {
      describe("when deploying the proxy contract", () => {
        let context: LSP3TestContext;

        before(async () => {
          context = await buildLSP3TestContext(testCase.initialFunding);
          await initializeProxy(context);
        });

        describe("when initializing the proxy contract with or without value", () => {
          it(`should have deployed with the correct funding amount (${testCase.initialFunding})`, async () => {
            const balance = await provider.getBalance(
              context.universalProfile.address
            );
            console.log("UP balance's = ", balance);
            expect(balance).to.equal(testCase.initialFunding || 0);
          });
        });

        describe("when calling `initialize(...)` more than once", () => {
          it("should revert", async () => {
            await expect(initializeProxy(context)).to.be.revertedWith(
              "Initializable: contract is already initialized"
            );
          });
        });

        shouldInitializeLikeLSP3(async () => context);
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP3(async (initialFunding?: number) => {
        let context = await buildLSP3TestContext(initialFunding);
        await initializeProxy(context);
        return context;
      });

      shouldBehaveLikeLSP1(async () => {
        let lsp3Context = await buildLSP3TestContext();
        await initializeProxy(lsp3Context);

        let lsp1Context = await buildLSP1TestContext();
        return lsp1Context;
      });

      shouldBehaveLikeLSP14CombinedWithLSP20(
        async (initialFunding?: number | BigNumber) => {
          let claimOwnershipContext =
            await buildLSP14CombinedWithLSP20TestContext(initialFunding);

          await initializeProxy({
            accounts: claimOwnershipContext.accounts,
            universalProfile:
              claimOwnershipContext.contract as LSP0ERC725Account,
            deployParams: claimOwnershipContext.deployParams,
          });

          return claimOwnershipContext;
        }
      );

      shouldBehaveLikeLSP17(async () => {
        let fallbackExtensionContext = await buildLSP17TestContext();

        await initializeProxy({
          accounts: fallbackExtensionContext.accounts,
          universalProfile:
            fallbackExtensionContext.contract as LSP0ERC725Account,
          deployParams: fallbackExtensionContext.deployParams,
        });

        return fallbackExtensionContext;
      });

      shouldBehaveLikeLSP20(async () => {
        let reverseVerificationContext = await buildLSP20TestContext();

        await initializeProxy({
          accounts: reverseVerificationContext.accounts,
          universalProfile:
            reverseVerificationContext.universalProfile as LSP0ERC725Account,
          deployParams: reverseVerificationContext.deployParams,
        });

        return reverseVerificationContext;
      });
    });
  });
});
