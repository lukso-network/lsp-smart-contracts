import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ALL } from "dns";
import { ethers } from "hardhat";
import { ALL_PERMISSIONS_SET, ERC725YKeys } from "../../constants";
import { setupSocialRecovery, setupProfileWithKeyManager, setupSocialRecoveryInit } from "../utils/fixtures";
import { ARRAY_LENGTH } from "../utils/helpers";
import { PERMISSIONS } from "../../constants";

describe("CTestung fixtures", () => {
  let accounts: SignerWithAddress[];
    beforeAll(async () => {
    accounts = await ethers.getSigners();
  });

  it("setuniversalProfileUniversalProfileWithKeyManager(EOA)", async () => {
    const EOA1 = accounts[0];
    const {universalProfile,lsp6KeyManager} = await setupProfileWithKeyManager(EOA1);
    const idOwner = await universalProfile.callStatic.owner();
    const idAccount = await lsp6KeyManager.callStatic.account();
    const [permissionArrayLength] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions[]"]]);
    const [firstElementInArray] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) + "00000000000000000000000000000000"]);
    const [EOA1PermissionMap] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions:Permissions"] + EOA1.address.substr(2)]);

    expect(permissionArrayLength).toEqual(ARRAY_LENGTH.ONE);
    expect(ethers.utils.getAddress(firstElementInArray)).toEqual(EOA1.address);
    expect(EOA1PermissionMap).toEqual(ALL_PERMISSIONS_SET);
    expect(idOwner).toEqual(lsp6KeyManager.address);
    expect(idAccount).toEqual(universalProfile.address);
  });

  it("setupSocialRecovery(EOA,Owner,universalProfile,lsp6KeyManager,Threshold)", async () => {
    const EOA1 = accounts[0];
    const {universalProfile,lsp6KeyManager} = await setupProfileWithKeyManager(EOA1);
    const socialRecovery = await setupSocialRecovery(EOA1, EOA1, universalProfile, lsp6KeyManager, 0);
    const socialRecoveryPermission = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.ADDPERMISSIONS, 32);
    const socialRecoveryOwner = await socialRecovery.callStatic.owner();
    const [permissionArrayLength] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions[]"]]);
    const [firstElementInArray] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) + "00000000000000000000000000000000"]);
    const [secondElementInArray] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) + "00000000000000000000000000000001"]);
    const [EOA1PermissionMap] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions:Permissions"] + EOA1.address.substr(2)]);
    const [SocialRecoveryPermissionMap] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions:Permissions"] + socialRecovery.address.substr(2)]);
    
    expect(socialRecoveryOwner).toEqual(EOA1.address);
    expect(permissionArrayLength).toEqual(ARRAY_LENGTH.TWO);
    expect(ethers.utils.getAddress(firstElementInArray)).toEqual(EOA1.address);
    expect(ethers.utils.getAddress(secondElementInArray)).toEqual(socialRecovery.address);
    expect(EOA1PermissionMap).toEqual(ALL_PERMISSIONS_SET);
    expect(SocialRecoveryPermissionMap).toEqual(socialRecoveryPermission);
  })

    it("setupSocialRecoveryInit(EOA,Owner,universalProfile,lsp6KeyManager,Threshold)", async () => {
    const EOA1 = accounts[0];
    const {universalProfile,lsp6KeyManager} = await setupProfileWithKeyManager(EOA1);
      const socialRecovery = await setupSocialRecoveryInit(EOA1, EOA1, universalProfile, lsp6KeyManager, 0);
      const socialRecoveryPermission = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.ADDPERMISSIONS, 32);
    // const socialRecoveryOwner = await socialRecovery.callStatic.owner();
    const [permissionArrayLength] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions[]"]]);
    const [firstElementInArray] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) + "00000000000000000000000000000000"]);
    const [secondElementInArray] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions[]"].substring(0, 34) + "00000000000000000000000000000001"]);
    const [EOA1PermissionMap] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions:Permissions"] + EOA1.address.substr(2)]);
    const [SocialRecoveryPermissionMap] = await universalProfile.connect(EOA1).getData([ERC725YKeys.LSP6["AddressPermissions:Permissions"] + socialRecovery.address.substr(2)]);
    // expect(socialRecoveryOwner).toEqual(EOA1.address);
    
    expect(permissionArrayLength).toEqual(ARRAY_LENGTH.TWO);
    expect(ethers.utils.getAddress(firstElementInArray)).toEqual(EOA1.address);
    expect(ethers.utils.getAddress(secondElementInArray)).toEqual(socialRecovery.address);
    expect(EOA1PermissionMap).toEqual(ALL_PERMISSIONS_SET);
    expect(SocialRecoveryPermissionMap).toEqual(socialRecoveryPermission);
  })
});
