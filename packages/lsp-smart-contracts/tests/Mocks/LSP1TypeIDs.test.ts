import { expect } from 'chai';
import { hexlify, keccak256, toUtf8Bytes } from 'ethers';
import {
  type LSP1TypeIDsTester,
  LSP1TypeIDsTester__factory,
} from '../../types/ethers-contracts/index.js';
import { LSP1_TYPE_IDS } from '../../constants.js';

describe('calculate LSP1 Type IDs', () => {
  const LSP1TypeIds = Object.entries(LSP1_TYPE_IDS);

  describe('Testing javascript constants', () => {
    LSP1TypeIds.forEach(([typeIdName, typeIdHash]) =>
      it(`Testing LSP1 Type ID: ${typeIdName}`, async () => {
        expect(typeIdHash).to.equal(hexlify(keccak256(toUtf8Bytes(typeIdName))));
      }),
    );
  });

  describe('Testing solidity constants', () => {
    let LSP1TypeIDsTester: LSP1TypeIDsTester;

    before('Deploying `LSP1TypeIDs` tester contract', async () => {
      const { network } = await import('hardhat');
      const { ethers } = await network.connect();
      const signers = await ethers.getSigners();
      LSP1TypeIDsTester = await new LSP1TypeIDsTester__factory(signers[0]).deploy();
    });

    LSP1TypeIds.forEach(([typeIdName, typeIdHash]) =>
      it(`Testing LSP1 Type ID: ${typeIdName}`, async () => {
        const returnedTypeId = await LSP1TypeIDsTester.verifyLSP1TypeID(typeIdName);

        expect(returnedTypeId).to.equal(typeIdHash);
      }),
    );
  });
});
