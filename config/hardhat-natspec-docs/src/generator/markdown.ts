import type {
  ContractNatSpec,
  DevDoc,
  UserDoc,
  AbiItem,
  AbiParam,
  MethodDevDoc,
} from '../extractor/types.js';

/**
 * Generate Markdown documentation for a single contract
 */
export function generateContractMarkdown(contract: ContractNatSpec): string {
  const lines: string[] = [];
  const { contractName, sourcePath, devdoc, userdoc, abi } = contract;

  // Header
  lines.push(`# ${contractName}`);
  lines.push('');
  lines.push(`> Source: \`${sourcePath}\``);
  lines.push('');

  // Contract-level documentation
  if (devdoc.title) {
    lines.push(`**${devdoc.title}**`);
    lines.push('');
  }

  if (userdoc.notice) {
    lines.push(`*${userdoc.notice}*`);
    lines.push('');
  }

  if (devdoc.details) {
    lines.push(devdoc.details);
    lines.push('');
  }

  if (devdoc.author) {
    lines.push(`**Author:** ${devdoc.author}`);
    lines.push('');
  }

  // Custom tags at contract level
  const customTags = extractCustomTags(devdoc);
  if (customTags.length > 0) {
    lines.push('## Custom Tags');
    lines.push('');
    for (const [tag, value] of customTags) {
      lines.push(`- **@${tag}:** ${value}`);
    }
    lines.push('');
  }

  // Constructor
  const constructor = abi.find((item) => item.type === 'constructor');
  if (constructor) {
    lines.push('## Constructor');
    lines.push('');
    lines.push(...generateConstructorSection(constructor, devdoc));
    lines.push('');
  }

  // Functions
  const functions = abi.filter((item) => item.type === 'function');
  if (functions.length > 0) {
    lines.push('## Functions');
    lines.push('');
    for (const func of functions) {
      lines.push(...generateFunctionSection(func, devdoc, userdoc));
      lines.push('');
    }
  }

  // Events
  const events = abi.filter((item) => item.type === 'event');
  if (events.length > 0) {
    lines.push('## Events');
    lines.push('');
    for (const event of events) {
      lines.push(...generateEventSection(event, devdoc, userdoc));
      lines.push('');
    }
  }

  // Errors
  const errors = abi.filter((item) => item.type === 'error');
  if (errors.length > 0) {
    lines.push('## Errors');
    lines.push('');
    for (const error of errors) {
      lines.push(...generateErrorSection(error, devdoc, userdoc));
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Generate function signature for documentation
 */
function getFunctionSignature(func: AbiItem): string {
  const params = (func.inputs ?? [])
    .map((p) => `${p.type}${p.name ? ' ' + p.name : ''}`)
    .join(', ');
  return `${func.name}(${params})`;
}

/**
 * Generate selector-style signature (for devdoc lookup)
 */
function getSelectorSignature(func: AbiItem): string {
  const params = (func.inputs ?? []).map((p) => p.type).join(',');
  return `${func.name}(${params})`;
}

/**
 * Generate constructor section
 */
function generateConstructorSection(constructor: AbiItem, devdoc: DevDoc): string[] {
  const lines: string[] = [];
  const sig = 'constructor';
  const methodDoc = devdoc.methods?.[sig] ?? {};

  const params = constructor.inputs ?? [];
  const paramsStr = params.map((p) => `${p.type} ${p.name}`).join(', ');

  lines.push('```solidity');
  lines.push(`constructor(${paramsStr})`);
  lines.push('```');
  lines.push('');

  if (methodDoc.details) {
    lines.push(methodDoc.details);
    lines.push('');
  }

  if (params.length > 0) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|------|------|-------------|');
    for (const param of params) {
      const desc = methodDoc.params?.[param.name] ?? '-';
      lines.push(`| \`${param.name}\` | \`${param.type}\` | ${desc} |`);
    }
    lines.push('');
  }

  return lines;
}

/**
 * Generate function section
 */
function generateFunctionSection(func: AbiItem, devdoc: DevDoc, userdoc: UserDoc): string[] {
  const lines: string[] = [];
  const sig = getSelectorSignature(func);
  const methodDev = devdoc.methods?.[sig] ?? {};
  const methodUser = userdoc.methods?.[sig] ?? {};

  lines.push(`### ${func.name}`);
  lines.push('');

  // Signature
  const inputs = func.inputs ?? [];
  const outputs = func.outputs ?? [];
  const inputsStr = inputs.map((p) => `${p.type} ${p.name}`).join(', ');
  const outputsStr =
    outputs.length > 0
      ? ` returns (${outputs.map((p) => `${p.type}${p.name ? ' ' + p.name : ''}`).join(', ')})`
      : '';
  const mutability =
    func.stateMutability && func.stateMutability !== 'nonpayable' ? ` ${func.stateMutability}` : '';

  lines.push('```solidity');
  lines.push(`function ${func.name}(${inputsStr})${mutability}${outputsStr}`);
  lines.push('```');
  lines.push('');

  // Notice (user doc)
  if (methodUser.notice) {
    lines.push(`*${methodUser.notice}*`);
    lines.push('');
  }

  // Details (dev doc)
  if (methodDev.details) {
    lines.push(methodDev.details);
    lines.push('');
  }

  // Custom tags
  const customTags = extractCustomTags(methodDev);
  for (const [tag, value] of customTags) {
    lines.push(`**@${tag}:** ${value}`);
    lines.push('');
  }

  // Parameters
  if (inputs.length > 0 && methodDev.params) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|------|------|-------------|');
    for (const param of inputs) {
      const desc = methodDev.params?.[param.name] ?? '-';
      lines.push(`| \`${param.name}\` | \`${param.type}\` | ${desc} |`);
    }
    lines.push('');
  }

  // Returns
  if (outputs.length > 0 && methodDev.returns) {
    lines.push('#### Returns');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|------|------|-------------|');
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      const name = output.name || `_${i}`;
      const desc = methodDev.returns?.[name] ?? methodDev.returns?.[`_${i}`] ?? '-';
      lines.push(`| \`${name}\` | \`${output.type}\` | ${desc} |`);
    }
    lines.push('');
  }

  return lines;
}

