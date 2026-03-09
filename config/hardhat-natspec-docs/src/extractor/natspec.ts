import * as fs from 'fs/promises';
import * as path from 'path';
import type { ContractNatSpec, DevDoc, UserDoc, AbiItem, InternalMethod } from './types.js';

// Type for the artifacts object from Hardhat Runtime Environment
type Artifacts = {
  getAllFullyQualifiedNames(): Promise<ReadonlySet<string>>;
  readArtifact(name: string): Promise<{
    buildInfoId?: string;
    inputSourceName?: string;
  }>;
};

interface ExtractOptions {
  include: string[];
  exclude: string[];
}

/**
 * Extract NatSpec documentation for all matching contracts.
 *
 * Hardhat v3 fully-qualified names use bare source paths (e.g.
 * "contracts/Foo.sol:Foo") from `getAllFullyQualifiedNames()`, but
 * only returns contracts defined in the project — not npm deps.
 *
 * However, the build-info output.json keys use a "project/" prefix
 * (e.g. "project/contracts/Foo.sol"), so we must use the artifact's
 * `inputSourceName` when looking up NatSpec in build-info.
 */
export async function extractNatSpec(
  artifacts: Artifacts,
  artifactsPath: string,
  options: ExtractOptions,
): Promise<ContractNatSpec[]> {
  const results: ContractNatSpec[] = [];

  // Get all fully qualified contract names (project contracts only)
  const contractNames = await artifacts.getAllFullyQualifiedNames();

  for (const fqName of contractNames) {
    // fqName format: "sourcePath:contractName"
    const [sourcePath, contractName] = fqName.split(':');

    // Check include/exclude filters against the source path
    if (!matchesFilters(sourcePath, options.include, options.exclude)) {
      continue;
    }

    try {
      const natspec = await extractContractNatSpec(
        artifacts,
        artifactsPath,
        sourcePath,
        contractName,
      );
      if (natspec) {
        results.push(natspec);
      }
    } catch (error) {
      console.warn(
        `[hardhat-natspec-docs] Warning: Could not extract NatSpec for ${fqName}:`,
        error,
      );
    }
  }

  return results;
}

/**
 * Extract NatSpec for a single contract, including inherited documentation.
 *
 * Uses the artifact's `inputSourceName` (which carries the "project/"
 * prefix) to look up the contract in build-info output, since that's
 * the key format solc uses in its output JSON.
 *
 * Walks the linearizedBaseContracts to merge parent devdoc/userdoc
 * and collect inherited internal methods.
 */
