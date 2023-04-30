require('dotenv').config()

const { Telegraf, session } = require('telegraf');
const LoadMiddlewares = require('./helper/middlewares/index.js');
const ContextManager = require('./helper/context/index.js')

const bot = new Telegraf(process.env.BOT_TOKEN);
const middleware = new LoadMiddlewares(bot, session);
const context = new ContextManager(bot);

middleware.load().then(async () => {
    console.log('Бот запущен!')
    await context.load()
    await bot.launch();
});
