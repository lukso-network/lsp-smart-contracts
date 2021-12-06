const hre = require("hardhat");

hre.run("prepare-package").then(() => {
  const destination = "./java/src/main/java/network/lukso/up/contracts";
  const package = "network.lukso.up.contracts";

  const contracts = hre.config.packager.contracts;

  for (const contract of contracts) {
    //  1.1 read the artifact file (one at a time)
    let artifact = fs.readFileSync(`./artifacts/${contract}.json`);

    //  1.2 get the source path in the JSON file
    let source = JSON.parse(artifact).sourceName;

    // let abiSource = `./android/${contract}.abi`;

    // command to run first for generating the abi + binary
    // npx solcjs --abi contracts/UniversalProfile.sol --include-path node_modules/ --base-path .  -o ./output/
  }
});
