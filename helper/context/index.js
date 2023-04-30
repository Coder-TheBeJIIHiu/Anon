const { startBasic } = require('./basic.js')

class ContextManager {
    constructor(bot) {
      this.bot = bot;
    }
  
    async load() {
        startBasic(this.bot)
    }
}
  
module.exports = ContextManager;
  