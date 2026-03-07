module.exports = {
  extends: [
    // List of rules: https://eslint.org/docs/rules
    "eslint:all"
  ],
  env: {
    browser: true,
    node: true,
    es2020: true
  },
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    eqeqeq: ['error', 'always'],
    semi: ['error', 'always'],
    quotes: ['error', 'single'],
  },
};
