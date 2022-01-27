import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomiclabs/hardhat-waffle";
import { ethers } from "hardhat";
import { encodeData, flattenEncodedData } from "@erc725/erc725.js";
import { solidityKeccak256 } from "ethers/lib/utils";

import {
  UniversalProfile,
  UniversalProfile__factory,
  KeyManagerHelper,
  KeyManagerHelper__factory,
  LSP6KeyManager,
  LSP6KeyManager__factory,
  TargetContract,
  TargetContract__factory,
  SignatureValidator,
  SignatureValidator__factory,
  Reentrancy,
  Reentrancy__factory,
} from "../../types";

// constants
import {
  ALL_PERMISSIONS_SET,
  PERMISSIONS,
  OPERATIONS,
  INTERFACE_IDS,
  BasicUPSetup_Schema,
  ERC725YKeys,
  ERC1271,
  SupportedStandards,
} from "../../constants";

// helpers
import {
  NotAuthorisedError,
  NotAllowedAddressError,
  NotAllowedFunctionError,
  NotAllowedERC725YKeyError,
  EMPTY_PAYLOAD,
  DUMMY_PAYLOAD,
  DUMMY_PRIVATEKEY,
  ONE_ETH,
  getRandomAddresses,
  generateKeysAndValues,
  RANDOM_BYTES32,
  getRandomString,
} from "../utils/helpers";
import { Signer } from "ethers";

describe("Testing KeyManager's internal functions (KeyManagerHelper)", () => {
  let abiCoder;
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress, app: SignerWithAddress, user: SignerWithAddress;

  let universalProfile: UniversalProfile, keyManagerHelper: KeyManagerHelper;

  let allowedAddresses;

  beforeAll(async () => {
    abiCoder = await ethers.utils.defaultAbiCoder;
    accounts = await ethers.getSigners();

    owner = accounts[0];
    app = accounts[1];
    user = accounts[2];

    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );
    keyManagerHelper = await new KeyManagerHelper__factory(owner).deploy(
      universalProfile.address
    );

    allowedAddresses = getRandomAddresses(2);

    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            owner.address.substr(2),
        ],
        [ALL_PERMISSIONS_SET]
      );

    let allowedFunctions = ["0xaabbccdd", "0x3fb5c1cb", "0xc47f0027"];

    await universalProfile.setData(
      [
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          owner.address.substr(2),
      ],
      [abiCoder.encode(["address[]"], [allowedAddresses])]
    );

    await universalProfile.setData(
      [
        ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          owner.address.substr(2),
      ],
      [abiCoder.encode(["bytes4[]"], [allowedFunctions])]
    );

    // app permissions
    let appPermissions = ethers.utils.hexZeroPad(
      PERMISSIONS.SETDATA + PERMISSIONS.CALL,
      32
    );
    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            app.address.substr(2),
        ],
        [appPermissions]
      );
  });

  it("Shows the interfaceId for LSP6", async () => {
    let lsp6InterfaceId = await keyManagerHelper.getInterfaceId();
    expect(lsp6InterfaceId).toEqual(INTERFACE_IDS.LSP6);
  });

  describe("Reading ERC725's account storage", () => {
    it("_getAllowedAddresses(...) - Should return list of owner's allowed addresses", async () => {
      let bytesResult = await keyManagerHelper.getAllowedAddresses(
        owner.address,
        {
          from: owner.address,
        }
      );
      let allowedOwnerAddresses = abiCoder.decode(["address[]"], bytesResult);
      let CheckSummedAllowedAddress = [
        await ethers.utils.getAddress(allowedAddresses[0]),
        await ethers.utils.getAddress(allowedAddresses[1]),
      ];
      expect(allowedOwnerAddresses).toEqual([CheckSummedAllowedAddress]);
    });

    it("_getAllowedAddresses(...) - Should return no addresses for app", async () => {
      let bytesResult = await keyManagerHelper.getAllowedAddresses(app.address);
      expect([bytesResult]).toEqual(["0x"]);

      let resultFromAccount = await universalProfile.getData([
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          app.address.substr(2),
      ]);
      expect(resultFromAccount).toEqual(["0x"]);
    });

    it("_getAllowedFunctions(...) - Should return list of owner's allowed functions", async () => {
      let bytesResult = await keyManagerHelper.callStatic.getAllowedFunctions(
        owner.address
      );
      let allowedOwnerFunctions = abiCoder.decode(["bytes4[]"], bytesResult);
      let allowedFunctions = ["0xaabbccdd", "0x3fb5c1cb", "0xc47f0027"];
      expect(allowedOwnerFunctions).toEqual([allowedFunctions]);

      let resultFromAccount = await universalProfile.getData([
        ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          owner.address.substr(2),
      ]);
      let decodedResultFromAccount = abiCoder.decode(
        ["bytes4[]"],
        resultFromAccount[0]
      );

      expect(decodedResultFromAccount).toEqual([allowedFunctions]);

      // also make sure that both functions from keyManager and from erc725 account return the same thing
      expect([bytesResult]).toEqual(resultFromAccount);
    });

    it("_getAllowedFunctions(...) - Should return no functions selectors for app.", async () => {
      let bytesResult = await keyManagerHelper.getAllowedFunctions(app.address);
      expect([bytesResult]).toEqual(["0x"]);

      let resultFromAccount = await universalProfile.getData([
        ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          app.address.substr(2),
      ]);
      expect(resultFromAccount).toEqual(["0x"]);
    });
  });

  describe("Reading User's permissions", () => {
    it("Should return 0xffff... for owner", async () => {
      expect(
        await keyManagerHelper.getAddressPermissions(owner.address)
      ).toEqual(ALL_PERMISSIONS_SET); // ALL_PERMISSIONS = "0xffff..."
    });

    it("Should return 0x....0c for app", async () => {
      expect(await keyManagerHelper.getAddressPermissions(app.address)).toEqual(
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32)
      );
    });
  });

  describe("Testing allowed permissions", () => {
    it("Should return true for operation setData", async () => {
      let appPermissions = await keyManagerHelper.getAddressPermissions(
        app.address
      );
      expect(
        await keyManagerHelper.hasPermission(
          ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
          appPermissions
        )
      ).toBeTruthy();
    });
  });

  describe("Testing allowed addresses / function", () => {
    it("_verifyAllowedAddress(...) - Should not revert for address listed in owner's allowed addresses list", async () => {
      await keyManagerHelper.verifyIfAllowedAddress(
        owner.address,
        allowedAddresses[0]
      );
    });

    it("_verifyAllowedAddress(...) - Should revert for address not listed in owner's allowed addresses list", async () => {
      let disallowedAddress = ethers.utils.getAddress(
        "0xdeadbeefdeadbeefdeaddeadbeefdeadbeefdead"
      );

      try {
        await keyManagerHelper.verifyIfAllowedAddress(
          owner.address,
          disallowedAddress
        );
      } catch (error) {
        expect(error.message).toMatch(
          NotAllowedAddressError(owner.address, disallowedAddress)
        );
      }
    });

    it("_verifyAllowedAddress(...) - Should not revert when user has no address listed (= all addresses whitelisted)", async () => {
      await keyManagerHelper.verifyIfAllowedAddress(user.address, app.address);
    });
  });
});

