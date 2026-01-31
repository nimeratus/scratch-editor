const VideoState = require('../../extension-support/video-state');

/**
 * Class for toggling video device while keeping its state
 * in sync with the Stage's related properties
 * @param {Runtime} runtime - the runtime whose video input will be toggled
 * @class
 */
class VideoToggler {
    constructor (runtime) {
        /**
         * The runtime whose video input will be toggled.
         * @type {Runtime}
         */
        this.runtime = runtime;

        if (this.runtime.ioDevices) {
            // Configure the video device with values from globally stored locations.
            this.runtime.on(Runtime.PROJECT_LOADED, this.updateVideoDisplay.bind(this));
        }
    }

    /**
     * The transparency setting of the video preview stored in a value
     * accessible by any object connected to the virtual machine.
     * @type {number}
     */
    get globalVideoTransparency () {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            return stage.videoTransparency;
        }
        return 50;
    }

    set globalVideoTransparency (transparency) {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            stage.videoTransparency = transparency;
        }
    }
    
    /**
     * The video state of the video preview stored in a value accessible by any
     * object connected to the virtual machine.
     * @type {VideoState}
     */
    get globalVideoState () {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            return stage.videoState;
        }
        // Though the default value for the stage is normally 'on', we need to default
        // to 'off' here to prevent the video device from briefly activating
        // while waiting for stage targets to be installed that say it should be off
        return VideoState.OFF;
    }

    set globalVideoState (state) {
        const stage = this.runtime.getTargetForStage();
        if (stage) {
            stage.videoState = state;
        }
    }
    
    /**
     * Get the latest values for video transparency and state,
     * and set the video device to use them.
     */
    updateVideoDisplay () {
        this.setVideoTransparency(this.globalVideoTransparency);
        this.videoToggle(this.globalVideoState);
    }
    
    /**
     * Turns video on/off if a project is loaded
     * @param {VideoState} state - the video state to set the device to
     * @returns {Promise<void|Video>}
     */
    videoToggle (state) {
        this.globalVideoState = state;
        if (state === VideoState.OFF) {
            this.runtime.ioDevices.video.disableVideo();
            return Promise.resolve();
        } else {
            let promise = this.runtime.ioDevices.video.enableVideo();
            // Mirror if state is ON. Do not mirror if state is ON_FLIPPED.
            this.runtime.ioDevices.video.mirror = state === VideoState.ON;
            return promise;
        }
    }

    /**
     * Sets video preview transparency if a project is loaded
     * @param {number} transparency - the transparency to set the video preview to
     */
    setVideoTransparency (transparency) {
        this.globalVideoTransparency = transparency;
        this.runtime.ioDevices.video.setPreviewGhost(transparency);
    }
}

module.exports = VideoToggler;
