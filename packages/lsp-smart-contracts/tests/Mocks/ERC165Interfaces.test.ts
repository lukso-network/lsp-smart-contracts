import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import {
  CalculateLSPInterfaces,
  CalculateLSPInterfaces__factory,
  CalculateERCInterfaces,
  CalculateERCInterfaces__factory,
} from '../../types';

// utils
import { INTERFACE_IDS } from '../../constants';

/**
 * @dev these tests check that the ERC165 interface IDs stored in `constant.ts`
 *      match with the Solidity built-in function `type(InterfaceName).interfaceId`
 *      (or the XOR of a specific set of function signatures, for custom interface IDs)
 *
 *      This ensure that:
 *      - the file `constants.ts` always hold correct values (since it is part of the npm package)
 *      - tests that use or check for these interface IDs rely on correct values
 */
describe('Calculate LSP interfaces', () => {
  let accounts: SignerWithAddress[];
  let contract: CalculateLSPInterfaces;

  before(async () => {
    accounts = await ethers.getSigners();
    contract = await new CalculateLSPInterfaces__factory(accounts[0]).deploy();
  });

  it('LSP0', async () => {
    const result = await contract.calculateInterfaceLSP0();
    expect(result).to.equal(INTERFACE_IDS.LSP0ERC725Account);
  });

  it('LSP1', async () => {
    const result = await contract.calculateInterfaceLSP1();
    expect(result).to.equal(INTERFACE_IDS.LSP1UniversalReceiver);
  });

  it('LSP1Delegate', async () => {
    const result = await contract.calculateInterfaceLSP1Delegate();
    expect(result).to.equal(INTERFACE_IDS.LSP1UniversalReceiverDelegate);
  });

  it('LSP6', async () => {
    const result = await contract.calculateInterfaceLSP6KeyManager();
    expect(result).to.equal(INTERFACE_IDS.LSP6KeyManager);
  });

  it('LSP7', async () => {
    const result = await contract.calculateInterfaceLSP7();
    expect(result).to.equal(INTERFACE_IDS.LSP7DigitalAsset);
  });

  it('LSP8', async () => {
    const result = await contract.calculateInterfaceLSP8();
    expect(result).to.equal(INTERFACE_IDS.LSP8IdentifiableDigitalAsset);
  });

  it('LSP9', async () => {
    const result = await contract.calculateInterfaceLSP9();
    expect(result).to.equal(INTERFACE_IDS.LSP9Vault);
  });

  it('LSP11', async () => {
    const result = await contract.calculateInterfaceLSP11();
    expect(result).to.equal(INTERFACE_IDS.LSP11BasicSocialRecovery);
  });

  it('LSP14', async () => {
    const result = await contract.calculateInterfaceLSP14();
    expect(result).to.equal(INTERFACE_IDS.LSP14Ownable2Step);
  });

  it('LSP17Extendable', async () => {
    const result = await contract.calculateInterfaceLSP17Extendable();
    expect(result).to.equal(INTERFACE_IDS.LSP17Extendable);
  });

  it('LSP17Extension', async () => {
    const result = await contract.calculateInterfaceLSP17Extension();
    expect(result).to.equal(INTERFACE_IDS.LSP17Extension);
  });

  it('LSP20CallVerification', async () => {
    const result = await contract.calculateInterfaceLSP20CallVerification();
    expect(result).to.equal(INTERFACE_IDS.LSP20CallVerification);
  });

  it('LSP20CallVerifier', async () => {
    const result = await contract.calculateInterfaceLSP20CallVerifier();
    expect(result).to.equal(INTERFACE_IDS.LSP20CallVerifier);
  });

  it('LSP25ExecuteRelayCall', async () => {
    const result = await contract.calculateInterfaceLSP25ExecuteRelayCall();
    expect(result).to.equal(INTERFACE_IDS.LSP25ExecuteRelayCall);
  });
});

describe('Calculate ERC interfaces', () => {
  let accounts: SignerWithAddress[];
  let contract: CalculateERCInterfaces;

  before(async () => {
    accounts = await ethers.getSigners();
    contract = await new CalculateERCInterfaces__factory(accounts[0]).deploy();
  });

  it('ERC20', async () => {
    const result = await contract.calculateInterfaceERC20();
    expect(result).to.equal(INTERFACE_IDS.ERC20);
  });

  it('ERC20Metadata', async () => {
    const result = await contract.calculateInterfaceERC20Metadata();
    expect(result).to.equal(INTERFACE_IDS.ERC20Metadata);
  });

  it('ERC223', async () => {
    const result = await contract.calculateInterfaceERC223();
    expect(result).to.equal(INTERFACE_IDS.ERC223);
  });

  it('ERC721', async () => {
    const result = await contract.calculateInterfaceERC721();
    expect(result).to.equal(INTERFACE_IDS.ERC721);
  });

  it('ERC721Metadata', async () => {
    const result = await contract.calculateInterfaceERC721Metadata();
    expect(result).to.equal(INTERFACE_IDS.ERC721Metadata);
  });

  it('ERC777', async () => {
    const result = await contract.calculateInterfaceERC777();
    expect(result).to.equal(INTERFACE_IDS.ERC777);
  });

  it('ERC1155', async () => {
    const result = await contract.calculateInterfaceERC1155();
    expect(result).to.equal(INTERFACE_IDS.ERC1155);
  });

  it('ERC1271', async () => {
    const result = await contract.calculateInterfaceERC1271();
    expect(result).to.equal(INTERFACE_IDS.ERC1271);
  });
});
