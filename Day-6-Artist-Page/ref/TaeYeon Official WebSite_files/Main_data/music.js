var jsonFiles = [];
var fileList = [];
var delFileList = [];
var _file_count = 0, _total_file_size = 0;
var _max_file_count = 3;
var boardStyle = 'txt';
var boardPageSize = 10;

var BoardUtil = {
	Auth: function (hasParent) {
		if ($("#IsAuth").val() == "N") {
			if (hasParent) parent.$.SignIn();
			else $.SignIn();
			return false;
		}
		return true;
	},
	RecommedArticle: function (articleID, commentNo, actionType) {

		if (!this.Auth())
			return false;

		var url = $.Format("/Discography/NotifyComment?articleID={0}&commentNo={1}&actionType={2}&refArticleNo=0&item={3}&memo={4}", articleID, commentNo, actionType, "0", "");
		jQuery.getJSON(url, function (result) {
			if (result.message == "success")
				$(".recCount").html($.Format("({0})", parseInt($("#RC_Count").val()) + 1));
			else if (result.message == "error")
				alert("에러가 발생했습니다.");
			else if (result.message == "duplicate")
				alert("이미 추천 하셨습니다.");
			else if (result.message == "self")
				alert("본인 글은 추천하실 수 없습니다.");
			else
				alert("에러가 발생했습니다.");
		});
	},
	NotifyInit: function (target, category, contentID, commentNo, actionType) {

		if (!this.Auth())
			return false;

		var _top = 0;
		var _target = "";
		if (target == "parent") {
			_target = parent.document;
		} else {
			_target = "";
		}

		var nm = [
		  "헌법 및 사회질서, 미풍양속에 반하는 게시물"
		, "음란성 게시물"
		, "개인정보 침해 및 명예훼손 게시물"
		, "불법 광고 게시물"
		, "도배성 게시물"
		, "폭력/잔혹/혐오"
		, "기타"
		];

		var html = "";
		html += "<div id=\"notification_Box\" class=\"\" style=\"z-index : 701\">";
		html += "<div id=\"notification_Title\"><img src=\"/images/common/notify_title.gif\" class=\"notification_title_img\" /></div>";
		html += "<div id=\"notification_Contents\">";
		for (var i = 0; i < nm.length; i++) {
			html += $.Format("<label for=\"notifyType0{0}\"><input type=\"radio\" name=\"notifyType\" id=\"notifyType0{1}\" value=\"{2}\" /> {3}</label><br />", i + 1, i + 1, i + 1, nm[i]);
		}
		html += "<textarea class=\"EtcBox\" id=\"notifyMemo\" name=\"notifyMemo\" disabled=\"disabled\"></textarea>"
		html += "</div>";
		html += "<div id=\"notification_BtmText\">";
		html += "<p>허위신고를 하실 경우 신고자의 활동에 제한을 받으실 수 있습니다.</p>";
		html += "<p>이점 유의 해 주시길 바랍니다.</p>";
		html += "</div>";
		html += "<div id=\"notification_Btn\">";
		html += "<a id=\"btnDoNotifiyProcess\" href=\"javascript:;\" onclick=\"BoardUtil.NotifyArticle('" + category + "', '" + contentID + "','" + commentNo + "','" + actionType + "');\"><img src=\"/images/common/notify_btn01.gif\" class=\"notification_img\" /></a>&nbsp;";

		var closeTarget = target;
		if (target == "parent") closeTarget = "";
		html += "<a id=\"btnNotifyCancel\" href=\"javascript:;\" onclick=\"BoardUtil.CloseNotification('" + closeTarget + "','" + category + "');\"><img src=\"/images/common/notify_btn02.gif\" class=\"notification_img\" /></a>";
		html += "</div>";
		html += "</div>";

		$("#layer_transparency", _target).show();
		$("#notification_Box", _target).remove();
		$("body", _target).append(html);

		if (target == "parent") {
			_top = ($(parent).height() < $("#notification_Box", _target).height() ? $(parent).scrollTop() : ($(parent).height() - $("#notification_Box", _target).height()) / 2 + $(parent).scrollTop()) + 'px'
		} else {
			_top = ($(window).height() < $("#notification_Box", _target).height() ? $(window).scrollTop() : ($(window).height() - $("#notification_Box", _target).height()) / 2 + $(window).scrollTop()) + 'px'
		}

		$("#notification_Box", _target).css({ top: _top });
		$("input[name=notifyType]", _target).each(function (i) {
			$(this).click(function () {
				$("#notifyMemo", _target).val("");
				$("#notifyMemo", _target).attr("disabled", "disabled");
			});
		});

		$("#notifyType07", _target).click(function () {
			$("#notifyMemo", _target).val("");
			$("#notifyMemo", _target).removeAttr("disabled");
			$("#notifyMemo", _target).focus();
		})
	},
	NotifyArticle: function (category, contentID, commentNo, actionType) {

		if (!this.Auth())
			return false;

		if ($("input[name=notifyType]:radio:checked").length == 0) {
			alert('신고 항목을 선택해 주세요!');
			return false;
		}
		var item = $("input[name=notifyType]:checked").val();
		var memo = $("#notifyMemo").val();
		if (item == "8" && memo.length == 0) {
			alert('신고 내용을 입력해주세요');
			$("#notifyMemo").focus();
			return false;
		}

		var url = $.Format("/Discography/NotifyComment?category={0}&commentNo={1}&contentID={2}&refArticleNo=0&item={3}&memo={4}", category, commentNo, contentID, item, memo);
		jQuery.getJSON(url, function (result) {
			if (result.message == "success")
				alert("신고 하셨습니다.");
			else if (result.message == "error")
				alert("에러가 발생했습니다.");
			else if (result.message == "duplicate")
				alert("이미 신고 하셨습니다.");
			else if (result.message == "self")
				alert("본인 글은 신고하실 수 없습니다.");
			else
				alert("에러가 발생했습니다.");

			BoardUtil.CloseNotification("", category);
		});
	},
	CloseNotification: function (target, category) {

			$("#notification_Box").remove();
			if (category == "A") ($("#layer_transparency").hide());

	},
	MyBoxToolTip: function () {
		$(".bubble").toggle();
	}
};

