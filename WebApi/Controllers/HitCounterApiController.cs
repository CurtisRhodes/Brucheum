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
                    var twoMinutesAgo = DateTime.Now.AddMinutes(-2);

                    var lastHit = db.PageHits.Where(h => h.VisitorId == pageHitModel.VisitorId && h.PageId == pageHitModel.PageId && h.Occured > twoMinutesAgo).FirstOrDefault();
                    if (lastHit == null)
                    {
                        db.PageHits.Add(new PageHit()
                        {
                            VisitorId = pageHitModel.VisitorId,
                            PageId = pageHitModel.PageId,
                            Occured = DateTime.Now  //.AddMilliseconds(getrandom.Next())
                        });
                        db.SaveChanges();
                    }
                    pageHitSuccessModel.Success = "ok";
                    try
                    {
                        pageHitSuccessModel.PageHits = db.PageHits.Where(h => h.PageId == pageHitModel.PageId).Count();
                        var dbPageHitTotals = db.PageHitTotal.Where(h => h.PageId == pageHitModel.PageId).FirstOrDefault();
                        if (dbPageHitTotals != null) {
                            pageHitSuccessModel.PageHits += dbPageHitTotals.Hits;
                        }
                        pageHitSuccessModel.UserPageHits = db.PageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();
                        pageHitSuccessModel.UserImageHits = db.ImageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();

                        CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == pageHitModel.PageId).FirstOrDefault();
                        if (categoryFolder != null)
                        {
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
                        }
                        else
                            pageHitSuccessModel.PageName = "Not Found";
                    }
                    catch (Exception ex)
                    {
                        pageHitSuccessModel.Success = "unrelated to insert, but: " + Helpers.ErrorDetails(ex);
                    }
                }
            }
            catch (Exception ex)
            {
                string err = Helpers.ErrorDetails(ex);
                if (err.Contains("Object reference not set to an instance of an object."))
                {
                    err = "Null reference. PageId: " + pageHitModel.PageId + " visId: " + pageHitModel.VisitorId;
                }
                pageHitSuccessModel.Success = err;

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
                    if (visitor != null)
                    {
                        getInfoSuccess.VisitorId = visitor.VisitorId;
                        getInfoSuccess.Success = "ok";
                    }
                    else
                        getInfoSuccess.Success = "not found";
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

        [HttpGet]
        [Route("api/HitCounter/GeFolderIdFromtPageName")]
        public GetInfoSuccessModel GeFolderIdFromtPageName(string folderName)
        {
            GetInfoSuccessModel getInfoSuccess = new GetInfoSuccessModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    CategoryFolder categoryFolder = dbm.CategoryFolders.Where(f => f.FolderName == folderName).FirstOrDefault();
                    if (categoryFolder != null)
                    {
                        getInfoSuccess.PageId = categoryFolder.Id;
                        getInfoSuccess.Success = "ok";
                    }
                    else
                        getInfoSuccess.Success = "page not found";
                }
            }
            catch (Exception ex)
            {
                getInfoSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return getInfoSuccess;
        }
    }

    //[EnableCors("*", "*", "*")]
    //public class VisitController : ApiController
    //{
    //    [HttpPost]
    //    public LogVisitSuccessModel LogVisitor(LogVisitorModel visitorModel)
    //    {
    //        var visitorSuccess = new LogVisitSuccessModel();
    //        try
    //        {
    //            using (OggleBoobleMySqContext mdb = new OggleBoobleMySqContext())
    //            {
    //                Visitor myExisting = mdb.Visitors.Where(v => v.IpAddress == visitorModel.IpAddress).FirstOrDefault();
    //                if (myExisting == null)
    //                {
    //                    // WE HAVE A NEW VISITOR
    //                    Visitor visitor = new Visitor();
    //                    visitor.VisitorId = Guid.NewGuid().ToString();
    //                    visitor.IpAddress = visitorModel.IpAddress;
    //                    visitor.City = visitorModel.City;
    //                    visitor.Region = visitorModel.Region;
    //                    visitor.Country = visitorModel.Country;
    //                    visitor.GeoCode = visitorModel.GeoCode;
    //                    visitor.InitialPage = visitorModel.PageId;
    //                    visitor.InitialVisit = DateTime.Now;

    //                    mdb.Visitors.Add(visitor);
    //                    mdb.SaveChanges();
    //                    //visitorSuccess.IsNewVisitor = true;
    //                    visitorSuccess.VisitorId = visitor.VisitorId;
    //                }
    //                else
    //                {
    //                    //visitorSuccess.IsNewVisitor = false;
    //                    visitorSuccess.VisitorId = myExisting.VisitorId;
    //                    // FORCE A LOG VISIT 
    //                    //LogVisit(myExisting.VisitorId);
    //                }
    //                CategoryFolder categoryFolder = mdb.CategoryFolders.Where(f => f.Id == visitorModel.PageId).FirstOrDefault();
    //                if (categoryFolder != null)
    //                    visitorSuccess.PageName = categoryFolder.FolderName;
    //            }
    //            visitorSuccess.Success = "ok";
    //        }
    //        catch (Exception ex)
    //        {
    //            visitorSuccess.Success = Helpers.ErrorDetails(ex);
    //        }
    //        return visitorSuccess;
    //    }

    //}

    [EnableCors("*", "*", "*")]
    public class ChangeLogController : ApiController
    {
        [HttpPost]
        public string LogActivity(ChangeLogModel changeLog)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleSqlContext.OggleBoobleContext())
                {
                    //WebStatsSqlContext.ChangeLog alredyExists = db.ChangeLogs.Where(cl => cl.PageId == changeLog.PageId && cl.Activity == changeLog.Activity).FirstOrDefault();
                    //if (alredyExists == null)
                    {
                        db.ChangeLogs.Add(new OggleBoobleSqlContext.ChangeLog()
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
                    //--logEventModel.EventDetail = mdb.CategoryFolders.Where(f => f.Id == logEventModel.PageId).FirstOrDefault().FolderName;
                    mdb.EventLogs.Add(new EventLog()
                    {
                        EventCode = logEventModel.EventCode,
                        EventDetail = logEventModel.EventDetail,
                        CalledFrom = logEventModel.CalledFrom,
                        PageId = logEventModel.PageId,
                        VisitorId = logEventModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    mdb.SaveChanges();
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
                        FeedBackComment = feedBackModel.FeedBackComment,
                        FeedBackType = feedBackModel.FeedBackType,
                        PageId = feedBackModel.PageId,
                        FeedBackEmail = feedBackModel.FeedBackEmail,
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
                        VisitorId = logErrorModel.VisitorId,
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