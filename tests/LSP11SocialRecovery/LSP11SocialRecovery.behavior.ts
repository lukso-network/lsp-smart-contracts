import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { TransactionResponse } from "@ethersproject/abstract-provider";

import {
  LSP11SocialRecovery,
  LSP6KeyManager,
  UniversalProfile,
} from "../../types";

import {
  ALL_PERMISSIONS_SET,
  ERC725YKeys,
  INTERFACE_IDS,
} from "../../constants";

import { ARRAY_LENGTH, RANDOM_BYTES32 } from "../utils/helpers";

export type LSP11TestAccounts = {
  owner: SignerWithAddress;
  recoveree1: SignerWithAddress;
  recoveree2: SignerWithAddress;
  any: SignerWithAddress;
  random: SignerWithAddress;

  guardian1: SignerWithAddress;
  guardian2: SignerWithAddress;
  guardian3: SignerWithAddress;
  guardian4: SignerWithAddress;
  guardian5: SignerWithAddress;
};

export const getNamedAccounts = async (): Promise<LSP11TestAccounts> => {
  const [
    owner,
    recoveree1,
    recoveree2,
    any,
    random,
    guardian1,
    guardian2,
    guardian3,
    guardian4,
    guardian5,
  ] = await ethers.getSigners();
  return {
    owner,
    recoveree1,
    recoveree2,
    any,
    random,
    guardian1,
    guardian2,
    guardian3,
    guardian4,
    guardian5,
  };
};

export type LSP11DeployParams = {
  owner: SignerWithAddress | UniversalProfile;
  account: UniversalProfile;
  threshold: number;
};

export type LSP11TestContext = {
  accounts: LSP11TestAccounts;
  lsp11SocialRecovery: LSP11SocialRecovery;
  deployParams: LSP11DeployParams;
  universalProfile: UniversalProfile;
  lsp6KeyManager: LSP6KeyManager;
};

