/**
* 请注意，系统不会读取help_default.js ！！！！
* 【请勿直接修改此文件，且可能导致后续冲突】
*
* 如需自定义可将文件【复制】一份，并重命名为 help.js
*
* */

export const helpCfg = {
  title: '天如帮助',
  subTitle: 'Yunzai-Bot & TianRu-Plugin',
  columnCount: 3,
  colWidth: 265,
  theme: 'all',
  themeExclude: ['default'],
  style: {
    fontColor: '#d3bc8e',
    descColor: '#eee',
    contBgColor: 'rgba(6, 21, 31, .5)',
    contBgBlur: 3,
    headerBgColor: 'rgba(6, 21, 31, .4)',
    rowBgColor1: 'rgba(6, 21, 31, .2)',
    rowBgColor2: 'rgba(6, 21, 31, .35)'
  }
}

export const helpList = [{
  group: '[]内为必填项,{}内为可选项'
  }, {
  group: '拓展命令',
  list: [{
    icon: 74,
    title: '#homo [数字]',
    desc: '把一个数字变得恶臭'
  }, {
    icon: 71,
    title: '#来[数量]张{标签 {R18}}涩图',
    desc: '获取涩图'
  }, {
    icon: 163,
    title: '#二维码 [文字|链接]',
    desc: '生成二维码'
  }, {
    icon: 132,
    title: '#code [语言][回车][语句]',
    desc: '模拟各种语言运行，不会影响本地'
  }, {
    icon: 72,
    title: '#更新小助手抽卡记录',
    desc: '更新并获取微信小程序"提瓦特小助手"中历史抽卡记录'
  }, {
    icon: 36,
    title: '#米哈游登录',
    desc: '私聊使用，获取stoken与cookie'
  }, {
    icon: 74,
    title: '#帮我选 [选项1] [选项2] [...]',
    desc: '让bot替你做出选择'
  }]
}, {
  group: '管理命令，仅主人可用',
  auth: 'master',
  list: [{
    icon: 145,
    title: '#伪造聊天[[回车][QQ 消息]]...',
    desc: '伪造一份合并聊天记录'
  }, {
    icon: 135,
    title: '#我是[QQ号][回车][指令]',
    desc: '模拟群uQQ号执行指令'
  }, {
    icon: 85,
    title: '#执行sh[sh指令]',
    desc: '远程执行sh指令'
  }, {
    icon: 85,
    title: '#执行js[js代码]',
    desc: '执行js代码'
  }, {
    icon: 85,
    title: '#(强制)更新天如插件',
    desc: '更新插件本体'
  }]
}]