"use strict";

const fs = require("fs");

// Standard version
// ------------------
const UniversalProfile = fs.readFileSync(
  "./artifacts/contracts/LSP3-UniversalProfile.sol/UniversalProfile.json"
);
const KeyManager = fs.readFileSync(
  "./artifacts/contracts/LSP6KeyManager/LSP6KeyManager.sol/LSP6KeyManager.json"
);
const UniversalReceiverDelegate = fs.readFileSync(
  "./artifacts/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegate.sol/LSP1UniversalReceiverDelegate.json"
);
const LSP7 = fs.readFileSync(
  "./artifacts/contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol/LSP7DigitalAsset.json"
);
const LSP7CappedSupply = fs.readFileSync(
  "./artifacts/contracts/LSP7DigitalAsset/extensions/LSP7CappedSupply.sol/LSP7CappedSupply.json"
);
const LSP8 = fs.readFileSync(
  "./artifacts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol/LSP8IdentifiableDigitalAsset.json"
);
const LSP8CappedSupply = fs.readFileSync(
  "./artifacts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupply.sol/LSP8CappedSupply.json"
);

const UniversalProfile_ABI = JSON.parse(UniversalProfile).abi;
const KeyManager_ABI = JSON.parse(KeyManager).abi;
const UniversalReceiverDelegate_ABI = JSON.parse(UniversalReceiverDelegate).abi;
const LSP7_ABI = JSON.parse(LSP7).abi;
const LSP7CappedSupply_ABI = JSON.parse(LSP7CappedSupply).abi;
const LSP8_ABI = JSON.parse(LSP8).abi;
const LSP8CappedSupply_ABI = JSON.parse(LSP8CappedSupply).abi;

// Proxy version
// ------------------
const UniversalProfileInit = fs.readFileSync(
  "./artifacts/contracts/UniversalProfileInit.sol/UniversalProfileInit.json"
);
const KeyManagerInit = fs.readFileSync(
  "./artifacts/contracts/LSP6KeyManager/LSP6KeyManagerInit.sol/LSP6KeyManagerInit.json"
);
const UniversalReceiverDelegateInit = fs.readFileSync(
  "./artifacts/contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateInit.sol/LSP1UniversalReceiverDelegateInit.json"
);
const LSP7Init = fs.readFileSync(
  "./artifacts/contracts/LSP7DigitalAsset/LSP7DigitalAssetInit.sol/LSP7DigitalAssetInit.json"
);
const LSP7CappedSupplyInit = fs.readFileSync(
  "./artifacts/contracts/LSP7DigitalAsset/extensions/LSP7CappedSupplyInit.sol/LSP7CappedSupplyInit.json"
);
const LSP8Init = fs.readFileSync(
  "./artifacts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAssetInit.sol/LSP8IdentifiableDigitalAssetInit.json"
);
const LSP8CappedSupplyInit = fs.readFileSync(
  "./artifacts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupplyInit.sol/LSP8CappedSupplyInit.json"
);

const UniversalProfileInit_ABI = JSON.parse(UniversalProfileInit).abi;
const KeyManagerInit_ABI = JSON.parse(KeyManagerInit).abi;
const UniversalReceiverDelegateInit_ABI = JSON.parse(UniversalReceiverDelegateInit).abi;
const LSP7Init_ABI = JSON.parse(LSP7Init).abi;
const LSP7CappedSupplyInit_ABI = JSON.parse(LSP7CappedSupplyInit).abi;
const LSP8Init_ABI = JSON.parse(LSP8Init).abi;
const LSP8CappedSupplyInit_ABI = JSON.parse(LSP8CappedSupplyInit).abi;

// ERC Compatible tokens
// ------------------------
const LSP7CompatibilityForERC20 = fs.readFileSync(
  "./artifacts/contracts/LSP7DigitalAsset/extensions/LSP7CompatibilityForERC20.sol/LSP7CompatibilityForERC20.json"
);
const LSP8CompatibilityForERC721 = fs.readFileSync(
  "./artifacts/contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721.sol/LSP8CompatibilityForERC721.json"
);

