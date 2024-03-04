import { task } from 'hardhat/config';

task(
  'verify-all',
  'Verify all the contracts deployed and listed under the `deployments/` folder',
).setAction(async (args, hre) => {
  const deployedContracts = await hre.deployments.all();

  for (const [name, deployedContract] of Object.entries(deployedContracts)) {
    const contractAddress = deployedContract.address;
    const constructorArgs = deployedContract.args;

    constructorArgs.forEach((element, index) => {
      if (!isNaN(element)) {
        constructorArgs[index] = element.toString();
      }
    });

    const artifact = await hre.deployments.getArtifact(name);

    const verifyTaskParams = {
      network: hre.network.name,
      address: contractAddress,
      constructorArgsParams: constructorArgs,
      contract: `${artifact.sourceName}:${name}`,
      'no-compile': true,
    };

    await hre.run('verify', verifyTaskParams);
  }
});
