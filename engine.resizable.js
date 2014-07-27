(function(window, define, undefined){
	/*
	 * Resizable
	 *
	 * @description: Resize HTML-elements via drag
	 *
	 * Copyright 2014, Lukas Oppermann
	 * Released under the MIT license.
	 */
	// fallback for define if no amd is present
	if ( typeof define !== "function" || !define.amd ) {
		var define = function(arr, fn){
			fn.call(window, window.engine);
		};
	}
	// export module
	define(["engine/engine", "engine/functions/each","dev/engine/functions/on","engine/functions/off","engine/functions/css","engine/functions/parent","engine/functions/class"], function(_){
		// serializer
		_.fn.resizable = function( opts ){
			// defaults
			opts = _.extend({
				items: '.resizable',
				handle: '.resize-handle',
				columns: 1,
				columnClass: 'column-[a-z0-9]*',
				newColumnClass: 'column-{#}of{columns}',
				offset: 10,
				startResizing: function(width, container, e, opts)
				{
					this.columnWidth = Math.floor( (container.css('width')-container.css('padding-left')-container.css('padding-right')) / opts.columns );
					
					this.currentColumn = parseInt(this[0].getAttribute('data-column'));
					this.lastWidth = this.currentWidth = this.columnWidth*( this.currentColumn || 1);
				},
				resizing: function(width, container, e, opts)
				{
					if( opts.columns === undefined || opts.columns < 2  )
					{
						this.css('width', width+'px');
					}
					else
					{
						if( width >= ( this.currentWidth + this.columnWidth - opts.offset ) && width > this.lastWidth && this.currentColumn < opts.columns )
						{
							this.lastWidth = this.currentWidth;
							this.currentColumn = parseInt(this[0].getAttribute('data-column'))+1;
							this.replaceClass(opts.columnClass, opts.newColumnClass.replace("{#}",this.currentColumn).replace("{columns}",opts.columns));
							this[0].setAttribute('data-column', this.currentColumn);
							this.currentWidth = this.columnWidth*this.currentColumn;
						}
						else if( width < (this.currentWidth - opts.offset) && width < this.lastWidth && this.currentColumn > 1 )
						{
							this.lastWidth = this.currentWidth;
							this.currentColumn = parseInt(this[0].getAttribute('data-column'))-1;
							this.replaceClass(opts.columnClass, opts.newColumnClass.replace("{#}",this.currentColumn).replace("{columns}",opts.columns));
							this[0].setAttribute('data-column', this.currentColumn);
							this.currentWidth = this.columnWidth*this.currentColumn;
						}
					}
				},
				stopResizing: function(width, container, e, opts)
				{
				}
			}, opts);
			// function
			_(this).each(function(){
				var container = this;		
				// set attributes
				container.setAttribute('data-resizeItems', opts.items);
				container.setAttribute('data-columns', container.getAttribute('data-columns') || opts.columns);
				
				// add click-event
				_(opts.handle, container).on("mousedown", function(e)
				{
					var item = _(this).parent(container.getAttribute('data-resizeItems'));
					// store original values
					var original = {
						x: e.clientX,
						y: e.clientY,
						width: parseInt(item.css('width'), 10)
					};
					// add resizing classes
					_('body').addClass('resizing-active');
					item.addClass('resizing');
					// run startResizing
					opts.startResizing.call(item, (original.width+e.clientX-original.x), _(container), e, opts);
					// add events
					_(container).on("mousemove", function(e){
						opts.resizing.call(item, (original.width+e.clientX-original.x), _(container), e, opts);
					},10);
					
					// remove event
					_('body').on("mouseup", function(){
						_(this).removeClass('resizing-active');
						item.removeClass('resizing');
						_(container).off("mousemove");
						opts.stopResizing.call(item, (original.width+e.clientX-original.x), _(container), e, opts);
						// remove highlight
						if (window.getSelection) {
							window.getSelection().removeAllRanges();
						} else if (document.selection) {
							document.selection.empty();
						}
					});
					
				});
			});
		};
		//
		return _;
	});
}(window, window.define));