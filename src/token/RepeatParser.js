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
        this.min = min
        this.max = max
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        let result = "{" + this.min + "," + this.max + "}"
        if (this.max === Number.POSITIVE_INFINITY) {
            if (this.min === 0) {
                result = "*"
            } else if (this.min === 1) {
                result = "+"
            }
        }
        return this.children[0].regexFragment() + result
    }
}
