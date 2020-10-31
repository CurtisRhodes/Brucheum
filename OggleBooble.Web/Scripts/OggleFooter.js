function setOggleFooter(pageId, rootFolder) {
    //alert("setOggleFooter. pageId: " + pageId + "  rootFolder: " + rootFolder);

    $('.footer').html("<div class='flexContainer'>\n" +
        "    <div class='footerCol'>\n" +  // column 1
        "       <div class='clickable' onclick='rtpe(\"FLC\",\"feedback\"," + rootFolder + "\"," + pageId + ")'>Feedback</div>\n" +
        "       <div id='footerCol1' class='footerColCustContainer'></div>\n" +
        "    </div>\n" +
        "    <div class='footerCol'>\n" + // column 2
        "       <div class='clickable' onclick='window.location.href=\"index.html?spa=3911\", \"_blank\"'>Blog</div>\n" +
        "       <div id='footerCol2' class='footerColCustContainer'></div>\n" +
        "    </div>\n" +
        "    <div class='footerCol'>\n" + // column 3
        "       <div class='clickable' onclick='rtpe(\"FLC\",\"mailme\",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
        "       <div id='footerCol3' class='footerColCustContainer'></div>\n" +
        "    </div>\n" +
        "    <div class='footerCol'>\n" +  // column 4
        "       <div id='footerPageHits'></div>\n" +
        "       <div id='footerCol4' class='footerColCustContainer'></div>\n" +
        "    </div>\n" +
        "    <div class='footerCol'>\n" +  // column 5
        "       <div id='footerCol5' class='footerColCustContainer'></div>\n" +
        "    </div>\n" +
        "    <div class='footerCol'>\n" +  // column 5
        "       <div id='footerCol6' class='footerColCustContainer'></div>\n" +
        "    </div>\n" +
        "   </div>\n<div class='footerFooter'>\n" +
        "       <div id='footerMessage'></div>\n" +
        "       <div id='footerMessage2'></div>\n" +
        "       <div id='copyright'>&copy; 2020 - <a href='https://curtisrhodes.com/IntelDsgn'>Intelligent Design SoftWare</a></div>\n" +
        "   </div>\n" +
        "</div>\n"
    );

    switch (rootFolder) {
        //rtpe(code,calledfrom,detail,pageId)
        case "playboyIndex":
            break;
        case "blog":
        case "root":
        case "index": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?folderId=1142\", \"_blank\"'>Centerfolds</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='showCatListDialog(2)'>Category List</div>\n" +
                "<div class='clickable' onclick='showCatListDialog(3)'>Babes List</div>\n");
            break;
        }
        case "boobs": {  //    poses 
            $('#footerCol1').html(
                "<div class='clickable' onclick='showCatListDialog(2)'>Category List</div>\n" +
                "<div class='clickable' onclick='showCatListDialog(3)'>Babes List</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Boobs Rater</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"archive\"," + pageId + ")'>Archive</div>\n");
            $('#footerCol3').html(
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"footer\",\"root\"" + rootFolder + "," + pageId + ")'>Centerfolds</div>\n");
            //$('#footerCol5').html();
            break;
        }
        case "archive": {  // big naturals
            $('#footerCol1').html(
                "<div class='clickable' onclick='showCatListDialog(3)'>Babes List</div>\n" +
                "<div class='clickable' onclick='showCatListDialog(2)'>Category List</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Boobs Rater</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"footer\",\"root\"" + rootFolder + "," + pageId + ")'>Centerfolds</div>\n");
                //"<div class='clickable' onclick='rtpe(\"FLC\",\"videos\",\"videos\"," + pageId + ")'>Videos</div>\n" +
            $('#footerCol3').html(
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=5233\", \"_blank\"'>softcore</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n");
            $('#footerCol4').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Boobs Rater</div>\n");
            break;
        }
        case "soft": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"footer\",\"root\"" + rootFolder + "," + pageId + ")'>Centerfolds</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Porn Rater</div>\n");
            break;
        }
        case "playboy":
        case "cybergirl":
        case "centerfold": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"cybergirls\"," + pageId + ")'>cybergirls</div>\n" +
                //"<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"magazine covers\"," + pageId + ")'>magazine covers</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"extras\"," + pageId + ")'>Playboy extras</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"playmate dir tree\"," + pageId + ")'>Playmate List</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"ranker\"," + pageId + ")'; >Playmate Rater</a></div>\n");
            $('#footerCol3').html(
                "<div class='clickable' onclick='window.location.href=\"album.html?spa=3909\", \"_blank\"'>Big Naturals</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n");
            break;
        }
        case "porn": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='showCatListDialog(440)'>Slut List</div>\n" +
                "<div class='clickable' onclick='showCatListDialog(242)'>Porn Categories</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"slut archive\"," + pageId + ")'>porn stars</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"album.html?folder=3909\", \"_blank\"'>Big Naturals</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"footer\",\"root\"" + rootFolder + "," + pageId + ")'>Centerfolds</div>\n");
            break;
        }
        case "sluts":  {
            $('#footerCol1').html(
                "<div class='clickable' onclick='showCatListDialog(440)'>Slut List</div>\n" +
                "<div class='clickable' onclick='showCatListDialog(242)'>Porn Categories</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=porn\", \"_blank\"'>Oggle Porn</div>\n");
            $('#footerCol2').html(
                //"<div class='clickable' onclick='window.location.href=\"index.html, \"_blank\"'>Oggle Booble</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html'>Oggle Booble</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"footer\",\"root\"" + rootFolder + "," + pageId + ")'>Centerfolds</div>\n");
            break;
        }
        case "dashboard": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"rejects\",\"rejects\"," + pageId + ")'>Rejects</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"videos\",\"videos\"," + pageId + ")'>Videos</div>\n");

            //$('#footerCol5').html(`<!-- Histats.com  (div with counter) --><div id="histats_counter"></div>
            //    <!-- Histats.com  START  (aync)-->
            //    <script type="text/javascript">var _Hasync= _Hasync|| [];
            //    _Hasync.push(['Histats.start', '1,4458214,4,28,115,60,00000001']);
            //    _Hasync.push(['Histats.fasi', '1']);
            //    _Hasync.push(['Histats.track_hits', '']);
            //    (function() {
            //    var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
            //    hs.src = ('//s10.histats.com/js15_as.js');
            //    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
            //    })();</script>
            //    <noscript><a href="/" target="_blank"><img  src="//sstatic1.histats.com/0.gif?4458214&101" alt="counter" border="0"></a></noscript>
            //    <!-- Histats.com  END  -->`
            //);

            $('#footerCol6').html(`<!-- Histats.com  (div with counter) --><div id="histats_counter"></div>
                <!-- Histats.com  START  (aync)-->
                <script type="text/javascript">var _Hasync= _Hasync|| [];
                _Hasync.push(['Histats.start', '1,4458214,4,30,130,80,00010101']);
                _Hasync.push(['Histats.fasi', '1']);
                _Hasync.push(['Histats.track_hits', '']);
                (function() {
                var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
                hs.src = ('//s10.histats.com/js15_as.js');
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
                })();</script>
                <noscript><a href="/" target="_blank"><img  src="//sstatic1.histats.com/0.gif?4458214&101" alt="page hit counter" border="0"></a></noscript>
                <!-- Histats.com  END  -->`
            );
            break;
        }
        default: {
            logError("SWT", pageId, "rootFolder: " + rootFolder, "setOggleFooter");
            $('#footerCol1').html("<div>unhandled domain: " + rootFolder + "</div>\n");
            break;
        }
    }

    if (isInRole("admin")) {
        $('#footerCol5').html(
            //"       <div class='clickable' onclick='window.open(\"index.html?spa=3910\", \"_blank\")'>dashboard</div>\n" +
            //"       <div class='clickable' onclick='window.open(\"index.html?spa=3910\")'>dashboard</div>\n" +
            "       <div class='clickable' onclick='window.location.href=\"/index.html?spa=3910\"'>dashboard</div>\n" +
            "       <div>page type: " + rootFolder + "</div>\n" +
            "       <div id='footerFolderType'></div>\n" +
            "       <div id='footerStaticPage'></div>\n");
    }
}

function defaultFooterHTML(pageId, rootFolder) {
}
