import fs from 'fs';
import path from 'path';
import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { ethers } from 'ethers';
import pluralize from 'pluralize';
import { mkdir, rm, stat, writeFile } from 'fs/promises';
import { CompilerOutputContract } from 'hardhat/types';
import { format } from 'prettier';

task(TASK_COMPILE)
  .addFlag(
    'noTsGen',
    "Don't generate documentation after running this task, even if runOnCompile option is enabled",
  )
  .setAction(async function (args, hre, runSuper) {
    for (const compiler of hre.config.solidity.compilers) {
      compiler.settings.outputSelection['*']['*'].push('devdoc');
      compiler.settings.outputSelection['*']['*'].push('userdoc');
    }

    await runSuper();

    if (!args.noTsGen) {
      // Disable compile to avoid an infinite loop
      await hre.run('ts-gen', { noCompile: true });
    }
  });

// derive external signatures from internal types
function getSigType({ type, components = [] }: { type: string; components?: any[] }): string {
  return type.replace('tuple', `(${components.map(getSigType).join(',')})`);
}

function collect(items: any) {
  if (!items) {
    return undefined;
  }
  let collection;
  for (const [, { hash, ...item }] of Object.entries(items) as [string, any]) {
    if (!collection) {
      collection = {};
    }
    collection[hash] = item;
  }
  return collection;
}

function serialize(obj: any) {
  const output = [];
  if (Array.isArray(obj)) {
    output.push('[');
    for (const child of obj) {
      output.push(serialize(child));
      output.push(',');
    }
    output.push(']');
  } else if (typeof obj === 'object') {
    output.push('{');
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        continue;
      }
      const v = value as any;
      if (v && v.sig) {
        let docs = `\n\n/**\n * ${v.type ? `${v.type} ` : ''}${v.sig}`;
        if (v.inputs && v.inputs.length) {
          docs = docs.replace(
            /\(.*\)$/,
            `(\n *  ${v.inputs
              .map(({ name, type, indexed }) => `${type}${indexed ? ' indexed' : ''} ${name}`)
              .join(',\n *  ')}\n * )`,
          );
        }
        if (/^0x/.test(key)) {
          docs += `\n *\n * ${key} = keccak256('${v.sig}')`;
        }
        docs += `\n */\n`;
        output.push(docs);
      }
      output.push(`"${key}":`);
      if (typeof v === 'object' && v._doc && v._value) {
        output.push(`/** ${v._doc} */`);
        output.push(serialize(v._value));
      } else {
        output.push(serialize(value));
      }
      output.push(',');
    }
    output.push('}');
  } else {
    output.push(JSON.stringify(obj));
  }
  return output.join('');
}

