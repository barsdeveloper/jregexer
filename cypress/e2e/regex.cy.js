/// <reference types="cypress" />

import { R, Range } from "../../src/JRegexer"

describe("Regex production test", () => {
    it("Simple", () => {
        expect(R("hello").createRegex().source)
            .to.equal("hello")
        expect(R("hello\nWorld").createRegex().source)
            .to.equal("hello\\nWorld")
        expect(R("hello").or(R("world").plus()).createRegex().source)
            .to.equal("hello|(?:world)+")
        expect(R("alpha").or(R("beta")).or(R("gamma")).or(R("delta")).createRegex().source)
            .to.equal("alpha|beta|gamma|delta")
        expect(R("b").or(R("c")).or(R("a")).or(R("d")).createRegex().source)
            .to.equal("[a-d]")
        expect(
            R("2").or(R("0")).or(R("1")).or(R("3"))
                .or(R("8")).or(R("9")).or(R("6")).or(R("7"))
                .or(R("a"))
                .or(R("z")).or(R("x")).or(R("y"))
                .createRegex().source
        )
            .to.equal("[0-36-9ax-z]")
        expect(
            R("2").or(R("0")).or(R("1").or(R("Alpha"))).or(R("3").or(R("1").or(R("1")).or(R("1"))))
                .or(R("8")).or(R("9").or(R("Bravo"))).or(R("6")).or(R("7"))
                .or(R("Alpha")).or(R("Bravo").or(R("Bravo").or(R("Bravo"))).or(R("Bravo"))).or(R("Bravo"))
                .or(R("a")).or(R("1")).or(R("1")).or(R("1")).or(R("1")).or(R("1")).or(R("1")).or(R("1"))
                .or(R("z").or(R("0"))).or(R("x")).or(R("y"))
                .or(R("Bravo").or(R("Bravo").or(R("Alpha"))))
                .createRegex().source
        )
            .to.equal("Alpha|Bravo|[0-36-9ax-z]")
        expect(R("Hello").then(R("_")).then(R("World")).createRegex().source)
            .to.equal("Hello_World")
        expect(
            R("Hello")
                .then(R("0").or(R("_")).or(R("0")).or(R("2")).or(R("1"))) // [0-2_]
                .then(R("World"))
                .createRegex().source
        )
            .to.equal("Hello[0-2_]World")
        expect(
            R("Hello")
                .then(R("_").or(R("0")).or(R("2")).or(R("1")))
                .then(R("0"))
                .then(R("World"))
                .createRegex().source
        )
            .to.equal("Hello[0-2_]0World")
        expect(
            R("a").or(R("b")).then(R("mid")).then(R("x").or(R("y"))).createRegex().source
        )
            .to.equal("[ab]mid[xy]")
        expect(
            R("a").or(R("b")).then(R("0").or(R("0")).or(R("1")).or(R("2")).or(R("alpha"))).then(R("x").or(R("y")))
                .createRegex().source
        )
            .to.equal("[ab](?:alpha|[0-2])[xy]")
        expect(
            R("a").plus().or(R("b")).createRegex().source
        )
            .to.equal("a+|b")
        expect(
            R("a").plus().or(R("b").star()).createRegex().source
        )
            .to.equal("a+|b*")
        expect(
            R("a").plus().or(R("b").star()).star().createRegex().source
        )
            .to.equal("(?:a+|b*)*")
        expect(
            R("a").plus().or(R("b").star()).times(2, 5).createRegex().source
        )
            .to.equal("(?:a+|b*){2,5}")
        expect(
            R("a").plus().then(R("b").plus()).times(1, 2).createRegex().source
        )
            .to.equal("(?:a+b+){1,2}")
        expect(
            R("c").maybe().or(R("b")).then(R("a")).then(R("n").plus()).createRegex().source
        )
            .to.equal("(?:c?|b)an+")
        expect(R("Alpha").times(1, 1).createRegex().source)
            .to.equal("Alpha")
        expect(R("Alpha").times(5, 5).createRegex().source)
            .to.equal("(?:Alpha){5}")
        expect(R("Alpha").atLeast(3).createRegex().source)
            .to.equal("(?:Alpha){3,}")
        expect(R("Alpha").then(R("x").times(2)).then(R("Beta")).createRegex().source)
            .to.equal("Alphax{2}Beta")
        expect(R("Alpha").then(R("x").or(R("y")).maybe()).then(R("Beta")).createRegex().source)
            .to.equal("Alpha[xy]?Beta")
        expect(R("AAA").or(R("BBB").times(1)).then(R("CCC").plus()).createRegex().source)
            .to.equal("(?:AAA|BBB)(?:CCC)+")
        expect(R("A").or(R("B").times(1)).then(R("C").plus()).createRegex().source)
            .to.equal("[AB]C+")
        expect(
            R("A").star().times(1).or(R("A").times(1)).or(R("B").times(1).times(1)).then(R("C").plus())
                .createRegex().source
        )
            .to.equal("(?:A*|[AB])C+")
        expect(
            R("A").star().times(1).or(R("A").times(1)).or(R("B").times(1).times(1)).then(R("C").plus())
                .createRegex().source
        )
            .to.equal("(?:A*|[AB])C+")
        expect(
            R("A").then(R("lpha")).times(2).then(R("Beta").or(R("Gamma")).maybe().maybe().maybe())
                .createRegex().source
        )
            .to.equal("(?:Alpha){2}(?:Beta|Gamma)?")
        expect(
            R("0").or(R("3").or(R("2"))).then(R("1").maybe().plus()).then(R(": Numbers."))
                .createRegex().source
        )
            .to.equal(String.raw`[023]1*: Numbers\.`)
        expect(R("1").or(R("23")).atLeast(6).createRegex().source)
            .to.equal(String.raw`(?:23|1){6,}`)
        expect(
            R("alpha").or(R("1")).or(R("alpha")).or(R("a").or(R("1")).or(R("b").or(R("c")))).atLeast(1).plus()
                .createRegex().source
        )
            .to.equal("(?:alpha|[1a-c])+")
        expect(
            R("x").then(R("1").star().or(R("4")).or(R("3")).or(R("2")).star())
                .then(R("x")).then(R("a").or(R("c")).or(R("b")).plus()).plus()
                .createRegex().source
        )
            .to.equal("(?:x(?:1*|[2-4])*x[a-c]+)+")
        expect(
            Range("1", "6").or(R("5").or(R("7")).or(R("0"))).createRegex().source
        ).to.equal("[0-7]")
        expect(
            Range("0", "3").createRegex().source
        ).to.equal("[0-3]")
        expect(
            R("x").then(R("Alpha").or(R("Beta"))).createRegex().source
        ).to.equal("x(?:Alpha|Beta)")
        expect(
            R("Alpha").or(R("Beta")).then(R("y")).createRegex().source
        ).to.equal("(?:Alpha|Beta)y")
        expect(
            R("Alpha").or(R("Beta").then(R("y"))).createRegex().source
        ).to.equal("Alpha|Betay")
    })
})
