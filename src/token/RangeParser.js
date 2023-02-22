import Parser from "../Parser"
import CharacterParser from "./CharacterParser"

/** @extends {Parser<[CharacterParser, CharacterParser]>} */
export default class RangeParser extends Parser {

    /**
     * @param {CharacterParser} from
     * @param {CharacterParser} to
     */
    constructor(from, to) {
        if (!(from instanceof CharacterParser) || !(to instanceof CharacterParser)) {
            throw new Error("Range values are of unexpected type")
        }
        if (from.getCharCode() > to.getCharCode()) {
            throw new Error("The begin character comes after the end character")
        }
        super(from, to)
    }

    isParenthesized() {
        return true
    }

    getCharCode() {
        return this.children[0].getCharCode()
    }

    createSimplified() {
        if (this.children[0].getCharCode() === this.children[1].getCharCode()) {
            return this.children[0]
        }
        return this
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return this.children[0].regexFragment(false, false, false)
            + "-"
            + this.children[1].regexFragment(false, false, false)
    }
}
