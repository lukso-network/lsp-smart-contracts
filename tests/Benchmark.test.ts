import fs from 'fs';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  LSP1UniversalReceiverDelegateUP,
  LSP1UniversalReceiverDelegateUP__factory,
  LSP6KeyManager__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
  LSP8Mintable,
  LSP8Mintable__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from '../types';

import {
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
  CALLTYPE,
  LSP8_TOKEN_ID_TYPES,
} from '../constants';
import { LSP6TestContext } from './utils/context';
import { setupKeyManager, setupProfileWithKeyManagerWithURD } from './utils/fixtures';
import {
  abiCoder,
  combineAllowedCalls,
  combinePermissions,
  encodeCompactBytesArray,
} from './utils/helpers';
import { BigNumber } from 'ethers';

export type UniversalProfileContext = {
  accounts: SignerWithAddress[];
  mainController: SignerWithAddress;
  universalProfile: UniversalProfile;
  initialFunding?: BigNumber;
};

function generateRandomData(length) {
  return ethers.utils.hexlify(ethers.utils.randomBytes(length));
}

const buildLSP6TestContext = async (initialFunding?: BigNumber): Promise<LSP6TestContext> => {
  const accounts = await ethers.getSigners();
  const mainController = accounts[0];

  const universalProfile = await new UniversalProfile__factory(mainController).deploy(
    mainController.address,
    {
      value: initialFunding,
    },
  );
  const keyManager = await new LSP6KeyManager__factory(mainController).deploy(
    universalProfile.address,
  );

  return { accounts, mainController, universalProfile, keyManager };
};

const buildUniversalProfileContext = async (
  initialFunding?: BigNumber,
): Promise<UniversalProfileContext> => {
  const accounts = await ethers.getSigners();
  const mainController = accounts[0];

  const universalProfile = await new UniversalProfile__factory(mainController).deploy(
    mainController.address,
    {
      value: initialFunding,
    },
  );

  return { accounts, mainController, universalProfile };
};

