
const SHARED_RULESETS = [
  'plugin:react/recommended',
  'airbnb',
  'prettier',
  'plugin:import/recommended',
  'plugin:import/typescript',
  'plugin:playwright/playwright-test',
];

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  extends: SHARED_RULESETS,
  parser: 'babel-eslint',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [
    {
      parser: '@typescript-eslint/parser',
      plugins: [
        'react',
        '@typescript-eslint',
      ],
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'indent': ['error', 2],
        'eol-last': ['error', 'always'],
        'no-param-reassign': 'off',
        'no-console': 'off',
        'curly': 'error',
        'no-unused-vars': 'warn',
        'key-spacing': ['error', { 'afterColon': true }],
        'class-methods-use-this': 'off',
        'consistent-return': 'off',
        'semi': 'error',
        'comma-dangle': ['error', 'always-multiline'],
        'max-len': [
          'error',
          {
            code: 120,
            tabWidth: 2,
            ignoreComments: true,
          },
        ],
      },
    },
  ],
};
