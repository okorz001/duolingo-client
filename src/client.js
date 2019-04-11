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
        const url = `https://www.duolingo.com/users/${username}`
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

    // TODO: Find a way to discover skills/language without a user
    async getLanguage(username, language) {
        const url = `https://www.duolingo.com/users/${username}`
        const res = await jsonHttpFetch('GET', url)
        const data = res.body.language_data[language]
        if (!data) {
            throw new Error(`${language} is not the active language for ${username}`)
        }
        const skills = data.skills.map(it => ({
            id: it.id,
            title: it.title,
        }))
        return {
            id: data.language,
            name: data.language_string,
            skills,
        }
    }

    async getSkill(id) {
        if (!this.auth) {
            throw new Error('Login required')
        }

        const url = `https://www.duolingo.com/api/1/skills/show?id=${id}`
        const res = await jsonHttpFetch('GET', url, this.auth.headers)

        // Accumulate words from lessons
        const words = []
        res.body.path
            // Ignore any lessons without words (???)
            .filter(it => it.words)
            .forEach(it => words.push(...it.words))

        return {
            id: res.body.id,
            language: res.body.language,
            title: res.body.title,
            words,
        }
    }

    async translate(from, to, words) {
        const tokens = encodeURIComponent(JSON.stringify(words))
        const url = `http://d2.duolingo.com/api/1/dictionary/hints/${to}/${from}?tokens=${tokens}`
        const res = await jsonHttpFetch('GET', url)
        return words.map(word => res.body[word])
    }
}

module.exports = DuolingoClient
