import AlternativeParser from "./token/AlternativeParser"
import CharacterClassParser from "./token/CharacterClassParser"
import CharacterParser from "./token/CharacterParser"
import Parser from "./Parser"
import RangeParser from "./token/RangeParser"
import RegexParser from "./token/RegexParser"
import RepeatParser from "./token/RepeatParser"
import Sequence from "./token/Sequence"
import StringParser from "./token/StringParser"
import Success from "./Success"

/**
 * @template {Parser<ChildrenT>} ParserT
 * @template {[...Parsers]} ChildrenT
 * @template {Parser[]} Parsers
 */
export default class JRegexer {

    /** @type {ParserT} */
    #parser
    get parser() {
        return this.#parser
    }

    #simplified = false

    /** @param {ParserT} parser */
    constructor(parser) {
        this.#parser = parser
    }

    /**
     * @template {Parser<ChildrenT>} OtherParserT
     * @template {[...ChildrenT]} ChildrenT
     * @type {{
     *     (value: JRegexer<OtherParserT>): JRegexer<OtherParserT>,
     *     (value: OtherParserT): JRegexer<OtherParserT>,
     *     (value: RegExp): JRegexer<RegexParser>,
     *     (value: String): JRegexer<StringParser | CharacterParser>,
     * }}
     * @param {Number | String | RegExp | OtherParserT | JRegexer<OtherParserT>} value
     */
    static sanitize = (value) => {
        if (value instanceof JRegexer) {
            return value
        }
        if (value instanceof Parser) {
            return new JRegexer(value)
        }
        if (value instanceof RegExp) {
            // @ts-expect-error
            return new JRegexer(new RegexParser(value))
        }
        if (value.constructor === String) {
            if (value.length === 1) {
                // @ts-expect-error
                return new JRegexer(new CharacterParser(value))
            }
            // @ts-expect-error
            return new JRegexer(new StringParser(value.valueOf()))
        }
        throw Error("Type no accepted")
    }

    simplify() {
        if (this.#simplified) {
            return this
        }
        this.#parser = this.#parser.createSimplified()
        this.#simplified = true
        return this
    }

    createRegex(flags = "") {
        this.simplify()
        return this.#parser.createRegex(flags, false, false)
    }

    parse(value) {
        const outcome = this.#parser.parse(value, true)
        if (!outcome.status) {
            throw new Error("Failed to parse")
        }
        return /** @type {Success} */(outcome).result
    }

    /**
     * @template {Parser<OtherChildrenT>} OtherParserT
     * @template {[...OtherChildrenT]} OtherChildrenT
     * @param {JRegexer<OtherParserT>} other
     */
    or(other) {
        if (!(other instanceof JRegexer)) {
            throw new Error('Please use the function R() to create parsers: [...].or(R("b"))')
        }
        return new JRegexer(new AlternativeParser(this.parser, other.parser))
    }

    /**
     * @template {Parser<OtherChildrenT>} OtherParserT
     * @template {[...OtherChildrenT]} OtherChildrenT
     * @param {JRegexer<OtherParserT>} other
     */
    then(other) {
        if (!(other instanceof JRegexer)) {
            throw new Error('Please use the function R() to create parsers [...].then(R("b"))')
        }
        return new JRegexer(new Sequence(this.parser, other.parser))
    }

    /**
     * @template {Parser<OtherChildrenT>} OtherParserT
     * @template {[...OtherChildrenT]} OtherChildrenT
     * @param {JRegexer<OtherParserT>} separator
     */
    sepBy(separator, min = 0) {
        if (!(separator instanceof JRegexer)) {
            throw new Error('Please use the function R() to create parsers [...].sepBy(R("b"))')
        }
        return new JRegexer(
            new Sequence(
                this.parser,
                new RepeatParser(
                    new Sequence(separator.parser, this.parser),
                    min,
                    Number.POSITIVE_INFINITY)
            )
        )
    }

    /**
     * @template {Parser<OtherChildrenT>} OtherParserT
     * @template {[...OtherChildrenT]} OtherChildrenT
     * @param {JRegexer<OtherParserT>} separator
     */
    sepBy1(separator) {
        return this.sepBy(separator, 1)
    }

    /** @param {Number} min */
    times(min, max = min) {
        if (min < 0) {
            throw new Error("Min must be at least 0")
        }
        if (min > max) {
            throw new Error("Min is greater than max")
        }
        return new JRegexer(
            new RepeatParser(this.parser, min, max)
        )
    }

    /** @param {Number} value */
    atLeast(value) {
        return this.times(value, Number.POSITIVE_INFINITY)
    }

    /** @param {Number} value */
    atMost(value) {
        return this.times(0, value)
    }

    plus() {
        return this.atLeast(1)
    }

    star() {
        return this.atLeast(0)
    }

    maybe() {
        return this.times(0, 1)
    }

    map(mapper) {
        return new RegexParser()
    }
}

export const R = JRegexer.sanitize
/**
 * @param {String} from
 * @param {String} to
 */
// @ts-expect-error
export const Range = (from, to) => R(new CharacterClassParser(new RangeParser(R(from).parser, R(to).parser)))
