import $ from "jquery";
import alpha from "color-alpha";

/**
 * Initialize styling and parameters that are set at the HTML element in the embed code
 *
 * @param {string} player_id - The HTML ID of the player container holding the data- attributes we'll use for customization
 */
export function initialize_customization (player_id) {

  let player = $('#' + player_id);

  // get the params from the player container (or set them to defaults)
  let background_color = player.data('background') ? player.data('background') : '#333333';
  let foreground_color = player.data('foreground') ? player.data('foreground') : '#FFFFFF';
  let background_color_hover = player.data('background-hover') ? player.data('background-hover') : '#000000';
  let foreground_color_hover = player.data('foreground-hover') ? player.data('foreground-hover') : '#FFFFFF';

  /**
   * Apply params to the player's default state
   */
  function default_attributes () {

    // transport (play/pause) button
    $('#' + player_id + ' .transport-button').css({
      backgroundColor: background_color,
      color: foreground_color,
      stroke: foreground_color,
      fill: foreground_color
    });

    // slider track
    $('#' + player_id + ' .ui-slider').css('background-color', alpha (foreground_color, 0.5));

    // slider handle
    $('#' + player_id + ' .ui-slider .ui-slider-handle').css({
      boxShadow: 'none',
      border: 'none',
      marginTop: 0,
      backgroundColor: foreground_color
    });
  }

  // run the function to apply params in default state to begin with
  default_attributes();


  /* Apply hover colors to the transport button on hover, and set back to defaults on hover stop  */
  $('#' + player_id + ' .transport-button').hover(function() {

    $(this).css ({
      backgroundColor: background_color_hover,
      color: foreground_color_hover,
      stroke: foreground_color_hover,
      fill: foreground_color_hover
    });

  }, default_attributes);


  /* Apply foreground colors and highlighting border to the volume handle on focus */
  $('#' + player_id + ' .ui-slider .ui-slider-handle').focus(function () {
      $(this).css({
        boxShadow: foreground_color_hover + ' 0px 0px 0px 2px',
        border: '2px solid ' + background_color,
        marginTop: '-2px',
        backgroundColor: foreground_color_hover
      });
  });

  /* Reset the volume handle styles back to their default state on blur */ 
  $('#' + player_id + ' .ui-slider .ui-slider-handle').blur (default_attributes);

}
