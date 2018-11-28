// import { transformFileSync } from 'babel-core';
// import { writeFileSync } from 'fs';
var babel = require('babel-core');
var fs = require("fs");
var t = require('babel-types');
var DECLARA_NAMES = 'FunctionDeclaration|ClassDeclaration|VariableDeclarator';
var getName = require('./lib/getName');
var cleanTree = require('./lib/cleanTree');
var tree2dot = require('./lib/tree2dot');
var exec = require('child_process').exec; 

var result = {};

function traverseDef(path, node) {

    path.traverse({
        [DECLARA_NAMES](path) {
            let newCalleeNode = {
                name: path.node.id.name,
                callees: [],
                type: 'def'
            }

            node.callees.push(newCalleeNode);
            traverseCall(path, newCalleeNode)
        }
    })
}

function traverseCall(path, node) {
    path.traverse({
        CallExpression(path) {
            let calleeName = path.node.callee.name;
            if (path.node.callee.type === 'MemberExpression') {
                calleeName = getName.getMemberCalleeName(path)
            }
            let newCalleeNode = {
                name: calleeName,
                callees: [],
                type: 'callee'
            }
            node.callees.push(newCalleeNode) // 靠引用传递来递归
            traverseDef(path, newCalleeNode)
        }
    })
}

function traversePath(path, node) {
    traverseDef(path, node)
    traverseCall(path, node)
}


const visitor = {
    Program(path) {
        result.name = "program"
        result.callees = [];
        traversePath(path, result)
    }
};

var bable_build_result = babel.transformFileSync("./test/test.js", {
    plugins: [
        {
        visitor: visitor
    }]
});

// cleanTree.cleanDef0Callee(result)

let dotCode = tree2dot(result)
let resultDotFileName = 'dot.dot';
fs.writeFileSync('./'+resultDotFileName, dotCode)
fs.writeFileSync('./dist/ast.json', JSON.stringify(bable_build_result.ast))
fs.writeFileSync('./dist/result.js', bable_build_result.code)
fs.writeFileSync('./result.json', JSON.stringify(result))

let cmd = `dot ${resultDotFileName} -T png -o ${resultDotFileName}.png`
exec(cmd, function(err,stdout,stderr){
    if(err) {
        console.log('get error:'+stderr);
    }
})