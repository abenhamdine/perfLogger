
import Ttytable from 'tty-table'
import * as  moment from 'moment'
import * as os from 'os'
import * as _ from 'lodash'

const self = {
	_tests: {}, // to save tests
	_testsSummary: [], //  to save totals nb and duration
	_isEnabled: false,
	_printStartAndEnd: false,
	_levels: [],
	_LEVEL_TAG_ALL: "***ALL***",
	_fSummaryHookFunction: null, // callback to pass the summary object in summary()
	_bDisplaySummaryWhenHook: false, // by default, we don't display summary in console if a hook function is defined
	_iDefaultCriticityTime: 10, // default criticity level time : 10ms

	enable: function (b: boolean) {
		self._isEnabled = b ?? false
	},
	setConfig: function (config) {

		if (config._printStartAndEnd && !_.isNull(config._printStartAndEnd)) {
			self.setPrintStartAndEnd(config._printStartAndEnd)
		}

		if (config._fSummaryHookFunction) {
			self.setHookFunction(config._fSummaryHookFunction)
		}

		if (!_.isUndefined(config._isEnabled) && !_.isNull(config._isEnabled)) {
			self.enable(config._isEnabled)
		}

		if (!_.isUndefined(config._bDisplaySummaryWhenHook) && !_.isNull(config._bDisplaySummaryWhenHook)) {
			self.setDisplaySummaryWhenHook(config._bDisplaySummaryWhenHook);
		}

		if (config._iDefaultLevelMs) {
			self.setDefaultCriticityTime(config._iDefaultLevelMs);
		}

	},
	setPrintStartAndEnd: function (b: boolean | undefined | null) {
		self._printStartAndEnd = b ?? false
	},
	setDefaultCriticityTime: function (iMs: number) {
		self._iDefaultCriticityTime = iMs
	},
	setDisplaySummaryWhenHook: function (b: boolean) {
		self._bDisplaySummaryWhenHook = b
	},
	start: function (sTag: string, sParentTag: string) {

		if (!self._isEnabled) {
			return
		}

		const newTest = {};
		//newTest.timeStart = _.now();
		newTest.timeStart = process.hrtime();

		newTest.sName = sTag;

		self._tests[sTag] = newTest

		const indexSum = _.findIndex(self._testsSummary, {
			sName: sTag
		});

		if (-1 === indexSum) {

			const indexLevel = _.findIndex(self._levels, {
				sName: sTag
			});

			let iLevel = 0;

			if (-1 === indexLevel) {
				const indexLevelAll = _.findIndex(self._levels, {
					sName: self._LEVEL_TAG_ALL
				});

				if (-1 === indexLevelAll) {
					iLevel = 10; // 10 ms default if no level defined
				} else {
					iLevel = self._levels[indexLevelAll].iLevel;
				}
			} else {
				iLevel = self._levels[indexLevel].iDuration;
			}

			const newTestSummary = {
				iNb: 1,
				sName: sTag,
				iDuration: 0,
				iMinDuration: null,
				iMaxDuration: null,
				iLevel: iLevel,
				iNbAboveLevel: 0,
				ended: false,
				parent: sParentTag
			}
			self._testsSummary.push(newTestSummary)
		}

		if (self._printStartAndEnd) {
			const sText = "Start %s"
			console.log(sText, sTag)
		}
	},

	abort: function (sTag: string) {
		if (!self._isEnabled) {
			return
		}
		if (!_.isUndefined(self._tests[sTag])) {
			delete self._tests[sTag];
		}
		const indexSum = _.findIndex(self._testsSummary, {
			sName: sTag
		})
		if (indexSum !== -1) {
			self._testsSummary.splice(indexSum, 1)
		}
	},
	end: function (sTag: string) {
		chai.expect(sTag).to.exist.and.be.a('string').and.not.be.empty

		if (!self._isEnabled) {
			return
		}

		if (_.isUndefined(self._tests[sTag])) {
			console.error("Fail to end perf measurement of [" + sTag + "] : tag never started.");
			return false;
		}

		// process.hrtime() returns the current high-resolution real time in a [seconds, nanoseconds] tuple Array
		const hrDiff = process.hrtime(self._tests[sTag].timeStart);
		// we convert hrDiff in ms
		// the first element of Array is time in secondes
		// the second time tuple Array element is a number of nanoseconds and
		// it has to be divided by 1,000,000 in order to get time in milliseconds.
		const iDiff = Math.round(hrDiff[0] * 1000) + Math.round(hrDiff[1] / 1000000);

		delete self._tests[sTag];

		const indexSum = _.findIndex(self._testsSummary, {
			sName: sTag
		});
		chai.expect(indexSum).to.be.a('number').and.above(-1);

		self._testsSummary[indexSum].iDuration += iDiff;
		self._testsSummary[indexSum].iNb++;

		// update min and max of duration
		if ((iDiff <= self._testsSummary[indexSum].iMinDuration) || _.isNull(self._testsSummary[indexSum].iMinDuration)) {
			self._testsSummary[indexSum].iMinDuration = iDiff;
		}

		if (iDiff >= self._testsSummary[indexSum].iMaxDuration || _.isNull(self._testsSummary[indexSum].iMaxDuration)) {
			self._testsSummary[indexSum].iMaxDuration = iDiff;
		}

		if (iDiff > self._testsSummary[indexSum].iLevel) {
			self._testsSummary[indexSum].iNbAboveLevel++;
		}

		// mark the tag ended, in order to check the unended ones
		self._testsSummary[indexSum].ended = true;

		let sDuration = "";

		if (self._printStartAndEnd) {

			const sLogText = "\n%s executed in : %s";

			sDuration = self.humanizeSeconds(iDiff);

			return console.log(sLogText, sTag, sDuration);
		}
	},
	/**
	 * Provides a summary of all the perf measurements
	 * @param  {Boolean} bReset          	[description]
	 * @param  {string}  sOrderAttribute 	[description]
	 * @param  {string}  sOrderSens     	[description]
	 * @param  {string}  sTitle      		[description]
	 * @param  {function}  fCallback      	[description]
	 */
	summary: function (options) {

		if (_.isUndefined(options) || _.isNull(options)) {
			options = {
				bReset: false,
				sOrderAttribute: 'iDuration',
				sOrderSens: 'desc',
				sTitle: "",
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
			if (!_.isNull(self._fSummaryHookFunction) && !_.isUndefined(self._fSummaryHookFunction) && _.isFunction(self._fSummaryHookFunction)) {
				options.fCallback = self._fSummaryHookFunction;
			}
		}


		if (self._isEnabled) {

			if (self._testsSummary.length === 0) {
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
				value: "% of grand total",
				headerColor: "grey",
				color: "white",
				align: "center",
				paddingLeft: 1,
				width: 12
			}, {
				value: "% of parent",
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

			let aSortedTests = _.orderBy(self._testsSummary, [options.sOrderAttribute], [options.sOrderSens]);

			let sErrors = "";

			const totalDuration = aSortedTests.reduce((acc, test) => {
				// if the test has a parent, its duraction is included in its parent's one
				// so we don't add it to the total
				return acc + (test.parent ? 0 : test.iDuration);
			}, 0);

			for (const test of aSortedTests) {

				if (test.ended === false) {
					sErrors += "\nTag [" + test.sName + "] never ended : perf measurement skipped for this tag.\n";
					continue;
				}

				sDuration = "";
				sAvgDuration = "";

				const iDuration = test.iDuration;

				sDuration = self.humanizeSeconds(iDuration);

				let iAvgDuration = 0;

				iAvgDuration = Math.round(test.iDuration / test.iNb);
				sAvgDuration = self.humanizeSeconds(iAvgDuration);

				const iPercentOfTotal = Math.round((test.iDuration / totalDuration) * 100);
				const sPercentOfTotal = iPercentOfTotal + ' %';

				const parentTest = _.find(aSortedTests, { sName: test.parent });
				let sPercentOfParent = '';
				if (parentTest) {
					const iPercentOfParent = Math.round((test.iDuration / parentTest.iDuration) * 100);
					sPercentOfParent = iPercentOfParent + ' %';
				}
				let sAboveLevel = "";
				if (test.iNbAboveLevel > 0) {
					sAboveLevel = Math.round((test.iNbAboveLevel) / test.iNb * 100) + "%";
				} else {
					sAboveLevel = "";
				}

				let sCriticity = "";

				if (iAvgDuration > test.iLevel) {
					sCriticity = "!";
				} else {
					sCriticity = "";
				}

				test.row = [test.sName, test.iNb, sDuration, sPercentOfTotal, sPercentOfParent, self.humanizeSeconds(test.iMinDuration), self.humanizeSeconds(test.iMaxDuration), sAvgDuration, self.humanizeSeconds(test.iLevel), sCriticity, sAboveLevel];

			} // END loop for ... on aSortedTest[]

			// re-sort tests to represent tree hierarchy between tag/parent tag
			const finalTree = [];

			// we check if there's a parent tag, if it exists
			// if not, delete it
			for (const test of aSortedTests) {
				if (test.parent) {
					const i = _.findIndex(aSortedTests, { sName: test.parent });
					if (i === -1) {
						console.warn("Tag parent is unknown : " + test.parent);
						test.parent = null;
					}
				}
			}

			aSortedTests = self.processNames(aSortedTests);

			// console.log("*********************************************");
			// console.log("aSortedTests après processNames", aSortedTests);
			// console.log("*********************************************");

			// while not all tests haven't been pushed in the tree
			const unpushed = function (arr) {
				return arr.some((item) => {
					return !item.processed;
				});
			};

			while (unpushed(aSortedTests)) {
				for (const test of aSortedTests) {

					if (test.ended) {
						test.processed = true;
					}

					if (!test.parent) {
						finalTree.push(test);
						test.processed = true;
					} else {
						const i = _.findIndex(finalTree, { sName: test.parent });
						if (i !== -1) {
							finalTree.splice(i + 1, 0, test);
							test.processed = true;
						}
					}
				}
			}

			// console.log("*********************************************");
			// console.log("finalTree", finalTree);
			// console.log("*********************************************");

			let aRows = finalTree.reduce((arr, test) => {
				if (test.ended) {
					arr.push(test.row);
				}
				return arr;
			}, []);

			let bHookDefined = false;

			if (_.isFunction(options.fCallback) && !_.isNull(options.fCallback) && !_.isUndefined(options.fCallback)) {
				bHookDefined = true;
			}

			if (!bHookDefined || (bHookDefined && self._bDisplaySummaryWhenHook)) {
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
				objectSummary.aRows = _.filter(self._testsSummary, { ended: true });
				options.fCallback(objectSummary);
			}

			if (options.bReset) {
				aSortedTests = [];
				aRows = [];
				self._tests = {};
				self._testsSummary = [];
			}

			return;

		}

	},
	processNames: function (arrTests) {
		// while not all tests haven't been processed
		const unprocessed = function (arr) {
			return arr.some((item) => {
				return !item.renamed;
			});
		};
		const arrProcessed = [];

		while (unprocessed(arrTests)) {
			for (const test of arrTests) {

				if (test.renamed) {
					continue;
				}

				if (!test.parent) {
					test.renamed = true;
					test.rank = 0;
					arrProcessed.push(test);
					continue;
				}

				const parentTest = _.find(arrProcessed, { sName: test.parent });
				if (parentTest) {
					if (!parentTest.renamed) {
						continue;
					}
					test.rank = parentTest.rank + 1;
					if (!test.ended) {
						test.renamed = true;
						arrProcessed.push(test);
						continue;
					}
					// add 2 dots spaces to indent if the tag has a parent (spaces are removed by tty-table)
					test.row[0] = '..'.repeat(test.rank) + test.row[0];
					test.renamed = true;
					arrProcessed.push(test);

				}

			}
		}
		return arrTests
	},
	humanizeSeconds: function (iDuration) {
		let s = ""
		s = moment.duration(iDuration).seconds() + "."
		s += _.padStart(moment.duration(iDuration).milliseconds(), 3, '0')
		return s
	},
	setHookFunction: function (f) {
		self._fSummaryHookFunction = f
	},
	setLevel: function (sTag: string, iMs: number) {
		if (_.isEmpty(sTag)) {
			sTag = self._LEVEL_TAG_ALL;
		}
		const newLevel = {
			sName: sTag,
			iDuration: iMs
		}
		self._levels.push(newLevel)
	}
}

module.exports = self