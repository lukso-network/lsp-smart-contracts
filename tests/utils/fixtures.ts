import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { LSP11SocialRecovery, LSP11SocialRecoveryInit, LSP11SocialRecovery__factory, LSP11SocialRecoveryInit__factory, LSP6KeyManager, LSP6KeyManager__factory, UniversalProfile, UniversalProfile__factory } from "../../types";
import { ERC725YKeys, ALL_PERMISSIONS_SET } from "../../constants";
import { ARRAY_LENGTH } from "./helpers";
import { deployProxy } from "./proxy";
import { PERMISSIONS } from "../../constants";

// prettier-ignore

/**
 * To be used as a return value for setupProfileWithKeyManager function
 */ 
export type ProfileWithKeyManager = {
    universalProfile: UniversalProfile,
    lsp6KeyManager: LSP6KeyManager
};

/**
 * Deploy a Universal Profile with *EOA* as owner and link a key Manager to the profile with
 * setting all needed permission for the owner followed by transferring ownership to the Key Manager
 * @param  {SignerWithAddress} EOA The address to control the Universal Profile through the Key Manager
 * @return {ProfileWithKeyManager} { universalProfile, lsp6KeyManager } The Universal Profile and the Key Manager
 */
export async function setupProfileWithKeyManager(EOA: SignerWithAddress): Promise<ProfileWithKeyManager>{
    const universalProfile = await new UniversalProfile__factory(EOA).deploy(EOA.address);
    const lsp6KeyManager = await new LSP6KeyManager__factory(EOA).deploy(universalProfile.address);
    await universalProfile.connect(EOA).setData([ERC725YKeys.LSP6["AddressPermissions[]"]], [ARRAY_LENGTH.ONE]);
    await universalProfile.connect(EOA).setData([ERC725YKeys.LSP6["AddressPermissions[]"].substring(0,34) + "00000000000000000000000000000000"] ,[EOA.address]);
    await universalProfile.connect(EOA).setData([ERC725YKeys.LSP6["AddressPermissions:Permissions"] + EOA.address.substr(2)], [ALL_PERMISSIONS_SET]);
    await universalProfile.connect(EOA).transferOwnership(lsp6KeyManager.address);
    await EOA.sendTransaction({
      to: universalProfile.address,
      value: ethers.utils.parseEther("10"),
    });
    return { universalProfile, lsp6KeyManager };
};

/**
 * Deploy a normal social recovery contract and set the *Owner* address as owner of the contract, *universalProfile* as an account
 * to control and *threshold* as a minimum number of votes to recover the *universalProfile* along with setting
 * permission to the lsp11 contract in the *universalProfile* linked to the *lsp6KeyManager* controlled by the *EOA*
 * @param {SignerWithAddress} EOA The address to control the Universal Profile through the Key Manager
 * @param {SignerWithAddress | UniversalProfile} Owner The owner of the social recovery contract
 * @param {UniversalProfile} universalProfile The Universal Profile to recover in the social recovery contract
 * @param {LSP6KeyManager} lsp6KeyManager The Key Manager linked to the Universal Profile
 * @param {number} threshold The minimum number of votes from the guardians to recover an address to control the *universalProfile*
 * through the *lsp6KeyManager*
 * @return {LSP11SocialRecovery} lsp11SocialRecovery The social Recovery contract
 */
