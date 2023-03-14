/// <reference types="cypress" />

import { R, Range } from "../../src/JRegexer"

describe("Parsing", () => {
    it("Simple", () => {
        expect(R("a").parse("a")).to.equal("a")
        expect(R("AlphaBeta").parse("AlphaBeta")).to.equal("AlphaBeta")
        expect(() => R("AlphaBeta").parse("xAlphaBeta")).to.throw()
        expect(() => R("AlphaBeta").parse("AlphaBetaGamma")).to.throw()
        expect(R("A").or(R("B")).parse("A")).to.equal("A")
        expect(R("A").or(R("B")).parse("B")).to.equal("B")
        expect(() => R("A").or(R("B")).parse("C")).to.throw()
        expect(Range("0", "3").parse("0")).to.equal("0")
        expect(Range("0", "3").parse("1")).to.equal("1")
        expect(Range("0", "3").parse("2")).to.equal("2")
        expect(Range("0", "3").parse("3")).to.equal("3")
        expect(() => Range("0", "3").parse("4")).to.throw()
        expect(() => Range("0", "3").parse("12")).to.throw()
        expect(Range("0", "3").or(R("Alpha")).parse("1")).to.equal("1")
        expect(Range("0", "3").or(R("Alpha")).parse("2")).to.equal("2")
        expect(Range("0", "3").or(R("Alpha")).parse("Alpha")).to.equal("Alpha")
        expect(() => Range("0", "3").or(R("Alpha")).parse("xAlpha")).to.throw()
        expect(() => Range("0", "3").or(R("Alpha")).parse("AlphaBeta")).to.throw()
    })
})
