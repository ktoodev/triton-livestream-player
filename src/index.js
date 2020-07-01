import './scss/player-styles.scss';
import './scss/loader.scss';


import $ from "jquery";
import 'jquery-ui/ui/widgets/slider.js';

import {initialize_customization} from './initialize_customization.js';

import player_markup from './html/player-ui.html';

import loader_icon from './img/loader.svg';
import play_icon from './img/play.svg';
import stop_icon from './img/stop.svg';


/**
 * Represents player states
 * @constant {Object.<string, string>} STATUS
 */
const STATUS = Object.freeze({
  INIT:'initializing',
  LOADING:'loading',
  PLAYING:'playing',
  STOPPED:'stopped',
});

/**
 * @constant {string} container_id - The element ID for the player container
 */
const container_id = 'td_container';


$( document ).ready(function() {

/**
 * Configure the class and content of the transport button for different player states (see {@link STATUS})
 * @var {Object.<string, Object}
 */
let button_states = {}
button_states[STATUS.INIT] = {class: 'initializing', content: loader_icon + '<div class="status">Loading</div>'};
button_states[STATUS.LOADING] = {class: 'loading', content: loader_icon + '<div class="status">Starting</div>'};
button_states[STATUS.PLAYING] = {class: 'playing', content: stop_icon + '<div class="status">Stop</div>'};
button_states[STATUS.STOPPED] = {class: 'stopped', content: play_icon + '<div class="status">Play</div>'};


/**
 * Triton player object from {@link https://userguides.tritondigital.com/spc/tdplay2/|Triton SDK}
 * @var {TDSdk}
 */
var player;

/**
 * @var {string} player_state - Current state of the player (a value from {@link STATUS})
 */
var player_state;

/**
 * @constant {string} station - Triton station name (from the data-station attribute on the player container - see {@link container_id})
 */
const station = $('#' + container_id).data('station');


/**
 * Set the state of the player
 *
 * @param {string} state - The new state (a property of {@link STATUS})
 */
function set_button_state (state) {
  $('#' + container_id + ' .transport-button').html(button_states[state].content);
  $('#' + container_id + ' .transport-button').attr('class', button_states[state].class + ' transport-button' );
  player_state = state;
}

// Insert the markup for the player UI
$('#' + container_id).html(player_markup );

// Initialize customizations from the player container
initialize_customization();

// The first state is the player initializing - this will be changed on the playerReady event
set_button_state ('initializing');

/**
 * Set up the player from the {@link https://userguides.tritondigital.com/spc/tdplay2/|Triton SDK}
 */
function initPlayer()
{
    //Player SDK is ready to be used, this is where you can instantiate a new TDSdk instance.
    //Player configuration: list of modules
    var tdPlayerConfig = {
        coreModules: [{
            id: 'MediaPlayer',
            playerId: container_id
        }],
        playerReady: onPlayerReady,
        configurationError: onPlayerError,
        moduleError: onPlayerError,
        //adBlockerDetected: onAdBlockerDetected
    };

    //Player instance
    player = new TDSdk( tdPlayerConfig );
}


/**
 * Callback to finish setup after the player is ready
 */
function onPlayerReady() {
  set_button_state (STATUS.STOPPED);

    player.addEventListener( 'stream-status', onStatusChange );

    // toggle what the player is doing (based on the current {@link player_state})
    $ ('#' + container_id + ' .transport-button').click (function () {
      switch (player_state) {
        case STATUS.STOPPED:
          player.play( {station:station} );
          break;

        case STATUS.LOADING:
        case STATUS.PLAYING:
          player.stop();
      }
    });
}

/**
 * Callback for whenever the player state changes
 */
function onStatusChange (event) {

  // code as defined in the Triton SDK
  let code = event.data.code;

  // update the transport button to reflect what the player is doing
  switch (code) {
    case 'LIVE_PAUSE':
    case 'LIVE_STOP':
      set_button_state('stopped');
      break;

    case 'LIVE_BUFFERING':
    case 'LIVE_CONNECTING':
    case 'LIVE_RECONNECTING':
    case 'GETTING_STATION_INFORMATION':
      set_button_state ('loading');
      break;

    case 'LIVE_PLAYING':
      set_button_state ('playing');
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
function onPlayerError( e ) {
    console.log(object);
    console.log(object.data.errors);
}

/* Load the Triton SDK and call initPlayer() when it's done */
$.getScript( '//sdk.listenlive.co/web/2.9/td-sdk.min.js' )
  .done(function(script, textStatus){
    initPlayer();
});

});
