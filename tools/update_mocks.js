const fs = require('fs')
const {promisify} = require('util')

const jsonHttpFetch = require('../src/json-http-fetch')
const login = require('../src/login')

const writeFile = promisify(fs.writeFile)

// Optional credentials for authenticatred endpoints
const {DUOLINGO_USERNAME, DUOLINGO_PASSWORD} = process.env

// Where to save output
const OUT_DIR = './mocks'

// A user to fetch for user-scoped endpoints
const USER_ID = 491392036
const USER_NAME = 'racsoTest1'

// Endpoints to hit.
const ENDPOINTS = [
    {
        url: 'https://www.duolingo.com/2017-06-30/config',
        out: 'config.json',
    },
    {
        url: `https://www.duolingo.com/users/${USER_NAME}`,
        out: 'users-unauth.json',
    },
    {
        url: 'https://d2.duolingo.com/api/1/dictionary/hints/en/es?token=one',
        out: 'hints-token.json',
    },
    {
        url: 'https://d2.duolingo.com/api/1/dictionary/hints/en/es?tokens=["one","two"]',
        out: 'hints-tokens.json',
    },
    {
        url: 'https://d2.duolingo.com/api/1/dictionary/hints/en/es?sentence=one%20fish',
        out: 'hints-sentence.json',
    },
    {
        url: 'https://www.duolingo.com/api/1/dictionary_page?lexeme_id=b1b2b2203009f082a1cf172e42fa65a3',
        out: 'dictionary_page.json',
    },
    {
        url: 'https://www.duolingo.com/api/1/skills/show?id=7df994e56b4513b3517f911b56e142d2',
        auth: true,
        out: 'skills.json',
    },
    {
        // Both of these return the same thing
        //url: `https://www.duolingo.com/2017-06-30/users/${USER_ID}?fields=*`,
        url: `https://www.duolingo.com/2017-06-30/users?username=${USER_NAME}`,
        auth: true,
        out: 'users-auth.json',
    },
    {
        url: `https://www.duolingo.com/2017-06-30/users/${USER_ID}/subscriptions`,
        auth: true,
        out: 'subscriptions.json',
    },
    {
        url: 'https://www.duolingo.com/api/1/store/get_items',
        auth: true,
        out: 'get_items.json',
    },
    {
        url: 'https://www.duolingo.com/2017-06-30/shop-items',
        auth: true,
        out: 'shop_items.json',
    },
    {
        url: 'https://www.duolingo.com/vocabulary/overview',
        auth: true,
        out: 'vocabulary.json',
    },
    {
        url: 'https://www.duolingo.com/api/1/courses/list',
        out: 'courses.json',
    },
]

async function main() {
    const promises = []

    ENDPOINTS
        .filter(it => !it.auth)
        .forEach(it => promises.push(update(it)))

    if (DUOLINGO_USERNAME && DUOLINGO_PASSWORD) {
        const {jwt} = await login(DUOLINGO_USERNAME, DUOLINGO_PASSWORD)
        const headers = {Authorization: `Bearer ${jwt}`}
        console.log(`Logged in as ${DUOLINGO_USERNAME}`)

        ENDPOINTS
            .filter(it => it.auth)
            .forEach(it => promises.push(update(it, headers)))
    }
    else {
        console.warn('Missing DUOLINGO_USERNAME or DUOLINGO_PASSWORD,',
                     'skipping authenticated endpoints')
    }

    return Promise.all(promises)
}

async function update(endpoint, headers) {
    const method = endpoint.method || 'GET'
    try {
        const res = await jsonHttpFetch(method,
                                        endpoint.url,
                                        headers,
                                        endpoint.body)
        const file = `${OUT_DIR}/${endpoint.out}`
        const text = JSON.stringify(res.body, null, '  ') + '\n'
        await writeFile(file, text, 'utf8')
        console.log(`${method} ${endpoint.url} => ${file}`)
    }
    catch (err) {
        console.error(`${method} ${endpoint.url} FAILED`)
        console.error(err)
    }
}

main().catch(console.error)