task('ts-gen', 'Generate NatSpec documentation automatically on compilation')
  .addFlag('noCompile', "Don't run hardhat compile task first")
  .setAction(async function (args, hre) {
    if (!args.noCompile) {
      await hre.run(TASK_COMPILE, { noDocgen: true });
    }

    const contractNames = await hre.artifacts.getAllFullyQualifiedNames();

    // Only generate things for items in the package
    const contracts = new Set(hre.config.packager.contracts);

    // These could be defined as specific types, but most of them
    // come in as unknown and will output as JSON, so it doesn't really matter.
    const allEvents: Record<string, Record<string, any>> = {};
    const allErrors: Record<string, Record<string, any>> = {};
    const allMethods: Record<string, Record<string, any>> = {};
    const allContracts: Record<string, Record<string, any>> = {};
    const allStateVariables: Record<string, Record<string, any>> = {};

    // Create userdocs
    if (
      await stat('./userdocs')
        .then((s) => s.isDirectory())
        .catch(() => false)
    ) {
      await rm('./userdocs', { recursive: true });
    }
    await mkdir('./userdocs');
    if (
      await stat('./devdocs')
        .then((s) => s.isDirectory())
        .catch(() => false)
    ) {
      await rm('./devdocs', { recursive: true });
    }
    await mkdir('./devdocs');
    let contractCount = 0;
    let userdocCount = 0;
    let devdocCount = 0;
    for (const contractName of contractNames) {
      const [source, name] = contractName.split(':');

      if (!contracts.has(name)) {
        continue;
      }

      const build = await hre.artifacts.getBuildInfo(contractName);
      const {
        abi,
        devdoc = undefined,
        userdoc = undefined,
      } = build?.output?.contracts?.[source]?.[name] as CompilerOutputContract & {
        devdoc?: {
          events: object;
          stateVariables: object;
          methods: object;
          errors: object;
        };
        userdoc?: { events: object; methods: object; errors: object };
      };

      const fileName = `${name}.json`;
      if (devdoc) {
        await writeFile(path.join('./devdocs', fileName), JSON.stringify(devdoc, undefined, '  '));
        devdocCount++;
      }
      if (userdoc) {
        await writeFile(
          path.join('./userdocs', fileName),
          JSON.stringify(userdoc, undefined, '  '),
        );
        userdocCount++;
      }
      contractCount++;

      const allMembers: Record<string, any> = {};
      for (const item of abi) {
        const { name, type, inputs = [] } = item;
        allMembers[`${name || type}(${inputs.map(getSigType)})`] = item;
      }

      {
        // Handle devdoc

        const { events = {}, stateVariables = {}, methods = {}, errors = {} } = devdoc;
        // associate devdoc and userdoc comments with abi elements
        for (const [sig, event] of Object.entries(events)) {
          if (Object.keys(event).length) {
            allMembers[sig].devdoc = event;
          }
        }
        for (const [name, stateVariable] of Object.entries(stateVariables) as [string, any]) {
          const key = `${name}()`;
          let entry = allMembers[key];
          if (!entry) {
            entry = allMembers[key] = { type: 'stateVariable' };
          }
          if (Object.keys(stateVariable).length) {
            entry.devdoc = stateVariable;
          }
        }
        for (const [sig, method] of Object.entries(methods)) {
          if (Object.keys(method).length) {
            allMembers[sig].devdoc = method;
          }
        }
        for (const [sig, error] of Object.entries(errors)) {
          if (error.length) {
            allMembers[sig].devdoc = error;
          }
        }
      }
      {
        // Handle userdoc

        const { events = {}, methods = {}, errors = {} } = userdoc;
        for (const [sig, event] of Object.entries(events)) {
          if (Object.keys(event).length) {
            allMembers[sig].userdoc = event;
          }
        }
        for (const [sig, method] of Object.entries(methods)) {
          if (Object.keys(method).length) {
            allMembers[sig].userdoc = method;
          }
        }
        for (const [sig, error] of Object.entries(errors)) {
          if (error.length) {
            allMembers[sig].userdoc = error;
          }
        }
      }

      const constructorName: string | undefined = Object.keys(allMembers).find((k) =>
        k.startsWith('constructor('),
      );

      const {
        'fallback()': fallback,
        'receive()': receive,
        [constructorName || '___JUNK___']: constructor,
      } = allMembers;

      for (const [sig, member] of Object.entries(allMembers)) {
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(sig));
        member.hash = member.type === 'event' ? hash : hash.slice(0, 10);
      }

      const membersByType: Record<string, Record<string, any>> = {};
      for (const [sig, member] of Object.entries(allMembers)) {
        const { type, hash } = member;
        if (!type) {
          continue;
        }
        const key = type === 'function' ? 'methods' : pluralize(type);
        let entry = membersByType[key];
        if (!entry) {
          entry = membersByType[key] = {};
        }
        entry[hash] = { sig, ...member };
      }

      const { events = {}, methods = {}, errors = {}, stateVariables } = membersByType;
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        events: _events,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        errors: _errors,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        methods: _methods,
        ...contract
      } = devdoc;

      const wholeContract = { ...contract, constructor, fallback, receive };
      for (const name of ['constructor', 'fallback', 'receive']) {
        if (wholeContract[name]) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { hash, ...rest } = wholeContract[name];
          wholeContract[name] = rest;
        }
      }
      if (wholeContract.constructor) {
      }
      allEvents[name] = collect(events);
      allErrors[name] = collect(errors);
      allMethods[name] = collect(methods);
      allStateVariables[name] = collect(stateVariables);
    }
    fs.writeFileSync(
      './contracts.ts',
      format(
        `export const ErrorSelectors = ${serialize(allErrors)};
export const EventSigHashes = ${serialize(allEvents)};
export const FunctionSelectors = ${serialize(allMethods)};
export const ContractsDocs = ${serialize(allContracts)};
export const StateVariables = ${serialize(allStateVariables)};
`,
        { parser: 'babel-ts' },
      ),
    );
    console.log(`Successfully generated ${devdocCount} json files in devdocs`);
    console.log(`Successfully generated ${userdocCount} json files in userdocs`);
    console.log(`Successfully generated ./contracts.ts for ${contractCount} contracts`);
  });
