// import Token from "../Token"

// /** @extends {Token<JRegexer>} */
// export default class JRegexer extends Token {

//     static singleCharacter = new RegExp(String.raw`[^\|\\]|\\${JRegexer.escapeableCharacter.source}`)
//     static singleSquareBracket = String.raw`\[[^\[]\]`
//     static squareBracketContet = /^\[(.+)\]$/
//     static splitCharacters = new RegExp(
//         // Not preeceded by \\ OR Not followed by an escapeable character OR preceed by an off number of \\
//         String.raw`(?<!\\)|(?!${this.escapeableCharacter.source})|(?<=(?:[^\\]|^)(?:\\\\)+)`,
//         "g"
//     )


//     /** @type {Token<JRegexer>} */
//     #regexTree

//     /** @type {RegExp} */
//     #totalRegex

//     #regexValue = ""
//     set regexValue(value) {
//         value = JRegexer.#getAsSquareBracketsFit(value) ?? value
//         this.#regexValue = value

//     }

//     #originalRegexValue = ""
//     #matchesSingleCharacter = false

//     /** @param {String | RegExp} regexValue */
//     constructor(regexValue = null) {
//         super()
//     }

//     /** @param {String} regexValue */
//     static #getAsSquareBracketsFit(regexValue) {
//         return regexValue.match(JRegexer.squareBracketContet)?.[1]
//             ?? regexValue.match(JRegexer.singleCharacterRegexOrChain)?.[0].replaceAll("|", "")
//     }

//     /**
//      * @param {String} a
//      * @param {String} b
//      */
//     static #charactersBetween(a, b, excluded = true) {
//         const begin = a.charCodeAt(0)
//         const end = b.charCodeAt(0) + (excluded ? 0 : 1)
//         return String.fromCharCode(...Array.from({ length: end - begin }, (_, i) => i + begin))
//     }

//     /** @param {String} characters */
//     static #cleanupSingleCharacter(characters) {
//         let result = [...new Set(characters.split(JRegexer.splitCharacters))].sort()
//     }
// }
