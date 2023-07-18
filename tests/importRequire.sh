#!/usr/bin/env bash
rm -rf ./.test
mkdir ./.test
testdir="$(pwd)/.test"
trap "rm -rf $testdir" EXIT
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
ENDCOLOR="\033[0m"

if [ ! -f './dist/constants.cjs.js' ]
then
  echo -e "${RED}Fail: No constants.cjs.js found${ENDCOLOR}"
  exit 1
fi
if [ ! -f './dist/constants.es.js' ]
then
  echo -e "${RED}Fail: No constants.es.js found${ENDCOLOR}"
  exit 1
fi
if [ ! -f './package.json' ]
then
  echo -e "${RED}Fail: No package.json found${ENDCOLOR}"
  exit 1
fi

echo -e "${YELLOW}Packaging npm package${ENDCOLOR}"
npm pack

PACK="$(pwd)/$(ls | grep -E "^lukso.*tgz$")"
if [ ! -f "$PACK" ]
then
  echo -e "${RED}Fail: No tgz pack file found${ENDCOLOR}"
  exit 1
fi

echo -e "${YELLOW}Creating test directory${ENDCOLOR}"
cd ./.test

echo -e "${YELLOW}Creating package.json type=module${ENDCOLOR}"
cat > package.json <<EOF
{
  "type": "module",
  "devDependencies": {
    "typescript": "^4.3.5"
  },
  "scripts": {
    "build": "tsc"
  }
}
EOF
npm install

echo -e "${YELLOW}Installing $PACK"
npm install "$PACK"

echo -e "${YELLOW}Creating cjs require test${ENDCOLOR}"
cat > test.cjs <<EOF
const pkg = require('@lukso/lsp-smart-contracts/package.json');
if (pkg.version) {
  console.log("\x1b[32mSuccess: require package.json\x1b[0m");
} else {
  console.log("\x1b[31mFail: require package.json has no version property\x1b[0m");
  process.exit(1);
}
const { INTERFACE_IDS } = require('@lukso/lsp-smart-contracts');
if (INTERFACE_IDS) {
  console.log("\x1b[32mSuccess: require { INTERFACE_IDS }\x1b[0m");
} else {
  console.log("\x1b[31mFail: require { INTERFACE_IDS } does not yield an object\x1b[0m");
  process.exit(1);
}
EOF

echo -e "${YELLOW}Executing cjs require test${ENDCOLOR}"
if ! node test.cjs
then
  echo "${RED}Fail: require failed${ENDCOLOR}"
  exit 1
fi

echo -e "${YELLOW}Creating esm (ts) import test${ENDCOLOR}"
cat > test.ts <<EOF
import pkg from '@lukso/lsp-smart-contracts/package.json' assert { type: 'json' };
if (pkg.version) {
  console.log("\x1b[32mSuccess: import package.json\x1b[0m");
} else {
  console.log("\x1b[31mFail: import package.json has no version property\x1b[0m");
  process.exit(1);
}
import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts';
if (INTERFACE_IDS) {
  console.log("\x1b[32mSuccess: import { INTERFACE_IDS }\x1b[0m");
} else {
  console.log("\x1b[31mFail: import { INTERFACE_IDS } does not yield an object\x1b[0m");
  process.exit(1);
}
EOF

echo -e "${YELLOW}Creating tsconfig.json to allow json import${ENDCOLOR}"
cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "esnext",
    "strict": true,
    "outDir": "dist",
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "nodenext",
    "noImplicitAny": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "allowJs": true,
    "baseUrl": ".",
    "lib": [
      "ES2018",
      "dom",
      "dom.iterable",
      "scripthost"
    ],
    "resolveJsonModule": true
  },
  "include": [
    "./*.ts",
    "./node_modules/@lukso/lsp-smart-contracts/**/*.ts",
    "./node_modules/@lukso/lsp-smart-contracts/**/*.js",
    "./node_modules/@lukso/lsp-smart-contracts/**/*.json"
  ]
}
EOF

echo -e "${YELLOW}Testing import${ENDCOLOR}"
if ! npx esbuild test.ts --bundle --outfile=dist/test.mjs
then
  echo "${RED}Fail: import failed${ENDCOLOR}"
  exit 1
fi
ls dist

echo -e "${YELLOW}Testing import${ENDCOLOR}"
if ! node dist/test.mjs
then
  echo "${RED}Fail: import failed${ENDCOLOR}"
  exit 1
fi
