function setOggleFooter(pageId, rootFolder) {
    //alert("setOggleFooter. pageId: " + pageId + "  rootFolder: " + rootFolder);
    var footerhtml = "";
    if (rootFolder === "boobs" || rootFolder === "archive") {
        footerhtml =
            "<div class='flexContainer'>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"about us\")'>about us</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"dir tree\")'>Category List</div>\n" +
            "        <div><a href='#'></a></div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"porn\")'>Nasty Porn</div>\n" +
            "    </div>\n" +

            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"ranker\")'>Boobs Rater</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"rejects\")'>Rejects</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"videos\")'>Nasty Videos</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"centerfolds\")'>Centerfolds</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"mailme\")'>email site developer</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"blog\")'>Blog</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"archive\")'>Archive</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"freedback\")'>Feedback</div>\n" +
            "    </div>\n" +
            "</div>\n" +
            "<div id='footerLastBuild' class='footerVersionMessage'></div>\n" +
            "<div class='footerFooter'>\n" +
            "    <div id='footerMessage'></div>\n" +
            "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
            "</div>\n";
    }
    if (rootFolder === "playboy") {
        footerhtml =
            "<div class='flexContainer'>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='/album.html?folder=3796' onclick='reportThenPerformEvent(\"FLC\",3796,0)'>Playboy Cybergirls</a></div>\n" +
            "        <div><a href='/album.html?folder=1986' onclick='reportThenPerformEvent(\"FLC\",1986,0)'>Magazine covers</a></div>\n" +
            "        <div class='clickable' onclick='onclick='reportThenPerformEvent(\"FLC\",3942,0)'; showCustomMessage(38)'>let me explain</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='/Ranker.html?subdomain=playmates'onclick='reportThenPerformEvent(\"FLC\",3907,0)'; >Playmate Rater</a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
            "        <div><a href='/Blog.html'onclick='onclick='reportThenPerformEvent(\"FLC\",3911,0)'>Blog</a></div>\n" +
            "    </div>\n" +
            "</div>\n" +
            "<div id='footerLastBuild' class='footerVersionMessage'></div>\n" +
            "<div class='footerFooter'>\n" +
            "    <div id='footerMessage'></div>\n" +
            "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
            "</div>\n";
    }
    if (rootFolder === "porn" || rootFolder === "sluts") {
        footerhtml =
        "<div class='flexContainer'>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='showCustomMessage(38)'>let me explain</div>\n" +
            "        <div onclick='showCatListDialog(242)'>Category List</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='/Ranker.html?subdomain=porn'>Porn Ranker</a></div>\n" +
            "        <div><a href='~/home/Videos'>Nasty Videos</a></div>\n" +
            "        <div><a href='/album.html?folder=1132'>Centerfolds</a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='#'>About us</a></div>\n" +
            "        <div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
            "        <div><a href='/Blog.html'>Blog</a></div>\n" +
            "        <div><a href='/album.html?folder=440'>Slut Archive</a></div>\n" +
            "    </div>\n" +
            "</div>\n" +
            "<div id='footerLastBuild' class='footerVersionMessage'></div>\n" +
            "<div class='footerFooter'>\n" +
            "    <div id='footerMessage'></div>\n" +
            "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
            "</div>\n";
    }

    if (footerhtml === "") {
        if (document.domain === 'localhost')
            alert("ERROR in Ogglefooter.js setOggleFooter\nrootFolder: " + rootFolder + "  not found");
        else
            sendEmailToYourself("ERROR in Ogglefooter.js setOggleFooter", "rootFolder: " + rootFolder + "  not found");
    }
    $('footer').html("");
    $('footer').html(footerhtml);
}
