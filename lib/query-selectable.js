
var 
	Trait = require('com.izaakschroeder.trait'),
	zest = require('../zest').zest;


//TODO: Selector cache
module.exports = Trait({
	querySelector: function(query) {
		var results = zest(query, this);
		return results.length > 0 ? results[0] : null;
	},
	querySelectorAll: function(query) {
		return zest(query, this);
	}
}/*, function() {
	//http://updates.html5rocks.com/2012/02/Detect-DOM-changes-with-Mutation-Observers
	var self = this;
	var observer = new MutationObserver(function(mutations) {
		self.selectorCache = null;
	});
	observer.observe(this, { childList: true });
}*/);

