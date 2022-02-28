/*
 * @Author: huazihear 
 * @Date: 2019-05-23 10:20:54 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-19 20:40:52
 * 
 * 数字类型的工具类
 */
import { numericLiteral, NumericLiteral, variableDeclarator, identifier, VariableDeclarator, VariableDeclaration, Identifier, Literal, binaryExpression, Expression, variableDeclaration } from '@babel/types';
import { NumberLiteral } from '@babel/types';

// value > param
function getExceeParamNumber(p: number): number {
    return randomFrom(1,5) + p;
}

function randomFrom(lowerValue:number, upperValue:number) {
    return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
}

// random number [1-num+1];
function getRD(num = 10): number {
    return Math.floor(Math.random() * num) + 1;
}

//返回一个与参数做 & 运算之后 还是参数的数字
function getAndNumber(num: number): number {
    let binNum = num.toString(2);
    return parseInt(binNum.replace(/0/g, '1'), 2);
}
// 7 ^ x = 10 返回x
function getXORNumber(left: number, value: number): NumberLiteral {
    let leftBin = left.toString(2);
    let valueBin = value.toString(2);
    let maxLen = Math.max(leftBin.length, valueBin.length);
    leftBin = leftBin.padStart(maxLen,'0');
    valueBin = valueBin.padStart(maxLen, '0');
    
    let result = [];
    for(let i=0; i<leftBin.length; i++) {
        if (valueBin[i] === '0') {
            if (leftBin[i] === '1') {
                result.push(1);
            } else {
                result.push(0)
            }
        } else {
            if (leftBin[i] === '1') {
                result.push(0);
            } else {
                result.push(1)
            }
        }
    }
    return numericLiteral(parseInt(result.join(''), 2)) ;
}

function getNumericLiteral(value: number): NumericLiteral {
    return numericLiteral(value);
}

function getVariableDeclaratorBinaryExpression(
    id: string | Identifier, 
    operator: "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=", 
    left: Expression,
    right: Expression
    ): VariableDeclarator {
    if (typeof id === 'string') {
        id = identifier(id);
    }    
    return variableDeclarator(id, binaryExpression(operator, left, right))
}

function getVariableDeclaratorNumber(id: string | Identifier, value: number | NumericLiteral): VariableDeclarator {
    if (typeof id === 'string') {
        id = getIdentifier(id);
    }
    if (typeof value  === 'number') {
        value = getNumericLiteral(value)
    }
    return variableDeclarator(id, value);
}

function getIdentifier(id: string): Identifier {
    return identifier(id);
}

function getVariableDeclaration(value: number | VariableDeclarator[], id?: string): VariableDeclaration{
    if (typeof value === 'number') {
        return variableDeclaration('var', [getVariableDeclaratorNumber(id, value)]);
    } else {
        return variableDeclaration('var', value);
    }
}
/**
 * 
 * @param value 这玩意得随机的出现了 算法是什么呢
 */
let nameNumber = [...new Array(100000)].map((n, i) => i).sort(function () { return 0.5 - Math.random(); });
let copyNameNumber = [].concat(nameNumber);

function getNextVal(): NumberLiteral{
    if (copyNameNumber.length===0) {
        copyNameNumber = [].concat(nameNumber)
    }
    return numericLiteral(copyNameNumber.pop());
}


export {
    getRD,
    getAndNumber,
    getXORNumber,
    getNextVal,
    randomFrom,
    getExceeParamNumber,
    getNumericLiteral,
    getIdentifier,
    getVariableDeclaratorNumber, 
    getVariableDeclaratorBinaryExpression,
    getVariableDeclaration 
}