using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.DataContext;
//using MySql.Data.Types;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class ImageHitController : ApiController
    {
        private static readonly Random getrandom = new Random();
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
                    //imageHitControllerBusy = true;
                    using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                    {
                        DateTime utcDateTime = DateTime.UtcNow.AddMilliseconds(getrandom.Next());
                        imageHitSuccess.HitDateTime = utcDateTime;
                        dbm.MySqlImageHits.Add(new MySqlImageHit()
                        {
                            VisitorId = logImageHItData.VisitorId,
                            PageId = logImageHItData.PageId,
                            ImageLinkId = logImageHItData.LinkId,
                            HitDateTime = utcDateTime
                        });
                        dbm.SaveChanges();
                        imageHitSuccess.UserHits = dbm.MySqlImageHits.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                        imageHitSuccess.ImageHits = dbm.MySqlImageHits.Where(h => h.ImageLinkId == logImageHItData.LinkId).Count();
                        //imageHitSuccess.IpAddress = db.Visitors.Where(v => v.VisitorId == logImageHItData.VisitorId).FirstOrDefault().IpAddress;
                        //imageHitControllerBusy = false;
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
        private static readonly Random getrandom = new Random();

        [HttpPost]
        public PageHitSuccessModel LogPageHit(PageHitRequestModel pageHitModel)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    dbm.MySqlPageHits.Add(new MySqlPageHit()
                    {
                        VisitorId = pageHitModel.VisitorId,
                        PageId = pageHitModel.PageId,
                        HitTimeStamp = DateTime.Now.AddMilliseconds(getrandom.Next())
                    });
                    dbm.SaveChanges();
                    pageHitSuccessModel.PageHits = dbm.MySqlPageHits.Where(h => h.PageId == pageHitModel.PageId).Count();
                    pageHitSuccessModel.UserHits = dbm.MySqlPageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();
                }

                using (OggleBoobleContext odb = new OggleBoobleContext())
                {
                    CategoryFolder categoryFolder = odb.CategoryFolders.Where(f => f.Id == pageHitModel.PageId).FirstOrDefault();
                    pageHitSuccessModel.RootFolder = categoryFolder.RootFolder;
                    pageHitSuccessModel.PageName = categoryFolder.FolderName;

                    CategoryFolder parentFolder = odb.CategoryFolders.Where(f => f.Id == categoryFolder.Parent).FirstOrDefault();
                    if (parentFolder != null)
                        pageHitSuccessModel.ParentName = parentFolder.FolderName;
                }

                pageHitSuccessModel.Success = "ok";
            }
            catch (Exception ex)
            {
                pageHitSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return pageHitSuccessModel;
        }

        [HttpGet]
        public GetVisitorInfoFromIPAddressSuccessModel GetVisitorIdFromIP(string ipAddress)
        {
            GetVisitorInfoFromIPAddressSuccessModel success = new GetVisitorInfoFromIPAddressSuccessModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    MySqlVisitor visitor = dbm.MySqlVisitors.Where(v => v.IpAddress == ipAddress).FirstOrDefault();
                    success.VisitorId = visitor.VisitorId;
                    //success.UserName = visitor.UserName;
                    success.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                success.Success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpGet]
        public HitCountModel GetHitCount(int pageId)
        {
            HitCountModel hit = new HitCountModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    hit.PageHits = db.PageHits.Where(h => h.PageName == "x").Count();
                    //Hit hit = db.Hits.Where(h => h.HitId == hitId).First();
                    //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
                    hit.Success = "ok";
                }
            }
            catch (Exception ex) { hit.Success = Helpers.ErrorDetails(ex); }
            return hit;
        }

        [HttpPost]
        public PageHitSuccessModel XXLogSpecialPageHit(int pageId, string visitorId)
        {
            PageHitSuccessModel pageHitSuccess = new PageHitSuccessModel();
            if (visitorId == "9bd90468-e633-4ee2-af2a-8bbb8dd47ad1")
                pageHitSuccess.Success = "ok";
            else
            {
                try
                {
                    using (WebStatsContext db = new WebStatsContext())
                    {
                        PageHit hit = new PageHit();
                        hit.VisitorId = visitorId;
                        hit.HitDateTime = DateTime.Now;
                        //hit.AppName = pageHitModel.AppName;
                        hit.PageId = pageId;
                        //hit.PageName = pageName;
                        db.PageHits.Add(hit);
                        db.SaveChanges();

                        //if (AppDomain.CurrentDomain.BaseDirectory != "F:\\Devl\\WebApi\\")
                        //{
                        //    Visitor visitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();

                        //    using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        //    {
                        //        godaddyEmail.SendEmail("ALRIGHT!. Somebody Visited " + pageName, visitor.IpAddress +
                        //            " from " + visitor.City + "," + visitor.Region + " " + visitor.Country + " visited: " + pageName);
                        //    }
                        //}

                        pageHitSuccess.Success = "ok";
                    }
                }
                catch (Exception ex) { pageHitSuccess.Success = Helpers.ErrorDetails(ex); }
            }
            return pageHitSuccess;
        }

        [HttpPatch]
        public string EndVisit(string visitorId)
        {
            var success = "on no";
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    Visit visit = db.Visits.Where(v => v.VisitorId == visitorId).First();

                    //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = ex.Message;
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class VisitController : ApiController
    {
        private static readonly Random getrandom = new Random();

        [HttpPost]
        public LogVisitorSuccessModel LogVisitor(LogVisitorModel visitorModel)
        {
            var visitorSuccess = new LogVisitorSuccessModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    MySqlVisitor myExisting = dbm.MySqlVisitors.Where(v => v.IpAddress == visitorModel.IpAddress).FirstOrDefault();
                    if (myExisting == null)
                    {
                        // WE HAVE A NEW VISITOR
                        MySqlVisitor myVisitor = new MySqlVisitor();
                        myVisitor.VisitorId = Guid.NewGuid().ToString();
                        myVisitor.IpAddress = visitorModel.IpAddress;
                        myVisitor.City = visitorModel.City;
                        myVisitor.Region = visitorModel.Region;
                        myVisitor.Country = visitorModel.Country;
                        myVisitor.GeoCode = visitorModel.GeoCode;
                        myVisitor.InitialPage = visitorModel.PageId;
                        myVisitor.InitialVisit = DateTime.Now;

                        dbm.MySqlVisitors.Add(myVisitor);
                        dbm.SaveChanges();
                        visitorSuccess.IsNewVisitor = true;
                        visitorSuccess.VisitorId = myVisitor.VisitorId;

                        using (OggleBoobleContext odb = new OggleBoobleContext())
                        {
                            CategoryFolder categoryFolder= odb.CategoryFolders.Where(f => f.Id == visitorModel.PageId).FirstOrDefault();
                            if (categoryFolder != null)
                                visitorSuccess.PageName = categoryFolder.FolderName;
                        }
                    }
                    else
                    {
                        visitorSuccess.IsNewVisitor = false;
                        visitorSuccess.VisitorId = myExisting.VisitorId;
                    }
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
                    List<MySqlVisit> visitorVisits = dbm.MySqlVisits.Where(v => v.VisitorId == visitorId).ToList();
                    if (visitorVisits.Count() > 0)
                    {
                        lastVisitDate = dbm.MySqlVisits.Where(v => v.VisitorId == visitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                        //lastVisitDate = dbm.MySqlVisits.Where(v => v.VisitorId == visitorId).OrderBy(v => v.VisitDate).FirstOrDefault().VisitDate;
                    }
                    if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                    {
                        MySqlVisitor visitor = dbm.MySqlVisitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        if (visitor != null)
                        {
                            dbm.MySqlVisits.Add(new MySqlVisit()
                            {
                                VisitorId = visitorId,
                                VisitDate = DateTime.UtcNow.AddMilliseconds(getrandom.Next())
                            });
                            dbm.SaveChanges();
                            visitSuccessModel.VisitAdded = true;
                            visitSuccessModel.WelcomeMessage = "Welcome Back ";
                            //if(visitor.u)
                            //pageHitSuccessModel.WelcomeMessage = "Welcome back " + visitor.UserName;
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
                using (WebStatsContext db = new WebStatsContext())
                {
                    ChangeLog alredyExists = db.ChangeLogs.Where(cl => cl.PageId == changeLog.PageId && cl.Activity == changeLog.Activity).FirstOrDefault();
                    if (alredyExists == null)
                    {
                        db.ChangeLogs.Add(new ChangeLog()
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
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
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
                using (WebStatsContext db = new WebStatsContext())
                {
                    db.EventLogs.Add(new EventLog()
                    {
                        EventCode = logEventModel.EvenCode,
                        PageId = logEventModel.PageId,
                        VisitorId = logEventModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();

                    logEventActivitySuccess.EventName = db.Refs.Where(r => r.RefCode == logEventModel.EvenCode).FirstOrDefault().RefDescription;
                    using (OggleBoobleContext odb = new OggleBoobleContext())
                    {
                        logEventActivitySuccess.PageName = odb.CategoryFolders.Where(f => f.Id == logEventModel.PageId).FirstOrDefault().FolderName;
                    }
                    Visitor visitor = db.Visitors.Where(v => v.VisitorId == logEventModel.VisitorId).FirstOrDefault();
                    if (visitor != null)
                    {
                        logEventActivitySuccess.IpAddress = visitor.IpAddress;
                        logEventActivitySuccess.VisitorDetails = visitor.City + ", " + visitor.Region + " " + visitor.Country;
                    }
                }
                logEventActivitySuccess.Success = "ok";
            }
            catch (SystemException sex) {
                //if (ex.Message.Contains("reference not set"))
                {
                    logEventActivitySuccess.Success = "reference not set. Source: " + sex.Source;
                }
            }
            catch (Exception ex)
            {
                logEventActivitySuccess.Success = Helpers.ErrorDetails(ex);             
            }
            return logEventActivitySuccess;
        }
    }
}