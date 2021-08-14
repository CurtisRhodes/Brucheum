
function displayIntelDesignPage() {
    $('body').css("background-color", "#222730");
    $('#middleColumn').html(`
        <div class="intelDsgnBackground">
            <div id="divWelcomeMessage" class="welcomeMessage">
                <div class="algerian">Welcome to Intelligent Design Software</div>
                <p>This web site demonstrates the work of an experienced if socially autistic web applications developer</p>
                <p>Check out the scection describing the <a href="javascript:displaySkillsCloud()">skills used to build this site</a></p>
                <p>Read some of my <a href="javascript:displayIntelArticles(1)">articles on computer programming</a></p>
                <p>Learn about <a href="javascript:displayArticleDialogBox(0)">our approach</a> to application development</p>
                <p>See <a href="javascript:displayMyResume()">My resume</a> with over thirty years experience. (yes I am old af)</p>
                <p>If you might be interested in having me do some work for you</p>
                <p>(remote only) (direct hire only) please <a href="javascript:displayContactForm()">contact me</a> </p>
            </div>
        </div>
        <div class='cacaMessage clickable' onclick='displayArticleDialogBox("cac953ce-58b8-4716-92e8-4c2e6cdafeca")'>Why I Built a Naked Lady Web Site</div>`
    );
    document.title = "Intelligent Design Software";
}

function displaySkillsCloud() {
    document.title = "skills : CurtisRhodes.com";
    $('#middleColumn').html(`
        <div class='whiteContrastBackground'>
            <h2>My Skills</h2>
            <div id="skillsloadingGif" class="loadingGif"><img src="Images/loader.gif" /></div>
            <div id="skillsCloud" class="wordCloudContainer"></div>
            <div class="centeredDivShell">
                <div id="skillDetails" class="centeredDivInner skillDialogPopupBox" onmouseout="$(this).fadeOut()" onclick="$(this).fadeOut()">
                    <div id="skillName" class="skillTitle"></div>
                    <div id="skillProficiency" class="skillProficiency"></div>
                    <div id="skillNarrative" class="skillNarrative"></div>
                </div>
            </div>
        </div>`
    );
    $('#rightColumn').html("<div class='adminButton' onclick=''>manage</div>");
    loadSkillCloud();
}

function displayContactForm() {
    $("#centeredDialogTitle").html("Contact Me");
    $("#centeredDialogContents").html(`
        <div>
            <div><input type="radio">Love your work. I want to hire you to build something for me.</div>
            <div>message</div>
            <textarea id="txtCtMessage" class="cntFormTextArea" ></textarea>
            <div>
                <div class="inline roundendButton" onclick="submitContactForm">Submit</div>
                <div class="inline"><a href="mailto:curtishrhodes@hotmail.com">curtis@intelDesign.com</a></div>
            </div>
        </div>`
    );
    $('#centeredDialogContainer').draggable().show();
}

