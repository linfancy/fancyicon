'use strict';

const fs = require('fs');

const common = {
    exitFile: function (path) {
        return new Promise((resolve, reject) => {
            const folderExists = fs.existsSync(path);
            if (!folderExists) {
                fs.mkdir(path, function (err) {
                    if (err) reject(err);
                    else resolve(path);
                });
            } else {
                resolve(path);
            }
        });
    },
    deleteFile: function (path, done) {
        const _this = this;
        let files = [];
        if (fs.existsSync(path)) {
            if (fs.statSync(path).isDirectory()) {
                files = fs.readdirSync(path);
                files.forEach(function (file, index) {
                    const curPath = path + '/' + file;
                    if (fs.statSync(curPath).isDirectory()) {
                        _this.deleteFile(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
            } else {
                fs.unlinkSync(path);
            }
        } else {
            done && done(null);
        }
    },
    // 复制文件
    copyFile: function (oldPath, newPath, done) {
        const stat = fs.lstatSync(oldPath);

        if (stat.isDirectory()) {
            return false;
        }
        const readStream = fs.createReadStream(oldPath);
        const writeStream = fs.createWriteStream(newPath);
        readStream.pipe(writeStream);
        readStream.on('end', function () {
            done(null, {
                code: 0,
                message: 'ok',
                data: { oldPath: oldPath, newPath: newPath }
            });
        });
        readStream.on('error', function (err) {
            done(err);
        });
    }
};

export { common };
