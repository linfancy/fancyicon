import _ from 'underscore';
import fs from 'fs';
import path from 'path';
const common = require('../utils/common.js').common;
const TEMPLATE_FILE = 'template.css';

function createTemplate (cssConfig) {
    return new Promise((resolve, reject) => {
        const baseString = createBase64(cssConfig);
        if (baseString !== '') {
            cssConfig['base64'] = baseString;
        }
        const file = path.join(__static, '/template', TEMPLATE_FILE);
        fs.readFile(
            file,
            'utf-8',
            function (err, template) {
                if (err) {
                    reject(err);
                }
                const t = _.template(template)(cssConfig);
                resolve(t);
            }
        );
    });
}
function createDir (config) {
    return new Promise((resolve, reject) => {
        common.exitFile(config.cssPath)
            .then(resolve)
            .catch(reject);
    });
}
function createFile (config, cssTemplate) {
    return new Promise((resolve, reject) => {
        const file = path.resolve(config.cssPath, config.name + '.css');
        fs.writeFile(file, cssTemplate, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve(config);
        });
    });
}
function createBase64 (config) {
    const file = path.join(config.fontPath, config.name + '.ttf');
    if (fs.existsSync(file)) {
        let data = fs.readFileSync(file);
        data = Buffer.from(data).toString('base64');
        return 'data:application/font-ttf;charset=utf-8;base64,' + data;
    } else {
        return '';
    }
}
async function createCss (config) {
    const cssConfig = Object.assign({}, config);
    for (let i = 0; i < config.glyphs.length; i++) {
        cssConfig.glyphs[i].unicode = '\\' + config.glyphs[i].code.toString(16);
    }
    const cssTemplate = await createTemplate(cssConfig);
    await createDir(config);
    await createFile(config, cssTemplate);
}
export { createCss };
