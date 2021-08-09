
function loadSnippets() {
    displayTanBlueMenu();
}

function display2aT() {
    $('#middleColumn').html(`<div class='landingPageHeader'>2aT</div>`);
}

function displayOldWebsite() {
    $('#middleColumn').html(`<div class='landingPageHeader'>Brucheum</div>`);
}

function displayFlitter() {
    $('#middleColumn').html(`<div class='landingPageHeader'>Flitte</div>`);
}

function displayTanBlueMenu() {
    tanBlueMenuSnippet = `
        <div id="tanBlue" class="vMenu">
            <div id="itemIntelDesgn" class="tabvMenuItem" onclick="window.location.href='index.html?spa=IntelDesign'">
                <img src="Images/TanBlue/IntelligentDesignTan.png" onmouseover="this.src='Images/TanBlue/IntelligentDesignBlue.png'" onmouseout="this.src='Images/TanBlue/IntelligentDesignTan.png'" />
            </div>
            <div id="itemBlondJew" class="tabvMenuItem" onclick="showBook(1)">
                <img src="Images/TanBlue/BlondJewTan.png" onmouseover="this.src='Images/TanBlue/BlondJewBlue.png'" onmouseout="this.src='Images/TanBlue/BlondJewTan.png'" />
            </div>
            <div id="itemBrucheum" class="tabvMenuItem" onclick="displayOldWebsite()">
                <img src="Images/TanBlue/BrucheumTan.png" onmouseover="this.src='Images/TanBlue/BrucheumBlue.png'" onmouseout="this.src='Images/TanBlue/BrucheumTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="displayFlitter()">
                <img src="Images/TanBlue/FlitterTan.png" onmouseover="this.src='Images/TanBlue/FlitterBlue.png'" onmouseout="this.src='Images/TanBlue/FlitterTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="window.location.href='index.html?spa=GetaGig'">
                <img src="Images/TanBlue/GetaJobTan.png" onmouseover="this.src='Images/TanBlue/GetaJobBlue.png'" onmouseout="this.src='Images/TanBlue/GetaJobTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="window.location.href='showbook(2)">
                <img src="Images/TanBlue/TimeSquaredTan.png" onmouseover="this.src='Images/TanBlue/TimeSquaredBlue.png'" onmouseout="this.src='Images/TanBlue/TimeSquaredTan.png'" />
            </div>
            <div id="item2aT" class="tabvMenuItem" onclick="display2aT()">
                <img src="Images/TanBlue/ToATeeTan.png" onmouseover="this.src='Images/TanBlue/ToATeeBlue.png'" onmouseout="this.src='Images/TanBlue/ToATeeTan.png'" />
            </div>
        </div>`;
}

function displayBookPanel() {
    bookPanelSnippet = `
                    <div class="divMyBooks">
                        <div class="divBook" book="The Blond Jew" onclick="showBook(1)">
                            <img class="bookImage" src="Images/TheBlondJew.jpg" />
                        </div>
                        <div class="divBook" book="Time Squared" onclick="showBook(2)">
                            <img class="bookImage" src="Images/TimeSquared.jpg" />
                        </div>
                        <div class="divBook" book="Ready; Fire; Aim" onclick="showBook(3)'">
                            <img class="bookImage" src="Images/ReadyFireAim.jpg" />
                        </div>
                    </div>





    <div id="divBookPannel">
        <div id="divPannelHeader">
            Check out my books
    </div>
        <div class="divBookImage" book="The Blond Jew" onclick="window.location.href='/BookDb/ToC?book=1'">
            <img class="bookImage" src="~/Images/Books/TheBlondJew.jpg" />
        </div>
        <div class="divBookImage" book="Time Squared" onclick="window.location.href='/BookDb/ToC?book=2'">
            <img class="bookImage" src="~/Images/Books/TimeSquared.jpg" />
        </div>
        <div class="divBookImage" book="Ready; Fire; Aim" onclick="window.location.href='/BookDb/ToC?book=3'">
            <img class="bookImage" src="~/Images/Books/ReadyFireAim.jpg" />
        </div>
    </div>`;
}

///ToDo
// fill in snippets.