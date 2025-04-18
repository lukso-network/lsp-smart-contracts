import { ethers } from 'hardhat';
import { BytesLike } from 'ethers';
import { PromiseOrValue } from '../../types/common';

export async function calculateProxiesAddresses(
  salt: PromiseOrValue<BytesLike>,
  primaryImplementationContractAddress: PromiseOrValue<string>,
  secondaryImplementationContractAddress: PromiseOrValue<string>,
  secondaryContractInitializationCalldata: PromiseOrValue<BytesLike>,
  secondaryContractAddControlledContractAddress: PromiseOrValue<boolean>,
  secondaryContractExtraInitializationParams: PromiseOrValue<BytesLike>,
  upPostDeploymentModuleAddress: string,
  postDeploymentCalldata: BytesLike,
  linkedContractsFactoryAddress: string,
): Promise<[string, string]> {
  const generatedSalt = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
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

  const expectedPrimaryContractAddress = ethers.getCreate2Address(
    linkedContractsFactoryAddress,
    generatedSalt,
    ethers.keccak256(
      '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' +
        (primaryImplementationContractAddress as string).slice(2) +
        '5af43d82803e903d91602b57fd5bf3',
    ),
  );

  const expectedSecondaryContractAddress = ethers.getCreate2Address(
    linkedContractsFactoryAddress,
    ethers.keccak256(expectedPrimaryContractAddress),
    ethers.keccak256(
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
  return ethers.zeroPadValue(ethers.toBeHex(value), 16).slice(2);
};

export async function deployImplementationContracts() {
  const [deployer] = await ethers.getSigners();

  const LSP6KeyManagerInit__factory = await ethers.getContractFactory(
    'LSP6KeyManagerInit',
    deployer,
  );
  const UniversalProfileInit__factory = await ethers.getContractFactory(
    'UniversalProfileInit',
    deployer,
  );
  const LSP23LinkedContractsFactory__factory = await ethers.getContractFactory(
    'LSP23LinkedContractsFactory',
    deployer,
  );
  const UniversalProfilePostDeploymentModule__factory = await ethers.getContractFactory(
    'UniversalProfilePostDeploymentModule',
    deployer,
  );
  const UniversalProfileInitPostDeploymentModule__factory = await ethers.getContractFactory(
    'UniversalProfileInitPostDeploymentModule',
    deployer,
  );

  const keyManagerInit = await LSP6KeyManagerInit__factory.deploy();
  const universalProfileInit = await UniversalProfileInit__factory.deploy();

  const LSP23LinkedContractsFactory = await LSP23LinkedContractsFactory__factory.deploy();

  const upPostDeploymentModule = await UniversalProfilePostDeploymentModule__factory.deploy();

  const upInitPostDeploymentModule =
    await UniversalProfileInitPostDeploymentModule__factory.deploy();

  return {
    keyManagerInit,
    KeyManagerInitFactory: LSP6KeyManagerInit__factory,
    universalProfileInit,
    UniversalProfileInitFactory: UniversalProfileInit__factory,
    LSP23LinkedContractsFactory,
    upPostDeploymentModule,
    upInitPostDeploymentModule,
  };
}
