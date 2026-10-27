// IDs of messages Seia deleted on purpose (link converted and re-posted),
// so the delete log doesn't report them. Each ID is forgotten after 1 minute.
const Deleted = new Set()

function MarkDeleted(messageId) {
    Deleted.add(messageId)
    setTimeout(() => Deleted.delete(messageId), 60000)
}

function WasDeletedByBot(messageId) {
    return Deleted.has(messageId)
}

module.exports = { MarkDeleted, WasDeletedByBot }
