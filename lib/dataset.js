
var MutationObserver = require('./mutation-observer');

function DataSet(element) {
	var self = this;

	function set(name, val) {
		if (!name.match(/^data-/)) return;
		var parts = name.substr(5).split('-').map(function(item, i) {
			if (i === 0) return item;
			return item.charAt(0).toUpperCase() + item.slice(1);
		});
		Object.defineProperty(self, parts.join(''), {
			enumerable: true,
			get: function() {
				return element.getAttribute(name);
			},
			set: function(val) {
				element.setAttribute(name,val);
			}
		});
	}


	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			set(mutation.attributeName, element.getAttribute(name));
		});
	});
	observer.observe(element, { attributes: true })


	for (var i = 0; i < element.attributes.length; ++i)
		set(element.attributes[i].nodeName, element.attributes[i].nodeValue);
}


module.exports = DataSet;