/*
 * @Author: huazihear 
 * @Date: 2019-06-03 11:21:10 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-05 02:16:39
 * 字符串数值相关
 */
import { randomFrom } from './tools';
/**
 * 字符串 ASCII 偏移算法
 * 随机偏移 prefix
 * 随机运算值 rdXor、
 * 
 * prefix^rdXor = rNumber, rNumber^rdXor=prefix
 */

 /**
  * 数值类 运算算法
  * 
  * number ^ rdXor = newNumber,  newNumber ^ rdXor = number
  */

interface stringPrefixResult {
    str: string,
    rdXor: number,
    rNumber: number
}
const splitChar = ["ř", "Ś", "Ŝ", "Ş", "Š", "ś", "ŝ", "ş", "š", "Ţ", "Ť", "Ŧ", "ţ", "ť", "ŧ"];

export default function stringPrefix(str: string): string {
    let prefix = randomFrom(200, 300);
    // let rdXor: any = getRD(splitChar.length);
    let rdXor: any = randomFrom(100,121);
    let newstr = str.split('').map((s: string) => {
            return String.fromCharCode(s.charCodeAt(0) + prefix);
    }).join('');
    newstr = String.fromCharCode(rdXor) + newstr;
    newstr += String.fromCharCode(prefix ^ rdXor);
    return `${newstr}`;
};