/*
 * @Author: huazihear 
 * @Date: 2019-04-24 14:46:10 
 * @Last Modified by: huazihear
 * @Last Modified time: 2019-06-19 22:31:50
 * 
 * 变量名混淆 
 */
import { scope } from 'scope-analyzer';
import { NodePath } from '@babel/traverse';

/**
 * 提取出来一些数字和字符串，构造一个list
 * 变量名替换的时候，优先取这个list里面的字符
 * ****此方法并不可行，字面量其实是要隐藏的****
 */

let newScope= false;

export default function names(path: NodePath) {
    let Scope = scope(path.node);
    if (Scope) {
        if (Scope.bindings.size === 0) {
            return;
        }
        newScope = true;
        Scope.forEach((binding: any) => {
            let newName = '';
            binding.getReferences().forEach((n: any) => {
                /**
                 * 对象的key是不能够被混淆的
                 */
                if (n.parent.type === 'ObjectProperty' && n.parent.key == n) {
                    return;
                }
                if (!newName) {
                    newName = getNewName();
                    while (checkParentName(Scope, newName)) {
                        newName = getNewName()
                    }
                }
                n.name = newName;
            });
            binding.nname = newName;
        });
    }
}

function checkParentName (Scope:any, name: string) : boolean {
    for(let key of Scope.bindings) {
       let bd = key[1];
        if (bd.nname && bd.nname === name) {
           return true;
       }
    }
    if (Scope.parent) {
        return checkParentName(Scope.parent, name);
    };
    return false
}

let nameNumber = [...new Array(100000)].map((n, i) => i).sort(function () { return 0.5 - Math.random(); });
let copyNameNumber = [].concat(nameNumber);
function getNewName() {
    if (newScope) {
        newScope = false;
        nameNumber = [].concat(copyNameNumber);
    }
    let next = nameNumber.pop();
    return '_'+next;
}