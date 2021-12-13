import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { calculateCreate2 } from "eth-create2-calculator";

import {
  LSP9Vault,
  LSP9Vault__factory,
  UniversalProfile,
  UniversalProfile__factory,
  TargetContract,
  TargetContract__factory,
  URDVaultSetter,
  URDVaultSetter__factory,
} from "../../types";
// constants
import {
  SupportedStandards,
  INTERFACE_IDS,
  ERC725YKeys,
  OPERATIONS,
} from "../utils/constants";

import {
  RANDOM_BYTES32,
  DUMMY_PAYLOAD,
  getMapAndArrayKeyValues,
  LSP10_ARRAY_KEY,
} from "../utils/helpers";

describe("LSP9Vault", () => {
  let accounts: SignerWithAddress[];
  let LSP9Vault: LSP9Vault;
  let UniversalProfile: UniversalProfile;
  let targetContract: TargetContract;
  let owner: SignerWithAddress;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[1];
    LSP9Vault = await new LSP9Vault__factory(owner).deploy(owner.address);
  });

  describe("Accounts Deployment", () => {
    it("Deploys correctly, and compare owners", async () => {
      const idOwner = await LSP9Vault.callStatic.owner();
      expect(idOwner).toEqual(owner.address);
    });
  });

  describe("ERC165", () => {
    it("Supports ERC165", async () => {
      const interfaceID = "0x01ffc9a7";
      const result = await LSP9Vault.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Supports ERC725X", async () => {
      const interfaceID = INTERFACE_IDS.ERC725X;
      const result = await LSP9Vault.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Supports ERC725Y", async () => {
      const interfaceID = INTERFACE_IDS.ERC725Y;
      const result = await LSP9Vault.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Supports LSP1", async () => {
      const interfaceID = INTERFACE_IDS.LSP1;
      const result = await LSP9Vault.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Shouldn't Supports ERC1271", async () => {
      const interfaceID = INTERFACE_IDS.ERC1271;
      const result = await LSP9Vault.callStatic.supportsInterface(interfaceID);

      expect(result).toBeFalsy();
    });

    it("Supports LSP9Vault", async () => {
      const interfaceID = INTERFACE_IDS.LSP9;
      const result = await LSP9Vault.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });
  });

  describe("Storage Test", () => {
    let abiCoder = ethers.utils.defaultAbiCoder;

    let count = 1000000000;

    it("Should have Key: 'SupportedStandards:LSP9Vault' set to Value: 'LSP9Vault'", async () => {
      let [result] = await LSP9Vault.callStatic.getData([
        SupportedStandards.LSP9Vault.key,
      ]);
      expect(result).toEqual(SupportedStandards.LSP9Vault.value);
    });

    it("Fails when non-owner sets data", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [
          ethers.utils.hexZeroPad(
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data")),
            32
          ),
        ]
      );
      let data = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("Important Data")
      );

      await expect(
        LSP9Vault.connect(accounts[9]).setData([key], [data])
      ).toBeRevertedWith("Only Owner or Universal Receiver Delegate allowed");
    });

    it("Storing a Random Key", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
      );
      let value = "0x" + (count++).toString(16);

      await LSP9Vault.connect(owner).setData([key], [value]);

      let [result] = await LSP9Vault.callStatic.getData([key]);
      expect(result).toEqual(value);
    });

    it("Store a long URL as bytes: https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
      );
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD"
        )
      );
      await LSP9Vault.connect(owner).setData([key], [value]);

      let [result] = await LSP9Vault.getData([key]);
      expect(result).toEqual(value);
    });
  });

  describe("Vault interaction", () => {
    beforeAll(async () => {
      targetContract = await new TargetContract__factory(owner).deploy();
      UniversalProfileTemp = await new UniversalProfile__factory(owner).deploy(
        owner.address
      );
      UniversalProfile = await new UniversalProfile__factory(owner).deploy(
        owner.address
      );
    });
    it("Refuse upgrades from non-onwer", async () => {
      await expect(
        LSP9Vault.connect(accounts[5]).transferOwnership(accounts[8].address)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });
    it("Allows owner to execute calls", async () => {
      let provider = ethers.provider;

      const dest = accounts[6];
      const amount = ethers.utils.parseEther("10");

      await owner.sendTransaction({
        to: LSP9Vault.address,
        value: amount,
      });

      const destBalance = await provider.getBalance(dest.address);

      await LSP9Vault.connect(owner).execute(
        OPERATIONS.CALL,
        dest.address,
        amount,
        "0x00"
      );

      const finalBalance = await provider.getBalance(dest.address);

      expect(ethers.BigNumber.from(destBalance).add(amount)).toEqual(
        ethers.BigNumber.from(finalBalance)
      );
    });

    it("Fails with non-owner executing", async () => {
      const dest = accounts[6];
      const amount = ethers.utils.parseEther("10");

      // send money to the account
      await owner.sendTransaction({
        to: LSP9Vault.address,
        value: amount,
      });

      // try to move it away
      await expect(
        LSP9Vault.connect(dest).execute(
          OPERATIONS.CALL,
          dest.address,
          amount,
          "0x"
        )
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });
    it("Allows owner to execute create", async () => {
      let transaction = await LSP9Vault.connect(owner).execute(
        OPERATIONS.CREATE,
        "0x0000000000000000000000000000000000000000",
        "0",
        "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6"
      );

      let receipt = await transaction.wait();
      expect(receipt.events[0].event).toEqual("ContractCreated");
    });

    it("Allows owner to execute create2", async () => {
      let salt =
        "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
      let contractBytecode =
        "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6";
      let preComputedAddress = calculateCreate2(
        LSP9Vault.address,
        salt,
        contractBytecode
      );

      // deploy with added 32 bytes salt
      let transaction = await LSP9Vault.connect(owner).execute(
        OPERATIONS.CREATE2,
        "0x0000000000000000000000000000000000000000",
        "0",
        contractBytecode + salt.substr(2), // 32 bytes salt
        { from: owner.address, gasLimit: 3_000_000 }
      );

      let receipt = await transaction.wait();

      expect(receipt.events[0].event).toEqual("ContractCreated");
      expect(receipt.events[0].args._contractAddress).toEqual(
        preComputedAddress
      );
    });

    it("Shouldnt read `LSP10ReceivedVaults` keys on the UP after transferring ownership as he didn't set the default URD", async () => {
      await LSP9Vault.connect(owner).transferOwnership(
        UniversalProfile.address
      );
      let vaultMapKey =
        ERC725YKeys.LSP10["LSP10ReceivedVaultsMap"] +
        LSP9Vault.address.substr(2);

      let [vaultMapValue, arrayLength, element1Address] =
        await getMapAndArrayKeyValues(
          UniversalProfile,
          vaultMapKey,
          ERC725YKeys.LSP10["LSP10ReceivedVaults[]"],
          LSP10_ARRAY_KEY.ELEMENT1
        );

      expect(vaultMapValue).toEqual("0x");
      expect(arrayLength).toEqual("0x");
      expect(element1Address).toEqual("0x");
    });

    it("Executing on the Vault throught the UniversalProfile", async () => {
      let settedName = "LUKSO";
      let abi = targetContract.interface.encodeFunctionData("setName", [
        settedName,
      ]);
      let executeABI = LSP9Vault.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        abi,
      ]);
      await UniversalProfile.connect(owner).execute(
        OPERATIONS.CALL,
        LSP9Vault.address,
        0,
        executeABI
      );
      let fetchedData = await targetContract.callStatic.getName();
      expect(fetchedData).toEqual(settedName);
    });
  });

  describe("UniversalReceiver", () => {
    let URDVaultSetter: URDVaultSetter;

    beforeAll(async () => {
      URDVaultSetter = await new URDVaultSetter__factory(owner).deploy();
      LSP9Vault = await new LSP9Vault__factory(owner).deploy(owner.address);
    });
    it("Setting a UniversalReceiverDelegate", async () => {
      let key = ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate;
      let value = URDVaultSetter.address;
      await LSP9Vault.connect(owner).setData([key], [value]);

      let [result] = await LSP9Vault.callStatic.getData([key]);
      expect(await ethers.utils.getAddress(result)).toEqual(value);
    });

    it("UniversalReceiverDelegate able to setData", async () => {
      let key = RANDOM_BYTES32;
      let value = DUMMY_PAYLOAD;
      await URDVaultSetter.universalReceiverDelegate(
        LSP9Vault.address,
        key,
        value
      );

      let [result] = await LSP9Vault.callStatic.getData([key]);
      expect(result).toEqual(value);
    });

    // Behavior of the deafult URD is tested in *tests/LSP1UniversalReceiver*
  });
});