async function extractContractNatSpec(
  artifacts: Artifacts,
  artifactsPath: string,
  sourcePath: string,
  contractName: string,
): Promise<ContractNatSpec | null> {
  // Read the artifact to get buildInfoId and the real source name
  const artifact = await artifacts.readArtifact(`${sourcePath}:${contractName}`);

  if (!artifact.buildInfoId) {
    console.warn(`[hardhat-natspec-docs] No buildInfoId for ${contractName}`);
    return null;
  }

  // inputSourceName has the "project/" prefix that build-info uses
  const buildInfoSourceKey = artifact.inputSourceName ?? sourcePath;

  // Read the build-info output file
  const buildInfoOutputPath = path.join(
    artifactsPath,
    'build-info',
    `${artifact.buildInfoId}.output.json`,
  );

  let buildInfoOutput: any;
  try {
    const content = await fs.readFile(buildInfoOutputPath, 'utf-8');
    buildInfoOutput = JSON.parse(content);
  } catch (error) {
    console.warn(`[hardhat-natspec-docs] Could not read build-info for ${contractName}:`, error);
    return null;
  }

  // Look up using the build-info source key (with "project/" prefix)
  const contractOutput = buildInfoOutput?.output?.contracts?.[buildInfoSourceKey]?.[contractName];

  if (!contractOutput) {
    console.warn(
      `[hardhat-natspec-docs] No output found for ${buildInfoSourceKey}:${contractName}`,
    );
    return null;
  }

  // Extract devdoc, userdoc, and abi from the contract itself
  const devdoc: DevDoc = contractOutput.devdoc ?? { kind: 'dev', version: 1, methods: {} };
  const userdoc: UserDoc = contractOutput.userdoc ?? { kind: 'user', version: 1, methods: {} };
  const abi: AbiItem[] = contractOutput.abi ?? [];

  // ── Inheritance resolution ──────────────────────────────────
  // Build an index of all ContractDefinition nodes by ID across all sources
  const allSources = buildInfoOutput?.output?.sources ?? {};
  const allContracts = buildInfoOutput?.output?.contracts ?? {};
  const nodeIndex = buildNodeIndex(allSources);

  // Find the contract's AST node to get linearizedBaseContracts
  const contractAst = allSources[buildInfoSourceKey]?.ast;
  const contractNode = contractAst ? findContractNode(contractAst, contractName) : null;

  // Walk inheritance chain to merge parent NatSpec
  if (contractNode?.linearizedBaseContracts) {
    const baseIds: number[] = contractNode.linearizedBaseContracts;

    // Skip first entry (it's the contract itself)
    for (let i = 1; i < baseIds.length; i++) {
      const parentInfo = nodeIndex.get(baseIds[i]);
      if (!parentInfo) continue;

      // Look up parent's devdoc/userdoc from output.contracts
      const parentOutput = allContracts[parentInfo.sourcePath]?.[parentInfo.name];
      if (!parentOutput) continue;

      const parentDevdoc: DevDoc = parentOutput.devdoc;
      const parentUserdoc: UserDoc = parentOutput.userdoc;
      if (!parentDevdoc && !parentUserdoc) continue;

      // Merge parent docs into child (child takes precedence)
      mergeDevDoc(devdoc, parentDevdoc);
      mergeUserDoc(userdoc, parentUserdoc);
    }
  }

  // ── Internal methods extraction (with inheritance) ─────────
  const internalMethods = extractInternalMethodsWithInheritance(
    contractNode,
    nodeIndex,
    allSources,
  );

  return {
    contractName,
    sourcePath,
    devdoc,
    userdoc,
    abi,
    internalMethods,
  };
}

// ─── Node Index ─────────────────────────────────────────────────────

interface ContractNodeInfo {
  id: number;
  name: string;
  sourcePath: string;
  node: any;
}

/**
 * Build an index mapping ContractDefinition node IDs to their info,
 * scanning all source ASTs in the build output.
 */
function buildNodeIndex(allSources: Record<string, any>): Map<number, ContractNodeInfo> {
  const index = new Map<number, ContractNodeInfo>();

  for (const [sourcePath, sourceEntry] of Object.entries(allSources)) {
    const ast = (sourceEntry as any)?.ast;
    if (!ast?.nodes) continue;

    for (const node of ast.nodes) {
      if (node.nodeType === 'ContractDefinition' && node.id != null) {
        index.set(node.id, {
          id: node.id,
          name: node.name,
          sourcePath,
          node,
        });
      }
    }
  }

  return index;
}

// ─── DevDoc/UserDoc Merging ─────────────────────────────────────────

/**
 * Merge parent devdoc into child devdoc. Child values take precedence.
 */
