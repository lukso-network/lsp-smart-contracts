require('hardhat/register');

module.exports = async () => {
	return {
		roots: ['<rootDir>'],
		transform: {
			'^.+\\.tsx?$': [
				'esbuild-jest',
				{
					sourcemap: true,
					loaders: {
						'.test.ts': 'ts',
					},
				},
			],
		},
		globals: {
			ethers,
		},
		testMatch: ['**/?(*.)+(spec|test).[t]s?(x)'],
		// do not run tests located under any tests/ subdirectory
		testPathIgnorePatterns: ['<rootDir>/tests/[^/]+/tests/'],
		logHeapUsage: true,
		testEnvironment: 'node',
		setupFilesAfterEnv: ['./jest.setup.ts'],
		maxWorkers: '50%',
		maxConcurrency: 10,
		reporters: ['default'],
		verbose: true,
		// silent: true,
	};
};
