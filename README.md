# FancyIcon
> power by fancylin

一个跨平台的iconfont自动生成工具

## 下载链接

[window下载](https://fancylin.cn/fancyicon/release/FancyIcon_Setup_0.0.1.exe)

[mac下载]()


##

## 使用步骤
* 拖入svg图标，或原本已生成好的iconfont.config.json
* 可修改图标名称，该名称为生成iconfont class 名称，如名称为 car，那么对应该iconfont的css class为 .iconfont-car
* 点击下一步，选择生成字体存放目录
* 可更改生成iconfont的字体包名称，iconfont对应css class 的前缀，如 iconfont可改为icon
* 点击确认，即可生成iconfont字体图标，对应的css，和一个示例页面

### 使用视频
![图片描述](./build/1.gif)

## 开始开发

```bash
# clone from git
git clone https://github.com/linfancy/fancyicon.git

# install dependencies
cd fancyicon & npm install

# develop
npm run dev

# compile
npm run compile

# dist
npm run dist

```