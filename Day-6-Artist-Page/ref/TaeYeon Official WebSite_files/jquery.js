(function ($, document) {
    $.fn.scrollbar = function (opts) {
        var options = $.extend({}, $.fn.scrollbar.defaults, opts);
        return this.each(function () {
            var container = $(this), props = { arrows: options.arrows };

            if (options.containerHeight) {
                container.height(options.containerHeight);
            }
            props.containerHeight = container.height();
            props.contentHeight = 0;
            container.children().each(function () {
                props.contentHeight += $(this).outerHeight();
            });
            if (props.contentHeight <= props.containerHeight) {
                if (options.containerHeightAuto) {
                    container.css("height", "auto");
                }
                return true;
            }
            var scrollbar = new $.fn.scrollbar.Scrollbar(container, props, options);

            scrollbar.buildHtml();
            scrollbar.initHandle();
            scrollbar.appendEvents();
        });
    };
    $.fn.scrollbar.defaults = {
        containerHeight: null,
        containerHeightAuto: false,
        arrows: true,
        handleHeight: 60,
        handleMinHeight: 30,
        scrollSpeed: 20,
        scrollStep: 20,
        scrollSpeedArrows: 20,
        scrollStepArrows: 3
    };
    $.fn.scrollbar.Scrollbar = function (container, props, options) {
        this.container = container;
        this.props = props;
        this.opts = options;
        this.mouse = {};
        this.props.arrows = this.container.hasClass('no-arrows') ? false : this.props.arrows;
    };
    $.fn.scrollbar.Scrollbar.prototype = {
        buildHtml: function () {
            this.container.children().wrapAll('<div class="scrollbar-pane"><div class="scrollbar-content"></div></div>');

            this.container.append('<div class="scrollbar-wrap"><div class="scrollbar-handle-container"><div class="scrollbar-handle"/></div></div>');
            if (this.props.arrows) {
                this.container.find('.scrollbar-wrap').append('<div class="scrollbar-handle-up"/>').append('<div class="scrollbar-handle-down"/>');
            }
            var width = this.container.width();
            var height = this.container.height();
            this.pane = this.container.find('.scrollbar-pane');
            this.content = this.container.find('.scrollbar-content');
            this.wrap = this.container.find('.scrollbar-wrap');
            this.handle = this.container.find('.scrollbar-handle');
            this.handleContainer = this.container.find('.scrollbar-handle-container');
            this.handleArrows = this.container.find('.scrollbar-handle-up, .scrollbar-handle-down');
            this.handleArrowUp = this.container.find('.scrollbar-handle-up');
            this.handleArrowDown = this.container.find('.scrollbar-handle-down');
            this.wrap.defaultCss({ 'top': 0, 'right': 0 });
            this.pane.defaultCss({ 'top': 0, 'left': 0 });
            this.handleContainer.defaultCss({ 'right': 0 });
            this.handle.defaultCss({ 'top': 0, 'right': 0 });
            this.handleArrows.defaultCss({ 'right': 0 });
            this.handleArrowUp.defaultCss({ 'top': 0 });
            this.handleArrowDown.defaultCss({ 'bottom': 0 });
            this.container.css({
                'position': this.container.css('position') === 'absolute' ? 'absolute' : 'relative',
                'overflow': 'hidden',
                'width': width + 'px',
                'height': height + 'px'
            });
            this.wrap.css({ 'position': 'absolute',
                'height': height + parseInt(this.container.css("paddingTop").replace("px", "")) - 4 + 'px'
            });
            this.pane.css({ 'position': 'absolute',
                'overflow': 'visible',
                'width': this.container.innerWidth() - parseInt(this.container.css("paddingLeft").replace("px", "")) + parseInt(this.container.css("paddingRight").replace("px", "")) - parseInt(this.pane.css("marginRight").replace("px", "")) + 'px',
                'height': 'auto',
                'top': this.container.css("paddingTop"),
                'left': this.container.css("paddingLeft")
            });
            this.content.css({
                'marginRight': '10px'
            });
            this.handleContainer.css({ 'position': 'absolute',
                'top': this.handleArrowUp.outerHeight(true) + 2 + 'px',
                'left': 2 + 'px',
                'height': (this.props.containerHeight + parseInt(this.container.css("paddingTop").replace("px", "")) - this.handleArrowUp.outerHeight(true) - this.handleArrowDown.outerHeight(true)) - 8 + 'px'
            });
            this.handle.css({
                'position': 'absolute',
                'cursor': 'pointer'
            });
            this.handleArrows.css({
                'position': 'absolute',
                'top': 2, 'left': 2 + 'px',
                'cursor': 'pointer'
            });
            this.handleArrowDown.css({
                'top': (this.props.containerHeight + parseInt(this.container.css("paddingTop").replace("px", "")) - this.handleArrowDown.outerHeight(true)) - 6 + 'px'
            });
        },
        initHandle: function () {
            this.props.handleContainerHeight = this.handleContainer.height();
            this.props.contentHeight = this.pane.height();
            this.props.handleHeight = this.opts.handleHeight == 'auto' ? Math.max(Math.ceil(this.props.containerHeight * this.props.handleContainerHeight / this.props.contentHeight), this.opts.handleMinHeight) : this.opts.handleHeight;
            this.handle.height(this.props.handleHeight);
            this.handle.height(2 * this.handle.height() - this.handle.outerHeight(true));
            this.props.handleTop = {
                min: 0,
                max: this.props.handleContainerHeight - this.props.handleHeight
            };
            this.props.handleContentRatio = (this.props.contentHeight - this.props.containerHeight) / (this.props.handleContainerHeight - this.props.handleHeight);
            this.handle.top = 0;
        },
        appendEvents: function () {
            this.handle.bind('mousedown.handle', $.proxy(this, 'startOfHandleMove'));
            this.handleContainer.bind('mousedown.handle', $.proxy(this, 'onHandleContainerMousedown'));
            this.handleContainer.bind('mouseenter.container mouseleave.container', $.proxy(this, 'onHandleContainerHover'));
            this.handleArrows.bind('mousedown.arrows', $.proxy(this, 'onArrowsMousedown'));
            this.container.bind('mousewheel.container', $.proxy(this, 'onMouseWheel'));
            this.container.bind('mouseenter.container mouseleave.container', $.proxy(this, 'onContentHover'));
            this.handle.bind('click.scrollbar', this.preventClickBubbling);
            this.handleContainer.bind('click.scrollbar', this.preventClickBubbling);
            this.handleArrows.bind('click.scrollbar', this.preventClickBubbling);
        },
        mousePosition: function (ev) {
            return ev.pageY || (ev.clientY + (document.documentElement.scrollTop || document.body.scrollTop)) || 0;
        },
        startOfHandleMove: function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            this.mouse.start = this.mousePosition(ev);
            this.handle.start = this.handle.top;
            $(document).bind('mousemove.handle', $.proxy(this, 'onHandleMove')).bind('mouseup.handle', $.proxy(this, 'endOfHandleMove'));
            this.handle.addClass('move');
            this.handleContainer.addClass('move');
        },
        onHandleMove: function (ev) {
            ev.preventDefault();
            var distance = this.mousePosition(ev) - this.mouse.start;
            this.handle.top = this.handle.start + distance;
            this.setHandlePosition();
            this.setContentPosition();
        },
        endOfHandleMove: function (ev) {
            $(document).unbind('.handle');
            this.handle.removeClass('move');
            this.handleContainer.removeClass('move');
        },
        setHandlePosition: function () {
            this.handle.top = (this.handle.top > this.props.handleTop.max) ? this.props.handleTop.max : this.handle.top;
            this.handle.top = (this.handle.top < this.props.handleTop.min) ? this.props.handleTop.min : this.handle.top;
            this.handle[0].style.top = this.handle.top + 'px';
        },
        setContentPosition: function () {
            this.pane.top = -1 * this.props.handleContentRatio * this.handle.top;
            this.pane[0].style.top = this.pane.top + 'px';
        },
        onMouseWheel: function (ev, delta) {
            this.handle.top -= delta;
            this.setHandlePosition();
            this.setContentPosition();

            if (delta > 0) {
                if ((this.handle.top > this.props.handleTop.min && this.handle.top < this.props.handleTop.max) || this.handle.top == this.props.handleTop.min) {
                    ev.preventDefault();
                }
            } else {
                if ((this.handle.top > this.props.handleTop.min && this.handle.top < this.props.handleTop.max) || this.handle.top == this.props.handleTop.max) {
                    ev.preventDefault();
                }
            }
            //            if ((this.handle.top > this.props.handleTop.min && this.handle.top < this.props.handleTop.max)) {

            //                ev.preventDefault();
            //            }
        },
        onHandleContainerMousedown: function (ev) {
            ev.preventDefault();
            if (!$(ev.target).hasClass('scrollbar-handle-container')) { return false; }
            this.handle.direction = (this.handle.offset().top < this.mousePosition(ev)) ? 1 : -1;
            this.handle.step = this.opts.scrollStep;
            var that = this;
            $(document).bind('mouseup.handlecontainer', function () {
                clearInterval(timer);
                that.handle.unbind('mouseenter.handlecontainer');
                $(document).unbind('mouseup.handlecontainer');
            });
            this.handle.bind('mouseenter.handlecontainer', function () {
                clearInterval(timer);
            });
            var timer = setInterval($.proxy(this.moveHandle, this), this.opts.scrollSpeed);
        },
        onArrowsMousedown: function (ev) {
            ev.preventDefault();
            this.handle.direction = $(ev.target).hasClass('scrollbar-handle-up') ? -1 : 1;
            this.handle.step = this.opts.scrollStepArrows;
            $(ev.target).addClass('move');
            var timer = setInterval($.proxy(this.moveHandle, this), this.opts.scrollSpeedArrows);
            $(document).one('mouseup.arrows', function () {
                clearInterval(timer);
                $(ev.target).removeClass('move');
            });
        },
        moveHandle: function () {
            this.handle.top = (this.handle.direction === 1) ? Math.min(this.handle.top + this.handle.step, this.props.handleTop.max) : Math.max(this.handle.top - this.handle.step, this.props.handleTop.min);
            this.handle[0].style.top = this.handle.top + 'px';
            this.setContentPosition();
        },
        onContentHover: function (ev) {
            if (ev.type === 'mouseenter') {
                this.container.addClass('hover');
                this.handleContainer.addClass('hover');
            } else {
                this.container.removeClass('hover');
                this.handleContainer.removeClass('hover');
            }
        }, onHandleContainerHover: function (ev) { if (ev.type === 'mouseenter') { this.handleArrows.addClass('hover'); } else { this.handleArrows.removeClass('hover'); } }, preventClickBubbling: function (ev) { ev.stopPropagation(); }
    }; $.fn.defaultCss = function (styles) { var notdef = { 'right': 'auto', 'left': 'auto', 'top': 'auto', 'bottom': 'auto', 'position': 'static' }; return this.each(function () { var elem = $(this); for (var style in styles) { if (elem.css(style) === notdef[style]) { elem.css(style, styles[style]); } } }); }; $.event.special.mousewheel = { setup: function () { if (this.addEventListener) { this.addEventListener('mousewheel', $.fn.scrollbar.mouseWheelHandler, false); this.addEventListener('DOMMouseScroll', $.fn.scrollbar.mouseWheelHandler, false); } else { this.onmousewheel = $.fn.scrollbar.mouseWheelHandler; } }, teardown: function () { if (this.removeEventListener) { this.removeEventListener('mousewheel', $.fn.scrollbar.mouseWheelHandler, false); this.removeEventListener('DOMMouseScroll', $.fn.scrollbar.mouseWheelHandler, false); } else { this.onmousewheel = null; } } }; $.fn.extend({ mousewheel: function (fn) { return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel"); }, unmousewheel: function (fn) { return this.unbind("mousewheel", fn); } }); $.fn.scrollbar.mouseWheelHandler = function (event) {
        var orgEvent = event || window.event, args = [].slice.call(arguments, 1), delta = 0, returnValue = true, deltaX = 0, deltaY = 0; event = $.event.fix(orgEvent); event.type = "mousewheel"; if (event.wheelDelta) { delta = event.wheelDelta / 10; }
        if (event.detail) { delta = -event.detail / 0.3; }
        if (orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS) { deltaY = 0; deltaX = -1 * delta; }
        if (orgEvent.wheelDeltaY !== undefined) { deltaY = orgEvent.wheelDeltaY / 120; }
        if (orgEvent.wheelDeltaX !== undefined) { deltaX = -1 * orgEvent.wheelDeltaX / 120; }
        args.unshift(event, delta, deltaX, deltaY); return $.event.handle.apply(this, args);
    };
})(jQuery, document);