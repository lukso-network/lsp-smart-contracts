import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { StoreEmit1024, StoreEmit1024__factory, StoreEmit256, StoreEmit256__factory, StoreEmitFull, StoreEmitFull__factory, StoreEmit512__factory, StoreEmit512 } from '../../types';

describe('ABI Encoder ', () => {
  let accounts: SignerWithAddress[];
  let storeEmitFull: StoreEmitFull;
  let storeEmit256: StoreEmit256;
  let storeEmit512: StoreEmit512;
  let storeEmit1024: StoreEmit1024;

  before(async () => {
    accounts = await ethers.getSigners();
    storeEmitFull = await new StoreEmitFull__factory(accounts[0]).deploy();
    storeEmit256 = await new StoreEmit256__factory(accounts[0]).deploy();
    storeEmit512 = await new StoreEmit512__factory(accounts[0]).deploy();
    storeEmit1024 = await new StoreEmit1024__factory(accounts[0]).deploy();
  });

  const checkGasCost = async (contract, txParameterA, txParameterB) => {
    const tx = await contract.setData(txParameterA, txParameterB);
    const receipt = await tx.wait();
    return receipt.gasUsed.toNumber();
  };

  describe.only('Checking the gas cost', () => {
    describe('storing 32 bytes', () => {

          it('When emitting the 256 bytes of the event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('32'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(32));

        const gasused = await checkGasCost(storeEmit256, key, value);

        console.log(`Gas used when emitting the 256 bytes ${gasused}`);
            });
      
            it('When emitting the 512 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('32'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(32));

        const gasused = await checkGasCost(storeEmit512, key, value);

        console.log(`Gas used when emitting the 512 bytes ${gasused}`);
            });
      
            it('When emitting the 1024 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('32'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(32));

        const gasused = await checkGasCost(storeEmit1024, key, value);

        console.log(`Gas used when emitting the 1024 bytes ${gasused}`);
      });
      it('When emitting the full event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('32'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(32));

        const gasused = await checkGasCost(storeEmitFull, key, value);

        console.log(`Gas used when emitting the full bytes ${gasused}`);
      });
    });


    describe('storing 256 bytes', () => {

          it('When emitting the 256 bytes of the event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('256'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        const gasused = await checkGasCost(storeEmit256, key, value);

        console.log(`Gas used when emitting the 256 bytes ${gasused}`);
            });
      
            it('When emitting the 512 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('256'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        const gasused = await checkGasCost(storeEmit512, key, value);

        console.log(`Gas used when emitting the 512 bytes ${gasused}`);
            });
      
            it('When emitting the 1024 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('256'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        const gasused = await checkGasCost(storeEmit1024, key, value);

        console.log(`Gas used when emitting the 1024 bytes ${gasused}`);
      });
      it('When emitting the full event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('256'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        const gasused = await checkGasCost(storeEmitFull, key, value);

        console.log(`Gas used when emitting the full bytes ${gasused}`);
      });
    });

        describe('storing 512 bytes', () => {

          it('When emitting the 256 bytes of the event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('512'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(512));

        const gasused = await checkGasCost(storeEmit256, key, value);

        console.log(`Gas used when emitting the 256 bytes ${gasused}`);
            });
      
            it('When emitting the 512 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('512'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(512));

        const gasused = await checkGasCost(storeEmit512, key, value);

        console.log(`Gas used when emitting the 512 bytes ${gasused}`);
            });
      
            it('When emitting the 1024 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('512'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(512));

        const gasused = await checkGasCost(storeEmit1024, key, value);

        console.log(`Gas used when emitting the 1024 bytes ${gasused}`);
      });
      it('When emitting the full event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('512'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(512));

        const gasused = await checkGasCost(storeEmitFull, key, value);

        console.log(`Gas used when emitting the full bytes ${gasused}`);
      });
        });
    
            describe('storing 1024 bytes', () => {

          it('When emitting the 256 bytes of the event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1024'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(1024));

        const gasused = await checkGasCost(storeEmit256, key, value);

        console.log(`Gas used when emitting the 256 bytes ${gasused}`);
            });
      
            it('When emitting the 512 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1024'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(1024));

        const gasused = await checkGasCost(storeEmit512, key, value);

        console.log(`Gas used when emitting the 512 bytes ${gasused}`);
            });
      
            it('When emitting the 1024 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1024'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(1024));

        const gasused = await checkGasCost(storeEmit1024, key, value);

        console.log(`Gas used when emitting the 1024 bytes ${gasused}`);
      });
      it('When emitting the full event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('1024'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(1024));

        const gasused = await checkGasCost(storeEmitFull, key, value);

        console.log(`Gas used when emitting the full bytes ${gasused}`);
      });
            });
    
                describe('storing 2048 bytes', () => {

          it('When emitting the 256 bytes of the event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('2048'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(2048));

        const gasused = await checkGasCost(storeEmit256, key, value);

        console.log(`Gas used when emitting the 256 bytes ${gasused}`);
            });
      
            it('When emitting the 512 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('2048'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(2048));

        const gasused = await checkGasCost(storeEmit512, key, value);

        console.log(`Gas used when emitting the 512 bytes ${gasused}`);
            });
      
            it('When emitting the 1024 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('2048'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(2048));

        const gasused = await checkGasCost(storeEmit1024, key, value);

        console.log(`Gas used when emitting the 1024 bytes ${gasused}`);
      });
      it('When emitting the full event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('2048'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(2048));

        const gasused = await checkGasCost(storeEmitFull, key, value);

        console.log(`Gas used when emitting the full bytes ${gasused}`);
      });
                });
    
                    describe('storing 4096 bytes', () => {

          it('When emitting the 256 bytes of the event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('4096'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(4096));

        const gasused = await checkGasCost(storeEmit256, key, value);

        console.log(`Gas used when emitting the 256 bytes ${gasused}`);
            });
      
            it('When emitting the 512 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('4096'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(4096));

        const gasused = await checkGasCost(storeEmit512, key, value);

        console.log(`Gas used when emitting the 512 bytes ${gasused}`);
            });
      
            it('When emitting the 1024 event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('4096'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(4096));

        const gasused = await checkGasCost(storeEmit1024, key, value);

        console.log(`Gas used when emitting the 1024 bytes ${gasused}`);
      });
      it('When emitting the full event', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('4096'));
          const value = ethers.utils.hexlify(ethers.utils.randomBytes(4096));

        const gasused = await checkGasCost(storeEmitFull, key, value);

        console.log(`Gas used when emitting the full bytes ${gasused}`);
      });
    });
  });
});
