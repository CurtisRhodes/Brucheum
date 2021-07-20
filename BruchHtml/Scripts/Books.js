let bjsBookId = 0; bjschapterId = 0, pageIndex = 0;
let chapterArray = [], pages = [];
let chapterObject = {};

function showBooks() {
    $("#tanBlue").hide();
    $("#middleColumn").html(`
        <div class="pageTitle" id = "divBooksWriting" > Books I am writing</div>
        <div id="divMyBooks">
            <div class="divBook" book="The Blond Jew" onclick="showChapterTree(1)">
                <img class="bookImage" src="Images/TheBlondJew.jpg" />
            </div>
            <div class="divBook" book="Time Squared" onclick="showTableofContents('Time Squared')">
                <img class="bookImage" src="Images/TimeSquared.jpg" />
            </div>
            <div class="divBook" book="Ready; Fire; Aim" onclick="window.location.href='/BookDb/ToC?book=3'">
                <img class="bookImage" src="Images/ReadyFireAim.jpg" />
            </div>
        </div>
        <div class="divLibrayPages" id="divBooksRead">Books I have Read</div>
        <div class="divLibrayPages" id="divBooksIOwn">Book I Own</div>
        `);
}

function showChapterTree(bookId) {
    try {
        $("#middleColumn").html(`
            <div id="bookTitle" class="pageTitle" onclick='javascript:goRead(0,0,0)'></div>
            <div>
                <div id="divToC" class="toCcontainer">
                    <div id="tocLoadingGif"><img class="loadingGif" src="Images/loader.gif" /></div>
                </div>
            </div>`
        );

        $('#tocLoadingGif').show();
        $.ajax({
            type: "get",
            url: settingsArray.ApiServer + "/api/BookDb/GetChapterTree?bookId=" + bookId,
            success: function (book) {
                if (book.success != "ok")
                    alert("getBook: " + book.success);
                else {
                    $('#bookTitle').html(book.BookTitle);
                    $('#divToC').html("");
                    $.each(book.Chapters, function (idx, chapter) {
                        // kludge String To Prevent Jquery .append() from auto closing divs
                        var kludge = "<div class='chapterContainer'>";
                        kludge += "<div id=ct" + chapter.Id + " class='chapterName' onclick='goRead(" + bookId + "," + chapter.Id + ",0)'>" + chapter.ChapterOrder + ". " + chapter.ChapterTitle + "</div>";
                        kludge += "<div class='dots' onclick='toggleTocSection(" + chapter.Id + ")'></div>";
                        kludge += "<div class='divCaret'><img id=img" + chapter.Id + " onclick='toggleTocSection(" + chapter.Id + ")' src='/Images/caretDown.png'></div></div>";
                        kludge += "</div>";
                        kludge += "<div id=st" + chapter.Id + " class='tocSectionContainer'>";
                        $.each(chapter.Sections, function (idx, section) {
                            kludge += "<div id=sc" + section.Id + " class='divSection' onclick='javascript:goRead(" + bookId + "," + chapter.Id + "," + section.Id + ")'>" + section.SectionTitle + "</div>";
                            //kludge += "<div class='divSubsections'>";
                            //$.each(section.SubSections, function (idx, subSection) {
                            //    kludge += "<div class='divSubSection' onclick='javascript:goRead(3," + chapter.Id + "," + subSection.Id + ")'>" + subSection.SubSectionTitle + "</div>";
                            //})
                            //kludge += "</div>";
                        })
                        kludge += "</div>";
                        $('#divToC').append(kludge);
                    })
                    $('#tocLoadingGif').hide();
                }
            },
            error: function (jqXHR, exception) {
                alert("getBook XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("getBook CATCH: " + e);
    }
}

function goRead(bookId, chapterId) {
    bjsBookId = bookId;
    bjschapterId = chapterId;
    //window.location.href = "/BookDb/read?b=" + bookId + "&c=" + chapterId + "&t=" + type + "&id=" + sectionId;
    //kludge += "<div id=ct" + chapter.Id + " class='chapterName' onclick='
    //goRead(" + bookId + ", " + chapter.Id + ", 0)'>" + chapter.ChapterOrder + ". " + chapter.ChapterTitle + "</div>";
    switch (bookId) {
        case 1: // the blond jew
            $("#middleColumn").html(pauapStyle());
            loadBookIntoChapterArray();
            //showPages();
            //if (User.IsInRole("Book Editor"))
            $("#middleColumn").append("<div id='tocEdit'><a href='javascript:editBook(" + bjsBookId + ")'>Edit</a></div>");
            break;
        default:
            alert("bookId: " + bjsBookId);
    }
    resizeBookPage();
    $(window).resize(function () {
        resizeBookPage();
    });
}


function showPage(pageNumber) {
    pageIndex = 0;
    if (bjsBookId == 1) {
        $('#bookLeftContent').html(pages[pageIndex++]);
        $('#bookRightContent').html(pages[pageIndex++]);
    }
    if (bjsBookId == 3) {

        alert("pages.length: " + pages.length)

        $('#twoPageBookStyleLeftContent').html(pages[pageIndex++]);
        $('#twoPageBookStyleRightContent').html(pages[pageIndex++]);
    }
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

function loadBookIntoChapterArray() {
    try {
        chapterArray = [];
        var contents;
        $('#bookContentsLoadingGif').show();
        $.ajax({
            type: "get",
            url: settingsArray.ApiServer + "/api/BookDb/GetChapterTree?bookId=" + bjsBookId,
            success: function (book) {
                if (book.success != "ok")
                    alert("loadBook: " + book.success);
                else {
                    $('#bookTitle').html(book.BookTitle);
                    contents = "<div id=bk" + book.Id + " class='bookTitle'>" + book.BookTitle + "</div>";
                    contents += "<div class='bookCenterTitle'>Preface</div>"
                    contents += "<div class='bookPreface'>" + book.Preface + "</div>";
                    contents += "<div class='bookCenterTitle'>Introduction</div>";
                    contents += "<div class='sectionContents'>" + book.Introduction + "</div>";
                    chapterObject = {};
                    chapterObject.ChapterOrder = 0;
                    chapterObject.ChapterTitle = book.BookTitle; // intro
                    chapterObject.Content = contents;
                    chapterArray.push(chapterObject);

                    $.each(book.Chapters, function (idx, objChapter) {
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
                        var chapterObject = {};
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

function breakChapterIntoPages() {
    //alert("breakChapterIntoPages  chapterId: " + chapterIndex +"  chapterArray.length: " + chapterArray.length)
    let chapterObject = chapterArray[];

    $('#paupaChapterTitle').html("Chapter " + chapterObject.ChapterOrder + " " + chapterObject.ChapterTitle);

    var pageCharCount = calcPageCharCount();

    var chapterContents = chapterObject.Content;

    // break chapter into pages
    var pageStart = 0;
    var pageEnd = pageCharCount;
    pages = [];
    while (pageStart < chapterContents.length) {
        pages.push(chapterContents.substring(pageStart, pageEnd));
        pageEnd += 1;
        pageStart = pageEnd;
        pageEnd += pageCharCount;
        //if (bjschapterId == 11) { }
    }

    //pageIndex = 0;
    //if (bjsBookId == 1) {
    //    $('#bookLeftContent').html(pages[pageIndex++]);
    //    $('#bookRightContent').html(pages[pageIndex++]);
    //}
    //if (bjsBookId == 3) {

    //    alert("pages.length: " + pages.length)

    //    $('#twoPageBookStyleLeftContent').html(pages[pageIndex++]);
    //    $('#twoPageBookStyleRightContent').html(pages[pageIndex++]);
    //}

    //<div id="twoPageBookStyle" class="hiddenContainer">
    //    <div class="flexContainer">
    //        <div class="floatLeft  " id="twoPageBookStyleLeftContent"></div>
    //    </div>
    //    <div class="flexContainer">
    //        <div class="floatLeft" id="twoPageBookStyleContent"></div>
    //    </div>
    //</div>
    resizePage();
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
    if (pageIndex + 2 <= pages.length) {
        $('#bookLeftContent').html(pages[pageIndex++]);
        $('#bookRightContent').html(pages[pageIndex++]);
    }
    else {
        if (pageIndex + 1 == pages.length) {
            alert("final page")
            $('#bookLeftContent').html(pages[pageIndex++]);
            $('#bookRightContent').html("");
        }
        else {
            if (bjschapterId < chapterArray.length) {
                //alert("moving: ")
                breakChapterIntoPages(++bjschapterId)
            }
            else {
                $('#bookLeftContent').html("The End");
                $('#bookRightContent').html("");
            }
        }
    }
    if ($('#bookContentsContainer').height() > $('#middleColumn').height()) {
        //alert(" pageNext()    $('#middleColumn').height: " + $('#middleColumn').height() + "   $('#bookContentsContainer').height(): " + $('#bookContentsContainer').height())
        $('#middleColumn').height($('#bookContentsContainer').height() + 100);
        //alert("$('#middleColumn').height: " + $('#middleColumn').height())

    }
}

function pagePrevious() {
    if (pageIndex - 2 > 0) {
        $('#bookRightContent').html(pages[pageIndex--]);
        $('#bookLeftContent').html(pages[pageIndex--]);
    }
    else {
        if (bjschapterId > 0) {
            //alert("chapterId: " + (chapterId - 1));
            //alert("chapterArray[--chapterId]" + chapterArray[--chapterId])
            pageIndex = 0;
            //alert("chapterId: " + chapterId);
            breakChapterIntoPages(bjschapterId--)
        }
    }
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

function redirectToEdit() {
    $("#middleColumn").html(editContainer());
    //window.location.href = "/BookDb/Write?book=" + bookId;
}

function redirectToToC() {
    //window.location.href = "/BookDb/ToC?book=" + bookId;
}
