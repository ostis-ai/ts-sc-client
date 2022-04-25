var assert = require('assert');
const types = require('../build/sc-core');

const ScType = types.ScType;
const ScAddr = types.ScAddr;

describe('ScType', function() {
    const allTypes = [
        ScType.Const,
        ScType.Var,
        ScType.Node,
        ScType.Link,
        ScType.EdgeAccess,
        ScType.Unknown,
        ScType.EdgeUCommon,
        ScType.EdgeDCommon,
        ScType.EdgeUCommonConst,
        ScType.EdgeDCommonConst,
        ScType.EdgeUCommonVar,
        ScType.EdgeDCommonVar,
        ScType.EdgeAccessConstPosPerm,
        ScType.EdgeAccessConstNegPerm,
        ScType.EdgeAccessConstFuzPerm,
        ScType.EdgeAccessConstPosTemp,
        ScType.EdgeAccessConstNegTemp,
        ScType.EdgeAccessConstFuzTemp,
        ScType.EdgeAccessVarPosPerm,
        ScType.EdgeAccessVarNegPerm,
        ScType.EdgeAccessVarFuzPerm,
        ScType.EdgeAccessVarPosTemp,
        ScType.EdgeAccessVarNegTemp,
        ScType.EdgeAccessVarFuzTemp,
        ScType.NodeConst,
        ScType.NodeVar,
        ScType.LinkConst,
        ScType.LinkVar,
        ScType.NodeConstStruct,
        ScType.NodeConstTuple,
        ScType.NodeConstRole,
        ScType.NodeConstNoRole,
        ScType.NodeConstClass,
        ScType.NodeConstAbstract,
        ScType.NodeConstMaterial,
        ScType.NodeVarStruct,
        ScType.NodeVarTuple,
        ScType.NodeVarRole,
        ScType.NodeVarNoRole,
        ScType.NodeVarClass,
        ScType.NodeVarAbstract,
        ScType.NodeVarMaterial
    ];

    describe('construct', function() {

        it('Empty', function() {
            const t = new ScType();
            assert.ok(!t.isValid());
            assert.ok(!t.equal(ScType.NodeConst));
        });

        it('From value', function() {
            const t = new ScType(types.ScType.NodeVar.value);
            assert.ok(t.isValid());
            assert.ok(t.equal(ScType.NodeVar));
        });
    });

    describe('is functions', function() {
        it('isNode', function() {
            const nodeTypes = [
                ScType.Node,
                ScType.NodeConst,
                ScType.NodeVar,
                ScType.NodeConstStruct,
                ScType.NodeConstTuple,
                ScType.NodeConstRole,
                ScType.NodeConstNoRole,
                ScType.NodeConstClass,
                ScType.NodeConstAbstract,
                ScType.NodeConstMaterial,
                ScType.NodeVarStruct,
                ScType.NodeVarTuple,
                ScType.NodeVarRole,
                ScType.NodeVarNoRole,
                ScType.NodeVarClass,
                ScType.NodeVarAbstract,
                ScType.NodeVarMaterial
            ];  
            
            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (nodeTypes.indexOf(type) !== -1)
                    assert.ok(type.isNode());
                else
                    assert.ok(!type.isNode());
            }
        });

        it('isEdge', function() {
            const edgeTypes = [
                ScType.EdgeUCommon,
                ScType.EdgeUCommon,
                ScType.EdgeDCommon,
                ScType.EdgeUCommonConst,
                ScType.EdgeDCommonConst,
                ScType.EdgeUCommonVar,
                ScType.EdgeDCommonVar,
                ScType.EdgeAccess,
                ScType.EdgeAccessConstPosPerm,
                ScType.EdgeAccessConstNegPerm,
                ScType.EdgeAccessConstFuzPerm,
                ScType.EdgeAccessConstPosTemp,
                ScType.EdgeAccessConstNegTemp,
                ScType.EdgeAccessConstFuzTemp,
                ScType.EdgeAccessVarPosPerm,
                ScType.EdgeAccessVarNegPerm,
                ScType.EdgeAccessVarFuzPerm,
                ScType.EdgeAccessVarPosTemp,
                ScType.EdgeAccessVarNegTemp,
                ScType.EdgeAccessVarFuzTemp
            ];

            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (edgeTypes.indexOf(type) !== -1)
                    assert.ok(type.isEdge());
                else
                    assert.ok(!type.isEdge());
            }
        });

        it('isLink', function() {
            const linkTypes = [
                ScType.Link,
                ScType.LinkConst,
                ScType.LinkVar
            ];
            
            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (linkTypes.indexOf(type) !== -1)
                    assert.ok(type.isLink());
                else
                    assert.ok(!type.isLink());
            }
        });

        it('isConst', function() {
            const constTypes = [
                ScType.Const,
                ScType.NodeConst,
                ScType.LinkConst,
                ScType.NodeConstStruct,
                ScType.NodeConstTuple,
                ScType.NodeConstRole,
                ScType.NodeConstNoRole,
                ScType.NodeConstClass,
                ScType.NodeConstAbstract,
                ScType.NodeConstMaterial,
                ScType.EdgeUCommonConst,
                ScType.EdgeDCommonConst,
                ScType.EdgeAccessConstPosPerm,
                ScType.EdgeAccessConstNegPerm,
                ScType.EdgeAccessConstFuzPerm,
                ScType.EdgeAccessConstPosTemp,
                ScType.EdgeAccessConstNegTemp,
                ScType.EdgeAccessConstFuzTemp
            ];

            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (constTypes.indexOf(type) !== -1)
                    assert.ok(type.isConst());
                else
                    assert.ok(!type.isConst());
            }
        });

        it('isVar', function() {
            const varTypes = [
                ScType.Var,
                ScType.NodeVar,
                ScType.LinkVar,
                ScType.NodeVarStruct,
                ScType.NodeVarTuple,
                ScType.NodeVarRole,
                ScType.NodeVarNoRole,
                ScType.NodeVarClass,
                ScType.NodeVarAbstract,
                ScType.NodeVarMaterial,
                ScType.EdgeUCommonVar,
                ScType.EdgeDCommonVar,
                ScType.EdgeAccessVarPosPerm,
                ScType.EdgeAccessVarNegPerm,
                ScType.EdgeAccessVarFuzPerm,
                ScType.EdgeAccessVarPosTemp,
                ScType.EdgeAccessVarNegTemp,
                ScType.EdgeAccessVarFuzTemp
            ];

            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (varTypes.indexOf(type) !== -1)
                    assert.ok(type.isVar());
                else
                    assert.ok(!type.isVar());
            }
        });

        it('isPos', function() {
            const posTypes = [
                ScType.EdgeAccessConstPosPerm,
                ScType.EdgeAccessConstPosTemp,
                ScType.EdgeAccessVarPosPerm,
                ScType.EdgeAccessVarPosTemp
            ];
            
            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (posTypes.indexOf(type) !== -1)
                    assert.ok(type.isPos());
                else if (type.isEdge())
                    assert.ok(!type.isPos());
            }
        });

        it('isNeg', function() {
            const negTypes = [
                ScType.EdgeAccessConstNegPerm,
                ScType.EdgeAccessConstNegTemp,
                ScType.EdgeAccessVarNegPerm,
                ScType.EdgeAccessVarNegTemp
            ];

            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (negTypes.indexOf(type) !== -1)
                    assert.ok(type.isNeg());
                else if (type.isEdge())
                    assert.ok(!type.isNeg());
            }
        });

        it('isFuz', function() {
            const fuzTypes = [
                ScType.EdgeAccessConstFuzPerm,
                ScType.EdgeAccessConstFuzTemp,
                ScType.EdgeAccessVarFuzPerm,
                ScType.EdgeAccessVarFuzTemp
            ];

            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (fuzTypes.indexOf(type) !== -1)
                    assert.ok(type.isFuz());
                else if (type.isEdge())
                    assert.ok(!type.isFuz());
            }
        });

        it('isPerm', function() {
            const permTypes = [
                ScType.EdgeAccessConstPosPerm,
                ScType.EdgeAccessConstNegPerm,
                ScType.EdgeAccessConstFuzPerm,
                ScType.EdgeAccessVarPosPerm,
                ScType.EdgeAccessVarNegPerm,
                ScType.EdgeAccessVarFuzPerm
            ];

            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (permTypes.indexOf(type) !== -1)
                    assert.ok(type.isPerm());
                else if (type.isEdge())
                    assert.ok(!type.isPerm());
            }
        });

        it('isTemp', function() {
            const tempTypes = [
                ScType.EdgeAccessConstPosTemp,
                ScType.EdgeAccessConstNegTemp,
                ScType.EdgeAccessConstFuzTemp,
                ScType.EdgeAccessVarPosTemp,
                ScType.EdgeAccessVarNegTemp,
                ScType.EdgeAccessVarFuzTemp
            ];

            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (tempTypes.indexOf(type) !== -1)
                    assert.ok(type.isTemp());
                else if (type.isEdge())
                    assert.ok(!type.isTemp());
            }
        });

        it('isAccess', function() {
            const accessTypes = [
                ScType.EdgeAccess,
                ScType.EdgeAccessConstPosPerm,
                ScType.EdgeAccessConstNegPerm,
                ScType.EdgeAccessConstFuzPerm,
                ScType.EdgeAccessConstPosTemp,
                ScType.EdgeAccessConstNegTemp,
                ScType.EdgeAccessConstFuzTemp,
                ScType.EdgeAccessVarPosPerm,
                ScType.EdgeAccessVarNegPerm,
                ScType.EdgeAccessVarFuzPerm,
                ScType.EdgeAccessVarPosTemp,
                ScType.EdgeAccessVarNegTemp,
                ScType.EdgeAccessVarFuzTemp
            ];

            for (var i = 0; i < allTypes.length; ++i) {
                var type = allTypes[i];
                if (accessTypes.indexOf(type) !== -1)
                    assert.ok(type.isAccess());
                else if (type.isEdge())
                    assert.ok(!type.isAccess());
            }
        });

        it('merge', function() {
            const nodeType = ScType.Node;
            const newType = nodeType.merge(ScType.NodeConstTuple);

            assert.ok(newType.isNode());
            assert.ok(newType.isConst());
            assert.ok(newType.isTuple());

            assert.ok(!ScType.Node.isConst());
            assert.ok(!ScType.Node.isTuple());
            assert.ok(ScType.Node.isNode());

            var passed = false;
            try {
                const newFailType = nodeType.merge(ScType.Link);
            } catch (err) {
                passed = true;
            }
            assert.ok(passed);
        });

        it('changeConst', function() {
            const nodeType = ScType.NodeConst;
            assert.ok(nodeType.isConst());

            const newType = nodeType.changeConst(false);
            assert.ok(newType.isVar());
            assert.ok(nodeType.isConst());
        });
    });
});


describe('ScAddr', function() {


    describe('construct', function() {
        it('Empty', function() {
            const a = new ScAddr();

            assert.ok(!a.isValid());
            assert.ok(a.value == 0);
        });
        it('NonEmpty', function() {
            const a = new ScAddr(5345);
            assert.ok(a.isValid());
        });
    });
    describe('methods', function(){
        it('Equal', function() {
            const a = new ScAddr(5);
            const b = new ScAddr(6);
            const c = new ScAddr(5);

            assert.ok(a.equal(c));
            assert.ok(!a.equal(b));
        });
    });
});
