import CharacterParser from "./CharacterParser"
import Parser from "../Parser"
import RangeParser from "./RangeParser"

/**
 * @template {(CharacterParser | RangeParser)[]} ChildrenT
 * @extends {Parser<ChildrenT>}
 */

export default class CharacterClassParser extends Parser {

    /** @param {ChildrenT} alternatives */
    constructor(...alternatives) {
        if (!alternatives.every(v => v instanceof CharacterParser || v instanceof RangeParser)) {
            throw new Error("CharacterClass can only have characters or ranges")
        }
        super(...alternatives)
    }

    /**
     * @param {RangeParser | CharacterParser} a
     * @param {RangeParser | CharacterParser} b
     */
    static mergeRanges(a, b) {
        const [a1, a2, a1c, a2c] = a instanceof RangeParser
            ? [a.children[0], a.children[1], a.children[0].getCharCode(), a.children[1].getCharCode()]
            : [a, a, a.getCharCode(), a.getCharCode()]
        const [b1, b2, b1c, b2c] = b instanceof RangeParser
            ? [b.children[0], b.children[1], b.children[0].getCharCode(), b.children[1].getCharCode()]
            : [b, b, b.getCharCode(), b.getCharCode()]
        return b1c <= a2c + 1 && a1c <= b2c + 1
            ? (new RangeParser(
                a1c < b1c ? a1 : b1,
                a2c < b2c ? b2 : a2
            )).createSimplified()
            : null
    }

    createSimplified() {
        let simplified = false
        let result = []
        let children = [...this.children].sort((a, b) => a.getCharCode() - b.getCharCode())
        let current = children[0]
        for (let i = 1; i < children.length; ++i) {
            let candidate = CharacterClassParser.mergeRanges(current, children[i])
            if (candidate) {
                current = candidate
                simplified = true
            } else {
                result.push(current)
                current = children[i]
            }
        }
        result.push(current)
        return simplified ? new CharacterClassParser(...result) : this
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return "[" + this.children.map(c => c.regexFragment()).join("") + "]"
    }
}
