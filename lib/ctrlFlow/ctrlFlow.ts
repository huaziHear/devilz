/*
 * @Author: huazihear 
 * @Date: 2019-05-22 10:20:30 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-13 15:30:53
 * 
 * 
 * switch case控制流
 */
import traverse, { NodePath, TraverseOptions } from '@babel/traverse';
import { caseFlowFunction } from './transefer/transferFunction';
import _ from 'lodash';
import { File, callExpression, identifier, stringLiteral } from '@babel/types';
import stringPrefix from '../literal/stringPrefix';
import names from '../names/names';

interface devilOptions {
    stringSplit?: boolean,
    objectSplit?: boolean,
    nameReuse?: boolean,
    saveStrings?: string[],
    compact?: true
}

export class CtrlFlow {

    boom(ast: File, ignoreString: boolean = false, obtainStringFunctionName: string, option: devilOptions) {
        let saveStrings = option.saveStrings;
        const vistors: TraverseOptions = {
            enter: (path: NodePath) => {
                //变量名混淆
                names(path);
                // a.b.c ==> a['b']['c']
                if (path.node.type === 'MemberExpression' && !ignoreString && path.node.computed === false) {
                    if (path.node.property.type === 'Identifier') {
                        let node = path.node;
                        node.computed = true;
                        node.property = stringLiteral(path.node.property.name);
                        _.set(ast, path.getPathLocation(), node);
                    }
                }
            },
            exit: (path: NodePath) => {
                /**
                 *  function name (){};  FunctionDeclaration
                 *  var name = function (){}; FunctionExpression
                 *  () => {}; ArrowFunctionExpression
                 */
                if (path.node.type === 'FunctionDeclaration'
                    || path.node.type === 'ArrowFunctionExpression'
                    || path.node.type === 'FunctionExpression') {
                    if (path.node.type === 'ArrowFunctionExpression') {
                        return console.error('----- 代码中包含了箭头函数，混淆只是使用匿名函数替换，存在风险 -----')
                    }

                    let newFunc = caseFlowFunction(path.node, option);
                    _.set(ast, path.getPathLocation(), newFunc);
                }
            },
        };

        if (!option.stringSplit) {
            vistors['StringLiteral'] = (path: NodePath) => {
                if (path.node.type === 'StringLiteral' && !ignoreString) {
                    if (path.parent.type === 'ObjectProperty' && path.node === path.parent.key) {
                        /**
                         * 对象的key是不能这样去混淆的，要是搞成函数调用或者是变量的话，必须是拆解object
                         * 拆解object暂时不做，情况太复杂
                         */
                    } else {
                        var value = path.node.value;
                        if (saveStrings.filter(s => s === value).length > 0) {
                            return;
                        };


                        let str: string = stringPrefix(path.node.value);
                        let replaceAST = callExpression(identifier(obtainStringFunctionName), [
                            stringLiteral(str)
                        ]);
                        _.set(ast, path.getPathLocation(), replaceAST);
                    }

                };
            }
        }
        
        traverse(ast, vistors);

        option.stringSplit &&  traverse(ast, {
            StringLiteral: (path: NodePath) => {
                if (path.node.type === 'StringLiteral' && !ignoreString) {
                    if (path.parent.type === 'ObjectProperty' && path.node === path.parent.key) {
                        /**
                         * 对象的key是不能这样去混淆的，要是搞成函数调用或者是变量的话，必须是拆解object
                         * 拆解object暂时不做，情况太复杂
                         */
                    } else {
                        var value = path.node.value;
                        if (saveStrings.filter(s => s === value).length > 0) {
                            return;
                        };


                        let str: string = stringPrefix(path.node.value);
                        let replaceAST = callExpression(identifier(obtainStringFunctionName), [
                            stringLiteral(str)
                        ]);
                        _.set(ast, path.getPathLocation(), replaceAST);
                    }

                };
            }
        })
    }
}