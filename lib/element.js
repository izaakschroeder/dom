
var
	NamedNodeMap = require('./named-node-map'),
	Trait = require('com.izaakschroeder.trait'),
	Node = require('./node'),
	util = require('util');

/**
 * Element
 *
 */
function Element(owner, e) {
	Node.call(this, owner);
	Trait.install(this, Trait.compose(
		require('./query-selectable'),
		require('./attributable'),
		require('./element-container')
	))
	
	if (!e)
		throw new Error();

	this.attributes = new NamedNodeMap();
	this.nodeType = this.ELEMENT_NODE;

	if (e instanceof Element) {
		this.nodeName = this.tagName = e.tagName;
		e.attributes.forEach(function(node) {
			this.setAttribute(node.nodeName, node.nodeValue);
		}, this)
		this.ownerDocument = e.ownerDocument 
	}
	else {
		this.nodeName = this.tagName = e;
	}
}
util.inherits(Element, Node);

/**
 *
 *
 *
 */
Element.prototype.cloneNode = function(deep) {
	var e = new Element(this.ownerDocument, this);
	if (deep)
		for(var i = 0; i < this.childNodes.length; ++i)
			e.appendChild(this.childNodes[i].cloneNode(deep));
	return e;
}

/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "firstElementChild", {
	get: function() {
		for(var i = 0; i < this.childNodes.length; ++i)
			if (this.childNodes[i].nodeType === this.ELEMENT_NODE)
				return this.childNodes[i];
		return null;
	}
})

/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "lastElementChild", {
	get: function() {
		for(var i = this.childNodes.length-1; i >= 0; --i)
			if (this.childNodes[i].nodeType === this.ELEMENT_NODE)
				return this.childNodes[i];
		return null;
	}
})

/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "nextElementSibling", {
	get: function() {
		do { el = el.nextSibling } while ( el && el.nodeType !== this.ELEMENT_NODE );
		return el;
	}
})


/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "previousElementSibling", {
	get: function() {
		do { el = el.previousSibling } while ( el && el.nodeType !== this.ELEMENT_NODE );
		return el;
	}
})

/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "className", {
	get: function() {
		return this.getAttribute("class") || "";
	},
	set: function(val) {
		throw new Error();
	}
})

/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "classList", {
	get: function() {
		if (this._classList)
			return this._classList;
		this._classList = new ClassList(this);
		return this._classList;
	}
})

/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "dataset", {
	get: function() {
		if (this._dataset)
			return this._dataset;
		this._dataset = new DataSet(this);
		return this._dataset;
	}
});

/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "textContent", {
	get: function() {
		var out = "";
		for(var i = 0; i < this.childNodes.length; ++i)
				out += this.childNodes[i].textContent || "";
		return out;
	},
	set: function(val) {
		while (this.firstChild)
			this.removeChild(this.firstChild);
		this.appendChild(this.ownerDocument.createTextNode(val));
	}
});

/**
 *
 *
 *
 */
Object.defineProperty(Element.prototype, "innerHTML", {
	get: function() {
		throw new Error();
	},
	set: function(val) {
		throw new Error();
	}
});


module.exports = Element;