import type { LSP6TestContext } from '../../utils/context.js';

import {
  // Admin
  shouldBehaveLikePermissionChangeOwner,
  shouldBehaveLikePermissionChangeOrAddExtensions,
  shouldBehaveLikePermissionChangeOrAddURD,

  // Set Permissions
  shouldBehaveLikePermissionChangeOrAddController,
  shouldBehaveLikeSetAllowedCalls,
  shouldBehaveLikeSetAllowedERC725YDataKeys,

  // Interactions
  shouldBehaveLikePermissionCall,
  shouldBehaveLikePermissionStaticCall,
  shouldBehaveLikePermissionDelegateCall,
  shouldBehaveLikePermissionDeploy,
  shouldBehaveLikePermissionTransferValue,
  shouldBehaveLikeAllowedAddresses,
  shouldBehaveLikeAllowedFunctions,
  shouldBehaveLikeAllowedStandards,
  shouldBehaveLikeBatchExecute,

  // Set Data
  shouldBehaveLikeAllowedERC725YDataKeys,
  shouldBehaveLikePermissionSetData,

  // other scenarios
  testSecurityScenarios,
  otherTestScenarios,
} from './index.js';

export const shouldBehaveLikeLSP6 = (
  buildContext: (initialFunding?: bigint) => Promise<LSP6TestContext>,
) => {
  // TODO tests crash
  describe.skip('CHANGEOWNER', () => {
    shouldBehaveLikePermissionChangeOwner(buildContext);
  });

  describe('Set Permissions', () => {
    shouldBehaveLikePermissionChangeOrAddController(buildContext);
    shouldBehaveLikeSetAllowedCalls(buildContext);
    shouldBehaveLikeSetAllowedERC725YDataKeys(buildContext);
  });

  describe('CHANGE / ADD extensions', () => {
    shouldBehaveLikePermissionChangeOrAddExtensions(buildContext);
  });

  describe('CHANGE / ADD UniversalReceiverDelegate', () => {
    shouldBehaveLikePermissionChangeOrAddURD(buildContext);
  });

  describe('SETDATA', () => {
    shouldBehaveLikePermissionSetData(buildContext);
  });

  describe('AllowedERC725YDataKeys', () => {
    shouldBehaveLikeAllowedERC725YDataKeys(buildContext);
  });

  describe('TRANSFERVALUE', () => {
    shouldBehaveLikePermissionTransferValue(buildContext);
  });

  describe('CALL', () => {
    shouldBehaveLikePermissionCall(buildContext);
  });

  describe('STATICCALL', () => {
    shouldBehaveLikePermissionStaticCall(buildContext);
  });

  describe('DELEGATECALL', () => {
    shouldBehaveLikePermissionDelegateCall(buildContext);
  });

  describe('DEPLOY', () => {
    shouldBehaveLikePermissionDeploy(buildContext);
  });

  describe('ALLOWED CALLS', () => {
    shouldBehaveLikeAllowedAddresses(buildContext);
    shouldBehaveLikeAllowedFunctions(buildContext);
    shouldBehaveLikeAllowedStandards(buildContext);
  });

  describe('`ERC725X.executeBatch([],[],[],[])`', () => {
    shouldBehaveLikeBatchExecute(buildContext);
  });

  describe('miscellaneous', () => {
    otherTestScenarios(buildContext);
  });

  describe.only('Security', () => {
    testSecurityScenarios(buildContext);
  });
};
