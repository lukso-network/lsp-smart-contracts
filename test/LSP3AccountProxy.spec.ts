import { LSP3Account, LSP3AccountInit, LSP3AccountInit__factory, LSP3Account__factory } from "../build/types";
import { ethers } from "hardhat";
import { Contract, ContractTransaction, Signer, Transaction } from "ethers";

const { calculateCreate2 } = require("eth-create2-calculator");
const { deployProxy, runtimeCodeTemplate } = require("./utils/proxy");

// Interfaces IDs
const ERC165_INTERFACE_ID = "0x01ffc9a7";
const ERC725X_INTERFACE_ID = "0x44c028fe";
const ERC725Y_INTERFACE_ID = "0x2bd57b73";
const ERC1271_INTERFACE_ID = "0x1626ba7e";
const LSP1_INTERFACE_ID = "0x6bb56a14";

// Signatures
const ERC1271_MAGIC_VALUE = "0x1626ba7e";
const ERC1271_FAIL_VALUE = "0xffffffff";

// Universal Receiver
const RANDOM_BYTES32 = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
// Get key: keccak256('LSP1UniversalReceiverDelegate')
const UNIVERSALRECEIVER_KEY = "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47";
const ERC777TokensRecipient = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";

describe("> LSP3Account via EIP1167 Proxy + initializer (using ethers)", () => {
  let accounts: Signer[];
  let owner: Signer, ownerAddress;

  // when doing .send() on proxy, always add this amount to .estimateGas() to make sure it goes through
  const extraSafetyGas = 10_000;

  let lsp3Account, proxy: LSP3AccountInit;

  describe("> Account deployment", () => {
    beforeEach(async () => {
      accounts = await ethers.getSigners();
      owner = accounts[0];
      ownerAddress = await owner.getAddress();

      lsp3Account = await new LSP3AccountInit__factory(accounts[0]).deploy();

      let proxyRuntimeCode = runtimeCodeTemplate.replace(
        "bebebebebebebebebebebebebebebebebebebebe",
        lsp3Account.address.substr(2)
      );
      await owner.sendTransaction({
        data: proxyRuntimeCode,
      });

      proxy = await new LSP3AccountInit__factory(owner).deploy();
    });

    it("Should be cheaper to deploy via proxy", async () => {
      // Deploying whole LSP3 Account (not using `initialize` function)
      const lsp3Account = await new LSP3Account__factory(owner).deploy(ownerAddress);
      const { gasUsed: lsp3AccountDeploymentCost } = await getDeploymentCost(lsp3Account);

      // Deploying via Proxy

      // 1) deploy logic contract
      let lsp3LogicAccount = await new LSP3AccountInit__factory(owner).deploy();
      let lsp3LogicAccountAddress = lsp3LogicAccount.address;

      // 2) setup proxy contract code + deploy
      let proxyRuntimeCode = runtimeCodeTemplate.replace(
        "bebebebebebebebebebebebebebebebebebebebe",
        lsp3LogicAccountAddress.substr(2)
      );

      let transaction = await owner.sendTransaction({ data: proxyRuntimeCode });
      const { receipt: txReceipt, gasUsed: proxyDeploymentCost } = await getDeploymentCost(transaction);

      // 3) initialize contract (alternative to constructors)
      proxy = await new LSP3AccountInit__factory(owner).attach(txReceipt.contractAddress);

      const initializeTx = await proxy.initialize(await owner.getAddress());
      const { gasUsed: initializeCost } = await getDeploymentCost(initializeTx);
      const totalProxyCost = proxyDeploymentCost + initializeCost;

      expect(lsp3AccountDeploymentCost).toBeGreaterThan(totalProxyCost * 8);
      console.log("LSP3Account deployment cost: ", lsp3AccountDeploymentCost, "\n");

      console.log("proxy deployment cost: ", proxyDeploymentCost);
      console.log("initialize gas cost: ", initializeCost);
      console.log("--------------------------------------------------");
      console.log("total: ", totalProxyCost);
      console.log(
        "\n > Gas saved = ",
        lsp3AccountDeploymentCost - totalProxyCost,
        "(",
        (totalProxyCost * 100) / lsp3AccountDeploymentCost - 100,
        "%)"
      );
    });

    it.only("Should call the `initialize(...)` function and return the right owner", async () => {
      let currentOwner = await proxy.owner();

      // `initialize` function as constructor
      const tx = await proxy.initialize(ownerAddress);
      const { gasUsed } = await getDeploymentCost(tx);
      console.log(gasUsed + 1);

      let newOwner = await proxy.owner();

      expect(newOwner).not.toEqual(currentOwner);
      expect(newOwner).toEqual(ownerAddress);
    });

    xit("Should not allow to initialize twice", async () => {
      let newOwner = "0xcafecafecafecafecafecafecafecafecafecafe";
      let expectedGas = await proxy.methods.initialize(newOwner).estimateGas({ from: owner });

      /** @todo how to test web3 revert? truffleAssert.fails not working */
      // let result = await proxy.methods.initialize(newOwner).send({ from: owner, gas: expectedGas + extraSafetyGas })
      // await truffleAssert.fails(
      //     proxy.methods.initialize(newOwner).send({ from: owner, gas: expectedGas + extraSafetyGas })
      // )
      // to test revert with web3, try that:
      expect(
        await proxy.methods.initialize(newOwner).send({ from: owner, gas: expectedGas + extraSafetyGas })
      ).to.throw(
        new Error(
          "Error: Returned error: VM Exception while processing transaction: revert Initializable: contract is already initialized"
        )
      );
    });

    // test that account owner can transferOwnership, so
    // 1) transferOwnership call from owner should pass
    // 2) transferOwnership call from non-owner should fail
  });
});

async function getDeploymentCost(contractOrTransaction: Contract | ContractTransaction) {
  let gasUsed: number;
  let receipt: any;

  if ("deployTransaction" in contractOrTransaction) {
    receipt = await contractOrTransaction.deployTransaction.wait();
  } else {
    receipt = await contractOrTransaction.wait();
  }
  gasUsed = receipt.gasUsed.toNumber();

  return {
    receipt,
    gasUsed,
  };
}
