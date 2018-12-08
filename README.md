# FancyIcon
> power by fancylin

一个跨平台的iconfont自动生成工具

## 下载链接

##

## 使用步骤
* 拖入svg图标，或原本已生成好的iconfont.config.json
* 可修改图标名称，该名称为生成iconfont class 名称，如名称为 car，那么对应该iconfont的css class为 .iconfont-car
* 点击下一步，选择生成字体存放目录
* 可更改生成iconfont的字体包名称，iconfont对应css class 的前缀，如 iconfont可改为icon
* 点击确认，即可生成iconfont字体图标，对应的css，和一个示例页面

## 开始开发
Simply clone down this reposity, install dependencies, and get started on your application.

The use of the [yarn](https://yarnpkg.com/) package manager is **strongly** recommended, as opposed to using `npm`.

```bash
# clone from git
git clone https://github.com/linfancy/fancyicon.git

# install all the dependencies
cd fancyicon & npm install

# install dependencies

```

### Development Scripts

```bash
# run application in development mode
yarn dev

# compile source code and create webpack output
yarn compile

# `yarn compile` & create build with electron-builder
yarn dist

# `yarn compile` & create unpacked build with electron-builder
yarn dist:dir
```
