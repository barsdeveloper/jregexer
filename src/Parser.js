import Failure from "./Failure"
import Success from "./Success"

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

    /** @type {RegExp} */
    #regex

    #treeRecursion = -1

    /** @type {Boolean?} */
    #isRegexExhaustive

    /** @type {ChildrenT} */
    #children = null
    get children() {
        return this.#children ?? /** @type {ChildrenT} */([])
    }

    /** @param {ChildrenT} children */
    constructor(...children) {
        this.#children = children
    }

    createRegex(flags = "", anchoredFront = false, anchoredBack = false) {
        if (!this.#regex) {
            let source = this.regexFragment(true, true, true)
            if (anchoredFront || anchoredBack) {
                source = `${anchoredFront ? "^" : ""}(?:${source})${anchoredBack ? "$" : ""}`
            }
            this.#regex = new RegExp(source, flags)
        }
        return this.#regex
    }

    /** @param {String} value */
    parse(value, matchEnd = false) {
        if (this.isRegexExhaustive()) {
            const regex = this.createRegex("", true, matchEnd)
            const result = regex.exec(value)
            if (!result) {
                return new Failure()
            }
            return new Success(result[0], value.substring(result[0].length))
        }
        return this.parseImplement(value)
    }

    /**
     * @param {String} value
     * @returns {Success | Failure}
     */
    parseImplement(value) {
        if (this.children.length == 1) {
            return this.children[0].parseImplement(value)
        }
        throw new Error("Not implemented")
    }

    createSimplified() {
        return /** @type {Parser} */(this)
    }

    isParenthesized() {
        return false
    }

    /** @returns {Boolean} This subtree can parse using a single regex */
    isRegexExhaustive(parents = new Set()) {
        if (this.#isRegexExhaustive != undefined) {
            return this.#isRegexExhaustive
        }
        if (parents.has(this)) {
            this.#isRegexExhaustive = false
            return this.#isRegexExhaustive
        }
        parents.add(this)
        this.#isRegexExhaustive = this.children.every(c => c.isRegexExhaustive(parents))
        parents.delete(this)
        return this.#isRegexExhaustive
    }

    treeRecursion(nodes = new Set(), maxDepth = Number.POSITIVE_INFINITY) {
        if (this.#treeRecursion >= 0) {
            return this.#treeRecursion
        }
        if (nodes.has(this)) {
            this.#treeRecursion = 1
            return this.#treeRecursion
        }
        nodes.add(this)
        if (--maxDepth >= 0) {
            for (let i = 0; i < this.#children.length; ++i) {
                let result
                if (result = this.#children[i].treeRecursion(nodes, maxDepth)) {
                    this.#treeRecursion = ++result
                    return this.#treeRecursion
                }
            }
        }
        this.#treeRecursion = 0
        return this.#treeRecursion
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return ""
    }

    /**
     * @param {(child: Parser<ChildrenT>) => Boolean} predicate
     * @param {Boolean} includeThis
     * @returns {Parser<ChildrenT>?}
     */
    deepFind(predicate, parents = new Set(), includeThis = true) {
        if (includeThis && predicate(this)) {
            return this
        }
        parents.add(this)
        const result = this.children.find(c => c.deepFind(predicate, parents))
        parents.delete(this)
        return result
    }
}
