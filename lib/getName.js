var getName = {}

getName.getMemberCalleeName = function(path) {
    let name = path.node.callee.property.name
    var getPropertyNameStrs = (obj) => {
        name += '.' +(!obj.property? obj.name:obj.property.name);
        if(obj.object) getPropertyNameStrs(obj.object);
    }
    getPropertyNameStrs(path.node.callee.object)
    return name.split('.').reverse().join('.')
}

module.exports=getName