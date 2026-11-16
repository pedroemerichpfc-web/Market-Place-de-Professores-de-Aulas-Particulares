// Configuracao do ESLint (flat config) do backend.
// As regras estao listadas explicitamente e qualquer violacao e "error",
// entao o comando `npm run lint` reprova o build quando ha problema.
const nodeGlobals = {
    process: 'readonly',
    console: 'readonly',
    Buffer: 'readonly',
    fetch: 'readonly',
    URL: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly'
};

export default [
    {
        ignores: ['node_modules/**']
    },
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: nodeGlobals
        },
        linterOptions: {
            reportUnusedDisableDirectives: 'error'
        },
        rules: {
            // Possiveis erros
            'no-undef': 'error',
            'no-unused-vars': ['error', { ignoreRestSiblings: true }],
            'no-unreachable': 'error',
            'no-dupe-keys': 'error',
            'no-redeclare': 'error',
            'no-self-compare': 'error',
            'no-constant-condition': 'error',
            'no-async-promise-executor': 'error',

            // Boas praticas
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'prefer-const': 'error',
            'no-var': 'error',

            // Estilo (padrao do grupo)
            indent: ['error', 4, { SwitchCase: 1 }],
            quotes: ['error', 'single', { avoidEscape: true }],
            semi: ['error', 'always'],
            'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
            'no-trailing-spaces': 'error',
            'eol-last': ['error', 'always'],
            'comma-dangle': ['error', 'never']
        }
    }
];
