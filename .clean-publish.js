/**
 * @type {import('clean-publish').Config}
 */
module.exports = {
    withoutPublish: true,
    tempDir: 'prepared-package',
    fields: ['scripts'],
    files: [
        'docs',
        'src',
        '.prettierignore',
        '.gitignore',
        '.stackblitzrc',
        'coverage',
        /^prettier\.config\.(js|cjs)$/,
        /^tsconfig\.(\w+\.)?json$/,
        /^jest\.config\.(js|ts|mjs|cjs|json)$/,
        /^tsup\.config\.(js|ts|mjs|cjs|json)$/,
        /^aqu\.config\.(js|cjs|mjs|ts|json)$/,
        '.aqurc',
        /^\.syncpackrc(\.(json|yaml|yml|js|cjs))?$/,
        /^syncpack\.config\.(js|cjs)$/,
        '.config',
        'playground',
        'pnpm-workspace.yaml',
        'example',
        'tests',
        '.npmrc',
        'jestconfig.json'
    ],
};
