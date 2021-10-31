// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const SampleProfile = require("./SampleProfile.json");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  let json = JSON.stringify(SampleProfile);

  let hashFunction = web3.utils.keccak256("keccak256(utf8)").substr(0, 10);
  let hash = web3.utils.keccak256(json);

  /** @todo pass ipfs link as cli argument */
  let url = web3.utils.utf8ToHex(
    "https://ipfs.lukso.network/ipfs/QmVSjpTP5k3a8uWuFs5ZmXDznKZVWPUoXwK7e7d1eVgS1g"
  );

  let JSONURL = hashFunction + hash.substr(2) + url.substr(2);

  console.log("Creating LSP3Profile JSONURL...");
  console.log("(key): ", web3.utils.keccak256("LSP3Profile"));
  console.log("(value): ", JSONURL);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
