using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.MySqDataContext;
//using WebApi.DataContext;
//using MySql.Data.Types;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class ImageHitController : ApiController
    {
        //private static readonly Random getrandom = new Random();
        bool imageHitControllerBusy = false;
        [HttpPost]
        public ImageHitSuccessModel LogImageHit(logImageHItDataModel logImageHItData)
        {
            ImageHitSuccessModel imageHitSuccess = new ImageHitSuccessModel();
            try
            {
                //System.Threading.Thread.Sleep(1000);
                if (imageHitControllerBusy)
                    imageHitSuccess.Success = "imageHitController Busy";
                else
                {
                    imageHitControllerBusy = true;
                    using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                    {
                        //DateTime utcDateTime = DateTime.UtcNow.AddMilliseconds(getrandom.Next());
                        //imageHitSuccess.HitDateTime = utcDateTime;
                        dbm.ImageHits.Add(new ImageHit()
                        {
                            VisitorId = logImageHItData.VisitorId,
                            PageId = logImageHItData.PageId,
                            ImageLinkId = logImageHItData.LinkId,
                            HitDateTime = DateTime.Now
                        });
                        dbm.SaveChanges();
                        imageHitSuccess.UserImageHits = dbm.ImageHits.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                        imageHitSuccess.UserPageHits = dbm.PageHits.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                        imageHitSuccess.ImageHits = dbm.ImageHits.Where(h => h.ImageLinkId == logImageHItData.LinkId).Count();
                        imageHitControllerBusy = false;
                    }
                }
                imageHitSuccess.Success = "ok";
            }
            catch (DbEntityValidationException dbEx)
            {
                imageHitSuccess.Success = Helpers.ErrorDetails(dbEx);
            }
            catch (Exception ex)
            {
                imageHitSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return imageHitSuccess;
        }
    }

    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        //private static readonly Random getrandom = new Random();

        [HttpPost]
        public PageHitSuccessModel LogPageHit(PageHitRequestModel pageHitModel)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    db.PageHits.Add(new PageHit()
                    {
                        VisitorId = pageHitModel.VisitorId,
                        PageId = pageHitModel.PageId,
                        Occured = DateTime.Now  //.AddMilliseconds(getrandom.Next())
                    });
                    db.SaveChanges();
                    pageHitSuccessModel.PageHits = db.PageHits.Where(h => h.PageId == pageHitModel.PageId).Count();
                    pageHitSuccessModel.UserPageHits = db.PageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();
                    pageHitSuccessModel.UserImageHits = db.ImageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();

                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == pageHitModel.PageId).FirstOrDefault();
                    pageHitSuccessModel.RootFolder = categoryFolder.RootFolder;
                    pageHitSuccessModel.PageName = categoryFolder.FolderName;

                    if (categoryFolder.Parent == -1)
                    {
                        pageHitSuccessModel.ParentName = "special";
                    }
                    else
                    {
                        CategoryFolder parentFolder = db.CategoryFolders.Where(f => f.Id == categoryFolder.Parent).FirstOrDefault();
                        if (parentFolder != null)
                            pageHitSuccessModel.ParentName = parentFolder.FolderName;
                    }
                    pageHitSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                pageHitSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return pageHitSuccessModel;
        }

        [HttpGet]
        [Route("api/HitCounter/GetVisitorIdFromIP")]
        public GetInfoSuccessModel GetVisitorIdFromIP(string ipAddress)
        {
            GetInfoSuccessModel getInfoSuccess = new GetInfoSuccessModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    Visitor visitor = dbm.Visitors.Where(v => v.IpAddress == ipAddress).FirstOrDefault();
                    getInfoSuccess.VisitorId = visitor.VisitorId;
                    //success.UserName = visitor.UserName;
                    getInfoSuccess.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                getInfoSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return getInfoSuccess;
        }

        [HttpGet]
        [Route("api/HitCounter/GetIpFromVisitorId")]
        public GetInfoSuccessModel GeIpFromtVisitorId(string visistorId)
        {
            GetInfoSuccessModel getInfoSuccess = new GetInfoSuccessModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    Visitor visitor = dbm.Visitors.Where(v => v.VisitorId == visistorId).FirstOrDefault();
                    getInfoSuccess.IpAddress = visitor.IpAddress;
                    //success.UserName = visitor.UserName;
                    getInfoSuccess.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                getInfoSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return getInfoSuccess;
        }


    }

    [EnableCors("*", "*", "*")]
    public class VisitController : ApiController
    {
        [HttpPost]
        public LogVisitorSuccessModel LogVisitor(LogVisitorModel visitorModel)
        {
            var visitorSuccess = new LogVisitorSuccessModel();
            try
            {
                using (OggleBoobleMySqContext mdb = new OggleBoobleMySqContext())
                {
                    Visitor myExisting = mdb.Visitors.Where(v => v.IpAddress == visitorModel.IpAddress).FirstOrDefault();
                    if (myExisting == null)
                    {
                        // WE HAVE A NEW VISITOR
                        Visitor visitor = new Visitor();
                        visitor.VisitorId = Guid.NewGuid().ToString();
                        visitor.IpAddress = visitorModel.IpAddress;
                        visitor.City = visitorModel.City;
                        visitor.Region = visitorModel.Region;
                        visitor.Country = visitorModel.Country;
                        visitor.GeoCode = visitorModel.GeoCode;
                        visitor.InitialPage = visitorModel.PageId;
                        visitor.InitialVisit = DateTime.Now;

                        mdb.Visitors.Add(visitor);
                        mdb.SaveChanges();
                        visitorSuccess.IsNewVisitor = true;
                        visitorSuccess.VisitorId = visitor.VisitorId;
                    }
                    else
                    {
                        visitorSuccess.IsNewVisitor = false;
                        visitorSuccess.VisitorId = myExisting.VisitorId;
                        // FORCE A LOG VISIT 
                        LogVisit(myExisting.VisitorId);
                    }
                    CategoryFolder categoryFolder = mdb.CategoryFolders.Where(f => f.Id == visitorModel.PageId).FirstOrDefault();
                    if (categoryFolder != null)
                        visitorSuccess.PageName = categoryFolder.FolderName;
                }
                visitorSuccess.Success = "ok";
            }
            catch (Exception ex)
            {
                visitorSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return visitorSuccess;
        }

        [HttpPost]
        public LogVisitSuccessModel LogVisit(string visitorId)
        {
            LogVisitSuccessModel visitSuccessModel = new LogVisitSuccessModel() { VisitAdded = false };
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    DateTime lastVisitDate = DateTime.MinValue;
                    List<Visit> visitorVisits = dbm.Visits.Where(v => v.VisitorId == visitorId).ToList();
                    if (visitorVisits.Count() > 0)
                    {
                        lastVisitDate = dbm.Visits.Where(v => v.VisitorId == visitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                        visitSuccessModel.WelcomeMessage = "ok";
                    }
                    if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                    {
                        Visitor visitor = dbm.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        if (visitor != null)
                        {
                            dbm.Visits.Add(new Visit()
                            {
                                VisitorId = visitorId,
                                VisitDate = DateTime.Now  //  .AddMilliseconds(getrandom.Next())
                            });
                            dbm.SaveChanges();
                            visitSuccessModel.VisitAdded = true;
                            if (lastVisitDate == DateTime.MinValue)
                                visitSuccessModel.WelcomeMessage = "Welcome New Visitor";
                            else
                            {
                                //if(v)
                                visitSuccessModel.WelcomeMessage = "Welcome Back ";
                            }
                        }
                    }
                    visitSuccessModel.Success= "ok";
                }
            }
            catch (Exception ex)
            {
                visitSuccessModel.Success= Helpers.ErrorDetails(ex);
            }
            return visitSuccessModel;
        }
    }

    [EnableCors("*", "*", "*")]
    public class ChangeLogController : ApiController
    {
        [HttpPost]
        public string LogActivity(ChangeLogModel changeLog)
        {
            string success = "";
            try
            {
                using (WebStatsSqlContext.WebStatsContext db = new WebStatsSqlContext.WebStatsContext())
                {
                    //WebStatsSqlContext.ChangeLog alredyExists = db.ChangeLogs.Where(cl => cl.PageId == changeLog.PageId && cl.Activity == changeLog.Activity).FirstOrDefault();
                    //if (alredyExists == null)
                    {
                        db.ChangeLogs.Add(new WebStatsSqlContext.ChangeLog()
                        {
                            PageId = changeLog.PageId,
                            PageName = changeLog.PageName,
                            Activity = changeLog.Activity,
                            Occured = DateTime.Now
                        });
                        db.SaveChanges();
                    }
                }
                success = "ok";
            }
            catch (Exception ex) 
            {
                success = Helpers.ErrorDetails(ex); 
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class EventLogController : ApiController
    {
        [HttpPost]
        public LogEventActivitySuccessModel LogEventActivity(LogEventModel logEventModel)
        {
            LogEventActivitySuccessModel logEventActivitySuccess = new LogEventActivitySuccessModel();
            try
            {
                using (var mdb = new OggleBoobleMySqContext())
                {
                    if (int.TryParse(logEventModel.EventDetail, out int numericEventDetail))
                    { 
                        logEventModel.EventDetail = mdb.CategoryFolders.Where(f => f.Id == numericEventDetail).FirstOrDefault().FolderName;
                    }
                    mdb.EventLogs.Add(new EventLog()
                    {
                        EventCode = logEventModel.EventCode,
                        EventDetail = logEventModel.EventDetail,
                        PageId = logEventModel.CalledFrom,
                        VisitorId = logEventModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    mdb.SaveChanges();

                    var categoryFolderCalledFromRow = mdb.CategoryFolders.Where(f => f.Id == logEventModel.CalledFrom).FirstOrDefault();
                    if (categoryFolderCalledFromRow != null)
                        logEventActivitySuccess.CalledFrom = categoryFolderCalledFromRow.FolderName;
                    else
                        logEventActivitySuccess.CalledFrom = "{" + logEventModel.CalledFrom + " not found}";

                    Visitor visitor = mdb.Visitors.Where(v => v.VisitorId == logEventModel.VisitorId).FirstOrDefault();
                    if (visitor != null)
                    {
                        logEventActivitySuccess.IpAddress = visitor.IpAddress;
                        logEventActivitySuccess.VisitorDetails = visitor.City + ", " + visitor.Region + " " + visitor.Country;
                    }

                    var refEventCodeRow = mdb.Refs.Where(r => r.RefCode == logEventModel.EventCode).FirstOrDefault();
                    if (refEventCodeRow != null) 
                    {
                        logEventActivitySuccess.EventName = refEventCodeRow.RefDescription;
                    }

                    int eventDetailPageId;
                    bool parseSuccess = int.TryParse(logEventModel.EventDetail, out eventDetailPageId);
                    if (parseSuccess)
                    {
                        var categoryFolderEventDetailRow = mdb.CategoryFolders.Where(f => f.Id == eventDetailPageId).FirstOrDefault();
                        if (categoryFolderEventDetailRow != null)
                        {
                            logEventActivitySuccess.PageBeingCalled = categoryFolderEventDetailRow.FolderName;
                        }
                    }
                }
                logEventActivitySuccess.Success = "ok";
            }
            //catch (SystemException sex) {
            //    //if (ex.Message.Contains("reference not set"))
            //    {
            //        logEventActivitySuccess.Success = "reference not set. Source: " + sex.Source;
            //    }
            //}
            catch (Exception ex)
            {
                logEventActivitySuccess.Success = Helpers.ErrorDetails(ex);             
            }
            return logEventActivitySuccess;
        }
    }

    [EnableCors("*", "*", "*")]
    public class FeedBackController : ApiController
    {
        [HttpPost]
        public string LogFeedBack(FeedBackModel feedBackModel)
        {
            string success = "";
            try
            {
                using (var mdb = new OggleBoobleMySqContext())
                {
                    mdb.FeedBacks.Add(new FeedBack()
                    {
                        FeedBackComment=feedBackModel.FeedBackComment,
                        FeedBackType=feedBackModel.FeedBackType,
                        PageId = feedBackModel.PageId,
                        VisitorId = feedBackModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    mdb.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class ErrorLogController : ApiController
    {
        [HttpPost]
        public string LogError(LogErrorModel logErrorModel)
        {
            string success;
            try
            {
                using (var mdb = new OggleBoobleMySqContext())
                {
                    mdb.ErrorLogs.Add(new ErrorLog()
                    {
                        PkId = Guid.NewGuid().ToString(),
                        ActivityCode = logErrorModel.ActivityCode,
                        ErrorMessage = logErrorModel.ErrorMessage,
                        CalledFrom = logErrorModel.CalledFrom,
                        Severity = logErrorModel.Severity,
                        VisitorId = logErrorModel.VisitorId ?? "unknown",
                        Occured = DateTime.Now
                    });
                    mdb.SaveChanges();
                    success = "ok";
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