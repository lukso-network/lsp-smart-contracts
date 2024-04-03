import { keccak256, toUtf8Bytes } from 'ethers';
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
    '@lukso/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol',
    '@lukso/lsp23-contracts/contracts/IPostDeploymentModule.sol',
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
const SPECS_BASE_URL = 'https://github.com/lukso-network/LIPs/blob/main/LSPs';
const CONTRACTS_BASE_URL =
  'https://github.com/lukso-network/lsp-smart-contracts/tree/develop/packages';

const specs = {
  ERC725: {
    specsName: 'ERC-725',
    specsLink: 'https://github.com/ethereum/EIPs/blob/master/EIPS/eip-725.md',
    contractsLink:
      'https://github.com/ERC725Alliance/ERC725/blob/main/implementations/contracts/ERC725.sol',
  },
  UniversalProfile: {
    specsName: 'UniversalProfile',
    specsLink: `${SPECS_BASE_URL}/LSP-3-UniversalProfile-Metadata.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/universalprofile-contracts/contracts/UniversalProfile.sol`,
  },
  LSP0ERC725Account: {
    specsName: 'LSP-0-ERC725Account',
    specsLink: `${SPECS_BASE_URL}/LSP-0-ERC725Account.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp0-contracts/contracts/LSP0ERC725Account.sol`,
  },
  LSP1UniversalReceiver: {
    specsName: 'LSP-1-UniversalReceiver',
    specsLink: `${SPECS_BASE_URL}/LSP-1-UniversalReceiver.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol`,
  },
  LSP2ERC725YJSONSchema: {
    specsName: 'LSP-2-ERC725YJSONSchema',
    specsLink: `${SPECS_BASE_URL}/LSP-2-ERC725YJSONSchema.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp2-contracts/contracts/LSP2Utils.sol`,
  },
  LSP4DigitalAssetMetadata: {
    specsName: 'LSP-4-DigitalAsset-Metadata',
    specsLink: `${SPECS_BASE_URL}/LSP-4-DigitalAsset-Metadata.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp4-contracts/contracts/LSP4DigitalAssetMetadata.sol`,
  },
  LSP5ReceivedAssets: {
    specsName: 'LSP-5-ReceivedAssets',
    specsLink: `${SPECS_BASE_URL}/LSP-5-ReceivedAssets.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp5-contracts/contracts/LSP5Utils.sol`,
  },
  LSP6KeyManager: {
    specsName: 'LSP-6-KeyManager',
    specsLink: `${SPECS_BASE_URL}/LSP-6-KeyManager.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp6-contracts/contracts/LSP6KeyManager.sol`,
  },
  LSP7DigitalAsset: {
    specsName: 'LSP-7-DigitalAsset',
    specsLink: `${SPECS_BASE_URL}/LSP-7-DigitalAsset.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp7-contracts/contracts/LSP7DigitalAsset.sol`,
  },
  LSP8IdentifiableDigitalAsset: {
    specsName: 'LSP-8-IdentifiableDigitalAsset',
    specsLink: `${SPECS_BASE_URL}/LSP-8-IdentifiableDigitalAsset.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol`,
  },
  LSP9Vault: {
    specsName: 'LSP-9-Vault',
    specsLink: `${SPECS_BASE_URL}/LSP-9-Vault.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp9-contracts/contracts/LSP9Vault.sol`,
  },
  LSP10ReceivedVaults: {
    specsName: 'LSP-10-ReceivedVaults',
    specsLink: `${SPECS_BASE_URL}/LSP-10-ReceivedVaults.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp10-contracts/contracts/LSP10Utils.sol`,
  },
  LSP11BasicSocialRecovery: {
    specsName: 'LSP-11-BasicSocialRecovery',
    specsLink: `${SPECS_BASE_URL}/LSP-11-BasicSocialRecovery.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp-smart-contracts/contracts/LSP11BasicSocialRecovery/LSP11BasicSocialRecovery.sol`,
  },
  LSP14Ownable2Step: {
    specsName: 'LSP-14-Ownable2Step',
    specsLink: `${SPECS_BASE_URL}/LSP-14-Ownable2Step.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp14-contracts/contracts/LSP14Ownable2Step.sol`,
  },
  LSP16UniversalFactory: {
    specsName: 'LSP-16-UniversalFactory',
    specsLink: `${SPECS_BASE_URL}/LSP-16-UniversalFactory.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp16-contracts/contracts/LSP16UniversalFactory.sol`,
  },
  LSP17ContractExtension: {
    specsName: 'LSP-17-ContractExtension',
    specsLink: `${SPECS_BASE_URL}/LSP-17-ContractExtension.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp17contractextension-contracts/contracts/LSP17Extendable.sol`,
  },
  LSP20CallVerification: {
    specsName: 'LSP-20-CallVerification',
    specsLink: `${SPECS_BASE_URL}/LSP-20-CallVerification.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp20-contracts/contracts/LSP20CallVerification.sol`,
  },
  LSP23LinkedContractsFactory: {
    specsName: 'LSP-23-LinkedContractsFactory',
    specsLink: `${SPECS_BASE_URL}/LSP-23-LinkedContractsFactory.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol`,
  },
  LSP25ExecuteRelayCall: {
    specsName: 'LSP-25-ExecuteRelayCall',
    specsLink: `${SPECS_BASE_URL}/LSP-25-ExecuteRelayCall.md`,
    contractsLink: `${CONTRACTS_BASE_URL}/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol`,
  },
};

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
      `- Function selector: \`${keccak256(toUtf8Bytes(formatedCode)).substring(0, 10)}\``;
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
    `- Event topic hash: \`${keccak256(toUtf8Bytes(formatedCode))}\``
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
    `- Error hash: \`${keccak256(toUtf8Bytes(formatedCode)).substring(0, 10)}\``
  );
};

