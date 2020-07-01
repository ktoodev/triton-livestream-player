
import $ from "jquery";

export function initialize_customization () {

  let background_color = $('#td_container').data('background');
  let foreground_color = $('#td_container').data('foreground');
  let background_color_hover = $('#td_container').data('background-hover');
  let foreground_color_hover = $('#td_container').data('foreground-hover');

  console.log ('fg-h: ' + foreground_color_hover);

  function default_attributes () {
    $("#td_container .transport-button").css('background-color', background_color);
    $("#td_container .transport-button").css('color', foreground_color);

    $('#td_container .transport-button').css('stroke', foreground_color);

    $('#td_container .transport-button').css('fill', foreground_color);
  }
  default_attributes();


  $("#td_container .transport-button").hover(function() {
    $(this).css('background-color', background_color_hover);
    $(this).css('color', foreground_color_hover);

    $(this).css('stroke', foreground_color_hover);

    $(this).css('fill', foreground_color_hover);
  }, default_attributes);

}
