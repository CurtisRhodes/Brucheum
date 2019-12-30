var numArticles = 21;
var rotationSpeed = 15000;
var carouselItemArray = new Array();
var imageNum = 0;
var carouselContainerHeight;
var Carousel;
var currentArticleId = 0;

function loadAndStartCarousel() {
    //alert("in rotator loadAndStartCarousel\nurl: " + settingsArray.ApiServer + "api/DbArticle?pageLen=" + numArticles + "&page=1&filterType=null&filter=null");

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/DbArticle?pageLen=" + numArticles + "&page=1&filterType=null&filter=null",
        //url: settingsArray.ApiServer + "/api/ArticleXml?pageLen=" + numArticles + "&page=0&filterType=none&filter=none",
        success: function (articleList) {
            $.each(articleList, function (idx, article) {
                carouselItemArray.push(article);
            });
            $('.centeredDivShell').show();
            var carouselArrayItem = carouselItemArray[imageNum];
            currentArticleId = carouselArrayItem.Id;
            var fullImageName = settingsArray.ApiServer + "/App_Data/Images/" + carouselArrayItem.ImageName;
            $('#articleTitle').html(carouselArrayItem.Title);
            $('#articleCat').html(carouselArrayItem.CategoryLabel.trim());
            $('#carouselImage').attr('src', fullImageName).fadeIn("slow");;
            $('#carouselImage').css('z-index', 10);
            rotate();
        },
        error: function (xhr) {
            alert("loadAndStartCarousel error: " + xhr.statusText);
        }
    });
};

function stopCarousel() {
    clearInterval(Carousel);
}

function startCarousel() {
    clearInterval(Carousel);
    rotate();
}

function viewArticle() {
    clearInterval(Carousel);
    window.location.href = "Article.html?ArticleViewId=" + currentArticleId;
}

function clickPrevious() {
    //alert("clickPrevious")
    imageNum--;
    if (imageNum > 0)
        imageNum--;
    else
        imageNum = numArticles;
    clearInterval(Carousel);
    rotate();
    event.stopPropagation();
    return false;
}

function clickNext() {
    //alert("clickNext")
    clearInterval(Carousel);
    imageNum++;
    if (imageNum >= numArticles)
        imageNum = 0;
    rotate();
    event.stopPropagation();
    return false;
}

function rotate() {
    var carouselArrayItem = carouselItemArray[imageNum];
    currentArticleId = carouselArrayItem.Id;
    var fullImageName = settingsArray.ApiServer + "/App_Data/Images/" + carouselArrayItem.ImageName;
    $('#articleTitle').html(carouselArrayItem.Title);
    $('#articleCat').html(carouselArrayItem.CategoryLabel.trim());
    $('#carouselImage').attr('src', fullImageName).fadeIn(5000);
    $('#carouselImage').css('z-index', 1000);
    resizeAddRotator();

    imageNum++;
    Carousel = setInterval(function () {
        carouselArrayItem = carouselItemArray[imageNum];
        fullImageName = settingsArray.ApiServer + "/App_Data/Images/" + carouselArrayItem.ImageName;
        $('#articleTitle').html(carouselArrayItem.Title);
        $('#articleCat').html(carouselArrayItem.CategoryLabel.trim());
        $('#carouselImage').attr('src', fullImageName).fadeIn(5000);
        imageNum++;
        if (imageNum >= numArticles) {
            imageNum = 0;
        }
        resizeAddRotator();
    }, rotationSpeed);
}

function resizeAddRotator() {
    resizePage();

    $('#carouselImage').css('width', parseInt($('#middleColumn').css('width')) * .65);
    $('#carouselImage').css('height', parseInt($('#middleColumn').css('height')) * .65);
    $('.centeredDivShell').css('top', $('#middleColumn').position().top + (parseInt($('#middleColumn').css('height')) - parseInt($('#carouselImage').css('height'))) * .5);

    //alert("top: " + $('.centeredDivShell').css('top'));
    //alert("top: " + (parseInt($('#middleColumn').css('height')) - parseInt($('#carouselImage').css('height'))) * .5);


    $('#rightFbutton').css('left', $('#carouselImage').width());
    $('.arrowButton').css('top', $('#carouselImage').height() * .475);
    $('#articleCat').css('top', $('#carouselImage').height() + 1);

    //alert("$('#middleColumn ').css('width'):   " + $('#middleColumn ').css('width') + " $('#carouselImage').css('width'): " + $('#carouselImage').css('width'));
}