function displayArticleDialogBox(articleId) {

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Article/GetSingleArticle?articleId=" + articleId,
        success: function (article) {
            if (article.Success == "ok") {
                $("#centeredDialogTitle").html(article.Title);
                $("#centeredDialogContents").html(article.Contents);
                $('#centeredDialogContainer').draggable().show();
            }
            else
                alert("displayArticleDialogBox: " + article.Success);
        },
        error: function (jqXHR, exception) {
            alert("getArticleList jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function displayIntelArticles(displayMode) {
    displayArticleList(displayMode);
    if (displayMode == 2) {
        alert("Programming for Girls");
    }
}

function displayMyResume() {
    document.title = "my resume : CurtisRhodes.com";
    $('#middleColumn').html(`
        <div id="resumeSectionContainer" class="resumeContainer">
            <div id="resumeLoadingGif" class="loadingGif"><img src="Images/loader.gif" /></div>
            <div id="resumeTopSection"></div>
            <div id="resumeJobSection"></div>
            <div id="resumeBottomSection"></div>
        </div>`
    );
    $('#rightColumn').html(`
        <div class="rightColumnContents">
            <a class="resumeDocLink" href="Docs/Curtis Rhodes Resume 2017.doc">
                <img id="prntResume" class="docImage" title="download print copy" src="Images/wordDoc.jpg" />
            </a>
            <div class="adminButton" onclick='displayResumeManager()'>manage</div>
            <div class="adminButton" onclick="docify()">docify</div>
        </div>`
    );
}

function submitContactForm() {
    alert("submitContactForm: " + $('#txtCtMessage').val());

    sendEmail("CurtishRhodes@hotmail.com", "ContactForm@IntelligentDesign.com", "Contact Form Submiited!!!",
        //"UserName: " + localStorage["UserName"] + "<br/>VisitorId: " + visid +
        "<br/>" + $('#txtCtMessage').val());
}

function displayResumeManager() {
    $('#middleColumn').html(`
        <div class="flexContainer">
            <div class="floatLeft">
                <div id="resumeSelectedElementsContainer" class="crudContainer">
                    <div class="crudContainerTitle" id="selectedResumeItemsTitle">Resume Elements</div>
                    <div class="crudArea">
                        <div class="crudRow">
                            <div class="crudLabel inline">Resume</div>
                            <div id="elementDDsLoadingGif" class="loadingGif"> <img src="Images/loader.gif" /></div>
                            <select id="ddResumes" class="roundedInput inline" onchange="loadSelectedResumeElements($(this).val())"></select>
                        </div>
                        <div id="editSelectedElementsCrudRow" class="crudRow">
                            <div class="crudLabel inline">Order</div>
                            <input id="txtResumeSelectedElementOrder" class="roundedInput inline width50px" />
                            <!--
                                        <div class="crudLabel inline">Item</div>
                            <input id="txtSelectedElement" class="roundedInput inline" readonly="readonly" />
                                    -->
                                    <button id="btnResumeSelectedElementAddEdit" class="roundendButton" onclick="updateResumeElement()">Edit Sort Order</button>
                            <button id="btnResumeSelectedElementDelete" class="roundendButton" onclick="removeSelectedElement()">Remove</button>
                            <input id="hiddenSelectedElementId" type="hidden" />
                        </div>
                    </div>
                    <div id="resumeSelectedElementsLoadingGif" class="loadingGif"><img src="Images/loader.gif" /></div>
                    <div id="resumeSelectedElementsList" class="crudList"></div>
                </div>
            </div>
            <div class="floatLeft">
                <div id="resumeAvailableElementsContainer" class="crudContainer resizeContainer">
                    <div class="crudContainerTitle">Resume Items</div>
                    <div class="crudArea" id="availableElementsCrudSection">
                        <div class="crudRow">
                            <div class="crudRowLabel">Section</div>
                            <select id="ddSectionType" class="roundedInput inline"> <!--// onchange="setDropDownElementType()">-->
                                        <option class='ddOption' value='1'>Top</option>
                                <option class='ddOption' value='2'>Job</option>
                                <option class='ddOption' value='3'>Bottom</option>
                            </select>
                            <div class="crudLabel inline">Order</div>
                            <input id="txtResumeAvailableElementOrder" class="roundedInput inline width50px" />
                            <div class="crudLabel inline">Item</div>
                            <input id="txtAvailableElement" class="roundedInput inline" readonly="readonly" />
                            <input id="hiddenAvailableElementId" type="hidden" />
                        </div>
                        <div>
                            <button id="btnAddItemToResume" class="roundendButton" onclick="addItemsToResume()">Add Item to resume</button>
                            <button id="btnEditResumeItem" class="roundendButton" onclick="addItemsToResume()">Edit Resume Item</button>
                            <button class="roundendButton" onclick="addItemsToResume()">Add New  Resume Item</button>

                        </div>
                    </div>
                    <div id="resumeAvaibleElementsLoadingGif" class="loadingGif"><img src="Images/loader.gif" /></div>
                    <div id="resumeAvailableElementsList" class="crudList"></div>
                </div>
            </div>
        </div>`
    );
}

function displaySkillsManager() {
    $('#middleColumn').html(`
        <div class="flexContainer">
            <div class="floatLeft">
                <div id="addEditSkillContainer" class="crudContainer">
                    <div id="crudContainerTitle" class="crudContainerTitle">
                        Add Edit Job Skills
                                <!--<div id="closeIcon" class="closeIcon" onclick="$('#addaJob').hide()"><img src="Images/powerOnOffSilver.png" height="24" /></div>-->
                            </div>
                    <div class="crudArea">
                        <div id="errSummary" class="validationError"></div>
                        <div class="crudRow">
                            <div id="errSkillName" class="validationError">Required</div>
                            <div class="crudLabel">Skill</div>
                            <input id="txtSkillName" class="roundedInput" />
                            <div id="errSkillCat" class="validationError">Select a Category</div>
                            <div class="crudLabel">Category</div>
                            <select id="ddSkillCats" class="crudDropDown"></select>
                        </div>
                        <div class="crudRow">
                            <div id="errProfeciency" class="validationError">Required</div>
                            <div class="crudLabel">Profeciency</div>
                            <select id="ddProfeciency" class="crudDropDown"></select>
                            <div class="crudLabel">Font Size</div>
                            <input id="txtFontSize" class="roundedInput" />
                        </div>
                        <div class="crudRow">
                            <div id="skillNarrativeEditor"></div>
                        </div>
                        <div>
                            <img id="skillAddEditSpinner" class="btnSpinnerImage positionSkillsSpinner" src="Images/loader.gif" />
                            <button id="btnSkillAddEdit" class="roundendButton" onclick="addEditSkill()">Add</button>
                            <button id="btnSkillNew" class="roundendButton" onclick="btnSkillNewToggle()">New</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="floatLeft">
                <div id="skillListCrudContainer" class="crudContainer">
                    <div id="crudContainerTitle" class="crudContainerTitle">Job Skills</div>
                    <div id="skillList" class="crudList"></div>
                </div>
            </div>
        </div>`
    );
}

/////////////////////////////////////////////////////

function loadSkillCloud() {
    try {
        $('#skillsloadingGif').show();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/JobSkill/loadSkillCloud",
            success: function (response) {
                if (response !== null) {
                    //if (!response.Name.startsWith("ERROR")) {
                    $('#skillsCloud').html("");
                    var kntr = 0;
                    var topOff = $('.middleColumn').position().top + 61;;
                    var leftOff = $('#skillsCloud').position().left + 10;;
                    $.each(response, function (idx, obj) {
                        kntr++;
                        //if (false) //  (kntr % 6 == 0) {
                        //    $('#skillsCloud').append("<div class='cloudWord vertical-text' style='font-size:" + obj.SortOrder +
                        //        "px; top:" + topOff + "px; left:" + leftOff + "px;' >" + obj.Name + "</div>");
                        //else {
                        $('#skillsCloud').append("<div id=" + obj.Id + " class='cloudWord' style='font-size:" + obj.FontSize +
                            "px; top:" + topOff + "px; left:" + leftOff + "px;' >" + obj.Name + "</div>");

                        leftOff += $('#' + obj.Id + '').width() + 21;
                        if (leftOff >= 950) {
                            leftOff = $('#skillsCloud').position().left + 10;;
                            topOff += 36;
                        }
                        //}
                    });
                    $('.cloudWord').click(function () {
                        showSkillDialog($(this).attr("Id"));
                    });
                    $('#skillsloadingGif').hide();
                }
                else {
                    alert("response == null");
                    //alert("loadSkillsList: " + success);
                }
                //else {
                //    alert("response == null" );
                //}
            },
            error: function (jqXHR, exception) {
                $('#skillsloadingGif').hide();
                alert("loadSkillsList XHR error: " + getXHRErrorDetails(jqXHR, exception) + "   " + service);
            }
        });
    } catch (e) {
        alert("get jobs CATCH: " + e);
    }
}

