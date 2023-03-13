import fs from "fs";
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Align, getMarkdownTable, Row } from "markdown-table-ts";

import {
  LSP6KeyManager__factory,
  LSP7Mintable,
  LSP7Mintable__factory,
  LSP8Mintable,
  LSP8Mintable__factory,
  UniversalProfile,
  UniversalProfile__factory,
} from "../types";

import {
  ALL_PERMISSIONS,
  ERC725YDataKeys,
  INTERFACE_IDS,
  OPERATION_TYPES,
  PERMISSIONS,
} from "../constants";
import { LSP6TestContext } from "./utils/context";
import {
  setupKeyManager,
  setupProfileWithKeyManagerWithURD,
} from "./utils/fixtures";
import {
  combineAllowedCalls,
  combinePermissions,
  encodeCompactBytesArray,
} from "./utils/helpers";
import { BigNumber } from "ethers";

const buildLSP6TestContext = async (
  initialFunding?: BigNumber
): Promise<LSP6TestContext> => {
  const accounts = await ethers.getSigners();
  const owner = accounts[0];

  const universalProfile = await new UniversalProfile__factory(owner).deploy(
    owner.address,
    { value: initialFunding }
  );
  const keyManager = await new LSP6KeyManager__factory(owner).deploy(
    universalProfile.address
  );

  return { accounts, owner, universalProfile, keyManager };
};

let mainControllerExecuteTable;
let restrictedControllerExecuteTable;

let mainControllerSetDataTable;
let restrictedControllerSetDataTable;

