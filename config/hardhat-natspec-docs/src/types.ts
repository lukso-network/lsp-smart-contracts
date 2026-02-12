export interface NatSpecDocsUserConfig {
  /** Contract path globs to include (default: all) */
  include?: string[];
  /** Contract path globs to exclude */
  exclude?: string[];
  /** Output directory (default: "docs") */
  outputDir?: string;
  /** Generate on compile (default: false) */
  runOnCompile?: boolean;
}

export interface NatSpecDocsConfig {
  include: string[];
  exclude: string[];
  outputDir: string;
  runOnCompile: boolean;
}