function doSubmit(param, vAction, vMethod) {
var form = $('form#fboard');

for (var key in param) {
    $('input[name=' + key + ']', form).val(param[key]);
}

if (vMethod != 'post') vMethod = 'get';
form.attr({ method: vMethod, action: vAction }).submit();

}


$(document).ready(function () {

   $('#commentBox .my_pic').click(function () {
       
        if ($("#IsAuth").val() == "N") {
            parent.$.SignIn();
            return false;
        }
        var url = "https://membership.smtown.com/My";
        $.OpenWinCenter(url, "600", "450", "WinZipCode");
    });

    $('#commentBox .my_info').click(function () {

        if ($("#IsAuth").val() == "N") {
            parent.$.SignIn();
            return false;
        }
        var url = "https://membership.smtown.com/My";
        $.OpenWinCenter(url, "600", "450", "WinZipCode");
       });

});

/* comment */

function ShowReply(cmtNo) {

    $(".li_comment_view", ".rep_list").remove();

	if ($("#SubNo").val() == cmtNo) {
		$("#SubNo").val("");
	} else {
		$("#cmt_item_" + cmtNo).after($("#comment_view").html());
		$("#SubNo").val(cmtNo);
		$("#reply_text_ex", "#commentBox").attr("name", "reply_text");
		$("#reply_text_ex", "#commentBox").attr("id", "reply_text");
}

    parent.$.IframeHeight($(window.frameElement, parent)); 
}
var isSubmited = false;
function DoComment() {
	$("#SubNo").val("");
	var title = $.trim($("#Title").val());
	if (title == "") {
		alert($("#Title").attr("data-val-required"));
		$("#Title").focus();
		return;
    }
    if (isSubmited == false) {
        document.forms[0].submit();
    } 
}

function ReplyComment() {
    
    var title = $.trim($("#reply_text").val());
    if (title == "") {
	    alert($("#reply_text").attr("data-val-required"));
	    $("#reply_text").focus();
		return;
	}
	
    if (isSubmited == false) {
        document.forms[0].submit();
    } 
}

function DelComment(category, contentID, commentNo) {
    var page = 1;
    page = parseInt(document.forms[0].page.value);

	if (confirm("댓글을 삭제 하시겠습니까?"))
		location.href = "/Discography/CommentDelete/?category=" + category + "&contentID=" + contentID + "&commentNo=" + commentNo  + "&page=" + page;
}
