function setOggleFooter(pageId, subdomain) {
    //alert("setOggleFooter. pageId: " + pageId + "  rootFolder: " + rootFolder);
    //rtpe(code,calledFrom,eventDetail,pageId)
    var footerhtml;
    switch (subdomain) {
        case "boobs":
        case "archive":
            footerhtml =
                "<div class='flexContainer'>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"about us\",\"about us\"," + pageId + ")'>about us</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"dir tree\",\"dir tree\"," + pageId + ")'>Category List</div>\n" +
                "        <div><a href='#'></a></div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"porn\",\"porn\"," + pageId + ")'>Nasty Porn</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Boobs Rater</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"rejects\",\"rejects\"," + pageId + ")'>Rejects</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"videos\",\"videos\"," + pageId + ")'>Nasty Videos</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"mailme\",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"blog\",\"blog\"," + pageId + ")'>Blog</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"archive\"," + pageId + ")'>Archive</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"freedback\"," + pageId + ")'>Feedback</div>\n" +
                "    </div>\n" +
                "</div>\n";
            break;
        case "playboy":
            footerhtml =
                "<div class='flexContainer'>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"cybergirls\"," + pageId + ")'>cybergirls</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"magazine covers\"," + pageId + ")'>magazine covers</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"extras\"," + pageId + ")'>Playboy extras</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"playmate dir tree\"," + pageId + ")'>Playmate List</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"ranker\"," + pageId + ")'; >Playmate Rater</a></div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"about us\"," + pageId + ")'>about us</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"blog\"," + pageId + ")'>Blog</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"freedback\"," + pageId + ")'>Feedback</div>\n" +
                "    </div>\n" +
                "</div>\n";
            break;
        case "porn":
        case "sluts":
        case "dashboard":
            footerhtml = "<div class='flexContainer'>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"about us\"," + pageId + ")'>about us</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"dir tree\"," + pageId + ")'>category list</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"blog\"," + pageId + ")'>blog</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"ranker\"," + pageId + ")';>porn rater</a></div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"videos\"," + pageId + ")'>nasty Videos</div>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"slut archive\"," + pageId + ")'>slut archive</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
                "    </div>\n" +
                "</div>\n";
            break;
        //case "dashboard":
        //    footerhtml +=
        //        "<div class='flexContainer'>\n" +
        //        "    <div class='footerCol'>\n" +
        //        "       <div>unhandled domain: " + subdomain + "</div>\n" +
        //        "    </div>\n" +
        //        "    <div class='footerCol'>\n" +
        //        "    </div>\n" +
        //        "    <div class='footerCol'>\n" +
        //        "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
        //        "    </div>\n" +
        //        "</div>\n";
        //    break;
        default:
            footerhtml +=
                "<div class='flexContainer'>\n" +
                "    <div class='footerCol'>\n" +
                "       <div>unhandled domain: " + subdomain + "</div>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "    </div>\n" +
                "    <div class='footerCol'>\n" +
                "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",\"tt\",\"mailme\"," + pageId + ")'>email site developer</div>\n" +
                "    </div>\n" +
                "</div>\n";
            break;
    }
    footerhtml += "<div class='footerFooter'>\n" +
        "   <div id='footerMessage'></div>\n" +
      //"    <div class='footerMessage'>last modified: " + lastModified + "</div>\n" +
      //"<div id='footerLastBuild' class='footerVersionMessage'></div>\n";
        "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
        "   </div>\n" +
        "</div>\n";
    $('.footer').html(footerhtml);
}