export async function setupSocialRecovery(EOA:SignerWithAddress, Owner: SignerWithAddress | UniversalProfile, universalProfile: UniversalProfile, lsp6KeyManager:LSP6KeyManager, threshold: number): Promise<LSP11SocialRecovery> {
    let lsp11SocialRecovery: LSP11SocialRecovery;
    const socialRecoveryPermission = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.ADDPERMISSIONS, 32);
    lsp11SocialRecovery = await new LSP11SocialRecovery__factory(EOA).deploy(Owner.address, universalProfile.address, threshold);
    const [rawPermissionArrayLength] = await universalProfile.connect(EOA).getData([ERC725YKeys.LSP6["AddressPermissions[]"]]);
    let permissionArrayLength = ethers.BigNumber.from(rawPermissionArrayLength).toNumber(); 
    const newPermissionArrayLength = permissionArrayLength + 1;
        const newRawPermissionArrayLength = ethers.utils.hexZeroPad(ethers.utils.hexValue(newPermissionArrayLength), 32);
        const payload = universalProfile.interface.encodeFunctionData("setData",
            [
                [
                    ERC725YKeys.LSP6["AddressPermissions[]"],
                    ERC725YKeys.LSP6["AddressPermissions[]"].substring(0,34) + rawPermissionArrayLength.substring(34,66),
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + lsp11SocialRecovery.address.substr(2)
                ],
                [
                    newRawPermissionArrayLength,
                    lsp11SocialRecovery.address,
                    socialRecoveryPermission
                ]
            ]);
    await lsp6KeyManager.connect(EOA).execute(payload);    
    return lsp11SocialRecovery;
};


/**
 * Deploy a proxy social recovery contract without initializing along with setting permission 
 * to the lsp11 contract in the *universalProfile* linked to the *lsp6KeyManager* controlled by the *EOA*
 * @param {SignerWithAddress} EOA The address to control the Universal Profile through the Key Manager
 * @param {SignerWithAddress | UniversalProfile} Owner The owner of the social recovery contract
 * @param {UniversalProfile} universalProfile The Universal Profile to recover in the social recovery contract
 * @param {LSP6KeyManager} lsp6KeyManager The Key Manager linked to the Universal Profile
 * @param {number} threshold The minimum number of votes from the guardians to recover an address that
 * control the *universalProfile* through the *lsp6KeyManager*
 * @return {LSP11SocialRecovery} lsp11SocialRecovery The social Recovery contract
 */
export async function setupSocialRecoveryInit(EOA:SignerWithAddress, Owner: SignerWithAddress | UniversalProfile, universalProfile: UniversalProfile, lsp6KeyManager:LSP6KeyManager, threshold: number): Promise<LSP11SocialRecovery> {
    let lsp11SocialRecoveryInit: LSP11SocialRecoveryInit;
    const socialRecoveryPermission = ethers.utils.hexZeroPad(PERMISSIONS.SETDATA + PERMISSIONS.ADDPERMISSIONS, 32);
    lsp11SocialRecoveryInit = await new LSP11SocialRecoveryInit__factory(EOA).deploy();
    const lsp11SocialRecoveryProxy = await deployProxy(lsp11SocialRecoveryInit.address, EOA);
    const lsp11SocialRecovery = lsp11SocialRecoveryInit.attach(lsp11SocialRecoveryProxy);
    // await lsp11SocialRecovery.connect(EOA).initialize(Owner.address, universalProfile.address, threshold); // we don't initialize here
    const [rawPermissionArrayLength] = await universalProfile.connect(EOA).getData([ERC725YKeys.LSP6["AddressPermissions[]"]]);
    let permissionArrayLength = ethers.BigNumber.from(rawPermissionArrayLength).toNumber(); 
    const newPermissionArrayLength = permissionArrayLength + 1;
        const newRawPermissionArrayLength = ethers.utils.hexZeroPad(ethers.utils.hexValue(newPermissionArrayLength), 32);
        const payload = universalProfile.interface.encodeFunctionData("setData",
            [
                [
                    ERC725YKeys.LSP6["AddressPermissions[]"],
                    ERC725YKeys.LSP6["AddressPermissions[]"].substring(0,34) + rawPermissionArrayLength.substring(34,66),
                    ERC725YKeys.LSP6["AddressPermissions:Permissions"] + lsp11SocialRecovery.address.substr(2)
                ],
                [
                    newRawPermissionArrayLength,
                    lsp11SocialRecovery.address,
                    socialRecoveryPermission
                ]
            ]);
    await lsp6KeyManager.connect(EOA).execute(payload);    
    return lsp11SocialRecovery;
};