describe("KeyManager", () => {
  let abiCoder;
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress,
    app: SignerWithAddress,
    user: SignerWithAddress,
    externalApp: SignerWithAddress,
    newUser: SignerWithAddress;

  let universalProfile: UniversalProfile,
    keyManager: LSP6KeyManager,
    targetContract: TargetContract,
    maliciousContract: Reentrancy;

  let addressPermissions, allowedAddresses;

  beforeAll(async () => {
    abiCoder = await ethers.utils.defaultAbiCoder;
    accounts = await ethers.getSigners();

    owner = accounts[0];
    app = accounts[1];
    user = accounts[2];
    externalApp = new ethers.Wallet(DUMMY_PRIVATEKEY, ethers.provider);
    newUser = accounts[5];

    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );
    keyManager = await new LSP6KeyManager__factory(owner).deploy(
      universalProfile.address
    );
    targetContract = await new TargetContract__factory(owner).deploy();
    maliciousContract = await new Reentrancy__factory(accounts[6]).deploy(
      keyManager.address
    );

    allowedAddresses = getRandomAddresses(2);

    let appPermissions = ethers.utils.hexZeroPad(
      PERMISSIONS.SETDATA + PERMISSIONS.CALL,
      32
    );
    let userPermissions = ethers.utils.hexZeroPad(
      PERMISSIONS.SETDATA + PERMISSIONS.CALL,
      32
    );
    let externalAppPermissions = ethers.utils.hexZeroPad(
      PERMISSIONS.SETDATA + PERMISSIONS.CALL,
      32
    );
    let newUserPermissions = ethers.utils.hexZeroPad(
      PERMISSIONS.SETDATA + PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
      32
    );

    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            owner.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            app.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            user.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            externalApp.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newUser.address.substr(2),
        ],
        [
          ALL_PERMISSIONS_SET,
          appPermissions,
          userPermissions,
          externalAppPermissions,
          newUserPermissions,
        ]
      );

    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            app.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            externalApp.address.substr(2),
        ],
        [
          abiCoder.encode(
            ["address[]"],
            [[targetContract.address, user.address]]
          ),
          abiCoder.encode(
            ["address[]"],
            [[targetContract.address, user.address]]
          ),
        ]
      );

    // do not allow the app to `setNumber` on TargetContract
    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
            app.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
            externalApp.address.substr(2),
        ],
        [
          abiCoder.encode(
            ["bytes4[]"],
            [[targetContract.interface.getSighash("setName(string)")]]
          ),
          abiCoder.encode(
            ["bytes4[]"],
            [[targetContract.interface.getSighash("setName(string)")]]
          ),
        ]
      );

    // Set AddressPermissions array
    addressPermissions = [
      { key: ERC725YKeys.LSP6["AddressPermissions[]"], value: "0x05" },
      {
        key:
          ERC725YKeys.LSP6["AddressPermissions[]"].slice(0, 34) +
          "00000000000000000000000000000000",
        value: owner.address,
      },
      {
        key:
          ERC725YKeys.LSP6["AddressPermissions[]"].slice(0, 34) +
          "00000000000000000000000000000001",
        value: app.address,
      },
      {
        key:
          ERC725YKeys.LSP6["AddressPermissions[]"].slice(0, 34) +
          "00000000000000000000000000000002",
        value: user.address,
      },
      {
        key:
          ERC725YKeys.LSP6["AddressPermissions[]"].slice(0, 34) +
          "00000000000000000000000000000003",
        value: ethers.utils.getAddress(externalApp.address),
      },
      {
        key:
          ERC725YKeys.LSP6["AddressPermissions[]"].slice(0, 34) +
          "00000000000000000000000000000004",
        value: newUser.address,
      },
    ];

    addressPermissions.map(async (element) => {
      await universalProfile
        .connect(owner)
        .setData([element.key], [element.value]);
    });

    // switch account management to KeyManager
    await universalProfile.connect(owner).transferOwnership(keyManager.address);

    /** @todo find other way to ensure ERC725 Account has always 10 LYX before each test (and not transfer every time test is re-run) */
    await owner.sendTransaction({
      to: universalProfile.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  it("Should support LSP6", async () => {
    let result = await keyManager.callStatic.supportsInterface(
      INTERFACE_IDS.LSP6
    );
    expect(result).toBeTruthy();
  });

  describe("> Verifying permissions", () => {
    it("ensures owner is still universalProfile's admin (=all permissions)", async () => {
      let [permissions] = await universalProfile.getData([
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner.address.substr(2),
      ]);
      expect(permissions).toEqual(ALL_PERMISSIONS_SET);
    });

    it("App permission should be SETDATA + CALL ('0x...0c')", async () => {
      let [permissions] = await universalProfile.getData([
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          app.address.substr(2),
      ]);
      expect(permissions).toEqual(
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32)
      );
    });

    // check the array length
    it("Value should be 5 for key 'AddressPermissions[]'", async () => {
      let [result] = await universalProfile.getData([
        ERC725YKeys.LSP6["AddressPermissions[]"],
      ]);
      expect(result).toEqual(addressPermissions[0].value);
    });

    // check array indexes individually
    for (let ii = 1; ii <= 5; ii++) {
      it(`Checking address (=value) stored at AddressPermissions[${
        ii - 1
      }]'`, async () => {
        let [result] = await universalProfile.getData([
          addressPermissions[ii].key,
        ]);
        // raw bytes are stored lower case, so we need to checksum the address retrieved
        result = ethers.utils.getAddress(result);
        expect(result).toEqual(addressPermissions[ii].value);
      });
    }
  });

  describe("> testing permissions: CALL, DEPLOY, STATICCALL & DELEGATECALL", () => {
    it("Owner should be allowed to make a CALL", async () => {
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, allowedAddresses[0], 0, DUMMY_PAYLOAD]
      );

      let result = await keyManager.callStatic.execute(executePayload, {
        from: owner.address,
      });
      expect(result).toBeTruthy();
    });

    it("App should be allowed to make a CALL", async () => {
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContract.interface.encodeFunctionData("setName", ["Example"]),
        ]
      );

      let executeResult = await keyManager
        .connect(app)
        .callStatic.execute(executePayload);
      expect(executeResult).toBeTruthy();
    });

    it("App should not be allowed to make a STATICCALL", async () => {
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.STATICCALL,
          "0xcafecafecafecafecafecafecafecafecafecafe",
          0,
          DUMMY_PAYLOAD,
        ]
      );

      try {
        await keyManager.connect(app).execute(executePayload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(app.address, "STATICCALL")
        );
      }
    });

    it("DELEGATECALL via UP should be disallowed", async () => {
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.DELEGATECALL,
          "0xcafecafecafecafecafecafecafecafecafecafe",
          0,
          DUMMY_PAYLOAD,
        ]
      );

      await expect(
        keyManager.connect(owner).execute(executePayload)
      ).toBeRevertedWith(
        "_verifyCanExecute: operation 4 `DELEGATECALL` not supported"
      );
    });

    it("App should not be allowed to DEPLOY a contract", async () => {
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.CREATE,
          "0x0000000000000000000000000000000000000000",
          0,
          DUMMY_PAYLOAD,
        ]
      );

      try {
        await keyManager.connect(app).execute(executePayload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(app.address, "CREATE")
        );
      }
    });
  });

  describe("> testing permission: TRANSFERVALUE", () => {
    let provider = ethers.provider;

    it("Owner should be allowed to transfer LYX to app", async () => {
      let initialAccountBalance = await provider.getBalance(
        universalProfile.address
      );
      let initialAppBalance = await provider.getBalance(app.address);

      let transferPayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.CALL,
          app.address,
          ethers.utils.parseEther("3"),
          EMPTY_PAYLOAD,
        ]
      );

      let callResult = await keyManager.callStatic.execute(transferPayload);
      expect(callResult).toBeTruthy();

      await keyManager.execute(transferPayload);

      let newAccountBalance = await provider.getBalance(
        universalProfile.address
      );
      expect(parseInt(newAccountBalance)).toBeLessThan(
        parseInt(initialAccountBalance)
      );

      let newAppBalance = await provider.getBalance(app.address);
      expect(parseInt(newAppBalance)).toBeGreaterThan(
        parseInt(initialAppBalance)
      );
    });

    it("App should not be allowed to transfer LYX", async () => {
      let initialAccountBalance = await provider.getBalance(
        universalProfile.address
      );
      let initialUserBalance = await provider.getBalance(user.address);

      let transferPayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.CALL,
          user.address,
          ethers.utils.parseEther("3"),
          EMPTY_PAYLOAD,
        ]
      );

      try {
        await keyManager.connect(app).execute(transferPayload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(app.address, "TRANSFERVALUE")
        );
      }

      let newAccountBalance = await provider.getBalance(
        universalProfile.address
      );
      let newUserBalance = await provider.getBalance(user.address);

      expect(initialAccountBalance.toString()).toBe(
        newAccountBalance.toString()
      );
      expect(initialUserBalance.toString()).toBe(newUserBalance.toString());
    });
  });

  describe("> testing permissions: ALLOWEDADDRESSES", () => {
    it("All addresses whitelisted = Owner should be allowed to interact with any address", async () => {
      let payload = universalProfile.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        "0xcafecafecafecafecafecafecafecafecafecafe",
        0,
        DUMMY_PAYLOAD,
      ]);

      let result = await keyManager.callStatic.execute(payload);
      expect(result).toBeTruthy();

      let secondPayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.CALL,
          "0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd",
          0,
          DUMMY_PAYLOAD,
        ]
      );

      let secondResult = await keyManager.callStatic.execute(secondPayload);
      expect(secondResult).toBeTruthy();
    });

    it("App should be allowed to interact with `TargetContract`", async () => {
      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["Test"]
      );

      let keyManagerPayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      let result = await keyManager
        .connect(app)
        .callStatic.execute(keyManagerPayload);
      expect(result).toBeTruthy();
    });

    it("App should be allowed to interact with `user`", async () => {
      let payload = universalProfile.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        user.address,
        0,
        EMPTY_PAYLOAD,
      ]);

      let result = await keyManager.connect(app).callStatic.execute(payload);
      expect(result).toBeTruthy();
    });

    it("App should not be allowed to interact with `0xdeadbeef...` (not allowed address)", async () => {
      let disallowedAddress = ethers.utils.getAddress(
        "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
      );
      let payload = universalProfile.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        disallowedAddress,
        0,
        DUMMY_PAYLOAD,
      ]);

      try {
        await keyManager.connect(app).execute(payload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAllowedAddressError(app.address, disallowedAddress)
        );
      }
    });
  });

  describe("> testing permissions: ALLOWEDFUNCTIONS", () => {
    it("App should not be allowed to run a non-allowed function (function signature = `0xbeefbeef`)", async () => {
      let payload = universalProfile.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        "0xbeefbeef123456780000000000",
      ]);

      try {
        await keyManager.connect(app).execute(payload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAllowedFunctionError(app.address, "0xbeefbeef")
        );
      }
    });
  });

  describe("> testing: ALL ADDRESSES + FUNCTIONS whitelisted", () => {
    it("Should pass if no addresses / functions are stored for a user", async () => {
      let randomPayload = "0xfafbfcfd1201456875dd";
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.CALL,
          "0xcafecafecafecafecafecafecafecafecafecafe",
          0,
          randomPayload,
        ]
      );

      let callResult = await keyManager
        .connect(user)
        .callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();
    });
  });

  describe("> testing interactions with a TargetContract", () => {
    it("Owner should be allowed to set `name` variable", async () => {
      let initialName = await targetContract.callStatic.getName();
      let newName = "Updated Name";

      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [newName]
      );
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      let callResult = await keyManager
        .connect(owner)
        .callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await keyManager.connect(owner).execute(executePayload);
      let result = await targetContract.callStatic.getName();
      expect(result !== initialName);
      expect(result).toEqual(
        newName,
        `name variable in TargetContract should now be ${newName}`
      );
    });

    it("App should be allowed to set `name` variable", async () => {
      let initialName = await targetContract.callStatic.getName();
      let newName = "Updated Name";

      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [newName]
      );

      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      let callResult = await keyManager
        .connect(app)
        .callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await keyManager.connect(app).execute(executePayload);
      let result = await targetContract.callStatic.getName();
      expect(result !== initialName);
      expect(result).toEqual(newName);
    });

    it("Owner should be allowed to set `number` variable", async () => {
      let initialNumber = await targetContract.callStatic.getNumber();
      let newNumber = 18;

      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setNumber",
        [newNumber]
      );
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      let callResult = await keyManager
        .connect(owner)
        .callStatic.execute(executePayload);
      expect(callResult).toBeTruthy();

      await keyManager.connect(owner).execute(executePayload);
      let result = await targetContract.callStatic.getNumber();
      expect(
        parseInt(ethers.BigNumber.from(result).toNumber(), 10) !==
          ethers.BigNumber.from(initialNumber).toNumber()
      );
      expect(parseInt(ethers.BigNumber.from(result).toNumber(), 10)).toEqual(
        newNumber
      );
    });

    it("App should not be allowed to set `number` variable", async () => {
      let initialNumber = await targetContract.callStatic.getNumber();
      let newNumber = 18;

      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setNumber",
        [newNumber]
      );
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      try {
        await keyManager.connect(app).execute(executePayload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAllowedFunctionError(
            app.address,
            targetContract.interface.getSighash("setNumber")
          )
        );
      }

      let result = await targetContract.callStatic.getNumber();
      expect(
        parseInt(ethers.BigNumber.from(result).toNumber(), 10) !== newNumber
      );
      expect(parseInt(ethers.BigNumber.from(result).toNumber(), 10)).toEqual(
        ethers.BigNumber.from(initialNumber).toNumber()
      );
    });

    it("Should return `name` variable", async () => {
      let initialName = await targetContract.callStatic.getName();

      let targetContractPayload =
        targetContract.interface.encodeFunctionData("getName");
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      let result = await keyManager
        .connect(owner)
        .callStatic.execute(executePayload);

      let [decodedResult] = abiCoder.decode(["string"], result);
      expect(decodedResult).toEqual(initialName);
    });

    it("Should return `number` variable", async () => {
      let initialNumber = await targetContract.callStatic.getNumber();

      let targetContractPayload =
        targetContract.interface.encodeFunctionData("getNumber");
      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      let result = await keyManager
        .connect(owner)
        .callStatic.execute(executePayload);

      let [decodedResult] = abiCoder.decode(["uint256"], result);
      expect(decodedResult).toEqual(initialNumber);
    });
  });

  describe("> testing other revert causes", () => {
    it("Should revert because of wrong operation type", async () => {
      let payload = universalProfile.interface.encodeFunctionData("execute", [
        5648941657,
        targetContract.address,
        0,
        "0x",
      ]);

      await expect(keyManager.execute(payload)).toBeRevertedWith(
        "_extractPermissionFromOperation: invalid operation type"
      );
    });

    it("Should revert because calling an unexisting function in ERC725", async () => {
      await expect(
        keyManager.execute("0xbad000000000000000000000000bad")
      ).toBeRevertedWith("_verifyPermissions: unknown ERC725 selector");
    });

    it("Should revert with a revert reason string from TargetContract", async () => {
      let targetContractPayload =
        targetContract.interface.encodeFunctionData("revertCall");

      let payload = universalProfile.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetContractPayload,
      ]);

      await expect(keyManager.execute(payload)).toBeRevertedWith(
        "TargetContract:revertCall: this function has reverted!"
      );
    });
  });

  describe("> testing `executeRelay(...)`", () => {
    // Use channelId = 0 for sequential nonce
    let channelId = 0;

    it("Compare signature", async () => {
      let staticAddress = "0xcafecafecafecafecafecafecafecafecafecafe";
      let payload = `0x44c028fe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000009fbda871d559710256a2502a2517b794b482db40000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000064c47f00270000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000c416e6f74686572206e616d65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`;
      let nonce = 0;

      // right hashing method with etherjs
      let hash = solidityKeccak256(
        ["address", "uint256", "bytes"],
        [staticAddress, nonce, payload]
      );

      let signature = await externalApp.signMessage(
        ethers.utils.arrayify(hash)
      );

      expect(hash).toEqual(
        "0xb491e88483d56b1143c783cb4b60a85632f831e36147670bffc61bc57d7dad86"
      );
      // expect: 0xb491e88483d56b1143c783cb4b60a85632f831e36147670bffc61bc57d7dad86
      expect(signature).toEqual(
        "0x82544c08b894ebeb5c2beffd586e48860a39e11ea7e3bf9cf0c66062470b72695724b8a85902cb5433945cca7d0eeae2eef2265fac2e9e730ecd68df6dda9a181c"
      );
    });

    it("should execute a signed tx successfully", async () => {
      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["Another name"]
      );
      let nonce = await keyManager.callStatic.getNonce(
        externalApp.address,
        channelId
      );

      let executeRelayCallPayload =
        universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "uint256", "bytes"],
        [keyManager.address, nonce, executeRelayCallPayload]
      );

      let signature = await externalApp.signMessage(
        ethers.utils.arrayify(hash)
      );

      let result = await keyManager.callStatic.executeRelayCall(
        keyManager.address,
        nonce,
        executeRelayCallPayload,
        signature
      );
      expect(result).toBeTruthy();
    });

    it("Should allow to `setName` via `executeRelay`", async () => {
      let newName = "Dagobah";

      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [newName]
      );
      let nonce = await keyManager.callStatic.getNonce(
        externalApp.address,
        channelId
      );

      let executeRelayCallPayload =
        universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "uint256", "bytes"],
        [keyManager.address, nonce, executeRelayCallPayload]
      );

      let signature = await externalApp.signMessage(
        ethers.utils.arrayify(hash)
      );

      let result = await keyManager.callStatic.executeRelayCall(
        keyManager.address,
        nonce,
        executeRelayCallPayload,
        signature
      );
      expect(result).toBeTruthy();

      await keyManager.executeRelayCall(
        keyManager.address,
        nonce,
        executeRelayCallPayload,
        signature
      );
      let endResult = await targetContract.callStatic.getName();
      expect(endResult).toEqual(newName);
    });

    it("Should not allow to `setNumber` via `executeRelay`", async () => {
      let currentNumber = await targetContract.callStatic.getNumber();

      let nonce = await keyManager.callStatic.getNonce(
        externalApp.address,
        channelId
      );
      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setNumber",
        [2354]
      );

      let executeRelayCallPayload =
        universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "uint256", "bytes"],
        [keyManager.address, nonce, executeRelayCallPayload]
      );

      let signature = await externalApp.signMessage(
        ethers.utils.arrayify(hash)
      );

      try {
        await keyManager.executeRelayCall(
          keyManager.address,
          nonce,
          executeRelayCallPayload,
          signature
        );
      } catch (error) {
        expect(error.message).toMatch(
          NotAllowedFunctionError(
            externalApp.address,
            targetContract.interface.getSighash("setNumber")
          )
        );
      }

      let endResult = await targetContract.callStatic.getNumber();
      expect(endResult.toString()).toEqual(currentNumber.toString());
    });
  });

  describe("> testing sequential nonces (= channel 0)", () => {
    let channelId = 0;
    let latestNonce;

    beforeEach(async () => {
      latestNonce = await keyManager.callStatic.getNonce(
        externalApp.address,
        channelId
      );
    });

    it.each([
      { callNb: "First", newName: "Yamen", expectedNonce: latestNonce + 1 },
      { callNb: "Second", newName: "Nour", expectedNonce: latestNonce + 1 },
      { callNb: "Third", newName: "Huss", expectedNonce: latestNonce + 1 },
      { callNb: "Fourth", newName: "Moussa", expectedNonce: latestNonce + 1 },
    ])(
      "$callNb call > nonce should increment from $latestNonce to $expectedNonce",
      async ({ callNb, newName, expectedNonce }) => {
        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload =
          universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "uint256", "bytes"],
          [keyManager.address, latestNonce, executeRelayCallPayload]
        );

        let signature = await externalApp.signMessage(
          ethers.utils.arrayify(hash)
        );

        await keyManager.executeRelayCall(
          keyManager.address,
          latestNonce,
          executeRelayCallPayload,
          signature
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await keyManager.callStatic.getNonce(
          externalApp.address,
          0
        );

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(latestNonce.add(1)); // ensure the nonce incremented
      }
    );
  });

  describe("> testing multi-channel nonces (= channel n)", () => {
    let nonces = [0, 1];

    describe("channel 1", () => {
      let channelId = 1;
      let names = ["Fabian", "Yamen"];

      it(`First call > nonce should increment from ${nonces[0]} to ${
        nonces[0] + 1
      }`, async () => {
        let nonceBefore = await keyManager.getNonce(
          externalApp.address,
          channelId
        );
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload =
          universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "uint256", "bytes"],
          [keyManager.address, nonceBefore, executeRelayCallPayload]
        );

        let signature = await externalApp.signMessage(
          ethers.utils.arrayify(hash)
        );

        await keyManager.executeRelayCall(
          keyManager.address,
          nonceBefore,
          executeRelayCallPayload,
          signature
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await keyManager.callStatic.getNonce(
          externalApp.address,
          channelId
        );

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${
        nonces[1] + 1
      }`, async () => {
        let nonceBefore = await keyManager.getNonce(
          externalApp.address,
          channelId
        );
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload =
          universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "uint256", "bytes"],
          [keyManager.address, nonceBefore, executeRelayCallPayload]
        );

        let signature = await externalApp.signMessage(
          ethers.utils.arrayify(hash)
        );

        await keyManager.executeRelayCall(
          keyManager.address,
          nonceBefore,
          executeRelayCallPayload,
          signature
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await keyManager.callStatic.getNonce(
          externalApp.address,
          channelId
        );

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 2", () => {
      let channelId = 2;
      let names = ["Hugo", "Reto"];

      it(`First call > nonce should increment from ${nonces[0]} to ${
        nonces[0] + 1
      }`, async () => {
        let nonceBefore = await keyManager.getNonce(
          externalApp.address,
          channelId
        );
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload =
          universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "uint256", "bytes"],
          [keyManager.address, nonceBefore, executeRelayCallPayload]
        );

        let signature = await externalApp.signMessage(
          ethers.utils.arrayify(hash)
        );

        await keyManager.executeRelayCall(
          keyManager.address,
          nonceBefore,
          executeRelayCallPayload,
          signature
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await keyManager.callStatic.getNonce(
          externalApp.address,
          channelId
        );

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${
        nonces[1] + 1
      }`, async () => {
        let nonceBefore = await keyManager.getNonce(
          externalApp.address,
          channelId
        );
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload =
          universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "uint256", "bytes"],
          [keyManager.address, nonceBefore, executeRelayCallPayload]
        );

        let signature = await externalApp.signMessage(
          ethers.utils.arrayify(hash)
        );

        await keyManager.executeRelayCall(
          keyManager.address,
          nonceBefore,
          executeRelayCallPayload,
          signature
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await keyManager.callStatic.getNonce(
          externalApp.address,
          channelId
        );

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 3", () => {
      let channelId = 3;
      let names = ["Jean", "Lenny"];

      it(`First call > nonce should increment from ${nonces[0]} to ${
        nonces[0] + 1
      }`, async () => {
        let nonceBefore = await keyManager.getNonce(
          externalApp.address,
          channelId
        );
        let newName = names[0];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload =
          universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "uint256", "bytes"],
          [keyManager.address, nonceBefore, executeRelayCallPayload]
        );

        let signature = await externalApp.signMessage(
          ethers.utils.arrayify(hash)
        );

        await keyManager.executeRelayCall(
          keyManager.address,
          nonceBefore,
          executeRelayCallPayload,
          signature
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await keyManager.callStatic.getNonce(
          externalApp.address,
          channelId
        );

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });

      it(`Second call > nonce should increment from ${nonces[1]} to ${
        nonces[1] + 1
      }`, async () => {
        let nonceBefore = await keyManager.getNonce(
          externalApp.address,
          channelId
        );
        let newName = names[1];

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload =
          universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "uint256", "bytes"],
          [keyManager.address, nonceBefore, executeRelayCallPayload]
        );

        let signature = await externalApp.signMessage(
          ethers.utils.arrayify(hash)
        );

        await keyManager.executeRelayCall(
          keyManager.address,
          nonceBefore,
          executeRelayCallPayload,
          signature
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await keyManager.callStatic.getNonce(
          externalApp.address,
          channelId
        );

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });

    describe("channel 15", () => {
      let channelId = 15;
      it("First call > nonce should increment from 0 to 1", async () => {
        let nonceBefore = await keyManager.getNonce(
          externalApp.address,
          channelId
        );
        let newName = "Lukasz";

        let targetContractPayload = targetContract.interface.encodeFunctionData(
          "setName",
          [newName]
        );
        let executeRelayCallPayload =
          universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            targetContract.address,
            0,
            targetContractPayload,
          ]);

        let hash = ethers.utils.solidityKeccak256(
          ["address", "uint256", "bytes"],
          [keyManager.address, nonceBefore, executeRelayCallPayload]
        );

        let signature = await externalApp.signMessage(
          ethers.utils.arrayify(hash)
        );

        await keyManager.executeRelayCall(
          keyManager.address,
          nonceBefore,
          executeRelayCallPayload,
          signature
        );

        let fetchedName = await targetContract.callStatic.getName();
        let nonceAfter = await keyManager.callStatic.getNonce(
          externalApp.address,
          channelId
        );

        expect(fetchedName).toEqual(newName);
        expect(nonceAfter).toEqBN(nonceBefore.add(1)); // ensure the nonce incremented
      });
    });
  });

  describe("> testing Security", () => {
    let provider = ethers.provider;
    let channelId = 0;

    it("Should revert because caller has no permissions set", async () => {
      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["New Contract Name"]
      );

      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      await expect(
        keyManager.connect(accounts[6]).execute(executePayload)
      ).toBeRevertedWith(
        "LSP6Utils:getPermissionsFor: no permissions set for this address"
      );
    });

    it("Should revert if STATICCALL tries to change state", async () => {
      let initialValue = targetContract.callStatic.getName();
      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["Another Contract Name"]
      );

      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATIONS.STATICCALL,
          targetContract.address,
          0,
          targetContractPayload,
        ]
      );

      await expect(
        keyManager.connect(owner).execute(executePayload)
      ).toBeReverted();

      let newValue = targetContract.callStatic.getName();

      // ensure state hasn't changed.
      expect(initialValue).toEqual(newValue);
    });

    it("Permissions should prevent ReEntrancy and stop contract from re-calling and re-transfering ETH.", async () => {
      // we assume the owner is not aware that some malicious code is present at the recipient address (the recipient being a smart contract)
      // the owner simply aims to transfer 1 ether from his ERC725 Account to the recipient address (= the malicious contract)
      let transferPayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, maliciousContract.address, ONE_ETH, EMPTY_PAYLOAD]
      );

      let executePayload = keyManager.interface.encodeFunctionData("execute", [
        transferPayload,
      ]);
      // load the malicious payload, that will be executed in the fallback function (every time the contract receives LYX)
      await maliciousContract.loadPayload(executePayload);

      let initialAccountBalance = await provider.getBalance(
        universalProfile.address
      );
      let initialAttackerBalance = await provider.getBalance(
        maliciousContract.address
      );

      // try to drain funds via ReEntrancy
      await keyManager.connect(owner).execute(transferPayload);

      let newAccountBalance = await provider.getBalance(
        universalProfile.address
      );
      let newAttackerBalance = await provider.getBalance(
        maliciousContract.address
      );

      expect(parseInt(newAccountBalance.toString())).toEqual(
        initialAccountBalance.toString() - ONE_ETH.toString()
      );
      expect(parseInt(newAttackerBalance.toString())).toEqual(
        parseInt(ONE_ETH.toString())
      );
    });

    it("Replay Attack should fail because of invalid nonce", async () => {
      let nonce = await keyManager.callStatic.getNonce(
        newUser.address,
        channelId
      );

      let executeRelayCallPayload =
        universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          maliciousContract.address,
          ONE_ETH,
          DUMMY_PAYLOAD,
        ]);

      let hash = ethers.utils.solidityKeccak256(
        ["address", "uint256", "bytes"],
        [keyManager.address, nonce, executeRelayCallPayload]
      );

      let signature = await newUser.signMessage(ethers.utils.arrayify(hash));

      // first call
      let result = await keyManager.callStatic.executeRelayCall(
        keyManager.address,
        nonce,
        executeRelayCallPayload,
        signature
      );
      expect(result).toBeTruthy();

      await keyManager.executeRelayCall(
        keyManager.address,
        nonce,
        executeRelayCallPayload,
        signature
      );

      // 2nd call = replay attack
      await expect(
        keyManager.executeRelayCall(
          executeRelayCallPayload,
          keyManager.address,
          nonce,
          signature
        )
      ).toBeRevertedWith("KeyManager:executeRelayCall: Invalid nonce");
    });
  });
});

