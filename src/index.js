
console.log ('basic test 043');

import $ from "jquery";

import {Triton_Livestream_Player} from './Triton_Livestream_Player';


// when the document is ready, set things up
$(document).ready(function() {

  // Load the Triton SDK and create our player object when it's loaded
  $.getScript('//sdk.listenlive.co/web/2.9/td-sdk.min.js')
    .done(function(script, textStatus) {


      const player_id = 'livestream_player';

      console.log ('player_id: ' + player_id);

      new Triton_Livestream_Player(player_id);
    });

});
