import fs from "fs";
import { ethers } from "ethers";
const hre = require("hardhat");

const main = () => {
  const contracts = hre.config.packager.contracts;

  const EVENTS = {};
  const ERRORS = {};
  const METHODS = {};
  const CONTRACTS = {};

  contracts.map(async (contract: string) => {
    const userdocsPath = "userdocs/" + contract + "/" + contract + ".docuser";
    const contractUserdocs: string = fs.readFileSync(userdocsPath, "utf-8");
    const devdocsPath = "devdocs/" + contract + "/" + contract + ".docdev";
    const contractDevdocs: string = fs.readFileSync(devdocsPath, "utf-8");

    EVENTS[contract] = JSON.parse(contractDevdocs).events;
    for (const eventName in EVENTS[contract]) {
      const eventHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(eventName)
      );
      EVENTS[contract][eventHash] = EVENTS[contract][eventName];
      EVENTS[contract][eventHash].event = eventName;
      EVENTS[contract][eventHash].notice =
        JSON.parse(contractUserdocs).events &&
        JSON.parse(contractUserdocs).events[eventName]
          ? JSON.parse(contractUserdocs).events[eventName].notice
          : "";

      delete EVENTS[contract][eventName];
    }

    ERRORS[contract] = JSON.parse(contractDevdocs).errors;
    for (const errorName in ERRORS[contract]) {
      const eventHash = ethers.utils
        .keccak256(ethers.utils.toUtf8Bytes(errorName))
        .substring(0, 10);
      ERRORS[contract][eventHash] = ERRORS[contract][errorName];
      ERRORS[contract][eventHash].error = errorName;
      ERRORS[contract][eventHash].notice =
        JSON.parse(contractUserdocs).errors &&
        JSON.parse(contractUserdocs).errors[errorName]
          ? JSON.parse(contractUserdocs).errors[errorName].notice
          : "";

      delete ERRORS[contract][errorName];
    }

    METHODS[contract] = JSON.parse(contractDevdocs).methods;
    for (const methodName in METHODS[contract]) {
      const eventHash = ethers.utils
        .keccak256(ethers.utils.toUtf8Bytes(methodName))
        .substring(0, 10);
      METHODS[contract][eventHash] = METHODS[contract][methodName];
      METHODS[contract][eventHash].method = methodName;
      METHODS[contract][eventHash].notice =
        JSON.parse(contractUserdocs).methods &&
        JSON.parse(contractUserdocs).methods[methodName]
          ? JSON.parse(contractUserdocs).methods[methodName].notice
          : "";

      delete METHODS[contract][methodName];
    }

    const contractDocs = JSON.parse(contractDevdocs);
    delete contractDocs.events;
    delete contractDocs.errors;
    delete contractDocs.methods;
    CONTRACTS[contract] = contractDocs;
  });

  fs.mkdirSync("docs", { recursive: true });
  fs.writeFileSync("docs/Events.json", JSON.stringify(EVENTS), "utf8");
  fs.writeFileSync("docs/Errors.json", JSON.stringify(ERRORS), "utf8");
  fs.writeFileSync("docs/Methods.json", JSON.stringify(METHODS), "utf8");
  fs.writeFileSync("docs/Contracts.json", JSON.stringify(CONTRACTS), "utf8");
  if (fs.existsSync("userdocs")) {
  fs.rmSync("userdocs", { recursive: true });
  }
  if (fs.existsSync("devdocs")) {
  fs.rmSync("devdocs", { recursive: true });
  }
};

main();
