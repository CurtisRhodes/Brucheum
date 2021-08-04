let curChapterId = 0; curSectionId = 0; // curSubSectionId = 0;
let curChapterNode = {}, curSectionNode = {};
let editBookModel = {};

function pauapEdit(bookModel, chapterId, sectionId) {
    editBookModel = bookModel;
    curChapterId = chapterId;
    curSectionId = sectionId;
    // curSubSectionId = 0;
    showPaupaEditForm();
    $('#pauapEditorContainer').css("width", $('#middleColumn').width());
    $("#paupaChapterTitle").css("left", $("#pauapEditorContainer").offset().left);

    $('#pauapEditor').jqte();

    //$('#pauapEditor').summernote({
    //    //codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
    //    //height: '100%',
    //    //backcolor: '#ddd69f',
    //    toolbar: [
    //        ['codeview']
    //        //['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline',]],
    //    ]
    //});
    showEditSection();
    resizeBookPage();
}

function showPaupaEditForm() {

    $("#leftColumn").html(`
    <div class='paupaLeftColumnButtonContainer'>
        <div onclick="pauapUpdate()">Update</div>
        <div onclick="showToC()">Back to ToC</div>
        <div onclick="showAddChapterDialog()">Add Chapter</div>
        <div onclick="showAddSectionDialog()">Add Section</div>
    </div>`);

    $("#middleColumn").html(`
    <div id="bookContentsContainer" class="block">
        <div id="divStatusMessage"></div>
        <div id="paupaStyleContainer" class="paupaStyle">
            <div class="flexContainer">
                <img class="floatLeft" src="Images/PaupaBook/book-cornertopleft.png" />
                <div id="paupaTopLeftBorder" class="paupaBorderContainer">
                    <img class="floatLeft full" src="Images/PaupaBook/book-topLeft.png" />
                    <div id="paupaChapterTitle" class="inlineLabel">PAUPA CHAPTER TITLE</div>
                </div>
                <img class="floatLeft" src="Images/PaupaBook/book-innerspinetop.png" />
                <img class="floatLeft paupaBorderContainer" src="Images/PaupaBook/book-topRight.png" />
                <img class="floatLeft" src="Images/PaupaBook/book-cornertopright.png" />
            </div>
            <div class="flexContainer">
                <img class="floatLeft" src="Images/PaupaBook/book-left.png" />
                <div id="pauapEditorContainer" class="paupaInnerEditorContainer">
                    <textarea id="pauapEditor"></textarea>
                </div>
                <img class="floatLeft" src="Images/PaupaBook/book-right.png" />
            </div>
            <div class="flexContainer">
                <img class="floatLeft" src="Images/PaupaBook/book-cornerbleft.png" />
                <img class="floatLeft paupaBorderContainer clickable" src="Images/PaupaBook/book-bottomleft.png" onclick="editPagePrevious()" />
                <img class="floatLeft" src="Images/PaupaBook/book-innerspinebottom.png" />
                <img class="floatLeft paupaBorderContainer clickable" src="Images/PaupaBook/book-bottomright.png" onclick="editPageNext()" />
                <img class="floatLeft" src="Images/PaupaBook/book-cornerbright.png" />
            </div>
        </div>
    </div>`);

    $("#rightColumn").html("<img class='dirtyStatusImage' src='Images/ok-icon-9.jpg'/>");
}

