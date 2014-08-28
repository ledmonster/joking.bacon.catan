'use strict';

var _ = require('underscore');
var Bacon = require('baconjs').Bacon;

var RANGE = 36;

var PRODUCTIVITY = {
    2: 1/36,
    3: 2/36,
    4: 3/36,
    5: 4/36,
    6: 5/36,
    7: 6/36,
    8: 5/36,
    9: 4/36,
    10: 3/36,
    11: 2/36,
    12: 1/36
};

function rollDie() {
    return Math.ceil(Math.random() * 6);
}


function rollTwoDice() {
    return rollDie() + rollDie();
}


var diceStream = Bacon.fromPoll(100, function() {
    return new Bacon.Next(rollTwoDice());
});


var counterStream = diceStream.withStateMachine(0, function(sum, event) {
    if (event.hasValue()) {
        sum = sum + 1;
        return [sum, [new Bacon.Next(sum)]];
    }
});

var bufferedStream = diceStream.withStateMachine(new Array(), function(sum, event) {
    if (event.hasValue()) {
        sum.push(event.value());
        if (sum.length > RANGE) {
            sum.shift();
        }
        return [sum, [new Bacon.Next(sum)]];
    }
});


var productivityStream = bufferedStream.map(function (value) {
    var current = value[value.length - 1];
    var prod = PRODUCTIVITY[current];
    var num = value.filter(function (x) {return x == current;}).length;
    var rate = (num / RANGE) / prod;
    if (value.length < RANGE) {
        return [num, undefined];
    } else {
        return [num, rate];
    }
});


var productivityStateStream = productivityStream.map(function (value) {
    if (value[1] === undefined) {
        return "";
    }
    if (value[1] >= 3.0) {
        return "ｷﾀｧ━━━(　´∀｀)━━━━!!!";
    } else if (value[1] >= 2.0) {
        return "ｷﾀ(･∀･)ｺﾚ!!";
    } else if (value[1] > 0.5) {
        return "";
    } else {
        return "∑(￣Д￣；)なぬぅっ！！";
    }
});


exports._ = _;
exports.rollDie = rollDie;
exports.rollTwoDice = rollTwoDice;
exports.diceStream = diceStream;
exports.counterStream = counterStream;
exports.bufferedStream = bufferedStream;
exports.productivityStream = productivityStream;
exports.productivityStateStream = productivityStateStream;


function main() {
    Bacon.combineTemplate({
        'dice': diceStream,
        'counter': counterStream,
        'productivity': productivityStream,
        'state': productivityStateStream
    }).onValue(function(value) {
        console.log(value.counter + ": " + value.dice + " (" + value.productivity[0] + ") " + value.state);
    });
}

if (require.main === module) {
    main();
}
