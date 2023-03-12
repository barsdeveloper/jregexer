import ISingleCharacterParser from "./ISingleCharacterParser"

export default class AnyCharacterParser extends ISingleCharacterParser {

    #newline = true
    get newline() {
        return this.#newline
    }

    /** @param {Boolean} newline */
    constructor(newline = true) {
        super()
        this.#newline = newline
    }

    /** @param {ISingleCharacterParser} characterParser */
    mergeWith(characterParser) {
        return this
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return "."
    }
}
