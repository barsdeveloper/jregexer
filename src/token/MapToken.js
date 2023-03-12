import Parser from "../Parser"

/**
 * @template {Parser} ChildT
 * @extends {Parser<[ChildT]>}
 */
export default class MapToken extends Parser {

    /** @param {ChildT} child */
    constructor(child) {
        super(child)
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return "(" + this.children[0].regexFragment(true, matchesBegin, matchesEnd) + ")"
    }
}
