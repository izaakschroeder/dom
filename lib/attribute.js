
var 
	Node = require('./node'),
	util = require('util');


function Attribute(owner, name, value) {
	Node.call(this, owner.ownerDocument);
	this.nodeName = name;
	this.nodeValue = value;
	this.ownerElement = owner;
	this.nodeType = this.ATTRIBUTE_NODE;
}
util.inherits(Attribute, Node)

module.exports = Attribute;