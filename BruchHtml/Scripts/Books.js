let bjsBookId = 0; bjschapterId = 0, pageIndex = 0;
let bookModel = {}, bookPages = [];
let pageNumber = 0, bookPageLen = 2600;
let curChapter = 0; curSection = 0; curSubSection = 0;
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
            break;
        default:
            alert("bookId: " + bjsBookId);
    }
    resizeBookPage();
    $(window).resize(function () {
        resizeBookPage();
    });
}

function loadBookAndShowToC() {
    try {
        $("#middleColumn").html(`
            <div><img id="tocLoadingGif" class="loadingGif" src="Images/loader.gif" /></div>
            <div id="tocBookTitle" class="bookTitle" onclick='showPage(0,0,0)'></div>
            <div id="divToC" class="toCcontainer"></div>`
        );
        $('#tocLoadingGif').show();
        $.ajax({
            type: "get",
            url: settingsArray.ApiServer + "/api/BookDb/GetBook?bookId=" + bjsBookId,
            success: function (book) {                
                if (book.Success != "ok") {
                    $('#tocLoadingGif').hide();
                    alert("loadBookAndShowToC: " + book.Success);
                }
                else {
                    bookModel = book;
                    showToC();
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

function showToC() {
    $('#tocBookTitle').html(bookModel.BookTitle);
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

function showPage(chapter, section, subSection) {
    let pageArrayItem = bookPages.filter(obj => {
        return obj.Chapter == chapter && obj.Section == section && obj.SubSection == subSection
    });
    pageIndex = pageArrayItem[0].Page;
    console.log("show page: " + pageIndex);
    if (bjsBookId == 1) {
        $("#middleColumn").html(pauapStyle());
        $('#bookLeftContent').html(bookPages[pageIndex].PageContents);
        $('#pgNumLeft').html(pageIndex);
        $('#bookRightContent').html(bookPages[++pageIndex].PageContents);
        $('#pgNumRight').html(pageIndex);
    }
    if (bjsBookId == 3) {
        //alert("pages.length: " + bookPages.length)
        $('#twoPageBookStyleLeftContent').html(bookPages[pageIndex]);
        $('#twoPageBookStyleRightContent').html(bookPages[++pageIndex]);
    }
    //if (User.IsInRole("Book Editor"))
    curChapter = chapter;
    curSection = section;
    curSubSection = subSection;
    //$("#middleColumn").append("<div id='tocEdit'><a href='javascript:editBook(" + bjsBookId + "," + curChapter + "," + curSection + "," + curSubSection + ")'>Edit</a></div>");
    $("#middleColumn").append("<div id='tocEdit'><a href='javascript:pauapEdit()'>Edit</a></div>");
    resizeBookPage();
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
        </div>`;
}
function paupaEditStyle() {
    return `
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
                <div>
                    <div id="pauapEditor" class="editorContainer"></div>
                </div>
                <div class="crudRow">
                    <button id="btnAddUpdate" class="roundendButton" onclick="mediateAddUpdateBtn()">Add</button>
                    <button id="btnNewCancel" class="roundendButton" onclick="mediateNewCancelbtn()">Cancel</button>
                    <button id="btnContinue" class="roundendButton" onclick="redirectToWrite()">Write Some</button>
                </div>
                <img class="floatLeft" src="Images/PaupaBook/book-right.png" />
            </div>
            <div class="flexContainer">
                <img class="floatLeft" src="Images/PaupaBook/book-cornerbleft.png" />
                <img class="floatLeft paupaBorderContainer clickable" src="Images/PaupaBook/book-bottomleft.png" onclick="editPrevious()" />
                <img class="floatLeft" src="Images/PaupaBook/book-innerspinebottom.png" />
                <img class="floatLeft paupaBorderContainer clickable" src="Images/PaupaBook/book-bottomright.png" onclick="editNext()" />
                <img class="floatLeft" src="Images/PaupaBook/book-cornerbright.png" />
            </div>
        </div>
        <div id="edtTxtChapter" style="position:absolute; top:135px; left:200px">CHAPTER</div>
        <div id="edtTxtSection" style="position:absolute; top:135px; left:450px">SECTION</div>
    </div>`;
    //    <div id="pgNumLeft" class="inlineRelative" style="bottom:43px; left:250px"  >PAGE</div>
    //    <div id="pgNumRight" class="inlineRelative" style="bottom:43px; left:1200px"  >PAGE</div>
}

function pauapEdit() {
    $("#middleColumn").html(paupaEditStyle());

    let tclHeight = $('#visableArea').height() - 250;
    let tclWidth = $('#visableArea').width() - 100;

    $('#pauapEditor').summernote({
        height: tclHeight,
        width: tclWidth,
        backcolor: "#ddd69f",
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline',]],
        ]
    });
    //$("#pauapEditor").summernote("backColor", "rgb(247,240,214)");

    if (isNullorUndefined(bookModel.Chapters[curChapter].Sections[curSection])) {
        txtSection = "undef";
    }
    else {
        let txtSection = bookModel.Chapters[curChapter].Sections[curSection].SectionContents;
        $('#pauapEditor').summernote('code', txtSection);
    }
    $("#edtTxtChapter").html(bookModel.Chapters[curChapter].ChapterTitle);
    $("#edtTxtSection").html(bookModel.Chapters[curChapter].Sections[curSection].SectionTitle);

    //<div id="chapterList" class="crudList">
    //    chapter list
    //</div>
}

function editPrevious() {
    if (curSection ==0) {
        if (curChapter < bookModel.Chapters) {
            alert("top");
        }
        else {
            curChapter--;
            curSection = bookModel.Chapters[curChapter].Sections.length;
        }
    }
    else {
        curSection--;
    }
    let txtSection = bookModel.Chapters[curChapter].Sections[curSection].SectionContents;
    $('#pauapEditor').summernote('code', txtSection);
}

function editNext() {
    //alert("pageNext  pageIndex: " + pageIndex + "   pages.length: " + pages.length);
    if (curSection >= bookModel.Chapters[curChapter].Sections.length) {
        if (curChapter >= bookModel.Chapters) {
            alert("the end");
        }
        else {
            curChapter++;
            curSection = 0;
            //curSection = bookModel.Chapters[curChapter].Sections.length;
        }
    }
    else {
        curSection++;
    }
    let txtSection = bookModel.Chapters[curChapter].Sections[curSection].SectionContents;
    $('#pauapEditor').summernote('code', txtSection);
    $("#edtTxtChapter").html(bookModel.Chapters[curChapter].ChapterTitle);
    $("#edtTxtSection").html(bookModel.Chapters[curChapter].Sections[curSection].SectionTitle);
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
        if (pageIndex + 1 == bookPages.length) {
            alert("final page")
            $('#bookLeftContent').html(bookPages[pageIndex++].PageContents);
            $('#bookRightContent').html("");
        }
        if (pageIndex + 1 == bookPages.length) {
            $('#bookLeftContent').html("The End");
            $('#bookRightContent').html("");
        }
    }
    curChapter = bookPages[pageIndex].Chapter;
    curSection = bookPages[pageIndex].Section;
    curSubSection = bookPages[pageIndex].SubSection;
}

function pagePrevious() {
    if (pageIndex - 2 > 0) {
        $('#bookRightContent').html(bookPages[pageIndex--].PageContents);
        $('#bookLeftContent').html(bookPages[pageIndex--].PageContents);
    }
    else {
        if (bjschapterId > 0) {
            pageIndex = 0;
            alert("top");
        }
    }
    curChapter = bookPages[pageIndex].Chapter;
    curSection = bookPages[pageIndex].Section;
    curSubSection = bookPages[pageIndex].SubSection;
}

function redirectToToC() {
    showBook(bookModel.BookId);
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
