import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { calculateCreate2 } from "eth-create2-calculator";

import {
  UniversalProfile,
  UniversalProfile__factory,
  KeyManager,
  KeyManager__factory,
  UniversalReceiverAddressStore,
  UniversalReceiverAddressStore__factory,
  UniversalReceiverTester,
  UniversalReceiverTester__factory,
  ERC777UniversalReceiver__factory,
  ExternalERC777UniversalReceiverTester__factory,
  LSP4DigitalCertificate__factory,
} from "../build/types";

// custom utils
import { ALL_PERMISSIONS_SET, KEYS, OPERATIONS, PERMISSIONS } from "./utils/keymanager";

/** @todo put all of these in constant file */

/** @deprecated */
const SupportedStandardsERC725Account_KEY =
  "0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6";

/** @deprecated */
// Get key: bytes4(keccak256('ERC725Account'))
const ERC725Account_VALUE = "0xafdeb5d6";

const SupportedStandardsLSP3UniversalProfile_KEY =
  "0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6";
const LSP3UniversalProfile_VALUE = "0xabe425d6";

// Get key: keccak256('LSP1UniversalReceiverDelegate')
const UNIVERSALRECEIVER_KEY = "0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47";

const ERC1271_MAGIC_VALUE = "0x1626ba7e";
const ERC1271_FAIL_VALUE = "0xffffffff";

// Universal Receiver
const RANDOM_BYTES32 = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
const ERC777TokensRecipient = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
// keccak256("UniversalReceiver(address,bytes32,bytes,bytes)")
const EVENT_SIGNATURE = "0x8187df79ab47ad16102e7bc8760349a115b3ba9869b8cedd78996f930ac9cac3";

