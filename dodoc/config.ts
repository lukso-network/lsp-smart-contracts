import { ethers } from 'ethers';
import { HelperContent } from 'squirrelly/dist/types/containers';

export const dodocConfig = {
  runOnCompile: false,
  include: [
    'contracts/UniversalProfile.sol',
    'contracts/LSP0ERC725Account/LSP0ERC725Account.sol',
    'contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateUP/LSP1UniversalReceiverDelegateUP.sol',
    'contracts/LSP1UniversalReceiver/LSP1UniversalReceiverDelegateVault/LSP1UniversalReceiverDelegateVault.sol',
    'contracts/LSP6KeyManager/LSP6KeyManager.sol',
    'contracts/LSP9Vault/LSP9Vault.sol',
    'contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol',
    'contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol',
    'contracts/LSP16UniversalFactory/LSP16UniversalFactory.sol',
    'contracts/LSP17ContractExtension/LSP17Extendable.sol',
    'contracts/LSP17ContractExtension/LSP17Extension.sol',
    'contracts/LSP17Extensions/Extension4337.sol',
    'contracts/LSP17Extensions/OnERC721ReceivedExtension.sol',
    'contracts/LSP20CallVerification/LSP20CallVerification.sol',
    'contracts/LSP23LinkedContractsFactory/LSP23LinkedContractsFactory.sol',
    'contracts/LSP23LinkedContractsFactory/IPostDeploymentModule.sol',
    'contracts/LSP25ExecuteRelayCall/LSP25MultiChannelNonce.sol',

    // tokens
    'contracts/LSP4DigitalAssetMetadata/LSP4DigitalAssetMetadata.sol',
    'contracts/LSP7DigitalAsset/LSP7DigitalAsset.sol',
    'contracts/LSP7DigitalAsset/extensions/LSP7Burnable.sol',
    'contracts/LSP7DigitalAsset/extensions/LSP7CappedSupply.sol',
    'contracts/LSP7DigitalAsset/extensions/LSP7CompatibleERC20.sol',
    'contracts/LSP7DigitalAsset/presets/LSP7CompatibleERC20Mintable.sol',
    'contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol',
    'contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol',
    'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Burnable.sol',
    'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CappedSupply.sol',
    'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8CompatibleERC721.sol',
    'contracts/LSP8IdentifiableDigitalAsset/extensions/LSP8Enumerable.sol',
    'contracts/LSP8IdentifiableDigitalAsset/presets/LSP8CompatibleERC721Mintable.sol',
    'contracts/LSP8IdentifiableDigitalAsset/presets/LSP8Mintable.sol',

    // libraries --------------------
    'contracts/LSP1UniversalReceiver/LSP1Utils.sol',
    'contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol',
    'contracts/LSP5ReceivedAssets/LSP5Utils.sol',
    'contracts/LSP6KeyManager/LSP6Utils.sol',
    'contracts/LSP10ReceivedVaults/LSP10Utils.sol',
    'contracts/LSP17ContractExtension/LSP17Utils.sol',

    // external --------------------
    '@erc725/smart-contracts/contracts/ERC725.sol',
  ],
  libraries: [
    'contracts/LSP1UniversalReceiver/LSP1Utils.sol',
    'contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol',
    'contracts/LSP5ReceivedAssets/LSP5Utils.sol',
    'contracts/LSP6KeyManager/LSP6Utils.sol',
    'contracts/LSP10ReceivedVaults/LSP10Utils.sol',
    'contracts/LSP17ContractExtension/LSP17Utils.sol',
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

  const specs = contractPath.split('/')[1];

  const specsName = `LSP-${specs.match(/\d+/)[0]}-${specs.split(/LSP\d+/)[1]}`;

  const specsLink = `${linkBase}lips/tree/main/LSPs/LSP-${specs.match(/\d+/)[0]}-${
    specs.split(/LSP\d+/)[1]
  }.md`;

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
