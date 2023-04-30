const { Scenes, Markup } = require('telegraf')
const _ = require('lodash');
const db = require("../utils/db.js")

const nameScene = new Scenes.BaseScene('name')
const ageScene = new Scenes.BaseScene('age')
const genderScene = new Scenes.BaseScene('gender')
const descriptionScene = new Scenes.BaseScene('description')
const phoneScene = new Scenes.BaseScene('phone')
const confirm = new Scenes.BaseScene('confirmReg')

nameScene.enter((ctx) => {
  ctx.reply('👤 | Введите свое имя:', Markup.inlineKeyboard([
    Markup.button.callback(' ❌ | Отменить регистрацию', 'cancel')
  ]))
})

nameScene.on('text', async (ctx) => { 
    ctx.session.name = ctx.message.text
    ctx.scene.enter('age')
})

nameScene.on('callback_query', async (ctx) => {
    await ctx.editMessageText("❌ | Отмена регистрации...")
    ctx.scene.leave()
})

ageScene.enter((ctx) => {
    ctx.reply('📊 | Введите свой возраст:')
})

ageScene.on('text', (ctx) => {
    const age = Number(ctx.message.text)
    if (!isNaN(age) && age >= 1 && age <= 99) {
        ctx.session.age = age
        ctx.scene.enter('gender')
    } else {
        ctx.scene.enter('age')
    }
})

ageScene.action(/^[1-9][0-9]?$/, (ctx) => {
    ctx.session.age = ctx.match[0]
    ctx.scene.enter('gender')
})

genderScene.enter((ctx) => {
    ctx.reply('Выберите свой пол:', Markup.inlineKeyboard([
        Markup.button.callback('👨 | Мужской', 'male'),
        Markup.button.callback('👧 | Женский', 'female')
    ]))
})

genderScene.on('callback_query', async (ctx) => {
    ctx.session.gender = ctx.callbackQuery.data
    ctx.scene.enter('description')
})

descriptionScene.enter((ctx) => {
    ctx.reply('📝 | Напишите немного о себе:')
})

descriptionScene.on('text', async (ctx) => { 
    ctx.session.description = ctx.message.text
    ctx.scene.enter('phone')
})

phoneScene.enter((ctx) => {
    ctx.reply('☎️ | Введите свой номер телефона с кодом страны, например +79123456789:\n\n❗🇺🇦 UKRAINIAN NUMBERS ARE NOT SUPPORTED! 🇺🇦❗', Markup.inlineKeyboard([
      Markup.button.callback('🚫 | Пропустить', 'skip_phone')
    ]))
})

phoneScene.action('skip_phone', async (ctx) => {
    ctx.session.phone = null;
    ctx.scene.enter("confirmReg")
})

phoneScene.on('text', async (ctx) => {
    ctx.session.phone = ctx.message.text
    if (ctx.message.text.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/)) {
        ctx.scene.enter('confirmReg')
    } else {
        ctx.scene.enter("phone")
    }
})

confirm.enter(async (ctx) => {
    const userId = ctx.update.callback_query?.from?.id || ctx.message?.from?.id;
    const name = ctx.session.name
    const age = ctx.session.age
    const gender = ctx.session.gender
    const description = ctx.session.description
	const phone = ctx.session.phone
    let rows = await db.execute('SELECT * FROM users WHERE telegram_id = ?', [userId]);
    if (rows.length > 0) {
        await db.execute('UPDATE users SET name = ?, age = ?, gender = ?, description = ?, phone = ? WHERE telegram_id = ?', [name, age, gender, description, phone, userId]);
        await ctx.reply("✔️ | Вы успешно заполнили анкету!")
    } else {
        await db.execute('INSERT INTO users (telegram_id, name, age, gender, description, phone) VALUES (?, ?, ?, ?, ?, ?)', [userId, name, age, description, gender, phone]);
        await ctx.reply("✔️ | Вы успешно зарегистрировались!")
	}
    return ctx.scene.enter("main")
})

const registrationStage = [nameScene, ageScene, genderScene, descriptionScene, phoneScene, confirm]

module.exports = registrationStage