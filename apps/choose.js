import crypto from 'crypto';

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
      await this.reply('请输入选项！')
      return;
    }
    var hashValues = choices.map(word => {
      var hash = crypto.createHash('sha256');
      hash.update(word);
      var hashValue = hash.digest('hex'); // (0, 2^256)
      // Take the first 24 bits (3 bytes) of the hash value
      hashValue = hashValue.substring(0, 6);
      var intValue = parseInt(hashValue, 16);
      // Add a 22-bit number as a disturbance value
      // Note that a single hash value could be 0.
      // In order to avoid divide-by-zero errors in normalization process,
      // we set the minimal random value to 1
      intValue += crypto.randomInt(1, Math.pow(2, 22))
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
