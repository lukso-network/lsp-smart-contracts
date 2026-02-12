/**
 * Developer documentation from @dev tags
 * Matches solc devdoc output format
 */
export interface DevDoc {
  kind: 'dev';
  version: number;
  title?: string;
  author?: string;
  details?: string;
  methods: Record<string, MethodDevDoc>;
  events?: Record<string, EventDoc>;
  errors?: Record<string, ErrorDoc>;
  stateVariables?: Record<string, StateVariableDoc>;
  // Custom tags stored as @custom:tagname
  [key: `custom:${string}`]: string | undefined;
}

export interface MethodDevDoc {
  details?: string;
  params?: Record<string, string>;
  returns?: Record<string, string>;
  // Custom tags
  [key: `custom:${string}`]: string | undefined;
}

export interface EventDoc {
  details?: string;
  params?: Record<string, string>;
}

export interface ErrorDoc {
  details?: string;
  params?: Record<string, string>;
}

export interface StateVariableDoc {
  details?: string;
  return?: string;
}

/**
 * User documentation from @notice tags
 * Matches solc userdoc output format
 */
export interface UserDoc {
  kind: 'user';
  version: number;
  notice?: string;
  methods: Record<string, MethodUserDoc>;
  events?: Record<string, EventUserDoc>;
  errors?: Record<string, ErrorUserDoc>;
}

export interface MethodUserDoc {
  notice?: string;
}

export interface EventUserDoc {
  notice?: string;
}

export interface ErrorUserDoc {
  notice?: string;
}

/**
 * Combined NatSpec for a contract
 */
export interface ContractNatSpec {
  contractName: string;
  sourcePath: string;
  devdoc: DevDoc;
  userdoc: UserDoc;
  abi: AbiItem[];
}

/**
 * ABI item structure (simplified)
 */
export interface AbiItem {
  type: 'function' | 'event' | 'error' | 'constructor' | 'fallback' | 'receive';
  name?: string;
  inputs?: AbiParam[];
  outputs?: AbiParam[];
  stateMutability?: string;
  anonymous?: boolean;
}

export interface AbiParam {
  name: string;
  type: string;
  indexed?: boolean;
  components?: AbiParam[];
  internalType?: string;
}
