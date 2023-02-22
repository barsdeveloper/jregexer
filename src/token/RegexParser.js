import Parser from "../Parser"

export default class RegexParser extends Parser {

    /** @type {RegExp} */
    #regex

    /** @type {RegExp} value */
    constructor(regex) {
        super()
        this.#regex = regex
    }
}
