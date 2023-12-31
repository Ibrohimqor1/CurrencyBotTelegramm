const Telegraf = require("telegraf");
const axios = require("axios");
const cc = require("currency-codes");

const TELEGRAM_BOT_TOKEN =
    process.env.TELEGRAM_BOT_TOKEN ||
    "6528841446:AAEKHXff99g-5sEQZaUjQ0G2_6tYbXE8jwc";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start(ctx => {
    return ctx.reply("Welcome to Mono Currency Bot");
});

bot.hears(/^[A-Z]+$/i, async ctx => {
    const clientCurCode = ctx.message.text;
    const currency = cc.code(clientCurCode);

    // check for existing currency
    if (!currency) {
        return ctx.reply("Currency didnt found");
    }

    try {
        const currencyObj = await axios.get(
            "https://api.monobank.ua/bank/currency"
        );

        const foundCurrency = currencyObj.data.find(cur => {
            return cur.currencyCodeA.toString() === currency.number;
        });
        console.log(foundCurrency);
        if (
            !foundCurrency ||
            !foundCurrency.rateBuy ||
            !foundCurrency.rateSell
        ) {
            return ctx.reply("Currency didnt found in Monobank API");
        }
        return ctx.replyWithMarkdown(
            `CURRENCY: ${currency.code}
RATE BUY: *${foundCurrency.rateBuy}*
RATE SELL: *${foundCurrency.rateSell}*
        `
        );
    } catch (error) {
        return ctx.reply(error);
    }
});

bot.startPolling();
