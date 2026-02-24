import type {
  ContractNatSpec,
  DevDoc,
  UserDoc,
  AbiItem,
  AbiParam,
  InternalMethod,
} from '../extractor/types.js';

// ─── Specs / Links Configuration ────────────────────────────────────────
// Mirrors dodoc/config.ts specs and link generation

const linkBase = 'https://github.com/lukso-network';
const SPECS_BASE_URL = `${linkBase}/LIPs/blob/main/LSPs`;
const CONTRACTS_BASE_URL = `${linkBase}/lsp-smart-contracts/tree/develop/packages`;

interface SpecsEntry {
  specsName: string;
  specsLink: string;
}

const specs: Record<string, SpecsEntry> = {
  ERC725: {
    specsName: 'ERC-725',
    specsLink: 'https://github.com/ethereum/EIPs/blob/master/EIPS/eip-725.md',
  },
  UniversalProfile: {
    specsName: 'UniversalProfile',
    specsLink: `${SPECS_BASE_URL}/LSP-3-UniversalProfile-Metadata.md`,
  },
  LSP0ERC725Account: {
    specsName: 'LSP-0-ERC725Account',
    specsLink: `${SPECS_BASE_URL}/LSP-0-ERC725Account.md`,
  },
  LSP1UniversalReceiver: {
    specsName: 'LSP-1-UniversalReceiver',
    specsLink: `${SPECS_BASE_URL}/LSP-1-UniversalReceiver.md`,
  },
  LSP2ERC725YJSONSchema: {
    specsName: 'LSP-2-ERC725YJSONSchema',
    specsLink: `${SPECS_BASE_URL}/LSP-2-ERC725YJSONSchema.md`,
  },
  LSP4DigitalAssetMetadata: {
    specsName: 'LSP-4-DigitalAsset-Metadata',
    specsLink: `${SPECS_BASE_URL}/LSP-4-DigitalAsset-Metadata.md`,
  },
  LSP5ReceivedAssets: {
    specsName: 'LSP-5-ReceivedAssets',
    specsLink: `${SPECS_BASE_URL}/LSP-5-ReceivedAssets.md`,
  },
  LSP6KeyManager: {
    specsName: 'LSP-6-KeyManager',
    specsLink: `${SPECS_BASE_URL}/LSP-6-KeyManager.md`,
  },
  LSP7DigitalAsset: {
    specsName: 'LSP-7-DigitalAsset',
    specsLink: `${SPECS_BASE_URL}/LSP-7-DigitalAsset.md`,
  },
  LSP8IdentifiableDigitalAsset: {
    specsName: 'LSP-8-IdentifiableDigitalAsset',
    specsLink: `${SPECS_BASE_URL}/LSP-8-IdentifiableDigitalAsset.md`,
  },
  LSP9Vault: {
    specsName: 'LSP-9-Vault',
    specsLink: `${SPECS_BASE_URL}/LSP-9-Vault.md`,
  },
  LSP10ReceivedVaults: {
    specsName: 'LSP-10-ReceivedVaults',
    specsLink: `${SPECS_BASE_URL}/LSP-10-ReceivedVaults.md`,
  },
  LSP11BasicSocialRecovery: {
    specsName: 'LSP-11-BasicSocialRecovery',
    specsLink: `${SPECS_BASE_URL}/LSP-11-BasicSocialRecovery.md`,
  },
  LSP14Ownable2Step: {
    specsName: 'LSP-14-Ownable2Step',
    specsLink: `${SPECS_BASE_URL}/LSP-14-Ownable2Step.md`,
  },
  LSP16UniversalFactory: {
    specsName: 'LSP-16-UniversalFactory',
    specsLink: `${SPECS_BASE_URL}/LSP-16-UniversalFactory.md`,
  },
  LSP17ContractExtension: {
    specsName: 'LSP-17-ContractExtension',
    specsLink: `${SPECS_BASE_URL}/LSP-17-ContractExtension.md`,
  },
  LSP20CallVerification: {
    specsName: 'LSP-20-CallVerification',
    specsLink: `${SPECS_BASE_URL}/LSP-20-CallVerification.md`,
  },
  LSP23LinkedContractsFactory: {
    specsName: 'LSP-23-LinkedContractsFactory',
    specsLink: `${SPECS_BASE_URL}/LSP-23-LinkedContractsFactory.md`,
  },
  LSP25ExecuteRelayCall: {
    specsName: 'LSP-25-ExecuteRelayCall',
    specsLink: `${SPECS_BASE_URL}/LSP-25-ExecuteRelayCall.md`,
  },
  LSP26FollowerSystem: {
    specsName: 'LSP-26-FollowerSystem',
    specsLink: `${SPECS_BASE_URL}/LSP-26-FollowerSystem.md`,
  },
};

/**
 * Resolve specs entry for a contract name.
 * Matches by exact name first, then by LSP number prefix.
 */
