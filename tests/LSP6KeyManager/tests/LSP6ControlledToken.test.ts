import { ethers } from "hardhat";
import { expect } from "chai";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  LSP6KeyManager,
  LSP6KeyManager__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
  LSP7Tester__factory,
  LSP8Mintable,
  LSP8Mintable__factory,
  LSP0ERC725Account__factory,
} from "../../../types";
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  ERC1271_VALUES,
} from "../../../constants";
import { abiCoder, ARRAY_LENGTH } from "../../utils/helpers";
import { BytesLike } from "ethers";

export type LSP6ControlledToken = {
  accounts: SignerWithAddress[];
  token: LSP7Mintable | LSP8Mintable;
  keyManager: LSP6KeyManager;
  owner: SignerWithAddress;
};

const buildContext = async () => {
  const accounts = await ethers.getSigners();

  const lsp7 = await new LSP7Mintable__factory(accounts[0]).deploy(
    "name",
    "symbol",
    accounts[0].address,
    true
  );

  const keyManager = await new LSP6KeyManager__factory(accounts[0]).deploy(
    lsp7.address
  );

  const keys = [
    ERC725YKeys.LSP6["AddressPermissions[]"].length,
    ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "0",
    ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
      accounts[0].address.substring(2),
  ];

  const values = [ARRAY_LENGTH.ONE, accounts[0].address, ALL_PERMISSIONS];

  await lsp7.connect(accounts[0])["setData(bytes32[],bytes[])"](keys, values);
  await lsp7.connect(accounts[0]).transferOwnership(keyManager.address);

  return {
    accounts,
    token: lsp7,
    keyManager,
    owner: accounts[0],
  };
};

const addControllerWithPermission = async (
  context: LSP6ControlledToken,
  account: SignerWithAddress,
  arrayLength,
  arrayIndex: BytesLike,
  permissions: BytesLike
) => {
  const keys = [
    ERC725YKeys.LSP6["AddressPermissions[]"].length,
    ERC725YKeys.LSP6["AddressPermissions[]"].index + arrayIndex,
    ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
      account.address.substring(2),
  ];

  const values = [arrayLength, account.address, permissions];

  const payload = context.token.interface.encodeFunctionData(
    "setData(bytes32[],bytes[])",
    [keys, values]
  );

  await context.keyManager.connect(context.owner).execute(payload);
};

