import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  INTERFACE_IDS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import {
  abiCoder,
  combinePermissions,
  encodeCompactedBytes,
} from "../../utils/helpers";

export const shouldBehaveLikePermissionChangeOrAddPermissions = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  describe("setting permissions keys (CHANGE vs ADD Permissions)", () => {
    let canOnlyAddPermissions: SignerWithAddress,
      canOnlyChangePermissions: SignerWithAddress,
      canOnlySetData: SignerWithAddress,
      // addresses being used to CHANGE (= edit) permissions
      addressToEditPermissions: SignerWithAddress,
      addressWithZeroHexPermissions: SignerWithAddress;

    let permissionArrayKeys: string[] = [];
    let permissionArrayValues: string[] = [];

    beforeEach(async () => {
      context = await buildContext();

      canOnlyAddPermissions = context.accounts[1];
      canOnlyChangePermissions = context.accounts[2];
      canOnlySetData = context.accounts[3];
      addressToEditPermissions = context.accounts[4];
      addressWithZeroHexPermissions = context.accounts[5];

      let permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyChangePermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlySetData.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressToEditPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressWithZeroHexPermissions.address.substring(2),
      ];

      let permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.ADDPERMISSIONS,
        PERMISSIONS.CHANGEPERMISSIONS,
        PERMISSIONS.SETDATA,
        // placeholder permission
        PERMISSIONS.TRANSFERVALUE,
        // 0x0000... = similar to empty, or 'no permissions set'
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ];

      permissionArrayKeys = [
        ERC725YKeys.LSP6["AddressPermissions[]"].length,
        ERC725YKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000000",
        ERC725YKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000001",
        ERC725YKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000002",
        ERC725YKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000003",
        ERC725YKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000004",
        ERC725YKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000005",
      ];

      permissionArrayValues = [
        ethers.utils.hexZeroPad(ethers.utils.hexlify(6), 32),
        context.owner.address,
        canOnlyAddPermissions.address,
        canOnlyChangePermissions.address,
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
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, PERMISSIONS.SETDATA]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(PERMISSIONS.SETDATA);
        });

        it("should be allowed to CHANGE a permission", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        describe("when editing `AddressPermissions[]` array length", () => {
          it("should be allowed to increment the length", async () => {
            let key = ERC725YKeys.LSP6["AddressPermissions[]"].length;
            let value = ethers.utils.hexZeroPad(ethers.utils.hexlify(8), 32);

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager.connect(context.owner).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });

          it("should be allowed to decrement the length", async () => {
            let key = ERC725YKeys.LSP6["AddressPermissions[]"].length;
            let value = ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 32);

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager.connect(context.owner).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });
        });

        describe("when adding a new address at index -> AddressPermissions[6]", () => {
          it("should be allowed to set a 20 bytes long address", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let value = ethers.Wallet.createRandom().address.toLowerCase();

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager.connect(context.owner).execute(payload);

            const result = await context.universalProfile["getData(bytes32)"](
              key
            );
            expect(result).to.equal(value);
          });

          it("should revert when setting a random 10 bytes value", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let randomValue = "0xcafecafecafecafecafe";

            // set some random bytes under AddressPermissions[7]
            let setupPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, randomValue]
              );

            await expect(
              context.keyManager.connect(context.owner).execute(setupPayload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });

          it("should revert when setting a random 30 bytes value", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let randomValue =
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";

            // set some random bytes under AddressPermissions[7]
            let setupPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, randomValue]
              );

            await expect(
              context.keyManager.connect(context.owner).execute(setupPayload)
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
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = randomWallet.address;

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager.connect(context.owner).execute(payload);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(ethers.utils.getAddress(result)).to.equal(value);
          });

          it("should revert when setting a random 10 bytes value", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";
            let randomValue = "0xcafecafecafecafecafe";

            // set some random bytes under AddressPermissions[7]
            let setupPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, randomValue]
              );

            await expect(
              context.keyManager.connect(context.owner).execute(setupPayload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });

          it("should revert when setting a random 30 bytes value", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";
            let randomValue =
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";

            // set some random bytes under AddressPermissions[7]
            let setupPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, randomValue]
              );

            await expect(
              context.keyManager.connect(context.owner).execute(setupPayload)
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
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = "0x";

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager.connect(context.owner).execute(payload);

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

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(context.owner).execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotRecognisedPermissionKey"
              )
              .withArgs(key.toLowerCase());
          });
        });
      });

      describe("when caller is an address with permission ADDPERMISSIONS", () => {
        it("should be allowed to ADD a permission", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager
            .connect(canOnlyAddPermissions)
            .execute(payload);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should not be allowed to CHANGE a permission", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
        });

        describe("when editing `AddressPermissions[]` array length", () => {
          it("should be allowed to increment the length", async () => {
            let key = ERC725YKeys.LSP6["AddressPermissions[]"].length;
            let value = ethers.utils.hexZeroPad(ethers.utils.hexlify(8), 32);

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager
              .connect(canOnlyAddPermissions)
              .execute(payload);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });

          it("should not be allowed to decrement the length", async () => {
            let key = ERC725YKeys.LSP6["AddressPermissions[]"].length;
            let value = ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 32);

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(canOnlyAddPermissions).execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
          });
        });

        describe("when adding a new address at index -> AddressPermissions[6]", () => {
          it("should be allowed to set a new 20 bytes long address", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let value = ethers.Wallet.createRandom().address.toLowerCase();

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager
              .connect(canOnlyAddPermissions)
              .execute(payload);

            const result = await context.universalProfile["getData(bytes32)"](
              key
            );
            expect(result).to.equal(value);
          });

          it("should revert when setting a random 10 bytes value", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let randomValue = "0xcafecafecafecafecafe";

            // set some random bytes under AddressPermissions[7]
            let setupPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, randomValue]
              );

            await expect(
              context.keyManager
                .connect(canOnlyAddPermissions)
                .execute(setupPayload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });

          it("should revert when setting a random 30 bytes value", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let randomValue =
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";

            // set some random bytes under AddressPermissions[7]
            let setupPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, randomValue]
              );

            await expect(
              context.keyManager
                .connect(canOnlyAddPermissions)
                .execute(setupPayload)
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
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = randomWallet.address;

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(canOnlyAddPermissions).execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
          });
        });

        describe("when removing the address at index -> AddressPermissions[4]", () => {
          it("should not be allowed to remove an address", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = "0x";

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(canOnlyAddPermissions).execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
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

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(canOnlyAddPermissions).execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotRecognisedPermissionKey"
              )
              .withArgs(key.toLowerCase());
          });
        });
      });

      describe("when caller is an address with permission CHANGEPERMISSION", () => {
        it("should not be allowed to ADD a permission", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyChangePermissions.address, "ADDPERMISSIONS");
        });

        it("should not be allowed to set (= ADD) a permission for an address that has 32 x 0 bytes (0x0000...0000) as permission value", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressWithZeroHexPermissions.address.substring(2);
          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyChangePermissions.address, "ADDPERMISSIONS");
        });

        it("should be allowed to CHANGE a permission", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager
            .connect(canOnlyChangePermissions)
            .execute(payload);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        describe("when editing `AddressPermissions[]` array length", () => {
          it("should not be allowed to increment the 'AddressPermissions[]' key (length)", async () => {
            let key = ERC725YKeys.LSP6["AddressPermissions[]"].length;
            let value = ethers.utils.hexZeroPad(ethers.utils.hexlify(8), 32);

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager
                .connect(canOnlyChangePermissions)
                .execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyChangePermissions.address, "ADDPERMISSIONS");
          });

          it("should be allowed to decrement the 'AddressPermissions[]' key (length)", async () => {
            let key = ERC725YKeys.LSP6["AddressPermissions[]"].length;
            let value = ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 32);

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(result).to.equal(value);
          });
        });

        describe("when adding a new address at index -> AddressPermissions[6]", () => {
          it("should not be allowed", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000006";
            let value = ethers.Wallet.createRandom().address.toLowerCase();

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager
                .connect(canOnlyChangePermissions)
                .execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlyChangePermissions.address, "ADDPERMISSIONS");
          });
        });

        describe("when editing the value stored at index -> AddressPermissions[4]", () => {
          it("should be allowed", async () => {
            let randomWallet = ethers.Wallet.createRandom();

            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = randomWallet.address;

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload);

            // prettier-ignore
            const result = await context.universalProfile["getData(bytes32)"](key);
            expect(ethers.utils.getAddress(result)).to.equal(value);
          });

          it("should revert when setting a random 10 bytes value", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";
            let randomValue = "0xcafecafecafecafecafe";

            // set some random bytes under AddressPermissions[7]
            let setupPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, randomValue]
              );

            await expect(
              context.keyManager
                .connect(canOnlyChangePermissions)
                .execute(setupPayload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "AddressPermissionArrayIndexValueNotAnAddress"
              )
              .withArgs(key, randomValue);
          });

          it("should revert when setting a random 30 bytes value", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";
            let randomValue =
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef";

            // set some random bytes under AddressPermissions[7]
            let setupPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, randomValue]
              );

            await expect(
              context.keyManager
                .connect(canOnlyChangePermissions)
                .execute(setupPayload)
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
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = "0x";

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload);

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

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager
                .connect(canOnlyChangePermissions)
                .execute(payload)
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
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlySetData).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "ADDPERMISSIONS");
        });

        it("should not be allowed to set (= ADD) a permission for an address that has 32 x 0 bytes (0x0000...0000) as permission value", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressWithZeroHexPermissions.address.substring(2);
          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlySetData).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "ADDPERMISSIONS");
        });

        it("should not be allowed to CHANGE a permission", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = PERMISSIONS.SETDATA;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlySetData).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "CHANGEPERMISSIONS");
        });

        describe("when editing `AddressPermissions[]` array length", () => {
          it("should not be allowed to increment the length", async () => {
            let key = ERC725YKeys.LSP6["AddressPermissions[]"].length;
            let value = ethers.utils.hexZeroPad(ethers.utils.hexlify(8), 32);

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(canOnlySetData).execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlySetData.address, "ADDPERMISSIONS");
          });

          it("should not be allowed to decrement the length", async () => {
            let key = ERC725YKeys.LSP6["AddressPermissions[]"].length;
            let value = ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 32);

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(canOnlySetData).execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlySetData.address, "CHANGEPERMISSIONS");
          });
        });

        describe("when removing the address at index -> AddressPermissions[4]", () => {
          it("should revert", async () => {
            let key =
              ERC725YKeys.LSP6["AddressPermissions[]"].index +
              "00000000000000000000000000000004";

            let value = "0x";

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(canOnlySetData).execute(payload)
            )
              .to.be.revertedWithCustomError(
                context.keyManager,
                "NotAuthorised"
              )
              .withArgs(canOnlySetData.address, "CHANGEPERMISSIONS");
          });
        });

        it("should not be allowed to add a new address at index -> AddressPermissions[6]", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions[]"].index +
            "00000000000000000000000000000006";
          let value = ethers.Wallet.createRandom().address.toLowerCase();

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlySetData).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "ADDPERMISSIONS");
        });

        it("should not be allowed to edit key at index -> AddressPermissions[4]", async () => {
          let randomWallet = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions[]"].index +
            "00000000000000000000000000000004";

          let value = randomWallet.address;

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlySetData).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlySetData.address, "CHANGEPERMISSIONS");
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

            let payload = context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

            await expect(
              context.keyManager.connect(canOnlySetData).execute(payload)
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

  describe("setting Allowed Addresses", () => {
    let canOnlyAddPermissions: SignerWithAddress,
      canOnlyChangePermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      canOnlyAddPermissions = context.accounts[1];
      canOnlyChangePermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      let permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyChangePermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          beneficiary.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          invalidBeneficiary.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          zero32Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDPERMISSIONS,
        PERMISSIONS.CHANGEPERMISSIONS,
        abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        ),
        "0x11223344",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has permission ADDPERMISSIONS", () => {
      it("should fail when trying to edit existing allowed addresses for an address", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          beneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xca11ca11ca11ca11ca11ca11ca11ca11ca11ca11",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary address had an invalid abi-encoded array of address[] initially", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          invalidBeneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed addresses", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          zero32Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed addresses", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          zero40Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should pass when beneficiary had no values set under AddressPermissions:AllowedAddresses:... + setting a valid abi-encoded array of address[] (= with 12 x leading '00')", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          newController.address.substr(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyAddPermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when setting an invalid abi-encoded array of address[] for a new beneficiary", () => {
        it("should revert with error when value = random bytes", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "address");
        });

        it("should revert with error when value = invalid abi-encoded array of address[] (not enough leading zero bytes for an address -> 10 x '00')", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            newController.address.substr(2);

          let value =
            "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000cafecafecafecafecafecafecafecafecafecafecafe";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "address");
        });
      });
    });

    describe("when caller has permission CHANGEPERMISSIONS", () => {
      it("should fail when beneficiary had no values set under AddressPermissions:AllowedAddresses:...", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          newController.address.substr(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyChangePermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyChangePermissions.address, "ADDPERMISSIONS");
      });

      it("should pass when trying to edit existing allowed addresses for an address", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          beneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xca11ca11ca11ca11ca11ca11ca11ca11ca11ca11",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had an invalid abi-encoded array of address[] initially", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          invalidBeneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had 32 x 0 bytes set initially as allowed addresses", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          zero32Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had 40 x 0 bytes set initially as allowed addresses", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
          zero40Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["address[]"],
          [
            [
              "0xcafecafecafecafecafecafecafecafecafecafe",
              "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when changing the list of allowed address of existing address to an invalid value", () => {
        it("should revert with error when value = random bytes", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "address");
        });

        it("should revert with error when value = invalid abi-encoded array of address[] (not enough leading zero bytes for an address -> 10 x '00')", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            beneficiary.address.substring(2);

          let value =
            "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000100000000000000000000cafecafecafecafecafecafecafecafecafecafecafe";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "address");
        });
      });
    });
  });

  describe("setting Allowed Functions", () => {
    let canOnlyAddPermissions: SignerWithAddress,
      canOnlyChangePermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      canOnlyAddPermissions = context.accounts[1];
      canOnlyChangePermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      let permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyChangePermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          beneficiary.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          invalidBeneficiary.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          zero32Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDPERMISSIONS,
        PERMISSIONS.CHANGEPERMISSIONS,
        abiCoder.encode(["bytes4[]"], [["0xcafecafe", "0xbeefbeef"]]),
        "0x11223344",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has permission ADDPERMISSIONS", () => {
      it("should fail when trying to edit existing allowed functions for an address", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          beneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xca11ca11"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary address had an invalid abi-encoded array of bytes4[] initially", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          invalidBeneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xca11ca11"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed functions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          zero32Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xca11ca11"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed functions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          zero40Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xca11ca11"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should pass when beneficiary had no values set under AddressPermissions:AllowedFunctions:... + setting a valid abi-encoded array of bytes4[] (= 28 leading zeros)", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          newController.address.substr(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xbeefbeef"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyAddPermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when setting an invalid abi-encoded array of bytes4[] selector for a new beneficiary", () => {
        it("should fail when setting an invalid abi-encoded array of bytes4[] (= random bytes)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "bytes4");
        });

        it("should fail when setting an invalid abi-encoded array of bytes4[] (not enough leading zero bytes for a bytes4 value -> 26 x '00')", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
            newController.address.substr(2);

          let value =
            "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000cafecafecafe";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "bytes4");
        });
      });
    });

    describe("when caller has CHANGEPERMISSIONS", () => {
      it("should fail when beneficiary had no values set under AddressPermissions:AllowedFunctions:...", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          newController.address.substr(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xbeefbeef"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyChangePermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyChangePermissions.address, "ADDPERMISSIONS");
      });

      it("should pass when trying to edit existing allowed bytes4 selectors for an address", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          beneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xca11ca11"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had an invalid abi-encoded array of bytes4[] initially", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          invalidBeneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xbeefbeef"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had 32 x 0 bytes set initially as allowed functions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          zero32Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xbeefbeef"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had 40 x 0 bytes set initially as allowed functions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
          zero40Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [["0xcafecafe", "0xbeefbeef"]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when changing the list of allowed bytes4 function selectors to an invalid value", () => {
        it("should revert with error when value = random bytes", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "bytes4");
        });

        it("should revert with error when value = invalid abi-encoded array of bytes4[] (not enough leading zero bytes for a bytes4 value -> 26 x '00')", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedFunctions"] +
            beneficiary.address.substring(2);

          let value =
            "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000cafecafecafe";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "bytes4");
        });
      });
    });
  });

  describe("setting Allowed Standards", () => {
    let canOnlyAddPermissions: SignerWithAddress,
      canOnlyChangePermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      canOnlyAddPermissions = context.accounts[1];
      canOnlyChangePermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      let permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyChangePermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          beneficiary.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          invalidBeneficiary.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          zero32Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDPERMISSIONS,
        PERMISSIONS.CHANGEPERMISSIONS,
        abiCoder.encode(
          ["bytes4[]"],
          [[INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20]]
        ),
        "0x11223344",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has ADDPERMISSIONS", () => {
      it("should fail when trying to edit existing allowed standards for an address", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          beneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset, // try to allow interacting with NFTs
              INTERFACE_IDS.ERC721,
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary address had an invalid abi-encoded array of bytes4[] initially", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          invalidBeneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset, // try to allow interacting with NFTs
              INTERFACE_IDS.ERC721,
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary had 32 x 0 bytes set initially as allowed functions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          zero32Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset, // try to allow interacting with NFTs
              INTERFACE_IDS.ERC721,
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should fail with NotAuthorised -> when beneficiary had 40 x 0 bytes set initially as allowed functions", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          zero40Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset, // try to allow interacting with NFTs
              INTERFACE_IDS.ERC721,
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyAddPermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
      });

      it("should pass when beneficiary had no values set under AddressPermissions:AllowedStandards:... + setting a valid abi-encoded array of bytes4[] (= 28 leading zeros)", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          newController.address.substr(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset, // try to allow interacting with NFTs
              INTERFACE_IDS.ERC721,
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyAddPermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when setting an invalid abi-encoded array of bytes4[] interface IDs for a new beneficiary", () => {
        it("should fail when setting an invalid abi-encoded array of bytes4[] (= random bytes)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "bytes4");
        });

        it("should fail when setting an invalid abi-encoded array of bytes4[] (not enough leading zero bytes for a bytes4 value -> 26 x '00')", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
            newController.address.substr(2);

          let value =
            "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000cafecafecafe";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "bytes4");
        });
      });
    });

    describe("when caller has CHANGEPERMISSION", () => {
      it("should fail when beneficiary had no values set under AddressPermissions:AllowedStandards:...", async () => {
        let newController = ethers.Wallet.createRandom();

        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          newController.address.substr(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [
            [
              INTERFACE_IDS.LSP0ERC725Account,
              INTERFACE_IDS.LSP1UniversalReceiver,
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await expect(
          context.keyManager.connect(canOnlyChangePermissions).execute(payload)
        )
          .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
          .withArgs(canOnlyChangePermissions.address, "ADDPERMISSIONS");
      });

      it("should pass when trying to edit existing allowed standards for an address", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          beneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [
            [
              INTERFACE_IDS.LSP7DigitalAsset,
              INTERFACE_IDS.ERC20,
              INTERFACE_IDS.LSP8IdentifiableDigitalAsset, // try to allow interacting with NFTs
              INTERFACE_IDS.ERC721,
            ],
          ]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had an invalid abi-encoded array of bytes4[] interface IDs initially", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          invalidBeneficiary.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [[INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had 32 x 0 bytes set initially as allowed standards", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          zero32Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [[INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      it("should pass when address had 40 x 0 bytes set initially as allowed standards", async () => {
        let key =
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
          zero40Bytes.address.substring(2);

        let value = abiCoder.encode(
          ["bytes4[]"],
          [[INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.ERC20]]
        );

        let payload = context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32,bytes)",
          [key, value]
        );

        await context.keyManager
          .connect(canOnlyChangePermissions)
          .execute(payload);

        // prettier-ignore
        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });

      describe("when changing the list of allowed bytes4 interface IDs to an invalid value", () => {
        it("should revert with error when value = random bytes", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "bytes4");
        });

        it("should revert with error when value = invalid abi-encoded array of bytes4[] (not enough leading zero bytes for a bytes4 value -> 26 x '00')", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
            beneficiary.address.substring(2);

          let value =
            "0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000cafecafecafe";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(
              context.keyManager,
              "InvalidABIEncodedArray"
            )
            .withArgs(value, "bytes4");
        });
      });
    });
  });

  describe("setting Allowed ERC725YKeys", () => {
    let canOnlyAddPermissions: SignerWithAddress,
      canOnlyChangePermissions: SignerWithAddress;

    let beneficiary: SignerWithAddress,
      invalidBeneficiary: SignerWithAddress,
      zero32Bytes: SignerWithAddress,
      zero40Bytes: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      canOnlyAddPermissions = context.accounts[1];
      canOnlyChangePermissions = context.accounts[2];

      beneficiary = context.accounts[3];
      invalidBeneficiary = context.accounts[4];
      zero32Bytes = context.accounts[5];
      zero40Bytes = context.accounts[6];

      let permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyChangePermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          beneficiary.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          invalidBeneficiary.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          zero32Bytes.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          zero40Bytes.address.substring(2),
      ];

      let permissionValues = [
        PERMISSIONS.ADDPERMISSIONS,
        PERMISSIONS.CHANGEPERMISSIONS,
        encodeCompactedBytes([
          ERC725YKeys.LSP3["LSP3Profile"],
          // prettier-ignore
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
        ]),
        "0x11223344",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when caller has ADDPERMISSIONS", () => {
      describe("when beneficiary had some ERC725Y data keys set under AddressPermissions:AllowedERC725YKeys:...", () => {
        it("should fail when adding an extra allowed ERC725Y data key", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            beneficiary.address.substring(2);

          let value = encodeCompactedBytes([
            ERC725YKeys.LSP3["LSP3Profile"],
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Another Custom Data Key")),
          ]);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
        });

        it("should fail when removing an allowed ERC725Y data key", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            beneficiary.address.substring(2);

          let value = encodeCompactedBytes([ERC725YKeys.LSP3["LSP3Profile"]]);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
        });

        it("should fail when trying to clear the CompactedBytesArray completely", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            beneficiary.address.substring(2);

          let value = "0x";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyAddPermissions.address, "CHANGEPERMISSIONS");
        });

        it("should fail when setting an invalid CompactedBytesArray", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "InvalidCompactedAllowedERC725YDataKeys"
          );
        });
      });

      describe("when beneficiary had no ERC725Y data keys set under AddressPermissions:AllowedERC725YKeys:...", () => {
        it("should pass when setting a valid CompactedBytesArray", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            newController.address.substr(2);

          let value = encodeCompactedBytes([
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Profile Key 1")),
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Profile Key 2")),
          ]);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager
            .connect(canOnlyAddPermissions)
            .execute(payload);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should fail when setting an invalid CompactedBytesArray (random bytes)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager.connect(canOnlyAddPermissions).execute(payload)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "InvalidCompactedAllowedERC725YDataKeys"
          );
        });
      });
    });

    describe("when caller has CHANGEPERMISSIONS", () => {
      describe("when beneficiary had some ERC725Y data keys set under AddressPermissions:AllowedERC725YKeys:...", () => {
        it("should pass when adding an extra allowed ERC725Y data key", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            beneficiary.address.substring(2);

          let value = encodeCompactedBytes([
            ERC725YKeys.LSP3["LSP3Profile"],
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Some Custom Profile Data Key")),
            // prettier-ignore
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Another Custom Data Key")),
          ]);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager
            .connect(canOnlyChangePermissions)
            .execute(payload);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should pass when removing an allowed ERC725Y data key", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            beneficiary.address.substring(2);

          let value = encodeCompactedBytes([ERC725YKeys.LSP3["LSP3Profile"]]);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager
            .connect(canOnlyChangePermissions)
            .execute(payload);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should pass when trying to clear the CompactedBytesArray completely", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            beneficiary.address.substring(2);

          let value = "0x";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await context.keyManager
            .connect(canOnlyChangePermissions)
            .execute(payload);

          // prettier-ignore
          const result = await context.universalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });

        it("should fail when setting an invalid CompactedBytesArray", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            beneficiary.address.substring(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "InvalidCompactedAllowedERC725YDataKeys"
          );
        });
      });

      describe("when beneficiary had no ERC725Y data keys set under AddressPermissions:AllowedERC725YKeys:...", () => {
        it("should fail and not authorize to add a list of allowed ERC725Y data keys (not authorised)", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            newController.address.substr(2);

          let value = encodeCompactedBytes([
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Key 1")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Custom Key 2")),
          ]);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canOnlyChangePermissions.address, "ADDPERMISSIONS");
        });

        it("should fail when setting an invalid CompactedBytesArray", async () => {
          let newController = ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            newController.address.substr(2);

          let value = "0xbadbadbadbad";

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

          await expect(
            context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "InvalidCompactedAllowedERC725YDataKeys"
          );
        });
      });
    });
  });

  describe("setting mixed keys (SETDATA, CHANGE & ADD Permissions", () => {
    let canSetDataAndAddPermissions: SignerWithAddress,
      canSetDataAndChangePermissions: SignerWithAddress,
      canSetDataOnly: SignerWithAddress;
    // addresses being used to CHANGE (= edit) permissions
    let addressesToEditPermissions: [SignerWithAddress, SignerWithAddress];

    beforeEach(async () => {
      context = await buildContext();

      canSetDataAndAddPermissions = context.accounts[1];
      canSetDataAndChangePermissions = context.accounts[2];
      canSetDataOnly = context.accounts[3];

      addressesToEditPermissions = [context.accounts[4], context.accounts[5]];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canSetDataAndAddPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canSetDataAndChangePermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canSetDataOnly.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressesToEditPermissions[0].address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressesToEditPermissions[1].address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions[]"].length,
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.ADDPERMISSIONS),
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.CHANGEPERMISSIONS),
        PERMISSIONS.SETDATA,
        // placeholder permission
        PERMISSIONS.TRANSFERVALUE,
        PERMISSIONS.TRANSFERVALUE,
        // AddressPermissions[].length
        ethers.utils.hexZeroPad(ethers.utils.hexlify(6), 32),
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
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          // prettier-ignore
          const fetchedResult = await context.universalProfile["getData(bytes32[])"](keys);
          expect(fetchedResult).to.deep.equal(values);
        });

        it("(should pass): 2 x keys + change 2 x existing permissions", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My 1st Key")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My 2nd Key")),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(context.owner).execute(payload);

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
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substring(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          // prettier-ignore
          const fetchedResult = await context.universalProfile["getData(bytes32[])"](keys);
          expect(fetchedResult).to.deep.equal(values);
        });
      });

      describe("when caller is an address with permission SETDATA + ADDPERMISSIONS", () => {
        it("(should fail): 2 x keys + add 2 x new permissions + increment AddressPermissions[].length by +2", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
            ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            ethers.utils.hexZeroPad(ethers.utils.hexlify(8), 32),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndAddPermissions)
              .execute(payload)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "NoERC725YDataKeysAllowed"
          );
        });

        it("(should fail): 2 x keys + add 2 x new permissions + decrement AddressPermissions[].length by -1", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
            ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
            ethers.utils.hexZeroPad(ethers.utils.hexlify(5), 32),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndAddPermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndAddPermissions.address, "CHANGEPERMISSIONS");
        });

        it("(should fail): 2 x keys + change 2 x existing permissions", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndAddPermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndAddPermissions.address, "CHANGEPERMISSIONS");
        });

        it("(should fail): 2 x keys + (add 1 x new permission) + (change 1 x existing permission)", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndAddPermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndAddPermissions.address, "CHANGEPERMISSIONS");
        });
      });

      describe("when caller is an address with permission SETDATA + CHANGEPERMISSIONS", () => {
        it("(should fail): 2 x keys + remove 2 x addresses with permissions + decrement AddressPermissions[].length by -2", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
            ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            ethers.utils.hexZeroPad(ethers.utils.hexlify(4), 32),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndChangePermissions)
              .execute(payload)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "NoERC725YDataKeysAllowed"
          );
        });

        it("(should fail): 2 x keys + change 2 x existing permissions", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substring(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[1].address.substring(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndChangePermissions)
              .execute(payload)
          ).to.be.revertedWithCustomError(
            context.keyManager,
            "NoERC725YDataKeysAllowed"
          );
        });

        it("(should fail): 2 x keys + add 2 x new permissions", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();
          let newControllerKeyTwo = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyTwo.address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SETDATA,
            PERMISSIONS.SETDATA,
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndChangePermissions.address, "ADDPERMISSIONS");
        });

        it("{should fail): 2 x keys + increment AddressPermissions[].length by +1", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions[]"].length,
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            ethers.utils.hexZeroPad(ethers.utils.hexlify(7), 32),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndChangePermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndChangePermissions.address, "ADDPERMISSIONS");
        });

        it("(should fail): 2 x keys + (add 1 x new permission) + (change 1 x existing permission)", async () => {
          let newControllerKeyOne = ethers.Wallet.createRandom();

          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My First Key")),
            ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My SecondKey Key")
            ),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              newControllerKeyOne.address.substr(2),
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
              addressesToEditPermissions[0].address.substr(2),
          ];

          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My First Value")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Second Value")),
            PERMISSIONS.SIGN,
            combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.TRANSFERVALUE),
          ];

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

          await expect(
            context.keyManager
              .connect(canSetDataAndAddPermissions)
              .execute(payload)
          )
            .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
            .withArgs(canSetDataAndAddPermissions.address, "CHANGEPERMISSIONS");
        });
      });
    });
  });
};
