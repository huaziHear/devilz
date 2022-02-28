/*
 * @Author: huazihear 
 * @Date: 2019-05-22 11:16:56 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-12 18:47:43
 */
import {
    FunctionDeclaration, functionDeclaration, blockStatement, forStatement, variableDeclaration, variableDeclarator,
    identifier, numericLiteral, binaryExpression, unaryExpression, switchStatement, SwitchCase, emptyStatement, Statement, FunctionExpression, ArrowFunctionExpression, NumericLiteral, Identifier, switchCase, breakStatement, assignmentExpression, expressionStatement, NumberLiteral, functionExpression, returnStatement, stringLiteral
} from '@babel/types';
import transferIfStatement from "./transferIfStatement";
import transferForStatement from './transferForStatement';
import transferForInStatement from './transferForInStatement'
import { getXORNumber, randomFrom } from '../tools/freeNumber';
import _ from 'lodash';
import * as freeNumber from '../tools/freeNumber';
import * as freeString from '../tools/freeString';
import transferTryCatch from './transferTryCatch';
import transferObjectExpression from './transferObjectExpression';
import transferConditionalExpression from './transferConditionalExpression';
import { isMutilAssignments, transferMutilAssignment} from './tranferMutilAssign';
import transferBodyStatement from './transferBodyStatement';


const Void0 = unaryExpression('void', numericLiteral(0));

export {
    creatForStatement,
    caseFlowFunction,
    generateSwitchCase
};

function creatForStatement(bodyNodes: Statement[], option?: devilOptions): Statement[] {
    /**
     * 构造for循环结构  var index = 1; void 0 !== index
     */
    let indexName = freeString.getVarName(100000); // for循环索引名称
    let indexValNumber = freeNumber.getNumericLiteral(freeNumber.getRD());
    let forIndexValue = freeNumber.getVariableDeclaratorNumber(indexName, indexValNumber) // 索引初始值
    let forIndex = freeNumber.getVariableDeclaration([forIndexValue]) // 索引构造

    let testEl = binaryExpression('!==', Void0, identifier(indexName)); // test 构造 void 0 !== index

    /**
     * 构造一级控制变量
     * var p = 89 >> index;
     * 再增加两个垃圾变量 
     */
    let scName = identifier(freeString.getVarName(10000));
    let xorNumber = freeNumber.getNextVal().value; // 89 
    let scBinary = binaryExpression('^', numericLiteral(xorNumber), identifier(indexName));
    let scDec = variableDeclarator(scName, scBinary);

    let sc = variableDeclaration('var', [scDec]);
    
    /**
     * function 内部的function其实已经被处理过一次了，递归的原因
     * 所以抽出来，把它们放到for循环的外部来，整整齐齐的
     * 避免嵌套的一个重要的原因是 --- 平展
     */
    let codeList = bodyNodes && bodyNodes.length ? bodyNodes : [emptyStatement()]
    let funcList: any[] = [];

    for(var i=0; i<codeList.length; i++) {
        if (codeList[i].type === 'FunctionDeclaration') {
            funcList.push(codeList.splice(i,1)[0]);
            i--;
        }
    }

    let cases: SwitchCase[] = bodyCaseFlow(codeList, indexValNumber, xorNumber, indexName, option);
    cases.push(
        switchCase(null, [
            expressionStatement(assignmentExpression('=', identifier(indexName), Void0))
        ])
    );
    
    let switchEle = switchStatement(scName, cases);
    let body = blockStatement([sc, switchEle]);
    let forEle = forStatement(forIndex, testEl, null, body);
    return funcList.concat([forEle]);
};

interface devilOptions {
    stringSplit?: boolean,
    objectSplit?: boolean,
    nameReuse?: boolean,
    saveStrings?: string[]
}
/**
 * 输入一个function 输出一个function
 * @param funcNode function AST
 */
function caseFlowFunction(funcNode: FunctionDeclaration | FunctionExpression, option: devilOptions): FunctionDeclaration | FunctionExpression {
    let funcName = funcNode.id ? funcNode.id.name : ''; //构造新函数的函数名
    let params = funcNode.params; //函数参数
    let forStatementIns = creatForStatement(funcNode.body.body, option);
    if (funcNode.type === 'FunctionExpression') {
        return functionExpression(identifier(funcName), params, blockStatement(forStatementIns),false,false);
    }
    return functionDeclaration(identifier(funcName), params, blockStatement(forStatementIns), false, false);
}


