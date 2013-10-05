
var
	Node = require('./node'),
	util = require('util');

/**
 * Text
 *
 */
function Text(owner, text) {
	Node.call(this, owner);
	if (typeof text !== "string")
		throw new TypeError("Text given must be a string!");
	this.nodeValue = text || "";
	this.nodeName = "#text";
	this.nodeType = this.TEXT_NODE;
}

util.inherits(Text, Node);


Text.prototype.cloneNode = function() {
	var node = new Text(this.ownerDocument, this.nodeValue);
	return node;
}

Text.prototype.__defineGetter__("textContent", function() {
	return this.nodeValue;
});

module.exports = Text;