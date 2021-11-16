import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseLSP8NFT: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("LSP8IdentifiableDigitalAssetInit", {
    from: owner,
    log: true,
    gasPrice: ethers.BigNumber.from("20000000000"), // in wei
  });

  const LSP8Init = await ethers.getContractFactory("LSP8IdentifiableDigitalAssetInit");
  const lsp8Init = await LSP8Init.attach(deployResult.address);

  // function overloading is required, as the inherited contracts LSP4Init and ERC725YInit
  // also contain an `initialize()` function
  await lsp8Init["initialize(string,string,address)"](
    "LSP8 NFT (Base Contract)",
    "LSP8Init",
    ethers.constants.AddressZero
  );
};

export default deployBaseLSP8NFT;
deployBaseLSP8NFT.tags = ["LSP8IdentifiableDigitalAssetInit", "base"];
