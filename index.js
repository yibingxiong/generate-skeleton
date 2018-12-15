const Skeleton =  require('./src/skeleton.js');
const fs = require('fs');
const pluginDefaultConfig = {
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
    hide: ['.homefootBar', '.homefootBar_hudu', '.swipe-tip-con'],
    grayBlock: ['.user-detail-logo', '.return-module', '.headlines-image', '.return-con-ab'],
    cookies: [],
    cssUnit: 'rem',
    decimal: 1,
    logLevel: 'info',
    quiet: false,
    noInfo: false,
    logTime: true,
    headless: false,
    debug: false,
  }
let seleton = new Skeleton(pluginDefaultConfig);

async function main() {
  try {

    let launchInfo = await seleton.launchBrowser()
    let res = await seleton.genHtml('http://mtongzhen.58.com/431382202000#/');
    fs.writeFileSync('./html.html', res.html, 'utf8');
    fs.writeFileSync('./styles.css', res.styles, 'utf8')
    fs.writeFileSync('./rawHtml.html', res.rawHtml, 'utf8');
    fs.writeFileSync('./skeletonHtml.html', res.skeletonHtml);
  } catch (e) {
    console.error(e);
  }

}


// setTimeout(() => {
//     seleton.genHtml('http://mtongzhen.58.com/431382202000#/')
//     .then(res => {
//         fs.writeFileSync('./html.html', res.html, 'utf8');
//         fs.writeFileSync('./styles.css', res.styles, 'utf8')
//         fs.writeFileSync('./rawHtml.html', res.rawHtml, 'utf8');
//     })
//     .catch(e => {
//         console.log(e);
//     })
// }, 10000);

main();