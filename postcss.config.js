module.exports = {
  plugins: [
    require('cssnano')({
      preset: [
        'default',
        {
          // 將所有註解移除
          discardComments: {
            removeAll: true
          }
        }]
    }),
    require('autoprefixer')
  ],
};