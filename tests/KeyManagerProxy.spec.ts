import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import {
  KEY_PERMISSIONS,
  ALL_PERMISSIONS,
  PERMISSION_SETDATA,
  PERMISSION_CALL,
} from "./utils/keymanager";

import {
  LSP3AccountInit,
  LSP3AccountInit__factory,
  KeyManagerInit,
  KeyManagerInit__factory,
  TargetContract,
  TargetContract__factory,
} from "../build/types";

import { SignerWithAddress } from "ethers";

const { proxyRuntimeCodeTemplate } = require("./utils/proxy");

// Operations
const OPERATION_CALL = 0;
const OPERATION_DELEGATECALL = 1;
const OPERATION_DEPLOY = 2;

// Other
const EMPTY_PAYLOAD = "0x";
const DUMMY_PAYLOAD = "0xaabbccdd123456780000000000";
const ONE_ETH = ethers.utils.parseEther("1");
const DUMMY_PRIVATEKEY = "0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe";

/**
 * Deploy a proxy contract, referencing to masterContractAddress via delegateCall
 *
 * @param masterContractAddress
 * @param deployer
 * @returns
 */
async function deployProxy(masterContractAddress: string, deployer: SignerWithAddress) {
  // deploy proxy contract
  let proxyRuntimeCode = proxyRuntimeCodeTemplate.replace(
    "bebebebebebebebebebebebebebebebebebebebe",
    masterContractAddress.substr(2)
  );
  let tx = await deployer.sendTransaction({
    data: proxyRuntimeCode,
  });
  let receipt = await tx.wait();

  return receipt.contractAddress;
}

