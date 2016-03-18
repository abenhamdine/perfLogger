perfLogger.js
================

Performance measurement tool for nodejs.

# Requirements

perLogger uses some ES6 syntax : especially const and let keywords (and so is in strict mode).

Thus to be able to run this module, you need node version 0.12 with --harmony flag, or io.js/nodejs version greater then 1.0

## Config

To enable the perf logger :

```js
perf.enable(true);
```

To set several config properties once :

```js
perf.setConfig({
	_fSummaryHookFunction: savePerfMeasure,
	_isEnabled: true,
	_bDisplaySummaryWhenHook: true
});
```


## Start measurement


## End measurement


## Get a summary


### In the console


### In an object, with a hook function


## Alternatives modules

[perfCollector](https://www.npmjs.com/package/perfcollector.js)

Licence
-------

(c) 2016, Arnaud Benhamdine

