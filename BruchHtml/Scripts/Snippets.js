function showBookPanel() {

    return `
    <div id="divBookPannel" class="mediumAddContainer bookPannel">
        <div class="bookPannelHeader">
            Check out my books
                </div>
        <div class="divBookImage" book="The Blond Jew" onclick="window.location.href='/BookDb/ToC?book=1'">
            <img class="bookImage" src="Images/TheBlondJew.jpg" />
        </div>
        <div class="divBookImage" book="Time Squared" onclick="window.location.href='/BookDb/ToC?book=2'">
            <img class="bookImage" src="Images/TimeSquared.jpg" />
        </div>
        <div class="divBookImage" book="Ready; Fire; Aim" onclick="window.location.href='/BookDb/ToC?book=3'">
            <img class="bookImage" src="Images/ReadyFireAim.jpg" />
        </div>
    </div>`;
}