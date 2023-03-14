import GroupToken from "./GroupToken"
import Parser from "../Parser"

/**
 * @template {Parser} ChildT
 * @extends {Parser<[ChildT]>}
 */
export default class RepeatParser extends Parser {

    min = 1
    max = 1

    /**
     * @param {ChildT} child
     * @param {Number} min
     * @param {Number} max
     */
    constructor(child, min, max = min) {
        super(child)
        if (!(min >= 0 && min <= max && min < Number.POSITIVE_INFINITY && max > 0)) {
            throw new Error(`Bad min (${min}) or max (${max}) values`)
        }
        this.min = min
        this.max = max
    }

    createSimplified() {
        const child = this.children[0].createSimplified()
        if (child instanceof RepeatParser) {
            return new RepeatParser(child.children[0], this.min * child.min, this.max * child.max)
        }
        if (this.min === 1 && this.min === this.max) {
            return child
        }
        return child === this.children[0] ? this : new RepeatParser(child, this.min, this.max)
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        let result = "{" + this.min + "," + this.max + "}"
        if (this.max === Number.POSITIVE_INFINITY) {
            if (this.min === 0) {
                result = "*"
            } else if (this.min === 1) {
                result = "+"
            } else {
                result = `{${this.min},}`
            }
        } else if (this.max === 1) {
            if (this.min === 0) {
                result = "?"
            } else if (this.min === 1) {
                return this.children[0].regexFragment(canOmitParentheses, matchesBegin, matchesEnd)
            }
        } else if (this.max === this.min) {
            result = `{${this.min}}`
        }
        const childRegex = this.children[0].regexFragment(true)
        return (this.children[0].isParenthesized() ? childRegex : `(?:${childRegex})`) + result
    }

    isRegexExhaustive(parents = new Set()) {
        if (this.max <= 1) {
            return super.isRegexExhaustive(parents)
        }
        if (parents.has(this)) {
            return false
        }
        const result = this.deepFind(c => !c.isRegexExhaustive(parents) || c instanceof GroupToken, parents) == null
        return result
    }
}
