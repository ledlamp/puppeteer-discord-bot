console.log("start");
var Discord = require("discord.js");
var puppeteer = require("puppeteer");
var fs = require("fs");
(async () => {
	var browser = await puppeteer.launch({args:["--no-sandbox"/*openvz*/]});
	console.log("chromium launched");

	var client = new Discord.Client();
	await client.login(fs.readFileSync('token.txt','utf8').trim());
	console.log("discord client ready");
	client.user.setActivity("p!help");

	client.on("message", message => message.response = processMessage(message));
	client.on("messageUpdate", async (oldMessage, newMessage) => {
		if (await newMessage.response) newMessage.react('🚫');
	});
	client.on("messageDelete", async message => {
		if (await message.response) {
			(await message.response).delete();
			console.log(`[${new Date().toLocaleString()}] [${message.guild&&message.guild.id}(${message.guild&&message.guild.name})] [${message.channel.id}(#${message.channel.name})] Deleted command from ${message.author.id} (${message.author.tag}): ${message.content}`);
		}
	});

	function processMessage(message) {
		return new Promise(async function (resolve, reject) {
			if (!message.content.startsWith("p!")) return resolve();

			console.log(`[${new Date().toLocaleString()}] [${message.guild&&message.guild.id}(${message.guild&&message.guild.name})] [${message.channel.id}(#${message.channel.name})] User ${message.author.id} (${message.author.tag}) invoked command: ${message.content}`);

			var args = message.content.split(" ");
			var cmd = args[0].slice(2).toLowerCase();
			var query = args.slice(1).join(" ").trim();

			//async function respond() {
			//	message.response = await message.channel.send.apply(message.channel, arguments);
			//}

			switch (cmd) {
				case "help":
				case "h":
					resolve(await message.channel.send({embed:{
						title: "Commands",
						description:
							"\n`p!screenshot <url>`"+
							"\n`p!google <query>`"+
							"\n`p!google-i'm-feeling-lucky <query>`" +
							"\n`p!google-images <query>`"+
							"\n`p!bing <query>`"+
							"\n`p!bing-images <query>`"+
							"\n`p!youtube <query>`"+
							"\n`p!ebay <query>`" +
							"\n`p!amazon <query>`" +
							"\n`p!duckduckgo <query>`" +
							"\n`p!yahoo <query>`" +
							"\n`p!wikipedia <query>`" +
							"\n Each command has an abbreviated version." +
							"\n"+
							`\n\n[» Add this bot to your server](https://discordapp.com/oauth2/authorize?scope=bot&client_id=${client.user.id})`+
							"\n[» Source code](https://github.com/ledlamp/puppeteer-discord-bot/blob/master/index.js)"+
							"\n[» Submit an issue](https://github.com/ledlamp/puppeteer-discord-bot/issues/new)"
					}}));
					break;
				case "screenshot":
				case "ss":
					pup((query.startsWith("http://") || query.startsWith("https://")) ? query : `http://${query}`);
					break;
				case "google":
				case "g":
					pup(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
					break;
				case "google-i'm-feeling-lucky":
				case "gifl":
					pup(`https://www.google.com/search?btnI=I%27m+Feeling+Lucky&q=${encodeURIComponent(query)}`);
					break;

				case "google-images":
				case "gi":
					pup(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=${(message.channel.nsfw) ? 'off' : 'on'}`);
					break;
				case "bing":
				case "b":
					pup(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
					break;
				case "bing-images":
				case "bi":
					pup(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&safeSearch=${(message.channel.nsfw) ? 'off' : 'moderate'}`);
					break;
				case "youtube":
				case "yt":
					pup(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
					break;
				case "ebay":
				case "e":
					pup(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`);
					break;
				case "amazon":
				case "a":
					pup(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`);
					break;
				case "duckduckgo":
				case "ddg":
					pup(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
					break;
				case "yahoo":
				case "y":
					pup(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`);
					break;
				case "wikipedia":
				case "w":
					pup(`https://en.wikipedia.org/w/index.php?title=Special:Search&search=${encodeURIComponent(query)}`);
					break;
	/*
				case "":
				case "":
					pup(``);
					break;
	*/

				case "eval":
				case ">":
					if (message.author.id == "707359017252683896") {
						try {
							resolve(await message.channel.send(String(eval(query))));
						} catch(error) {
							resolve(await message.channel.send(String(error)));
						}
					}
					break;
			}

			async function pup(url) {
				message.react('🆗');
				try {
					var page = await browser.newPage();
					page.on("error", async error => {
						resolve(await message.channel.send(`:warning: ${error.message}`));
					});
					await page.setViewport({width: 1440, height: 900});
					await page.goto(url);
					var screenshot = await page.screenshot({ type: 'png', fullPage: true });
					resolve(await message.channel.send({files:[{ attachment: screenshot, name: "screenshot.png" }]}));
				} catch(error) {
					console.error(error);
					resolve(await message.channel.send(`:warning: ${error.message}`));
				} finally {
					try {
						await page.close();
					} catch(error) {
						console.error(error);
						process.exit(1);
					}
				}
			}
		});
	};

})().catch(error => { console.error(error); process.exit(1); });
