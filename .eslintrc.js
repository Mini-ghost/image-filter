module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'html',
    '@typescript-eslint',
  ],
  rules: {
    'no-undef': 'off',
    'no-unused-vars': 'off',
    'no-console': process.env.NODE_ENV === 'production'
      ? [
        'error',
        {
          allow: ['error']
        }
      ]
      : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': ['error', 'always']
  },
};
