import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import http from "http"; // Tambahkan module HTTP

// 🔥 Ganti dengan token bot kamu
const TOKEN = process.env.DISCORD_SECRET_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const REQUIRED_ROLE_ID = process.env.DISCORD_ROLE_ID; // Role yang harus dimiliki user

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Akses ke guild/server
    GatewayIntentBits.GuildMembers, // Akses daftar member
    GatewayIntentBits.GuildMessages, // Akses pesan
    GatewayIntentBits.MessageContent, // Akses isi pesan
  ],
});

// ✅ Ketika bot online
bot.once("ready", () => {
  console.log(`🔥 Bot ${bot.user.tag} sudah online!`);
});

// ✅ Cek apakah user ada di server & punya role tertentu
async function checkUserInGuild(userId) {
  try {
    const guild = await bot.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(userId);
    if (!member) return false; // User tidak ada di server

    // Cek apakah user punya role yang dibutuhkan
    const hasRole = member.roles.cache.has(REQUIRED_ROLE_ID);
    return hasRole;
  } catch (error) {
    console.error("⚠️ Error saat cek user di server:", error);
    return false;
  }
}

// ✅ Command untuk cek status user
bot.on("messageCreate", async (message) => {
  if (message.content.startsWith("!cekuser")) {
    const args = message.content.split(" ");
    if (args.length < 2) {
      return message.reply("⚠️ Gunakan format: `!cekuser <user_id>`");
    }

    const userId = args[1];
    const isMember = await checkUserInGuild(userId);

    if (isMember) {
      message.reply(`✅ User <@${userId}> ada di server dan memiliki role yang diperlukan.`);
    } else {
      message.reply(`❌ User <@${userId}> tidak ada di server atau tidak memiliki role.`);
    }
  }
});

// ✅ Perintah "!ping"
bot.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.reply("Pong! 🏓");
  }
});

// ✅ Event saat ada member baru join
bot.on("guildMemberAdd", (member) => {
  console.log(`👋 ${member.user.tag} baru saja join ke server!`);
});

// ✅ Jalankan bot
bot.login(TOKEN);

// ✅ Tambahkan server untuk health check di Koyeb
const PORT = process.env.PORT || 8000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running");
}).listen(PORT, () => {
  console.log(`🌍 Health check server running on port ${PORT}`);
});
