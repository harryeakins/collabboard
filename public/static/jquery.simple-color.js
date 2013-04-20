/*
 * jQuery simple-color plugin
 * @requires jQuery v1.4.2 or later
 *
 * See http://recursive-design.com/projects/jquery-simple-color/
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Version: 1.0.1 (201108151520)
 */
 (function($) {
/**
 * simpleColor() provides a mechanism for displaying simple color-pickers.
 *
 * If an options Object is provided, the following attributes are supported:
 *
 *  defaultColor:       Default (initially selected) color.
 *                       default value: '#FFF'
 *
 *  border:             CSS border properties.
 *                       default value: '1px solid #000'
 *
 *  cellWidth:          Width of each individual color cell.
 *                       default value: 10
 *
 *  cellHeight:         Height of each individual color cell.
 *                       default value: 10
 *
 *  cellMargin:         Margin of each individual color cell.
 *                       default value: 1
 *
 *  boxWidth:           Width of the color display box.
 *                       default value: 115px
 *
 *  boxHeight:          Height of the color display box.
 *                       default value: 20px
 *
 *  columns:            Number of columns to display. Color order may look strange if this is altered.
 *                       default value: 16
 *
 *  insert:             The position to insert the color picker. 'before' or 'after'.
 *                       default value: 'after'
 *
 *  buttonClass:        A custom CSS class to add to the button, if you want to add some custom styling.
 *                       default value: ''
 *
 *  colors:             An array of colors to display, if you want to customize the default color set.
 *                       default value: default color set - see 'default_colors' below.
 *
 *  displayColorCode:   Display the color code (eg #333333) as text inside the button. true or false.
 *                       default value: false
 *
 *  colorCodeAlign:     Text alignment used to display the color code inside the button. Only used if 'displayColorCode' is true. 'left', 'center' or 'right'
 *                       default value: 'center'
 *
 *  colorCodeColor:     Text color of the color code inside the button. Only used if 'displayColorCode' is true.
 *                       default value: '#FFF'            
 */
    $.fn.simpleColor = function(options) {

        var default_colors = 
           ['white', 'silver', 'gray', 'black', 
            'red', 'maroon', 'yellow', 'olive', 
            'lime', 'green', 'aqua', 'teal', 
            'blue', 'navy', 'fuchsia', 'purple'] ;

        // Option defaults
        options = $.extend({
            defaultColor:     this.attr('defaultColor') || '#FFF',
            border:           this.attr('border') || '1px solid #000',
            cellWidth:        this.attr('cellWidth') || 10,
            cellHeight:       this.attr('cellHeight') || 10,
            cellMargin:       this.attr('cellMargin') || 1,
            boxWidth:         this.attr('boxWidth') || '115px',
            boxHeight:        this.attr('boxHeight') || '20px',
            columns:          this.attr('columns') || 16,
            insert:           this.attr('insert') || 'after',
            buttonClass:      this.attr('buttonClass') || '',
            colors:           this.attr('colors') || default_colors,
            displayColorCode: this.attr('displayColorCode') || false,
            colorCodeAlign:   this.attr('colorCodeAlign') || 'center',
            colorCodeColor:   this.attr('colorCodeColor') || '#FFF'
            
        }, options || {});

        // Hide the input
        this.hide();

        // Figure out the cell dimensions
        options.totalWidth = options.columns * (options.cellWidth + (2 * options.cellMargin));
        console.log("COLS: " + options.columns + " | CW: " + options.cellWidth + " | CM: " + options.cellMargin);
        console.log("TW: " + options.totalWidth);
        if ($.browser.msie) {
            options.totalWidth += 2;
        }

        options.totalHeight = Math.ceil(options.colors.length / options.columns) * (options.cellHeight + (2 * options.cellMargin));

        // Store these options so they'll be available to the other functions
        // TODO - must be a better way to do this, not sure what the 'official'
        // jQuery method is. Ideally i want to pass these as a parameter to the 
        // each() function but i'm not sure how
        $.simpleColorOptions = options;



        function buildSelector(index) {

            var options = $.simpleColorOptions;

            // Create a container to hold everything
            var container = $("<div class='simpleColorContainer' />");

            // Create the color display box
            var default_color = (this.value && this.value != '') ? this.value : options.defaultColor;

            var display_box = $("<div class='simpleColorDisplay' />");
            display_box.css('backgroundColor', default_color);
            display_box.css('border',          options.border);
            display_box.css('width',           options.boxWidth);
            display_box.css('height',          options.boxHeight);
            display_box.css('cursor',          'pointer');
            container.append(display_box);
            
            // If 'displayColorCode' is turned on, display the currently selected color code as text inside the button.
            if (options.displayColorCode) {
                display_box.text(this.value);
                display_box.css('color',     options.colorCodeColor);
                display_box.css('textAlign', options.colorCodeAlign);
            }

            (function () {
                 // Make a chooser div to hold the cells
                 var chooser = $("<div class='simpleColorChooser'/>");
                 chooser.css('border',  options.border);
                 chooser.css('margin',  '0px');
                 chooser.css('margin-top',  '3px');
                 chooser.css('width',   options.totalWidth + 'px');
                 chooser.css('height',  options.totalHeight + 'px');
          
                 // Create the cells
                 for (var i=0; i<options.colors.length; i++) {
                     var cell = $("<div class='simpleColorCell' id='" + options.colors[i] + "'/>");
                     cell.css('width',           options.cellWidth + 'px');
                     cell.css('height',          options.cellHeight + 'px');
                     cell.css('margin',          options.cellMargin + 'px');
                     cell.css('cursor',          'pointer');
                     cell.css('lineHeight',      options.cellHeight + 'px');
                     cell.css('fontSize',        '1px');
                     cell.css('float',           'left');
                     cell.css('backgroundColor', options.colors[i]);
                     chooser.append(cell);

                     cell.bind('click', {
                             chooser: chooser, 
                             display_box: display_box}, 
                         function(event) {
                             event.data.display_box.css('backgroundColor', this.id);
     
                             // If 'displayColorCode' is turned on, display the currently selected color code as text inside the button.
                             if (options.displayColorCode) {
                                 event.data.display_box.text(this.id);
                             }
                         }
                     );
               }
               container.append(chooser);
               chooser.show();
           })();
            
           var callback_params = {
               container: container, 
               input: this, 
               display_box: display_box, 
           };

            $(this).after(container);

        };

        this.each(buildSelector);

        return this;
    };

    /*
     * Close the given color selectors
     */
    $.fn.closeSelector = function() {
        this.each( function(index) {
            var container = $(this).parent().find('div.simpleColorContainer');
            container.find('.simpleColorCancelButton').hide();
            container.find('.simpleColorChooser').hide();
            container.find('.simpleColorDisplay').show();
            container.find('.simpleColorSelectButton').show();
        });

        return this;
    };

})(jQuery);
