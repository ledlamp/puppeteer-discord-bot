console.log("start");
(async () => {
	var fs = require("fs");
	try {
		var puppeteer = require('puppeteer-core');
	} catch(e) {
		var puppeteer = require('puppeteer');
	}
	var browser = await puppeteer.launch({executablePath: fs.existsSync("/usr/bin/chromium-browser") ? "/usr/bin/chromium-browser" : undefined});

	var Discord = require('discord.js');
	var bot = new Discord.Client();
	bot.login(fs.readFileSync('./token.txt','utf8').trim());
	bot.on('ready', ()=>{
		bot.user.setActivity("p!help")
	});

	var cmdPrefix = "p!";
	bot.on("message", async function(msg){
		if (!msg.content.startsWith(cmdPrefix)) return;

		console.log(`[${msg.guild && msg.guild.name}] [${msg.channel.name}] ${msg.author.tag} invoked command: ${msg.content}`);

		var args = msg.content.split(" ");
		var cmd = args[0].slice(cmdPrefix.length).toLowerCase();
		var query = args.slice(1).join(" ");

		switch (cmd) {
			case "help":
			case "h":
				msg.channel.send({embed:{
					title: "Commands",
					description:
						"\n`p!screenshot <url>`"+
						"\n`p!google <query>`"+
						"\n`p!google-images <query>`"+
						"\n`p!bing <query>`"+
						"\n`p!bing-images <query>`"+
						"\n`p!youtube <query>`"+
						"\n`p!ebay <query>`" +
						"\n`p!amazon <query>`" +
						"\n\n[» Invite](https://discordapp.com/oauth2/authorize?scope=bot&client_id=482784865532641290)"+
						"\n[» Repository](https://github.com/ledlamp/puppeteer-discord-bot)"+
						"\n[» Submit an issue](https://github.com/ledlamp/puppeteer-discord-bot/issues/new)"
				}});
				break;
			case "screenshot":
			case "ss":
				pup(msg, (query.startsWith("http://") || query.startsWith("https://")) ? query : `http://${query}`);
				break;
			case "google":
			case "g":
				pup(msg, `https://www.google.com/search?q=${encodeURIComponent(query)}`);
				break;
			case "google-images":
			case "gi":
				pup(msg, `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=${msg.channel.nsfw ? 'off' : 'on'}`);
				break;
			case "bing":
			case "b":
				pup(msg, `https://www.bing.com/search?q=${encodeURIComponent(query)}`);
				break;
			case "bing-images":
			case "bi":
				pup(msg, `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&safeSearch=${msg.channel.nsfw ? 'off' : 'moderate'}`);
				break;
			case "youtube":
			case "yt":
				pup(msg, `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
				break;
			case "ebay":
			case "e":
				pup(msg, `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`);
				break;
			case "amazon":
			case "a":
				pup(msg, `https://www.amazon.com/s?k=${encodeURIComponent(query)}`);
				break;
/*
			case "":
			case "":
				pup(msg, ``);
				break;
*/
		}


	});

	async function pup(message, url) {
		message.react('🆗');
		try {
			var page = await browser.newPage();
			page.on("error", error => {
				message.channel.send(`:warning: ${error.message}`);
			});
			await page.setViewport({width: 1440, height: 900});
			await page.goto(url);
			var screenshot = await page.screenshot({type: 'png'});
			await message.channel.send(new Discord.Attachment(screenshot, "screenshot.png"));
		} catch(error) {
			await message.channel.send(`:warning: ${error.message}`);
		} finally {
			try {
				await page.close();
			} catch(e) {
				console.error(e);
				process.exit(1);
			}
		}
	}

})();
