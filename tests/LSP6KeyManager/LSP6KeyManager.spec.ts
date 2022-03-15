import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

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

  /** @permissions */
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
});
