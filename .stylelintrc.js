module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order'
  ],
  rules: {
    'no-descending-specificity': null,
    'scss/at-import-partial-extension': null,
    'scss/no-global-function-names': null,
    'selector-class-pattern': null
  },
};
