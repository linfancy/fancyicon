<div class="index flex flex-v">
    <header class="header flex">
        <div class="header-logo"></span><span class="header-text">SimpleIcon</span></div>
        <div class="mod-sidebar flex-1">
            <a href="javascript:;" class="sidebar-ico iconfont icon-close nodrag" @click="handleClose"><span class="ico-text">关闭</span> </a>
            <a href="javascript:;" class="sidebar-ico iconfont icon-shrink nodrag" @click="handleShrink"><span class="ico-text">缩小</span> </a>
            <a href="javascript:;" class="sidebar-ico iconfont icon-reset nodrag" @click="handleReset"><span class="ico-text">重置</span></a>
            <a href="javascript:;" class="sidebar-ico iconfont icon-update nodrag" @click="handleUpdate"><span class="ico-text">检查更新</span></a>
        </div>
    </header>
    <div class="wrapper flex-1">
        <div class="mod-tips" id="js_tips">报错报错报错报错</div>
        <div class="mod-loading" id="js_loading">
            <span class="ico-loading">字体正在生成中</span>
        </div>
        <div class="main flex">
            <div class="step1 flex-1">
                <div class="step1-tips" v-if="!info || !info.glyphs || info.glyphs.length <= 0">请拖入iconfont.config.json文件<br>或者svg图片</div>
                <div class="step1-wrapper nodrag" ref="js_select_files">
                    <div v-if="info && info.glyphs" v-for="(item, index) in info.glyphs" :data-num="index" class="mod-svg">
                        <a href='javascript:;' class='svg-close' :data-index="index" @click="handleDelIcon">+</a>
                        <div class='svg-img' title='点我更换SVG' @click.self="handleEditIcon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" :viewBox="'0 0 '+item.svg.width+' '+item.svg.width"  version="1.1">
                                <path fill="#fff" :d="item.svg.path"></path>
                            </svg>
                        </div>
                        <span class='svg-text' contenteditable='true' @blur="handleEditName">{{item.name}}</span>
                        <span class='svg-text js_svg_unicode' maxlength='5' contenteditable='true' @blur="handleEditCode">\{{item.code.toString(16)}}</span>
                    </div>
                </div>
            </div>
            <div class="step2 flex-1" :class="showStep2 ? 'show':''">
                <div class="mod-form">
                    <div class="form-line" :class="{'hide':!showRes1}">
                        <label class="form-label">资源存放路径：</label>
                        <div class="form-element new-form-element">
                            <span class="form-text">{{info.resPath}}</span><a href="javascript:;" class="iconfont icon-select" @click="handleResPath"></a>
                        </div>
                    </div>
                    <div class="form-line new-form-line" :class="{'hide':!showRes2}">
                        <div class="form-line">
                            <label class="form-label">css存放路径：</label>
                            <div class="form-element new-form-element">
                                <span class="form-text">{{info.cssPath}}</span>
                                <a href="javascript:;" class="iconfont icon-select"  @click="handleCssPath"></a>
                            </div>
                        </div>
                        <div class="form-line">
                            <label class="form-label">font存放路径：</label>
                            <div class="form-element new-form-element">
                                <span class="form-text">{{info.fontPath}}</span>
                                <a href="javascript:;" class="iconfont icon-select"  @click="handleFontPath"></a>
                            </div>
                        </div>
                    </div>
                    <div class="form-line">
                        <label class="form-label">字体文件命名：</label>
                        <div class="form-element">
                            <input class="form-input nodrag" value="iconfont" v-model="info.name" />
                        </div>
                        <p class="form-tips">字体文件命名，默认为iconfont.ttf</p>
                    </div>
                    <div class="form-line">
                        <label class="form-label">css样式前缀：</label>
                        <div class="form-element">
                            <input class="form-input nodrag" value="icon" v-model="info.css_prefix_text" />
                        </div>
                        <p class="form-tips">若图标文件名为account.svg，默认css字体样式为 .icon-account</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <footer class="footer">
        <a href="javascript:;" class="mod-btn ext-btn-gray-s nodrag" :class="{'hide' :!showBtnNext}" @click="handleNextStep">下一步</a>
        <a href="javascript:;" class="mod-btn ext-btn-gray-s nodrag" :class="{'hide' : !showBtnComplete}" @click="handleComplete">生成字体</a>
        <a href="javascript:;" class="mod-btn ext-btn-gray-s nodrag" :class="{'hide': !showBtnLast}" @click="handleLastStep">上一步</a>
    </footer>
</div>
