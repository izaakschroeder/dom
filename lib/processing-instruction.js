
var
	Node = require('./node'),
	util = require('util');

/**
 * ProcessingInstruction
 *
 *
 */
function ProcessingInstruction(name, body) {
	Node.call(this);
	this.nodeName = name;
	this.nodeValue = body;
	this.nodeType = this.PROCESSING_INSTRUCTION_NODE;
}

util.inherits(ProcessingInstruction, Node);



ProcessingInstruction.prototype.cloneNode = function() {
	return new ProcessingInstruction(this.nodeName, this.nodeValue);
}

ProcessingInstruction.prototype.__defineGetter__("textContent", function() {
	return "";
});

module.exports = ProcessingInstruction;