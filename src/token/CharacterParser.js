import Parser from "../Parser"
import ISingleCharacterParser from "./ISingleCharacterParser"

export default class CharacterParser extends ISingleCharacterParser {

    static singleCharacterRegex = new RegExp(
        String.raw`^(?:\\${Parser.escapedCharacter.source}|(?!${Parser.escapedCharacter.source}).)$`
    )

    value = ""

    /** @param {String} value */
    constructor(value) {
        super()
        if (value.length !== 1) {
            throw new Error("It must be just a single character")
        }
        this.value = value
    }

    isParenthesized() {
        return true
    }

    getCharCode() {
        return this.value.charCodeAt(this.value.length - 1)
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return this.value.replaceAll(Parser.escapedCharacter, "\\$0")
    }
}
