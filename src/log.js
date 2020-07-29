import $ from "jquery";
import {player_id} from './index.js';
import copy from "copy-text-to-clipboard";

/**
 * Add log options based on data- parameters (log to console or into a DOM element)
 */
export function log (message) {

  // check if debug logging is enabled at all (and return if it's not)
  let debug_log = $('#' + player_id).data('debug-log');
  if (!debug_log) {
    return;
  }

  // check if there's an element we should be logging into, and log to console if there isn't
  let log_selector = $('#' + player_id).data('log-element');
  if (!log_selector || $(log_selector).length == 0) {
    console.log (message);
    return;
  }

  // set up element we'll be logging to
  let log_element = $(log_selector);
  log_element.css('white-space', 'pre');

  // add a copy button to conveniently copy the log
  let copy_button_id = 'tdsdk_player_log_copy_button';
  if ($('#' + copy_button_id).length == 0) {
    log_element.append ('<button id="' + copy_button_id + '">Copy log</button>');

    // copy the log on click
    $('#' + copy_button_id).click (() => {
      copy($(log_selector).text());
    });
  }

  // turn objects into strings
  if (typeof message == 'object') {
    message = JSON.stringify(message);
  }

  // append the log message to the element we're logging to
  log_element.append (message + "\n");
}
