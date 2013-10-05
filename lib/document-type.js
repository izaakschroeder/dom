
var Node = require('./node'),
	util = require('util');

/**
 * DocumentType
 *
 */
function DocumentType(type) {
	Node.call(this, null);
	this.nodeName = type;
	this.nodeValue = type;
	this.nodeType = this.DOCUMENT_TYPE_NODE;
}

util.inherits(DocumentType, Node);



DocumentType.prototype.cloneNode = function() {
	return new DocumentType(this.nodeValue);
}

module.exports = DocumentType;