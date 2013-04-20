(function() {
    var cleared = true;
    var lines = []
    var saves = [0]

    function drawLine(line, push, canvas) {
      push = (typeof(push) === "undefined") ? true : push;
      canvas = (typeof(canvas) === "undefined") ? "#canvas" : canvas;
      if(push) lines.push(line);
      var x1 = line[0],
      y1 = line[1],
      x2 = line[2],
      y2 = line[3],
      width = line[4],
      color = line[5],
      id = line[6];

      $(canvas).drawLine({
                strokeStyle: color,
                fillStyle: color,
                strokeWidth: width,
                rounded: true,
                x1: x1, y1: y1,
                x2: x2, y2: y2 });
      cleared = false;
    }

    function clear(id) {
      if(!cleared) {
        var canvas = document.getElementById("canvas");
        canvas.width = canvas.width; // Clear canvas
        cleared = true;
      }
    }

    function redraw(lines_in) {
      if(typeof(lines_in) !== "undefined") lines = lines_in;
      clear();
      for(var i = 0; i < lines.length; i++) {
        drawLine(lines[i], false);
      }
    }

    function resize() {
      var canvas = document.getElementById("canvas");
      canvas.width = $("#drawing-area").width();
      canvas.height = $("#drawing-area").height();
      redraw();
    }

    function undo(id, savepoint) {
      lines = lines.filter(function(element, index, array) {
        return !(element[6] == id && index >= savepoint);
      });
      redraw();
    }

    function save() {
      saves.push(lines.length);
    }

    function wipe_clean() {
      lines.length = 0
      saves.length = 0
      redraw();
    }

    window.canvas_drawLine = drawLine;
    window.canvas_lines = lines;
    window.canvas_saves = saves;
    window.canvas_resize = resize;
    window.canvas_redraw = redraw;
    window.canvas_undo = undo;
    window.canvas_save = save;
    window.canvas_wipe_clean = wipe_clean;
})();
