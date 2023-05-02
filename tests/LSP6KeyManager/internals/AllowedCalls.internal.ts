import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import {
  TargetContract,
  TargetContract__factory,
  UniversalProfile__factory,
} from "../../../types";

// constants
import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  OPERATION_TYPES,
  PERMISSIONS,
  CALLTYPE,
} from "../../../constants";

// setup
import { LSP6InternalsTestContext } from "../../utils/context";
import { setupKeyManagerHelper } from "../../utils/fixtures";

// helpers
import {
  combinePermissions,
  combineAllowedCalls,
  combineCallTypes,
} from "../../utils/helpers";

async function teardownKeyManagerHelper(
  context: LSP6InternalsTestContext,
  permissionsKeys: string[]
) {
  const teardownPayload = context.universalProfile.interface.encodeFunctionData(
    "setDataBatch",
    [permissionsKeys, Array(permissionsKeys.length).fill("0x")]
  );

  await context.keyManagerInternalTester
    .connect(context.owner)
    .execute(teardownPayload);
}

export const testAllowedCallsInternals = (
  buildContext: () => Promise<LSP6InternalsTestContext>
) => {
  let context: LSP6InternalsTestContext;

  before(async () => {
    context = await buildContext();
  });

  describe("`isCompactBytesArrayOfAllowedCalls`", () => {
    describe("when passing a compact bytes array with 1 element", () => {
      it("should return `true` if element is 32 bytes long", async () => {
        const allowedCalls = combineAllowedCalls(
          [CALLTYPE.VALUE],
          [context.accounts[5].address],
          ["0xffffffff"],
          ["0xffffffff"]
        );

        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
            allowedCalls
          );

        expect(result).to.be.true;
      });

      it("should return `false` if element is not 28 bytes long", async () => {
        const allowedCalls = ethers.utils.hexlify(ethers.utils.randomBytes(27));
        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
            allowedCalls
          );
        expect(result).to.be.false;
      });

      it("should return `false` if element is 0x0000 (zero length elements not allowed)", async () => {
        const allowedCalls = "0x0000";
        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
            allowedCalls
          );
        expect(result).to.be.false;
      });

      it("should return `false` if there are just 2 x length bytes but not followed by the value (the allowed calls)", async () => {
        const allowedCalls = "0x001c";
        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
            allowedCalls
          );
        expect(result).to.be.false;
      });

      it("should return `false` if there are just 2 x length bytes equal to `0x0002`", async () => {
        const allowedCalls = "0x0002";
        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
            allowedCalls
          );
        expect(result).to.be.false;
      });
    });

    describe("when passing a compact bytes array with 3 x elements", () => {
      it("should pass if all elements are 28 bytes long", async () => {
        const allowedCalls = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            context.accounts[5].address,
            context.accounts[6].address,
            context.accounts[7].address,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff", "0xffffffff"]
        );

        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
            allowedCalls
          );

        expect(result).to.be.true;
      });

      it("should fail if one of the element is not 28 bytes long", async () => {
        const allowedCalls = combineAllowedCalls(
          [CALLTYPE.VALUE, CALLTYPE.VALUE, CALLTYPE.VALUE],
          [
            context.accounts[5].address,
            ethers.utils.hexlify(ethers.utils.randomBytes(27)),
            context.accounts[7].address,
          ],
          ["0xffffffff", "0xffffffff", "0xffffffff"],
          ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
        );

        const result =
          await context.keyManagerInternalTester.isCompactBytesArrayOfAllowedCalls(
            allowedCalls
          );
        expect(result).to.be.false;
      });
    });
  });

  describe("testing 2 x addresses encoded as LSP2 CompactBytesArray under `AllowedCalls`", () => {
    let canCallOnlyTwoAddresses: SignerWithAddress,
      canCallNoAllowedCalls: SignerWithAddress;

    let allowedEOA: SignerWithAddress,
      notAllowedEOA: SignerWithAddress,
      allowedTargetContract: TargetContract,
      notAllowedTargetContract: TargetContract;

    let encodedAllowedCalls: string;

    before(async () => {
      context = await buildContext();

      canCallOnlyTwoAddresses = context.accounts[1];
      canCallNoAllowedCalls = context.accounts[2];
      allowedEOA = context.accounts[3];
      notAllowedEOA = context.accounts[4];

      allowedTargetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      notAllowedTargetContract = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      // addresses need to be put in lower case for the encoding otherwise:
      //  - the encoding will return them checksummed
      //  - reading the AllowedCalls from storage will return them lowercase
      encodedAllowedCalls = combineAllowedCalls(
        [
          combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
          combineCallTypes(CALLTYPE.VALUE, CALLTYPE.CALL),
        ],
        [
          allowedEOA.address.toLowerCase(),
          allowedTargetContract.address.toLowerCase(),
        ],
        ["0xffffffff", "0xffffffff"],
        ["0xffffffff", "0xffffffff"]
      );

      let permissionsKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          canCallOnlyTwoAddresses.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          canCallOnlyTwoAddresses.address.substring(2),
      ];

      let permissionsValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        encodedAllowedCalls,
      ];

      await setupKeyManagerHelper(context, permissionsKeys, permissionsValues);
    });

    describe("`getAllowedCallsFor(...)`", () => {
      it("should return the list of allowed calls", async () => {
        let bytesResult =
          await context.keyManagerInternalTester.getAllowedCallsFor(
            canCallOnlyTwoAddresses.address
          );

        expect(bytesResult).to.equal(encodedAllowedCalls);
      });

      it("should return no bytes when no allowed calls were set", async () => {
        let bytesResult =
          await context.keyManagerInternalTester.getAllowedCallsFor(
            context.owner.address
          );
        expect(bytesResult).to.equal("0x");

        let resultFromAccount = await context.universalProfile[
          "getData(bytes32)"
        ](
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            context.owner.address.substring(2)
        );
        expect(resultFromAccount).to.equal("0x");
      });
    });

    describe("`verifyAllowedCall(...)`", () => {
      describe("when the ERC725X payload (transfer 1 LYX) is for an address listed in the allowed calls", () => {
        it("should pass", async () => {
          const payload = context.universalProfile.interface.encodeFunctionData(
            "execute",
            [
              OPERATION_TYPES.CALL,
              allowedEOA.address,
              ethers.utils.parseEther("1"),
              "0x",
            ]
          );

          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              canCallOnlyTwoAddresses.address,
              payload
            )
          ).to.not.be.reverted;
        });
      });

      describe("when the ERC725X payload (transfer 1 LYX)  is for an address not listed in the allowed calls", () => {
        it("should revert", async () => {
          let disallowedAddress = ethers.utils.getAddress(
            "0xdeadbeefdeadbeefdeaddeadbeefdeadbeefdead"
          );

          const payload = context.universalProfile.interface.encodeFunctionData(
            "execute",
            [
              OPERATION_TYPES.CALL,
              disallowedAddress,
              ethers.utils.parseEther("1"),
              "0x",
            ]
          );

          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              canCallOnlyTwoAddresses.address,
              payload
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedCall"
            )
            .withArgs(
              canCallOnlyTwoAddresses.address,
              disallowedAddress,
              "0x00000000"
            );
        });
      });

      describe("when there is nothing stored under `AllowedCalls` for a controller", () => {
        it("should revert", async () => {
          let randomAddress = ethers.Wallet.createRandom().address;

          const payload = context.universalProfile.interface.encodeFunctionData(
            "execute",
            [
              OPERATION_TYPES.CALL,
              randomAddress,
              ethers.utils.parseEther("1"),
              "0x",
            ]
          );

          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              canCallNoAllowedCalls.address,
              payload
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NoCallsAllowed"
            )
            .withArgs(canCallNoAllowedCalls.address);
        });
      });
    });
  });

  describe("`verifyAllowedCall(...)` with `vcsd` permissions per Allowed Call", () => {
    // for testing purpose, we use a random payload
    // we are not doing integration tests to tests the effects on the TargetContract
    // we are just testing that the `verifyAllowedCall(...)` function works as expected
    const randomPayload = "0xcafecafe";

    let targetContractValue: TargetContract,
      targetContractCall: TargetContract,
      targetContractStaticCall: TargetContract,
      targetContractDelegateCall: TargetContract;

    let allowedCalls: string;

    before("setup AllowedCalls", async () => {
      context = await buildContext();

      targetContractValue = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      targetContractCall = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      targetContractStaticCall = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      targetContractDelegateCall = await new TargetContract__factory(
        context.accounts[0]
      ).deploy();

      allowedCalls = combineAllowedCalls(
        [
          CALLTYPE.VALUE,
          CALLTYPE.CALL,
          CALLTYPE.STATICCALL,
          CALLTYPE.DELEGATECALL,
        ],
        [
          targetContractValue.address,
          targetContractCall.address,
          targetContractStaticCall.address,
          targetContractDelegateCall.address,
        ],
        ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"],
        ["0xffffffff", "0xffffffff", "0xffffffff", "0xffffffff"]
      );

      // setup empty allowed calls
      await setupKeyManagerHelper(context, [], []);
    });

    describe("when controller has permission CALL + some AllowedCalls + does `ERC725X.execute(...)` with `operationType == CALL`", () => {
      let controller: SignerWithAddress;

      let permissionKeys: string[];
      let permissionValues: string[];

      before("setup permissions", async () => {
        controller = context.accounts[1];

        permissionKeys = [
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            controller.address.substring(2),
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            controller.address.substring(2),
        ];

        permissionValues = [combinePermissions(PERMISSIONS.CALL), allowedCalls];

        const setup = context.universalProfile.interface.encodeFunctionData(
          "setDataBatch",
          [permissionKeys, permissionValues]
        );

        await context.keyManagerInternalTester
          .connect(context.owner)
          .execute(setup);
      });

      after("reset permissions", async () => {
        await teardownKeyManagerHelper(context, permissionKeys);
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `v` permission only (`v` = VALUE)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContractValue.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractValue.address,
            randomPayload
          );
      });

      it("should pass when the allowed address has `c` permission only (`c` = CALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContractCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        ).to.not.be.reverted;
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `s` permission only (`s` = STATICCALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContractStaticCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractStaticCall.address,
            randomPayload
          );
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `d` permission only (`d` = DELEGATECALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.CALL,
            targetContractDelegateCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractDelegateCall.address,
            randomPayload
          );
      });
    });

    describe("when controller has permission STATICCALL + some AllowedCalls + does `ERC725X.execute(...)` with `operationType == STATICCALL`", () => {
      let controller: SignerWithAddress;

      let permissionKeys: string[];
      let permissionValues: string[];

      before("setup permissions", async () => {
        controller = context.accounts[1];

        permissionKeys = [
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            controller.address.substring(2),
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            controller.address.substring(2),
        ];

        permissionValues = [
          combinePermissions(PERMISSIONS.STATICCALL),
          allowedCalls,
        ];

        const setup = context.universalProfile.interface.encodeFunctionData(
          "setDataBatch",
          [permissionKeys, permissionValues]
        );

        await context.keyManagerInternalTester
          .connect(context.owner)
          .execute(setup);
      });

      after("reset permissions", async () => {
        await teardownKeyManagerHelper(context, permissionKeys);
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `v` permission only (`v` = VALUE)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.STATICCALL,
            targetContractValue.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractValue.address,
            randomPayload
          );
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `c` permission only (`c` = CALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.STATICCALL,
            targetContractCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractCall.address,
            randomPayload
          );
      });

      it("should pass when the allowed address has `s` permission only (`s` = STATICCALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.STATICCALL,
            targetContractStaticCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        ).to.not.be.reverted;
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `d` permission only (`d` = DELEGATECALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.STATICCALL,
            targetContractDelegateCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractDelegateCall.address,
            randomPayload
          );
      });
    });

    describe("when controller has permission DELEGATECALL + some AllowedCalls + does `ERC725X.execute(...)` with `operationType == DELEGATECALL`", () => {
      let controller: SignerWithAddress;

      let permissionKeys: string[];
      let permissionValues: string[];

      before("setup permissions", async () => {
        controller = context.accounts[1];

        permissionKeys = [
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            controller.address.substring(2),
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            controller.address.substring(2),
        ];

        permissionValues = [
          combinePermissions(PERMISSIONS.DELEGATECALL),
          allowedCalls,
        ];

        const setup = context.universalProfile.interface.encodeFunctionData(
          "setDataBatch",
          [permissionKeys, permissionValues]
        );

        await context.keyManagerInternalTester
          .connect(context.owner)
          .execute(setup);
      });

      after("reset permissions", async () => {
        await teardownKeyManagerHelper(context, permissionKeys);
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `v` permission only (`v` = VALUE)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.DELEGATECALL,
            targetContractValue.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractValue.address,
            randomPayload
          );
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `c` permission only (`c` = CALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.DELEGATECALL,
            targetContractCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractCall.address,
            randomPayload
          );
      });

      it("should fail with `NotAllowedCall` error when the allowed address has `s` permission only (`s` = STATICCALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.DELEGATECALL,
            targetContractStaticCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        )
          .to.be.revertedWithCustomError(
            context.keyManagerInternalTester,
            "NotAllowedCall"
          )
          .withArgs(
            controller.address,
            targetContractStaticCall.address,
            randomPayload
          );
      });

      it("should pass when the allowed address has `d` permission only (`d` = DELEGATECALL)", async () => {
        const payload = context.universalProfile.interface.encodeFunctionData(
          "execute",
          [
            OPERATION_TYPES.DELEGATECALL,
            targetContractDelegateCall.address,
            0,
            randomPayload, // random payload
          ]
        );

        await expect(
          context.keyManagerInternalTester.verifyAllowedCall(
            controller.address,
            payload
          )
        ).to.not.be.reverted;
      });
    });
  });

  describe("testing 'zero bytes' stored under AddressPermission:AllowedCalls:<address>", () => {
    type ControllersContext = {
      noBytes: SignerWithAddress;
      oneZeroByte: SignerWithAddress;
      tenZeroBytes: SignerWithAddress;
      twentyZeroBytes: SignerWithAddress;
      thirtyTwoZeroBytes: SignerWithAddress;
      fourtyZeroBytes: SignerWithAddress;
      sixtyFourZeroBytes: SignerWithAddress;
      hundredZeroBytes: SignerWithAddress;
    };

    const zeroBytesValues = [
      "0x",
      "0x" + "00".repeat(1),
      "0x" + "00".repeat(10),
      "0x" + "00".repeat(20),
      "0x" + "00".repeat(32),
      "0x" + "00".repeat(40),
      "0x" + "00".repeat(64),
      "0x" + "00".repeat(100),
    ];

    let controller: ControllersContext;

    before(async () => {
      context = await buildContext();

      controller = {
        noBytes: context.accounts[1],
        oneZeroByte: context.accounts[2],
        tenZeroBytes: context.accounts[3],
        twentyZeroBytes: context.accounts[4],
        thirtyTwoZeroBytes: context.accounts[5],
        fourtyZeroBytes: context.accounts[6],
        sixtyFourZeroBytes: context.accounts[7],
        hundredZeroBytes: context.accounts[8],
      };

      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ...Object.values(controller).map(
          (controller) =>
            ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            controller.address.substring(2)
        ),
        ...Object.values(controller).map(
          (controller) =>
            ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
            controller.address.substring(2)
        ),
      ];

      let permissionValues = [ALL_PERMISSIONS];

      for (let ii = 0; ii < Object.values(controller).length; ii++) {
        permissionValues.push(
          combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE)
        );
      }

      permissionValues = permissionValues.concat(zeroBytesValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("`verifyAllowedCall(...)`", () => {
      const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();
      const randomData = "0xaabbccdd";

      const universalProfileInterface =
        UniversalProfile__factory.createInterface();

      let payload: string = universalProfileInterface.encodeFunctionData(
        "execute",
        [
          OPERATION_TYPES.CALL,
          randomAddress,
          ethers.utils.parseEther("1"),
          randomData,
        ]
      );

      describe("should revert with `NoAllowedCall` error", () => {
        it(`noBytes -> ${zeroBytesValues[0]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.noBytes.address,
              payload
            )
          ).to.be.reverted;
        });

        it(`oneZeroByte -> ${zeroBytesValues[1]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.oneZeroByte.address,
              payload
            )
          ).to.be.reverted;
        });

        it(`tenZeroBytes -> ${zeroBytesValues[2]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.tenZeroBytes.address,
              payload
            )
          ).to.be.reverted;
        });

        it(`twentyZeroBytes -> ${zeroBytesValues[3]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.twentyZeroBytes.address,
              payload
            )
          ).to.be.reverted;
        });
      });

      /**
       * TODO: define the new behaviour when some empty zero bytes 0x00 are stored under `AddressPermissions:AllowedCalls:<address>`
       */
      describe("should revert with NotAllowedCall(...) error for:", () => {
        it.skip(`thirtyTwoZeroBytes -> ${zeroBytesValues[4]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.thirtyTwoZeroBytes.address,
              payload
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedCall"
            )
            .withArgs(
              controller.thirtyTwoZeroBytes.address,
              ethers.utils.getAddress(randomAddress),
              randomData
            );
        });

        it.skip(`fourtyZeroBytes -> ${zeroBytesValues[5]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.fourtyZeroBytes.address,
              randomAddress
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedCall"
            )
            .withArgs(
              controller.fourtyZeroBytes.address,
              ethers.utils.getAddress(randomAddress),
              randomData
            );
        });

        it.skip(`sixtyFourZeroBytes -> ${zeroBytesValues[6]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.sixtyFourZeroBytes.address,
              randomAddress
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedAddress"
            )
            .withArgs(
              controller.sixtyFourZeroBytes.address,
              ethers.utils.getAddress(randomAddress)
            );
        });

        it.skip(`hundredZeroBytes -> ${zeroBytesValues[7]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.hundredZeroBytes.address,
              randomAddress
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedAddress"
            )
            .withArgs(
              controller.hundredZeroBytes.address,
              ethers.utils.getAddress(randomAddress)
            );
        });
      });
    });
  });

  describe("testing random values under the key `AddressPermissions:AllowedCalls:<address>`", () => {
    type ControllersContext = {
      multipleOf29Bytes: SignerWithAddress;
      shortBytes: SignerWithAddress;
      longBytes: SignerWithAddress;
    };

    const randomValues = [
      "0x001c00000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000",
      "0xaabbccdd",
      "0x1234567890abcdef1234567890abcdef1234",
    ];

    const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();
    const randomData = "0xaabbccdd";

    let payload: string;
    let controller: ControllersContext;

    before(async () => {
      context = await buildContext();

      payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATION_TYPES.CALL,
          randomAddress,
          ethers.utils.parseEther("1"),
          randomData,
        ]
      );

      controller = {
        multipleOf29Bytes: context.accounts[1],
        shortBytes: context.accounts[2],
        longBytes: context.accounts[3],
      };

      let permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          controller.multipleOf29Bytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          controller.shortBytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          controller.longBytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          controller.multipleOf29Bytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          controller.shortBytes.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          controller.longBytes.address.substring(2),
      ];

      let permissionValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
      ];

      permissionValues = permissionValues.concat(randomValues);

      await setupKeyManagerHelper(context, permissionKeys, permissionValues);
    });

    describe("`verifyAllowedCall(...)`", () => {
      describe("should revert with NotAllowedCall(...) error for:", () => {
        // this test is invalid
        it.skip(`multipleOf29Bytes -> ${randomValues[0]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.multipleOf29Bytes.address,
              payload
            )
          )
            .to.be.revertedWithCustomError(
              context.keyManagerInternalTester,
              "NotAllowedCall"
            )
            .withArgs(
              controller.multipleOf29Bytes.address,
              ethers.utils.getAddress(randomAddress),
              randomData
            );
        });
      });

      describe("should revert", () => {
        it(`shortBytes -> ${randomValues[1]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.shortBytes.address,
              payload
            )
          ).to.be.reverted;
        });

        // TODO: resolve this test
        it.skip(`longBytes -> ${randomValues[2]}`, async () => {
          await expect(
            context.keyManagerInternalTester.verifyAllowedCall(
              controller.longBytes.address,
              randomAddress
            )
          ).to.be.reverted;
        });
      });
    });
  });

  describe("when caller as `0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff` in its allowed calls", () => {
    let anyAllowedCalls: SignerWithAddress;

    before(async () => {
      context = await buildContext();

      anyAllowedCalls = context.accounts[1];

      let permissionsKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
          anyAllowedCalls.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] +
          anyAllowedCalls.address.substring(2),
      ];

      let permissionsValues = [
        ALL_PERMISSIONS,
        combinePermissions(PERMISSIONS.CALL, PERMISSIONS.TRANSFERVALUE),
        combineAllowedCalls(
          // we do not consider the first 4 bytes (32 bits) of the allowed call
          // as they are for the call types
          // the test below should revert regardless of the call type
          // TODO: is this the correct behaviour?
          ["0x00000000"],
          ["0xffffffffffffffffffffffffffffffffffffffff"],
          ["0xffffffff"],
          ["0xffffffff"]
        ),
      ];

      await setupKeyManagerHelper(context, permissionsKeys, permissionsValues);
    });

    it("should revert", async () => {
      const randomData = "0xaabbccdd";
      const randomAddress = ethers.Wallet.createRandom().address.toLowerCase();

      const payload = context.universalProfile.interface.encodeFunctionData(
        "execute",
        [
          OPERATION_TYPES.CALL,
          randomAddress,
          ethers.utils.parseEther("1"),
          randomData,
        ]
      );

      await expect(
        context.keyManagerInternalTester.verifyAllowedCall(
          anyAllowedCalls.address,
          payload
        )
      )
        .to.be.revertedWithCustomError(
          context.keyManagerInternalTester,
          "InvalidWhitelistedCall"
        )
        .withArgs(anyAllowedCalls.address);
    });
  });
};
