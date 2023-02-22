/// <reference types="cypress" />

import { R } from "../../src/JRegexer"

describe("Simple Regex", () => {
    it("String", () => {
        expect(R("hello").simplify().createRegex().source)
            .to.equal("hello")
        expect(R("hello").or(R("world")).simplify().createRegex().source)
            .to.equal("hello|world")
        expect(R("alpha").or(R("beta")).or(R("gamma")).or(R("delta")).simplify().createRegex().source)
            .to.equal("alpha|beta|gamma|delta")
        expect(R("b").or(R("c")).or(R("a")).or(R("d")).simplify().createRegex().source)
            .to.equal("[a-d]")
        expect(
            R("2").or(R("0")).or(R("1")).or(R("3"))
                .or(R("8")).or(R("9")).or(R("6")).or(R("7"))
                .or(R("a"))
                .or(R("z")).or(R("x")).or(R("y"))
                .simplify().createRegex().source
        )
            .to.equal("[0-36-9ax-z]")
        expect(
            R("2").or(R("0")).or(R("1").or(R("Alpha"))).or(R("3").or(R("1").or(R("1")).or(R("1"))))
                .or(R("8")).or(R("9").or(R("Bravo"))).or(R("6")).or(R("7"))
                .or(R("Alpha")).or(R("Bravo").or(R("Bravo").or(R("Bravo"))).or(R("Bravo"))).or(R("Bravo"))
                .or(R("a")).or(R("1")).or(R("1")).or(R("1")).or(R("1")).or(R("1")).or(R("1")).or(R("1"))
                .or(R("z").or(R("0"))).or(R("x")).or(R("y"))
                .or(R("Bravo").or(R("Bravo").or(R("Alpha"))))
                .simplify().createRegex().source
        )
            .to.equal("Alpha|Bravo|[0-36-9ax-z]")
        expect(R("Hello").then(R("_")).then(R("World")).simplify().createRegex().source)
            .to.equal("Hello_World")
        expect(
            R("Hello")
                .then(R("0").or(R("_")).or(R("0")).or(R("2")).or(R("1"))) // [0-2_]
                .then(R("World"))
                .simplify().createRegex().source
        )
            .to.equal("Hello[0-2_]World")
        expect(
            R("Hello")
                .then(R("_").or(R("0")).or(R("2")).or(R("1")))
                .then(R("0"))
                .then(R("World"))
                .simplify().createRegex().source
        )
            .to.equal("Hello[0-2_]0World")
    })
})
