import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// constants
import { ALL_PERMISSIONS, ERC725YKeys, PERMISSIONS } from "../../../constants";

// setup
import { LSP6TestContext } from "../../utils/context";
import { setupKeyManager } from "../../utils/fixtures";

// helpers
import {
  abiCoder,
  getRandomString,
  NotAllowedERC725YKeyError,
} from "../../utils/helpers";

export const shouldBehaveLikeAllowedERC725YKeys = (
  buildContext: () => Promise<LSP6TestContext>
) => {
  let context: LSP6TestContext;

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
      context = await buildContext();

      controllerCanSetOneKey = context.accounts[1];
      controllerCanSetManyKeys = context.accounts[2];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
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
        ALL_PERMISSIONS,
        PERMISSIONS.SETDATA,
        PERMISSIONS.SETDATA,
        abiCoder.encode(["bytes32[]"], [[customKey1]]),
        abiCoder.encode(["bytes32[]"], [[customKey2, customKey3, customKey4]]),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("verify allowed ERC725Y keys set", () => {
      it("`controllerCanSetOneKey` should have 1 x key in its list of allowed keys", async () => {
        const result = await context.universalProfile["getData(bytes32)"](
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            controllerCanSetOneKey.address.substring(2)
        );
        let [decodedResult] = abiCoder.decode(["bytes32[]"], result);

        expect(decodedResult).toHaveLength(1);
      });

      it("`controllerCanSetManyKeys` should have 3 x keys in its list of allowed keys", async () => {
        const result = await context.universalProfile["getData(bytes32)"](
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            controllerCanSetManyKeys.address.substring(2)
        );
        let [decodedResult] = abiCoder.decode(["bytes32[]"], result);

        expect(decodedResult).toHaveLength(3);
      });

      it("`controllerCanSetOneKey` should have the right keys set in its list of allowed keys", async () => {
        const result = await context.universalProfile["getData(bytes32)"](
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            controllerCanSetOneKey.address.substring(2)
        );
        let [decodedResult] = abiCoder.decode(["bytes32[]"], result);

        expect(decodedResult).toContain(customKey1);
      });

      it("`controllerCanSetManyKeys` should have the right keys set in its list of allowed keys", async () => {
        const result = await context.universalProfile["getData(bytes32)"](
          ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
            controllerCanSetManyKeys.address.substring(2)
        );
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

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, newValue]
            );
          await context.keyManager
            .connect(controllerCanSetOneKey)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(newValue);
        });

        it("should fail when setting the wrong key", async () => {
          let key = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("NotAllowedKey")
          );
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, newValue]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetOneKey)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(controllerCanSetOneKey.address, key)
          );
        });
      });

      describe("when setting multiple keys", () => {
        it("should fail when the list contains none of the allowed keys", async () => {
          let keys = [
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ZZZZZZZZZZ")),
          ];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value ZZZZZZZZ")),
          ];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [keys, values]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetOneKey)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(controllerCanSetOneKey.address, keys[0])
          );
        });

        it("should fail, even if the list contains the allowed key", async () => {
          let keys = [
            customKey1,
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
          ];
          let values = [
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 1")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
          ];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [keys, values]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetOneKey)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(controllerCanSetOneKey.address, keys[1])
          );
        });
      });
    });

    describe("when address can set multiple keys", () => {
      it("should pass when the input is all the allowed keys", async () => {
        let keys = [customKey2, customKey3, customKey4];
        let values = [
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 1")),
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 2")),
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 3")),
        ];

        let setDataPayload =
          context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );
        await context.keyManager
          .connect(controllerCanSetManyKeys)
          .execute(setDataPayload);

        let result = await context.universalProfile["getData(bytes32[])"](keys);

        expect(result).toEqual(values);
      });

      it("should fail when the input contains none of the allowed keys", async () => {
        let keys = [
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ZZZZZZZZZZ")),
        ];
        let values = [
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value ZZZZZZZZ")),
        ];

        let setDataPayload =
          context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32[],bytes[])",
            [keys, values]
          );

        await expect(
          context.keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload)
        ).toBeRevertedWith(
          NotAllowedERC725YKeyError(controllerCanSetManyKeys.address, keys[0])
        );
      });

      describe("when setting one key", () => {
        it("should pass when trying to set the 1st allowed key", async () => {
          let key = customKey2;
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, newValue]
            );
          await context.keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(newValue);
        });

        it("should pass when trying to set the 2nd allowed key", async () => {
          let key = customKey3;
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, newValue]
            );
          await context.keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(newValue);
        });

        it("should pass when trying to set the 3rd allowed key", async () => {
          let key = customKey4;
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, newValue]
            );
          await context.keyManager
            .connect(controllerCanSetManyKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(newValue);
        });

        it("should fail when setting a not-allowed Singleton key", async () => {
          let key = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("NotAllowedKey")
          );
          let newValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Some data")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, newValue]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetManyKeys)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(controllerCanSetManyKeys.address, key)
          );
        });
      });

      describe("when setting 2 x keys", () => {
        describe("should pass when", () => {
          it("the input is the first two (subset) allowed keys", async () => {
            let keys = [customKey2, customKey3];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 1")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 2")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );
            await context.keyManager
              .connect(controllerCanSetManyKeys)
              .execute(setDataPayload);

            let result = await context.universalProfile["getData(bytes32[])"](
              keys
            );
            expect(result).toEqual(values);
          });

          it("the input is the last two (subset) allowed keys", async () => {
            let keys = [customKey3, customKey4];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 1")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 2")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );
            await context.keyManager
              .connect(controllerCanSetManyKeys)
              .execute(setDataPayload);

            let result = await context.universalProfile["getData(bytes32[])"](
              keys
            );
            expect(result).toEqual(values);
          });

          it("the input is the first + last (subset) allowed keys", async () => {
            let keys = [customKey2, customKey4];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 1")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Some data 2")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );
            await context.keyManager
              .connect(controllerCanSetManyKeys)
              .execute(setDataPayload);

            let result = await context.universalProfile["getData(bytes32[])"](
              keys
            );
            expect(result).toEqual(values);
          });
        });
      });

      describe("when setting 3 x keys", () => {
        describe("should fail when", () => {
          it("1st key in input = 1st allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              customKey2,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 2")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[1]
              )
            );
          });

          it("2nd key in input = 1st allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              customKey2,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 2")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[0]
              )
            );
          });

          it("3rd key in input = 1st allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
              customKey2,
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 2")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[0]
              )
            );
          });

          it("1st key in input = 2nd allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              customKey3,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 2")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[1]
              )
            );
          });

          it("2nd key in input = 2nd allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              customKey3,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 3")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[0]
              )
            );
          });

          it("3rd key in input = 2nd allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
              customKey3,
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 3")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[0]
              )
            );
          });

          it("1st key in input = 3rd allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              customKey4,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 4")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[1]
              )
            );
          });

          it("2nd key in input = 3rd allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              customKey4,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 4")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[0]
              )
            );
          });

          it("3rd key in input = 3rd allowed key. Other 2 keys = not allowed", async () => {
            let keys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
              customKey4,
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value YYYYYYYY")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 4")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[0]
              )
            );
          });

          it("1st key in input = not allowed key. Other 2 keys = allowed", async () => {
            let keys = [
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              customKey2,
              customKey3,
            ];

            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 2")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 3")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[0]
              )
            );
          });

          it("2nd key in input = not allowed key. Other 2 keys = allowed", async () => {
            let keys = [
              customKey2,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              customKey3,
            ];
            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 2")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 3")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[1]
              )
            );
          });

          it("3rd key in input = not allowed key. Other 2 keys = allowed", async () => {
            let keys = [
              customKey2,
              customKey3,
              ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
            ];

            let values = [
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 2")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Custom Value 3")),
              ethers.utils.hexlify(ethers.utils.toUtf8Bytes("Value XXXXXXXX")),
            ];

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32[],bytes[])",
                [keys, values]
              );

            await expect(
              context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload)
            ).toBeRevertedWith(
              NotAllowedERC725YKeyError(
                controllerCanSetManyKeys.address,
                keys[2]
              )
            );
          });
        });
      });

      describe("when setting multiple keys", () => {
        describe("when input is bigger than the number of allowed keys", () => {
          describe("should fail when", () => {
            it("input = all the allowed keys + 1 x not-allowed key", async () => {
              let keys = [
                customKey2,
                customKey3,
                customKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
              ];
              let values = [
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Some Data for customKey2")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Some Data for customKey3")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Some Data for customKey4")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Value XXXXXXXX")
                ),
              ];

              let setDataPayload =
                context.universalProfile.interface.encodeFunctionData(
                  "setData(bytes32[],bytes[])",
                  [keys, values]
                );

              await expect(
                context.keyManager
                  .connect(controllerCanSetManyKeys)
                  .execute(setDataPayload)
              ).toBeRevertedWith(
                NotAllowedERC725YKeyError(
                  controllerCanSetManyKeys.address,
                  keys[3]
                )
              );
            });

            it("input = all the allowed keys + 5 x not-allowed key", async () => {
              let keys = [
                customKey2,
                customKey3,
                customKey4,
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("XXXXXXXXXX")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("YYYYYYYYYY")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ZZZZZZZZZZ")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("AAAAAAAAAA")),
                ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BBBBBBBBBB")),
              ];
              let values = [
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Custom Value 2")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Custom Value 3")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Custom Value 4")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Value XXXXXXXX")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Value YYYYYYYY")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Value ZZZZZZZZ")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Value AAAAAAAA")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Value BBBBBBBB")
                ),
              ];

              let setDataPayload =
                context.universalProfile.interface.encodeFunctionData(
                  "setData(bytes32[],bytes[])",
                  [keys, values]
                );

              await expect(
                context.keyManager
                  .connect(controllerCanSetManyKeys)
                  .execute(setDataPayload)
              ).toBeRevertedWith(
                NotAllowedERC725YKeyError(
                  controllerCanSetManyKeys.address,
                  keys[3]
                )
              );
            });
          });

          describe("should pass when", () => {
            // does not work when we put duplicate keys
            it("input contains all the allowed keys as DUPLICATE", async () => {
              let keys = [
                customKey2,
                customKey4,
                customKey3,
                customKey2,
                customKey3,
                customKey2,
                customKey4,
                customKey3,
                customKey4,
              ];
              let values = [
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Some Data for customKey2")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Some Data for customKey4")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes("Some Data for customKey3")
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes(
                    "Some Data (override 1) for customKey2"
                  )
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes(
                    "Some Data (override 1) for customKey3"
                  )
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes(
                    "Some Data (override 2) for customKey2"
                  )
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes(
                    "Some Data (override 1) for customKey4"
                  )
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes(
                    "Some Data (override 2) for customKey3"
                  )
                ),
                ethers.utils.hexlify(
                  ethers.utils.toUtf8Bytes(
                    "Some Data (override 2) for customKey4"
                  )
                ),
              ];

              let setDataPayload =
                context.universalProfile.interface.encodeFunctionData(
                  "setData(bytes32[],bytes[])",
                  [keys, values]
                );

              await context.keyManager
                .connect(controllerCanSetManyKeys)
                .execute(setDataPayload);

              let result = await context.universalProfile["getData(bytes32[])"](
                [customKey2, customKey3, customKey4]
              );
              expect(result).toEqual([
                // when putting duplicates in the keys given as inputs,
                // the last duplicate value for a key should be the one that override
                values[5],
                values[7],
                values[8],
              ]);
            });
          });
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

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );
          await context.keyManager
            .connect(context.owner)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
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

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [keys, values]
            );
          await context.keyManager
            .connect(context.owner)
            .execute(setDataPayload);

          let result = await context.universalProfile["getData(bytes32[])"](
            keys
          );

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
      context = await buildContext();

      controllerCanSetMappingKeys = context.accounts[1];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controllerCanSetMappingKeys.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          controllerCanSetMappingKeys.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.SETDATA,
        abiCoder.encode(["bytes32[]"], [[supportedStandardKey]]),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when address can set Mapping keys starting with a 'SupportedStandards:...'", () => {
      describe("when setting one key", () => {
        it("should pass when setting SupportedStandards:LSPX", async () => {
          let mappingKey = LSPXKey;
          let mappingValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0x24ae6f23")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [mappingKey, mappingValue]
            );

          await context.keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            mappingKey
          );
          expect(result).toEqual(mappingValue);
        });

        it("should pass when overriding SupportedStandards:LSPX", async () => {
          let mappingKey = LSPXKey;
          let mappingValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0x24ae6f23")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [mappingKey, mappingValue]
            );

          await context.keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            mappingKey
          );
          expect(result).toEqual(mappingValue);
        });

        it("should pass when setting SupportedStandards:LSPY", async () => {
          let mappingKey = LSPYKey;
          let mappingValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0x5e8d18c5")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [mappingKey, mappingValue]
            );
          await context.keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            mappingKey
          );
          expect(result).toEqual(mappingValue);
        });

        it("should pass when setting SupportedStandards:LSPZ", async () => {
          let mappingKey = LSPZKey;
          let mappingValue = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0x25b71a36")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [mappingKey, mappingValue]
            );

          await context.keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            mappingKey
          );
          expect(result).toEqual(mappingValue);
        });

        it("should fail when setting any other not-allowed Mapping key", async () => {
          // CustomMapping:...
          let notAllowedMappingKey =
            "0xb8a73e856fea3d5a518029e588a713f300000000000000000000000000000000";
          let notAllowedMappingValue = "0xbeefbeef";

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [notAllowedMappingKey, notAllowedMappingValue]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetMappingKeys)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(
              controllerCanSetMappingKeys.address,
              notAllowedMappingKey
            )
          );
        });
      });

      describe("when setting multiple keys", () => {
        it('(2 x keys) should pass when all the keys in the list start with bytes16(keccak256("SupportedStandards"))', async () => {
          let mappingKeys = [LSPYKey, LSPZKey];
          let mappingValues = ["0x5e8d18c5", "0x5e8d18c5"];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [mappingKeys, mappingValues]
            );

          await context.keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          let result = await context.universalProfile["getData(bytes32[])"](
            mappingKeys
          );
          expect(result).toEqual(mappingValues);
        });

        it('(2 x keys) (override) should pass when all the keys in the list start with bytes16(keccak256("SupportedStandards"))', async () => {
          let mappingKeys = [LSPYKey, LSPZKey];
          let mappingValues = ["0x5e8d18c5", "0x5e8d18c5"];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [mappingKeys, mappingValues]
            );

          await context.keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          let result = await context.universalProfile["getData(bytes32[])"](
            mappingKeys
          );
          expect(result).toEqual(mappingValues);
        });

        it('(3 x keys) should pass when all the keys in the list start with bytes16(keccak256("SupportedStandards"))', async () => {
          let mappingKeys = [
            "0xeafec4d89fa9619884b6b89135626455000000000000000000000000aaaaaaaa",
            "0xeafec4d89fa9619884b6b89135626455000000000000000000000000bbbbbbbb",
            "0xeafec4d89fa9619884b6b89135626455000000000000000000000000cccccccc",
          ];
          let mappingValues = ["0xaaaaaaaa", "0xbbbbbbbb", "0xcccccccc"];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [mappingKeys, mappingValues]
            );

          await context.keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          let result = await context.universalProfile["getData(bytes32[])"](
            mappingKeys
          );
          expect(result).toEqual(mappingValues);
        });

        it('(3 x keys) (override) should pass when all the keys in the list start with bytes16(keccak256("SupportedStandards"))', async () => {
          let mappingKeys = [
            "0xeafec4d89fa9619884b6b89135626455000000000000000000000000aaaaaaaa",
            "0xeafec4d89fa9619884b6b89135626455000000000000000000000000bbbbbbbb",
            "0xeafec4d89fa9619884b6b89135626455000000000000000000000000cccccccc",
          ];
          let mappingValues = ["0xaaaaaaaa", "0xbbbbbbbb", "0xcccccccc"];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [mappingKeys, mappingValues]
            );

          await context.keyManager
            .connect(controllerCanSetMappingKeys)
            .execute(setDataPayload);

          let result = await context.universalProfile["getData(bytes32[])"](
            mappingKeys
          );
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

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [randomMappingKeys, randomMappingValues]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetMappingKeys)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(
              controllerCanSetMappingKeys.address,
              randomMappingKeys[0]
            )
          );
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

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [mappingKeys, mappingValues]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetMappingKeys)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(
              controllerCanSetMappingKeys.address,
              mappingKeys[1]
            )
          );
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

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [randomMappingKey, randomMappingValue]
            );

          await context.keyManager
            .connect(context.owner)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            randomMappingKey
          );
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

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [randomMappingKeys, randomMappingValues]
            );
          await context.keyManager
            .connect(context.owner)
            .execute(setDataPayload);

          let result = await context.universalProfile["getData(bytes32[])"](
            randomMappingKeys
          );

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
      context = await buildContext();
      controllerCanSetArrayKeys = context.accounts[1];

      const permissionKeys = [
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.owner.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          controllerCanSetArrayKeys.address.substring(2),
        ERC725YKeys.LSP6["AddressPermissions:AllowedERC725YKeys"] +
          controllerCanSetArrayKeys.address.substring(2),
      ];

      const permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.SETDATA,
        abiCoder.encode(["bytes32[]"], [[allowedArrayKey]]),
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("when address can set Array element in 'MyArray[]", () => {
      describe("when setting one key", () => {
        it("should pass when setting array key length MyArray[]", async () => {
          let key = arrayKeyLength;
          // eg: MyArray[].length = 10 elements
          let value = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("0x0a"));

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

          await context.keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(value);
        });

        it("should pass when setting 1st array element MyArray[0]", async () => {
          let key = arrayKeyElement1;
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0xaaaaaaaa")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

          await context.keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(value);
        });

        it("should pass when setting 2nd array element MyArray[1]", async () => {
          let key = arrayKeyElement2;
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0xbbbbbbbb")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

          await context.keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(value);
        });

        it("should pass when setting 3rd array element MyArray[3]", async () => {
          let key = arrayKeyElement3;
          let value = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("0xcccccccc")
          );

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [key, value]
            );

          await context.keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          const result = await context.universalProfile["getData(bytes32)"](
            key
          );
          expect(result).toEqual(value);
        });

        it("should fail when setting elements of a not-allowed Array (eg: LSP5ReceivedAssets)", async () => {
          let notAllowedArrayKey =
            ERC725YKeys.LSP5["LSP5ReceivedAssets[]"].length;

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32,bytes)",
              [notAllowedArrayKey, "0x00"]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetArrayKeys)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(
              controllerCanSetArrayKeys.address,
              notAllowedArrayKey
            )
          );
        });
      });

      describe("when setting multiple keys", () => {
        it("should pass when all the keys in the list are from the allowed array MyArray[]", async () => {
          let keys = [arrayKeyElement1, arrayKeyElement2];
          let values = ["0xaaaaaaaa", "0xbbbbbbbb"];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [keys, values]
            );

          let tx = await context.keyManager
            .connect(controllerCanSetArrayKeys)
            .execute(setDataPayload);

          let receipt = await tx.wait();
          console.log("test gas cost: ", receipt.gasUsed.toNumber());

          let result = await context.universalProfile["getData(bytes32[])"](
            keys
          );
          expect(result).toEqual(values);
        });

        it("should fail when the list contains elements keys of a non-allowed Array (RandomArray[])", async () => {
          let randomArrayKeys = [
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000000",
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000001",
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000002",
          ];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [randomArrayKeys, ["0xdeadbeef", "0xdeadbeef", "0xdeadbeef"]]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetArrayKeys)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(
              controllerCanSetArrayKeys.address,
              randomArrayKeys[0]
            )
          );
        });

        it("should fail, even if the list contains a mix of allowed + not-allowed array element keys (MyArray[] + RandomArray[])", async () => {
          let keys = [
            arrayKeyElement1,
            arrayKeyElement2,
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000000",
            "0xb722d6e40cf8e32ad09d16af664b960500000000000000000000000000000001",
          ];
          let values = ["0xaaaaaaaa", "0xbbbbbbbb", "0xdeadbeef", "0xdeadbeef"];

          let setDataPayload =
            context.universalProfile.interface.encodeFunctionData(
              "setData(bytes32[],bytes[])",
              [keys, values]
            );

          await expect(
            context.keyManager
              .connect(controllerCanSetArrayKeys)
              .execute(setDataPayload)
          ).toBeRevertedWith(
            NotAllowedERC725YKeyError(
              controllerCanSetArrayKeys.address,
              keys[2]
            )
          );
        });
      });
    });
  });
};
