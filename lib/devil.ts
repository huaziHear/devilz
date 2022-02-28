/*
 * @Author: huazihear 
 * @Date: 2019-04-25 10:11:07 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-19 22:48:16
 */
import generate from '@babel/generator';
import {parse} from '@babel/parser';
import {analyze} from 'scope-analyzer';
import {CtrlFlow} from './ctrlFlow/ctrlFlow';
import wrapper from './ctrlFlow/tools/wrapper';
let obtainCodeStr = require('fs')
  .readFileSync(require('path')
  .join(__dirname, '../obtainString.js'), 'utf-8');

if (!String.prototype.padStart) {
  String.prototype.padStart =
    // 为了方便表示这里 fillString 用了ES6 的默认参数，不影响理解
    function (maxLength, fillString = ' ') {
      if (Object.prototype.toString.call(fillString) !== "[object String]") throw new TypeError('fillString must be String')
      let str = this
      // 返回 String(str) 这里是为了使返回的值是字符串字面量，在控制台中更符合直觉
      if (str.length >= maxLength) { return String(str) } 

      let fillLength = maxLength - str.length,
        times = Math.ceil(fillLength / fillString.length)

      // 这个算法叫啥？
      // SICP 的中文版第 30页 有用到同种算法计算乘幂计算
      while (times >>= 1) {
        fillString += fillString
        if (times === 1) {
          fillString += fillString
        }
      }
      return fillString.slice(0, fillLength) + str
    }
}
  


interface devilOptions {
  stringSplit?: boolean,
  objectSplit?: boolean,
  nameReuse?: boolean,
  saveStrings?: string[],
  compact?: true
}

export class Devil {
  CtrlFlow: CtrlFlow
  option: devilOptions
  obtainStringFunctionName: string
  constructor(option?: devilOptions) {
    this.CtrlFlow = new CtrlFlow();
    this.option = Object.assign({
      stringSplit: true,
      objectSplit: true,
      nameReuse: true,
      saveStrings: [],
      compact: true
    }, option || {});
  }

  AST: any;

  devil(code: string, option?: devilOptions) {
    if (option) {
      this.option = option;
    }
    this.AST = parse(code, {
      ranges: false,
      tokens: false
    });
    this.AST.program.body = this.AST.program.body.filter( (b:any) => b.type!=='EmptyStatement');
    /**
     * 前置操作，为修改字符串的自定义函数取一个名字，放到全局变量中
     */
    this.obtainStringFunctionName = '__' + Math.floor(Math.random()*10000);

    // console.log(JSON.stringify(this.AST));
    //绑定作用域后续备用
    analyze(this.AST);

    let isPackage = false;
    if (this.AST.program.body.length > 1 || this.AST.program.body[0].type !== 'FunctionDeclaration') {
      //------- 包装一次 ------
      this.AST.program.body = wrapper(this.AST);
      isPackage = true;
    //------- 包装一次 ------
    }
    
    this.CtrlFlow.boom(this.AST, false, this.obtainStringFunctionName, this.option);

    if (isPackage) {
      //------- 拆包装 --------
      this.AST.program.body = this.AST.program.body.expression.argument.callee.body.body;
      this.AST.program.body = this.insertStringObtain().concat(this.AST.program.body);
    //------- 拆包装 --------
    } else {
      this.AST.program.body[0].body.body = this.insertStringObtain().concat(this.AST.program.body[0].body.body);
    }
    
    
    return generate(this.AST, {
      compact: false,
      comments: false
    }).code;
  }

  insertStringObtain() {
    let newObtainCodeStr = obtainCodeStr.replace('obtainString', this.obtainStringFunctionName);
    let stringObtain = parse(newObtainCodeStr, {
      ranges: false,
      tokens: false
    });
    
    this.CtrlFlow.boom(stringObtain, true, this.obtainStringFunctionName, this.option);

    return stringObtain.program.body;
  }
};