// eslint-disable-next-line no-undef
module.exports = {
  "root": true,
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  'overrides': [
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'plugins': [
    'react',
    '@typescript-eslint',
  ],
  'rules': {
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
};
