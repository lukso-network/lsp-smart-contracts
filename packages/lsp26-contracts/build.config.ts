import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./constants'],
  declaration: 'compatible', // generate .d.ts files
  rollup: {
    emitCJS: true,
  },
});
