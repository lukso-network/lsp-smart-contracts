import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { ABIEncoder, ABIEncoder__factory } from '../../types';

describe('ABI Encoder Contract', () => {
  let accounts: SignerWithAddress[];
  let contract: ABIEncoder;

  before(async () => {
    accounts = await ethers.getSigners();
    contract = await new ABIEncoder__factory(accounts[0]).deploy();
  });

  const verifyResult = async (txParameterA, txParameterB) => {
    const [c] = await contract.callStatic.encode(txParameterA, txParameterB);
    const [a, b] = await contract.callStatic.decode(c);
    expect(a).to.equal(txParameterA);
    expect(b).to.equal(txParameterB);
  };

  const checkGasCost = async (txParameterA, txParameterB) => {
    const [, gasUsed] = await contract.callStatic.encode(txParameterA, txParameterB);
    return gasUsed.toNumber();
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
          a: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP1: typeId out of scope')),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when owner is not a KM with empty bytes', async () => {
        const txParams = {
          a: ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes('LSP1: account owner is not a LSP6KeyManager'),
          ),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when asset already exist with empty bytes', async () => {
        const txParams = {
          a: ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes('LSP1: asset received is already registered'),
          ),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when asset is not registered with empty bytes', async () => {
        const txParams = {
          a: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP1: asset sent is not registered')),
          b: '0x',
        };

        await checkGasCost(txParams.a, txParams.b);
      });

      it('Encoding URD response when full balance was not sent with empty bytes', async () => {
        const txParams = {
          a: ethers.utils.hexlify(ethers.utils.toUtf8Bytes('LSP1: full balance is not sent')),
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
