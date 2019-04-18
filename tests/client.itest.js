const DuolingoClient = require('../src/client')

const {DUOLINGO_USERNAME, DUOLINGO_PASSWORD} = process.env
let withAuth = it
if (!DUOLINGO_USERNAME || !DUOLINGO_PASSWORD) {
    withAuth = it.skip
    console.warn('DUOLINGO_USERNAME or DUOLINGO_PASSWORD is undefined,',
                 'skipping authed tests')
}

withAuth('setCurrentCourse', async () => {
    const client = new DuolingoClient()
    await client.login(DUOLINGO_USERNAME, DUOLINGO_PASSWORD)

    await client.setCurrentCourse('DUOLINGO_EN_VI')
    let user = await client.getUser(DUOLINGO_USERNAME)
    expect(user.currentCourseId).toEqual('DUOLINGO_EN_VI')

    await client.setCurrentCourse('DUOLINGO_VI_EN')
    user = await client.getUser(DUOLINGO_USERNAME)
    expect(user.currentCourseId).toEqual('DUOLINGO_VI_EN')
}, 10000)