const LSP7CompatibilityForERC20_ABI = JSON.parse(LSP7CompatibilityForERC20).abi;
const LSP8CompatibilityForERC721_ABI = JSON.parse(LSP8CompatibilityForERC721).abi;

let upSwiftFile = "./ios/UPContractsAbi.swift";

let fileContents = `
//
//  UPContractsAbi.swift
//  universalprofile-ios-sdk
//
//  Created by lukso-network.
//  LUKSO Blockchain GmbH © ${new Date().getFullYear()}
//
import Foundation

public final class UPContractsAbi {

    // Standard Version
    // ------------------

    public static let UNIVERSAL_PROFILE_ABI = "${JSON.stringify(UniversalProfile_ABI).replace(
      /"/g,
      '\\"'
    )}"

    public static let LSP6_KEY_MANAGER_ABI = "${JSON.stringify(KeyManager_ABI).replace(
      /"/g,
      '\\"'
    )}"
    
    public static let LSP1_UNIVERSAL_RECEIVER_DELEGATE_ABI = "${JSON.stringify(
      UniversalReceiverDelegate_ABI
    ).replace(/"/g, '\\"')}"

    public static let LSP7_DIGITAL_ASSET_ABI = "${JSON.stringify(LSP7_ABI).replace(
      /"/g,
      '\\"'
    )}"    
    public static let LSP7_CAPPED_SUPPLY_ABI = "${JSON.stringify(LSP7CappedSupply_ABI).replace(
      /"/g,
      '\\"'
    )}"    
    public static let LSP8_IDENTIFIABLE_DIGITAL_ASSET_ABI = "${JSON.stringify(LSP8_ABI).replace(
      /"/g,
      '\\"'
    )}"    
    public static let LSP8_CAPPED_SUPPLY_ABI = "${JSON.stringify(LSP8CappedSupply_ABI).replace(
      /"/g,
      '\\"'
    )}"    

    // Proxy version
    // ------------------

    public static let UNIVERSAL_PROFILE_INIT_ABI = "${JSON.stringify(
      UniversalProfileInit_ABI
    ).replace(/"/g, '\\"')}"    

    public static let LSP6_KEY_MANAGER_INIT_ABI = "${JSON.stringify(KeyManagerInit_ABI).replace(
      /"/g,
      '\\"'
    )}" 
    
    public static let LSP1_UNIVERSAL_RECEIVER_DELEGATE_INIT_ABI = "${JSON.stringify(
      UniversalReceiverDelegateInit_ABI
    ).replace(/"/g, '\\"')}"

    public static let LSP7_DIGITAL_ASSET_INIT_ABI = "${JSON.stringify(LSP7Init_ABI).replace(
      /"/g,
      '\\"'
    )}"    
    public static let LSP7_CAPPED_SUPPLY_INIT_ABI = "${JSON.stringify(
      LSP7CappedSupplyInit_ABI
    ).replace(/"/g, '\\"')}"  

    public static let LSP8_IDENTIFIABLE_DIGITAL_ASSET_INIT_ABI = "${JSON.stringify(
      LSP8Init_ABI
    ).replace(/"/g, '\\"')}"    
    public static let LSP8_CAPPED_SUPPLY_INIT_ABI = "${JSON.stringify(
      LSP8CappedSupplyInit_ABI
    ).replace(/"/g, '\\"')}"    
        
    // ERC Compatible tokens
    // ------------------------
    public static let LSP7_COMPATIBILITY_FOR_ERC20_ABI = "${JSON.stringify(
      LSP7CompatibilityForERC20_ABI
    ).replace(/"/g, '\\"')}"    
    public static let LSP8_COMPATIBILITY_FOR_RC721_ABI = "${JSON.stringify(
      LSP8CompatibilityForERC721_ABI
    ).replace(/"/g, '\\"')}"    
}
`;

fs.appendFile(upSwiftFile, fileContents, (err) => {
  if (err) console.log(err);
});
