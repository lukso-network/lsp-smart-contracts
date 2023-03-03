import { expect } from "chai";
import { ethers, network } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// types
import {
  UniversalProfile,
  GenericExecutor__factory,
  ERC1271MaliciousMock__factory,
  LSP20Owner1,
  LSP20Owner1__factory,
  LSP20Owner2,
  LSP20Owner2__factory,
  LSP20Owner3,
  LSP20Owner3__factory,
  LSP20Owner4,
  LSP20Owner4__factory,
  LSP20Owner5,
  LSP20Owner5__factory,
} from "../types";

// helpers
import { getRandomAddresses } from "./utils/helpers";

// constants
import {
  ERC1271_VALUES,
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  SupportedStandards,
} from "../constants";

export type LSP3TestContext = {
  accounts: SignerWithAddress[];
  universalProfile: UniversalProfile;
  deployParams: { owner: SignerWithAddress; initialFunding?: number };
};

export const shouldBehaveLikeLSP3 = (
  buildContext: (initialFunding?: number) => Promise<LSP3TestContext>
) => {
  let context: LSP3TestContext;

  before(async () => {
    context = await buildContext(100);
  });

  describe("when testing lsp20 integration", () => {
    describe("when owner is an EOA", () => {
      describe("setData", () => {
        const dataKey = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("RandomKey1")
        );
        const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

        it("should pass when owner calls", async () => {
          await context.universalProfile
            .connect(context.deployParams.owner)
            ["setData(bytes32,bytes)"](dataKey, dataValue);

          expect(
            await context.universalProfile["getData(bytes32)"](dataKey)
          ).to.equal(dataValue);
        });

        it("should revert when non-owner calls", async () => {
          await expect(
            context.universalProfile
              .connect(context.accounts[1])
              ["setData(bytes32,bytes)"](dataKey, dataValue)
          )
            .to.be.revertedWithCustomError(
              context.universalProfile,
              "LSP20InvalidMagicValue"
            )
            .withArgs("0x");
        });
      });
      describe("setData array", () => {
        const dataKey = ethers.utils.keccak256(
          ethers.utils.toUtf8Bytes("RandomKey2")
        );
        const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

        it("should pass when owner calls", async () => {
          await context.universalProfile
            .connect(context.deployParams.owner)
            ["setData(bytes32[],bytes[])"]([dataKey], [dataValue]);

          expect(
            await context.universalProfile["getData(bytes32[])"]([dataKey])
          ).to.deep.equal([dataValue]);
        });

        it("should revert when non-owner calls", async () => {
          await expect(
            context.universalProfile
              .connect(context.accounts[1])
              ["setData(bytes32[],bytes[])"]([dataKey], [dataValue])
          )
            .to.be.revertedWithCustomError(
              context.universalProfile,
              "LSP20InvalidMagicValue"
            )
            .withArgs("0x");
        });
      });

      describe("execute", () => {
        it("should pass when owner calls", async () => {
          const executeParams = {
            operation: OPERATION_TYPES.CALL,
            address: context.accounts[1].address,
            value: 0,
            data: "0x",
          };

          await expect(
            context.universalProfile
              .connect(context.deployParams.owner)
              ["execute(uint256,address,uint256,bytes)"](
                executeParams.operation,
                executeParams.address,
                executeParams.value,
                executeParams.data
              )
          )
            .to.emit(context.universalProfile, "Executed")
            .withArgs(
              OPERATION_TYPES.CALL,
              context.accounts[1].address,
              0,
              "0x00000000"
            );
        });

        it("should revert when non-owner calls", async () => {
          const executeParams = {
            operation: OPERATION_TYPES.CALL,
            address: context.accounts[1].address,
            value: 0,
            data: "0x",
          };

          await expect(
            context.universalProfile
              .connect(context.accounts[1])
              ["execute(uint256,address,uint256,bytes)"](
                executeParams.operation,
                executeParams.address,
                executeParams.value,
                executeParams.data
              )
          )
            .to.be.revertedWithCustomError(
              context.universalProfile,
              "LSP20InvalidMagicValue"
            )
            .withArgs("0x");
        });
      });
      describe("execute Array", () => {
        it("should pass when the owner is calling", async () => {
          const operationsType = [OPERATION_TYPES.CALL];
          const recipients = [context.accounts[1].address];
          const values = [0];
          const datas = ["0x"];

          const tx = await context.universalProfile
            .connect(context.deployParams.owner)
            ["execute(uint256[],address[],uint256[],bytes[])"](
              operationsType,
              recipients,
              values,
              datas
            );

          await expect(tx)
            .to.emit(context.universalProfile, "Executed")
            .withArgs(
              OPERATION_TYPES.CALL,
              context.accounts[1].address,
              0,
              "0x00000000"
            );
        });

        it("should pass when the non-owner is calling", async () => {
          const operationsType = [OPERATION_TYPES.CALL];
          const recipients = [context.accounts[1].address];
          const values = [ethers.BigNumber.from("0")];
          const datas = ["0x"];

          await expect(
            context.universalProfile
              .connect(context.accounts[3])
              ["execute(uint256[],address[],uint256[],bytes[])"](
                operationsType,
                recipients,
                values,
                datas
              )
          )
            .to.be.revertedWithCustomError(
              context.universalProfile,
              "LSP20InvalidMagicValue"
            )
            .withArgs("0x");
        });
      });
      describe("transferOwnership", () => {
        it("should pass when the owner is calling", async () => {
          const newOwner = context.accounts[1].address;

          await expect(
            context.universalProfile
              .connect(context.deployParams.owner)
              .transferOwnership(newOwner)
          ).to.emit(context.universalProfile, "OwnershipTransferStarted");
        });

        it("should pass when the non-owner is calling", async () => {
          const newOwner = context.accounts[1].address;

          await expect(
            context.universalProfile
              .connect(context.accounts[3])
              .transferOwnership(newOwner)
          )
            .to.be.revertedWithCustomError(
              context.universalProfile,
              "LSP20InvalidMagicValue"
            )
            .withArgs("0x");
        });
      });
      describe("renounceOwnership", () => {
        it("should pass when the owner is calling", async () => {
          await network.provider.send("hardhat_mine", [
            ethers.utils.hexValue(500),
          ]);

          await expect(
            context.universalProfile
              .connect(context.deployParams.owner)
              .renounceOwnership()
          ).to.emit(context.universalProfile, "RenounceOwnershipStarted");
        });

        it("should pass when the non-owner is calling", async () => {
          await network.provider.send("hardhat_mine", [
            ethers.utils.hexValue(100),
          ]);

          await expect(
            context.universalProfile
              .connect(context.accounts[3])
              .renounceOwnership()
          )
            .to.be.revertedWithCustomError(
              context.universalProfile,
              "LSP20InvalidMagicValue"
            )
            .withArgs("0x");
        });
      });
    });

    describe.only("when the owner is a contract", () => {
      describe("Contract 1 (That doesn't have the verifyCall function)", () => {
        let ownerContract: LSP20Owner1;
        before("deploying a new owner", async () => {
          ownerContract = await new LSP20Owner1__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract
            .connect(context.deployParams.owner)
            .acceptOwnership(context.universalProfile.address);
        });

        it("should revert", async () => {
          const dataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("RandomKey1")
          );
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(
            context.universalProfile["setData(bytes32,bytes)"](
              dataKey,
              dataValue
            )
          ).to.be.revertedWith(
            "LSP20: owner does not support Reverse Verification"
          );
        });

        after("reverting to previous owner", async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile
            .connect(context.deployParams.owner)
            .acceptOwnership();
        });
      });
      describe("Contract 2 (That have the fallback that doesn't return anything)", () => {
        let ownerContract: LSP20Owner2;
        before("deploying a new owner", async () => {
          ownerContract = await new LSP20Owner2__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        it("should revert", async () => {
          const dataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("RandomKey1")
          );
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(
            context.universalProfile["setData(bytes32,bytes)"](
              dataKey,
              dataValue
            )
          )
            .to.be.revertedWithCustomError(
              context.universalProfile,
              "LSP20InvalidMagicValue"
            )
            .withArgs("0x");
        });

        after("reverting to previous owner", async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile
            .connect(context.deployParams.owner)
            .acceptOwnership();
        });
      });
      describe("Contract 3 (That have the fallback that return valid magicValue)", () => {
        let ownerContract: LSP20Owner3;
        before("deploying a new owner", async () => {
          ownerContract = await new LSP20Owner3__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        it("should revert", async () => {
          const dataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("RandomKey1")
          );
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(
            context.universalProfile["setData(bytes32,bytes)"](
              dataKey,
              dataValue
            )
          ).to.emit(ownerContract, "FallbackCalled");
        });

        after("reverting to previous owner", async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile
            .connect(context.deployParams.owner)
            .acceptOwnership();
        });
      });
      describe("Contract 4 (That implement verifyCall but return bytes32)", () => {
        let ownerContract: LSP20Owner4;
        before("deploying a new owner", async () => {
          ownerContract = await new LSP20Owner4__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        it("should revert", async () => {
          const dataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("RandomKey1")
          );
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(
            context.universalProfile["setData(bytes32,bytes)"](
              dataKey,
              dataValue
            )
          ).to.be.revertedWithoutReason();
        });

        after("reverting to previous owner", async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile
            .connect(context.deployParams.owner)
            .acceptOwnership();
        });
      });
      describe("Contract 5 (That implements verifyCall but return not a valid magicValue)", () => {
        let ownerContract: LSP20Owner5;
        before("deploying a new owner", async () => {
          ownerContract = await new LSP20Owner5__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        it("should revert", async () => {
          const dataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("RandomKey1")
          );
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(
            context.universalProfile["setData(bytes32,bytes)"](
              dataKey,
              dataValue
            )
          )
            .to.be.revertedWithCustomError(
              context.universalProfile,
              "LSP20InvalidMagicValue"
            )
            .withArgs("0xaabbccdd" + "0".repeat(56));
        });

        after("reverting to previous owner", async () => {
          await ownerContract
            .connect(context.deployParams.owner)
            .transferOwnership(context.deployParams.owner.address);

          await context.universalProfile
            .connect(context.deployParams.owner)
            .acceptOwnership();
        });
      });
      describe("Contract 6 (That implements verifyCall and return valid magicValue)", () => {});
      describe("Contract 7 (That implements verifyCall that return valid magicValue but does not invoke verifyCallResult)", () => {});
      describe("Contract 8 (That implements verifyCall that return valid magicValue and invoke verifyCallResult that returns a valid magicValue )", () => {});
      describe("Contract 9 (That implements verifyCall that return valid magicValue but verifyCallResult doesn't return valid magicValue)", () => {});
      describe("Contract 10 (That implements verifyCall that return valid magicValue but verifyCallResult return bytes32)", () => {});
    });
  });

  describe("when using `isValidSignature()` from ERC1271", () => {
    afterEach(async () => {
      context = await buildContext(100);
    });
    it("should verify signature from owner", async () => {
      const signer = context.deployParams.owner;

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).to.equal(ERC1271_VALUES.MAGIC_VALUE);
    });

    it("should fail when verifying signature from non-owner", async () => {
      const signer = context.accounts[1];

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });

    it("should return failValue when the owner doesn't have isValidSignature function", async () => {
      const signer = context.accounts[1];

      const genericExecutor = await new GenericExecutor__factory(
        context.accounts[0]
      ).deploy();

      await context.universalProfile
        .connect(context.accounts[0])
        .transferOwnership(genericExecutor.address);

      const acceptOwnershipPayload =
        context.universalProfile.interface.encodeFunctionData(
          "acceptOwnership"
        );

      await genericExecutor.call(
        context.universalProfile.address,
        0,
        acceptOwnershipPayload
      );

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });

    it("should return failValue when the owner call isValidSignature function that doesn't return bytes4", async () => {
      const signer = context.accounts[1];

      const maliciousERC1271Wallet = await new ERC1271MaliciousMock__factory(
        context.accounts[0]
      ).deploy();

      await context.universalProfile
        .connect(context.accounts[0])
        .transferOwnership(maliciousERC1271Wallet.address);

      const acceptOwnershipPayload =
        context.universalProfile.interface.encodeFunctionData(
          "acceptOwnership"
        );

      await maliciousERC1271Wallet.call(
        context.universalProfile.address,
        0,
        acceptOwnershipPayload
      );

      const dataToSign = "0xcafecafe";
      const messageHash = ethers.utils.hashMessage(dataToSign);
      const signature = await signer.signMessage(dataToSign);

      const result = await context.universalProfile.isValidSignature(
        messageHash,
        signature
      );
      expect(result).to.equal(ERC1271_VALUES.FAIL_VALUE);
    });
  });

  describe("when interacting with the ERC725Y storage", () => {
    let lsp12IssuedAssetsKeys = [
      ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index +
        "00000000000000000000000000000000",
      ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index +
        "00000000000000000000000000000001",
    ];

    let lsp12IssuedAssetsValues = [
      "0xd94353d9b005b3c0a9da169b768a31c57844e490",
      "0xdaea594e385fc724449e3118b2db7e86dfba1826",
    ];

    it("should set the 3 x keys for a basic UP setup => `LSP3Profile`, `LSP12IssuedAssets[]` and `LSP1UniversalReceiverDelegate`", async () => {
      let keys = [
        ERC725YDataKeys.LSP3.LSP3Profile,
        ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length,
        ...lsp12IssuedAssetsKeys,
        ERC725YDataKeys.LSP1.LSP1UniversalReceiverDelegate,
      ];
      let values = [
        "0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        ...lsp12IssuedAssetsValues,
        "0x1183790f29be3cdfd0a102862fea1a4a30b3adab",
      ];

      await context.universalProfile["setData(bytes32[],bytes[])"](
        keys,
        values
      );

      const result = await context.universalProfile["getData(bytes32[])"](keys);
      expect(result).to.eql(values);
    });

    it("should add +10 more LSP12IssuedAssets[]", async () => {
      let newIssuedAssets = getRandomAddresses(10);

      const expectedKeysLength =
        lsp12IssuedAssetsKeys.length + newIssuedAssets.length;
      const expectedValuesLength =
        lsp12IssuedAssetsValues.length + newIssuedAssets.length;

      for (let ii = 0; ii < newIssuedAssets.length; ii++) {
        let hexIndex = ethers.utils.hexlify(lsp12IssuedAssetsKeys.length);

        lsp12IssuedAssetsKeys.push(
          ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index +
            ethers.utils.hexZeroPad(hexIndex, 16).substring(2)
        );

        lsp12IssuedAssetsValues.push(newIssuedAssets[ii]);
      }
      expect(lsp12IssuedAssetsKeys.length).to.equal(expectedKeysLength);
      expect(lsp12IssuedAssetsValues.length).to.equal(expectedValuesLength);

      let keys = [
        ...lsp12IssuedAssetsKeys,
        ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length, // update array length
      ];

      let values = [
        ...lsp12IssuedAssetsValues,
        ethers.utils.hexZeroPad(
          ethers.utils.hexlify(lsp12IssuedAssetsValues.length),
          32
        ),
      ];

      await context.universalProfile["setData(bytes32[],bytes[])"](
        keys,
        values
      );

      const result = await context.universalProfile["getData(bytes32[])"](keys);
      expect(result).to.eql(values);
    });

    for (let ii = 1; ii <= 8; ii++) {
      it("should add +1 LSP12IssuedAssets", async () => {
        let hexIndex = ethers.utils.hexlify(lsp12IssuedAssetsKeys.length + 1);

        lsp12IssuedAssetsKeys.push(
          ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index +
            ethers.utils.hexZeroPad(hexIndex, 16).substring(2)
        );

        lsp12IssuedAssetsValues.push(
          ethers.Wallet.createRandom().address.toLowerCase()
        );

        let keys = [
          ...lsp12IssuedAssetsKeys,
          ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length, // update array length
        ];

        let values = [
          ...lsp12IssuedAssetsValues,
          ethers.utils.hexZeroPad(
            ethers.utils.hexlify(lsp12IssuedAssetsValues.length),
            32
          ),
        ];

        await context.universalProfile["setData(bytes32[],bytes[])"](
          keys,
          values
        );

        const result = await context.universalProfile["getData(bytes32[])"](
          keys
        );
        expect(result).to.eql(values);
      });
    }

    describe("when setting a data key with a value less than 256 bytes", () => {
      it("should emit DataChanged event with the whole data value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(200));

        await expect(
          context.universalProfile["setData(bytes32,bytes)"](key, value)
        )
          .to.emit(context.universalProfile, "DataChanged")
          .withArgs(key, value);

        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });

    describe("when setting a data key with a value more than 256 bytes", () => {
      it("should emit DataChanged event with only the first 256 bytes of the value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

        await expect(
          context.universalProfile["setData(bytes32,bytes)"](key, value)
        )
          .to.emit(context.universalProfile, "DataChanged")
          .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });

    describe("when setting a data key with a value exactly 256 bytes long", () => {
      it("should emit DataChanged event with the whole data value", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(256));

        await expect(
          context.universalProfile["setData(bytes32,bytes)"](key, value)
        )
          .to.emit(context.universalProfile, "DataChanged")
          .withArgs(key, value);

        const result = await context.universalProfile["getData(bytes32)"](key);
        expect(result).to.equal(value);
      });
    });
  });

  describe("when calling the contract without any value or data", () => {
    it("should pass and not emit the ValueReceived event", async () => {
      const sender = context.accounts[0];
      const amount = 0;

      // prettier-ignore
      await expect(
          sender.sendTransaction({
            to: context.universalProfile.address,
            value: amount,
          })
        ).to.not.be.reverted
         .to.not.emit(context.universalProfile, "ValueReceived");
    });
  });

  describe("when sending native tokens to the contract", () => {
    it("should emit the right ValueReceived event", async () => {
      const sender = context.accounts[0];
      const amount = ethers.utils.parseEther("5");

      await expect(
        sender.sendTransaction({
          to: context.universalProfile.address,
          value: amount,
        })
      )
        .to.emit(context.universalProfile, "ValueReceived")
        .withArgs(sender.address, amount);
    });

    it("should allow to send a random payload as well, and emit the ValueReceived event", async () => {
      const sender = context.accounts[0];
      const amount = ethers.utils.parseEther("5");

      // The payload must be prepended with bytes4(0) to be interpreted as graffiti
      // and not as a function selector
      await expect(
        sender.sendTransaction({
          to: context.universalProfile.address,
          value: amount,
          data: "0x00000000aabbccdd",
        })
      )
        .to.emit(context.universalProfile, "ValueReceived")
        .withArgs(sender.address, amount);
    });
  });

  describe("when sending a random payload, without any value", () => {
    it("should execute the fallback function, but not emit the ValueReceived event", async () => {
      // The payload must be prepended with bytes4(0) to be interpreted as graffiti
      // and not as a function selector
      let tx = await context.accounts[0].sendTransaction({
        to: context.universalProfile.address,
        value: 0,
        data: "0x00000000aabbccdd",
      });

      // check that no event was emitted
      await expect(tx).to.not.emit(context.universalProfile, "ValueReceived");
    });
  });

  describe("when using the batch `ERC725X.execute(uint256[],address[],uint256[],bytes[])` function", () => {
    describe("when specifying `msg.value`", () => {
      it("should emit a `ValueReceived` event", async () => {
        const operationsType = Array(3).fill(OPERATION_TYPES.CALL);
        const recipients = [
          context.accounts[1].address,
          context.accounts[2].address,
          context.accounts[3].address,
        ];
        const values = Array(3).fill(ethers.BigNumber.from("1"));
        const datas = Array(3).fill("0x");

        const msgValue = ethers.utils.parseEther("10");

        const tx = await context.universalProfile[
          "execute(uint256[],address[],uint256[],bytes[])"
        ](operationsType, recipients, values, datas, { value: msgValue });

        await expect(tx)
          .to.emit(context.universalProfile, "ValueReceived")
          .withArgs(context.deployParams.owner.address, msgValue);
      });
    });

    describe("when NOT sending any `msg.value`", () => {
      it("should NOT emit a `ValueReceived` event", async () => {
        const operationsType = Array(3).fill(OPERATION_TYPES.CALL);
        const recipients = [
          context.accounts[1].address,
          context.accounts[2].address,
          context.accounts[3].address,
        ];
        const values = Array(3).fill(ethers.BigNumber.from("1"));
        const datas = Array(3).fill("0x");

        const msgValue = 0;

        const tx = await context.universalProfile[
          "execute(uint256[],address[],uint256[],bytes[])"
        ](operationsType, recipients, values, datas, { value: msgValue });

        await expect(tx).to.not.emit(context.universalProfile, "ValueReceived");
      });
    });
  });

  describe("when using batchCalls function", () => {
    describe("when non-owner is calling", () => {
      it("shoud revert", async () => {
        let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
        let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

        let setDataPayload =
          context.universalProfile.interface.encodeFunctionData(
            "setData(bytes32,bytes)",
            [key, value]
          );

        await expect(
          context.universalProfile
            .connect(context.accounts[4])
            .batchCalls([setDataPayload])
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });
    });

    describe("when the owner is calling", () => {
      describe("when executing one function", () => {
        describe("setData", () => {
          it("should pass", async () => {
            let key = ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("My Key")
            );
            let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, value]
              );

            await context.universalProfile
              .connect(context.deployParams.owner)
              .batchCalls([setDataPayload]);

            const result = await context.universalProfile["getData(bytes32)"](
              key
            );
            expect(result).to.equal(value);
          });
        });

        describe("execute", () => {
          it("should pass", async () => {
            let amount = 20;
            let executePayload =
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [0, context.accounts[4].address, amount, "0x"]
              );

            await expect(() =>
              context.universalProfile
                .connect(context.deployParams.owner)
                .batchCalls([executePayload])
            ).to.changeEtherBalances(
              [context.universalProfile.address, context.accounts[4].address],
              [`-${amount}`, amount]
            );
          });
        });
      });

      describe("when executing several functions", () => {
        describe("When transfering lyx, setting data, transferring ownership", () => {
          it("should pass", async () => {
            let amount = 20;
            let executePayload =
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [0, context.accounts[5].address, amount, "0x"]
              );

            let key = ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("A new key")
            );
            let value = ethers.utils.hexlify(ethers.utils.randomBytes(10));

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, value]
              );

            let transferOwnershipPayload =
              context.universalProfile.interface.encodeFunctionData(
                "transferOwnership",
                [context.accounts[8].address]
              );

            expect(
              await context.universalProfile.callStatic.pendingOwner()
            ).to.equal(ethers.constants.AddressZero);

            await expect(() =>
              context.universalProfile
                .connect(context.deployParams.owner)
                .batchCalls([
                  executePayload,
                  setDataPayload,
                  transferOwnershipPayload,
                ])
            ).to.changeEtherBalances(
              [context.universalProfile.address, context.accounts[5].address],
              [`-${amount}`, amount]
            );

            const result = await context.universalProfile["getData(bytes32)"](
              key
            );
            expect(result).to.equal(value);

            expect(
              await context.universalProfile.callStatic.pendingOwner()
            ).to.equal(context.accounts[8].address);
          });
        });

        describe("When setting data and transferring value in staticcall operation", () => {
          it("should revert", async () => {
            let amount = 100;
            let executePayload =
              context.universalProfile.interface.encodeFunctionData(
                "execute(uint256,address,uint256,bytes)",
                [3, context.accounts[5].address, amount, "0x"]
              );

            let key = ethers.utils.keccak256(
              ethers.utils.toUtf8Bytes("Another key")
            );
            let value = ethers.utils.hexlify(ethers.utils.randomBytes(10));

            let setDataPayload =
              context.universalProfile.interface.encodeFunctionData(
                "setData(bytes32,bytes)",
                [key, value]
              );

            await expect(
              context.universalProfile
                .connect(context.deployParams.owner)
                .batchCalls([setDataPayload, executePayload])
            ).to.be.revertedWithCustomError(
              context.universalProfile,
              "ERC725X_MsgValueDisallowedInStaticCall"
            );
          });
        });
      });
    });
  });
};