function showEditSection() {
    try {
        if (curChapterId == 0) {
            if (curSectionId == 0) {
                //$('#pauapEditor').summernote('code', bookModel.Introduction);
                $('#pauapEditor').jqteVal(bookModel.Introduction);
                $("#paupaChapterTitle").html("Introduction");
            }
            else {
                $('#pauapEditor').jqteVal(bookModel.Preface);
                $("#paupaChapterTitle").html("preface");
            }
        }
        else {
            $.each(editBookModel.Chapters, function (idx, chapter) {
                if (chapter.Id == curChapterId) {
                    curChapterNode = chapter;
                    if (curSectionId == 0) {
                        //alert("SHOW EDIT SECTION\nshow preface?")
                        $('#pauapEditor').jqteVal(chapter.Preface);
                        $("#paupaChapterTitle").html("Chapter: " + chapter.ChapterOrder + " " + chapter.ChapterTitle + "  preface");
                        curSectionNode = curChapterNode.Sections[0];
                    }
                    else {
                        $.each(chapter.Sections, function (idx, section) {
                            if (section.Id == curSectionId) {
                                $('#pauapEditor').jqteVal(section.SectionContents);
                                $("#paupaChapterTitle").html("Chapter: " + chapter.ChapterOrder + " " + chapter.ChapterTitle +
                                    " Section: " + section.SectionOrder + " " + section.SectionTitle);
                                curSectionNode = section;
                            }
                        });
                    }
                }
            });
        }
    } catch (e) {
        alert("SHOW EDIT SECTION catch\ncurChapterId: " + curChapterId + " curSectionId: " + curSectionId + "  e:" + e);
    }
}

function editPageNext() {
    try {
        if (isNullorUndefined(curSectionNode)) {
            alert("EDIT NEXT\nisNullorUndefined(curSectionNode)");
        }
        let nextSectionOrder = curSectionNode.SectionOrder + 1;
        if (nextSectionOrder > curChapterNode.Sections.length) {
            let nextChapterOrder = curChapterNode.ChapterOrder + 1;
            if (nextChapterOrder > editBookModel.Chapters.length) {
                alert("the end");
            }
            else {
                $.each(editBookModel.Chapters, function (idx, chapter) {
                    if (chapter.ChapterOrder == nextChapterOrder) {
                        curChapterNode = chapter;
                        curChapterId = curChapterNode.Id;
                        curSectionNode = chapter.Sections[0];
                        curSectionId = curSectionNode.Id;
                    }
                });
            }
        }
        else {
            $.each(curChapterNode.Sections, function (idx, section) {
                if (section.SectionOrder == nextSectionOrder) {
                    curSectionId = section.Id;
                    curSectionNode = section;
                }
            });
        }
        showEditSection();
    } catch (e) {
        //console.error("EDIT NEXT\ncurChapterId: " + curChapterId + "curSectionId: " + curSectionId + "  e:" + e);
        alert("EDIT NEXT\ncurChapterId: " + curChapterId + "  curSectionId: " + curSectionId + "  e:" + e);
    }
}

function editPagePrevious() {
    try {
        let prevSectionOrder = curSectionNode.SectionOrder - 1;
        if (prevSectionOrder < 1) {
            let prevChapterOrder = curChapterNode.ChapterOrder - 1;
            if (prevSectionOrder < 0) {
                alert("you are at the beginning");
            }
            else {
                $.each(editBookModel.Chapters, function (idx, chapter) {
                    if (chapter.ChapterOrder == prevChapterOrder) {
                        curChapterNode = chapter;
                        curChapterId = chapter.Id;
                    }
                });
                $.each(curChapterNode.Sections, function (idx, section) {
                    if (section.SectionOrder == 1) {
                        curSectionNode = section;
                        curSectionId = section.Id;
                    }
                });
            }
        }
        else {
            $.each(curChapterNode.Sections, function (idx, section) {
                if (section.SectionOrder == prevSectionOrder) {
                    curSectionNode = section;
                    curSectionId = section.Id;
                }
            });
        }
        showEditSection();
    } catch (e) {
        alert("EDIT PREVIOUS\ncurChapterId: " + curChapterId + " curSectionId: " + curSectionId + "  e:" + e);
    }
}