function resolveSpecs(contractName: string): SpecsEntry | undefined {
  if (specs[contractName]) return specs[contractName];

  const lspN = contractName.match(/LSP\d+/);
  if (!lspN) {
    // Special cases
    if (contractName === 'IPostDeploymentModule') return specs['LSP23LinkedContractsFactory'];
    if (contractName.startsWith('UniversalProfile')) return specs['UniversalProfile'];
    if (contractName.startsWith('KeyManager')) return specs['LSP6KeyManager'];
    return undefined;
  }

  const n = lspN[0];
  const mapping: Record<string, string> = {
    LSP0: 'LSP0ERC725Account',
    LSP1: 'LSP1UniversalReceiver',
    LSP2: 'LSP2ERC725YJSONSchema',
    LSP4: 'LSP4DigitalAssetMetadata',
    LSP5: 'LSP5ReceivedAssets',
    LSP6: 'LSP6KeyManager',
    LSP7: 'LSP7DigitalAsset',
    LSP8: 'LSP8IdentifiableDigitalAsset',
    LSP9: 'LSP9Vault',
    LSP10: 'LSP10ReceivedVaults',
    LSP11: 'LSP11BasicSocialRecovery',
    LSP14: 'LSP14Ownable2Step',
    LSP16: 'LSP16UniversalFactory',
    LSP17: 'LSP17ContractExtension',
    LSP20: 'LSP20CallVerification',
    LSP23: 'LSP23LinkedContractsFactory',
    LSP25: 'LSP25ExecuteRelayCall',
    LSP26: 'LSP26FollowerSystem',
  };

  const specKey = mapping[n];
  return specKey ? specs[specKey] : undefined;
}

/**
 * Resolve the full GitHub URL for a contract's Solidity source file.
 * Uses the contract's sourcePath (e.g. "contracts/LSP7DigitalAsset.sol")
 * to build the real link, avoiding mismatches.
 */
function resolveContractLink(contractName: string, sourcePath: string): string {
  // sourcePath looks like "contracts/LSP7DigitalAsset.sol"
  // We need to derive the package from it.

  // Try to infer the package from sourcePath
  // The Hardhat v3 source paths for project files are just "contracts/..."
  // We need to map the contract name to its package.

  // First, try to determine the package from well-known patterns
  const packageName = resolvePackageName(contractName);
  if (packageName) {
    const fileName = sourcePath.split('/').pop() ?? `${contractName}.sol`;
    return `${CONTRACTS_BASE_URL}/${packageName}/${sourcePath.startsWith('contracts/') ? sourcePath : 'contracts/' + fileName}`;
  }

  return '';
}

/**
 * Map a contract name to its npm package directory name.
 */
function resolvePackageName(contractName: string): string | undefined {
  // Direct mappings for special contracts
  const directMappings: Record<string, string> = {
    UniversalProfile: 'universalprofile-contracts',
    UniversalProfileInit: 'universalprofile-contracts',
    UniversalProfileInitAbstract: 'universalprofile-contracts',
    UniversalProfilePostDeploymentModule: 'universalprofile-contracts',
    UniversalProfileInitPostDeploymentModule: 'universalprofile-contracts',
    Version: '', // Handled specially below
    IPostDeploymentModule: 'lsp23-contracts',
    KeyManagerWithExtraParams: 'lsp23-contracts',
    KeyManagerInitWithExtraParams: 'lsp23-contracts',
    ERC20MetadataCompatibilityExtension: 'lsp17contractextension-contracts',
    ERCTokenCallbacks: 'lsp17contractextension-contracts',
    Extension4337: 'lsp17contractextension-contracts',
    OnERC721ReceivedExtension: 'lsp17contractextension-contracts',
  };

  if (contractName in directMappings) {
    const pkg = directMappings[contractName];
    return pkg || undefined;
  }

  // LSP-number based mapping
  const lspMatch = contractName.match(/LSP(\d+)/);
  if (lspMatch) {
    const n = parseInt(lspMatch[1], 10);
    const lspPackages: Record<number, string> = {
      0: 'lsp0-contracts',
      1: 'lsp1-contracts',
      2: 'lsp2-contracts',
      4: 'lsp4-contracts',
      5: 'lsp5-contracts',
      6: 'lsp6-contracts',
      7: 'lsp7-contracts',
      8: 'lsp8-contracts',
      9: 'lsp9-contracts',
      10: 'lsp10-contracts',
      11: 'lsp11-contracts',
      14: 'lsp14-contracts',
      16: 'lsp16-contracts',
      17: 'lsp17contractextension-contracts',
      20: 'lsp20-contracts',
      23: 'lsp23-contracts',
      25: 'lsp25-contracts',
      26: 'lsp26-contracts',
    };
    return lspPackages[n];
  }

  return undefined;
}

/**
 * Get the display type for an ABI parameter.
 * Uses internalType when available (e.g. struct names), falls back to type.
 */
function getDisplayType(param: AbiParam): string {
  if (param.internalType) {
    return param.internalType;
  }
  return param.type;
}

/**
 * Get the display name for an ABI parameter.
 * Falls back to _0, _1, etc. when name is empty.
 */
function getDisplayName(param: AbiParam, index: number): string {
  return param.name || `_${index}`;
}

// ─── Main Export ────────────────────────────────────────────────────────

/**
 * Generate Markdown documentation for a single contract,
 * following the dodoc Squirrelly template output format.
 */
