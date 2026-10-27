const mongoose = require('mongoose')
const Log = require('../Utils/logger')

const Level = require('./Ranking/Leveling')
const { HowgayUser, HowgayGuild } = require('./Fun/howgay')
const { OmikujiUser, OmikujiGuild } = require('./Fun/omikuji')
const QuickMathDb = require('./Fun/quickmath')
const Game2048Db = require('./Fun/game-2048')
const Game2048Best = require('./Fun/game-2048-best')
const OmikujiConfig = require('../Assets/Omikuji/config')
const RankingGuilds = require('../Utils/Ranking/guilds')

/*
One-time data clean ups. Each step runs on startup until it succeeds once
(its Key is saved in the `seiameta` collection). New step = add it at the end with a new Key.
Old collections are only read, never deleted.
*/
const Steps = [
    // Merge duplicated rank documents + /howgay and /omikuji stats: old per-server arrays -> one document per user
    { Key: 'v2-2026-10', Run: MigrateV2 },
    // /quick-math scores saved as text -> numbers (so they sort), /game-2048 saved games -> first best scores
    { Key: 'v3-2026-10-minigames', Run: MigrateV3 }
]

async function RunMigrations() {
    if (mongoose.connection.readyState !== 1) return

    const Meta = mongoose.connection.db.collection('seiameta')
    for (const Step of Steps) {
        try {
            if (await Meta.findOne({ _id: Step.Key })) continue
            Log.Info(`Running one-time database migration ${Step.Key}...`)
            const result = await Step.Run()
            await Meta.updateOne({ _id: Step.Key }, { $set: { doneAt: new Date(), ...result } }, { upsert: true })
            Log.Info(`Migration ${Step.Key} done! ${Object.entries(result).map(([k, v]) => `${k}: ${v}`).join(' | ')}`)
        } catch (err) {
            //The next steps wait, everything is tried again on next start
            Log.Error(`Migration ${Step.Key} failed, it will try again on next start:`, err)
            break
        }
    }

    await BuildIndexes()
}

async function MigrateV2() {
    const GuildIds = await KnownGuildIds()
    const merged = await DedupeLevels()
    const howgay = await MigrateHowgay(GuildIds)
    const omikuji = await MigrateOmikuji(GuildIds)
    return { merged, howgay, omikuji }
}

async function MigrateV3() {
    return { ...await MigrateQuickMath(), ...await MigrateGame2048() }
}

// Scores were saved as text ("12.5") and text can't be sorted ("9" > "100").
// A user + difficulty with several documents keeps the best one
async function MigrateQuickMath() {
    const docs = await QuickMathDb.collection.find().toArray()
    const best = new Map(), duplicates = []
    for (const d of docs) {
        const key = `${d.UserID}-${d.GameKey}`, score = Number(d.Score) || 0
        const kept = best.get(key)
        if (!kept) best.set(key, { ...d, score })
        else if (score > kept.score) {
            duplicates.push(kept._id)
            best.set(key, { ...d, score })
        } else duplicates.push(d._id)
    }

    const ops = [...best.values()].map(d => ({ updateOne: { filter: { _id: d._id }, update: { $set: { Score: d.score, Level: Number(d.Level) || 0 } } } }))
    if (ops.length) await QuickMathDb.collection.bulkWrite(ops, { ordered: false })
    if (duplicates.length) await QuickMathDb.collection.deleteMany({ _id: { $in: duplicates } })
    return { quickmath: ops.length, quickmathDuplicates: duplicates.length }
}

// Game 2048 only kept the current game of each player: it becomes their first best score of that mode
async function MigrateGame2048() {
    const saved = await Game2048Db.find({ 'gameStats.scores.current': { $gt: 0 } }).lean()
    const ops = saved.filter(d => d.guildID && d.userID && d.gameStats?.mode).map(d => ({
        updateOne: {
            filter: { guildID: d.guildID, userID: d.userID, mode: d.gameStats.mode },
            update: {
                $setOnInsert: {
                    score: d.gameStats.scores.current,
                    tile: Math.max(0, ...(d.gameStats.board?.current || []).flat()),
                    moves: d.gameStats.moveCount || 0,
                    date: Number(d.gameStats.timestamp) || Date.now()
                }
            },
            upsert: true
        }
    }))
    if (ops.length) await Game2048Best.bulkWrite(ops, { ordered: false })
    return { game2048: ops.length }
}

// Old stats saved the server ID as a Number, which breaks 18-19 digit IDs.
// Real IDs (strings) are collected here and matched with Number(id) === oldNumber
async function KnownGuildIds() {
    const ids = new Set(await Level.distinct('GuildID'))
    Object.keys(RankingGuilds.Guilds).forEach(id => ids.add(id))
    if (process.env.GUILD_ID) ids.add(process.env.GUILD_ID)
    const bonus = await mongoose.connection.db.collection('omikujibonus').distinct('GuildID').catch(() => [])
    bonus.forEach(id => ids.add(String(id)))
    return [...ids].filter(Boolean)
}

