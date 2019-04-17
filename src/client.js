const jsonHttpFetch = require('./json-http-fetch')
const login = require('./login')

function getCourseId(learningLanguageId, fromLanguageId) {
    return `DUOLINGO_${learningLanguageId.toUpperCase()}_${fromLanguageId.toUpperCase()}`
}

function parseCourseId(courseId) {
    const match = /^DUOLINGO_(\w+)_(\w+)$/.exec(courseId)
    return {
        learningLanguageId: match[1].toLowerCase(),
        fromLanguageId: match[2].toLowerCase(),
    }
}

/**
 * A high-level client for the Duolingo API.
 * @memberof! module:duolingo-client
 */
class DuolingoClient {
    /**
     * Creates a new client. New instances are in a logged-out state.
     */
    constructor() {
        // initialize logged out state
        this.logout()
    }

    /**
     * Logs in as a the specified user. Future API calls requiring
     * authentication will use this user's credentials. Unauthenticated
     * calls will still be made without credentials.
     * <p>
     * If previously logged-in, those credentials will be overwritten,
     * effectively logging out.
     * @param {string} username The username to login as.
     * @param {string} password The user's password.
     * @return {Promise<void>}
     */
    async login(username, password) {
        const {jwt, userId} = await login(username, password)
        this.auth = {
            username,
            userId,
            headers: {
                authorization: `Bearer ${jwt}`,
            },
        }
    }

    /**
     * Logs out and discards credentials.
     * @return {void}
     */
    logout() {
        this.auth = {}
    }

    /**
     * @typedef User
     * @prop {integer} id The user's id.
     * @prop {string} username The user's username.
     * @prop {string} displayName The user's display name.
     * @prop {UserStreak} streak The user's streak information.
     * @prop {UserLanguage[]} languages Langauges being learned by this user.
     * @prop {string} activeLanguage The language id currently being learned
     *                               by this user.
     */
    /**
     * @typedef UserStreak
     * @prop {integer} length The user's streak length.
     * @prop {boolean} extended Is the streak extended today?
     * @prop {boolean} freeze Is streak freeze equipped?
     */
    /**
     * @typedef UserLanguage
     * @prop {string} id The language id.
     * @prop {string} name The language display name.
     * @prop {integer} level The level of the user in this language.
     * @prop {integer} points The points of the user in this language.
     */
    /**
     * Fetches a user by username.
     * @param {string} username The username to fetch.
     * @return {Promise<User>} The user.
     */
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

    /**
     * @typedef Course
     * @prop {string} The id of this course.
     * @prop {Language} learningLanguage The language taught in this course.
     * @prop {Language} fromLanguage The native/UI language of this course.
     * @prop {integer} phase The release state of the course:
     *                       <li>1 = Hatching</li>
     *                       <li>2 = Beta</li>
     *                       <li>3 = Released</li>
     * @prop {integer} progress How complete the course is.
     * @prop {integer} usersCount The number of users taking the course.
     */
    /**
     * Gets all available courses.
     * @return {Promise<Course[]>} All available courses.
     */
    async getCourses() {
        const url = 'https://www.duolingo.com/api/1/courses/list'
        const res = await jsonHttpFetch('GET', url)
        return res.body.map(course => ({
            id: getCourseId(course.learning_language,
                            course.from_language),
            learningLanguage: {
                id: course.learning_language,
                name: course.learning_language_name,
            },
            fromLanguage: {
                id: course.from_language,
                name: course.from_language_name,
            },
            phase: course.phase,
            progress: course.phase == 1 ? course.progress : 100,
            usersCount: course.num_learners,
        }))
    }

