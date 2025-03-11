import { ethers } from 'hardhat';
import { expect } from 'chai';
import { ContractFactory, hexlify, keccak256, toUtf8Bytes } from 'ethers';
import { LSP1_TYPE_IDS } from '../../constants';

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
    let LSP1TypeIDsTester;

    before('Deploying `LSP1TypeIDs` tester contract', async () => {
      const signers = await ethers.getSigners();
      const LSP1TypeIDsTester__factory = await ethers.getContractFactory(
        'LSP1TypeIDsTester',
        signers[0],
      );
      LSP1TypeIDsTester = await LSP1TypeIDsTester__factory.deploy();
    });

    LSP1TypeIds.forEach(([typeIdName, typeIdHash]) =>
      it(`Testing LSP1 Type ID: ${typeIdName}`, async () => {
        const returnedTypeId = await LSP1TypeIDsTester.verifyLSP1TypeID(typeIdName);

        expect(returnedTypeId).to.equal(typeIdHash);
      }),
    );
  });
});
