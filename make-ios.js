"use strict";

const fs = require("fs");

// Standard version
// ------------------
const UniversalProfile = fs.readFileSync(
  "./build/artifacts/contracts/UniversalProfile.sol/UniversalProfile.json"
);
const KeyManager = fs.readFileSync(
  "./build/artifacts/contracts/LSP6-KeyManager/KeyManager.sol/KeyManager.json"
);
const UniversalReceiverDelegate = fs.readFileSync(
  "./build/artifacts/contracts/LSP1-UniversalReceiver/UniversalReceiverDelegate.sol/UniversalReceiverDelegate.json"
);
const LSP7 = fs.readFileSync("./build/artifacts/contracts/LSP7-DigitalAsset/LSP7.sol/LSP7.json");
const LSP7CappedSupply = fs.readFileSync(
  "./build/artifacts/contracts/LSP7-DigitalAsset/extensions/LSP7CappedSupply.sol/LSP7CappedSupply.json"
);
const LSP8 = fs.readFileSync(
  "./build/artifacts/contracts/LSP8-IdentifiableDigitalAsset/LSP8.sol/LSP8.json"
);
const LSP8CappedSupply = fs.readFileSync(
  "./build/artifacts/contracts/LSP8-IdentifiableDigitalAsset/extensions/LSP8CappedSupply.sol/LSP8CappedSupply.json"
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
  "./build/artifacts/contracts/UniversalProfileInit.sol/UniversalProfileInit.json"
);
const KeyManagerInit = fs.readFileSync(
  "./build/artifacts/contracts/LSP6-KeyManager/KeyManagerInit.sol/KeyManagerInit.json"
);
const UniversalReceiverDelegateInit = fs.readFileSync(
  "./build/artifacts/contracts/LSP1-UniversalReceiver/UniversalReceiverDelegateInit.sol/UniversalReceiverDelegateInit.json"
);
const LSP7Init = fs.readFileSync(
  "./build/artifacts/contracts/LSP7-DigitalAsset/LSP7Init.sol/LSP7Init.json"
);
const LSP7CappedSupplyInit = fs.readFileSync(
  "./build/artifacts/contracts/LSP7-DigitalAsset/extensions/LSP7CappedSupplyInit.sol/LSP7CappedSupplyInit.json"
);
const LSP8Init = fs.readFileSync(
  "./build/artifacts/contracts/LSP8-IdentifiableDigitalAsset/LSP8.sol/LSP8.json"
);
const LSP8CappedSupplyInit = fs.readFileSync(
  "./build/artifacts/contracts/LSP8-IdentifiableDigitalAsset/extensions/LSP8CappedSupplyInit.sol/LSP8CappedSupplyInit.json"
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
  "./build/artifacts/contracts/LSP7-DigitalAsset/extensions/LSP7CompatibilityForERC20.sol/LSP7CompatibilityForERC20.json"
);
const LSP8CompatibilityForERC721 = fs.readFileSync(
  "./build/artifacts/contracts/LSP8-IdentifiableDigitalAsset/extensions/LSP8CompatibilityForERC721.sol/LSP8CompatibilityForERC721.json"
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

    public static let KEY_MANAGER_ABI = "${JSON.stringify(KeyManager_ABI).replace(/"/g, '\\"')}"
    
    public static let UNIVERSAL_RECEIVER_DELEGATE_ABI = "${JSON.stringify(
      UniversalReceiverDelegate_ABI
    ).replace(/"/g, '\\"')}"

    public static let LSP7_ABI = "${JSON.stringify(LSP7_ABI).replace(/"/g, '\\"')}"    
    public static let LSP7_CAPPED_SUPPLY_ABI = "${JSON.stringify(LSP7CappedSupply_ABI).replace(
      /"/g,
      '\\"'
    )}"    
    public static let LSP8_ABI = "${JSON.stringify(LSP8_ABI).replace(/"/g, '\\"')}"    
    public static let LSP8_CAPPED_SUPPLY_ABI = "${JSON.stringify(LSP8CappedSupply_ABI).replace(
      /"/g,
      '\\"'
    )}"    

    // Proxy version
    // ------------------

    public static let UNIVERSAL_PROFILE_INIT_ABI = "${JSON.stringify(
      UniversalProfileInit_ABI
    ).replace(/"/g, '\\"')}"    

    public static let KEY_MANAGER_INIT_ABI = "${JSON.stringify(KeyManagerInit_ABI).replace(
      /"/g,
      '\\"'
    )}" 
    
    public static let UNIVERSAL_RECEIVER_DELEGATE_INIT_ABI = "${JSON.stringify(
      UniversalReceiverDelegateInit_ABI
    ).replace(/"/g, '\\"')}"

    public static let LSP7_INIT_ABI = "${JSON.stringify(LSP7Init_ABI).replace(/"/g, '\\"')}"    
    public static let LSP7_CAPPED_SUPPLY_INIT_ABI = "${JSON.stringify(
      LSP7CappedSupplyInit_ABI
    ).replace(/"/g, '\\"')}"  

    public static let LSP8_INIT_ABI = "${JSON.stringify(LSP8Init_ABI).replace(/"/g, '\\"')}"    
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
