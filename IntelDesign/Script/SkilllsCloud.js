function loadSkillCloud() {
    try {
        $('#skillsloadingGif').show();
        $.ajax({
            type: "GET",
            url: service + "/api/JobSkill",
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
                alert("loadSkillsList XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("get jobs CATCH: " + e)
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
