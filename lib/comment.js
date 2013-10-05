
var Node = require('./node'),
	util = require('util');

/**
 * Comment
 *
 *
 */
function Comment(owner, comment) {
	Node.call(this, owner);
	this.nodeValue = comment || "";
	this.nodeType = this.COMMENT_NODE;
	this.nodeName = "#comment";
}

util.inherits(Comment, Node);

Comment.prototype.cloneNode = function() {
	var node = new Comment(this.nodeValue);
	node.ownerDocument = this.ownerDocument;
	return node;
}


module.exports = Comment;