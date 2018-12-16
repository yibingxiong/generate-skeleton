#!/usr/bin/env node
const config = require('./getConfig');
const Skeleton = require('./skeleton');
const fs = require('fs');
const path = require('path');
const { log } = require('./util');

async function main() {
    console.log('----------全部配置如下------------');
    console.log();
    console.log(config);
    console.log('----------配置输出完毕------------');
    console.log();
    console.log();
    log.success('开始生成骨架屏, 请稍等...');
    const seleton = new Skeleton(config);

    try {
        await seleton.launchBrowser();
        const res = await seleton.genHtml(config.url);
        fs.writeFileSync(path.resolve(config.output), res.skeletonHtml);
        log.success('生成骨架屏成功!');
        log.success('文件路径:' + path.resolve(config.output));
        process.exit(0);
    } catch (e) {
        console.error(e);
        log.error('生成骨架屏失败了, 请查看以上堆栈信息分析原因');
        process.exit(1);
    }

}

main();