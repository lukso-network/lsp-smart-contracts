import { expect } from "chai";
import { ethers, network } from "hardhat";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// types
import {
  UniversalProfile,
  FirstCallReturnMagicValue__factory,
  FirstCallReturnMagicValue,
  BothCallReturnMagicValue__factory,
  BothCallReturnMagicValue,
  SecondCallReturnFailureValue__factory,
  SecondCallReturnFailureValue,
  SecondCallReturnExpandedValue__factory,
  SecondCallReturnExpandedValue,
  UniversalProfile__factory,
  NotImplementingVerifyCall,
  NotImplementingVerifyCall__factory,
  ImplementingFallback,
  ImplementingFallback__factory,
  FallbackReturnMagicValue,
  FallbackReturnMagicValue__factory,
  FirstCallReturnExpandedInvalidValue,
  FirstCallReturnExpandedInvalidValue__factory,
  FirstCallReturnInvalidMagicValue,
  FirstCallReturnInvalidMagicValue__factory,
} from "../../types";

// constants
import { OPERATION_TYPES } from "../../constants";

export type LSP20TestContext = {
  accounts: SignerWithAddress[];
  universalProfile: UniversalProfile;
  deployParams: { owner: SignerWithAddress };
};

export const shouldBehaveLikeLSP20 = (
  buildContext: () => Promise<LSP20TestContext>
) => {
  let context: LSP20TestContext;

  before(async () => {
    context = await buildContext();
  });

  describe("when testing lsp20 integration", () => {
    describe("when owner is an EOA", () => {
      describe("when calling setData", () => {
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
            .withArgs(true, "0x");
        });
      });
      describe("when calling setData array", () => {
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
            .withArgs(true, "0x");
        });
      });

      describe("when calling execute", () => {
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

        it("when calling should revert when non-owner calls", async () => {
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
            .withArgs(true, "0x");
        });
      });
      describe("when calling execute Array", () => {
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

        it("should revert when the non-owner is calling", async () => {
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
            .withArgs(true, "0x");
        });
      });

      describe("when calling transferOwnership", () => {
        it("should pass when the owner is calling", async () => {
          const newOwner = context.accounts[1].address;

          await expect(
            context.universalProfile
              .connect(context.deployParams.owner)
              .transferOwnership(newOwner)
          ).to.emit(context.universalProfile, "OwnershipTransferStarted");
        });

        it("should revert when the non-owner is calling", async () => {
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
            .withArgs(true, "0x");
        });
      });

      describe("when calling renounceOwnership", () => {
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

        it("should revert when the non-owner is calling", async () => {
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
            .withArgs(true, "0x");
        });
      });
    });

    describe("when the owner is a contract", () => {
      describe("that doesn't implement the verifyCall function", () => {
        let ownerContract: NotImplementingVerifyCall;
        before("deploying a new owner", async () => {
          ownerContract = await new NotImplementingVerifyCall__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract
            .connect(context.deployParams.owner)
            .acceptOwnership(context.universalProfile.address);
        });

        it("should revert when calling LSP0 function", async () => {
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
              "LSP20CallingOwnerFailed"
            )
            .withArgs(true);
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
      describe("that implement the fallback function that doesn't return anything", () => {
        let ownerContract: ImplementingFallback;
        before("deploying a new owner", async () => {
          ownerContract = await new ImplementingFallback__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        it("should revert when calling LSP0 function", async () => {
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
            .withArgs(true, "0x");
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
      describe("that implement the fallback that return the magicValue", () => {
        let ownerContract: FallbackReturnMagicValue;
        before("deploying a new owner", async () => {
          ownerContract = await new FallbackReturnMagicValue__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        it("should pass when calling LSP0 function", async () => {
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
      describe("that implements verifyCall but return an expanded bytes32 value", () => {
        let ownerContract: FirstCallReturnExpandedInvalidValue;
        before("deploying a new owner", async () => {
          ownerContract =
            await new FirstCallReturnExpandedInvalidValue__factory(
              context.deployParams.owner
            ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        it("should revert when calling LSP0 functions", async () => {
          const dataKey = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("RandomKey1")
          );
          const dataValue = ethers.utils.hexlify(ethers.utils.randomBytes(50));

          await expect(
            context.universalProfile["setData(bytes32,bytes)"](
              dataKey,
              dataValue
            )
          ).to.be.revertedWithCustomError(
            context.universalProfile,
            "LSP20InvalidMagicValue"
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
      describe("that implements verifyCall but doesn't return magic value", () => {
        let ownerContract: FirstCallReturnInvalidMagicValue;
        before("deploying a new owner", async () => {
          ownerContract = await new FirstCallReturnInvalidMagicValue__factory(
            context.deployParams.owner
          ).deploy();

          await context.universalProfile
            .connect(context.deployParams.owner)
            .transferOwnership(ownerContract.address);

          await ownerContract.acceptOwnership(context.universalProfile.address);
        });

        it("should revert when calling LSP0 functions", async () => {
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
            .withArgs(true, "0xaabbccdd" + "0".repeat(56));
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
      describe("that implements verifyCall that returns a valid magicValue but doesn't invoke verifyCallResult", () => {
        let firstCallReturnMagicValueContract: FirstCallReturnMagicValue;
        let newUniversalProfile: UniversalProfile;
        before(async () => {
          firstCallReturnMagicValueContract =
            await new FirstCallReturnMagicValue__factory(
              context.accounts[0]
            ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(
            context.accounts[0]
          ).deploy(firstCallReturnMagicValueContract.address);
        });

        it("should pass when calling LSP0 functions", async () => {
          let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
          let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(
            newUniversalProfile
              .connect(context.accounts[3])
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.emit(newUniversalProfile, "DataChanged")
            .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

          const result = await newUniversalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });
      });

      describe("that implements verifyCall and verifyCallResult and both return magic value", () => {
        let bothCallReturnMagicValueContract: BothCallReturnMagicValue;
        let newUniversalProfile: UniversalProfile;
        before(async () => {
          bothCallReturnMagicValueContract =
            await new BothCallReturnMagicValue__factory(
              context.accounts[0]
            ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(
            context.accounts[0]
          ).deploy(bothCallReturnMagicValueContract.address);
        });

        it("should pass when calling LSP0 functions", async () => {
          let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
          let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(
            newUniversalProfile
              .connect(context.accounts[3])
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.emit(newUniversalProfile, "DataChanged")
            .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

          const result = await newUniversalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });
      });

      describe("that implements verifyCallResult but return invalid magicValue", () => {
        let secondCallReturnFailureContract: SecondCallReturnFailureValue;
        let newUniversalProfile: UniversalProfile;
        before(async () => {
          secondCallReturnFailureContract =
            await new SecondCallReturnFailureValue__factory(
              context.accounts[0]
            ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(
            context.accounts[0]
          ).deploy(secondCallReturnFailureContract.address);
        });

        it("should revert when calling LSP0 functions", async () => {
          let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
          let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(
            newUniversalProfile
              .connect(context.accounts[3])
              ["setData(bytes32,bytes)"](key, value)
          ).to.be.revertedWithCustomError(
            newUniversalProfile,
            "LSP20InvalidMagicValue"
          );
        });
      });

      describe("that implements verifyCallResult but return an expanded magic value", () => {
        let secondCallReturnExpandedValueContract: SecondCallReturnExpandedValue;
        let newUniversalProfile: UniversalProfile;
        before(async () => {
          secondCallReturnExpandedValueContract =
            await new SecondCallReturnExpandedValue__factory(
              context.accounts[0]
            ).deploy();

          newUniversalProfile = await new UniversalProfile__factory(
            context.accounts[0]
          ).deploy(secondCallReturnExpandedValueContract.address);
        });

        it("should pass when calling LSP0 functions", async () => {
          let key = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("My Key"));
          let value = ethers.utils.hexlify(ethers.utils.randomBytes(500));

          await expect(
            newUniversalProfile
              .connect(context.accounts[3])
              ["setData(bytes32,bytes)"](key, value)
          )
            .to.emit(newUniversalProfile, "DataChanged")
            .withArgs(key, ethers.utils.hexDataSlice(value, 0, 256));

          const result = await newUniversalProfile["getData(bytes32)"](key);
          expect(result).to.equal(value);
        });
      });
    });
  });
};
