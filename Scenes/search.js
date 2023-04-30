const { Scenes, Markup } = require('telegraf')
const _ = require('lodash');
const { getRandomInt } = require("rand-helper")

const db = require("../utils/db.js")
const chat = require("../utils/chat.js")
const searchScene = new Scenes.BaseScene('search')
const randomScene = new Scenes.BaseScene('random')
const femaleScene = new Scenes.BaseScene('female')
const maleScene = new Scenes.BaseScene('male')

searchScene.enter(async (ctx) => {

  await ctx.telegram.editMessageText(ctx.session.prevMessageChatId, ctx.session.prevMessageId, null, '👥 | Поиск:', Markup.inlineKeyboard([
    [
      Markup.button.callback('👨‍👩‍👧 | Рандом', 'random')
    ],
    [
      Markup.button.callback('👧 | Девушек', 'female'),
      Markup.button.callback('👨 | Парней', 'male')
    ]
  ]));

})
searchScene.on('callback_query', (ctx) => {
	ctx.scene.enter(ctx.callbackQuery.data)
})

randomScene.enter(async (ctx) => {
  const userId = ctx.update.callback_query?.from?.id || ctx.message?.from?.id;

  const rows = await db.execute('SELECT * FROM queue');
  const user = await db.execute('SELECT * FROM users WHERE telegram_id = ?', [userId]);
  const userGender = user[0].gender
	console.log(JSON.stringify(user))
  if (rows.length === 0) {
    await db.execute('INSERT INTO queue (telegram_id, gender) VALUES (?, ?)', [userId, userGender]);
    await ctx.reply('✅ | Вы добавлены в очередь и будут уведомлены, когда появится подходящий пользователь.');
  } else {
    const currentUserId = userId;
    let randomUser;
    await ctx.reply("✅ | Начинаю поиск.");
		
    do {
      randomUser = rows[getRandomInt(0, rows.length-1)];
    } while (randomUser.telegram_id === currentUserId);

    await chat(ctx, randomScene, userId, randomUser.telegram_id);
	}
});

femaleScene.enter(async (ctx) => {
  const userId = ctx.update.callback_query?.from?.id || ctx.message?.from?.id;

  const rows = await db.execute('SELECT * FROM queue WHERE gender = ?', ['female']);
  const user = await db.execute('SELECT * FROM users WHERE telegram_id = ?', [userId]);
  const userGender = user[0].gender

  if (rows.length === 0) {
    await db.execute('INSERT INTO queue (telegram_id, gender) VALUES (?, ?)', [userId, userGender]);
    await ctx.reply('✅ | Вы добавлены в очередь и будут уведомлены, когда появится подходящий пользователь.');
  } else {
    const currentUserId = userId;
    let randomUser;
    await ctx.reply("✅ | Начинаю поиск.");
		
    do {
      randomUser = rows[getRandomInt(0, rows.length-1)];
    } while (randomUser.telegram_id === currentUserId);

    await chat(ctx, femaleScene, userId, randomUser.telegram_id);
	}
});

maleScene.enter(async (ctx) => {
  const userId = ctx.update.callback_query?.from?.id || ctx.message?.from?.id;
  
  const rows = await db.execute('SELECT * FROM queue WHERE gender = ?', ['male']);
  const user = await db.execute('SELECT * FROM users WHERE telegram_id = ?', [userId]);
  const userGender = user[0].gender

  if (rows.length === 0) {
    await db.execute('INSERT INTO queue (telegram_id, gender) VALUES (?, ?)', [userId, userGender]);
    await ctx.reply('✅ | Вы добавлены в очередь и будут уведомлены, когда появится подходящий пользователь.');
  } else {
    const currentUserId = userId;
    let randomUser;
    await ctx.reply("✅ | Начинаю поиск.");

    do {
      randomUser = rows[getRandomInt(0, rows.length-1)];
    } while (randomUser.telegram_id === currentUserId);

    await chat(ctx, maleScene, userId, randomUser.telegram_id);
	}
});

const Stage = [searchScene, randomScene, femaleScene, maleScene]
module.exports = Stage
