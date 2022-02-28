/*
 * @Author: huazihear 
 * @Date: 2019-06-03 11:30:28 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-03 13:40:52
 * 数字,字符串相关工具方法
 */

function randomFrom(lowerValue: number, upperValue: number) {
    return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
}

// random number [0-num+1];
function getRD(num = 10): number {
    return Math.floor(Math.random() * num);
}

// 7 ^ x = 10 返回x
function opXORNumber(left: number, right: number): number {
    return left ^ right
}


export {
    getRD,
    randomFrom,
    opXORNumber
}