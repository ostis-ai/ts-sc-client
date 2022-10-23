import {ScAddr} from "../src";

describe("Tests of the main client structures", ()=>{
    test("ScAddrPositive", ()=>{
        const scAddr = new ScAddr(1);
        expect(scAddr).toBeTruthy()
        expect(scAddr.isValid()).toBeTruthy();
    })
    test("ScAddrZero", ()=>{
        const scAddr = new ScAddr(0);
        expect(scAddr).toBeTruthy()
        expect(scAddr.isValid()).toBeFalsy();
    })
    test("ScAddrNegative", ()=>{
        const scAddr = new ScAddr(-1);
        expect(scAddr).toBeTruthy()
        expect(scAddr.isValid()).toBeFalsy();
    })

    test("ScAddrEqual", ()=>{
        const scAddr1 = new ScAddr(1);
        const scAddr2 = new ScAddr(1);
        expect(scAddr1).toStrictEqual(scAddr2);
    })
    test("ScAddrEqual", ()=>{
        const scAddr1 = new ScAddr(1);
        const scAddr2 = new ScAddr(2);
        expect(scAddr1.equal(scAddr2)).toBeFalsy();
    })

})