export function generateContractMarkdown(contract: ContractNatSpec): string {
  const lines: string[] = [];
  const { contractName, sourcePath, devdoc, userdoc, abi, internalMethods } = contract;

  // Auto-generated header
  lines.push('<!-- This file is auto-generated. Do not edit! -->');
  lines.push(
    '<!-- Check `@lukso-network/lsp-smart-contracts/CONTRIBUTING.md#solidity-code-comments` for more information. -->',
  );
  lines.push('');

  // Title
  lines.push('');
  lines.push(`# ${contractName}`);
  lines.push('');

  // Standard Specifications info box
  const specsEntry = resolveSpecs(contractName);
  if (specsEntry) {
    lines.push('');
    lines.push(':::info Standard Specifications');
    lines.push('');
    lines.push(`[\`${specsEntry.specsName}\`](${specsEntry.specsLink})`);
    lines.push('');
    lines.push(':::');
  }

  // Solidity implementation info box
  const contractLink = resolveContractLink(contractName, sourcePath);
  lines.push(':::info Solidity implementation');
  lines.push('');
  lines.push(`[\`${contractName}.sol\`](${contractLink})`);
  lines.push('');
  lines.push(':::');
  lines.push('');

  // Contract-level title (from @title)
  if (devdoc.title) {
    lines.push('');
    lines.push(`> ${formatTextWithLists(createLocalLinks(devdoc.title))}`);
    lines.push('');
  }

  // Contract-level notice (from @notice)
  if (userdoc.notice) {
    lines.push('');
    lines.push(`*${formatTextWithLists(formatLinks(createLocalLinks(userdoc.notice)))}*`);
    lines.push('');
  }

  // Contract-level details (from @dev)
  if (devdoc.details) {
    lines.push('');
    lines.push(formatTextWithLists(formatLinks(createLocalLinks(devdoc.details))));
    lines.push('');
  }

  // ── Public Methods ────────────────────────────────────────
  const publicFunctions = abi.filter(
    (item) =>
      item.type === 'function' ||
      item.type === 'constructor' ||
      item.type === 'fallback' ||
      item.type === 'receive',
  );

  if (publicFunctions.length > 0) {
    lines.push('');
    lines.push('');
    lines.push('## Public Methods');
    lines.push('');
    lines.push('');
    lines.push(
      'Public methods are accessible externally from users, allowing interaction with this function from dApps or other smart contracts.',
    );
    lines.push(
      "When marked as 'public', a method can be called both externally and internally, on the other hand, when marked as 'external', a method can only be called externally.",
    );
    lines.push('');
    lines.push('');

    // Special methods first (constructor, fallback, receive), then normal
    const special = publicFunctions.filter(
      (f) => f.type === 'constructor' || f.type === 'fallback' || f.type === 'receive',
    );
    const normal = publicFunctions.filter((f) => f.type === 'function');

    for (const func of [...special, ...normal]) {
      lines.push(...generateMethodSection(func, contractName, sourcePath, devdoc, userdoc));
      lines.push('');
    }
  }

  // ── Internal Methods ──────────────────────────────────────
  if (internalMethods && internalMethods.length > 0) {
    lines.push('');
    lines.push('');
    lines.push('## Internal Methods');
    lines.push('');
    lines.push(
      'Any method labeled as `internal` serves as utility function within the contract. They can be used when writing solidity contracts that inherit from this contract. These methods can be extended or modified by overriding their internal behavior to suit specific needs.',
    );
    lines.push('');
    lines.push(
      'Internal functions cannot be called externally, whether from other smart contracts, dApp interfaces, or backend services. Their restricted accessibility ensures that they remain exclusively available within the context of the current contract, promoting controlled and encapsulated usage of these internal utilities.',
    );
    lines.push('');
    lines.push('');

    for (const method of internalMethods) {
      lines.push(...generateInternalMethodSection(method, contractName));
      lines.push('');
    }
  }

  // ── Events ────────────────────────────────────────────────
  const events = abi.filter((item) => item.type === 'event');
  if (events.length > 0) {
    lines.push('## Events');
    lines.push('');
    lines.push('');
    for (const event of events) {
      lines.push(...generateEventSection(event, contractName, sourcePath, devdoc, userdoc));
      lines.push('');
    }
  }

  // ── Errors ────────────────────────────────────────────────
  const errors = abi.filter((item) => item.type === 'error');
  if (errors.length > 0) {
    lines.push('## Errors');
    lines.push('');
    lines.push('');
    for (const error of errors) {
      lines.push(...generateErrorSection(error, contractName, sourcePath, devdoc, userdoc));
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Build the canonical selector-style signature for devdoc/userdoc key lookup.
 * Uses canonical ABI types with tuples expanded to their component types.
 * e.g. "getData(bytes32)" or "deployContracts((bytes32,uint256,bytes),(uint256,bytes,bool,bytes),address,bytes)"
 *
 * The Solidity compiler's devdoc/userdoc keys use this canonical expanded form,
 * NOT raw "tuple" types. So we must expand tuples for correct lookup.
 */
function getSelectorSignature(item: AbiItem): string {
  const name =
    item.type === 'constructor'
      ? 'constructor'
      : item.type === 'fallback'
        ? 'fallback'
        : item.type === 'receive'
          ? 'receive'
          : (item.name ?? '');
  const params = (item.inputs ?? []).map((p) => getCanonicalType(p)).join(',');
  return `${name}(${params})`;
}

/**
 * Build a display-friendly signature using internalType when available.
 * e.g. "deployContracts(ILSP23LinkedContractsFactory.PrimaryContractDeployment,...)"
 * This is used for display only, not for selector hashing.
 */
function getDisplaySignature(item: AbiItem): string {
  const name =
    item.type === 'constructor'
      ? 'constructor'
      : item.type === 'fallback'
        ? 'fallback'
        : item.type === 'receive'
          ? 'receive'
          : (item.name ?? '');
  const params = (item.inputs ?? []).map((p) => getSignatureDisplayType(p)).join(',');
  return `${name}(${params})`;
}

/**
 * Build the canonical ABI signature for keccak256 selector computation.
 * For tuple types, expands to the component types in parentheses.
 * e.g. "(bytes32,uint256,bytes)" instead of "tuple"
 *
 * This is identical to getSelectorSignature since the Solidity compiler
 * uses the same canonical form for both devdoc keys and selector computation.
 */
function getCanonicalSignature(item: AbiItem): string {
  return getSelectorSignature(item);
}

/**
 * Get the canonical ABI type for selector hashing.
 * Expands tuple types to their component types.
 */
function getCanonicalType(param: AbiParam): string {
  if (param.type === 'tuple' && param.components) {
    const inner = param.components.map((c) => getCanonicalType(c)).join(',');
    return `(${inner})`;
  }
  if (param.type === 'tuple[]' && param.components) {
    const inner = param.components.map((c) => getCanonicalType(c)).join(',');
    return `(${inner})[]`;
  }
  return param.type;
}

/**
 * Get the type string for use in display signatures.
 * For struct types, extracts just the struct name from internalType.
 */
function getSignatureDisplayType(param: AbiParam): string {
  if (param.internalType && param.internalType.startsWith('struct ')) {
    // "struct ILSP23LinkedContractsFactory.PrimaryContractDeployment"
    // → "ILSP23LinkedContractsFactory.PrimaryContractDeployment"
    return param.internalType.replace('struct ', '');
  }
  return param.type;
}

/**
 * Build a human-readable code string for the solidity code block.
 * Now includes visibility (external/public) and nonpayable, matching dodoc.
 */
function buildCodeBlock(item: AbiItem): string[] {
  const lines: string[] = [];
  const inputs = item.inputs ?? [];
  const outputs = (item as any).outputs ?? [];

  // Use internalType for display when available (struct names etc.)
  const displayInputs = inputs.map((p: AbiParam, i: number) => ({
    type: getDisplayType(p),
    name: getDisplayName(p, i),
    indexed: p.indexed,
  }));
  const displayOutputs = outputs.map((p: AbiParam, i: number) => ({
    type: getDisplayType(p),
    name: p.name || '',
  }));

  if (item.type === 'constructor') {
    if (displayInputs.length <= 2) {
      const paramsStr = displayInputs.map((p: any) => `${p.type} ${p.name}`).join(', ');
      lines.push(`constructor(${paramsStr})`);
    } else {
      lines.push('constructor(');
      displayInputs.forEach((p: any, i: number) => {
        const comma = i < displayInputs.length - 1 ? ',' : '';
        lines.push(`  ${p.type} ${p.name}${comma}`);
      });
      lines.push(')');
    }
  } else if (item.type === 'fallback') {
    lines.push('fallback(bytes calldata callData) external payable returns (bytes memory)');
  } else if (item.type === 'receive') {
    lines.push('receive() external payable');
  } else if (item.type === 'function') {
    const mutability = item.stateMutability ?? 'nonpayable';
    const visibility = (item as any).visibility ?? 'external';
    const modifiers = [visibility, mutability].filter(Boolean);
    const modStr = modifiers.join(' ');
    const returnsStr =
      displayOutputs.length > 0
        ? `returns (${displayOutputs.map((p: any) => `${p.type}${p.name ? ' ' + p.name : ''}`).join(', ')})`
        : '';

    // Build the full single-line version first
    const paramsStr = displayInputs.map((p: any) => `${p.type} ${p.name}`).join(', ');
    const singleLine = `function ${item.name}(${paramsStr}) ${modStr}${returnsStr ? ' ' + returnsStr : ''}`;

    if (singleLine.length <= 80 && displayInputs.length <= 2) {
      // Short enough for single line
      lines.push(singleLine.trimEnd());
    } else {
      // Multi-line format
      if (displayInputs.length <= 2) {
        lines.push(`function ${item.name}(${paramsStr})`);
      } else {
        lines.push(`function ${item.name}(`);
        displayInputs.forEach((p: any, i: number) => {
          const comma = i < displayInputs.length - 1 ? ',' : '';
          lines.push(`  ${p.type} ${p.name}${comma}`);
        });
        lines.push(')');
      }
      lines.push(`  ${modStr}`);
      if (returnsStr) {
        lines.push(`  ${returnsStr}`);
      }
    }
  } else if (item.type === 'event') {
    if (displayInputs.length <= 2) {
      const paramsStr = displayInputs
        .map((p: any) => `${p.type}${p.indexed ? ' indexed' : ''} ${p.name}`)
        .join(', ');
      lines.push(`event ${item.name}(${paramsStr})`);
    } else {
      lines.push(`event ${item.name}(`);
      displayInputs.forEach((p: any, i: number) => {
        const comma = i < displayInputs.length - 1 ? ',' : '';
        lines.push(`  ${p.type}${p.indexed ? ' indexed' : ''} ${p.name}${comma}`);
      });
      lines.push(')');
    }
  } else if (item.type === 'error') {
    if (displayInputs.length === 0) {
      lines.push(`error ${item.name}()`);
    } else if (displayInputs.length <= 2) {
      const paramsStr = displayInputs.map((p: any) => `${p.type} ${p.name}`).join(', ');
      lines.push(`error ${item.name}(${paramsStr})`);
    } else {
      lines.push(`error ${item.name}(`);
      displayInputs.forEach((p: any, i: number) => {
        const comma = i < displayInputs.length - 1 ? ',' : '';
        lines.push(`  ${p.type} ${p.name}${comma}`);
      });
      lines.push(')');
    }
  }
  // Add semicolon to the last line, matching dodoc template
  if (lines.length > 0) {
    lines[lines.length - 1] += ';';
  }
  return lines;
}

/**
 * Compute keccak256 of a string using a pure JS implementation.
 * Avoids ethers dependency — we only need this one operation.
 */
function keccak256(message: string): string {
  const data = new TextEncoder().encode(message);
  return '0x' + sha3_256(data);
}

// ─── Minimal Keccak-256 (SHA-3) implementation ──────────────────────
// Ported from the reference spec — no dependencies needed.

const RC = [
  0x0000000000000001n,
  0x0000000000008082n,
  0x800000000000808an,
  0x8000000080008000n,
  0x000000000000808bn,
  0x0000000080000001n,
  0x8000000080008081n,
  0x8000000000008009n,
  0x000000000000008an,
  0x0000000000000088n,
  0x0000000080008009n,
  0x000000008000000an,
  0x000000008000808bn,
  0x800000000000008bn,
  0x8000000000008089n,
  0x8000000000008003n,
  0x8000000000008002n,
  0x8000000000000080n,
  0x000000000000800an,
  0x800000008000000an,
  0x8000000080008081n,
  0x8000000000008080n,
  0x0000000080000001n,
  0x8000000080008008n,
];

const ROTC = [
  1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 2, 14, 27, 41, 56, 8, 25, 43, 62, 18, 39, 61, 20, 44,
];

const PI = [10, 7, 11, 17, 18, 3, 5, 16, 8, 21, 24, 4, 15, 23, 19, 13, 12, 2, 20, 14, 22, 9, 6, 1];

function keccakF(state: bigint[]): void {
  for (let round = 0; round < 24; round++) {
    // θ
    const C: bigint[] = [];
    for (let x = 0; x < 5; x++) {
      C[x] = state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20];
    }
    for (let x = 0; x < 5; x++) {
      const t = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1);
      for (let y = 0; y < 25; y += 5) state[x + y] ^= t;
    }
    // ρ and π
    let last = state[1];
    for (let i = 0; i < 24; i++) {
      const j = PI[i];
      const temp = state[j];
      state[j] = rotl64(last, ROTC[i]);
      last = temp;
    }
    // χ
    for (let y = 0; y < 25; y += 5) {
      const t: bigint[] = [];
      for (let x = 0; x < 5; x++) t[x] = state[y + x];
      for (let x = 0; x < 5; x++) state[y + x] = t[x] ^ (~t[(x + 1) % 5] & t[(x + 2) % 5]);
    }
    // ι
    state[0] ^= RC[round];
  }
}

function rotl64(x: bigint, n: number): bigint {
  return ((x << BigInt(n)) | (x >> BigInt(64 - n))) & 0xffffffffffffffffn;
}

function sha3_256(input: Uint8Array): string {
  const rate = 136; // (1600 - 256*2) / 8
  // Pad: append 0x01, zero-fill, set last byte |= 0x80
  const padLen = rate - (input.length % rate);
  const padded = new Uint8Array(input.length + padLen);
  padded.set(input);
  padded[input.length] = 0x01;
  padded[padded.length - 1] |= 0x80;

  const state: bigint[] = new Array(25).fill(0n);

  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let i = 0; i < rate; i += 8) {
      const lane = i >> 3;
      let v = 0n;
      for (let b = 0; b < 8; b++) v |= BigInt(padded[offset + i + b]) << BigInt(8 * b);
      state[lane] ^= v;
    }
    keccakF(state);
  }

  // Squeeze 32 bytes
  let hex = '';
  for (let i = 0; i < 4; i++) {
    const lane = state[i];
    for (let b = 0; b < 8; b++) {
      hex += ((lane >> BigInt(8 * b)) & 0xffn).toString(16).padStart(2, '0');
    }
  }
  return hex;
}