function mergeDevDoc(child: DevDoc, parent: DevDoc | undefined): void {
  if (!parent) return;

  // Merge top-level fields (child takes precedence)
  if (!child.title && parent.title) child.title = parent.title;
  if (!child.author && parent.author) child.author = parent.author;
  if (!child.details && parent.details) child.details = parent.details;

  // Merge methods
  if (parent.methods) {
    for (const [sig, parentMethod] of Object.entries(parent.methods)) {
      if (!child.methods[sig]) {
        child.methods[sig] = parentMethod;
      } else {
        // Merge individual fields
        const childMethod = child.methods[sig];
        if (!childMethod.details && parentMethod.details) {
          childMethod.details = parentMethod.details;
        }
        if (parentMethod.params) {
          if (!childMethod.params) childMethod.params = {};
          for (const [name, desc] of Object.entries(parentMethod.params)) {
            if (!childMethod.params[name]) childMethod.params[name] = desc;
          }
        }
        if (parentMethod.returns) {
          if (!childMethod.returns) childMethod.returns = {};
          for (const [name, desc] of Object.entries(parentMethod.returns)) {
            if (!childMethod.returns[name]) childMethod.returns[name] = desc;
          }
        }
        // Merge custom tags
        for (const key of Object.keys(parentMethod)) {
          if (key.startsWith('custom:') && !(key in childMethod)) {
            (childMethod as any)[key] = (parentMethod as any)[key];
          }
        }
      }
    }
  }

  // Merge events
  if (parent.events) {
    if (!child.events) child.events = {};
    for (const [sig, parentEvent] of Object.entries(parent.events)) {
      if (!child.events[sig]) {
        child.events[sig] = parentEvent;
      } else {
        const childEvent = child.events[sig];
        if (!childEvent.details && parentEvent.details) {
          childEvent.details = parentEvent.details;
        }
        if (parentEvent.params) {
          if (!childEvent.params) childEvent.params = {};
          for (const [name, desc] of Object.entries(parentEvent.params)) {
            if (!childEvent.params[name]) childEvent.params[name] = desc;
          }
        }
      }
    }
  }

  // Merge errors
  if (parent.errors) {
    if (!child.errors) child.errors = {};
    for (const [sig, parentError] of Object.entries(parent.errors)) {
      if (!child.errors[sig]) {
        child.errors[sig] = parentError;
      }
    }
  }

  // Merge stateVariables
  if (parent.stateVariables) {
    if (!child.stateVariables) child.stateVariables = {};
    for (const [name, parentSV] of Object.entries(parent.stateVariables)) {
      if (!child.stateVariables[name]) {
        child.stateVariables[name] = parentSV;
      }
    }
  }

  // Merge custom tags at contract level
  for (const key of Object.keys(parent)) {
    if (key.startsWith('custom:') && !(key in child)) {
      (child as any)[key] = (parent as any)[key];
    }
  }
}

/**
 * Merge parent userdoc into child userdoc. Child values take precedence.
 */
function mergeUserDoc(child: UserDoc, parent: UserDoc | undefined): void {
  if (!parent) return;

  // Merge top-level notice
  if (!child.notice && parent.notice) child.notice = parent.notice;

  // Merge methods
  if (parent.methods) {
    for (const [sig, parentMethod] of Object.entries(parent.methods)) {
      if (!child.methods[sig]) {
        child.methods[sig] = parentMethod;
      } else {
        const childMethod = child.methods[sig];
        if (!childMethod.notice && parentMethod.notice) {
          childMethod.notice = parentMethod.notice;
        }
      }
    }
  }

  // Merge events
  if (parent.events) {
    if (!child.events) child.events = {};
    for (const [sig, parentEvent] of Object.entries(parent.events)) {
      if (!child.events[sig]) {
        child.events[sig] = parentEvent;
      } else {
        const childEvent = child.events[sig];
        if (!childEvent.notice && parentEvent.notice) {
          childEvent.notice = parentEvent.notice;
        }
      }
    }
  }

  // Merge errors
  if (parent.errors) {
    if (!child.errors) child.errors = {};
    for (const [sig, parentError] of Object.entries(parent.errors)) {
      if (!child.errors[sig]) {
        child.errors[sig] = parentError;
      }
    }
  }
}

// ─── Internal Method Extraction with Inheritance ────────────────────

/**
 * Extract internal methods from the contract and all its parents,
 * following the C3 linearization order.
 *
 * Deduplicates by function name (child overrides take precedence).
 */
