let bjsBookId = 0; bjschapterId = 0, pageIndex = 0;
let bookModel = {}, bookPages = [];
let pageNumber = 0, bookPageLen = 1400;

function showBooks() {
    $("#tanBlue").hide();
    $("#middleColumn").html(`
        <div id="tocLoadingGif"><img class="loadingGif" src="Images/loader.gif" /></div>
        <div class="pageTitle" id = "divBooksWriting" > Books I am writing</div>
        <div id="divMyBooks">
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
        <div class="divLibrayPages" id="divBooksRead">Books I have Read</div>
        <div class="divLibrayPages" id="divBooksIOwn">Book I Own</div>
        `);
}

function showBook(bookId) {
    bjsBookId = bookId;
    switch (bookId) {
        case 1: // the blond jew
            loadBookAndShowToC();
            //showPages();
            //if (User.IsInRole("Book Editor"))
            //$("#middleColumn").append("<div id='tocEdit'><a href='javascript:editBook(" + bjsBookId + ")'>Edit</a></div>");
            break;
        default:
            alert("bookId: " + bjsBookId);
    }
    resizeBookPage();
    $(window).resize(function () {
        resizeBookPage();
    });
}

function showPage(chapter, section, subSection) {

    let pageArrayItem = bookPages.filter(obj => {
        return obj.Chapter == chapter && obj.Section == section && obj.SubSection == subSection
    });

    pageIndex = pageArrayItem[0].Page;

    console.log("show page: " + pageIndex);

    if (bjsBookId == 1) {
        $("#middleColumn").html(pauapStyle());
        $('#bookLeftContent').html(bookPages[pageIndex].PageContents);
        $('#bookRightContent').html(bookPages[pageIndex++].PageContents);
    }
    if (bjsBookId == 3) {
        //alert("pages.length: " + bookPages.length)
        $('#twoPageBookStyleLeftContent').html(bookPages[pageIndex]);
        $('#twoPageBookStyleRightContent').html(bookPages[pageIndex++]);
    }

    //$('#paupaChapterTitle').html("Chapter " + chapterObject.ChapterOrder + " " + chapterObject.ChapterTitle);
    //bookText += "<div><div id=chpt" + chapter.Id + " class='divBookTitle'>" + chapter.ChapterTitle + "</div>";
    //bookText += "<div id=cpp" + chapter.Id + " class='divBookIntro'>" + chapter.Preface + "</div></div>";
}

