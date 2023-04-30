const startBasic = async (bot) => {
    bot.start(async (ctx) => {
        ctx.reply("LOL")
        await ctx.scene.enter('main')
    })
}

module.exports = {
    startBasic
}