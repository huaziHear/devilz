import { Statement, assignmentExpression, BinaryExpression, isLVal, NumericLiteral, Identifier, SwitchCase, ExpressionStatement, AssignmentExpression, expressionStatement } from "@babel/types";
import transferBodyStatement from "./transferBodyStatement";
import { Expression } from "estree";
const operator = '+-';

export function isMutilAssignments(lineCode: Statement) : boolean{
    const isAssign =  lineCode.type === 'ExpressionStatement'
        && lineCode.expression.type === 'AssignmentExpression'
        && lineCode.expression.right.type === 'BinaryExpression'
        && testBinary(lineCode.expression.right);
    return isAssign;
}

function testBinary (binary: BinaryExpression) : boolean {
    let deep = 0;
    function test(binary: BinaryExpression) : boolean{
        deep++;
        const okOperator = operator.indexOf(binary.operator) > -1;
        const okRight = binary.right.type === 'Identifier' || isLVal(binary.right);
        const okLeft = (binary.left.type === 'Identifier' || isLVal(binary.left)) 
        || (binary.left.type === 'BinaryExpression' && test(binary.left)) 
        return okOperator && okRight && okLeft;
    }
    return test(binary) && deep >= 2;
}

interface mutilAssignmentResult {
    switchCases: SwitchCase[],
    nextVal: NumericLiteral
}
/**
 * 把这个多项表达式，先构造成一个body数组，然后转成多个case
 * @param lineCode 一个多项的表达式
 */
export function transferMutilAssignment (
    xorNumber: number, // let p = 89 ^ index;  89
    codeBlock: ExpressionStatement,
    nextVal: NumericLiteral, // caseTest
    ctrlIdent: Identifier, //控制 case走向 的变量
    isLast: boolean
): mutilAssignmentResult {
    const expression = codeBlock.expression;
    if (expression.type !== 'AssignmentExpression' || expression.right.type !== 'BinaryExpression') {
        return null;
    }
    const binaryExpressions = getBinaryExpression(expression);
   
    return transferBodyStatement(nextVal, binaryExpressions, ctrlIdent, xorNumber, isLast);
}

//按照

function getBinaryExpression(code: AssignmentExpression) : ExpressionStatement[] {
    let newAssignment: AssignmentExpression[] = [];
    let wi = 1;
    if (code.right.type === 'BinaryExpression') {
        let be = code.right;
        if (be.type === 'BinaryExpression') {
            while (wi) {
                if (be.left.type === 'BinaryExpression') {
                    newAssignment.push(
                        assignmentExpression(be.operator + '=', code.left, be.right)
                    )
                } else {
                    newAssignment.push(
                        assignmentExpression('=', code.left, be)
                    )
                    wi = 0;
                }
                if (be.left.type === 'BinaryExpression') {
                    be = be.left;
                }
            }
        }
    }
    
    return newAssignment.reverse().map( na => expressionStatement(na));
}