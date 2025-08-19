# 天如插件

### 介绍

一个自用的yunzai的插件  
有获取"提瓦特小助手"抽卡记录，模拟执行各种语言代码，模拟指定QQ执行指令，伪造聊天记录，执行sh与js代码，生成二维码，将数字变成114514组合的恶臭数字....等各种小功能

### 安装教程

首先进入Yunzai目录  

#### 从gitee安装
```bash
git clone --depth=1 https://gitee.com/HDTianRu/TianRu-plugin.git ./plugins/TianRu-plugin
```

#### 从github安装
```bash
git clone --depth=1 https://github.com/HDTianRu/TianRu-plugin.git ./plugins/TianRu-plugin
```

#### 安装依赖
如果遇到缺少依赖无法加载的  
进入yunzai目录执行  
```bash
pnpm install -P
```
如果没有pnpm可以先通过以下指令安装pnpm
```bash
npm install pnpm -g
```

### 命令说明

|指令|功能|
|-----|-----|
|#天如帮助|展示指令列表|
|#更新小助手抽卡记录(抽卡记录链接)|可以将微信小程序"提瓦特小助手"中的抽卡记录获取保存到本地，推荐同时安装xiaoyao-cvs-plugin，可直接发送"#更新小助手抽卡记录"，无需带抽卡链接|
|#code|执行各种语言，不影响本地|
|#来[数量]张[标签]涩图|多个标签空格隔开|
|#我是[QQ][回车][指令]|模拟指定QQ执行指令|
|#伪造聊天[[回车][QQ(|名字) 消息]]...|伪造一份合并聊天记录|
|#二维码|生成二维码|
|#homo|可以将数字变得恶臭|
|#执行sh[指令]|远程对服务器执行指令|
|#执行js[指令]|执行js指令|
|#米哈游登录|获取stoken和cookie，搬运自TRSS-plugin|
|#帮我选 [选项1] [选项2] [...]|让bot从若干选项中选择一个|

#### 部分指令说明

<details><summary>展开/收起</summary>

##### 目录

[更新小助手抽卡记录](#更新小助手抽卡记录)  
[伪造聊天](#伪造聊天)  

##### 更新小助手抽卡记录

(非必须)"更新提瓦特小助手抽卡记录" 功能推荐同时安装[xiaoyao-cvs-plugin](https://gitee.com/Ctrlcvs/xiaoyao-cvs-plugin.git)  
使用说明:  
若安装xiaoyao-cvs-plugin且绑定stoken，可直接发送"#更新小助手抽卡记录"  
或者可以在指令后跟上抽卡链接或发送指令后再发抽卡链接

##### 伪造聊天

使用说明:  
基本用法(多行文字中间加上"\n")
```
#伪造聊天
3291691454 鸡你太美
3291691454 你干嘛\n哎哟啊哈
```
若需伪造图片消息，消息格式为"pic[图片链接]"，示例如下
```
#伪造聊天
3291691454 无内鬼，来点魅魔渔网涩图
3291691454 pic[https://gchat.qpic.cn/gchatpic_new/0/0-0-147B03680B44751CB1FE3C66B930A054/0]
```
若需更改名片名称，在QQ号后以"|"符号分割名称
```
#伪造聊天
3291691454|gal糕手 什么是柚子社
```

</details>

#### 致谢

"homo" 功能部分代码来自[homo](https://github.com/itorr/homo)  

### 使用说明
配合云崽使用, https://gitee.com/Le-niao/Yunzai-Bot

### 其他
有问题提issue或联系我QQ：3291691454  
交流群：[893157055](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=BWtOJkAHVX20OlQqgAIPn7UID9LtigSg&group_code=893157055)  
提交发pull request  
最后希望能给项目点个star~

#### 项目链接
github：[https://github.com/HDTianRu/TianRu-plugin](https://github.com/HDTianRu/TianRu-plugin)  
gitee：[https://gitee.com/HDTianRu/TianRu-plugin](https://gitee.com/HDTianRu/TianRu-plugin)