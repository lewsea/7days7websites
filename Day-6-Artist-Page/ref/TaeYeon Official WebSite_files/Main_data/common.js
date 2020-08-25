$.extend($, {
    CommonVersion: "0.5",
    CookieDomain: "smtown.com",
    Charset: "utf-8",

    CutString: function (str, len) {
        //var str = this;
        if (str == undefined || str == "") {
            return str;
        }
        var l = 0;
        for (var i = 0; i < str.length; i++) {
            l += (str.charCodeAt(i) > 128) ? 2 : 1;
            if (l > len) return str.substring(0, i) + "..";
        }
        return str;
    },

    GetByteLen: function (arg) {
        var cnt = 0;
        for (var i = 0; i < arg.length; i++) {
            if (arg.charCodeAt(i) > 127)
                cnt += 2;
            else
                cnt++;
        }
        return cnt;
    },

    OpenWindow: function (url, name, option) {
        var pop = window.open(url, name, option);
        pop.focus();
    },

    OpenWinCenter: function (url, w, h, name, scroll, t /*top*/, l /*left*/) {
        if (scroll == null)
            scroll = "yes";
        if (name == null)
            name = "popWin";
        if (t == null)
            t = (screen.height - h) / 2;
        if (l == null)
            l = (screen.width - w) / 2;

        var PopWin = window.open(url, name, "toolbar=0, channelmode=0, location=0, directories=0, resizable=0, menubar=0, scrollbars=" + scroll + ", width=" + w + ", height=" + h + ", top=" + t + ", left=" + l);
        if (PopWin == null) {
            alert('팝업이 차단되어 있습니다.\n\n화면 상단의 차단메세지를 클릭하여 팝업을 허용해주세요.');
            return;
        }

        PopWin.focus();
        return PopWin;
    },

    ResizeImage: function () {
        $(".image_resize").each(function (i, img) {
            $(img).css("position", "absolute");
            var pw = $(img).parent().innerWidth();
            var plp = parseInt($(img).parent().css("padding-left").replace("px", ""));
            var prp = parseInt($(img).parent().css("padding-right").replace("px", ""));
            var tw = pw - (plp + prp);
            var iw = $(img).outerWidth();
            var ih = $(img).outerHeight();

            if (iw > tw) {
                $(img).width(tw).height(parseInt(tw / (iw / ih)));
            }
            $(img).css("position", "");
        });
    },

    Format: function () {
        var i = 0;
        var string = (typeof (this) == "function" && !(i++)) ? arguments[0] : this;

        for (; i < arguments.length; i++)
            string = string.replace(/\{\d+?\}/, arguments[i]);

        return string;
    },

    SetStartPage: function () {
        if (document.all) {
            document.body.style.behavior = 'url(#default#homepage)';
            document.body.setHomePage($.Domain);
        }
        else if (window.sidebar) {
            if (window.netscape) {
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                }
                catch (e) {
                    if ($.GetUserLang() == "ko")
                        alert("브라우저 주소 창에 ″about:config″를 입력하신 후 \n\n″signed.applets.codebase_principal_support″ 값을 ″true″로 만드세요");
                    else
                        alert("this action was aviod by your browser，if you want to enable，please enter ″about:config″ in your address line,\n\nand change the value of ″signed.applets.codebase_principal_support″ to ″true″");
                }
            }
            var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
            prefs.setCharPref('browser.startup.homepage', $.Domain);
        }

    },

    //Current User Language
    UserLang: null,

    //Set this.UserLang and return UserLang
    getUserLang: function (lang) {
        if (typeof (lang) != "undefined") {
            this.UserLang = lang;
        } else if ($.Cookie("shLang") != null && $.Cookie("shLang") != "") {
            this.UserLang = $.Cookie("shLang");
        } else if (this.UserLang == null) {
            var lang = navigator.language || navigator.userLanguage;
            lang = lang.replace(/_/, '-').toLowerCase();
            if (lang.length > 3) {
                lang = lang.substring(0, 2); //Get First 2 Char
            }
            this.UserLang = lang;
        }
        return this.UserLang;
    },

    //Language Set
    LangSet: {},

    //Get Page LanguageSet by JSON
    getLangJson: function (lang, action, method, callback) {
        if (typeof (lang) == "undefined" || lang == "") {
            lang = $.getUserLang();
        }
        $.getJSON("/API/GetResourceMessage", { cName: action, mName: method, lang: lang }, function (result) {
            jQuery.extend(jQuery.LangSet, eval(result));
            if (typeof (callback) != "undefined") {
                callback(jQuery.LangSet);
            }
        });
    },

    JsonToString: function (object) {
        if (typeof object != 'object') return object;
        var result = [];
        for (var property in object) {
            var value = object[property];
            result.push('"' + property.toString() + '": ' + $.ArrayToString(value));
        }

        return '{' + result.join(', ') + '}';
    },

    ArrayToString: function (object) {
        var result = [];
        if (Object.prototype.toString.call(object) == '[object Array]') {
            for (var i = 0; i < object.length; i++) {
                if (Object.prototype.toString.call(object[i]) == '[object Array]') {
                    result.push($.ArrayToString(object[i]));
                } else if (Object.prototype.toString.call(object[i]) == '[object Object]') {
                    result.push($.JsonToString(object[i]));
                } else {
                    result.push('"' + object[i] + '"');
                }
            }
            return '[' + result.join(', ') + ']';
        }
        else
            return '"' + object + '"';
    },

    /*
    get : $.Cookie('key');
    set : $.Cookie('key', 'value');
    set with options : $.Cookie('key', 'value', { expires: 7, path: '/', domain: $.CookieDomain, secure: true });
    */
    Cookie: function (key, value, options) {
        if (arguments.length > 1 && String(value) !== "[object Object]") {
            options = jQuery.extend({
                expires: '',
                //domain: $.Domain + "." + $.CookieDomain,
                domain: "." + $.CookieDomain,
                path: '/'
            }, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=',
                options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        options = value || {};
        var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
        return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
    },

    /* Set my profile image  */
    ProfileImage: function () {
        var no = "";
        $(".picImg").each(function (i, img) {
            no = $(img).attr("profile").replace("Profile_", "");
            $.getJSON("/API/ProfileImage", { profileNo: no }, function (result) {
                if (result.ProfilePicture.length > 0) {
                    if (typeof (result.ProfileType) != "undefined") {
                        $(img).parent().find('.profileImgType').addClass('sns' + result.ProfileType);
                    }
                    $(img).attr("src", result.ProfilePicture);
                }
            });
        });

    },
    SetProfileImage: function () {
        $(".picImg").each(function (i, img) {
            var code = $(img).attr("profile-data");
            $.getJSON("/API/SNSProfileImage", { profileCode: code }, function (result) {
                if (result.ProfilePicture.length > 0) {
                    if (typeof (result.ProfileType) != "undefined") {
                        $(img).parent().find('.profileImgType').addClass('sns' + result.ProfileType);
                    }
                    $(img).attr("src", result.ProfilePicture);
                }
            });
        });
    },
    /* Music Video (Floating Layer Pop-up) */
    MusicVideoPlay: function (mvNo, vType, parentHide) {
        if ($("#viewMv").length < 1) {
            $("body").append("<div id='viewMv'></div>");
        }
        $("#viewMv").load("/API/VideoPlayer/", { vID: mvNo, vType: vType }, function () {
            parent.$.Player.NewVideoPlayed = false;
            parent.$.Player.ApiPlayer('stop');//in
            var viewMv = $(this);
            var MP3Play = false;
            $.ShowFog();
            $.HidePlayer(true);
            if (typeof (parentHide) != 'undefined') {
                $('#' + parentHide).fadeOut();
            }
            if (typeof (NewVideo) != "undefined") {
                var state = NewVideo.getPlayerState();
                if (state == 1)
                    NewVideo.pauseVideo();
            }
            if (typeof (NewVideo) != "undefined") {
                var state = NewVideo.getPlayerState();
                if (state == 1)
                    NewVideo.pauseVideo();
            }
            var mvInfo = viewMv.find('#mvInfo');
            if (mvInfo.find('.mvType').text() == "01") {
                if (jQuery.browser.mobile || true) {
                    $("#mvPlayPOP").html('<iframe id="player" type="text/html" width="867" height="487" src="https://www.youtube.com/embed/' + mvInfo.find('.mvInfoID').text() + '?enablejsapi=1&playerapiid=NewVideo&autoplay=1&hd=1&controls=1&version=3" frameborder="0"></iframe>');
                } else {
                    swfobject.embedSWF(
                        "/Flash/flashYoutube.swf", "mvPlayPOP", "867", "487", "10.0.0", "/Flash/expressInstall.swf",
                        { mvid: mvInfo.find('.mvInfoID').text(), autoplay: 1, modestbranding: 1 },
                        { wmode: "transparent", bgcolor: "#000000", allowFullScreen: true, allowScriptAccess: "always" },
                        { id: "SWFmvPlay", name: "SWFmvPlay" }
                    );
                }
                if (typeof (parent.$.Player) != "undefined" && parent.$.Player.isPause == false && parent.$.Player.isStop == false) {
                    MP3Play = true;
                    parent.$.Player.ApiPlayer("stop");
                }
            } else {
                Silverlight.createObject(
                    "/Flash/SMPlayer.xap", document.getElementById('mvPlayPOP'), "SLmvPlay",
                    {
                        width: "100%", height: "464", background: "black", version: "3.0.40818.0"
                    },
                    {},
                    "url=" + mvInfo.find('.mvInfoID').text() + ",autoplay=true",
                    "userContext"
               );
            }

            viewMv.find('.mvTit').text(mvInfo.find('.mvInfoTitle').text());
            viewMv.find('.singer').text(mvInfo.find('.mvInfoArtist').text());
            viewMv.find('.mvdata li .date').text(mvInfo.find('.mvInfoDate').text());
            viewMv.find('.mvdata li .hits').text(mvInfo.find('.mvInfoHit').text());
            viewMv.fadeIn('slow').find(".goReply").bind("click", function () {
                $("#mvComment").toggle();
                $(".mvCon .overlay").toggleClass("square");
                $.IframeHeight($("iframe", "#mvComment"));
                return false;

            });
            viewMv.find('.dimClose').click(function () {
                viewMv.fadeOut(800, function () {
                    parent.$.Player.ApiPlayer('play');//in

                    if (typeof (parentHide) != 'undefined') {
                        $('#' + parentHide).fadeIn();
                    } else {
                        ;
                    }
                    $.ShowPlayer(true);
                    $.HideFog('mvFog');
                    viewMv.find('.mvPlay').html('');
                    if (typeof (parent.$.Player) != "undefined" && MP3Play == true) {
                        if (parent.$.Player.isPause == true || parent.$.Player.bgmPlay != true) {
                            parent.$.Player.ApiPlayer("play");
                        }
                    }
                });
                return false;
            });

            $(this).css({
                top: ($(window).height() < $(this).height() ? $(window).scrollTop() : ($(window).height() - $(this).height()) / 2 + $(window).scrollTop()) + 'px'
            });
        });


    },
    MediaPlayer: function (url, closeCallback) {
        var mvInfo = $('#' + url);

        if ($.mobileOS.any() || $.isTablet()) {
            switch (mvInfo.find('.mvType').text()) {
                case '01': window.open("http://m.youtube.com/watch?v=" + mvInfo.find('.mvInfoID').text(), "movie"); break; //youtube
            	case '02': window.open("http://tvcast.naver.com/v/" + mvInfo.find('.tvcastID').text(), "movie"); break; //tvcast
                case '03': window.open("https://www.vlive.tv/embed/" + mvInfo.find('.mvInfoID').text(), "movie"); break; //vlive
                case '04': window.open(mvInfo.find('.mvInfoID').text() + ".mp4", "movie"); break; //sm-self
            }

            return false;
        }
        if ($("#viewMv").length < 1) {
            $("body").append("<div id='viewMv'></div>");
        }
        $("#viewMv").load("/API/MediaPlayer/", { vID: url }, function () {
            var viewMv = $(this);
            viewMv.find('.mvTit').text(mvInfo.find('.mvInfoTitle').text());
            viewMv.find('.singer').text(mvInfo.find('.mvInfoArtist').text());
            viewMv.find('.mvdata li .date').text(mvInfo.find('.mvInfoDate').text());
            viewMv.find('.mvdata li .hits').text(mvInfo.find('.mvInfoHit').text());
            $.ShowFog();

            switch (mvInfo.find('.mvType').text()) {
                case '01': $("#mvPlayPOP", viewMv).html('<iframe width="867" height="487" src="http://www.youtube.com/embed/' + mvInfo.find('.mvInfoID').text() + '" frameborder="0" allowfullscreen></iframe>'); break;
            	case '02': $("#mvPlayPOP", viewMv).html('<iframe src="http://serviceapi.rmcnmv.naver.com/flash/outKeyPlayer.nhn?vid=' + mvInfo.find('.mvInfoID').text() + '&outKey=' + mvInfo.find('.mvInfoOutKey').text() + '" frameborder="no" scrolling="no" marginwidth="0" marginheight="0" WIDTH="867" HEIGHT="487" style="width:867px; height:487px;"></iframe>'); break;
                case '03': $("#mvPlayPOP", viewMv).html('<iframe width="867" height="487" src="https://www.vlive.tv/embed/' + mvInfo.find('.mvInfoID').text() + '?autoPlay=true" frameborder="no" scrolling="no" marginwidth="0" marginheight="0" WIDTH="867" HEIGHT="487" style="width:867px; height:487px;" allowfullscreen></iframe>'); break;
                case '04': $("#mvPlayPOP", viewMv).html(''
                                + '<video style="width:867px; height:487px; outline:none;" width="867" height="487" controls autoplay preload="auto" >'
                                + '  <source src="' + mvInfo.find('.mvInfoID').text() + '.webm' + '" type="video/webm"/>'
                                + '  <source src="' + mvInfo.find('.mvInfoID').text() + '.mp4' + '" type="video/mp4"/>'
                                + '  Your browser does not support the video tag.'
                                + '</video>'
                            );
                    break;
            }

            //<iframe width="560" height="315" src="http://www.youtube.com/embed/XAC5KRMyiQk" frameborder="0" allowfullscreen></iframe>
            viewMv.fadeIn('slow');
            viewMv.find('.dimClose').click(function (e) {
                viewMv.fadeOut(800, function () {
                    $.HideFog('mvFog');
                    viewMv.find('.mvPlay').html('');
                });
                if (typeof (eval(closeCallback)) == "function") {
                    eval(closeCallback)();
                }
                e.preventDefault();
            });

            $(this).css({
                top: ($(window).height() < $(this).height() ? $(window).scrollTop() : ($(window).height() - $(this).height()) / 2 + $(window).scrollTop()) + 'px'
            });
        });
    },
    /* Artist Profile (Floating Layer Pop-up) */
    ArtistProfile: function (aid, options) {
        this.container = null;
        this.parentContainer = $("#conLf");
        if (isNaN(aid) || parseInt(aid) <= 0)
            return false;
        if ($('#abView', '#conLf').length < 1) {
            this.container = $('<div id="abView"></div>');
            this.container.appendTo(this.parentContainer);
        } else {
            this.container = $('#abView', this.parentContainer);
        }
        this.tabs = ["tab_album", "tab_mv", "tab_work", "tab_career", "tab_gallery"];
        var profile = this;
        profile.container.load('/Artists/Show/' + aid.toString(), function () {
            $('.profile_tab a', profile.container).click(function () {
                var idName = $(this).attr('id');
                if ($.isArray(idName, profile.tabs) > -1) {
                    profile.tabChange(idName);
                }
                return false;
            });
            $('.profile_tab a:first', profile.container).click();
            $('.dimClose', profile.container).click(function () {
                if ($.browser.msie) {
                    profile.container.hide();
                } else {
                    profile.container.fadeOut();
                }
                $.ShowPlayer(false);
                return false;
            });
            var imgUrl;
            $(this).css({
                top: ($(window).height() < $(this).height() ? $(window).scrollTop() - $("#conLf").offset().top : ($(window).height() - $(this).height()) / 2 + $(window).scrollTop() - $("#conLf").offset().top) + 'px'
            });
            if ($.browser.msie) {
                $(this).show();
            } else {
                $(this).fadeIn();
            }
        });

        this.tabChange = function (name) {
            $.each(profile.tabs, function (i, btn) {
                if (name == btn) {
                    $("#" + btn).addClass("t_on").removeClass("t_off");
                    $('#ArtistContent', profile.container).attr("src", "/Artists/Contents/?aid=" + aid + "&type=" + btn);
                } else {
                    $("#" + btn).addClass("t_off").removeClass("t_on");
                }
            });
        }
    },

    /* Image Gallery (Floating Layer Pop-up) $.ImageGallery('artist', '44', '1047', '09');*/
    ImageGallery: function (contenttype, contentid, gid, parentHide, tag) {
        if (!contenttype) contenttype = "";
        if (!contentid) contentid = "";
        if (!gid) gid = "1";
        if (!tag) tag = "";

        if ($("#imgGallery").length < 1) {
            $("body").append('<div id="imgGallery"><div id="imageGallerySWF"></div></div>');
        }
        $.ShowFog();
        $.HidePlayer();
        if (typeof (parentHide) != 'undefined' && parentHide != "") {
            $('#' + parentHide).fadeOut();
            PopParent = parentHide;
        }
        $("#imgGallery").css({
            position: "absolute",
            width: "100%",
            height: "1024px",
            zIndex: "600",
            top: $(window).scrollTop() + 'px',
            left: 0
        }).show();
        swfobject.embedSWF(
            "/Flash/ImageGallery.swf", "imageGallerySWF", "100%", "100%", "9.0.0", "/Flash/expressInstall.swf",
            { gid: gid, contentid: contentid, contenttype: contenttype, tag: tag },
            { wmode: "transparent", allowScriptAccess: "always" },
            { id: "imageGallery", name: "imageGallery" }
        );
    },
    HighslideGallery: function (obj, parentHide) {
        if (hs != undefined) {

            $.HidePlayer(true);
            if (typeof (parentHide) != 'undefined') {
                $('#' + parentHide).fadeOut();
                PopParent = parentHide;
            }

            var parentWraper = $(obj).parents("ul");
            var lists = parentWraper.find("a");
            var index = lists.index(obj);
            $("#hidden_gallery", "body").remove();

            $("body").append("<div id='hidden_gallery'></div>");
            lists.each(function (i, item) {
                var href = $(item).attr("href");
                $("#hidden_gallery").append("<a href='" + href + "' class='highslide' onclick='return hs.expand(this, {});'>" + i + "</a>");
            });

            hs.updateAnchors();
            $("a", "#hidden_gallery").eq(index).click();
            hs.Expander.prototype.onAfterClose = function (sender) {
                $.ShowPlayer(true);
                if (typeof (parentHide) != 'undefined') {
                    $('#' + parentHide).fadeIn();
                }
            };
        }
        return false;
    },
    FaceBook: function (type, id) {
        //var host = window.location.hostname;
        //var fullLink = host + link;
        //var url = "http://www.facebook.com/sharer.php?t=" + encodeURI(subject) + "&u=" + encodeURI(fullLink);
        $.get("/SNS/GetShareUrl", { type: type, id: id, sns: "facebook" }, function (data) {
            if (data != undefined && data != "") {
                $.OpenWindow(data, 'sns', 'width=500, height=500, scrollbars=no');
            }
        });

    },

    Twitter: function (type, id) {
        //var host = window.location.hostname;
        //var fullLink = link;
        //var url = "http://twitter.com/?status=" + encodeURIComponent(subject) + " " + escape(fullLink) + " - smtown";
        $.get("/SNS/GetShareUrl", { type: type, id: id, sns: "twitter" }, function (data) {
            if (data != undefined && data != "") {
                $.OpenWindow(data, 'sns', '');
            }
        });
    },

    ShowFog: function () {
        $('#layer_transparency').show();
    },

    HideFog: function (id) {
        $('#layer_transparency').hide();
    },

    ShowPlayer: function (mute) {
        if (parent.$.Player)
            parent.$.Player.playerShow();
    },

    HidePlayer: function (mute) {
        if (parent.$.Player)
            parent.$.Player.playerHide();
    },

    AutoHeight: function (id) {
        var $this = $("#" + id);
        var content = null;
        resizeHeight($this);
        function resizeHeight(targetFrame) {
            targetFrame = targetFrame.get(0);
            var newHeight = 0;
            if (targetFrame.contentWindow) {
                content = targetFrame.contentWindow.document;
            }
            else {
                content = targetFrame.contentDocument.document;
            }

            $("body > *:visible", content).each(function () {
                newHeight += $(this).outerHeight(true);
            });
            targetFrame.style.height = newHeight + 'px';
        }
    },
    MoveVersion: function (version, target, obj) {
    	try{
    		if (obj && $("option:selected", obj).data('teaser') == 'T') {
    			//console.log(top, "1");
    			if (top) {
    				top.location.href = "http://" + $.Domain + ".smtown.com/?ver=" + version;
    			}
    		}
    	} catch (e) {
			;
    	}
        if (target == undefined || target == '_self') {
            document.location.href = "/Main?ver=" + version;
        } else if (target == '_blank') {
            $.OpenWindow("http://" + $.Domain + ".smtown.com/?ver=" + version);
        } else if (target == "_opener") {
            opener.document.location.href = "http://" + $.Domain + ".smtown.com/?ver=" + version;
        }
    },
    ChangeLang: function (value) {
        $.Cookie("Lang", value.toLowerCase());
        document.location.reload();
    },
    IframeHeight: function (obj) {
        var $this = obj;
        var content = null;
        resizeHeight($this);
        function resizeHeight(targetFrame) {
            targetFrame = targetFrame.get(0);
            var newHeight = 0;
            if (targetFrame.contentWindow) {
                content = targetFrame.contentWindow.document;
            }
            else {
                content = targetFrame.contentDocument.document;
            }

            $("body > *:visible", content).each(function () {
                newHeight += $(this).outerHeight(true);
            });
            targetFrame.style.height = newHeight + 'px';
        }
    },
    mobileOS: {
        Android: function () {
            return navigator.userAgent.match(/Android/i) ? true : false;
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i) ? true : false;
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;
        },
        Windows: function () {
            return navigator.userAgent.match(/Windows Phone|IEMobile/i) ? true : false;
        },
        any: function () {
            return ($.mobileOS.Android() || $.mobileOS.BlackBerry() || $.mobileOS.iOS() || $.mobileOS.Windows());
        }
    },
    isTablet: function () {
        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if (width > 640 && $.mobileOS.any()) {
            return true;
        } else {
            return false;
        }
    }
});

var PopParent = '';
function closeFlash() {
	$("#imgGallery").hide("fast", function () {
		if (typeof (PopParent) != 'undefined' && PopParent != '') {
			$('#' + PopParent).fadeIn();
		} else {
			;
		}
		$.ShowPlayer();
		$.HideFog();
		$("#imgGallery").remove();
		PopParent = '';
	});
}

(function ($) {
	//체크 박스 전체 선택
	$.fn.checkAll = function () {
		this.click(function () {
			var checkbox = $(this);
			$('input:checkbox[name=' + checkbox.attr('target') + ']').not(":disabled").attr('checked', checkbox.is(':checked') ? 'checked' : '');
		});
		return this;
	};
})(jQuery);

$(document).ready(function () {
	try{
		if (parent && parent.$.Player && typeof (parent.$.Player) != "undefined") {
			if (window.location.pathname.toLowerCase() != "/videos") {
				if (parent.$.Player.NewVideoPlayed == true) {
					parent.$.Player.ApiPlayer("play");
					parent.$.Player.NewVideoPlayed = false;
				}
			}
		}
	} catch (e) {

	}
});