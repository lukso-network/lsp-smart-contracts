import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ERC725YDataKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  INTERFACE_IDS,
  CALLTYPE,
} from "../../../../constants";

// setup
import { LSP6TestContext } from "../../../utils/context";
import { setupKeyManager } from "../../../utils/fixtures";

// helpers
import {
  combinePermissions,
  combineAllowedCalls,
  encodeCompactBytesArray,
} from "../../../utils/helpers";
import { randomBytes } from "crypto";

export const shouldBehaveLikePermissionChangeOrAddController = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  describe("setting permissions keys (CHANGE vs ADD Permissions)", () => {
    let canOnlyAddController: SignerWithAddress,
      canOnlyEditPermissions: SignerWithAddress,
      canOnlySetData: SignerWithAddress,
      // addresses being used to CHANGE (= edit) permissions
      addressToEditPermissions: SignerWithAddress,
      addressWithZeroHexPermissions: SignerWithAddress;

    let permissionArrayKeys: string[] = [];
    let permissionArrayValues: string[] = [];

    beforeEach(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];
      canOnlySetData = context.accounts[3];
      addressToEditPermissions = context.accounts[4];
      addressWithZeroHexPermissions = context.accounts[5];

      let permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlySetData.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressToEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressWithZeroHexPermissions.address.substring(2),
      ];

      let permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        PERMISSIONS.SETDATA,
        // placeholder permission
        PERMISSIONS.TRANSFERVALUE,
        // 0x0000... = similar to empty, or 'no permissions set'
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ];

      permissionArrayKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000000",
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000001",
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000002",
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000003",
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000004",
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000005",
      ];

      permissionArrayValues = [
        ethers.utils.hexZeroPad(ethers.utils.hexlify(6), 16),
        context.owner.address,
        canOnlyAddController.address,
        canOnlyEditPermissions.address,
        canOnlySetData.address,
        addressToEditPermissions.address,
        addressWithZeroHexPermissions.address,
      ];

      permissionKeys = permissionKeys.concat(permissionArrayKeys);
      permissionValues = permissionValues.concat(permissionArrayValues);

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when setting one permission key", () => {
      describe("when caller is an address with ALL PERMISSIONS", () => {
        it("should be allowed to ADD a permission", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          await context.universalProfile
            .connect(context.owner)
            ["setData(bytes32,bytes)"](key, PERMISSIONS.SETDATA);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(PERMISSIONS.SETDATA);
        });

        it("should be allowed to CHANGE a permission", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          await context.universalProfile
            .connect(context.owner)
            ["setData(bytes32,bytes)"](key, value);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        describe("when editing `AddressPermissions[]` array length", () => {
          it("should be allowed to increment the length", async () => {
            const key = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;

            const currentLength = await context.universalProfile[
              "getData(bytes32)"
            ](key);

            const newLength = ethers.BigNumber.from(currentLength)
              .add(1)
              .toNumber();

            const value = ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newLength),
              16
            );

            await context.universalProfile
              .connect(context.owner)
              ["setData(bytes32,bytes)"](key, value);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });

          it("should be allowed to decrement the length", async () => {
            let key = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;

            let currentLength = await context.universalProfile[
              "getData(bytes32)"
            ](key);

            const newLength = ethers.BigNumber.from(currentLength)
              .sub(1)
              .toNumber();

            const value = ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newLength),
              16
            );

            await context.universalProfile
              .connect(context.owner)
              ["setData(bytes32,bytes)"](key, value);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });
        });

        describe("when adding a new address at index -> AddressPermissions[6]", () => {
          it("should be allowed to set a 20 bytes long address", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let value = ethers.Wallet.createRandom().address.toLowerCase();

            await context.universalProfile
              .connect(context.owner)
              ["setData(bytes32,bytes)"](key, value);

            const result = await context.universalProfile["getData(bytes32)"](
              key
            );
            expect(result).to.equal(value);
          });

          it("should revert when setting a random 10 bytes value", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let randomValue = "0xcafecafecafecafecafe";

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile
                .connect(context.owner)
                ["setData(bytes32,bytes)"](key, randomValue)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });

          it("should revert when setting a random 30 bytes value", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let randomValue =
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile
                .connect(context.owner)
                ["setData(bytes32,bytes)"](key, randomValue)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });
        });

        describe("when editing the value stored at index -> AddressPermissions[4]", () => {
          it("should be allowed to set a new 20 bytes long address", async () => {
            let randomWallet = ethers.Wallet.createRandom();

            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = randomWallet.address;

            await context.universalProfile
              .connect(context.owner)
              ["setData(bytes32,bytes)"](key, value);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(ethers.utils.getAddress(result)).to.equal(value);
          });

          it("should revert when setting a random 10 bytes value", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";
            let randomValue = "0xcafecafecafecafecafe";

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile
                .connect(context.owner)
                ["setData(bytes32,bytes)"](key, randomValue)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });

          it("should revert when setting a random 30 bytes value", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";
            let randomValue =
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile
                .connect(context.owner)
                ["setData(bytes32,bytes)"](key, randomValue)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });
        });

        describe("when removing the address at index -> AddressPermissions[4]", () => {
          it("should pass", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = "0x";

            await context.universalProfile
              .connect(context.owner)
              ["setData(bytes32,bytes)"](key, value);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });
        });

        // this include any permission data key that start with bytes6(keccak256('AddressPermissions'))
        describe("if the data key starts with AddressPermissions: but is a non-standard LSP6 permission data key", () => {
          it("should revert", async () => {
            let beneficiary = context.accounts[8];

            // AddressPermissions:MyCustomPermissions:<address>
            let key =
              "0x4b80742de2bf9e659ba40000" + beneficiary.address.substring(2);

            // the value does not matter in the case of the test here
            let value =
              "0x0000000000000000000000000000000000000000000000000000000000000008";

            await expect(
              context.universalProfile
                .connect(context.owner)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotRecognisedPermissionKey"
              )
              .withArgs(key.toLowerCase());
          });
        });
      });

      describe("when caller is an address with permission ADDCONTROLLER", () => {
        it("should be allowed to ADD a permission", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          await context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should not be allowed to CHANGE a permission", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
        });

        describe("when editing `AddressPermissions[]` array length", () => {
          it("should be allowed to increment the length", async () => {
            const key = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;

            const currentLength = await context.universalProfile[
              "getData(bytes32)"
            ](key);

            const newLength = ethers.BigNumber.from(currentLength)
              .add(1)
              .toNumber();

            const value = ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newLength),
              16
            );

            await context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });

          it("should not be allowed to decrement the length", async () => {
            const key = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;

            const currentLength = await context.universalProfile[
              "getData(bytes32)"
            ](key);

            const newLength = ethers.BigNumber.from(currentLength)
              .sub(1)
              .toNumber();

            let value = ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newLength),
              16
            );

            await expect(
              context.universalProfile
                .connect(canOnlyAddController)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
          });
        });

        describe("when adding a new address at index -> AddressPermissions[6]", () => {
          it("should be allowed to set a new 20 bytes long address", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let value = ethers.Wallet.createRandom().address.toLowerCase();

            await context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value);

            const result = await context.universalProfile["getData(bytes32)"](
              key
            );
            expect(result).to.equal(value);
          });

          it("should revert when setting a random 10 bytes value", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let randomValue = "0xcafecafecafecafecafe";

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile
                .connect(canOnlyAddController)
                ["setData(bytes32,bytes)"](key, randomValue)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });

          it("should revert when setting a random 30 bytes value", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let randomValue =
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";

            await expect(
              context.universalProfile
                .connect(canOnlyAddController)
                ["setData(bytes32,bytes)"](key, randomValue)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });
        });

        describe("when editing the value stored at index -> AddressPermissions[4]", () => {
          it("should not be allowed to set an address", async () => {
            let randomWallet = ethers.Wallet.createRandom();

            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = randomWallet.address;

            await expect(
              context.universalProfile
                .connect(canOnlyAddController)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
          });
        });

        describe("when removing the address at index -> AddressPermissions[4]", () => {
          it("should not be allowed to remove an address", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = "0x";

            await expect(
              context.universalProfile
                .connect(canOnlyAddController)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
          });
        });

        describe("if the data key starts with AddressPermissions: but is a non-standard LSP6 permission data key", () => {
          it("should revert when trying to set a non-standard LSP6 permission data key", async () => {
            // this include any permission data key that start with bytes8(keccak256('AddressPermissions'))
            let beneficiary = context.accounts[8];

            // AddressPermissions:MyCustomPermissions:<address>
            let key =
              "0x4b80742de2bf9e659ba40000" + beneficiary.address.substring(2);

            // the value does not matter in the case of the test here
            let value =
              "0x0000000000000000000000000000000000000000000000000000000000000008";

            await expect(
              context.universalProfile
                .connect(canOnlyAddController)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotRecognisedPermissionKey"
              )
              .withArgs(key.toLowerCase());
          });
        });
      });

      describe("when caller is an address with permission EDITPERMISSIONS", () => {
        it("should not be allowed to ADD a permission", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          let value = PERMISSIONS.SETDATA;

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyEditPermissions.address, "ADDCONTROLLER");
        });

        it("should not be allowed to set (= ADD) a permission for an address that has 32 x 0 bytes (0x0000...0000) as permission value", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            addressWithZeroHexPermissions.address.substring(2);
          let value = PERMISSIONS.SETDATA;

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyEditPermissions.address, "ADDCONTROLLER");
        });

        it("should be allowed to CHANGE a permission", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          await context.universalProfile
            .connect(canOnlyEditPermissions)
            ["setData(bytes32,bytes)"](key, value);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        describe("when editing `AddressPermissions[]` array length", () => {
          it("should not be allowed to increment the 'AddressPermissions[]' key (length)", async () => {
            const key = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;

            const currentLength = await context.universalProfile[
              "getData(bytes32)"
            ](key);

            const newLength = ethers.BigNumber.from(currentLength)
              .add(1)
              .toNumber();

            let value = ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newLength),
              16
            );

            await expect(
              context.universalProfile
                .connect(canOnlyEditPermissions)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyEditPermissions.address, "ADDCONTROLLER");
          });

          it("should be allowed to decrement the 'AddressPermissions[]' key (length)", async () => {
            const key = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;

            const currentLength = await context.universalProfile[
              "getData(bytes32)"
            ](key);

            const newLength = ethers.BigNumber.from(currentLength)
              .sub(1)
              .toNumber();

            const value = ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newLength),
              32
            );

            await context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });
        });

        describe("when adding a new address at index -> AddressPermissions[6]", () => {
          it("should not be allowed", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let value = ethers.Wallet.createRandom().address.toLowerCase();

            await expect(
              context.universalProfile
                .connect(canOnlyEditPermissions)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyEditPermissions.address, "ADDCONTROLLER");
          });
        });

        describe("when editing the value stored at index -> AddressPermissions[4]", () => {
          it("should be allowed", async () => {
            let randomWallet = ethers.Wallet.createRandom();

            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = randomWallet.address;

            await context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(ethers.utils.getAddress(result)).to.equal(value);
          });

          it("should revert when setting a random 10 bytes value", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";
            let randomValue = "0xcafecafecafecafecafe";

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile
                .connect(canOnlyEditPermissions)
                ["setData(bytes32,bytes)"](key, randomValue)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });

          it("should revert when setting a random 30 bytes value", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";
            let randomValue =
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";

            // set some random bytes under AddressPermissions[7]

            await expect(
              context.universalProfile
                .connect(canOnlyEditPermissions)
                ["setData(bytes32,bytes)"](key, randomValue)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });
        });

        describe("when removing the address at index -> AddressPermissions[4]", () => {
          it("should pass", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = "0x";

            await context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });
        });

        describe("if the data key starts with AddressPermissions: but is a non-standard LSP6 permission data key", () => {
          it("should revert when trying to set a non-standard LSP6 permission data key", async () => {
            // this include any permission data key that start with bytes8(keccak256('AddressPermissions'))
            let beneficiary = context.accounts[8];

            // AddressPermissions:MyCustomPermissions:<address>
            let key =
              "0x4b80742de2bf9e659ba40000" + beneficiary.address.substring(2);

            // the value does not matter in the case of the test here
            let value =
              "0x0000000000000000000000000000000000000000000000000000000000000008";

            await expect(
              context.universalProfile
                .connect(canOnlyEditPermissions)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotRecognisedPermissionKey"
              )
              .withArgs(key.toLowerCase());
          });
        });
      });

      describe("when caller is an address with permission SETDATA", () => {
        it("should not be allowed to ADD a permission", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          let value = PERMISSIONS.SETDATA;

          await expect(
            context.universalProfile
              .connect(canOnlySetData)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "ADDCONTROLLER");
        });

        it("should not be allowed to set (= ADD) a permission for an address that has 32 x 0 bytes (0x0000...0000) as permission value", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            addressWithZeroHexPermissions.address.substring(2);
          let value = PERMISSIONS.SETDATA;

          await expect(
            context.universalProfile
              .connect(canOnlySetData)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "ADDCONTROLLER");
        });

        it("should not be allowed to CHANGE a permission", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          await expect(
            context.universalProfile
              .connect(canOnlySetData)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "EDITPERMISSIONS");
        });

        describe("when editing `AddressPermissions[]` array length", () => {
          it("should not be allowed to increment the length", async () => {
            const key = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;

            const currentLength = await context.universalProfile[
              "getData(bytes32)"
            ](key);

            const newLength = ethers.BigNumber.from(currentLength)
              .add(1)
              .toNumber();

            const value = ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newLength),
              16
            );

            await expect(
              context.universalProfile
                .connect(canOnlySetData)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlySetData.address, "ADDCONTROLLER");
          });

          it("should not be allowed to decrement the length", async () => {
            let key = ERC725YDataKeys.LSP6["AddressPermissions[]"].length;

            const currentLength = await context.universalProfile[
              "getData(bytes32)"
            ](key);

            const newLength = ethers.BigNumber.from(currentLength)
              .sub(1)
              .toNumber();

            let value = ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newLength),
              16
            );

            await expect(
              context.universalProfile
                .connect(canOnlySetData)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlySetData.address, "EDITPERMISSIONS");
          });
        });

        describe("when removing the address at index -> AddressPermissions[4]", () => {
          it("should revert", async () => {
            let key =
              ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = "0x";

            await expect(
              context.universalProfile
                .connect(canOnlySetData)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlySetData.address, "EDITPERMISSIONS");
          });
        });

        it("should not be allowed to add a new address at index -> AddressPermissions[6]", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
            "00000000000000000000000000000006";
          let value = ethers.Wallet.createRandom().address.toLowerCase();

          await expect(
            context.universalProfile
              .connect(canOnlySetData)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "ADDCONTROLLER");
        });

        it("should not be allowed to edit key at index -> AddressPermissions[4]", async () => {
          let randomWallet = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions[]"].index +
            "00000000000000000000000000000004";

          let value = randomWallet.address;

          await expect(
            context.universalProfile
              .connect(canOnlySetData)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "EDITPERMISSIONS");
        });

        describe("if the data key starts with AddressPermissions: but is a non-standard LSP6 permission data key", () => {
          it("should revert when trying to set a non-standard LSP6 permission data key", async () => {
            // this include any permission data key that start with bytes8(keccak256('AddressPermissions'))
            let beneficiary = context.accounts[8];

            // AddressPermissions:MyCustomPermissions:<address>
            let key =
              "0x4b80742de2bf9e659ba40000" + beneficiary.address.substring(2);

            // the value does not matter in the case of the test here
            let value =
              "0x0000000000000000000000000000000000000000000000000000000000000008";

            await expect(
              context.universalProfile
                .connect(canOnlySetData)
                ["setData(bytes32,bytes)"](key, value)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotRecognisedPermissionKey"
              )
              .withArgs(key.toLowerCase());
          });
        });
      });

      /**
       *  @todo should test that an address with only the permission SETDATA
       * cannot add or edit permissions
       */
    });
  });

  describe("deleting AllowedCalls", () => {
    let canOnlyAddController: SignerWithAddress,
      canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress;
    let invalidBytes: SignerWithAddress;
    let noBytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBytes = context.accounts[4];
      noBytes = context.accounts[5];

      let permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          invalidBytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          noBytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          noBytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        PERMISSIONS.CALL,
        PERMISSIONS.CALL,
        combineAllowedCalls(
          // allow the beneficiary to transfer value to addresses 0xcafe... and 0xbeef...
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        ),
        "0xbadbadbadbad",
        "0x",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has ADD permission", () => {
      it("should revert and not be allowed to clear the list of allowed calls for an address", async () => {
        const dataKey =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2);
        const dataValue = "0x";

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](dataKey, dataValue)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });
    });

    describe("when caller has CHANGE permission", () => {
      it("should allow to clear the list of allowed calls for an address", async () => {
        const dataKey =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2);
        const dataValue = "0x";

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](dataKey, dataValue);

        const result = await context.universalProfile["getData(bytes32)"](
          dataKey
        );
        expect(result).to.equal(dataValue);
      });
    });
  });

  describe("setting Allowed Calls -> Addresses", () => {
    let canOnlyAddController: SignerWithAddress,
      canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      let permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        combineAllowedCalls(
          // allow the beneficiary to transfer value to addresses 0xcafe... and 0xbeef...
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        ),
        "0x11223344",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has permission ADDCONTROLLER", () => {
      it("should fail when trying to edit existing allowed addresses for an address", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xca11ca11ca11ca11ca11ca11ca11ca11ca11ca11",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary address had an invalid bytes28[CompatBytesArray]", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2);

        // try to set for the invalidBeneficiary some allowed calls
        // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      it("should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          newController.address.substr(2);

        // set for the newController some allowed calls
        // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyAddController)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when setting an invalid bytes28[CompactBytesArray] for a new beneficiary", () => {
        it("should revert with error when value = random bytes", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });

        it("should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing the first length bytes)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            newController.address.substr(2);

          let value =
            "0xffffffffcafecafecafecafecafecafecafecafecafecafeffffffff";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });
      });
    });

    describe("when caller has permission EDITPERMISSIONS", () => {
      it("should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          newController.address.substr(2);

        // try to set for the newController some allowed calls
        // that allow it to transfer value to addresses 0xcafe... and 0xbeef...
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyEditPermissions)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyEditPermissions.address, "ADDCONTROLLER");
      });

      it("should pass when trying to edit existing allowed addresses for an address", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2);

        // edit the allowed calls of the beneficiary
        // still transfering values to 2 x addresses
        // change 2nd address 0xbeef... to 0xf00d...
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xf00df00df00df00df00df00df00df00df00df00d",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had an invalid bytes28[CompactBytesArray] initially", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2);

        // set some allowed calls for the beneficiary
        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should pass when address had 32 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should pass when address had 40 x 0 bytes set initially as allowed addresses", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            "0xcafecafecafecafecafecafecafecafecafecafe",
            "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when changing the list of allowed calls from existing ANY:<address>:ANY to an invalid value", () => {
        it("should revert with error when value = random bytes", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });

        it("should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing the first length byte)", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            beneficiary.address.substring(2);

          let value =
            "0xffffffffcafecafecafecafecafecafecafecafecafecafeffffffff";

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });
      });
    });
  });

  describe("setting Allowed Calls -> Functions", () => {
    let canOnlyAddController: SignerWithAddress,
      canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      let permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xbeefbeef"]
        ),
        "0x11223344",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has permission ADDCONTROLLER", () => {
      it("should fail when trying to edit existing allowed functions for an address", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
          // allow beneficiary to make a CALL to only function selectors 0xcafecafe and 0xf00df00d
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xf00df00d"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary address had an invalid bytes28[CompactBytesArray] initially", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2);

        let value = combineAllowedCalls(
          // allow beneficiary to make a CALL to only function selectors 0xcafecafe and 0xf00df00d
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xf00df00d"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xca11ca11"],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xca11ca11"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      it("should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          newController.address.substr(2);

        let value = combineAllowedCalls(
          // allow beneficiary to CALL only function selectors 0xcafecafe and 0xf00df00d
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xf00df00d"]
        );

        await context.universalProfile
          .connect(canOnlyAddController)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when setting an invalid bytes28[CompactBytesArray] for a new beneficiary", () => {
        it("should fail when setting an invalid bytes28[CompactBytesArray] (= random bytes)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });

        it("should fail when setting an invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            newController.address.substr(2);

          let value =
            "0xffffffffffffffffffffffffffffffffffffffffffffffffcafecafe";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });
      });
    });

    describe("when caller has EDITPERMISSIONS", () => {
      it("should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          newController.address.substr(2);

        let value = combineAllowedCalls(
          // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xbeefbeef"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyEditPermissions)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyEditPermissions.address, "ADDCONTROLLER");
      });

      it("should pass when trying to edit existing allowed bytes4 selectors under ANY:ANY:<selector>", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
          // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xbeefbeef"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had an invalid bytes28[CompactBytesArray] initially", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2);

        let value = combineAllowedCalls(
          // allow beneficiary to CALL only function selectors 0xcafecafe and 0xbeefbeef
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xbeefbeef"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should pass when address had 32 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xbeefbeef"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should pass when address had 40 x 0 bytes set initially as allowed functions", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          ["0xffffffff", "0xffffffff"],
          ["0xcafecafe", "0xbeefbeef"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when changing the list of selectors in allowed calls from existing ANY:ANY:<selector> to an invalid value", () => {
        it("should revert with error when value = random bytes", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });

        it("should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            beneficiary.address.substring(2);

          let value =
            "0xffffffffffffffffffffffffffffffffffffffffffffffffcafecafe";

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });
      });
    });
  });

  describe("setting Allowed Calls -> Standards", () => {
    let canOnlyAddController: SignerWithAddress,
      canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      let permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        combineAllowedCalls(
          // allow beneficiary controller to CALL any functions
          // on any LSP7 or ERC20 contracts
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ["0xffffffff", "0xffffffff"]
        ),
        "0x11223344",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has ADDCONTROLLER", () => {
      it("should fail when trying to edit existing allowed standards for an address", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [
            INTERFACE_IDS.LSP7DigitalAsset,
            INTERFACE_IDS.ERC20,
            // add NFT standards (new LSP8 + old ERC721)
            // in the list of allowed calls for the beneficiary controller
            // (in addition to token contracts LSP7 + ERC20)
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
            INTERFACE_IDS.ERC721,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary address had an invalid bytes28[CompactBytesArray] initially", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [
            INTERFACE_IDS.LSP7DigitalAsset,
            INTERFACE_IDS.ERC20,
            // add NFT standards (new LSP8 + old ERC721)
            // in the list of allowed calls for the beneficiary controller
            // (in addition to token standards LSP7 + ERC20)
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
            INTERFACE_IDS.ERC721,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [
            INTERFACE_IDS.LSP7DigitalAsset,
            INTERFACE_IDS.ERC20,
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
            INTERFACE_IDS.ERC721,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [
            INTERFACE_IDS.LSP7DigitalAsset,
            INTERFACE_IDS.ERC20,
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
            INTERFACE_IDS.ERC721,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
      });

      it("should pass when beneficiary had no values set under AddressPermissions:AllowedCalls:... + setting a valid bytes28[CompactBytesArray]", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          newController.address.substr(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [
            INTERFACE_IDS.LSP7DigitalAsset,
            INTERFACE_IDS.ERC20,
            // add NFT standards (new LSP8 + old ERC721)
            // in the list of allowed calls for the beneficiary controller
            // (in addition to token standards LSP7 + ERC20)
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
            INTERFACE_IDS.ERC721,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyAddController)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when setting an invalid bytes28[CompactBytesArray] of allowed calls for a new beneficiary", () => {
        it("should fail when setting an bytes28[CompactBytesArray] (= random bytes)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });

        it("should fail when setting an invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            newController.address.substr(2);

          let value =
            "0xffffffffffffffffffffffffffffffffffffffffffffffffcafecafe";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });
      });
    });

    describe("when caller has EDITPERMISSIONS", () => {
      it("should fail when beneficiary had no values set under AddressPermissions:AllowedCalls:...", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          newController.address.substr(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          // try to add in the list of allowed calls for the beneficiary controller
          // the rights to CALL any LSP7 or ERC20 token contract
          // (NB: just the AllowedCalls, not the permission CALL)
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ["0xffffffff", "0xffffffff"]
        );

        await expect(
          context.universalProfile
            .connect(canOnlyEditPermissions)
            ["setData(bytes32,bytes)"](key, value)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyEditPermissions.address, "ADDCONTROLLER");
      });

      it("should pass when trying to edit existing allowed standards for an address", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          beneficiary.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [
            INTERFACE_IDS.LSP7DigitalAsset,
            INTERFACE_IDS.ERC20,
            // add NFT standards (new LSP8 + old ERC721)
            // in the list of allowed calls for the beneficiary controller
            // (in addition to token standards LSP7 + ERC20)
            INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
            INTERFACE_IDS.ERC721,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had an invalid bytes28[CompactBytesArray] initially", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          invalidBeneficiary.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ["0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should pass when address had 32 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero32Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ["0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      /**
       * TODO: this test pass but behaviour when some zero bytes are stored must be clarified.
       */
      it.skip("should pass when address had 40 x 0 bytes set initially as allowed calls", async () => {
        let key =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          zero40Bytes.address.substring(2);

        let value = combineAllowedCalls(
          [CALLTYPE.WRITE, CALLTYPE.WRITE],
          [
            "0xffffffffffffffffffffffffffffffffffffffff",
            "0xffffffffffffffffffffffffffffffffffffffff",
          ],
          [INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20],
          ["0xffffffff", "0xffffffff"]
        );

        await context.universalProfile
          .connect(canOnlyEditPermissions)
          ["setData(bytes32,bytes)"](key, value);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when changing the list of interface IDs in allowed calls <standard>:ANY:ANY to an invalid value", () => {
        it("should revert with error when value = random bytes", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });

        it("should revert with error when value = invalid bytes28[CompactBytesArray] (not enough bytes, missing first length byte)", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            beneficiary.address.substring(2);

          let value =
            "0xffffffffffffffffffffffffffffffffffffffffffffffffcafecafe";

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidEncodedAllowedCalls"
            )
            .withArgs(value);
        });
      });
    });
  });

  describe("setting Allowed ERC725YDataKeys", () => {
    let canOnlyAddController: SignerWithAddress,
      canOnlyEditPermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      canOnlyAddController = context.accounts[1];
      canOnlyEditPermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      let permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
          beneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
          invalidBeneficiary.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
          zero32Bytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
          zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDCONTROLLER,
        PERMISSIONS.EDITPERMISSIONS,
        encodeCompactBytesArray([
          ERC725YDataKeys.LSP3["LSP3Profile"],
          // prettier-ignore
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
        ]),
        "0x11223344",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has ADDCONTROLLER", () => {
      describe("when beneficiary had some ERC725Y data keys set under AddressPermissions:AllowedERC725YDataKeys:...", () => {
        it("should fail when adding an extra allowed ERC725Y data key", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            beneficiary.address.substring(2);

          let value = encodeCompactBytesArray([
            ERC725YDataKeys.LSP3["LSP3Profile"],
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Another Custom Data Key")),
          ]);

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
        });

        it("should fail when removing an allowed ERC725Y data key", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            beneficiary.address.substring(2);

          let value = encodeCompactBytesArray([
            ERC725YDataKeys.LSP3["LSP3Profile"],
          ]);

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
        });

        it("should fail when trying to clear the CompactedBytesArray completely", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            beneficiary.address.substring(2);

          let value = "0x";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyAddController.address, "EDITPERMISSIONS");
        });

        it("should fail when setting an invalid CompactedBytesArray", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "InvalidEncodedAllowedERC725YDataKeys"
          );
        });
      });

      describe("when beneficiary had no ERC725Y data keys set under AddressPermissions:AllowedERC725YDataKeys:...", () => {
        it("should pass when setting a valid CompactedBytesArray", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            newController.address.substr(2);

          let value = encodeCompactBytesArray([
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Profile Key 1")),
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Profile Key 2")),
          ]);

          await context.universalProfile
            .connect(canOnlyAddController)
            ["setData(bytes32,bytes)"](key, value);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should fail when setting an invalid CompactedBytesArray (random bytes)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyAddController)
              ["setData(bytes32,bytes)"](key, value)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "InvalidEncodedAllowedERC725YDataKeys"
          );
        });
      });
    });

    describe("when caller has EDITPERMISSIONS", () => {
      describe("when beneficiary had some ERC725Y data keys set under AddressPermissions:AllowedERC725YDataKeys:...", () => {
        it("should pass when adding an extra allowed ERC725Y data key", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            beneficiary.address.substring(2);

          let value = encodeCompactBytesArray([
            ERC725YDataKeys.LSP3["LSP3Profile"],
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Another Custom Data Key")),
          ]);

          await context.universalProfile
            .connect(canOnlyEditPermissions)
            ["setData(bytes32,bytes)"](key, value);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should pass when removing an allowed ERC725Y data key", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            beneficiary.address.substring(2);

          let value = encodeCompactBytesArray([
            ERC725YDataKeys.LSP3["LSP3Profile"],
          ]);

          await context.universalProfile
            .connect(canOnlyEditPermissions)
            ["setData(bytes32,bytes)"](key, value);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should pass when trying to clear the CompactedBytesArray completely", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            beneficiary.address.substring(2);

          let value = "0x";

          await context.universalProfile
            .connect(canOnlyEditPermissions)
            ["setData(bytes32,bytes)"](key, value);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should fail when setting an invalid CompactedBytesArray", async () => {
          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "InvalidEncodedAllowedERC725YDataKeys"
          );
        });
      });

      describe("when beneficiary had no ERC725Y data keys set under AddressPermissions:AllowedERC725YDataKeys:...", () => {
        it("should fail and not authorize to add a list of allowed ERC725Y data keys (not authorised)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            newController.address.substr(2);

          let value = encodeCompactBytesArray([
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Key 1")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Key 2")),
          ]);

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyEditPermissions.address, "ADDCONTROLLER");
        });

        it("should fail when setting an invalid CompactedBytesArray", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          await expect(
            context.universalProfile
              .connect(canOnlyEditPermissions)
              ["setData(bytes32,bytes)"](key, value)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "InvalidEncodedAllowedERC725YDataKeys"
          );
        });
      });
    });
  });

  describe("setting mixed keys (SETDATA, CHANGE & ADD Permissions)", () => {
    let canSetDataAndAddController: SignerWithAddress,
      canSetDataAndEditPermissions: SignerWithAddress;
    // addresses being used to CHANGE (= edit) permissions
    let addressesToEditPermissions: [SignerWithAddress, SignerWithAddress];

    const allowedERC725YDataKeys = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Second Key")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Third Key")),
    ];

    beforeEach(async () => {
      context = await buildContext();

      canSetDataAndAddController = context.accounts[1];
      canSetDataAndEditPermissions = context.accounts[2];

      addressesToEditPermissions = [context.accounts[3], context.accounts[4]];

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canSetDataAndAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
          canSetDataAndAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canSetDataAndEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] +
          canSetDataAndEditPermissions.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressesToEditPermissions[0].address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          addressesToEditPermissions[1].address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.ADDCONTROLLER),
        encodeCompactBytesArray(allowedERC725YDataKeys),
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.EDITPERMISSIONS),
        encodeCompactBytesArray(allowedERC725YDataKeys),
        // placeholder permission
        PERMISSIONS.TRANSFERVALUE,
        PERMISSIONS.TRANSFERVALUE,
        // AddressPermissions[].length
        ethers.utils.hexZeroPad(ethers.utils.hexlify(5), 16),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when setting multiple keys", () => {
      describe("when caller is an address with ALL PERMISSIONS", () => {
        it("(should pass): 2 x keys + add 2 x new permissions", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          await context.universalProfile
            .connect(context.owner)
            ["setData(bytes32[],bytes[])"](keys, values);

          // prettier-ignore
          const fetchedResult = await context.universalProfile["getData(bytes32[])"](keys);
          expect(fetchedResult).to.deep.equal(values);
        });

        it("(should pass): 2 x keys + change 2 x existing permissions", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My 1st Key")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My 2nd Key")),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          await context.universalProfile
            .connect(context.owner)
            ["setData(bytes32[],bytes[])"](keys, values);

          // prettier-ignore
          const fetchedResult = await context.universalProfile["getData(bytes32[])"](keys);
          expect(fetchedResult).to.deep.equal(values);
        });

        it("(should pass): 2 x keys + (add 1 x new permission) + (change 1 x existing permission)", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          await context.universalProfile
            .connect(context.owner)
            ["setData(bytes32[],bytes[])"](keys, values);

          // prettier-ignore
          const fetchedResult = await context.universalProfile["getData(bytes32[])"](keys);
          expect(fetchedResult).to.deep.equal(values);
        });
      });

      describe("when caller is an address with permission SETDATA + ADDCONTROLLER + 3x Allowed ERC725Y data keys", () => {
        it("(should pass): 2 x allowed data keys + add 2 x new controllers", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Second Key")),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          await context.universalProfile
            .connect(canSetDataAndAddController)
            ["setData(bytes32[],bytes[])"](keys, values);

          expect(
            await context.universalProfile["getData(bytes32[])"](keys)
          ).to.deep.equal(values);
        });

        it("(should pass): 2 x allowed data keys + add 2 x new controllers + increment AddressPermissions[].length by +2", async () => {
          const currentPermissionsArrayLength = await context.universalProfile[
            "getData(bytes32)"
          ](ERC725YDataKeys.LSP6["AddressPermissions[]"].length);

          const newPermissionsArrayLength = ethers.BigNumber.from(
            currentPermissionsArrayLength
          )
            .add(1)
            .toNumber();

          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          let keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            ethers.utils.hexZeroPad(
              ethers.utils.hexlify(newPermissionsArrayLength),
              16
            ),
          ];

          await context.universalProfile
            .connect(canSetDataAndAddController)
            ["setData(bytes32[],bytes[])"](keys, values);

          expect(
            await context.universalProfile["getData(bytes32[])"](keys)
          ).to.deep.equal(values);
        });

        it("(should fail): 2 x allowed data keys + add 2 x new controllers + decrement AddressPermissions[].length by -1", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          let keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            ethers.utils.hexZeroPad(ethers.utils.hexlify(5), 16),
          ];

          await expect(
            context.universalProfile
              .connect(canSetDataAndAddController)
              ["setData(bytes32[],bytes[])"](keys, values)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndAddController.address, "EDITPERMISSIONS");
        });

        it("(should fail): 2 x allowed data keys + edit permissions of 2 x existing controllers", async () => {
          let keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          await expect(
            context.universalProfile
              .connect(canSetDataAndAddController)
              ["setData(bytes32[],bytes[])"](keys, values)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndAddController.address, "EDITPERMISSIONS");
        });

        it("(should fail): 2 x allowed data keys + (add 1 x new controller) + (edit permission of 1 x existing controller)", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          await expect(
            context.universalProfile
              .connect(canSetDataAndAddController)
              ["setData(bytes32[],bytes[])"](keys, values)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndAddController.address, "EDITPERMISSIONS");
        });

        it("(should fail): 1 x allowed data key + 1 x NOT allowed data key + 2 x new controllers", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          const NotAllowedERC725YDataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("Not Allowed Data Key")
          );

          // prettier-ignore
          let dataKeys = [
            allowedERC725YDataKeys[0],
            NotAllowedERC725YDataKey,
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
          ];

          // prettier-ignore
          let dataValues = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Random data for not allowed value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [dataKeys, dataValues]
          );

          await expect(
            context.universalProfile
              .connect(canSetDataAndAddController)
              ["setData(bytes32[],bytes[])"](dataKeys, dataValues)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "NotAllowedERC725YDataKey"
            )
            .withArgs(
              canSetDataAndAddController.address,
              NotAllowedERC725YDataKey
            );
        });
      });

      describe("when caller is an address with permission SETDATA + EDITPERMISSIONS + 3x Allowed ERC725Y data keys", () => {
        it("(should pass): 2 x allowed data keys + remove 2 x addresses with permissions + decrement AddressPermissions[].length by -2", async () => {
          let keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 16),
          ];

          await context.universalProfile
            .connect(canSetDataAndEditPermissions)
            ["setData(bytes32[],bytes[])"](keys, values);

          expect(
            await context.universalProfile["getData(bytes32[])"](keys)
          ).to.deep.equal(values);
        });

        it("(should pass): 2 x allowed data keys + edit permissions of 2 x existing controllers", async () => {
          let keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          await context.universalProfile
            .connect(canSetDataAndEditPermissions)
            ["setData(bytes32[],bytes[])"](keys, values);

          expect(
            await context.universalProfile["getData(bytes32[])"](keys)
          ).to.deep.equal(values);
        });

        it("(should fail): 2 x allowed data keys + add 2 x new controllers", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          let keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          await expect(
            context.universalProfile
              .connect(canSetDataAndEditPermissions)
              ["setData(bytes32[],bytes[])"](keys, values)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndEditPermissions.address, "ADDCONTROLLER");
        });

        it("(should fail): 2 x allowed data keys + increment AddressPermissions[].length by +1", async () => {
          const currentArrayLength = await context.universalProfile[
            "getData(bytes32)"
          ](ERC725YDataKeys.LSP6["AddressPermissions[]"].length);

          const newArrayLength = ethers.BigNumber.from(currentArrayLength)
            .add(1)
            .toNumber();

          let keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            ethers.utils.hexZeroPad(ethers.utils.hexlify(newArrayLength), 16),
          ];

          await expect(
            context.universalProfile
              .connect(canSetDataAndEditPermissions)
              ["setData(bytes32[],bytes[])"](keys, values)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndEditPermissions.address, "ADDCONTROLLER");
        });

        it("(should fail): 2 x allowed data keys + (add 1 x new permission) + (edit permission of 1 x existing controller)", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();

          let keys = [
            allowedERC725YDataKeys[0],
            allowedERC725YDataKeys[1],
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          await expect(
            context.universalProfile
              .connect(canSetDataAndEditPermissions)
              ["setData(bytes32[],bytes[])"](keys, values)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndEditPermissions.address, "ADDCONTROLLER");
        });

        it("(should fail): edit permissions of 2 x existing controllers + (set 1 x allowed data key) + (set 1 x NOT allowed data key)", async () => {
          const NotAllowedERC725YDataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("Not Allowed Data Key")
          );

          let keys = [
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
            allowedERC725YDataKeys[0],
            NotAllowedERC725YDataKey,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            ethers.utils.hexlify(
              ethers.utils.toUtf8Bytes("Random data for not allowed value")
            ),
          ];

          await expect(
            context.universalProfile
              .connect(canSetDataAndEditPermissions)
              ["setData(bytes32[],bytes[])"](keys, values)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "NotAllowedERC725YDataKey"
            )
            .withArgs(
              canSetDataAndEditPermissions.address,
              NotAllowedERC725YDataKey
            );
        });
      });
    });
  });
};
