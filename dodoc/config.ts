import { ethers } from "ethers";
import { HelperContent } from "squirrelly/dist/types/containers";

export const dodocConfig = {
  runOnCompile: false,
  include: [
    "UniversalProfile.sol",
    "LSP0ERC725Account/LSP0ERC725Account.sol",
    "LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol",
    "LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol",
    "LSP6KeyManager/LSP6KeyManager.sol",
    "LSP9Vault/LSP9Vault.sol",
    "LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol",
    "LSP14Ownable2Step/LSP14Ownable2Step.sol",
    "LSP16UniversalFactory/LSP16UniversalFactory.sol",
    "LSP17ContractExtension/LSP17Extendable.sol",
    "LSP17ContractExtension/LSP17Extension.sol",
    "LSP20CallVerification/LSP20CallVerification.sol",

    // tokens
    "LSP4DigitalAssetMetadata/LSP4Compatibility.sol",
    "LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.sol",
    "LSP7DigitalAsset/LSP7DigitalAsset.sol",
    "LSP7DigitalAsset/extensions/LSP7Burnable.sol",
    "LSP7DigitalAsset/extensions/LSP7CappedSupply.sol",
    "LSP7DigitalAsset/extensions/LSP7CompatibleERC20.sol",
    "LSP7DigitalAsset/presets/LSP7CompatibleERC20Mintable.sol",
    "LSP7DigitalAsset/presets/LSP7Mintable.sol",
    "LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol",
    "LSP8IdentifiableDigitalAsset/extensions/LSP8Burnable.sol",
    "LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupply.sol",
    "LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibleERC721.sol",
    "LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol",
    "LSP8IdentifiableDigitalAsset/presets/LSP8CompatibleERC721Mintable.sol",
    "LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol",

    // libraries --------------------
    "LSP0ERC725Account/LSP0Utils.sol",
    "LSP1UniversalReceiver/LSP1Utils.sol",
    "LSP2ERC725YJSONSchema/LSP2Utils.sol",
    "LSP5ReceivedAssets/LSP5Utils.sol",
    "LSP6KeyManager/LSP6Utils.sol",
    "LSP10ReceivedVaults/LSP10Utils.sol",
    "LSP17ContractExtension/LSP17Utils.sol",
  ],
  templatePath: "./dodoc/template.sqrl",
  helpers: [
    {
      helperName: "formatTextWithLists",
      helperFunc: (content: HelperContent) => content.exec(formatTextWithLists(content.params[0])),
    },
    {
      helperName: "createLocalLinks",
      helperFunc: (content: HelperContent) => content.exec(createLocalLinks(content.params[0])),
    },
    {
      helperName: "formatLinks",
      helperFunc: (content: HelperContent) => content.exec(formatLinks(content.params[0])),
    },
    {
      helperName: "splitMethods",
      helperFunc: (content: HelperContent) => content.exec(splitMethods(content.params[0])),
    },
    {
      helperName: "parseNotice",
      helperFunc: (content: HelperContent) =>
        formatTextWithLists(createLocalLinks(content.params[0])),
    },
    {
      helperName: "parseDetails",
      helperFunc: (content: HelperContent) =>
        formatTextWithLists(createLocalLinks(content.params[0])),
    },
    {
      helperName: "parseCustomRequirements",
      helperFunc: (content: HelperContent) =>
        formatBulletPointsWithTitle(createLocalLinks(content.params[0]), "Requirements:"),
    },
    {
      helperName: "parseCustomEvents",
      helperFunc: (content: HelperContent) =>
        formatBulletPointsWithTitle(createLocalLinks(content.params[0]), "Emitted events:"),
    },
    {
      helperName: "genAdditionalMethodInfo",
      helperFunc: (content: HelperContent) =>
        generateAdditionalInfo(content.params[0], content.params[1], "Function"),
    },
    {
      helperName: "genAdditionalEventInfo",
      helperFunc: (content: HelperContent) =>
        generateAdditionalInfo(content.params[0], content.params[1], "Event"),
    },
    {
      helperName: "genAdditionalErrorInfo",
      helperFunc: (content: HelperContent) =>
        generateAdditionalInfo(content.params[0], content.params[1], "Error"),
    },
  ],
};

const createLocalLinks = (textToFormat: string) => {
  let formatedText = textToFormat;

  [...textToFormat.matchAll(/{.+?}/g)].forEach((elem) => {
    if (!elem[0].includes(" ")) {
      const clearedElem = elem[0].replace("{", "").replace("}", "");
      const linkFirstHalf = `[\`${clearedElem}\`]`;
      const linkSecondHalf = `(#${clearedElem.toLowerCase().split("(")[0]})`;
      formatedText = formatedText.replace(elem[0], linkFirstHalf + linkSecondHalf);
    }
  });

  return formatedText;
};

