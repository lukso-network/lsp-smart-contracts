require("hardhat/register");

module.exports = async () => {
  return {
    roots: ["<rootDir>"],
    transform: {
      "^.+\\.tsx?$": [
        "esbuild-jest",
        {
          sourcemap: true,
          loaders: {
            ".spec.ts": "ts",
          },
        },
      ],
    },
    globals: {
      ethers,
    },
    logHeapUsage: true,
    testEnvironment: "node",
    setupFilesAfterEnv: ["./jest.setup.ts"],
    maxWorkers: 32,
    maxConcurrency: 10,
    reporters: ["default"],
  };
};
