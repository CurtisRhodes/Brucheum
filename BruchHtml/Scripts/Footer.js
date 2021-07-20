
function displayFooter() {
    $('footer').html(`
        <div class="flexContainer">
            <div class="footerCol">
                <div><a href="~/Home/Index">Articles</a></div>
                <div><a href="~/Book/MyBooks">Books</a></div>
                <div><a href="~/IntelDsgn/Index">Professional</a></div>
                <div><a href="#">Apps</a></div>
            </div>
            <div class="footerCol">
                <div><a href="~/Home/Index">Boobs Rater</a></div>
                <div><a href="~/Home/ImagePage?folder=908">Rejects</a></div>
                <div><a href="~/home/Videos">Nasty Videos</a></div>
                <div><a href="/album.html?folder=1132">Centerfolds</a></div>
            </div>
            <div class="footerCol">
                <div><a href="#">Site Map</a></div>
                <div><a href="#">Search</a></div>
                <div><a href="#">Research</a></div>
                <div><a href="#">Advertize</a></div>
            </div>
            <div class="footerCol">
                <div id='testMsg1'></div>
                <div id='testMsg2'></div>
                <div id='testMsg3'></div>
                <div id='testMsg4'></div>
            </div>
        </div>
        <div id="footerLastBuild" class="footerVersionMessage"></div>
        <div class="footerFooter">
            <div id="footerMessage"></div>
            <div id="copyright">&copy; 2019 - <a href="~/IntelDsgn/Index">Intelligent Design SoftWare</a></div>
        </div>`);
}