    /**
     * @typedef Language
     * @prop {string} id The id of this language.
     * @prop {string} name The display name of this language.
     * @prop {LanguageSkill[]} skills The skills in this language.
     * @deprecated Skills will be removed from Language.
     */
    /**
     * @typedef LanguageSkill
     * @prop {string} id The id of the skill.
     * @prop {string} title The language-scoped display name of the skill.
     */
    /**
     * Fetches a language by id.
     * <p>
     * <b>Note:</b> This currently requires a user that is currently
     * learning the language but the response does not include any
     * user-specific data. This requirement may be dropped if a better
     * Duolingo API is discovered.
     * @param {string} language The id of the language to fetch.
     * @param {string} username The username of a user currently learning
     *                          the requested language.
     * @return {Promise<Language>} The language.
     */
    async getLanguage(language, username) {
        // TODO: Find a way to discover skills/language without a user
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

    /**
     * @typedef Skill
     * @prop {string} id The unique skill id.
     * @prop {string} language The language id of this skill.
     * @prop {string} title The language-scoped display name of this skill.
     * @prop {string[]} words The words in this skill.
     */
    /**
     * Fetches a skill by id.
     * <p>
     * <b>Requires authentication.</b>
     * @param {string} id The skill id to fetch.
     * @return {Promise<Skill>} The skill.
     */
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

    /**
     * Translates a list of words. Each word may have more than one possible
     * translation.
     * @param {string} from The id of the language to translate from.
     * @param {string} to The id of the language to translate to.
     * @param {string[]} words The list of words to translate.
     * @return {string[][]} A list of translations for every word.
     */
    async translate(from, to, words) {
        const tokens = encodeURIComponent(JSON.stringify(words))
        const url = `http://d2.duolingo.com/api/1/dictionary/hints/${to}/${from}?tokens=${tokens}`
        const res = await jsonHttpFetch('GET', url)
        return words.map(word => res.body[word])
    }

    /**
     * @typedef Item
     * @prop {string} id The item's id.
     * @prop {string} type The item's category, e.g. "misc" or "outfit".
     * @prop {string} name The item's display name.
     * @prop {string} description The item's description.
     * @prop {integer} price The cost to purchase this item.
     */
    /**
     * Gets items available for purchase by the logged-in user.
     * <p>
     * <b>Requires authentication.</b>
     * @return {Promise<Item[]>} The items available.
     */
    async getShopItems() {
        if (!this.auth) {
            throw new Error('Login required')
        }

        const url = 'https://www.duolingo.com/2017-06-30/store-items'
        const res = await jsonHttpFetch('GET', url, this.auth.headers)
        return res.body.shopItems
            // hide in-app purchases that cost real money
            .filter(item => item.type != 'in_app_purchase')
            // hide things that don't show in the app
            .filter(item => item.name && item.localizedDescription)
            .map(item => ({
                id: item.id,
                type: item.type,
                name: item.name,
                description: item.localizedDescription,
                price: item.price,
            }))
    }

    /**
     * Buys streak freeze for the logged-in user.
     * <p>
     * <b>Requires authentication.</b>
     * @return {Promise<boolean>} Returns true if streak freeze was bought, or
     *                            false if this user already has streak freeze.
     */
    async buyStreakFreeze() {
        return this.buyItem('streak_freeze')
    }

    /**
     * Buy an item for the logged-in user.
     * <p>
     * Some items, such as extra skills, are scoped to a particular language.
     * To purchase such an item, the language must be specified.
     * <p>
     * <b>Requires authentication.</b>
     * @param {string} item The id of the item to buy.
     * @param {string} language Optional: The language to buy the item for/in.
     * @return {Promise<boolean>} Returns true if the item was bought, or
     *                            false if this user already has the item.
     */
    async buyItem(item, language) {
        if (!this.auth) {
            throw new Error('Login required')
        }

        const url = `https://www.duolingo.com/2017-06-30/users/${this.auth.userId}/purchase-store-item`
        const body = {name: item, learningLanguage: language}
        const res = await jsonHttpFetch('POST', url, this.auth.headers, body)
        if (res.body.error == 'ALREADY_HAVE_STORE_ITEM') {
            return false
        }
        return true
    }
}

module.exports = DuolingoClient
// for testing
module.exports.getCourseId = getCourseId
module.exports.parseCourseId = parseCourseId
