var
	DOM = require('../dom'),
	HTML = require('com.izaakschroeder.html');


DOM.parse('<!DOCTYPE html><html><head><script/><title>Hello World</title></head><body><form><select disabled="disabled"><option value="1">Test</option></select></form><p class="worldly message">Hi.\nMy name is Bob.<br/></body></html>', function(doc) {
	//console.log(doc.querySelector("p").className)
	HTML.serializer(doc).pipe(process.stdout);
})