// ─── Section generators ──────────────────────────────────────────────

function generateMethodSection(
  func: AbiItem,
  contractName: string,
  sourcePath: string,
  devdoc: DevDoc,
  userdoc: UserDoc,
): string[] {
  const lines: string[] = [];
  const sig = getSelectorSignature(func);

  // For constructor/fallback/receive, solc uses the bare name as devdoc key
  // (e.g. "constructor" not "constructor(address)"). Try bare name first.
  const bareName =
    func.type === 'constructor'
      ? 'constructor'
      : func.type === 'fallback'
        ? 'fallback'
        : func.type === 'receive'
          ? 'receive'
          : '';
  const methodDev: Record<string, any> =
    (bareName ? devdoc.methods?.[bareName] : undefined) ?? devdoc.methods?.[sig] ?? {};
  const methodUser: Record<string, any> =
    (bareName ? userdoc.methods?.[bareName] : undefined) ?? userdoc.methods?.[sig] ?? {};
  const inputs = func.inputs ?? [];
  const outputs = (func as any).outputs ?? [];

  // Heading
  const heading =
    func.type === 'constructor'
      ? 'constructor'
      : func.type === 'fallback'
        ? 'fallback'
        : func.type === 'receive'
          ? 'receive'
          : (func.name ?? '');
  lines.push(`### ${heading}`);
  lines.push('');

  // :::note References
  // Use internalType-aware signature for display, but ABI type for selector
  const displaySig = getDisplaySignature(func);
  const selectorSig = getSelectorSignature(func);
  const specsEntry = resolveSpecs(contractName);
  const contractLink = resolveContractLink(contractName, sourcePath);

  lines.push(':::note References');
  lines.push('');
  if (specsEntry) {
    lines.push(
      `- Specification details: [**${specsEntry.specsName}**](${specsEntry.specsLink}#${heading.toLowerCase()})`,
    );
  }
  lines.push(`- Solidity implementation: [\`${contractName}.sol\`](${contractLink})`);
  if (func.type === 'function') {
    const canonicalSig = getCanonicalSignature(func);
    lines.push(`- Function signature: \`${displaySig}\``);
    lines.push(`- Function selector: \`${keccak256(canonicalSig).substring(0, 10)}\``);
  }
  lines.push('');
  lines.push(':::');
  lines.push('');

  // Custom tag admonitions
  for (const [admonition, label] of [
    ['custom:info', ':::info'],
    ['custom:hint', ':::tip Hint'],
    ['custom:warning', ':::caution Warning'],
    ['custom:danger', ':::danger'],
  ] as const) {
    if (methodDev[admonition]) {
      lines.push('');
      lines.push(label);
      lines.push('');
      lines.push(formatCustomTag(methodDev[admonition]));
      lines.push('');
      lines.push(':::');
      lines.push('');
    }
  }

  // Code block
  lines.push('');
  lines.push('```solidity');
  lines.push(...buildCodeBlock(func));
  lines.push('```');
  lines.push('');

  // Notice
  if (methodUser.notice) {
    lines.push('');
    lines.push(`*${formatTextWithLists(formatLinks(createLocalLinks(methodUser.notice)))}*`);
    lines.push('');
  }

  // Details
  if (methodDev.details) {
    lines.push('');
    lines.push(formatTextWithLists(formatLinks(createLocalLinks(methodDev.details))));
    lines.push('');
  }

  // For state variables, check stateVariables devdoc for details
  if (!methodDev.details && func.name && devdoc.stateVariables?.[func.name]?.details) {
    lines.push('');
    lines.push(
      formatTextWithLists(formatLinks(createLocalLinks(devdoc.stateVariables[func.name].details!))),
    );
    lines.push('');
  }

  // custom:requirements
  if (methodDev['custom:requirements']) {
    lines.push('<blockquote>');
    lines.push('');
    lines.push(
      formatBulletPoints(createLocalLinks(methodDev['custom:requirements']), 'Requirements:'),
    );
    lines.push('');
    lines.push('</blockquote>');
    lines.push('');
  }

  // custom:events
  if (methodDev['custom:events']) {
    lines.push('<blockquote>');
    lines.push('');
    lines.push(formatBulletPoints(createLocalLinks(methodDev['custom:events']), 'Emitted events:'));
    lines.push('');
    lines.push('</blockquote>');
    lines.push('');
  }

  // Parameters
  if (inputs.length > 0) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|---|:-:|---|');
    for (let i = 0; i < inputs.length; i++) {
      const param = inputs[i];
      const paramName = getDisplayName(param, i);
      const desc = methodDev.params?.[param.name]
        ? formatParamDescription(createLocalLinks(methodDev.params[param.name]))
        : '-';
      lines.push(`| \`${paramName}\` | \`${formatParamType(getDisplayType(param))}\` | ${desc} |`);
    }
    lines.push('');
  }

  // Returns — also check stateVariables for descriptions
  if (outputs.length > 0) {
    lines.push('#### Returns');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|---|:-:|---|');
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      const name = output.name || `_${i}`;
      const displayName = name.startsWith('_') ? name.substring(1) : name;

      // Try method returns first, then state variable returns
      let desc: string =
        methodDev.returns?.[name] ??
        methodDev.returns?.[`_${i}`] ??
        methodDev.returns?.[`_${name}`] ??
        '';

      // If no method-level return doc, check stateVariables
      if (!desc && func.name && devdoc.stateVariables?.[func.name]) {
        const svDoc = devdoc.stateVariables[func.name];
        desc = svDoc.returns?.[`_${i}`] ?? svDoc.returns?.[name] ?? svDoc.return ?? '';
      }

      if (!desc) desc = '-';
      lines.push(
        `| \`${displayName}\` | \`${formatParamType(getDisplayType(output))}\` | ${typeof desc === 'string' ? formatParamDescription(createLocalLinks(desc)) : '-'} |`,
      );
    }
    lines.push('');
  }

  lines.push('<br/>');

  return lines;
}

