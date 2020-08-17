//javascript di bookmark.js
var BOOKMARK = {};
BOOKMARK.max = max_bookmark, BOOKMARK.checkLocalStorage = function() {
    return "function" == typeof Storage
}, BOOKMARK.storeLocalStorage = function(a, r) {
    return 0 != BOOKMARK.checkLocalStorage() && localStorage.setItem(a, JSON.stringify(r))
}, BOOKMARK.getLocalStorage = function(a) {
    return void 0 !== typeof a && (0 != BOOKMARK.checkLocalStorage() && (a in localStorage != !1 && JSON.parse(localStorage[a])))
}, BOOKMARK.getStored = function() {
    var a = BOOKMARK.getLocalStorage("bookmark");
    return 0 == a ? [] : typeof a != typeof [] ? [] : a
}, BOOKMARK.find = function(a) {
    return 0 != BOOKMARK.checkLocalStorage() && BOOKMARK.getStored().indexOf(a)
}, BOOKMARK.remove = function(a) {
    if (0 == BOOKMARK.checkLocalStorage()) return !1;
    var r = BOOKMARK.getStored(),
        e = r.indexOf(a);
    return -1 === e || (r.splice(e, 1), BOOKMARK.storeLocalStorage("bookmark", r), jQuery.post(ajaxurl, {
        action: "bookmark_remove",
        id: a
    }), !0)
}, BOOKMARK.push = function(a) {
    if (0 == BOOKMARK.checkLocalStorage()) return alert("Maaf, browser anda tidak mendukung fitur ini.\nGunakan browser google chrome / mozilla"), !1;
    if (isNaN(a)) return !1;
    var r = BOOKMARK.getStored();
    return r.length >= BOOKMARK.max ? (r = r.slice(-BOOKMARK.max), BOOKMARK.storeLocalStorage("bookmark", r), alert("Maaf, anda mencapai batas bookmark, \nsilahkan hapus manga lain dari bookmark"), !1) : -1 !== r.indexOf(a) || (r.unshift(a), BOOKMARK.storeLocalStorage("bookmark", r), jQuery.post(ajaxurl, {
        action: "bookmark_push",
        id: a
    }), !0)
}, BOOKMARK.check = function() {
    var a = jQuery("div.bookmark[data-id]");
    if (a.length < 1) return !1;
    var r = a.get(0).getAttribute("data-id");
    if (isNaN(r)) return !1;
    var e = BOOKMARK.find(r);
    return isNaN(e) || -1 === e ? (a.html('<span class="dashicons dashicons-heart"></span> Bookmark'), a.removeClass("marked"), !1) : (a.html('<span class="dashicons dashicons-heart"></span> Bookmarked'), a.addClass("marked"), !0)
}, BOOKMARK.listener = function() {
    var a = jQuery("div.bookmark[data-id]");
    if (a.length < 1) return !1;
    a.on("click", function() {
        var a = this.getAttribute("data-id");
        return !isNaN(a) && (-1 === BOOKMARK.find(a) ? BOOKMARK.push(a) : BOOKMARK.remove(a), BOOKMARK.check(), !0)
    })
};

