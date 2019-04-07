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

}

module.exports = {
    DuolingoClient,
}
