// Initial welcome page. Delete the following line to remove it.
"use strict";

import "common/media/css/style.css";

import fs from "fs";
import path from "path";
import { ipcRenderer } from "electron";
import { Svg } from "common/utils/svg.js";
import { generateFont } from "common/utils/font.js";
import { createCss } from "common/utils/css.js";
import { createHtml } from "common/utils/html.js";
import { common } from "../common/utils/common";

const vueScript = document.createElement("script");
vueScript.setAttribute("type", "text/javascript");
vueScript.setAttribute("src", "https://unpkg.com/vue");
vueScript.onload = init;
document.head.appendChild(vueScript);

const pathToAsset = path.join(__static, "/index.tpl");
const fileContents = fs.readFileSync(pathToAsset, "utf8");

const configPath = "iconfont.config.json";
const resultFontPath = "font";
const resultCssPath = "css";

function init() {
    Vue.config.devtools = false;
    Vue.config.productionTip = false;
    new Vue({
        data: {
            status: "new",
            versions: {
                electron: process.versions.electron,
                electronWebpack: require("electron-webpack/package.json")
                    .version
            },
            info: {
                name: "iconfont",
                css_prefix_text: "icon",
                hinting: true,
                familyname: "Example Icon Font",
                copyright: "Company Inc.",
                maxUnicode: 59392,
                ascent: 1024,
                glyphs: [],
                resPath: "",
                configPath: "",
                cssPath: "",
                fontPath: "",
                svgPath: ""
            }, // config内容

            // 控制各种节点消失隐藏
            showBtnLast: false,
            showBtnNext: true,
            showBtnComplete: false,
            showStep2: false, // 是否显示面板2
            showRes1: false, // 资源路径显示
            showRes2: false // 资源路径显示
        },
        methods: {
            /**
             * 关闭所有进程
             * @param {*} e
             */
            handleClose(e) {
                e.preventDefault();
                ipcRenderer.send("closeMainWindow");
            },

            /**
             * 缩小窗口
             * @param {*} e
             */
            handleShrink(e) {
                e.preventDefault();
                ipcRenderer.send("hideWindow");
            },

            open(b) {
                require("electron").shell.openExternal(b);
            },

            /**
             * 重置所有变量
             */
            resetPath() {
                this.info = {
                    name: "iconfont",
                    css_prefix_text: "icon",
                    hinting: true,
                    familyname: "Example Icon Font",
                    copyright: "Company Inc.",
                    maxUnicode: 59392,
                    ascent: 1024,
                    glyphs: [],
                    resPath: "",
                    configPath: "",
                    cssPath: "",
                    fontPath: "",
                    svgPath: ""
                };
            },

            /**
             * 下一步
             */
            handleNextStep() {
                if (this.info.glyphs.length <= 0) {
                    this.showTips(
                        "err",
                        "请上传iconfont.config.json文件或svg图片"
                    );
                } else {
                    this.showStep2 = true;
                    this.showBtnNext = false;
                    this.showBtnComplete = true;
                    this.showBtnLast = true;
                    if (this.status === "new") {
                        this.showRes1 = true;
                        this.showRes2 = false;
                    } else {
                        this.showRes1 = false;
                        this.showRes2 = true;
                    }
                }
            },

            /**
             * 上一步
             */
            handleLastStep() {
                this.showStep2 = false;
                this.showBtnNext = true;
                this.showBtnComplete = false;
                this.showBtnLast = false;
            },

            /**
             * 重置
             */
            handleReset() {
                this.resetPath();
                this.status = "old";
                this.showStep2 = false;
                this.showBtnNext = true;
                this.showBtnComplete = false;
                this.showBtnLast = false;
                if (this.status === "new") {
                    this.showRes1 = true;
                    this.showRes2 = false;
                } else {
                    this.showRes1 = false;
                    this.showRes2 = true;
                }
            },

            /**
             * 设置css存放路径
             */
            handleCssPath() {
                let tpath = ipcRenderer.sendSync("openDownloadPath");
                if (!tpath) tpath = "";
                else {
                    tpath = tpath[0];
                    this.info.cssPath = tpath;
                }
            },

            /**
             * 设置css存放路径
             */
            handleFontPath() {
                let tpath = ipcRenderer.sendSync("openDownloadPath");
                if (!tpath) tpath = "";
                else {
                    tpath = tpath[0];
                    this.info.fontPath = tpath;
                }
            },

            /**
             * 设置资源存放路径
             */
            handleResPath() {
                let tpath = ipcRenderer.sendSync("openDownloadPath");
                if (!tpath) tpath = "";
                else {
                    tpath = tpath[0];
                    this.info.resPath = tpath;
                    this.info.configPath = path.join(tpath, configPath);
                    this.info.cssPath = path.join(tpath, resultCssPath);
                    this.info.fontPath = path.join(tpath, resultFontPath);
                }
            },

            /**
             * 删除icon
             */
            handleDelIcon(e) {
                const index =
                    e.target.dataset && e.target.dataset.index
                        ? parseInt(e.target.dataset.index)
                        : "";
                this.info.glyphs.splice(index, 1);
            },

            /**
             * 编辑unicode
             */
            handleEditCode(e) {
                let temp = e.target.textContent;
                const p = e.target.parentNode;
                const index = p.getAttribute("data-num")
                    ? parseInt(p.getAttribute("data-num"))
                    : "";
                if (index !== "") {
                    const tempSvgUnicode =
                        "\\" + this.info.glyphs[index].code.toString(16);
                    if (tempSvgUnicode === temp) return;
                    if (!temp.match(/^\\e\w\w\w$/)) {
                        this.showTips("err", "unicode字符不符规定");
                        e.target.textContent = tempSvgUnicode;
                    } else {
                        temp = temp.replace(/\\e/, "e");
                        this.info.glyphs[index]["code"] = parseInt(temp, 16);
                        this.showTips("ok", "修改unicode字符成功！");
                    }
                }
            },

            /**
             * 编辑名称
             */
            handleEditName(e) {
                const temp = e.target.textContent;
                const p = e.target.parentNode;
                const index = p.getAttribute("data-num")
                    ? parseInt(p.getAttribute("data-num"))
                    : "";
                const tempSvgName = this.info.glyphs[index].name;
                if (temp === "") {
                    this.showTips("err", "文件名不能为空");
                    e.target.textContent = tempSvgName;
                } else if (e.target.textContent.length > 10) {
                    this.showTips("err", "文件名不能超过十个字符");
                    e.target.textContent = tempSvgName;
                } else if (e.target.textContent.match(/[<|>]/g)) {
                    this.showTips("err", "文件名不能包含特殊字符");

                    e.target.textContent = tempSvgName;
                } else {
                    this.info.glyphs[index]["name"] = temp;
                    this.showTips("ok", "文件名修改成功");
                }
            },

            /**
             * 重新更换图标
             */
            handleEditIcon(e) {
                const that = this;
                const p = e.target.parentNode;
                const index = p.getAttribute("data-num")
                    ? parseInt(p.getAttribute("data-num"))
                    : "";
                let tpath = ipcRenderer.sendSync("chooseFile");
                if (!tpath) tpath = "";
                else {
                    tpath = tpath[0];
                    Svg.svgInfo(that.info, tpath, data => {
                        that.info.glyphs[index]["svg"] = data.svg;
                    }).catch(e => {
                        console.error(e);
                        that.showTips("err", "修改图标失败");
                    });
                }
            },

            handleSelectFiles() {},

            _createFont(path) {
                const that = this;
                return new Promise((resolve, reject) => {
                    generateFont(path, that.info.fontPath, that.info)
                        .then(function() {
                            resolve();
                        })
                        .catch(e => {
                            reject(e);
                        });
                });
            },

            _createConfig() {
                const that = this;
                return new Promise((resolve, reject) => {
                    const file = path.resolve(
                        that.info.cssPath,
                        "../",
                        configPath
                    );
                    that.info.configPath = file;
                    fs.writeFile(file, JSON.stringify(that.info), function(
                        err
                    ) {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            },

            _createCss() {
                const that = this;
                return new Promise((resolve, reject) => {
                    createCss(that.info)
                        .then(resolve)
                        .catch(e => reject);
                });
            },

            _createHtml() {
                const that = this;
                return new Promise((resolve, reject) => {
                    createHtml(that.info)
                        .then(resolve)
                        .catch(e => reject);
                });
            },

            /**
             * 点击生成字体
             */
            handleComplete() {
                for (let i = 0; i >= 0 && i < this.info.glyphs.length; ) {
                    if (!this.info.glyphs[i]) {
                        this.info.glyphs.splice(i, 1);
                        i--;
                    } else {
                        i++;
                    }
                }
                const that = this;
                common
                    .exitFile(this.info.fontPath)
                    .then(this._createFont)
                    .then(this._createConfig)
                    .then(this._createCss)
                    .then(this._createHtml)
                    .then(function(res) {
                        that.showTips("info", "字体生成成功");
                    })
                    .catch(res => {
                        that.showTips("err", res.toString());
                    });
            },

            /**
             * 检查更新
             */
            handleUpdate() {
                console.log("更新0");
                ipcRenderer.send("updateSystem");
            },

            /**
             *  全局设置最大的unicode
             */
            setMaxUnicode() {
                if (this.info.glyphs.length > 0) {
                    const list = new Array();
                    for (const i in this.info.glyphs) {
                        list.push(this.info.glyphs[i]);
                    }
                    list.sort(function(num1, num2) {
                        return num1.code - num2.code;
                    });
                    this.info.maxUnicode = list[list.length - 1].code;
                } else {
                    this.info.maxUnicode = 59392;
                }
            },

            /**
             * 显示提示
             */
            showTips(type, message) {
                const ele = document.getElementById("js_tips");
                ele.innerHTML = message;
                switch (type) {
                    case "err":
                        ele.classList.add("show");
                        break;
                    case "info":
                        ele.classList.add("tips-info");
                        ele.classList.add("show");
                        break;
                    case "ok":
                        ele.classList.add("tips-ok");
                        ele.classList.add("show");
                        break;
                    default:
                        break;
                }
                removeShow();
                if (typeof type === "undefined") return false;

                function removeShow() {
                    const s = setTimeout(function() {
                        ele.classList.remove("show");
                        const t = setTimeout(function() {
                            ele.className = "mod-tips";
                            clearTimeout(t);
                        }, 500);
                        clearTimeout(s);
                    }, 1500);
                }
            }
        },
        mounted() {
            const that = this;
            // 拖拽文件进来事件
            const dragEvent = function(e) {
                const data = e.dataTransfer;

                const files = data.files;

                const dropFiles = [];
                if (data.items !== undefined) {
                    // Chrome拖拽文件逻辑
                    for (let i = 0; i < data.items.length; i++) {
                        const item = data.items[i];
                        // 用webkitGetAsEntry禁止上传目录
                        if (
                            item.kind === "file" &&
                            item.webkitGetAsEntry().isFile
                        ) {
                            const fileItem = item.getAsFile();
                            dropFiles.push(fileItem);
                        }
                    }
                } else {
                    for (let i = 0; i < data.files.length; i++) {
                        dropFiles.push(data.files[i]);
                    }
                }
                const file = dropFiles.length > 0 ? files[0] : "";
                if (file.name === configPath) {
                    that.resetPath();
                    if (that.info.configPath === "") {
                        that.info.configPath = file.path;
                        that.status = "old";
                    } else {
                        that.info.configPath = file.path;
                        that.status = "old";
                    }
                    const configContents = fs.readFileSync(
                        that.info.configPath
                    );
                    that.info = JSON.parse(configContents);
                } else if (file.name.indexOf(".svg") !== -1) {
                    that.setMaxUnicode();
                    const mapFunction = function(file, index) {
                        Svg.svgInfo(that.info, file.path, data => {
                            const index = file.name.indexOf(".svg");

                            Object.assign(data, {
                                name: file.name.substring(0, index),
                                width: 1000,
                                file: file.path,
                                src: "custom_icons"
                            });
                            that.info.glyphs.push(data);
                        }).catch(e => {
                            console.error(e);
                        });
                    };
                    dropFiles.map(mapFunction);

                    if (that.info.configPath === "") {
                        that.status = "new";
                    } else {
                        that.status = "old";
                    }
                } else {
                    that.showTips("err", "文件不符合要求");
                }
            };
            this.$refs.js_select_files.ondragleave = e => {
                e.preventDefault(); // 阻止离开时的浏览器默认行为
            };
            this.$refs.js_select_files.ondragenter = e => {};
            this.$refs.js_select_files.ondragover = e => {
                e.preventDefault();
            };
            this.$refs.js_select_files.ondrop = e => {
                e.preventDefault(); // 阻止拖放后的浏览器默认行为
                dragEvent(e);
            };
        },
        template: `${fileContents}`
    }).$mount("#app");
}
