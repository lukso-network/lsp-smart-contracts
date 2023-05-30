import { HelperContent } from "squirrelly/dist/types/containers";

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

const createLocalLinks = (textToFormat: string) => {
  let formatedText = textToFormat;
  [...textToFormat.matchAll(/{.+?}/g)].forEach((elem) => {
    const clearedElem = elem[0].replace("{", "").replace("}", "");
    const linkFirstHalf = `[\`${clearedElem}\`]`;
    const linkSecondHalf = `(#${clearedElem.toLowerCase().split("(")[0]})`;
    formatedText = formatedText.replace(
      elem[0],
      linkFirstHalf + linkSecondHalf
    );
  });

  return formatedText;
};

const parseCode = (textToFormat: string) => {
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
      formatedText = `${start}${end.split(" ").map((elem) => {
        if (elem.includes("(") || elem.includes(")")) return ` ${elem}`;
        return `\n    ${elem}`;
      })}`.replaceAll(",", "");
    }
  }

  return formatedText;
};

const parseBulletPointsWithTitle = (textToFormat: string, title: string) => {
  if (textToFormat.length === 0) return "";
  let formatedText: string = `**${title}**\n\n`;
  textToFormat.split("- ").forEach((elem: string) => {
    if (elem.trim().length !== 0) formatedText += `- ${elem.trim()}\n`;
  });
  return formatedText;
};

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
      helperName: "parseCode",
      helperFunc: (content: HelperContent) => parseCode(content.params[0]),
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
        parseBulletPointsWithTitle(
          createLocalLinks(content.params[0]),
          "Requirements:"
        ),
    },
    {
      helperName: "parseCustomEvents",
      helperFunc: (content: HelperContent) =>
        parseBulletPointsWithTitle(
          createLocalLinks(content.params[0]),
          "Emitted events:"
        ),
    },
  ],
};