/**
 * Generate event section
 */
function generateEventSection(event: AbiItem, devdoc: DevDoc, userdoc: UserDoc): string[] {
  const lines: string[] = [];
  const sig = getSelectorSignature(event);
  const eventDev = devdoc.events?.[sig] ?? {};
  const eventUser = userdoc.events?.[sig] ?? {};

  lines.push(`### ${event.name}`);
  lines.push('');

  // Signature
  const inputs = event.inputs ?? [];
  const inputsStr = inputs
    .map((p) => `${p.type}${p.indexed ? ' indexed' : ''} ${p.name}`)
    .join(', ');

  lines.push('```solidity');
  lines.push(`event ${event.name}(${inputsStr})`);
  lines.push('```');
  lines.push('');

  // Notice
  if (eventUser.notice) {
    lines.push(`*${eventUser.notice}*`);
    lines.push('');
  }

  // Details
  if (eventDev.details) {
    lines.push(eventDev.details);
    lines.push('');
  }

  // Parameters
  if (inputs.length > 0 && eventDev.params) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('| Name | Type | Indexed | Description |');
    lines.push('|------|------|---------|-------------|');
    for (const param of inputs) {
      const desc = eventDev.params?.[param.name] ?? '-';
      const indexed = param.indexed ? 'Yes' : 'No';
      lines.push(`| \`${param.name}\` | \`${param.type}\` | ${indexed} | ${desc} |`);
    }
    lines.push('');
  }

  return lines;
}

/**
 * Generate error section
 */
function generateErrorSection(error: AbiItem, devdoc: DevDoc, userdoc: UserDoc): string[] {
  const lines: string[] = [];
  const sig = getSelectorSignature(error);
  // Errors can be stored as arrays in solc output
  const errorDevRaw = devdoc.errors?.[sig];
  const errorUserRaw = userdoc.errors?.[sig];
  const errorDev = (Array.isArray(errorDevRaw) ? errorDevRaw[0] : errorDevRaw) ?? {};
  const errorUser = (Array.isArray(errorUserRaw) ? errorUserRaw[0] : errorUserRaw) ?? {};

  lines.push(`### ${error.name}`);
  lines.push('');

  // Signature
  const inputs = error.inputs ?? [];
  const inputsStr = inputs.map((p) => `${p.type} ${p.name}`).join(', ');

  lines.push('```solidity');
  lines.push(`error ${error.name}(${inputsStr})`);
  lines.push('```');
  lines.push('');

  // Notice
  if ((errorUser as any).notice) {
    lines.push(`*${(errorUser as any).notice}*`);
    lines.push('');
  }

  // Details
  if ((errorDev as any).details) {
    lines.push((errorDev as any).details);
    lines.push('');
  }

  // Parameters
  if (inputs.length > 0 && (errorDev as any).params) {
    lines.push('#### Parameters');
    lines.push('');
    lines.push('| Name | Type | Description |');
    lines.push('|------|------|-------------|');
    for (const param of inputs) {
      const desc = (errorDev as any).params?.[param.name] ?? '-';
      lines.push(`| \`${param.name}\` | \`${param.type}\` | ${desc} |`);
    }
    lines.push('');
  }

  return lines;
}

/**
 * Extract custom tags from devdoc object
 */
function extractCustomTags(obj: Record<string, any>): [string, string][] {
  const tags: [string, string][] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('custom:') && typeof value === 'string') {
      tags.push([key, value]);
    }
  }
  return tags;
}

/**
 * Generate index Markdown listing all contracts
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

  // Sort directories and contracts
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
