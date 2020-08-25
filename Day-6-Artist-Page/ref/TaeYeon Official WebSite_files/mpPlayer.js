(function ($, document) {
    $.fn.player = function (options) {
        var player = new $.Player(options, this[0]);
        player.init();
        player.addEvent();
        return player;
    };
    $.Player = function (options, container) {
        this.settings = $.extend(true, {}, $.Player.defaults, options);
        this.container = container;
        this.domain = "";
        this.version = "";
        this.MusicList = [];
        this.maxLength = -1;
        this.isFrist = true;
        this.isPause = false;
        this.isStop = true;
        this.isRepeat = false;
        this.isShuffle = false;
        this.isMute = false;
        this.isHide = false;
        this.Volume = 10;
        this.SaveVolume = 0;
        this.nowPlay = -1;
        this.playedTime = 0;
        this.timeOut = null;
        this.isPlayList = false;
        this.isLyrics = false;
        this.page = 1;
        this.bgm = "";
        this.bgmPlay = false;
        this.currentPlayer = "";
        this.NewVideoPlayed = false;
    };
    $.extend($.Player, {
        defaults: {
            volumeStep: 1,
            pageSize: 10,
            flashID: 'mpPlayer',
            BGflashID: 'bgPlayer'
        },
        prototype: {
            init: function () {
                this.songInfo = $('.song_info', this.container);
                this.playList = $('#playList', this.container);
                this.lyrics = $('#lyrics', this.container);
                this.timeLine = $('#timeLIne', this.container);
                swfobject.embedSWF(
                   "/Flash/mp3flash.swf", "mpPlayerObject", "1", "1", "9,0,0,0", "/Flash/expressInstall.swf",
                    {},
                    { allowScriptAccess: "sameDomain", wmode: "window" },
                    { id: 'mpPlayer', name: 'mpPlayer' }
                );
                swfobject.embedSWF(
                   "/Flash/bgmflash.swf", "bgPlayerObject", "1", "1", "9,0,0,0", "/Flash/expressInstall.swf",
                    {},
                    { allowScriptAccess: "sameDomain", wmode: "window" },
                    { id: 'bgPlayer', name: 'bgPlayer' },
                    function () {
                        swfInitialize('bgPlayer', $.Player.InitBGM);
                    }
                );
                $('.volumeBar', $.Player.container).slider({
                    range: "min", value: 10, min: 0, max: 10, slide: function (event, ui) {
                        $.Player.Volume = ui.value;
                        $.Player.volumeControl();
                    }
                });
                $('.timeBar', $.Player.container).slider({
                    range: "min", value: 0, min: 0, max: 360, slide: function (event, ui) {
                        $.Player.Jump(ui.value);
                    }
                });
                $('.timeBar', $.Player.container).slider("disable");
            },
            Play: function () {
                if (this.MusicList.length > 0) {
                    if (this.nowPlay < 0) this.nowPlay = 0;
                    this.playedTime = 0;
                    this.setInfo();
                    //timeBar
                    $('.timeBar', $.Player.container).slider("option", {
                        value: 0, min: 0, max: $.Player.MusicList[$.Player.nowPlay].RunningTime
                    });
                    $('.timeBar', $.Player.container).slider("enable");
                    $.Player.PauseBGM();
                    MovieObject(this.settings.flashID).mp3playSong(this.MusicList[this.nowPlay].MpURL);
                    this.timeOut = setInterval(function () {
                        $.Player.playTime();
                    }, 1000);
                    this.isFirst = false;
                    this.isStop = false;
                    this.isPause = false;
                    this.MusicList[this.nowPlay].Played = true;
                    $.Player.currentPlayer = "mp3";
                    $('#pBt_play', this.container).removeClass('play').addClass('pause');
                }
            },
            Jump: function (sec) {
                this.playedTime = sec;
                clearInterval(this.timeOut);
                MovieObject(this.settings.flashID).mp3Second(sec);
                $('.timeNowPlay', this.timeLine).text(this.convTime(sec));
                this.timeOut = setInterval(function () {
                    $.Player.playTime();
                }, 1000);
            },
            Pause: function () {
                $('#pBt_play', this.container).removeClass('pause').addClass('play');
                clearInterval(this.timeOut);
                this.isPause = true;
                MovieObject(this.settings.flashID).mp3Pause();
                $.Player.ResumBGM();
            },
            Resum: function () {
                $('#pBt_play', this.container).removeClass('play').addClass('pause');
                this.timeOut = setInterval(function () {
                    $.Player.playTime();
                }, 1000);
                this.isPause = false;
                $.Player.PauseBGM();
                $.Player.currentPlayer = "mp3";
                MovieObject(this.settings.flashID).mp3Play();
            },
            Stop: function (controller) {
                if (controller == false) {
                    $('#pBt_play', this.container).removeClass('pause').addClass('play');
                }
                clearInterval(this.timeOut);
                $('.timeNowPlay', this.timeLine).text('00:00');
                MovieObject(this.settings.flashID).mp3playSong("");
                $('#pBt_play', this.container).removeClass('pause').addClass('play');
                this.isStop = true;
                $.Player.ResumBGM();
            },
            setInfo: function () {
                clearInterval(this.timeOut);
                this.songInfo.html('<strong>' + this.MusicList[this.nowPlay].TrackTitle + '</strong> I ' + this.MusicList[this.nowPlay].ArtistName);
                $('#lyrics_wrap', this.lyrics).html('<div class="content"></div>');
                $('.content', this.lyrics).html(this.MusicList[this.nowPlay].TrackLyrics);
                $('#lyrics_wrap', this.lyrics).scrollbar({ containerHeight: 230 });
                $('.timeNowPlay', this.timeLine).text('00:00');
                $('.timeTotal', this.timeLine).text(this.convTime(this.MusicList[this.nowPlay].RunningTime));
            },
            playTime: function () {
                this.playedTime++;
                $('.timeNowPlay', this.timeLine).text(this.convTime(this.playedTime));
                $('.timeBar', $.Player.container).slider("value", $.Player.playedTime);
                if (this.playedTime == this.MusicList[this.nowPlay].RunningTime)
                    $.Player.playNext(true);
            },
            addMusic: function (aid, tid, type) {
                if (typeof (redraw) == 'undefined') redraw = true;
                $.post("/API/Song", { albumID: aid, trackID: tid }, function (data) {
                    if (data == null)
                        return false;
                    if (data.ErrorMessage != "") {
                        alert(data.ErrorMessage);
                        return false;
                    } else {
                        data.Played = false;
                        data.ApplyLyrics = false;
                        if ($.Player.MusicList.length < 1) $.Player.isFirst = true;
                        if (type == "play") {
                            $.Player.MusicList.unshift(data);
                            $.Player.nowPlay = 0;
                            $.Player.Play();
                        }
                        if (type == "add") {
                            $.Player.MusicList.push(data);
                        }
                        $.Player.maxLength++;
                        $.Player.drawPlayList();
                        $.Player.playerShow();
                    }
                }, "json");
            },
            addMusics: function (aid, arr, type) {
                for (var i = 0; i < arr.length; i++) {
                    if (i == 0 && type == 'play')
                        this.addMusic(aid, arr[i], type);
                    else
                        this.addMusic(aid, arr[i], 'add');
                }
            },
            delMusics: function (arr) {
                var tempMusicList = [];
                for (var i = 0; i < arr.length; i++) {
                    this.MusicList[arr[i]] = "";
                }
                for (var i = 0; i <= this.maxLength; i++) {
                    if (this.MusicList[i] == "")
                        continue;
                    else
                        tempMusicList.push(this.MusicList[i]);
                }
                this.MusicList = "";
                this.MusicList = tempMusicList;
                this.maxLength = this.MusicList.length - 1;
                this.drawPlayList();
            },
            playNext: function (controller) {
                if (typeof (controller) == 'undefined') controller = false;

                if (this.isShuffle) {
                    this.nowPlay = this.getRandom();
                    this.Play();
                } else {
                    this.nowPlay++;
                    if (this.nowPlay > this.maxLength) {
                        if (this.isRepeat) {
                            this.nowPlay = 0;
                            this.Play();
                        } else {
                            if (this.maxLength >= 0) this.nowPlay = this.maxLength;
                            this.Stop(controller);
                        }
                    } else {
                        this.Play();
                    }
                }
            },
            playPrev: function (controller) {
                if (typeof (controller) == 'undefined') controller = false;
                if (this.isShuffle) {
                    this.nowPlay = this.getRandom();
                    this.Play();
                } else {
                    this.nowPlay--;
                    if (this.nowPlay < 0) {
                        if (this.isRepeat) {
                            this.Play();
                        } else {
                            if (this.maxLength >= 0) this.nowPlay = 0;
                            this.Stop(controller);
                        }
                    } else {
                        this.Play();
                    }
                }
            },
            getRandom: function () {
                var notPlay = [];
                for (var i = 0; i < this.MusicList.length; i++) {
                    if (this.MusicList[i].Played == false) {
                        notPlay.push(i);
                    }
                }
                if (notPlay.length == 0) {
                    for (var i = 0; i < this.MusicList.length; i++) {
                        this.MusicList[i].Played = false;
                        notPlay.push(i);
                    }
                }

                var ranNum = Math.floor(Math.random() * notPlay.length);

                return notPlay[ranNum];
            },
            Shuffling: function () {
                this.MusicList.sort(function () { return 0.5 - Math.random() });
            },
            buildPlayList: function (num) {
                var html = [];
                html.push('<li>');
                html.push('\t<span class="pl_chk"><input type="checkbox" class="chk" value="' + num + '"></span>');
                html.push('\t<span class="pl_num">' + (num + 1) + '</span>');
                html.push('\t<span class="pl_tle">' + this.MusicList[num].TrackTitle + '</span>');
                html.push('\t<span class="pl_name">' + this.MusicList[num].ArtistName + '</span>');
                html.push('</li>');
                this.playList.find('ul').append(html.join(""));
            },
            drawPlayList: function (control) {
                if (!this.page) this.page = 1;

                var total_count = this.MusicList.length;
                var total_page = Math.ceil(this.MusicList.length / this.settings.pageSize);

                if (control == 'prev') {
                    this.page--;
                    if (this.page < 1) this.page = 1;
                }
                if (control == 'next') {
                    this.page++;
                    if (this.page > total_page) this.page = total_page;
                }

                var start_row = (this.page - 1) * this.settings.pageSize;
                this.playList.find('ul li').remove();
                for (var i = start_row; i < start_row + this.settings.pageSize; i++) {
                    if (total_count <= i) break;
                    this.buildPlayList(i);
                }
                this.playList.find('#pl_prev').show();
                this.playList.find('#pl_next').show();
                if (total_page == this.page || total_page == 0) {
                    this.playList.find('#pl_next').hide();
                }
                if (this.page < 2) {
                    this.playList.find('#pl_prev').hide();
                }
                this.playListEvent();
            },
            convTime: function (totSec) {
                var min = parseInt(totSec / 60).toString();
                var sec = parseInt(totSec % 60).toString();
                if (min.length < 2) {
                    for (var i = 0; i < 2 - min.length; i++) {
                        min = '0' + min;
                    }
                }
                if (sec.length < 2) {
                    for (var i = 0; i < 2 - sec.length; i++) {
                        sec = '0' + sec;
                    }
                }
                return min + ':' + sec;
            },
            playerShow: function () {
                var bottom = 0;
                bottom = parseInt($(this.container).css("bottom").replace("px", ""));
                if (bottom < 0) {
                    $(this.container).animate({ "bottom": "0px" }, 800);
                }
                $.Player.isHide = false;
            },
            playerHide: function () {
                $.Player.playList.slideUp('fast');
                $.Player.lyrics.slideUp('fast');
                $(this.container).animate({ "bottom": "-45px" }, 800);
                $('#pBt_list', this.container).removeClass("pOn");
                $('#pBt_text', this.container).removeClass("pOn");
                $.Player.isHide = true;
            },
            volumeControl: function (control) {
                if (control != true) {
                } else {
                    $('.volumeBar', $.Player.container).slider('value', $.Player.Volume);
                }
                MovieObject(this.settings.flashID).mp3SetVolume($.Player.Volume * 10);
            },
            /* 이벤트 추가*/
            addEvent: function () {
                var self = this;
                //Play and Pause
                $('#pBt_play', this.container).click(function () {
                    if ($(this).hasClass('pause')) {
                        $.Player.Pause();
                    }
                    else {
                        if (($.Player.maxLength >= 0 && $.Player.isStop) || $.Player.isFirst) {
                            $.Player.Play();
                        } else if ($.Player.isPause) {
                            $.Player.Resum();
                        }
                    }
                    return false;
                });
                //Prev Song
                $('#pBt_prev', this.container).click(function () {
                    $.Player.playPrev(true);
                    return false;
                });
                //Next Song
                $('#pBt_next', this.container).click(function () {
                    $.Player.playNext(true);
                    return false;
                });
                //Play List
                $('#pBt_list', this.container).click(function () {
                    if ($.Player.isPlayList) {
                        $(this).removeClass("pOn");
                        $.Player.isPlayList = false;
                        $.Player.playList.slideUp('fast');
                    } else {
                        $(this).addClass("pOn");
                        $.Player.isPlayList = true;
                        $.Player.drawPlayList();
                        $.Player.playList.slideDown('fast');
                    }
                    return false;
                });
                $('#pBt_text', this.container).click(function () {
                    if ($.Player.isLyrics) {
                        $(this).removeClass("pOn");
                        $.Player.isLyrics = false;
                        $.Player.lyrics.slideUp('fast');
                    } else {
                        $(this).addClass("pOn");
                        $.Player.isLyrics = true;
                        $.Player.lyrics.slideDown('fast', function () {
                            $('#lyrics_wrap', $.Player.lyrics).html('<div class="content"></div>');
                            if ($.Player.nowPlay >= 0) {
                                $('.content', $.Player.lyrics).html($.Player.MusicList[$.Player.nowPlay].TrackLyrics);
                            }
                            $('#lyrics_wrap', $.Player.lyrics).scrollbar({ containerHeight: 230 });

                        });
                    }
                    return false;
                });

                $("#lyrics_close", this.container).click(function () {
                    $('#pBt_text', self.container).click();
                    return false;
                });
                $('#pBt_repeat', this.container).click(function () {
                    if ($.Player.isRepeat) {
                        $(this).removeClass("pOn");
                        $.Player.isRepeat = false;
                    } else {
                        $(this).addClass("pOn");
                        $.Player.isRepeat = true;
                    }
                    return false;
                });
                $('#pBt_random', this.container).click(function () {
                    if ($.Player.isShuffle) {
                        $(this).removeClass("pOn");
                        $.Player.isShuffle = false;
                    } else {
                        $(this).addClass("pOn");
                        $.Player.isShuffle = true;
                    }
                    return false;
                });
                $('#pBt_volUp', this.container).click(function () {
                    $.Player.Volume += $.Player.settings.volumeStep;
                    if ($.Player.Volume > 10) $.Player.Volume = 10;
                    $.Player.volumeControl(true);
                    return false;
                });
                $('#pBt_volDown', this.container).click(function () {
                    $.Player.Volume -= $.Player.settings.volumeStep;
                    if ($.Player.Volume < 0) $.Player.Volume = 0;
                    $.Player.volumeControl(true);
                    return false;
                });
                $('#pBt_volume', this.container).click(function () {
                    if ($.Player.isMute == false) {
                        $.Player.SaveVolume = $.Player.Volume;
                        $.Player.Volume = 0;
                        $.Player.isMute = true;
                        $(this).addClass('mute');
                    } else {
                        $.Player.Volume = $.Player.SaveVolume;
                        $.Player.SaveVolume = 0;
                        $.Player.isMute = false;
                        $(this).removeClass('mute');
                    }
                    $.Player.volumeControl(false);
                    return false;
                });

                $('#pl_prev', this.playList).click(function () {
                    $.Player.drawPlayList('prev');
                    return false;
                });
                $('#pl_next', this.playList).click(function () {
                    $.Player.drawPlayList('next');
                    return false;
                });
                $('#pBt_close', this.container).click(function () {
                    $.Player.playerHide();
                    return false;
                });
                $('#playList_close', this.playList).click(function () {
                    $('#pBt_list', self.container).click();
                    return false;
                });

                $(':checkbox:last', this.playList).click(function () {
                    $('ul li :checkbox', self.playList).attr('checked', $(this).attr('checked'));
                    return false;
                });

                $('#pl_selDel', this.playList).click(function () {
                    var chkList = [];
                    $('ul li :checkbox:checked', this.playList).each(function (i, obj) {
                        chkList.push($(obj).val());
                    });
                    $.Player.delMusics(chkList);
                    return false;
                });

                $('#playerWrap').hover(function () {
                    if ($.Player.isHide == true && !$($.Player.container).is(":animated"))
                        $.Player.playerShow();
                });
            },
            playListEvent: function () {
                $('span.pl_tle', this.playList).css('cursor', 'pointer').click(function () {
                    var num = $(this).parent('li').find(':checkbox').val();
                    $.Player.nowPlay = parseInt(num);
                    $.Player.Play();
                    return false;
                });
            },
            InitBGM: function (domain, version) {
                //                console.log(domain);
                //                console.log(version);
                //                console.log($.Player.domain);
                //                console.log($.Player.version);
                if ($.Player.domain != domain || $.Player.version != version) {
                    $.Player.domain = domain;
                    $.Player.version = version;
                    if ($.Player.bgm == "") {
                    	$.post("/API/BGM", { domain: domain, version: version }, function (data) {
                    		$.Player.bgm = data;
                    		$.Player.PlayBGM();
                    	}, "json");
                    }
                } else {
                    return false;
                }
            },
            PlayBGM: function () {
                MovieObject($.Player.settings.BGflashID).mp3playSong($.Player.bgm);
                $.Player.currentPlayer = "bgm";
                $.Player.bgmPlay = true;
                if (!$.Player.isPause && !$.Player.isStop) {
                    $.Player.PauseBGM();
                    $.Player.bgmPlay = false;
                }

            },
            PauseBGM: function () {
                if (swfInnitialize == true) {
                    MovieObject(this.settings.BGflashID).mp3Pause();
                    $.Player.bgmPlay = false;
                    //alert("일시정지");
                    $("#mainFrame").contents().find("a.ft_play img").attr("src", "/Images/common/foot_btn_play.gif");
                    $("#mainFrame").contents().find("a.ft_playeq img").attr("src", "/Images/common/foot_btn_eq.gif");
                }

            },
            ResumBGM: function () {
                if (swfInnitialize == true) {
                    /*
                    setTimeout(function () {
                    }, 1000); //alert("시작"); 
                    아래 세줄 뺌*/
                    MovieObject($.Player.settings.BGflashID).mp3Play();
                    $.Player.bgmPlay = true;
                    $.Player.currentPlayer = "bgm";

                    $("#mainFrame").contents().find("a.ft_play img").attr("src", "/Images/common/foot_btn_pause.png");
                    $("#mainFrame").contents().find("a.ft_playeq img").attr("src", "/Images/common/foot_btn_playeq.gif");
                }
            },
            BGMControl: function () {
                if ($.Player.bgmPlay) {
                    $.Player.PauseBGM();
                    if ($.Player.isPause == true) {
                        $.Player.Resum();

                    }
                } else {
                    $.Player.ResumBGM();
                    if ($.Player.isPause == false && $.Player.isStop == false) {
                        $.Player.Pause();
                    }
                }
            },
            ApiPlayer: function (control) {
                //console.log("currentPlay", $.Player.currentPlayer);
                //console.log("control", control);
                //console.log("bgmPlay", $.Player.bgmPlay);
                if (control == "play") {
                    if ($.Player.currentPlayer == "bgm" && $.Player.bgmPlay == false) {
                        $.Player.ResumBGM();
                    } else if ($.Player.currentPlayer == "mp3"){
                        $.Player.Resum();
                    }
                } else {
                    if ($.Player.currentPlayer == "bgm") {
                        $.Player.PauseBGM();
                    } else if ($.Player.currentPlayer == "mp3") {
                        $.Player.Pause();
                    }
                }
            }
        }
    });
})(jQuery);
var swfInnitialize = false;
function swfInitialize(id, callback) {
	//console.log(id);
    var swfInterval;
    if (swfInnitialize == false) {
        swfInterval = setInterval(function () {
        	if (typeof (MovieObject(id)) != "undefined" && typeof (MovieObject(id).mp3playSong) == "function") {
                swfInnitialize = true;
                clearInterval(swfInterval);
                if(typeof(callback) == "function"){
                callback();
                }
            }
        }, 100);
    }
}

function mp3finish() {
    $.Player.playNext();
}
function bgmfinish() {
    $.Player.PlayBGM();
}
