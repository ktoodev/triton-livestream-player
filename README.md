# Triton Livestream Player

Basic embeddable livestream player using the [Triton SDK](https://userguides.tritondigital.com/spc/tdplay2/embedding_the_td_player_sdk.html).

Example usage:

    <div id="livestream_player"
          style="background-color:#000000; color:#FFFFFF"
          data-station="TRITONRADIOMUSIC"
          data-foreground="#DDDDDD"
          data-background="#333333"
          data-foreground-hover="#FFFFFF"
          data-background-hover="#555555"
          data-debug-log="false"
          data-log-element="#player_log"
          data-autoplay="autoplay"
          >
          <!-- Optional HTML to show in the player bar -->
    </div>
    <div id="player_log"></div>
    <script src=“https://cdn.jsdelivr.net/gh/ktoodev/triton-livestream-player@1.2.7/dist/player.js”></script>