describe("⛽📊 Gas Benchmark", () => {
  describe("`execute(...)` via Key Manager", () => {
    describe("main controller (this browser extension)", () => {
      let casesExecuteMainController: Row[] = [];

      let context: LSP6TestContext;

      let recipientEOA: SignerWithAddress;
      // setup Alice's Universal Profile as a recipient of LYX and tokens transactions
      let aliceUP: UniversalProfile;

      let lsp7MetaCoin: LSP7Mintable;
      let lsp8MetaNFT: LSP8Mintable;

      let nftList: string[] = [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000000000000000000000000000004",
      ];

      before(async () => {
        context = await buildLSP6TestContext(ethers.utils.parseEther("50"));

        recipientEOA = context.accounts[1];
        let deployedContracts = await setupProfileWithKeyManagerWithURD(
          context.accounts[2]
        );
        aliceUP = deployedContracts[0] as UniversalProfile;

        // the function `setupKeyManager` gives ALL PERMISSIONS
        // to the owner as the first data key
        await setupKeyManager(context, [], []);

        // deploy a LSP7 token
        lsp7MetaCoin = await new LSP7Mintable__factory(context.owner).deploy(
          "MetaCoin",
          "MTC",
          context.owner.address,
          false
        );

        // deploy a LSP8 NFT
        lsp8MetaNFT = await new LSP8Mintable__factory(context.owner).deploy(
          "MetaNFT",
          "MNF",
          context.owner.address
        );

        // mint some tokens to the UP
        await lsp7MetaCoin.mint(
          context.universalProfile.address,
          1000,
          false,
          "0x"
        );

        // mint some NFTs to the UP
        nftList.forEach(async (nft) => {
          await lsp8MetaNFT.mint(
            context.universalProfile.address,
            nft,
            false,
            "0x"
          );
        });
      });

      it("transfer some LYXes to an EOA", async () => {
        const lyxAmount = ethers.utils.parseEther("3");

        // prettier-ignore
        const tx = await context.universalProfile.connect(context.owner)["execute(uint256,address,uint256,bytes)"](OPERATION_TYPES.CALL, recipientEOA.address, lyxAmount, "0x");
        const receipt = await tx.wait();

        casesExecuteMainController.push([
          "transfer LYX to an EOA",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfers some LYXes to a UP", async () => {
        const lyxAmount = ethers.utils.parseEther("3");

        // prettier-ignore
        const tx = await context.universalProfile.connect(context.owner)["execute(uint256,address,uint256,bytes)"](OPERATION_TYPES.CALL, aliceUP.address, lyxAmount, "0x");
        const receipt = await tx.wait();

        casesExecuteMainController.push([
          "transfer LYX to a UP",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfers some tokens (LSP7) to an EOA (no data)", async () => {
        const tokenAmount = 100;

        // prettier-ignore
        const tx = await context.universalProfile.connect(context.owner)["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CALL,
          lsp7MetaCoin.address,
          0,
          lsp7MetaCoin.interface.encodeFunctionData("transfer", [
            context.universalProfile.address,
            recipientEOA.address,
            tokenAmount,
            true,
            "0x",
          ])
        );
        const receipt = await tx.wait();

        casesExecuteMainController.push([
          "transfer tokens (LSP7) to an EOA (no data)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfer some tokens (LSP7) to a UP (no data)", async () => {
        const tokenAmount = 100;

        // prettier-ignore
        const tx = await context.universalProfile.connect(context.owner)["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CALL,
          lsp7MetaCoin.address,
          0,
          lsp7MetaCoin.interface.encodeFunctionData("transfer", [
            context.universalProfile.address,
            aliceUP.address,
            tokenAmount,
            true,
            "0x",
          ])
        );
        const receipt = await tx.wait();

        casesExecuteMainController.push([
          "transfer tokens (LSP7) to a UP (no data)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfer a NFT (LSP8) to a EOA (no data)", async () => {
        const nftId = nftList[0];

        // prettier-ignore
        const tx = await context.universalProfile.connect(context.owner)["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CALL,
          lsp8MetaNFT.address,
          0,
          lsp8MetaNFT.interface.encodeFunctionData("transfer", [
            context.universalProfile.address,
            recipientEOA.address,
            nftId,
            true,
            "0x",
          ])
        );
        const receipt = await tx.wait();

        casesExecuteMainController.push([
          "transfer a NFT (LSP8) to a EOA (no data)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfer a NFT (LSP8) to a UP (no data)", async () => {
        const nftId = nftList[1];

        // prettier-ignore
        const tx = await context.universalProfile.connect(context.owner)["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CALL,
          lsp8MetaNFT.address,
          0,
          lsp8MetaNFT.interface.encodeFunctionData("transfer", [
            context.universalProfile.address,
            aliceUP.address,
            nftId,
            false,
            "0x",
          ])
        );
        const receipt = await tx.wait();

        casesExecuteMainController.push([
          "transfer a NFT (LSP8) to a UP (no data)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      after(async () => {
        mainControllerExecuteTable = getMarkdownTable({
          table: {
            head: ["`execute` scenarios - 👑 main controller", "⛽ Gas Usage"],
            body: casesExecuteMainController,
          },
          alignment: [Align.Left, Align.Center],
        });
      });
    });

    describe("controllers with some restrictions", () => {
      let casesExecuteRestrictedController: Row[] = [];
      let context: LSP6TestContext;

      let recipientEOA: SignerWithAddress;
      // setup Alice's Universal Profile as a recipient of LYX and tokens transactions
      let aliceUP: UniversalProfile;

      let canTransferValueToOneAddress: SignerWithAddress,
        canTransferTwoTokens: SignerWithAddress,
        canTransferTwoNFTs: SignerWithAddress;

      let allowedAddressToTransferValue: string;

      let lsp7MetaCoin: LSP7Mintable, lsp7LyxDai: LSP7Mintable;
      let lsp8MetaNFT: LSP8Mintable, lsp8LyxPunks: LSP8Mintable;

      const metaNFTList: string[] = [
        "0x0000000000000000000000000000000000000000000000000000000000000001",
        "0x0000000000000000000000000000000000000000000000000000000000000002",
        "0x0000000000000000000000000000000000000000000000000000000000000003",
        "0x0000000000000000000000000000000000000000000000000000000000000004",
      ];

      const lyxPunksList: string[] = [
        "0xcafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
        "0xbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeefbeef",
        "0xdeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddeaddead",
        "0xf00df00df00df00df00df00df00df00df00df00df00df00df00df00df00df00d",
      ];

      before(async () => {
        context = await buildLSP6TestContext(ethers.utils.parseEther("50"));

        recipientEOA = context.accounts[1];

        let deployedContracts = await setupProfileWithKeyManagerWithURD(
          context.accounts[2]
        );
        aliceUP = deployedContracts[0] as UniversalProfile;

        // LYX transfer scenarios
        canTransferValueToOneAddress = context.accounts[1];
        allowedAddressToTransferValue = context.accounts[2].address;

        // LSP7 token transfer scenarios
        canTransferTwoTokens = context.accounts[3];

        lsp7MetaCoin = await new LSP7Mintable__factory(context.owner).deploy(
          "MetaCoin",
          "MTC",
          context.owner.address,
          false
        );

        lsp7LyxDai = await new LSP7Mintable__factory(context.owner).deploy(
          "LyxDai",
          "LDAI",
          context.owner.address,
          false
        );

        [lsp7MetaCoin, lsp7LyxDai].forEach(async (token) => {
          await token.mint(context.universalProfile.address, 1000, false, "0x");
        });

        // LSP8 NFT transfer scenarios
        canTransferTwoNFTs = context.accounts[4];

        lsp8MetaNFT = await new LSP8Mintable__factory(context.owner).deploy(
          "MetaNFT",
          "MNF",
          context.owner.address
        );

        lsp8LyxPunks = await new LSP8Mintable__factory(context.owner).deploy(
          "LyxPunks",
          "LPK",
          context.owner.address
        );

        [
          { contract: lsp8MetaNFT, tokenIds: metaNFTList },
          { contract: lsp8MetaNFT, tokenIds: lyxPunksList },
        ].forEach(async (nftContract) => {
          // mint some NFTs to the UP
          nftContract.tokenIds.forEach(async (nft) => {
            await lsp8MetaNFT.mint(
              context.universalProfile.address,
              nft,
              false,
              "0x"
            );
          });
        });

        // prettier-ignore
        await setupKeyManager(
          context,
          [
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + canTransferValueToOneAddress.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + canTransferTwoTokens.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + canTransferTwoNFTs.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] + canTransferValueToOneAddress.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] + canTransferTwoTokens.address.substring(2),
              ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] + canTransferTwoNFTs.address.substring(2),
          ],
          [
              PERMISSIONS.TRANSFERVALUE,
              PERMISSIONS.CALL,
              PERMISSIONS.CALL,
              combineAllowedCalls(["0xffffffff"], [allowedAddressToTransferValue], ["0xffffffff"]),
              combineAllowedCalls([INTERFACE_IDS.LSP7DigitalAsset, INTERFACE_IDS.LSP7DigitalAsset], [lsp7MetaCoin.address, lsp7LyxDai.address], ["0xffffffff", "0xffffffff"]),
              combineAllowedCalls([INTERFACE_IDS.LSP8IdentifiableDigitalAsset, INTERFACE_IDS.LSP8IdentifiableDigitalAsset], [lsp8MetaNFT.address, lsp8LyxPunks.address], ["0xffffffff", "0xffffffff"])
          ]
          )
      });

      it("transfer some LYXes to an EOA - restricted to 1 x allowed address only (TRANSFERVALUE + 1x AllowedCalls)", async () => {
        const lyxAmount = 10;

        const tx = await context.universalProfile
          .connect(canTransferValueToOneAddress)
          ["execute(uint256,address,uint256,bytes)"](
            OPERATION_TYPES.CALL,
            allowedAddressToTransferValue,
            lyxAmount,
            "0x"
          );
        const receipt = await tx.wait();

        casesExecuteRestrictedController.push([
          "transfer some LYXes to an EOA - restricted to 1 x allowed address only (TRANSFERVALUE + 1x AllowedCalls)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfers some tokens (LSP7) to an EOA - restricted to LSP7 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)", async () => {
        const tokenAmount = 100;

        // prettier-ignore
        const tx = await context.universalProfile.connect(canTransferTwoTokens)["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CALL,
          lsp7MetaCoin.address,
          0,
          lsp7MetaCoin.interface.encodeFunctionData("transfer", [
            context.universalProfile.address,
            recipientEOA.address,
            tokenAmount,
            true,
            "0x",
          ])
        );
        const receipt = await tx.wait();

        casesExecuteRestrictedController.push([
          "transfers some tokens (LSP7) to an EOA - restricted to LSP7 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfers some tokens (LSP7) to an other UP - restricted to LSP7 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)", async () => {
        const tokenAmount = 100;

        // prettier-ignore
        const tx = await context.universalProfile.connect(canTransferTwoTokens)["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CALL,
          lsp7MetaCoin.address,
          0,
          lsp7MetaCoin.interface.encodeFunctionData("transfer", [
            context.universalProfile.address,
            aliceUP.address,
            tokenAmount,
            true,
            "0x",
          ])
        );
        const receipt = await tx.wait();

        casesExecuteRestrictedController.push([
          "transfers some tokens (LSP7) to an other UP - restricted to LSP7 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfers a NFT (LSP8) to an EOA - restricted to LSP8 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)", async () => {
        const nftId = metaNFTList[0];

        // prettier-ignore
        const tx = await context.universalProfile.connect(canTransferTwoNFTs)["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CALL,
          lsp8MetaNFT.address,
          0,
          lsp8MetaNFT.interface.encodeFunctionData("transfer", [
            context.universalProfile.address,
            recipientEOA.address,
            nftId,
            true,
            "0x",
          ])
        );
        const receipt = await tx.wait();

        casesExecuteRestrictedController.push([
          "transfers a NFT (LSP8) to an EOA - restricted to LSP8 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("transfers a NFT (LSP8) to an other UP - restricted to LSP8 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)", async () => {
        const nftId = metaNFTList[1];

        // prettier-ignore
        const tx = await context.universalProfile.connect(canTransferTwoNFTs)["execute(uint256,address,uint256,bytes)"](
          OPERATION_TYPES.CALL,
          lsp8MetaNFT.address,
          0,
          lsp8MetaNFT.interface.encodeFunctionData("transfer", [
            context.universalProfile.address,
            aliceUP.address,
            nftId,
            false,
            "0x",
          ])
        );
        const receipt = await tx.wait();

        casesExecuteRestrictedController.push([
          "transfers a NFT (LSP8) to an other UP - restricted to LSP8 + 2x allowed contracts only (CALL + 2x AllowedCalls) (no data)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      after(async () => {
        restrictedControllerExecuteTable = getMarkdownTable({
          table: {
            head: [
              "`execute` scenarios - 🛃 restricted controller",
              "⛽ Gas Usage",
            ],
            body: casesExecuteRestrictedController,
          },
          alignment: [Align.Left, Align.Center],
        });
      });
    });
  });

  describe("`setData(...)` via Key Manager", () => {
    let context: LSP6TestContext;

    let controllerCanSetData: SignerWithAddress,
      controllerCanSetDataAndAddController: SignerWithAddress;

    const allowedERC725YDataKeys = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key1")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key2")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key3")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key4")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key5")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key6")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key7")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key8")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key9")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("key10")),
    ];

    before(async () => {
      context = await buildLSP6TestContext();

      controllerCanSetData = context.accounts[1];
      controllerCanSetDataAndAddController = context.accounts[2];

      // prettier-ignore
      const permissionKeys = [
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + context.owner.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + controllerCanSetData.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + controllerCanSetData.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + controllerCanSetDataAndAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + controllerCanSetDataAndAddController.address.substring(2),
        ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index + "00000000000000000000000000000000",
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index + "00000000000000000000000000000001",
        ERC725YDataKeys.LSP6["AddressPermissions[]"].index + "00000000000000000000000000000002",
      ];

      // // prettier-ignore
      const permissionValues = [
        ALL_PERMISSIONS,
        PERMISSIONS.SETDATA,
        encodeCompactBytesArray(allowedERC725YDataKeys),
        combinePermissions(PERMISSIONS.SETDATA, PERMISSIONS.ADDCONTROLLER),
        encodeCompactBytesArray(allowedERC725YDataKeys),
        ethers.utils.hexZeroPad(ethers.BigNumber.from(3).toHexString(), 16),
        context.owner.address,
        controllerCanSetData.address,
        controllerCanSetDataAndAddController.address,
      ];

      await setupKeyManager(context, permissionKeys, permissionValues);
    });

    describe("main controller (this browser extension) has SUPER_SETDATA ", () => {
      let benchmarkCasesSetDataMainController: Row[] = [];

      it("updates profile details (LSP3Profile metadata)", async () => {
        const dataKey = ERC725YDataKeys.LSP3["LSP3Profile"];
        const dataValue =
          "0x6f357c6a820464ddfac1bec070cc14a8daf04129871d458f2ca94368aae8391311af6361696670733a2f2f516d597231564a4c776572673670456f73636468564775676f3339706136727963455a4c6a7452504466573834554178";

        const tx = await context.universalProfile
          .connect(context.owner)
          ["setData(bytes32,bytes)"](dataKey, dataValue);
        const receipt = await tx.wait();

        benchmarkCasesSetDataMainController.push([
          "updates profile details (LSP3Profile metadata)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it(`give permissions to a controller
          1. increase AddressPermissions[] array length
          2. put the controller address at AddressPermissions[index]
          3. give the controller the permission SETDATA under AddressPermissions:Permissions:<controller-address>
      `, async () => {
        const newController = context.accounts[3];

        const AddressPermissionsArrayLength = await context.universalProfile[
          "getData(bytes32)"
        ](ERC725YDataKeys.LSP6["AddressPermissions[]"].length);

        // prettier-ignore
        const dataKeys = [
          ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
          ERC725YDataKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(AddressPermissionsArrayLength), 16).substring(2),
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + newController.address.substring(2),
        ];

        // prettier-ignore
        const dataValues = [
          ethers.utils.hexZeroPad(ethers.BigNumber.from(AddressPermissionsArrayLength).add(1).toHexString(), 16),
          newController.address,
          combinePermissions(PERMISSIONS.SETDATA),
        ];

        let tx = await context.universalProfile
          .connect(context.owner)
          ["setData(bytes32[],bytes[])"](dataKeys, dataValues);

        let receipt = await tx.wait();

        expect(
          await context.universalProfile["getData(bytes32[])"](dataKeys)
        ).to.deep.equal(dataValues);

        benchmarkCasesSetDataMainController.push([
          "give permissions to a controller (AddressPermissions[] + AddressPermissions[index] + AddressPermissions:Permissions:<controller-address>)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("restrict a controller to some specific ERC725Y Data Keys", async () => {
        const controllerToEdit = context.accounts[3];

        const allowedDataKeys = [
          ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Allowed ERC725Y Data Key 1")
          ),
          ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Allowed ERC725Y Data Key 2")
          ),
          ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("Allowed ERC725Y Data Key 3")
          ),
        ];

        // prettier-ignore
        const dataKey =
          ERC725YDataKeys.LSP6["AddressPermissions:AllowedERC725YDataKeys"] + controllerToEdit.address.substring(2)

        // prettier-ignore
        const dataValue = encodeCompactBytesArray([allowedDataKeys[0], allowedDataKeys[1], allowedDataKeys[2]])

        let tx = await context.universalProfile
          .connect(context.owner)
          ["setData(bytes32,bytes)"](dataKey, dataValue);

        let receipt = await tx.wait();

        expect(
          await context.universalProfile["getData(bytes32)"](dataKey)
        ).to.equal(dataValue);

        benchmarkCasesSetDataMainController.push([
          "restrict a controller to some specific ERC725Y Data Keys",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("restrict a controller to interact only with 3x specific addresses", async () => {
        const controllerToEdit = context.accounts[3];

        const allowedAddresses = [
          context.accounts[4].address,
          context.accounts[5].address,
          context.accounts[6].address,
        ];

        // prettier-ignore
        const dataKey = ERC725YDataKeys.LSP6["AddressPermissions:AllowedCalls"] + controllerToEdit.address.substring(2)

        const dataValue = combineAllowedCalls(
          ["0xffffffff", "0xffffffff", "0xffffffff"],
          [allowedAddresses[0], allowedAddresses[1], allowedAddresses[2]],
          ["0xffffffff", "0xffffffff", "0xffffffff"]
        );

        let tx = await context.universalProfile
          .connect(context.owner)
          ["setData(bytes32,bytes)"](dataKey, dataValue);

        let receipt = await tx.wait();

        expect(
          await context.universalProfile["getData(bytes32)"](dataKey)
        ).to.equal(dataValue);

        benchmarkCasesSetDataMainController.push([
          "restrict a controller to interact only with 3x specific addresses",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it(`remove a controller (its permissions + its address from the AddressPermissions[] array)
          1. decrease AddressPermissions[] array length
          2. remove the controller address at AddressPermissions[index]
          3. set "0x" for the controller permissions under AddressPermissions:Permissions:<controller-address>
      `, async () => {
        const newController = context.accounts[3];

        const AddressPermissionsArrayLength = await context.universalProfile[
          "getData(bytes32)"
        ](ERC725YDataKeys.LSP6["AddressPermissions[]"].length);

        // prettier-ignore
        const dataKeys = [
          ERC725YDataKeys.LSP6["AddressPermissions[]"].length,
          ERC725YDataKeys.LSP6["AddressPermissions[]"].index + ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(AddressPermissionsArrayLength), 16).substring(2),
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] + newController.address.substring(2),
        ];

        // prettier-ignore
        const dataValues = [
          ethers.utils.hexZeroPad(ethers.BigNumber.from(AddressPermissionsArrayLength).sub(1).toHexString(), 16),
          "0x",
          "0x",
        ];

        let tx = await context.universalProfile
          .connect(context.owner)
          ["setData(bytes32[],bytes[])"](dataKeys, dataValues);

        let receipt = await tx.wait();

        benchmarkCasesSetDataMainController.push([
          "remove a controller (its permissions + its address from the AddressPermissions[] array)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("write 5x LSP12 Issued Assets", async () => {
        // prettier-ignore
        const issuedAssetsDataKeys = [
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].length,
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000000",
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000001",
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000002",
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000003",
              ERC725YDataKeys.LSP12["LSP12IssuedAssets[]"].index + "00000000000000000000000000000004",
          ];

        // these are just random placeholder values
        // they should be replaced with actual token contract address
        const issuedAssetsDataValues = [
          "0x0000000000000000000000000000000000000000000000000000000000000005",
          context.accounts[5].address,
          context.accounts[6].address,
          context.accounts[7].address,
          context.accounts[8].address,
          context.accounts[9].address,
        ];

        let tx = await context.universalProfile
          .connect(context.owner)
          ["setData(bytes32[],bytes[])"](
            issuedAssetsDataKeys,
            issuedAssetsDataValues
          );

        let receipt = await tx.wait();

        expect(
          await context.universalProfile["getData(bytes32[])"](
            issuedAssetsDataKeys
          )
        ).to.deep.equal(issuedAssetsDataValues);

        benchmarkCasesSetDataMainController.push([
          "write 5x LSP12 Issued Assets",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      after(async () => {
        mainControllerSetDataTable = getMarkdownTable({
          table: {
            head: ["`setData` scenarios - 👑 main controller", "⛽ Gas Usage"],
            body: benchmarkCasesSetDataMainController,
          },
          alignment: [Align.Left, Align.Center],
        });
      });
    });

    describe("a controller (EOA) can SETDATA, ADDCONTROLLER and on 10x AllowedERC725YKeys", () => {
      let benchmarkCasesSetDataRestrictedController: Row[] = [];

      it("`setData(bytes32,bytes)` -> updates 1x data key", async () => {
        const dataKey = allowedERC725YDataKeys[5];
        const dataValue = "0xaabbccdd";

        const tx = await context.universalProfile
          .connect(controllerCanSetData)
          ["setData(bytes32,bytes)"](dataKey, dataValue);
        const receipt = await tx.wait();

        benchmarkCasesSetDataRestrictedController.push([
          "`setData(bytes32,bytes)` -> updates 1x data key",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("`setData(bytes32[],bytes[])` -> updates 3x data keys (first x3)", async () => {
        const dataKeys = allowedERC725YDataKeys.slice(0, 3);
        const dataValues = ["0xaabbccdd", "0xaabbccdd", "0xaabbccdd"];

        const tx = await context.universalProfile
          .connect(controllerCanSetData)
          ["setData(bytes32[],bytes[])"](dataKeys, dataValues);
        const receipt = await tx.wait();

        benchmarkCasesSetDataRestrictedController.push([
          "`setData(bytes32[],bytes[])` -> updates 3x data keys (first x3)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("`setData(bytes32[],bytes[])` -> updates 3x data keys (middle x3)", async () => {
        const dataKeys = allowedERC725YDataKeys.slice(3, 6);
        const dataValues = ["0xaabbccdd", "0xaabbccdd", "0xaabbccdd"];

        const tx = await context.universalProfile
          .connect(controllerCanSetData)
          ["setData(bytes32[],bytes[])"](dataKeys, dataValues);
        const receipt = await tx.wait();

        benchmarkCasesSetDataRestrictedController.push([
          "`setData(bytes32[],bytes[])` -> updates 3x data keys (middle x3)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("`setData(bytes32[],bytes[])` -> updates 3x data keys (last x3)", async () => {
        const dataKeys = allowedERC725YDataKeys.slice(7, 10);
        const dataValues = ["0xaabbccdd", "0xaabbccdd", "0xaabbccdd"];

        const tx = await context.universalProfile
          .connect(controllerCanSetData)
          ["setData(bytes32[],bytes[])"](dataKeys, dataValues);
        const receipt = await tx.wait();

        benchmarkCasesSetDataRestrictedController.push([
          "`setData(bytes32[],bytes[])` -> updates 3x data keys (last x3)",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      it("`setData(bytes32[],bytes[])` -> updates 2x data keys + add 3x new controllers (including setting the array length + indexes under AddressPermissions[index])", async () => {
        const dataKeys = [
          allowedERC725YDataKeys[0],
          allowedERC725YDataKeys[1],
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            context.accounts[3].address.substring(2),
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            context.accounts[4].address.substring(2),
          ERC725YDataKeys.LSP6["AddressPermissions:Permissions"] +
            context.accounts[5].address.substring(2),
        ];

        const dataValues = [
          "0xaabbccdd",
          "0xaabbccdd",
          PERMISSIONS.SETDATA,
          PERMISSIONS.SETDATA,
          PERMISSIONS.SETDATA,
        ];

        const tx = await context.universalProfile
          .connect(controllerCanSetDataAndAddController)
          ["setData(bytes32[],bytes[])"](dataKeys, dataValues);
        const receipt = await tx.wait();

        benchmarkCasesSetDataRestrictedController.push([
          "`setData(bytes32[],bytes[])` -> updates 2x data keys + add 3x new controllers (including setting the array length + indexes under AddressPermissions[index])",
          receipt.gasUsed.toNumber().toString(),
        ]);
      });

      after(async () => {
        restrictedControllerSetDataTable = getMarkdownTable({
          table: {
            head: [
              "`setData` scenarios - 🛃 restricted controller",
              "⛽ Gas Usage",
            ],
            body: benchmarkCasesSetDataRestrictedController,
          },
          alignment: [Align.Left, Align.Center],
        });
      });
    });
  });

  after(async () => {
    const markdown = `
👋 Hello
⛽ I am the Gas Bot Reporter. I keep track of the gas costs of common interactions using Universal Profiles 🆙 !
📊 Here is a summary of the gas cost with the code introduced by this PR.

<details>
<summary>⛽📊 See Gas Benchmark report</summary>

This document contains the gas usage for common interactions and scenarios when using UniversalProfile smart contracts.

### 🔀 \`execute\` scenarios

#### 👑 unrestricted controller

${mainControllerExecuteTable}

#### 🛃 restricted controller

${restrictedControllerExecuteTable}

### 🗄️ \`setData\` scenarios

#### 👑 unrestricted controller

${mainControllerSetDataTable}

#### 🛃 restricted controller

${restrictedControllerSetDataTable}


## 📝 Notes

- The \`execute\` and \`setData\` scenarios are executed on a fresh UniversalProfile and LSP6KeyManager smart contracts, deployed as standard contracts (not as proxy behind a base contract implementation).


</details>
`;
    const file = "benchmark.md";

    fs.writeFileSync(file, markdown);
  });
});
