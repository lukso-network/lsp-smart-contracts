import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  ERC725Utils,
  ERC725Utils__factory,
  LSP3AccountInit,
  LSP3AccountInit__factory,
  KeyManagerInit,
  KeyManagerInit__factory,
  TargetContract,
  TargetContract__factory,
  Reentrancy,
  Reentrancy__factory,
} from "../build/types";

import { solidityKeccak256 } from "ethers/lib/utils";

// custom helpers
import { EMPTY_PAYLOAD, DUMMY_PAYLOAD, DUMMY_PRIVATEKEY, ONE_ETH } from "./utils/helpers";
import { KEYS, PERMISSIONS, OPERATIONS, allowedAddresses } from "./utils/keymanager";
import {
  deployProxy,
  deployBaseLSP3Account,
  deployBaseKeyManager,
  attachLSP3AccountProxy,
  attachKeyManagerProxy,
} from "./utils/proxy";

// /**
//  * Deploy a proxy contract, referencing to baseContractAddress via delegateCall
//  *
//  * @param baseContractAddress
//  * @param deployer
//  * @returns
//  */
// async function deployProxy(baseContractAddress: string, deployer: SignerWithAddress) {
//   // deploy proxy contract
//   let proxyRuntimeCode = proxyRuntimeCodeTemplate.replace(
//     "bebebebebebebebebebebebebebebebebebebebe",
//     baseContractAddress.substr(2)
//   );
//   let tx = await deployer.sendTransaction({
//     data: proxyRuntimeCode,
//   });
//   let receipt = await tx.wait();

//   return receipt.contractAddress;
// }