function ResolveGuildId(oldId, GuildIds) {
    if (typeof oldId === 'string' && /^\d+$/.test(oldId)) return oldId
    return GuildIds.find(id => Number(id) === Number(oldId)) ?? null
}

async function DedupeLevels() {
    const groups = await Level.aggregate([
        { $group: { _id: { GuildID: '$GuildID', UserID: '$UserID' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
    ])

    let merged = 0
    for (const group of groups) {
        const docs = await Level.find({ _id: { $in: group.ids } }).lean()
        docs.sort((a, b) => (b.total || 0) - (a.total || 0))
        const [keep, ...rest] = docs

        // Keep the doc with the most EXP, but don't lose a background or a restriction from the others
        const background = [keep, ...rest].find(d => d.background && d.background !== 'none')?.background || 'none'
        const restrict = [keep, ...rest].find(d => ['Code-1', 'Code-2', 'Code-3'].includes(d.restrict))?.restrict || keep.restrict || 'Code-0'

        await Level.updateOne({ _id: keep._id }, { $set: { background, restrict } })
        await Level.deleteMany({ _id: { $in: rest.map(d => d._id) } })
        merged += rest.length
    }
    return merged
}

async function MigrateHowgay(GuildIds) {
    const OldDocs = await mongoose.connection.db.collection('howgaylists').find().toArray()
    let users = 0

    for (const doc of OldDocs) {
        const GuildID = ResolveGuildId(doc.GuildId, GuildIds)
        if (!GuildID) {
            Log.Warn(`Howgay migration: cannot find the real server ID of ${doc.GuildId}, skipped`)
            continue
        }

        const UserOps = (doc.UserRecords || []).filter(r => r?.id).map(r => ({
            updateOne: {
                filter: { GuildID, UserID: String(r.id) },
                update: {
                    $setOnInsert: {
                        Total: Number(r.total?.normal) || 0,
                        Special: Number(r.total?.special) || 0,
                        Single: (r.values?.run?.nonavg || []).slice(0, 100).map(Number),
                        Average: (r.values?.run?.avg || []).slice(0, 100).map(Number)
                    }
                },
                upsert: true
            }
        }))
        if (UserOps.length) await HowgayUser.bulkWrite(UserOps, { ordered: false })
        users += UserOps.length

        // TypeRecords = [ { 0: { name, value }... }, { '32.0': count... } ]
        const [NormalOld = {}, SpecialOld = {}] = doc.TypeRecords || []
        const Normal = {}, Special = {}
        for (const [i, v] of Object.entries(NormalOld)) Normal[i] = Number(v?.value) || 0
        for (const [k, v] of Object.entries(SpecialOld)) Special[String(k).replace('.', '_')] = Number(v) || 0

        await HowgayGuild.updateOne({ GuildID }, { $setOnInsert: { Normal, Special } }, { upsert: true })
    }
    return users
}

// Old omikuji record: { 'C-Tier': n, ..., 'SS-Tier': [a, b, c], 'EX-Tier': n }
function OmikujiCounts(record) {
    const Counts = {}
    for (const Tier of OmikujiConfig.Key) {
        const value = record?.[Tier]
        if (Array.isArray(value)) {
            Counts[Tier] = value.reduce((a, b) => a + (Number(b) || 0), 0)
            value.forEach((n, i) => Counts[`${Tier}_${i}`] = Number(n) || 0)
        } else {
            Counts[Tier] = Number(value) || 0
        }
    }
    return Counts
}

async function MigrateOmikuji(GuildIds) {
    const OldDocs = await mongoose.connection.db.collection('omikujis').find().toArray()
    let users = 0

    for (const doc of OldDocs) {
        const GuildID = ResolveGuildId(doc.GuildId, GuildIds)
        if (!GuildID) {
            Log.Warn(`Omikuji migration: cannot find the real server ID of ${doc.GuildId}, skipped`)
            continue
        }

        const UserOps = (doc.UserRecords || []).filter(r => r?.UserID).map(r => ({
            updateOne: {
                filter: { GuildID, UserID: String(r.UserID) },
                update: { $setOnInsert: { Counts: OmikujiCounts(r) } },
                upsert: true
            }
        }))
        if (UserOps.length) await OmikujiUser.bulkWrite(UserOps, { ordered: false })
        users += UserOps.length

        const ServerRecord = (doc.TypeRecords || [])[0]
        if (ServerRecord) await OmikujiGuild.updateOne({ GuildID }, { $setOnInsert: { Counts: OmikujiCounts(ServerRecord) } }, { upsert: true })
    }
    return users
}

// createIndexes only adds missing indexes, it never drops anything
async function BuildIndexes() {
    for (const Model of Object.values(mongoose.models)) {
        try {
            await Model.createIndexes()
        } catch (err) {
            Log.Error(`Cannot build indexes for ${Model.modelName}:`, err.message)
        }
    }
}

module.exports = { RunMigrations }
