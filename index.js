const { Telegraf, session } = require('telegraf');
const LoadMiddlewares = require('./helper/middlewares/index.js');
const ContextManager = require('./helper/context/index.js')
require('dotenv').config()

const bot = new Telegraf(process.env.BOT_TOKEN);
const middleware = new LoadMiddlewares(bot, session);
const context = new ContextManager(bot);

context.load()

middleware.load().then(() => {
    console.log('Бот запущен!')
    bot.launch();
});