describe("SETDATA", () => {
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress,
    canSetData: SignerWithAddress,
    cannotSetData: SignerWithAddress;

  let universalProfile: UniversalProfile, keyManager: LSP6KeyManager;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    owner = accounts[0];
    canSetData = accounts[1];
    cannotSetData = accounts[2];

    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );
    keyManager = await new LSP6KeyManager__factory(owner).deploy(
      universalProfile.address
    );

    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            owner.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            canSetData.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            cannotSetData.address.substr(2),
        ],
        [
          ALL_PERMISSIONS_SET,
          ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.CALL, 32),
          ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
        ]
      );

    await universalProfile.connect(owner).transferOwnership(keyManager.address);
  });

  describe("when setting one key", () => {
    describe("For UP owner", () => {
      it("should pass", async () => {
        let key = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("My First Key")
        );
        let value = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("Hello Lukso!")
        );

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          [key],
          [value],
        ]);

        await keyManager.connect(owner).execute(payload);
        let [fetchedResult] = await universalProfile.callStatic.getData([key]);
        expect(fetchedResult).toEqual(value);
      });
    });

    describe("For address that has permission SETDATA", () => {
      it("should pass", async () => {
        let key = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("My First Key")
        );
        let value = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("Hello Lukso!")
        );

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          [key],
          [value],
        ]);

        await keyManager.connect(canSetData).execute(payload);
        let [fetchedResult] = await universalProfile.callStatic.getData([key]);
        expect(fetchedResult).toEqual(value);
      });
    });

    describe("For address that doesn't have permission SETDATA", () => {
      it("should not allow", async () => {
        let key = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("My First Key")
        );
        let value = ethers.utils.hexlify(
          ethers.utils.toUtf8Bytes("Hello Lukso!")
        );

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          [key],
          [value],
        ]);

        try {
          await keyManager.connect(cannotSetData).execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(cannotSetData.address, "SETDATA")
          );
        }
      });
    });
  });

  describe("when setting multiple keys", () => {
    describe("For UP owner", () => {
      it("(should pass): adding 5 singleton keys", async () => {
        let elements = {
          MyFirstKey: "aaaaaaaaaa",
          MySecondKey: "bbbbbbbbbb",
          MyThirdKey: "cccccccccc",
          MyFourthKey: "dddddddddd",
          MyFifthKey: "eeeeeeeeee",
        };

        let [keys, values] = generateKeysAndValues(elements);

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        await keyManager.connect(owner).execute(payload);
        let fetchedResult = await universalProfile.callStatic.getData(keys);
        expect(fetchedResult).toEqual(
          Object.values(elements).map((value) =>
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes(value))
          )
        );
      });

      it("(should pass): adding 10 LSP3IssuedAssets", async () => {
        let lsp3IssuedAssets = getRandomAddresses(10);

        const data = { "LSP3IssuedAssets[]": lsp3IssuedAssets };

        const encodedData = encodeData(data, BasicUPSetup_Schema);
        const flattenedEncodedData = flattenEncodedData(encodedData);

        let keys = [];
        let values = [];

        flattenedEncodedData.map((data) => {
          keys.push(data.key);
          values.push(data.value);
        });

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        await keyManager.connect(owner).execute(payload);
        let fetchedResult = await universalProfile.callStatic.getData(keys);
        expect(fetchedResult).toEqual(values);
      });

      it("(should pass): setup a basic Universal Profile (`LSP3Profile`, `LSP3IssuedAssets[]` and `LSP1UniversalReceiverDelegate`)", async () => {
        const basicUPSetup = {
          LSP3Profile: {
            hashFunction: "keccak256(utf8)",
            hash: "0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361",
            url: "ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx",
          },
          "LSP3IssuedAssets[]": [
            "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
            "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
          ],
          LSP1UniversalReceiverDelegate:
            "0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb",
        };

        let encodedData = encodeData(basicUPSetup, BasicUPSetup_Schema);
        let flattenedEncodedData = flattenEncodedData(encodedData);

        let keys = [];
        let values = [];

        flattenedEncodedData.map((data) => {
          keys.push(data.key);
          values.push(data.value);
        });

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        await keyManager.connect(owner).execute(payload);
        let fetchedResult = await universalProfile.callStatic.getData(keys);
        expect(fetchedResult).toEqual(values);
      });
    });

    describe("For address that has permission SETDATA", () => {
      it("(should pass): adding 5 singleton keys", async () => {
        // prettier-ignore
        let elements = {
                          "MyFirstKey": "aaaaaaaaaa",
                          "MySecondKey": "bbbbbbbbbb",
                          "MyThirdKey": "cccccccccc",
                          "MyFourthKey": "dddddddddd",
                          "MyFifthKey": "eeeeeeeeee",
                        };

        let [keys, values] = generateKeysAndValues(elements);

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        await keyManager.connect(canSetData).execute(payload);
        let fetchedResult = await universalProfile.callStatic.getData(keys);
        expect(fetchedResult).toEqual(
          Object.values(elements).map((value) =>
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes(value))
          )
        );
      });

      it("(should pass): adding 10 LSP3IssuedAssets", async () => {
        let lsp3IssuedAssets = getRandomAddresses(10);

        const data = { "LSP3IssuedAssets[]": lsp3IssuedAssets };

        const encodedData = encodeData(data, BasicUPSetup_Schema);
        const flattenedEncodedData = flattenEncodedData(encodedData);

        let keys = [];
        let values = [];

        flattenedEncodedData.map((data) => {
          keys.push(data.key);
          values.push(data.value);
        });

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        await keyManager.connect(canSetData).execute(payload);
        let fetchedResult = await universalProfile.callStatic.getData(keys);
        expect(fetchedResult).toEqual(values);
      });

      it("(should pass): setup a basic Universal Profile (`LSP3Profile`, `LSP3IssuedAssets[]` and `LSP1UniversalReceiverDelegate`)", async () => {
        const basicUPSetup = {
          LSP3Profile: {
            hashFunction: "keccak256(utf8)",
            hash: "0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361",
            url: "ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx",
          },
          "LSP3IssuedAssets[]": [
            "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
            "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
          ],
          LSP1UniversalReceiverDelegate:
            "0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb",
        };

        let encodedData = encodeData(basicUPSetup, BasicUPSetup_Schema);
        let flattenedEncodedData = flattenEncodedData(encodedData);

        let keys = [];
        let values = [];

        flattenedEncodedData.map((data) => {
          keys.push(data.key);
          values.push(data.value);
        });

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        await keyManager.connect(canSetData).execute(payload);
        let fetchedResult = await universalProfile.callStatic.getData(keys);
        expect(fetchedResult).toEqual(values);
      });
    });

    describe("For address that doesn't have permission SETDATA", () => {
      it("(should fail): adding 5 singleton keys", async () => {
        let elements = {
          MyFirstKey: "aaaaaaaaaa",
          MySecondKey: "bbbbbbbbbb",
          MyThirdKey: "cccccccccc",
          MyFourthKey: "dddddddddd",
          MyFifthKey: "eeeeeeeeee",
        };

        let [keys, values] = generateKeysAndValues(elements);

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        try {
          await keyManager.connect(cannotSetData).execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(cannotSetData.address, "SETDATA")
          );
        }
      });

      it("(should fail): adding 10 LSP3IssuedAssets", async () => {
        let lsp3IssuedAssets = getRandomAddresses(10);

        const data = { "LSP3IssuedAssets[]": lsp3IssuedAssets };

        const encodedData = encodeData(data, BasicUPSetup_Schema);
        const flattenedEncodedData = flattenEncodedData(encodedData);

        let keys = [];
        let values = [];

        flattenedEncodedData.map((data) => {
          keys.push(data.key);
          values.push(data.value);
        });

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        try {
          await keyManager.connect(cannotSetData).execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(cannotSetData.address, "SETDATA")
          );
        }
      });

      it("(should fail): setup a basic Universal Profile (`LSP3Profile`, `LSP3IssuedAssets[]` and `LSP1UniversalReceiverDelegate`)", async () => {
        const basicUPSetup = {
          LSP3Profile: {
            hashFunction: "keccak256(utf8)",
            hash: "0x820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361",
            url: "ifps://QmYr1VJLwerg6pEoscdhVGugo39pa6rycEZLjtRPDfW84UAx",
          },
          "LSP3IssuedAssets[]": [
            "0xD94353D9B005B3c0A9Da169b768a31C57844e490",
            "0xDaea594E385Fc724449E3118B2Db7E86dFBa1826",
          ],
          LSP1UniversalReceiverDelegate:
            "0x1183790f29BE3cDfD0A102862fEA1a4a30b3AdAb",
        };

        let encodedData = encodeData(basicUPSetup, BasicUPSetup_Schema);
        let flattenedEncodedData = flattenEncodedData(encodedData);

        let keys = [];
        let values = [];

        flattenedEncodedData.map((data) => {
          keys.push(data.key);
          values.push(data.value);
        });

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          keys,
          values,
        ]);

        try {
          await keyManager.connect(cannotSetData).execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(cannotSetData.address, "SETDATA")
          );
        }
      });
    });
  });
});

