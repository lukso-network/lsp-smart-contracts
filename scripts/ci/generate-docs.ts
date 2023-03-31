import { exec } from "child_process";
import { artifacts } from "hardhat";
const hre = require("hardhat");

const main = () => {
  const contracts = hre.config.packager.contracts;

  contracts.map(async (contract: string) => {
    const artifact = await artifacts.readArtifact(contract);

    // generate devdocs
    exec(`solc --devdoc --pretty-json \
        @openzeppelin/="$(pwd)"/node_modules/@openzeppelin/ \
        solidity-bytes-utils/="$(pwd)"/node_modules/solidity-bytes-utils/ \
        @erc725="$(pwd)"/node_modules/@erc725/ \
        ${artifact.sourceName} -o devdocs/${contract}`);

    // generate userdocs
    exec(`solc --userdoc --pretty-json \
        @openzeppelin/="$(pwd)"/node_modules/@openzeppelin/ \
        solidity-bytes-utils/="$(pwd)"/node_modules/solidity-bytes-utils/ \
        @erc725="$(pwd)"/node_modules/@erc725/ \
        ${artifact.sourceName} -o userdocs/${contract}`);
  });
};

main();