describe("When deploying LSP7 with LSP6 as owner", () => {
  let context: LSP6ControlledToken;

  let newOwner: SignerWithAddress;
  let anotherNewOwner: SignerWithAddress;

  let addressCanChangeOwner: SignerWithAddress;
  let addressCanChangePermissions: SignerWithAddress;
  let addressCanAddPermissions: SignerWithAddress;
  let addressCanSetData: SignerWithAddress;
  let addressCanSign: SignerWithAddress;

  before(async () => {
    context = await buildContext();

    newOwner = context.accounts[1];
    anotherNewOwner = context.accounts[2];

    addressCanChangeOwner = context.accounts[1];
    addressCanChangePermissions = context.accounts[2];
    addressCanAddPermissions = context.accounts[3];
    addressCanSetData = context.accounts[4];
    addressCanSign = context.accounts[5];
  });

  it("should have lsp6 as owner of the lsp7", async () => {
    expect(await context.token.owner()).to.equal(context.keyManager.address);
  });

  it("should set the necessary controller permissions correctly", async () => {
    const keys = [
      ERC725YKeys.LSP6["AddressPermissions[]"].length,
      ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "0",
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.owner.address.substring(2),
    ];

    const values = [
      ARRAY_LENGTH.ONE,
      context.owner.address,
      ALL_PERMISSIONS,
    ];

    expect(await context.token["getData(bytes32[])"](keys)).to.deep.equal(
      values
    );
  });

  describe("when trying to call execute(..) function on LSP7 through LSP6", () => {
    it("should revert because function does not exist on LSP7", async () => {
      // deploying a dummy token contract with public mint function
      const newTokenContract = await new LSP7Tester__factory(
        context.owner
      ).deploy("NewTokenName", "NewTokenSymbol", context.owner.address);
      // creating a payload to mint tokens in the new contract
      const mintPayload = newTokenContract.interface.encodeFunctionData(
        "mint",
        [context.owner.address, 1000, true, "0x"]
      );

      const payload =
        LSP0ERC725Account__factory.createInterface().encodeFunctionData(
          "execute",
          [0, newTokenContract.address, 0, mintPayload]
        );

      const executePayload = context.keyManager
        .connect(context.owner)
        .execute(payload);

      await expect(executePayload).to.be.revertedWith(
        "LSP6: Unknown Error occured when calling the linked target contract"
      );
    });
  });

  describe("when trying to call mint(..) function on  in LSP7 through LSP6", () => {
    it("should revert because function does not exist on LSP6", async () => {
      const LSP7 = context.token as LSP7Mintable;
      const mintPayload = LSP7.interface.encodeFunctionData("mint", [
        context.owner.address,
        1,
        true,
        "0x",
      ]);

      const executeMintPayload = context.keyManager
        .connect(context.owner)
        .execute(mintPayload);

      await expect(executeMintPayload)
        .to.be.revertedWithCustomError(
          context.keyManager,
          "InvalidERC725Function"
        )
        .withArgs(mintPayload.substring(0, 10));
    });
  });

  describe("using renounceOwnership(..) in LSP7 through LSP6", () => {
    it("should revert", async () => {
      const renounceOwnershipPayload =
        context.token.interface.encodeFunctionData("renounceOwnership");

      const executeRenounceOwnershipPayload = context.keyManager
        .connect(context.owner)
        .execute(renounceOwnershipPayload);

      await expect(executeRenounceOwnershipPayload)
        .to.be.revertedWithCustomError(
          context.keyManager,
          "InvalidERC725Function"
        )
        .withArgs(renounceOwnershipPayload);
    });
  });

  describe("using transferOwnership(..) in LSP7 through LSP6", () => {

    it("should change the owner of LSP7 contract", async () => {
      const LSP7 = context.token as LSP7Mintable;
      const transferOwnershipPayload =
      LSP7.interface.encodeFunctionData("transferOwnership", [
          newOwner.address,
        ]);

      await context.keyManager
        .connect(context.owner)
        .execute(transferOwnershipPayload);

      expect(await context.token.owner()).to.equal(newOwner.address);
    });

    it("`setData(...)` -> should revert with 'caller is not the owner' error.", async () => {
      const key = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("FirstRandomString")
      );
      const value = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("SecondRandomString")
      );
      const payload = context.token.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [key, value]
      );

      const useSetDataAsNonOwner = context.keyManager
        .connect(context.owner)
        .execute(payload);

      await expect(useSetDataAsNonOwner).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("should allow the new owner to call setData(..)", async () => {
      const key = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("FirstRandomString")
      );
      const value = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("SecondRandomString")
      );

      await context.token
        .connect(newOwner)
        ["setData(bytes32,bytes)"](
          key, value
        );

      expect(await context.token["getData(bytes32)"](key)).to.equal(value);
    });

    it("`mint(..)` -> should revert with 'caller is not the owner' error.", async () => {
      const LSP7 = context.token as LSP7Mintable;
      const mintPayload = LSP7.interface.encodeFunctionData("mint", [
        context.owner.address,
        1,
        true,
        "0x",
      ]);

      const executeMintPayload = context.keyManager
        .connect(context.owner)
        .execute(mintPayload);

      await expect(executeMintPayload)
        .to.be.revertedWithCustomError(
          context.keyManager,
          "InvalidERC725Function"
        )
        .withArgs(mintPayload.substring(0, 10));
    });

    it("should allow the new owner to call mint(..)", async () => {
      const LSP7 = context.token as LSP7Mintable;

      await LSP7
        .connect(newOwner)
        .mint(
          context.owner.address,
          1,
          true,
          "0x",
        );

      expect(await LSP7.balanceOf(context.owner.address))
        .to.equal(1);
    });

    it("`transferOwnership(..)` -> should revert with 'caller is not the owner' error.", async () => {
      const transferOwnershipPayload =
        context.token.interface.encodeFunctionData("transferOwnership", [
          context.accounts[1].address,
        ]);

      const executeTransferOwnershipPayload = context.keyManager
        .connect(context.owner)
        .execute(transferOwnershipPayload);

      await expect(executeTransferOwnershipPayload).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("should allow the new owner to call transferOwnership(..)", async () => {
      await context.token
        .connect(newOwner)
        .transferOwnership(anotherNewOwner.address);
      
      expect(await context.token.owner()).to.equal(anotherNewOwner.address);
    });

    it("`renounceOwnership(..)` -> should revert with 'caller is not the owner' error.", async () => {
      const renounceOwnershipPayload =
        context.token.interface.encodeFunctionData("renounceOwnership");

      const executeRenounceOwnershipPayload = context.keyManager
        .connect(context.owner)
        .execute(renounceOwnershipPayload);

      await expect(executeRenounceOwnershipPayload)
        .to.be.revertedWithCustomError(
          context.keyManager,
          "InvalidERC725Function"
        )
        .withArgs(renounceOwnershipPayload);
    });

    it("should allow the new owner to call renounceOwnership(..)", async () => {
      await context.token
        .connect(anotherNewOwner)
        .renounceOwnership();

      expect(await context.token.owner())
        .to.equal(ethers.constants.AddressZero);
    });
  });

  describe("using setData(..) in lSP7 through LSP6", () => {
    before(async () => {
      context = await buildContext();
    });

    describe("testing CHANGEOWNER permission", () => {
      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanChangeOwner,
          ARRAY_LENGTH.TWO,
          "0".repeat(31) + "1",
          PERMISSIONS.CHANGEOWNER
        );
      });

      it("should add the new controller without changing other controllers", async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "0",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "1",
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            context.owner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangeOwner.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.TWO,
          context.owner.address,
          addressCanChangeOwner.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
        ];

        expect(
          await context.token["getData(bytes32[])"](keys)
        ).to.deep.equal(values);
      });

      it("should revert if the caller doesn't have CHANGEOWNER permission when using `transferOwnership(..)`", async () => {
        const transferOwnershipPayload =
          context.token.interface.encodeFunctionData("transferOwnership", [
            addressCanChangeOwner.address,
          ]);

        const transferOwnership = context.keyManager
          .connect(addressCanChangePermissions)
          .execute(transferOwnershipPayload);

        expect(transferOwnership)
          .to.be.revertedWithCustomError(context.keyManager, "NoPermissionsSet")
          .withArgs(addressCanChangePermissions.address);
      });

      it("should change the owner of LSP7 contract when using `transferOwnership(..)`", async () => {
        const transferOwnershipPayload =
          context.token.interface.encodeFunctionData("transferOwnership", [
            addressCanChangeOwner.address,
          ]);

        await context.keyManager
          .connect(addressCanChangeOwner)
          .execute(transferOwnershipPayload);

        expect(await context.token.owner()).to.equal(
          addressCanChangeOwner.address
        );
      });

      after(async () => {
        await context.token
          .connect(addressCanChangeOwner)
          .transferOwnership(context.keyManager.address);
      });
    });

    describe("testing CHANGEPERMISSIONS permission", () => {
      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanChangePermissions,
          ARRAY_LENGTH.THREE,
          "0".repeat(31) + "2",
          PERMISSIONS.CHANGEPERMISSIONS
        );
      });

      it("should add the new controller without changing other controllers", async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "0",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "1",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "2",
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            context.owner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangeOwner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangePermissions.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.THREE,
          context.owner.address,
          addressCanChangeOwner.address,
          addressCanChangePermissions.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
          PERMISSIONS.CHANGEPERMISSIONS,
        ];

        expect(
          await context.token["getData(bytes32[])"](keys)
        ).to.deep.equal(values);
      });

      it("should revert if caller doesn't have CHANGEPERMISSION permission", async () => {
        const key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2);
        const value = PERMISSIONS.CALL;
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        const changePermission = context.keyManager
          .connect(addressCanChangeOwner)
          .execute(payload);

        await expect(changePermission)
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCanChangeOwner.address, "CHANGEPERMISSIONS");
      });

      it("should change ALL_PERMISSIONS to CALL permission of the address", async () => {
        const key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2);
        const value = PERMISSIONS.CALL;
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager.connect(addressCanChangePermissions).execute(payload);

        expect(await context.token["getData(bytes32)"](key)).to.equal(value);
      });

      it("should add back ALL_PERMISSIONS of the address", async () => {
        const key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2);
        const value = ALL_PERMISSIONS;
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager.connect(addressCanChangePermissions).execute(payload);

        expect(await context.token["getData(bytes32)"](key)).to.equal(value);
      });
    });

    describe("testing ADDPERMISSIONS permission", () => {
      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanAddPermissions,
          ARRAY_LENGTH.FOUR,
          "0".repeat(31) + "3",
          PERMISSIONS.ADDPERMISSIONS
        );
      });

      it("should add the new controller without changing other controllers", async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "0",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "1",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "2",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "3",
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            context.owner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangeOwner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangePermissions.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanAddPermissions.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.FOUR,
          context.owner.address,
          addressCanChangeOwner.address,
          addressCanChangePermissions.address,
          addressCanAddPermissions.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
          PERMISSIONS.CHANGEPERMISSIONS,
          PERMISSIONS.ADDPERMISSIONS,
        ];

        expect(
          await context.token["getData(bytes32[])"](keys)
        ).to.deep.equal(values);
      });

      it("should be allowed to add a new controller with some permissions", async () => {
        const key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanSetData.address.substring(2);
        const value = ALL_PERMISSIONS;
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager.connect(addressCanAddPermissions).execute(payload);

        expect(await context.token["getData(bytes32)"](key)).to.equal(value);
      });

      it("should not be authorized to edit permissions of an wxisting controller (e.g: removing permissions)", async () => {
        const key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanSetData.address.substring(2);
        const value = ARRAY_LENGTH.ZERO;
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        const executePayload = context.keyManager
          .connect(addressCanAddPermissions)
          .execute(payload);

        await expect(executePayload)
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(addressCanAddPermissions.address, "CHANGEPERMISSIONS");
      });

      after(async () => {
        const key =
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanSetData.address.substring(2);
        const value = ARRAY_LENGTH.ZERO;
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager.connect(context.owner).execute(payload);
      });
    });

    describe("testing SETDATA permission", () => {
      const firstRandomSringKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FirstRandomString"));
      const secondRandomSringKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("SecondRandomString"));
      const notAllowedKey = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Not Allowed ERC725Y data key"));

      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanSetData,
          ARRAY_LENGTH.FIVE,
          "0".repeat(31) + "4",
          PERMISSIONS.SETDATA
        );
      });

      it("should add the new controller without changing other controllers", async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "0",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "1",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "2",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "3",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "4",
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            context.owner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangeOwner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangePermissions.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanAddPermissions.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanSetData.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.FIVE,
          context.owner.address,
          addressCanChangeOwner.address,
          addressCanChangePermissions.address,
          addressCanAddPermissions.address,
          addressCanSetData.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
          PERMISSIONS.CHANGEPERMISSIONS,
          PERMISSIONS.ADDPERMISSIONS,
          PERMISSIONS.SETDATA,
        ];

        expect(
          await context.token["getData(bytes32[])"](keys)
        ).to.deep.equal(values);
      });

      it("should allow second controller to use setData", async () => {
        const key = firstRandomSringKey;
        const value = secondRandomSringKey;
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager.connect(addressCanSetData).execute(payload);

        expect(await context.token["getData(bytes32)"](key)).to.equal(value);
      });

      it("should restrict second controller with AllowedERC725YKeys", async () => {
        const key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          addressCanSetData.address.substring(2);
        const value = abiCoder.encode(
          ["bytes32[]"],
          [
            [
              firstRandomSringKey.substring(0, 34) + "0".repeat(31) + "0",
            ],
          ]
        );
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager.connect(context.owner).execute(payload);

        expect(await context.token["getData(bytes32)"](key)).to.equal(value);
      });

      it("should change allowed keys", async () => {
        const keys = [
          firstRandomSringKey,
          firstRandomSringKey.substring(0, 34) + "0".repeat(31) + "0",
          firstRandomSringKey.substring(0, 34) + "0".repeat(31) + "1",
          firstRandomSringKey.substring(0, 34) + "0".repeat(31) + "2",
          firstRandomSringKey.substring(0, 34) + "0".repeat(31) + "3",
        ];
        const values = [
          ARRAY_LENGTH.FOUR,
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("FirstRandomString0")
          ),
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("FirstRandomString1")
          ),
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("FirstRandomString2")
          ),
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("FirstRandomString3")
          ),
        ];
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [keys, values]
        );

        await context.keyManager.connect(addressCanSetData).execute(payload);

        expect(
          await context.token["getData(bytes32[])"](keys)
        ).to.deep.equal(values);
      });

      it("should revert when trying to change a key that is not allowed", async () => {
        const keys = [
          notAllowedKey,
          notAllowedKey.substring(0, 34) + "0".repeat(31) + "0",
          notAllowedKey.substring(0, 34) + "0".repeat(31) + "1",
          notAllowedKey.substring(0, 34) + "0".repeat(31) + "2",
          notAllowedKey.substring(0, 34) + "0".repeat(31) + "3",
        ];
        const values = [
          ARRAY_LENGTH.FOUR,
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("FirstRandomString0")
          ),
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("FirstRandomString1")
          ),
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("FirstRandomString2")
          ),
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("FirstRandomString3")
          ),
        ];
        const payload = context.token.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [keys, values]
        );

        const executePayload = context.keyManager
          .connect(addressCanSetData)
          .execute(payload);

        await expect(executePayload)
          .to.be.revertedWithCustomError(
            context.keyManager,
            "NotAllowedERC725YKey"
          )
          .withArgs(
            addressCanSetData.address,
            notAllowedKey
          );
      });
    });

    /**
     * Testing the following permissions is skipped because
     * execute(..) is not available in a token contract.
     *
     * CALL
     * STATICCALL
     * DELEGATECALL
     * DEPLOY
     * TRANSFERVALUE
     */

    describe("testing SIGN permission", () => {
      before(async () => {
        await addControllerWithPermission(
          context,
          addressCanSign,
          ARRAY_LENGTH.SIX,
          "0".repeat(31) + "5",
          PERMISSIONS.SIGN
        );
      });

      it("should add the new controller without changing other controllers", async () => {
        // Check that a new controller was added and other controllers remained intact
        const keys = [
          ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "0",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "1",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "2",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "3",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "4",
          ERC725YKeys.LSP6["AddressPermissions[]"].index + "0".repeat(31) + "5",
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            context.owner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangeOwner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanChangePermissions.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanAddPermissions.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanSetData.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressCanSign.address.substring(2),
        ];
        const values = [
          ARRAY_LENGTH.SIX,
          context.owner.address,
          addressCanChangeOwner.address,
          addressCanChangePermissions.address,
          addressCanAddPermissions.address,
          addressCanSetData.address,
          addressCanSign.address,
          ALL_PERMISSIONS,
          PERMISSIONS.CHANGEOWNER,
          PERMISSIONS.CHANGEPERMISSIONS,
          PERMISSIONS.ADDPERMISSIONS,
          PERMISSIONS.SETDATA,
          PERMISSIONS.SIGN,
        ];

        expect(
          await context.token["getData(bytes32[])"](keys)
        ).to.deep.equal(values);
      });

      it("should be allowed to sign messages for the token contract", async () => {
        const dataHash = ethers.utils.hashMessage("Some random message");
        const signature = await addressCanSign.signMessage(
          "Some random message"
        );
        const validityOfTheSig = await context.keyManager.isValidSignature(
          dataHash,
          signature
        );

        expect(validityOfTheSig).to.equal(ERC1271_VALUES.MAGIC_VALUE);
      });

      it("should not be allowed to sign messages for the token contract", async () => {
        const dataHash = ethers.utils.hashMessage("Some random message");
        const signature = await addressCanChangeOwner.signMessage(
          "Some random message"
        );
        const validityOfTheSig = await context.keyManager.isValidSignature(
          dataHash,
          signature
        );

        expect(validityOfTheSig).to.equal(ERC1271_VALUES.FAIL_VALUE);
      });
    });
  });
});