describe("CHANGE / ADD PERMISSIONS", () => {
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress,
    canOnlyAddPermissions: SignerWithAddress,
    canOnlyChangePermissions: SignerWithAddress,
    bob: SignerWithAddress,
    zeroBytes: SignerWithAddress;

  let universalProfile: UniversalProfile, keyManager: LSP6KeyManager;

  beforeAll(async () => {
    accounts = await ethers.getSigners();

    owner = accounts[0];
    canOnlyAddPermissions = accounts[1];
    canOnlyChangePermissions = accounts[2];
    bob = accounts[3];
    zeroBytes = accounts[4];

    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );
    keyManager = await new LSP6KeyManager__factory(owner).deploy(
      universalProfile.address
    );

    await universalProfile.connect(owner).setData(
      [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddPermissions.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyChangePermissions.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          zeroBytes.address.substr(2),
      ],
      [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.ADDPERMISSIONS, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.CHANGEPERMISSIONS, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32), // example to test changing bob's permissions
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ]
    );

    await universalProfile.connect(owner).transferOwnership(keyManager.address);
  });

  describe("When setting one permission key", () => {
    describe("From UP owner", () => {
      it("should be allowed to add permissions", async () => {
        let newControllerKey = new ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKey.address.substr(2);

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          [key],
          [PERMISSIONS.SETDATA],
        ]);

        await keyManager.connect(owner).execute(payload);
        let [fetchedResult] = await universalProfile.callStatic.getData([key]);
        expect(fetchedResult).toEqual(
          ethers.utils.hexZeroPad(PERMISSIONS.SETDATA)
        );
      });
      it("should be allowed to change permissions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substr(2);

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          [key],
          [PERMISSIONS.SETDATA],
        ]);

        await keyManager.connect(owner).execute(payload);
        let [fetchedResult] = await universalProfile.callStatic.getData([key]);
        expect(fetchedResult).toEqual(
          ethers.utils.hexZeroPad(PERMISSIONS.SETDATA)
        );
      });
    });

    describe("From an address that has permission ADDPERMISSIONS", () => {
      it("should be allowed to add permissions", async () => {
        let newAddress = new ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newAddress.address.substr(2);

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          [key],
          [PERMISSIONS.SETDATA],
        ]);

        await keyManager.connect(canOnlyAddPermissions).execute(payload);
        let [fetchedResult] = await universalProfile.callStatic.getData([key]);
        expect(fetchedResult).toEqual(
          ethers.utils.hexZeroPad(PERMISSIONS.SETDATA)
        );
      });
      it("should not be allowed to change permissions", async () => {
        // trying to set all permissions for itself
        let maliciousPayload = universalProfile.interface.encodeFunctionData(
          "setData",
          [
            [
              ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
                canOnlyAddPermissions.address.substr(2),
            ],
            [ALL_PERMISSIONS_SET],
          ]
        );

        try {
          await keyManager
            .connect(canOnlyAddPermissions)
            .execute(maliciousPayload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(
              canOnlyAddPermissions.address,
              "CHANGEPERMISSIONS"
            )
          );
        }
      });
    });

    describe("From an address that has permission CHANGEPERMISSIONS", () => {
      it("should not be allowed to add permissions", async () => {
        // trying to grant full access of the UP to a newly created controller key
        // (so to then gain full control via `maliciousControllerKey`)
        let maliciousControllerKey = new ethers.Wallet.createRandom();

        let maliciousPayload =
          await universalProfile.interface.encodeFunctionData("setData", [
            [
              ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
                maliciousControllerKey.address.substr(2),
            ],
            [ALL_PERMISSIONS_SET],
          ]);

        try {
          await keyManager
            .connect(canOnlyChangePermissions)
            .execute(maliciousPayload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(
              canOnlyChangePermissions.address,
              "ADDPERMISSIONS"
            )
          );
        }
      });

      it("should be allowed to change permissions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substr(2);
        let value = ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.CALL,
          32
        );

        let payload = universalProfile.interface.encodeFunctionData("setData", [
          [key],
          [value],
        ]);

        await keyManager.connect(canOnlyChangePermissions).execute(payload);
        let [fetchedResult] = await universalProfile.callStatic.getData([key]);
        expect(fetchedResult).toEqual(value);
      });

      it("should not be allowed to add permissions for an address that has 32 x 0 bytes (0x0000...0000) as permission value", async () => {
        let payload = universalProfile.interface.encodeFunctionData("setData", [
          [
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              zeroBytes.address.substr(2),
          ],
          [ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32)],
        ]);

        try {
          await keyManager.connect(canOnlyChangePermissions).execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(
              canOnlyChangePermissions.address,
              "ADDPERMISSIONS"
            )
          );
        }
      });

      it;
    });
  });
});

