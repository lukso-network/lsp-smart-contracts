import { exec } from "child_process";
import { artifacts } from "hardhat";
import path from "path";
const hre = require("hardhat");

const main = async () => {
  const contracts = hre.config.packager.contracts;

  await Promise.all(
    contracts.map(async (contract: string) => {
      const artifact = await artifacts.readArtifact(contract);

      const options = {
        env: {
          ...process.env,
          PATH: `${process.env.PATH}:${path.join(
            process.cwd(),
            "node_modules/.bin"
          )}`,
        },
      };
      // generate devdocs
      await new Promise<void>((resolve, reject) => {
        exec(
          `solc --devdoc --pretty-json \
@openzeppelin/="$(pwd)"/node_modules/@openzeppelin/ \
solidity-bytes-utils/="$(pwd)"/node_modules/solidity-bytes-utils/ \
@erc725="$(pwd)"/node_modules/@erc725/ \
        ${artifact.sourceName} -o devdocs/${contract}`,
          options,
          (error) => {
            if (error) {
              return reject(error);
            }
            return resolve();
          }
        );
      });

      // generate userdocs
      await new Promise<void>((resolve, reject) => {
        exec(
          `solc --userdoc --pretty-json \
@openzeppelin/="$(pwd)"/node_modules/@openzeppelin/ \
solidity-bytes-utils/="$(pwd)"/node_modules/solidity-bytes-utils/ \
@erc725="$(pwd)"/node_modules/@erc725/ \
${artifact.sourceName} -o userdocs/${contract}`,
          options,
          (error) => {
            if (error) {
              return reject(error);
            }
            return resolve();
          }
        );
      });
    })
  );
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
