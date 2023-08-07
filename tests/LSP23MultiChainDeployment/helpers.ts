import { ethers } from 'ethers';

export async function calculateProxiesAddresses(
  salt: ethers.utils.BytesLike,
  ownerControlledImplementationContractAddress: string,
  ownerImplementationContractAddress: string,
  ownerInitializationCalldata: ethers.utils.BytesLike,
  ownerAddControlledContractAddress: boolean,
  ownerExtraInitializationParams: ethers.utils.BytesLike,
  upPostDeploymentModuleAddress: string,
  postDeploymentCalldata: ethers.utils.BytesLike,
  ownerControlledContractDeployerAddress: string,
): Promise<[string, string]> {
  const generatedSalt = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'address', 'bytes', 'bool', 'bytes', 'address', 'bytes'],
      [
        salt,
        ownerImplementationContractAddress,
        ownerInitializationCalldata,
        ownerAddControlledContractAddress,
        ownerExtraInitializationParams,
        upPostDeploymentModuleAddress,
        postDeploymentCalldata,
      ],
    ),
  );

  const expectedOwnerControlledAddress = ethers.utils.getCreate2Address(
    ownerControlledContractDeployerAddress,
    generatedSalt,
    ethers.utils.keccak256(
      '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' +
        ownerControlledImplementationContractAddress.slice(2) +
        '5af43d82803e903d91602b57fd5bf3',
    ),
  );

  const expectedOwnerAddress = ethers.utils.getCreate2Address(
    ownerControlledContractDeployerAddress,
    ethers.utils.keccak256(expectedOwnerControlledAddress),
    ethers.utils.keccak256(
      '0x3d602d80600a3d3981f3363d3d373d3d3d363d73' +
        ownerImplementationContractAddress.slice(2) +
        '5af43d82803e903d91602b57fd5bf3',
    ),
  );

  return [expectedOwnerControlledAddress, expectedOwnerAddress];
}
