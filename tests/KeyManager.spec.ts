import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  ERC725Account,
  ERC725Account__factory,
  KeyManager,
  KeyManager__factory,
  TargetContract,
  TargetContract__factory,
  Reentrancy,
  Reentrancy__factory,
} from "../build/types";

import { expectRevert } from "@openzeppelin/test-helpers";
import { Signer, Wallet } from "ethers";
import { hashMessage, solidityKeccak256 } from "ethers/lib/utils";

import {
  KEY_PERMISSIONS,
  KEY_ALLOWEDADDRESSES,
  KEY_ALLOWEDFUNCTIONS,
  ALL_PERMISSIONS,
  PERMISSION_SETDATA,
  PERMISSION_CALL,
  PERMISSION_TRANSFERVALUE,
} from "./utils/keymanager";

// Operations
const OPERATION_CALL = 0;
const OPERATION_DELEGATECALL = 1;
const OPERATION_DEPLOY = 2;

// Other
const EMPTY_PAYLOAD = "0x";
const DUMMY_PAYLOAD = "0xaabbccdd123456780000000000";
const ONE_ETH = ethers.utils.parseEther("1");
const DUMMY_PRIVATEKEY = "0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe";

let allowedAddresses = [
  "0xcafecafecafecafecafecafecafecafecafecafe",
  "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
];

