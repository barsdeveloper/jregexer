/** @template {Parser<ChildrenT>[]} ChildrenT */
class Parser {

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
        this.#children = children;
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

/**
 * @typedef {import("./CharacterClassParser").default} CharacterClassParser
 * @typedef {import("./CharacterParser").default} CharacterParser
 * @typedef {import("./RangeParser").default} RangeParser
 */

class AnyCharacterParser extends Parser {

    #newline = true
    get newline() {
        return this.#newline
    }

    /** @param {Boolean} newline */
    constructor(newline = true) {
        super();
        this.#newline = newline;
    }

    /**
     * @param {CharacterClassParser | AnyCharacterParser | CharacterParser | RangeParser} characterParser
     */
    mergeWith(characterParser) {
        return this
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return "."
    }
}

class CharacterParser extends Parser {

    static singleCharacterRegex = new RegExp(
        String.raw`^(?:\\${Parser.escapedCharacter.source}|(?!${Parser.escapedCharacter.source}).)$`
    )

    value = ""

    /** @param {String} value */
    constructor(value) {
        super();
        if (value.length !== 1) {
            throw new Error("It must be just a single character")
        }
        this.value = value;
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

/** @extends {Parser<CharacterParser[]>} */
class RangeParser extends Parser {

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
        super(from, to);
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
            + (this.children[1].getCharCode() > this.children[0].getCharCode() + 1 ? "-" : "")
            + this.children[1].regexFragment(false, false, false)
    }
}

// @ts-expect-error
/** @template {(RangeParser | CharacterParser)[]} ChildrenT @extends {Parser<ChildrenT>} */
class CharacterClassParser extends Parser {

    /** @param {ChildrenT} alternatives */
    constructor(...alternatives) {
        if (!alternatives.every(v => v instanceof CharacterParser || v instanceof RangeParser)) {
            throw new Error("CharacterClass can only have characters or ranges")
        }
        super(...alternatives);
    }

    /**
     * @param {RangeParser | CharacterParser} a
     * @param {RangeParser | CharacterParser} b
     */
    static mergeRanges(a, b) {
        const [a1, a2, a1c, a2c] = a instanceof RangeParser
            ? [a.children[0], a.children[1], a.children[0].getCharCode(), a.children[1].getCharCode()]
            : [a, a, a.getCharCode(), a.getCharCode()];
        const [b1, b2, b1c, b2c] = b instanceof RangeParser
            ? [b.children[0], b.children[1], b.children[0].getCharCode(), b.children[1].getCharCode()]
            : [b, b, b.getCharCode(), b.getCharCode()];
        return b1c <= a2c + 1 && a1c <= b2c + 1
            ? (new RangeParser(
                a1c < b1c ? a1 : b1,
                a2c < b2c ? b2 : a2
            )).createSimplified()
            : null
    }

    /** @param {CharacterClassParser | AnyCharacterParser | CharacterParser | RangeParser} characterParser */
    mergeWith(characterParser) {
        if (characterParser instanceof AnyCharacterParser) {
            return new AnyCharacterParser(characterParser.newline)
        }
        if (characterParser instanceof CharacterClassParser) {
            return /** @type {CharacterClassParser<(RangeParser | CharacterParser)[]>} */(characterParser).children
                .reduce(
                    (acc, cur) => acc.mergeWith(cur),
                    this,
                )
        }
        if (characterParser instanceof CharacterParser || characterParser instanceof RangeParser) {
            const result = new CharacterClassParser(...this.children);
            result.children.push(characterParser);
            return result.createSimplified()
        }
        return null
    }

    isParenthesized() {
        return true
    }

    createSimplified() {
        let simplified = false;
        let result = [];
        const children = [...this.children].sort((a, b) => a.getCharCode() - b.getCharCode());
        let current = children[0];
        for (let i = 1; i < children.length; ++i) {
            let candidate = CharacterClassParser.mergeRanges(current, children[i]);
            if (candidate) {
                current = candidate;
                simplified = true;
            } else {
                result.push(current);
                current = children[i];
            }
        }
        result.push(current);
        if (result.length === 1 && result[0] instanceof CharacterParser) {
            return result[0]
        }
        return simplified ? new CharacterClassParser(...result) : this
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        return "[" + this.children.map(c => c.regexFragment()).join("") + "]"
    }
}

class StringParser extends Parser {

    value = ""

