import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('ABI Encoder Contract', () => {
  let accounts: SignerWithAddress[];
  let contract;

  before(async () => {
    accounts = await ethers.getSigners();

    const ABIEncoder__factory = await ethers.getContractFactory('ABIEncoder', accounts[0]);

    contract = await ABIEncoder__factory.deploy();
  });

  const verifyResult = async (txParameterA, txParameterB) => {
    const [c] = await contract.encode(txParameterA, txParameterB);
    const [a, b] = await contract.decode(c);
    expect(a).to.equal(txParameterA);
    expect(b).to.equal(txParameterB);
  };

  const checkGasCost = async (txParameterA, txParameterB) => {
    const [, gasUsed] = await contract.encode(txParameterA, txParameterB);
    return ethers.toNumber(gasUsed);
  };

  describe('Checking the encoding works', () => {
    it('Encoding empty bytes', async () => {
      const txParams = {
        a: '0x',
        b: '0x',
      };

      await verifyResult(txParams.a, txParams.b);
    });

    it('Encoding one empty bytes with non empty bytes', async () => {
      const txParams = {
        a: '0xaabbccdd',
        b: '0x',
      };

      await verifyResult(txParams.a, txParams.b);
    });

    it('Encoding non empty bytes with non empty bytes', async () => {
      const txParams = {
        a: '0xaabbccdd',
        b: '0xaabbccdd',
      };

      await verifyResult(txParams.a, txParams.b);
    });
  });

  describe('Checking the gas cost', () => {
    describe('General cases', () => {
      it('Encoding small amount of bytes in one param', async () => {
        const txParams = {
          a: '0xaabbccdd',
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding larger amount of bytes in one param', async () => {
        const txParams = {
          a: '0xaabbccddaabbccddaabbccddaabbccddaabbccdd',
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding very large amount of bytes in one param', async () => {
        const txParams = {
          a: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding small amount of bytes in both param', async () => {
        const txParams = {
          a: '0xaabbccdd',
          b: '0xaabbccdd',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding larger amount of bytes in both param', async () => {
        const txParams = {
          a: '0xaabbccddaabbccddaabbccddaabbccddaabbccdd',
          b: '0xaabbccddaabbccddaabbccddaabbccddaabbccdd',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding very large amount of bytes in both param', async () => {
        const txParams = {
          a: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
          b: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
        };

        await checkGasCost(txParams.a, txParams.b);
      });
    });

    describe('LSP1 Specific Cases', () => {
      it('Encoding URD response when typeId out of scope with empty bytes', async () => {
        const txParams = {
          a: ethers.hexlify(ethers.toUtf8Bytes('LSP1: typeId out of scope')),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when owner is not a KM with empty bytes', async () => {
        const txParams = {
          a: ethers.hexlify(ethers.toUtf8Bytes('LSP1: account owner is not a LSP6KeyManager')),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when asset already exist with empty bytes', async () => {
        const txParams = {
          a: ethers.hexlify(ethers.toUtf8Bytes('LSP1: asset received is already registered')),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when asset is not registered with empty bytes', async () => {
        const txParams = {
          a: ethers.hexlify(ethers.toUtf8Bytes('LSP1: asset sent is not registered')),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when full balance was not sent with empty bytes', async () => {
        const txParams = {
          a: ethers.hexlify(ethers.toUtf8Bytes('LSP1: full balance is not sent')),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when the data is successfully set with empty bytes', async () => {
        const txParams = {
          a: '0x',
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });
    });
  });
});
