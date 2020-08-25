$.extend($, {
    FaceBookWalls: function () {
        var url = "/Home/AsyncFacebook";
        var facebookList;
        var liClass = "";
        $.post(url, { limit: 5 }, function (result) {
        	
        	result = eval("(" + result + ")");
            $("li", "#fbTimeline").hide();
            $("li", "#fbTimeline").remove();
            $.each($(result.data), function (i) {
                liClass = "";
                if (i + 1 == 5) liClass = "last";
                facebookList = '<li class="' + liClass + '"><span class="pic"><a href="' + this.link + '" target="_blank"  class="fbProfile"><img src="' + fbPic(this) + '" alt=""/></a></span>';
                facebookList += '<div class="txt">' + fbTitle(this) + '<em class="artCol1">';
                facebookList += '<span class="wTime artCol1">' + fuzzyFacebookTime(this.created_time.replace(/-/g, '/')) + '</span></em></div></li>';
                $("#fbTimeline").append(facebookList);
            });
            $("li", "#fbTimeline").hide().fadeIn('slow');
            resizeImage();
        });

        function fbTitle(data) {
            var title = "";
            if (typeof (data.message) != "undefined") { title = data.message; }
            else if (typeof (data.story) != "undefined") { title = data.story;  }
            else if (typeof (data.description) != "undefined") { title = data.description;  }
            else if (typeof (data.type) != "undefined") { title = (data.type == "link" ? data.name : data.caption);  }
            else if (typeof (data.application) != "undefined") { title = data.name;  }
            

            return $.CutString(title, 70);
        }

        function fbPic(data) {
            var url = "https://graph.facebook.com/" + data.from.id + "/picture";
            if (typeof (data.picture) != "undefined") return data.picture;
            return url;
        }

        function resizeImage() {
            $(".fbProfile img", "#fbTimeline").each(function (i, img) {
                $(this).load(function () {
                    var maxWidth = 48;
                    var maxHeight = 48;
                    var imgWidth = $(this).width();
                    var imgHeight = $(this).height();
                    var newWidth = imgWidth;
                    var newHeight = imgHeight;

                    if (imgWidth < maxWidth && imgHeight < maxHeight) {
                        ;
                    } else {
                        if (imgWidth > imgHeight) {
                            newWidth = maxWidth;
                            newHeight = Math.ceil(imgHeight * maxWidth / imgWidth);
                        } else if (imgWidth < imgHeight) {
                            newWidth = Math.ceil(imgWidth * maxHeight / imgHeight);
                            newHeight = maxHeight;
                        } else {
                            newWidth = imgWidth;
                            newHeight = imgHeight;
                        }

                        if (newWidth > maxWidth) {
                            newWidth = maxWidth;
                            newHeight = Math.ceil(imgHeight * maxWidth / imgWidth);
                        }
                        if (newHeight > maxHeight) {
                            newWidth = Math.ceil(imgWidth * maxHeight / imgHeight);
                            newHeight = maxHeight;
                        }
                    }
                    $(this).width(newWidth).height(newHeight).css({
                        marginTop: parseInt((48 - newHeight) / 2) + "px",
                        marginLeft: parseInt((48 - newWidth) / 2) + "px"
                    });
                });
            });
        }
    }
});

var fuzzyFacebookTime = (function () {

    fuzzyTime.defaultOptions = {
        relativeTime: 48,
        monthNames: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        amPm: ['AM', 'PM'],
        ordinalSuffix: function (n) { return ['th', 'st', 'nd', 'rd'][n < 4 || (n > 20 && n % 10 < 4) ? n % 10 : 0] }
    }
    fuzzyTime.lang = getLang();
    function fuzzyTime(timeValue, options) {

        var options = options || fuzzyTime.defaultOptions,
			date = parseDate(timeValue),
 	        delta = parseInt(((new Date()).getTime() - date.getTime()) / 1000),
	        relative = options.relativeTime,
	        cutoff = +relative === relative ? relative * 60 * 60 : Infinity;

        if (relative === false || delta > cutoff)
            return formatDate(date, options);

        var minutes = parseInt(delta / 60 + 0.5);
        if (minutes <= 1) return '1 분 전';
        var hours = parseInt(minutes / 60 + 0.5);
        if (hours < 1) return minutes + ' 분 전';
        if (hours == 1) return '한 시간 전';
        if (hours <= 24) return hours + ' 시간 전';
        var days = parseInt(hours / 24 + 0.5);
        if (days <= 1) return hours + ' 시간 전';
        var weeks = parseInt(days / 7 + 0.5);
        if (weeks < 2) return days + ' 일 전';
        var months = parseInt(weeks / 4.34812141 + 0.5);
        if (months < 2) return weeks + ' 주 전';
        var years = parseInt(months / 12 + 0.5);
        if (years < 2) return months + ' 달 전';
        return years + ' 년 전';
    }

    function parseDate(str) {
        var v = str.replace(/[T\+]/g, ' ').split(' ');
        return new Date(Date.parse(v[0] + " " + v[1] + " UTC"));
    }

    function formatTime(date, options) {
        var h = date.getHours(), m = '' + date.getMinutes(), am = options.amPm;
        return (h > 12 ? h - 12 : h) + ':' + (m.length == 1 ? '0' : '') + m + ' ' + (h < 12 ? am[0] : am[1]);
    }



    function formatDate(date, options) {
        var mon = date.getMonth() + 1,
        day = date.getDate(),
        year = date.getFullYear(),
        thisyear = (new Date()).getFullYear(),
        suf = options.ordinalSuffix(day);

        if (fuzzyTime.lang == "ko") {
            return year + '. ' + zeroFill(mon) + '. ' + zeroFill(day);
        } else {
            return fuzzyTime.defaultOptions.monthNames[mon] + ' ' + zeroFill(day) + ', ' + year;
        }
    }

    function zeroFill(val) {
        if (val < 10) val = "0" + val.toString();
        else val = val.toString();
        return val;
    }
    function getLang() {
        if (typeof ($.BrowserLang) != "undefined") {
            return $.BrowserLang;
        }
        var lang = navigator.language || navigator.userLanguage;
        lang = lang.replace(/_/, '-').toLowerCase();
        if (lang.length > 3) {
            lang = lang.substring(0, 2); //Get First 2 Char
        }

        return lang;
    }
    return fuzzyTime;

} ());


