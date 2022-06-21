import { ethers } from "hardhat";
import {
  ILSP1UniversalReceiver,
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
  ClaimOwnershipTestContext,
  shouldBehaveLikeClaimOwnership,
} from "./ClaimOwnership.behaviour";

import {
  LSP3TestContext,
  shouldInitializeLikeLSP3,
  shouldBehaveLikeLSP3,
} from "./UniversalProfile.behaviour";

describe("UniversalProfile", () => {
  describe("when using UniversalProfile contract with constructor", () => {
    const buildLSP3TestContext = async (): Promise<LSP3TestContext> => {
      const accounts = await ethers.getSigners();
      const deployParams = {
        owner: accounts[0],
      };
      const universalProfile = await new UniversalProfile__factory(
        accounts[0]
      ).deploy(deployParams.owner.address);

      return { accounts, universalProfile, deployParams };
    };

    const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
      const accounts = await ethers.getSigners();

      const lsp1Implementation = (await new UniversalProfile__factory(
        accounts[0]
      ).deploy(accounts[0].address)) as ILSP1UniversalReceiver;

      const lsp1Checker = await new UniversalReceiverTester__factory(
        accounts[0]
      ).deploy();

      return { accounts, lsp1Implementation, lsp1Checker };
    };

    const buildClaimOwnershipTestContext =
      async (): Promise<ClaimOwnershipTestContext> => {
        const accounts = await ethers.getSigners();
        const deployParams = {
          owner: accounts[0],
        };
        const contract = await new UniversalProfile__factory(
          accounts[0]
        ).deploy(deployParams.owner.address);

        const onlyOwnerRevertString = "Ownable: caller is not the owner";

        return { accounts, contract, deployParams, onlyOwnerRevertString };
      };

    describe("when deploying the contract", () => {
      let context: LSP3TestContext;

      beforeEach(async () => {
        context = await buildLSP3TestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP3(async () => {
          const { universalProfile, deployParams } = context;
          return {
            universalProfile,
            deployParams,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP3(buildLSP3TestContext);
      shouldBehaveLikeLSP1(buildLSP1TestContext);
      shouldBehaveLikeClaimOwnership(buildClaimOwnershipTestContext);
    });
  });

  describe("when using UniversalProfile contract with proxy", () => {
    const buildLSP3TestContext = async (): Promise<LSP3TestContext> => {
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

      return { accounts, universalProfile, deployParams };
    };

    const initializeProxy = async (context: LSP3TestContext) => {
      return context.universalProfile["initialize(address)"](
        context.deployParams.owner.address
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
      ) as ILSP1UniversalReceiver;

      const lsp1Checker = await new UniversalReceiverTester__factory(
        accounts[0]
      ).deploy();

      return { accounts, lsp1Implementation, lsp1Checker };
    };

    const buildClaimOwnershipTestContext =
      async (): Promise<ClaimOwnershipTestContext> => {
        const accounts = await ethers.getSigners();
        const deployParams = { owner: accounts[0] };

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

    describe("when deploying the base implementation contract", () => {
      it("should have locked (= initialized) the implementation contract", async () => {
        const accounts = await ethers.getSigners();

        const universalProfileInit = await new UniversalProfileInit__factory(
          accounts[0]
        ).deploy();

        const isInitialized =
          await universalProfileInit.callStatic.initialized();

        expect(isInitialized).toBeTruthy();
      });
      it("prevent any address from calling the initialize(...) function on the implementation", async () => {
        const accounts = await ethers.getSigners();

        const universalProfileInit = await new UniversalProfileInit__factory(
          accounts[0]
        ).deploy();

        const randomCaller = accounts[1];

        await expect(
          universalProfileInit.initialize(randomCaller.address)
        ).toBeRevertedWith("Initializable: contract is already initialized");
      });
    });

    describe("when deploying the contract as proxy", () => {
      let context: LSP3TestContext;

      beforeEach(async () => {
        context = await buildLSP3TestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP3(async () => {
          const { universalProfile, deployParams } = context;
          await initializeProxy(context);

          return {
            universalProfile,
            deployParams,
          };
        });
      });

      describe("when calling `initialize(...)` more than once", () => {
        it("should revert", async () => {
          await initializeProxy(context);

          await expect(initializeProxy(context)).toBeRevertedWith(
            "Initializable: contract is already initialized"
          );
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP3(async () => {
        let context = await buildLSP3TestContext();
        await initializeProxy(context);
        return context;
      });

      shouldBehaveLikeLSP1(async () => {
        let lsp3Context = await buildLSP3TestContext();
        await initializeProxy(lsp3Context);

        let lsp1Context = await buildLSP1TestContext();
        return lsp1Context;
      });

      shouldBehaveLikeClaimOwnership(async () => {
        let claimOwnershipContext = await buildClaimOwnershipTestContext();

        await initializeProxy({
          accounts: claimOwnershipContext.accounts,
          universalProfile: claimOwnershipContext.contract as LSP0ERC725Account,
          deployParams: claimOwnershipContext.deployParams,
        });

        return claimOwnershipContext;
      });
    });
  });
});
