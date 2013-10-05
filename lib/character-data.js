
var
	Node = require('./node'),
	util = require('util');

/**
 * CDATASection
 *
 */
function CDATASection(owner, cdata) {
	Node.call(this, owner);
	this.nodeValue = cdata || "";
	this.nodeType = this.CDATA_SECTION_NODE;
	this.nodeName = "#cdata";
}

util.inherits(CDATASection, Node);

CDATASection.prototype.cloneNode = function() {
	return new CDATASection(this.nodeValue);
}

CDATASection.prototype.__defineGetter__("textContent", function() {
	return this.nodeValue;
});

CDATASection.prototype.__defineSetter__("textContent", function(v) {
	this.nodeValue = v;
});

module.exports = CDATASection;