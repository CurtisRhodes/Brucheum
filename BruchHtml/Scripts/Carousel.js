var numArticles = 201;
var rotationSpeed = 6000;
var carouselItemArray = new Array();
var imageNum = 0;
var carouselContainerHeight;
var CarouselRotatorInterval;

function loadAndStartCarousel() {
    $('#carouselImage').css('cursor', 'no-drop');
    $('#carouselImage').attr('src', "Images/ingranaggi3.gif" ).fadeIn(50, resizeAddRotator());

    $('#carosuelContainer').show();
    let url = settingsArray.ApiServer + "api/Article/GetArticleList?pageLen=" + numArticles + "&page=1&filterType=null&filter=null";
    $.ajax({
        type: "GET",
        url: url,
        success: function (articlesModel) {
            console.log("articlesModel.Success: " + articlesModel.Success);
            if (articlesModel.Success === "ok") {
                console.log("articlesModel.articleList len: " + articlesModel.ArticleList.length);
                $.each(articlesModel.ArticleList, function (idx, article) {
                    carouselItemArray.push(article);
                });
                console.log("carouselItemArray len: " + carouselItemArray.length);
                $('#carouselImage').css('cursor', 'pointer');
                rotate();
            }
            else {
                $('#carosuelContainer').hide();
                alert("loadAndStartCarousel: " + articlesModel.Success);
            }
        },
        error: function (jqXHR) {
            $('#carosuelContainer').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            alert("XHR error in loadAndStartCarousel: " + errorMessage + "\nurl: " + url);
        }
    });
}

function stopCarousel() {
    clearInterval(Carousel);
}

function startCarousel() {
    clearInterval(Carousel);
    rotate();
}

function clickPrevious() {
    imageNum--;
    if (imageNum < 0)
        imageNum = numArticles;
    clearInterval(CarouselRotatorInterval);
    rotate();
    event.stopPropagation();
    return false;
}

function clickNext() {
    //alert("clickNext")
    clearInterval(CarouselRotatorInterval);
    imageNum++;
    if (imageNum >= numArticles)
        imageNum = 0;
    rotate();
    event.stopPropagation();
    return false;
}

function rotate() {
    displayCarouselItem();
    CarouselRotatorInterval = setInterval(function () {
        imageNum++;
        if (imageNum >= numArticles) {
            imageNum = 0;
        }
        displayCarouselItem();
        resizeAddRotator();
    }, rotationSpeed);
}

function displayCarouselItem() {
    var carouselArrayItem = carouselItemArray[imageNum];
    currentArticleId = carouselArrayItem.Id;
    $('#articleTitle').html(carouselArrayItem.Title);
    //$('#articleCat').html(carouselArrayItem.CategoryLabel.trim());
    $('#articleCat').html(carouselArrayItem.CategoryLabel);
    $('#carouselImage').attr('src', "https://" + carouselArrayItem.ImageName).fadeIn(500, resizeAddRotator());
    $('#carouselImage').click(function () { viewArticle(carouselArrayItem.Id); });
    //$('#carouselImage').attr('src', settingsArray.ImageArchive + carouselArrayItem.ImageName).fadeIn(500, resizeAddRotator());
    $('#carouselImage').css('z-index', 1000);
}

function resizeAddRotator() {
    resizePage();

    //$('#carouselImage').css('max-width', parseInt($('#middleColumn').css('width')) * .65);
    $('#carouselImage').css('height', parseInt($('#middleColumn').css('height')) * .65);

    $('.centeredDivShell').css('top', $('#middleColumn').position().top + (parseInt($('#middleColumn').css('height')) - parseInt($('#carouselImage').css('height'))) * .5);

    //alert("top: " + $('.centeredDivShell').css('top'));
    //alert("top: " + (parseInt($('#middleColumn').css('height')) - parseInt($('#carouselImage').css('height'))) * .5);

    setTimeout(function () {
        $('#rightFbutton').css('left', $('#carouselImage').width() - 4);
        $('.arrowButton').css('top', $('#carouselImage').height() * .475);
        $('#articleCat').css('top', $('#carouselImage').height() + 1);
        //$('.arrowButton').css('z-index', 2);
        //$('#carouselImage').css('z-index', 200);
    }, 300);

    //$('#leftFbutton').css('left', $('#carouselImage').width());

    //alert("$('#middleColumn ').css('width'):   " + $('#middleColumn ').css('width') + " $('#carouselImage').css('width'): " + $('#carouselImage').css('width'));
    //#leftFbutton {
    //    margin - left: -60px;
    //}
}


