const jsonHttpFetch = require('./json-http-fetch')
const login = require('./login')

function getCourseId(learningLanguageId, fromLanguageId) {
    learningLanguageId = fromLegacyLanguageId(learningLanguageId)
    fromLanguageId = fromLegacyLanguageId(fromLanguageId)
    return `DUOLINGO_${learningLanguageId.toUpperCase()}_${fromLanguageId.toUpperCase()}`
}

function parseCourseId(courseId) {
    const match = /^DUOLINGO_(\w+)(-\w+)?_(\w+)(-\w+)?$/.exec(courseId)
    return {
        learningLanguageId: match[1].toLowerCase() + (match[2] || ''),
        fromLanguageId: match[3].toLowerCase() + (match[4] || ''),
    }
}

// some languages do not use ISO language codes in some (older?) APIs
// https://www.duolingo.com/api/1/courses/list
const LEGACY_LANGUAGE_IDS = [
    // norwegian
    {iso: 'no-BO', legacy: 'nb'},
    // dutch
    {iso: 'nl-NL', legacy: 'dn'},
    // klingon
    {iso: 'tlh', legacy: 'kl'},
    // chinese
    {iso: 'zh-CN', legacy: 'zs'},
]

// zs => zh-CN
function fromLegacyLanguageId(languageId) {
    return LEGACY_LANGUAGE_IDS.find(it => it.legacy == languageId) ||
        languageId
}

// zh-CN => zs
function toLegacyLanguageId(languageId) {
    return LEGACY_LANGUAGE_IDS.find(it => it.iso == languageId) ||
        languageId
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
     * @prop {boolean} hasPlus Is this user a Plus subscriber?
     * @prop {integer} streak The user's streak length.
     * @prop {string} currentCourseId The id of the course that is currently
     *                                active for this user.
     * @prop {UserCourse[]} courses The courses started by this user.
     */
    /**
     * @typedef UserCourse
     * @prop {string} id The course id.
     * @prop {integer} points The experience earned in this course.
     */
    /**
     * Gets a user by username.
     * @param {string} username The username to fetch.
     * @return {Promise<User>} The user.
     */
    async getUser(username) {
        const url = `https://www.duolingo.com/2017-06-30/users?username=${username}`
        const res = await jsonHttpFetch('GET', url)
        const user = res.body.users[0]
        const courses = user.courses
            .map(it => ({
                id: it.id,
                xp: it.xp,
            }))
            // order by xp descending
            .sort((a, b) => b.xp - a.xp)
        return {
            id: user.id,
            username: user.username,
            // fullname may be undefined
            displayName: user.name || user.username,
            hasPlus: user.hasPlus,
            streak: user.streak,
            currentCourseId: user.currentCourseId,
            courses,
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
     * @typedef Language
     * @prop {string} id The id of this language.
     * @prop {string} name The display name of this language.
     */
    /**
     * Gets all available courses.
     * @return {Promise<Course[]>} All available courses.
     */
    async getCourses() {
        const url = 'https://www.duolingo.com/api/1/courses/list'
        const res = await jsonHttpFetch('GET', url)
        return res.body.map(course => ({
            id: getCourseId(course.learning_language_id,
                            course.from_language_id),
            learningLanguage: {
                id: course.learning_language_id,
                name: course.learning_language_name,
            },
            fromLanguage: {
                id: course.from_language_id,
                name: course.from_language_name,
            },
            phase: course.phase,
            progress: course.phase == 1 ? course.progress : 100,
            usersCount: course.num_learners,
        }))
    }

    /**
     * @typedef Skill
     * @prop {string} id The unique skill id.
     * @prop {string} title The course-scoped display name of this skill.
     * @prop {string} urlTitle The course-scoped URL path of this skill.
     */
    /**
     * Gets the skills taught in a course.
     * <p>
     * <b>Note:</b> This currently requires a user that is currently
     * taking the course but the result does not include any
     * user-specific data. This requirement may be dropped if a better
     * Duolingo API is discovered.
     * @param {string} courseId The course to get the skills from.
     * @param {string} username A user who is currently studying the course.
     * @retun {Promise<Skill[]>} The skills from the course.
     */
    async getCourseSkills(courseId, username) {
        // TODO: Find a way to discover skills without a user
        const url = `https://www.duolingo.com/users/${username}`
        const res = await jsonHttpFetch('GET', url)

        // confirm user's current course
        const currentCourseId = getCourseId(res.body.learning_language,
                                            res.body.ui_language)
        if (currentCourseId != courseId) {
            throw new Error(`The current course for ${username} is ${currentCourseId}, not ${courseId}`)
        }

        const data = res.body.language_data[res.body.learning_language]
        return data.skills
            .sort((a, b) => {
                if (a.coords_y != b.coords_y) {
                    return a.coords_y - b.coords_y
                }
                return a.coords_x - b.coords_x
            })
            .map(it => ({
                id: it.id,
                title: it.title,
                urlTitle: it.url_title,
            }))
    }

    /**
     * Gets the words taught in a skill.
     * <p>
     * <b>Requires authentication.</b>
     * @param {string} id The id of the skill to get words from.
     * @return {Promise<String[]>} The words in the skill.
     */
    async getSkillWords(id) {
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
        return words
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
        from = toLegacyLanguageId(from)
        to = toLegacyLanguageId(to)
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

    // TODO: some items are course scoped but the API only accepts legacy ids
    // for learning languages
    /**
     * Buy an item for the logged-in user.
     * <p>
     * <b>Requires authentication.</b>
     * @param {string} item The id of the item to buy.
     * @return {Promise<boolean>} Returns true if the item was bought, or
     *                            false if this user already has the item.
     */
    async buyItem(item) {
        if (!this.auth) {
            throw new Error('Login required')
        }

        const url = `https://www.duolingo.com/2017-06-30/users/${this.auth.userId}/purchase-store-item`
        const body = {name: item, learningLanguage: null}
        const res = await jsonHttpFetch('POST', url, this.auth.headers, body)
        if (res.body.error == 'ALREADY_HAVE_STORE_ITEM') {
            return false
        }
        return true
    }

    /**
     * Switches the active course for the logged-in user.
     * <p>
     * <b>Requires authentication.</b>
     * @param {string} courseId The course to switch to.
     */
    async setCurrentCourse(courseId) {
        if (!this.auth) {
            throw new Error('Login required')
        }

        // set fields to empty to avoid getting entire user back
        const url = `https://www.duolingo.com/2017-06-30/users/${this.auth.userId}?fields=`
        const body = {courseId}
        return jsonHttpFetch('PATCH', url, this.auth.headers, body)
    }
}

module.exports = DuolingoClient
// for testing
module.exports.getCourseId = getCourseId
module.exports.parseCourseId = parseCourseId
