const program = require('commander');
const { log, getVersion } = require('./util');
const fs = require('fs');
const { defaultOptions } = require('./config/config');

function list(val) {
    if(!val) {
        return;
    }
    return val.split(',');
}
program
    .version(getVersion())
    .option('-u, --url [value]', '你要生成骨架屏的url, 必须在你的机器上可访问')
    .option('-o, --output [value]', '骨架屏输出路径')
    .option('--loading [spin|chiaroscuro|shine]', 'loading的样式',()=>{}, 'spin')
    .option('-f, --file [value]', '配置文件路径')
    .option('--hide <items>', '要隐藏的元素的selector', list)
    .option('--grayBlock <items>', '要灰化的元素的selector', list)
    .option('-d, --debug', '是否开启debug模式')
    .option('--headless', '是否不开启浏览器')
    .option('-c, --cssUnit [value]', 'css长度单位')
    .option('--device [value]', '设备名称')
    .option('--decimal [value]', '缩放比例')
    .parse(process.argv);
const cmdConf = {
    debug: program.debug,
    headless: program.headless,
    hide: program.hide,
    grayBlock: program.grayBlock,
    cssUnit: program.cssUnit,
    output: program.output,
    url: program.url,
    device: program.device,
    decimal: program.decimal,
    loading: program.loading
}

for (const k in cmdConf) {
    let v = cmdConf[k];
    if (v == null || v === '') {
        delete cmdConf[k];
    }
}

const file = program.file;


let fsConf = {};

if (/(\.json)$/.test(file)) {
    try {
        let fileStr = fs.readFileSync(file, 'utf8');
        fsConf = JSON.parse(fileStr);
    } catch (e) {
        log.error('配置文件不存在或不是有效的json');
    }
}

function getConfig () {
    let res = {
        ...defaultOptions,
        ...fsConf,
        ...cmdConf
    };

    if (!res.output) {
        log.error('必须指定生成的骨架屏的路径');

    }

    if (!res.url) {
        log.error('要生成骨架屏的url是必须的');
    }
    return res;
}

module.exports = getConfig();