$.extend($, {
    SignIn: function () {
        this.setting = {
            layerName: "SignInLayer",
            container: null,
            width: 737,
            height: 269,
            fogIndex: 0
        };
        this.LoginValidate = null;
        var $SignIn = this;
        this.init = function () {
            if ($("#" + $SignIn.layerName).length > 0) {
                $("#" + $SignIn.layerName).remove();
            }
            $SignIn.setting.container = $('<div id="' + $SignIn.setting.layerName + '"></div>').appendTo("body");

            if ($("#layer_transparency").length > 0) {
                $SignIn.setting.fogIndex = $("#layer_transparency").css("zIndex");
            }

            $SignIn._view();
        }
        this._view = function () {
            if ($SignIn.setting.fogIndex > 0) {
                $("#layer_transparency").css("zIndex", "9998").show();
            } else {
                $("#layer_transparency").show();
            }
            $SignIn.setting.container
                .load("/Account/SigninLayer", function () {
                    $SignIn._addEvent();
                })
                .css({
                    position: "absolute",
                    width: $SignIn.setting.width + "px",
                    height: $SignIn.setting.height + "px",
                    top: ($(window).height() < $SignIn.setting.height ? $(window).scrollTop() : ($(window).height() - $SignIn.setting.height) / 2 + $(window).scrollTop()) + 'px',
                    left: '50%',
                    marginLeft: parseInt($SignIn.setting.width / 2) * (-1) + "px",
                    zIndex: 9999
                })
                .show();
            $.HidePlayer();
        },
        this._addEvent = function () {
            $SignIn.setting.container.find(".dimClose").click(function () {
                $SignIn._finish();
                return false;
            });
            $SignIn.setting.container.find("#Signup").click(function () {
                window.open("http://membership.smtown.com/", "MemberShip");
                return false;
            });
            $SignIn.setting.container.find("#FindPassword").click(function () {
                window.open("http://membership.smtown.com/Find/ID", "MemberShip");
                return false;
            });
            $SignIn.setting.container.find("#login_facebook").click(function () {
                $.Cookie('site', $.Domain, { path: '/', domain: $.CookieDomain});
                //$.OpenWinCenter("http://www.facebook.com/dialog/oauth/?scope=user_about_me,email,user_birthday&display=popup&client_id=201318983268202&redirect_uri=http%3a%2f%2fmembership.smtown.com%2fsns%2fgofacebook", 550, 338, "sns", 0);
                $.OpenWinCenter("/account/popsigninexternal?k=fb", 550, 338, "sns", 0);
                return false;
            });
            $SignIn.setting.container.find("#login_twitter").click(function () {
                $.Cookie('site', $.Domain);
                //$.OpenWinCenter("http://membership.smtown.com/SNS/GoTwitter", 800, 700, "sns", 0);
                $.OpenWinCenter("/account/popsigninexternal?k=tw", 550, 338, "sns", 0);
                return false;
            });


            $SignIn.LoginValidate = $('#fsignin').validate({
                onkeyup: false, onclick: false, onfocusout: false,
                errorElement: "label",
                wrapper: "span",
                rules: {
                    UserID: { required: true, email: true },
                    Password: { required: true, rangelength: [6, 32] }
                },
                showErrors: function (elements, errors) {
                    if (errors.length) {
                        var error = errors[0];
                        $("." + $SignIn.LoginValidate.settings.errorClass).removeClass($SignIn.LoginValidate.settings.errorClass).addClass($SignIn.LoginValidate.settings.validClass);
                        $(error.element).removeClass($SignIn.LoginValidate.settings.validClass).addClass($SignIn.LoginValidate.settings.errorClass).focus();
                        alert(error.message);
                        return false;
                    }
                },
                submitHandler: function (f) {
                    f.submit();
                }
            });
            $.getLangJson($.getUserLang(), "Account", "SignIn", function (data) {
                $SignIn.LoginValidate.settings.messages = data;
            });
        },
        this._finish = function () {
            $SignIn.setting.container.remove();
            if ($SignIn.setting.fogIndex > 0) {
                $("#layer_transparency").css("zIndex", $SignIn.setting.fogIndex).hide();
            } else {
                $("#layer_transparency").hide();
            }
            $.ShowPlayer();
        }
        this._success = function () {
            document.location.reload();
        }
        this._failed = function (msg) {
            alert(msg);
            return false;
        }
        this.init();
    },
    SignOut: function () {
        $.ajax({
            type: "POST",
            url: "/SignOut",
            cache: false,
            success: function () {
                document.location.reload();

            }
        });
    },
    SignSuccess: function () {
        document.location.reload();
    },
    SignFailed: function (msg) {
        if (msg != undefined && msg != '') {
            alert(msg);
        }
        return false;
    },
    SignFailedPop: function (msg, url, code) {
        if (msg != undefined && msg != '') {
            alert(msg);
            if (url != '') {
                window.open(url);
            }
        }
        return false;
    }
});
