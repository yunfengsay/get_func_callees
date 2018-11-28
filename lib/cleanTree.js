let cleanTree = {}
cleanTree.cleanDef0Callee = function (tree) {
    for(var i in tree.callees){
        let currentNode = tree.callees[i]
        if (currentNode.callees.length === 0 && currentNode.type === 'def' ) {
            tree.callees.splice(i,1)
            console.log('remove ', i)
        } else if (currentNode.callees.length) {
            cleanTree.cleanDef0Callee(currentNode)
        }
    }
    return tree
}



module.exports = cleanTree