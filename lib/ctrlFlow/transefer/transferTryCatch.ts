import { TryStatement, NumericLiteral, Statement, Identifier, SwitchCase, switchCase, breakStatement, assignmentExpression, expressionStatement } from '@babel/types';
import { creatForStatement } from './transferFunction';
import { getNextVal, getXORNumber } from '../tools/freeNumber';
/**
 * !function(){
        try {
            for(var...) {
                switch(1) {
                    case 1:
                        console.log(1);
                }
            }
        }catch(e) {
            for(var ....) {
                switch() {
                    case 1:
                        console.log(e)
                }
            }
        }
    }()
 */
interface tryResult {
    switchCases: SwitchCase[],
    nextVal: NumericLiteral
}
export default function transferTryCatch(
    xorNumber: number, // var p = 89 ^ index;  89
    codeBlock: TryStatement,
    nextVal: NumericLiteral, // caseTest
    endCtrlExpression: Statement, //for循环结束赋值
    ctrlIdent: Identifier, //控制 case走向 的变量
    isLast?: boolean
): tryResult {
    const trySwitchCases = creatForStatement(codeBlock.block.body);
    const catchSwitchCases = creatForStatement(codeBlock.handler.body.body);

    codeBlock.block.body = trySwitchCases;
    codeBlock.handler.body.body = catchSwitchCases;
    
    const endVal = getNextVal();
    const ctrlAssig = assignmentExpression('=', ctrlIdent, getXORNumber(xorNumber, endVal.value));
    const ctrlExpress = expressionStatement(ctrlAssig);

    return {
        switchCases: [
            switchCase(nextVal, [
                codeBlock,
                isLast ? endCtrlExpression : ctrlExpress,
                breakStatement()
            ])
        ],
        nextVal: endVal
    }
}
