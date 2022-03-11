const TelegramApi = require('node-telegram-bot-api')
const token = '5163283224:AAGZGc5ThZI5QGBK0FL6SGUGFEX9Qn1PwxE'
const bot = new TelegramApi(token, {polling: true})
const chats = {}
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Guess the number from 0 to 9')
    const randnum = Math.floor(Math.random() * 10)
    chats[chatId] = randnum //в массив добавляем: ключ-айди чата, а значение ранд.число
    await bot.sendMessage(chatId, 'Go! :)', gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Подключение к БД сломалось', e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'приветствие'},
        {command: '/info', description: 'обо мне'},
        {command: '/game', description: 'игра'}
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id
        const fname = msg.from.first_name
        const lname = msg.from.last_name
        // console.log(msg)
        // bot.sendMessage(chatId, `Hi ${name} ты написал мне ${text} ?`)

        try {
            if (text === '/start') {
                await UserModel.create({chatId}) //как только старт - создаем запись в БД
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/230/140/23014038-6c19-3527-ab85-e7cca69d609f/1.webp')
                return  bot.sendMessage(chatId, 'мой юнный друг!!!')
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return  bot.sendMessage(chatId, `У ${fname} ${lname} правильных ответов ${user.right}, а неправильных ${user.wrong}`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            return bot.sendMessage(chatId, "I don't understand you")
        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибка')
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if (data === '/again') {
            return startGame(chatId)
        }
        if (data == chats[chatId]){
            return bot.sendMessage(chatId, `You are win!!! It was ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `You are loose!!! It was ${chats[chatId]}`, againOptions)
        }
    })
}

start()