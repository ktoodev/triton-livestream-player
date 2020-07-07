import $ from "jquery";

import {Triton_Livestream_Player} from './Triton_Livestream_Player';


/* when the document is ready, set things up */
$(document).ready(function() {

  /* Load the Triton SDK and create our player object when it's loaded */
  $.getScript('//sdk.listenlive.co/web/2.9/td-sdk.min.js')
    .done(function(script, textStatus) {

      const current_script = document.scripts[document.scripts.length - 1];

      const player_id = $(current_script).data('player-id');

      new Triton_Livestream_Player(player_id);
    });

});
