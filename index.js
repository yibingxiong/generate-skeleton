const Skeleton =  require('./src/skeleton.js');
const fs = require('fs');
const pluginDefaultConfig = {
    port: '8989',
    text: {
      color: '#EEEEEE'
    },
    image: {
      shape: 'rect', // `rect` | `circle`
      color: '#EFEFEF',
      shapeOpposite: []
    },
    button: {
      color: '#EFEFEF',
      excludes: [] 
    },
    svg: {
      color: '#EFEFEF',
      shape: 'circle', // circle | rect
      shapeOpposite: []
    },
    pseudo: {
      color: '#EFEFEF', // or transparent
      shape: 'circle', // circle | rect
      shapeOpposite: []
    },
    device: 'iPhone 6',
    debug: false,
    minify: {
      minifyCSS: { level: 2 },
      removeComments: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: false
    },
    defer: 5000,
    excludes: [],
    remove: [],
    hide: [],
    grayBlock: ['.user-detail-logo'],
    cookies: [],
    cssUnit: 'rem',
    decimal: 1,
    logLevel: 'info',
    quiet: false,
    noInfo: false,
    logTime: true
  }
let seleton = new Skeleton(pluginDefaultConfig, () => {});

setTimeout(() => {
    seleton.genHtml('https://mtongzhen.58.com/542624202000#/')
    .then(res => {
        fs.writeFileSync('./html.html', res.html, 'utf8');
        fs.writeFileSync('./styles.css', res.styles, 'utf8')
        fs.writeFileSync('./cleanedHtml', res.cleanedHtml, 'utf8');
        fs.writeFileSync('./rawHtml', res.rawHtml, 'utf8');
    })
    .catch(e => {
        console.log(e);
    })
}, 10000);