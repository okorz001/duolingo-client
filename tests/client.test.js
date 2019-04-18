const fs = require('fs')

const DuolingoClient = require('../src/client')
const {getCourseId, parseCourseId} = DuolingoClient
const jsonHttpFetch = require('../src/json-http-fetch')
const login = require('../src/login')

// 'npm test' runs in repo root, so this is relative to that
const MOCK_DIR = 'mocks'

jest.mock('../src/login')
jest.mock('../src/json-http-fetch')

it('login/logout', async () => {
    const client = new DuolingoClient()
    expect(client.auth).toEqual({})

    login.mockReturnValue({
        jwt: 'JWT',
        userId: 123,
    })
    await client.login('user', 'password')
    expect(client.auth).toMatchObject({
        username: 'user',
        userId: 123,
        headers: {
            authorization: 'Bearer JWT',
        },
    })

    client.logout()
    expect(client.auth).toEqual({})
})

function mockFetch(filename) {
    const text = fs.readFileSync(`${MOCK_DIR}/${filename}`, 'utf8')
    const body = JSON.parse(text)
    jsonHttpFetch.mockResolvedValue({body})
}

it('getUser', async () => {
    mockFetch('users-20170630.json')
    const client = new DuolingoClient()
    const user = await client.getUser('racsoTest1')
    expect(user).toMatchObject({
        id: 491392036,
        username: 'racsoTest1',
        displayName: 'Racso',
        streak: 1,
        currentCourseId: 'DUOLINGO_VI_EN',
        courses: [
            {
                id: 'DUOLINGO_VI_EN',
                xp: 30,
            },
        ],
    })
})

it('getCourses', async () => {
    mockFetch('courses.json')
    const client = new DuolingoClient()
    const courses = await client.getCourses()
    expect(courses[0]).toMatchObject({
        id: 'DUOLINGO_EN_RU',
        learningLanguage: {
            id: 'en',
            name: 'English',
        },
        fromLanguage: {
            id: 'ru',
            name: 'Russian',
        },
        phase: 3,
        progress: 100,
        usersCount: 5369622,
    })
    expect(courses.length).toEqual(100)
})

it('getCourseSkills', async () => {
    mockFetch('users.json')
    const client = new DuolingoClient()
    const skills = await client.getCourseSkills('DUOLINGO_VI_EN', 'racsoTest1')
    expect(skills[0]).toEqual({
        id: '4162b2891e4ba0aa19092655e2d13039',
        title: 'Basics 1',
        urlTitle: 'Basics-1',
    })
    expect(skills.length).toEqual(84)
})

it.each([
    ['DUOLINGO_ES_EN'],
    ['DUOLINGO_VI_FR'],
    ['DUOLINGO_EN_VI'],
])('getCourseSkills not current', async (courseId) => {
    mockFetch('users.json')
    const client = new DuolingoClient()
    await expect(client.getCourseSkills(courseId, 'racsoTest1')).rejects.toThrow()
})

it('getSkillWords', async () => {
    mockFetch('skills.json')
    const client = new DuolingoClient()
    const words = await client.getSkillWords('7df994e56b4513b3517f911b56e142d2')
    expect(words[0]).toBe('el')
    expect(words.length).toBe(26)
})

it('translate', async () => {
    mockFetch('hints-tokens.json')
    const client = new DuolingoClient()
    const translations = await client.translate('en', 'es', ['one', 'two'])
    expect(translations).toEqual([
        ['un', 'una', 'uno', '1'],
        ['dos', '2'],
    ])
})

it('getShopItems', async () => {
    mockFetch('shop_items.json')
    const client = new DuolingoClient()
    const items = await client.getShopItems()
    expect(items[0]).toMatchObject({
        id: 'formal_outfit',
        type: 'outfit',
        name: 'Formal Attire',
        description: "Learn in style. Duo has always been a sharp guy, now he'll look sharp too.",
        price: 20,
    })
    expect(items.length).toEqual(8)
})

it('buyItem', async () => {
    mockFetch('purchase_store_item.json')
    const client = new DuolingoClient()
    const result = await client.buyItem('streak_freeze')
    expect(result).toBe(true)
})

it('buyItem already bought', async () => {
    const body = {error: 'ALREADY_HAVE_STORE_ITEM'}
    jsonHttpFetch.mockResolvedValue({body})
    const client = new DuolingoClient()
    const result = await client.buyItem('streak_freeze')
    expect(result).toBe(false)
})

it.each([
    ['es', 'en', 'DUOLINGO_ES_EN'],
    ['en', 'ru', 'DUOLINGO_EN_RU'],
    ['zh-CN', 'en', 'DUOLINGO_ZH-CN_EN'],
    ['en', 'zh-CN', 'DUOLINGO_EN_ZH-CN'],
])('getCourseId %s %s', (learningLanguageId, fromLanguageId, courseId) => {
    const result = getCourseId(learningLanguageId, fromLanguageId)
    expect(result).toEqual(courseId)
})

it.each([
    ['DUOLINGO_ES_EN', 'es', 'en'],
    ['DUOLINGO_EN_RU', 'en', 'ru'],
    ['DUOLINGO_ZH-CN_EN', 'zh-CN', 'en'],
    ['DUOLINGO_EN_ZH-CN', 'en', 'zh-CN'],
])('parseCourseId %s', (courseId, learningLanguageId, fromLanguageId) => {
    const result = parseCourseId(courseId)
    expect(result).toMatchObject({
        learningLanguageId,
        fromLanguageId,
    })
})
