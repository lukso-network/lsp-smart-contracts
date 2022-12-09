import { expect } from "chai";
import { ethers } from "hardhat";

//types
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BytesLike, Wallet } from "ethers";
import {
  ReentrantContract__factory,
  ReentrantContract,
  UniversalProfile__factory,
} from "../../../types";

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";

// helpers
import {
  encodeCompactBytesArray,
  combinePermissions,
  combineAllowedCalls,
  LOCAL_PRIVATE_KEYS,
} from "../../utils/helpers";
import {
  ReentrancyContext,
  buildReentrancyContext,
  testCasesByType,
  transferValueTestCases,
  setDataTestCases,
  addPermissionsTestCases,
  changePermissionsTestCases,
  addUniversalReceiverDelegateTestCases,
  changeUniversalReceiverDelegateTestCases,
} from "./reentrancyHelpers";

export const testReentrancyScenarios = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;
  let reentrancyContext: ReentrancyContext;

  before(async () => {
    context = await buildContext();
    reentrancyContext = await buildReentrancyContext(context);
  });

  describe("first call through `execute(bytes)`, second call through `execute(bytes)`", () => {
    describe("when reentering and transferring value", () => {
      transferValueTestCases.forEach((testCase) => {
        it(`${testCase.testDescription}`, async () => {
          await testCasesByType(
            "TRANSFERVALUE",
            testCase,
            context,
            reentrancyContext
          );
        });
      });
    });

    describe("when reentering and setting data", () => {
      setDataTestCases.forEach((testCase) => {
        it(`${testCase.testDescription}`, async () => {
          await testCasesByType(
            "SETDATA",
            testCase,
            context,
            reentrancyContext
          );
        });
      });
    });

    describe("when reentering and adding permissions", () => {
      addPermissionsTestCases.forEach((testCase) => {
        it(`${testCase.testDescription}`, async () => {
          await testCasesByType(
            "ADDPERMISSIONS",
            testCase,
            context,
            reentrancyContext
          );
        });
      });
    });

    describe("when reentering and changing permissions", () => {
      changePermissionsTestCases.forEach((testCase) => {
        it(`${testCase.testDescription}`, async () => {
          await testCasesByType(
            "CHANGEPERMISSIONS",
            testCase,
            context,
            reentrancyContext
          );
        });
      });
    });

    describe("when reentering and adding URD", () => {
      addUniversalReceiverDelegateTestCases.forEach((testCase) => {
        it(`${testCase.testDescription}`, async () => {
          await testCasesByType(
            "ADDUNIVERSALRECEIVERDELEGATE",
            testCase,
            context,
            reentrancyContext
          );
        });
      });
    });

    describe("when reentering and changing URD", () => {
      changeUniversalReceiverDelegateTestCases.forEach((testCase) => {
        it(`${testCase.testDescription}`, async () => {
          await testCasesByType(
            "CHANGEUNIVERSALRECEIVERDELEGATE",
            testCase,
            context,
            reentrancyContext
          );
        });
      });
    });

    after(async () => {
      await reentrancyContext.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("1"),
      });
    });
  });

  describe("first call through `executeRelayCall(bytes,uint256,bytes)`, second call through `execute(bytes)`", () => {
    describe("when reentering and transferring value", () => {});

    after(async () => {
      await reentrancyContext.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("1"),
      });
    });
  });
};