export const shouldInitializeLikeLSP3 = (
  buildContext: () => Promise<LSP3TestContext>
) => {
  let context: LSP3TestContext;

  before(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("should support ERC165 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC165
      );
      expect(result).to.be.true;
    });

    it("should support ERC1271 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC1271
      );
      expect(result).to.be.true;
    });

    it("should support ERC725X interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725X
      );
      expect(result).to.be.true;
    });

    it("should support ERC725Y interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.ERC725Y
      );
      expect(result).to.be.true;
    });

    it("should support LSP0 (ERC725Account) interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP0ERC725Account
      );
      expect(result).to.be.true;
    });

    it("should support LSP1 interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP1UniversalReceiver
      );
      expect(result).to.be.true;
    });

    it("should support LSP14Ownable2Step interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP14Ownable2Step
      );
      expect(result).to.be.true;
    });

    it("should support LSP17Extendable interface", async () => {
      const result = await context.universalProfile.supportsInterface(
        INTERFACE_IDS.LSP17Extendable
      );
      expect(result).to.be.true;
    });

    it("should have set key 'SupportedStandards:LSP3UniversalProfile'", async () => {
      const result = await context.universalProfile["getData(bytes32)"](
        SupportedStandards.LSP3UniversalProfile.key
      );

      expect(result).to.equal(SupportedStandards.LSP3UniversalProfile.value);
    });
  });
};
