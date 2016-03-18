perf-logger.js
================

Performance measurement tool for nodejs.

# Objectives

perf-logger helps you to measure execution time of a piece of code (eg a function), by calling perf.start() and perf.end().

Of course, you could also do it easyly with the native nodejs function process.hrtime(), but perf-logger adds some usefull features, and gives you a nice summary of all the execution times, with statistics.


# Requirements

perf-logger uses some ES6 syntax : especially const and let keywords (and so is in strict mode).

Thus to be able to run this module, you need node version 0.12 with --harmony flag, or io.js/nodejs version greater then 1.0

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
	_bDisplaySummaryWhenHook: true
});
```

You can also use individual setters :

```js
setPrintStartAndEnd(true)
setHookFunction(myHookCallback)
```


## Start measurement

The start() method allow to start the perf measurement.

start() must be passed a string, that will be the id of the perf measurement.
This string will also be displayed in the summary, so choose an explicit name, eg the name of the function you want to measure the performance

```js
perf = require('perf-logger');
perf.enable(true);

perf.start("functionFoo");
```


## End measurement

The end() method allow to start the perf measurement.

end() must be passed a string, that is the id of the perf measurement.

```js
perf.end("functionFoo");
```

## Multiple calls

Of course, the same piece of code is likely to run several times, and so perf.start("myCode") and perf.end("myCode") will be called with for the same id.
In this case, in the final summary, you will get statistics about every measure (see below).

## Get a summary

The method summary() gives you the list of the perf measurements performed, with, for every measure :
- the total time
- the minimum time
- the maximum time
- the nb of calls to the function measured
- the average time

summary() accepts an options object as unique argument.

This object can have the following properties :
bReset, sOrderAttribute, sOrderSens, sTitle, fCallback

### In the console

The most simple way to know the results of the perf measurements is to call perf.summary() and see the print in the console.

```js
perf.summary()
```

### In an object, with a hook function

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

#### by directly passing the function in the options object to summary()

In the options object passed to summary(), you can define the hook function like this with the fCallback property :


```js
perf.summary({fCallback : fMyHookFunction})

```

Henceforth, when summary() is called, the callback is called and passed an object with all the information about the perf measurement.

The 'objectSummary' as the following properties :

sTitle {string}

dDateSummary {date}

sVersionNode {string} // content of process.versions.node; // ex : '5.8.0'

sVersionV8 {string}  // content of  process.versions.v8; // ex : '4.1.0.14'

aCPU = os.cpus();

sArchitecture {string} // content of  os.arch();

sPlatform {string}  // content of  os.platform(); // ex : 'win32'

sOSName {string}  // content of os.type(); // ex : 'Windows_NT'

sRelease {string}  // content of os.release(); // Returns the operating system release.

iTotalMem {number} //  os.totalmem();

iNbSecsUptime {number} // os.uptime();

aRows {array}

aRows contents one line by measurement performed with the start() and end() functions.


## Alternatives modules

Here I give some modules I look into before developed my own.
Perhaps they will suits better your needs :

[perfCollector](https://www.npmjs.com/package/perfcollector.js)


Licence
-------

(c) 2016, Arnaud Benhamdine

