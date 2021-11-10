import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployBaseLSP7Token: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { owner } = await getNamedAccounts();

  const deployResult = await deploy("LSP7Init", {
    from: owner,
    gasLimit: 3_000_000,
    gasPrice: ethers.BigNumber.from("10000000000"), // in wei
    log: true,
  });

  const LSP7Init = await ethers.getContractFactory("LSP7Init");
  const lsp7Init = await LSP7Init.attach(deployResult.address);

  // function overloading is required, as the inherited contracts LSP4Init and ERC725YInit
  // also contain an `initialize()` function
  await lsp7Init["initialize(string,string,address,bool)"](
    "LSP7 Token (Base Contract)",
    "LSP7Init",
    ethers.constants.AddressZero,
    false, // isNFT
    {
      gasPrice: ethers.BigNumber.from("10000000000"),
      gasLimit: 3_000_000,
    }
  );
};

export default deployBaseLSP7Token;
deployBaseLSP7Token.tags = ["LSP7Init", "proxy"];
