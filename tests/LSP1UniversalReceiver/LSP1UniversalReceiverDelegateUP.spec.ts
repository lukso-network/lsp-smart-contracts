import { ethers } from "hardhat";
import {
  LSP1UniversalReceiverDelegateUP,
  UniversalProfile,
  LSP6KeyManager,
} from "../../types";
import { deployProxy } from "../utils/proxy";
import { setupProfileWithKeyManagerWithURD } from "../utils/fixtures";

import {
  LSP1TestContext,
  getNamedAccounts,
  shouldBehaveLikeLSP1Delegate,
  shouldInitializeLikeLSP1,
} from "./LSP1UniversalReceiverDelegateUP.behaviour";

describe("LSP1UniversalReceiverDelegateUP", () => {
  describe("when testing deployed contract", () => {
    const buildLSP1TestContext = async (): Promise<LSP1TestContext> => {
      const accounts = await getNamedAccounts();

      const [UP1, KM1, LSP1_URD_UP] = await setupProfileWithKeyManagerWithURD(
        accounts.owner1
      );

      const [UP2, KM2] = await setupProfileWithKeyManagerWithURD(
        accounts.owner2
      );
      const lsp1universalReceiverDelegateUP =
        LSP1_URD_UP as LSP1UniversalReceiverDelegateUP;
      const universalProfile1 = UP1 as UniversalProfile;
      const universalProfile2 = UP2 as UniversalProfile;
      const lsp6KeyManager1 = KM1 as LSP6KeyManager;
      const lsp6KeyManager2 = KM2 as LSP6KeyManager;

      return {
        accounts,
        universalProfile1,
        lsp6KeyManager1,
        universalProfile2,
        lsp6KeyManager2,
        lsp1universalReceiverDelegateUP,
      };
    };

    describe("when deploying the contract", () => {
      let context: LSP1TestContext;

      beforeEach(async () => {
        context = await buildLSP1TestContext();
      });

      describe("when initializing the contract", () => {
        shouldInitializeLikeLSP1(async () => {
          const { lsp1universalReceiverDelegateUP } = context;

          return {
            lsp1universalReceiverDelegateUP,
          };
        });
      });
    });

    describe("when testing deployed contract", () => {
      shouldBehaveLikeLSP1Delegate(buildLSP1TestContext);
    });
  });
});
