const fs = require('fs')

const DuolingoClient = require('../src/client')
const getJwt = require('../src/get-jwt')
const jsonHttpFetch = require('../src/json-http-fetch')

// 'npm test' runs in repo root, so this is relative to that
const MOCK_DIR = 'mocks'

jest.mock('../src/get-jwt')
jest.mock('../src/json-http-fetch')

it('login/logout', async () => {
    const client = new DuolingoClient()
    expect(client.auth).toEqual({})

    getJwt.mockReturnValue('JWT')
    await client.login('user', 'password')
    expect(client.auth).toMatchObject({
        username: 'user',
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
    mockFetch('users-unauth.json')
    const client = new DuolingoClient()
    const user = await client.getUser('racsoTest1')
    expect(user).toMatchObject({
        id: 491392036,
        username: 'racsoTest1',
        displayName: 'Racso',
        streak: {
            length: 1,
            extended: false,
            freeze: false,
        },
        languages: [
            {
                id: 'vi',
                name: 'Vietnamese',
                level: 1,
                points: 30,
            },
        ],
        activeLanguage: 'vi',
    })
})

it('getLanguage', async () => {
    mockFetch('users-unauth.json')
    const client = new DuolingoClient()
    const lang = await client.getLanguage('racsoTest1', 'vi')
    expect(lang).toMatchObject({
        id: 'vi',
        name: 'Vietnamese',
    })
    expect(lang.skills[0]).toEqual({
        id: '1e791efe88b8b43be8a11f1e5da85184',
        title: 'Clothing',
    })
    expect(lang.skills.length).toEqual(84)
})

it('getLanguage not active', async () => {
    mockFetch('users-unauth.json')
    const client = new DuolingoClient()
    await expect(client.getLanguage('racsoTest1', 'es')).rejects.toThrow()
})

it('getSkill', async () => {
    mockFetch('skills.json')
    const client = new DuolingoClient()
    const skill = await client.getSkill('7df994e56b4513b3517f911b56e142d2')
    expect(skill).toMatchObject({
        id: '7df994e56b4513b3517f911b56e142d2',
        language: 'es',
        title: 'Introduction',
    })
    expect(skill.words[0]).toBe('el')
    expect(skill.words.length).toBe(26)
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
