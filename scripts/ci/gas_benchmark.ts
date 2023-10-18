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
  .setAction(async function (args) {
    const currentBenchmark = JSON.parse(fs.readFileSync(args.compare, 'utf8'));
    const baseBenchmark = JSON.parse(fs.readFileSync(args.against, 'utf8'));

    const deploymentCosts: Row[] = [];

    const casesEOAExecute: Row[] = [];
    const casesEOASetData: Row[] = [];
    const casesEOATokens: Row[] = [];

    const casesKeyManagerExecute: Row[] = [];
    const casesKeyManagerSetData: Row[] = [];

    const formatNumber = (value: number) => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const displayGasDiff = (gasDiff: number) => {
      let emoji = '';

      if (gasDiff > 0) {
        emoji = '📈❌';
      }

      if (gasDiff < 0) {
        emoji = '📉✅';
      }

      return `${formatNumber(gasDiff)} ${emoji}`;
    };

    // Deployment costs
    for (const [key, value] of Object.entries(currentBenchmark['deployment_costs'])) {
      const gasCost: any = value;
      const gasDiff = gasCost - baseBenchmark['deployment_costs'][key];

      deploymentCosts.push([key, value + ` (${displayGasDiff(gasDiff)})`]);
    }

    const generatedDeploymentCostsTable = getMarkdownTable({
      table: {
        head: ['Deployed contracts', '⛽ Deployment cost'],
        body: deploymentCosts,
      },
      alignment: [Align.Left],
    });

    // EOA - execute
    for (const [key, value] of Object.entries(
      currentBenchmark['runtime_costs']['EOA_owner']['execute'],
    )) {
      const gasDiff =
        value['gas_cost'] - baseBenchmark['runtime_costs']['EOA_owner']['execute'][key]['gas_cost'];

      casesEOAExecute.push([
        value['description'],
        value['gas_cost'] + ` (${displayGasDiff(gasDiff)})`,
      ]);
    }

    const generatedEOAExecuteTable = getMarkdownTable({
      table: {
        head: ['`execute` scenarios - UP owned by 🔑 EOA', '⛽ Gas Usage'],
        body: casesEOAExecute,
      },
      alignment: [Align.Left],
    });

    // EOA - setData
    for (const [key, value] of Object.entries(
      currentBenchmark['runtime_costs']['EOA_owner']['setData'],
    )) {
      const gasDiff =
        value['gas_cost'] - baseBenchmark['runtime_costs']['EOA_owner']['setData'][key]['gas_cost'];

      casesEOASetData.push([
        value['description'],
        value['gas_cost'] + ` (${displayGasDiff(gasDiff)})`,
      ]);
    }

    const generatedEOASetDataTable = getMarkdownTable({
      table: {
        head: ['`setData` scenarios - UP owned by 🔑 EOA', '⛽ Gas Usage'],
        body: casesEOASetData,
      },
      alignment: [Align.Left],
    });

    // EOA - Tokens
    for (const [key, value] of Object.entries(
      currentBenchmark['runtime_costs']['EOA_owner']['tokens'],
    )) {
      const gasDiff =
        value['gas_cost'] - baseBenchmark['runtime_costs']['EOA_owner']['tokens'][key]['gas_cost'];

      casesEOATokens.push([
        value['description'],
        value['gas_cost'] + ` (${displayGasDiff(gasDiff)})`,
      ]);
    }

    const generatedEOATokensTable = getMarkdownTable({
      table: {
        head: ['`Tokens` scenarios - UP owned by 🔑 EOA', '⛽ Gas Usage'],
        body: casesEOATokens,
      },
      alignment: [Align.Left],
    });

    // Key Manager - execute
    for (const [key, value] of Object.entries(
      currentBenchmark['runtime_costs']['KeyManager_owner']['execute'],
    )) {
      const gasDiffMainController =
        value['main_controller'] -
        baseBenchmark['runtime_costs']['KeyManager_owner']['execute'][key]['main_controller'];

      const gasDiffRestrictedController =
        value['restricted_controller'] -
        baseBenchmark['runtime_costs']['KeyManager_owner']['execute'][key]['restricted_controller'];

      casesKeyManagerExecute.push([
        value['description'],
        value['main_controller'] + ` (${displayGasDiff(gasDiffMainController)})`,
        value['restricted_controller'] + ` (${displayGasDiff(gasDiffRestrictedController)})`,
      ]);
    }

    const generatedKeyManagerExecuteTable = getMarkdownTable({
      table: {
        head: ['`execute` scenarios', '👑 main controller', '🛃 restricted controller'],
        body: casesKeyManagerExecute,
      },
      alignment: [Align.Left],
    });

    // Key Manager - setData
    for (const [key, value] of Object.entries(
      currentBenchmark['runtime_costs']['KeyManager_owner']['setData'],
    )) {
      const gasDiffMainController =
        value['main_controller'] -
        baseBenchmark['runtime_costs']['KeyManager_owner']['setData'][key]['main_controller'];

      const gasDiffRestrictedController =
        value['restricted_controller'] -
        baseBenchmark['runtime_costs']['KeyManager_owner']['setData'][key]['restricted_controller'];

      casesKeyManagerSetData.push([
        value['description'],
        value['main_controller'] + ` (${displayGasDiff(gasDiffMainController)})`,
        value['restricted_controller'] + ` (${displayGasDiff(gasDiffRestrictedController)})`,
      ]);
    }

    const generatedKeyManagerSetDataTable = getMarkdownTable({
      table: {
        head: ['`setData` scenarios', '👑 main controller', '🛃 restricted controller'],
        body: casesKeyManagerSetData,
      },
      alignment: [Align.Left],
    });

    const markdownContent = `
👋 Hello
⛽ I am the Gas Bot Reporter. I keep track of the gas costs of common interactions using Universal Profiles 🆙 !
📊 Here is a summary of the gas cost with the code introduced by this PR.

## ⛽📊 Gas Benchmark Report

### Deployment Costs

${generatedDeploymentCostsTable}

### Runtime Costs

<details>
<summary>UniversalProfile owned by an 🔑 EOA</summary>

### 🔀 \`execute\` scenarios

${generatedEOAExecuteTable}

### 🗄️ \`setData\` scenarios

${generatedEOASetDataTable}

### 🗄️ \`Tokens\` scenarios

${generatedEOATokensTable}

</details>

<details>
<summary>UniversalProfile owned by a 🔒📄 LSP6KeyManager</summary>

### 🔀 \`execute\` scenarios

${generatedKeyManagerExecuteTable}

### 🗄️ \`setData\` scenarios

${generatedKeyManagerSetDataTable}

</details>

    `;

    const file = 'gas_benchmark.md';

    fs.writeFileSync(file, markdownContent, 'utf8');
  });