describe("setting mixed keys (SETDATA + CHANGE / ADD PERMISSIONS)", () => {
  let accounts: SignerWithAddress[] = [];
  let owner: SignerWithAddress,
    canSetDataAndAddPermissions: SignerWithAddress,
    canSetDataAndChangePermissions: SignerWithAddress,
    canSetDataOnly: SignerWithAddress;

  // address to change permissions to
  let alice: SignerWithAddress, bob: SignerWithAddress;

  let universalProfile: UniversalProfile, keyManager: LSP6KeyManager;

  beforeEach(async () => {
    accounts = await ethers.getSigners();

    owner = accounts[0];
    canSetDataAndAddPermissions = accounts[1];
    canSetDataAndChangePermissions = accounts[2];
    canSetDataOnly = accounts[3];

    alice = accounts[4];
    bob = accounts[5];

    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );
    keyManager = await new LSP6KeyManager__factory(owner).deploy(
      universalProfile.address
    );

    await universalProfile.connect(owner).setData(
      [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canSetDataAndAddPermissions.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canSetDataAndChangePermissions.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canSetDataOnly.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substr(2),
      ],
      [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.ADDPERMISSIONS,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.CHANGEPERMISSIONS,
          32
        ),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32), // example to test changing Alice permissions
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32), // example to test changing Bob permissions
      ]
    );

    await universalProfile.connect(owner).transferOwnership(keyManager.address);
  });

  describe("From UP owner", () => {
    it("(should pass): 2 x keys + add 2 x new permissions", async () => {
      let newControllerKeyOne = new ethers.Wallet.createRandom();
      let newControllerKeyTwo = new ethers.Wallet.createRandom();

      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyOne.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyTwo.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      await keyManager.connect(owner).execute(payload);
      let fetchedResult = await universalProfile.getData(keys);
      expect(fetchedResult).toEqual(values);
    });

    it("(should pass): 2 x keys + change 2 x existing permissions", async () => {
      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      await keyManager.connect(owner).execute(payload);
      let fetchedResult = await universalProfile.getData(keys);
      expect(fetchedResult).toEqual(values);
    });

    it("(should pass): 2 x keys + (add 1 x new permission) + (change 1 x existing permission)", async () => {
      let newControllerKeyOne = new ethers.Wallet.createRandom();

      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyOne.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(PERMISSIONS.SIGN, 32),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      await keyManager.connect(owner).execute(payload);
      let fetchedResult = await universalProfile.getData(keys);
      expect(fetchedResult).toEqual(values);
    });
  });

  describe("From address that has permission ADDPERMISSIONS", () => {
    it("(should pass): 2 x keys + add 2 x new permissions", async () => {
      let newControllerKeyOne = new ethers.Wallet.createRandom();
      let newControllerKeyTwo = new ethers.Wallet.createRandom();

      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyOne.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyTwo.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      await keyManager.connect(canSetDataAndAddPermissions).execute(payload);
      let fetchedResult = await universalProfile.getData(keys);
      expect(fetchedResult).toEqual(values);
    });

    it("(should fail): 2 x keys + change 2 x existing permissions", async () => {
      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      try {
        await keyManager.connect(canSetDataAndAddPermissions).execute(payload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(
            canSetDataAndAddPermissions.address,
            "CHANGEPERMISSIONS"
          )
        );
      }
    });

    it("(should fail): 2 x keys + (add 1 x new permission) + (change 1 x existing permission)", async () => {
      let newControllerKeyOne = new ethers.Wallet.createRandom();

      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyOne.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(PERMISSIONS.SIGN, 32),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      try {
        await keyManager.connect(canSetDataAndAddPermissions).execute(payload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(
            canSetDataAndAddPermissions.address,
            "CHANGEPERMISSIONS"
          )
        );
      }
    });
  });

  describe("From address that has permission CHANGEPERMISSIONS", () => {
    it("(should fail): 2 x keys + add 2 x new permissions", async () => {
      let newControllerKeyOne = new ethers.Wallet.createRandom();
      let newControllerKeyTwo = new ethers.Wallet.createRandom();

      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyOne.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyTwo.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      try {
        await keyManager.connect(canSetDataAndAddPermissions).execute(payload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(
            canSetDataAndAddPermissions.address,
            "ADDPERMISSIONS"
          )
        );
      }
    });

    it("(should pass): 2 x keys + change 2 x existing permissions", async () => {
      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          bob.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      await keyManager.connect(canSetDataAndChangePermissions).execute(payload);
      let fetchedResult = await universalProfile.getData(keys);
      expect(fetchedResult).toEqual(values);
    });

    it("(should fail): 2 x keys + (add 1 x new permission) + (change 1 x existing permission)", async () => {
      let newControllerKeyOne = new ethers.Wallet.createRandom();

      let keys = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My SecondKey Key")),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          newControllerKeyOne.address.substr(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          alice.address.substr(2),
      ];

      let values = [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
        ethers.utils.hexZeroPad(PERMISSIONS.SIGN, 32),
        ethers.utils.hexZeroPad(
          PERMISSIONS.SETDATA + PERMISSIONS.TRANSFERVALUE,
          32
        ),
      ];

      let payload = universalProfile.interface.encodeFunctionData("setData", [
        keys,
        values,
      ]);

      try {
        await keyManager.connect(canSetDataAndAddPermissions).execute(payload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(
            canSetDataAndAddPermissions.address,
            "CHANGEPERMISSIONS"
          )
        );
      }
    });
  });
});

