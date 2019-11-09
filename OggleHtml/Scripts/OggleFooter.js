function setOggleFooter(subdomain) {
    //alert("subdomain: " + subdomain);
    var footerhtml = "";
    if (subdomain === "boobs" || subdomain === "archive") {
        //alert("setOggleFooter: " + subdomain);
        footerhtml =
            "<div class='flexContainer'>\n" +
            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",3942)'>about us</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",3941)'>Category List</div>\n" +
            "        <div><a href='#'></a></div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",3909)'>Nasty Porn</div>\n" +
            "    </div>\n" + 

            "    <div class='footerCol'>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",3907)'>Boobs Rater</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",908)'>Rejects</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",3991)'>Nasty Videos</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",1132)'>Centerfolds</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='#'>About us</a></div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",3992)'>email site developer</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",3911)'>Blog</div>\n" +
            "        <div class='clickable' onclick='reportThenPerformEvent(\"FLC\",3)'>Archive</div>\n" +
            "    </div>\n" +
            "</div>\n" +
            "<div id='footerLastBuild' class='footerVersionMessage'></div>\n" +
            "<div class='footerFooter'>\n" +
            "    <div id='footerMessage'></div>\n" +
          //"        <div class='clickable' onclick='reportClickEvent(\"FLC\",3)'>Archive</div>\n" +
            "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
            "</div>\n";
    }
    if (subdomain === "playboy") {
        //alert("subdomain indeed is: " + subdomain);
        footerhtml =
            "<div class='flexContainer'>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='/album.html?folder=3796' onclick='reportClickEvent(\"FLC\",3796)'>Playboy Cybergirls</a></div>\n" +
            "        <div><a href='/album.html?folder=1986' onclick='reportClickEvent(\"FLC\",1986)'>Magazine covers</a></div>\n" +
            "        <div class='clickable' onclick='onclick='reportClickEvent(\"FLC\",3942)'; showCustomMessage(38)'>let me explain</div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='/Ranker.html?subdomain=playmates'onclick='reportClickEvent(\"FLC\",3907)'; >Playmate Rater</a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
            "        <div><a href='/Blog.html'onclick='onclick='reportClickEvent(\"FLC\",3911)'>Blog</a></div>\n" +
            "    </div>\n" +
            "</div>\n" +
            "<div id='footerLastBuild' class='footerVersionMessage'></div>\n" +
            "<div class='footerFooter'>\n" +
            "    <div id='footerMessage'></div>\n" +
            "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
            "</div>\n";
    }
    if (subdomain === "porn" || subdomain === "sluts") {
        //alert("setOggleFooter: " + subdomain);
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
        //alert("setOggleFooter unknown: " + subdomain);
        sendEmailToYourself("ERROR in Ogglefooter.js setOggleFooter", "subdomain: " + subdomain + "  not found");
    }
    $('footer').html("");
    $('footer').html(footerhtml);
}
