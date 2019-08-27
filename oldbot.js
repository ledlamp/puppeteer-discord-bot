var Discord = require("discord.js");
var fs = require("fs");
var client = new Discord.Client();
client.login(fs.readFileSync("oldtoken.txt", "utf8").trim());

client.on("ready", () => {
    client.user.setActivity("p!help");
});

client.on("message", message => {
    if (!message.content.startsWith("p!")) return;
    if (message.guild.members.has("330499952948019201")) return;
    if (Date.now() - message.channel.lastNoticeTime < 600000) return;
    let msg = "**This bot account will be deleted soon!**\n";
    if (message.member.hasPermission("MANAGE_GUILD")) {
        msg += "Please invite the new bot account to continue using Puppeteer: <https://discordapp.com/api/oauth2/authorize?client_id=330499952948019201&permissions=0&scope=bot>\n";
    } else {
        msg += "Please ask a server manager to invite the new bot with this URL: <https://discordapp.com/api/oauth2/authorize?client_id=330499952948019201&permissions=0&scope=bot>\n";
        let fofats = message.guild.members.filter(m => m.hasPermission("MANAGE_GUILD")).map(m => m.user.tag).join(", ");
        if (fofats) {
            msg += "The following users have the ability to invite bots to this server: ```";
            msg += fofats + '```';
            if (msg.length > 2000) msg = msg.substr(0,1996) + '…```'
        }
    }
    message.channel.send(msg);
    message.channel.lastNoticeTime = Date.now();
});