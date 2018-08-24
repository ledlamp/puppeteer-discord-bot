(async () => {
  var puppeteer = require('puppeteer');
  var browser = await puppeteer.launch();
  
  var Discord = require('discord.js');
  var bot = new Discord.Client();
  bot.login("NDc4NzA4NzI1MTAwODM4OTUw.DmDa-A.g3iiuER3Tt_aeF9YUDmEB-ZurFU");

  bot.on("message", async function(message){
    if (message.content.toLowerCase().startsWith("!gi")) {
      let page = await browser.newPage();
      await page.setViewport({width: 1440, height: 900});
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(message.content.substr(4))}&tbm=isch`)
      let screenshot = await page.screenshot({type: 'png'});
      message.channel.send(new Discord.Attachment(screenshot, "screenshot.png"));
      await page.close();
    }
  });

})();