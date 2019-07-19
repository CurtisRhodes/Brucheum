
function setLayout(layoutName) {
    //use "menuContainer" to remove logon tabs  #replaceableMenuItems to keep them
    switch (layoutName) {

        case 'porn':
            $('#oggleBoobleHeader').removeClass('classicColors').addClass('pornColors');
            $('.threeColumnArray').css("background-color", "#e2c2ab");
            $('#divTopLeftLogo').html("<a href='/porn'><img src='/images/csLips02.png' class='bannerImage'/></a>");
            $('#bannerTitle').html("The Church of My Cock");
            $('#headerSubTitle').html("naughty behavior catergorized");
            break;
        case 'sluts':
            $('#oggleBoobleHeader').removeClass('classicColors').addClass('pornColors');
            $('.threeColumnArray').css("background-color", "#e2c2ab");
            $('#divTopLeftLogo').html("<a href='/porn'><img src='/images/csLips02.png' class='bannerImage'/></a>");
            $('#bannerTitle').html("The Church of My Cock");
            $('#headerSubTitle').html("naughty behavior catergorized");
            break;
        case 'mobileBoobs':
            $('#divTopLeftLogo').html("<a href='/home'><img src='/images/redballon.png' class='littlelogo' /></a>");
            //$('head title').html("Mobile Boobs");
            $('#bannerTitle').css("font-size", "15px");
            $('#headerSubTitle').html(" ");
            $('#breadcrumbContainer').html(" ");
            $('#menuContainer').html(" ");
            break;
        case 'mobilePorn':
            $('#oggleBoobleHeader').removeClass('classicColors').addClass('pornColors');
            $('.threeColumnArray').css("background-color", "#e2c2ab");
            $('#divTopLeftLogo').html("<a href='/porn'><img src='/images/csLips02.png' class='littlelogo' /></a>");
            $('#bannerTitle').css("font-size", "15px").html("cocksuckers");
            //$('head title').html("Mobile Porn");
            $('#headerSubTitle').html(" ");
            $('#breadcrumbContainer').html(" ");
            $('#menuContainer').html(" ");




            //$('#headerSubTitle').html("physical behavior catergorized").css("font-size", "10px;");
            //$('#menuContainer').html(`
            //    <div class="menuTab floatLeft"><a href="/Home/Index/">CurtisRhodes.com</a></div>
            //    <div class="menuTab floatLeft"><a href="/IntelDsgn/Index">Intelligent Design</a></div>
            //    `);
            break;
        default:
    }
}