/**
 * @param codeList 待处理的function bodys
 * @param indexValNumber for循环索引变量，case修改索引控制case走向  for(var indexValueNumber = 1;....)
 * @param xorNumber xorNumber case的值根据当前case的值和xorNumber计算得到  var p = 10 ^ indexValueNumber
 * @param indexName indexValueNumber 的名字
 */
function bodyCaseFlow(
    codeList: Statement[],
    indexValNumber: NumberLiteral,
    xorNumber: number,
    indexName: string,
    option?: devilOptions
): SwitchCase[] {
    // switch case结束需要给控制变量赋值为undefiend
    /**
     * 遍历每个代码块
     */
    let cases: SwitchCase[] = Array();
    let caseTest = freeNumber.getXORNumber(xorNumber, indexValNumber.value);
    for (let _i = 0; _i < codeList.length; _i++) {
        let isLast = codeList.length - 1 === _i;
        let caseObj = generateSwitchCase(xorNumber, caseTest, codeList[_i], identifier(indexName), isLast, option);
        caseTest = caseObj.nextVal;
        cases = cases.concat(caseObj.switchCaseEl);
    };


    // switch 乱序
    cases.unshift(cases.pop());
    cases.sort(() => 0.5 - Math.random());
    cases = cases.filter(c => !!c);
    return cases;
}



/**
 * @param test case 值
 * @param lineCode 代码段
 * @param ctrlVarName 下一个case的指向
 */
interface switchCaseObject {
    nextVal: NumericLiteral,
    switchCaseEl: SwitchCase[]
}

/**
 * 
 * @param xorNumber  // var p = 89 ^ index;  89
 * @param test 
 * @param lineCode 
 * @param endCtrlExpression //for循环结束赋值
 * @param ctrlIdent  // case跳转变量
 * @param isLast //是否是最后一行代码
 */
