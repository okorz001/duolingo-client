const getJwt = require('./get-jwt')
const jsonHttpFetch = require('./json-http-fetch')

class DuolingoClient {
    constructor() {
        // initialize logged out state
        this.logout()
    }

    async login(username, password) {
        const jwt = await getJwt(username, password)
        this.auth = {
            username,
            headers: {
                authorization: `Bearer ${jwt}`,
            },
        }
    }

    logout() {
        this.auth = {}
    }

    async getUser(username) {
        // this URL returns more data when you are logged in as the same user
        const url =`https://www.duolingo.com/users/${username}`
        const res = await jsonHttpFetch('GET', url)
        const languages = res.body.languages
            // ignore languages that aren't being learned
            .filter(it => it.learning)
            .map(it => ({
                id: it.language,
                name: it.language_string,
                level: it.level,
                points: it.points,
            }))
            // order by points descending
            .sort((a, b) => b.points - a.points)
        return {
            id: res.body.id,
            username: res.body.username,
            // fullname may be undefined
            displayName: res.body.fullname || res.body.username,
            streak: {
                length: res.body.site_streak,
                extended: res.body.streak_extended_today,
                freeze: !!res.body.inventory.streak_freeze,
            },
            languages,
            activeLanguage: res.body.learning_language,
        }
    }
}

module.exports = {
    DuolingoClient,
}
