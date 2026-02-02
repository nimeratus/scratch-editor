const Timer = require('../util/timer');

class MouseWheel {
    constructor (runtime) {
        /**
         * Reference to the owning Runtime.
         * @type{!Runtime}
         */
        this.runtime = runtime;

        /**
         * Amount of scrolling since the last hat block was triggered
         * @type{number}
         */
        this.scrollBuildup = 0;

        /**
         * Measures time since last scroll event received
         * @type{Timer}
         */
        this.timer = new Timer({
            now: () => this.runtime.currentMSecs
        });
        this.timer.start();
    }

    /**
     * How much scrolling triggers the hat block (pixels)
     */
    static get SCROLL_TRESHOLD () {
        return 50;
    }

    /**
     * After how much time without scroll events should
     * the next event trigger a hat block instantly
     */
    static get SCROLL_TIMEOUT () {
        return 1000;
    }

    /**
     * Mouse wheel DOM event handler.
     * @param  {object} data Data from DOM event.
     */
    postData (data) {
        const timeSinceLastEvent = this.timer.timeElapsed();
        this.timer.start();
        
        this.scrollBuildup += data.deltaY;
        
        const matchFields = {};
        if (data.deltaY < 0) {
            matchFields.KEY_OPTION = 'up arrow';
        } else if (data.deltaY > 0) {
            matchFields.KEY_OPTION = 'down arrow';
        } else {
            return;
        }

        if(Math.abs(this.scrollBuildup) > MouseWheel.SCROLL_TRESHOLD || timeSinceLastEvent > this.SCROLL_TIMEOUT) {
            this.scrollBuildup = 0;
            this.runtime.startHats('event_whenkeypressed', matchFields);
        }
    }
}

module.exports = MouseWheel;
