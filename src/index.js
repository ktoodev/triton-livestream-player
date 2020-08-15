export const player_id = 'livestream_player';

import $ from "jquery";

import {Triton_Livestream_Player} from './Triton_Livestream_Player';
import {log} from './log.js';


// when the document is ready, set things up
$(document).ready(function() {

  // Load the Triton SDK and create our player object when it's loaded
  $.getScript('//sdk.listenlive.co/web/2.9/td-sdk.min.js')
    .done(function(script, textStatus) {

      log ('SDK get done');

      log ('player_id: ' + player_id);

      new Triton_Livestream_Player(player_id);
    });

});
 
