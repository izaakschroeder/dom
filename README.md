# DOM

A simple and lightweight implementation of the DOM for node.js. Working on implementing
DOM levels 1, 2, 3 and 4; capable of using both XML and HTML5 semantics.

XML semantics provided by "sax".

HTML5 semantics provided by "com.izaakschroeder.html5".

```javascript
var 
	//Load the library
	DOM = require('com.izaakschroeder.dom'),
	//Load filesystem support
	fs = require('fs'),
	//Read a file
	stream = fs.createReadStream('./some-file.html');

//Parse the file
DOM.parse(stream, function(err, document) {
	//Unrecoverable error
	if (err && !document)
		throw new Error();

	//Errors, but we still have a document
	if (err)
		console.log("Warning: errors encountered.");

	//Do some basic work
	document.querySelectorAll("div").forEach(function(node) {
		console.log(node.tagName);
	})
})
```
