const ONLINE_GRACE_PERIOD_MS = 90 * 1000

export function isPresenceOnline(isOnline, lastSeen) {
    if (!isOnline || !lastSeen) {
        return false
    }

    const timestamp = new Date(lastSeen).getTime()
    if (Number.isNaN(timestamp)) {
        return false
    }

    return Date.now() - timestamp <= ONLINE_GRACE_PERIOD_MS
}