const splitMethods = (methods) => {
  const specialMethods = {};
  const normalMethods = {};

  for (const method in methods) {
    if (
      method.startsWith("constructor") ||
      method.startsWith("fallback") ||
      method.startsWith("receive")
    )
      specialMethods[method] = methods[method];
    else normalMethods[method] = methods[method];
  }

  return [specialMethods, normalMethods];
};

const formatLinks = (textToFormat: string) => {
  let formatedText: string = textToFormat;
  [...textToFormat.matchAll(/\s\w+\s+http\S+/g)].forEach((element) => {
    const tuple = element[0].trim();
    const firstSpace = tuple.indexOf(" ");
    const title = tuple.substring(0, firstSpace);
    const link = tuple.substring(firstSpace).trim();
    formatedText = formatedText.replace(tuple, `[**${title}**](${link})`);
  });

  return formatedText;
};

const formatTextWithLists = (textToFormat: string) => {
  let formatedText: string = textToFormat;
  [...textToFormat.matchAll(/\s-\s/g)].forEach((element) => {
    formatedText = formatedText.replace(element[0], `\n\n${element[0].trim()} `);
  });
  [...textToFormat.matchAll(/\s\d+\.\s/g)].forEach((element) => {
    formatedText = formatedText.replace(element[0], `\n\n${element[0].trim()} `);
  });

  return formatedText;
};

const replaceAll = (textToFormat: string, textToReplace: string, replaceWith: string) => {
  let formatedText = textToFormat;
  while (formatedText.includes(textToReplace)) {
    formatedText = formatedText.replace(textToReplace, replaceWith);
  }
  return formatedText;
};

const formatBulletPointsWithTitle = (textToFormat: string, title: string) => {
  if (textToFormat.length === 0) return "";
  let formatedText: string = `**${title}**\n\n`;
  if (textToFormat.startsWith("- ")) textToFormat = " " + textToFormat;
  textToFormat.split(" - ").forEach((elem) => {
    if (elem.trim().length !== 0) formatedText += `- ${elem.trim()}\n`;
  });
  return formatedText;
};

const generateAdditionalInfo = (contract: string, code: string, type: string) => {
  let formatedCode = code
    .substring(0, code.indexOf(")") + 1)
    .replace(`${type.toLowerCase()}`, "")
    .trim();

  if (!formatedCode.endsWith("()")) {
    formatedCode =
      formatedCode
        .split(",")
        .map((elem) => elem.trim().substring(0, elem.trim().indexOf(" ")))
        .toString() + ")";
  }

  const linkBase = "https://github.com/lukso-network/";

  let infoBlock: string;
  if (contract === "UniversalProfile") {
    infoBlock =
      `- Specification details in [**UniversalProfile**](${linkBase}lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata)\n` +
      `- Solidity implementation in [**UniversalProfile**](${linkBase}lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol)\n`;
  } else {
    const contractPath = dodocConfig.include.filter((value) => {
      if (value.endsWith(`${contract}.sol`)) return value;
    })[0];
    const contractLink = `${linkBase}lsp-smart-contracts/blob/develop/contracts/${contractPath}`;

    const specs = contractPath.split("/")[0];

    const specsName = `LSP-${specs.match(/\d+/)[0]}-${specs.split(/LSP\d+/)[1]}`;

    const specsLink = `${linkBase}lips/tree/main/LSPs/LSP-${specs.match(/\d+/)[0]}-${
      specs.split(/LSP\d+/)[1]
    }.md#${formatedCode.split("(")[0].toLowerCase()}`;

    infoBlock =
      `- Specification details in [**${specsName}**](${specsLink})\n` +
      `- Solidity implementation in [**${contract}**](${contractLink})\n`;
  }

  if (
    !formatedCode.startsWith("constructor") &&
    !formatedCode.startsWith("fallback") &&
    !formatedCode.startsWith("receive")
  ) {
    infoBlock +=
      `- ${type} signature: \`${formatedCode}\`\n` +
      `- ${type} ${type !== "Event" ? "selector" : "hash"}: \`${ethers.utils
        .keccak256(ethers.utils.toUtf8Bytes(formatedCode))
        .substring(0, type !== "Event" ? 10 : 66)}\``;
  }

  return infoBlock;
};
