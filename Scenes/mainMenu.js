const { Scenes, Markup } = require('telegraf')
const db = require("../utils/db.js")

const mainScene = new Scenes.BaseScene('main')

mainScene.enter(async (ctx) => {
	const userId = ctx.update.callback_query?.from?.id || ctx.message?.from?.id;
	let rows = await db.execute('SELECT * FROM users WHERE telegram_id = ?', [userId]);
    if (rows.length > 0) {
    
	} else {
        ctx.reply('❌ | Вы не зарегистированы!')
		return ctx.scene.enter("name")
	}

  ctx.reply('📋 | Главный меню:', Markup.inlineKeyboard([
    [
      Markup.button.callback('👥 | Поиск', 'search'),
      Markup.button.callback('👤 | Профиль', 'profile')
    ],
    [
      //Markup.button.callback('🔍 | Поиск по категориям', ''),
      Markup.button.callback('⚙️ | Настройки', 'settings')
    ]
  ]));
	//ctx.session.prevMessageId = prevMessageId
})
mainScene.on('callback_query', (ctx) => {
	ctx.session.prevMessageId = ctx.callbackQuery.message.message_id;
  ctx.session.prevMessageChatId = ctx.callbackQuery.message.chat.id;

  ctx.scene.enter(ctx.callbackQuery.data)
})

const Stage = [mainScene]
module.exports = Stage
