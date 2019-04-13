const DuolingoClient = require('./src/client')
const getJwt = require('./src/get-jwt')

/**
 * The object returned by <code>require('duolingo-client')</code>.
 * @namespace duolingo-client
 */
module.exports = {
    DuolingoClient,
    getJwt,
}
