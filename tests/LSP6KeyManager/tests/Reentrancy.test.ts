import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  ReentrancyWithAddPermission,
  ReentrancyWithAddPermission__factory,
  ReentrancyWithAddURD,
  ReentrancyWithAddURD__factory,
  ReentrancyWithChangePermission,
  ReentrancyWithChangePermission__factory,
  ReentrancyWithChangeURD,
  ReentrancyWithChangeURD__factory,
  ReentrancyWithSetData,
  ReentrancyWithSetData__factory,
  ReentrancyWithValueTransfer,
  ReentrancyWithValueTransfer__factory,
  Reentrancy__factory,
  UniversalReceiverDelegateDataUpdater__factory,
} from "../../../types";

// constants
import {
  ERC725YKeys,
  LSP1_TYPE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
} from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import {
  provider,
  combinePermissions,
  EMPTY_PAYLOAD,
  combineAllowedCalls,
  encodeCompactBytesArray,
} from "../../utils/helpers";

export const testReentrancyScenarios = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;
  let caller: SignerWithAddress;
  before(async () => {
    context = await buildContext();
    caller = context.accounts[1];

    const permissionKeys = [
      ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        caller.address.substring(2),
    ];

    const permissionValues = [PERMISSIONS.CALL];

    await setupKeyManager(context, permissionKeys, permissionValues);
  });

  describe("when reentering and transferring value", () => {
    let contract_without_permissions: ReentrancyWithValueTransfer;
    let contract_with_REENTRANCY_permission_no_calls: ReentrancyWithValueTransfer;
    let contract_with_REENTRANCY_permission_with_calls: ReentrancyWithValueTransfer;
    let contract_with_VALUETRANSFER_permissions_no_calls: ReentrancyWithValueTransfer;
    let contract_with_VALUETRANSFER_permissions_with_calls: ReentrancyWithValueTransfer;
    let contract_with_REENTRANCY_VALUETRANSFER_permissions_no_calls: ReentrancyWithValueTransfer;
    let contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls: ReentrancyWithValueTransfer;
    before(async () => {
      contract_without_permissions =
        await new ReentrancyWithValueTransfer__factory(caller).deploy();
      contract_with_REENTRANCY_permission_no_calls =
        await new ReentrancyWithValueTransfer__factory(caller).deploy();
      contract_with_REENTRANCY_permission_with_calls =
        await new ReentrancyWithValueTransfer__factory(caller).deploy();
      contract_with_VALUETRANSFER_permissions_no_calls =
        await new ReentrancyWithValueTransfer__factory(caller).deploy();
      contract_with_VALUETRANSFER_permissions_with_calls =
        await new ReentrancyWithValueTransfer__factory(caller).deploy();
      contract_with_REENTRANCY_VALUETRANSFER_permissions_no_calls =
        await new ReentrancyWithValueTransfer__factory(caller).deploy();
      contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls =
        await new ReentrancyWithValueTransfer__factory(caller).deploy();

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_permission_no_calls.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_permission_with_calls.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_VALUETRANSFER_permissions_no_calls.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_VALUETRANSFER_permissions_with_calls.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_VALUETRANSFER_permissions_no_calls.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          contract_with_REENTRANCY_permission_with_calls.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          contract_with_VALUETRANSFER_permissions_with_calls.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls.address.substring(
            2
          ),
      ];

      const permissionValues = [
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.TRANSFERVALUE,
        PERMISSIONS.TRANSFERVALUE,
        combinePermissions(PERMISSIONS.REENTRANCY, PERMISSIONS.TRANSFERVALUE),
        combinePermissions(PERMISSIONS.REENTRANCY, PERMISSIONS.TRANSFERVALUE),
        combineAllowedCalls(
          [
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
          ],
          [
            contract_without_permissions.address,
            contract_with_REENTRANCY_permission_no_calls.address,
            contract_with_REENTRANCY_permission_with_calls.address,
            contract_with_VALUETRANSFER_permissions_no_calls.address,
            contract_with_VALUETRANSFER_permissions_with_calls.address,
            contract_with_REENTRANCY_VALUETRANSFER_permissions_no_calls.address,
            contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls.address,
          ],
          [
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
          ]
        ),
        combineAllowedCalls(
          ["0xffffffff"],
          [contract_with_REENTRANCY_permission_with_calls.address],
          ["0xffffffff"]
        ),
        combineAllowedCalls(
          ["0xffffffff"],
          [contract_with_VALUETRANSFER_permissions_with_calls.address],
          ["0xffffffff"]
        ),
        combineAllowedCalls(
          ["0xffffffff"],
          [
            contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls.address,
          ],
          ["0xffffffff"]
        ),
      ];

      const permissionsPayload =
        context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [permissionKeys, permissionValues]
        );
      await context.keyManager
        .connect(context.owner)
        .execute(permissionsPayload);

      // Fund Universal Profile with some LYXe
      await context.owner.sendTransaction({
        to: context.universalProfile.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    it("should revert if the reentrant contract has NO PERMISSIONS", async () => {
      const reentrantCallPayload =
        contract_without_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [0, contract_without_permissions.address, 0, reentrantCallPayload]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(contract_without_permissions.address, "REENTRANCY");
    });

    it("should revert if the reentrant contract has ONLY REENTRANCY permission with NO AlowedCalls", async () => {
      const reentrantCallPayload =
        contract_with_REENTRANCY_permission_no_calls.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_permission_no_calls.address,
            0,
            reentrantCallPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_REENTRANCY_permission_no_calls.address,
          "TRANSFERVALUE"
        );
    });

    it("should revert if the reentrant contract has ONLY REENTRANCY permission with AlowedCalls", async () => {
      const reentrantCallPayload =
        contract_with_REENTRANCY_permission_with_calls.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_permission_with_calls.address,
            0,
            reentrantCallPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_REENTRANCY_permission_with_calls.address,
          "TRANSFERVALUE"
        );
    });

    it("should revert if the reentrant contract has ONLY TRANSFERVALUE permission with NO AlowedCalls", async () => {
      const reentrantCallPayload =
        contract_with_VALUETRANSFER_permissions_no_calls.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_VALUETRANSFER_permissions_no_calls.address,
            0,
            reentrantCallPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_VALUETRANSFER_permissions_no_calls.address,
          "REENTRANCY"
        );
    });

    it("should revert if the reentrant contract has ONLY TRANSFERVALUE permission with AlowedCalls", async () => {
      const reentrantCallPayload =
        contract_with_VALUETRANSFER_permissions_with_calls.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_VALUETRANSFER_permissions_with_calls.address,
            0,
            reentrantCallPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_VALUETRANSFER_permissions_with_calls.address,
          "REENTRANCY"
        );
    });

    it("should revert if the reentrant contract has ONLY TRANSFERVALUE and REENTRANCY permissions with NO AlowedCalls", async () => {
      const reentrantCallPayload =
        contract_with_REENTRANCY_VALUETRANSFER_permissions_no_calls.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_VALUETRANSFER_permissions_no_calls.address,
            0,
            reentrantCallPayload,
          ]
        );

      await expect(
        context.keyManager.connect(caller).execute(upExecutePayload)
      ).to.be.revertedWithCustomError(context.keyManager, "NoCallsAllowed");
    });

    it("should pass if the reentrant contract has ONLY TRANSFERVALUE and REENTRANCY permissions with AlowedCalls", async () => {
      const reentrantCallPayload =
        contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls.address,
            0,
            reentrantCallPayload,
          ]
        );

      expect(
        await context.universalProfile.provider.getBalance(
          context.universalProfile.address
        )
      ).to.equal(ethers.utils.parseEther("10"));

      await context.keyManager.connect(caller).execute(upExecutePayload);

      expect(
        await context.universalProfile.provider.getBalance(
          context.universalProfile.address
        )
      ).to.equal(ethers.utils.parseEther("9"));

      expect(
        await context.universalProfile.provider.getBalance(
          contract_with_REENTRANCY_VALUETRANSFER_permissions_with_calls.address
        )
      ).to.equal(ethers.utils.parseEther("1"));
    });
  });

  describe("when reentering and setting data", () => {
    let contract_without_permissions: ReentrancyWithSetData;
    let contract_with_REENTRANCY_permission_no_allowed_keys: ReentrancyWithSetData;
    let contract_with_REENTRANCY_permission_with_allowed_keys: ReentrancyWithSetData;
    let contract_with_SETDATA_permissions_no_allowed_keys: ReentrancyWithSetData;
    let contract_with_SETDATA_permissions_with_allowed_keys: ReentrancyWithSetData;
    let contract_with_REENTRANCY_SETDATA_permissions_no_allowed_keys: ReentrancyWithSetData;
    let contract_with_REENTRANCY_SETDATA_permissions_with_allowed_keys: ReentrancyWithSetData;
    before(async () => {
      contract_without_permissions = await new ReentrancyWithSetData__factory(
        caller
      ).deploy();
      contract_with_REENTRANCY_permission_no_allowed_keys =
        await new ReentrancyWithSetData__factory(caller).deploy();
      contract_with_REENTRANCY_permission_with_allowed_keys =
        await new ReentrancyWithSetData__factory(caller).deploy();
      contract_with_SETDATA_permissions_no_allowed_keys =
        await new ReentrancyWithSetData__factory(caller).deploy();
      contract_with_SETDATA_permissions_with_allowed_keys =
        await new ReentrancyWithSetData__factory(caller).deploy();
      contract_with_REENTRANCY_SETDATA_permissions_no_allowed_keys =
        await new ReentrancyWithSetData__factory(caller).deploy();
      contract_with_REENTRANCY_SETDATA_permissions_with_allowed_keys =
        await new ReentrancyWithSetData__factory(caller).deploy();

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_permission_no_allowed_keys.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_permission_with_allowed_keys.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_SETDATA_permissions_no_allowed_keys.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_SETDATA_permissions_with_allowed_keys.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_SETDATA_permissions_no_allowed_keys.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_SETDATA_permissions_with_allowed_keys.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          contract_with_REENTRANCY_permission_with_allowed_keys.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          contract_with_SETDATA_permissions_with_allowed_keys.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          contract_with_REENTRANCY_SETDATA_permissions_with_allowed_keys.address.substring(
            2
          ),
      ];

      const permissionValues = [
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.SETDATA,
        PERMISSIONS.SETDATA,
        combinePermissions(PERMISSIONS.REENTRANCY, PERMISSIONS.SETDATA),
        combinePermissions(PERMISSIONS.REENTRANCY, PERMISSIONS.SETDATA),
        combineAllowedCalls(
          [
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
          ],
          [
            contract_without_permissions.address,
            contract_with_REENTRANCY_permission_no_allowed_keys.address,
            contract_with_REENTRANCY_permission_with_allowed_keys.address,
            contract_with_SETDATA_permissions_no_allowed_keys.address,
            contract_with_SETDATA_permissions_with_allowed_keys.address,
            contract_with_REENTRANCY_SETDATA_permissions_no_allowed_keys.address,
            contract_with_REENTRANCY_SETDATA_permissions_with_allowed_keys.address,
          ],
          [
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
            "0xffffffff",
          ]
        ),
        encodeCompactBytesArray([
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
          ),
        ]),
        encodeCompactBytesArray([
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
          ),
        ]),
        encodeCompactBytesArray([
          ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
          ),
        ]),
      ];

      const permissionsPayload =
        context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [permissionKeys, permissionValues]
        );
      await context.keyManager
        .connect(context.owner)
        .execute(permissionsPayload);
    });

    it("should revert if caller has NO PERMISSIONS", async () => {
      const reentrantContractPayload =
        contract_without_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [0, contract_without_permissions.address, 0, reentrantContractPayload]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(contract_without_permissions.address, "REENTRANCY");
    });

    it("should revert if caller has ONLY REENTRANCY permission with NO AllowedERC725YDataKeys", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_permission_no_allowed_keys.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_permission_no_allowed_keys.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_REENTRANCY_permission_no_allowed_keys.address,
          "SETDATA"
        );
    });

    it("should revert if caller has ONLY REENTRANCY permission with AllowedERC725YDataKeys", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_permission_with_allowed_keys.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_permission_with_allowed_keys.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_REENTRANCY_permission_with_allowed_keys.address,
          "SETDATA"
        );
    });

    it("should revert if caller has ONLY SETDATA permission with NO AllowedERC725YDataKeys", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_SETDATA_permissions_no_allowed_keys.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_SETDATA_permissions_no_allowed_keys.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(
        context.keyManager.connect(caller).execute(upExecutePayload)
      ).to.be.revertedWithCustomError(
        context.keyManager,
        "NoERC725YDataKeysAllowed"
      );
    });

    it("should revert if caller has ONLY SETDATA permission with AllowedERC725YDataKeys", async () => {
      const reentrantContractPayload =
        contract_with_SETDATA_permissions_with_allowed_keys.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_SETDATA_permissions_with_allowed_keys.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_SETDATA_permissions_with_allowed_keys.address,
          "REENTRANCY"
        );
    });

    it("should revert if caller has SETDATA and REENTRANCY permissions with NO AllowedERC725YDataKeys", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_SETDATA_permissions_no_allowed_keys.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_SETDATA_permissions_no_allowed_keys.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(
        context.keyManager.connect(caller).execute(upExecutePayload)
      ).to.be.revertedWithCustomError(
        context.keyManager,
        "NoERC725YDataKeysAllowed"
      );
    });

    it("should pass if caller has SETDATA and REENTRANCY permissions with AllowedERC725YDataKeys", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_SETDATA_permissions_with_allowed_keys.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            "0x",
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_SETDATA_permissions_with_allowed_keys.address,
            0,
            reentrantContractPayload,
          ]
        );

      await context.keyManager.connect(caller).execute(upExecutePayload);

      const hardcodedKey = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
      );
      const hardcodedValue = ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes("SomeRandomTextUsed")
      );

      expect(
        await context.universalProfile["getData(bytes32)"](hardcodedKey)
      ).to.equal(hardcodedValue);
    });
  });

  describe("when reentering and adding permissions", () => {
    let contract_without_permissions: ReentrancyWithAddPermission;
    let contract_with_REENTRANCY_permission: ReentrancyWithAddPermission;
    let contract_with_ADDPERMISSION_permissions: ReentrancyWithAddPermission;
    let contract_with_REENTRANCY_ADDPERMISSION_permissions: ReentrancyWithAddPermission;
    before(async () => {
      contract_without_permissions =
        await new ReentrancyWithAddPermission__factory(caller).deploy();
      contract_with_REENTRANCY_permission =
        await new ReentrancyWithAddPermission__factory(caller).deploy();
      contract_with_ADDPERMISSION_permissions =
        await new ReentrancyWithAddPermission__factory(caller).deploy();
      contract_with_REENTRANCY_ADDPERMISSION_permissions =
        await new ReentrancyWithAddPermission__factory(caller).deploy();

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_permission.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_ADDPERMISSION_permissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_ADDPERMISSION_permissions.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.ADDPERMISSIONS,
        combinePermissions(PERMISSIONS.REENTRANCY, PERMISSIONS.ADDPERMISSIONS),
        combineAllowedCalls(
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"],
          [
            contract_without_permissions.address,
            contract_with_REENTRANCY_permission.address,
            contract_with_ADDPERMISSION_permissions.address,
            contract_with_REENTRANCY_ADDPERMISSION_permissions.address,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        ),
      ];

      const permissionsPayload =
        context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [permissionKeys, permissionValues]
        );
      await context.keyManager
        .connect(context.owner)
        .execute(permissionsPayload);
    });

    it("should revert if caller has NO PERMISSIONS", async () => {
      const reentrantContractPayload =
        contract_without_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            context.accounts[2].address,
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [0, contract_without_permissions.address, 0, reentrantContractPayload]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(contract_without_permissions.address, "REENTRANCY");
    });

    it("should revert if caller has ONLY REENTRANCY permission", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_permission.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            context.accounts[2].address,
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_permission.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_REENTRANCY_permission.address,
          "ADDPERMISSIONS"
        );
    });

    it("should revert if caller has ONLY ADDPERMISSIONS permission", async () => {
      const reentrantContractPayload =
        contract_with_ADDPERMISSION_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            context.accounts[2].address,
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_ADDPERMISSION_permissions.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_ADDPERMISSION_permissions.address,
          "REENTRANCY"
        );
    });

    it("should pass if caller has ADDPERMISSIONS and REENTRANCY permissions", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_ADDPERMISSION_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            context.accounts[2].address,
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_ADDPERMISSION_permissions.address,
            0,
            reentrantContractPayload,
          ]
        );

      await context.keyManager.connect(caller).execute(upExecutePayload);

      const hardcodedPermissionKey =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.accounts[2].address.substring(2);
      const hardcodedPermissionValue =
        "0x0000000000000000000000000000000000000000000000000000000000000010";

      expect(
        await context.universalProfile["getData(bytes32)"](
          hardcodedPermissionKey
        )
      ).to.equal(hardcodedPermissionValue);
    });
  });

  describe("when reentering and changing permissions", () => {
    let contract_without_permissions: ReentrancyWithChangePermission;
    let contract_with_REENTRANCY_permission: ReentrancyWithChangePermission;
    let contract_with_CHANGEPERMISSION_permissions: ReentrancyWithChangePermission;
    let contract_with_REENTRANCY_CHANGEPERMISSION_permissions: ReentrancyWithChangePermission;
    before(async () => {
      contract_without_permissions =
        await new ReentrancyWithChangePermission__factory(caller).deploy();
      contract_with_REENTRANCY_permission =
        await new ReentrancyWithChangePermission__factory(caller).deploy();
      contract_with_CHANGEPERMISSION_permissions =
        await new ReentrancyWithChangePermission__factory(caller).deploy();
      contract_with_REENTRANCY_CHANGEPERMISSION_permissions =
        await new ReentrancyWithChangePermission__factory(caller).deploy();

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_permission.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_CHANGEPERMISSION_permissions.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_CHANGEPERMISSION_permissions.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.CHANGEPERMISSIONS,
        combinePermissions(
          PERMISSIONS.REENTRANCY,
          PERMISSIONS.CHANGEPERMISSIONS
        ),
        combineAllowedCalls(
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"],
          [
            contract_without_permissions.address,
            contract_with_REENTRANCY_permission.address,
            contract_with_CHANGEPERMISSION_permissions.address,
            contract_with_REENTRANCY_CHANGEPERMISSION_permissions.address,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        ),
      ];

      const permissionsPayload =
        context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [permissionKeys, permissionValues]
        );
      await context.keyManager
        .connect(context.owner)
        .execute(permissionsPayload);
    });

    it("should revert if caller has NO PERMISSIONS", async () => {
      const reentrantContractPayload =
        contract_without_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            context.accounts[2].address,
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [0, contract_without_permissions.address, 0, reentrantContractPayload]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(contract_without_permissions.address, "REENTRANCY");
    });

    it("should revert if caller has ONLY REENTRANCY permission", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_permission.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            context.accounts[2].address,
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_permission.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_REENTRANCY_permission.address,
          "CHANGEPERMISSIONS"
        );
    });

    it("should revert if caller has ONLY CHANGEPERMISSIONS permission", async () => {
      const reentrantContractPayload =
        contract_with_CHANGEPERMISSION_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            context.accounts[2].address,
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_CHANGEPERMISSION_permissions.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_CHANGEPERMISSION_permissions.address,
          "REENTRANCY"
        );
    });

    it("should pass if caller has CHANGEPERMISSIONS and REENTRANCY permissions", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_CHANGEPERMISSION_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            context.accounts[2].address,
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_CHANGEPERMISSION_permissions.address,
            0,
            reentrantContractPayload,
          ]
        );

      await context.keyManager.connect(caller).execute(upExecutePayload);

      const hardcodedPermissionKey =
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
        context.accounts[2].address.substring(2);
      const hardcodedPermissionValue = "0x";

      expect(
        await context.universalProfile["getData(bytes32)"](
          hardcodedPermissionKey
        )
      ).to.equal(hardcodedPermissionValue);
    });
  });

  describe("when reentering and adding URD", () => {
    let contract_without_permissions: ReentrancyWithAddURD;
    let contract_with_REENTRANCY_permission: ReentrancyWithAddURD;
    let contract_with_ADDUNIVERSALRECEIVERDELEGATE_permissions: ReentrancyWithAddURD;
    let contract_with_REENTRANCY_ADDUNIVERSALRECEIVERDELEGATE_permissions: ReentrancyWithAddURD;
    const randomLSP1TypeId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("RandomLSP1TypeId")
    );
    before(async () => {
      contract_without_permissions = await new ReentrancyWithAddURD__factory(
        caller
      ).deploy();
      contract_with_REENTRANCY_permission =
        await new ReentrancyWithAddURD__factory(caller).deploy();
      contract_with_ADDUNIVERSALRECEIVERDELEGATE_permissions =
        await new ReentrancyWithAddURD__factory(caller).deploy();
      contract_with_REENTRANCY_ADDUNIVERSALRECEIVERDELEGATE_permissions =
        await new ReentrancyWithAddURD__factory(caller).deploy();

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_permission.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_ADDUNIVERSALRECEIVERDELEGATE_permissions.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_ADDUNIVERSALRECEIVERDELEGATE_permissions.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE,
        combinePermissions(
          PERMISSIONS.REENTRANCY,
          PERMISSIONS.ADDUNIVERSALRECEIVERDELEGATE
        ),
        combineAllowedCalls(
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"],
          [
            contract_without_permissions.address,
            contract_with_REENTRANCY_permission.address,
            contract_with_ADDUNIVERSALRECEIVERDELEGATE_permissions.address,
            contract_with_REENTRANCY_ADDUNIVERSALRECEIVERDELEGATE_permissions.address,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        ),
      ];

      const permissionsPayload =
        context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [permissionKeys, permissionValues]
        );
      await context.keyManager
        .connect(context.owner)
        .execute(permissionsPayload);
    });

    it("should revert if caller has NO PERMISSIONS", async () => {
      const reentrantContractPayload =
        contract_without_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            randomLSP1TypeId + context.accounts[2].address.substring(2),
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [0, contract_without_permissions.address, 0, reentrantContractPayload]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(contract_without_permissions.address, "REENTRANCY");
    });

    it("should revert if caller has ONLY REENTRANCY permission", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_permission.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            randomLSP1TypeId + context.accounts[2].address.substring(2),
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_permission.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_REENTRANCY_permission.address,
          "ADDUNIVERSALRECEIVERDELEGATE"
        );
    });

    it("should revert if caller has ONLY ADDUNIVERSALRECEIVERDELEGATE permission", async () => {
      const reentrantContractPayload =
        contract_with_ADDUNIVERSALRECEIVERDELEGATE_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            randomLSP1TypeId + context.accounts[2].address.substring(2),
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_ADDUNIVERSALRECEIVERDELEGATE_permissions.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_ADDUNIVERSALRECEIVERDELEGATE_permissions.address,
          "REENTRANCY"
        );
    });

    it("should pass if caller has ADDUNIVERSALRECEIVERDELEGATE and REENTRANCY permissions", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_ADDUNIVERSALRECEIVERDELEGATE_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            randomLSP1TypeId + context.accounts[2].address.substring(2),
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_ADDUNIVERSALRECEIVERDELEGATE_permissions.address,
            0,
            reentrantContractPayload,
          ]
        );

      await context.keyManager.connect(caller).execute(upExecutePayload);

      expect(
        await context.universalProfile["getData(bytes32)"](
          ERC725YKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
            "0000" +
            randomLSP1TypeId.substring(2, 42)
        )
      ).to.equal(context.accounts[2].address.toLowerCase());
    });
  });

  describe("when reentering and changing URD", () => {
    let contract_without_permissions: ReentrancyWithChangeURD;
    let contract_with_REENTRANCY_permission: ReentrancyWithChangeURD;
    let contract_with_CHANGEUNIVERSALRECEIVERDELEGATE_permissions: ReentrancyWithChangeURD;
    let contract_with_REENTRANCY_CHANGEUNIVERSALRECEIVERDELEGATE_permissions: ReentrancyWithChangeURD;
    const randomLSP1TypeId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("RandomLSP1TypeId")
    );
    before(async () => {
      contract_without_permissions = await new ReentrancyWithChangeURD__factory(
        caller
      ).deploy();
      contract_with_REENTRANCY_permission =
        await new ReentrancyWithChangeURD__factory(caller).deploy();
      contract_with_CHANGEUNIVERSALRECEIVERDELEGATE_permissions =
        await new ReentrancyWithChangeURD__factory(caller).deploy();
      contract_with_REENTRANCY_CHANGEUNIVERSALRECEIVERDELEGATE_permissions =
        await new ReentrancyWithChangeURD__factory(caller).deploy();

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_permission.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          contract_with_REENTRANCY_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.address.substring(
            2
          ),
        ERC725YKeys.LSP6["AddressPermissions:AllowedCalls"] +
          caller.address.substring(2),
      ];

      const permissionValues = [
        PERMISSIONS.REENTRANCY,
        PERMISSIONS.CHANGEUNIVERSALRECEIVERDELEGATE,
        combinePermissions(
          PERMISSIONS.REENTRANCY,
          PERMISSIONS.CHANGEUNIVERSALRECEIVERDELEGATE
        ),
        combineAllowedCalls(
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"],
          [
            contract_without_permissions.address,
            contract_with_REENTRANCY_permission.address,
            contract_with_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.address,
            contract_with_REENTRANCY_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.address,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        ),
      ];

      const permissionsPayload =
        context.universalProfile.interface.encodeFunctionData(
          "setData(bytes32[],bytes[])",
          [permissionKeys, permissionValues]
        );
      await context.keyManager
        .connect(context.owner)
        .execute(permissionsPayload);
    });

    it("should revert if caller has NO PERMISSIONS", async () => {
      const reentrantContractPayload =
        contract_without_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            randomLSP1TypeId + context.accounts[2].address.substring(2),
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [0, contract_without_permissions.address, 0, reentrantContractPayload]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(contract_without_permissions.address, "REENTRANCY");
    });

    it("should revert if caller has ONLY REENTRANCY permission", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_permission.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            randomLSP1TypeId + context.accounts[2].address.substring(2),
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_permission.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_REENTRANCY_permission.address,
          "CHANGEUNIVERSALRECEIVERDELEGATE"
        );
    });

    it("should revert if caller has ONLY CHANGEUNIVERSALRECEIVERDELEGATE permission", async () => {
      const reentrantContractPayload =
        contract_with_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            randomLSP1TypeId + context.accounts[2].address.substring(2),
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.address,
            0,
            reentrantContractPayload,
          ]
        );

      await expect(context.keyManager.connect(caller).execute(upExecutePayload))
        .to.be.revertedWithCustomError(context.keyManager, "NotAuthorised")
        .withArgs(
          contract_with_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.address,
          "REENTRANCY"
        );
    });

    it("should pass if caller has CHANGEUNIVERSALRECEIVERDELEGATE and REENTRANCY permissions", async () => {
      const reentrantContractPayload =
        contract_with_REENTRANCY_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.interface.encodeFunctionData(
          "universalReceiverDelegate",
          [
            context.universalProfile.address,
            0,
            "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
            randomLSP1TypeId + context.accounts[2].address.substring(2),
          ]
        );

      const upExecutePayload =
        context.universalProfile.interface.encodeFunctionData(
          "execute(uint256,address,uint256,bytes)",
          [
            0,
            contract_with_REENTRANCY_CHANGEUNIVERSALRECEIVERDELEGATE_permissions.address,
            0,
            reentrantContractPayload,
          ]
        );

      await context.keyManager.connect(caller).execute(upExecutePayload);

      expect(
        await context.universalProfile["getData(bytes32)"](
          ERC725YKeys.LSP1.LSP1UniversalReceiverDelegatePrefix +
            "0000" +
            randomLSP1TypeId.substring(2, 42)
        )
      ).to.equal("0x");
    });
  });
};
