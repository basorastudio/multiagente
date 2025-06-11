module.exports = {
  presets: [
    ['@quasar/babel-preset-app', {
      useBuiltIns: 'entry'
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator'
  ],
  overrides: [
    {
      test: /node_modules\/date-fns-tz/,
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: ['last 2 versions', 'ie >= 11']
          }
        }]
      ]
    }
  ]
}
