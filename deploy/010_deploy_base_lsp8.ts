import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseLSP8NFT: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("LSP8Init", {
    from: owner,
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("10000000000"), // in wei
    log: true,
  });

  const LSP8Init = await ethers.getContractFactory("LSP8Init");
  const lsp8Init = await LSP8Init.attach(deployResult.address);

  // function overloading is required, as the inherited contracts LSP4Init and ERC725YInit
  // also contain an `initialize()` function
  await lsp8Init["initialize(string,string,address)"](
    "LSP8 NFT (Base Contract)",
    "LSP8Init",
    ethers.constants.AddressZero,
    {
      gasPrice: ethers.BigNumber.from("10000000000"),
      gasLimit: 3_000_000,
    }
  );
};

export default deployBaseLSP8NFT;
deployBaseLSP8NFT.tags = ["LSP8Init", "proxy"];
