import CharacterParser from "./CharacterParser"
import Parser from "../Parser"
import StringParser from "./StringParser"

/**
 * @template {[...Parsers]} ChildrenT
 * @template {Parser[]} Parsers
 * @extends {Parser<ChildrenT>}
 */
export default class SequenceParser extends Parser {

    /** @param {ChildrenT} children */
    constructor(...children) {
        super(...children)
    }

    createSimplified() {
        let children = [...this.children]
        let simplified = false
        for (let i = 0; i < children.length; ++i) {
            if (children[i] instanceof SequenceParser) {
                children.splice(i, 1, ...children[i].children)
                --i
                simplified = true
                continue
            }
            const child = children[i].createSimplified()
            simplified ||= child !== children[i]
            children[i] = child
            if (i > 0 && (child instanceof StringParser || child instanceof CharacterParser)) {
                const prev = children[i - 1]
                if (prev instanceof StringParser || prev instanceof CharacterParser) {
                    children.splice(i - 1, 2, new StringParser(prev.value + child.value))
                    --i
                    simplified = true
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
            .join("")
        if (!canOmitParentheses) {
            result = "(" + result + ")"
        }
        return result
    }
}
