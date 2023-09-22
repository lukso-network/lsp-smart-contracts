import fs from 'fs';
import { task } from 'hardhat/config';
import { Align, getMarkdownTable, Row } from 'markdown-table-ts';

task('gas-benchmark', 'Benchmark gas usage of the smart contracts based on predefined scenarios')
  .addParam(
    'compare',
    'The `.json` file that contains the gas costs of the currently compiled contracts (e.g: current working branch)',
  )
  .addParam(
    'against',
    'The `.json` file that contains the gas costs to compare against (e.g: the `develop` branch)',
  )
  .setAction(async function (args, hre, runSuper) {
    // TODO: WIP
    const currentBenchmark = JSON.parse(fs.readFileSync(args.compare, 'utf8'));
    const baseBenchmark = JSON.parse(fs.readFileSync(args.against, 'utf8'));

    const casesExecute: Row[] = [];

    for (const [key, value] of Object.entries(currentBenchmark['runtime_costs']['execute'])) {
      const gasDiffMainController =
        value['main_controller'] -
        baseBenchmark['runtime_costs']['execute'][key]['main_controller'];

      const gasDiffRestrictedController =
        value['restricted_controller'] -
        baseBenchmark['runtime_costs']['execute'][key]['restricted_controller'];

      casesExecute.push([
        value['description'],
        value['main_controller'] + ` (${gasDiffMainController})`,
        value['restricted_controller'] + ` (${gasDiffRestrictedController})`,
      ]);
    }

    const generatedTable = getMarkdownTable({
      table: {
        head: ['`execute` scenarios', '👑 main controller', '🛃 restricted controller'],
        body: casesExecute,
      },
      alignment: [Align.Left],
    });

    const file = 'new_gas_benchmark.md';

    fs.writeFileSync(file, generatedTable);
  });
