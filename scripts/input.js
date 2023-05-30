// ------------------------------------------------------------------
//
// This is the input handler used to distribute inputs to the game objects
//
// ------------------------------------------------------------------
MySample.input = (function() {
    'use strict';

    function Keyboard() {
        let that = {
                keys : {},
                handlers : {}
            };
        
        function keyPress(e) {
            that.keys[e.key] = e.timeStamp;
        }
        
        function keyRelease(e) {
            delete that.keys[e.key];
        }

        // ------------------------------------------------------------------
        //
        // Allows the client code to register a keyboard handler
        //
        // ------------------------------------------------------------------
        that.registerCommand = function(key, handler) {
            that.handlers[key] = handler;
        };

        // ------------------------------------------------------------------
        //
        // Allows the client to invoke all the handlers for the registered key/handlers.
        //
        // ------------------------------------------------------------------
        that.update = function(elapsedTime) {
            for (let key in that.keys) {
                if (that.keys.hasOwnProperty(key)) {
                    if (that.handlers[key]) {
                        that.handlers[key](elapsedTime);
                    }
                }
            }
        };

        //
        // These are used to keep track of which keys are currently pressed
        window.addEventListener('keydown', keyPress);
        window.addEventListener('keyup', keyRelease);
        
        return that;
    }

    return {
        Keyboard : Keyboard
    };
}());
