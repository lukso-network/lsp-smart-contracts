import { expect } from 'chai';
import { BigNumber } from 'ethers';

import { LSP6TestContext, LSP6InternalsTestContext } from '../utils/context';
import { INTERFACE_IDS } from '../../constants';

import {
  // Admin
  shouldBehaveLikePermissionChangeOwner,
  shouldBehaveLikePermissionChangeOrAddExtensions,
  shouldBehaveLikePermissionChangeOrAddURD,
  shouldBehaveLikePermissionSign,

  // Set Permission
  shouldBehaveLikePermissionChangeOrAddController,
  shouldBehaveLikeSettingAllowedCalls,
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
  testInvalidExecutePayloads,

  // Batch
  shouldBehaveLikeBatchExecute,

  // Relay
  shouldBehaveLikeMultiChannelNonce,
  shouldBehaveLikeExecuteRelayCall,

  // SetData
  shouldBehaveLikePermissionSetData,
  shouldBehaveLikeAllowedERC725YDataKeys,

  // Internals
  testAllowedCallsInternals,
  testAllowedERC725YDataKeysInternals,
  testReadingPermissionsInternals,
  testSetDataInternals,
  testExecuteInternals,
} from './index';

export const shouldBehaveLikeLSP6 = (
  buildContext: (initialFunding?: BigNumber) => Promise<LSP6TestContext>,
) => {
  describe('CHANGEOWNER', () => {
    shouldBehaveLikePermissionChangeOwner(buildContext);
  });

  describe('Set Permissions', () => {
    shouldBehaveLikePermissionChangeOrAddController(buildContext);
    shouldBehaveLikeSettingAllowedCalls(buildContext);
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

  describe('Invalid Execute payloads', () => {
    testInvalidExecutePayloads(buildContext);
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

  describe('Batch `execute([])`', () => {
    shouldBehaveLikeBatchExecute(buildContext);
  });

  describe('ALLOWED CALLS', () => {
    shouldBehaveLikeAllowedAddresses(buildContext);
    shouldBehaveLikeAllowedFunctions(buildContext);
    shouldBehaveLikeAllowedStandards(buildContext);
  });

  describe('Single + Batch Meta Transactions', () => {
    shouldBehaveLikeExecuteRelayCall(buildContext);
    shouldBehaveLikeMultiChannelNonce(buildContext);
  });

  describe('SIGN (ERC1271)', () => {
    shouldBehaveLikePermissionSign(buildContext);
  });
};

export const shouldInitializeLikeLSP6 = (buildContext: () => Promise<LSP6TestContext>) => {
  let context: LSP6TestContext;

  before(async () => {
    context = await buildContext();
  });

  describe('when the contract was initialized', () => {
    it('should support ERC165 interface', async () => {
      const result = await context.keyManager.supportsInterface(INTERFACE_IDS.ERC165);
      expect(result).to.be.true;
    });

    it('should support ERC1271 interface', async () => {
      const result = await context.keyManager.supportsInterface(INTERFACE_IDS.ERC1271);
      expect(result).to.be.true;
    });

    it('should support LSP6 interface', async () => {
      const result = await context.keyManager.supportsInterface(INTERFACE_IDS.LSP6KeyManager);
      expect(result).to.be.true;
    });

    it('should support LSP20CallVerifier interface', async () => {
      const result = await context.keyManager.supportsInterface(INTERFACE_IDS.LSP20CallVerifier);
      expect(result).to.be.true;
    });

    it('should support LSP25 interface', async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.LSP25ExecuteRelayCall,
      );
      expect(result).to.be.true;
    });

    it('should be linked to the right ERC725 account contract', async () => {
      const account = await context.keyManager.target();
      expect(account).to.equal(context.universalProfile.address);
    });
  });
};

export const testLSP6InternalFunctions = (
  buildContext: () => Promise<LSP6InternalsTestContext>,
) => {
  testAllowedCallsInternals(buildContext);
  testAllowedERC725YDataKeysInternals(buildContext);
  testReadingPermissionsInternals(buildContext);
  testSetDataInternals(buildContext);
  testExecuteInternals(buildContext);
};
