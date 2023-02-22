/// <reference types="cypress" />

import { R } from "../../src/JRegexer"
import AlternativeParser from "../../src/token/AlternativeParser"
import CharacterClassParser from "../../src/token/CharacterClassParser"
import CharacterParser from "../../src/token/CharacterParser"
import RangeParser from "../../src/token/RangeParser"
import RegexParser from "../../src/token/RegexParser"
import SequenceParser from "../../src/token/Sequence"
import StringParser from "../../src/token/StringParser"

describe("CorrectParser", () => {
    it("Returns the correct value", () => {
        expect(R("").parser).to.be.instanceOf(StringParser)
        expect(R("A").parser).to.be.instanceOf(CharacterParser)
        expect(R(".").parser).to.be.instanceOf(CharacterParser)
        expect(R("\\").parser).to.be.instanceOf(CharacterParser)
        expect(R("\n").parser).to.be.instanceOf(CharacterParser)
        expect(R("Alpha").parser).to.be.instanceOf(StringParser)
        expect(R(String.raw`Alpha\Beta\nGamma`).parser).to.be.instanceOf(StringParser)
        expect(R(/abc[d-z]/).parser).to.be.instanceOf(RegexParser)
    })
    it("Or chain", () => {
        expect(() => R("a").or(123)).to.throw()
        expect(() => R("a").or("alpha")).to.throw()
        expect(() => R("a").or(R("b"))).to.not.throw()
        expect(R("a").or(R("b")).parser).to.be.instanceOf(AlternativeParser)
        expect(R("a").or(R("b")).parser).to.deep.contain({
            children: [{ value: "a" }, { value: "b" }]
        })
        expect(R("Alpha").or(R("Beta")).parser).to.deep.contain({
            children: [{ value: "Alpha" }, { value: "Beta" }]
        })
    })
    it("Then chain", () => {
        expect(() => R("a").then(123)).to.throw()
        expect(() => R("a").then("alpha")).to.throw()
        expect(() => R("a").then(R("b"))).to.not.throw()
        expect(R("a").then(R("b")).parser).to.be.instanceOf(SequenceParser)
        expect(R("a").then(R("b")).parser).to.deep.contain({
            children: [{ value: "a" }, { value: "b" }]
        })
        expect(R("Alpha").then(R("Beta")).parser).to.deep.contain({
            children: [{ value: "Alpha" }, { value: "Beta" }]
        })
    })
    it("Simplify", () => {
        expect(new StringParser("alpha").createSimplified()).to.be.instanceOf(StringParser)
        expect(new StringParser("a").createSimplified())
            .to.be.instanceOf(CharacterParser)
            .and.to.deep.contain({
                value: "a"
            })
        expect(new StringParser(".").createSimplified())
            .to.be.instanceOf(CharacterParser)
            .and.to.deep.contain({
                value: "."
            })
        expect(new RangeParser(new CharacterParser("a"), new CharacterParser("a")).createSimplified())
            .to.be.instanceOf(CharacterParser)
            .and.to.deep.contain({
                value: "a"
            })
        expect(new RangeParser(new CharacterParser("0"), new CharacterParser("1")).createSimplified())
            .to.be.instanceOf(RangeParser)
        expect(
            new CharacterClassParser(
                new CharacterParser("0"),
                new CharacterParser("1"),
                new CharacterParser("2"),
                new CharacterParser("3"),
                new CharacterParser("4"),
            )
                .createSimplified()
        )
            .to.be.instanceOf(CharacterClassParser)
            .and.to.have.nested.property("children[0].children")
            .which.is.deep.equal([
                { value: "0" },
                { value: "4" },
            ])
        let characterClass =
            new CharacterClassParser(
                new CharacterParser("b"),
                new RangeParser(
                    new CharacterParser("e"),
                    new CharacterParser("i"),
                ),
                new CharacterParser("a"),
                new RangeParser(
                    new CharacterParser("x"),
                    new CharacterParser("z")
                ),
                new CharacterParser("5"),
                new RangeParser(
                    new CharacterParser("d"),
                    new CharacterParser("d"),
                ),
                new CharacterParser("c"),
                new CharacterParser("y"),
            )
                .createSimplified()

        expect(characterClass)
            .to.be.instanceOf(CharacterClassParser)
            .and.to.have.nested.property("children")
            .which.has.length(3)
        expect(characterClass.children[0]).to.include({ value: "5" })
        expect(characterClass.children[1].children[0]).to.include({ value: "a" })
        expect(characterClass.children[1].children[1]).to.include({ value: "i" })
        expect(characterClass.children[2].children[0]).to.include({ value: "x" })
        expect(characterClass.children[2].children[1]).to.include({ value: "z" })
    })
})