/**
 * Generate a section for an internal method (from AST).
 */
function generateInternalMethodSection(method: InternalMethod, contractName: string): string[] {
  const lines: string[] = [];

  lines.push(`### ${method.name}`);
  lines.push('');

  // Custom tag admonitions
  for (const [admonition, label] of [
    ['custom:info', ':::info'],
    ['custom:hint', ':::tip Hint'],
    ['custom:warning', ':::caution Warning'],
    ['custom:danger', ':::danger'],
  ] as const) {
    if (method.customTags?.[admonition]) {
      lines.push('');
      lines.push(label);
      lines.push('');
      lines.push(formatCustomTag(method.customTags[admonition]));
      lines.push('');
      lines.push(':::');
      lines.push('');
    }
  }

  // Code block
  lines.push('');
  lines.push('```solidity');
  lines.push(method.code);
  lines.push('```');
  lines.push('');

  // Notice
  if (method.notice) {
    lines.push('');
    lines.push(`*${formatTextWithLists(formatLinks(createLocalLinks(method.notice)))}*`);
    lines.push('');
  }

  // Details
  if (method.details) {
    lines.push('');
    lines.push(formatTextWithLists(formatLinks(createLocalLinks(method.details))));
    lines.push('');
  }

  // custom:requirements
  if (method.customTags?.['custom:requirements']) {
    lines.push('<blockquote>');
    lines.push('');
    lines.push(
      formatBulletPoints(
        createLocalLinks(method.customTags['custom:requirements']),
        'Requirements:',
      ),
    );
    lines.push('');
    lines.push('</blockquote>');
    lines.push('');
  }

  // custom:events
  if (method.customTags?.['custom:events']) {
    lines.push('<blockquote>');
    lines.push('');
    lines.push(
      formatBulletPoints(createLocalLinks(method.customTags['custom:events']), 'Emitted events:'),
    );
    lines.push('');
    lines.push('</blockquote>');
    lines.push('');
  }

  // Parameters
  if (method.params && method.params.length > 0) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|---|:-:|---|');
    for (const param of method.params) {
      const desc = param.description
        ? formatParamDescription(createLocalLinks(param.description))
        : '-';
      lines.push(`| \`${param.name}\` | \`${formatParamType(param.type)}\` | ${desc} |`);
    }
    lines.push('');
  }

  // Returns
  if (method.returns && method.returns.length > 0) {
    lines.push('#### Returns');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|---|:-:|---|');
    for (const ret of method.returns) {
      const displayName = ret.name.startsWith('_') ? ret.name.substring(1) : ret.name;
      const desc = ret.description
        ? formatParamDescription(createLocalLinks(ret.description))
        : '-';
      lines.push(`| \`${displayName}\` | \`${formatParamType(ret.type)}\` | ${desc} |`);
    }
    lines.push('');
  }

  lines.push('<br/>');

  return lines;
}

