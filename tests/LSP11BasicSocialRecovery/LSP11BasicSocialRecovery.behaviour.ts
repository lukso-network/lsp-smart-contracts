import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import type { TransactionResponse } from "@ethersproject/abstract-provider";

import {
  LSP11BasicSocialRecovery,
  LSP6KeyManager,
  UniversalProfile,
} from "../../types";

import { ALL_PERMISSIONS, ERC725YKeys, INTERFACE_IDS } from "../../constants";

import { ARRAY_LENGTH } from "../utils/helpers";
import { callPayload } from "../utils/fixtures";

export type LSP11TestAccounts = {
  owner: SignerWithAddress;
  AddresstoRecover1: SignerWithAddress;
  AddresstoRecover2: SignerWithAddress;
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
    AddresstoRecover1,
    AddresstoRecover2,
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
    AddresstoRecover1,
    AddresstoRecover2,
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
  account: UniversalProfile;
};

export type LSP11TestContext = {
  accounts: LSP11TestAccounts;
  lsp11BasicSocialRecovery: LSP11BasicSocialRecovery;
  deployParams: LSP11DeployParams;
  universalProfile: UniversalProfile;
  lsp6KeyManager: LSP6KeyManager;
};

export const shouldBehaveLikeLSP11 = (
  buildContext: () => Promise<LSP11TestContext>
) => {
  let context: LSP11TestContext;

  beforeAll(async () => {
    context = await buildContext();
  });

  describe("When testing owner functionalities", () => {
    it("Should revert when non-owner try to addGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };
      await expect(
        context.lsp11BasicSocialRecovery
          .connect(context.accounts.any)
          .addGuardian(txParams.guardianAddress)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should pass when owner try to addGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardianAddress]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload
          )
        );

      const isGuardian =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardianAddress
        );
      expect(isGuardian).toBeTruthy();
    });

    it("Should revert when owner try to add same Guardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian1.address,
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardianAddress]
        );

      await expect(
        context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp11BasicSocialRecovery.address,
              payload
            )
          )
      ).toBeRevertedWith("Provided address is already a guardian");

      const isGuardian =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
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

      const payload1 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardian2Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload1
          )
        );

      const payload2 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardian3Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload2
          )
        );

      const payload3 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardian4Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload3
          )
        );

      const payload4 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardian5Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload4
          )
        );

      const isGuardian2 =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardian2Address
        );

      const isGuardian3 =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardian3Address
        );

      const isGuardian4 =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardian4Address
        );

      const isGuardian5 =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
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
        context.lsp11BasicSocialRecovery
          .connect(context.accounts.any)
          .removeGuardian(txParams.guardianAddress)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should revert when owner try to remove a non-set Guardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.random.address,
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "removeGuardian",
          [txParams.guardianAddress]
        );

      await expect(
        context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp11BasicSocialRecovery.address,
              payload
            )
          )
      ).toBeRevertedWith("Provided address is not a guardian");
    });

    it("Should pass when owner try to removeGuardian", async () => {
      const txParams = {
        guardianAddress: context.accounts.guardian5.address,
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "removeGuardian",
          [txParams.guardianAddress]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload
          )
        );

      const isGuardian =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
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
      const payload1 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "removeGuardian",
          [txParams.guardian4Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload1
          )
        );

      const payload2 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "removeGuardian",
          [txParams.guardian3Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload2
          )
        );

      const payload3 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "removeGuardian",
          [txParams.guradian2Address]
        );

      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload3
          )
        );
    });

    it("Should add all removed guardians", async () => {
      const txParams = {
        guardian2Address: context.accounts.guardian2.address,
        guardian3Address: context.accounts.guardian3.address,
        guardian4Address: context.accounts.guardian4.address,
        guardian5Address: context.accounts.guardian5.address,
      };

      const payload0 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardian2Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload0
          )
        );

      const payload1 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardian3Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload1
          )
        );

      const payload2 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardian4Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload2
          )
        );

      const payload3 =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "addGuardian",
          [txParams.guardian5Address]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload3
          )
        );

      const isGuardian2 =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardian2Address
        );

      const isGuardian3 =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardian3Address
        );

      const isGuardian4 =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardian4Address
        );

      const isGuardian5 =
        await context.lsp11BasicSocialRecovery.callStatic.isGuardian(
          txParams.guardian5Address
        );

      expect(isGuardian2).toBeTruthy();
      expect(isGuardian3).toBeTruthy();
      expect(isGuardian4).toBeTruthy();
      expect(isGuardian5).toBeTruthy();
    });

    it("Should have the right number of guardians", async () => {
      const guradians =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardians();
      const guardiansCount = guradians.length;
      expect(guardiansCount).toEqual(5);
    });

    it("Should revert when setting a threshold higher than the guardians Count", async () => {
      const txParams = {
        newThreshold: 9,
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "setThreshold",
          [txParams.newThreshold]
        );

      await expect(
        context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp11BasicSocialRecovery.address,
              payload
            )
          )
      ).toBeRevertedWith(
        "Threshold should be between 1 and the guardiansCount"
      );
    });
    it("Should revert when setting a threshold = 0 ", async () => {
      const txParams = {
        newThreshold: 0,
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "setThreshold",
          [txParams.newThreshold]
        );

      await expect(
        context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp11BasicSocialRecovery.address,
              payload
            )
          )
      ).toBeRevertedWith(
        "Threshold should be between 1 and the guardiansCount"
      );
    });

    it("Should pass when setting a threshold lower than the guardians Count", async () => {
      const txParams = {
        newThreshold: 3,
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "setThreshold",
          [txParams.newThreshold]
        );

      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload
          )
        );

      const guardiansThreshold = (
        await context.lsp11BasicSocialRecovery.callStatic.getGuardiansThreshold()
      ).toNumber();
      expect(guardiansThreshold).toEqual(txParams.newThreshold);
    });

    it("Should revert when non-owner try to setSecret", async () => {
      const txParams = {
        hash: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "setSecret",
          [txParams.hash]
        );

      await expect(
        context.lsp11BasicSocialRecovery
          .connect(context.accounts.any)
          .setSecret(txParams.hash)
      ).toBeRevertedWith("Ownable: caller is not the owner");
    });

    it("Should revert when owner try to set Bytes32(0) Secret", async () => {
      const txParams = {
        hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "setSecret",
          [txParams.hash]
        );
      await expect(
        context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp11BasicSocialRecovery.address,
              payload
            )
          )
      ).toBeRevertedWith("Invalid hash");
    });

    it("Should pass when owner try to setSecret", async () => {
      const txParams = {
        hash: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "setSecret",
          [txParams.hash]
        );
      await context.lsp6KeyManager
        .connect(context.accounts.owner)
        .execute(
          callPayload(
            context.universalProfile,
            context.lsp11BasicSocialRecovery.address,
            payload
          )
        );
    });
  });

  describe("When testing guardians functionalities", () => {
    it("Should revert when non-guardian try to vote (random)", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        AddresstoRecover: context.accounts.AddresstoRecover1.address,
      };
      await expect(
        context.lsp11BasicSocialRecovery
          .connect(context.accounts.random)
          .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover)
      ).toBeRevertedWith("Caller is not a guardian");
    });

    it("Should revert when non-guardian try to vote (owner)", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        AddresstoRecover: context.accounts.AddresstoRecover1.address,
      };

      const payload =
        context.lsp11BasicSocialRecovery.interface.encodeFunctionData(
          "voteToRecover",
          [txParams.recoverProcessId, txParams.AddresstoRecover]
        );

      await expect(
        context.lsp6KeyManager
          .connect(context.accounts.owner)
          .execute(
            callPayload(
              context.universalProfile,
              context.lsp11BasicSocialRecovery.address,
              payload
            )
          )
      ).toBeRevertedWith("Caller is not a guardian");
    });

    it("Should pass when a guardian try to vote for `AddresstoRecover1` address in 'LUKSO' recoverProcessId ", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        AddresstoRecover: context.accounts.AddresstoRecover1.address,
      };

      const Guardian1VoteBefore =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian1.address
        );

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian1)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      const Guardian1VoteAfter =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian1.address
        );

      expect(Guardian1VoteBefore).toEqual(
        "0x0000000000000000000000000000000000000000"
      );
      expect(ethers.utils.getAddress(Guardian1VoteAfter)).toEqual(
        txParams.AddresstoRecover
      );
    });

    it("Should allow the same guardian to change his vote to `AddresstoRecover2` in the same 'LUKSO' recoverProcessId", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        AddresstoRecover: context.accounts.AddresstoRecover2.address,
      };

      const Guardian1VoteBefore =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian1.address
        );

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian1)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      const Guardian1VoteAfter =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian1.address
        );

      expect(ethers.utils.getAddress(Guardian1VoteBefore)).toEqual(
        context.accounts.AddresstoRecover1.address
      );
      expect(ethers.utils.getAddress(Guardian1VoteAfter)).toEqual(
        txParams.AddresstoRecover
      );
    });

    it("Should allow the same guardian to vote for `AddresstoRecover2` address in 'LUKSO1' recoverProcessId", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(
          ["string"],
          ["LUKSO1"]
        ),
        AddresstoRecover: context.accounts.AddresstoRecover2.address,
      };

      const Guardian1VoteBefore =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian1.address
        );

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian1)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      const Guardian1VoteAfter =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian1.address
        );

      expect(Guardian1VoteBefore).toEqual(
        "0x0000000000000000000000000000000000000000"
      );
      expect(ethers.utils.getAddress(Guardian1VoteAfter)).toEqual(
        txParams.AddresstoRecover
      );
    });

    it("Should pass when 3 other guardian try to vote for `AddresstoRecover1` in 'LUKSO' recoverProcessId", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        AddresstoRecover: context.accounts.AddresstoRecover1.address,
      };

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian2)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian3)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian4)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      const Guardian2Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian2.address
        );

      const Guardian3Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian3.address
        );

      const Guardian4Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian4.address
        );

      expect(ethers.utils.getAddress(Guardian2Vote)).toEqual(
        txParams.AddresstoRecover
      );
      expect(ethers.utils.getAddress(Guardian3Vote)).toEqual(
        txParams.AddresstoRecover
      );
      expect(ethers.utils.getAddress(Guardian4Vote)).toEqual(
        txParams.AddresstoRecover
      );
    });

    it("Should pass when 1 other guardian try to vote for `AddresstoRecover2` in 'LUKSO' and 'LUKSO1' recoverProcessId ", async () => {
      const tx1Params = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        AddresstoRecover: context.accounts.AddresstoRecover2.address,
      };

      const tx2Params = {
        recoverProcessId: ethers.utils.solidityKeccak256(
          ["string"],
          ["LUKSO1"]
        ),
        AddresstoRecover: context.accounts.AddresstoRecover2.address,
      };

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian5)
        .voteToRecover(tx1Params.recoverProcessId, tx1Params.AddresstoRecover);

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian5)
        .voteToRecover(tx2Params.recoverProcessId, tx2Params.AddresstoRecover);

      const Guardian5VoteInId1 =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          tx1Params.recoverProcessId,
          context.accounts.guardian5.address
        );

      const Guardian5VoteInId2 =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          tx2Params.recoverProcessId,
          context.accounts.guardian5.address
        );

      expect(ethers.utils.getAddress(Guardian5VoteInId1)).toEqual(
        tx1Params.AddresstoRecover
      );

      expect(ethers.utils.getAddress(Guardian5VoteInId2)).toEqual(
        tx2Params.AddresstoRecover
      );
    });
  });

  describe("When finalizing recovery", () => {
    it("Should revert when `AddressToRecover2` try to recover in a recoverProcessId where he didn't reach threshold", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };

      await expect(
        context.lsp11BasicSocialRecovery
          .connect(context.accounts.AddresstoRecover2)
          .recoverOwnership(
            txParams.recoverProcessId,
            txParams.secret,
            txParams.newHash
          )
      ).toBeRevertedWith("You didnt reach the threshold");
    });

    it("Should revert when `random` try to recover with the riht secret", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };

      await expect(
        context.lsp11BasicSocialRecovery
          .connect(context.accounts.random)
          .recoverOwnership(
            txParams.recoverProcessId,
            txParams.secret,
            txParams.newHash
          )
      ).toBeRevertedWith("You didnt reach the threshold");
    });

    it("Should revert when `AddressToRecover1` try to recover in a recoverProcessId where he didn't reach threshold", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(
          ["string"],
          ["LUKSO1"]
        ),
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };

      await expect(
        context.lsp11BasicSocialRecovery
          .connect(context.accounts.AddresstoRecover1)
          .recoverOwnership(
            txParams.recoverProcessId,
            txParams.secret,
            txParams.newHash
          )
      ).toBeRevertedWith("You didnt reach the threshold");
    });

    it("Should revert when `AddressToRecover1` try to recover in a recoverProcessId where he reach threshold with incorrect secret", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        secret: "NotLUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };

      await expect(
        context.lsp11BasicSocialRecovery
          .connect(context.accounts.AddresstoRecover1)
          .recoverOwnership(
            txParams.recoverProcessId,
            txParams.secret,
            txParams.newHash
          )
      ).toBeRevertedWith("Wrong secret");
    });

    it("Should pass when `AddressToRecover1` try to recover in a recoverProcessId where he reach threshold with correct secret", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        secret: "LUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NewLUKSO"]),
      };

      const value = await context.universalProfile.callStatic[
        "getData(bytes32)"
      ](
        ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.lsp11BasicSocialRecovery.address.substr(2)
      );

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.AddresstoRecover1)
        .recoverOwnership(
          txParams.recoverProcessId,
          txParams.secret,
          txParams.newHash
        );
    });

    it("Should reset votes of the guardians", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
      };

      const Guardian1Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian1.address
        );

      const Guardian2Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian2.address
        );

      const Guardian3Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian3.address
        );

      expect(Guardian1Vote).toEqual(
        "0x0000000000000000000000000000000000000000"
      );

      expect(Guardian2Vote).toEqual(
        "0x0000000000000000000000000000000000000000"
      );

      expect(Guardian3Vote).toEqual(
        "0x0000000000000000000000000000000000000000"
      );
    });

    it("Should pass when recovered address try to control the UniversalProfile", async () => {
      const txParams = {
        key: ethers.utils.solidityKeccak256(["string"], ["MyKey"]),
        value: ethers.utils.hexlify(ethers.utils.toUtf8Bytes("I have access")),
      };
      const payload = context.universalProfile.interface.encodeFunctionData(
        "setData(bytes32,bytes)",
        [txParams.key, txParams.value]
      );
      await context.lsp6KeyManager
        .connect(context.accounts.AddresstoRecover1)
        .execute(payload);

      const value = await context.universalProfile.callStatic[
        "getData(bytes32)"
      ](txParams.key);
      expect(value).toEqual(txParams.value);
    });

    it("Should return all permission when viewing the permission of the address recovered", async () => {
      const txParams = {
        permissionArrayKey: ERC725YKeys.LSP6["AddressPermissions[]"].length,
        permissionInArrayKey:
          ERC725YKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000003",
        permissionMap:
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.accounts.AddresstoRecover1.address.substr(2),
      };
      const [permissionArrayLength, controllerAddress, controllerPermissions] =
        await context.universalProfile.callStatic["getData(bytes32[])"]([
          txParams.permissionArrayKey,
          txParams.permissionInArrayKey,
          txParams.permissionMap,
        ]);

      expect(permissionArrayLength).toEqual(ARRAY_LENGTH.FOUR);
      expect(ethers.utils.getAddress(controllerAddress)).toEqual(
        context.accounts.AddresstoRecover1.address
      );
      expect(controllerPermissions).toEqual(ALL_PERMISSIONS);
    });

    it("Should pass when guardians try to vote for the `AddresstoRecover2` address", async () => {
      const txParams = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        AddresstoRecover: context.accounts.AddresstoRecover2.address,
      };

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian2)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian3)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.guardian4)
        .voteToRecover(txParams.recoverProcessId, txParams.AddresstoRecover);

      const Guardian2Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian2.address
        );

      const Guardian3Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian3.address
        );

      const Guardian4Vote =
        await context.lsp11BasicSocialRecovery.callStatic.getGuardianVote(
          txParams.recoverProcessId,
          context.accounts.guardian4.address
        );

      expect(ethers.utils.getAddress(Guardian2Vote)).toEqual(
        txParams.AddresstoRecover
      );
      expect(ethers.utils.getAddress(Guardian3Vote)).toEqual(
        txParams.AddresstoRecover
      );
      expect(ethers.utils.getAddress(Guardian4Vote)).toEqual(
        txParams.AddresstoRecover
      );
    });

    it("Should pass when `AddresstoRecover2` try to recover with the new right secret word in the second recover counter", async () => {
      const tx1Params = {
        recoverProcessId: ethers.utils.solidityKeccak256(["string"], ["LUKSO"]),
        secret: "NewLUKSO",
        newHash: ethers.utils.solidityKeccak256(["string"], ["NotLUKSO"]),
      };

      await context.lsp11BasicSocialRecovery
        .connect(context.accounts.AddresstoRecover2)
        .recoverOwnership(
          tx1Params.recoverProcessId,
          tx1Params.secret,
          tx1Params.newHash
        );

      const tx2Params = {
        permissionArrayKey: ERC725YKeys.LSP6["AddressPermissions[]"].length,
        permissionInArrayKey:
          ERC725YKeys.LSP6["AddressPermissions[]"].index +
          "00000000000000000000000000000004",
        permissionMap:
          ERC725YKeys.LSP6["AddressPermissions:Permissions"] +
          context.accounts.AddresstoRecover2.address.substr(2),
      };
      const [permissionArrayLength, controllerAddress, controllerPermissions] =
        await context.universalProfile.callStatic["getData(bytes32[])"]([
          tx2Params.permissionArrayKey,
          tx2Params.permissionInArrayKey,
          tx2Params.permissionMap,
        ]);

      expect(permissionArrayLength).toEqual(ARRAY_LENGTH.FIVE);
      expect(ethers.utils.getAddress(controllerAddress)).toEqual(
        context.accounts.AddresstoRecover2.address
      );
      expect(controllerPermissions).toEqual(ALL_PERMISSIONS);
    });
  });
};

export type LSP11InitializeTestContext = {
  lsp11BasicSocialRecovery: LSP11BasicSocialRecovery;
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
        await context.lsp11BasicSocialRecovery.supportsInterface(
          INTERFACE_IDS.ERC165
        )
      );
    });

    it("Should have registered the LSP11 interface", async () => {
      expect(
        await context.lsp11BasicSocialRecovery.supportsInterface(
          INTERFACE_IDS.LSP11BasicSocialRecovery
        )
      );
    });

    it("Should have set the owner", async () => {
      const idOwner = await context.lsp11BasicSocialRecovery.callStatic.owner();
      expect(idOwner).toEqual(context.deployParams.account.address);
    });

    it("Should have set the controlled account", async () => {
      const idAccount =
        await context.lsp11BasicSocialRecovery.callStatic.account();
      expect(idAccount).toEqual(context.deployParams.account.address);
    });
  });
};