function showSkillDialog(id) {
    try {
        $('#skillsloadingGif').show();
        $.ajax({
            type: "GET",
            url: service + "/api/JobSkill?skillId=" + id,
            success: function (response) {
                $('#skillsloadingGif').hide();
                 
                //alert("response.Name: " + response.Name);
                $('#skillName').html(response.Name);
                $('#skillProficiency').html(response.ProficiencyDescription);

                $('#skillNarrative').html(response.Narrative);
                $('#skillDetails').fadeIn();
            },
            error: function (jqXHR, exception) {
                $('#skillsloadingGif').hide();
                alert("showSkillDialog XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("showSkillDialog CATCH: " + e);
    }
}

function addEditSkill() {
    if (validateSkill()) {

        $('#skillAddEditSpinner').show();

        //  unbind
        skillModel.Name = $('#txtSkillName').val();
        skillModel.Category = selectedRefType = $('#ddSkillCats option:selected').attr("value");
        skillModel.Proficiency = $('#ddProfeciency').val();
        skillModel.FontSize = $('#txtFontSize').val();
        skillModel.Narrative = $('#skillNarrativeEditor').val();
        if ($('#btnSkillAddEdit').html() == "Add") {
            insertSkill();
        }
        else {
            updateSkill();
        }
    }
}

function insertSkill() {
    $.ajax({
        type: "POST",
        url: service + "/api/JobSkill",
        data: skillModel,
        success: function (success) {
            if (!success.startsWith("ERROR")) {
                $('#btnSkillAddEdit').html("Save");
                $('#btnSkillNew').show();
                skillModel.Id = success;
                displayStatusMessage("ok", "Skill Added");
                loadSkillsList();
                $('#skillAddEditSpinner').hide();
            }
            else {
                $('#skillAddEditSpinner').hide();
                alert("addEditSkill: " + success);
            }
        },
        error: function (jqXHR, exception) {
            $('#skillAddEditSpinner').hide();
            alert("addaJob post error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function updateSkill() {
    $.ajax({
        type: "PUT",
        url: service + "/api/JobSkill",
        data: skillModel,
        success: function (success) {
            if (success == "ok") {
                $('#btnSkillAddEdit').val("Save");
                $('#skillAddEditSpinner').hide();
                displayStatusMessage("ok", "Skill Edited");
                loadSkillsList();
            }
            else {
                $('#skillAddEditSpinner').hide();
                alert("Edit Skill: " + success)
            }
        },
        error: function (jqXHR, exception) {
            $('#skillAddEditSpinner').hide();
            alert("addaJob put error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function btnSkillNewToggle() {
    $('#btnSkillAddEdit').html("Add");
    $('#btnSkillNew').hide();
    // clear
    skillModel.Id = "";
    $('#txtSkillName').val("");
    $('#ddSkillCats').val("0");
    $('#txtSkillName').val("");
    $('#ddProfeciency').val("0");
    $('#txtFontSize').val("");
    $('#skillNarrativeEditor').val("");

}

function validateSkill() {
    $('#errSummary').hide();
    if (isNullorUndefined($('#txtSkillName').val())) {
        $('#errSkillName').show();
        return false;
    }
    $('#errSkillName').hide();

    if ($('#ddSkillCats').val() == "0") {
        $('#errSkillCat').show();
        return false;
    }
    $('#errSkillCat').hide();

    return true;
};

function loadSkillsList() {
    try {
        $('#loadingGif').show();
        $.ajax({
            type: "GET",
            url: service + "/api/JobSkill",
            success: function (response) {
                if (true) {
                    $('#skillList').html("");
                    $.each(response, function (idx, obj) {
                        $('#skillList').append("<div class='crudListItem skillItem' id=" + obj.Id + " >" + obj.Name + " | " + obj.CategoryDescription + " | " + obj.FontSize + "</div>");
                    })
                    $('#loadingGif').hide();

                    $('.skillItem').click(function () {
                        //alert("this.id" + $(this).attr("Id"));
                        loadSkillsEditor($(this).attr("id"));
                    });
                }
                else {
                    alert("loadSkillsList: " + success);
                }
            },
            error: function (jqXHR, exception) {
                alert("loadSkillsList XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("get jobs CATCH: " + e)
    }
}

function loadSkillsEditor(Id) {
    $.ajax({
        type: "GET",
        url: service + "/api/JobSkill?skillId=" + Id,
        success: function (response) {
            if (!response.Name.startsWith("ERROR")) {
                //bind
                skillModel.Id = Id;
                $('#ddSkillCats').val(response.Category);
                $('#txtSkillName').val(response.Name);
                $('#skillNarrativeEditor').val(response.Narrative);
                $('#ddProfeciency').val(response.Proficiency);
                $('#txtFontSize').val(response.FontSize);

                $('#btnSkillAddEdit').html("Save");
                $('#btnSkillNew').show();
            }
            else {
                alert("get skills: " + response.Id)
            }
        },
        error: function (jqXHR, exception) {
            alert("loadSkillsEditor xhr error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function loadSkillDDs() {
    try {
        $.ajax({
            type: "GET",
            url: service + "/api/JobRef/Get?refType=SKL",
            success: function (result) {
                if (result.RefCode == "ERR")
                    alert(result.RefDescription)
                else {
                    $('#ddSkillCats').html("<option class= 'ddOption' value ='0'>-- select job skill category --</option >");
                    $.each(result, function (idx, obj) {
                        $('#ddSkillCats').append("<option class='ddOption' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    });
                }
            },
            error: function (jqXHR, exception) {
                alert("loadRefTypesDD xhr error: " + getXHRErrorDetails(jqXHR, exception));
            },
        });

        $.ajax({
            type: "GET",
            url: service + "/api/JobRef/Get?refType=SKP",
            success: function (result) {
                if (result.RefCode == "ERR")
                    alert(result.RefDescription)
                else {
                    $('#ddProfeciency').html("<option class= 'ddOption' value ='0'>-- select skill profeciency --</option >");
                    $.each(result, function (idx, obj) {
                        $('#ddProfeciency').append("<option class='ddOption' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    });
                }
            },
            error: function (jqXHR, exception) {
                alert("loadRefTypesDD xhr error: " + getXHRErrorDetails(jqXHR, exception));
            },
        });
    } catch (e) {
        //displayStatusMessage("error", "catch ERROR: " + e);
        alert("loadRefTypesDD catch: " + e);
    }
}

