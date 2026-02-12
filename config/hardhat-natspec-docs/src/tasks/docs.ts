import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface DocsTaskArgs {
  output?: string;
}

const docsAction: NewTaskActionFunction<DocsTaskArgs> = async (args, hre) => {
  const config = hre.config.natspecDocs;
  const outputDir = args.output ?? config.outputDir;

  console.log(`[hardhat-natspec-docs] Output directory: ${outputDir}`);
  console.log('[hardhat-natspec-docs] Task stub - implementation in Plan 04');
};

export default docsAction;
