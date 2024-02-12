import { ethers } from 'ethers';
import { HelperContent } from 'squirrelly/dist/types/containers';

export const dodocConfig = {
  runOnCompile: false,
  include: [
    '@lukso/universalprofile-contracts/contracts/UniversalProfile.sol',
    '@lukso/lsp0-contracts/contracts/LSP0ERC725Account.sol',
    '@lukso/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateUP.sol',
    '@lukso/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateVault.sol',
    '@lukso/lsp6-contracts/contracts/LSP6KeyManager.sol',
    '@lukso/lsp9-contracts/contracts/LSP9Vault.sol',
    'contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol',
    '@lukso/lsp14-contracts/contracts/LSP14Ownable2Step.sol',
    '@lukso/lsp16-contracts/contracts/LSP16UniversalFactory.sol',
    '@lukso/lsp17contractextension-contracts/contracts/LSP17Extendable.sol',
    '@lukso/lsp17contractextension-contracts/contracts/LSP17Extension.sol',
    '@lukso/lsp17-contracts/Extension4337.sol',
    '@lukso/lsp17-contracts/OnERC721ReceivedExtension.sol',
    '@lukso/lsp20-contracts/contracts/LSP20CallVerification.sol',
    'contracts/LSP23LinkedContractsFactory/LSP23LinkedContractsFactory.sol',
    'contracts/LSP23LinkedContractsFactory/IPostDeploymentModule.sol',
    '@lukso/lsp25-contracts/contracts/LSP25MultiChannelNonce.sol',

    // tokens
    '@lukso/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol',
    '@lukso/lsp7-contracts/contracts/LSP7DigitalAsset.sol',
    '@lukso/lsp7-contracts/contracts/extensions/LSP7Burnable.sol',
    '@lukso/lsp7-contracts/contracts/extensions/LSP7CappedSupply.sol',
    '@lukso/lsp7-contracts/contracts/presets/LSP7Mintable.sol',
    '@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol',
    '@lukso/lsp8-contracts/contracts/extensions/LSP8Burnable.sol',
    '@lukso/lsp8-contracts/contracts/extensions/LSP8CappedSupply.sol',
    '@lukso/lsp8-contracts/contracts/extensions/LSP8Enumerable.sol',
    '@lukso/lsp8-contracts/contracts/presets/LSP8Mintable.sol',

    // libraries --------------------
    '@lukso/lsp1-contracts/contracts/LSP1Utils.sol',
    '@lukso/lsp2-contracts/contracts/LSP2Utils.sol',
    '@lukso/lsp5-contracts/contracts/LSP5Utils.sol',
    '@lukso/lsp6-contracts/contracts/LSP6Utils.sol',
    '@lukso/lsp10-contracts/contracts/LSP10Utils.sol',
    '@lukso/lsp17contractextension-contracts/contracts/LSP17Utils.sol',

    // external --------------------
    '@erc725/smart-contracts/contracts/ERC725.sol',
  ],
  libraries: [
    '@lukso/lsp1-contracts/contracts/LSP1Utils.sol',
    '@lukso/lsp2-contracts/contracts/LSP2Utils.sol',
    '@lukso/lsp5-contracts/contracts/LSP5Utils.sol',
    '@lukso/lsp6-contracts/contracts/LSP6Utils.sol',
    '@lukso/lsp10-contracts/contracts/LSP10Utils.sol',
    '@lukso/lsp17contractextension-contracts/contracts/LSP17Utils.sol',
  ],
  templatePath: './dodoc/template.sqrl',
  helpers: [
    {
      helperName: 'formatTextWithLists',
      helperFunc: (content: HelperContent) => content.exec(formatTextWithLists(content.params[0])),
    },
    {
      helperName: 'createLocalLinks',
      helperFunc: (content: HelperContent) => content.exec(createLocalLinks(content.params[0])),
    },
    {
      helperName: 'formatLinks',
      helperFunc: (content: HelperContent) => content.exec(formatLinks(content.params[0])),
    },
    {
      helperName: 'splitMethods',
      helperFunc: (content: HelperContent) => content.exec(splitMethods(content.params[0])),
    },
    {
      helperName: 'parseNotice',
      helperFunc: (content: HelperContent) =>
        formatTextWithLists(createLocalLinks(content.params[0])),
    },
    {
      helperName: 'parseDetails',
      helperFunc: (content: HelperContent) =>
        formatTextWithLists(createLocalLinks(content.params[0])),
    },
    {
      helperName: 'parseCustomRequirements',
      helperFunc: (content: HelperContent) =>
        formatBulletPointsWithTitle(createLocalLinks(content.params[0]), 'Requirements:'),
    },
    {
      helperName: 'parseCustomEvents',
      helperFunc: (content: HelperContent) =>
        formatBulletPointsWithTitle(createLocalLinks(content.params[0]), 'Emitted events:'),
    },
    {
      helperName: 'generateAdditionalMethodInfo',
      helperFunc: (content: HelperContent) =>
        generateAdditionalMethodInfo(content.params[0], content.params[1]),
    },
    {
      helperName: 'generateAdditionalEventInfo',
      helperFunc: (content: HelperContent) =>
        generateAdditionalEventInfo(content.params[0], content.params[1]),
    },
    {
      helperName: 'generateAdditionalErrorInfo',
      helperFunc: (content: HelperContent) =>
        generateAdditionalErrorInfo(content.params[0], content.params[1]),
    },
    {
      helperName: 'generateContractLink',
      helperFunc: (content: HelperContent) => generateContractLink(content.params[0]),
    },
    {
      helperName: 'generateContractSpecsDetails',
      helperFunc: (content: HelperContent) =>
        content.exec(generateContractSpecsDetails(content.params[0])),
    },
    {
      helperName: 'formatDisplayedCode',
      helperFunc: (content: HelperContent) => formatDisplayedCode(content.params[0]),
    },
    {
      helperName: 'formatParamDescription',
      helperFunc: (content: HelperContent) => formatParamDescription(content.params[0]),
    },
    {
      helperName: 'formatParamType',
      helperFunc: (content: HelperContent) => formatParamType(content.params[0]),
    },
    {
      helperName: 'formatCustomTags',
      helperFunc: (content: HelperContent) => formatCustomTags(content.params[0]),
    },
  ],
};

