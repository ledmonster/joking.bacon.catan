#!/usr/bin/env node

'use strict';

var Catan = require('./catan');
var Bacon = require('baconjs').Bacon;
var expect = require('chai').expect;
var _ = Catan._;


describe('rollDie', function() {
    it ('should return 1 .. 6', function(){
        expect(_.range(1, 7)).to.include(Catan.rollDie());
    });
});

describe('rollTwoDice', function() {
    it ('should return 2 .. 36', function(){
        expect(_.range(2, 36)).to.include(Catan.rollTwoDice());
    });
});

describe('diceStream', function() {
    it ('should return dice event', function(done){
        // TODO: these events are not tested properly
        Catan.diceStream.take(1).subscribe(function(event) {
            if (! event.isEnd()) {
                expect(event.isNext()).to.be.true;
                expect(_.range(2, 36)).to.include(event.value());
                done();
            }
        });
    });

});
