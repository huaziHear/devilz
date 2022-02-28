import { SwitchCase, switchCase, isAssignmentExpression, NumericLiteral, ForStatement, Statement, NumberLiteral, Identifier, numericLiteral, expressionStatement, blockStatement, isVariableDeclaration, isEmptyStatement, isExpressionStatement, assignmentExpression, conditionalExpression, breakStatement, WhileStatement, emptyStatement, isSequenceExpression, AssignmentExpression, ExpressionStatement } from "@babel/types";
import transferBodyStatement from './transferBodyStatement';
import { getNextVal, getXORNumber } from '../tools/freeNumber';

/**
 *  输入一个forIfStatement
 *  输出  ‘环形’ 的case 链 来实现for的功能
 *  for循环的body需要单独的拆解
 * 
 * ForStatement 
 * init
 * test
 * update
 * body
 *    BlockStatement
 * 
 * init --> test -> body -> update -> test -> body -> ... test -> 
 *              
 * @param xorNumber 
 * @param codeBlock 
 * @param nextVal 
 * @param endCtrlExpression 
 * @param ctrlIdent 
 * @param isLast 
 * @param endVal 
 */
interface forStatementResult {
    switchCases:SwitchCase[],
    nextVal: NumberLiteral
}

export default function transferForStatement(
    xorNumber: number, // var p = 89 ^ index;  89
    codeBlock: ForStatement | WhileStatement,
    nextVal: NumericLiteral, // caseTest
    endCtrlExpression: Statement, //for循环结束赋值
    ctrlIdent: Identifier, //控制 case走向 的变量
    isLast?: boolean
): forStatementResult {

    let initCode, updateCode;
    const {test:testCode, body:bodyCode} = codeBlock;
    if (codeBlock.type === 'ForStatement') {
        initCode = codeBlock.init;
        updateCode = codeBlock.update;
    }
    /**
     * test 指向body第一个 body最后一个指向update
     * update完毕之后指向test  test false的话，指向的是endVal
     */
    let testVal: NumericLiteral = initCode ? getNextVal() : nextVal;;

    // const testFailVal = getNextVal(testVal);
    const bodyFirstTestVal = getNextVal();


    /**
     * init 只处理赋值 定义 和 空语句
     * init 是for循环的入口，这个case的执行且执行一次
     * init的指向是 test
     */
    
    let initCase: SwitchCase = null;
    let initCodes: ExpressionStatement[] = [];
    if (isSequenceExpression(initCode)) {
        testVal = initCode ? getNextVal() : nextVal;
        let ex = initCode.expressions;
        for(var exp of ex) {
            if (exp.type === 'AssignmentExpression') {
                initCodes.push(expressionStatement(exp));
            }
        }
        initCase = switchCase(nextVal, [
            getCtrlExpression(ctrlIdent, xorNumber, testVal),
            ...initCodes,
            breakStatement()
        ])
    } else if (isExpressionStatement(initCode) ||
        isEmptyStatement(initCode) ||
        isAssignmentExpression(initCode) ||
        isVariableDeclaration(initCode) ) { 
        testVal = initCode ? getNextVal() : nextVal;
        if (isAssignmentExpression(initCode)) {
            initCode = expressionStatement(initCode);
        }
        
        initCase = switchCase(nextVal, [
            getCtrlExpression(ctrlIdent, xorNumber, testVal),
            initCode,
            breakStatement()
        ])
    } else if(initCode){
        throw 'for循环不支持该种类型的init代码'
    }

    /**
     * body是个case串 一串一串接一串
     */
    if (bodyCode.type !== 'BlockStatement') {
        console.error('------- for循环不能不带括号！------------')
        return {
            switchCases: [],
            nextVal: getNextVal()
        }
    }

    let bodyResult = transferBodyStatement(bodyFirstTestVal, bodyCode.body, ctrlIdent, xorNumber);
    let bodyCases: SwitchCase[] = bodyResult.switchCases;

    /**
     * update无脑指向的是test
     */
    const updateTestVal = bodyResult.nextVal;
    let updateCase: SwitchCase = switchCase(updateTestVal, [
        updateCode ? expressionStatement(updateCode): emptyStatement(),
        getCtrlExpression(ctrlIdent, xorNumber, testVal),
        breakStatement()
    ]);

    /**
     * test的case内容是一个三元表达式
     * test的下一个指向是bodyFirstTestVal
     * test错误的话，走到一个case中再指向next或者结束
     */
    let testCase: SwitchCase = null;
    let testFailVal = getNextVal().value;
    var sybdsExpression = expressionStatement(
        assignmentExpression(
            '=', 
            ctrlIdent, 
            conditionalExpression(
                testCode, 
                getXORNumber(xorNumber, bodyFirstTestVal.value), 
                getXORNumber(xorNumber, testFailVal)
            )
        )
    );
    testCase = switchCase(testVal, [sybdsExpression, breakStatement()]);

    /**
    * test false的情况
    */
    let endNextVal = getNextVal();
    let testFailCase: SwitchCase = switchCase(numericLiteral(testFailVal), [
        isLast ? endCtrlExpression : getCtrlExpression(ctrlIdent, xorNumber, endNextVal),
        breakStatement()
    ]);


    let result: SwitchCase[] = bodyCases;
    
    if (initCase) {
        result.push(initCase)
    }
    if (updateCase) {
        result.push(updateCase);
    }
    
    result.push(testCase);
    result.push(testFailCase);

    return {
        switchCases: result,
        nextVal: endNextVal
    };
}

function getCtrlExpression(ctrlIdent: Identifier, xorNumber: number, endVal: NumberLiteral) {
    let ctrlAssig = assignmentExpression('=', ctrlIdent, getXORNumber(xorNumber, endVal.value))
    let ctrlExpress = expressionStatement(ctrlAssig); 
    return ctrlExpress;
}