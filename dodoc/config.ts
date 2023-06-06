import { ethers } from "ethers";
import { HelperContent } from "squirrelly/dist/types/containers";

export const dodocConfig = {
  include: [
    "LSP0ERC725Account/LSP0ERC725Account.sol",
    "LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol",
    "LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol",
    "LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.sol",
    "LSP6KeyManager/LSP6KeyManager.sol",
    "LSP7DigitalAsset/LSP7DigitalAsset.sol",
    "LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol",
    "LSP9Vault/LSP9Vault.sol",
    "LSP14Ownable2Step/LSP14Ownable2Step.sol",
  ],
  templatePath: "./dodoc/template.sqrl",
  helpers: [
    {
      helperName: "formatTextWithLists",
      helperFunc: (content: HelperContent) =>
        content.exec(formatTextWithLists(content.params[0])),
    },
    {
      helperName: "createLocalLinks",
      helperFunc: (content: HelperContent) =>
        content.exec(createLocalLinks(content.params[0])),
    },
    {
      helperName: "formatLinks",
      helperFunc: (content: HelperContent) =>
        content.exec(formatLinks(content.params[0])),
    },
    {
      helperName: "splitMethods",
      helperFunc: (content: HelperContent) =>
        content.exec(splitMethods(content.params[0])),
    },
    {
      helperName: "formatCode",
      helperFunc: (content: HelperContent) => formatCode(content.params[0]),
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
        formatBulletPointsWithTitle(
          createLocalLinks(content.params[0]),
          "Requirements:"
        ),
    },
    {
      helperName: "parseCustomEvents",
      helperFunc: (content: HelperContent) =>
        formatBulletPointsWithTitle(
          createLocalLinks(content.params[0]),
          "Emitted events:"
        ),
    },
    {
      helperName: "genAdditionalMethodInfo",
      helperFunc: (content: HelperContent) =>
        genAdditionalInfo(content.params[0], content.params[1], "Function"),
    },
    {
      helperName: "genAdditionalEventInfo",
      helperFunc: (content: HelperContent) =>
        genAdditionalInfo(content.params[0], content.params[1], "Event"),
    },
    {
      helperName: "genAdditionalErrorInfo",
      helperFunc: (content: HelperContent) =>
        genAdditionalInfo(content.params[0], content.params[1], "Error"),
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
      formatedText = formatedText.replace(
        elem[0],
        linkFirstHalf + linkSecondHalf
      );
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
    formatedText = formatedText.replace(
      element[0],
      `\n\n${element[0].trim()} `
    );
  });
  [...textToFormat.matchAll(/\s\d+\.\s/g)].forEach((element) => {
    formatedText = formatedText.replace(
      element[0],
      `\n\n${element[0].trim()} `
    );
  });

  return formatedText;
};

const replaceAll = (
  textToFormat: string,
  textToReplace: string,
  replaceWith: string
) => {
  let formatedText = textToFormat;
  while (formatedText.includes(textToReplace))
    formatedText = formatedText.replace(textToReplace, replaceWith);
  return formatedText;
};

const formatCode = (textToFormat: string) => {
  let formatedText: string = textToFormat;
  if (textToFormat.length > 75) {
    if (textToFormat.split(",").length >= 2) {
      const start = textToFormat.substring(0, textToFormat.indexOf("(") + 1);
      const end = textToFormat.substring(textToFormat.indexOf(")"));
      const middle = textToFormat.replace(start, "").replace(end, "");
      formatedText = `${start}${middle
        .split(",")
        .map((elem) => `\n    ${elem.trim()}`)}\n${end}`;
    } else {
      const start = textToFormat.substring(0, textToFormat.indexOf(")") + 1);
      const end = textToFormat.replace(start, "").trim();
      formatedText = replaceAll(
        `${start}${end.split(" ").map((elem) => {
          if (elem.includes("(") || elem.includes(")")) return ` ${elem}`;
          return `\n    ${elem}`;
        })}`,
        ",",
        ""
      );
    }
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

const genAdditionalInfo = (contract: string, code: string, type: string) => {
  code = code
    .substring(0, code.indexOf(")") + 1)
    .replace(`${type.toLowerCase()}`, "")
    .trim();
  if (!code.endsWith("()"))
    code =
      code
        .split(",")
        .map((elem) => elem.trim().substring(0, elem.trim().indexOf(" ")))
        .toString() + ")";

  const linkBase = "https://github.com/lukso-network/";

  const specsName = `LSP-${contract.match(/\d+/)[0]}-${
    contract.split(/LSP\d+/)[1]
  }`;

  const specsLink = `${linkBase}lips/tree/main/LSPs/LSP-${
    contract.match(/\d+/)[0]
  }-${contract.split(/LSP\d+/)[1]}.md#${code.split("(")[0].toLowerCase()}`;

  let contractLink;
  if (["LSP4DigitalAssetMetadata", "LSP14Ownable2Step"].includes(contract))
    contractLink = `${linkBase}lsp-smart-contracts/blob/develop/contracts/${contract}/${contract}.sol`;
  else if (contract.includes("LSP1UniversalReceiver"))
    contractLink = `${linkBase}lsp-smart-contracts/blob/develop/contracts/LSP1UniversalReceiver/${contract}/${contract}.sol`;
  else
    contractLink = `${linkBase}lsp-smart-contracts/blob/develop/contracts/${contract}/${contract}Core.sol`;

  let infoBlock =
    `- Specification details in [**${specsName}**](${specsLink})\n` +
    `- Solidity implementation in [**${contract}**](${contractLink})\n`;

  if (
    !code.startsWith("constructor") &&
    !code.startsWith("fallback") &&
    !code.startsWith("receive")
  )
    infoBlock +=
      `- ${type} signature: \`${code}\`\n` +
      `- ${type} ${type !== "Event" ? "selector" : "hash"}: \`${ethers.utils
        .keccak256(ethers.utils.toUtf8Bytes(code))
        .substring(0, type !== "Event" ? 10 : 66)}\``;

  return infoBlock;
};