function setOggleFooter(pageId, subdomain) {
    //alert("setOggleFooter. pageId: " + pageId + "  rootFolder: " + rootFolder);
    var footerhtml = "";

    switch (subdomain) {
        case "boobs":
        case "archive":
            footerhtml =
                "<div class='flexContainer'>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"about us\","+pageId+")'>about us</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"dir tree\"," + pageId +")'>Category List</div>\n" +
                "        <div><a href='#'></a></div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"porn\"," + pageId +")'>Nasty Porn</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"ranker\"," + pageId +")'>Boobs Rater</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"rejects\"," + pageId +")'>Rejects</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"videos\"," + pageId +")'>Nasty Videos</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"centerfolds\"," + pageId +")'>Centerfolds</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"mailme\"," + pageId +")'>email site developer</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"blog\"," + pageId +")'>Blog</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"archive\"," + pageId +")'>Archive</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"freedback\"," + pageId +")'>Feedback</div>\n" +
                "    </div>\n" +
                "</div>\n" +
                "<div id='footerLastBuild' class='footerVersionMessage'></div>\n";
            break;
        case "playboy":
        case "centerfold":
            footerhtml =
                "<div class='flexContainer'>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"cybergirls\"," + pageId + ")'>cybergirls</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"magazine covers\"," + pageId + ")'>magazine covers</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"extras\"," + pageId + ")'>Playboy extras</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"playmate dir tree\"," + pageId + ")'>Playmate List</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"ranker\"," + pageId + ")'; >Playmate Rater</a></div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"about us\"," + pageId + ")'>about us</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"blog\"," + pageId + ")'>Blog</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"freedback\"," + pageId + ")'>Feedback</div>\n" +
                "    </div>\n" +
                "</div>\n" +
                "<div id='footerLastBuild' class='footerVersionMessage'></div>\n";
            break;
        case "porn":
        case "sluts":
            footerhtml = "<div class='flexContainer'>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"about us\"," + pageId + ")'>about us</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"dir tree\"," + pageId + ")'>category list</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"blog\"," + pageId + ")'>blog</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"ranker\"," + pageId + ")';>porn rater</a></div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"videos\"," + pageId + ")'>nasty Videos</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"slut archive\"," + pageId + ")'>slut archive</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
                "    </div>\n" +
                "</div>\n";
            break;
        default:
            footerhtml = "<div class='flexContainer'>\n" +
                "    <div class='footerCol'>\n" +
                "       <div>unhandled domain: " + subdomain + "</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\"," + pageId + ",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
                "    </div>\n" +
                "</div>\n" +
                "<div id='footerLastBuild' class='footerVersionMessage'></div>\n" +
                "<div class='footerFooter'>\n" +
                "    <div id='footerMessage'></div>\n" +
                "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
                "</div>\n";
            break;
    }
    footerhtml += "<div class='footerFooter'>\n" +
        "    <div id='footerMessage'></div>\n" +
        "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
        "</div>\n";

    //if (rootFolder === "boobs" || rootFolder === "archive" || rootFolder === "special") {

    //if (footerhtml === "") {
    //    if (document.domain === 'localhost')
    //        alert("ERROR in Ogglefooter.js setOggleFooter\nrootFolder: " + rootFolder + "  not found");
    //    else {
    //        sendEmailToYourself("Ogglefooter 12:28",
    //            "pageId: " + pageId +
    //            "<br/>rootFolder: " + rootFolder +
    //            "<br/>ipAddress: " + getCookieValue("IpAddress"));
    //    }
    //}
    $('footer').html(footerhtml);
}
