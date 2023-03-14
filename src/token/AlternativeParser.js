import AnyCharacterParser from "./AnyCharacterParser"
import CharacterClassParser from "./CharacterClassParser"
import CharacterParser from "./CharacterParser"
import Failure from "../Failure"
import ISingleCharacterParser from "./ISingleCharacterParser"
import Parser from "../Parser"
import RangeParser from "./RangeParser"
import StringParser from "./StringParser"

/**
 * @template {Parser<ChildrenT>[]} ChildrenT
 * @extends {Parser<ChildrenT>}
 */
export default class AlternativeParser extends Parser {

    /** @param {ChildrenT} children */
    constructor(...children) {
        super(...children)
    }

    createSimplified() {
        /** @type {ISingleCharacterParser} */
        let characterClass = new CharacterClassParser()
        const children = [...this.children]
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
            if (
                child instanceof AnyCharacterParser
                || child instanceof CharacterClassParser
                || child instanceof CharacterParser
                || child instanceof RangeParser
            ) {
                characterClass = characterClass.mergeWith(child)
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
            .reduce((prev, cur) => prev + "|" + cur)
        return canOmitParentheses
            ? result
            : "(?:" + result + ")"
    }

    /** @param {String} value */
    parseImplement(value) {
        let failure
        for (let child of this.children) {
            let result = child.parse(value)
            if (result.status) {
                return result
            } else {
                result = /** @type {Failure} */(result)
                failure = result.getFurthest(failure ?? result)
            }
        }
        return failure
    }
}
