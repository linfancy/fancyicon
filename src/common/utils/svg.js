import fs from 'fs';
import Svgo from 'svgo';
import xml2js from 'xml2js';
import path from 'path';
import SvgPath from 'svgpath';
import { template as unTemplate, reduce as unReduce } from 'underscore';
import svgImageFlatten from './svg_image_flatten.js';

const svgOptimizer = new Svgo({
    plugins: [{ removeViewBox: false }]
});

const xml2jsParser = new xml2js.Parser();

const TEMPLATE_FILE = 'template.svg';

const SVG_CONFIG_DEFAULTS = {
    horizAdvX: 1024,
    unitsPerEm: 1024,
    ascent: 1024,
    descent: 0
};

// let maxCode = null;

// let allocatedRefCode = (!maxCode) ? 59392 : maxCode + 1;

const preProcessing = [
    function stripFills (xml) {
        return xml.replace(/ fill=".*?"/gi, ' fill="none"');
    }
];

function xml2json (data, xml, done) {
    xml2jsParser.parseString(data, function (err, result) {
        done(result, xml);
    });
}

/**
 * 将svg路径中的fill颜色替换
 * @param {}} xml
 */
function preProcess (xml) {
    const that = this;
    return new Promise((resolve, reject) => {
        preProcessing.forEach(function (func) {
            xml = func.call(that, xml);
        });
        return resolve(xml);
    });
}

/**
 * 格式化xml
 * @param {} xml
 * @param {*} file
 */
function optimize (xml, file) {
    return new Promise((resolve, reject) => {
        svgOptimizer.optimize(xml, { path: file }).then(function (optimized) {
            resolve({ xml, optimized });
        });
    });
}

/**
 *
 */
function dealXml2json (optimized, xml) {
    return new Promise((resolve, reject) => {
        if (!optimized.data) {
            return reject('Could not optimize SVG');
        }
        xml2json(optimized.data, xml, (optimizedJson, xml) => {
            resolve({ optimizedJson, xml });
        });
    });
}
// //生成svg字体文件
function create (config, done) {
    const svgConfig = Object.assign({}, SVG_CONFIG_DEFAULTS, config);

    const p = path.join(__static, '/template', TEMPLATE_FILE);
    fs.readFile(p, 'utf-8', function (err, template) {
        if (err) {
            return done(err);
        }
        // TODO:换掉underscore
        const temp = unTemplate(template);
        const t = temp(svgConfig);
        return done(t);
    });
}

function normalizePath (config, svg, xml) {
    return new Promise((resolve, reject) => {
        const svgConfig = Object.assign({}, SVG_CONFIG_DEFAULTS, config);

        if (!svg || !svg.$ || !svg.$.viewBox) {
            return reject('No bounding box information could be found for this SVG.');
        }
        // 获取svg.path的路径集合
        let tempSvgPath = '';
        if (svg.path) {
            tempSvgPath = svg.path;
        } else if (svg.g && svg.g.length > 0 && svg.g[0].path) {
            tempSvgPath = svg.g[0].path;
        }

        // 获取原始svg图片的宽高
        const viewBox = svg.$.viewBox.split(' ').slice(2);

        // 定义iconfont的高
        const fontHeight = svgConfig.ascent - svgConfig.descent;

        // iconfont的高与实际字体的高的比。
        const scale = fontHeight / Number(viewBox[1]);

        // 将所有路径汇总
        const svgContent = unReduce(tempSvgPath, function (memo, path) {
            memo += path.$.d;
            return memo;
        }, '');
        // 将路径放大，移位，路径处理
        //
        const svgImage = svgImageFlatten(xml);
        const path = new SvgPath(svgContent).translate(-svgImage.x, -svgImage.y).scale(scale).abs().round(1);

        const d = setD(path);
        const rpath = new SvgPath(svgContent).scale(scale, -scale).translate(0, fontHeight).abs().round(0);
        const rd = setD(rpath);
        const unicode = setUnicode(config);
        // return done(null, {path:path,unicode:unicode,d:d,svg:svg});
        resolve({
            code: unicode,
            svg: {
                path: d,
                routatePath: rd,
                width: SVG_CONFIG_DEFAULTS.ascent
            }
        });
    });
}

function setUnicode (config) {
    const unicode = ++(config.maxUnicode);
    return unicode;
}

function setD (path) {
    // path = new SvgPath(path).rotate(90);
    let segments = path.segments;
    for (let i = 0; i < segments.length; i++) {
        segments[i] = segments[i].join(' ');
    }
    segments = segments.join(' ');

    // return '<svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 '+SVG_CONFIG_DEFAULTS.ascent+' '+SVG_CONFIG_DEFAULTS.ascent+'" version="1.1"><path d="'+segments+'"></path></svg>';
    return segments;
}

// function optimize(config, file, done) {
//   async.waterfall([
//     function(next) {
//       fs.readFile(file, 'utf-8', next);
//     },
//     function(xml, next) {
//       preProcess(xml, next);
//     },
//     function(xml, next) {
//       // svgOptimizer.optimize(xml, function(optimized) {
//       //   next(null, xml, optimized)
//       // });
//       svgOptimizer.optimize(xml, {path:file}).then(function(optimized){
//         next(null, xml, optimized)
//       })
//     },
//     function(xml, optimized, next) {
//       if (!optimized.data) {
//         return next('Could not optimize SVG');
//       }
//       xml2json(optimized.data,xml, next);
//     },
//     function(optimizedJson,xml,next) {
//       normalizePath(config, optimizedJson.svg, xml, next);
//     }
//   ], done);
// }
function readFile (file) {
    return new Promise((resolve, reject) => {
        const data = fs.readFileSync(file, 'utf8');
        resolve(data);
    });
}
async function svgInfo (info, file, done) {
    let xml;
    const r0 = await readFile(file);
    const r1 = await preProcess(r0);
    const r2 = await optimize(r1, file);
    const r3 = await dealXml2json(r2.optimized, r2.xml);
    const r4 = await normalizePath(info, r3.optimizedJson.svg, r3.xml);
    done && (await done(r4));

    // async.waterfall([
    //   function(next) {
    //     fs.readFile(file, 'utf-8', next);
    //   },
    //   function(xml, next) {
    //     // xml = xml;
    //     console.log(xml);
    //     debugger;
    //     preProcess(xml, next);
    //   },
    //   function(xml, next) {
    //     svgOptimizer.optimize(xml, {path:file}).then(function(optimized){
    //       next(null, xml, optimized)
    //     })
    //     // svgOptimizer.optimize(xml,  function(optimized) {

    //     //   next(null, xml, optimized)
    //     // });
    //   },
    //   function(xml, optimized, next) {
    //     if (!optimized.data) {
    //       return next('Could not optimize SVG');
    //     }
    //     xml2json(optimized.data,xml, next);
    //   },
    //   function(optimizedJson,xml,next) {
    //     normalizePath(info, optimizedJson.svg, xml, next);
    //   }
    // ], done);
}
const Svg = {
    svgInfo,
    create
};
// exports.optimize = optimize;
// exports.create = create;
export { Svg };
// exports.setSvgPath = setSvgPath;