function generateEventSection(
  event: AbiItem,
  contractName: string,
  sourcePath: string,
  devdoc: DevDoc,
  userdoc: UserDoc,
): string[] {
  const lines: string[] = [];
  const sig = getSelectorSignature(event);
  const eventDev = devdoc.events?.[sig] ?? {};
  const eventUser = userdoc.events?.[sig] ?? {};
  const inputs = event.inputs ?? [];

  lines.push(`### ${event.name}`);
  lines.push('');

  // :::note References
  const specsEntry = resolveSpecs(contractName);
  const contractLink = resolveContractLink(contractName, sourcePath);

  lines.push('');
  lines.push(':::note References');
  lines.push('');
  if (specsEntry) {
    lines.push(
      `- Specification details: [**${specsEntry.specsName}**](${specsEntry.specsLink}#${(event.name ?? '').toLowerCase()})`,
    );
  }
  const canonicalSig = getCanonicalSignature(event);
  const displaySig = getDisplaySignature(event);
  lines.push(`- Solidity implementation: [\`${contractName}.sol\`](${contractLink})`);
  lines.push(`- Event signature: \`${displaySig}\``);
  lines.push(`- Event topic hash: \`${keccak256(canonicalSig)}\``);
  lines.push('');
  lines.push(':::');
  lines.push('');

  // Code block
  lines.push('');
  lines.push('```solidity');
  lines.push(...buildCodeBlock(event));
  lines.push('```');
  lines.push('');

  // Notice
  if (eventUser.notice) {
    lines.push('');
    lines.push(`*${formatTextWithLists(formatLinks(createLocalLinks(eventUser.notice)))}*`);
    lines.push('');
  }

  // Details
  if (eventDev.details) {
    lines.push('');
    lines.push(formatTextWithLists(formatLinks(createLocalLinks(eventDev.details))));
    lines.push('');
  }

  // Parameters (indexed shown in Name column like dodoc)
  if (inputs.length > 0) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|---|:-:|---|');
    for (let i = 0; i < inputs.length; i++) {
      const param = inputs[i];
      const paramName = getDisplayName(param, i);
      const desc = eventDev.params?.[param.name]
        ? formatParamDescription(createLocalLinks(eventDev.params[param.name]))
        : '-';
      const indexedLabel = param.indexed ? ' **`indexed`**' : '';
      lines.push(
        `| \`${paramName}\`${indexedLabel} | \`${formatParamType(getDisplayType(param))}\` | ${desc} |`,
      );
    }
    lines.push('');
  }

  lines.push('<br/>');

  return lines;
}

