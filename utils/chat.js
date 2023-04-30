const shortid = require("shortid");
const { v4: uuidv4 } = require("uuid");
const { Markup } = require("telegraf");
const db = require("../utils/db.js");
const Logger = require("./Logger.js");
const log = new Logger();

const botToken = "а?";

const Chat = async (ctx, scene, user, partner) => {
  const users = [user, partner];
  let rows, uuid, hash;

  try {
    const startTime = Date.now();

    for (const recipient of users) {
      await ctx.telegram.sendMessage(
        recipient,
        "⏳ | Создаю для вас комнату..."
      );
    }

    await db.execute("DELETE FROM queue WHERE telegram_id = ?", [partner]);

    let retries = 0;

    do {
      retries++;
      uuid = uuidv4();
      hash = shortid.generate(uuid);
      rows = await db.execute(
        "SELECT * FROM chats WHERE uuid = ? OR hash = ?",
        [uuid, hash]
      );
    } while (rows.length > 0);

    await db.execute(
      "INSERT INTO chats (user_id, partner_user_id, uuid, hash) VALUES (?, ?, ?, ?)",
      [user, partner, uuid, hash]
    );
    // const { id } = await db.execute('SELECT * FROM chats WHERE uuid = ? OR hash = ?', [uuid, hash]);

    const endTime = Date.now() - startTime;
    const message = `✅ | Комната создана за ${endTime} мс!\n\n🆔 | UUID: ${uuid}\n🔗 | Хэш: #${hash}\n🔄 | Попытка: №${retries}\n\n❤️ | Желаем вам приятного общения!`;

    for (const recipient of users) {
      await ctx.telegram.sendMessage(
        recipient,
        message,
        Markup.inlineKeyboard([
          Markup.button.callback("⛔ | Остановить чат", "stop"),
        ])
      );
    }
  } catch (err) {
    const message = `❌ Произошла какая-то ошибка:\n\n${err}`;

    for (const recipient of users) {
      await ctx.telegram.sendMessage(recipient, message);
    }

    log.error(message);
  }
  scene.on("text", async (ctx) => {
    const message = ctx.message.text;
    const userId = ctx.message.from.id;
    const recipient = userId == user ? partner : user;
    ctx.telegram.sendMessage(recipient, `📩 | Вам ответили: \n\n${message}`);
  });

  scene.on("audio", async (ctx) => {
    const message = ctx.message.audio;
    const userId = ctx.message.from.id;
    const recipient = userId == user ? partner : user;
    const fileId = message.file_id;
    const file = await ctx.telegram.getFile(fileId);
    const audioUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    await ctx.telegram.sendAudio(
      recipient,
      { url: audioUrl },
      { caption: "📩 | Вам ответили:" }
    );
  });

  scene.on("document", async (ctx) => {
    const message = ctx.message.document;
    const userId = ctx.message.from.id;
    const recipient = userId == user ? partner : user;
    const fileId = message.file_id;
    const file = await ctx.telegram.getFile(fileId);
    const documentUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    await ctx.telegram.sendDocument(
      recipient,
      { url: documentUrl, filename: message.file_name },
      { caption: "📩 | Вам ответили:" }
    );
  });

  scene.on("photo", async (ctx) => {
    const message = ctx.message.photo;
    const userId = ctx.message.from.id;
    const recipient = userId == user ? partner : user;
    const fileId = message[message.length - 1].file_id;
    const file = await ctx.telegram.getFile(fileId);
    const photoUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    await ctx.telegram.sendPhoto(
      recipient,
      { url: photoUrl },
      { caption: "📩 | Вам ответили:" }
    );
  });

  scene.on("sticker", async (ctx) => {
    const message = ctx.message.sticker;
    const userId = ctx.message.from.id;
    const recipient = userId == user ? partner : user;
    const fileId = message.file_id;
    const file = await ctx.telegram.getFile(fileId);
    const isAnimated = message.is_animated;
    const stickerUrl = isAnimated
      ? `https://api.telegram.org/file/bot${botToken}/${file.file_path}`
      : file.file_unique_id;

    await ctx.telegram.sendSticker(recipient, { url: stickerUrl });
  });

  scene.on("video", async (ctx) => {
    const message = ctx.message.video;
    const userId = ctx.message.from.id;
    const recipient = userId == user ? partner : user;
    const fileId = message.file_id;
    const file = await ctx.telegram.getFile(fileId);
    const videoUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    await ctx.telegram.sendVideo(
      recipient,
      { url: videoUrl },
      { caption: "📩 | Вам ответили:" }
    );
  });

  scene.on("videoNote", async (ctx) => {
    const message = ctx.message.video_note;
    const userId = ctx.message.from.id;
    const recipient = userId == user ? partner : user;
    const fileId = message.file_id;
    const file = await ctx.telegram.getFile(fileId);
    const videoNoteUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    await ctx.telegram.sendVideoNote(recipient, { url: videoNoteUrl });
  });

  scene.on("voice", async (ctx) => {
    const message = ctx.message.voice;
    const userId = ctx.message.from.id;
    const recipient = userId == user ? partner : user;
    const fileId = message.file_id;
    const file = await ctx.telegram.getFile(fileId);
    const voiceUrl = `https://api.telegram.org/file/bot${botToken}/${file.file_path}`;
    await ctx.telegram.sendVoice(recipient, { url: voiceUrl });
  });
  scene.action("stop", async (ctx) => {
    await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      `❌ | Вы точно хотите остановить чат #${hash}?`,
      Markup.inlineKeyboard([
        Markup.button.callback("⛔ | Остановить чат", "yes_stop"),
      ])
    );
  });
  scene.action("yes_stop", async (ctx) => {
    await ctx.telegram.editMessageText(
      ctx.callbackQuery.message.chat.id,
      ctx.callbackQuery.message.message_id,
      null,
      "✅ | Чат остановлен."
    );
  });
};

module.exports = Chat;
