import $ from "jquery";
import 'jquery-ui/ui/widgets/slider.js';

import './scss/player-styles.scss';
import './scss/loader.scss';
import './scss/slider.scss';

import Cookies from 'js-cookie';

import {initialize_customization} from './initialize_customization.js';

import player_markup from './html/player-ui.html';

import loader_icon from './img/loader.svg';
import play_icon from './img/play.svg';
import stop_icon from './img/stop.svg';


export class Triton_Livestream_Player {

  /**
   * Constructor - make a new player
   */
  constructor(player_id) {

    /**
     * @var {string} player_id - The ID of the player DOM element
     */
    this.player_id = player_id;

    /**
     * @constant {string} station - Triton station name (from the data-station attribute on the player container - see {@link td_container_id})
     */
    this.station = $('#' + player_id).data('station');

    // set up default properties
    this.init_properties();

    // set initial volume
    this.init_volume();

    // add/initialize markup/DOM elements
    this.init_elements();

    // set up the actual Triton stream using the SDK
    this.init_player();
  }



  /**
   * Initialize properties and constants with default values (call once in constructor)
   */
  init_properties() {

    /**
     * Represents player states
     * @constant {Object.<string, string>} STATUS
     */
    this.STATUS = Object.freeze({
      INIT: 'initializing',
      LOADING: 'loading',
      PLAYING: 'playing',
      STOPPED: 'stopped',
    });


    /**
     * Configure the class and content of the transport button for different player states (see {@link STATUS})
     * @var {Object.<string, Object}
     */
    this.button_states = {}
    this.button_states[this.STATUS.INIT] = {
      class: 'initializing',
      content: loader_icon + '<div class="status">Loading</div>'
    };
    this.button_states[this.STATUS.LOADING] = {
      class: 'loading',
      content: loader_icon + '<div class="status">Starting</div>'
    };
    this.button_states[this.STATUS.PLAYING] = {
      class: 'playing',
      content: stop_icon + '<div class="status">Stop</div>'
    };
    this.button_states[this.STATUS.STOPPED] = {
      class: 'stopped',
      content: play_icon + '<div class="status">Play</div>'
    };


    /**
     * @constant {Date} cookie_expiration - The date settings cookies should expire
     */
    this.cookie_expiration = new Date('December 31, 9999 01:01:00');
  }


  /**
   * Set the starting volume, using stored settings
   * if they're available from previous player usage
   */
  init_volume() {

    // use the stored volume value (if it exists) with a minimum of 15 (so the stream doesn't start silent);
    // otherwise default to a volume of 75
    this.volume_settings = Cookies.getJSON()['ktoo-stream-volumes'] ? Cookies.getJSON()['ktoo-stream-volumes'] : {};


    // set volume to 75% if there isn't previous volume data
    let starting_volume = 75;

    // if there are previous volume settings
    if (this.volume_settings) {

      // check if this station has it's own volume from earlier
      if (this.volume_settings[this.station] >= 0 && this.volume_settings[this.station] <= 100) {
        starting_volume = Math.max(15, this.volume_settings[this.station]);   // don't start lower than 15% so we're not streaming silence
      }
      // otherwise, use the default (i.e., last set volume for any station)
      else if (this.volume_settings['default']) {
        starting_volume = Math.max(15, this.volume_settings['default']);
      }
    }

    this.update_volume (starting_volume);



    this.conditional_volume(() => {

      $('#' + this.player_id + ' .volume-slider').slider({
        value: this.volume,
        slide: (event, ui) => {
          // set
          this.update_volume (ui.value);
        }
      });
    });
  }



  /**
   * Insert and set up the markup/DOM elements for the player
   */
  init_elements() {

    $('#' + this.player_id).wrapInner("<div class='player_contents'></div>");

    // Insert the markup for the player UI
    $('#' + this.player_id).prepend(player_markup);

    // Initialize customizations from the player container
    initialize_customization(this.player_id);

    // Only show volume controls if the device supports it
    this.conditional_volume(() => {
      $('#' + this.player_id + ' .volume-slider-container').show();
    });


    $('#' + this.player_id).addClass('td_player_container');


    /**
     * @constant {string} td_container_id - The element ID for the SDK player container element
     */
    this.td_container_id = 'td_container_' + Math.floor(Math.random() * 10000);
    $('#' + this.player_id + ' .td_container').attr('id', this.td_container_id);

    // The first state is the player initializing - this will be changed on the playerReady event
    this.set_player_state('initializing');
  }


