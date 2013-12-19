
var MutationObserver = require('./mutation-observer');

function ClassList(element) {
	Array.call(this);
	var self = this;
	this.element = element;
	this.rebuild();

	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if (mutation.attributeName === 'class')
				self.rebuild();
		});
	});
	observer.observe(element, { attributes: true })
}
ClassList.prototype = [ ];

ClassList.prototype.add = function(name) {
	if (this.indexOf(name) === -1) {
		this.push(name);
		this.sync();
	}
}

ClassList.prototype.remove = function(name) {
	var index = this.indexOf(name);
	if (index !== -1) {
		this.splice(index, 1);
		this.sync();
	}
}

ClassList.prototype.toggle = function(name) {
	var index = this.indexOf(name);
	if (index !== -1) 
		this.splice(index, 1);
	else 
		this.push(name);
	this.sync();
}
ClassList.prototype.contains = function(name) {
	return this.indexOf(name) !== -1;
}

ClassList.prototype.toString = function() {
	return this.join(" ");
}

ClassList.prototype.rebuild = function() {
	this.splice(0, this.length);
	Array.prototype.push.apply(this, (this.element.getAttribute("class") || "").trim().split(/\s+/))
}

ClassList.prototype.sync =  function() {
	this.element.setAttribute('class', this.toString());
}

module.exports = ClassList;