/// <reference types="cypress" />

import CharacterClassParser from "../../src/token/CharacterClassParser"
import CharacterParser from "../../src/token/CharacterParser"
import RangeParser from "../../src/token/RangeParser"

describe("Tokens", () => {
    it("CharacterParser", () => {
        expect(() => new CharacterParser("")).to.throw()
        expect(() => new CharacterParser("a")).to.not.throw()
        expect(new CharacterParser("a")).to.have.property("value").equal("a")
        expect(() => new CharacterParser("b")).to.not.throw()
        expect(() => new CharacterParser("X")).to.not.throw()
        expect(() => new CharacterParser("Y")).to.not.throw()
        expect(() => new CharacterParser("0")).to.not.throw()
        expect(() => new CharacterParser("01")).to.throw()
        expect(() => new CharacterParser("alpha")).to.throw()
        expect(() => new CharacterParser("")).to.throw()
        expect(() => new CharacterParser("\\")).to.not.throw()
        expect(new CharacterParser("\\")).to.have.property("value").equal("\\")
        expect(() => new CharacterParser("^")).to.not.throw()
        expect(() => new CharacterParser("$")).to.not.throw()
        expect(() => new CharacterParser(".")).to.not.throw()
        expect(() => new CharacterParser(",")).to.not.throw()
        expect(() => new CharacterParser("-")).to.not.throw()
        expect(() => new CharacterParser("\\d")).to.throw() // This is a range not a single character
    })
    it("RangeParser", () => {
        expect(() => new RangeParser(
            new CharacterParser("a"),
            new CharacterParser("b")
        )).to.not.throw()
        expect(() => new RangeParser(
            new CharacterParser("j"),
            new CharacterParser("j")
        )).to.not.throw()
        expect(() => new RangeParser(
            new CharacterParser("d"),
            new CharacterParser("c")
        )).to.throw()
    })
    it("CharacterClassParser", () => {
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("a"),
                new CharacterParser("g")
            ),
            new RangeParser(
                new CharacterParser("d"),
                new CharacterParser("f")
            )
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "a" },
                    { value: "g" }
                ]
            })
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("2"),
                new CharacterParser("2")
            ),
            new RangeParser(
                new CharacterParser("1"),
                new CharacterParser("6")
            )
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "1" },
                    { value: "6" }
                ]
            })
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("4"),
                new CharacterParser("9")
            ),
            new RangeParser(
                new CharacterParser("6"),
                new CharacterParser("9")
            )
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "4" },
                    { value: "9" }
                ]
            })
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("0"), // a1
                new CharacterParser("4") // a2
            ),
            new RangeParser(
                new CharacterParser("5"), // b1
                new CharacterParser("8") // b2
            )
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "0" },
                    { value: "8" }
                ]
            })
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("6"),
                new CharacterParser("7")
            ),
            new RangeParser(
                new CharacterParser("2"),
                new CharacterParser("5")
            )
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "2" },
                    { value: "7" }
                ]
            })
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("2"),
                new CharacterParser("2")
            ),
            new RangeParser(
                new CharacterParser("3"),
                new CharacterParser("3")
            )
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "2" },
                    { value: "3" }
                ]
            })
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("6"),
                new CharacterParser("6")
            ),
            new RangeParser(
                new CharacterParser("7"),
                new CharacterParser("7")
            )
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "6" },
                    { value: "7" }
                ]
            })
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("6"),
                new CharacterParser("7")
            ),
            new RangeParser(
                new CharacterParser("2"),
                new CharacterParser("4")
            )
        ))
            .to.be.null
        expect(CharacterClassParser.mergeRanges(
            new RangeParser(
                new CharacterParser("2"),
                new CharacterParser("2")
            ),
            new RangeParser(
                new CharacterParser("4"),
                new CharacterParser("4")
            )
        ))
            .to.be.null
        expect(CharacterClassParser.mergeRanges(
            new CharacterParser("2"),
            new RangeParser(
                new CharacterParser("3"),
                new CharacterParser("3")
            )
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "2" },
                    { value: "3" }
                ]
            })
        expect(CharacterClassParser.mergeRanges(
            new CharacterParser("1"),
            new RangeParser(
                new CharacterParser("3"),
                new CharacterParser("3")
            )
        ))
            .to.be.null
        expect(CharacterClassParser.mergeRanges(
            new CharacterParser("y"),
            new CharacterParser("x")
        ))
            .to.be.instanceOf(RangeParser)
            .and.to.deep.contain({
                children: [
                    { value: "x" },
                    { value: "y" }
                ]
            })
    })
})