const linkBase = 'https://github.com/lukso-network/';

const createLocalLinks = (textToFormat: string) => {
  let formatedText = textToFormat;

  [...textToFormat.matchAll(/{.+?}/g)].forEach((elem) => {
    if (!elem[0].includes(' ')) {
      const clearedElem = elem[0].replace('{', '').replace('}', '');
      const linkFirstHalf = `[\`${clearedElem}\`]`;
      const linkSecondHalf = `(#${clearedElem.toLowerCase().split('(')[0]})`;
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
      method.startsWith('constructor') ||
      method.startsWith('fallback') ||
      method.startsWith('receive')
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
    const firstSpace = tuple.indexOf(' ');
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

const removeParameterNames = (content: string) => {
  return content
    .split(',')
    .map((elem) => {
      const trimmedElem = elem.trim();

      if (trimmedElem.includes(' ')) {
        return trimmedElem.substring(0, elem.trim().indexOf(' '));
      } else {
        return trimmedElem;
      }
    })
    .toString();
};

const formatCode = (code: string, type: string) => {
  let formattedCode = code
    .substring(0, code.indexOf(')') + 1)
    .replace(`${type.toLowerCase()}`, '')
    .trim();

  if (!formattedCode.endsWith('()')) {
    const start = `${formattedCode.split('(')[0]}(`;
    const end = ')';
    const middle = formattedCode.replace(start, '').replace(end, '');

    formattedCode = start + removeParameterNames(middle) + end;
  }

  return formattedCode;
};

const formatBulletPointsWithTitle = (textToFormat: string, title: string) => {
  if (textToFormat.length === 0) return '';

  let formatedText = `**${title}**\n\n`;

  if (textToFormat.startsWith('- ')) textToFormat = ' ' + textToFormat;

  textToFormat.split(' - ').forEach((elem) => {
    if (elem.trim().length !== 0) formatedText += `- ${elem.trim()}\n`;
  });

  return formatedText;
};

const generateAdditionalMethodInfo = (contract: string, code: string) => {
  const formatedCode = formatCode(code, 'function');
  const contractLink = generateContractLink(contract);
  const { specsName, specsLink } = generateContractSpecsDetails(contract);

  let infoBlock =
    `- Specification details: [**${specsName}**](${specsLink}#${formatedCode
      .split('(')[0]
      .toLowerCase()})\n` + `- Solidity implementation: [\`${contract}.sol\`](${contractLink})\n`;

  if (
    !formatedCode.startsWith('constructor') &&
    !formatedCode.startsWith('fallback') &&
    !formatedCode.startsWith('receive')
  ) {
    infoBlock +=
      `- Function signature: \`${formatedCode}\`\n` +
      `- Function selector: \`${ethers.utils
        .keccak256(ethers.utils.toUtf8Bytes(formatedCode))
        .substring(0, 10)}\``;
  }

  return infoBlock;
};

const generateAdditionalEventInfo = (contract: string, code: string) => {
  const formatedCode = formatCode(code, 'event');
  const contractLink = generateContractLink(contract);
  const { specsName, specsLink } = generateContractSpecsDetails(contract);

  return (
    `- Specification details: [**${specsName}**](${specsLink}#${formatedCode
      .split('(')[0]
      .toLowerCase()})\n` +
    `- Solidity implementation: [\`${contract}.sol\`](${contractLink})\n` +
    `- Event signature: \`${formatedCode}\`\n` +
    `- Event topic hash: \`${ethers.utils.keccak256(ethers.utils.toUtf8Bytes(formatedCode))}\``
  );
};

const generateAdditionalErrorInfo = (contract: string, code: string) => {
  const formatedCode = formatCode(code, 'error');
  const contractLink = generateContractLink(contract);
  const { specsName, specsLink } = generateContractSpecsDetails(contract);

  return (
    `- Specification details: [**${specsName}**](${specsLink}#${formatedCode
      .split('(')[0]
      .toLowerCase()})\n` +
    `- Solidity implementation: [\`${contract}.sol\`](${contractLink})\n` +
    `- Error signature: \`${formatedCode}\`\n` +
    `- Error hash: \`${ethers.utils
      .keccak256(ethers.utils.toUtf8Bytes(formatedCode))
      .substring(0, 10)}\``
  );
};

const generateContractLink = (contractName: string) => {
  if (contractName === 'UniversalProfile') {
    return `${linkBase}lsp-smart-contracts/blob/develop/contracts/UniversalProfile.sol`;
  }

  if (contractName === 'ERC725') {
    return 'https://github.com/ERC725Alliance/ERC725/blob/main/implementations/contracts/ERC725.sol';
  }

  const contractPath = dodocConfig.include.filter((value) => {
    if (value.endsWith(`${contractName}.sol`)) return value;
  })[0];

  return `${linkBase}lsp-smart-contracts/blob/develop/${contractPath}`;
};

const generateContractSpecsDetails = (contractName: string) => {
  if (contractName === 'UniversalProfile') {
    return {
      specsName: `${contractName}`,
      specsLink: `${linkBase}lips/tree/main/LSPs/LSP-3-UniversalProfile-Metadata.md`,
    };
  }

  if (contractName === 'ERC725') {
    return {
      specsName: 'ERC-725',
      specsLink: 'https://github.com/ethereum/EIPs/blob/master/EIPS/eip-725.md',
    };
  }

  const contractPath = dodocConfig.include.filter((value) => {
    if (value.endsWith(`${contractName}.sol`)) return value;
  })[0];

  // token contracts have preset and extension folders.
  if (
    contractPath.startsWith('@lukso/lsp7-contracts/contracts') ||
    contractPath.startsWith('@lukso/lsp8-contracts/contracts')
  ) {
    const lspNumber = contractPath[3];
    const lspName = lspNumber === '8' ? 'IdentifiableDigitalAsset' : 'DigitalAsset';
    const specsName = `LSP-${lspNumber}-${lspName}`;

    return {
      specsName: specsName,
      specsLink: `${linkBase}lips/tree/main/LSPs/${specsName}.md`,
    };
  }

  const specsIndex = contractPath.startsWith('lsp') ? 2 : 1;
  const specs = contractPath.split('/')[specsIndex];

  const lspNumber = specs.match(/\d+/)[0];
  const lspName = specs.split(/LSP\d+/)[1];

  const specsName = `LSP-${lspNumber}-${lspName}`;
  const specsLink = `${linkBase}lips/tree/main/LSPs/LSP-${lspNumber}-${lspName}.md`;

  return { specsName, specsLink };
};

const formatDisplayedCode = (textToFormat: string) => {
  let formatedText = textToFormat;
  while (formatedText.includes('&gt;')) {
    formatedText = formatedText.replace('&gt;', '<');
  }

  return formatedText;
};

const formatParamDescription = (textToFormat: string) => {
  if (!textToFormat) return '-';

  let formatedText = textToFormat;
  while (formatedText.includes('&lt;')) {
    formatedText = formatedText.replace('&lt;', '<');
  }
  while (formatedText.includes('&gt;')) {
    formatedText = formatedText.replace('&gt;', '<');
  }

  return createLocalLinks(formatedText);
};

const formatParamType = (textToFormat: string) => {
  if (!textToFormat) return '';

  let formatedText = textToFormat;
  while (formatedText.includes('&gt;')) {
    formatedText = formatedText.replace('&gt;', '<');
  }

  return formatedText;
};

const formatCustomTags = (textToFormat: string) => {
  return createLocalLinks(textToFormat.replaceAll(' - ', '\n- ').trim());
};