function loadBookAndShowToC() {
    try {
        $('#tocLoadingGif').show();
        $.ajax({
            type: "get",
            url: settingsArray.ApiServer + "/api/BookDb/GetBook?bookId=" + bjsBookId,
            success: function (book) {
                $('#tocLoadingGif').hide();
                if (book.Success != "ok")
                    alert("loadBookAndShowToC: " + book.Success);
                else {
                    bookModel = book;
                    showToC();
                    breakBookIntoPages();
                }
            },
            error: function (jqXHR, exception) {
                alert("loadBookAndShowToC XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("loadBookAndShowToC CATCH: " + e);
    }
}

function showToC() {
    $("#middleColumn").html(`
            <div id="bookContentsLoadingGif" class="loadingGif"><img src="Images/loader.gif" /></div>
            <div id="bookTitle" class="pageTitle" onclick='javascript:showPage(0,0,0)'></div>
            <div>
                <div id="divToC" class="toCcontainer">
                </div>
            </div>`
    );
    $('#divToC').html("");
    $.each(bookModel.Chapters, function (idx, chapter) {
        // kludge String To Prevent Jquery .append() from auto closing divs
        var kludge = "<div class='chapterContainer'>";
        kludge += "<div id=ct" + chapter.Id + " class='chapterName' onclick='showPage(\"" + chapter.Id + "\",0,0)'>" + chapter.ChapterOrder + ". " + chapter.ChapterTitle + "</div>";
        kludge += "<div class='dots' onclick='toggleTocSection(" + chapter.Id + ")'></div>";
        kludge += "<div class='divCaret'><img id=img" + chapter.Id + " onclick='toggleTocSection(" + chapter.Id + ")' src='/Images/caretDown.png'></div></div>";
        kludge += "</div>";
        kludge += "<div id=st" + chapter.Id + " class='tocSectionContainer'>";
        $.each(chapter.Sections, function (idx, section) {
            kludge += "<div id=sc" + section.Id + " class='divSection' onclick='showPage(" + chapter.Id + "," + section.Id + ",0)'>" + section.SectionTitle + "</div>";
            kludge += "<div class='divSubsections'>";
            $.each(section.SubSections, function (idx, subSection) {
                kludge += "<div class='divSubSection' onclick='showPage(" + chapter.Id + "," + section.Id + "," + subSection.Id + ")'>" + subSection.SubSectionTitle + "</div>";
            })
            kludge += "</div>";
        })
        kludge += "</div>";
        $('#divToC').append(kludge);
    })
}

function displayChapter(chapterId) {
    breakChapterIntoPages(chapterId);


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

function addPages(chapter, section, subSection, textfragment) {
    let pagesLen = 0;
    while (pagesLen < textfragment.length) {
        bookPages.push({
            Page: pageNumber++,
            Chapter: chapter,
            Section: section,
            SubSection: subSection,
            PageContents: textfragment.substring(pagesLen, bookPageLen)
        });
        pagesLen += bookPageLen;
    };
}

function breakBookIntoPages() {
    //bookPages = new Array();
    //let bookPageLen = calcPageCharCount();
    addPages(0, 0, 0, bookModel.Introduction);
    addPages(0, 1, 0, bookModel.Preface);
    $.each(bookModel.Chapters, function (idx, chapter) {
        addPages(chapter.Id, 0, 0, chapter.Preface);
        $.each(chapter.Sections, function (idx, section) {
            addPages(chapter.Id, section.Id, 0, section.SectionContents);
            if (section.SubSections.length > 0) {
                $.each(section.SubSections, function (idx, subSection) {
                    addPages(chapter.Id, section.Id, subSection.id, subSection.SubSectionContents);
                });
            }
        });
    });
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
                    <img class="floatLeft" src="Images/PaupaBook/book-innerspinebottom.png" />
                    <img class="floatLeft paupaBorderContainer clickable" id="bookBottomRight" src="Images/PaupaBook/book-bottomright.png" 
                        onclick="pageNext()" />
                    <img class="floatLeft" src="Images/PaupaBook/book-cornerbright.png" />
                </div>
            </div>
        </div>`;
}

function pageNext() {
    //alert("pageNext  pageIndex: " + pageIndex + "   pages.length: " + pages.length);
    if (pageIndex + 2 <= bookPages.length) {
        $('#bookLeftContent').html(bookPages[pageIndex++]);
        $('#bookRightContent').html(bookPages[pageIndex++]);
    }
    else {
        if (pageIndex + 1 == bookPages.length) {
            alert("final page")
            $('#bookLeftContent').html(bookPages[pageIndex++]);
            $('#bookRightContent').html("");
        }
        if (pageIndex + 1 == bookPages.length) {
            $('#bookLeftContent').html("The End");
            $('#bookRightContent').html("");
        }
    }
    if ($('#bookContentsContainer').height() > $('#middleColumn').height()) {
        alert(" pageNext()    $('#middleColumn').height: " + $('#middleColumn').height() + "   $('#bookContentsContainer').height(): " + $('#bookContentsContainer').height())
        $('#middleColumn').height($('#bookContentsContainer').height() + 100);
        //alert("$('#middleColumn').height: " + $('#middleColumn').height())
    }
}

function pagePrevious() {
    if (pageIndex - 2 > 0) {
        $('#bookRightContent').html(bookPages[pageIndex--]);
        $('#bookLeftContent').html(bookPages[pageIndex--]);
    }
    else {
        if (bjschapterId > 0) {
            pageIndex = 0;
            alert("top");
        }
    }
}

function redirectToEdit() {
    $("#middleColumn").html(editContainer());
    //window.location.href = "/BookDb/Write?book=" + bookId;
}

function redirectToToC() {
    //window.location.href = "/BookDb/ToC?book=" + bookId;
}

function setStyle() {

    //alert("bookid: " + bookId);// + "   =2: " + bookId == "2");

    if (bookId == '2') {
        //alert("ok");
        $('.threeColumnArray').css('background-image', 'url("/Images/Books/timeSquared01.jpg")')
        $('.threeColumnArray').css('background-repeat', 'no-repeat');
        $('.threeColumnArray').css('background-size', 'cover');
        $('#divToC').css('color', '#fff');
        $('.dots').css('border-bottom-color', '#fff');
        $('#bookTitle').css('color', '#fff');
    }

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

    $('#testMsg1').html("mch: " + $('#middleColumn').height());
    $('#testMsg2').html("bcc: " + $('#bookLeftContent').height());
    $('#testMsg3').html("3cl: " + $('.threeColumnLayout').height());
}

////////////////////////////////////////////////////////

function XXloadBookIntoChapterArray() {
    try {
        chapterArray = [];
        var contents;
        $('#bookContentsLoadingGif').show();
        $.ajax({
            type: "get",
            url: settingsArray.ApiServer + "/api/BookDb/GetChapterTree?bookId=" + bjsBookId,
            success: function (bookModel) {
                if (bookModel.success != "ok")
                    alert("loadBook: " + bookModel.success);
                else {
                    $('#bookTitle').html(bookModel.BookTitle);
                    //contents = "<div id=bk" + book.Id + " class='bookTitle'>" + book.BookTitle + "</div>";
                    //contents += "<div class='bookCenterTitle'>Preface</div>"
                    //contents += "<div class='bookPreface'>" + book.Preface + "</div>";
                    //contents += "<div class='bookCenterTitle'>Introduction</div>";
                    //contents += "<div class='sectionContents'>" + book.Introduction + "</div>";
                    chapterObject = {}, pageObject = {};;
                    chapterObject.ChapterOrder = 0;
                    chapterObject.ChapterTitle = book.BookTitle; // intro
                    chapterObject.Content = contents;
                    chapterArray.push(chapterObject);

                    $.each(bookModel.Chapters, function (idx, objChapter) {
                        contents = "<div id=ct" + objChapter.Id + " class='chapterTitle'>" + objChapter.ChapterTitle + "</div>";
                        contents += "<div class='bookPreface'>" + objChapter.Preface + "</div>";
                        $.each(objChapter.Sections, function (idx, obj) {
                            contents += "<div id=sc" + obj.Id + " class='sectionTitle'>" + obj.SectionTitle + "</div>";
                            contents += "<div class='sectionContents'>" + obj.SectionContents + "</div>";
                            $.each(obj.SubSections, function (idx, obj) {
                                contents += "<div id=ssc" + obj.Id + " class='subsectionTitle'>" + obj.SubSectionTitle + "</div>";
                                contents += "<div class='sectionContents'>" + obj.SubSectionContents + "</div>";
                            });
                        });
                        //chapterArray.push(contents);
                        let chapterObject = {};
                        chapterObject.ChapterOrder = objChapter.ChapterOrder;
                        chapterObject.ChapterTitle = objChapter.ChapterTitle;
                        chapterObject.Content = contents;
                        chapterArray.push(chapterObject);
                    });



                    //alert("pages.length: " + pages.length + "   pages[0].len: " + pages[0].length + "  pages[1].len: " + pages[1].length);
                    //alert("breakChapterIntoPages(" + chapterId + ")");
                    breakChapterIntoPages();
                }
            },
            error: function (jqXHR, exception) {
                alert("loadBook XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("loadBook CATCH: " + e);
    }
}