function generateErrorSection(
  error: AbiItem,
  contractName: string,
  sourcePath: string,
  devdoc: DevDoc,
  userdoc: UserDoc,
): string[] {
  const lines: string[] = [];
  const sig = getSelectorSignature(error);
  const errorDevRaw = devdoc.errors?.[sig];
  const errorUserRaw = userdoc.errors?.[sig];
  const errorDev: Record<string, any> =
    (Array.isArray(errorDevRaw) ? errorDevRaw[0] : errorDevRaw) ?? {};
  const errorUser: Record<string, any> =
    (Array.isArray(errorUserRaw) ? errorUserRaw[0] : errorUserRaw) ?? {};
  const inputs = error.inputs ?? [];

  lines.push(`### ${error.name}`);
  lines.push('');

  // :::note References
  const specsEntry = resolveSpecs(contractName);
  const contractLink = resolveContractLink(contractName, sourcePath);

  lines.push('');
  lines.push(':::note References');
  lines.push('');
  if (specsEntry) {
    lines.push(
      `- Specification details: [**${specsEntry.specsName}**](${specsEntry.specsLink}#${(error.name ?? '').toLowerCase()})`,
    );
  }
  const canonicalSig = getCanonicalSignature(error);
  const displaySig = getDisplaySignature(error);
  lines.push(`- Solidity implementation: [\`${contractName}.sol\`](${contractLink})`);
  lines.push(`- Error signature: \`${displaySig}\``);
  lines.push(`- Error hash: \`${keccak256(canonicalSig).substring(0, 10)}\``);
  lines.push('');
  lines.push(':::');
  lines.push('');

  // Code block
  lines.push('');
  lines.push('```solidity');
  lines.push(...buildCodeBlock(error));
  lines.push('```');
  lines.push('');

  // Notice
  if (errorUser.notice) {
    lines.push('');
    lines.push(`*${formatTextWithLists(formatLinks(createLocalLinks(errorUser.notice)))}*`);
    lines.push('');
  }

  // Details
  if (errorDev.details) {
    lines.push('');
    lines.push(formatTextWithLists(formatLinks(createLocalLinks(errorDev.details))));
    lines.push('');
  }

  // Parameters — always show table when there are inputs (matching dodoc behavior)
  if (inputs.length > 0) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|---|:-:|---|');
    for (let i = 0; i < inputs.length; i++) {
      const param = inputs[i];
      const paramName = getDisplayName(param, i);
      const desc = errorDev.params?.[param.name]
        ? formatParamDescription(createLocalLinks(errorDev.params[param.name]))
        : '-';
      lines.push(`| \`${paramName}\` | \`${formatParamType(getDisplayType(param))}\` | ${desc} |`);
    }
    lines.push('');
  }

  lines.push('<br/>');

  return lines;
}

