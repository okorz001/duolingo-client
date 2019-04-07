const http = require('./http')

class DuolingoClient {
    constructor() {
        // initialize logged out state
        this.logout()
    }

    async login(username, password) {
        const body = {login: username, password}
        const res = await http.post('https://www.duolingo.com/login', body)
        // error still returns 200, but sets "failure" key
        if (res.body.failure) {
            throw new Error(`Login for '${username}' failed: ${res.body.message}`)
        }
        this.jwt = res.headers.get('jwt')
    }

    logout() {
        this.jwt = null
    }

    async getUser(username) {
        // this URL returns more data when you are logged in as the same user
        const res = await http.get(`https://www.duolingo.com/users/${username}`)
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
            fullname: res.body.fullname,
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
