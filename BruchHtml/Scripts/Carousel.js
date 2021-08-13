var numArticles = 201;
var rotationSpeed = 6000;
var carouselItemArray = new Array();
var currentIndexId = 0;
var carouselContainerHeight;
var CarouselRotatorInterval;

function loadAndStartCarousel() {
    $('#middleColumn').html(`
        <div id="bruchCaveImage" class="caveImage">
            <div id="customMessage" class="displayHidden customMessageContainer"></div>
            <div id="divStatusMessage"></div>
            <div id="dots" style="color:white"></div>
            <div class="centeredDivShell">
                <div class="centeredDivInner">
                    <div id="carosuelContainer" class="carosuelContainer">
                        <img id="leftFbutton" class="arrowButton" src="Images/blueCircleLeft.png" onclick="clickPrevious()" />
                        <img id="rightFbutton" class="arrowButton" src="Images/blueCircleRight.png" onclick="clickNext()" />
                        <div id='articleTitle' class='carouselLabel'></div>
                        <div id='articleCat' class='carouselLabel'></div>
                        <div class="carouselImageContainer">
                            <img id="carouselImage" />
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    );
    $('#carouselImage').css('cursor', 'no-drop');
    $('#carouselImage').attr('src', "Images/ingranaggi3.gif").fadeIn(850, resizeCarouselImage());

    $('#carosuelContainer').show();
    let url = settingsArray.ApiServer + "api/Article/LoadCarousel?filterContext=General";
    $.ajax({
        type: "GET",
        url: url,
        success: function (carouselModel) {
            if (carouselModel.Success === "ok") {                
                $.each(carouselModel.CarouselItems, function (idx, carouselItem) {
                    carouselItemArray.push(carouselItem);
                });
                $('#carouselImage').css('cursor', 'pointer');
                rotate();
            }
            else {
                $('#carosuelContainer').hide();
                alert("loadAndStartCarousel: " + carouselModel.Success);
            }
        },
        error: function (jqXHR) {
            $('#carosuelContainer').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            alert("XHR error in loadAndStartCarousel: " + errorMessage + "\nurl: " + url);
        }
    });

    $(window).resize(function () {
        resizeCarouselImage();
    });
}

function stopCarousel() {
    clearInterval(CarouselRotatorInterval);
}

function startCarousel() {
    clearInterval(CarouselRotatorInterval);
    rotate();
}

function clickPrevious() {
    currentIndexId--;
    if (currentIndexId < 0)
        currentIndexId = numArticles;
    clearInterval(CarouselRotatorInterval);
    rotate();
    event.stopPropagation();
    return false;
}

function clickNext() {
    //alert("clickNext")
    clearInterval(CarouselRotatorInterval);
    currentIndexId++;
    if (currentIndexId >= numArticles)
        currentIndexId = 0;
    rotate();
    event.stopPropagation();
    return false;
}

function rotate() {
    displayCarouselItem();
    CarouselRotatorInterval = setInterval(function () {
        currentIndexId++;
        if (currentIndexId >= numArticles) {
            currentIndexId = 0;
        }
        displayCarouselItem();
    }, rotationSpeed);
}

function displayCarouselItem() {
    $('#articleTitle').html(carouselItemArray[currentIndexId].Title);
    $('#articleCat').html(carouselItemArray[currentIndexId].Category);
    let imageName = carouselItemArray[currentIndexId].ImageName;
    if (isNullorUndefined(imageName)) imageName = "Images/placeholder.png";
    $('#carouselImage').attr('src', "https://" + imageName).fadeIn(850, resizeCarouselImage());
    $('#carouselImage').click(function () { viewCarouselArticle(); });
}

function resizeCarouselImage() {
    //$('#carouselImage').css('width', $('#middleColumn').width() * .65);
    $('.centeredDivShell').css('top', parseInt($('#middleColumn').position().top + 65));
    $('#carouselImage').css('height', parseInt($('#middleColumn').height() * .75));
    setTimeout(function () {
        $('#rightFbutton').css('left', $('#carouselImage').width() - 4);
        $('.arrowButton').css('top', $('#carouselImage').height() * .475);
        $('#articleCat').css('top', $('#carouselImage').height() + 1);
    }, 666);
}

function viewCarouselArticle() {
    stopCarousel();
    console.log("viewArticle: " + carouselItemArray[currentIndexId].Title);
    displayViewArticle(carouselItemArray[currentIndexId].Id);
}

