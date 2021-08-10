
function displayFooter(footerContext) {
    displayDefaultFooterHtml();
    switch (footerContext) {
        case "welcome":
            break;

        default:
            alert("footerContext not understood: " + footerContext)
    }
}

function displayFeedback() {
    //\"FLC\",\"feedback\", rootFolder + "\", folderId + "
}

function displayDefaultFooterHtml() {
    $('.footer').html(`
        <div class='flexContainer'>\n
            <div class='footerCol'>\n  // column 1
               <div class='clickable' onclick='displayFeedback()'>Feedback</div>\n
               <div id='footerCol1' class='footerColCustContainer'></div>\n
            </div>\n
            <div class='footerCol'>\n // column 2
               <div class='clickable' onclick='window.location.href=\"index.html?spa=3911\", \"_blank\"'>Blog</div>\n
               <div id='footerCol2' class='footerColCustContainer'></div>\n
            </div>\n
            <div class='footerCol'>\n // column 3
               <div class='clickable' onclick='rtpe(\"FLC\",\"mailme\",\"mailme\", folderId + ")'>email site developer</div>\n
               <div id='footerCol3' class='footerColCustContainer'></div>\n
            </div>\n
            <div class='footerCol'>\n  // column 4
               <div id='footerPageHits'></div>\n
               <div id='footerCol4' class='footerColCustContainer'></div>\n
            </div>\n
            <div class='footerCol'>\n  // column 5
               <div id='footerCol5' class='footerColCustContainer'>
                   <div class='clickable' onclick='window.open(\"index.html?spa=3910\")'>dashboard</div>\n
                   <div>page type:  rootFolder + "</div>\n
                   <div id='footerFolderType'></div>\n
                   <div id='footerStaticPage'></div>\n
               </div>\n
            </div>\n
            <div class='footerCol'>\n  // column 6
           <div id='histats_counter'></div>\n
               <div id='footerCol6' class='footerColCustContainer'>\n
               </div >\n
            </div>\n
            <div class='rightMostfooterColumn'>\n  // column 7
               <div id='footerCol7' class='rightMostColCustContainer'>\n
                   <a href='https://ipinfo.io/' alt='IPinfo - Comprehensive IP address data, IP geolocation API and database'>
                   this site uses<img src='/images/ipinfo.png' height='40' /></a>\n
               </div >\n
            </div>\n
           </div>\n<div class='footerFooter'>\n
               <div id='footerMessage'></div>\n
               <div id='footerMessage2'></div>\n
               <div id='copyright'>&copy; 2020 - <a href='https://curtisrhodes.com/index.html?spa=IntelDesign' target='_blank'>Intelligent Design SoftWare</a></div>\n
           </div>\n
        </div>`
    );
}