export const shouldBehaveLikeLSP11NullThreshold = (
  buildContext: () => Promise<LSP11TestContext>
) => {
  let context: LSP11TestContext;

  beforeAll(async () => {
    context = await buildContext();
  });

  describe("When testing owner functionalities", () => {
    it("Should revert when non-owner try to setSecret", async () => {
      const txParams = {
        hash: RANDOM_BYTES32,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .setSecret(txParams.hash)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should revert when owner try to set bytes32(0) as a secret", async () => {
      const txParams = {
        hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .setSecret(txParams.hash)
      ).toBeRevertedWith("Invalid hash");
    });

    it("Should pass when owner try to setSecret", async () => {
      const txParams = {
        hash: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .setSecret(txParams.hash);
    });

    it("Should revert when non-owner try to addGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .addGuardian(txParams.guardianAddress)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should pass when owner try to addGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardianAddress);

      const isGuardian =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress
        );
      expect(isGuardian).toBeTruthy();
    });

    it("Should revert when owner try to add same Guardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };

      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .addGuardian(context.accounts.guardian1.address)
      ).toBeRevertedWith("Provided address is already a guardian");

      const isGuardian =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress
        );
      expect(isGuardian).toBeTruthy();
    });

    it("Should revert when non-owner try to setThreshold", async () => {
      const txParams = {
        newThreshold: 9,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .setThreshold(txParams.newThreshold)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should revert when setting a threshold higher than the guardian number", async () => {
      const txParams = {
        newThreshold: 3,
      };

      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .setThreshold(txParams.newThreshold)
      ).toBeRevertedWith(
        "Threshold can not be higher than the guardians number"
      );
    });

    it("Should pass when owner try to setThreshold >= guardian number", async () => {
      const txParams = {
        newThreshold: 1,
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .setThreshold(txParams.newThreshold);
      const recoverThreshold = (
        await context.lsp11SocialRecovery.callStatic.recoverThreshold()
      ).toNumber();
      expect(recoverThreshold).toEqual(txParams.newThreshold);
      // resetting the threshold to the normal behavior when threshold = 0
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .setThreshold(context.deployParams.threshold);
      const oldRecoverThreshold = (
        await context.lsp11SocialRecovery.callStatic.recoverThreshold()
      ).toNumber();
      expect(oldRecoverThreshold).toEqual(context.deployParams.threshold);
    });

    it("Should revert when non-owner try to removeGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .removeGuardian(txParams.guardianAddress)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should revert when owner try to remove a non-set Guardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian2.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .removeGuardian(txParams.guardianAddress)
      ).toBeRevertedWith("Provided address is not a guardian");
    });

    it("Should pass when owner try to removeGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .removeGuardian(txParams.guardianAddress);

      const isGuardian =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress
        );
      expect(isGuardian).toBeFalsy();
    });
  });

  describe("When testing guardians functionalities", () => {
    it("Should revert when non-guardian try to recover (owner)", async () => {
      const txParams = {
        recovereeAddress: context.accounts.recoveree1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .startRecovery(txParams.recovereeAddress)
      ).toBeRevertedWith("Caller is not a guardian");
    });

    it("Should revert when non-guardian try to recover (owner)", async () => {
      const txParams = {
        recovereeAddress: context.accounts.recoveree1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .startRecovery(txParams.recovereeAddress)
      ).toBeRevertedWith("Caller is not a guardian");
    });
  });

  describe("When finalizing recovery", () => {
    it("Should revert when secret word is wrong", async () => {
      const txParams = {
        secret: "NOTLUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .recoverOwnership(txParams.secret, txParams.newHash)
      ).toBeRevertedWith("Invalid secret");
    });

    it("Should pass when anyone try to recover with the right secret word", async () => {
      const txParams = {
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };
    
      await context.lsp11SocialRecovery
        .connect(context.accounts.any)
        .recoverOwnership(txParams.secret, txParams.newHash);
    });

    it("Should increment the recover counter", async () => {
      const recoverCounter = (
        await context.lsp11SocialRecovery.callStatic.recoverCounter()
      ).toNumber();
      expect(recoverCounter).toEqual(1);
    });

    it("Should pass when recovered address try to control the UniversalProfile", async () => {
      const txParams = {
        key: RANDOM_BYTES32,
        value: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("I have access")),
      };
      const payload = context.universalProfile.interface.encodeFunctionData(
        "setData",
        [[txParams.key], [txParams.value]]
      );
      await context.lsp6KeyManager
        .connect(context.accounts.any)
        .execute(payload);

      const [value] = await context.universalProfile.callStatic.getData([
        txParams.key,
      ]);
      expect(value).toEqual(txParams.value);
    });

    it("Should return all permission when viewing the permission of the address recovered", async () => {
      const txParams = {
        permissionArrayKey: ERC725YKeys.LSP6["AddressPermissions[]"],
        permissionInArrayKey:
          ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) +
          "00000000000000000000000000000002",
        permissionMap:
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.accounts.any.address.substr(2),
      };
      const [permissionArrayLength, controllerAddress, controllerPermissions] =
        await context.universalProfile.callStatic.getData([
          txParams.permissionArrayKey,
          txParams.permissionInArrayKey,
          txParams.permissionMap,
        ]);

      expect(permissionArrayLength).toEqual(ARRAY_LENGTH.THREE);
      expect(ethers.utils.getAddress(controllerAddress)).toEqual(
        context.accounts.any.address
      );
      expect(controllerPermissions).toEqual(ALL_PERMISSIONS_SET);
    });

    it("Should revert when passing old secret word in the second recover counter", async () => {
      const txParams = {
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["Anything"]),
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.random)
          .recoverOwnership(txParams.secret, txParams.newHash)
      ).toBeRevertedWith("Invalid secret");
    });

    it("Should pass when another address try to recover with the new right secret word in the second recover counter", async () => {
      const tx1Params = {
        secret: "NewLUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.random)
        .recoverOwnership(tx1Params.secret, tx1Params.newHash);

      const tx2Params = {
        permissionArrayKey: ERC725YKeys.LSP6["AddressPermissions[]"],
        permissionInArrayKey:
          ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) +
          "00000000000000000000000000000003",
        permissionMap:
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.accounts.random.address.substr(2),
      };
      const [permissionArrayLength, controllerAddress, controllerPermissions] =
        await context.universalProfile.callStatic.getData([
          tx2Params.permissionArrayKey,
          tx2Params.permissionInArrayKey,
          tx2Params.permissionMap,
        ]);

      expect(permissionArrayLength).toEqual(ARRAY_LENGTH.FOUR);
      expect(ethers.utils.getAddress(controllerAddress)).toEqual(
        context.accounts.random.address
      );
      expect(controllerPermissions).toEqual(ALL_PERMISSIONS_SET);

      const recoverCounter = (
        await context.lsp11SocialRecovery.callStatic.recoverCounter()
      ).toNumber();
      expect(recoverCounter).toEqual(2);
    });
  });
};

