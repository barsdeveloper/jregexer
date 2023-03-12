import Parser from "../Parser"

/**
 * @template {Parser<ChildrenT>[]} ChildrenT
 * @extends {Parser<ChildrenT>}
 */
export default class ISingleCharacterParser extends Parser {

    /** @param {ISingleCharacterParser} characterParser */
    mergeWith(characterParser) {
        return characterParser
    }
}