function pauapUpdate() {
    try {
        $('#tocLoadingGif').show();
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/BookDb/UpdateSection",
            data: {
                BookId: editBookModel.Id,
                ChapterId: curChapterId,
                SectionId: curSectionId,
                SectionOrder: curSectionNode.SectionOrder,
                SectionTitle: curSectionNode.SectionTitle,
                SectionContents: $('#pauapEditor').val()
            },
            success: function (success) {
                if (success != "ok") {
                    $('#tocLoadingGif').hide();
                    alert("PAUAP UPDATE AJAX\n: " + success);
                }
                else {
                    displayStatusMessage("ok", "section updated");
                    $('#tocLoadingGif').hide();
                }
            },
            error: function (jqXHR, exception) {
                $('#tocLoadingGif').hide();
                alert("pauapUpdate XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        $('#tocLoadingGif').hide();
        alert("PAUAP UPDATE CATCH\n" + e);
    }
}

function showAddChapterDialog() {
    $('#centeredDialogContents').html(`
    <div id='addSectionDialog'>
        <div class='flexContainer'>
            <div class='floatleft'>
                <div>Add Section</div>
                <label>title</label> <input id="txtNewSection"/> 
                <label>order</label>
                <input id="txtSectionOrder" style="width:50px"/>
                <button onclick='addSection()'>Add</button>
            </div>
            <div class='floatleft'>
                <div>chapters</div>
                <ul id="chapterList"></ul>
            </div>
            <div class='floatleft'>
                <div>sections</div>
                <ul id="sectionsList"></ul>
            </div>
        </div>
    </div>`);

    $('#centeredDialogTitle').html(editBookModel.BookTitle);
    $('#centeredDialogContainer').draggable().show();

    //<div>chapter</div>
    //<div>Add Chapter <input id="txtNewChapter"/> <input id="txtchapterOrder"/><button>Add<button></div>

    $.each(editBookModel.Chapters, function (idx, chapter) {
        $('#chapterList').append("<li class='noWrap clickable' onclick='dlgShowChapter(" + chapter.Id + ")'>" + chapter.ChapterTitle + "</li>");
    });

    $.each(curChapterNode.Sections, function (idx, section) {
        $('#sectionsList').append("<li class='noWrap clickable' onclick='dlgShowSection(" + section.Id + ")'>" + section.SectionTitle + "</li>");
    });
}

function showAddSectionDialog() {
    $('#centeredDialogContents').html(`
    <div id='addSectionDialog'>
        <div class='flexContainer'>
            <div class='floatleft'>
                <div>Add Section</div>
                <label>title</label> <input id="txtNewSection"/> 
                <label>order</label>
                <input id="txtSectionOrder" style="width:50px"/>
                <button onclick='addSection()'>Add</button>
            </div>
            <div class='floatleft'>
                <div>sections</div>
                <ul id="sectionsList"></ul>
            </div>
        </div>
    </div>`);

    $('#centeredDialogTitle').html(editBookModel.BookTitle + "  " + curChapterNode.ChapterTitle + " Add Section");
    $('#centeredDialogContainer').draggable().show();

    $.each(curChapterNode.Sections, function (idx, section) {
        $('#sectionsList').append("<li class='noWrap clickable' onclick='editSectionClick(" + section.Id + ")'>" + section.SectionTitle + "</li>");
    });
}

function addSection() {
    //alert("add Section: " + $('#txtNewSection').val() + "order: " + $('#txtSectionOrder').val());

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/BookDb/AddSection",
        data: {
            BookId: editBookModel.Id,
            ChapterId: curChapterId,
            NewSectionTitle: $('#txtNewSection').val(),
            NewSectionOrder: $('#txtSectionOrder').val()
        },
        success: function (success) {
            if (success == "ok") {
                displayStatusMessage("ok", "new section added");
                loadBookAndShowToC(bookId);
            }
            else {
                alert("add Section: " + success);
            }
        },
        error: function (jqXHR, exception) {
            $('#tocLoadingGif').hide();
            alert("add Section XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function editSectionClick(sectionId) {


    alert("editSection: " + sectionId);
}