    /** @param {String} value */
    constructor(value) {
        super();
        this.value = value;
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

/**
 * @template {Parser<ChildrenT>[]} ChildrenT
 * @extends {Parser<ChildrenT>}
 */
class AlternativeParser extends Parser {

    /** @param {ChildrenT} children */
    constructor(...children) {
        super(...children);
    }

    createSimplified() {
        /** @type {CharacterClassParser | AnyCharacterParser} */
        let characterClass = new CharacterClassParser();
        const children = [...this.children];
        let alternatives = new Set();
        let simplified = false;
        for (let i = 0; i < children.length; ++i) {
            if (children[i] instanceof AlternativeParser) {
                children.splice(i, 1, ...children[i].children);
                --i;
                simplified = true;
                continue
            }
            const child = children[i] = children[i].createSimplified();
            if (
                child instanceof AnyCharacterParser
                || child instanceof CharacterClassParser
                || child instanceof CharacterParser
                || child instanceof RangeParser
            ) {
                characterClass = characterClass.mergeWith(child);
                children.splice(i, 1);
                --i;
                simplified = true;
            } else if (child instanceof StringParser) {
                if (alternatives.has(child.value)) {
                    children.splice(i, 1);
                    --i;
                    simplified = true;
                } else {
                    alternatives.add(child.value);
                }
            }
        }
        if (characterClass.children.length > 0) {
            children.push(characterClass.createSimplified());
            simplified = true;
        }
        if (children.length === 1) {
            return children[0]
        }
        return simplified ? new AlternativeParser(...children) : this
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        const result = this.children
            .map((p, i) => p.regexFragment(
                i > 0 || i < this.children.length - 1,
                matchesBegin && i === 0,
                matchesEnd && i === this.children.length - 1
            ))
            .reduce((prev, cur) => prev + "|" + cur);
        return canOmitParentheses
            ? result
            : "(?:" + result + ")"
    }
}

class RegexParser extends Parser {

    /** @type {RegExp} */
    #regex

    /** @type {RegExp} value */
    constructor(regex) {
        super();
        this.#regex = regex;
    }
}

/**
 * @template {Parser} ChildT
 * @extends {Parser<[ChildT]>}
 */
class RepeatParser extends Parser {

    min = 1
    max = 1

    /**
     * @param {ChildT} child
     * @param {Number} min
     * @param {Number} max
     */
    constructor(child, min, max = min) {
        super(child);
        if (!(min >= 0 && min <= max && min < Number.POSITIVE_INFINITY && max > 0)) {
            throw new Error(`Bad min (${min}) or max (${max}) values`)
        }
        this.min = min;
        this.max = max;
    }

    createSimplified() {
        const child = this.children[0].createSimplified();
        if (child instanceof RepeatParser) {
            return new RepeatParser(child.children[0], this.min * child.min, this.max * child.max)
        }
        if (this.min === 1 && this.min === this.max) {
            return child
        }
        return child === this.children[0] ? this : new RepeatParser(child, this.min, this.max)
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        let result = "{" + this.min + "," + this.max + "}";
        if (this.max === Number.POSITIVE_INFINITY) {
            if (this.min === 0) {
                result = "*";
            } else if (this.min === 1) {
                result = "+";
            } else {
                result = `{${this.min},}`;
            }
        } else if (this.max === 1) {
            if (this.min === 0) {
                result = "?";
            } else if (this.min === 1) {
                return this.children[0].regexFragment(canOmitParentheses, matchesBegin, matchesEnd)
            }
        } else if (this.max === this.min) {
            result = `{${this.min}}`;
        }
        const childRegex = this.children[0].regexFragment(true);
        return (this.children[0].isParenthesized() ? childRegex : `(?:${childRegex})`) + result
    }
}

/**
 * @template {[...Parsers]} ChildrenT
 * @template {Parser[]} Parsers
 * @extends {Parser<ChildrenT>}
 */
class SequenceParser extends Parser {

    /** @param {ChildrenT} children */
    constructor(...children) {
        super(...children);
    }

    createSimplified() {
        let children = [...this.children];
        let simplified = false;
        for (let i = 0; i < children.length; ++i) {
            if (children[i] instanceof SequenceParser) {
                children.splice(i, 1, ...children[i].children);
                --i;
                simplified = true;
                continue
            }
            const child = children[i].createSimplified();
            simplified ||= child !== children[i];
            children[i] = child;
            if (i > 0 && (child instanceof StringParser || child instanceof CharacterParser)) {
                const prev = children[i - 1];
                if (prev instanceof StringParser || prev instanceof CharacterParser) {
                    children.splice(i - 1, 2, new StringParser(prev.value + child.value));
                    --i;
                    simplified = true;
                }
            }
        }
        return simplified ? new SequenceParser(...children) : this
    }

    regexFragment(canOmitParentheses = false, matchesBegin = false, matchesEnd = false) {
        let result = this.children
            .map((c, i) => c.regexFragment(
                canOmitParentheses && this.children.length === 1,
                matchesBegin && i === 0,
                matchesEnd && i === this.children.length - 1
            ))
            .join("");
        if (!canOmitParentheses) {
            result = "(" + result + ")";
        }
        return result
    }
}

/**
 * @template {Parser<ChildrenT>} ParserT
 * @template {[...Parsers]} ChildrenT
 * @template {Parser[]} Parsers
 */
class JRegexer {

    /** @type {ParserT} */
    #parser
    get parser() {
        return this.#parser
    }

    #simplified = false

    /** @param {ParserT} parser */
    constructor(parser) {
        this.#parser = parser;
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
        this.#parser = this.#parser.createSimplified();
        this.#simplified = true;
        return this
    }

    createRegex(flags = "g") {
        if (!this.#simplified) {
            this.simplify();
        }
        return new RegExp(this.parser.regexFragment(true, true, true), flags)
    }

    parse(value) {
        return this.#parser.parse(value)
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
        return new JRegexer(new SequenceParser(this.parser, other.parser))
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
            new SequenceParser(
                this.parser,
                new RepeatParser(
                    new SequenceParser(separator.parser, this.parser),
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
            throw new Error("Must be at least 0, the value provided is negative")
        }
        if (min > max) {
            throw new Error("Max must be greater than min")
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

const R = JRegexer.sanitize;

export { R };
