import { expect } from 'chai';
import { version as packageJsonVersion } from '../../package.json';
import hre from 'hardhat';

describe('Comparing version from `package.json` and from `Version.sol`', () => {
  it('MUST match', async () => {
    const versionContractPath = 'contracts/Version.sol';
    const versionContractName = 'Version';
    const buildInfo = await hre.artifacts.getBuildInfo(
      `${versionContractPath}:${versionContractName}`,
    );

    const versionContractSourceCode = buildInfo.input.sources[versionContractPath].content;

    const lines = versionContractSourceCode.split('\n');

    const versionLine = lines.find((line) => line.includes('_VERSION'));

    expect(versionLine).to.be.not.undefined;

    const contractVersion = versionLine?.split('"')[1];

    expect(contractVersion).to.equal(packageJsonVersion);
  });
});