// ─── Text formatting helpers (matching dodoc config.ts) ─────────────

/**
 * Convert `{functionName}` references into local markdown links.
 * e.g. `{owner}` → [`owner`](#owner)
 */
function createLocalLinks(text: string): string {
  let formatted = text;
  const matches = [...text.matchAll(/{.+?}/g)];
  for (const match of matches) {
    if (!match[0].includes(' ')) {
      const cleared = match[0].replace('{', '').replace('}', '');
      const link = `[\`${cleared}\`](#${cleared.toLowerCase().split('(')[0]})`;
      formatted = formatted.replace(match[0], link);
    }
  }
  return formatted;
}

/**
 * Format inline links: detect ` word http://... ` patterns and convert to markdown links.
 * Matching dodoc's formatLinks helper.
 */
function formatLinks(textToFormat: string): string {
  let formatted = textToFormat;
  const matches = [...textToFormat.matchAll(/\s\w+\s+http\S+/g)];
  for (const element of matches) {
    const tuple = element[0].trim();
    const firstSpace = tuple.indexOf(' ');
    const title = tuple.substring(0, firstSpace);
    const link = tuple.substring(firstSpace).trim();
    formatted = formatted.replace(tuple, `[**${title}**](${link})`);
  }
  return formatted;
}

/**
 * Format inline lists: ` - item` → newline bullet, ` 1. item` → newline numbered.
 */
function formatTextWithLists(text: string): string {
  let formatted = text;
  for (const match of [...text.matchAll(/\s-\s/g)]) {
    formatted = formatted.replace(match[0], `\n\n${match[0].trim()} `);
  }
  for (const match of [...text.matchAll(/\s\d+\.\s/g)]) {
    formatted = formatted.replace(match[0], `\n\n${match[0].trim()} `);
  }
  return formatted;
}

/**
 * Format a custom tag value: replace ` - ` with newline bullets.
 */
function formatCustomTag(text: string): string {
  return createLocalLinks(text.replaceAll(' - ', '\n- ').trim());
}

/**
 * Format a bullet-pointed block with a bold title.
 */
function formatBulletPoints(text: string, title: string): string {
  if (text.length === 0) return '';
  let formatted = `**${title}**\n\n`;
  let adjusted = text;
  if (adjusted.startsWith('- ')) adjusted = ' ' + adjusted;
  for (const part of adjusted.split(' - ')) {
    if (part.trim().length > 0) {
      formatted += `- ${part.trim()}\n`;
    }
  }
  return formatted;
}

/**
 * Format parameter description, handling HTML entities.
 * Matches dodoc's formatParamDescription.
 */
function formatParamDescription(text: string): string {
  if (!text) return '-';
  let formatted = text;
  while (formatted.includes('&lt;')) formatted = formatted.replace('&lt;', '<');
  while (formatted.includes('&gt;')) formatted = formatted.replace('&gt;', '<');
  return formatted;
}

/**
 * Format parameter type, handling HTML entities.
 * Matches dodoc's formatParamType.
 */
function formatParamType(text: string): string {
  if (!text) return '';
  let formatted = text;
  while (formatted.includes('&gt;')) formatted = formatted.replace('&gt;', '<');
  return formatted;
}

/**
 * Generate index Markdown listing all contracts.
 */
export function generateIndexMarkdown(contracts: ContractNatSpec[]): string {
  const lines: string[] = [];

  lines.push('# Contract Documentation');
  lines.push('');
  lines.push('## Contracts');
  lines.push('');

  // Group by directory
  const byDir = new Map<string, ContractNatSpec[]>();
  for (const contract of contracts) {
    const dir = contract.sourcePath.split('/').slice(0, -1).join('/') || '.';
    if (!byDir.has(dir)) {
      byDir.set(dir, []);
    }
    byDir.get(dir)!.push(contract);
  }

  const sortedDirs = [...byDir.keys()].sort();

  for (const dir of sortedDirs) {
    const dirContracts = byDir
      .get(dir)!
      .sort((a, b) => a.contractName.localeCompare(b.contractName));

    lines.push(`### ${dir}`);
    lines.push('');

    for (const contract of dirContracts) {
      const fileName = contract.contractName + '.md';
      lines.push(`- [${contract.contractName}](./${fileName})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