function extractInternalMethodsWithInheritance(
  contractNode: any,
  nodeIndex: Map<number, ContractNodeInfo>,
  allSources: Record<string, any>,
): InternalMethod[] {
  if (!contractNode?.linearizedBaseContracts) {
    // Fallback to just the contract's own internals
    return contractNode ? extractInternalMethodsFromNode(contractNode) : [];
  }

  const seenSignatures = new Set<string>();
  const methods: InternalMethod[] = [];
  const baseIds: number[] = contractNode.linearizedBaseContracts;

  // Walk in linearization order (most derived first)
  for (const nodeId of baseIds) {
    let node: any;

    if (nodeId === contractNode.id) {
      node = contractNode;
    } else {
      const info = nodeIndex.get(nodeId);
      if (!info) continue;
      node = info.node;
    }

    for (const child of node.nodes ?? []) {
      if (
        child.nodeType === 'FunctionDefinition' &&
        child.visibility === 'internal' &&
        child.kind === 'function'
      ) {
        const name = child.name;
        if (!name) continue;

        // Build a signature from name + param types to handle overloads correctly
        const paramTypes = (child.parameters?.parameters ?? [])
          .map((p: any) => p.typeDescriptions?.typeString ?? resolveTypeName(p.typeName) ?? '')
          .join(',');
        const sig = `${name}(${paramTypes})`;

        if (seenSignatures.has(sig)) continue;
        seenSignatures.add(sig);

        const method = parseInternalMethod(child);
        if (method) methods.push(method);
      }
    }
  }

  return methods;
}

/**
 * Extract internal methods from a single contract AST node.
 */
function extractInternalMethodsFromNode(contractNode: any): InternalMethod[] {
  const methods: InternalMethod[] = [];

  for (const node of contractNode.nodes ?? []) {
    if (
      node.nodeType === 'FunctionDefinition' &&
      node.visibility === 'internal' &&
      node.kind === 'function'
    ) {
      const method = parseInternalMethod(node);
      if (method) methods.push(method);
    }
  }

  return methods;
}

// ─── Internal Method Parsing ────────────────────────────────────────

/**
 * Find the contract definition node in the AST.
 */
function findContractNode(ast: any, contractName: string): any {
  if (!ast || !ast.nodes) return null;

  for (const node of ast.nodes) {
    if (node.nodeType === 'ContractDefinition' && node.name === contractName) {
      return node;
    }
  }
  return null;
}

/**
 * Parse a FunctionDefinition AST node into an InternalMethod.
 */
function parseInternalMethod(node: any): InternalMethod | null {
  const name = node.name;
  if (!name) return null;

  // Collect return parameter names from the AST for precise @return parsing
  const returnParams = node.returnParameters?.parameters ?? [];
  const returnNameSet = new Set<string>();
  for (const ret of returnParams) {
    if (ret.name) returnNameSet.add(ret.name);
  }

  // Parse NatSpec from documentation, passing known return names
  const docText = node.documentation?.text ?? '';
  const parsed = parseNatSpecText(docText, returnNameSet);

  // Build params — use typeDescriptions.typeString for code display
  // (includes 'contract' prefix for interface types like 'contract IERC725Y')
  const params: InternalMethod['params'] = [];
  for (const param of node.parameters?.parameters ?? []) {
    const paramName = param.name ?? '';
    const paramType = param.typeDescriptions?.typeString ?? resolveTypeName(param.typeName) ?? '';
    params.push({
      name: paramName,
      type: paramType,
      description: parsed.params[paramName],
    });
  }

  // Build returns — use typeDescriptions.typeString for code display
  const returns: InternalMethod['returns'] = [];
  for (let i = 0; i < returnParams.length; i++) {
    const ret = returnParams[i];
    const retName = ret.name || `${i}`;
    const retType = ret.typeDescriptions?.typeString ?? resolveTypeName(ret.typeName) ?? '';
    // Try named return, then positional
    const desc = parsed.returns[retName] ?? parsed.returns[`_${i}`] ?? parsed.returnText ?? '';
    returns.push({
      name: retName,
      type: retType,
      description: desc || undefined,
    });
  }

  // Build code string
  const code = buildInternalMethodCode(name, params, returns, node.stateMutability);

  return {
    name,
    code,
    notice: parsed.notice || undefined,
    details: parsed.details || undefined,
    params: params.length > 0 ? params : undefined,
    returns: returns.length > 0 ? returns : undefined,
    customTags: Object.keys(parsed.customTags).length > 0 ? parsed.customTags : undefined,
  };
}

