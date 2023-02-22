/// <reference types="cypress" />

import Parser from "../../src/Parser"

describe("Simple", () => {
    it("insideBracket", () => {
        console.log(Parser.anchoredInsideBracket)
        expect(Parser.insideBracket.test("")).to.be.false
        expect(Parser.insideBracket.test(String.raw`hello`)).to.be.false
        expect(Parser.insideBracket.test(String.raw`[]`)).to.be.false
        expect(Parser.anchoredInsideBracket.test(String.raw`[a]`)).to.be.true
        expect(Parser.anchoredInsideBracket.test(String.raw`[abcdefxyz]`)).to.be.true
        expect(Parser.anchoredInsideBracket.test(String.raw`[a-zA-Z0-9,-]`)).to.be.true
        expect(Parser.anchoredInsideBracket.test(String.raw`[abcdefxyz]`)).to.be.true
        expect(Parser.insideBracket.test(String.raw`[abcd[efxyz]`)).to.be.true
        expect(Parser.anchoredInsideBracket.test(String.raw`[abcd[efxyz]`)).to.be.false
        expect(Parser.anchoredInsideBracket.test(String.raw`[abcd\[efxyz]`)).to.be.true
    })
    it("unescapedBackslash", () => {
        expect(Parser.unescapedBackslash.test("")).to.be.false
        expect(Parser.unescapedBackslash.test("\\")).to.be.true
        expect(Parser.unescapedBackslash.test("\\a")).to.be.true
        expect(Parser.unescapedBackslash.test("a\\")).to.be.true
        expect(Parser.unescapedBackslash.test("a\\a")).to.be.true
        expect(Parser.unescapedBackslash.test("\\\\")).to.be.false
        expect(Parser.unescapedBackslash.test("alpha\\Beta")).to.be.true
        expect(Parser.unescapedBackslash.test("alpha\\\\\\\\\\nBeta")).to.be.true
        //                                                  ^^ unescaped 
    })
    it("singleCharacterRegexOrChain", () => {
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw``)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`|`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`a`)).to.be.true
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`b`)).to.be.true
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`x|y`)).to.be.true
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`z|x|y`)).to.be.true
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`an`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`a\n`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`0|1|a|b|7`)).to.be.true
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`0|1|a|b|1|a|b|1|a|b|7`)).to.be.true
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`|0|1|a|b|1|a|b|1|a|b|7`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`0|1|a|b|1|a|b|1|a|b|7|`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`0|1|a|b|1||a|b|1|a|b|7|`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`\||\||\|`)).to.be.true // Matches | repeated
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`\||\||\|c`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`\"|\n`)).to.be.true
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`\"||\n`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`|\"|\n`)).to.be.false
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`\\|\n`)).to.be.true
        // expect(JRegexer.singleCharacterRegexOrChain.test(String.raw`\\\|\n`)).to.be.false
    })
})
