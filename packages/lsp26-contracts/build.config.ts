import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./index'],
  declaration: 'compatible', // generate .d.ts files
  rollup: {
    emitCJS: true,
  },
});
