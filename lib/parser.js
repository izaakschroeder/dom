

function DOMParser(implementation) {
	this.implementation = implementation;
	
}

DOMParser.prototype.parseFromString = function(string, type) {
	var parser = this.implementation.createParser(type);
	parser.write(string);
	parser.end();
	return parser.document;	
}

module.exports = DOMParser;