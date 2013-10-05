
if (typeof define !== 'function') { var define = require('amdefine')(module) }

define([
	'./lib/node',
	'./lib/document',
	'./lib/document-type',
	'./lib/text',
	'./lib/element',
	'./lib/parser'
], function(Node, Document, DocumentType, Text, Element, DOMParser) {

	"use strict";
	
	//http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-102161490
	function DOMImplementation() {
		this.serializers = { };
		this.parsers = { };
		this.Node = Node;
		this.Document = Document;
		this.DocumentType = DocumentType;
		this.Text = Text;
		this.Element = Element;
		this.DOMParser = DOMParser.bind(undefined, this);
	}

	DOMImplementation.prototype.createDocument = function(namespace, name, type) {
		var doc = new Document();
		
		if (namespace !== null && typeof namespace !== 'string')
			throw new TypeError('Namespace must be a string.');

		if (typeof name !== 'string')
			throw new TypeError('Root element name must be a string.');

		if (type) {
			if (type instanceof DocumentType === false)
				throw new TypeError('Document type must be a valid DocumentType.');
			doc.appendChild(doc.importNode(type));
		}
		doc.appendChild(namespace ? doc.createElementNS(namespace, name) : doc.createElement(name));
		doc.implementation = this;

		return doc;
	}

	DOMImplementation.prototype.createDocumentType = function(type, id, sys) {
		return new DocumentType(type, id, sys)
	}

	DOMImplementation.prototype.hasFeature = function() {
		return false;
	}

	DOMImplementation.prototype.getFeature = function() {
		return null;
	}

	DOMImplementation.createImplementation = function() {
		var implementation = new DOMImplementation();
		
		//Defaults?
		var HTML = require('com.izaakschroeder.html'), XML = require('com.izaakschroeder.xml');
		implementation.registerParser('text/html', HTML.Parser);
		implementation.registerParser('text/xml', XML.Parser);
		implementation.registerSerializer('text/html', HTML.Serializer);
		implementation.registerSerializer('text/xml', XML.Serializer);

		return implementation;
	}

	DOMImplementation.prototype.registerParser = function(type, parser) {
		this.parsers[type] = parser;
	}

	DOMImplementation.prototype.registerSerializer = function(type, serializer) {
		this.serializers[type] = serializer;
	}

	DOMImplementation.prototype.createParser = function(type, options) {
		return new this.parsers[type](this, options);
	}

	DOMImplementation.prototype.createSerializer = function(type, options) {
		return new this.serializers[type](options)
	}

	return DOMImplementation.createImplementation();
});