export const shouldBehaveLikeLSP11NormalThreshold = (
  buildContext: () => Promise<LSP11TestContext>
) => {
  let context: LSP11TestContext;

  beforeAll(async () => {
    context = await buildContext();
  });

  describe("When testing owner functionalities", () => {
    it("Should pass when owner try to setSecret", async () => {
      const txParams = {
        hash: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .setSecret(txParams.hash);
    });

    it("Should revert when non-owner try to addGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .addGuardian(txParams.guardianAddress)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should pass when owner try to addGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardianAddress);

      const isGuardian =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress
        );
      expect(isGuardian).toBeTruthy();
    });

    it("Should revert when owner try to add same Guardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };

      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .addGuardian(context.accounts.guardian1.address)
      ).toBeRevertedWith("Provided address is already a guardian");

      const isGuardian =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress
        );
      expect(isGuardian).toBeTruthy();
    });

    it("Should pass when owner try to add more Guardian", async () => {
      const txParams = {
        guardian2Address: context.accounts.guardian2.address,
        guardian3Address: context.accounts.guardian3.address,
        guardian4Address: context.accounts.guardian4.address,
        guardian5Address: context.accounts.guardian5.address,
      };

      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardian2Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardian3Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardian4Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardian5Address);

      const isGuardian2 =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardian2Address
        );

      const isGuardian3 =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardian3Address
        );

      const isGuardian4 =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardian4Address
        );

      const isGuardian5 =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardian5Address
        );
      expect(isGuardian2).toBeTruthy();
      expect(isGuardian3).toBeTruthy();
      expect(isGuardian4).toBeTruthy();
      expect(isGuardian5).toBeTruthy();
    });

    it("Should revert when non-owner try to removeGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .removeGuardian(txParams.guardianAddress)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should revert when owner try to remove a non-set Guardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.random.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .removeGuardian(txParams.guardianAddress)
      ).toBeRevertedWith("Provided address is not a guardian");
    });

    it("Should pass when owner try to removeGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian5.address,
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .removeGuardian(txParams.guardianAddress);

      const isGuardian =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress
        );
      expect(isGuardian).toBeFalsy();
    });

    it("Should revert when owner try to removeGuardian below the threshold", async () => {
      const txParams = {
        guradian2Address: context.accounts.guardian2.address,
        guardian3Address: context.accounts.guardian3.address,
        guardian4Address: context.accounts.guardian4.address,
        guardian5Address: context.accounts.guardian5.address,
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .removeGuardian(txParams.guardian4Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .removeGuardian(txParams.guardian3Address);

      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .removeGuardian(txParams.guradian2Address)
      ).toBeRevertedWith("Guardians number can not be lower than the threshold");
    });

    it("Should add all removed guardians", async () => {
      const txParams = {
        guardian3Address: context.accounts.guardian3.address,
        guardian4Address: context.accounts.guardian4.address,
        guardian5Address: context.accounts.guardian5.address,
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardian3Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardian4Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.owner)
        .addGuardian(txParams.guardian5Address);

      const isGuardian3 =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardian3Address
        );

      const isGuardian4 =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardian4Address
        );

      const isGuardian5 =
        await context.lsp11SocialRecovery.callStatic.isGuardian(
          txParams.guardian5Address
        );

      expect(isGuardian3).toBeTruthy();
      expect(isGuardian4).toBeTruthy();
      expect(isGuardian5).toBeTruthy();
    });

    it("Should have the right number of guardians", async () => {
      const guradiansNumber = (
        await context.lsp11SocialRecovery.callStatic.guardiansNumber()
      ).toNumber();
      expect(guradiansNumber).toEqual(5);
    });

    it("Should revert when setting a threshold higher than the guardian number", async () => {
      const txParams = {
        newThreshold: 9,
      };

      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .setThreshold(txParams.newThreshold)
      ).toBeRevertedWith(
        "Threshold can not be higher than the guardians number"
      );
    });
  });

  describe("When testing guardians functionalities", () => {
    it("Should revert when non-guardian try to recover (owner)", async () => {
      const txParams = {
        recovereeAddress: context.accounts.recoveree1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.owner)
          .startRecovery(txParams.recovereeAddress)
      ).toBeRevertedWith("Caller is not a guardian");
    });

    it("Should revert when non-guardian try to recover (owner)", async () => {
      const txParams = {
        recovereeAddress: context.accounts.recoveree1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.any)
          .startRecovery(txParams.recovereeAddress)
      ).toBeRevertedWith("Caller is not a guardian");
    });

    it("Should pass when a guardian try to recover an address (recoveree1)", async () => {
      const txParams = {
        recoveree1Address: context.accounts.recoveree1.address,
      };

      const recoveree1VoteBefore = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          0,
          txParams.recoveree1Address
        )
      ).toNumber();
      await context.lsp11SocialRecovery
        .connect(context.accounts.guardian1)
        .startRecovery(txParams.recoveree1Address);

      const recoveree1VoteAfter = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          0,
          txParams.recoveree1Address
        )
      ).toNumber();
      expect(recoveree1VoteBefore + 1).toEqual(recoveree1VoteAfter);
    });

    it("Should revert when the same guardian vote twice", async () => {
      const txParams = {
        recoveree1Address: context.accounts.recoveree1.address,
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.guardian1)
          .startRecovery(txParams.recoveree1Address)
      ).toBeRevertedWith("Caller already voted");
    });

    it("Should pass when 2 other guardian try to recover an address (recoveree1)", async () => {
      const txParams = {
        recoveree1Address: context.accounts.recoveree1.address,
      };

      const recoveree1VoteBefore = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          0,
          txParams.recoveree1Address
        )
      ).toNumber();

      await context.lsp11SocialRecovery
        .connect(context.accounts.guardian2)
        .startRecovery(txParams.recoveree1Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.guardian3)
        .startRecovery(txParams.recoveree1Address);

      const recoveree1VoteAfter = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          0,
          txParams.recoveree1Address
        )
      ).toNumber();
      expect(recoveree1VoteBefore + 2).toEqual(recoveree1VoteAfter);
    });

    it("Should pass when 2 other guardian try to recover other address (recoveree2)", async () => {
      const txParams = {
        recoveree2Address: context.accounts.recoveree2.address,
      };

      const recoveree1VoteBefore = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          0,
          txParams.recoveree2Address
        )
      ).toNumber();

      await context.lsp11SocialRecovery
        .connect(context.accounts.guardian4)
        .startRecovery(txParams.recoveree2Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.guardian5)
        .startRecovery(txParams.recoveree2Address);

      const recoveree1VoteAfter = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          0,
          txParams.recoveree2Address
        )
      ).toNumber();
      expect(recoveree1VoteBefore + 2).toEqual(recoveree1VoteAfter);
    });
  });

  describe("When finalizing recovery", () => {
    it("Should revert when secret word is wrong", async () => {
      const txParams = {
        secret: "NOTLUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.recoveree1)
          .recoverOwnership(txParams.secret, txParams.newHash)
      ).toBeRevertedWith("Invalid secret");
    });

    it("Should revert when a random address try to recover with the right secret word", async () => {
      const txParams = {
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.random)
          .recoverOwnership(txParams.secret, txParams.newHash)
      ).toBeRevertedWith("Caller votes below recover threshold");
    });

    it("Should revert when recoveree2 try to recover as he didn't reach the threshold", async () => {
      const txParams = {
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };
      await expect(
        context.lsp11SocialRecovery
          .connect(context.accounts.recoveree2)
          .recoverOwnership(txParams.secret, txParams.newHash)
      ).toBeRevertedWith("Caller votes below recover threshold");
    });

    it("Should pass when recoveree1 try to recover as he reached the threshold", async () => {
      const txParams = {
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.recoveree1)
        .recoverOwnership(txParams.secret, txParams.newHash);
    });

    it("Should increment the recover counter", async () => {
      const recoverCounter = (
        await context.lsp11SocialRecovery.callStatic.recoverCounter()
      ).toNumber();
      expect(recoverCounter).toEqual(1);
    });

    it("Should pass when recovered address try to control the UniversalProfile", async () => {
      const txParams = {
        key: RANDOM_BYTES32,
        value: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("I have access")),
      };
      const payload = context.universalProfile.interface.encodeFunctionData(
        "setData",
        [[txParams.key], [txParams.value]]
      );
      await context.lsp6KeyManager
        .connect(context.accounts.recoveree1)
        .execute(payload);

      const [value] = await context.universalProfile.callStatic.getData([
        txParams.key,
      ]);
      expect(value).toEqual(txParams.value);
    });

    it("Should return all permission when viewing the permission of the address recovered", async () => {
      const txParams = {
        permissionArrayKey: ERC725YKeys.LSP6["AddressPermissions[]"],
        permissionInArrayKey:
          ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) +
          "00000000000000000000000000000002",
        permissionMap:
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.accounts.recoveree1.address.substr(2),
      };
      const [permissionArrayLength, controllerAddress, controllerPermissions] =
        await context.universalProfile.callStatic.getData([
          txParams.permissionArrayKey,
          txParams.permissionInArrayKey,
          txParams.permissionMap,
        ]);

      expect(permissionArrayLength).toEqual(ARRAY_LENGTH.THREE);
      expect(ethers.utils.getAddress(controllerAddress)).toEqual(
        context.accounts.recoveree1.address
      );
      expect(controllerPermissions).toEqual(ALL_PERMISSIONS_SET);
    });

    it("Recoveree1 and Recoveree2 addresses should have 0 votes as the contract is in a new recoverCounter", async () => {
      const recoverCounter = (
        await context.lsp11SocialRecovery.callStatic.recoverCounter()
      ).toNumber();
      const recoveree1Votes = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          recoverCounter,
          context.accounts.recoveree1.address
        )
      ).toNumber();

      const recoveree2Votes = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          recoverCounter,
          context.accounts.recoveree2.address
        )
      ).toNumber();

      expect(recoveree1Votes).toEqual(0);
      expect(recoveree2Votes).toEqual(0);
    });

    it("Should pass when guardians are recovering the recoveree2 Address", async () => {
      const txParams = {
        recoveree2Address: context.accounts.recoveree2.address,
      };

      const recoverCounter = (
        await context.lsp11SocialRecovery.callStatic.recoverCounter()
      ).toNumber();

      await context.lsp11SocialRecovery
        .connect(context.accounts.guardian1)
        .startRecovery(txParams.recoveree2Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.guardian2)
        .startRecovery(txParams.recoveree2Address);

      await context.lsp11SocialRecovery
        .connect(context.accounts.guardian3)
        .startRecovery(txParams.recoveree2Address);

      const recoveree2Votes = (
        await context.lsp11SocialRecovery.callStatic.controllerVotes(
          recoverCounter,
          context.accounts.recoveree2.address
        )
      ).toNumber();

      expect(recoveree2Votes).toEqual(3);
    });

    it("Should pass when recoveree2 try to recover with the new right secret word in the second recover counter", async () => {
      const tx1Params = {
        secret: "NewLUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };
      await context.lsp11SocialRecovery
        .connect(context.accounts.recoveree2)
        .recoverOwnership(tx1Params.secret, tx1Params.newHash);

      const tx2Params = {
        permissionArrayKey: ERC725YKeys.LSP6["AddressPermissions[]"],
        permissionInArrayKey:
          ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) +
          "00000000000000000000000000000003",
        permissionMap:
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.accounts.recoveree2.address.substr(2),
      };
      const [permissionArrayLength, controllerAddress, controllerPermissions] =
        await context.universalProfile.callStatic.getData([
          tx2Params.permissionArrayKey,
          tx2Params.permissionInArrayKey,
          tx2Params.permissionMap,
        ]);

      expect(permissionArrayLength).toEqual(ARRAY_LENGTH.FOUR);
      expect(ethers.utils.getAddress(controllerAddress)).toEqual(
        context.accounts.recoveree2.address
      );
      expect(controllerPermissions).toEqual(ALL_PERMISSIONS_SET);
    });
  });
};

