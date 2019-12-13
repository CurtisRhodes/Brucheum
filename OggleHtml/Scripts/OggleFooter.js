function setOggleFooter(rootFolder, pageId) {
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
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"cybergirls\")'>cybergirls</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"magazine covers\")'>magazine covers</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"extras\")'>Playboy extras</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"playmate dir tree\")'>Playmate List</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"ranker\")'; >Playmate Rater</a></div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"about us\")'>about us</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"mailme\")'>email site developer</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"blog\")'>Blog</div>\n" +
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
    if (rootFolder === "porn" || rootFolder === "sluts") {
        footerhtml =
        "<div class='flexContainer'>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"about us\")'>about us</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"dir tree\")'>category list</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"blog\")'>blog</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"ranker\")';>porn rater</a></div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"videos\")'>nasty Videos</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"slut archive\")'>slut archive</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"mailme\")'>email site developer</div>\n" +
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
        else {

            sendEmailToYourself("Ogglefooter 1212",
                "pageId: " + pageId +
                "<br/>rootFolder: " + rootFolder +
                "<br/>ipAddress: " + getCookieValue("IpAddress"));
        }
    }
    $('footer').html("");
    $('footer').html(footerhtml);
}
