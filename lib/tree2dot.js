function tree2dot(tree) {
    let $start = `strict digraph {`
    let $body = ''
    let $end = '}'
    let makeArrow = (tree) => {
        tree.callees.forEach(node => {
            if(node.type == 'callee'){
                $body  += `"${tree.name}" -> "${node.name}" \n`
            }
            if(node.callees.length){
                makeArrow(node)
            }
           
        });
    }
    makeArrow(tree)
    return $start +$body+ $end;
}


module.exports = tree2dot