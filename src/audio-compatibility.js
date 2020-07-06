/**
 * Calls a function if the browser supports volume controls
 * (e.g., is not a mobile device that only allows control via hardware buttons)
 *
 * @param {volume_controls_supported} callback - The callback to execute if software volume is supported
 */
export function conditional_volume (callback) {

  // set up a temporary Audio element 
  let audioElement = new Audio();

  // the only viable way I've found to check if volume control is supported
  // is with the volumechange event listener
  audioElement.addEventListener('volumechange', function (event) {

    // the volumechange event was triggered, so volume controls are supported
    if(callback){
      callback();
    }
  });


  // this should trigger the the volumechange event if it's supported
  audioElement.volume = 0.76543;
}


/**
 * Action to perform if software volume control is supported
 * @callback volume_controls_supported
 */
