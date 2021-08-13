
function displayFooter(footerContext) {
    try {
        $('footer').html(`
        <div class='flexContainer'>\n
                <div class='footerCol' id='footerCol1'></div>\n
                <div class='footerCol' id='footerCol2'></div>\n
                <div class='footerCol' id='footerCol3'></div>\n
                <div class='footerCol' id='footerCol4'></div>\n
                <div class='footerCol' id='footerCol5'></div>\n
                <div class='footerCol' id='footerCol6'></div>\n
                <div class='footerCol floatRight' id='footerCol7'></div>\n 
               </div>\n<div class='footerFooter'>\n
                   <div id='footerMessage'></div>\n
                   <div id='footerMessage2'></div>\n
                   <div id='copyright'>&copy; 2020 - <a href='https://curtisrhodes.com/index.html?spa=IntelDesign' target='_blank'>Intelligent Design SoftWare</a></div>\n
               </div>\n
            </div>`
        );
        switch (footerContext) {
            case "welcome":
                $('#footerCol1').html(`
                    <div class='clickable' onclick='displayFeedback()'>Articles</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Books</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Apps</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Professional</div>\n`
                );
                $('#footerCol2').html(`
                    <div class='clickable' onclick='footerItemClick(1)'>Blog</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Sitemap</div>\n
                    <div class='clickable' onclick='displayFeedback()'>Feedback</div>\n`
                );
                $('#footerCol3').html(`
                    <div class='clickable' onclick='footerItemClick(1)'>email site developer</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Search</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Research</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Advertize</div>\n`
                );
                $('#footerCol4').html(`
                    <div id='testMsg1'></div>
                    <div id='testMsg2'></div>
                    <div id='testMsg3'></div>
                    <div id='testMsg4'></div>
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n`
                );
                $('#footerCol5').html(`
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n`
                );
                $('#footerCol6').html(`
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n`
                );
                $('#footerCol7').html(`
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n
                    <div class='clickable' onclick='footerItemClick(1)'>Category List</div>\n`
                );
                break;
            case "blog":
            case "root":
            case "special":
            case "index": {
                $('#footerCol1').html(
                    "<div class='clickable' onclick='window.location.href=\"index.html?spa=3909\", \"_blank\"'>OgglePorn</div>\n" +
                    "<div class='clickable' onclick='window.location.href=\"index.html?folderId=1142\", \"_blank\"'>Centerfolds</div>\n");
                $('#footerCol2').html(
                    "<div class='clickable' onclick='showCatListDialog(2)'>Category List</div>\n" +
                    "<div class='clickable' onclick='showCatListDialog(3)'>Babes List</div>\n");
                break;
            }
            default: {
                logError("SWT", folderId, "rootFolder: " + rootFolder, "setOggleFooter");
                $('#footerCol1').html("<div>unhandled domain: " + rootFolder + "</div>\n");
                alert("footerContext not understood: " + footerContext)
                break;
            }
        }

        //if (document.domain != "localhost") {
        //    $('.footer').append("   <!-- Histats.com  START  (aync)-->\n" +
        //        "   <script type='text/javascript'>var _Hasync= _Hasync|| [];\n" +
        //        "   _Hasync.push(['Histats.start', '1,4458214,4,30,130,80,00010101']);\n" +
        //        "   _Hasync.push(['Histats.fasi', '1']);\n" +
        //        "   _Hasync.push(['Histats.track_hits', '']);\n" +
        //        "   (function() {\n" +
        //        "   var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;\n" +
        //        "   hs.src = ('//s10.histats.com/js15_as.js');\n" +
        //        "   (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);\n" +
        //        "   })();</script>\n");
        //}


        //if (isInRole("trusted"))
        //    $('#footerCol5').show();
        //else
        //    $('#footerCol5').hide();

    } catch (e) {
        alert("footer catch error: " + e);
        //logError("CAT", folderId, e, "setOggleFooter", "footer/" + calledFrom);
    }
}

function footerItemClick(footerItem) {
    alert("footerItemClick: " + footerItem);
}

function displayFeedback() {
    alert("displayFeedback");
    //\"FLC\",\"feedback\", rootFolder + "\", folderId + "
}
