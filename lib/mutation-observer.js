
function MutationRecord() {

}

function MutationObserver(callback) {
	this.callback = callback;
}

MutationObserver.prototype.observe = function(node, options) {
	if (node instanceof Node === false)
		throw new TypeError();
	
}

MutationObserver.prototype.disconnect = function() {

}

MutationObserver.prototype.takeRecords = function() {

}

module.exports = MutationObserver;