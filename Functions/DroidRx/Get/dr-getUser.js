const { request } = require('undici')
const { AttachmentBuilder } = require('discord.js')
const Canvas = require('@napi-rs/canvas')
const DrxUser = require('../../../Database/DroidRx/drxuserdata')

const GetDroidRxUser = async (uid, name, course) => {
    const url = (uid) ? `https://v4rx.me/get_user/?id=${uid}` : `https://v4rx.me/get_user/?name=${name.toLowerCase()}`
    const { body } = await request(url)
    const Result = body.json()

    //Dev Users (Instance Testing First)
    const DevID = [
        2,

        151,
        256,
    ]
}