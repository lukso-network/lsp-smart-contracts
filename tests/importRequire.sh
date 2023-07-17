#!/usr/bin/env bash
mktmp=$(mktemp -d)
trap "rm -rf $mktmp" EXIT
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
cd $mktmp

echo -e "${YELLOW}Installing $PACK"
npm install "$PACK"

echo -e "${YELLOW}Creating cjs require test${ENDCOLOR}"
cat > test.cjs <<EOF
const pkg = require('@lukso/lsp-smart-contracts/package.json');
console.log("\x1b[32mSuccess: require package.json\x1b[0m");
const { INTERFACE_IDS } = require('@lukso/lsp-smart-contracts');
console.log("\x1b[32mSuccess: require { INTERFACE_IDS }}\x1b[0m");
EOF

echo -e "${YELLOW}Executing cjs require test${ENDCOLOR}"
if ! node test.cjs
then
  echo "${RED}Fail: require failed${ENDCOLOR}"
  exit 1
fi

echo -e "${YELLOW}Creating esm (ts) import test${ENDCOLOR}"
cat > test.ts <<EOF
import pkg from '@lukso/lsp-smart-contracts/package.json';
console.log("\x1b[32mSuccess: import package.json\x1b[0m");
import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts';
console.log("\x1b[32mSuccess: import { INTERFACE_IDS }\x1b[0m");
EOF

echo -e "${YELLOW}Creating package.json type=module${ENDCOLOR}"
cat > package.json <<EOF
{
  "type": "module"
}
EOF

echo -e "${YELLOW}Creating tsconfig.json to allow json import${ENDCOLOR}"
cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "es2022",
    "strict": true,
    "outDir": "dist",
    "jsx": "preserve",
    "importHelpers": true,
    "moduleResolution": "node",
    "noImplicitAny": true,
    "experimentalDecorators": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "allowJs": true,
    "baseUrl": ".",
    "types": [
      "webpack-env",
      "jest",
      "node",
      "chrome"
    ],
    "lib": [
      "ES2018",
      "dom",
      "dom.iterable",
      "scripthost"
    ],
    "resolveJsonModule": true
  },
  "include": [
    "./*.ts"
  ],
  "exclude": [
    "./node_modules"
  ]
}
EOF

echo -e "${YELLOW}Testing import${ENDCOLOR}"
if ! npx ts-node --esm test.ts
then
  echo "${RED}Fail: import failed${ENDCOLOR}"
  exit 1
fi
