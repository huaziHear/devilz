import { getNextVal, getXORNumber, getExceeParamNumber } from '../tools/freeNumber';
import {  breakStatement, NumericLiteral, SwitchCase,  Identifier, NumberLiteral, conditionalExpression, assignmentExpression, switchCase, expressionStatement, IfStatement, Statement, BlockStatement, unaryExpression, numericLiteral } from "@babel/types";
import {generateSwitchCase} from './transferFunction';


/**
 * 平展if代码块
 * 
 * @param codeBlock 代码块 AST Node
 * @param nextVal switch的test
 * 
 * 不管怎么搞，出口是一定的，上来就得确定
 */ 

const Void0 = unaryExpression('void', numericLiteral(0));

interface ifStatementResult {
    switchCases: SwitchCase[],
    nextVal: NumberLiteral
}

export default function transferIfStatement(
    xorNumber: number, // let p = 89 ^ index;  89
    codeBlock: IfStatement, 
    nextVal: NumericLiteral, // caseTest
    endCtrlExpression: Statement, //for循环结束赋值
    ctrlIdent: Identifier, //控制 case走向 的变量
    isLast : boolean
): ifStatementResult {
    
    let breakStatementIns = breakStatement();
    let switchCases : SwitchCase[] = [];
    let { test } = codeBlock;
    let ifEndVal = getNextVal();
    let consequent : any[] = [];
    let alternate = codeBlock.alternate;
    
    if (codeBlock.consequent.type === 'BlockStatement') {
        consequent = codeBlock.consequent.body;
    }
    
    // p = test ? next1: next2;
    let okVal = getNextVal();
    let failVal = getNextVal();

    let sybds = assignmentExpression('=', ctrlIdent, conditionalExpression(test, getXORNumber(xorNumber, okVal.value), getXORNumber(xorNumber, failVal.value)));
    /**
     *  case p:
     *      p = test ? next1:next2;
     */
    let parentCase = switchCase(nextVal, [
        expressionStatement(sybds),
        breakStatementIns
    ]);

    
    let leftCase: SwitchCase[] = [];
    for (let i = 0; i < consequent.length; i++) {
        let last = consequent.length - 1 === i && isLast;
        let conCases = generateSwitchCase(xorNumber, okVal, consequent[i], ctrlIdent, last);
        leftCase = leftCase.concat(conCases.switchCaseEl);
        okVal = conCases.nextVal;
    }

    let ctrlAssig = assignmentExpression('=', ctrlIdent, getXORNumber(xorNumber, ifEndVal.value))
    let ctrlExpress = expressionStatement(ctrlAssig); 


    let rightCaseLeft: SwitchCase[] = [];
    let rightCaseRight : SwitchCase[] = [];

    if (alternate && alternate.type === 'IfStatement') {
        let ifCases = transferIfStatement(xorNumber, alternate, failVal, endCtrlExpression, ctrlIdent, isLast);
        rightCaseRight = ifCases.switchCases;
        failVal = ifCases.nextVal;
    } else if (alternate){
        let statement = alternate.type === 'BlockStatement' ? alternate.body : [alternate];
        for (let i = 0; i < statement.length; i++) {
            let last = statement.length - 1 === i && isLast;
            let conCases = generateSwitchCase(xorNumber, failVal, statement[i], ctrlIdent, last);
            rightCaseLeft = rightCaseLeft.concat(conCases.switchCaseEl);
            failVal = conCases.nextVal;
        }
    } else {
        rightCaseLeft = [switchCase(failVal, [
            isLast ? endCtrlExpression : ctrlExpress,
            breakStatementIns
        ])];
    }

    /**
     * ok he fail 都返回了新的next test 这个next需要指向 ifEndVal
     */
   
    switchCases.push(
         switchCase(okVal, [
             ctrlExpress,
             breakStatement()
         ])
    )
    switchCases.push(
        switchCase(failVal, [
            ctrlExpress,
            breakStatement()
        ])
    )

    switchCases = switchCases.concat([parentCase].concat(rightCaseLeft).concat(leftCase).concat(rightCaseRight)).filter(s => !!s);

    return {
        switchCases,
        nextVal: ifEndVal
    };
}