describe("KeyManager + LSP3 Account as Proxies", () => {
  let abiCoder;
  let accounts: SignerWithAddress[] = [];

  // core contracts
  let baseLsp3Account: LSP3AccountInit,
    baseKeyManager: KeyManagerInit,
    proxyLsp3Account: LSP3AccountInit,
    proxyKeyManager: KeyManagerInit;

  // library + helpers contracts
  let erc725Utils: ERC725Utils, targetContract: TargetContract, maliciousContract: Reentrancy;

  let owner: SignerWithAddress,
    app: SignerWithAddress,
    user: SignerWithAddress,
    externalApp: SignerWithAddress,
    newUser: SignerWithAddress;

  beforeAll(async () => {
    abiCoder = await ethers.utils.defaultAbiCoder;
    accounts = await ethers.getSigners();

    owner = accounts[0];
    app = accounts[1];
    user = accounts[2];
    externalApp = new ethers.Wallet(DUMMY_PRIVATEKEY, ethers.provider);
    user = accounts[4];
    newUser = accounts[5];

    // 1. deploy base contracts
    erc725Utils = await new ERC725Utils__factory(owner).deploy();
    baseLsp3Account = await deployBaseLSP3Account(erc725Utils, owner);
    baseKeyManager = await deployBaseKeyManager(erc725Utils, owner);

    // 2. deploy proxy contracts
    let proxyLsp3AccountAddress = await deployProxy(baseLsp3Account.address, owner);
    let proxyKeyManagerAddress = await deployProxy(baseKeyManager.address, owner);
    proxyLsp3Account = await attachLSP3AccountProxy(erc725Utils, owner, proxyLsp3AccountAddress);
    proxyKeyManager = await attachKeyManagerProxy(erc725Utils, owner, proxyKeyManagerAddress);

    // 3. initialize them
    await proxyLsp3Account.initialize(owner.address);
    await proxyKeyManager.initialize(proxyLsp3Account.address);

    // Other test contracts
    targetContract = await new TargetContract__factory(owner).deploy();
    maliciousContract = await new Reentrancy__factory(accounts[6]).deploy(proxyKeyManager.address);

    // owner permissions
    await proxyLsp3Account
      .connect(owner)
      .setData([KEYS.PERMISSIONS + owner.address.substr(2)], [PERMISSIONS.ALL]);

    // app permissions
    let appPermissions = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL);
    await proxyLsp3Account
      .connect(owner)
      .setData([KEYS.PERMISSIONS + app.address.substr(2)], [appPermissions]);
    await proxyLsp3Account
      .connect(owner)
      .setData(
        [KEYS.ALLOWEDADDRESSES + app.address.substr(2)],
        [abiCoder.encode(["address[]"], [[targetContract.address, user.address]])]
      );
    // do not allow the app to `setNumber` on TargetContract
    await proxyLsp3Account
      .connect(owner)
      .setData(
        [KEYS.ALLOWEDFUNCTIONS + app.address.substr(2)],
        [abiCoder.encode(["bytes4[]"], [[targetContract.interface.getSighash("setName(string)")]])]
      );

    // user permissions
    let userPermissions = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL);
    await proxyLsp3Account
      .connect(owner)
      .setData([KEYS.PERMISSIONS + user.address.substr(2)], [userPermissions]);

    // externalApp permissions
    let externalAppPermissions = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL);
    await proxyLsp3Account
      .connect(owner)
      .setData([KEYS.PERMISSIONS + externalApp.address.substr(2)], [externalAppPermissions]);
    await proxyLsp3Account
      .connect(owner)
      .setData(
        [KEYS.ALLOWEDADDRESSES + externalApp.address.substr(2)],
        [abiCoder.encode(["address[]"], [[targetContract.address, user.address]])]
      );
    // do not allow the externalApp to `setNumber` on TargetContract
    await proxyLsp3Account
      .connect(owner)
      .setData(
        [KEYS.ALLOWEDFUNCTIONS + externalApp.address.substr(2)],
        [abiCoder.encode(["bytes4[]"], [[targetContract.interface.getSighash("setName(string)")]])]
      );

    // test security
    await proxyLsp3Account
      .connect(owner)
      .setData(
        [KEYS.PERMISSIONS + newUser.address.substr(2)],
        [
          ethers.utils.hexZeroPad(
            PERMISSIONS.SETDATA + PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE
          ),
        ]
      );

    // switch account management to KeyManager
    await proxyLsp3Account.connect(owner).transferOwnership(proxyKeyManager.address);

    /** @todo find other way to ensure ERC725 Account has always 10 ethers before each test (and not transfer every time test is re-run) */
    await owner.sendTransaction({
      to: proxyLsp3Account.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  it("Cannot `initalize` LSP3 Account proxy twice", async () => {
    await expect(
      proxyLsp3Account.initialize("0xdead0dead0dead0dead0dead0dead0dead0dead0")
    ).toBeRevertedWith("Initializable: contract is already initialized");
  });

  it("Cannot `initialize` KeyManager proxy twice", async () => {
    await expect(
      proxyKeyManager.initialize("0xdead0dead0dead0dead0dead0dead0dead0dead0")
    ).toBeRevertedWith("Initializable: contract is already initialized");
  });

  describe("> verify permissions", () => {
    it("Owner should have ALL PERMISSIONS (= admin)", async () => {
      let [permissions] = await proxyLsp3Account.getData([
        KEYS.PERMISSIONS + owner.address.substr(2),
      ]);
      expect(permissions).toEqual(
        ethers.utils.hexZeroPad(PERMISSIONS.ALL),
        "Owner should have all permissions set"
      );
    });

    it("App should have permissions SETDATA and CALL", async () => {
      let [permissions] = await proxyLsp3Account.getData([
        KEYS.PERMISSIONS + app.address.substr(2),
      ]);
      expect(permissions).toEqual(
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL),
        "Owner should have all permissions set"
      );
    });
  });

  describe("> testing permissions: CHANGEKEYS, SETDATA", () => {
    it("Owner should be allowed to change keys", async () => {
      // change app's permissions
      let key = KEYS.PERMISSIONS + app.address.substr(2);

      let payload = proxyLsp3Account.interface.encodeFunctionData("setData", [
        [key],
        [PERMISSIONS.SETDATA],
      ]);

      let result = await proxyKeyManager.connect(owner).callStatic.execute(payload);
      expect(result).toBeTruthy();

      await proxyKeyManager.connect(owner).execute(payload);
      let fetchedResult = await proxyLsp3Account.callStatic.getData([key]);
      expect(Number(fetchedResult)).toEqual(PERMISSIONS.SETDATA);

      // reset app permissions
      await proxyKeyManager.execute(
        proxyLsp3Account.interface.encodeFunctionData("setData", [
          [key],
          [ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL)],
        ])
      );
    });

    /** @debug interesting, the revert error via proxy does not bubble up */
    xit("App should not be allowed to change keys", async () => {
      let [before] = await proxyLsp3Account.getData([KEYS.PERMISSIONS + app.address.substr(2)]);
      console.log("before: ", before);
      // malicious app trying to set all permissions
      let dangerousPayload = proxyLsp3Account.interface.encodeFunctionData("setData", [
        [KEYS.PERMISSIONS + app.address.substr(2)],
        [PERMISSIONS.ALL],
      ]);

      //   proxyKeyManager.connect(app).execute(dangerousPayload)
      await expect(proxyKeyManager.connect(app).execute(dangerousPayload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: Not authorized to change keys"
      );

      let [permissions] = await proxyLsp3Account.getData([
        KEYS.PERMISSIONS + app.address.substr(2),
      ]);
      console.log("after: ", permissions);
    });

    it("Owner should be allowed to setData", async () => {
      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP3Profile"));
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
          "https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg"
        )
      );

      let payload = proxyLsp3Account.interface.encodeFunctionData("setData", [[key], [value]]);

      let callResult = await proxyKeyManager.connect(owner).callStatic.execute(payload);
      expect(callResult).toBeTruthy();

      await proxyKeyManager.connect(owner).execute(payload, { gasLimit: 3_000_000 });
      let [fetchedResult] = await proxyLsp3Account.callStatic.getData([key]);

      expect(fetchedResult).toEqual(value);
    });

    it("App should be allowed to setData", async () => {
      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP3Profile"));
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
          "https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg"
        )
      );

      let payload = proxyLsp3Account.interface.encodeFunctionData("setData", [[key], [value]]);

      let callResult = await proxyKeyManager.connect(app).callStatic.execute(payload);
      expect(callResult).toBeTruthy();

      await proxyKeyManager.connect(app).execute(payload);
      let [fetchedResult] = await proxyLsp3Account.callStatic.getData([key]);
      expect(fetchedResult).toEqual(value);
    });
  });

  describe.skip("> testing permissions: CALL, DELEGATECALL, DEPLOY", () => {
    it("Owner should be allowed to make a CALL", async () => {
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        DUMMY_PAYLOAD,
      ]);

      let result = await proxyKeyManager.callStatic.execute(executePayload, {
        from: owner.address,
      });
      expect(result).toBeTruthy();
    });

    it("App should be allowed to make a CALL", async () => {
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContract.interface.encodeFunctionData("setName", ["Example"]),
      ]);

      console.log("accounts[0] (owner)", accounts[0].address);
      console.log("accounts[1] (app)", accounts[1].address);

      let executeResult = await proxyKeyManager.connect(app).callStatic.execute(executePayload);
      expect(executeResult).toBeTruthy();
    });

    it("App should not be allowed to make a DELEGATECALL", async () => {
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.DELEGATECALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        DUMMY_PAYLOAD,
      ]);

      await expect(proxyKeyManager.connect(app).execute(executePayload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: not authorized to perform DELEGATECALL"
      );
    });

    it("App should not be allowed to DEPLOY a contract", async () => {
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.DEPLOY,
        "0x0000000000000000000000000000000000000000",
        0,
        DUMMY_PAYLOAD,
      ]);

      await expect(proxyKeyManager.connect(app).execute(executePayload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: not authorized to perform DEPLOY"
      );
    });
  });

  describe.skip("> testing permission: TRANSFERVALUE", () => {
    let provider = ethers.provider;

    it("Owner should be allowed to transfer ethers to app", async () => {
      let initialAccountBalance = await provider.getBalance(proxyLsp3Account.address);
      let initialAppBalance = await provider.getBalance(app.address);

      let transferPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        app.address,
        ethers.utils.parseEther("3"),
        EMPTY_PAYLOAD,
      ]);

      let callResult = await proxyKeyManager.callStatic.execute(transferPayload);
      expect(callResult).toBeTruthy();

      await proxyKeyManager.execute(transferPayload, { gasLimit: 3_000_000 });

      let newAccountBalance = await provider.getBalance(proxyLsp3Account.address);
      expect(parseInt(newAccountBalance)).toBeLessThan(parseInt(initialAccountBalance));

      let newAppBalance = await provider.getBalance(app.address);
      expect(parseInt(newAppBalance)).toBeGreaterThan(parseInt(initialAppBalance));
    });

    it("App should not be allowed to transfer ethers", async () => {
      let initialAccountBalance = await provider.getBalance(proxyLsp3Account.address);
      let initialUserBalance = await provider.getBalance(user.address);
      // console.log("initialAccountBalance: ", initialAccountBalance)
      // console.log("initialUserBalance: ", initialUserBalance)

      let transferPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        user.address,
        ethers.utils.parseEther("3"),
        EMPTY_PAYLOAD,
      ]);

      await expect(proxyKeyManager.connect(app).execute(transferPayload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: Not authorized to transfer ethers"
      );

      let newAccountBalance = await provider.getBalance(proxyLsp3Account.address);
      let newUserBalance = await provider.getBalance(user.address);
      // console.log("newAccountBalance: ", newAccountBalance);
      // console.log("newUserBalance: ", newUserBalance);

      expect(initialAccountBalance.toString()).toBe(newAccountBalance.toString());
      expect(initialUserBalance.toString()).toBe(newUserBalance.toString());
    });
  });

  describe.skip("> testing permissions: ALLOWEDADDRESSES", () => {
    it("All addresses whitelisted = Owner should be allowed to interact with any address", async () => {
      let payload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        DUMMY_PAYLOAD,
      ]);

      let result = await proxyKeyManager.callStatic.execute(payload);
      expect(result).toBeTruthy();

      let secondPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
        0,
        DUMMY_PAYLOAD,
      ]);

      let secondResult = await proxyKeyManager.callStatic.execute(secondPayload);
      expect(secondResult).toBeTruthy();
    });

    it("App should be allowed to interact with `TargetContract`", async () => {
      let payload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        EMPTY_PAYLOAD,
      ]);

      let result = await proxyKeyManager.connect(app).callStatic.execute(payload);
      expect(result).toBeTruthy();
    });

    it("App should be allowed to interact with `user`", async () => {
      let payload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        user.address,
        0,
        EMPTY_PAYLOAD,
      ]);

      let result = await proxyKeyManager.connect(app).callStatic.execute(payload);
      expect(result).toBeTruthy();
    });

    it("App should not be allowed to interact with `0xdeadbeef...` (not allowed address)", async () => {
      let payload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        0,
        DUMMY_PAYLOAD,
      ]);

      await expect(proxyKeyManager.connect(app).execute(payload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: Not authorized to interact with this address"
      );
    });
  });

  describe.skip("> testing permissions: ALLOWEDFUNCTIONS", () => {
    it("App should not be allowed to run a non-allowed function (function signature = `0xbeefbeef`)", async () => {
      let payload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        "0xbeefbeef123456780000000000",
      ]);

      await expect(proxyKeyManager.connect(app).execute(payload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: Not authorised to run this function"
      );
    });
  });

  describe.skip("> testing: ALL ADDRESSES + FUNCTIONS whitelisted", () => {
    it("Should pass if no addresses / functions are stored for a user", async () => {
      let randomPayload = "0xfafbfcfd1201456875dd";
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        randomPayload,
      ]);

      let callResult = await proxyKeyManager.connect(user).callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();
    });
  });

  describe.skip("> testing external contract's state change", () => {
    it("Owner should be allowed to set `name` variable in simple contract", async () => {
      let initialName = await targetContract.callStatic.getName();
      let newName = "Updated Name";

      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [newName]);
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let callResult = await proxyKeyManager.callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await proxyKeyManager.execute(executePayload, { gasLimit: 3_000_000 });
      let result = await targetContract.callStatic.getName();
      expect(result !== initialName);
      expect(result).toEqual(newName, `name variable in TargetContract should now be ${newName}`);
    });

    it("App should be allowed to set `name` variable in TargetContract", async () => {
      let initialName = await targetContract.callStatic.getName();
      let newName = "Updated Name";

      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [newName]);
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let callResult = await proxyKeyManager.callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await proxyKeyManager.execute(executePayload, { gasLimit: 3_000_000 });
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
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let callResult = await proxyKeyManager.callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await proxyKeyManager.execute(executePayload, { gasLimit: 3_000_000 });
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
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      await expect(proxyKeyManager.connect(app).execute(executePayload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: Not authorised to run this function"
      );

      let result = await targetContract.callStatic.getNumber();
      expect(parseInt(ethers.BigNumber.from(result).toNumber(), 10) !== newNumber);
      expect(parseInt(ethers.BigNumber.from(result).toNumber(), 10)).toEqual(
        ethers.BigNumber.from(initialNumber).toNumber()
      );
    });
  });

  describe.skip("> testing other revert causes", () => {
    it("Should revert because of wrong operation type", async () => {
      let payload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        5648941657,
        targetContract.address,
        0,
        "0x",
      ]);

      await expect(proxyKeyManager.execute(payload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: Invalid operation type"
      );
    });

    it("Should revert because calling an unexisting function in ERC725", async () => {
      await expect(proxyKeyManager.execute("0xbad000000000000000000000000bad")).toBeRevertedWith(
        "KeyManager:_checkPermissions: unknown function selector from ERC725 account"
      );
    });
  });

  describe.skip("> testing `executeRelay(...)`", () => {
    // Use channelId = 0 for sequential nonce
    let channelId = 0;

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
      let nonce = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

      let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "bytes", "uint256"],
        [proxyKeyManager.address, executeRelayCallPayload, nonce]
      );

      let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

      let result = await proxyKeyManager.callStatic.executeRelayCall(
        executeRelayCallPayload,
        proxyKeyManager.address,
        nonce,
        channelId,
        signature
      );
      expect(result).toBeTruthy();
    });

    it("Should allow to `setName` via `executeRelay`", async () => {
      let newName = "Dagobah";

      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [newName]);
      let nonce = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

      let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "bytes", "uint256"],
        [proxyKeyManager.address, executeRelayCallPayload, nonce]
      );

      let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

      let result = await proxyKeyManager.callStatic.executeRelayCall(
        executeRelayCallPayload,
        proxyKeyManager.address,
        nonce,
        channelId,
        signature
      );
      expect(result).toBeTruthy();

      await proxyKeyManager.executeRelayCall(
        executeRelayCallPayload,
        proxyKeyManager.address,
        nonce,
        channelId,
        signature,
        { gasLimit: 3_000_000 }
      );
      let endResult = await targetContract.callStatic.getName();
      expect(endResult).toEqual(newName);
    });

    it("Should not allow to `setNumber` via `executeRelay`", async () => {
      let currentNumber = await targetContract.callStatic.getNumber();

      let targetContractPayload = targetContract.interface.encodeFunctionData("setNumber", [2354]);
      let nonce = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

      let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "bytes", "uint256"],
        [proxyKeyManager.address, executeRelayCallPayload, nonce]
      );

      let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

      await expect(
        proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonce,
          channelId,
          signature
        )
      ).toBeRevertedWith("KeyManager:_checkPermissions: Not authorised to run this function");

      let endResult = await targetContract.callStatic.getNumber();
      expect(endResult.toString()).toEqual(currentNumber.toString());
    });
  });

  describe.skip("> testing sequential nonces (= channel 0)", () => {
    let channelId = 0;
    let latestNonce;

    beforeEach(async () => {
      latestNonce = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);
    });

    it.each([
      { callNb: "First", newName: "Yamen", expectedNonce: latestNonce + 1 },
      { callNb: "Second", newName: "Nour", expectedNonce: latestNonce + 1 },
      { callNb: "Third", newName: "Huss", expectedNonce: latestNonce + 1 },
      { callNb: "Fourth", newName: "Moussa", expectedNonce: latestNonce + 1 },
    ])(
      "$callNb call > nonce should increment from $latestNonce to $expectedNonce",
      async ({ callNb, newName, expectedNonce }) => {
        let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
          newName,
        ]);
        let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "bytes", "uint256"],
          [proxyKeyManager.address, executeRelayCallPayload, latestNonce]
        );

        let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

        await proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          latestNonce,
          channelId,
          signature,
          { gasLimit: 3_000_000 }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await proxyKeyManager.callStatic.getNonce(externalApp.address, 0);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(latestNonce.add(1)); // ensure the nonce incremented
      }
    );
  });

  describe.skip("> testing multi-channel nonces (= channel n)", () => {
    let nonces = [0, 1];

    describe("channel 1", () => {
      let channelId = 1;
      let names = ["Fabian", "Yamen"];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        let nonceBefore = await proxyKeyManager.getNonce(externalApp.address, channelId);
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
          newName,
        ]);
        let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "bytes", "uint256"],
          [proxyKeyManager.address, executeRelayCallPayload, nonceBefore]
        );

        let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

        await proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonceBefore,
          channelId,
          signature,
          { gasLimit: 3_000_000 }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        let nonceBefore = await proxyKeyManager.getNonce(externalApp.address, channelId);
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
          newName,
        ]);
        let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "bytes", "uint256"],
          [proxyKeyManager.address, executeRelayCallPayload, nonceBefore]
        );

        let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

        await proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonceBefore,
          channelId,
          signature,
          { gasLimit: 3_000_000 }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 2", () => {
      let channelId = 2;
      let names = ["Hugo", "Reto"];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        let nonceBefore = await proxyKeyManager.getNonce(externalApp.address, channelId);
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
          newName,
        ]);
        let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "bytes", "uint256"],
          [proxyKeyManager.address, executeRelayCallPayload, nonceBefore]
        );

        let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

        await proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonceBefore,
          channelId,
          signature,
          { gasLimit: 3_000_000 }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        let nonceBefore = await proxyKeyManager.getNonce(externalApp.address, channelId);
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
          newName,
        ]);
        let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "bytes", "uint256"],
          [proxyKeyManager.address, executeRelayCallPayload, nonceBefore]
        );

        let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

        await proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonceBefore,
          channelId,
          signature,
          { gasLimit: 3_000_000 }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 3", () => {
      let channelId = 3;
      let names = ["Jean", "Lenny"];

      it(`First call > nonce should increment from ${nonces[0]} to ${nonces[0] + 1}`, async () => {
        let nonceBefore = await proxyKeyManager.getNonce(externalApp.address, channelId);
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
          newName,
        ]);
        let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "bytes", "uint256"],
          [proxyKeyManager.address, executeRelayCallPayload, nonceBefore]
        );

        let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

        await proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonceBefore,
          channelId,
          signature,
          { gasLimit: 3_000_000 }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${nonces[1] + 1}`, async () => {
        let nonceBefore = await proxyKeyManager.getNonce(externalApp.address, channelId);
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
          newName,
        ]);
        let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "bytes", "uint256"],
          [proxyKeyManager.address, executeRelayCallPayload, nonceBefore]
        );

        let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

        await proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonceBefore,
          channelId,
          signature,
          { gasLimit: 3_000_000 }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 15", () => {
      let channelId = 15;
      it("First call > nonce should increment from 0 to 1", async () => {
        let nonceBefore = await proxyKeyManager.getNonce(externalApp.address, channelId);
        let newName = "Lukasz";

        let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
          newName,
        ]);
        let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "bytes", "uint256"],
          [proxyKeyManager.address, executeRelayCallPayload, nonceBefore]
        );

        let signature = await externalApp.signMessage(ethers.utils.arrayify(hash));

        await proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonceBefore,
          channelId,
          signature,
          { gasLimit: 3_000_000 }
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await proxyKeyManager.callStatic.getNonce(externalApp.address, channelId);

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });
  });

  describe.skip("> testing Security", () => {
    let provider = ethers.provider;
    let channelId = 0;

    it("Should revert because caller has no permissions set", async () => {
      let targetContractPayload = targetContract.interface.encodeFunctionData("setName", [
        "New Contract Name",
      ]);

      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      await expect(proxyKeyManager.connect(accounts[6]).execute(executePayload)).toBeRevertedWith(
        "KeyManager:_getUserPermissions: no permissions set for this user / caller"
      );
    });

    it("Permissions should prevent ReEntrancy and stop contract from re-calling and re-transfering ETH.", async () => {
      // we assume the owner is not aware that some malicious code is present at the recipient address (the recipient being a smart contract)
      // the owner simply aims to transfer 1 ether from his ERC725 Account to the recipient address (= the malicious contract)
      let transferPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        maliciousContract.address,
        ONE_ETH,
        EMPTY_PAYLOAD,
      ]);

      let executePayload = proxyKeyManager.interface.encodeFunctionData("execute", [
        transferPayload,
      ]);
      // load the malicious payload, that will be executed in the fallback function (every time the contract receives ethers)
      await maliciousContract.loadPayload(executePayload);

      let initialAccountBalance = await provider.getBalance(proxyLsp3Account.address);
      let initialAttackerBalance = await provider.getBalance(maliciousContract.address);
      // console.log("ERC725's initial account balance: ", initialAccountBalance)
      // console.log("Attacker's initial balance: ", initialAttackerBalance)

      // try to drain funds via ReEntrancy
      await proxyKeyManager.connect(owner).execute(transferPayload, { gasLimit: 3_000_000 });

      let newAccountBalance = await provider.getBalance(proxyLsp3Account.address);
      let newAttackerBalance = await provider.getBalance(maliciousContract.address);
      // console.log("ERC725 account balance: ", newAccountBalance)
      // console.log("Attacker balance: ", newAttackerBalance)

      expect(parseInt(newAccountBalance.toString())).toEqual(
        initialAccountBalance.toString() - ONE_ETH.toString()
      );
      expect(parseInt(newAttackerBalance.toString())).toEqual(parseInt(ONE_ETH.toString()));
    });

    it("Replay Attack should fail because of invalid nonce", async () => {
      let nonce = await proxyKeyManager.callStatic.getNonce(newUser.address, channelId);

      let executeRelayCallPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        maliciousContract.address,
        ONE_ETH,
        DUMMY_PAYLOAD,
      ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "bytes", "uint256"],
        [proxyKeyManager.address, executeRelayCallPayload, nonce]
      );

      let signature = await newUser.signMessage(ethers.utils.arrayify(hash));

      // first call
      let result = await proxyKeyManager.callStatic.executeRelayCall(
        executeRelayCallPayload,
        proxyKeyManager.address,
        nonce,
        channelId,
        signature
      );
      expect(result).toBeTruthy();

      await proxyKeyManager.executeRelayCall(
        executeRelayCallPayload,
        proxyKeyManager.address,
        nonce,
        channelId,
        signature
      );

      // 2nd call = replay attack
      await expect(
        proxyKeyManager.executeRelayCall(
          executeRelayCallPayload,
          proxyKeyManager.address,
          nonce,
          channelId,
          signature
        )
      ).toBeRevertedWith("KeyManager:executeRelayCall: Incorrect nonce");
    });
  });
});
