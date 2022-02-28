import { returnStatement,ConditionalExpression, NumericLiteral, Identifier, SwitchCase, functionExpression, blockStatement, callExpression, unaryExpression, expressionStatement, identifier, binaryExpression, variableDeclarator, variableDeclaration, numericLiteral, switchStatement, forStatement, switchCase, assignmentExpression, conditionalExpression, breakStatement, isExpression, CallExpression } from "@babel/types";
import { getNumericLiteral, getNextVal, getVariableDeclaratorNumber, getRD, getVariableDeclaration, getXORNumber } from '../tools/freeNumber';
import { getName } from '../tools/freeString';

/**
 * 三元表达式
 * var a = window ? 1:document? a=1 : 1;
 * 没办法搞吧 独立的函数？ 好吧，搞独立的自执行函数
 * var a = !function () {
 *   for(var a=0; a!=void 0;) {
 *      var p = 88 ^ returnName;
 *      switch(p) {
 *          case 0:
 *             a = window ? 1:2;
 *          case 1:
 *              return 1;
 *          case 2:
 *              a = document ? 3:4;
 *          case 3: 
 *              return a=1;
 *          case 4:
 *              return 1;
 *      }
 *   }
 * }()
 */

const Void0 = unaryExpression('void', numericLiteral(0));

export default function transferConditionalExpression (
    codeBlock: ConditionalExpression
): CallExpression {

    /**
     * 构造for循环结构  var index = 1; void 0 !== index
     */
    let indexName = getName(); // for循环索引名称
    let indexValNumber = getNumericLiteral(getRD());
    let forIndexValue = getVariableDeclaratorNumber(indexName, indexValNumber) // 索引初始值
    let forIndex = getVariableDeclaration([forIndexValue]) // 索引构造

    let testEl = binaryExpression('!==', Void0, identifier(indexName)); // test 构造 void 0 !== index

    /**
     * 构造一级控制变量
     * var p = 89 >> index;
     * 再增加两个垃圾变量 
     */
    let scName = identifier(getName());
    let xorNumber = getNextVal().value; // 89 
    let scBinary = binaryExpression('^', numericLiteral(xorNumber), identifier(indexName));
    let scDec = variableDeclarator(scName, scBinary);

    let sc = variableDeclaration('var', [scDec]);

    let nextVal = getXORNumber(xorNumber, indexValNumber.value);
    /**
     * 构造switch case 看情况要递归了，重新写一个方法
     */
    
    const cases: SwitchCase[] = conditionalExpression2SwitchCases(xorNumber, codeBlock, nextVal, identifier(indexName));
    cases.push(
        switchCase(null,[
            expressionStatement(assignmentExpression('=', identifier(indexName), Void0))          
        ])
    )
    // switch 乱序
    cases.unshift(cases.pop());
    cases.sort(() => 0.5 - Math.random());


    let switchEle = switchStatement(scName, cases);
    let body = blockStatement([sc, switchEle]);
    let forEle = forStatement(forIndex, testEl, null, body);


    const funExpree = functionExpression(
        null,
        [],
        blockStatement([forEle])
    );

    return callExpression(funExpree, []);
}   

function conditionalExpression2SwitchCases (
    xorNumber: number, // var p = 89 ^ index;  89
    codeBlock: ConditionalExpression,
    nextVal: NumericLiteral, // caseTest
    ctrlIdent: Identifier //控制 case走向 的变量
): SwitchCase[] {

    let parentLeftTest = getNextVal(); //true
    let parentRightTest = getNextVal(); //false

    let sybds = assignmentExpression('=', ctrlIdent, conditionalExpression(codeBlock.test, getXORNumber(xorNumber, parentLeftTest.value), getXORNumber(xorNumber, parentRightTest.value)));


    let parentCase = [switchCase(nextVal, [
        expressionStatement(sybds),
        breakStatement()
    ])];

    /**
     * 不管是 consequent还是alternate 都有可能嵌套
     * 所以，只要有嵌套就无脑递归
     */
    let parentLeftCase: SwitchCase[] = [];
    if (codeBlock.consequent.type === 'ConditionalExpression') {
        parentLeftCase = conditionalExpression2SwitchCases(xorNumber, codeBlock.consequent, parentLeftTest, ctrlIdent);
    } else if (isExpression(codeBlock.consequent)){
        //直接构造一个return 的case
        parentLeftCase = [
            switchCase(parentLeftTest, [
                returnStatement(codeBlock.consequent)
            ])
        ]
    }

    let parentRightCase: SwitchCase[] = [];
    if (codeBlock.alternate.type === 'ConditionalExpression') {
        parentRightCase = conditionalExpression2SwitchCases(xorNumber, codeBlock.alternate, parentRightTest, ctrlIdent);
    } else {
        //直接构造一个return 
        parentRightCase = [
            switchCase(parentRightTest, [
                returnStatement(codeBlock.alternate)
            ])
        ]
    }

    return parentCase.concat(parentLeftCase).concat(parentRightCase);
}