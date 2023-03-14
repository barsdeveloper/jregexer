import CharacterParser from "./CharacterParser"
import Parser from "../Parser"

export default class StringParser extends Parser {

    value = ""

    /** @param {String} value */
    constructor(value) {
        super()
        this.value = value
    }

    createSimplified() {
        if (this.value.length === 1) {
            return new CharacterParser(this.value)
        }
        return this
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return this.value.replaceAll(Parser.escapedCharacter, "\\$1")
    }
}
