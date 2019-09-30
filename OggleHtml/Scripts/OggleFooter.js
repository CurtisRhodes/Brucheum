function setOggleFooter(subdomain) {
    var footerhtml = "";

    if (subdomain === "boobs" || subdomain === "archive") {
        //alert("setOggleFooter: " + subdomain);
        footerhtml =
            "<div class='flexContainer'>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='~/Home/Index'>Let Me Explain</a></div>\n" +
            "        <div><a href='~/Book/MyBooks'>Category List</a></div>\n" +
            "        <div><a href='#'></a></div>\n" +
            "        <div><a href='/index.html?subdomain=porn'>Nasty Porn</a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='/Ranker.html'>Boobs Rater</a></div>\n" +
            "        <div><a href='~/Home/ImagePage?folder=908'>Rejects</a></div>\n" +
            "        <div><a href='~/home/Videos'>Nasty Videos</a></div>\n" +
            "        <div><a href='/album.html?folder=1132'>Centerfolds</a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='#'>About us</a></div>\n" +
            "        <div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
            "        <div><a href='/Admin/Blog'>Blog</a></div>\n" +
            "        <div><a href='/album.html?folder=3'>Archive</a></div>\n" +
            "    </div>\n" +
            "</div>\n" +
            "<div id='footerLastBuild' class='footerVersionMessage'></div>\n" +
            "<div class='footerFooter'>\n" +
            "    <div id='footerMessage'></div>\n" +
            "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
            "</div>\n";
    }
    if (subdomain === "playboy") {
        footerhtml =
            "<div class='flexContainer'>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='~/Home/Index'>Let Me Explain</a></div>\n" +
            "        <div><a href='#'></a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='/Ranker.html'>Playmate Rater</a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
            "        <div><a href='/Admin/Blog'>Blog</a></div>\n" +
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
            "        <div><a href='~/Home/Index'>Let Me Explain</a></div>\n" +
            "        <div><a href='~/Book/MyBooks'>Category List</a></div>\n" +
            "        <div><a href='#'></a></div>\n" +
            "        <div><a href='/index.html?subdomain=porn'>Nasty Porn</a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='/Ranker.html'>Boobs Rater</a></div>\n" +
            //"        <div><a href='~/Home/ImagePage?folder=908'>Rejects</a></div>\n" +
            "        <div><a href='~/home/Videos'>Nasty Videos</a></div>\n" +
            "        <div><a href='/album.html?folder=1132'>Centerfolds</a></div>\n" +
            "    </div>\n" +
            "    <div class='footerCol'>\n" +
            "        <div><a href='#'>About us</a></div>\n" +
            "        <div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
            "        <div><a href='/Admin/Blog'>Blog</a></div>\n" +
            "        <div><a href='/album.html?folder=440'>Slut Archive</a></div>\n" +
            "    </div>\n" +
            "</div>\n" +
            "<div id='footerLastBuild' class='footerVersionMessage'></div>\n" +
            "<div class='footerFooter'>\n" +
            "    <div id='footerMessage'></div>\n" +
            "    <div id='copyright'>&copy; 2019 - <a href='~/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>\n" +
            "</div>\n";
    }

    if (footerhtml === "")
        alert("setOggleFooter unknown: " + subdomain);

    $('footer').html("");
    $('footer').html(footerhtml);
}
