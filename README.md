perf-logger.js
================

Performance measurement tool for nodejs.

[![Build Status](https://travis-ci.org/abenhamdine/perf-logger.svg?branch=master)](https://travis-ci.org/abenhamdine/perf-logger)
<span class="badge-npmversion"><a href="https://npmjs.org/package/perf-logger" title="View this project on NPM"><img src="https://img.shields.io/npm/v/perf-logger.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/perf-logger" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/perf-logger.svg" alt="NPM downloads" /></a></span>

# Objectives

perf-logger helps you to measure execution time of a piece of code (eg a function) in nodejs, by calling perf.start() and perf.end(), respectively at the begin and at the end of the code.

Of course, you could also do it easily with the native nodejs function process.hrtime(), but perf-logger adds some useful features, and gives you a nice summary of all the execution times, with statistics.

Exemple of summary in the console :
![image](https://cloud.githubusercontent.com/assets/7466144/13882603/6c8b2a74-ed26-11e5-9d7f-97791fe57f4b.png)


# Requirements

perf-logger uses some ES6 syntax : especially const and let keywords (and so is in strict mode).

Thus to be able to run this module, you need node version 0.12 with --harmony flag, or io.js/nodejs version greater then 1.0

# Installation

```bash
npm install perf-logger
```

```js
const perf = require('perf-logger');
```

# API

## Config

To enable the perf logger :

```js
perf.enable(true);
```

To set several config properties at once :

```js
perf.setConfig({
	_fSummaryHookFunction: savePerfMeasure,
	_isEnabled: true,
	_bDisplaySummaryWhenHook: true,
	_iDefaultCriticityTime : 20,
	_printStartAndEnd: true
});
```

You can also use individual setters :

```js
setPrintStartAndEnd(true);
setHookFunction(myHookCallback);
setDefaultCriticityTime(20);
```


## Start measurement

The start() method allow to start the perf measurement.

start() must be passed a string, that will be the id of the perf measurement (this id is named "tag" in the code and in the docs).
This tag will also be displayed in the summary, so choose an explicit name, eg the name of the function you want to measure the performance.

```js
perf = require('perf-logger');
perf.enable(true);

perf.start("functionFoo");
```


## End measurement

The end() method allow to end the perf measurement.

end() must be passed a string, that is the id of the perf measurement.

```js
perf.end("functionFoo");
```

## Abort a measurement

If you want to cancel a perf measurement, use the abort() function :

```js
perf.abort('functionFoo');
```

It's useful when you don't want to log the perf measurement, for example in case of error.


## Log start and end of the measurement

If you want to log every start and end measurement, set the following property on true :

```js
perf.setConfig({
	_printStartAndEnd: true
});
```

or

```js
perf.setPrintStartAndEnd(true);
```

So you will get some logging in the console :

```js
perf.start('functionFoo');
```

```bash
Start functionFoo;
```

```js
perf.end('functionFoo');
```

```bash
functionFoo
```




## Multiple calls

Of course, the same piece of code is likely to run several times, and so perf.start("myCode") and perf.end("myCode") will be called with for the same tag.
In this case, in the final summary, you will get statistics about every measure (see below).


## Get a summary

The method summary() gives you the list of the perf measurements performed, with, for every measure :
- the total time
- the minimum time
- the maximum time
- the nb of calls to the function measured

If the summary is displayed in the console, you will have the additional columns :
- the average time
- the criticity time set for the tag
- a red exclamation mark if this criticity time is exceeded
- the % of the executions that exceeded the criticity time


summary() accepts an options object as unique argument.

This object can have the following properties :
- bReset :
- sOrderAttribute :
- sOrderSens :
- sTitle :
- fCallback :

### Summary in the console

The most simple way to know the results of the perf measurements is to call perf.summary() and see the print in the console.

```js
perf.summary()
```

### Summary in an object, with a hook function

If you set a hook function, instead of display the results in the console, summary() will call the hook function and pass an object with the results.

You can define the hook function by two ways :

#### by configuring the perfLogger

```js
perf.setHookFunction(fMyHookFunction);
```

or

```js
perf.setConfig({
	_fSummaryHookFunction: fMyHookFunction
});
```

By default, if a hook function is defined, the summary will not be displayed in the console.
Indeed, we assume that if you want to get the summary passed to a function, you are likely to not want the display in the console.
However, if you also want to have the summary in the console, you can set the property _bDisplaySummaryWhenHook on true (default is false) :

```js
perf.setConfig({
	_bDisplaySummaryWhenHook: true
});
```

or

```js
perf.setDisplaySummaryWhenHook(true);
```

#### by directly passing the function in the options object to summary()

In the options object passed to summary(), you can define the hook function like this with the fCallback property :


```js
perf.summary({fCallback : fMyHookFunction})

```

Henceforth, when summary() is called, the callback is called and passed an object with all the information about the perf measurement.

The 'objectSummary' has the following properties :

- sTitle {string}			[Title of the summary passed in the options object to the function summary()]
- dDateSummary {date} 		[Date of the summary, it's a simple js date object.]
- sVersionNode {string} 	[content of nodejs process.versions.node; // ex : '5.8.0'
- sVersionV8 {string}  		[content of nodejs process.versions.v8; // ex : '4.1.0.14'
- aCPU {array} 				[Content of nodejs os.cpu()]
- sArchitecture {string}	[content of nodejs os.arch()]
- sPlatform {string}  		[content of nodejs os.platform() ex : 'win32']
- sOSName {string}  		[content of nodjes os.type() ex : 'Windows_NT']
- sRelease {string}  		[content of nodejs os.release() : returns the operating system release.]
- iTotalMem {number} 		[content of nodejs os.totalmem()]
- iNbSecsUptime {number}	[content of nodejs os.uptime()]
- aRows {array}				[array of row objects. See below.]

aRows contents one element by measurement performed with the start() and end() functions.

The aRows element contains the following properties :

- sName {String} 			["tag" of the code measured]
- iDuration {Number} 		[total execution time in ms]
- iMinDuration {Number} 	[minimum execution time in ms]
- iMaxDuration {Number} 	[maximum execution time in ms]
- iNb {Number} 				[number of times this tag is measured (id perf.start() and perf.end() are called for this tag)]
- iLevel {Number} 			[threshold beyond which a code is considered low (see "criticity level hereafter")]
- iNbAboveLevel {Number} 	[number of times the execution time for this tag exceed the criticity threshold]

## Set maximum execution times for tags

It's possible to set a maximum execution time :
- for all tags
- or for some specific tags.

This time is named the "criticity level".

In the summary, the number of times a code exceed the level is displayed in the last column.

By default, a criticity time of 10ms is set for all the tags.
The method setLevel() allows to set a specific criticity level for a given tag.

For example,
```js
perf.setLevel("myFastFunction", 10)
```
set the level at 10 ms.

If the average execution time of myFastFunction() is above 10ms, a red exclamation mark will be displayed in the summary.
The % of functions calls that exceed the level will be also diplayed (last column of the summary).

## Contributions

I would be glad to accept pull request.
However note that this module is dedicated to simple perf measurement, and not intented to have other features.

## Alternatives modules

Here I give some modules I look into before developed my own.
Perhaps they will suits better your needs :

[perfCollector](https://www.npmjs.com/package/perfcollector.js)


Licence
-------

(c) 2016, Arnaud Benhamdine

