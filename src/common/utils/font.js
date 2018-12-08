import { Svg } from 'common/utils/svg.js';
import svg2ttf from 'svg2ttf';
import fs from 'fs';
import path from 'path';
import ttf2woff from 'ttf2woff';
import ttf2eot from 'ttf2eot';
import ttf2woff2 from 'ttf2woff2';

function createSvg (inputDir = '', outputDir = '', config) {
    return new Promise((resolve, reject) => {
        config = config || {};

        const mapFunction = function (charConfig) {
            const result = Object.assign({}, charConfig, {
                code: charConfig.code.toString(16).replace('e', '&#xe') + ';',
                d: charConfig.svg.routatePath
            });
            return result;
        };
        const glyphs = config.glyphs.map(mapFunction);
        Svg.create(Object.assign({}, config, { glyphs: glyphs }), function (template) {
            resolve(template);
        });
    });
}

function saveSvg (outputDir, config, template = '') {
    return new Promise((resolve, reject) => {
        const file = path.resolve(outputDir, config.name + '.svg');
        fs.writeFile(file, template, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function createTtf (template = '') {
    return new Promise((resolve, reject) => {
        const ttf = svg2ttf(template, {});
        if (!ttf) {
            return reject('Could not create TTF file');
        }

        return resolve(Buffer.from(ttf.buffer));
    });
}
function saveTtf (outputDir, config, buffer) {
    return new Promise((resolve, reject) => {
        const file = path.resolve(outputDir, config.name + '.ttf');
        fs.writeFile(file, buffer, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve(null, file);
        });
    });
}
function createEot (ttf) {
    return new Promise((resolve, reject) => {
        const eot = ttf2eot(new Uint8Array(ttf));
        if (!eot) {
            return reject('Could not create WOFF file');
        }
        return resolve(Buffer.from(eot.buffer));
    });
}
function saveEot (outputDir, config, eot) {
    return new Promise((resolve, reject) => {
        const file = path.resolve(outputDir, config.name + '.eot');
        fs.writeFile(file, eot, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve(file);
        });
    });
}
function createWoff (config, ttf) {
    return new Promise((resolve, reject) => {
        const woff = ttf2woff(new Uint8Array(ttf), config);
        if (!woff) {
            return reject('Could not create WOFF file');
        }

        return resolve(Buffer.from(woff.buffer));
    });
}
function saveWoff (outputDir, config, woff) {
    return new Promise((resolve, reject) => {
        const file = path.resolve(outputDir, config.name + '.woff');
        fs.writeFile(file, woff, function (err) {
            if (err) {
                return reject(err);
            }
            return resolve(file);
        });
    });
}
function createWoff2 (config, ttf) {
    return new Promise((resolve, reject) => {
        const woff2 = ttf2woff2(ttf, config);
        if (!woff2) {
            return reject('Could not create WOFF file');
        }
        return resolve(woff2.buffer);
    });
}
function saveWoff2 (outputDir, config, woff2) {
    return new Promise((resolve, reject) => {
        const file = path.resolve(outputDir, config.name + '.woff2');
        fs.writeFile(file, Buffer.from(woff2), function (err) {
            if (err) {
                return reject(err);
            }
            return resolve(file);
        });
    });
}
async function generateFont (inputDir, outputDir, config) {
    const template = await createSvg(inputDir, outputDir, config);
    await saveSvg(outputDir, config, template);
    const ttf = await createTtf(template);
    await saveTtf(outputDir, config, ttf);
    const eot = await createEot(ttf);
    await saveEot(outputDir, config, eot);
    const woff = await createWoff(config, ttf);
    await saveWoff(outputDir, config, woff);
    const woff2 = await createWoff2(config, ttf);
    await saveWoff2(outputDir, config, woff2);
}

export { generateFont };

// const _ = require('underscore');

// const svg = require('./svg.js');
// ;

// const CONFIG_FILE = 'config.json';

// function createSvg (dir = '', config, done) {
//     config = config || {};

//     const mapFunction = function (charConfig, done) {
//         const result = _.extend({}, charConfig, {
//             code: charConfig.code.toString(16).replace('e', '&#xe') + ';',
//             d: charConfig.svg.routatePath
//         });

//         return done(null, result);
//     };

//     async.map(config.glyphs, mapFunction, function (err, data) {
//         if (err) {
//             return done(err);
//         }
//         svg.create(_.extend({}, config, { glyphs: data }), done);
//     });
// }

// function loadConfig (config, done) {
//     return done(null, config);
// }

// function generateFont (inputDir, outputDir, config, done) {
//     async.auto({
//         loadConfig: function (next) {
//             loadConfig(config, next);
//         },
//         createSvg: ['loadConfig', function (data, next) {
//             createSvg(inputDir, data.loadConfig, next);
//         }],
//         saveSvg: ['loadConfig', 'createSvg', function (data, next) {
//             const file = path.resolve(outputDir, data.loadConfig.name + '.svg');
//             fs.writeFile(file, data.createSvg, function (err) {
//                 if (err) {
//                     return next(err);
//                 }
//                 return next(null, file);
//             });
//         }],
//         createTtf: ['loadConfig', 'createSvg', function (data, next) {
//             // 这里是一开始问题的根源
//             // var ttf = svg2ttf(data.createSvg, data.loadConfig);

//             const ttf = svg2ttf(data.createSvg, {});
//             if (!ttf) {
//                 return next('Could not create TTF file');
//             }

//             return next(null, Buffer.from(ttf.buffer));
//         }],
//         saveTtf: ['loadConfig', 'createTtf', function (data, next) {
//             const file = path.resolve(outputDir, data.loadConfig.name + '.ttf');
//             fs.writeFile(file, data.createTtf, function (err) {
//                 if (err) {
//                     return next(err);
//                 }
//                 return next(null, file);
//             });
//         }],
//         createEot: ['loadConfig', 'createTtf', function (data, next) {
//             const eot = ttf2eot(new Uint8Array(data.createTtf));
//             if (!eot) {
//                 return next('Could not create WOFF file');
//             }

//             return next(null, Buffer.from(eot.buffer));
//         }],
//         saveEot: ['loadConfig', 'createEot', function (data, next) {
//             const file = path.resolve(outputDir, data.loadConfig.name + '.eot');
//             fs.writeFile(file, data.createEot, function (err) {
//                 if (err) {
//                     return next(err);
//                 }

//                 return next(null, file);
//             });
//         }],
//         createWoff: ['loadConfig', 'createTtf', function (data, next) {
//             const woff = ttf2woff(new Uint8Array(data.createTtf), data.loadConfig);
//             if (!woff) {
//                 return next('Could not create WOFF file');
//             }

//             return next(null, Buffer.from(woff.buffer));
//         }],
//         saveWoff: ['loadConfig', 'createWoff', function (data, next) {
//             const file = path.resolve(outputDir, data.loadConfig.name + '.woff');
//             fs.writeFile(file, data.createWoff, function (err) {
//                 if (err) {
//                     return next(err);
//                 }
//                 return next(null, file);
//             });
//         }],
//         createWoff2: ['loadConfig', 'createTtf', function (data, next) {
//             const woff2 = ttf2woff2(data.createTtf, data.loadConfig);
//             if (!woff2) {
//                 return next('Could not create WOFF file');
//             }
//             return next(null, woff2.buffer);
//         }],
//         saveWoff2: ['loadConfig', 'createWoff2', function (data, next) {
//             const file = path.resolve(outputDir, data.loadConfig.name + '.woff2');
//             fs.writeFile(file, Buffer.from(data.createWoff2), function (err) {
//                 if (err) {
//                     return next(err);
//                 }
//                 return next(null, file);
//             });
//         }]
//     }, function (err, data) {
//         if (err) {
//             return done(err);
//         }
//         return done(null, { svg: data.saveSvg, ttf: data.saveTtf, woff: data.saveWoff, eot: data.saveEot, woff: data.saveWoff2 });
//     });
// }

// export { generateFont };
