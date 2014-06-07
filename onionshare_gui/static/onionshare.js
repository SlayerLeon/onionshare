$(function(){
  var onionshare = {}

  function update($msg) {
    var $line = $('<p></p>').append($msg);
    $('#output').append($line);
    
    // scroll to bottom
    $('#output').scrollTop($('#output').height());
  }

  function linebreak() {
    update($('<hr>'));
  }

  function copy_to_clipboard() {
    $.ajax({
      url: '/copy_url',
      success: function(data, textStatus, jqXHR){
        update('Copied secret URL to clipboard');
      }
    });
  }
  $('#copy-button').click(copy_to_clipboard);

  var REQUEST_LOAD = 0;
  var REQUEST_DOWNLOAD = 1;
  var REQUEST_OTHER = 2;
  function check_for_requests() {
    $.ajax({
      url: '/check_for_requests',
      success: function(data, textStatus, jqXHR){
        if(data != '') {
          var r = JSON.parse(data);
          if(r.type == REQUEST_LOAD) {
            update($('<span>').addClass('weblog').html('Download page loaded'));
          } else if(r.type == REQUEST_DOWNLOAD) {
            update($('<span>').addClass('weblog').html('Download started'));
          } else {
            if(r.path != '/favicon.ico')
              update($('<span>').addClass('weblog-error').html('Other page has been loaded: {0}'.replace('{0}', r.path)));
          }
        }

        setTimeout(check_for_requests, 1000);
      }
    });
  }

  // start onionshare
  $.ajax({
    url: '/start_onionshare',
    success: function(data, textStatus, jqXHR){
      onionshare = JSON.parse(data);

      $('#basename').html(onionshare.basename);
      update("Sharing file: "+onionshare.basename+" ("+onionshare.filesize+" bytes)");
      update("SHA1 checksum: "+onionshare.filehash);
      linebreak();
      update(onionshare.strings['give_this_url']);
      update($('<strong>').html(onionshare.url));
      linebreak();
      copy_to_clipboard();
      $('#copy-button').show();

      setTimeout(check_for_requests, 1000);

      $('#loading').hide();
      $('#content').show();
    }
  });

});
