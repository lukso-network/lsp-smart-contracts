import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import {
  ERC725Utils,
  UniversalProfileInit,
  UniversalReceiverAddressStore__factory,
  UniversalReceiverTester__factory,
  ERC777UniversalReceiver__factory,
  ExternalERC777UniversalReceiverTester__factory,
  LSP4DigitalCertificate__factory,
} from "../build/types";

// helpers
import { getDeploymentCost, deployERC725Utils, deployUniversalProfile } from "./utils/deploy";
import {
  proxyRuntimeCodeTemplate,
  deployProxy,
  deployBaseUniversalProfile,
  attachUniversalProfileProxy,
} from "./utils/proxy";

// constants
import { SupportedStandards, LSP2Keys } from "./utils/lsp2schema";
import {
  ERC1271,
  RANDOM_BYTES32,
  INTERFACE_IDS,
  ERC777TokensRecipient,
  EventSignatures,
} from "./utils/constants";

describe("UniversalProfile via EIP1167 Proxy + initializer", () => {
  let accounts: SignerWithAddress[];
  let owner: SignerWithAddress;

  let universalProfile: UniversalProfileInit;
  let proxy: UniversalProfileInit;
  let erc725Utils: ERC725Utils;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[0];

    erc725Utils = await deployERC725Utils();
    universalProfile = await deployBaseUniversalProfile(erc725Utils.address);

    let proxyAddress = await deployProxy(universalProfile.address, owner);
    proxy = await attachUniversalProfileProxy(erc725Utils.address, proxyAddress);
  });

  describe("> Account deployment", () => {
    it("Should be cheaper to deploy via proxy", async () => {
      // Deploying whole LSP3 Account (not using `initialize` function)
      const universalProfile = await deployUniversalProfile(erc725Utils.address, owner);
      const { gasUsed: UniversalProfileDeploymentCost } = await getDeploymentCost(universalProfile);
      console.log("UniversalProfileDeploymentCost: ", UniversalProfileDeploymentCost);

      // Deploying via Proxy

      // 1) deploy logic contract
      let lsp3LogicAccount = await deployBaseUniversalProfile(erc725Utils.address);
      let lsp3LogicAccountAddress = lsp3LogicAccount.address;

      // 2) setup proxy contract code + deploy
      let proxyRuntimeCode = proxyRuntimeCodeTemplate.replace(
        "bebebebebebebebebebebebebebebebebebebebe",
        lsp3LogicAccountAddress.substr(2)
      );

      let transaction = await owner.sendTransaction({ data: proxyRuntimeCode });
      const { receipt: txReceipt, gasUsed: proxyDeploymentCost } = await getDeploymentCost(
        transaction
      );

      // 3) initialize contract (alternative to constructors)
      let testProxy = await attachUniversalProfileProxy(
        erc725Utils.address,
        txReceipt.contractAddress
      );

      const initializeTx = await testProxy.initialize(owner.address);
      const { gasUsed: initializeCost } = await getDeploymentCost(initializeTx);
      const totalProxyCost = proxyDeploymentCost + initializeCost;

      expect(totalProxyCost).toBeLessThan(UniversalProfileDeploymentCost);

      console.log("UniversalProfile deployment cost: ", UniversalProfileDeploymentCost, "\n");
      console.log("proxy deployment cost: ", proxyDeploymentCost);
      console.log("initialize gas cost: ", initializeCost);
      console.log("--------------------------------------------------");
      console.log("total: ", totalProxyCost);
      console.log(
        "\n > Gas saved = ",
        UniversalProfileDeploymentCost - totalProxyCost,
        "(",
        (totalProxyCost * 100) / UniversalProfileDeploymentCost - 100,
        "%)"
      );
    });

    it("Should call the `initialize(...)` function and return the right owner", async () => {
      let currentOwner = await proxy.owner();
      console.log("currentOwner: ", currentOwner);
      // `initialize` function as constructor
      await proxy.initialize(owner.address);

      let newOwner = await proxy.owner();
      expect(newOwner).not.toEqual(currentOwner);
      expect(newOwner).toEqual(owner.address);
    });

    it("Should not allow to initialize twice", async () => {
      await expect(proxy.initialize("0xdead0dead0dead0dead0dead0dead0dead0dead0")).toBeRevertedWith(
        "Initializable: contract is already initialized"
      );
    });

    // test that account owner can transferOwnership, so
    // 1) transferOwnership call from owner should pass
    // 2) transferOwnership call from non-owner should fail
  });

  describe("> ERC165 (suported standards)", () => {
    it("Should support ERC165", async () => {
      let result = await proxy.callStatic.supportsInterface(INTERFACE_IDS.ERC165);
      expect(result).toBeTruthy(); // "does not support interface `ERC165`"
    });

    it("Should support ERC725X", async () => {
      let result = await proxy.callStatic.supportsInterface(INTERFACE_IDS.ERC725X);
      expect(result).toBeTruthy(); // "does not support interface `ERC725X`"
    });

    it("Should support ERC725Y", async () => {
      let result = await proxy.callStatic.supportsInterface(INTERFACE_IDS.ERC725Y);
      expect(result).toBeTruthy(); // "does not support interface `ERC725Y`"
    });

    it("Should support ERC1271", async () => {
      let result = await proxy.callStatic.supportsInterface(INTERFACE_IDS.ERC1271);
      expect(result).toBeTruthy(); // "does not support interface `ERC1271`"
    });

    it("Should support LSP1", async () => {
      let result = await proxy.callStatic.supportsInterface(INTERFACE_IDS.LSP1);
      expect(result).toBeTruthy(); // "does not support interface `LSP1`"
    });

    it("Should have Key: 'SupportedStandards:LSP3UniversalProfile' set to Value: 'LSP3UniversalProfile'", async () => {
      let [result] = await proxy.callStatic.getData([SupportedStandards.LSP3UniversalProfile.key]);
      expect(result).toEqual(SupportedStandards.LSP3UniversalProfile.value);
    });
  });

  describe("> ERC1271 (signatures)", () => {
    it("Can verify signature from owner", async () => {
      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await owner.signMessage(dataToSign);

      const result = await proxy.callStatic.isValidSignature(messageHash, signature);

      expect(result).toEqual(ERC1271.MAGIC_VALUE); // "Should define the signature as valid"
    });

    it("Should fail when verifying signature from not-owner", async () => {
      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await accounts[1].signMessage(dataToSign);

      const result = await proxy.callStatic.isValidSignature(messageHash, signature);
      expect(result).toEqual(ERC1271.FAIL_VALUE); // "Should define the signature as invalid"
    });
  });

  describe("> Testing storage", () => {
    let abiCoder = ethers.utils.defaultAbiCoder;
    let count = 1000000000;

    it("Create account", async () => {
      const owner = accounts[2];
      const newProxyAddress = await deployProxy(universalProfile.address, owner);
      const newProxyAccount = await attachUniversalProfileProxy(
        erc725Utils.address,
        newProxyAddress
      );
      await newProxyAccount.initialize(owner.address);

      expect(await newProxyAccount.callStatic.owner()).toEqual(owner.address);
    });

    /**
     * The UniversalProfile storage already contains one key-value pair after deployment
     *  key: 0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6 (SupportedStandards:LSP3UniversalProfile)
     *  value: 0xabe425d6
     *
     * This is set within the contract's constructor
     */
    it("Should `setData` in Key-Value store via proxy (item 2)", async () => {
      let keys = [abiCoder.encode(["bytes32"], [ethers.utils.hexZeroPad("0xcafe", 32)])];
      let values = ["0xbeef"];

      let [initialValue] = await proxy.callStatic.getData(keys);
      expect(initialValue).toEqual("0x");
      //   "there should be no value initially set for key '0xcafe'"

      await proxy.setData(keys, values);

      let result = await proxy.getData(keys);

      expect(result).toEqual(values);
      //   "not the same value in storage for key '0xcafe'"
    });

    it("Store 32 bytes item 3", async () => {
      let keys = [
        abiCoder.encode(["bytes32"], [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]),
      ];
      let values = ["0x" + (count++).toString(16)];
      await proxy.setData(keys, values);

      expect(await proxy.callStatic.getData(keys)).toEqual(values);
    });

    it("Store 32 bytes item 4", async () => {
      let keys = [
        abiCoder.encode(["bytes32"], [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]),
      ];
      let values = ["0x" + (count++).toString(16)];
      await proxy.setData(keys, values);

      expect(await proxy.callStatic.getData(keys)).toEqual(values);
    });

    it("Store 32 bytes item 5", async () => {
      let keys = [
        abiCoder.encode(["bytes32"], [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]),
      ];
      let values = ["0x" + (count++).toString(16)];
      await proxy.setData(keys, values);

      expect(await proxy.callStatic.getData(keys)).toEqual(values);
    });

    it("Store 32 bytes item 6", async () => {
      let keys = [
        abiCoder.encode(["bytes32"], [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]),
      ];
      let values = ["0x" + (count++).toString(16)];
      await proxy.setData(keys, values);

      expect(await proxy.callStatic.getData(keys)).toEqual(values);
    });

    it("Store a long URL as bytes item 7", async () => {
      let keys = [
        abiCoder.encode(["bytes32"], [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]),
      ];
      let values = [
        ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes(
            "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD"
          )
        ),
      ];
      await proxy.setData(keys, values);

      expect(await proxy.getData(keys)).toEqual(values);
    });

    it("Store 32 bytes item 8", async () => {
      let keys = [
        abiCoder.encode(["bytes32"], [ethers.utils.hexZeroPad("0x" + count.toString(16), 32)]),
      ];
      let values = ["0x" + count.toString(16)];
      await proxy.setData(keys, values);

      expect(await proxy.callStatic.getData(keys)).toEqual(values);
    });

    it("dataCount should be 8", async () => {
      let result = await proxy.allDataKeys();
      expect(result.length).toEqual(8);
    });

    it("Update 32 bytes item 8", async () => {
      let keys = [
        abiCoder.encode(["bytes32"], [ethers.utils.hexZeroPad("0x" + count.toString(16), 32)]),
      ];

      let values = ["0x" + count.toString(16)];
      await proxy.setData(keys, values);

      expect(await proxy.getData(keys)).toEqual(values);
    });

    it("dataCount should remain 8 (after updating item 8)", async () => {
      let result = await proxy.callStatic.allDataKeys();
      expect(result.length).toEqual(8);
    });

    it("Store multiple 32 bytes item 9-11", async () => {
      let keys = [];
      let values = [];
      // increase
      count++;
      for (let i = 8; i <= 10; i++) {
        let key = abiCoder.encode(
          ["bytes32"],
          [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
        );

        let value = "0x" + (count++).toString(16);
        keys.push(key);
        values.push(value);
      }
      await proxy.setData(keys, values);
      let result = await proxy.callStatic.getData(keys);
      expect(result).toEqual(values);
    });

    it("dataCount should be 11", async () => {
      let keys = await proxy.allDataKeys();
      expect(keys.length).toEqual(11);

      // console.log('Stored keys', keys)
    });
  });

  describe("> Interactions with Accounts contracts", () => {
    let abiCoder = ethers.utils.defaultAbiCoder;
    let provider = ethers.provider;

    let owner: SignerWithAddress;
    let newOwner: SignerWithAddress;
    let proxy: UniversalProfileInit;

    beforeEach(async () => {
      owner = accounts[3];
      newOwner = accounts[5];

      const newProxyAddress = await deployProxy(universalProfile.address, owner);
      proxy = await attachUniversalProfileProxy(erc725Utils.address, newProxyAddress);
      await proxy.initialize(owner.address);
    });

    it("Upgrade ownership correctly", async () => {
      await proxy.connect(owner).transferOwnership(newOwner.address, {
        gasLimit: 3_000_000,
      });
      const idOwner = await proxy.callStatic.owner();

      expect(idOwner).toEqual(newOwner.address);
    });

    it("Refuse upgrades from non-onwer", async () => {
      await expect(proxy.connect(newOwner).transferOwnership(newOwner.address)).toBeRevertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Owner can set data", async () => {
      let keys = [
        abiCoder.encode(
          ["bytes32"],
          [
            ethers.utils.hexZeroPad(
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data")),
              32
            ),
          ]
        ),
      ];
      let data = [ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data"))];

      await proxy.connect(owner).setData(keys, data);

      let fetchedData = await proxy.getData(keys);

      expect(data).toEqual(fetchedData);
    });

    it("Fails when non-owner sets data", async () => {
      let keys = [
        abiCoder.encode(
          ["bytes32"],
          [
            ethers.utils.hexZeroPad(
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data")),
              32
            ),
          ]
        ),
      ];
      let data = [ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data"))];

      await expect(proxy.connect(newOwner).setData(keys, data)).toBeRevertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Fails when non-owner sets data multiple", async () => {
      let keys = [
        abiCoder.encode(
          ["bytes32"],
          [
            ethers.utils.hexZeroPad(
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data")),
              32
            ),
          ]
        ),
        abiCoder.encode(
          ["bytes32"],
          [
            ethers.utils.hexZeroPad(
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Another important data")),
              32
            ),
          ]
        ),
        abiCoder.encode(
          ["bytes32"],
          [
            ethers.utils.hexZeroPad(
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("more important data")),
              32
            ),
          ]
        ),
      ];
      console.log("show me the keys: ", keys);
      let data = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Another important data")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("more important data")),
      ];

      await expect(proxy.connect(newOwner).setData(keys, data)).toBeRevertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Allows owner to execute calls", async () => {
      const dest = accounts[6];
      const amount = ethers.utils.parseEther("10");
      const OPERATION_CALL = 0x0;

      await owner.sendTransaction({
        to: proxy.address,
        value: amount,
      });

      const destBalance = await provider.getBalance(dest.address);

      await proxy.connect(owner).execute(OPERATION_CALL, dest.address, amount, "0x00");

      const finalBalance = await provider.getBalance(dest.address);

      expect(ethers.BigNumber.from(destBalance).add(amount)).toEqual(
        ethers.BigNumber.from(finalBalance)
      );
    });

    it("Fails with non-owner executing", async () => {
      const dest = accounts[6];
      const amount = ethers.utils.parseEther("10");
      const OPERATION_CALL = 0x0;

      // send money to the account
      await owner.sendTransaction({
        to: proxy.address,
        value: amount,
      });

      // try to move it away
      await expect(
        proxy.connect(newOwner).execute(OPERATION_CALL, dest.address, amount, "0x")
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Allows owner to execute create", async () => {
      const OPERATION_CREATE = 0x3;

      let transaction = await proxy
        .connect(owner)
        .execute(
          OPERATION_CREATE,
          "0x0000000000000000000000000000000000000000",
          "0",
          "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6"
        );

      let receipt = await transaction.wait();
      expect(receipt.events[1].event).toEqual("ContractCreated");
    });

    //   // TODO test delegateCall

    it("Allows owner to execute create2", async () => {
      const OPERATION_CREATE2 = 0x2;

      // deploy with added 32 bytes salt
      let transaction = await proxy.connect(owner).execute(
        OPERATION_CREATE2,
        "0x0000000000000000000000000000000000000000",
        "0",
        "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6" +
          // 32 bytes salt
          "cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
        { from: owner.address, gasLimit: 3_000_000 }
      );

      let receipt = await transaction.wait();

      expect(receipt.events[1].event).toEqual("ContractCreated");
      //   expect(receipt.contractAddress).toEqual("0xc6aFf31a98cB525c6b849E0d76cc2693F4BbccD9");
    });

    it("Allow account to receive native tokens", async () => {
      const amount = ethers.utils.parseEther("10");

      // send money to the account
      await newOwner.sendTransaction({
        to: proxy.address,
        value: amount,
      });

      expect(await provider.getBalance(proxy.address)).toEqual(amount);
    });
  });

  describe("> Universal Receiver", () => {
    it("Call account and check for 'UniversalReceiver' event", async () => {
      const owner = accounts[2];

      const proxyAddress = await deployProxy(universalProfile.address, owner);
      const proxyAccount = await attachUniversalProfileProxy(erc725Utils.address, proxyAddress);
      await proxyAccount.initialize(owner.address);

      // use the checker contract to call account
      let checker = await new UniversalReceiverTester__factory(owner).deploy();
      let transaction = await checker.callImplementationAndReturn(proxy.address, RANDOM_BYTES32);
      let receipt = await transaction.wait();

      // event should come from account
      expect(receipt.logs[0].address).toEqual(proxy.address);
      // event signature
      expect(receipt.logs[0].topics[0]).toEqual(EventSignatures.UniversalReceiver);
      // from
      expect(receipt.logs[0].topics[1]).toEqual(
        ethers.utils.hexZeroPad(checker.address.toLowerCase(), 32)
      );
      // typeId
      expect(receipt.logs[0].topics[2]).toEqual(RANDOM_BYTES32);
      // receivedData
      expect(receipt.logs[0].data).toEqual(
        "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"
      );
    });

    it("Call account and check for 'ReceivedERC777' event in external account", async () => {
      const owner = accounts[2];

      const proxyAddress = await deployProxy(universalProfile.address, owner);
      const proxyAccount = await attachUniversalProfileProxy(erc725Utils.address, proxyAddress);
      await proxyAccount.initialize(owner.address);

      const externalUniversalReceiver = await new ExternalERC777UniversalReceiverTester__factory(
        owner
      ).deploy();

      // set account2 as new receiver for account1
      await proxyAccount
        .connect(owner)
        .setData([LSP2Keys.UniversalReceiverDelegate], [externalUniversalReceiver.address]);

      // use the checker contract to call account
      let checker = await new UniversalReceiverTester__factory(owner).deploy();
      let transaction = await checker.callImplementationAndReturn(
        proxyAccount.address,
        ERC777TokensRecipient
      );
      let receipt = await transaction.wait();

      // event should come from account externalUniversalReceiver
      expect(receipt.logs[0].address).toEqual(externalUniversalReceiver.address);
      // signature
      expect(receipt.logs[0].topics[0]).toEqual(EventSignatures.ReceivedERC777);
      // "token" is the checker
      expect(receipt.logs[0].topics[1]).toEqual(
        ethers.utils.hexZeroPad(checker.address.toLowerCase(), 32)
      );
      // typeId
      // not present, as it would revert if not correct
      // receivedData
      expect(receipt.logs[0].data).toEqual(
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
      );

      // event should come from account account
      expect(receipt.logs[1].address).toEqual(proxyAccount.address);
      // signature
      expect(receipt.logs[1].topics[0]).toEqual(EventSignatures.UniversalReceiver);
      // "from" is the checker
      expect(receipt.logs[1].topics[1]).toEqual(
        ethers.utils.hexZeroPad(checker.address.toLowerCase(), 32)
      );
      // typeId
      expect(receipt.logs[1].topics[2]).toEqual(ERC777TokensRecipient);
      // receivedData
      expect(receipt.logs[1].data).toEqual(
        "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000"
      );
    });

    it("Mint ERC777 and LSP4 to LSP3 account", async () => {
      const owner = accounts[2];

      const proxyAddress = await deployProxy(universalProfile.address, owner);
      const proxyAccount = await attachUniversalProfileProxy(erc725Utils.address, proxyAddress);
      await proxyAccount.initialize(owner.address);

      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(owner.address);

      let tokenOwner = accounts[2];

      let erc777 = await new ERC777UniversalReceiver__factory(owner).deploy("MyToken", "TKN", [
        tokenOwner.address,
      ]);
      let digitalCertificate = await new LSP4DigitalCertificate__factory(owner).deploy(
        tokenOwner.address,
        "MyDigitalCloth",
        "DIGICLOTH01",
        []
      );

      let initialERC777Balance = await erc777.balanceOf(proxyAccount.address);
      let initialdigitalCertificateBalance = await digitalCertificate.balanceOf(
        proxyAccount.address
      );
      expect(ethers.BigNumber.from(initialERC777Balance).toNumber()).toEqual(0);
      expect(ethers.BigNumber.from(initialdigitalCertificateBalance).toNumber()).toEqual(0);

      await erc777.mint(proxyAccount.address, "50", { from: tokenOwner.address });
      let newERC777Balance = await erc777.balanceOf(proxyAccount.address);
      expect(ethers.BigNumber.from(newERC777Balance).toNumber()).toEqual(50);

      await digitalCertificate.mint(proxyAccount.address, "50", { from: tokenOwner.address });
      let newDigitalCertificateBalance = await digitalCertificate.balanceOf(proxyAccount.address);
      expect(ethers.BigNumber.from(newDigitalCertificateBalance).toNumber()).toEqual(50);
    });

    it("Transfer ERC777 and LSP4 to LSP3 account", async () => {
      const owner = accounts[2];

      const proxyAddress = await deployProxy(universalProfile.address, owner);
      const proxyAccount = await attachUniversalProfileProxy(erc725Utils.address, proxyAddress);
      await proxyAccount.initialize(owner.address);

      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(proxyAccount.address);

      let tokenOwner = accounts[3];

      let erc777 = await new ERC777UniversalReceiver__factory(owner).deploy("MyToken", "TKN", [
        tokenOwner.address,
      ]);
      let digitalCertificate = await new LSP4DigitalCertificate__factory(owner).deploy(
        tokenOwner.address,
        "MyDigitalCloth",
        "DIGICLOTH01",
        []
      );

      await erc777.connect(tokenOwner).mint(tokenOwner.address, "100");
      await digitalCertificate.connect(tokenOwner).mint(tokenOwner.address, "100");

      let initialERC777Balance = await erc777.callStatic.balanceOf(proxyAccount.address);
      let initialdigitalCertificateBalance = await digitalCertificate.callStatic.balanceOf(
        proxyAccount.address
      );

      expect(ethers.BigNumber.from(initialERC777Balance).toNumber()).toEqual(0);
      expect(ethers.BigNumber.from(initialdigitalCertificateBalance).toNumber()).toEqual(0);

      await erc777.connect(tokenOwner).send(proxyAccount.address, "50", "0x");
      await erc777.connect(tokenOwner).transfer(proxyAccount.address, "50");
      await digitalCertificate.connect(tokenOwner).send(proxyAccount.address, "50", "0x");
      await digitalCertificate.connect(tokenOwner).transfer(proxyAccount.address, "50");

      let newERC777Balance = await erc777.callStatic.balanceOf(proxyAccount.address);
      let newdigitalCertificateBalance = await digitalCertificate.callStatic.balanceOf(
        proxyAccount.address
      );
      expect(ethers.BigNumber.from(newERC777Balance).toNumber()).toEqual(100);
      expect(ethers.BigNumber.from(newdigitalCertificateBalance).toNumber()).toEqual(100);
    });

    /** @debug Transaction reverted: function returned an unexpected amount of data */
    it("Mint ERC777 and LSP4 to LSP3 account and delegate to UniversalReceiverAddressStore", async () => {
      const owner = accounts[2];

      const proxyAddress = await deployProxy(universalProfile.address, owner);
      const proxyAccount = await attachUniversalProfileProxy(erc725Utils.address, proxyAddress);
      await proxyAccount.initialize(owner.address);

      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(proxyAccount.address);

      // set account2 as new receiver for account1
      await proxyAccount
        .connect(owner)
        .setData([LSP2Keys.UniversalReceiverDelegate], [universalReceiverDelegate.address]);

      let tokenOwner = accounts[2];

      let erc777 = await new ERC777UniversalReceiver__factory(owner).deploy("MyToken", "TKN", [
        tokenOwner.address,
      ]);
      let digitalCertificate = await new LSP4DigitalCertificate__factory(owner).deploy(
        tokenOwner.address,
        "MyDigitalCloth",
        "DIGICLOTH01",
        []
      );

      expect(await erc777.balanceOf(proxyAccount.address)).toEqBN(0);
      expect(await digitalCertificate.balanceOf(proxyAccount.address)).toEqBN(0);

      await erc777.connect(tokenOwner).mint(proxyAccount.address, "50");
      expect(await erc777.balanceOf(proxyAccount.address)).toEqBN(50);

      await digitalCertificate.connect(tokenOwner).mint(proxyAccount.address, "50");
      expect(await digitalCertificate.balanceOf(proxyAccount.address)).toEqBN(50);

      expect(await universalReceiverDelegate.containsAddress(erc777.address)).toBeTruthy();
      expect(
        await universalReceiverDelegate.containsAddress(digitalCertificate.address)
      ).toBeTruthy();
    });

    it("Transfer ERC777 and LSP4 from LSP3 account with delegate to UniversalReceiverAddressStore", async () => {
      const owner = accounts[2];

      const proxyAddress = await deployProxy(universalProfile.address, owner);
      const proxyAccount = await attachUniversalProfileProxy(erc725Utils.address, proxyAddress);
      await proxyAccount.initialize(owner.address);

      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(proxyAccount.address);

      // set account2 as new receiver for account1
      await proxyAccount
        .connect(owner)
        .setData([LSP2Keys.UniversalReceiverDelegate], [universalReceiverDelegate.address]);

      let tokenOwner = accounts[2];

      let erc777 = await new ERC777UniversalReceiver__factory(owner).deploy("MyToken", "TKN", [
        tokenOwner.address,
      ]);
      let digitalCertificate = await new LSP4DigitalCertificate__factory(owner).deploy(
        tokenOwner.address,
        "MyDigitalCloth",
        "DIGICLOTH01",
        []
      );

      await erc777.connect(tokenOwner).mint(tokenOwner.address, "100");
      await digitalCertificate.connect(tokenOwner).mint(tokenOwner.address, "100");

      expect(await erc777.balanceOf(proxyAccount.address)).toEqBN(0);
      expect(await digitalCertificate.balanceOf(proxyAccount.address)).toEqBN(0);

      /** @fails here */
      await erc777.connect(tokenOwner).send(proxyAccount.address, "50", "0x");
      await erc777.connect(tokenOwner).transfer(proxyAccount.address, "50");
      await digitalCertificate.connect(tokenOwner).send(proxyAccount.address, "50", "0x");
      await digitalCertificate.connect(tokenOwner).transfer(proxyAccount.address, "50");

      expect(await erc777.balanceOf(proxyAccount.address)).toEqBN("100");
      expect(await digitalCertificate.balanceOf(proxyAccount.address)).toEqBN("100");

      expect(await universalReceiverDelegate.containsAddress(erc777.address)).toBeTruthy();
      expect(
        await universalReceiverDelegate.containsAddress(digitalCertificate.address)
      ).toBeTruthy();
    });

    it("Transfer from ERC777 and LSP4 to account and delegate to UniversalReceiverAddressStore", async () => {
      const OPERATION_CALL = 0x0;
      const owner = accounts[2];

      const proxyAddress = await deployProxy(universalProfile.address, owner);
      const proxyAccount = await attachUniversalProfileProxy(erc725Utils.address, proxyAddress);
      await proxyAccount.initialize(owner.address);

      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(proxyAccount.address);

      // set account2 as new receiver for account1
      await proxyAccount
        .connect(owner)
        .setData([LSP2Keys.UniversalReceiverDelegate], [universalReceiverDelegate.address]);

      let tokenOwner = accounts[3];

      let erc777 = await new ERC777UniversalReceiver__factory(owner).deploy("MyToken", "TKN", [
        tokenOwner.address,
      ]);
      let digitalCertificate = await new LSP4DigitalCertificate__factory(owner).deploy(
        tokenOwner.address,
        "MyDigitalCloth",
        "DIGICLOTH01",
        []
      );

      /** @fails here */
      await erc777.connect(tokenOwner).mint(proxyAccount.address, "100");
      await digitalCertificate.connect(tokenOwner).mint(proxyAccount.address, "100");

      expect(await erc777.balanceOf(proxyAccount.address)).toEqBN(100);
      expect(await digitalCertificate.balanceOf(proxyAccount.address)).toEqBN(100);

      let abi;
      abi = erc777.interface.encodeFunctionData("send", [accounts[4].address, "50", "0x"]);
      await proxyAccount
        .connect(owner)
        .execute(OPERATION_CALL, erc777.address, 0, abi, { gasLimit: 3_000_000 });
      abi = erc777.interface.encodeFunctionData("transfer", [accounts[4].address, "50"]);
      await proxyAccount
        .connect(owner)
        .execute(OPERATION_CALL, erc777.address, 0, abi, { gasLimit: 3_000_000 });

      abi = digitalCertificate.interface.encodeFunctionData("send", [
        accounts[4].address,
        "50",
        "0x",
      ]);
      await proxyAccount
        .connect(owner)
        .execute(OPERATION_CALL, digitalCertificate.address, 0, abi, {
          gasLimit: 3_000_000,
        });
      abi = digitalCertificate.interface.encodeFunctionData("transfer", [
        accounts[4].address,
        "50",
      ]);
      await proxyAccount
        .connect(owner)
        .execute(OPERATION_CALL, digitalCertificate.address, 0, abi, {
          gasLimit: 3_000_000,
        });

      expect(await erc777.balanceOf(proxyAccount.address)).toEqBN(0);
      expect(await digitalCertificate.balanceOf(proxyAccount.address)).toEqBN(0);

      expect(await erc777.balanceOf(accounts[4].address)).toEqBN(100);
      expect(await digitalCertificate.balanceOf(accounts[4].address)).toEqBN(100);
    });
  });
});