function generateSwitchCase(
    xorNumber: number,
    test: NumericLiteral,
    lineCode: Statement,
    ctrlIdent: Identifier,
    isLast: boolean,
    option?: devilOptions): switchCaseObject {

    let caseList: SwitchCase[] = [];

    let endCtrlExpression = expressionStatement(assignmentExpression('=', ctrlIdent, Void0));

    // 控制变量改变值
    let nextVal = freeNumber.getNextVal();
    let consequent = [];
    
    if (lineCode.type === 'VariableDeclaration'
        && lineCode.declarations.length === 1
        && lineCode.declarations[0].type === 'VariableDeclarator'
        && lineCode.declarations[0].init
        && lineCode.declarations[0].init.type === 'StringLiteral'
        && (option ? option.saveStrings.join('').indexOf(lineCode.declarations[0].init.value) === -1 : true)
    ) {
        const { declarations, kind } = lineCode;
        const { id, init } = declarations[0];
        let stringValue = init.type === 'StringLiteral' && init.value.split('');
        let splitCount = randomFrom(2, 5);
        let strArray = [];
        while (splitCount--) {
            let index = randomFrom(0, stringValue.length - 1);
            strArray.push(stringValue.splice(0, index).join('') || '');
        }
        strArray.push(stringValue.join(''))
        const vardec = variableDeclaration(kind, [variableDeclarator(id)]); //var a;
        const expressStatementIns: any = [expressionStatement(assignmentExpression('=', id, stringLiteral(strArray.shift() || '')))];
        strArray.forEach(s => {
            expressStatementIns.push(
                expressionStatement(assignmentExpression('+=', id, stringLiteral(s)))
            )
        })
        const varCasesResult = transferBodyStatement(test, [vardec].concat(expressStatementIns),ctrlIdent, xorNumber, isLast);
        caseList = caseList.concat(varCasesResult.switchCases);
        nextVal = varCasesResult.nextVal;
    } else
    if (lineCode.type === 'VariableDeclaration'
        && lineCode.declarations.length === 1 && lineCode.declarations[0].init
        && 
        ( // 拆解对象和表达式
            ( 
                lineCode.declarations[0].init.type === 'BinaryExpression'
                && lineCode.declarations[0].init.left.type === 'BinaryExpression'
                && lineCode.declarations[0].init.left.left.type === 'BinaryExpression'
            ) 
            || 
            (
                lineCode.declarations[0].init.type === 'ObjectExpression'
                && lineCode.declarations[0].init.properties.length !== 0
            )
        )
        ) {
            //TODO  var a = a+b+c;
            //    ----->   var a;  a = a+b+c;
        const { declarations, kind } = lineCode;
        const { id, init } = declarations[0];
        const vardec = variableDeclaration(kind, [variableDeclarator(id)]); //var a;
        const expressStatementIns = expressionStatement(assignmentExpression('=', id, init));
        const varCasesResult = transferBodyStatement(test, [vardec, expressStatementIns],ctrlIdent, xorNumber, isLast);
        caseList = caseList.concat(varCasesResult.switchCases);
        nextVal = varCasesResult.nextVal;
    } else if (lineCode.type === 'TryStatement') {
        let result = transferTryCatch(xorNumber, lineCode, test, endCtrlExpression, ctrlIdent, isLast);
        caseList = caseList.concat(result.switchCases);
        nextVal = result.nextVal;
    } else if (lineCode.type === 'ForInStatement' || lineCode.type === 'ForOfStatement') {
        let result = transferForInStatement(xorNumber, lineCode, test, endCtrlExpression, ctrlIdent, isLast);
        caseList = caseList.concat(result.switchCases);
        nextVal = result.nextVal;
    } else if (lineCode.type === 'ForStatement' || lineCode.type === 'WhileStatement') {
        let result = transferForStatement(xorNumber, lineCode, test, endCtrlExpression, ctrlIdent, isLast)
        caseList = caseList.concat(result.switchCases);
        nextVal = result.nextVal;
    } else if (lineCode.type === 'IfStatement') {
        let ifCases = transferIfStatement(xorNumber, lineCode, test, endCtrlExpression, ctrlIdent, isLast)
        caseList = caseList.concat(ifCases.switchCases);
        nextVal = ifCases.nextVal;
    } else if (lineCode.type === 'ReturnStatement') {
        if (lineCode.argument && lineCode.argument.type === 'BinaryExpression') {
            const varName = identifier(freeString.getVarName(100000));
            const vardec = variableDeclaration('var', [variableDeclarator(varName)]); //var a;
            const expressStatementIns = expressionStatement(assignmentExpression('=', varName, lineCode.argument));
            const newReturn = returnStatement(varName); //return a;
            const returnResult = transferBodyStatement(test, [vardec, expressStatementIns, newReturn], ctrlIdent, xorNumber, isLast);
            caseList = caseList.concat(returnResult.switchCases);
            nextVal = returnResult.nextVal;
        } else {
            consequent = [lineCode];
            caseList.push(switchCase(test, consequent));
        }

    } else if (isMutilAssignments(lineCode)) {
        if (lineCode.type === 'ExpressionStatement') {
            let ifCases = transferMutilAssignment(xorNumber, lineCode, test, ctrlIdent, isLast)
            caseList = caseList.concat(ifCases.switchCases);
            nextVal = ifCases.nextVal;
        }
    } else if (lineCode.type === 'ExpressionStatement'
        && lineCode.expression.type === 'AssignmentExpression'
        && lineCode.expression.right.type === 'ObjectExpression'
        && (option ? option.objectSplit : true)
        ) {
        let ifCases = transferObjectExpression(xorNumber, lineCode, test, ctrlIdent, isLast)
        caseList = caseList.concat(ifCases.switchCases);
        nextVal = ifCases.nextVal;
    } else {
        if (lineCode.type === 'ExpressionStatement' 
            && lineCode.expression.type === 'AssignmentExpression'
            && lineCode.expression.right.type === 'ConditionalExpression') {
            lineCode.expression.right = transferConditionalExpression(lineCode.expression.right)
        }
        
        let ctrlAssig = assignmentExpression('=', ctrlIdent, getXORNumber(xorNumber, nextVal.value));
        let ctrlExpress = expressionStatement(ctrlAssig);

        consequent = [
            lineCode,
            isLast ? endCtrlExpression : ctrlExpress,
            breakStatement()
        ]
        caseList.push(switchCase(test, consequent));
    }

    return {
        nextVal,
        switchCaseEl: caseList
    };
};
