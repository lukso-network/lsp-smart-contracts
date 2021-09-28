"use strict";

const fs = require("fs");

const erc725Account = fs.readFileSync("./build/contracts/ERC725.json");
const universalProfile = fs.readFileSync("./build/contracts/UniversalProfile.json");
const universalReceiver = fs.readFileSync("./build/contracts/BasicUniversalReceiver.json");
const keyManager = fs.readFileSync("./build/contracts/KeyManager.json");

const erc725ABI = JSON.parse(erc725Account).abi;
const universalProfileABI = JSON.parse(universalProfile).abi;
const universalReceiverABI = JSON.parse(universalReceiver).abi;
const keyManagerABI = JSON.parse(keyManager).abi;

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
    public static let ERC725_ABI = "${JSON.stringify(erc725ABI).replace(/"/g, '\\"')}"
    public static let UNIVERSAL_PROFILE_ABI = "${JSON.stringify(universalProfileABI).replace(
      /"/g,
      '\\"'
    )}"
    public static let UNIVERSAL_RECEIVER_ABI = "${JSON.stringify(universalReceiverABI).replace(
      /"/g,
      '\\"'
    )}"
    public static let KEY_MANAGER_ABI = "${JSON.stringify(keyManagerABI).replace(/"/g, '\\"')}"
}
`;

fs.appendFile(upSwiftFile, fileContents, (err) => {
  if (err) console.log(err);
});
