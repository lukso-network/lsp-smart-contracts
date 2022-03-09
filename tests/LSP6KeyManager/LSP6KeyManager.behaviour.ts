import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { calculateCreate2 } from "eth-create2-calculator";

import {
  LSP6KeyManager,
  UniversalProfile,
  TargetContract__factory,
} from "../../types";

// constants
import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  ERC1271,
  INTERFACE_IDS,
  OPERATIONS,
  PERMISSIONS,
  EventSignatures,
} from "../../constants";

// helpers
import {
  DUMMY_PAYLOAD,
  EMPTY_PAYLOAD,
  NotAuthorisedError,
} from "../utils/helpers";

export type LSP6TestContext = {
  accounts: SignerWithAddress[];
  owner: SignerWithAddress;
  universalProfile: UniversalProfile;
  keyManager: LSP6KeyManager;
};

export const shouldBehaveLikeLSP6 = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

  const setupKeyManager = async (
    _permissionsKeys: string[],
    _permissionsValues: string[]
  ) => {
    await context.universalProfile
      .connect(context.owner)
      .setData(_permissionsKeys, _permissionsValues);

    await context.universalProfile
      .connect(context.owner)
      .transferOwnership(context.keyManager.address);
  };

  describe("CHANGEOWNER", () => {
    let canChangeOwner: SignerWithAddress,
      cannotChangeOwner: SignerWithAddress,
      newOwner: SignerWithAddress;

    let permissionsKeys: string[];
    let permissionsValues: string[];

    beforeEach(async () => {
      context = await buildContext();

      canChangeOwner = context.accounts[1];
      cannotChangeOwner = context.accounts[2];
      newOwner = context.accounts[3];

      permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canChangeOwner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          cannotChangeOwner.address.substring(2),
      ];

      permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.CHANGEOWNER, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32),
      ];

      await setupKeyManager(permissionsKeys, permissionsValues);
    });

    describe("when caller has ALL PERMISSIONS and `transferOwnership(...)` to EOA", () => {
      it("UP owner() should have changed", async () => {
        let payload = context.universalProfile.interface.encodeFunctionData(
          "transferOwnership",
          [newOwner.address]
        );

        await context.keyManager.connect(context.owner).execute(payload);

        const upOwner = await context.universalProfile.callStatic.owner();
        expect(upOwner).toEqual(newOwner.address);
      });

      it("new UP owner should be able to interact directly (eg: setData(...) with UP", async () => {
        let payload = context.universalProfile.interface.encodeFunctionData(
          "transferOwnership",
          [newOwner.address]
        );

        await context.keyManager.connect(context.owner).execute(payload);

        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Value"));

        await context.universalProfile
          .connect(newOwner)
          .setData([key], [value]);

        const [result] = await context.universalProfile.getData([key]);
        expect(result).toEqual(value);
      });
    });

    describe("when caller is an address with permission CHANGEOWNER and `transferOwnership(...)` to EOA", () => {
      it("UP owner() should have changed", async () => {
        let payload = context.universalProfile.interface.encodeFunctionData(
          "transferOwnership",
          [newOwner.address]
        );

        await context.keyManager.connect(canChangeOwner).execute(payload);

        const upOwner = await context.universalProfile.callStatic.owner();
        expect(upOwner).toEqual(newOwner.address);
      });

      it("new UP owner should be able to interact directly (eg: setData(...) with UP", async () => {
        let payload = context.universalProfile.interface.encodeFunctionData(
          "transferOwnership",
          [newOwner.address]
        );

        await context.keyManager.connect(canChangeOwner).execute(payload);

        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("My Value"));

        await context.universalProfile
          .connect(newOwner)
          .setData([key], [value]);

        const [result] = await context.universalProfile.getData([key]);
        expect(result).toEqual(value);
      });
    });
  });

  describe("CHANGE / ADD permissions", () => {
    let canOnlyAddPermissions: SignerWithAddress,
      canOnlyChangePermissions: SignerWithAddress,
      // address being used to CHANGE (= edit) permissions
      addressToEditPermissions: SignerWithAddress,
      addressWithZeroHexPermissions: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      canOnlyAddPermissions = context.accounts[1];
      canOnlyChangePermissions = context.accounts[2];
      addressToEditPermissions = context.accounts[3];
      addressWithZeroHexPermissions = context.accounts[4];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyAddPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canOnlyChangePermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressToEditPermissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressWithZeroHexPermissions.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.ADDPERMISSIONS, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.CHANGEPERMISSIONS, 32),
        // placeholder permission
        ethers.utils.hexZeroPad(PERMISSIONS.TRANSFERVALUE, 32),
        // 0x0000... = similar to empty, or 'no permissions set'
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ];

      await setupKeyManager(permissionKeys, permissionsValues);
    });

    describe("when setting one permission key", () => {
      describe("when caller is an address with ALL PERMISSIONS", () => {
        it("should be allowed to ADD permissions", async () => {
          let newController = new ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32)]]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          const [result] = await context.universalProfile.callStatic.getData([
            key,
          ]);
          expect(result).toEqual(
            ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32)
          );
        });

        it("should be allowed to CHANGE permissions", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );

          await context.keyManager.connect(context.owner).execute(payload);

          const [result] = await context.universalProfile.callStatic.getData([
            key,
          ]);
          expect(result).toEqual(value);
        });
      });

      describe("when caller is an address with permission ADDPERMISSIONS", () => {
        it("should be allowed to add permissions", async () => {
          let newController = new ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substring(2);

          let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );

          await context.keyManager
            .connect(canOnlyAddPermissions)
            .execute(payload);

          const [result] = await context.universalProfile.callStatic.getData([
            key,
          ]);
          expect(result).toEqual(value);
        });
        it("should not be allowed to CHANGE permission", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );

          try {
            await context.keyManager
              .connect(canOnlyAddPermissions)
              .execute(payload);
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

      describe("when caller is an address with permission CHANGEPERMISSION", () => {
        it("should not be allowed to ADD permissions", async () => {
          let newController = new ethers.Wallet.createRandom();

          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            newController.address.substr(2);

          let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );

          try {
            await context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload);
          } catch (error) {
            expect(error.message).toMatch(
              NotAuthorisedError(
                canOnlyChangePermissions.address,
                "ADDPERMISSIONS"
              )
            );
          }
        });

        it("should not be allowed to set (= ADD) permissions for an address that has 32 x 0 bytes (0x0000...0000) as permission value", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressWithZeroHexPermissions.address.substring(2);
          let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );

          try {
            await context.keyManager
              .connect(canOnlyChangePermissions)
              .execute(payload);
          } catch (error) {
            expect(error.message).toMatch(
              NotAuthorisedError(
                canOnlyChangePermissions.address,
                "ADDPERMISSIONS"
              )
            );
          }
        });

        it("should be allowed to CHANGE permissions", async () => {
          let key =
            ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            addressToEditPermissions.address.substring(2);

          let value = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA, 32);

          let payload = context.universalProfile.interface.encodeFunctionData(
            "setData",
            [[key], [value]]
          );

          await context.keyManager
            .connect(canOnlyChangePermissions)
            .execute(payload);

          let [result] = await context.universalProfile.callStatic.getData([
            key,
          ]);
          expect(result).toEqual(value);
        });
      });
    });
  });

  describe("DELEGATECALL", () => {
    let addressCanDelegateCall: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      addressCanDelegateCall = context.accounts[1];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanDelegateCall.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.DELEGATECALL, 32),
      ];

      await setupKeyManager(permissionKeys, permissionsValues);
    });

    describe("when trying to make a DELEGATECALL via UP", () => {
      it("should revert, even if caller has ALL PERMISSIONS", async () => {
        let executePayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.DELEGATECALL,
            "0xcafecafecafecafecafecafecafecafecafecafe",
            0,
            DUMMY_PAYLOAD,
          ]);

        await expect(
          context.keyManager.connect(context.owner).execute(executePayload)
        ).toBeRevertedWith(
          "_verifyCanExecute: operation 4 `DELEGATECALL` not supported"
        );
      });

      it("should revert, even if caller is has permission DELEGATECALL", async () => {
        let executePayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATIONS.DELEGATECALL,
            "0xcafecafecafecafecafecafecafecafecafecafe",
            0,
            DUMMY_PAYLOAD,
          ]);

        await expect(
          context.keyManager
            .connect(addressCanDelegateCall)
            .execute(executePayload)
        ).toBeRevertedWith(
          "_verifyCanExecute: operation 4 `DELEGATECALL` not supported"
        );
      });
    });
  });

  describe("DEPLOY", () => {
    let addressCanDeploy: SignerWithAddress,
      addressCannotDeploy: SignerWithAddress;

    beforeEach(async () => {
      context = await buildContext();

      addressCanDeploy = context.accounts[1];
      addressCannotDeploy = context.accounts[2];

      let permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCanDeploy.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          addressCannotDeploy.address.substring(2),
      ];

      let permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.DEPLOY, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
      ];

      await setupKeyManager(permissionKeys, permissionsValues);
    });

    describe("when caller has ALL PERMISSIONS", () => {
      it("should be allowed to deploy a contract TargetContract via CREATE", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATIONS.CREATE, // operation type
            ethers.constants.AddressZero, // recipient
            0, // value
            contractBytecodeToDeploy, // data
          ]
        );

        const expectedContractAddress = await context.keyManager
          .connect(context.owner)
          .callStatic.execute(payload);

        let tx = await context.keyManager
          .connect(context.owner)
          .execute(payload);
        let receipt = await tx.wait();

        // should be the ContractCreated event (= event signature)
        expect(receipt.logs[0].topics[0]).toEqual(
          EventSignatures.ERC725X["ContractCreated"]
        );

        // operation type
        expect(receipt.logs[0].topics[1]).toEqual(
          ethers.utils.hexZeroPad(OPERATIONS.CREATE, 32)
        );

        // address of contract created
        expect(receipt.logs[0].topics[2]).toEqual(
          ethers.utils.hexZeroPad(expectedContractAddress, 32)
        );

        // value
        expect(receipt.logs[0].topics[3]).toEqual(
          ethers.utils.hexZeroPad(0, 32)
        );
      });

      it("should be allowed to deploy a contract TargetContract via CREATE2", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;
        let salt =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATIONS.CREATE2,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy + salt.substring(2),
          ]
        );

        let preComputedAddress = calculateCreate2(
          context.universalProfile.address,
          salt,
          contractBytecodeToDeploy
        ).toLowerCase();

        let tx = await context.keyManager
          .connect(context.owner)
          .execute(payload);

        let receipt = await tx.wait();

        expect(receipt.logs[0].topics[0]).toEqual(
          EventSignatures.ERC725X["ContractCreated"]
        );
        expect(receipt.logs[0].topics[1]).toEqual(
          ethers.utils.hexZeroPad(OPERATIONS.CREATE2, 32)
        );
        expect(receipt.logs[0].topics[2]).toEqual(
          ethers.utils.hexZeroPad(preComputedAddress, 32)
        );
        expect(receipt.logs[0].topics[3]).toEqual(
          ethers.utils.hexZeroPad(0, 32)
        );
      });
    });

    describe("when caller is an address with permission DEPLOY", () => {
      it("should be allowed to deploy a contract TargetContract via CREATE", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATIONS.CREATE,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy,
          ]
        );

        const expectedContractAddress = await context.keyManager
          .connect(addressCanDeploy)
          .callStatic.execute(payload);

        let tx = await context.keyManager
          .connect(context.owner)
          .execute(payload);
        let receipt = await tx.wait();

        expect(receipt.logs[0].topics[0]).toEqual(
          EventSignatures.ERC725X["ContractCreated"]
        );
        expect(receipt.logs[0].topics[1]).toEqual(
          ethers.utils.hexZeroPad(OPERATIONS.CREATE, 32)
        );
        expect(receipt.logs[0].topics[2]).toEqual(
          ethers.utils.hexZeroPad(expectedContractAddress, 32)
        );
        expect(receipt.logs[0].topics[3]).toEqual(
          ethers.utils.hexZeroPad(0, 32)
        );
      });

      it("should be allowed to deploy a contract TargetContract via CREATE2", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;
        let salt =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATIONS.CREATE2,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy + salt.substring(2),
          ]
        );

        let preComputedAddress = calculateCreate2(
          context.universalProfile.address,
          salt,
          contractBytecodeToDeploy
        ).toLowerCase();

        let tx = await context.keyManager
          .connect(addressCanDeploy)
          .execute(payload);

        let receipt = await tx.wait();

        expect(receipt.logs[0].topics[0]).toEqual(
          EventSignatures.ERC725X["ContractCreated"]
        );
        expect(receipt.logs[0].topics[1]).toEqual(
          ethers.utils.hexZeroPad(OPERATIONS.CREATE2, 32)
        );
        expect(receipt.logs[0].topics[2]).toEqual(
          ethers.utils.hexZeroPad(preComputedAddress, 32)
        );
        expect(receipt.logs[0].topics[3]).toEqual(
          ethers.utils.hexZeroPad(0, 32)
        );
      });
    });

    describe("when caller is an address that does not have the permission DEPLOY", () => {
      it("should revert when trying to deploy a contract via CREATE", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATIONS.CREATE,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy,
          ]
        );

        try {
          await context.keyManager
            .connect(addressCannotDeploy)
            .execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(addressCannotDeploy.address, "CREATE")
          );
        }
      });
      it("should revert when trying to deploy a contract via CREATE2", async () => {
        let contractBytecodeToDeploy = TargetContract__factory.bytecode;
        let salt =
          "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe";

        let payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATIONS.CREATE2,
            ethers.constants.AddressZero,
            0,
            contractBytecodeToDeploy + salt.substring(2),
          ]
        );

        try {
          await context.keyManager
            .connect(addressCannotDeploy)
            .execute(payload);
        } catch (error) {
          expect(error.message).toMatch(
            NotAuthorisedError(addressCannotDeploy.address, "CREATE2")
          );
        }
      });
    });
  });

  describe("TRANSFERVALUE", () => {
    let provider = ethers.provider;

    let canTransferValue: SignerWithAddress,
      cannotTransferValue: SignerWithAddress;

    beforeAll(async () => {
      context = await buildContext();

      canTransferValue = context.accounts[1];
      cannotTransferValue = context.accounts[2];

      const permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          canTransferValue.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          cannotTransferValue.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(
          PERMISSIONS.CALL + PERMISSIONS.TRANSFERVALUE,
          32
        ),
        ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
      ];

      await setupKeyManager(permissionsKeys, permissionsValues);

      await context.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    it("address with ALL PERMISSIONS should be allowed to transfer value", async () => {
      let initialBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      let recipient = context.accounts[3].address;
      let initialBalanceRecipient = await provider.getBalance(recipient);

      let transferPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          recipient,
          ethers.utils.parseEther("3"),
          EMPTY_PAYLOAD,
        ]);

      await context.keyManager.connect(context.owner).execute(transferPayload);

      let newBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      expect(parseInt(newBalanceUP)).toBeLessThan(parseInt(initialBalanceUP));

      let newBalanceRecipient = await provider.getBalance(recipient);
      expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
        parseInt(initialBalanceRecipient)
      );
    });

    it("address with permission TRANSFER VALUE should be allowed to transfer value", async () => {
      let initialBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      let recipient = context.accounts[3].address;
      let initialBalanceRecipient = await provider.getBalance(recipient);

      let transferPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          recipient,
          ethers.utils.parseEther("3"),
          EMPTY_PAYLOAD,
        ]);

      await context.keyManager
        .connect(canTransferValue)
        .execute(transferPayload);

      let newBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      expect(parseInt(newBalanceUP)).toBeLessThan(parseInt(initialBalanceUP));

      let newBalanceRecipient = await provider.getBalance(recipient);
      expect(parseInt(newBalanceRecipient)).toBeGreaterThan(
        parseInt(initialBalanceRecipient)
      );
    });

    it("address with no permission TRANSFERVALUE should revert", async () => {
      let initialBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      let recipient = context.accounts[3].address;
      let initialBalanceRecipient = await provider.getBalance(recipient);

      let transferPayload =
        context.universalProfile.interface.encodeFunctionData("execute", [
          OPERATIONS.CALL,
          recipient,
          ethers.utils.parseEther("3"),
          EMPTY_PAYLOAD,
        ]);

      try {
        await context.keyManager
          .connect(cannotTransferValue)
          .execute(transferPayload);
      } catch (error) {
        expect(error.message).toMatch(
          NotAuthorisedError(cannotTransferValue.address, "TRANSFERVALUE")
        );
      }

      let newBalanceUP = await provider.getBalance(
        context.universalProfile.address
      );
      let newBalanceRecipient = await provider.getBalance(recipient);

      expect(parseInt(newBalanceUP)).toBe(parseInt(initialBalanceUP));
      expect(parseInt(initialBalanceRecipient)).toBe(
        parseInt(newBalanceRecipient)
      );
    });
  });

  describe("SIGN (ERC1271)", () => {
    let signer, nonSigner, noPermissionsSet;
    const dataToSign = "0xcafecafe";

    beforeAll(async () => {
      context = await buildContext();

      signer = context.accounts[1];
      nonSigner = context.accounts[2];
      noPermissionsSet = context.accounts[3];

      const permissionsKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          signer.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          nonSigner.address.substring(2),
      ];

      const permissionsValues = [
        ALL_PERMISSIONS_SET,
        ethers.utils.hexZeroPad(PERMISSIONS.SIGN, 32),
        ethers.utils.hexZeroPad(PERMISSIONS.CALL, 32),
      ];

      await setupKeyManager(permissionsKeys, permissionsValues);
    });

    it("can verify signature from address with ALL PERMISSIONS on KeyManager", async () => {
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await context.owner.signMessage(dataToSign);

      const result = await context.keyManager.callStatic.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.MAGIC_VALUE);
    });

    it("can verify signature from signer on KeyManager", async () => {
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.keyManager.callStatic.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.MAGIC_VALUE);
    });

    it("should fail when verifying signature from address with no SIGN permission", async () => {
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await nonSigner.signMessage(dataToSign);

      const result = await context.keyManager.callStatic.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.FAIL_VALUE);
    });

    it("should fail when verifying signature from address with no permissions set", async () => {
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await noPermissionsSet.signMessage(dataToSign);

      const result = await context.keyManager.callStatic.isValidSignature(
        messageHash,
        signature
      );
      expect(result).toEqual(ERC1271.FAIL_VALUE);
    });
  });
};

export type LSP6InitializeTestContext = {
  keyManager: LSP6KeyManager;
};

export const shouldInitializeLikeLSP6 = (
  buildContext: () => Promise<LSP6InitializeTestContext>
) => {
  let context: LSP6InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should support ERC165 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.LSP6
      );
      expect(result).toBeTruthy();
    });

    it("should support ERC1271 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.ERC1271
      );
      expect(result).toBeTruthy();
    });

    it("should support LSP6 interface", async () => {
      const result = await context.keyManager.supportsInterface(
        INTERFACE_IDS.LSP6
      );
      expect(result).toBeTruthy();
    });

    /// @todo it should have set the account it is linked to
  });
};
