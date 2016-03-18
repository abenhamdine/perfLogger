module.exports = {
    env: {
        node: true
    },
    globals: {
    },
    parserOptions: {
        ecmaVersion: 6
    },
    // voir https://gist.github.com/nkbt/9efd4facb391edbf8048 pour un bon exemple
    rules: {

        // *** possible errors ***
        "no-cond-assign": 2, // disallow assignment in conditional expressions
        "no-constant-condition": 2, // disallow use of constant expressions in conditions
        "no-dupe-args": 2,
        "no-dupe-keys": 2,
        "no-debugger": 2,
        "no-unexpected-multiline": 2,
        "no-invalid-regexp": 2, // disallow invalid regular expression strings in the RegExp constructor
        "no-irregular-whitespace": 2, // disallow irregular whitespace outside of strings and comments
        "no-ex-assign": 2, //  disallow assigning to the exception in a catch block (recommended)
        "no-extra-boolean-cast": 2, // disallow double-negation boolean casts in a boolean context
        //"no-extra-parens": 2, // disallow unnecessary parentheses
        "no-extra-semi": 2, // disallow unnecessary semicolons
        "no-sparse-arrays": 2, // disallow sparse arrays
        "no-unreachable": 2, // disallow unreachable statements after a return, throw, continue, or break statement
        "no-loop-func": 2,
        "no-redeclare": 2,
        "no-empty": 2,
        //désactivé car provoque une erreur dans ST3
        //"no-labels": [2, {allowLoop: false, allowSwitch: false}],
        "no-sequences": 2,
        "no-with": 2,
        "no-duplicate-case": 2,
        "use-isnan": 2, // disallow comparisons with the value NaN
        "no-case-declarations" : 2, // Disallow lexical declarations in case/default clauses
        "array-callback-return" : 2, // Enforces return statements in callbacks of array's methods
        // ne semble pas fonctionner car détecte des erreurs dans .eslintrc alors que pas de fonctions !
        //"no-empty-function" : 2, // Disallow empty functions
        "no-new-symbol" : 2, // Disallow Symbol Constructor
        "no-self-assign" : 2,
        "no-unmodified-loop-condition" : 2,
        "no-unused-labels" : 2,
        "no-whitespace-before-property" : 2,

        // *** BEST PRACTICES ***
        eqeqeq: 2,
        curly: 2,
        quotes: 0,
        "padded-blocks": 0,
        "no-trailing-spaces": 2,
        semi: [2, "always"],
        strict: [2, "global"],

        // *** VARIABLES RULES ***
        "init-declarations": [2, "always"],
        "one-var": [2, "never"],
        "no-catch-shadow": 2, // disallow the catch clause parameter name being the same as a variable in the outer scope (off by default in the node environment)
        "no-delete-var": 2, // disallow deletion of variables
        "no-label-var": 2, // disallow labels that share a name with a variable
        "no-shadow": 2, // disallow declaration of variables already declared in the outer scope
        "no-shadow-restricted-names": 2, // disallow shadowing of names such as arguments
        "no-undef": 2, // disallow use of undeclared variables unless mentioned in a /*global */ block
        "no-undef-init": 2, // disallow use of undefined when initializing variables
        "no-undefined": 2, // disallow use of undefined variable (off by default)
        "no-unused-vars": 2, // disallow declaration of variables that are not used in the code
        "no-use-before-define": [2, "nofunc"], // disallow use of variables before they are defined

        // *** style issues ***
        "no-multi-spaces": 2,
        "comma-spacing": [1, {
            before: false,
            after: true
        }], // enforce spacing before and after comma
        "quote-props": [2, "as-needed"], //  require quotes around object literal property names, only if needed
        //"camelcase": 2,
        "max-params": [2, 6],
        "keyword-spacing": [2, {before: true, after: true, overrides: {}}],

        // *** nodejs rules ***
        "callback-return": [2, ["callback", "cb", "next", "cbNextTask", "finalCallback"]],
        "global-require": 2,
        "no-new-require" :2,
        "no-path-concat":2,

        // es6
        "no-const-assign": 2,
        "prefer-const" : 2,
        //"no-var" : 2,
        "no-dupe-class-members": 2
    }
};