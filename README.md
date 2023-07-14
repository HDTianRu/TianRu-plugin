#### 介绍

一个自用的yunzai的插件

#### 安装教程

首先进入plugins目录  

##### 从gitee安装
```bash
git clone --depth=1 https://gitee.com/HDTianRu/TianRu-plugin.git
```

##### 从github安装
```bash
git clone --depth=1 https://github.com/HDTianRu/TianRu-plugin.git
```

##### 安装依赖
如果遇到缺少qrcode依赖无法加载的  
进入yunzai目录执行  
```bash
pnpm install -P
```
如果没有pnpm可以先通过以下指令安装pnpm
```bash
npm install pnpm -g
```

#### 使用说明
配合云崽使用, https://gitee.com/Le-niao/Yunzai-Bot

#### 命令说明

|指令|功能|
|-----|-----|
|#天如帮助|展示指令列表|
|#更新小助手抽卡记录|该功能需要同时安装xiaoyao-cvs-plugin并绑定stoken，可以将微信小程序"提瓦特小助手"中的抽卡记录获取保存到本地|
|#code|执行各种语言，不影响本地|
|#来[数量]张[标签]涩图|多个标签空格隔开|
|#我是[QQ][回车][指令]|模拟指定QQ执行指令|
|#二维码|生成二维码|
|#homo|可以将数字变得恶臭|
|#执行sh|远程对服务器执行指令|
|#米哈游登录|获取stoken和cookie，搬运自TRSS-plugin|


###### 其中
"更新提瓦特小助手抽卡记录" 功能需同时安装"xiaoyao-cvs-plugin"：https://gitee.com/Ctrlcvs/xiaoyao-cvs-plugin.git  

"米哈游登录" 功能搬运自"TRSS-plugin"：https://Yunzai.TRSS.me  

"homo" 功能部分代码来自：https://github.com/itorr/homo  

#### 其他
有问题提issue或联系我QQ：3291691454  
提交发pull request  
最后希望能给项目点个star~