import fs from 'node:fs'

if (!global.segment) {
  logger.warn(logger.red("! 未找到 segment，建议更新 Yunzai"))
  global.segment = (await import("oicq")).segment
}

const files = fs.readdirSync('./plugins/TianRu-plugin/apps').filter(file => file.endsWith('.js'))

let ret = []

files.forEach((file) => {
  ret.push(import(`./apps/${file}`))
})

ret = await Promise.allSettled(ret)

let apps = {}
for (let i in files) {
  let name = files[i].replace('.js', '')

  if (ret[i].status !== 'fulfilled') {
    logger.error(`载入插件错误：${logger.red(name)}`)
    logger.error(ret[i].reason)
    continue
  }
  apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}
logger.mark("天如插件载入完毕")
logger.mark("交流群 893157055")
logger.info(" ╱|、")
logger.info("(˚ˎ 。7")
logger.info(" |、˜〵")
logger.info("じしˍ,)ノ")
export { apps }
