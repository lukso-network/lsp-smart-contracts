import { ethers } from 'ethers';

export async function calculateProxiesAddresses(
  salt: ethers.utils.BytesLike,
  primaryImplementationContractAddress: string,
  secondaryImplementationContractAddress: string,
  secondaryContractInitializationCalldata: ethers.utils.BytesLike,
  secondaryContractAddControlledContractAddress: boolean,
  secondaryContractExtraInitializationParams: ethers.utils.BytesLike,
  upPostDeploymentModuleAddress: string,
  postDeploymentCalldata: ethers.utils.BytesLike,
  linkedContractsFactoryAddress: string,
): Promise<[string, string]> {
  const generatedSalt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
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

  const expectedPrimaryContractAddress = ethers.utils.getCreate2Address(
    linkedContractsFactoryAddress,
    generatedSalt,
    ethers.utils.keccak256(
      '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' +
        primaryImplementationContractAddress.slice(2) +
        '5af43d82803e903d91602b57fd5bf3',
    ),
  );

  const expectedSecondaryImplementationContractAddress = ethers.utils.getCreate2Address(
    linkedContractsFactoryAddress,
    ethers.utils.keccak256(expectedPrimaryContractAddress),
    ethers.utils.keccak256(
      '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' +
        secondaryImplementationContractAddress.slice(2) +
        '5af43d82803e903d91602b57fd5bf3',
    ),
  );

  return [expectedPrimaryContractAddress, expectedSecondaryImplementationContractAddress];
}