(function ($, document) {
	$.fn.schedule = function () {
		var schedule = new $.Schedule(this[0]);
		schedule.init();
		schedule.load();
		schedule.addEvent();
		return schedule;
	};
	$.Schedule = function (container) {
		this.container = $(container);
		this.today;
		this.nowDate;
	}
	$.extend($.Schedule, {
		prototype: {
			init: function () {
				this.today = new Date();
				this.nowDate = this.today;
			},
			addEvent: function () {
				var sc = this;
				sc.container.find(".prev").click(function () {
					sc.addDate(-1);
					sc.load();
					return false;
				});

				sc.container.find(".next").click(function () {
					sc.addDate(+1);
					sc.load();
					return false;
				});
			},
			load: function () {
				var sc = this;
				$.post("/Main/Schedule", { year: sc.nowDate.getFullYear(), month: sc.nowDate.getMonth() + 1, date: sc.nowDate.getDate() }, function (data) {
					sc.setHtml(data);
				}, "json");
			},
			setHtml: function (data) {
				var sc = this;
                var monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                var dateStrKo = '<em class="artCol1">' + sc.nowDate.getFullYear() + '.' + sc.zeroFill(sc.nowDate.getMonth() + 1) + '.' + sc.zeroFill(sc.nowDate.getDate()) + '</em>';
                var dateStrEn = '<em class="artCol1">' + monthNames[sc.nowDate.getMonth() + 1] + ' ' + sc.zeroFill(sc.nowDate.getDate()) + ', ' + sc.nowDate.getFullYear() + '</em>';
				sc.container.find(".date").html((sc.getLang() == 'ko' ? dateStrKo : dateStrEn) + '<br />' + sc.getWeek());

				if (data == null || data.length <= 0 || data.SubNo == 0) {
                	sc.container.find('.schRg').html('<p class="tle"></p><p class="txt">'+((sc.getLang() == 'ko' ? '스케쥴 정보가 없습니다.' : 'No schedule data.'))+'</p>');
				} else {
					sc.container.find('.schRg').html('<p class="tle"><span class="scIcon ' + sc.getCateClass(data.Category.CategoryImage) + '">icon</span>' + sc.getCateTitle(data.Category.CategoryImage) + '</p><p class="txt">' + $.CutString(data.Title, 50) + '</p>');
				}
			},
			addDate: function (interval) {
				var sc = this;
				var d = new Date(sc.nowDate.getFullYear(), sc.nowDate.getMonth(), sc.nowDate.getDate() + interval);
				sc.nowDate = d;
			},
			getWeek: function () {
				var sc = this;
				var week = new Array("일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일");
                var weekEng = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
                var weekStr = sc.getLang() == "ko" ? week : weekEng;

				return weekStr[sc.nowDate.getDay()];
			},
			zeroFill: function (num) {
				var strNum = num.toString();
				if (num < 9)
					strNum = "0" + strNum;
				return strNum;
			},
			getCateTitle: function (category) {
				var title;
				switch (category) {
					case "TV": title = "TV방송"; break;
					case "RADIO": title = "라디오"; break;
					case "MIC": title = "공연"; break;
					case "CD": title = "발매"; break;
					case "ETC": title = "기타"; break;
					case "CAKE": title = "생일"; break;
					case "BALLOON": title = "기념일"; break;
					default: title = "기타"; break;
				}
				return title;
			},
			getCateClass: function (category) {
				if (category == "BALLOON") {
					category = category + " " + $.Domain.ToLower();
				}
				return 'ico' + category;
			},
            getLang: function() {
                if(typeof($.BrowserLang) != "undefined") return $.BrowserLang;
                var lang = navigator.language || navigator.userLanguage;
                lang = lang.replace(/_/, '-').toLowerCase();
                if (lang.length > 3) {
                    lang = lang.substring(0, 2); //Get First 2 Char
                }

                return lang;
            }       
		}
	});
})(jQuery);

$(document).ready(function () {
    $("#toSchdule").schedule();
    
});