describe("Testing permissions of multiple empty bytes length", () => {
  let abiCoder;
  let accounts: SignerWithAddress[] = [];

  let owner: SignerWithAddress,
    moreThan32EmptyBytes: SignerWithAddress,
    lessThan32EmptyBytes: SignerWithAddress,
    oneEmptyByte: SignerWithAddress;

  let universalProfile: UniversalProfile, keyManagerHelper: KeyManagerHelper;

  beforeAll(async () => {
    abiCoder = await ethers.utils.defaultAbiCoder;
    accounts = await ethers.getSigners();

    owner = accounts[0];
    moreThan32EmptyBytes = accounts[1];
    lessThan32EmptyBytes = accounts[2];
    oneEmptyByte = accounts[3];

    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );

    keyManagerHelper = await new KeyManagerHelper__factory(owner).deploy(
      universalProfile.address
    );

    await universalProfile
      .connect(owner)
      .setData(
        [
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            owner.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            moreThan32EmptyBytes.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            lessThan32EmptyBytes.address.substr(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            oneEmptyByte.address.substr(2),
        ],
        [
          ALL_PERMISSIONS_SET,
          "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
          "0x000000000000000000000000000000",
          "0x00",
        ]
      );

    await universalProfile
      .connect(owner)
      .transferOwnership(keyManagerHelper.address);
  });

  describe("reading permissions", () => {
    it("should revert when reading permissions stored as more than 32 empty bytes", async () => {
      await expect(
        keyManagerHelper.getAddressPermissions(moreThan32EmptyBytes.address)
      ).toBeRevertedWith(
        "LSP6Utils:getPermissionsFor: no permissions set for this address"
      );
    });

    it("should revert when reading permissions stored as less than 32 empty bytes", async () => {
      await expect(
        keyManagerHelper.getAddressPermissions(lessThan32EmptyBytes.address)
      ).toBeRevertedWith(
        "LSP6Utils:getPermissionsFor: no permissions set for this address"
      );
    });

    it("should revert when reading permissions stored as one empty byte", async () => {
      await expect(
        keyManagerHelper.getAddressPermissions(oneEmptyByte.address)
      ).toBeRevertedWith(
        "LSP6Utils:getPermissionsFor: no permissions set for this address"
      );
    });
  });
});

describe("ALLOWEDSTANDARDS", () => {
  let provider = ethers.provider;
  let abiCoder;

  let accounts: SignerWithAddress[] = [];
  let owner: SignerWithAddress,
    caller: SignerWithAddress,
    callerTwo: SignerWithAddress;

  let universalProfile: UniversalProfile,
    keyManager: LSP6KeyManager,
    targetContract: TargetContract,
    SignatureValidator: SignatureValidator;

  let otherUniversalProfile: UniversalProfile;

  beforeAll(async () => {
    abiCoder = await ethers.utils.defaultAbiCoder;
    accounts = await ethers.getSigners();

    owner = accounts[0];
    caller = accounts[1];
    callerTwo = accounts[2];

    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );
    keyManager = await new LSP6KeyManager__factory(owner).deploy(
      universalProfile.address
    );
    targetContract = await new TargetContract__factory(owner).deploy();
    SignatureValidator = await new SignatureValidator__factory(owner).deploy();

    // test to interact with an other UniversalProfile (e.g.: transfer LYX)
    otherUniversalProfile = await new UniversalProfile__factory(
      accounts[3]
    ).deploy(accounts[3].address);

    await universalProfile.connect(owner).setData(
      [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          caller.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          callerTwo.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          caller.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          callerTwo.address.substring(2),
      ],
      [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        abiCoder.encode(["bytes4[]"], [[INTERFACE_IDS.ERC1271]]),
        abiCoder.encode(["bytes4[]"], [[INTERFACE_IDS.LSP7]]), // callerTwo
      ]
    );

    await universalProfile.transferOwnership(keyManager.address, {
      from: owner.address,
    });

    // fund the UP with some LYX to test transfer LYX to an other UP
    await owner.sendTransaction({
      to: universalProfile.address,
      value: ethers.utils.parseEther("10"),
    });
  });

  describe("when caller has no value set for ALLOWEDSTANDARDS (= all interfaces whitelisted)", () => {
    it("should allow to interact with contract that does not implement any interface", async () => {
      let newName = "Some Name";
      let targetPayload = targetContract.interface.encodeFunctionData(
        "setName",
        [newName]
      );

      let upPayload = universalProfile.interface.encodeFunctionData("execute", [
        OPERATIONS.CALL,
        targetContract.address,
        0,
        targetPayload,
      ]);

      await keyManager.connect(owner).execute(upPayload);
      let result = await targetContract.callStatic.getName();

      expect(result).toEqual(newName);
    });

    describe("should allow to interact with a contract that implement (+ register) any interface", () => {
      it("ERC1271", async () => {
        let sampleHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("Sample Message")
        );
        let sampleSignature = await owner.signMessage("Sample Message");

        let payload = SignatureValidator.interface.encodeFunctionData(
          "isValidSignature",
          [sampleHash, sampleSignature]
        );

        let upPayload = universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, SignatureValidator.address, 0, payload]
        );

        let data = await keyManager
          .connect(owner)
          .callStatic.execute(upPayload);
        let [result] = abiCoder.decode(["bytes4"], data);
        expect(result).toEqual(ERC1271.MAGIC_VALUE);
      });

      it("LSP0 (ERC725Account", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Key"));
        let value = "0xcafecafecafecafe";

        let setDataPayload = universalProfile.interface.encodeFunctionData(
          "setData",
          [[key], [value]]
        );

        await keyManager.connect(owner).execute(setDataPayload);

        let [result] = await universalProfile.callStatic.getData([key]);
        expect(result).toEqual(value);
      });
    });
  });

  describe("when caller has only ERC1271 interface ID set for ALLOWED STANDARDS", () => {
    it("output `caller` value stored for `AddressPermissions:AllowedStandards` key in ERC725Y key-value store", async () => {
      let result = await universalProfile.getData([
        ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          caller.address.substring(2),
      ]);
    });

    describe("when interacting with a contract that implements + register ERC1271 interface", () => {
      it("should pass", async () => {
        let sampleHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("Sample Message")
        );
        let sampleSignature = await caller.signMessage("Sample Message");

        let payload = SignatureValidator.interface.encodeFunctionData(
          "isValidSignature",
          [sampleHash, sampleSignature]
        );

        let upPayload = universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, SignatureValidator.address, 0, payload]
        );

        let data = await keyManager
          .connect(caller)
          .callStatic.execute(upPayload);
        let [result] = abiCoder.decode(["bytes4"], data);
        expect(result).toEqual(ERC1271.MAGIC_VALUE);
      });
    });

    describe("when trying to interact an ERC725Account (LSP0)", () => {
      it("should allow to transfer LYX", async () => {
        let initialAccountBalance = await provider.getBalance(
          otherUniversalProfile.address
        );

        let transferLyxPayload =
          otherUniversalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            otherUniversalProfile.address,
            ethers.utils.parseEther("1"),
            "0x",
          ]);

        await keyManager.connect(caller).execute(transferLyxPayload);

        let newAccountBalance = await provider.getBalance(
          otherUniversalProfile.address
        );
        expect(parseInt(newAccountBalance)).toBeGreaterThan(
          parseInt(initialAccountBalance)
        );
      });
    });

    describe("when interacting with contract that does not implement ERC1271", () => {
      it("should fail", async () => {
        let targetPayload = targetContract.interface.encodeFunctionData(
          "setName",
          ["New Name"]
        );

        let upPayload = universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, targetContract.address, 0, targetPayload]
        );

        await expect(
          keyManager.connect(caller).execute(upPayload)
        ).toBeRevertedWith("Not Allowed Standards");
      });
    });
  });

  describe("when caller has only LSP7 interface ID set for ALLOWED STANDARDS", () => {
    describe("when interacting with a contract that implements + register ERC1271 interface", () => {
      it("should fail", async () => {
        let sampleHash = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("Sample Message")
        );
        let sampleSignature = await caller.signMessage("Sample Message");

        let payload = SignatureValidator.interface.encodeFunctionData(
          "isValidSignature",
          [sampleHash, sampleSignature]
        );

        let upPayload = universalProfile.interface.encodeFunctionData(
          "execute",
          [OPERATIONS.CALL, SignatureValidator.address, 0, payload]
        );

        await expect(
          keyManager.connect(callerTwo).callStatic.execute(upPayload)
        ).toBeRevertedWith("Not Allowed Standards");
      });
    });

    describe("when interacting with an ERC725Account (LSP0)", () => {
      it("should fail when trying to transfer LYX", async () => {
        let transferLyxPayload =
          otherUniversalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.CALL,
            otherUniversalProfile.address,
            ethers.utils.parseEther("1"),
            "0x",
          ]);

        await expect(
          keyManager.connect(callerTwo).execute(transferLyxPayload)
        ).toBeRevertedWith("Not Allowed Standard");
      });
    });
  });
});

