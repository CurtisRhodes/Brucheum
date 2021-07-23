
let edtBookId;
//let bookModel = {};
//let chapterModel = {};
function editBook(bookId) {
    edtBookId = bookId;
    setUpSummerNoteEditors();
    loadBookEditor();
    getChapters();
    $('#chaptersCrudArea').height($('#bookCrudArea').height());
    $("#btnContinue").hide();
}

function loadBookEditor() {
    try {
        $.ajax({
            type: "get",
            url: settingsArray.ApiServer + "/api/BookDb/GetChapterTree?bookId=" + edtBookId,
            success: function (book) {
                if (book.success === "ok") {
                    $('#bookTitle').html(book.BookTitle);
                    bookModel.BookTitle = book.BookTitle;
                    bookModel.Id = edtBookId;
                    $('#introEditor').summernote('code', book.Introduction);
                    $('#prefaceEditor').summernote('code', book.Preface);
                }
                else
                    alert("getBook: " + book.success);
            },
            error: function (jqXHR, exception) {
                alert("getBook XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("getBook CATCH: " + e);
    }
}


function setUpSummerNoteEditors() {
    $('#prefaceEditor').summernote({
        height: 200,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline',]],
        ]
    });
    $('#introEditor').summernote({
        height: 200,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline',]],
        ]
    });
    $('#chapterPrefaceEditor').summernote({
        height: 150,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline',]],
        ]
    });
}

function mediateNewCancelbtn() {
    // clear
    chapterModel.Id = null;
    $('#chapterPrefaceEditor').summernote('code', "");
    $('#txtChapterTitle').val("");
    $('#txtChapterOrder').val("");

    if ($('#btnNewCancel').html() == "Cancel") {
        $('#btnAddUpdate').html("Add");
    }
    else {  //   btnNewCancel == "new"
        $('#btnAddUpdate').html("Add");
        $('#btnNewCancel').html("Cancel");
    }
}

function updateBook() {
    try {
        //bindBoook();
        bookModel.Introduction = $('#introEditor').summernote('code');
        bookModel.Preface = $('#prefaceEditor').summernote('code');
        $.ajax({
            type: "Put",
            url: service + "/api/BookDb/?bookId=" + edtBookId,
            data: bookModel,
            success: function (success) {
                if (success === "ok") {
                    displayStatusMessage("ok", bookModel.BookTitle + " updated");
                }
                else
                    alert("updateBook: " + success);
            },
            error: function (jqXHR, exception) {
                alert("updateBook XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("updateBook CATCH: " + e);
    }
}

function addChapter() {
    chapterModel.Book = edtBookId;
    chapterModel.ChapterTitle = $('#txtChapterTitle').val();
    chapterModel.ChapterOrder = $('#txtChapterOrder').val();
    chapterModel.Preface = $('#chapterPrefaceEditor').summernote('code');
    try {
        $.ajax({
            type: "Post",
            url: settingsArray.ApiServer + "/api/Chapter",
            data: chapterModel,
            success: function (chapterId) {
                chapterModel.Id = chapterId;
                displayStatusMessage("ok", chapterModel.ChapterTitle + " Added");
                $('#btnAddUpdate').html("Update");
                $('#btnNewCancel').html("New Chapter");
                $("#btnContinue").show();
                getChapters();
            },
            error: function (jqXHR, exception) {
                alert("updateBook XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("updateBook CATCH: " + e);
    }
}

function updateChapter() {

    alert("updateChapter()")
    try {
        chapterModel.ChapterTitle = $('#txtChapterTitle').val();
        chapterModel.ChapterOrder = $('#txtChapterOrder').val();
        chapterModel.Preface = $('#chapterPrefaceEditor').summernote('code');
        $.ajax({
            type: "Put",
            url: settingsArray.ApiServer + "/api/Chapter",
            data: chapterModel,
            success: function (success) {
                if (success === "ok") {
                    displayStatusMessage("ok", chapterModel.ChapterTitle + " updated");
                    getChapters();
                }
                else
                    alert("updateChapter: " + success);
            },
            error: function (jqXHR, exception) {
                alert("updateBook XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("updateBook CATCH: " + e);
    }
}

function getChapters() {
    try {
        $.ajax({
            type: "get",
            url: service + "/api/Chapter/?bookId=" + edtBookId,
            success: function (chapters) {
                $('#chapterList').html("");
                $('#btnChapterUpdate').hide();
                $.each(chapters, function (idx, obj) {
                    $('#chapterList').append("<div id=" + obj.Id + " class='crudListItem' >" + obj.ChapterOrder + " | " + obj.ChapterTitle + "</div>");
                })
                $('.crudListItem').click(function () {
                    loadChapter($(this).attr('id'));
                    $('#btnAddUpdate').html("Update");
                    $('#btnNewCancel').html("New");
                })
            },
            error: function (jqXHR, exception) {
                alert("getBook XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("getBook CATCH: " + e);
    }
}

function loadChapter(chapterId) {
    try {
        $.ajax({
            type: "PATCH",
            url: service + "/api/Chapter/?chapterId=" + chapterId,
            success: function (chapter) {
                chapterModel.Id = chapterId;
                $('#txtChapterTitle').val(chapter.ChapterTitle);
                $('#txtChapterOrder').val(chapter.ChapterOrder);
                $('#chapterPrefaceEditor').summernote('code', chapter.Preface);

                $("#btnAddUpdate").html("Update")
                $('#btnNewCancel').html("New Chapter");
                $("#btnContinue").show();

            },
            error: function (jqXHR, exception) {
                alert("loadChapter XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("loadChapter CATCH: " + e);
    }
}

function redirectToToC() {
    //window.location.href = "/BookDb/ToC?book=" + bookId;
}

function redirectToWrite() {
    window.location.href = "/BookDb/Write?chapter=" + chapterModel.Id;
}

function bookEditContainer() {
    return `
        <div id="bookTitle" class="pageTitle" onclick="redirectToToC()"></div>
        <div id="divStatusMessage"></div>
        <div class="flexContainer">
            <div id="editBook" class="crudContainer floatLeft">
                <div class="crudContainerTitle">Edit Book</div>
                <div id="bookCrudArea" class="crudArea">
                    <div id="errSummary" class="validationError"></div>
                    <div class="crudRow">
                    </div>
                    <div>
                        <div class="crudRowLabel">Preface</div>
                    </div>
                    <div id="prefaceEditor" class="editorContainer"></div>
                    <div>
                        <div>
                            <div class="crudRowLabel">Introduction</div>
                        </div>
                        <div id="introEditor" class="editorContainer"></div>
                        <div>
                            <button id="btnBookUpdate" class="roundendButton" onclick="updateBook()">Update</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="crudContainer floatLeft">
                <div class="crudContainerTitle">Chapters</div>
                <div id="chaptersCrudArea" class="crudArea">
                    <div id="errSummary" class="validationError"></div>
                    <div class="crudRow">
                        <div class="crudRowLabel">Number</div>
                        <input id="txtChapterOrder" class="roundedInput" />
                        <div class="crudRowLabel">Chapter Title</div>
                        <input id="txtChapterTitle" class="roundedInput" />
                    </div>
                    <div>
                        <div class="crudRowLabel">Chapter Preface</div>
                    </div>
                    <div id="chapterPrefaceEditor" class="editorContainer"></div>
                    <div>
                        <button id="btnAddUpdate" class="roundendButton" onclick="mediateAddUpdateBtn()">Add</button>
                        <button id="btnNewCancel" class="roundendButton" onclick="mediateNewCancelbtn()">Cancel</button>
                        <button id="btnContinue" class="roundendButton" onclick="redirectToWrite()">Write Some</button>
                    </div>
                    <div id="chapterList" class="crudList">
                        chapter list
                    </div>
                </div>
            </div>
        </div>`;
}
