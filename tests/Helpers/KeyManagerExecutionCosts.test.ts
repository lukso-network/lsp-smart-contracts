import { ethers } from "hardhat";

import {
  UniversalProfile__factory,
  LSP6KeyManager__factory,
  UniversalProfile,
} from "../../types";
import {
  ALL_PERMISSIONS,
  ERC725YKeys,
  OPERATION_TYPES,
  PERMISSIONS,
  INTERFACE_IDS,
} from "../../constants";

import { LSP6TestContext } from "../utils/context";
import { abiCoder, provider } from "../utils/helpers";

import { setupKeyManager } from "../utils/fixtures";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Key Manager gas cost interactions", () => {
  describe("when using LSP6KeyManager with constructor", () => {
    const buildLSP6TestContext = async (): Promise<LSP6TestContext> => {
      const accounts = await ethers.getSigners();
      const owner = accounts[0];

      const universalProfile = await new UniversalProfile__factory(
        owner
      ).deploy(owner.address);
      const keyManager = await new LSP6KeyManager__factory(owner).deploy(
        universalProfile.address
      );

      return { accounts, owner, universalProfile, keyManager };
    };

    describe("after deploying the contract", () => {
      let context: LSP6TestContext;

      let restrictedToOneAddress: SignerWithAddress,
        restrictedToOneAddressAndStandard: SignerWithAddress;

      let contractImplementsERC1271: UniversalProfile;

      beforeEach(async () => {
        context = await buildLSP6TestContext();

        restrictedToOneAddress = context.accounts[1];
        restrictedToOneAddressAndStandard = context.accounts[2];

        contractImplementsERC1271 = await new UniversalProfile__factory(
          context.accounts[3]
        ).deploy(context.accounts[3].address);

        const permissionKeys = [
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            context.owner.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            restrictedToOneAddress.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
            restrictedToOneAddressAndStandard.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            restrictedToOneAddress.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:AllowedAddresses"] +
            restrictedToOneAddressAndStandard.address.substring(2),
          ERC725YKeys.LSP6["AddressPermissions:AllowedStandards"] +
            restrictedToOneAddressAndStandard.address.substring(2),
        ];

        const permissionValues = [
          ALL_PERMISSIONS,
          ethers.utils.hexZeroPad(
            parseInt(Number(PERMISSIONS.CALL)) +
              parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
            32
          ),
          ethers.utils.hexZeroPad(
            parseInt(Number(PERMISSIONS.CALL)) +
              parseInt(Number(PERMISSIONS.TRANSFERVALUE)),
            32
          ),
          abiCoder.encode(["address[]"], [[contractImplementsERC1271.address]]),
          abiCoder.encode(["address[]"], [[contractImplementsERC1271.address]]),
          abiCoder.encode(["bytes4[]"], [[INTERFACE_IDS.ERC1271]]),
        ];

        await setupKeyManager(context, permissionKeys, permissionValues);

        await context.owner.sendTransaction({
          to: context.universalProfile.address,
          value: ethers.utils.parseEther("10"),
        });
      });

      describe("display gas cost", () => {
        it("when caller has any allowed address and standard allowed", async () => {
          let initialAccountBalance = await provider.getBalance(
            contractImplementsERC1271.address
          );

          let transferLyxPayload =
            context.universalProfile.interface.encodeFunctionData("execute", [
              OPERATION_TYPES.CALL,
              contractImplementsERC1271.address,
              ethers.utils.parseEther("1"),
              "0x",
            ]);

          let tx = await context.keyManager
            .connect(context.owner)
            .execute(transferLyxPayload);

          let receipt = await tx.wait();

          console.log(
            "gas cost LYX transfer - everything allowed: ",
            ethers.BigNumber.from(receipt.gasUsed).toNumber()
          );

          let newAccountBalance = await provider.getBalance(
            contractImplementsERC1271.address
          );
          expect(parseInt(newAccountBalance)).toBeGreaterThan(
            parseInt(initialAccountBalance)
          );
        });
      });

      it("when caller has only 1 x allowed address allowed", async () => {
        let initialAccountBalance = await provider.getBalance(
          contractImplementsERC1271.address
        );

        let transferLyxPayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
            contractImplementsERC1271.address,
            ethers.utils.parseEther("1"),
            "0x",
          ]);

        let tx = await context.keyManager
          .connect(restrictedToOneAddress)
          .execute(transferLyxPayload);

        let receipt = await tx.wait();

        console.log(
          "gas cost LYX transfer - with 1 x allowed address: ",
          ethers.BigNumber.from(receipt.gasUsed).toNumber()
        );

        let newAccountBalance = await provider.getBalance(
          contractImplementsERC1271.address
        );
        expect(parseInt(newAccountBalance)).toBeGreaterThan(
          parseInt(initialAccountBalance)
        );
      });

      it("when caller has only 1 x allowed address + 1 x allowed standard allowed", async () => {
        let initialAccountBalance = await provider.getBalance(
          contractImplementsERC1271.address
        );

        let transferLyxPayload =
          context.universalProfile.interface.encodeFunctionData("execute", [
            OPERATION_TYPES.CALL,
            contractImplementsERC1271.address,
            ethers.utils.parseEther("1"),
            "0x",
          ]);

        let tx = await context.keyManager
          .connect(restrictedToOneAddressAndStandard)
          .execute(transferLyxPayload);

        let receipt = await tx.wait();

        console.log(
          "gas cost LYX transfer - with 1 x allowed address + 1 x allowed standard: ",
          ethers.BigNumber.from(receipt.gasUsed).toNumber()
        );

        let newAccountBalance = await provider.getBalance(
          contractImplementsERC1271.address
        );
        expect(parseInt(newAccountBalance)).toBeGreaterThan(
          parseInt(initialAccountBalance)
        );
      });
    });
  });
});
