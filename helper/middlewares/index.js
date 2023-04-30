const StageManager = require('../stage.js')

class LoadMiddlewares {
    constructor(bot, session) {
      this.bot = bot;
      this.session = session;
    }
  
    async load() {
      const stageManager = new StageManager()
      this.bot.use(this.session(), stageManager.load())
    }
}
  
module.exports = LoadMiddlewares;
  