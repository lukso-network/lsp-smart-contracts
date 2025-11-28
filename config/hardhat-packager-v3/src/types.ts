export interface PackagerUserConfig {
  /**
   * Array of contract names to keep in the artifacts and bindings.
   * All other contracts will be removed.
   */
  contracts?: string[];

  /**
   * Whether to include typechain-like types files in the package.
   * When this is false includeFactories is disregarded
   * @default false
   */
  includeTypes?: boolean;

  /**
   * Whether to include typechain-like factory files in the package.
   * @default false
   */
  includeFactories?: boolean;
}

export interface PackagerConfig {
  contracts: string[];
  includeTypes: boolean;
  includeFactories: boolean;
}
