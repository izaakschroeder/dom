
var
	util = require('util');

function NamedNodeMap() {
	Array.call(this);
	this.namedItems = { };
}
util.inherits(NamedNodeMap, Array);

NamedNodeMap.prototype.getNamedItem = function(name) {
	return (this.namedItems[name] && this.namedItems[name].value) || null;
}

NamedNodeMap.prototype.getNamedItemNS = function(namespace, name) {
	throw new Error();
}

NamedNodeMap.prototype.item = function(index) {
	return this[index] || null;
}

NamedNodeMap.prototype.hasNamedItem = function(name) {
	return typeof this.namedItems[name] !== 'undefined';
}

NamedNodeMap.prototype.removeNamedItem = function(name) {
	if (typeof this.namedItems[name] !== "undefined") {
		var old = this.namedItems[name];
		this.splice(old.index, 1);
		delete this.namedItems[name];
		return old.value;
	}
	throw new TypeError('No such named item: '+name);
}


NamedNodeMap.prototype.removeNamedItemNS = function(namespace, name) { 
	throw new Error();
}

NamedNodeMap.prototype.setNamedItem = function(node) {
	if (typeof this.namedItems[node.nodeName] !== "undefined") {
		this.namedItems[node.nodeName].value = node;
		this[this.namedItems[node.nodeName].index] = node;
	}
	else {
		this.namedItems[node.nodeName] = {
			value: node,
			index: this.length
		}
		this.push(node)
	}
}

NamedNodeMap.prototype.setNamedItemNS = function(node) {
	throw new Error();
}

module.exports = NamedNodeMap;