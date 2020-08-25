(function ($, document) {
    $.fn.slideShow = function (options) {
        var options = $.extend({}, $.fn.slideShow.defaults, options);

        return this.each(function () {
            var container = this;
            var slideShow = $.data(this, "slideShow");
            if (slideShow) {
                return slideShow;
            }
            slideShow = new $.SlideShow(container, options);
            $.data(this, "slideShow", slideShow);
            slideShow.buildHtml();
            slideShow.appendEvent();
            slideShow.timeSet();
        });

    };

    $.fn.slideShow.defaults = {
        speed: 1200,
        continuous: true,
        auto: false
    };

    $.SlideShow = function (container, options) {
        this.container = $(container);
        this.options = options;
        this.count = 0;
        this.now = 0;
        this.pause = false;
        this.timeout;
        this.speed = 2000;
    };
    $.extend($.SlideShow, {
        prototype: {
            buildHtml: function () {
                var self = this;
                this.container.find('ul').wrap('<div class="slider-content"></div>');
                this.content = this.container.find('.slider-content');
                this.content.wrap('<div class="slider-wrap"></div>');
                this.wrap = this.container.find('.slider-wrap');
                this.scroll = this.container.find('ul');
                this.items = this.scroll.find('li');
                this.btns = this.container.find('ol');
                this.btnItems = this.btns.find('li');
                this.count = this.items.length;
                this.itemWidth = this.items.outerWidth(true);
                this.itemHeight = this.items.outerHeight(true);
                this.img = this.items.find('img');

                this.container.css({
                    'position': 'relative'
                });
                this.wrap.css({
                    'padding': '0 0 0 0' /*+ parseInt(this.scroll.css('paddingLeft').replace('px', '')) + 'px'*/
                });
                this.content.css({
                    'overflow': 'hidden',
                    'position': 'relative'
                });
                this.dispCnt = Math.ceil(this.content.innerWidth() / this.itemWidth);
                this.scroll.css({
                    'width': this.count * this.itemWidth,
                    'padding': '0 0 0 0'
                });
                for (var i = 0; i < this.count; i++) {
                    this.btns.append('<li>\n<a href="#"><span>&nbsp;</span></a></li>');
                    if (this.now == i) {
                        $("a:last", this.btns).addClass('hover');
                    }
                }
                this.items.imagesLoaded(function () { self.imageLoaded(); });

            },
            appendEvent: function () {
                var obj = this;
                $('a', obj.btns).click(function () {
                    var idx = $('a', obj.btns).index($(this));
                    obj.showSlide(idx);
                    obj.timeSet();
                    return false;
                });
                $('a.next', this.container).click(function () {
                    obj.animate('next');
                    obj.timeSet();
                    return false;
                });

                $('a.prev', this.container).click(function () {
                    obj.animate('prev');
                    obj.timeSet();
                    return false;
                });

                obj.container.hover(function () {
                    obj.pause = true;
                    obj.timeSet();
                }, function () {
                    obj.pause = false;
                    obj.timeSet();
                });
                
            },
            animate: function (control) {
                var obj = this;
                
                var nowItem = this.now;
                var cnt = this.count - 1;
                switch (control) {
                    case "next":
                        this.now = (nowItem >= this.count - this.dispCnt) ? (this.options.continuous ? 0 : this.count - this.dispCnt) : this.now + 1;
                        break;
                    case "prev":
                        this.now = (this.now <= 0) ? (this.options.continuous ? (this.count == this.dispCnt ? 0 : this.count - this.dispCnt) : 0) : this.now - 1;
                        break;
                    default:
                        break;
                }
                var diff = Math.abs(nowItem - this.now);
                var speed = this.options.speed;
                
                if (diff > 1) { speed = this.options.speed - 1; }
                var p = (this.now * this.itemWidth * -1);
                this.scroll.animate({ marginLeft: p }, speed);

                $('a', this.btns).removeClass('hover').eq(this.now).addClass('hover');
            },
            showSlide: function (num) {
                
                var obj = this;
                
                //if (obj.pause) return;
                
                nowItem = this.now;
                
                if (typeof (num) != 'undefined') {
                    obj.now = num;
                }
                if (obj.now >= obj.count) {
                    obj.now = 0;
                }
                if (obj.now < 0) {
                    obj.now = obj.count - 1;
                }
                
                var diff = Math.abs(nowItem - this.now);
                var speed = this.options.speed;
                if (diff > 1) { speed = this.options.speed - 1; }
                var p = (this.now * this.itemWidth * -1);
                this.scroll.animate({ marginLeft: p }, speed);

                $('a', this.btns).removeClass('hover').eq(this.now).addClass('hover');
            },
            imageLoaded: function () {
                var self = this;
                $(this.img).each(function () {
                    var img = $(this);
                    var iWidth = img.width(), iHeight = img.height();
                    var eWidth = $(self.items).eq(0).innerWidth(), eHeight = $(self.items).eq(0).innerHeight();
                    var remain = 0;
                    if (iWidth > iHeight) {
                        remain = (-1) * ((iWidth * (eHeight / iHeight)) - eWidth) / 2;
                        img.css({
                            height: eHeight,
                            width: "auto",
                            left: remain,
                            visibility: 'visible'
                        }).attr({
                            'data-width': iWidth,
                            'data-height': iHeight
                        });
                    } else {
                        remain = (-1) * ((iHeight * (eWidth / iWidth)) - eHeight) / 2;
                        img.css({
                            width: eWidth,
                            height: "auto",
                            top: remain,
                            visibility: 'visible'
                        }).attr({
                            'data-width': iWidth,
                            'data-height': iHeight
                        });
                    }
                });
                
            },
            timeSet: function () {
                var obj = this;
                clearInterval(obj.timeout);
                obj.timeout = setInterval(function () {
                    if (!obj.pause)
                        obj.animate('next');
                }, obj.speed);
            }
            
        }
    });
})(jQuery);