
function addEditSkill() {
    if (validateSkill()) {

        $('#skillAddEditSpinner').show();

        //  unbind
        skillModel.Name = $('#txtSkillName').val();
        skillModel.Category = selectedRefType = $('#ddSkillCats option:selected').attr("value");
        skillModel.Proficiency = $('#ddProfeciency').val();
        skillModel.FontSize = $('#txtFontSize').val();
        skillModel.Narrative = $('#skillNarrativeEditor').summernote('code');
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
    $('#skillNarrativeEditor').summernote('code', '');

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
                $('#skillNarrativeEditor').summernote('code', response.Narrative);
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
