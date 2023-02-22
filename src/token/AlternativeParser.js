import Parser from "../Parser"
import CharacterClassParser from "./CharacterClassParser"
import CharacterParser from "./CharacterParser"
import RangeParser from "./RangeParser"
import StringParser from "./StringParser"

/**
 * @template {[...Parser[]]} ChildrenT
 * @extends {Parser<ChildrenT>}
 */
export default class AlternativeParser extends Parser {

    /** @param {ChildrenT} children */
    constructor(...children) {
        super(...children)
    }

    createSimplified() {
        let characterClass = new CharacterClassParser()
        let children = [...this.children]
        let alternatives = new Set()
        let simplified = false
        for (let i = 0; i < children.length; ++i) {
            if (children[i] instanceof AlternativeParser) {
                children.splice(i, 1, ...children[i].children)
                --i
                simplified = true
                continue
            }
            const child = children[i] = children[i].createSimplified()
            if (child instanceof CharacterClassParser) {
                characterClass.children.push(...child.children)
            } else if (child instanceof CharacterParser || child instanceof RangeParser) {
                characterClass.children.push(child)
                children.splice(i, 1)
                --i
                simplified = true
            } else if (child instanceof StringParser) {
                if (alternatives.has(child.value)) {
                    children.splice(i, 1)
                    --i
                    simplified = true
                } else {
                    alternatives.add(child.value)
                }
            }
        }
        if (characterClass.children.length > 0) {
            children.push(characterClass.createSimplified())
            simplified = true
        }
        if (children.length === 1 && children[0] instanceof CharacterClassParser) {
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
            .reduce((prev, cur) => prev + "|" + cur)
        return canOmitParentheses
            ? result
            : "(?:" + result + ")"
    }
}