/**
 * Resolve a typeName AST node to a Solidity type string.
 */
function resolveTypeName(typeName: any): string | null {
  if (!typeName) return null;

  if (typeName.nodeType === 'ElementaryTypeName') {
    return typeName.name;
  }
  if (typeName.nodeType === 'UserDefinedTypeName') {
    // pathNode for newer solc versions, name for older
    return typeName.pathNode?.name ?? typeName.name ?? null;
  }
  if (typeName.nodeType === 'ArrayTypeName') {
    const base = resolveTypeName(typeName.baseType);
    if (typeName.length) {
      return `${base}[${typeName.length.value ?? ''}]`;
    }
    return `${base}[]`;
  }
  if (typeName.nodeType === 'Mapping') {
    const key = resolveTypeName(typeName.keyType);
    const val = resolveTypeName(typeName.valueType);
    return `mapping(${key} => ${val})`;
  }

  return null;
}

/**
 * Parse raw NatSpec text from StructuredDocumentation into structured data.
 *
 * @param text - the raw NatSpec comment text
 * @param returnNames - optional set of actual return parameter names from the AST,
 *   used to disambiguate `@return the value` (unnamed) from `@return result the value` (named).
 *   Without this, words like "the" or "true" would be mistaken for parameter names.
 */
function parseNatSpecText(
  text: string,
  returnNames?: Set<string>,
): {
  notice: string;
  details: string;
  returnText: string;
  params: Record<string, string>;
  returns: Record<string, string>;
  customTags: Record<string, string>;
} {
  const result = {
    notice: '',
    details: '',
    returnText: '',
    params: {} as Record<string, string>,
    returns: {} as Record<string, string>,
    customTags: {} as Record<string, string>,
  };

  if (!text) return result;

  // Split into lines and parse tags
  const lines = text.split('\n').map((l) => l.replace(/^\s*\*?\s?/, ''));

  let currentTag = 'dev'; // Default section is @dev
  let currentParamName = '';
  let currentReturnName = '';
  let returnIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('@notice')) {
      currentTag = 'notice';
      result.notice = trimmed.replace('@notice', '').trim();
    } else if (trimmed.startsWith('@dev')) {
      currentTag = 'dev';
      const devText = trimmed.replace('@dev', '').trim();
      result.details = devText;
    } else if (trimmed.startsWith('@param')) {
      currentTag = 'param';
      const rest = trimmed.replace('@param', '').trim();
      const spaceIdx = rest.indexOf(' ');
      if (spaceIdx > 0) {
        currentParamName = rest.substring(0, spaceIdx);
        result.params[currentParamName] = rest.substring(spaceIdx + 1).trim();
      } else {
        currentParamName = rest;
        result.params[currentParamName] = '';
      }
    } else if (trimmed.startsWith('@return ')) {
      currentTag = 'return';
      const rest = trimmed.replace('@return', '').trim();
      const spaceIdx = rest.indexOf(' ');
      if (spaceIdx > 0) {
        const firstWord = rest.substring(0, spaceIdx);
        // Check if the first word is an actual return parameter name from the AST.
        // If we have returnNames, use them for precise matching.
        // Otherwise, fall back to heuristic: treat as named if starts with _ only.
        const isNamedReturn = returnNames ? returnNames.has(firstWord) : firstWord.startsWith('_');
        if (isNamedReturn) {
          currentReturnName = firstWord;
          result.returns[firstWord] = rest.substring(spaceIdx + 1).trim();
        } else {
          // Unnamed return — store under positional key _0, _1, etc.
          currentReturnName = '';
          result.returnText = rest;
          result.returns[`_${returnIndex}`] = rest;
        }
      } else {
        currentReturnName = '';
        result.returnText = rest;
        result.returns[`_${returnIndex}`] = rest;
      }
      returnIndex++;
    } else if (trimmed.startsWith('@custom:')) {
      const tagMatch = trimmed.match(/@custom:(\S+)\s*(.*)/);
      if (tagMatch) {
        currentTag = `custom:${tagMatch[1]}`;
        result.customTags[currentTag] = tagMatch[2].trim();
      }
    } else if (trimmed.length > 0) {
      // Continuation of previous tag
      if (currentTag === 'notice') {
        result.notice += ' ' + trimmed;
      } else if (currentTag === 'dev') {
        result.details += (result.details ? ' ' : '') + trimmed;
      } else if (currentTag === 'param' && currentParamName) {
        result.params[currentParamName] += ' ' + trimmed;
      } else if (currentTag === 'return') {
        if (currentReturnName) {
          result.returns[currentReturnName] += ' ' + trimmed;
        } else {
          result.returnText += ' ' + trimmed;
          // Also update positional entry
          const posKey = `_${returnIndex - 1}`;
          if (result.returns[posKey] !== undefined) {
            result.returns[posKey] += ' ' + trimmed;
          }
        }
      } else if (currentTag.startsWith('custom:')) {
        result.customTags[currentTag] += ' ' + trimmed;
      }
    }
  }

  return result;
}