describe("KeyManager", () => {
  let abiCoder;
  let accounts: SignerWithAddress[] = [];

  let erc725Account: ERC725Account,
    keyManager: KeyManager,
    targetContract: TargetContract,
    maliciousContract: Reentrancy;

  let owner: SignerWithAddress,
    app: SignerWithAddress,
    user: SignerWithAddress,
    externalApp,
    newUser: SignerWithAddress;

  beforeAll(async () => {
    abiCoder = await ethers.utils.defaultAbiCoder;
    accounts = await ethers.getSigners();

    owner = accounts[0];
    app = accounts[1];
    user = accounts[2];
    // externalApp = accounts[3];
    externalApp = new ethers.Wallet(DUMMY_PRIVATEKEY, ethers.provider);
    user = accounts[4];
    newUser = accounts[5];

    erc725Account = await new ERC725Account__factory(owner).deploy(owner.address);
    keyManager = await new KeyManager__factory(owner).deploy(erc725Account.address);
    targetContract = await new TargetContract__factory(owner).deploy();
    maliciousContract = await new Reentrancy__factory(accounts[6]).deploy(keyManager.address);
    // owner permissions
    await erc725Account.setData(KEY_PERMISSIONS + owner.address.substr(2), ALL_PERMISSIONS, {
      from: owner.address,
    });

    // app permissions
    let appPermissions = ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL);
    await erc725Account.setData(KEY_PERMISSIONS + app.address.substr(2), appPermissions, {
      from: owner.address,
    });
    await erc725Account.setData(
      KEY_ALLOWEDADDRESSES + app.address.substr(2),
      abiCoder.encode(["address[]"], [[targetContract.address, user.address]])
    );
    await erc725Account.setData(
      // do not allow the app to `setNumber` on TargetContract
      KEY_ALLOWEDFUNCTIONS + app.address.substr(2),
      abiCoder.encode(["bytes4[]"], [[targetContract.interface.getSighash("setName(string)")]])
    );

    // user permissions
    let userPermissions = ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL);
    await erc725Account.setData(KEY_PERMISSIONS + user.address.substr(2), userPermissions, {
      from: owner.address,
    });

    // externalApp permissions
    let externalAppPermissions = ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL);
    await erc725Account.setData(
      KEY_PERMISSIONS + externalApp.address.substr(2),
      externalAppPermissions,
      { from: owner.address }
    );
    await erc725Account.setData(
      KEY_ALLOWEDADDRESSES + externalApp.address.substr(2),
      abiCoder.encode(["address[]"], [[targetContract.address, user.address]])
    );
    await erc725Account.setData(
      // do not allow the externalApp to `setNumber` on TargetContract
      KEY_ALLOWEDFUNCTIONS + externalApp.address.substr(2),
      abiCoder.encode(["bytes4[]"], [[targetContract.interface.getSighash("setName(string)")]])
    );

    // workaround to test security
    await erc725Account.setData(
      KEY_PERMISSIONS + newUser.address.substr(2),
      ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL + PERMISSION_TRANSFERVALUE)
    );

    // switch account management to KeyManager
    await erc725Account.transferOwnership(keyManager.address, { from: owner.address });

    /** @todo find other way to ensure ERC725 Account has always 10 ethers before each test (and not transfer every time test is re-run) */
    await owner.sendTransaction({
      to: erc725Account.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  beforeEach(async () => {
    erc725Account.connect(owner.address);
    keyManager.connect(owner.address);

    await targetContract.setName("Simple Contract Name");
    await targetContract.setNumber(5);
  });

  // ensures owner is still erc725Account\'s admin (=all permissions)
  it("ensures owner is still erc725Account's admin (=all permissions)", async () => {
    let permissions = await erc725Account.getData(KEY_PERMISSIONS + owner.address.substr(2));
    expect(permissions).toEqual("0xff", "Owner should have all permissions set");
  });

  describe("> testing permissions: CHANGEKEYS, SETDATA", () => {
    it("Owner should be allowed to change keys", async () => {
      let key = KEY_PERMISSIONS + app.address.substr(2);

      let payload = erc725Account.interface.encodeFunctionData("setData", [
        key,
        PERMISSION_SETDATA,
      ]);

      let result = await keyManager.callStatic.execute(payload, { from: owner.address });
      expect(result).toBeTruthy();

      await keyManager.execute(payload, { from: owner.address });
      let fetchedResult = await erc725Account.callStatic.getData(key);
      expect(Number(fetchedResult)).toEqual(PERMISSION_SETDATA);
    });

    it("App should not be allowed to change keys", async () => {
      // malicious app trying to set all permissions
      let dangerousPayload = erc725Account.interface.encodeFunctionData("setData", [
        KEY_PERMISSIONS + app.address.substr(2),
        ALL_PERMISSIONS,
      ]);

      await expectRevert.unspecified(
        keyManager.connect(app.address).execute(dangerousPayload)
        // "KeyManager:_checkPermissions: Not authorized to change keys"
      );
    });

    it("Owner should be allowed to setData", async () => {
      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP3Profile"));
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
          "https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg"
        )
      );

      let payload = erc725Account.interface.encodeFunctionData("setData", [key, value]);

      let callResult = await keyManager.callStatic.execute(payload, { from: owner.address });
      expect(callResult).toBeTruthy();

      await keyManager.execute(payload, { from: owner.address });
      let fetchedResult = await erc725Account.callStatic.getData(key);
      expect(fetchedResult).toEqual(value);
    });

    it("App should be allowed to setData", async () => {
      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP3Profile"));
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
          "https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg"
        )
      );

      let payload = erc725Account.interface.encodeFunctionData("setData", [key, value]);

      keyManager.connect(app.address);
      let callResult = await keyManager.callStatic.execute(payload);
      expect(callResult).toBeTruthy();

      await keyManager.execute(payload);
      let fetchedResult = await erc725Account.callStatic.getData(key);
      expect(fetchedResult).toEqual(value);
    });
  });

  describe("> testing permissions: CALL, DELEGATECALL, DEPLOY", () => {
    it("Owner should be allowed to make a CALL", async () => {
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        DUMMY_PAYLOAD,
      ]);

      let result = await keyManager.callStatic.execute(executePayload, { from: owner.address });
      expect(result).toBeTruthy();
    });

    it("App should be allowed to make a CALL", async () => {
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContract.interface.encodeFunctionData("setName", ["Example"]),
      ]);

      keyManager.connect(app.address);
      let executeResult = await keyManager.callStatic.execute(executePayload);
      expect(executeResult).toBeTruthy();
    });

    it("App should not be allowed to make a DELEGATECALL", async () => {
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_DELEGATECALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        DUMMY_PAYLOAD,
      ]);

      await expectRevert.unspecified(
        keyManager.connect(app.address).execute(executePayload)
        // "KeyManager:_checkPermissions: not authorized to perform DELEGATECALL"
      );
    });

    it("App should not be allowed to DEPLOY a contract", async () => {
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_DEPLOY,
        "0x0000000000000000000000000000000000000000",
        0,
        DUMMY_PAYLOAD,
      ]);

      await expectRevert.unspecified(
        keyManager.connect(app.address).execute(executePayload)
        // "KeyManager:_checkPermissions: not authorized to perform DEPLOY"
      );
    });
  });

  describe("> testing permission: TRANSFERVALUE", () => {
    let provider = ethers.provider;

    it("Owner should be allowed to transfer ethers to app", async () => {
      let initialAccountBalance = await provider.getBalance(erc725Account.address);
      let initialAppBalance = await provider.getBalance(app.address);

      let transferPayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        app.address,
        ethers.utils.parseEther("3"),
        EMPTY_PAYLOAD,
      ]);

      let callResult = await keyManager.callStatic.execute(transferPayload);
      expect(callResult).toBeTruthy();

      await keyManager.execute(transferPayload, { gasLimit: 3_000_000 });

      let newAccountBalance = await provider.getBalance(erc725Account.address);
      expect(parseInt(newAccountBalance)).toBeLessThan(parseInt(initialAccountBalance));

      let newAppBalance = await provider.getBalance(app.address);
      expect(parseInt(newAppBalance)).toBeGreaterThan(parseInt(initialAppBalance));
    });

    it("App should not be allowed to transfer ethers", async () => {
      let initialAccountBalance = await provider.getBalance(erc725Account.address);
      let initialUserBalance = await provider.getBalance(user.address);
      // console.log("initialAccountBalance: ", initialAccountBalance)
      // console.log("initialUserBalance: ", initialUserBalance)

      let transferPayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        user.address,
        ethers.utils.parseEther("3"),
        EMPTY_PAYLOAD,
      ]);

      await expect(keyManager.connect(app.address).execute(transferPayload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: Not authorized to transfer ethers"
      );

      let newAccountBalance = await provider.getBalance(erc725Account.address);
      let newUserBalance = await provider.getBalance(user.address);
      // console.log("newAccountBalance: ", newAccountBalance);
      // console.log("newUserBalance: ", newUserBalance);

      expect(initialAccountBalance.toString()).toBe(newAccountBalance.toString());
      expect(initialUserBalance.toString()).toBe(newUserBalance.toString());
    });
  });

  describe("> testing permissions: ALLOWEDADDRESSES", () => {
    it("All addresses whitelisted = Owner should be allowed to interact with any address", async () => {
      let payload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        DUMMY_PAYLOAD,
      ]);

      let result = await keyManager.callStatic.execute(payload);
      expect(result).toBeTruthy();

      let secondPayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
        0,
        DUMMY_PAYLOAD,
      ]);

      let secondResult = await keyManager.callStatic.execute(secondPayload);
      expect(secondResult).toBeTruthy();
    });

    it("App should be allowed to interact with `TargetContract`", async () => {
      let payload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        EMPTY_PAYLOAD,
      ]);

      keyManager.connect(app.address);
      let result = await keyManager.callStatic.execute(payload);
      expect(result).toBeTruthy();
    });

    it("App should be allowed to interact with `user`", async () => {
      let payload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        user.address,
        0,
        EMPTY_PAYLOAD,
      ]);

      keyManager.connect(app.address);
      let result = await keyManager.callStatic.execute(payload);
      expect(result).toBeTruthy();
    });

    it("App should not be allowed to interact with `0xdeadbeef...` (not allowed address)", async () => {
      let payload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        0,
        DUMMY_PAYLOAD,
      ]);

      await expectRevert.unspecified(
        keyManager.connect(app.address).execute(payload)
        // "KeyManager:_checkPermissions: not authorized to perform DEPLOY"
      );
    });
  });

  describe("> testing permissions: ALLOWEDFUNCTIONS", () => {
    it("App should not be allowed to run a non-allowed function (function signature = `0xbeefbeef`)", async () => {
      let payload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        "0xbeefbeef123456780000000000",
      ]);

      await expectRevert.unspecified(
        keyManager.connect(app.address).execute(payload)
        // "KeyManager:_checkPermissions: Not authorised to run this function"
      );
    });
  });

  describe("> testing: ALL ADDRESSES + FUNCTIONS whitelisted", () => {
    it("Should pass if no addresses / functions are stored for a user", async () => {
      let randomPayload = "0xfafbfcfd1201456875dd";
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        randomPayload,
      ]);

      keyManager.connect(user.address);
      let callResult = await keyManager.callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();
    });
  });

  describe("> testing external contract's state change", () => {
    it("Owner should be allowed to set `name` variable in simple contract", async () => {
      let initialName = await targetContract.callStatic.getName();
      let newName = "Updated Name";

      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [newName]);
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let callResult = await keyManager.callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await keyManager.execute(executePayload, { gasLimit: 3_000_000 });
      let result = await targetContract.callStatic.getName();
      expect(result !== initialName);
      expect(result).toEqual(newName, `name variable in TargetContract should now be ${newName}`);
    });

    it("App should be allowed to set `name` variable in TargetContract", async () => {
      let initialName = await targetContract.callStatic.getName();
      let newName = "Updated Name";

      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [newName]);
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let callResult = await keyManager.callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await keyManager.execute(executePayload, { gasLimit: 3_000_000 });
      let result = await targetContract.callStatic.getName();
      expect(result !== initialName);
      expect(result).toEqual(newName);
    });

    it("Owner should be allowed to set `number` variable from TargetContract", async () => {
      let initialNumber = await targetContract.callStatic.getNumber();
      let newNumber = 18;

      let targetContractPayload = targetContract.interface.encodeFunctionData("setNumber", [
        newNumber,
      ]);
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let callResult = await keyManager.callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await keyManager.execute(executePayload, { gasLimit: 3_000_000 });
      let result = await targetContract.callStatic.getNumber();
      expect(
        parseInt(ethers.BigNumber.from(result).toNumber(), 10) !==
          ethers.BigNumber.from(initialNumber).toNumber()
      );
      expect(parseInt(ethers.BigNumber.from(result).toNumber(), 10)).toEqual(newNumber);
    });

    it("App should not be allowed to set `number` variable in simple contract", async () => {
      let initialNumber = await targetContract.callStatic.getNumber();
      let newNumber = 18;

      let targetContractPayload = targetContract.interface.encodeFunctionData("setNumber", [
        newNumber,
      ]);
      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      await expectRevert.unspecified(keyManager.connect(app.address).execute(executePayload));

      let result = await targetContract.callStatic.getNumber();
      expect(parseInt(ethers.BigNumber.from(result).toNumber(), 10) !== newNumber);
      expect(parseInt(ethers.BigNumber.from(result).toNumber(), 10)).toEqual(
        ethers.BigNumber.from(initialNumber).toNumber()
      );
    });
  });

  describe("> testing other revert causes", () => {
    it("Should revert because of wrong operation type", async () => {
      let payload = erc725Account.interface.encodeFunctionData("execute", [
        5648941657,
        targetContract.address,
        0,
        "0x",
      ]);

      await expectRevert.unspecified(
        keyManager.execute(payload)
        // "KeyManager:_checkPermissions: Invalid operation type"
      );
    });

    it("Should revert because calling an unexisting function in ERC725", async () => {
      await expectRevert.unspecified(
        keyManager.execute("0xbad000000000000000000000000bad")
        // "KeyManager:_checkPermissions: unknown function selector from ERC725 account"
      );
    });
  });

  describe("> testing `executeRelay(...)`", () => {
    it("Compare signature", async () => {
      let staticAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
      let payload = `0x44c028fe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000009fbda871d559710256a2502a2517b794b482db40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000064c47f00270000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c416e6f74686572206e616d65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;
      let nonce = 0;

      // right hashing method with etherjs
      let hash = solidityKeccak256(
        ["address", "bytes", "uint256"],
        [staticAddress, payload, nonce]
      );

      let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

      expect(hash).toEqual("0x15f469cb343cc40aadc99db1d7707087bdb4f721787e80901d6dfabded8e45c7");
      // expect: 0x15f469cb343cc40aadc99db1d7707087bdb4f721787e80901d6dfabded8e45c7
      expect(signature).toEqual(
        "0xea8970e8307d7746e34f2713016d0cabd9842f69765bd916d513c88d21f392ea75a24f05675cf59171758d6e9f7d3a9e620e73b2ba41b23c41ff868fe0b797381b"
      );
    });

    /** @debug concatenate the hex in the message for the signature correctly */
    it("should execute a signed tx successfully", async () => {
      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
        "Another name",
      ]);
      let nonce = await keyManager.callStatic.getNonce(externalApp.address);

      let executeRelayCallPayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "bytes", "uint256"],
        [keyManager.address, executeRelayCallPayload, nonce]
      );

      let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

      let result = await keyManager.callStatic.executeRelayCall(
        executeRelayCallPayload,
        keyManager.address,
        nonce,
        signature
      );
      expect(result).toBeTruthy();
    });

    /** @debug concatenate the hex in the message for the signature correctly */
    it("Should allow to `setName` via `executeRelay`", async () => {
      let newName = "Dagobah";

      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [newName]);
      let nonce = await keyManager.callStatic.getNonce(externalApp.address);

      let executeRelayCallPayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "bytes", "uint256"],
        [keyManager.address, executeRelayCallPayload, nonce]
      );

      let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

      let result = await keyManager.callStatic.executeRelayCall(
        executeRelayCallPayload,
        keyManager.address,
        nonce,
        signature
      );
      expect(result).toBeTruthy();

      await keyManager.executeRelayCall(
        executeRelayCallPayload,
        keyManager.address,
        nonce,
        signature,
        { gasLimit: 3_000_000 }
      );
      let endResult = await targetContract.callStatic.getName();
      expect(endResult).toEqual(newName);
    });

    it("Should not allow to `setNumber` via `executeRelay`", async () => {
      let currentNumber = await targetContract.callStatic.getNumber();

      let targetContractPayload = targetContract.interface.encodeFunctionData("setNumber", [2354]);
      let nonce = await keyManager.callStatic.getNonce(externalApp.address);

      let executeRelayCallPayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "bytes", "uint256"],
        [keyManager.address, executeRelayCallPayload, nonce]
      );

      let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

      await expect(
        keyManager.executeRelayCall(executeRelayCallPayload, keyManager.address, nonce, signature)
      ).toBeRevertedWith("KeyManager:_checkPermissions: Not authorised to run this function");

      let endResult = await targetContract.callStatic.getNumber();
      expect(endResult.toString()).toEqual(currentNumber.toString());
    });
  });

  describe("> testing Security", () => {
    let provider = ethers.provider;

    it("Should revert because caller has no permissions set", async () => {
      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
        "New Contract Name",
      ]);

      let executePayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      await expect(keyManager.connect(accounts[6]).execute(executePayload)).toBeRevertedWith(
        "KeyManager:_getUserPermissions: no permissions set for this user / caller"
      );
    });

    it("Permissions should prevent ReEntrancy and stop contract from re-calling and re-transfering ETH.", async () => {
      // we assume the owner is not aware that some malicious code is present at the recipient address (the recipient being a smart contract)
      // the owner simply aims to transfer 1 ether from his ERC725 Account to the recipient address (= the malicious contract)
      let transferPayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        maliciousContract.address,
        ONE_ETH,
        EMPTY_PAYLOAD,
      ]);

      let executePayload = keyManager.interface.encodeFunctionData("execute", [transferPayload]);
      // load the malicious payload, that will be executed in the fallback function (every time the contract receives ethers)
      await maliciousContract.loadPayload(executePayload);

      let initialAccountBalance = await provider.getBalance(erc725Account.address);
      let initialAttackerBalance = await provider.getBalance(maliciousContract.address);
      // console.log("ERC725's initial account balance: ", initialAccountBalance)
      // console.log("Attacker's initial balance: ", initialAttackerBalance)

      // try to drain funds via ReEntrancy
      await keyManager.connect(owner).execute(transferPayload, { gasLimit: 3_000_000 });

      let newAccountBalance = await provider.getBalance(erc725Account.address);
      let newAttackerBalance = await provider.getBalance(maliciousContract.address);
      // console.log("ERC725 account balance: ", newAccountBalance)
      // console.log("Attacker balance: ", newAttackerBalance)

      expect(parseInt(newAccountBalance.toString())).toEqual(
        initialAccountBalance.toString() - ONE_ETH.toString()
      );
      expect(parseInt(newAttackerBalance.toString())).toEqual(parseInt(ONE_ETH.toString()));
    });

    it("Replay Attack should fail because of invalid nonce", async () => {
      let nonce = await keyManager.callStatic.getNonce(newUser.address);

      let executeRelayCallPayload = erc725Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        maliciousContract.address,
        ONE_ETH,
        DUMMY_PAYLOAD,
      ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "bytes", "uint256"],
        [keyManager.address, executeRelayCallPayload, nonce]
      );

      let signature = await newUser.signMessage(ethers.utils.arrayify(hash));

      // first call
      let result = await keyManager.callStatic.executeRelayCall(
        executeRelayCallPayload,
        keyManager.address,
        nonce,
        signature
      );
      expect(result).toBeTruthy();

      await keyManager.executeRelayCall(
        executeRelayCallPayload,
        keyManager.address,
        nonce,
        signature
      );

      // 2nd call = replay attack
      await expectRevert.unspecified(
        keyManager.executeRelayCall(executeRelayCallPayload, keyManager.address, nonce, signature, {
          gasLimit: 3_000_000,
        })
        // "KeyManager:executeRelayCall: Incorrect nonce"
      );
    });
  });
});