describe('⛽📊 Gas Benchmark', () => {
  let gasBenchmark;

  before('setup benchmark file', async () => {
    gasBenchmark = JSON.parse(fs.readFileSync('./scripts/ci/gas_benchmark_template.json', 'utf8'));
  });

  after(async () => {
    fs.writeFileSync('./gas_benchmark_result.json', JSON.stringify(gasBenchmark, null, 2));
  });

  describe('Deployment costs', () => {
    it('deploy contracts + save deployment costs', async () => {
      const accounts = await ethers.getSigners();

      // Universal Profile
      const universalProfile = await new UniversalProfile__factory(accounts[0]).deploy(
        accounts[0].address,
      );

      const universalProfileDeployTransaction = universalProfile.deployTransaction;
      const universalProfileDeploymentReceipt = await universalProfileDeployTransaction.wait();

      gasBenchmark['deployment_costs']['UniversalProfile'] =
        universalProfileDeploymentReceipt.gasUsed.toNumber();

      // Key Manager
      const keyManager = await new LSP6KeyManager__factory(accounts[0]).deploy(
        universalProfile.address,
      );

      const keyManagerDeployTransaction = keyManager.deployTransaction;
      const keyManagerDeploymentReceipt = await keyManagerDeployTransaction?.wait();

      gasBenchmark['deployment_costs']['KeyManager'] =
        keyManagerDeploymentReceipt?.gasUsed.toNumber();

      // LSP1 Delegate
      const lsp1Delegate = await new LSP1UniversalReceiverDelegateUP__factory(accounts[0]).deploy();

      const lsp1DelegateDeployTransaction = lsp1Delegate.deployTransaction;
      const lsp1DelegateDeploymentReceipt = await lsp1DelegateDeployTransaction.wait();

      gasBenchmark['deployment_costs']['LSP1DelegateUP'] =
        lsp1DelegateDeploymentReceipt.gasUsed.toNumber();

      // LSP7 Token (Mintable preset)
      const lsp7Mintable = await new LSP7Mintable__factory(accounts[0]).deploy(
        'Token',
        'MTKN',
        accounts[0].address,
        false,
      );

      const lsp7DeployTransaction = lsp7Mintable.deployTransaction;
      const lsp7DeploymentReceipt = await lsp7DeployTransaction.wait();

      gasBenchmark['deployment_costs']['LSP7Mintable'] = lsp7DeploymentReceipt.gasUsed.toNumber();

      // LSP8 NFT (Mintable preset)
      const lsp8Mintable = await new LSP8Mintable__factory(accounts[0]).deploy(
        'My NFT',
        'MNFT',
        accounts[0].address,
        LSP8_TOKEN_ID_TYPES.NUMBER,
      );

      const lsp8DeployTransaction = lsp8Mintable.deployTransaction;
      const lsp8DeploymentReceipt = await lsp8DeployTransaction.wait();

      gasBenchmark['deployment_costs']['LSP8Mintable'] = lsp8DeploymentReceipt.gasUsed.toNumber();
    });
  });

  describe('UniversalProfile', () => {
    let context: UniversalProfileContext;

    describe('execute', () => {
      describe('execute Single', () => {
        before(async () => {
          context = await buildUniversalProfileContext(ethers.utils.parseEther('50'));
        });

        it('Transfer 1 LYX to an EOA without data', async () => {
          const tx = await context.universalProfile
            .connect(context.mainController)
            .execute(
              OPERATION_TYPES.CALL,
              context.accounts[1].address,
              ethers.utils.parseEther('1'),
              '0x',
            );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['execute']['case_1']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Transfer 1 LYX to a UP without data', async () => {
          const tx = await context.universalProfile
            .connect(context.mainController)
            .execute(
              OPERATION_TYPES.CALL,
              context.universalProfile.address,
              ethers.utils.parseEther('1'),
              '0x',
            );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['execute']['case_2']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Transfer 1 LYX to an EOA with 256 bytes of data', async () => {
          const tx = await context.universalProfile
            .connect(context.mainController)
            .execute(
              OPERATION_TYPES.CALL,
              context.accounts[1].address,
              ethers.utils.parseEther('1'),
              generateRandomData(256),
            );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['execute']['case_3']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Transfer 1 LYX to a UP with 256 bytes of data', async () => {
          const tx = await context.universalProfile
            .connect(context.mainController)
            .execute(
              OPERATION_TYPES.CALL,
              context.universalProfile.address,
              ethers.utils.parseEther('1'),
              ethers.utils.hexConcat(['0x00000000', generateRandomData(252)]),
            );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['execute']['case_4']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });
      });

      describe('execute Array', () => {
        let universalProfile1: UniversalProfile, universalProfile2, universalProfile3;

        before(async () => {
          context = await buildUniversalProfileContext(ethers.utils.parseEther('50'));

          universalProfile1 = await new UniversalProfile__factory(context.mainController).deploy(
            context.accounts[2].address,
          );

          universalProfile2 = await new UniversalProfile__factory(context.mainController).deploy(
            context.accounts[3].address,
          );

          universalProfile3 = await new UniversalProfile__factory(context.mainController).deploy(
            context.accounts[4].address,
          );
        });

        it('Transfer 0.1 LYX to 3x EOA without data', async () => {
          const tx = await context.universalProfile
            .connect(context.mainController)
            .executeBatch(
              [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
              [
                context.accounts[1].address,
                context.accounts[2].address,
                context.accounts[3].address,
              ],
              [
                ethers.utils.parseEther('0.1'),
                ethers.utils.parseEther('0.1'),
                ethers.utils.parseEther('0.1'),
              ],
              ['0x', '0x', '0x'],
            );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['execute']['case_5']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Transfer 0.1 LYX to 3x UP without data', async () => {
          const tx = await context.universalProfile
            .connect(context.mainController)
            .executeBatch(
              [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
              [universalProfile1.address, universalProfile2.address, universalProfile3.address],
              [
                ethers.utils.parseEther('0.1'),
                ethers.utils.parseEther('0.1'),
                ethers.utils.parseEther('0.1'),
              ],
              ['0x', '0x', '0x'],
            );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['execute']['case_6']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Transfer 0.1 LYX to 3x EOA with 256 bytes of data', async () => {
          const tx = await context.universalProfile
            .connect(context.mainController)
            .executeBatch(
              [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
              [
                context.accounts[1].address,
                context.accounts[2].address,
                context.accounts[3].address,
              ],
              [
                ethers.utils.parseEther('0.1'),
                ethers.utils.parseEther('0.1'),
                ethers.utils.parseEther('0.1'),
              ],
              [generateRandomData(256), generateRandomData(256), generateRandomData(256)],
            );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['execute']['case_7']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Transfer 0.1 LYX to 3x UP with 256 bytes of data', async () => {
          const random256BytesData = ethers.utils.hexConcat([
            '0x00000000',
            generateRandomData(252),
          ]);

          const tx = await context.universalProfile
            .connect(context.mainController)
            .executeBatch(
              [OPERATION_TYPES.CALL, OPERATION_TYPES.CALL, OPERATION_TYPES.CALL],
              [universalProfile1.address, universalProfile2.address, universalProfile3.address],
              [
                ethers.utils.parseEther('0.1'),
                ethers.utils.parseEther('0.1'),
                ethers.utils.parseEther('0.1'),
              ],
              [random256BytesData, random256BytesData, random256BytesData],
            );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['execute']['case_8']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });
      });
    });

    describe('setData', () => {
      describe('setData Single', () => {
        before(async () => {
          context = await buildUniversalProfileContext(ethers.utils.parseEther('50'));
        });

        it('Set a 20 bytes long value', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Key'));
          const value = generateRandomData(20);

          const tx = await context.universalProfile.setData(key, value);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_1']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Set a 60 bytes long value', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Other Key'));
          const value = generateRandomData(60);

          const tx = await context.universalProfile.setData(key, value);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_2']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Set a 160 bytes long value', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Third Key'));
          const value = generateRandomData(160);

          const tx = await context.universalProfile.setData(key, value);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_3']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Set a 300 bytes long value', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Fourth Key'));
          const value = generateRandomData(300);

          const tx = await context.universalProfile.setData(key, value);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_4']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Set a 600 bytes long value', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Fifth Key'));
          const value = generateRandomData(600);

          const tx = await context.universalProfile.setData(key, value);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_5']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Change the value of a data key already set', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Fifth Key'));
          const value1 = generateRandomData(20);
          const value2 = generateRandomData(20);

          await context.universalProfile.setData(key, value1);

          const tx = await context.universalProfile.setData(key, value2);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_6']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Remove the value of a data key already set', async () => {
          const key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('My Fifth Key'));
          const value = generateRandomData(20);

          await context.universalProfile.setData(key, value);

          const tx = await context.universalProfile.setData(key, '0x');

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_7']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });
      });

      describe('setData Array', () => {
        before(async () => {
          context = await buildUniversalProfileContext(ethers.utils.parseEther('50'));
        });

        it('Set 2 data keys of 20 bytes long value', async () => {
          const key1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key1'));
          const value1 = generateRandomData(20);

          const key2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key2'));
          const value2 = generateRandomData(20);

          const tx = await context.universalProfile.setDataBatch([key1, key2], [value1, value2]);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_8']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Set 2 data keys of 100 bytes long value', async () => {
          const key1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key3'));
          const value1 = generateRandomData(100);

          const key2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key4'));
          const value2 = generateRandomData(100);

          const tx = await context.universalProfile.setDataBatch([key1, key2], [value1, value2]);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_9']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Set 3 data keys of 20 bytes long value', async () => {
          const key1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key5'));
          const value1 = generateRandomData(20);

          const key2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key6'));
          const value2 = generateRandomData(20);

          const key3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key7'));
          const value3 = generateRandomData(20);

          const tx = await context.universalProfile.setDataBatch(
            [key1, key2, key3],
            [value1, value2, value3],
          );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_10']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Change the value of three data keys already set of 20 bytes long value', async () => {
          const key1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key8'));
          const value1 = generateRandomData(20);

          const key2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key9'));
          const value2 = generateRandomData(20);

          const key3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key10'));
          const value3 = generateRandomData(20);

          await context.universalProfile.setDataBatch([key1, key2, key3], [value1, value2, value3]);

          const tx = await context.universalProfile.setDataBatch(
            [key1, key2, key3],
            [value1, value2, value3],
          );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_11']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('Remove the value of three data keys already set', async () => {
          const key1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key11'));
          const value1 = generateRandomData(20);

          const key2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key12'));
          const value2 = generateRandomData(20);

          const key3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Key13'));
          const value3 = generateRandomData(20);

          await context.universalProfile.setDataBatch([key1, key2, key3], [value1, value2, value3]);

          const tx = await context.universalProfile.setDataBatch(
            [key1, key2, key3],
            ['0x', '0x', '0x'],
          );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['setData']['case_12']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });
      });
    });

    describe('Tokens', () => {
      let lsp7Token: LSP7Mintable;
      let lsp8Token: LSP8Mintable;
      let universalProfile1;

      before(async () => {
        context = await buildUniversalProfileContext(ethers.utils.parseEther('50'));
        // deploy a LSP7 token
        lsp7Token = await new LSP7Mintable__factory(context.mainController).deploy(
          'Token',
          'MTKN',
          context.mainController.address,
          false,
        );

        // deploy a LSP8 token
        lsp8Token = await new LSP8Mintable__factory(context.mainController).deploy(
          'My NFT',
          'MNFT',
          context.mainController.address,
          LSP8_TOKEN_ID_TYPES.UNIQUE_ID,
        );

        universalProfile1 = await new UniversalProfile__factory(context.mainController).deploy(
          context.accounts[2].address,
        );
      });

      describe('LSP7DigitalAsset', () => {
        it('when minting LSP7Token to a UP without data', async () => {
          const tx = await lsp7Token.mint(context.universalProfile.address, 20, false, '0x');

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['tokens']['case_1']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('when minting LSP7Token to a EOA without data', async () => {
          const tx = await lsp7Token.mint(context.accounts[5].address, 20, true, '0x');

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['tokens']['case_2']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('when transferring LSP7Token from a UP to a UP without data', async () => {
          const lsp7TransferPayload = lsp7Token.interface.encodeFunctionData('transfer', [
            context.universalProfile.address,
            universalProfile1.address,
            5,
            false,
            '0x',
          ]);

          const tx = await context.universalProfile
            .connect(context.mainController)
            .execute(OPERATION_TYPES.CALL, lsp7Token.address, 0, lsp7TransferPayload);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['tokens']['case_3']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });
      });

      describe('LSP8IdentifiableDigitalAsset', () => {
        const metaNFTList: string[] = [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000000000000000000000000000002',
          '0x0000000000000000000000000000000000000000000000000000000000000003',
          '0x0000000000000000000000000000000000000000000000000000000000000004',
        ];

        it('when minting LSP8Token to a UP without data', async () => {
          const tx = await lsp8Token.mint(
            context.universalProfile.address,
            metaNFTList[0],
            false,
            '0x',
          );

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['tokens']['case_4']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('when minting LSP8Token to a EOA without data', async () => {
          const tx = await lsp8Token.mint(context.accounts[5].address, metaNFTList[1], true, '0x');

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['tokens']['case_5']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });

        it('when transferring LSP8Token from a UP to a UP without data', async () => {
          const lsp8TransferPayload = lsp8Token.interface.encodeFunctionData('transfer', [
            context.universalProfile.address,
            universalProfile1.address,
            metaNFTList[0],
            false,
            '0x',
          ]);

          const tx = await context.universalProfile
            .connect(context.mainController)
            .execute(OPERATION_TYPES.CALL, lsp8Token.address, 0, lsp8TransferPayload);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['EOA_owner']['tokens']['case_6']['gas_cost'] =
            receipt.gasUsed.toNumber();
        });
      });
    });
  });

  describe('KeyManager', () => {
    describe('`execute(...)` via Key Manager', () => {
      describe('main controller (this browser extension)', () => {
        let context: LSP6TestContext;

        let recipientEOA: SignerWithAddress;
        // setup Alice's Universal Profile as a recipient of LYX and tokens transactions
        let aliceUP: UniversalProfile;

        let lsp7MetaCoin: LSP7Mintable;
        let lsp8MetaNFT: LSP8Mintable;

        const nftList: string[] = [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000000000000000000000000000002',
          '0x0000000000000000000000000000000000000000000000000000000000000003',
          '0x0000000000000000000000000000000000000000000000000000000000000004',
        ];

        before(async () => {
          context = await buildLSP6TestContext(ethers.utils.parseEther('50'));

          recipientEOA = context.accounts[1];
          const deployedContracts = await setupProfileWithKeyManagerWithURD(context.accounts[2]);
          aliceUP = deployedContracts[0] as UniversalProfile;

          const lsp1Delegate: LSP1UniversalReceiverDelegateUP =
            await new LSP1UniversalReceiverDelegateUP__factory(context.accounts[0]).deploy();

          // the function `setupKeyManager` gives ALL PERMISSIONS to the owner as the first data key
          // We also setup the following:
          //    - LSP1 Delegate (for registering LSP7 tokens + LSP8 NFTs)
          //    - LSP3Profile metadata (to test for updates)
          await setupKeyManager(
            context,
            [ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate],
            [lsp1Delegate.address],
          );

          // deploy a LSP7 token
          lsp7MetaCoin = await new LSP7Mintable__factory(context.mainController).deploy(
            'MetaCoin',
            'MTC',
            context.mainController.address,
            false,
          );

          // deploy a LSP8 NFT
          lsp8MetaNFT = await new LSP8Mintable__factory(context.mainController).deploy(
            'MetaNFT',
            'MNF',
            context.mainController.address,
            LSP8_TOKEN_ID_TYPES.UNIQUE_ID,
          );

          // mint some tokens to the UP
          await lsp7MetaCoin.mint(context.universalProfile.address, 1000, false, '0x');

          // mint some NFTs to the UP
          nftList.forEach(async (nft) => {
            await lsp8MetaNFT.mint(context.universalProfile.address, nft, false, '0x');
          });
        });

        it('transfer some LYXes to an EOA', async () => {
          const lyxAmount = ethers.utils.parseEther('3');

          // prettier-ignore
          const tx = await context.universalProfile.connect(context.mainController).execute(OPERATION_TYPES.CALL, recipientEOA.address, lyxAmount, "0x");
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_1'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfers some LYXes to a UP', async () => {
          const lyxAmount = ethers.utils.parseEther('3');

          // prettier-ignore
          const tx = await context.universalProfile.connect(context.mainController).execute(OPERATION_TYPES.CALL, aliceUP.address, lyxAmount, "0x");
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_2'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfers some tokens (LSP7) to an EOA (no data)', async () => {
          const tokenAmount = 100;

          // prettier-ignore
          const tx = await context.universalProfile.connect(context.mainController).execute(
            OPERATION_TYPES.CALL,
            lsp7MetaCoin.address,
            0,
            lsp7MetaCoin.interface.encodeFunctionData("transfer", [
              context.universalProfile.address,
              recipientEOA.address,
              tokenAmount,
              true,
              "0x",
            ])
          );
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_3'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfer some tokens (LSP7) to a UP (no data)', async () => {
          const tokenAmount = 100;

          // prettier-ignore
          const tx = await context.universalProfile.connect(context.mainController).execute(
            OPERATION_TYPES.CALL,
            lsp7MetaCoin.address,
            0,
            lsp7MetaCoin.interface.encodeFunctionData("transfer", [
              context.universalProfile.address,
              aliceUP.address,
              tokenAmount,
              true,
              "0x",
            ])
          );
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_4'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfer a NFT (LSP8) to a EOA (no data)', async () => {
          const nftId = nftList[0];

          // prettier-ignore
          const tx = await context.universalProfile.connect(context.mainController).execute(
            OPERATION_TYPES.CALL,
            lsp8MetaNFT.address,
            0,
            lsp8MetaNFT.interface.encodeFunctionData("transfer", [
              context.universalProfile.address,
              recipientEOA.address,
              nftId,
              true,
              "0x",
            ])
          );
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_5'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfer a NFT (LSP8) to a UP (no data)', async () => {
          const nftId = nftList[1];

          // prettier-ignore
          const tx = await context.universalProfile.connect(context.mainController).execute(
            OPERATION_TYPES.CALL,
            lsp8MetaNFT.address,
            0,
            lsp8MetaNFT.interface.encodeFunctionData("transfer", [
              context.universalProfile.address,
              aliceUP.address,
              nftId,
              false,
              "0x",
            ])
          );
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_6'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });
      });

      describe('controllers with some restrictions', () => {
        let context: LSP6TestContext;

        let recipientEOA: SignerWithAddress;
        // setup Alice's Universal Profile as a recipient of LYX and tokens transactions
        let aliceUP: UniversalProfile;

        let canTransferValueToOneAddress: SignerWithAddress,
          canTransferTwoTokens: SignerWithAddress,
          canTransferTwoNFTs: SignerWithAddress;

        let allowedAddressToTransferValue: string;

        let lsp7MetaCoin: LSP7Mintable, lsp7LyxDai: LSP7Mintable;
        let lsp8MetaNFT: LSP8Mintable, lsp8LyxPunks: LSP8Mintable;

        const metaNFTList: string[] = [
          '0x0000000000000000000000000000000000000000000000000000000000000001',
          '0x0000000000000000000000000000000000000000000000000000000000000002',
          '0x0000000000000000000000000000000000000000000000000000000000000003',
          '0x0000000000000000000000000000000000000000000000000000000000000004',
        ];

        const lyxPunksList: string[] = [
          '0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe',
          '0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef',
          '0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead',
          '0xf00df00df00df00df00df00df00df00df00df00df00df00df00df00df00df00d',
        ];

        before(async () => {
          context = await buildLSP6TestContext(ethers.utils.parseEther('50'));

          recipientEOA = context.accounts[1];

          // UP receiving LYX, Tokens and NFT transfers
          const deployedContracts = await setupProfileWithKeyManagerWithURD(context.accounts[2]);
          aliceUP = deployedContracts[0] as UniversalProfile;

          // LYX transfer scenarios
          canTransferValueToOneAddress = context.accounts[1];
          allowedAddressToTransferValue = context.accounts[2].address;

          // LSP7 token transfer scenarios
          canTransferTwoTokens = context.accounts[3];

          lsp7MetaCoin = await new LSP7Mintable__factory(context.mainController).deploy(
            'MetaCoin',
            'MTC',
            context.mainController.address,
            false,
          );

          lsp7LyxDai = await new LSP7Mintable__factory(context.mainController).deploy(
            'LyxDai',
            'LDAI',
            context.mainController.address,
            false,
          );

          [lsp7MetaCoin, lsp7LyxDai].forEach(async (token) => {
            await token.mint(context.universalProfile.address, 1000, false, '0x');
          });

          // LSP8 NFT transfer scenarios
          canTransferTwoNFTs = context.accounts[4];

          lsp8MetaNFT = await new LSP8Mintable__factory(context.mainController).deploy(
            'MetaNFT',
            'MNF',
            context.mainController.address,
            LSP8_TOKEN_ID_TYPES.UNIQUE_ID,
          );

          lsp8LyxPunks = await new LSP8Mintable__factory(context.mainController).deploy(
            'LyxPunks',
            'LPK',
            context.mainController.address,
            LSP8_TOKEN_ID_TYPES.UNIQUE_ID,
          );

          [
            { contract: lsp8MetaNFT, tokenIds: metaNFTList },
            { contract: lsp8MetaNFT, tokenIds: lyxPunksList },
          ].forEach(async (nftContract) => {
            // mint some NFTs to the UP
            nftContract.tokenIds.forEach(async (nft) => {
              await lsp8MetaNFT.mint(context.universalProfile.address, nft, false, '0x');
            });
          });

          const lsp1Delegate = await new LSP1UniversalReceiverDelegateUP__factory(
            context.accounts[0],
          ).deploy();

          // prettier-ignore
          await setupKeyManager(
            context,
            [
              ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + canTransferValueToOneAddress.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + canTransferTwoTokens.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + canTransferTwoNFTs.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] + canTransferValueToOneAddress.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] + canTransferTwoTokens.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] + canTransferTwoNFTs.address.substring(2),
            ],
            [
              lsp1Delegate.address,
              PERMISSIONS.TRANSFERVALUE,
              PERMISSIONS.CALL,
              PERMISSIONS.CALL,
              combineAllowedCalls([CALLTYPE.VALUE, CALLTYPE.VALUE], [allowedAddressToTransferValue, aliceUP.address], ["0xffffffff", "0xffffffff"], ["0xffffffff", "0xffffffff"]),
              combineAllowedCalls(
                [CALLTYPE.CALL, CALLTYPE.CALL],
                [lsp7MetaCoin.address, lsp7LyxDai.address],
                [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.LSP7DigitalAsset],
                ["0xffffffff", "0xffffffff"]
              ),
              combineAllowedCalls(
                [CALLTYPE.CALL, CALLTYPE.CALL],
                [lsp8MetaNFT.address, lsp8LyxPunks.address],
                [INTERFACE_IDS.LSP8IdentifiableDigitalAsset, INTERFACE_IDS.LSP8IdentifiableDigitalAsset],
                ["0xffffffff", "0xffffffff"]
              )
            ]
          )
        });

        it('transfer some LYXes to an EOA - restricted to 2 x allowed address only (TRANSFERVALUE + 2x AllowedCalls)', async () => {
          const lyxAmount = 10;

          const tx = await context.universalProfile
            .connect(canTransferValueToOneAddress)
            .execute(OPERATION_TYPES.CALL, allowedAddressToTransferValue, lyxAmount, '0x');
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_1'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfer some LYXes to a UP - restricted to 2 x allowed address only (an EOA + a UP) (TRANSFERVALUE + 2x AllowedCalls)', async () => {
          // ...
          const lyxAmount = 10;

          const tx = await context.universalProfile
            .connect(canTransferValueToOneAddress)
            .execute(OPERATION_TYPES.CALL, aliceUP.address, lyxAmount, '0x');
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_2'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfers some tokens (LSP7) to an EOA - restricted to LSP7 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)', async () => {
          const tokenAmount = 100;

          // prettier-ignore
          const tx = await context.universalProfile.connect(canTransferTwoTokens).execute(
            OPERATION_TYPES.CALL,
            lsp7MetaCoin.address,
            0,
            lsp7MetaCoin.interface.encodeFunctionData("transfer", [
              context.universalProfile.address,
              recipientEOA.address,
              tokenAmount,
              true,
              "0x",
            ])
          );
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_3'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfers some tokens (LSP7) to an other UP - restricted to LSP7 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)', async () => {
          const tokenAmount = 100;

          // prettier-ignore
          const tx = await context.universalProfile.connect(canTransferTwoTokens).execute(
            OPERATION_TYPES.CALL,
            lsp7MetaCoin.address,
            0,
            lsp7MetaCoin.interface.encodeFunctionData("transfer", [
              context.universalProfile.address,
              aliceUP.address,
              tokenAmount,
              true,
              "0x",
            ])
          );
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_4'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfers a NFT (LSP8) to an EOA - restricted to LSP8 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)', async () => {
          const nftId = metaNFTList[0];

          // prettier-ignore
          const tx = await context.universalProfile.connect(canTransferTwoNFTs).execute(
            OPERATION_TYPES.CALL,
            lsp8MetaNFT.address,
            0,
            lsp8MetaNFT.interface.encodeFunctionData("transfer", [
              context.universalProfile.address,
              recipientEOA.address,
              nftId,
              true,
              "0x",
            ])
          );
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_5'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('transfers a NFT (LSP8) to an other UP - restricted to LSP8 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)', async () => {
          const nftId = metaNFTList[1];

          // prettier-ignore
          const tx = await context.universalProfile.connect(canTransferTwoNFTs).execute(
            OPERATION_TYPES.CALL,
            lsp8MetaNFT.address,
            0,
            lsp8MetaNFT.interface.encodeFunctionData("transfer", [
              context.universalProfile.address,
              aliceUP.address,
              nftId,
              false,
              "0x",
            ])
          );
          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['execute']['case_6'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });
      });
    });

    describe('`setData(...)` via Key Manager', () => {
      let context: LSP6TestContext;

      let controllerToAddEditAndRemove: SignerWithAddress;

      const allowedERC725YDataKeys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key1')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key2')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key3')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key4')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key5')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key6')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key7')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key8')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key9')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('key10')),
      ];

      // Fictional scenario of a NFT Marketplace dApp
      const nftMarketplaceDataKeys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NFT Marketplace dApp - settings')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NFT Marketplace dApp - followers')),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes('NFT Marketplace dApp - rewards')),
      ];

      before(async () => {
        context = await buildLSP6TestContext();

        controllerToAddEditAndRemove = context.accounts[1];

        // prettier-ignore
        const permissionKeys = [
          ERC725YDataKeys.LSP3.LSP3Profile,
          ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
          ERC725YDataKeys.LSP6["AddressPermissions[]"].index + "00000000000000000000000000000000",
        ];

        const permissionValues = [
          // Set some JSONURL for LSP3Profile metadata to test gas cost of updating your profile details
          '0x6f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e35',
          ethers.utils.hexZeroPad(ethers.BigNumber.from(3).toHexString(), 16),
          context.mainController.address,
        ];

        // The `context.mainController` is given `ALL_PERMISSIONS` as the first data key through `setupKeyManager` method.
        await setupKeyManager(context, permissionKeys, permissionValues);
      });

      describe('main controller (this browser extension) has SUPER_SETDATA ', () => {
        it('Update profile details (LSP3Profile metadata)', async () => {
          const dataKey = ERC725YDataKeys.LSP3['LSP3Profile'];
          const dataValue =
            '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178';

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setData(dataKey, dataValue);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_1'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it(`Give permissions to a controller
          1. increase \`AddressPermissions[]\` array length
          2. put the controller address at \`AddressPermissions[index]\`
          3. give the controller the permission \`SETDATA\` under \`AddressPermissions:Permissions:<controller>\`
          4. allow the controller to set 3x specific ERC725Y data keys under \`AddressPermissions:AllowedERC725YDataKeys:<controller>\`
      `, async () => {
          const newController = controllerToAddEditAndRemove;

          const AddressPermissionsArrayLength = await context.universalProfile['getData(bytes32)'](
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          );

          // prettier-ignore
          const dataKeys = [
            ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
            ERC725YDataKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(AddressPermissionsArrayLength), 16).substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + newController.address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + newController.address.substring(2),
          ];

          // prettier-ignore
          const dataValues = [
            ethers.utils.hexZeroPad(ethers.BigNumber.from(AddressPermissionsArrayLength).add(1).toHexString(), 16),
            newController.address,
            combinePermissions(PERMISSIONS.SETDATA),
            encodeCompactBytesArray([
                ERC725YDataKeys.LSP3.LSP3Profile,
                ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index,
                ERC725YDataKeys.LSP12['LSP12IssuedAssetsMap'],
            ])
          ];

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          expect(await context.universalProfile.getDataBatch(dataKeys)).to.deep.equal(dataValues);

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_2'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Update permissions of previous controller. Allow it now to `SUPER_SETDATA`', async () => {
          const controllerToEdit = controllerToAddEditAndRemove;

          const dataKey =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            controllerToEdit.address.substring(2);

          const dataValue = combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.SUPER_SETDATA);

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setData(dataKey, dataValue);

          const receipt = await tx.wait();

          expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_3'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it(`Remove a controller
          1. decrease \`AddressPermissions[]\` array length
          2. remove the controller address at \`AddressPermissions[index]\`
          3. set \`0x\` for the controller permissions under \`AddressPermissions:Permissions:<controller>\`
          4. remove the Allowed ERC725Y Data Keys previously set for the controller under \`AddressPermissions:AllowedERC725YDataKeys:<controller>\`
      `, async () => {
          const newController = controllerToAddEditAndRemove;

          const AddressPermissionsArrayLength = await context.universalProfile['getData(bytes32)'](
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          );

          // prettier-ignore
          const dataKeys = [
            ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
            ERC725YDataKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(AddressPermissionsArrayLength), 16).substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + newController.address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + newController.address.substring(2),
          ];

          // prettier-ignore
          const dataValues = [
            ethers.utils.hexZeroPad(ethers.BigNumber.from(AddressPermissionsArrayLength).sub(1).toHexString(), 16),
            "0x",
            "0x",
            "0x",
          ];

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_4'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Write 5x new LSP12 Issued Assets', async () => {
          // prettier-ignore
          const issuedAssetsDataKeys = [
            ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length,
            ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000000",
            ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000001",
            ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000002",
            ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000003",
            ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000004",
          ];

          // these are just random placeholder values
          // they should be replaced with actual token contract address
          const issuedAssetsDataValues = [
            '0x0000000000000000000000000000000000000000000000000000000000000005',
            context.accounts[5].address,
            context.accounts[6].address,
            context.accounts[7].address,
            context.accounts[8].address,
            context.accounts[9].address,
          ];

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(issuedAssetsDataKeys, issuedAssetsDataValues);

          const receipt = await tx.wait();

          expect(await context.universalProfile.getDataBatch(issuedAssetsDataKeys)).to.deep.equal(
            issuedAssetsDataValues,
          );

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_5'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Updates 1x data key', async () => {
          const dataKey = allowedERC725YDataKeys[5];
          const dataValue = '0xaabbccdd';

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setData(dataKey, dataValue);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_5'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Updates 3x data keys (first x3)', async () => {
          const dataKeys = allowedERC725YDataKeys.slice(0, 3);
          const dataValues = ['0xaabbccdd', '0xaabbccdd', '0xaabbccdd'];

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_6'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Update 3x data keys (middle x3)', async () => {
          const dataKeys = allowedERC725YDataKeys.slice(3, 6);
          const dataValues = ['0xaabbccdd', '0xaabbccdd', '0xaabbccdd'];

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_7'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Update 3x data keys (last x3)', async () => {
          const dataKeys = allowedERC725YDataKeys.slice(7, 10);
          const dataValues = ['0xaabbccdd', '0xaabbccdd', '0xaabbccdd'];

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_8'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Set 2x data keys + add 3x new controllers (including setting the array length + indexes under AddressPermissions[index]) - 12 data keys in total', async () => {
          const addressPermissionsArrayLength = ethers.BigNumber.from(
            await context.universalProfile.getData(
              ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
            ),
          ).toNumber();

          const newArrayLengthUint128Hex = ethers.utils.hexZeroPad(
            ethers.BigNumber.from(addressPermissionsArrayLength).add(3).toHexString(),
            16,
          );

          // example of a dApp that set some logic
          const compactBytesArrayAllowedERC725YDataKeys = encodeCompactBytesArray([
            ...nftMarketplaceDataKeys,
            ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index,
            ERC725YDataKeys.LSP12['LSP12IssuedAssetsMap'],
          ]);

          const dataKeys = [
            nftMarketplaceDataKeys[0], // set the settings and followers to 0 to start (rewards are set later)
            nftMarketplaceDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
            ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              `0000000000000000000000000000000${addressPermissionsArrayLength}`,
            ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              `0000000000000000000000000000000${addressPermissionsArrayLength + 1}`,
            ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              `0000000000000000000000000000000${addressPermissionsArrayLength + 2}`,
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts[3].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts[4].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts[5].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              context.accounts[3].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              context.accounts[4].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              context.accounts[5].address.substring(2),
          ];

          const dataValues = [
            // user settings
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some default user settings to start')),
            // followers count starts at 0
            abiCoder.encode(['uint256'], [0]),
            newArrayLengthUint128Hex,
            context.accounts[3].address,
            context.accounts[4].address,
            context.accounts[5].address,
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            compactBytesArrayAllowedERC725YDataKeys,
            compactBytesArrayAllowedERC725YDataKeys,
            compactBytesArrayAllowedERC725YDataKeys,
          ];

          const tx = await context.universalProfile
            .connect(context.mainController)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_9'][
            'main_controller'
          ] = receipt.gasUsed.toNumber();
        });
      });

      describe('restricted controllers', () => {
        let controllercanSetTwoDataKeys: SignerWithAddress,
          controllerCanAddControllers: SignerWithAddress,
          controllerCanEditPermissions: SignerWithAddress,
          controllerCanSetTenDataKeys: SignerWithAddress,
          controllerCanSetDataAndAddControllers: SignerWithAddress;

        before(async () => {
          context = await buildLSP6TestContext();

          controllercanSetTwoDataKeys = context.accounts[1];
          controllerCanAddControllers = context.accounts[2];
          controllerCanEditPermissions = context.accounts[3];
          controllerCanSetTenDataKeys = context.accounts[4];
          controllerCanSetDataAndAddControllers = context.accounts[5];

          controllerToAddEditAndRemove = context.accounts[6];

          // prettier-ignore
          const permissionKeys = [
                ERC725YDataKeys.LSP3.LSP3Profile,
                ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
                ERC725YDataKeys.LSP6["AddressPermissions[]"].index + "00000000000000000000000000000000",
                ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + controllercanSetTwoDataKeys.address.substring(2),
                ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + controllercanSetTwoDataKeys.address.substring(2),
                ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + controllerCanAddControllers.address.substring(2),
                ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + controllerCanEditPermissions.address.substring(2),
                ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + controllerCanSetTenDataKeys.address.substring(2),
                ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + controllerCanSetTenDataKeys.address.substring(2),
                ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + controllerCanSetDataAndAddControllers.address.substring(2),
                ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + controllerCanSetDataAndAddControllers.address.substring(2),
            ];

          const permissionValues = [
            // Set some JSONURL for LSP3Profile metadata to test gas cost of updating your profile details
            '0x6f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e35',
            ethers.utils.hexZeroPad(ethers.BigNumber.from(6).toHexString(), 16),
            context.mainController.address,
            PERMISSIONS.SETDATA,
            encodeCompactBytesArray([
              ERC725YDataKeys.LSP3.LSP3Profile,
              ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index,
            ]),
            PERMISSIONS.ADDCONTROLLER,
            PERMISSIONS.EDITPERMISSIONS,
            PERMISSIONS.SETDATA,
            encodeCompactBytesArray(allowedERC725YDataKeys),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.ADDCONTROLLER),
            encodeCompactBytesArray([
              ...nftMarketplaceDataKeys,
              ERC725YDataKeys.LSP3.LSP3Profile,
              ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index,
            ]),
          ];

          // The `context.mainController` is given `ALL_PERMISSIONS` as the first data key through `setupKeyManager` method.
          await setupKeyManager(context, permissionKeys, permissionValues);
        });

        it('Update profile details (LSP3Profile metadata)', async () => {
          const dataKey = ERC725YDataKeys.LSP3['LSP3Profile'];
          const dataValue =
            '0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178';

          const tx = await context.universalProfile
            .connect(controllercanSetTwoDataKeys)
            .setData(dataKey, dataValue);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_1'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it(`Give permissions to a controller
            1. increase \`AddressPermissions[]\` array length
            2. put the controller address at \`AddressPermissions[index]\`
            3. give the controller the permission \`SETDATA\` under \`AddressPermissions:Permissions:<controller>\`
            4. allow the controller to set 3x specific ERC725Y data keys under \`AddressPermissions:AllowedERC725YDataKeys:<controller>\`
        `, async () => {
          const newController = controllerToAddEditAndRemove;

          const AddressPermissionsArrayLength = await context.universalProfile['getData(bytes32)'](
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          );

          // prettier-ignore
          const dataKeys = [
              ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(AddressPermissionsArrayLength), 16).substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + newController.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + newController.address.substring(2),
            ];

          // prettier-ignore
          const dataValues = [
              ethers.utils.hexZeroPad(ethers.BigNumber.from(AddressPermissionsArrayLength).add(1).toHexString(), 16),
              newController.address,
              combinePermissions(PERMISSIONS.SETDATA),
              encodeCompactBytesArray([
                  ERC725YDataKeys.LSP3.LSP3Profile,
                  ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index,
                  ERC725YDataKeys.LSP12['LSP12IssuedAssetsMap'],
              ])
            ];

          const tx = await context.universalProfile
            .connect(controllerCanAddControllers)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          expect(await context.universalProfile.getDataBatch(dataKeys)).to.deep.equal(dataValues);

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_2'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Update permissions of previous controller. Allow it now to `SUPER_SETDATA`', async () => {
          const controllerToEdit = controllerToAddEditAndRemove;

          const dataKey =
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
            controllerToEdit.address.substring(2);

          const dataValue = combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.SUPER_SETDATA);

          const tx = await context.universalProfile
            .connect(controllerCanEditPermissions)
            .setData(dataKey, dataValue);

          const receipt = await tx.wait();

          expect(await context.universalProfile.getData(dataKey)).to.equal(dataValue);

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_3'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it(`Remove a controller
            1. decrease \`AddressPermissions[]\` array length
            2. remove the controller address at \`AddressPermissions[index]\`
            3. set \`0x\` for the controller permissions under \`AddressPermissions:Permissions:<controller>\`
            4. remove the Allowed ERC725Y Data Keys previously set for the controller under \`AddressPermissions:AllowedERC725YDataKeys:<controller>\`
        `, async () => {
          const newController = controllerToAddEditAndRemove;

          const AddressPermissionsArrayLength = await context.universalProfile['getData(bytes32)'](
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
          );

          // prettier-ignore
          const dataKeys = [
              ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.BigNumber.from(AddressPermissionsArrayLength).sub(1).toHexString(), 16).substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + newController.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + newController.address.substring(2),
            ];

          // prettier-ignore
          const dataValues = [
              ethers.utils.hexZeroPad(ethers.BigNumber.from(AddressPermissionsArrayLength).sub(1).toHexString(), 16),
              "0x",
              "0x",
              "0x",
            ];

          const tx = await context.universalProfile
            .connect(controllerCanEditPermissions)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_4'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Write 5x new LSP12 Issued Assets', async () => {
          // prettier-ignore
          const issuedAssetsDataKeys = [
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length,
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000000",
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000001",
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000002",
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000003",
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000004",
            ];

          // these are just random placeholder values
          // they should be replaced with actual token contract address
          const issuedAssetsDataValues = [
            '0x0000000000000000000000000000000000000000000000000000000000000005',
            context.accounts[5].address,
            context.accounts[6].address,
            context.accounts[7].address,
            context.accounts[8].address,
            context.accounts[9].address,
          ];

          const tx = await context.universalProfile
            .connect(controllercanSetTwoDataKeys)
            .setDataBatch(issuedAssetsDataKeys, issuedAssetsDataValues);

          const receipt = await tx.wait();

          expect(await context.universalProfile.getDataBatch(issuedAssetsDataKeys)).to.deep.equal(
            issuedAssetsDataValues,
          );

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_5'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Updates 1x data key', async () => {
          const dataKey = allowedERC725YDataKeys[5];
          const dataValue = '0xaabbccdd';

          const tx = await context.universalProfile
            .connect(controllerCanSetTenDataKeys)
            .setData(dataKey, dataValue);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_5'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Updates 3x data keys (first x3)', async () => {
          const dataKeys = allowedERC725YDataKeys.slice(0, 3);
          const dataValues = ['0xaabbccdd', '0xaabbccdd', '0xaabbccdd'];

          const tx = await context.universalProfile
            .connect(controllerCanSetTenDataKeys)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_6'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Update 3x data keys (middle x3)', async () => {
          const dataKeys = allowedERC725YDataKeys.slice(3, 6);
          const dataValues = ['0xaabbccdd', '0xaabbccdd', '0xaabbccdd'];

          const tx = await context.universalProfile
            .connect(controllerCanSetTenDataKeys)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_7'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Update 3x data keys (last x3)', async () => {
          const dataKeys = allowedERC725YDataKeys.slice(7, 10);
          const dataValues = ['0xaabbccdd', '0xaabbccdd', '0xaabbccdd'];

          const tx = await context.universalProfile
            .connect(controllerCanSetTenDataKeys)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_8'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });

        it('Set 2x data keys + add 3x new controllers (including setting the array length + indexes under AddressPermissions[index]) - 12 data keys in total', async () => {
          const addressPermissionsArrayLength = ethers.BigNumber.from(
            await context.universalProfile.getData(
              ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
            ),
          ).toNumber();

          const newArrayLengthUint128Hex = ethers.utils.hexZeroPad(
            ethers.BigNumber.from(addressPermissionsArrayLength).add(3).toHexString(),
            16,
          );

          // example of a dApp that set some logic
          const compactBytesArrayAllowedERC725YDataKeys = encodeCompactBytesArray([
            ...nftMarketplaceDataKeys,
            ERC725YDataKeys.LSP12['LSP12IssuedAssets[]'].index,
            ERC725YDataKeys.LSP12['LSP12IssuedAssetsMap'],
          ]);

          const dataKeys = [
            nftMarketplaceDataKeys[0], // set the settings and followers to 0 to start (rewards are set later)
            nftMarketplaceDataKeys[1],
            ERC725YDataKeys.LSP6['AddressPermissions[]'].length,
            ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              `0000000000000000000000000000000${addressPermissionsArrayLength}`,
            ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              `0000000000000000000000000000000${addressPermissionsArrayLength + 1}`,
            ERC725YDataKeys.LSP6['AddressPermissions[]'].index +
              `0000000000000000000000000000000${addressPermissionsArrayLength + 2}`,
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts[7].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts[8].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
              context.accounts[9].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              context.accounts[7].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              context.accounts[8].address.substring(2),
            ERC725YDataKeys.LSP6['AddressPermissions:AllowedERC725YDataKeys'] +
              context.accounts[9].address.substring(2),
          ];

          const dataValues = [
            // user settings
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes('Some default user settings to start')),
            // followers count starts at 0
            abiCoder.encode(['uint256'], [0]),
            newArrayLengthUint128Hex,
            context.accounts[7].address,
            context.accounts[8].address,
            context.accounts[9].address,
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            compactBytesArrayAllowedERC725YDataKeys,
            compactBytesArrayAllowedERC725YDataKeys,
            compactBytesArrayAllowedERC725YDataKeys,
          ];

          const tx = await context.universalProfile
            .connect(controllerCanSetDataAndAddControllers)
            .setDataBatch(dataKeys, dataValues);

          const receipt = await tx.wait();

          gasBenchmark['runtime_costs']['KeyManager_owner']['setData']['case_9'][
            'restricted_controller'
          ] = receipt.gasUsed.toNumber();
        });
      });
    });
  });
});