//javascript di history.js
var HISTORY = {};
HISTORY.max = max_history, HISTORY.savename = "bm_history", HISTORY.checkLocalStorage = function() {
    return "function" == typeof Storage
}, HISTORY.storeLocalStorage = function(e, r) {
    return !!HISTORY.checkLocalStorage() && localStorage.setItem(e, JSON.stringify(r))
}, HISTORY.getLocalStorage = function(e) {
    return void 0 === typeof e ? null : !!HISTORY.checkLocalStorage() && (e in localStorage == !1 ? null : JSON.parse(localStorage[e]))
}, HISTORY.getStored = function() {
    var e = HISTORY.getLocalStorage(HISTORY.savename);
    return e ? typeof e != typeof {} ? {} : e : {}
}, HISTORY.push = function(e, r) {
    if (!HISTORY.checkLocalStorage()) return !1;
    if (isNaN(e)) return !1;
    var t = HISTORY.getStored();
    if (e in t && delete t[e], Object.keys(t).length >= HISTORY.max) {
        var a = {};
        for (var n in t) {
            var o = t[n];
            a[o.time] = o
        }
        var S = Object.keys(a);
        S.sort(), S.reverse();
        var c = {};
        for (var i in S) {
            if (!(i < HISTORY.max - 1)) break;
            var l = a[S[i]];
            c[l.chapter_ID] = l
        }
        t = c
    }
    return r.time = (new Date).getTime(), t[e] = r, HISTORY.storeLocalStorage(HISTORY.savename, t), !0
}, HISTORY.generateHTML = function() {
    var e = HISTORY.getStored();
    if (0 === Object.keys(e).length) return null;
    var r = {};
    for (var t in e) {
        r[(o = e[t]).time] = o
    }
    var a = "",
        n = Object.keys(r);
    for (var t in n.sort(), n) {
        var o;
        a = 'li class="bm_item"><a href="${(o=r[n[t]]).chapter_permalink}">${o.chapter_title}</a></li>' + a
    }
    return a = "<ul id='bm-history'>" + a + "</ul>"
}, HISTORY.run = function() {
    if (!1 === HISTORY.checkLocalStorage()) return jQuery("#theHISTORY").parent().parent().remove();
    var e = HISTORY.generateHTML();
    if (null === e) return jQuery("#theHISTORY").parent().parent().remove();
    jQuery("#theHISTORY").html(e)
}, jQuery(document).ready(function() {
    HISTORY.run()
});

//javascript di function.js
function pickSelected() {
    jQuery("select#chapter option[data-id=" + chapter_id + "]").attr("selected", "selected"), jQuery("select#chapter option[value='']").attr("disabled", "disabled")
}

function loadChList() {
    if ("object" == typeof localStorage) {
        var e = localStorage.getItem("currentChapterList");
        if (null !== e) {
            if ((e = JSON.parse(e)).id == post_id) return $("select#chapter").append(e.html), void pickSelected();
            localStorage.removeItem("currentChapterList")
        }
    }
    jQuery.ajax({
        url: ajaxurl,
        type: "post",
        data: {
            action: "get_chapters",
            id: post_id
        },
        success: function(e) {
            if ($("select#chapter").append(e), "object" == typeof localStorage) return localStorage.setItem("currentChapterList", JSON.stringify({
                id: post_id,
                html: e
            })), void pickSelected()
        }
    })
}
//javascript di page default
var ajaxurl = "https://komikcast.com/wp-admin/admin-ajax.php";
var max_history = 10;

//javascript di page bookmark
function my_rating() {
    $(document).find('.score').each(function(index, el) {
        var $El = $(el);
        $El.barrating({
            theme: 'fontawesome-stars',
            readonly: true,
            initialRating: $El.attr('data-current-rating')
        });
    });
}
jQuery(document).ready(function() {
    var bookmarks = BOOKMARK.getStored();
    if (bookmarks.length < 1) {
        jQuery("#bookmark-pool").html("<h4><center>YOU HAVE NO BOOKMARK, NOTHING TO SHOW</center></h4>");
        return;
    }
    jQuery.post(ajaxurl, {
            "action": "bookmark_get",
            "ids": BOOKMARK.getStored()
        })
        .done(function(d) {
            if (d.error) jQuery("#bookmark-pool").html("<h4><center>" + d.error + "</center></h4>");
            else jQuery("#bookmark-pool").html(d.data);
            my_rating();
        });
    jQuery("#hapus").on('click', function() {
        if (jQuery(document).find('.delmark').length <= 0) {
            jQuery(document).find('div.bsx').prepend('<div class="delmark">Delete</div>');
        } else {
            jQuery(document).find('.delmark').remove();
        }
    });
    jQuery(document).on('click', '.delmark', function() {
        var parent = jQuery(this).parent();
        var id = parent.attr('data-id');
        BOOKMARK.remove(id);
        parent.parent().remove();
    });
});