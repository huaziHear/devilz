import { breakStatement } from '@babel/types';
import { switchCase, SwitchCase, NumberLiteral, NumericLiteral, Statement, Identifier, VariableDeclaration, TryStatement, numericLiteral, identifier, binaryExpression, unaryExpression, variableDeclarator, variableDeclaration, blockStatement, expressionStatement, callExpression, functionExpression, assignmentExpression, ForInStatement, ForOfStatement } from '@babel/types';
import { creatForStatement } from './transferFunction';
import { getNextVal, getXORNumber } from '../tools/freeNumber';
interface forInResult {
    switchCases: SwitchCase[],
    nextVal: NumberLiteral
}
/**
 * for (var key in window) {
 *  console.log(key);
 * }
 * 
 * --------
 * 
 * for(var key in window) {
 *  for(var a = 0; a != void;) {
 *      switch(e) {
 *          case 1
 *              conosole.log(key);
 *     }
 *  }
 * }
 */


export default function transferForInStatement(
    xorNumber: number, // var p = 89 ^ index;  89
    codeBlock: ForInStatement | ForOfStatement,
    nextVal: NumericLiteral, // caseTest
    endCtrlExpression: Statement, //for循环结束赋值
    ctrlIdent: Identifier, //控制 case走向 的变量
    isLast?: boolean
): forInResult {
    if (codeBlock.body.type !== 'BlockStatement') {
        console.error('-------- for in 必须使用{} 包括代码 ---------');
        return null;
    }
    codeBlock.body.body = creatForStatement(codeBlock.body.body);
    const endVal = getNextVal();
    const ctrlAssig = assignmentExpression('=', ctrlIdent, getXORNumber(xorNumber, endVal.value));
    const ctrlExpress = expressionStatement(ctrlAssig);
    return {
        switchCases: [
            switchCase(nextVal, [
                codeBlock,
                isLast ? endCtrlExpression : ctrlExpress,
                breakStatement()
            ])
        ],
        nextVal: endVal
    }
}
