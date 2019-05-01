var currentUser = "ee229ec2-8657-4dc5-9af4-b68e8041677a";

function buildResume(resumeId) {
    $('#resumeLoadingGif').show();
    $.ajax({
        type: "Patch",
        url: service + "/api/Resume/GetLoadedResume?resumeId=" + resumeId,
        success: function (loadedResume) {
            $('#resumeTopSection').html('');
            $.each(loadedResume.TopSections, function (idx, topSection) {
                $('#resumeTopSection').append("<div class='sectionContents'>" + topSection.SectionContents + "</dev>");
            });
            $('#resumeJobSection').html('');
            $.each(loadedResume.LostJobs, function (idx, lostJob) {
                var dateline = lostJob.StartMonth + " " + lostJob.StartYear + " - " + lostJob.FiredMonth + " " + lostJob.FiredYear;
                var kluge = "<div class='resumeDateRow'><div class='resumeDateRowLeft'>" + lostJob.Employer + "</div>";
                kluge += "<div class='resumeDateRowCenter'>" + lostJob.JobLocation + "</div><div class='resumeDateRowRight'>" + dateline + "</div></div>";
                $('#resumeJobSection').append(kluge);

                $('#resumeJobSection').append("<div class='resumeJobContents'>" + lostJob.Summary + "</dev>");
            })
            $('#resumeBottomSection').html('');
            $.each(loadedResume.BottomSections, function (idx, bottomSection) {
                $('#resumeBottomSection').append("<div class='sectionContents'>" + bottomSection.SectionContents + "</dev>");
            });
            $('#resumeLoadingGif').hide();
            $('#middleColumn').height($('#resumeSectionContainer').height());
            resizePage();
        }
    });

}

function getAvailableResumes(currentUser) {
    $.ajax({
        type: "GET",
        url: service + "/api/Resume?personId=" + currentUser,
        success: function (results) {
            $.each(results, function (idx, obj) {
                $('#ddAvailableResumes').append("<option class='ddOption availResume' value=" + obj.Id + ">xx" + obj.ResumeName + "</option>");
            });
        }
    });
}

function removeSelectedElement() {
    var removeModel = {};
    removeModel.ElementId = $('#hiddenAvailableElementId').val();
    removeModel.ResumeId = $('#ddResumes').val();
    $.ajax({
        type: "DELETE",
        url: service + "/api/ResumeElement",
        data: removeModel,
        success: function (success) {
            if (success === "ok") {
                loadSelectedResumeElements($('#ddResumes').val());
                //displayStatusMessage("ok", "Element Added To Resume");
            }
            else
                alert("remove Element: " + success);
        }
    });
}

//function setDropDownElementType() {
//    if ($('#ddSectionType').val() == "2") {
//        $('#ddResumeSections').hide();
//        $('#ddLostJobs').show();
//    }
//    else {
//        $('#ddLostJobs').hide();
//        $('#ddResumeSections').show();
//    }
//}

//function mediateResumeAddEditButton() {
//    if ($('#btnResumeAddEdit').html() == "Add")
//        insertResume();
//    else
//        updateResume();
//}

//function mediateResumeNewButton() {
//    $('#btnResumeAddEdit').html("Add");
//    $('#btnResumeNew').hide();
//}

function loadSelectedResumeElements(resumeId) {    
    $('#resumeSelectedElementsLoadingGif').show();
    //alert("loadSelectedResumeElements(" + resumeId + ")");
    $.ajax({
        type: "GET",
        url: service + "/api/ResumeElement?resumeId=" + resumeId,
        success: function (resumeElements) {
            $('#resumeAvailableElementsContainer').fadeIn();
            $('#resumeSelectedElementsList').html("");
            var lastElementType = "bongo";
            var eleTypName = "";
            $.each(resumeElements, function (idx, resumeElement) {
                if (resumeElement.ElementType !== lastElementType) {
                    if (resumeElement.ElementType === '1') eleTypName = "TOP";
                    if (resumeElement.ElementType === '2') eleTypName = "JOBS";
                    if (resumeElement.ElementType === '3') eleTypName = "BOTTOM";
                    $('#resumeSelectedElementsList').append("<div>" + eleTypName + "</div>");
                    lastElementType = resumeElement.ElementType;
                }
                $('#resumeSelectedElementsList').append("<div id='" + resumeElement.ElementId + "' eleName=" + resumeElement.ElementName + " eleOrder=" + resumeElement.SortOrder +
                    " class='crudListItem resumeSelectedElementItem'>" + resumeElement.SortOrder + " | " + resumeElement.ElementName + "</div>");
            });

            $('.resumeSelectedElementItem').click(function () {

                if ($(this).hasClass('highlightResumeItem')) {
                    $('.resumeSelectedElementItem').removeClass('highlightResumeItem');
                    $('#editSelectedElementsCrudRow').hide();
                }
                else {
                    $('.resumeSelectedElementItem').removeClass('highlightResumeItem');
                    $(this).addClass('highlightResumeItem');
                    $('#hiddenAvailableElementId').val($(this).attr('id'));
                    $('#txtResumeSelectedElementOrder').val($(this).attr('eleOrder'));
                    
                    $('#editSelectedElementsCrudRow').show();

                }
            });

            $('#resumeSelectedElementsLoadingGif').hide();
            loadAvailableResumeElements(resumeId);
        }
    });
}

