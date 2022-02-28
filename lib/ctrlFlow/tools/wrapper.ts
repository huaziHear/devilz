
/*
 * @Author: huazihear 
 * @Date: 2019-05-22 10:24:46 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-05-29 20:38:53
 * 
 * 返回一个自执行的函数的ast
 * 
 */
import { File, ExpressionStatement, expressionStatement, callExpression, functionExpression, blockStatement, unaryExpression} from "@babel/types";

export default function wrapper(ast: File): ExpressionStatement {
    const funExpree = functionExpression(
        null,
        [],
        blockStatement(ast.program.body)
    );
    const result = expressionStatement(unaryExpression('!', callExpression(funExpree,[])),)
    return result;
}