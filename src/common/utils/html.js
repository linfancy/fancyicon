import fs from 'fs';
import _ from 'underscore';
import path from 'path';

const TEMPLATE_FILE = 'template.html';

function createTemplate (htmlConfig) {
    return new Promise((resolve, reject) => {
        const file = path.join(__static, '/template', TEMPLATE_FILE);
        fs.readFile(
            file,
            'utf-8',
            function (err, template) {
                if (err) {
                    reject(err);
                }
                const t = _.template(template)(htmlConfig);
                resolve(t);
            }
        );
    });
}
function createFile (config, htmlTemplate) {
    return new Promise((resolve, reject) => {
        const file = path.resolve(config.cssPath, '../', 'test.html');
        fs.writeFile(file, htmlTemplate, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve(config);
        });
    });
}
async function createHtml (config) {
    const htmlConfig = _.extend({}, config);
    for (let i = 0; i < config.glyphs.length; i++) {
        htmlConfig.glyphs[i].unicode = '\\' + config.glyphs[i].code.toString(16);
        htmlConfig.glyphs[i].unicodeText = htmlConfig.glyphs[i].unicode.replace(/\\/, '&#x');
    }
    const htmlTemplate = await createTemplate(htmlConfig);
    await createFile(config, htmlTemplate);
}
export { createHtml };