describe("KeyManager + LSP3 Account as Proxies", () => {
  let abiCoder;
  let accounts: SignerWithAddress[] = [];

  let masterLsp3Account: LSP3AccountInit,
    masterKeyManager: KeyManagerInit,
    proxyLsp3Account: LSP3AccountInit,
    proxyKeyManager: KeyManagerInit;

  let targetContract: TargetContract;

  let owner: SignerWithAddress, app: SignerWithAddress, user: SignerWithAddress;

  beforeAll(async () => {
    abiCoder = await ethers.utils.defaultAbiCoder;
    accounts = await ethers.getSigners();

    owner = accounts[0];
    app = accounts[1];
    user = accounts[2];

    targetContract = await new TargetContract__factory(owner).deploy();

    // 1. deploy master contracts
    masterLsp3Account = await new LSP3AccountInit__factory(owner).deploy();
    masterKeyManager = await new KeyManagerInit__factory(owner).deploy();

    // 2. deploy proxy contracts
    let proxyLsp3AccountAddress = await deployProxy(masterLsp3Account.address, owner);
    let proxyKeyManagerAddress = await deployProxy(masterKeyManager.address, owner);
    proxyLsp3Account = await new LSP3AccountInit__factory(owner).attach(proxyLsp3AccountAddress);
    proxyKeyManager = await new KeyManagerInit__factory(owner).attach(proxyKeyManagerAddress);

    // 3. initialize them
    await proxyLsp3Account.initialize(owner.address);
    await proxyKeyManager.initialize(proxyLsp3Account.address);

    // owner permissions
    await proxyLsp3Account.setData(KEY_PERMISSIONS + owner.address.substr(2), ALL_PERMISSIONS, {
      from: owner.address,
    });

    // app permissions
    let appPermissions = ethers.utils.hexZeroPad(PERMISSION_SETDATA + PERMISSION_CALL);
    await proxyLsp3Account.setData(KEY_PERMISSIONS + app.address.substr(2), appPermissions, {
      from: owner.address,
    });

    // switch account management to KeyManager
    await proxyLsp3Account.transferOwnership(proxyKeyManager.address, { from: owner.address });

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

  it("Cannot `initalize` KeyManager proxy twice", async () => {
    await expect(
      proxyKeyManager.initialize("0xdead0dead0dead0dead0dead0dead0dead0dead0")
    ).toBeRevertedWith("Initializable: contract is already initialized");
  });

  describe("> verify permissions", () => {
    it("Owner should have ALL PERMISSIONS (= admin)", async () => {
      let permissions = await proxyLsp3Account.getData(KEY_PERMISSIONS + owner.address.substr(2));
      expect(permissions).toEqual("0xff", "Owner should have all permissions set");
    });

    it("App should have permissions SETDATA and CALL", async () => {
      let permissions = await proxyLsp3Account.getData(KEY_PERMISSIONS + app.address.substr(2));
      console.log(permissions);
      //   expect(permissions).toEqual("0xff", "Owner should have all permissions set");
    });
  });

  describe("> testing permissions: CHANGEKEYS, SETDATA", () => {
    it("Owner should be allowed to change keys", async () => {
      let key = KEY_PERMISSIONS + app.address.substr(2);

      let payload = proxyLsp3Account.interface.encodeFunctionData("setData", [
        key,
        PERMISSION_SETDATA,
      ]);

      let result = await proxyKeyManager.callStatic.execute(payload, { from: owner.address });
      expect(result).toBeTruthy();

      await proxyKeyManager.execute(payload, { from: owner.address });
      let fetchedResult = await proxyLsp3Account.callStatic.getData(key);
      expect(Number(fetchedResult)).toEqual(PERMISSION_SETDATA);
    });

    it("App should not be allowed to change keys", async () => {
      // malicious app trying to set all permissions
      let dangerousPayload = proxyLsp3Account.interface.encodeFunctionData("setData", [
        KEY_PERMISSIONS + app.address.substr(2),
        ALL_PERMISSIONS,
      ]);

      await expect(proxyKeyManager.connect(app).execute(dangerousPayload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: Not authorized to change keys"
      );
    });

    it("Owner should be allowed to setData", async () => {
      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP3Profile"));
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
          "https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg"
        )
      );

      let payload = proxyLsp3Account.interface.encodeFunctionData("setData", [key, value]);

      let callResult = await proxyKeyManager.callStatic.execute(payload, { from: owner.address });
      expect(callResult).toBeTruthy();

      await proxyKeyManager.execute(payload, { from: owner.address, gasLimit: 3_000_000 });
      let fetchedResult = await proxyLsp3Account.callStatic.getData(key);

      expect(fetchedResult).toEqual(value);
    });

    it("App should be allowed to setData", async () => {
      let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LSP3Profile"));
      let value = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(
          "https://static.coindesk.com/wp-content/uploads/2021/04/dogecoin.jpg"
        )
      );

      let payload = proxyLsp3Account.interface.encodeFunctionData("setData", [key, value]);

      proxyKeyManager.connect(app.address);
      let callResult = await proxyKeyManager.callStatic.execute(payload);
      expect(callResult).toBeTruthy();

      await proxyKeyManager.execute(payload);
      let fetchedResult = await proxyLsp3Account.callStatic.getData(key);
      expect(fetchedResult).toEqual(value);
    });
  });

  describe("> testing permissions: CALL, DELEGATECALL, DEPLOY", () => {
    it("Owner should be allowed to make a CALL", async () => {
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        DUMMY_PAYLOAD,
      ]);

      let result = await proxyKeyManager.callStatic.execute(executePayload, {
        from: owner.address,
      });
      expect(result).toBeTruthy();
    });

    xit("App should be allowed to make a CALL", async () => {
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATION_CALL,
        targetContract.address,
        0,
        targetContract.interface.encodeFunctionData("setName", ["Example"]),
      ]);

      console.log("accounts[0] (owner)", accounts[0].address);
      console.log("accounts[1] (app)", accounts[1].address);

      let executeResult = await proxyKeyManager.connect(app).execute(executePayload);
      expect(executeResult).toBeTruthy();
    });

    it("App should not be allowed to make a DELEGATECALL", async () => {
      let executePayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
        OPERATION_DELEGATECALL,
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
        OPERATION_DEPLOY,
        "0x0000000000000000000000000000000000000000",
        0,
        DUMMY_PAYLOAD,
      ]);

      await expect(proxyKeyManager.connect(app).execute(executePayload)).toBeRevertedWith(
        "KeyManager:_checkPermissions: not authorized to perform DEPLOY"
      );
    });
  });

  describe("> testing permission: TRANSFERVALUE", () => {
    let provider = ethers.provider;

    // it("Owner should be allowed to transfer ethers to app", async () => {
    //   let initialAccountBalance = await provider.getBalance(proxyLsp3Account.address);
    //   let initialAppBalance = await provider.getBalance(app.address);

    //   let transferPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
    //     OPERATION_CALL,
    //     app.address,
    //     ethers.utils.parseEther("3"),
    //     EMPTY_PAYLOAD,
    //   ]);

    //   let callResult = await proxyKeyManager.callStatic.execute(transferPayload);
    //   expect(callResult).toBeTruthy();

    //   await proxyKeyManager.execute(transferPayload, { gasLimit: 3_000_000 });

    //   let newAccountBalance = await provider.getBalance(proxyLsp3Account.address);
    //   expect(parseInt(newAccountBalance)).toBeLessThan(parseInt(initialAccountBalance));

    //   let newAppBalance = await provider.getBalance(app.address);
    //   expect(parseInt(newAppBalance)).toBeGreaterThan(parseInt(initialAppBalance));
    // });

    // it("App should not be allowed to transfer ethers", async () => {
    //   let initialAccountBalance = await provider.getBalance(proxyLsp3Account.address);
    //   let initialUserBalance = await provider.getBalance(user.address);
    //   // console.log("initialAccountBalance: ", initialAccountBalance)
    //   // console.log("initialUserBalance: ", initialUserBalance)

    //   let transferPayload = proxyLsp3Account.interface.encodeFunctionData("execute", [
    //     OPERATION_CALL,
    //     user.address,
    //     ethers.utils.parseEther("3"),
    //     EMPTY_PAYLOAD,
    //   ]);

    //   await expect(proxyKeyManager.connect(app).execute(transferPayload)).toBeRevertedWith(
    //     "KeyManager:_checkPermissions: Not authorized to transfer ethers"
    //   );

    //   //   let newAccountBalance = await provider.getBalance(proxyLsp3Account.address);
    //   //   let newUserBalance = await provider.getBalance(user.address);
    //   //   // console.log("newAccountBalance: ", newAccountBalance);
    //   //   // console.log("newUserBalance: ", newUserBalance);

    //   //   expect(initialAccountBalance.toString()).toBe(newAccountBalance.toString());
    //   //   expect(initialUserBalance.toString()).toBe(newUserBalance.toString());
    // });
  });
});
