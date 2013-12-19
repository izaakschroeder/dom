
var Node = require('./node');

function MutationRecord() {

}

function MutationObserver(callback) {
	this.callback = callback;
}

MutationObserver.prototype.observe = function(node, options) {
	if (node instanceof Node === false)
		throw new TypeError();

	var self = this;

	if (options.attributes) {
		var oldSet = node.attributes.setNamedItem,
			oldRemove = node.attributes.removeNamedItem;

		node.attributes.setNamedItem = function(attr) {
			var record = new MutationRecord();
			record.type = 'attributes';
			record.target = node;
			record.attributeName = attr.nodeName;
			record.oldValue = '';
			oldSet.call(node.attributes, attr)
			self.callback([record]);
		}
		node.attributes.removeNamedItem = function(name) {
			var record = new MutationRecord();
			record.type = 'attributes';
			record.target = node;
			record.attributeName = node.nodeName;
			record.oldValue = '';
			oldRemove.call(node.attributes, name);
			self.callback([record]);
		}
	}
	
}

MutationObserver.prototype.disconnect = function() {

}

MutationObserver.prototype.takeRecords = function() {

}

module.exports = MutationObserver;