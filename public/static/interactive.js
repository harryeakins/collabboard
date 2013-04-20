(function(window) {
  var settings = { erase: false,
                   wacom: false,
                   line: false,
                   penWidth: 5,
                   cursorcanvas: document.getElementById("cursorcanvas"),
                   prevCursorPosX: 0,
                   prevCursorPosY: 0};

  function drawLine(line, options) {
    var default_options = {
      sendToServer: false,
      canvas: "#canvas",
      push: true
    };
    for(var index in default_options) 
      if(options[index] === "undefined") options[index] = default_options[index];

    if(options.sendToServer === true) {
      now.drawLine_server(line);
    }
    canvas_drawLine(line, options.push, options.canvas);
  }

  function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return { x: curleft, y: curtop };
    }
    return undefined;
  }

  function drawCursor(pos) {
    var canvas = settings.cursorcanvas;
    if(canvas === null) {
      settings.cursorcanvas = document.getElementById('cursorcanvas');
      canvas = settings.cursorcanvas;
      if(canvas === null) return;
    }
    canvas.getContext("2d").clearRect(settings.prevCursorPosX-15, settings.prevCursorPosY-15, 30, 30);
    //canvas.width = canvas.width;
    $(canvas).drawLine({
              strokeStyle: "#fff",
              fillStyle: "#fff",
              strokeWidth: 2,
              rounded: true,
              x1: pos.x-10, y1: pos.y,
              x2: pos.x+10, y2: pos.y });
    $(canvas).drawLine({
              strokeStyle: "#fff",
              fillStyle: "#fff",
              strokeWidth: 2,
              rounded: true,
              x1: pos.x, y1: pos.y-10,
              x2: pos.x, y2: pos.y+10 });
    settings.prevCursorPosX = pos.x;
    settings.prevCursorPosY = pos.y;
  }

  function initNow() {
        //Draw a line given from server
        now.drawLine_client = function(id, line) {
          if(id != now.core.clientId) {
            drawLine(line, {sendToServer: false});
            drawCursor({x: line[2], y: line[3]});
          }
        };
        now.undo = canvas_undo;  

        now.clear_client = canvas_wipe_clean;
        
        now.setLines = function(lines) {
          canvas_redraw(lines);
        }

        now.switch_session = function(id, session_name) {
          window.history.replaceState("", "", "/session/" + session_name);
          if(id != now.core.clientId) {
            alert("Session name changed to " + session_name);
          }
        }

        now.draw_cursor = function(id, pos) {
          if(id === now.core.clientId) return;
          drawCursor(pos);
          //console.timeStamp("Finished drawing cursor " + id);
        }
        settings.wacom = document.getElementById("wtPlugin").penAPI;
        // Request UID from server
        var path = document.location.pathname;
        var session_name = "default";
        if(path.match(/\/session\/(.*)/)) {
            session_name = path.match(/\/session\/(.*)/)[1];
        }
        now.init(session_name);
        attachPenHandlers();
        resizeCursorCanvas();
        $(window).resize(resizeCursorCanvas);
  }

  function resizeCursorCanvas() {
      var canvas = document.getElementById("cursorcanvas");
      canvas.width = $("#drawing-area").width();
      canvas.height = $("#drawing-area").height();
      var canvas = document.getElementById("linecanvas");
      canvas.width = $("#drawing-area").width();
      canvas.height = $("#drawing-area").height();
  }

  function getPressure() {
      return settings.wacom ? settings.wacom.pressure : 1;
  }

  function getPenWidth() {
      var pressure = getPressure();
      var width = settings.erase ? 50 : settings.penWidth;
      return Math.max(width * pressure, 0.5);
  }

  function getPenColor() {
        var color; 
        //console.log("Erase read as: " + settings.erase);
        if(settings.erase) color = $("#drawing-area").css("background-color");
        else color = $(".simpleColorDisplay").css("background-color");
        return color;
  }


  function penMoveHandler(event) {
    var pos = findPos(this);
    var new_x = event.pageX - pos.x;
    var new_y = event.pageY - pos.y;
    var color = getPenColor();
    var width = getPenWidth();
    if(started) {
      if(!settings.line) {
        line = [pen_x, pen_y, new_x, new_y, width, color, now.core.clientId];
        drawLine(line, {sendToServer: true});
      } else {
        var canvas = document.getElementById("linecanvas").getContext("2d");
        var rect_x = Math.min(last_line_pos_x, event_start_x);
        var rect_y = Math.min(last_line_pos_y, event_start_y);
        var rect_w = Math.abs(event_start_x - last_line_pos_x);
        var rect_h = Math.abs(event_start_y - last_line_pos_y);
        canvas.clearRect(rect_x-1, rect_y-1, rect_w+2, rect_h+2);
        last_line_pos_x = new_x;
        last_line_pos_y = new_y;
        line = [event_start_x, event_start_y, new_x, new_y, 1, color, now.core.clientId];
        drawLine(line, {sendToServer: false, canvas: "#linecanvas", push: false});
      }
    } else {
      now.bcast_cursor({x: pen_x, y: pen_y});
    }
    pen_x = new_x;
    pen_y = new_y;
  }

  function penUpHandler(event) {
    if(started) {
      if(settings.line) {
        var pos = findPos(this);
        var new_x = event.pageX - pos.x;
        var new_y = event.pageY - pos.y;
        var color = getPenColor();
        var width = getPenWidth();
        var canvas = document.getElementById("linecanvas").getContext("2d");
        var rect_x = Math.min(last_line_pos_x, event_start_x);
        var rect_y = Math.min(last_line_pos_y, event_start_y);
        var rect_w = Math.abs(event_start_x - last_line_pos_x);
        var rect_h = Math.abs(event_start_y - last_line_pos_y);
        canvas.clearRect(rect_x-1, rect_y-1, rect_w+2, rect_h+2);
        line = [event_start_x, event_start_y, new_x, new_y, width, color, now.core.clientId];
        drawLine(line, {sendToServer: true});
      }
      canvas_save();
    }
    started = false;
    return false;
  }

  function penDownHandler(event) {
    started = true;
    var pos = findPos(this);
    event_start_x = event.pageX - pos.x;
    event_start_y = event.pageY - pos.y;
    last_line_pos_x = event.pageX;
    last_line_pos_y = event.pageY;
    event.pageX += 1;
    penMoveHandler.call(this, event);
    return false;
  }

  window.penMoveHandler = penMoveHandler;
  window.penUpHandler = penUpHandler;
  window.penDownHandler = penDownHandler;
  window.resizeCursorCanvas = resizeCursorCanvas;
  window.initNow = initNow;
  window.settings = settings;
})(window);
