import { ExpressionStatement,stringLiteral, NumericLiteral, Identifier, SwitchCase, switchCase, expressionStatement, assignmentExpression, breakStatement, objectExpression, memberExpression } from "@babel/types";
import { getNextVal, getXORNumber } from '../tools/freeNumber';
import transferBodyStatement from './transferBodyStatement';

/**
 * 拆解对象
 */
interface objectResult {
    switchCases: SwitchCase[],
    nextVal: NumericLiteral
}
export default function transferObjectExpression (
    xorNumber: number, // let p = 89 ^ index;  89
    codeBlock: ExpressionStatement,
    nextVal: NumericLiteral, // caseTest
    ctrlIdent: Identifier, //控制 case走向 的变量
    isLast: boolean
): objectResult {

    const objectExpressionCode = codeBlock.expression;
    if (objectExpressionCode.type === 'AssignmentExpression' 
        && objectExpressionCode.right.type === 'ObjectExpression') {
        let properties: any[] = objectExpressionCode.right.properties || [];

        /**
         * 对象存在一些特殊语法，放弃拆解
         */
        let filterProps = properties.filter(p => {
            if (p.type !== 'ObjectMethod' && p.type !== 'SpreadElement') {
                return true;
                // return p.value.type === 'StringLiteral' 
                //     || p.value.type === 'Identifier'
                //     || p.value.type === 'CallExpression'
                //     || p.value.type === 'MemberExpression'
                //     || p.value.type === 'ArrayExpression'
                //     || p.value.type === 'BooleanLiteral'
                //     || p.value.type === 'ObjectExpression'
                //     || p.value.type === 'LogicalExpression'
                //     || p.value.type === 'BinaryExpression'
                //     || p.value.type === 'FunctionExpression'
                //     || p.value.type === 'BinaryExpression'
            } 
        })
        if (filterProps.length !== properties.length || properties.length === 0) {
            var next = getNextVal();
            return {
                switchCases: [switchCase(nextVal, [
                    codeBlock,
                    expressionStatement(assignmentExpression('=', ctrlIdent, getXORNumber(xorNumber, next.value))),
                    breakStatement()
                ])],
                nextVal: next
            }
        }

        /**
         *  p = {};
         */
        const newExpre = expressionStatement(assignmentExpression('=', objectExpressionCode.left, objectExpression([])))
        /**
         * p['a'] = 'b';
         */
        let newPropList = [];
        let left: any = objectExpressionCode.left;
        for(let i=0; i<properties.length; i++) {
            let key = properties[i].key;
            if (key.type === 'Identifier') {
                key = stringLiteral(key.name);
            }
            newPropList.push(
                expressionStatement(
                    assignmentExpression(
                        '=',
                        memberExpression(left, key, true),
                        properties[i].value
                    )
                )
            )
        };

        return transferBodyStatement(nextVal, [newExpre].concat(newPropList), ctrlIdent, xorNumber, isLast)
    }


    return {
        switchCases: [],
        nextVal: null
    }
}