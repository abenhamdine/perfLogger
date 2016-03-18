// --- eslint ---
/* global describe before it chai */

"use strict";

// ------------------------- REQUIRE ----------------------
// common module to share global dep among all test files
var common = require("./common"); // eslint-disable-line no-unused-vars
var perf = require("../../perfLogger");

// to manage async tests in a loop with mocha
require('it-each')({
	testPerIteration: true
});

describe('Test of perfLogger enabled', function () {

	before(function () {
			perf.enable(true);
	});

	it('#Test of correct objectSummary in hook function, with 1 row', function (done) {

		const fHook = function(testDone, objectSummary) {
			chai.expect(objectSummary).to.exist.and.be.an('object').and.not.be.empty;
			chai.expect(objectSummary).to.contain.keys(['sTitle', 'dDateSummary', 'sVersionNode', 'aCPU', 'sArchitecture', 'sOSName', 'sRelease', 'iTotalMem', 'iNbSecsUptime']);
			chai.expect(objectSummary).to.have.property('dDateSummary').to.be.a('date');
			chai.expect(objectSummary).to.have.property('sVersionNode').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('aCPU').to.be.a('array').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sArchitecture').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sOSName').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sRelease').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('iTotalMem').to.be.a('number');
			chai.expect(objectSummary).to.have.property('iNbSecsUptime').to.be.a('number');
			chai.expect(objectSummary.aRows).to.be.an('array').and.not.be.empty;
			chai.expect(objectSummary.aRows.length).to.equal(1);

			testDone();
		};

		const fHookBound = fHook.bind(this, done);

		perf.setHookFunction(fHookBound);

		perf.start("test");

		const fPerfEnd = function(myPerf) {
			myPerf.end("test");
			myPerf.summary();
		};

		// nb : default mocha timeout is 2000
		setTimeout(fPerfEnd, 10, perf);


	});

	it('#Test of correct objectSummary without rows', function (done) {

		const fHook = function(testDone, objectSummary) {
			chai.expect(objectSummary).to.exist.and.be.an('object').and.not.be.empty;
			chai.expect(objectSummary).to.contain.keys(['sTitle', 'dDateSummary', 'sVersionNode', 'aCPU', 'sArchitecture', 'sOSName', 'sRelease', 'iTotalMem', 'iNbSecsUptime']);
			chai.expect(objectSummary).to.have.property('dDateSummary').to.be.a('date');
			chai.expect(objectSummary).to.have.property('sVersionNode').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('aCPU').to.be.a('array').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sArchitecture').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sOSName').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sRelease').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('iTotalMem').to.be.a('number');
			chai.expect(objectSummary).to.have.property('iNbSecsUptime').to.be.a('number');
			chai.expect(objectSummary.aRows).to.be.an('array').and.be.empty;

			testDone();
		};

		const fHookBound = fHook.bind(this, done);

		perf.setHookFunction(fHookBound);

		perf.start("test");

		const fPerfEnd = function(myPerf) {
			// WE DON'T END TAG IN PURPOSE, TO HAVE NO ROWS in objectSummary
			//myPerf.end("test");
			myPerf.summary();
		};

		// nb : default mocha timeout is 2000
		setTimeout(fPerfEnd, 10, perf);

	});

		it('#Test of summary() with hook function passed in options object', function (done) {

		const fHook = function(testDone, objectSummary) {
			chai.expect(objectSummary).to.exist.and.be.an('object').and.not.be.empty;
			chai.expect(objectSummary).to.contain.keys(['sTitle', 'dDateSummary', 'sVersionNode', 'aCPU', 'sArchitecture', 'sOSName', 'sRelease', 'iTotalMem', 'iNbSecsUptime']);
			chai.expect(objectSummary).to.have.property('dDateSummary').to.be.a('date');
			chai.expect(objectSummary).to.have.property('sVersionNode').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('aCPU').to.be.a('array').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sArchitecture').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sOSName').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('sRelease').to.be.a('string').and.not.be.empty;
			chai.expect(objectSummary).to.have.property('iTotalMem').to.be.a('number');
			chai.expect(objectSummary).to.have.property('iNbSecsUptime').to.be.a('number');
			chai.expect(objectSummary.aRows).to.be.an('array').and.not.be.empty;
			chai.expect(objectSummary.aRows.length).to.equal(1);

			testDone();
		};

		const fHookBound = fHook.bind(this, done);

		perf.start("test");

		const fPerfEnd = function(myPerf) {
			// WE DON'T END TAG IN PURPOSE, TO HAVE NO ROWS in objectSummary
			myPerf.end("test");
			myPerf.summary({fCallback: fHookBound});
		};

		// nb : default mocha timeout is 2000
		setTimeout(fPerfEnd, 10, perf);

	});


});