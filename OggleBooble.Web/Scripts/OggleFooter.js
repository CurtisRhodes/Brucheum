function setOggleFooter(pageId, rootFolder) {
    //alert("setOggleFooter. pageId: " + pageId + "  rootFolder: " + rootFolder);
    //rtpe(code,calledFrom,eventDetail,pageId)
    $('.footer').html(defaultFooter(pageId, rootFolder));

    // ranker     homePageId = 3907;
    // boobs      homePageId = 3908;
    // porn       homePageId = 3909;
    // dashboard  homePageId = 3910;
    // blog       homePageId = 3911;
    //playboy	1243
    //archive	1131
    //centerfold	828
    //porn	266
    //boobs	193
    //sluts	159
    //soft	72
    //cybergirl	26
    //special	11
    //root	2            $('#footerCol1').html(


    switch (rootFolder) {
        case "index": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n");
            //$('#footerCol2').html();
            //$('#footerCol5').html();
            break;
        }
        //    poses
        case "boobs": {  
            $('#footerCol1').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"dir tree\",\"dir tree\"," + pageId + ")'>Category List</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Boobs Rater</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"archive\"," + pageId + ")'>Archive</div>\n");
            $('#footerCol3').html(
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n");
            //$('#footerCol5').html();
            break;
        }
        case "archive": {  // big naturals
            $('#footerCol1').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"dir tree\",\"dir tree\"," + pageId + ")'>Category List</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Boobs Rater</div>\n");
                //"<div class='clickable' onclick='rtpe(\"FLC\",\"videos\",\"videos\"," + pageId + ")'>Videos</div>\n" +
            $('#footerCol3').html(
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n");
            $('#footerCol4').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Boobs Rater</div>\n");
            break;
        }
        case "soft": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"dir tree\",\"dir tree\"," + pageId + ")'>Category List</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n");
            $('#footerCol2').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"ranker\",\"ranker\"," + pageId + ")'>Boobs Rater</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"rejects\",\"rejects\"," + pageId + ")'>Rejects</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"archive\"," + pageId + ")'>Archive</div>\n");
            break;
        }
        case "playboy":
        case "cybergirl":
        case "centerfold": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"cybergirls\"," + pageId + ")'>cybergirls</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"magazine covers\"," + pageId + ")'>magazine covers</div>\n" +
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
                "<div class='clickable' onclick='rtpe(\"FLC\",\"dir tree\",\"dir tree\"," + pageId + ")'>Category List</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"tt\",\"slut archive\"," + pageId + ")'>porn stars</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n");
            break;
        }
        case "sluts":  {
            $('#footerCol1').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"dir tree\",\"dir tree\"," + pageId + ")'>porn star list</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=porn\", \"_blank\"'>Oggle Porn</div>\n");
            $('#footerCol2').html(
                //"<div class='clickable' onclick='window.location.href=\"index.html, \"_blank\"'>Oggle Booble</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html'>Oggle Booble</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n");
            break;
        }
        case "dashboard": {
            $('#footerCol1').html(
                "<div class='clickable' onclick='rtpe(\"FLC\",\"rejects\",\"rejects\"," + pageId + ")'>Rejects</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"videos\",\"videos\"," + pageId + ")'>Videos</div>\n" +
                "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                "<div class='clickable' onclick='rtpe(\"FLC\",\"centerfolds\",\"centerfolds\"," + pageId + ")'>Centerfolds</div>\n");
            break;
        }
        default: {
            $('#footerCol1').html("<div>unhandled domain: " + rootFolder + "</div>\n");
            break;
        }
    }
}

function defaultFooter(pageId, rootFolder) {
    return "<div class='flexContainer'>\n" +
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
        "       <div class='clickable' onclick='window.location.href=\"index.html?spa=3910\", \"_blank\"'>dashboard</div>\n" +
        "       <div id='footerCol4' class='footerColCustContainer'></div>\n" +        
        "    </div>\n" +
        "    <div class='footerCol'>\n" +  // column 5
        "       <div id='footerCol5' class='footerColCustContainer'></div>\n" +
        "       <div>page type: " + rootFolder + "</div>\n" +
        "       <div id='footerFolderType'></div>\n" +
        "       <div id='footerPageHits'></div>\n" +
        //"  <div class='footerMessage'>last modified: " + lastModified + "</div>\n" +
        //"  <div id='footerLastBuild' class='footerVersionMessage'></div>\n";
        "    </div>\n" +
        "</div>\n" +
        "<div class='footerFooter'>\n" +
        "    <div id='footerMessage'></div>\n" +
        "    <div id='footerMessage2'></div>\n" +
        "    <div id='copyright'>&copy; 2020 - <a href='https://curtisrhodes.com/IntelDsgn'>Intelligent Design SoftWare</a></div>\n" +
        "</div>\n" +
        "</div>\n";
    }

