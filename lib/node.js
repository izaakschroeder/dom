
var Trait = require('com.izaakschroeder.trait');

/**
 *
 *
 */
function Node(ownerDocument) {
	Trait.install(this, Trait.compose(
		Trait(require('./types'))
	))
	this.childNodes = [];
	this.nextSibling = null;
	this.previousSibling = null;
	this.ownerDocument = ownerDocument;
	this.nodeType = this.DOCUMENT_NODE;

	if (ownerDocument && ownerDocument.nodeType !== this.DOCUMENT_NODE)
		throw new TypeError();
}

/**
 *
 *
 */
Object.defineProperty(Node.prototype, "firstChild", {
	get: function() {
		return this.childNodes[0];
	}
});

/**
 *
 *
 */
Object.defineProperty(Node.prototype, "lastChild", {
	get: function() {
		return this.childNodes[this.childNodes.length - 1];
	}
});


/**
 *
 *
 */
Node.prototype.contains = function(base, node) {
	if (base === undefined) {
		//FIXME: Needs work here....
		return false;
	}
	for(var i = 0; i<base.childNodes.length; ++i) {
		var child = base.childNodes[i];
		if (child === node || child.contains(node))
			return true;
	}
	return false;
}

/**
 *
 *
 */
Node.prototype.insertChild = function(idx, child) {
	
	if (child instanceof Node === false)
		throw new TypeError("Child must be a node! Got "+child+" ("+util.inspect(child)+")");

	if (idx > this.childNodes.length)
		throw new Error("Index out of bounds ("+idx+" >= " + this.childNodes.length+")!")
	
	if (child.parentNode)
		child.parentNode.detatchChild(child);

	child.parentNode = this;
	this.childNodes.splice(idx,0,child);
				
	if (idx == 0) {
		child.previousSibling = null;
	}
	else {
		child.previousSibling = this.childNodes[idx - 1];
		child.previousSibling.nextSibling = child;
	}
		
	if (idx == this.childNodes.length-1) {
		child.nextSibling = null;
	}
	else {
		child.nextSibling = this.childNodes[idx+1];
		child.nextSibling.previousSibling = child;
	}
	
	child.ownerDocument = this.ownerDocument;
}

/**
 *
 *
 */
Node.prototype.appendChild = function(child) {
	this.insertChild(this.childNodes.length, child);
}

/**
 *
 *
 */
Node.prototype.prependChild = function(child) {
	this.insertChild(0, child);
}

Node.prototype.hasChildNodes = function() {
	return this.childNodes.length > 0;
}

/**
 *
 *
 */
Node.prototype.position = function() {
	var parent = this.parentNode;
	if (!parent)
		return -1;
	for(var i = 0; i<parent.childNodes.length; ++i)
		if (parent.childNodes[i] === this)
			return i;
	return -1;
}

/**
 *
 *
 */
Node.prototype.detatchChild = function(child) {
	var parent = this;
	parent.childNodes.splice(child.position(), 1);
	child.previousSibling = child.nextSibling = child.parentNode = null;
	return child;
}

/**
 *
 *
 */
Node.prototype.removeChild = function(child) {
	child.ownerDocument = null;
	return this.detatchChild(child);
}

/**
 *
 *
 */
Node.prototype.insertBefore = function(newElement, referenceElement) {
	if (referenceElement === null) 
		this.appendChild(newElement);
	else
		this.insertChild(referenceElement.position(), newElement);
}

/**
 *
 *
 */
Node.prototype.replaceChild = function(newChild, oldChild) {
	if (oldChild.parentNode !== this)
		throw new Error("Replacing an element that doesn't belong to me!");
	if (newChild instanceof Node === false)
		throw new TypeError("Replacement child must be a node!");
	if (oldChild instanceof Node === false)
		throw new TypeError("Replacee child must be a node!");
	var n = oldChild.position();
	var p = this;
	this.removeChild(oldChild);
	p.insertChild(n, newChild);
	return oldChild;
}

/**
 *
 *
 */
Node.prototype.empty = function() {
	this.childNodes = [];
}

/**
 *
 *
 */
Node.prototype.content = function(content) {
	if (typeof content === "undefined") {
		content = "";
		for(var i = 0; i < this.childNodes.length; ++i) 
			content += this.childNodes[i].toString();
		return content;
	} else {
		this.empty();
		if (!(content instanceof Node))
			content = new Text(content);
		this.appendChild(content);
	}
	
}


module.exports = Node;