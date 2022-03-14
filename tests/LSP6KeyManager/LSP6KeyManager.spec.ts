import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
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
} from "../../constants";

// helpers
import {
  NotAuthorisedError,
  NotAllowedAddressError,
  NotAllowedFunctionError,
  NotAllowedERC725YKeyError,
  NoPermissionsSetError,
  EMPTY_PAYLOAD,
  DUMMY_PAYLOAD,
  DUMMY_PRIVATEKEY,
  ONE_ETH,
  getRandomAddresses,
  generateKeysAndValues,
  getRandomString,
} from "../utils/helpers";

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

describe("KeyManagerHelper: reading permissions of multiple empty bytes length", () => {
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
    let abiCoder;
    let expectedEmptyPermission;

    beforeAll(async () => {
      abiCoder = await ethers.utils.defaultAbiCoder;
      expectedEmptyPermission = abiCoder.encode(
        ["bytes32"],
        ["0x0000000000000000000000000000000000000000000000000000000000000000"]
      );
    });

    it("should cast permissions to 32 bytes when reading permissions stored as more than 32 empty bytes", async () => {
      const result = await keyManagerHelper.getAddressPermissions(
        moreThan32EmptyBytes.address
      );
      expect(result).toEqual(expectedEmptyPermission);
    });

    it("should cast permissions to 32 bytes when reading permissions stored as less than 32 empty bytes", async () => {
      const result = await keyManagerHelper.getAddressPermissions(
        lessThan32EmptyBytes.address
      );
      expect(result).toEqual(expectedEmptyPermission);
    });

    it("should cast permissions to 32 bytes when reading permissions stored as one empty byte", async () => {
      const result = await keyManagerHelper.getAddressPermissions(
        oneEmptyByte.address
      );
      expect(result).toEqual(expectedEmptyPermission);
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

  describe("> testing: ALL ADDRESSES + FUNCTIONS whitelisted", () => {
    /** @bug this test is likely to be incorrect */
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

  describe("> testing `executeRelay(...)`", () => {
    // Use channelId = 0 for sequential nonce
    let channelId = 0;

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
  });

  /** @relayer */
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

  /** @relayer */
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

    it("Should revert when caller has no permissions set", async () => {
      let targetContractPayload = targetContract.interface.encodeFunctionData(
        "setName",
        ["New Contract Name"]
      );

      let executePayload = universalProfile.interface.encodeFunctionData(
        "execute",
        [OPERATIONS.CALL, targetContract.address, 0, targetContractPayload]
      );

      try {
        await keyManager.connect(app).execute(executePayload);
      } catch (error) {
        expect(error.message).toMatch(
          NoPermissionsSetError(accounts[6].address)
        );
      }
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

// describe("CHANGE / ADD PERMISSIONS", () => {
//   let accounts: SignerWithAddress[] = [];

//   let owner: SignerWithAddress,
//     canOnlyAddPermissions: SignerWithAddress,
//     canOnlyChangePermissions: SignerWithAddress,
//     bob: SignerWithAddress,
//     zeroBytes: SignerWithAddress;

//   let universalProfile: UniversalProfile, keyManager: LSP6KeyManager;

//   beforeAll(async () => {
//     accounts = await ethers.getSigners();

//     owner = accounts[0];
//     canOnlyAddPermissions = accounts[1];
//     canOnlyChangePermissions = accounts[2];
//     /** @todo rename this variable to addressToEditPermissions */
//     bob = accounts[3];
//     zeroBytes = accounts[4];
//     /**
//      * @todo should test that an address with only the permisssion SETDATA
//      * cannot edit permissions
//      */

//     universalProfile = await new UniversalProfile__factory(owner).deploy(
//       owner.address
//     );
//     keyManager = await new LSP6KeyManager__factory(owner).deploy(
//       universalProfile.address
//     );

//     await universalProfile.connect(owner).setData(
//       [
//         ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//           owner.address.substring(2),
//         ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//           canOnlyAddPermissions.address.substring(2),
//         ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//           canOnlyChangePermissions.address.substring(2),
//         ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//           bob.address.substring(2),
//         ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//           zeroBytes.address.substring(2),
//       ],
//       [
//         ALL_PERMISSIONS_SET,
//         ethers.utils.hexZeroPad(PERMISSIONS.ADDPERMISSIONS, 32),
//         ethers.utils.hexZeroPad(PERMISSIONS.CHANGEPERMISSIONS, 32),
//         ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32), // example to test changing bob's permissions
//         "0x0000000000000000000000000000000000000000000000000000000000000000",
//       ]
//     );

//     await universalProfile.connect(owner).transferOwnership(keyManager.address);
//   });

//   describe("When setting one permission key", () => {
//     describe("From UP owner", () => {
//       // it("should be allowed to add permissions", async () => {
//       //   let newControllerKey = new ethers.Wallet.createRandom();
//       //   let key =
//       //     ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//       //     newControllerKey.address.substr(2);
//       //   let payload = universalProfile.interface.encodeFunctionData("setData", [
//       //     [key],
//       //     [PERMISSIONS.SETDATA],
//       //   ]);
//       //   let tx = await keyManager.connect(owner).execute(payload);
//       //   let receipt = await tx.wait();
//       //   console.log(ethers.BigNumber.from(receipt.gasUsed).toNumber());
//       //   let [fetchedResult] = await universalProfile.callStatic.getData([key]);
//       //   expect(fetchedResult).toEqual(
//       //     ethers.utils.hexZeroPad(PERMISSIONS.SETDATA)
//       //   );
//       // });
//       // it("should be allowed to change permissions", async () => {
//       //   let key =
//       //     ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//       //     bob.address.substr(2);
//       //   let payload = universalProfile.interface.encodeFunctionData("setData", [
//       //     [key],
//       //     [PERMISSIONS.SETDATA],
//       //   ]);
//       //   let tx = await keyManager.connect(owner).execute(payload);
//       //   let receipt = await tx.wait();
//       //   console.log(ethers.BigNumber.from(receipt.gasUsed).toNumber());
//       //   let [fetchedResult] = await universalProfile.callStatic.getData([key]);
//       //   expect(fetchedResult).toEqual(
//       //     ethers.utils.hexZeroPad(PERMISSIONS.SETDATA)
//       //   );
//       // });
//     });

//     describe("From an address that has permission ADDPERMISSIONS", () => {
//       // it("should be allowed to add permissions", async () => {
//       //   let newAddress = new ethers.Wallet.createRandom();
//       //   let key =
//       //     ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//       //     newAddress.address.substr(2);
//       //   let payload = universalProfile.interface.encodeFunctionData("setData", [
//       //     [key],
//       //     [PERMISSIONS.SETDATA],
//       //   ]);
//       //   await keyManager.connect(canOnlyAddPermissions).execute(payload);
//       //   let [fetchedResult] = await universalProfile.callStatic.getData([key]);
//       //   expect(fetchedResult).toEqual(
//       //     ethers.utils.hexZeroPad(PERMISSIONS.SETDATA)
//       //   );
//       // });
//       // it("should not be allowed to change permissions", async () => {
//       //   // trying to set all permissions for itself
//       //   let maliciousPayload = universalProfile.interface.encodeFunctionData(
//       //     "setData",
//       //     [
//       //       [
//       //         ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//       //           canOnlyAddPermissions.address.substr(2),
//       //       ],
//       //       [ALL_PERMISSIONS_SET],
//       //     ]
//       //   );
//       //   try {
//       //     await keyManager
//       //       .connect(canOnlyAddPermissions)
//       //       .execute(maliciousPayload);
//       //   } catch (error) {
//       //     expect(error.message).toMatch(
//       //       NotAuthorisedError(
//       //         canOnlyAddPermissions.address,
//       //         "CHANGEPERMISSIONS"
//       //       )
//       //     );
//       //   }
//       // });
//     });

//     describe("From an address that has permission CHANGEPERMISSIONS", () => {
//       // it("should not be allowed to add permissions", async () => {
//       //   // trying to grant full access of the UP to a newly created controller key
//       //   // (so to then gain full control via `maliciousControllerKey`)
//       //   let maliciousControllerKey = new ethers.Wallet.createRandom();
//       //   let maliciousPayload =
//       //     await universalProfile.interface.encodeFunctionData("setData", [
//       //       [
//       //         ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//       //           maliciousControllerKey.address.substr(2),
//       //       ],
//       //       [ALL_PERMISSIONS_SET],
//       //     ]);
//       //   try {
//       //     await keyManager
//       //       .connect(canOnlyChangePermissions)
//       //       .execute(maliciousPayload);
//       //   } catch (error) {
//       //     expect(error.message).toMatch(
//       //       NotAuthorisedError(
//       //         canOnlyChangePermissions.address,
//       //         "ADDPERMISSIONS"
//       //       )
//       //     );
//       //   }
//       // });
//       // it("should be allowed to change permissions", async () => {
//       //   let key =
//       //     ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//       //     bob.address.substring(2);
//       //   let value = ethers.utils.hexZeroPad(
//       //     PERMISSIONS.SETDATA + PERMISSIONS.CALL,
//       //     32
//       //   );
//       //   let payload = universalProfile.interface.encodeFunctionData("setData", [
//       //     [key],
//       //     [value],
//       //   ]);
//       //   await keyManager.connect(canOnlyChangePermissions).execute(payload);
//       //   let [fetchedResult] = await universalProfile.callStatic.getData([key]);
//       //   expect(fetchedResult).toEqual(value);
//       // });
//       // it("should not be allowed to add permissions for an address that has 32 x 0 bytes (0x0000...0000) as permission value", async () => {
//       //   let payload = universalProfile.interface.encodeFunctionData("setData", [
//       //     [
//       //       ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
//       //         zeroBytes.address.substr(2),
//       //     ],
//       //     [ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32)],
//       //   ]);
//       //   try {
//       //     await keyManager.connect(canOnlyChangePermissions).execute(payload);
//       //   } catch (error) {
//       //     expect(error.message).toMatch(
//       //       NotAuthorisedError(
//       //         canOnlyChangePermissions.address,
//       //         "ADDPERMISSIONS"
//       //       )
//       //     );
//       //   }
//       // });
//     });
//   });
// });

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