describe("UniversalProfile", () => {
  let accounts: SignerWithAddress[] = [];
  let UniversalProfile: UniversalProfile;

  let owner: SignerWithAddress;

  beforeAll(async () => {
    accounts = await ethers.getSigners();
    owner = accounts[2];
    UniversalProfile = await new UniversalProfile__factory(owner).deploy(owner.address);
  });

  describe("Accounts Deployment", () => {
    it("Deploys correctly, and compare owners", async () => {
      const idOwner = await UniversalProfile.callStatic.owner();
      expect(idOwner).toEqual(owner.address);
    });
  });

  describe("ERC165", () => {
    it("Supports ERC165", async () => {
      const interfaceID = "0x01ffc9a7";
      const result = await UniversalProfile.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Supports ERC725X", async () => {
      const interfaceID = "0x44c028fe";
      const result = await UniversalProfile.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Supports ERC725Y", async () => {
      const interfaceID = "0x5a988c0f";
      const result = await UniversalProfile.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Supports ERC1271", async () => {
      const interfaceID = "0x1626ba7e";
      const result = await UniversalProfile.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Supports LSP1", async () => {
      const interfaceID = "0x6bb56a14";
      const result = await UniversalProfile.callStatic.supportsInterface(interfaceID);

      expect(result).toBeTruthy();
    });

    it("Has SupportedStandardsERC725Account_KEY set to ERC725Account_VALUE", async () => {
      const owner = accounts[2];
      let [result] = await UniversalProfile.callStatic.getData([
        SupportedStandardsLSP3UniversalProfile_KEY,
      ]);
      expect(result).toEqual(LSP3UniversalProfile_VALUE);
    });
  });

  describe("ERC1271", () => {
    it("Can verify signature from owner", async () => {
      const signer = accounts[9];
      const account = await new UniversalProfile__factory(owner).deploy(signer.address);

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await account.callStatic.isValidSignature(messageHash, signature);
      expect(result).toEqual(ERC1271_MAGIC_VALUE);
    });

    it("Should fail when verifying signature from not-owner", async () => {
      const owner = accounts[2];
      const signer = accounts[9];

      const account = await new UniversalProfile__factory(owner).deploy(owner.address);
      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await account.callStatic.isValidSignature(messageHash, signature);
      expect(result).toEqual(ERC1271_FAIL_VALUE);
    });
  });

  describe("Storage test", () => {
    let abiCoder = ethers.utils.defaultAbiCoder;
    let count = 1000000000;

    it("Create account", async () => {
      const owner = accounts[2];
      const newaccount = await new UniversalProfile__factory(owner).deploy(owner.address);

      expect(await newaccount.callStatic.owner()).toEqual(owner.address);
    });

    /**
     * The UniversalProfile storage already contains one key-value pair after deployment
     *  key: 0xeafec4d89fa9619884b6b89135626455000000000000000000000000abe425d6 (SupportedStandards:LSP3UniversalProfile)
     *  value: 0xabe425d6
     *
     * This is set within the contract's constructor
     */
    it("Store 32 bytes item 2", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
      );
      let value = "0x" + (count++).toString(16);

      await UniversalProfile.connect(owner).setData([key], [value]);

      let [result] = await UniversalProfile.callStatic.getData([key]);
      expect(result).toEqual(value);
    });

    it("Store 32 bytes item 3", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
      );
      let value = "0x" + (count++).toString(16);

      await UniversalProfile.connect(owner).setData([key], [value]);

      let [result] = await UniversalProfile.callStatic.getData([key]);
      expect(result).toEqual(value);
    });

    it("Store 32 bytes item 4", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
      );
      let value = "0x" + (count++).toString(16);

      await UniversalProfile.connect(owner).setData([key], [value]);

      let [result] = await UniversalProfile.callStatic.getData([key]);
      expect(result).toEqual(value);
    });

    it("Store 32 bytes item 5", async () => {
      let owner = accounts[2];

      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
      );
      let value = "0x" + (count++).toString(16);

      await UniversalProfile.connect(owner).setData([key], [value]);

      let [result] = await UniversalProfile.callStatic.getData([key]);
      expect(result).toEqual(value);
    });

    it("Store a long URL as bytes item 6: https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
      );
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
          "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD"
        )
      );
      await UniversalProfile.connect(owner).setData([key], [value]);

      let [result] = await UniversalProfile.getData([key]);
      expect(result).toEqual(value);
    });

    it("Store 32 bytes item 7", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + count.toString(16), 32)]
      );
      let value = "0x" + count.toString(16);

      await UniversalProfile.connect(owner).setData([key], [value]);

      let [result] = await UniversalProfile.getData([key]);
      expect(result).toEqual(value);
    });

    it("dataCount should be 7", async () => {
      // 7 because the LSP3UniversalProfile-type is already set by the UniversalProfile implementation
      let result = await UniversalProfile.callStatic.allDataKeys();
      expect(result.length).toEqual(7);
    });

    it("Update 32 bytes item 7", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [ethers.utils.hexZeroPad("0x" + count.toString(16), 32)]
      );

      let value = "0x" + count.toString(16);
      await UniversalProfile.connect(owner).setData([key], [value]);

      let [result] = await UniversalProfile.getData([key]);
      expect(result).toEqual(value);
    });

    it("dataCount should remain 7", async () => {
      let result = await UniversalProfile.callStatic.allDataKeys();
      expect(result.length).toEqual(7);
    });

    it("Store multiple 32 bytes item 8-10", async () => {
      let keys = [];
      let values = [];
      // increase
      count++;
      for (let i = 7; i <= 9; i++) {
        let key = abiCoder.encode(
          ["bytes32"],
          [ethers.utils.hexZeroPad("0x" + (count++).toString(16), 32)]
        );

        let value = "0x" + (count++).toString(16);
        keys.push(key);
        values.push(value);
      }

      // no need to wrap in square brackets here, as `keys` and `values` are arrays
      await UniversalProfile.connect(owner).setData(keys, values);
      let result = await UniversalProfile.callStatic.getData(keys);
      expect(result).toEqual(values);
    });

    it("dataCount should be 10", async () => {
      let keys = await UniversalProfile.allDataKeys();
      expect(keys.length).toEqual(10);

      //   console.log("Stored keys", keys);
    });
  });

  describe("Interactions with Accounts contracts", () => {
    let abiCoder = ethers.utils.defaultAbiCoder;
    let provider = ethers.provider;

    let owner: SignerWithAddress;
    let newOwner: SignerWithAddress;
    let account: UniversalProfile;

    beforeEach(async () => {
      owner = accounts[3];
      newOwner = accounts[5];
      account = await new UniversalProfile__factory(owner).deploy(owner.address);
    });

    it("Upgrade ownership correctly", async () => {
      await account.connect(owner).transferOwnership(newOwner.address);
      const idOwner = await account.callStatic.owner();

      expect(idOwner).toEqual(newOwner.address);
    });

    it("Refuse upgrades from non-onwer", async () => {
      await expect(account.connect(newOwner).transferOwnership(newOwner.address)).toBeRevertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Owner can set data", async () => {
      let key = abiCoder.encode(
        ["bytes32"],
        [
          ethers.utils.hexZeroPad(
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data")),
            32
          ),
        ]
      );
      let data = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data"));

      await account.connect(owner).setData([key], [data]);

      let [fetchedData] = await account.getData([key]);

      expect(data).toEqual(fetchedData);
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
      let data = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data"));

      await expect(account.connect(newOwner).setData([key], [data])).toBeRevertedWith(
        "Ownable: caller is not the owner"
      );
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
      let data = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Important Data"));

      await expect(account.connect(newOwner).setData([key], [data])).toBeRevertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Allows owner to execute calls", async () => {
      const dest = accounts[6];
      const amount = ethers.utils.parseEther("10");

      await owner.sendTransaction({
        to: account.address,
        value: amount,
      });

      const destBalance = await provider.getBalance(dest.address);

      await account.connect(owner).execute(OPERATIONS.CALL, dest.address, amount, "0x00");

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
        to: account.address,
        value: amount,
      });

      // try to move it away
      await expect(
        account.connect(newOwner).execute(OPERATIONS.CALL, dest.address, amount, "0x")
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Allows owner to execute create", async () => {
      let transaction = await account
        .connect(owner)
        .execute(
          OPERATIONS.CREATE,
          "0x0000000000000000000000000000000000000000",
          "0",
          "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6"
        );

      let receipt = await transaction.wait();
      expect(receipt.events[0].event).toEqual("ContractCreated");
    });

    // TODO test delegateCall

    it("Allows owner to execute create2", async () => {
      let salt = "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";
      let contractBytecode =
        "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6";
      let preComputedAddress = calculateCreate2(account.address, salt, contractBytecode);

      // deploy with added 32 bytes salt
      let transaction = await account.connect(owner).execute(
        OPERATIONS.CREATE2,
        "0x0000000000000000000000000000000000000000",
        "0",
        contractBytecode + salt.substr(2), // 32 bytes salt
        { from: owner.address, gasLimit: 3_000_000 }
      );

      let receipt = await transaction.wait();

      expect(receipt.events[0].event).toEqual("ContractCreated");
      expect(receipt.events[0].args._contractAddress).toEqual(preComputedAddress);
    });

    it("Allow account to receive native tokens", async () => {
      const amount = ethers.utils.parseEther("10");

      // send money to the account
      await newOwner.sendTransaction({
        to: account.address,
        value: amount,
      });

      expect(await provider.getBalance(account.address)).toEqual(amount);
    });
  });

  describe("Universal Receiver", () => {
    it("Call account and check for 'UniversalReceiver' event", async () => {
      const owner = accounts[2];
      const account = await new UniversalProfile__factory(owner).deploy(owner.address);
      // use the checker contract to call account
      let checker = await new UniversalReceiverTester__factory(owner).deploy();

      let transaction = await checker
        .connect(owner)
        .callImplementationAndReturn(account.address, RANDOM_BYTES32);
      let receipt = await transaction.wait();

      // event should come from account
      expect(receipt.logs[0].address).toEqual(account.address);
      // event signature
      expect(receipt.logs[0].topics[0]).toEqual(EVENT_SIGNATURE);
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
      const account = await new UniversalProfile__factory(owner).deploy(owner.address);
      const externalUniversalReceiver = await new ExternalERC777UniversalReceiverTester__factory(
        owner
      ).deploy();

      // set account2 as new receiver for account1
      await account
        .connect(owner)
        .setData([UNIVERSALRECEIVER_KEY], [externalUniversalReceiver.address]);

      // use the checker contract to call account
      let checker = await new UniversalReceiverTester__factory(owner).deploy();
      let transaction = await checker.callImplementationAndReturn(
        account.address,
        ERC777TokensRecipient
      );
      let receipt = await transaction.wait();

      //   console.log("accounts[2] (owner): ", owner.address);
      //   console.log("account (UP): ", account.address);
      //   console.log("externalUniversalReceiver: ", externalUniversalReceiver.address);
      //   console.log("checker: ", checker.address);

      // event signature "event ReceivedERC777(address indexed token, address indexed _operator, address indexed _from, address _to, uint256 _amount)"
      // event should come from account externalUniversalReceiver
      expect(receipt.logs[0].address).toEqual(externalUniversalReceiver.address);
      // signature
      expect(receipt.logs[0].topics[0]).toEqual(
        "0xdc38539587ea4d67f9f649ad9269646bab26927bad175bdcdfdab5dd297d5e1c"
      );
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

      // event signature "event UniversalReceiver(address indexed from, bytes32 indexed typeId, bytes32 indexed returnedValue, bytes receivedData)"
      // event should come from account account
      expect(receipt.logs[1].address).toEqual(account.address);
      // signature
      expect(receipt.logs[1].topics[0]).toEqual(EVENT_SIGNATURE);
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
      const account = await new UniversalProfile__factory(owner).deploy(owner.address);
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

      let initialERC777Balance = await erc777.balanceOf(account.address);
      let initialdigitalCertificateBalance = await digitalCertificate.balanceOf(account.address);
      expect(ethers.BigNumber.from(initialERC777Balance).toNumber()).toEqual(0);
      expect(ethers.BigNumber.from(initialdigitalCertificateBalance).toNumber()).toEqual(0);

      await erc777.mint(account.address, "50", { from: tokenOwner.address });
      let newERC777Balance = await erc777.balanceOf(account.address);
      expect(ethers.BigNumber.from(newERC777Balance).toNumber()).toEqual(50);

      await digitalCertificate.mint(account.address, "50", { from: tokenOwner.address });
      let newDigitalCertificateBalance = await digitalCertificate.balanceOf(account.address);
      expect(ethers.BigNumber.from(newDigitalCertificateBalance).toNumber()).toEqual(50);
    });

    it("Transfer ERC777 and LSP4 to LSP3 account", async () => {
      const owner = accounts[2];
      const account = await new UniversalProfile__factory(owner).deploy(owner.address);
      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(account.address);

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

      let initialERC777Balance = await erc777.callStatic.balanceOf(account.address);
      let initialdigitalCertificateBalance = await digitalCertificate.callStatic.balanceOf(
        account.address
      );

      expect(ethers.BigNumber.from(initialERC777Balance).toNumber()).toEqual(0);
      expect(ethers.BigNumber.from(initialdigitalCertificateBalance).toNumber()).toEqual(0);

      await erc777.connect(tokenOwner).send(account.address, "50", "0x");
      await erc777.connect(tokenOwner).transfer(account.address, "50");
      await digitalCertificate.connect(tokenOwner).send(account.address, "50", "0x");
      await digitalCertificate.connect(tokenOwner).transfer(account.address, "50");

      let newERC777Balance = await erc777.callStatic.balanceOf(account.address);
      let newdigitalCertificateBalance = await digitalCertificate.callStatic.balanceOf(
        account.address
      );
      expect(ethers.BigNumber.from(newERC777Balance).toNumber()).toEqual(100);
      expect(ethers.BigNumber.from(newdigitalCertificateBalance).toNumber()).toEqual(100);
    });

    it("Mint ERC777 and LSP4 to LSP3 account and delegate to UniversalReceiverAddressStore", async () => {
      const owner = accounts[2];
      const account = await new UniversalProfile__factory(owner).deploy(owner.address);
      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(account.address);

      // set account2 as new receiver for account1
      await account
        .connect(owner)
        .setData([UNIVERSALRECEIVER_KEY], [universalReceiverDelegate.address]);

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

      expect(await erc777.balanceOf(account.address)).toEqBN(0);
      expect(await digitalCertificate.balanceOf(account.address)).toEqBN(0);

      await erc777.connect(tokenOwner).mint(account.address, "50");
      expect(await erc777.balanceOf(account.address)).toEqBN(50);

      await digitalCertificate.connect(tokenOwner).mint(account.address, "50");
      expect(await digitalCertificate.balanceOf(account.address)).toEqBN(50);

      expect(await universalReceiverDelegate.containsAddress(erc777.address)).toBeTruthy();
      expect(
        await universalReceiverDelegate.containsAddress(digitalCertificate.address)
      ).toBeTruthy();
    });

    it("Transfer ERC777 and LSP4 from LSP3 account with delegate to UniversalReceiverAddressStore", async () => {
      const owner = accounts[2];
      const account = await new UniversalProfile__factory(owner).deploy(owner.address);
      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(account.address);

      // set account2 as new receiver for account1
      await account
        .connect(owner)
        .setData([UNIVERSALRECEIVER_KEY], [universalReceiverDelegate.address]);

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

      expect(await erc777.balanceOf(account.address)).toEqBN(0);
      expect(await digitalCertificate.balanceOf(account.address)).toEqBN(0);

      await erc777.connect(tokenOwner).send(account.address, "50", "0x");
      await erc777.connect(tokenOwner).transfer(account.address, "50");
      await digitalCertificate.connect(tokenOwner).send(account.address, "50", "0x");
      await digitalCertificate.connect(tokenOwner).transfer(account.address, "50");

      expect(await erc777.balanceOf(account.address)).toEqBN("100");
      expect(await digitalCertificate.balanceOf(account.address)).toEqBN("100");

      expect(await universalReceiverDelegate.containsAddress(erc777.address)).toBeTruthy();
      expect(
        await universalReceiverDelegate.containsAddress(digitalCertificate.address)
      ).toBeTruthy();
    });

    it("Transfer from ERC777 and LSP4 to account and delegate to UniversalReceiverAddressStore", async () => {
      const owner = accounts[2];
      const account = await new UniversalProfile__factory(owner).deploy(owner.address);
      const universalReceiverDelegate = await new UniversalReceiverAddressStore__factory(
        owner
      ).deploy(account.address);

      // set account2 as new receiver for account1
      await account
        .connect(owner)
        .setData([UNIVERSALRECEIVER_KEY], [universalReceiverDelegate.address]);

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

      await erc777.connect(tokenOwner).mint(account.address, "100");
      await digitalCertificate.connect(tokenOwner).mint(account.address, "100");

      expect(await erc777.balanceOf(account.address)).toEqBN(100);
      expect(await digitalCertificate.balanceOf(account.address)).toEqBN(100);

      let abi;
      abi = erc777.interface.encodeFunctionData("send", [accounts[4].address, "50", "0x"]);
      await account
        .connect(owner)
        .execute(OPERATIONS.CALL, erc777.address, 0, abi, { gasLimit: 3_000_000 });
      abi = erc777.interface.encodeFunctionData("transfer", [accounts[4].address, "50"]);
      await account
        .connect(owner)
        .execute(OPERATIONS.CALL, erc777.address, 0, abi, { gasLimit: 3_000_000 });

      abi = digitalCertificate.interface.encodeFunctionData("send", [
        accounts[4].address,
        "50",
        "0x",
      ]);
      await account.connect(owner).execute(OPERATIONS.CALL, digitalCertificate.address, 0, abi, {
        gasLimit: 3_000_000,
      });
      abi = digitalCertificate.interface.encodeFunctionData("transfer", [
        accounts[4].address,
        "50",
      ]);
      await account.connect(owner).execute(OPERATIONS.CALL, digitalCertificate.address, 0, abi, {
        gasLimit: 3_000_000,
      });

      expect(await erc777.balanceOf(account.address)).toEqBN(0);
      expect(await digitalCertificate.balanceOf(account.address)).toEqBN(0);

      expect(await erc777.balanceOf(accounts[4].address)).toEqBN(100);
      expect(await digitalCertificate.balanceOf(accounts[4].address)).toEqBN(100);
    });
  }); //Context Universal Receiver

  describe("Using KeyManager as owner", () => {
    let provider = ethers.provider;

    let erc725Utils: ERC725Utils;
    let keyManager: KeyManager;
    let UniversalProfile: UniversalProfile;
    let owner: SignerWithAddress;
    let signer: SignerWithAddress;
    let thirdParty: SignerWithAddress;

    beforeEach(async () => {
      owner = accounts[6];
      signer = accounts[7];
      thirdParty = accounts[8];
      UniversalProfile = await new UniversalProfile__factory(owner).deploy(owner.address);
      keyManager = await new KeyManager__factory(owner).deploy(UniversalProfile.address);

      // give all permissions to owner
      await UniversalProfile.connect(owner).setData(
        [KEYS.PERMISSIONS + owner.address.substr(2)],
        [ALL_PERMISSIONS_SET]
      );

      // give SIGN permission to signer
      await UniversalProfile.connect(owner).setData(
        [KEYS.PERMISSIONS + signer.address.substr(2)],
        [ethers.utils.hexZeroPad(PERMISSIONS.SIGN, 32)]
      );
      // give CALL permission to non-signer
      await UniversalProfile.connect(owner).setData(
        [KEYS.PERMISSIONS + thirdParty.address.substr(2)],
        ["0x08"]
      );

      await UniversalProfile.connect(owner).transferOwnership(keyManager.address);
    });

    it("Accounts should have owner as KeyManager", async () => {
      const idOwner = await UniversalProfile.callStatic.owner();
      expect(idOwner).toEqual(keyManager.address);
    });

    describe("ERC1271 from KeyManager", () => {
      it("Can verify signature from owner on KeyManager", async () => {
        const dataToSign = "0xcafecafe";
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await owner.signMessage(dataToSign);

        const result = await keyManager.callStatic.isValidSignature(messageHash, signature);
        expect(result).toEqual(ERC1271_MAGIC_VALUE);
      });

      it("Can verify signature from signer on KeyManager", async () => {
        const dataToSign = "0xbeefbeef";
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await signer.signMessage(dataToSign);

        const result = await keyManager.callStatic.isValidSignature(messageHash, signature);
        expect(result).toEqual(ERC1271_MAGIC_VALUE);
      });

      it("Should fail when verifying signature from address with no SIGN permission", async () => {
        const dataToSign = "0xabcdabcd";
        const messageHash = ethers.utils.hashMessage(dataToSign);
        const signature = await thirdParty.signMessage(dataToSign);

        const result = await keyManager.callStatic.isValidSignature(messageHash, signature);
        expect(result).toEqual(ERC1271_FAIL_VALUE);
      });
    });

    // KeyManager can execute on behalf of identity
    it("Keymanager can execute on behalf of identity", async () => {
      const dest = accounts[1];
      const amount = ethers.utils.parseEther("3");

      // Fund Accounts contract
      await owner.sendTransaction({
        to: UniversalProfile.address,
        value: amount,
      });

      //   Initial Balances
      const destBalance = await provider.getBalance(dest.address);
      const idBalance = await provider.getBalance(UniversalProfile.address);
      const managerBalance = await provider.getBalance(keyManager.address);
      //   console.log("destBalance: ", destBalance);
      //   console.log("idBalance: ", idBalance);
      //   console.log("managerBalance: ", managerBalance);

      let abi = UniversalProfile.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        dest.address,
        amount,
        "0x00",
      ]);

      await keyManager.connect(owner).execute(abi);

      const destBalanceFinal = await provider.getBalance(dest.address);
      const idBalanceFinal = await provider.getBalance(UniversalProfile.address);
      const managerBalanceFinal = await provider.getBalance(keyManager.address);

      expect(managerBalance).toEqual(managerBalanceFinal); // "manager balance shouldn't have changed"
      expect(destBalance.add(amount)).toEqual(destBalanceFinal); // "Destination address should have recived amount"
      expect(idBalance.sub(amount)).toEqual(idBalanceFinal);
    });
  });
});
