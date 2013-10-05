
function DataSet(element) {
	var self = this;

	element.on("attribute", function(name) {
		if (name.match(/^data-/))
			self[name.substr(5)] = element.getAttribute(name);
	})

	for (var name in element.attributes)
		if (name.match(/^data-/))
			self[name.substr(5)] = element.getAttribute(name);
}

module.exports = DataSet;