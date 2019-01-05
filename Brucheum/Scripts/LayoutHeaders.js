
function setLayout(layoutName) {
    //use "menuContainer" to remove logon tabs  #replaceableMenuItems to keep them
    switch (layoutName) {
        case 'Admin':
            $('#bheader').css("background-color", "#ffcccc");
            $('#bannerTitle').html("Admin");
            $('#menuContainer').html(
                `<div class="menuTab floatLeft"><a href="~/Article/ArticleList">Directory</a></div>
                 <div class="menuTab floatLeft"><a href="/GetaJob/GetaJobAdmin">GetaJob Admin</a></div>
                 <div class="menuTab floatLeft"><a href="/IntelDsgn/Index">Intelligent Design</a></div>
                 <div class="menuTab floatLeft"><a href="/GetaJob/Agent">Reports</a></div>`);
            break;
        case 'Resume':
            $('#bannerTitle').html("My Resume");
            //$('#divTopLeftLogo').html("<a href='~/Home/Index'><img src='~/images/house.gif' class='bannerImage'/></a>");
            $('#divTopLeftLogo').html("<a href='/IntelDsgn/Index'><img src='/images/intel01.jpg' class='bannerImage'/></a>");
            $('#bheader').css("background-color", "#feb236");
            $('#menuContainer').html(`
                <div class="menuTab floatLeft"><a href="/Home/Index/">CurtisRhodes.com</a></div>
                <div class= "menuTab floatLeft"> <a href="/GetaJob/GetaJobAdmin">GetaJob</a></div>
                <div class="menuTab floatLeft"><a href="/IntelDsgn/Index">Intelligent Design</a></div>`
            );
            break;
        case 'Blog':
            $('#bannerTitle').html("Intelligent Design Blog");
            //$('#divTopLeftLogo').html("<a href='~/Home/Index'><img src='~/images/house.gif' class='bannerImage'/></a>");
            $('#divTopLeftLogo').html("<a href='/IntelDsgn/Index'><img src='/images/intel01.jpg' class='bannerImage'/></a>");
            $('#bheader').css("background-color", "#d6f5f5");
            $('#replaceableMenuItems').html(`
                <div class="menuTab floatLeft"><a href="/Home/Index/">CurtisRhodes.com</a></div>
                <div class="menuTab floatLeft"><a href="/IntelDsgn/Index">Lists</a></div>
                <div class="menuTab floatLeft"><a href="/IntelDsgn/Index">Intelligent Design</a></div>
                <div class= "menuTab floatLeft"> <a href="/GetaJob/GetaJobAdmin">GetaJob</a></div>`);
            break;
        case 'Intelligent Design':
            $('#bannerTitle').html("Intelligent Design");
            $('#divTopLeftLogo').html("<a href='/IntelDsgn/Index'><img src='/images/intel01.jpg' class='bannerImage'/></a>");
            $('#bheader').css("background-color", "#d6f5f5");
            $('.headerTitle').css("color", "#333");
            //$('.menuTab a: hover').css("color", "#eee");
            //background - color: #222730; /* #273235; #486167;*/
            $('#replaceableMenuItems').html(`
               <div class="menuTab floatLeft"><a href="/Home/Index/">CurtisRhodes.com</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/Skills">Skills</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/Index?a=Our_Approach">Our Approach</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/Blog/">Blog</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/Index?a=Contact_Us">Contact Us</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/MyResume/">My Resume</a></div>`);
            //<div class="menuTab floatLeft"><a href="~/IntelDsgn/About/">Who We Are</a></div>
            //<div class="menuTab floatLeft"><a href="~/IntelDsgn/Portfolio">Portfolio</a></div>
            //<div class="menuTab floatLeft"><a href="~/IntelDsgn/Code">Sample Code</a></div>
            //<div class="menuTab floatLeft"><a href="~/home/journal/">Blog</a></div>
            //<div class="menuTab floatLeft"><a href="~/IntelDsgn/Articles">Articles</a></div>
            //<div class="menuTab floatLeft"><a href="~/IntelDsgn/MyResume">My Resume</a></div>
            break;
        case 'GetaJob':
            $('#divTopLeftLogo').html("<a href='/GetaJob'><img src='/images/Apps/GetaJob.png' class='bannerImage'/></a>");
            $('head title').html("Get a Gig");
            //$('#bheader').css("background-color", "#ffffe6");
            $('#bheader').css("background-color", "#fff");
            $('#bannerTitle').html("Get a Gig");
            $('#menuContainer').html(`
                <div class="menuTab floatLeft"><a href="/Home/Index/">CurtisRhodes.com</a></div>
                <div class="menuTab floatLeft"><a href="/IntelDsgn/Index">Intelligent Design</a></div>
                `);
            break;
        default:
    }
}
