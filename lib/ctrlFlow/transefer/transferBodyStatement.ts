import { breakStatement } from '@babel/types';
import { SwitchCase, NumberLiteral, Identifier, Statement, assignmentExpression, expressionStatement, switchCase } from '@babel/types';
import { getXORNumber, getNextVal} from '../tools/freeNumber';
import { generateSwitchCase } from './transferFunction';
import { Expression } from 'babel-types';
/**
 * 
 * @param bodyFirstTestVal body 部分的入口test
 * @param endTestVal body 结束之后的指向test
 * @param bodyCode body代码块
 * @param ctrlIdent 控制变量
 */
interface bodyStatementResult {
    switchCases: SwitchCase[],
    nextVal: NumberLiteral
}
export default function transferBodyStatement (
    bodyFirstTestVal: NumberLiteral,
    bodyStatement: Statement[],
    ctrlIdent: Identifier,
    xorNumber: number,
    isLast?: boolean
): bodyStatementResult {

    const bodyCodes = bodyStatement;
    //空body
    if (bodyCodes.length === 0) {
        let nextVal = getNextVal();
        return {
            switchCases: [switchCase(bodyFirstTestVal, [
                getCtrlExpression(ctrlIdent, xorNumber, nextVal),
                breakStatement()
            ])],
            nextVal: nextVal
        }
    }

    let result: SwitchCase[] = [];
    let currentTest = bodyFirstTestVal;
    let nextTest;
    for(let i=0; i<bodyCodes.length; i++) {
        let last = isLast && i===bodyCodes.length-1;
        let currenCase = generateSwitchCase(xorNumber, currentTest, bodyCodes[i], ctrlIdent, last)
        result = result.concat(currenCase.switchCaseEl);
        nextTest = currenCase.nextVal;
        currentTest = nextTest;
    }

    return {
        switchCases: result,
        nextVal: nextTest
    };
}



function getCtrlExpression(ctrlIdent: Identifier, xorNumber: number, endVal: NumberLiteral) {
    let ctrlAssig = assignmentExpression('=', ctrlIdent, getXORNumber(xorNumber, endVal.value))
    let ctrlExpress = expressionStatement(ctrlAssig);
    return ctrlExpress;
}