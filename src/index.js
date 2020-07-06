import './scss/player-styles.scss';
import './scss/loader.scss';


import $ from "jquery";
import 'jquery-ui';
import 'jquery-ui/ui/widgets/slider.js';
import './scss/slider.scss';

import {conditional_volume} from './audio-compatibility.js';

import Cookies from 'js-cookie';

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
 * @constant - The current script element
 */
const current_script = document.scripts[document.scripts.length - 1];


/**
 * @constant {Date} cookie_expiration - The date settings cookies should expire
 */
const cookie_expiration = new Date('December 31, 9999 01:01:00');

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
 * @constant player_id - The ID of the overall player container
 */
const player_id = $(current_script).data('player-id');

$('#' + player_id).wrapInner( "<div class='player_contents'></div>");

// Insert the markup for the player UI
$('#' + player_id).prepend(player_markup );

// Initialize customizations from the player container
initialize_customization(player_id);


conditional_volume (function () {

  $ ('#' + player_id + ' .volume-slider-container').show();
});


$('#' + player_id).addClass('td_player_container');

/**
 * @constant {string} td_container_id - The element ID for the player container
 */
const td_container_id = 'td_container_' + Math.floor(Math.random()* 10000);

$('#' + player_id + ' .td_container').attr('id', td_container_id);


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
 * Set the state of the player
 *
 * @param {string} state - The new state (a property of {@link STATUS})
 */
function set_button_state (state) {
  $('#' + player_id + ' .transport-button').html(button_states[state].content);
  $('#' + player_id + ' .transport-button').attr('class', button_states[state].class + ' transport-button' );
  player_state = state;
}


/**
 * @constant {string} station - Triton station name (from the data-station attribute on the player container - see {@link td_container_id})
 */
const station = $('#' + player_id).data('station');


// use the stored volume value (if it exists) with a minimum of 15 (so the stream doesn't start silent);
// otherwise default to a volume of 75
let volume_settings = Cookies.getJSON()['ktoo-stream-volumes'] ? Cookies.getJSON()['ktoo-stream-volumes'] : {};


let default_volume = 75;
if (volume_settings) {
  if (volume_settings[station]) {
    default_volume = Math.max (15, volume_settings[station]);
  }
  else if (volume_settings['default']) {
    default_volume = Math.max (15, volume_settings['default']);
  }
}

conditional_volume (function () {

  $( '#' + player_id + ' .volume-slider' ).slider({
    value: default_volume,
    slide: function( event, ui ) {
      // set
      volume_settings[station] = ui.value;
      volume_settings['default'] = ui.value;
      player.setVolume(ui.value/100);
      Cookies.set ('ktoo-stream-volumes', volume_settings);
    }
  });
});



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
            playerId: td_container_id,
            geoTargeting: false,
            techPriority:['Html5', 'Flash'],
            audioAdaptive: true
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
  $ ('#' + player_id + ' .transport-button').click (function () {
    switch (player_state) {
      case STATUS.STOPPED:
        let volume = volume_settings[station] ? volume_settings[station] : default_volume;
        player.setVolume (volume/100);
        player.play( {station:station} );
        break;

      case STATUS.LOADING:
      case STATUS.PLAYING:
        player.stop();
    }
  });

  conditional_volume (function () {
    initialize_customization(player_id);


    $ ('#' + player_id + ' .volume-slider').show();

    player.setVolume(default_volume/100);

    $( '#' + player_id + ' .volume-slider' ).slider({
      value: player.getVolume() * 100
    });
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
