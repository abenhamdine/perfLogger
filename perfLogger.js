"use strict";

const Ttytable = require('tty-table');
const chai = require('chai');
const moment = require('moment');
const _ = require('lodash');
const os = require('os');

const myPerfLogger = {
	_tests: {}, // to save tests
	_testsSummary: [], //  to save totals nb and duration
	_isEnabled: false,
	_printStartAndEnd: false,
	_levels: [],
	_LEVEL_TAG_ALL: "***ALL***",
	_fSummaryHookFunction: null, // callback to pass the summary object in summary()
	_bDisplaySummaryWhenHook: false, // by default, we don't display summary in console if a hook function is defined

	enable: function(b) {

		if (_.isUndefined(b)) {
			b = false;
		}

		chai.expect(b).to.exist.and.be.a('boolean');

		this._isEnabled = b;
	},

	setConfig: function(config) {
		chai.expect(config).to.exist.and.be.a('object').and.not.be.empty;

		if (config._printStartAndEnd) {
			this.setPrintStartAndEnd(config._printStartAndEnd);
		}

		if (config._fSummaryHookFunction) {
			this.setHookFunction(config._fSummaryHookFunction);
		}

		if (config._isEnabled) {
			this.enable(config._isEnabled);
		}

		if (!_.isUndefined(config._bDisplaySummaryWhenHook) && !_.isNull(config._bDisplaySummaryWhenHook)) {
			chai.expect(config._bDisplaySummaryWhenHook).to.be.a('boolean');
			this._bDisplaySummaryWhenHook = config._bDisplaySummaryWhenHook;
		}


	},

	setPrintStartAndEnd: function(b) {
		if (_.isUndefined(b)) {
			b = false;
		}

		chai.expect(b).to.exist.and.be.a('boolean');
		this._printStartAndEnd = b;
	},

	start: function(sTag) {

		chai.expect(sTag, "sTag devrait être une chaine non vide").to.exist.and.be.a('string').and.not.be.empty;

		if (!this._isEnabled) {
			return;
		}

		const newTest = {};
		//newTest.timeStart = _.now();
		newTest.timeStart = process.hrtime();

		newTest.sName = sTag;

		if (_.isUndefined(this._tests[sTag])) {
			this._tests[sTag] = newTest;
		}

		const indexSum = _.findIndex(this._testsSummary, {
			sName: sTag
		});

		if (-1 === indexSum) {

			const indexLevel = _.findIndex(this._levels, {
				sName: sTag
			});

			let iLevel = 0;

			if (-1 === indexLevel) {
				const indexLevelAll = _.findIndex(this._levels, {
					sName: this._LEVEL_TAG_ALL
				});

				if (-1 === indexLevelAll) {
					iLevel = 10; // 10 ms default if no level defined
				} else {
					iLevel = this._levels[indexLevelAll].iLevel;
				}
			} else {
				iLevel = this._levels[indexLevel].iDuration;
			}

			const newTestSummary = {
				iNb: 1,
				sName: sTag,
				iDuration: 0,
				iMinDuration: null,
				iMaxDuration: null,
				iLevel: iLevel,
				iNbAboveLevel: 0,
				ended : false
			};
			this._testsSummary.push(newTestSummary);

		} else {
			this._testsSummary[indexSum].iNb++;
		}

		if (this._printStartAndEnd) {

			const sText = "Start %s";

			console.log(sText, sTag);
		}

	},

	abort: function(sTag) {

		if (!this._isEnabled) {
			return;
		}

		if (!_.isUndefined(this._tests[sTag])) {
			delete this._tests[sTag];
		}

	},

	end: function(sTag) {

		chai.expect(sTag, "sTag devrait être une chaine non vide").to.exist.and.be.a('string').and.not.be.empty;

		if (!this._isEnabled) {
			return;
		}

		if (_.isUndefined(this._tests[sTag])) {
			console.error("Fail to end perf measurement of [" + sTag + "] : tag never started.");
			return false;
		}

		// process.hrtime() returns the current high-resolution real time in a [seconds, nanoseconds] tuple Array
		const hrDiff = process.hrtime(this._tests[sTag].timeStart);
		// we convert hrDiff in ms
		// the first element of Array is time in secondes
		// the second time tuple Array element is a number of nanoseconds and
		// it has to be divided by 1,000,000 in order to get time in milliseconds.
		const iDiff = Math.round(hrDiff[0] * 1000) + Math.round(hrDiff[1] / 1000000);
		//console.log("contenu de iDiff :");
		//console.log(iDiff);

		delete this._tests[sTag];

		const indexSum = _.findIndex(this._testsSummary, {
			sName: sTag
		});
		chai.expect(indexSum, "indexSum devrait être > -1").to.be.a('number').and.above(-1);

		this._testsSummary[indexSum].iDuration += iDiff;

		// update min and max of duration
		if ((iDiff <= this._testsSummary[indexSum].iMinDuration) || _.isNull(this._testsSummary[indexSum].iMinDuration)) {
			this._testsSummary[indexSum].iMinDuration = iDiff;
		}

		if (iDiff >= this._testsSummary[indexSum].iMaxDuration || _.isNull(this._testsSummary[indexSum].iMaxDuration)) {
			this._testsSummary[indexSum].iMaxDuration = iDiff;
		}

		if (iDiff > this._testsSummary[indexSum].iLevel) {
			this._testsSummary[indexSum].iNbAboveLevel++;
		}

		// mark the tag ended, in order to check the unended ones
		this._testsSummary[indexSum].ended = true;

		let sDuration = "";

		if (this._printStartAndEnd) {

			const sLogText = "\n%s executed in : %s";

			sDuration = this.humanizeSeconds(iDiff);

			return console.log(sLogText, sTag, sDuration);
		}

	},

	/**
	 * [summary Provides a summary of all the perf measurements]
	 * @param  {Boolean} bReset          	[description]
	 * @param  {string}  sOrderAttribute 	[description]
	 * @param  {string}  sOrderSens     	[description]
	 * @param  {string}  sTitle      		[description]
	 * @param  {function}  fCallback      	[description]
	 */
	summary: function(options) {

		if (_.isUndefined(options) || _.isNull(options)) {
			options = {
				bReset : false,
				sOrderAttribute: 'iDuration',
				sOrderSens: 'desc',
				sTitle : "",
				fCallback: null
			};
		}

		chai.expect(options).to.exist.and.be.a('object').and.not.be.empty;

		if (_.isEmpty(options.bReset)) {
			options.bReset = true;
		}
		if (_.isEmpty(options.sOrderAttribute)) {
			options.sOrderAttribute = 'iDuration';
		}
		if (_.isEmpty(options.sOrderSens)) {
			options.sOrderSens = 'desc';
		}
		if (_.isNull(options.sTitle) || _.isUndefined(options.sTitle)) {
			options.sTitle = "";
		}

		// object summary to pass the hook function
		const objectSummary = {};
		objectSummary.sTitle = options.sTitle;
		objectSummary.dDateSummary = new Date();
		objectSummary.sVersionNode = process.versions.node; // ex : '5.8.0'
		objectSummary.sVersionV8 = process.versions.v8; // ex : '4.1.0.14'
		objectSummary.aCPU = os.cpus();
		objectSummary.sArchitecture = os.arch();
		objectSummary.sPlatform = os.platform(); // ex : 'win32'
		objectSummary.sOSName = os.type(); // ex : 'Windows_NT'
		objectSummary.sRelease = os.release(); // Returns the operating system release.
		objectSummary.iTotalMem = os.totalmem();
		objectSummary.iNbSecsUptime = os.uptime();
		objectSummary.aRows = [];

		if (options.sTitle !== "") {
			options.sTitle = "of " + options.sTitle + " ";
		}

		if (_.isUndefined(options.fCallback) || _.isNull(options.fCallback)) {
			if (!_.isNull(this._fSummaryHookFunction) && !_.isUndefined(this._fSummaryHookFunction) && _.isFunction(this._fSummaryHookFunction)) {
				options.fCallback = this._fSummaryHookFunction;
			}
		} else {
			chai.expect(options.fCallback).to.be.a('function');
		}

		chai.expect(options.sOrderAttribute, "sOrderAttribute devrait être une chaine définie").to.exist.and.be.a('string');
		chai.expect(options.sOrderSens, "sOrderSens devrait être une chaine définie").to.exist.and.be.a('string');
		chai.expect(options.sTitle, "sTitle devrait être une chaine définie").to.exist.and.be.a('string');

		if (this._isEnabled) {

			if (this._testsSummary.length === 0) {
				console.log("perf.summary() : no test stored.");
			}

			let sDuration = "";
			let sAvgDuration = "";

			// header config for ttytable
			const header = [{
				value: "Tag",
				headerColor: "grey",
				color: "white",
				align: "left",
				paddingLeft: 1,
				width: 40
			}, {
				value: "Nb",
				headerColor: "grey",
				color: "white",
				align: "center",
				paddingLeft: 1,
				width: 10
			}, {
				value: "Total time (s)",
				headerColor: "grey",
				color: "white",
				align: "center",
				paddingLeft: 1,
				width: 12
			}, {
				value: "Min (s)",
				headerColor: "grey",
				color: "white",
				align: "center",
				paddingLeft: 1,
				width: 10
			}, {
				value: "Max (s)",
				headerColor: "grey",
				color: "white",
				align: "center",
				paddingLeft: 1,
				width: 10
			}, {
				value: "Avg (s)",
				headerColor: "grey",
				color: "white",
				align: "center",
				paddingLeft: 1,
				width: 10
			}, {
				value: "Crit. level (s)",
				headerColor: "grey",
				color: "white",
				align: "center",
				paddingLeft: 1,
				width: 10
			}, {
				value: "Level status",
				headerColor: "grey",
				color: "red",
				align: "center",
				paddingLeft: 1,
				width: 10
			}, {
				value: "% above level",
				headerColor: "grey",
				color: "white",
				align: "center",
				paddingLeft: 1,
				width: 10
			}];
			let aRows = [];

			let aSortedTests = _.orderBy(this._testsSummary, [options.sOrderAttribute], [options.sOrderSens]);
			let sErrors = "";

			for (let i = 0; i < aSortedTests.length; i++) {

				if (aSortedTests[i].ended === false) {
					sErrors += "\nTag ["+aSortedTests[i].sName+"] never ended : perf measurement skipped for this tag.\n";
					continue;
				}

				sDuration = "";
				sAvgDuration = "";

				const iDuration = aSortedTests[i].iDuration;

				sDuration = this.humanizeSeconds(iDuration);

				let iAvgDuration = 0;

				if (aSortedTests[i].iNb > 1) {
					iAvgDuration = Math.round(aSortedTests[i].iDuration / aSortedTests[i].iNb);
					sAvgDuration = this.humanizeSeconds(iAvgDuration);
				} else {
					sAvgDuration = "";
				}

				let sAboveLevel = "";
				if (aSortedTests[i].iNbAboveLevel > 0) {
					sAboveLevel = Math.round((aSortedTests[i].iNbAboveLevel) / aSortedTests[i].iNb * 100) + "%";
				} else {
					sAboveLevel = "";
				}

				let sCriticity = "";

				if (iAvgDuration > aSortedTests[i].iLevel) {
					sCriticity = "!";
				} else {
					sCriticity = "";
				}

				const aRow = [aSortedTests[i].sName, aSortedTests[i].iNb, sDuration, this.humanizeSeconds(aSortedTests[i].iMinDuration), this.humanizeSeconds(aSortedTests[i].iMaxDuration), sAvgDuration, this.humanizeSeconds(aSortedTests[i].iLevel), sCriticity, sAboveLevel];
				aRows.push(aRow);

			} // END loop for ... on aSortedTest[]

			let bHookDefined = false;

			if (_.isFunction(options.fCallback) && !_.isNull(options.fCallback) && !_.isUndefined(options.fCallback)) {
				bHookDefined = true;
			}

			if (!bHookDefined || (bHookDefined && this._bDisplaySummaryWhenHook)) {
				console.log("  -------------------------------------------------------------------" + _.repeat("-", options.sTitle.length));
				console.log("                 Performance summary " + options.sTitle + moment().format('DD-MM-YYYY HH:mm'));
				console.log("  -------------------------------------------------------------------" + _.repeat("-", options.sTitle.length));
				const table = Ttytable(header, aRows, {
					borderStyle: 1,
					paddingBottom: 0,
					headerAlign: "center",
					align: "center",
					color: "white"
				});
				console.log(table.render());
				if (sErrors !== "") {
					console.log(" -------- Errors --------");
					console.log(sErrors);
				}
			}

			if (bHookDefined) {
				objectSummary.aRows = _.filter(this._testsSummary, {ended:true});
				options.fCallback(objectSummary);
			}

			if (options.bReset) {
				aSortedTests = [];
				aRows = [];
				this._tests = {};
				this._testsSummary = [];
			}

			return;

		}

	},

	humanizeSeconds: function(iDuration) {

		let s = "";
		//sDuration = moment.duration(iAvgDuration).minutes() + " mn ";
		s = moment.duration(iDuration).seconds() + ".";
		s += _.padStart(moment.duration(iDuration).milliseconds(), 3, '0');

		return s;
	},

	setHookFunction: function(f) {

		chai.expect(f).to.exist.and.be.a('function');

		this._fSummaryHookFunction = f;

	},

	setLevel: function(sTag, iMs) {

		chai.expect(sTag, "sTag should be a defined string").to.exist.and.be.a('string');
		chai.expect(iMs, "iMs should be a non empty number").to.exist.and.be.a('number').and.not.be.empty;

		if (_.isEmpty(sTag)) {
			sTag = this._LEVEL_TAG_ALL;
		}

		const newLevel = {
			sName: sTag,
			iDuration: iMs
		};

		this._levels.push(newLevel);

	}

};

module.exports = myPerfLogger;