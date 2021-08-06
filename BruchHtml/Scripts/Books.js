let pageIndex = 0;
let bookModel = {}, bookPages = [];
let pageNumber = 0, bookPageLen = 2600;

function showMyBooksPage() {
    $("#tanBlue").hide();
    //clearInterval(Carousel);
    //clearInterval(CarouselRotatorInterval);
    $('#divBookPannel').hide();
}

function showBook(bookId) {
    switch (bookId) {
        case 1: // the blond jew
            loadBookAndShowToC(bookId);
            break;
        default:
            alert("bookId: " + bookId);
    }
    resizeBookPage();
    $(window).resize(function () {
        resizeBookPage();
    });
}

function loadBookAndShowToC(bookId) {
    try {
        $('#divBookPannel').hide();
        $('#tanBlue').hide();
        $("#middleColumn").html(`
            <div><img id="tocLoadingGif" class="loadingGif" src="Images/loader.gif" /></div>
            <div id="tocBookTitle" class="bookTitle" onclick='showPage(1,1,1)'></div>
            <div id="divToC" class="toCcontainer"></div>`
        );
        $('#tocLoadingGif').show();
        $.ajax({
            type: "get",
            url: settingsArray.ApiServer + "/api/BookDb/GetBook?bookId=" + bookId,
            success: function (bookSuccessModel) {                
                if (bookSuccessModel.Success != "ok") {
                    $('#tocLoadingGif').hide();
                    alert("loadBookAndShowToC: " + bookSuccessModel.Success);
                }
                else {
                    bookModel = bookSuccessModel;
                    showToC(bookId);
                    breakBookIntoPages();
                    $('#tocLoadingGif').hide();
                }
            },
            error: function (jqXHR, exception) {
                $('#tocLoadingGif').hide();
                alert("loadBookAndShowToC XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        $('#tocLoadingGif').hide();
        alert("loadBookAndShowToC CATCH: " + e);
    }
}

function showToC(bookId) {
    $('#tocBookTitle').html(bookModel.BookTitle);
    $.each(bookModel.Chapters, function (idx, chapter) {
        // kludge String To Prevent Jquery .append() from auto closing divs
        var kludge = "<div class='chapterContainer'>";
        kludge += "<div id=ct" + chapter.Id + " class='chapterName' onclick='showPage(" + chapter.Id + ",0,0)'>" + chapter.ChapterOrder + ": " + chapter.ChapterTitle + "</div>";
        kludge += "<div class='dots' onclick='toggleTocSection(" + chapter.Id + ")'></div>";
        kludge += "<div class='divCaret'><img id=img" + chapter.Id + " onclick='toggleTocSection(" + chapter.Id + ")' src='/Images/caretDown.png'></div></div>";
        kludge += "</div>";
        kludge += "<div id=st" + chapter.Id + " class='tocSectionContainer'>";
        $.each(chapter.Sections, function (idx, section) {
            kludge += "<div id=sc" + section.Id + " class='divSection' onclick='showPage(" + chapter.Id + "," + section.Id + ",0)'>" + section.SectionOrder + ": " + section.SectionTitle + "</div>";
            kludge += "<div class='divSubsections'>";
            $.each(section.SubSections, function (idx, subSection) {
                kludge += "<div class='divSubSection' onclick='showPage(" + chapter.Id + ",";
                kludge += section.Id + "," + subSection.SubSectionId + ")'>" + subSection.SubSectionOrder + ": " + subSection.SubSectionTitle + "</div>";
            })
            kludge += "</div>";
        });
        kludge += "</div>";
        $('#divToC').append(kludge);
    })
}

function showPage(chapterId, sectionId, subSectionId) {
    let pageArrayItem;
    if (sectionId == 0) {
        pageArrayItem = bookPages.filter(obj => {
            return obj.Chapter == chapterId;
        });
    }
    else {
        pageArrayItem = bookPages.filter(obj => {
            return obj.Chapter == chapterId && obj.Section == sectionId && obj.SubSection == subSectionId
        });
    }
    if (pageArrayItem.length == 0) {
        alert("SHOW PAGE\nbookId: " + bookModel.Id + ", chapterId: " + chapterId + ", section: " + sectionId + ", subSection: " + subSectionId + "  Not Found");
    }
    else {
        pageIndex = pageArrayItem[0].Page;

        if (bookModel.Id == 1) {
            $("#middleColumn").html(pauapStyle());
            $('#bookLeftContent').html(bookPages[pageIndex].PageContents);
            $('#pgNumLeft').html(pageIndex);
            $('#bookRightContent').html(bookPages[++pageIndex].PageContents);
            $('#pgNumRight').html(pageIndex);
        }
        if (bookModel.Id == 3) {
            //alert("pages.length: " + bookPages.length)
            $('#twoPageBookStyleLeftContent').html(bookPages[pageIndex]);
            $('#twoPageBookStyleRightContent').html(bookPages[++pageIndex]);
        }
    }
}

function breakBookIntoPages() {
    //bookPages = new Array();
    //let bookPageLen = calcPageCharCount();
    let pageHeader = "<div class='bookTitle'>" + bookModel.BookTitle + ": Introduction</div>";
    let textfragment = "<div class='sectionContents'>" + bookModel.Introduction + "</div>";
    addPages(0, 0, 0, pageHeader, textfragment);
    textfragment = "<div class=''>" + bookModel.Preface + "</div>";
    pageHeader = "<div class='bookPreface'>preface</div>";
    addPages(0, 1, 0, pageHeader, textfragment);
    $.each(bookModel.Chapters, function (idx, chapter) {
        pageHeader = "<div class='chapterHeader'>Chapter " + chapter.ChapterOrder + " : " + chapter.ChapterTitle + "</div>";
        pageHeader += "<div class='bookPreface'>preface</div>";
        textfragment = "<div class='bookPreface'>" + chapter.Preface + "</div>";
        addPages(chapter.Id, 0, 0, pageHeader, textfragment);
        $.each(chapter.Sections, function (idx, section) {
            pageHeader = "<div class='chapterHeader'>Chapter " + chapter.ChapterOrder + " : " + chapter.ChapterTitle + "</div>";
            pageHeader += "<div class='sectionHeader'>" + section.SectionOrder + " : " + section.SectionTitle + "</div>";
            textfragment = "<div class='sectionContents'>" + section.SectionContents + "</div>";
            addPages(chapter.Id, section.Id, 0, pageHeader, textfragment);

            if (section.SubSections.length > 0) {
                $.each(section.SubSections, function (idx, subSection) {
                    pageHeader = "<div class='subSectionHeader'>" + subSection.SubSectionOrder + " : " + subSection.SubSectionTitle + "</div>";
                    textfragment = "<div class='sectionContents'>" + subSection.SubSectionContents + "</div>";
                    addPages(chapter.Id, section.Id, subSection.Id, pageHeader, textfragment);
                });
            }
        });
    });
}

function calcPageCharCount() {
    var middleColumnHeight = $('#middleColumn').height();
    var lineHeight = 44;
    var lineCount = middleColumnHeight / lineHeight;
    //alert("estimated line count: " + lineCount);
    var pageAreaWidth = $('#bookLeftContent').width()
    var characterWidth = 8;
    var charactersPerLine = pageAreaWidth / characterWidth;
    var pageCharCount = lineCount * charactersPerLine
    //alert("pageCharCount: " + pageCharCount)
    //return pageCharCount;

    return 1500;
}

function addPages(chapter, section, subSection, pageHeader, textfragment) {
    let pagesLen = 0;
    while (pagesLen < textfragment.length) {
        bookPages.push({
            Page: pageNumber++,
            Chapter: chapter,
            Section: section,
            SubSection: subSection,
            PageContents: pageHeader + textfragment.substr(pagesLen, bookPageLen)
        });
        pagesLen += bookPageLen;
    };
}

function pauapStyle() {
    return `
        <div id="bookTitle" class="pageTitle clickable" onclick="redirectToToC()">
            <div id="bookContentsLoadingGif" class="loadingGif"><img src="Images/loader.gif" /></div>
        </div>
        <div id="bookContentsContainer" class="block">
            <div id="paupaStyleContainer" class="paupaStyle">
                <div class="flexContainer">
                    <img class="floatLeft" src="Images/PaupaBook/book-cornertopleft.png" />
                    <div class="paupaBorderContainer">
                        <img class="floatLeft full" src="Images/PaupaBook/book-topLeft.png" />
                        <div id="paupaChapterTitle" class="absTitle"></div>
                    </div>
                    <img class="floatLeft" src="Images/PaupaBook/book-innerspinetop.png" />
                    <img class="floatLeft paupaBorderContainer" src="Images/PaupaBook/book-topRight.png" />
                    <img class="floatLeft" src="Images/PaupaBook/book-cornertopright.png" />
                </div>
                <div class="flexContainer paupaPageColor">
                    <img class="floatLeft" src="Images/PaupaBook/book-left.png" />
                    <div class="floatLeft paupaPage" id="bookLeftContent"></div>
                    <img class="floatLeft" src="Images/PaupaBook/book-innerspine.jpg" />
                    <div class="floatLeft paupaPage" id="bookRightContent"></div>
                    <img class="floatLeft" src="Images/PaupaBook/book-right.png" />
                </div>
                <div class="flexContainer">
                    <img class="floatLeft" src="Images/PaupaBook/book-cornerbleft.png" />
                    <img class="floatLeft paupaBorderContainer clickable" id="bookBottomLeft" src="Images/PaupaBook/book-bottomleft.png" 
                        onclick="pagePrevious()" />
                    <img class="floatLeft" src="Images/PaupaBook/book-innerspinebottom.png"/>
                    <img class="floatLeft paupaBorderContainer" id="bookBottomRight" class="clickable" src="Images/PaupaBook/book-bottomright.png"
                            onclick="pageNext()" />
                    <img class="floatLeft" src="Images/PaupaBook/book-cornerbright.png" />
                </div>
            </div>
            <div id="pgNumLeft" class="inlineRelative" style="bottom:43px; left:250px"  >PAGE</div>
            <div id="pgNumRight" class="inlineRelative" style="bottom:43px; left:1200px"  >PAGE</div>

            <div id='tocEdit'><a href='javascript:callPauapEdit()'>Edit</a></div>
        </div>`;
}

function pageNext() {
    //alert("pageNext  pageIndex: " + pageIndex + "   pages.length: " + pages.length);
    if (pageIndex + 2 <= bookPages.length) {
        $('#bookLeftContent').html(bookPages[pageIndex++].PageContents);
        $('#pgNumLeft').html(pageIndex);
        $('#bookRightContent').html(bookPages[pageIndex++].PageContents);
        $('#pgNumRight').html(pageIndex);
    }
    else {
        if (pageIndex + 1 >= bookPages.length) {
            alert("final page")
            $('#bookLeftContent').html(bookPages[pageIndex++].PageContents);
            $('#bookRightContent').html("");
        }
        if (pageIndex + 1 == bookPages.length) {
            $('#bookLeftContent').html("The End");
            $('#bookRightContent').html("");
        }
        $('#pgNumLeft').html(pageIndex - 1);
        $('#pgNumRight').html(pageIndex);
    }
    resizeBookPage();
    console.log("pageNext. bookPages[pageIndex].Chapter: " + bookPages[pageIndex].Chapter + " bookPages[pageIndex].Section: " + bookPages[pageIndex].Section);
}

function pagePrevious() {
    if (pageIndex - 2 > 0) {
        $('#bookRightContent').html(bookPages[pageIndex--].PageContents);
        $('#pgNumLeft').html(pageIndex);
        $('#bookLeftContent').html(bookPages[pageIndex--].PageContents);
        $('#pgNumRight').html(pageIndex);
    }
    else {
        if (pageIndex == 2) {
            $('#bookRightContent').html(bookPages[1].PageContents);
            $('#pgNumLeft').html(1);
            $('#bookLeftContent').html(bookPages[2].PageContents);
            $('#pgNumRight').html(2);
        }
        else {
            $('#bookRightContent').html(bookPages[0].PageContents);
            $('#pgNumLeft').html(0);
            $('#bookLeftContent').html(bookPages[1].PageContents);
            $('#pgNumRight').html(1);
        }
        pageIndex--;
        //alert("top");
    }
    resizeBookPage();
    console.log("pagePrevious. bookPages[pageIndex].Chapter: " + bookPages[pageIndex].Chapter + " bookPages[pageIndex].Section: " + bookPages[pageIndex].Section);
}

function redirectToToC() {
    showBook(bookModel.BookId);
}

function toggleChapter(id) {
    alert("toggleChapter(id): " + id);
    var caretImg = $('#img' + id);
    var chapterContainer = $('#ct' + id);
    if (caretImg.attr('src') == "/Images/downCaret.png") {
        chapterContainer.show();
        caretImg.attr('src', '/Images/upCaret.png');
    }
    else {
        caretImg.attr('src', '/Images/downCaret.png')
        sectionContainer.hide();
    }
};

function toggleTocSection(id) {
    //alert("toggleTocSection(id): " + id);
    var caretImg = $('#img' + id);
    var sectionContainer = $('#st' + id);
    if (caretImg.attr('src') == "/Images/caretDown.png") {
        sectionContainer.show();
        caretImg.attr('src', '/Images/caretUp.png');
    }
    else {
        caretImg.attr('src', '/Images/caretDown.png')
        sectionContainer.hide();
    }
}

function redirectToEdit() {
    //window.location.href = "/BookDb/Edit?book=" + bookId;
    //window.location.href = "/BookDb/Write?book=" + bookId;
}

function resizeBookPage() {
    // set page width
    var winW = $(window).width();
    var lcW = $('#leftColumn').width();
    var rcW = $('#rightColumn').width();
    $('#middleColumn').width(winW - lcW - rcW);

    //set page height
    var winH = $(window).height();
    var headerH = $('header').height();
    $('#middleColumn').css("height", winH - headerH - 5);
    $('#bookLeftContent').css('height', winH - headerH - 288);
    $('#pauapEditorContainer').css("width", $('#middleColumn').width());
    $('#pauapEditorContainer').css("height", $('#middleColumn').height() - 222);
    $(".note-editable").css("height", $("#pauapEditorContainer").height());

    $('#testMsg1').html("mch: " + $('#middleColumn').height());
    $('#testMsg2').html("bcc: " + $('#bookLeftContent').height());
    $('#testMsg3').html("3clH: " + $('.threeColumnLayout').height());
}

function callPauapEdit() {
    console.log("pauapEdit Chapter: " + bookPages[pageIndex].Chapter + " Section: " + bookPages[pageIndex].Section);
    pauapEdit(bookModel, bookPages[pageIndex].Chapter, bookPages[pageIndex].Section);
}

////////////////////////////////////////////////////////
