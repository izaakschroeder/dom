
var 
	Trait = require('com.izaakschroeder.trait'),
	Node = require('./node'),
	Element = require('./element'),
	Text = require('./text'),
	CDATA = require('./character-data'),
	Comment = require('./comment'),
	util = require('util');

/**
 * Document
 *
 *
 */
function Document() {
	Node.call(this, this);
	Trait.install(this, Trait.compose(
		require('./query-selectable'),
		require('./element-container')
	))

	this.nodeType = this.DOCUMENT_NODE;
	this.nodeName = "#document";
}

util.inherits(Document, Node);

/**
 *
 *
 */
Object.defineProperty(Document.prototype, "documentElement", {
	get: function() {
		for(var i = 0; i<this.childNodes.length; ++i)
			if (this.childNodes[i].nodeType == 1) 
				return this.childNodes[i]
		return null;				
	}
});

/**
 *
 *
 */
Document.prototype.cloneNode = function(deep) {
	var doc = new Document();
	if (deep)
		for (var i = 0; i < this.childNodes.length; ++i) 
			doc.appendChild(this.childNodes[i].cloneNode(deep))
	return doc;
}

/**
 *
 *
 */
Document.prototype.importNode = function(node, deep) {
	var newNode = node.cloneNode(deep);
	newNode.ownerDocument = this;
	return newNode;
}

/**
 *
 *
 */
Document.prototype.createTextNode = function(content) {
	var text = new Text(this, content);
	text.ownerDocument = this;
	return text;
}

/**
 *
 *
 */
Document.prototype.createComment = function(content) {
	var comment = new Comment(this, content);
	comment.ownerDocument = this;
	return comment;
}

/**
 *
 *
 */
Document.prototype.createCDATASection = function(content) {
	var cdata = new CDATA(this, content);
	cdata.ownerDocument = this;
	return cdata;
}

/**
 *
 *
 */
Document.prototype.createElement = function(name) {
	var element = new Element(this, name);
	element.ownerDocument = this;
	return element;
}

/**
 *
 *
 */
Document.prototype.createElementNS = function(namespace, name) {
	var element = this.createElement(name);
	element.setAttribute("xmlns", namespace);
	return element;
}

module.exports = Document;