/**
 * Build a code string for an internal method, matching dodoc format.
 */
function buildInternalMethodCode(
  name: string,
  params: Array<{ name: string; type: string }>,
  returns: Array<{ name: string; type: string }>,
  stateMutability?: string,
): string {
  const mutability =
    stateMutability === 'pure' ? ' pure' : stateMutability === 'view' ? ' view' : ' nonpayable';
  const returnsStr =
    returns.length > 0
      ? ` returns (${returns.map((r) => `${r.type}${r.name && !/^\d+$/.test(r.name) ? ' ' + r.name : ''}`).join(', ')})`
      : '';

  if (params.length <= 2 && returns.length <= 2) {
    const paramsStr = params.map((p) => `${p.type} ${p.name}`).join(', ');
    return `function ${name}(${paramsStr}) internal${mutability}${returnsStr};`;
  }

  const lines = [`function ${name}(`];
  params.forEach((p, i) => {
    const comma = i < params.length - 1 ? ',' : '';
    lines.push(`  ${p.type} ${p.name}${comma}`);
  });
  lines.push(`) internal${mutability}${returnsStr};`);
  return lines.join('\n');
}

// ─── Glob Matching ──────────────────────────────────────────────────

/**
 * Check if a source path matches include/exclude filters.
 */
function matchesFilters(sourcePath: string, include: string[], exclude: string[]): boolean {
  const shouldInclude =
    include.length === 0 || include.some((pattern) => matchGlob(sourcePath, pattern));

  if (!shouldInclude) {
    return false;
  }

  const shouldExclude = exclude.some((pattern) => matchGlob(sourcePath, pattern));

  return !shouldExclude;
}

/**
 * Glob matching that supports *, **, and ?.
 *
 * Key behaviour: "**" matches zero or more path segments, so
 * "contracts/**\/*.sol" matches both "contracts/Foo.sol" and
 * "contracts/sub/Bar.sol".
 */
function matchGlob(str: string, pattern: string): boolean {
  // Escape regex-special characters except our glob tokens (*, ?, /)
  let regexPattern = '';
  let i = 0;

  while (i < pattern.length) {
    if (pattern[i] === '*' && pattern[i + 1] === '*') {
      // "**/" or "**" at end — matches zero or more path segments
      i += 2;
      if (pattern[i] === '/') {
        i++; // consume the trailing slash
        regexPattern += '(?:.+/)?'; // zero or more dirs (with trailing /)
      } else {
        regexPattern += '.*'; // match everything remaining
      }
    } else if (pattern[i] === '*') {
      regexPattern += '[^/]*'; // single segment wildcard
      i++;
    } else if (pattern[i] === '?') {
      regexPattern += '[^/]'; // single char
      i++;
    } else if ('.+^${}()|[]\\'.includes(pattern[i])) {
      regexPattern += '\\' + pattern[i]; // escape regex special
      i++;
    } else {
      regexPattern += pattern[i];
      i++;
    }
  }

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(str);
}