const generateContractLink = (contractName: string) => {
  const lspN = contractName.match(/LSP\d+/);

  if (specs[contractName]) {
    return specs[contractName].contractsLink;
  } else if (lspN && lspN[0] === 'LSP1') {
    return specs['LSP1UniversalReceiver'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP2') {
    return specs['LSP2ERC725YJSONSchema'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP5') {
    return specs['LSP5ReceivedAssets'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP6') {
    return specs['LSP6KeyManager'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP7') {
    return specs['LSP7DigitalAsset'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP8') {
    return specs['LSP8IdentifiableDigitalAsset'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP10') {
    return specs['LSP10ReceivedVaults'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP16') {
    return specs['LSP16UniversalFactory'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP17') {
    return specs['LSP17ContractExtension'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP23') {
    return specs['LSP23LinkedContractsFactory'].contractsLink;
  } else if (lspN && lspN[0] === 'LSP25') {
    return specs['LSP25ExecuteRelayCall'].contractsLink;
  } else if (contractName === 'IPostDeploymentModule') {
    return specs['LSP23LinkedContractsFactory'].contractsLink;
  } else {
    console.error(`Specs for '${contractName}' not found.`);
  }
};

const generateContractSpecsDetails = (contractName: string) => {
  const lspN = contractName.match(/LSP\d+/);

  if (specs[contractName]) {
    return specs[contractName];
  } else if (lspN && lspN[0] === 'LSP1') {
    return specs['LSP1UniversalReceiver'];
  } else if (lspN && lspN[0] === 'LSP2') {
    return specs['LSP2ERC725YJSONSchema'];
  } else if (lspN && lspN[0] === 'LSP5') {
    return specs['LSP5ReceivedAssets'];
  } else if (lspN && lspN[0] === 'LSP6') {
    return specs['LSP6KeyManager'];
  } else if (lspN && lspN[0] === 'LSP7') {
    return specs['LSP7DigitalAsset'];
  } else if (lspN && lspN[0] === 'LSP8') {
    return specs['LSP8IdentifiableDigitalAsset'];
  } else if (lspN && lspN[0] === 'LSP10') {
    return specs['LSP10ReceivedVaults'];
  } else if (lspN && lspN[0] === 'LSP16') {
    return specs['LSP16UniversalFactory'];
  } else if (lspN && lspN[0] === 'LSP17') {
    return specs['LSP17ContractExtension'];
  } else if (lspN && lspN[0] === 'LSP23') {
    return specs['LSP23LinkedContractsFactory'];
  } else if (lspN && lspN[0] === 'LSP25') {
    return specs['LSP25ExecuteRelayCall'];
  } else if (contractName === 'IPostDeploymentModule') {
    return specs['LSP23LinkedContractsFactory'];
  } else {
    console.error(`Specs for '${contractName}' not found.`);
  }
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