describe("ALLOWEDERC725YKEYS", () => {
  let abiCoder;

  let accounts: SignerWithAddress[] = [];
  let owner: SignerWithAddress;

  let universalProfile: UniversalProfile, keyManager: LSP6KeyManager;

  async function setupPermissions(owner, permissionKeys, permissionValues) {
    universalProfile = await new UniversalProfile__factory(owner).deploy(
      owner.address
    );
    keyManager = await new LSP6KeyManager__factory(owner).deploy(
      universalProfile.address
    );

    await universalProfile
      .connect(owner)
      .setData(permissionKeys, permissionValues);

    await universalProfile.connect(owner).transferOwnership(keyManager.address);

    return { universalProfile, keyManager };
  }

  beforeAll(async () => {
    abiCoder = ethers.utils.defaultAbiCoder;
    accounts = await ethers.getSigners();
    owner = accounts[0];
  });

  describe("keyType: Singleton", () => {
    let controllerCanSetOneKey: SignerWithAddress,
      controllerCanSetManyKeys: SignerWithAddress;

    const customKey1 = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("CustomKey1")
    );
    const customKey2 = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("CustomKey2")
    );
    const customKey3 = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("CustomKey3")
    );
    const customKey4 = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("CustomKey4")
    );

    beforeAll(async () => {
      controllerCanSetOneKey = accounts[1];
      controllerCanSetManyKeys = accounts[2];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controllerCanSetOneKey.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controllerCanSetManyKeys.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          controllerCanSetOneKey.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          controllerCanSetManyKeys.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        abiCoder.encode(["bytes32[]"], [[customKey1]]),
        abiCoder.encode(["bytes32[]"], [[customKey2, customKey3, customKey4]]),
      ];

      const { universalProfile, keyManager } = await setupPermissions(
        owner,
        permissionKeys,
        permissionValues
      );
    });

    describe("verify allowed ERC725Y keys set", () => {
      it("`controllerCanSetOneKey` should have 1 x key in its list of allowed keys", async () => {
        let [result] = await universalProfile.getData([
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            controllerCanSetOneKey.address.substring(2),
        ]);
        let [decodedResult] = abiCoder.decode(["bytes32[]"], result);

        expect(decodedResult).toHaveLength(1);
      });

      it("`controllerCanSetManyKeys` should have 3 x keys in its list of allowed keys", async () => {
        let [result] = await universalProfile.getData([
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            controllerCanSetManyKeys.address.substring(2),
        ]);
        let [decodedResult] = abiCoder.decode(["bytes32[]"], result);

        expect(decodedResult).toHaveLength(3);
      });

      it("`controllerCanSetOneKey` should have the right keys set in its list of allowed keys", async () => {
        let [result] = await universalProfile.getData([
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            controllerCanSetOneKey.address.substring(2),
        ]);
        let [decodedResult] = abiCoder.decode(["bytes32[]"], result);

        expect(decodedResult).toContain(customKey1);
      });

      it("`controllerCanSetManyKeys` should have the right keys set in its list of allowed keys", async () => {
        let [result] = await universalProfile.getData([
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            controllerCanSetManyKeys.address.substring(2),
        ]);
        let [decodedResult] = abiCoder.decode(["bytes32[]"], result);

        expect(decodedResult).toContain(customKey2);
        expect(decodedResult).toContain(customKey3);
        expect(decodedResult).toContain(customKey4);
      });
    });

    describe("when address can set only one key", () => {
      describe("when setting one key", () => {
        it("should pass when setting the right key", async () => {
          let key = customKey1;
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [newValue]]
          );
          await keyManager
            .connect(controllerCanSetOneKey)
            .execute(setDataPayload);

          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(newValue);
        });

        it("should fail when setting the wrong key", async () => {
          let key = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("NotAllowedKey")
          );
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [newValue]]
          );

          try {
            await keyManager
              .connect(controllerCanSetOneKey)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              NotAllowedERC725YKeyError(controllerCanSetOneKey.address, key)
            );
          }
        });
      });

      describe("when setting multiple keys", () => {
        it("should fail when the list contains none of the allowed keys", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey1")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey2")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey3")),
          ];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 1")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 2")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 3")),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );

          try {
            await keyManager
              .connect(controllerCanSetOneKey)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(controllerCanSetOneKey.address, keys[0])
            );
          }
        });
        it("should fail, even if the list contains some of the allowed key", async () => {
          let keys = [
            customKey1,
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey1")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey2")),
          ];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 1")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 2")),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );

          try {
            await keyManager
              .connect(controllerCanSetOneKey)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the second not allowed key
              NotAllowedERC725YKeyError(controllerCanSetOneKey.address, keys[1])
            );
          }
        });
      });
    });

    describe("when address can set multiple keys", () => {
      describe("when setting one key", () => {
        it("should pass when trying to set the 1st allowed key", async () => {
          let key = customKey2;
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [newValue]]
          );
          await keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload);

          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(newValue);
        });
        it("should pass when trying to set the 2nd allowed key", async () => {
          let key = customKey3;
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [newValue]]
          );
          await keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload);

          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(newValue);
        });
        it("should pass when trying to set the 3rd allowed key", async () => {
          let key = customKey3;
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [newValue]]
          );
          await keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload);

          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(newValue);
        });
        it("should fail when setting a not-allowed Singleton key", async () => {
          let key = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("NotAllowedKey")
          );
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [newValue]]
          );

          try {
            await keyManager
              .connect(controllerCanSetManyKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              NotAllowedERC725YKeyError(controllerCanSetManyKeys.address, key)
            );
          }
        });
      });

      describe("when setting multiple keys", () => {
        it("should pass when the list is a subset of the allowed keys", async () => {
          let keys = [customKey2, customKey3];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 1")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 2")),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );
          await keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload);

          let result = await universalProfile.getData(keys);
          expect(result).toEqual(values);
        });

        it("should pass when the list is all the allowed keys", async () => {
          let keys = [customKey2, customKey3, customKey4];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 1")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 2")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 3")),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );
          await keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload);

          let result = await universalProfile.getData(keys);

          expect(result).toEqual(values);
        });

        it("should fail when the list is none of the allowed keys", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey1")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey2")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey3")),
          ];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 1")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 2")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 3")),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );

          try {
            await keyManager
              .connect(controllerCanSetManyKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[0]
              )
            );
          }
        });
        it("should fail even if the list contains some of the allowed keys", async () => {
          let keys = [
            customKey2,
            customKey3,
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RandomKey3")),
          ];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some Data 1")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some Data 2")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random Value 3")),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );

          try {
            await keyManager
              .connect(controllerCanSetManyKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[2]
              )
            );
          }
        });
      });
    });

    describe("when address can set any key", () => {
      describe("when setting one key", () => {
        it("should pass when setting any random key", async () => {
          let key = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(getRandomString())
          );
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );
          await keyManager.connect(owner).execute(setDataPayload);

          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(value);
        });
      });

      describe("when setting multiple keys", () => {
        it("should pass when setting any multiple keys", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes(getRandomString())),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes(getRandomString())),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes(getRandomString())),
          ];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 1")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 2")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 3")),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );
          await keyManager.connect(owner).execute(setDataPayload);

          let result = await universalProfile.getData(keys);

          expect(result).toEqual(values);
        });
      });
    });
  });

  describe("keyType: Mapping", () => {
    let controllerCanSetMappingKeys: SignerWithAddress;

    // all mapping keys starting with: SupportedStandards:...
    const supportedStandardKey =
      "0xeafec4d89fa9619884b6b8913562645500000000000000000000000000000000";

    // SupportedStandards:LSPX
    const LSPXKey =
      "0xeafec4d89fa9619884b6b8913562645500000000000000000000000024ae6f23";

    // SupportedStandards:LSPY
    const LSPYKey =
      "0xeafec4d89fa9619884b6b891356264550000000000000000000000005e8d18c5";

    // SupportedStandards:LSPZ
    const LSPZKey =
      "0xeafec4d89fa9619884b6b8913562645500000000000000000000000025b71a36";

    beforeAll(async () => {
      owner = accounts[0];
      controllerCanSetMappingKeys = accounts[1];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controllerCanSetMappingKeys.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          controllerCanSetMappingKeys.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        abiCoder.encode(["bytes32[]"], [[supportedStandardKey]]),
      ];

      const { universalProfile, keyManager } = await setupPermissions(
        owner,
        permissionKeys,
        permissionValues
      );
    });

    describe("when address can set Mapping keys starting with a 'SupportedStandards:...'", () => {
      describe("when setting one key", () => {
        it("should pass when setting SupportedStandards:LSPX", async () => {
          let mappingKey = LSPXKey;
          let mappingValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0x24ae6f23")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[mappingKey], [mappingValue]]
          );
          let tx = await keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );
          let [result] = await universalProfile.getData([mappingKey]);
          expect(result).toEqual(mappingValue);
        });

        it("should pass when setting SupportedStandards:LSPY", async () => {
          let mappingKey = LSPYKey;
          let mappingValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0x5e8d18c5")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[mappingKey], [mappingValue]]
          );
          let tx = await keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );
          let [result] = await universalProfile.getData([mappingKey]);
          expect(result).toEqual(mappingValue);
        });

        it("should pass when setting SupportedStandards:LSPZ", async () => {
          let mappingKey = LSPZKey;
          let mappingValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0x25b71a36")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[mappingKey], [mappingValue]]
          );
          let tx = await keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );
          let [result] = await universalProfile.getData([mappingKey]);
          expect(result).toEqual(mappingValue);
        });

        it("should fail when setting any other not-allowed Mapping key", async () => {
          // CustomMapping:...
          let notAllowedMappingKey =
            "0xb8a73e856fea3d5a518029e588a713f300000000000000000000000000000000";
          let notAllowedMappingValue = "0xbeefbeef";

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[notAllowedMappingKey], [notAllowedMappingValue]]
          );

          try {
            await keyManager
              .connect(controllerCanSetMappingKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(
                controllerCanSetMappingKeys.address,
                notAllowedMappingKey
              )
            );
          }
        });
      });

      describe("when setting multiple keys", () => {
        it('should pass when all the keys in the list start with bytes16(keccak256("SupportedStandards"))', async () => {
          let mappingKeys = [LSPXKey, LSPYKey];
          let mappingValues = ["0x5e8d18c5", "0x5e8d18c5"];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [mappingKeys, mappingValues]
          );

          let tx = await keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );

          let result = await universalProfile.getData(mappingKeys);
          expect(result).toEqual(mappingValues);
        });
        it("should fail when the list contains none of the allowed Mapping keys", async () => {
          let randomMappingKeys = [
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00000000000000000000000011111111",
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00000000000000000000000022222222",
            "0xcccccccccccccccccccccccccccccccc00000000000000000000000022222222",
          ];
          let randomMappingValues = [
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random Mapping Value 1")
            ),
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random Mapping Value 2")
            ),
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random Mapping Value 3")
            ),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [randomMappingKeys, randomMappingValues]
          );

          try {
            await keyManager
              .connect(controllerCanSetMappingKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(
                controllerCanSetMappingKeys.address,
                randomMappingKeys[0]
              )
            );
          }
        });
        it("should fail, even if the list contains some keys starting with `SupportedStandards`", async () => {
          let mappingKeys = [
            LSPXKey,
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00000000000000000000000022222222",
            "0xcccccccccccccccccccccccccccccccc00000000000000000000000022222222",
          ];
          let mappingValues = [
            "0x24ae6f23",
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random Mapping Value 1")
            ),
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random Mapping Value 2")
            ),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [mappingKeys, mappingValues]
          );

          try {
            await keyManager
              .connect(controllerCanSetMappingKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(
                controllerCanSetMappingKeys.address,
                mappingKeys[1]
              )
            );
          }
        });
      });
    });

    describe("when address can set any key", () => {
      describe("when setting one key", () => {
        it("should pass when setting any random Mapping key", async () => {
          let randomMappingKey =
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00000000000000000000000011111111";
          let randomMappingValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Random Mapping Value")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[randomMappingKey], [randomMappingValue]]
          );
          await keyManager.connect(owner).execute(setDataPayload);

          let [result] = await universalProfile.getData([randomMappingKey]);
          expect(result).toEqual(randomMappingValue);
        });
      });

      describe("when setting multiple keys", () => {
        it("should pass when setting any random set of Mapping keys", async () => {
          let randomMappingKeys = [
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00000000000000000000000011111111",
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb00000000000000000000000022222222",
            "0xcccccccccccccccccccccccccccccccc00000000000000000000000022222222",
          ];
          let randomMappingValues = [
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random Mapping Value 1")
            ),
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random Mapping Value 2")
            ),
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random Mapping Value 3")
            ),
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [randomMappingKeys, randomMappingValues]
          );
          await keyManager.connect(owner).execute(setDataPayload);

          let result = await universalProfile.getData(randomMappingKeys);

          expect(result).toEqual(randomMappingValues);
        });
      });
    });
  });

  describe("keyType: Array", () => {
    let controllerCanSetArrayKeys: SignerWithAddress;

    const allowedArrayKey =
      "0x868affce801d08a5948eebc349a5c8ff00000000000000000000000000000000";

    // keccak256("MyArray[]")
    const arrayKeyLength =
      "0x868affce801d08a5948eebc349a5c8ff18e4c7076d14879dd5d19180dff1f547";

    // MyArray[0]
    const arrayKeyElement1 =
      "0x868affce801d08a5948eebc349a5c8ff00000000000000000000000000000000";

    // MyArray[1]
    const arrayKeyElement2 =
      "0x868affce801d08a5948eebc349a5c8ff00000000000000000000000000000001";

    // MyArray[2]
    const arrayKeyElement3 =
      "0x868affce801d08a5948eebc349a5c8ff00000000000000000000000000000002";

    beforeAll(async () => {
      owner = accounts[0];
      controllerCanSetArrayKeys = accounts[1];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controllerCanSetArrayKeys.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          controllerCanSetArrayKeys.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
        abiCoder.encode(["bytes32[]"], [[allowedArrayKey]]),
      ];

      const { universalProfile, keyManager } = await setupPermissions(
        owner,
        permissionKeys,
        permissionValues
      );
    });

    describe("when address can set Array element in 'MyArray[]", () => {
      describe("when setting one key", () => {
        it("should pass when setting array key length MyArray[]", async () => {
          let key = arrayKeyLength;
          // eg: MyArray[].length = 10 elements
          let value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("0x0a"));

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );
          let tx = await keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );
          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(value);
        });
        it("should pass when setting 1st array element MyArray[0]", async () => {
          let key = arrayKeyElement1;
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0xaaaaaaaa")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );
          let tx = await keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );
          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(value);
        });

        it("should pass when setting 2nd array element MyArray[1]", async () => {
          let key = arrayKeyElement2;
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0xbbbbbbbb")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );
          let tx = await keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );
          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(value);
        });

        it("should pass when setting 3rd array element MyArray[3]", async () => {
          let key = arrayKeyElement3;
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0xcccccccc")
          );

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );
          let tx = await keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );
          let [result] = await universalProfile.getData([key]);
          expect(result).toEqual(value);
        });

        it("should fail when setting elements of a not-allowed Array (eg: LSP5ReceivedAssets)", async () => {
          let notAllowedArrayKey = ERC725YKeys.LSP5["LSP5ReceivedAssets[]"];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [[notAllowedArrayKey], ["0x00"]]
          );

          try {
            await keyManager
              .connect(controllerCanSetArrayKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(
                controllerCanSetArrayKeys.address,
                notAllowedArrayKey
              )
            );
          }
        });
      });

      describe("when setting multiple keys", () => {
        it("should pass when all the keys in the list are from the allowed array MyArray[]", async () => {
          let keys = [arrayKeyElement1, arrayKeyElement2];
          let values = ["0xaaaaaaaa", "0xbbbbbbbb"];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );

          let tx = await keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();

          console.log(
            "tx: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );

          let result = await universalProfile.getData(keys);
          expect(result).toEqual(values);
        });
        it("should fail when the list contains elements keys of a non-allowed Array (RandomArray[])", async () => {
          let randomArrayKeys = [
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000000",
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000001",
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000002",
          ];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [randomArrayKeys, ["0xdeadbeef", "0xdeadbeef", "0xdeadbeef"]]
          );

          try {
            await keyManager
              .connect(controllerCanSetArrayKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(
                controllerCanSetArrayKeys.address,
                randomArrayKeys[0]
              )
            );
          }
        });
        it("should fail, even if the list contains a mix of allowed + not-allowed array element keys (MyArray[] + RandomArray[])", async () => {
          let keys = [
            arrayKeyElement1,
            arrayKeyElement2,
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000000",
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000001",
          ];
          let values = ["0xaaaaaaaa", "0xbbbbbbbb", "0xdeadbeef", "0xdeadbeef"];

          let setDataPayload = universalProfile.interface.encodeFunctionData(
            "setData",
            [keys, values]
          );

          try {
            await keyManager
              .connect(controllerCanSetArrayKeys)
              .execute(setDataPayload);
          } catch (error) {
            expect(error.message).toMatch(
              // should fail at the first not allowed key
              NotAllowedERC725YKeyError(
                controllerCanSetArrayKeys.address,
                keys[2]
              )
            );
          }
        });
      });
    });
  });
});