export type LSP11InitializeTestContext = {
  lsp11SocialRecovery: LSP11SocialRecovery;
  deployParams: LSP11DeployParams;
  initializeTransaction: TransactionResponse;
};

export const shouldInitializeLikeLSP11 = (
  buildContext: () => Promise<LSP11InitializeTestContext>
) => {
  let context: LSP11InitializeTestContext;

  beforeEach(async () => {
    context = await buildContext();
  });

  describe("when the contract was initialized", () => {
    it("Should have registered the ERC165 interface", async () => {
      expect(
        await context.lsp11SocialRecovery.supportsInterface(
          INTERFACE_IDS.ERC165
        )
      );
    });

    it("Should have registered the LSP11 interface", async () => {
      expect(
        await context.lsp11SocialRecovery.supportsInterface(INTERFACE_IDS.LSP11)
      );
    });

    it("Should have set the threshold", async () => {
      const recoverThreshold = (
        await context.lsp11SocialRecovery.callStatic.recoverThreshold()
      ).toNumber();
      expect(recoverThreshold).toEqual(context.deployParams.threshold);
    });

    it("Should have set the owner", async () => {
      const idOwner = await context.lsp11SocialRecovery.callStatic.owner();
      expect(idOwner).toEqual(context.deployParams.owner.address);
    });

    it("Should have set the controlled account", async () => {
      const idAccount = await context.lsp11SocialRecovery.callStatic.account();
      expect(idAccount).toEqual(context.deployParams.account.address);
    });
  });
};
