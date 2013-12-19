var 
	Trait = require('com.izaakschroeder.trait'),
	Attribute = require('./attribute'),
	NamedNodeMap = require('./named-node-map');

module.exports = Trait({
	/**
	 *
	 *
	 */
	getAttribute: function(attr) {
		var node = this.attributes.getNamedItem(attr);
		return node ? node.nodeValue : null;
	},

	/**
	 *
	 *
	 */
	hasAttribute: function(attr) {
		return this.attributes.hasNamedItem(attr);
	},

	/**
	 *
	 *
	 */
	setAttribute: function(attr, val) {
		if (typeof attr !== "string")
			throw new TypeError("Attribute name must be string!")
		if (typeof val !== "string")
			throw new TypeError("Value must be string!");
		//var node = this.attributes.getNamedItem(attr);
		//if (node)
		//	node.nodeValue = val;
		//else
			this.attributes.setNamedItem(new Attribute(this, attr, val));
	},

	/**
	 *
	 *
	 */
	removeAttribute: function(attr) {
		//"Attempting to remove an attribute that is not on the element doesn't raise an exception."
		if (this.hasAttribute(attr))
			this.attributes.removeNamedItem(attr);
	},

	/**
	 *
	 *
	 */
	setAttributeNS: function() {
		throw new Error()
	},

	/**
	 *
	 *
	 */
	setAttributeNode: function() {
		throw new Error();
	},

	/**
	 *
	 *
	 */
	setAttributeNodeNS: function() {
		throw new Error();
	}
})
