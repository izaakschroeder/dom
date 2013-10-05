
var
	Trait = require('com.izaakschroeder.trait');

module.exports = Trait({

	/**
	 *
	 *
	 *
	 */
	getElementsByAttribute: function(attr, value) {
		var out = [];
		
		for(var i = 0; i<this.childNodes.length; ++i) {
			var child = this.childNodes[i];		
			
			if (child.nodeType === 1) {
				if (child.getAttribute(attr) === value)
					out.push(child);
								
				var elems = child.getElementsByAttribute(attr, value);
				for(var j = 0; j<elems.length; ++j)
					out.push(elems[j]);
			}
		}
		return out;
	},

	/**
	 *
	 *
	 *
	 */
	getElementsByTagName: function(tagName) {
		var out = [];
		tagName = tagName.toLowerCase();
		for(var i = 0; i<this.childNodes.length; ++i) {
			var child = this.childNodes[i];				
			if (child.nodeType === 1) {
				 if (tagName === "*" || child.tagName.toLowerCase() === tagName)
					out.push(child);
				var elems = child.getElementsByTagName(tagName);
				for(var j = 0; j<elems.length; ++j)
					out.push(elems[j]);
			}
			
		}
		return out;
	},

	getElementsByNameNS: function(tagName, namespace) {

	},

	/**
	 *
	 *
	 *
	 */
	getElementById: function(id) {
		return this.getElementsByAttribute("id", id)[0];
	},

	/**
	 *
	 *
	 *
	 */
	getElementsByName: function(name) {
		return this.getElementsByAttribute("name", name);
	}
})