  /**
   * Perform a callback only if the device supports volume control
   * (for example, many mobile devices restrict volume changes to the hardware buttons)
   *
   * @param {function} callback - Callback function to call if we can control device volume
   */
  conditional_volume(callback) {

    // set up a temporary Audio element
    let audioElement = new Audio();

    // the only viable way I've found to check if volume control is supported is with the volumechange event listener
    audioElement.addEventListener('volumechange', (event) => {

      // the volumechange event was triggered, so volume controls are supported
      if (callback) {
        callback();
      }
    });

    // this should trigger the the volumechange event if it's supported
    audioElement.volume = 0.76543;
  }


  /**
   * Update player volume state
   *
   * @param {int} new_volume - The volume (1-100) to set the state to
   */
   update_volume (new_volume) {
     this.volume = new_volume;

     // if the SDK player is set up, set it's volume to the new value
     if (this.player && typeof this.player.setVolume == 'function') {
       this.player.setVolume(new_volume / 100);
     }

     // if volume settings hasn't already been created, make it an empty object
     if (!this.volume_settings || typeof this.volume_settings != "object") {
       this.volume_settings = {};
     }

     // update the settings
     this.volume_settings[this.station] = new_volume;
     this.volume_settings['default'] = new_volume;

     // ... and store those settings to the cookie
     Cookies.set('ktoo-stream-volumes', this.volume_settings);
   }


   /**
    * Get the current volume of the player
    */
   get_volume () {
     return this.volume;
   }


  /**
   * Set up the player from the {@link https://userguides.tritondigital.com/spc/tdplay2/|Triton SDK}
   */
  init_player() {
    //Player SDK is ready to be used, this is where you can instantiate a new TDSdk instance
    var tdPlayerConfig = {
      coreModules: [{
        id: 'MediaPlayer',
        playerId: this.td_container_id,
        geoTargeting: false,
        techPriority: ['Html5', 'Flash'],
        audioAdaptive: true
      }],
      playerReady: () => { this.on_player_ready() },
      configurationError: () => { this.on_player_error() },
      moduleError: () => { this.on_player_error() },
    };

    /**
     * Triton player object from {@link https://userguides.tritondigital.com/spc/tdplay2/|Triton SDK}
     * @var {TDSdk}
     */
    this.player = new TDSdk(tdPlayerConfig);
  }


  /**
   * Update the state of the player
   *
   * @param {string} state - The new state (a property of {@link STATUS})
   */
  set_player_state(state) {

    // update the button markup and class
    $('#' + this.player_id + ' .transport-button').html(this.button_states[state].content);
    $('#' + this.player_id + ' .transport-button').attr('class', this.button_states[state].class + ' transport-button');

    /**
     * @var {string} player_state - Current state of the player (a value from {@link STATUS})
     */
    this.player_state = state;
  }


  /**
   * Callback to finish setup after the player is ready
   */
  on_player_ready() {
    this.set_player_state(this.STATUS.STOPPED);

    // call on_status_change() for any status change at all
    this.player.addEventListener('stream-status', (event) => {
      this.on_status_change(event)
    });

    // toggle what the player is doing (based on the current {@link player_state})
    $('#' + this.player_id + ' .transport-button').click(() => {
      switch (this.player_state) {
        case this.STATUS.STOPPED:
          this.player.setVolume(this.get_volume() / 100);
          this.player.play({ station: this.station });
          break;

        case this.STATUS.LOADING:
        case this.STATUS.PLAYING:
          this.player.stop();
      }
    });

    // if the device supports changing the volume...
    this.conditional_volume(() => {

      // initialize customizations again to pick up ones that apply to markup that isn't ready until the player is initialized
      initialize_customization(this.player_id);

      // show volume control
      $('#' + this.player_id + ' .volume-slider').show();

      // set volume
      this.player.setVolume(this.volume / 100);

      // double-check by setting volume UI to match player state
      $('#' + this.player_id + ' .volume-slider').slider({
        value: this.player.getVolume() * 100
      });
    });

  }



  /**
   * Callback for whenever the player state changes
   */
  on_status_change(event) {

    // code as defined in the Triton SDK
    let code = event.data.code;

    // update the transport button to reflect what the player is doing
    switch (code) {
      case 'LIVE_PAUSE':
      case 'LIVE_STOP':
        this.set_player_state('stopped');
        break;

      case 'LIVE_BUFFERING':
      case 'LIVE_CONNECTING':
      case 'LIVE_RECONNECTING':
      case 'GETTING_STATION_INFORMATION':
        this.set_player_state('loading');
        break;

      case 'LIVE_PLAYING':
        this.set_player_state('playing');
        break;

      case 'LIVE_FAILED':
      case 'STREAM_GEO_BLOCKED':
      case 'STATION_NOT_FOUND':
      case 'PLAY_NOT_ALLOWED':
    }
  }



  /**
   * Callback function to handle errors
   * @todo Show error messages and instructions to the end user in a useful way
   */
  on_player_error(e) {
    console.log(object);
    console.log(object.data.errors);
  }
}
