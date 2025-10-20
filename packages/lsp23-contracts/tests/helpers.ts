import { network } from 'hardhat';
import type { HardhatEthers } from '@nomicfoundation/hardhat-ethers/types';
import { BytesLike, keccak256, AbiCoder, toBeHex, zeroPadValue, getCreate2Address } from 'ethers';

import {
  LSP23LinkedContractsFactory__factory,
  UniversalProfileInitPostDeploymentModule__factory,
  UniversalProfilePostDeploymentModule__factory,
} from '../types/ethers-contracts/index.js';

import { UniversalProfileInit__factory } from '../../universalprofile-contracts/types/ethers-contracts/index.js';
import { LSP6KeyManagerInit__factory } from '../../lsp6-contracts/types/ethers-contracts/index.js';

export async function calculateProxiesAddresses(
  salt: BytesLike,
  primaryImplementationContractAddress: string,
  secondaryImplementationContractAddress: string,
  secondaryContractInitializationCalldata: BytesLike,
  secondaryContractAddControlledContractAddress: boolean,
  secondaryContractExtraInitializationParams: BytesLike,
  upPostDeploymentModuleAddress: string,
  postDeploymentCalldata: BytesLike,
  linkedContractsFactoryAddress: string,
): Promise<[string, string]> {
  const generatedSalt = keccak256(
    AbiCoder.defaultAbiCoder().encode(
      ['bytes32', 'address', 'bytes', 'bool', 'bytes', 'address', 'bytes'],
      [
        salt,
        secondaryImplementationContractAddress,
        secondaryContractInitializationCalldata,
        secondaryContractAddControlledContractAddress,
        secondaryContractExtraInitializationParams,
        upPostDeploymentModuleAddress,
        postDeploymentCalldata,
      ],
    ),
  );

  const expectedPrimaryContractAddress = getCreate2Address(
    linkedContractsFactoryAddress,
    generatedSalt,
    keccak256(
      '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' +
        (primaryImplementationContractAddress as string).slice(2) +
        '5af43d82803e903d91602b57fd5bf3',
    ),
  );

  const expectedSecondaryContractAddress = getCreate2Address(
    linkedContractsFactoryAddress,
    keccak256(expectedPrimaryContractAddress),
    keccak256(
      '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' +
        (secondaryImplementationContractAddress as string).slice(2) +
        '5af43d82803e903d91602b57fd5bf3',
    ),
  );

  return [expectedPrimaryContractAddress, expectedSecondaryContractAddress];
}

export function createDataKey(prefix, address) {
  return prefix + address.slice(2);
}

export const create16BytesUint = (value: number) => {
  return zeroPadValue(toBeHex(value), 16).slice(2);
};

export async function deployImplementationContracts() {
  let ethers: HardhatEthers;
  ({ ethers } = await network.connect());

  const [deployer] = await ethers.getSigners();

  const KeyManagerInitFactory = new LSP6KeyManagerInit__factory(deployer);
  const keyManagerInit = await KeyManagerInitFactory.deploy();

  const UniversalProfileInitFactory = new UniversalProfileInit__factory(deployer);
  const universalProfileInit = await UniversalProfileInitFactory.deploy();

  const LinkedContractsFactoryFactory = new LSP23LinkedContractsFactory__factory(deployer);
  const LSP23LinkedContractsFactory = await LinkedContractsFactoryFactory.deploy();

  const UPPostDeploymentManagerFactory = new UniversalProfilePostDeploymentModule__factory(
    deployer,
  );
  const upPostDeploymentModule = await UPPostDeploymentManagerFactory.deploy();

  const UPInitPostDeploymentManagerFactory = new UniversalProfileInitPostDeploymentModule__factory(
    deployer,
  );
  const upInitPostDeploymentModule = await UPInitPostDeploymentManagerFactory.deploy();

  return {
    keyManagerInit,
    KeyManagerInitFactory,
    universalProfileInit,
    UniversalProfileInitFactory,
    LSP23LinkedContractsFactory,
    upPostDeploymentModule,
    upInitPostDeploymentModule,
  };
}