function loadAvailableResumeElements(resumeId) {
    $('#resumeAvaibleElementsLoadingGif').show();
    resumeAvailableElementModel.ResumeId = resumeId;
    $.ajax({
        type: "GET",
        url: service + "/api/ResumeElement/GetAvailable?personId=" + currentUser + "&resumeId=" + resumeId,
        success: function (availableElements) {
            $('#resumeAvailableElementsList').html("");
            $.each(availableElements, function (idx, availableElement) {
                $('#resumeAvailableElementsList').append("<div id=" + availableElement.ElementId + "' eleName='" + availableElement.ElementName + "' type='" + availableElement.ElementType +
                    "' class='crudListItem resumeAvailableElementItem'>" +
                    availableElement.ElementType + " | " + availableElement.ElementName + "</div>");
            });

            $('.resumeAvailableElementItem').click(function () {
                if ($(this).hasClass('highlightResumeItem')) {
                    $('.resumeAvailableElementItem').removeClass('highlightResumeItem');
                    $('#btnAddItemToResume').prop('disabled', true);
                    $('#btnEditResumeItem').prop('disabled', true);
                }
                else {
                    $('.resumeAvailableElementItem').removeClass('highlightResumeItem');
                    $(this).addClass('highlightResumeItem');
                    $('#txtAvailableElement').val($(this).attr("eleName"));
                    $('#hiddenAvailableElementId').val($(this).attr('id'));
                    $('#btnAddItemToResume').prop('disabled', false);
                    $('#btnEditResumeItem').prop('disabled', false);
                }
            });
            $('#resumeAvaibleElementsLoadingGif').hide();
        }
    });
}

function addItemsToResume() {
    var elementModel = {};
    elementModel.ElementId = $("#hiddenAvailableElementId").val();
    elementModel.ElementType = $('#ddSectionType').val();
    elementModel.SortOrder = $('#txtResumeAvailableElementOrder').val();
    elementModel.ResumeId = $('#ddResumes').val();

    $.ajax({
        type: "POST",
        url: service + "/api/ResumeElement?",
        data: elementModel,
        success: function (success) {
            if (success === "ok") {
                loadSelectedResumeElements($('#ddResumes').val());
                displayStatusMessage("ok", "Element Added To Resume");
            }
            else
                alert("add Element To Resume: " + success);
        }
    });
}

function updateResumeElement() {
    resumeSelectedElementModel.ElementId = $("#hiddenAvailableElementId").val();
    resumeSelectedElementModel.ResumeId = $('#ddResumes').val();
    resumeSelectedElementModel.SortOrder = $('#txtResumeSelectedElementOrder').val();
    $.ajax({
        type: "PUT",
        url: service + "/api/ResumeElement",
        data: resumeSelectedElementModel,
        success: function (success) {
            if (success === "ok") {
                loadSelectedResumeElements(resumeSelectedElementModel.ResumeId);
                displayStatusMessage("ok", "Resume Element Sort Order Updated");
            }
            else
                alert("updateResume: " + success);
        }
    })
}

function loadDropDownLists(currentUser) {
    $('#elementDDsLoadingGif').show();
    $.ajax({
        type: "GET",
        url: service + "/api/Resume?personId=" + currentUser,
        success: function (resumes) {
            $('#ddResumes').html("<option class='ddOption resumeOption' value='0'>-- select resume --</option>");
            $.each(resumes, function (idx, resume) {
                $('#ddResumes').append("<option class='ddOption resumeOption' value='" + resume.Id + "'>" + resume.ResumeName + "</option>");
            });
            $('#elementDDsLoadingGif').hide();
        },
        error: function (jqXHR, exception) {
            $('#elementDDsLoadingGif').hide();
            alert("loadDropDownLists XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
    //$.ajax({
    //    type: "GET",
    //    url: service + "/api/LostJob?personId=" + currentUser,
    //    success: function (jobs) {
    //        $('#ddLostJobs').html("");
    //        $.each(jobs, function (idx, job) {
    //            $('#ddLostJobs').append("<option class='ddOption' value='" + job.ElementId + "'>" + job.StartYear + ", " + job.Employer + "</option>");
    //        });
    //    }
    //});
    //$.ajax({
    //    type: "GET",
    //    url: service + "/api/ResumeSection?personId=" + currentUser,
    //    success: function (sections) {
    //        $.each(sections, function (idx, section) {
    //            $('#ddResumeSections').append("<option class='ddOption' value='" + section.ElementId + "'>" + section.SectionTitle + "</option>");
    //        });
    //        $('#elementDDsLoadingGif').hide();
    //    }
    //});
}
