var repl = require('repl');
const vm = require('vm');

var Spinner = require('cli-spinner').Spinner;

function myEval(cmd, context, filename, callback) {

    var result;

    try {
        result = vm.runInNewContext(cmd, context);

        // if (result instanceof context.Promise) { // not work :(
        if (
            typeof result == 'object' &&
            typeof result.then === 'function' &&
            typeof result.catch === 'function'
        ) {
            var spinner = new Spinner();

            spinner.setSpinnerString(18);

            spinner.start();

            result.then((data) => {
                spinner.stop(true);
                callback(null, data);
            }).catch((error) => {
                spinner.stop();
                callback(error);
            });

        } else {
            callback(null, result);
        }

    } catch (e) {
        if (isRecoverableError(e)) {
            return callback(new repl.Recoverable(e));
        } else {
            callback(e);
        }
    }
}

function isRecoverableError(error) {
    if (error.name === 'SyntaxError') {
        return /^(Unexpected end of input|Unexpected token)/.test(error.message);
    }
    return false;
}

repl.startExtra = function (options) {
    if (!options) {
        options = {};
    }

    options.eval = myEval;

    var replServer = repl.start(options);

    replServer.context.test = {
        Promise: function() {
            return new Promise((resolve) => {setTimeout(x => resolve('test'), 2000);});
        }
    };

    return replServer;
};

module.exports = repl;
