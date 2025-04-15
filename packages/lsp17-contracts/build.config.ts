import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./constants', './abi'],
  outDir: 'dist/',
  rollup: {
    emitCJS: true,
  },
  // generate .d.ts files
  declaration: 'compatible',
  failOnWarn: false,
});
