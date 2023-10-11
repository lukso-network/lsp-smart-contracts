import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  LSP1UniversalReceiverDelegateUP__factory,
  ReceiveExtension__factory,
  UniversalProfile,
  UniversalProfile__factory,
  UniversalProfileLSP17Receive,
  UniversalProfileLSP17Receive__factory,
  UniversalProfileLSP1Receive,
  UniversalProfileLSP1Receive__factory,
} from '../types';
import { ERC725YDataKeys } from '../constants';

describe('receive (currently)', () => {
  let universalProfile: UniversalProfile;
  let accounts: SignerWithAddress[];

  before(async () => {
    accounts = await ethers.getSigners();
    universalProfile = await new UniversalProfile__factory(accounts[0]).deploy(accounts[0].address);
  });

  it('receive LYX', async () => {
    const tx = await accounts[1].sendTransaction({
      to: universalProfile.address,
      value: ethers.utils.parseEther('3'),
    });

    const receipt = await tx.wait();

    console.log(receipt.gasUsed.toNumber());
  });
});

describe('receive with LSP17', () => {
  let universalProfile: UniversalProfileLSP17Receive;
  let accounts: SignerWithAddress[];

  before(async () => {
    accounts = await ethers.getSigners();
    universalProfile = await new UniversalProfileLSP17Receive__factory(accounts[0]).deploy(
      accounts[0].address,
    );
  });

  it('receive LYX (no extension registered)', async () => {
    const tx = await accounts[1].sendTransaction({
      to: universalProfile.address,
      value: ethers.utils.parseEther('3'),
    });

    const receipt = await tx.wait();

    console.log(receipt.gasUsed.toNumber());
  });

  it('receive LYX (with extension registered)', async () => {
    const receiveBytes4Selector = ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes('receive()'))
      .slice(0, 10);

    const lsp17ReceiveExtension = await new ReceiveExtension__factory(accounts[0]).deploy();

    // setup `receive()` extension
    const dataKey =
      ERC725YDataKeys.LSP17.LSP17ExtensionPrefix +
      receiveBytes4Selector.substring(2) +
      '00'.repeat(16);

    await universalProfile.setData(dataKey, lsp17ReceiveExtension.address);

    const tx = await accounts[1].sendTransaction({
      to: universalProfile.address,
      value: ethers.utils.parseEther('3'),
    });

    const receipt = await tx.wait();

    console.log(receipt.gasUsed.toNumber());
  });
});

describe('receive with LSP1', () => {
  let universalProfile: UniversalProfileLSP1Receive;
  let accounts: SignerWithAddress[];

  before(async () => {
    accounts = await ethers.getSigners();
    universalProfile = await new UniversalProfileLSP1Receive__factory(accounts[0]).deploy(
      accounts[0].address,
    );

    const lsp1Delegate = await new LSP1UniversalReceiverDelegateUP__factory(accounts[0]).deploy();

    await universalProfile.setData(
      ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
      lsp1Delegate.address,
    );
  });

  it('receive LYX (default LSP1 delegate returns for the typeId, specific LSP1 Delegate not called)', async () => {
    const tx = await accounts[1].sendTransaction({
      to: universalProfile.address,
      value: ethers.utils.parseEther('3'),
    });

    const receipt = await tx.wait();

    console.log(receipt.gasUsed.toNumber());
  });
});
