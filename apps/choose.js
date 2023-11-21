import crypto from 'crypto';
import plugin from '../../../lib/plugins/plugin.js'

export class Choose extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'Choose',
      /** 功能描述 */
      dsc: '让bot来解决宁的选择困难症',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#帮我选',
          /** 执行方法 */
          fnc: 'choose'
        }
      ]
    })
  }


  async choose (e) {
    let choices = e.msg.split(/\s+/)
    // Remove the first item
    choices.shift()
    
    // Trivial case
    if (choices.length == 0) {
      this.reply('请输入选项！')
      return;
    }
    var hashValues = choices.map(word => {
      var hash = crypto.createHash('sha256');
      hash.update(word);
      var hashValue = hash.digest('hex'); // (0, 2^256)
      // Take the first 16 bits (4 bytes) of the hash value
      hashValue = hashValue.substring(0, 8);
      var intValue = parseInt(hashValue, 16);
      // Add a 30-bit number as a disturbance value
      intValue += crypto.randomInt(Math.pow(2, 30))
      return intValue;
    });
    
    // Calculate the sum of all values
    var sum = hashValues.reduce((a, b) => a += b, 0);
    
    // Normalize the values
    var normalizedValues = hashValues.map(value => value / sum);

    // Random choice algorithm
    function weightedRandom(items, weights) {
      var i;
      var cumWeights = [...weights];
      for (i = 1; i < cumWeights.length; i++)
      cumWeights[i] += cumWeights[i - 1];
      var random = Math.random() * cumWeights[cumWeights.length - 1];
      for (i = 0; i < cumWeights.length; i++)
        if (cumWeights[i] > random)
          break;
      return items[i];
    }

    // Apply the algorithm to choices
    // let item = weightedRandom(choices, normalizedValues);
    
    // Take the maximum value
    let maxIndex = normalizedValues.indexOf(Math.max(...normalizedValues));
    let item = choices[maxIndex];

    // Construct results
    let response = `我的选择是：${item}`
    response += '\n选项概率如下：'
    for (let i = 0; i < choices.length; i++) {
      let percentProb = normalizedValues[i] * 100
      response += `\n${choices[i]}：${percentProb.toFixed(2)}%`
    }

    await this.reply(response)
  }
}
