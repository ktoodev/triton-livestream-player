export default function get_url_param (name, reset) {
    let url = window.location.href;

    var regex = new RegExp('([?&])' + name + '(=([^&#]*))?(&|#|$)');
    var results = regex.exec(url);

    if (!results) return false;

    if (reset) {
      let new_url = url.replace (regex, '$1');
      let trailing_char = new RegExp ('[&\?]\s*$');
      new_url = new_url.replace(trailing_char, '');
      history.replaceState (null, '', new_url);
    }
    return true;
}
