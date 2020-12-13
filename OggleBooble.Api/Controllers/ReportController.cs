using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Cors;
using IronPdf;
using System.IO;
using System.Text;
using System.Configuration;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class ReportController : ApiController
    {
        private readonly string httpLocation = "https://ogglebooble.com/";
        private readonly string imagesLocation = "https://api.ogglebooble.com/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        //private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];

        [HttpGet]
        [Route("api/Report/MetricMatrixReport")]
        public MatrixResultsModel MetricsMatrixReport()
        {
            var metricsMatrixResults = new MatrixResultsModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    //db.PageHits.RemoveRange(db.PageHits.Where(h => h.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    //db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    //db.SaveChanges();
                    db.Database.ExecuteSqlCommand("call OggleBooble.spDailyVisits()");
                    var performanceRows = db.Performances.ToList();
                    foreach (Performance performanceRow in performanceRows)
                    {
                        metricsMatrixResults.matrixModelRows.Add(new MatrixModel()
                        {
                            DayofWeek = performanceRow.ReportDay.DayOfWeek.ToString(),
                            DateString = performanceRow.DayString,
                            NewVisitors = performanceRow.NewVisitors,
                            Visits = performanceRow.Visits,
                            PageHits = performanceRow.PageHits,
                            ImageHits = performanceRow.ImageHits
                        });
                    }

                    metricsMatrixResults.Success = "ok";
                }
            }
            catch (Exception ex) { metricsMatrixResults.Success = Helpers.ErrorDetails(ex); }
            return metricsMatrixResults;
        }

        [HttpGet]
        [Route("api/Report/MostVisitedPagesReport")]
        public MostPopularPagesReportModel MostVisitedPagesReport()
        {
            var mostPopularPages = new MostPopularPagesReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    mostPopularPages.Items = db.Database.SqlQuery<MostPopularPagesReportItem>(
                         "select FolderName PageName, f.Id FolderId, count(*) PageHits " +
                         "from OggleBooble.PageHit h " +
                         "join OggleBooble.CategoryFolder f on h.PageId = f.Id " +
                         "where Occured between date_add(current_date(), interval -1 day) and current_date()" +
                         "group by PageId " +
                         "order by PageHits desc").ToList();
                }
                mostPopularPages.Success = "ok";
            }
            catch (Exception ex) { mostPopularPages.Success = Helpers.ErrorDetails(ex); }
            return mostPopularPages;
        }

        [HttpGet]
        [Route("api/Report/MostImageHitsReport")]
        public MostPopularPagesReportModel MostImageHitsReport()
        {
            var MostImageHits = new MostPopularPagesReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    // select * from OggleBooble.vwImageHitsForToday;

                    MostImageHits.Items = db.Database.SqlQuery<MostPopularPagesReportItem>(
                        "select FolderName PageName, f.Id FolderId, count(*) PageHits " +
                        "from OggleBooble.ImageHit h " +
                        "join OggleBooble.CategoryFolder f on h.PageId = f.Id " +
                        "where HitDateTime between date_add(current_date(), interval - 1 day) and current_date() " +
                        "group by PageId order by PageHits desc").ToList();
                }
                MostImageHits.Success = "ok";
            }
            catch (Exception ex) { MostImageHits.Success = Helpers.ErrorDetails(ex); }
            return MostImageHits;
        }

        [HttpGet]
        [Route("api/Report/LatestImageHits")]
        public LatestImageHitsReportModel LatestImageHits()
        {
            var imageHitsReportModel = new LatestImageHitsReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));

                    List<VwImageHit> imageHits = db.VwImageHits.ToList();
                    foreach (VwImageHit imageHit in imageHits)
                    {
                        imageHitsReportModel.Items.Add(new LatestImageHitsItem()
                        {
                            IpAddress = imageHit.IpAddress,
                            City = imageHit.City,
                            Region = imageHit.Region,
                            Country = imageHit.Country,
                            FolderName = imageHit.FolderName,
                            PageId = imageHit.PageId,
                            HitTime = imageHit.HitTime,
                            Link = imageHit.Link
                        });
                    }
                    imageHitsReportModel.HitCount = db.ImageHits.Where(h => h.HitDateTime > DateTime.Today).Count();
                }
                imageHitsReportModel.Success = "ok";
            }
            catch (Exception ex) { imageHitsReportModel.Success = Helpers.ErrorDetails(ex); }
            return imageHitsReportModel;
        }

        [HttpGet]
        [Route("api/Report/ActivityReport")]
        public ActivityReportModel ActivityReport()
        {
            var activityReport = new ActivityReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    //db.EventLogs.RemoveRange(db.EventLogs.Where(e => e.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    //db.SaveChanges();
                    List<DailyActivityReport> activityItems = db.DailyActivity.ToList();
                    foreach (var activityItem in activityItems)
                    {
                        activityReport.Items.Add(new ActiviyItem()
                        {
                            IpAddress = activityItem.IpAddress,
                            City = activityItem.City,
                            Region = activityItem.Region,
                            Country = activityItem.Country,
                            Event = activityItem.Event,
                            CalledFrom = activityItem.CalledFrom,
                            Detail = activityItem.Detail,
                            HitDate = activityItem.HitDate,
                            HitTime = activityItem.HitTime
                        });
                    }
                    activityReport.HitCount = db.EventLogs.Where(h => h.Occured > DateTime.Today).Count();
                }
                activityReport.Success = "ok";
            }
            catch (Exception ex) { activityReport.Success = Helpers.ErrorDetails(ex); }
            return activityReport;
        }

        [HttpGet]
        [Route("api/Report/MostActiveUsersReport")]
        public MostActiveUsersModel MostActiveUsersReport()
        {
            var mostActiveUsersReport = new MostActiveUsersModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));

                    var mostActiveUserItems = db.MostActiveUsersForToday.ToList();
                    foreach (VwMostActiveUsersForToday mostActiveUserItem in mostActiveUserItems)
                    {
                        mostActiveUsersReport.Items.Add(new MostActiveUsersItem()
                        {
                            IpAddress = mostActiveUserItem.IpAddress,
                            City = mostActiveUserItem.City,
                            Region = mostActiveUserItem.Region,
                            Country = mostActiveUserItem.Country,
                            ImageHitsToday = mostActiveUserItem.ImageHitsToday,
                            TotalImageHits = mostActiveUserItem.TotalImageHits,
                            PageHitsToday = mostActiveUserItem.PageHitsToday,
                            TotalPageHits = mostActiveUserItem.TotalPageHits,
                            LastHit = mostActiveUserItem.LastHit,
                            InitialVisit = mostActiveUserItem.InitialVisit,
                            UserName = mostActiveUserItem.UserName
                        });
                    }
                    //mostActiveUsersReport.Items = db.Database.SqlQuery<MostActiveUsersItem>(
                    //    "select IpAddress, City, Region, Country, " +
                    //    "max(date_format(HitDateTime, '%m/%d/%Y')) as 'LastHit', max(date_format(HitDateTime, '%h:%i.%s')) as hitTime, count(*) imageHits " +
                    //    "from OggleBooble.ImageHit ih " +
                    //    "join OggleBooble.Visitor v on ih.VisitorId = v.VisitorId " +
                    //    "where HitDateTime between current_date and current_date + 1 " +
                    //    "group by IpAddress, City, Region, Country " +
                    //    "order by imageHits desc;").ToList();

                    mostActiveUsersReport.HitCount = mostActiveUsersReport.Items.Count();
                }
                mostActiveUsersReport.Success = "ok";
            }
            catch (Exception ex) { mostActiveUsersReport.Success = Helpers.ErrorDetails(ex); }
            return mostActiveUsersReport;
        }

        [HttpGet]
        [Route("api/Report/PageHitReport")]
        public PageHitReportModel PageHitReport()
        {
            var pageHitReportModel = new PageHitReportModel();
            //int errCount = 0;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.PageHits.RemoveRange(db.PageHits.Where(h => h.VisitorId == "ec6fb880-ddc2-4375-8237-021732907510"));
                    db.SaveChanges();

                    //List<VwPageHit> vwPageHits = db.VwPageHits.Take(500).ToList();

                    List<VwPageHit> vwPageHits = db.VwPageHits.ToList();
                    pageHitReportModel.HitCount = db.PageHits.Count();

                    foreach (VwPageHit item in vwPageHits)
                    {
                        pageHitReportModel.Items.Add(new PageHitReportModelItem()
                        {
                            IpAddress = item.IpAddress,
                            City = item.City,
                            Region = item.Region,
                            Country = item.Country,
                            PageId = item.PageId,
                            FolderName = item.FolderName, // ?? "?",item.FolderName.Replace("OGGLEBOOBLE.COM", ""),
                            //PageHits = item.PageHits,
                            RootFolder = item.RootFolder,
                            FolderType = item.FolderType,
                            ImageHits = item.ImageHits,
                            HitDate = item.HitDate,
                            HitTime = item.HitTime
                        });
                    }
                }
                pageHitReportModel.Success = "ok";
            }
            catch (Exception ex)
            {
                pageHitReportModel.Success = Helpers.ErrorDetails(ex);
            }
            return pageHitReportModel;
        }

        [HttpGet]
        [Route("api/Report/FeedbackReport")]
        public FeedbackReportModel FeedbackReport()
        {
            FeedbackReportModel feedbackReport = new FeedbackReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    feedbackReport.FeedbackRows = db.FeedbackReport.ToList();
                    feedbackReport.Total = db.FeedbackReport.Count();
                    feedbackReport.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                feedbackReport.Success = Helpers.ErrorDetails(ex);
            }
            return feedbackReport;
        }

        [HttpGet]
        [Route("api/Report/ErrorLogReport")]
        public ErrorLogReportModel ErrorLogReport()
        {
            ErrorLogReportModel errorLog = new ErrorLogReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    errorLog.ErrorRows = db.VwErrorReportRows.ToList();
                    errorLog.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                errorLog.Success = Helpers.ErrorDetails(ex);
            }
            return errorLog;
        }

        public string ProcessStatus { get; set; }
        [HttpGet]
        [Route("api/Report/Poll")]
        public string Poll()
        {
            return ProcessStatus;
        }

        [HttpGet]
        [Route("api/Report/UserDetails")]
        public UserReportSuccessModel UserDetails(string ipAddress)
        {
            var userReportSuccessModel = new UserReportSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    userReportSuccessModel.UserReport = db.Database.SqlQuery<UserReportModel>("select IpAddress, City, Region, Country, convert(date(InitialVisit), char) 'InitialVisit'," +
                    "(select count(*) from OggleBooble.Visit where VisitorId = v.VisitorId) 'Visits'," +
                    "(select count(*) from OggleBooble.PageHit where VisitorId = v.VisitorId) 'PageHits'," +
                    "(select count(*) from OggleBooble.ImageHit where VisitorId = v.VisitorId) 'ImageHits', r.UserName " +
                    "from OggleBooble.Visitor v left join OggleBooble.RegisteredUser r on v.VisitorId = r.VisitorId " +
                    " where IpAddress = @ipAddress;", new MySql.Data.MySqlClient.MySqlParameter("@ipAddress", ipAddress)).First<UserReportModel>();
                    userReportSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex) { userReportSuccessModel.Success = Helpers.ErrorDetails(ex); }
            return userReportSuccessModel;
        }

        [HttpGet]
        [Route("api/Report/UserErrorDetails")]
        public UserErrorReportSuccess UserErrorDetails(string ipAddress)
        {
            var userErrors = new UserErrorReportSuccess();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    userErrors.ErrorRows = db.VwErrorReportRows.Where(e => e.IpAddress == ipAddress).ToList();
                }
                userErrors.Success = "ok";
            }
            catch (Exception ex) { userErrors.Success = Helpers.ErrorDetails(ex); }
            return userErrors;
        }

        [HttpPost]
        public string BuildListPage(int rootFolder)
        {
            string success;
            try
            {
                int monthIncimentor;
                var stringBuilder = new StringBuilder("<html><head>");
                //MessageHub hub = new MessageHub();
                using (var db = new OggleBoobleMySqlContext())
                {
                    string imgSrc;
                    ImageFile dbImageFile;
                    var dbPlayboyDecades = db.CategoryFolders.Where(f => f.Parent == rootFolder).OrderBy(f => f.SortOrder).ToList();
                    stringBuilder.Append("\n<style>\n" +
                        ".pbDecade { margin - left: 20px; font-family: 'Segoe UI', Tahoma; font-size: 35px; }\n" +
                        ".pbYear { margin - left: 80px; color:#000; font-size: 30px;}\n" +
                        ".pbMonth { margin - left: 40px; font-size: 20px; }\n" +
                        ".pbRow { display: flex; }\n" +
                        ".pbCol { display: inline - block; margin-left: 60px; }\n" +
                        ".pbItemCntr { display: inline-block; }\n" +
                        ".pbImg { height: 45px; }\n</style>\n");
                    stringBuilder.Append("</head>\n<body>\n");
                    foreach (var dbPlayboyDecade in dbPlayboyDecades)
                    {
                        monthIncimentor = 0;
                        stringBuilder.Append("<div class='pbDecade'>" + dbPlayboyDecade.FolderName + "</div>\n");
                        var dbPlayboyYears = db.CategoryFolders.Where(f => f.Parent == dbPlayboyDecade.Id).OrderBy(f => f.SortOrder).ToList();
                        foreach (var dbPlayboyYear in dbPlayboyYears)
                        {
                            //hub.SendMessage("xx", dbPlayboyYear.FolderName);
                            stringBuilder.Append("<div class='pbYear'>" + dbPlayboyYear.FolderName + "</div>\n");
                            var dbPlayboyMonths = db.CategoryFolders.Where(f => f.Parent == dbPlayboyYear.Id).OrderBy(f => f.SortOrder).ToList();

                            stringBuilder.Append("<div class='pbRow'>");
                            foreach (CategoryFolder dbPbmonth in dbPlayboyMonths)
                            {
                                ProcessStatus = dbPlayboyYear.FolderName + " " + ++monthIncimentor + " " + dbPbmonth.FolderName;
                                imgSrc = "Images/redballon.png";
                                if (dbPbmonth.FolderImage != null)
                                {
                                    dbImageFile = db.ImageFiles.Where(i => i.Id == dbPbmonth.FolderImage).FirstOrDefault();
                                    if (dbImageFile != null)
                                        imgSrc = dbPbmonth.FolderPath + "/" + dbImageFile.FileName;
                                }
                                stringBuilder.Append(
                                    "<div class='pbCol' style='width:66px;'>" +
                                    //" onmouseover='showCenterfoldImage(\"" + imgSrc + "\")'" +
                                    //" onmouseout=\"$('.dirTreeImageContainer').hide()\">" +
                                    "   <a href='" + httpLocation + "/album.html?folder=" + dbPbmonth.Id + "'>" +
                                    "       <img class='pbImg' src='" + imagesLocation + imgSrc + "'>" +
                                    "       <div class='pbLabel01'>" + dbPbmonth.FolderName + "</div>\n" +
                                    "   </a>" +
                                    "</div>\n");
                            }
                            stringBuilder.Append("</div>\n");
                        }
                        //stringBuilder.Append("</div>\n");
                    }
                }

                //stringBuilder.Append("<script>\nfunction showCenterfoldImage(link)\n {" +
                //    "$('.dirTreeImageContainer').css('top', event.clientY - 100);\n" +
                //    "$('.dirTreeImageContainer').css('left', event.clientX + 10);\n" +
                //    "$('.dirTreeImage').attr('src', link);\n" +
                //    "$('.dirTreeImageContainer').show();}\n</script>");

                //$('#footerMessage').html(link);
                stringBuilder.Append("\n</body>\n</html>");
                 success = WriteFileToDisk(stringBuilder.ToString(), "CenterfoldList");
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        private string WriteFileToDisk(string staticContent, string pageTitle)
        {
            string success;
            try
            {
                // todo  write the image as a file to x.ogglebooble  4/1/19
                //string tempFilePath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data");
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");

                using (var staticFile = File.Open(appDataPath + "/temp.html", FileMode.Create))
                {
                    Byte[] byteArray = Encoding.ASCII.GetBytes(staticContent);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                FtpWebRequest webRequest = null;
                //string ftpPath = ftpHost + "/pages.OGGLEBOOBLE.COM/";

                string ftpFileName = ftpHost + "ogglebooble/" + pageTitle + ".html";
                string httpFileName = httpLocation + "/" + pageTitle + ".html";

                webRequest = (FtpWebRequest)WebRequest.Create(ftpFileName);
                webRequest.Credentials = new NetworkCredential(ftpUserName, ftpPassword);
                webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                using (Stream requestStream = webRequest.GetRequestStream())
                {
                    byte[] fileContents = File.ReadAllBytes(appDataPath + "/temp.html");
                    webRequest.ContentLength = fileContents.Length;
                    requestStream.Write(fileContents, 0, fileContents.Length);
                    requestStream.Flush();
                    requestStream.Close();
                }

                //success = RecordPageCreation(folderId, httpFileName, db);
                success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }

        [HttpGet]
        [Route("api/Report/ImpactReport")]
        public ImpactReportModel ImpactReport()
        {
            ImpactReportModel impactReportModel = new ImpactReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    impactReportModel.ImpactRows = db.VwImpacts.ToList();
                }
                impactReportModel.Success = "ok";
            }
            catch (Exception ex) { impactReportModel.Success = Helpers.ErrorDetails(ex); }
            return impactReportModel;
        }

        [Route("api/Report/PlayboyList")]
        public PlayboyReportModel PlayboyList()
        {
            PlayboyReportModel centerfoldReport = new PlayboyReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbCenterfolds = db.Centerfolds.ToList();
                    centerfoldReport.Success = "ok";
                }
            }


            //foreach (Centerfold centerfold in dbCenterfolds)
            //{
            //    centerfoldReport.PlayboyReportItems.Add(new PlayboyReportItemModel()
            //    {
            //        FolderId = centerfold.FolderId,
            //        FolderName = centerfold.FolderName,
            //        FolderDecade = centerfold.FolderDecade,
            //        FolderYear = centerfold.FolderYear,
            //        FolderMonth = centerfold.FolderMonth,
            //        ImageSrc = centerfold.ImageSrc,
            //        StaticFile = centerfold.StaticFile
            //    });
            //}

            //string writeToDiskSuccess = WriteFileToDisk(staticContent.ToString(), dbFolder.FolderName, folderId, db);
            //if (writeToDiskSuccess != "ok")
            //{
            //    resultsModel.Errors.Add(writeToDiskSuccess + "  " + dbFolder.FolderName);
            //    resultsModel.Success = writeToDiskSuccess + "  " + dbFolder.FolderName;
            //}
            //else
            //    resultsModel.PagesCreated++;


            //db.Centerfolds.Add(new Centerfold()
            //{
            //    FolderId = dbPlaymate.Id,
            //    FolderName = dbPlaymate.FolderName,
            //    FolderDecade = dbPlayboyDecade.FolderName,
            //    FolderYear = dbPlayboyYear.FolderName,
            //    FolderMonth = dbPlaymate.SortOrder,
            //    StaticFile = staticFile,
            //    ImageSrc = imgSrc
            //});
            //db.SaveChanges();
            catch (Exception ex)
            {
                centerfoldReport.Success = Helpers.ErrorDetails(ex);
            }
            return centerfoldReport;
        }
    }

    [EnableCors("*", "*", "*")]
    public class PdfController : ApiController
    {
        [HttpGet]
        [Route("api/Pdf/RipPdf")]
        public string RipPdf(string sourceFile, string destinationPath)
        {
            string success;
            int pdfPageCount, startPageNumber = 1, endPageNumber = 100;
            try
            {
                using (PdfDocument pdf = PdfDocument.FromFile(sourceFile))
                {
                    pdfPageCount = pdf.PageCount - 2;
                }
                DirectoryInfo dirInfo = new DirectoryInfo(destinationPath);
                if (!dirInfo.Exists)
                    dirInfo.Create();

                while (startPageNumber < pdfPageCount)
                {
                    success = RipSegment(sourceFile, destinationPath, Enumerable.Range(startPageNumber, endPageNumber));
                    startPageNumber += endPageNumber;
                    endPageNumber += 100;
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpGet]
        [Route("api/Pdf/RipPdfRange")]
        public string RipPdfRange(string sourceFile, string destinationPath, int startPage, int endPage)
        {
            string success;
            try
            {
                DirectoryInfo dirInfo = new DirectoryInfo(destinationPath);
                if (!dirInfo.Exists)
                    dirInfo.Create();

                success = RipSegment(sourceFile, destinationPath, Enumerable.Range(startPage, endPage));
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        private string RipSegment(string sourceFile, string destinationPath, IEnumerable<int> pageNumbers)
        {
            string success;
            try
            {
                PdfDocument pdf = PdfDocument.FromFile(sourceFile);
                try
                {
                    pdf.RasterizeToImageFiles(destinationPath, pageNumbers, 450, 800, ImageType.Jpeg);
                    pdf.Dispose();
                    pdf = null;
                    success = "ok";
                }
                catch (Exception ex)
                {
                    success = Helpers.ErrorDetails(ex);
                    pdf.Dispose();
                    pdf = null;
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }
}

