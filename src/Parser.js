/** @template {Parser<ChildrenT>[]} ChildrenT */
export default class Parser {

    /** Those are for regex itself parsing purpose, don't use it to parse the actual text, unoptimized */
    static escapedCharacter = /([\.\,\|\-\\^\$\(\)\[\]\{\}])/g // Characte rs that need escape (usually)
    static escapeableCharacter = /[adfnrstvwDSW"]/g // Characters that can be escaped
    static unescapedBackslash = new RegExp(String.raw`(?<=(?:[^\\]|^)(?:\\\\)*)\\(?!\\)`)
    static insideBracketContent =
        String.raw`(?:`
        // Alternative 1
        + String.raw`[^\[\]\\]`
        + String.raw`|`
        // Alternative 2
        + String.raw`${Parser.unescapedBackslash.source}(?:${Parser.escapedCharacter.source}|${Parser.escapeableCharacter.source})`
        + String.raw`)+`
    static insideBracket = new RegExp(String.raw`(?<=\[)${Parser.insideBracketContent}(?=\])`)
    static anchoredInsideBracket = new RegExp(String.raw`(?<=^\[)${Parser.insideBracketContent}(?=\]$)`)

    /** @type {ChildrenT} */
    #children = null
    get children() {
        return this.#children ?? /** @type {ChildrenT} */([])
    }

    /** @param {ChildrenT} children */
    constructor(...children) {
        this.#children = children
    }

    /**
     * @template {Parser<C>[]} C
     * @param {C} children
     * @returns {Parser[]}
     */
    static flattenChildren = children =>
        children.flatMap(c =>
            c instanceof this.constructor
                ? this.flattenChildren(c.children)
                : c
        )

    /** @param {String} value */
    parse(value) {
        throw new Error("Not implemented")
    }

    createSimplified() {
        return /** @type {Parser} */(this)
    }

    isParenthesized() {
        return false
    }

    /** @returns {Boolean} Can the created regex be used for full parsing */
    isRegexExhaustive() {
        return this.children.every(c => c.isRegexExhaustive())
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return ""
    }
}
