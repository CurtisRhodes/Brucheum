using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using WebApi.Models;
using WebApi.DataContext;
using WebApi.AspNet.DataContext;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpGet]
        public LogVisitModel GetHitCount(int pageId)
        {
            LogVisitModel visitModel = new LogVisitModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    int hitCount = db.PageHits.Where(h => h.PageName == "x").Count();
                    //Hit hit = db.Hits.Where(h => h.HitId == hitId).First();
                    //hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
                    visitModel.Success = "ok";
                }
            }
            catch (Exception ex) { visitModel.Success = Helpers.ErrorDetails(ex); }
            return visitModel;
        }

        [HttpPost]
        public LogVisitModel LogVisitor(VisitorModel visitorModel)
        {
            LogVisitModel visitSuccessModel = new LogVisitModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    Visitor dbExisting = db.Visitors.Where(v => v.IpAddress == visitorModel.IpAddress && v.AppName == visitorModel.AppName).FirstOrDefault();
                    if (dbExisting == null)
                    {
                        // WE HAVE A NEW VISITOR
                        Visitor dbVisitor = new Visitor();
                        dbVisitor.VisitorId = Guid.NewGuid().ToString();
                        dbVisitor.UserName = visitorModel.CookieName;
                        dbVisitor.AppName = visitorModel.AppName;
                        dbVisitor.IpAddress = visitorModel.IpAddress;
                        dbVisitor.City = visitorModel.City;
                        dbVisitor.Region = visitorModel.Region;
                        dbVisitor.Country = visitorModel.Country;
                        dbVisitor.GeoCode = visitorModel.GeoCode;

                        db.Visitors.Add(dbVisitor);
                        db.SaveChanges();
                        visitSuccessModel.WelcomeMessage = "Welcome new visitor!";
                        visitSuccessModel.VisitorId = dbVisitor.VisitorId;
                        //LogVisit(dbVisitor.VisitorId, visitorModel.PageName);

                        Visit visit = new Visit() { VisitorId = visitSuccessModel.VisitorId, VisitDate = DateTime.Now };
                        db.Visits.Add(visit);
                        db.SaveChanges();

                        using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        {
                            godaddyEmail.SendEmail("CONGRATULATIONS: someone new just visited your site",
                             "viewed "+ visitorModel.PageName + " from " + visitorModel.City + "," + visitorModel.Region + " " + visitorModel.Country);
                        }
                    }
                    else
                    {
                        visitSuccessModel.VisitorId = dbExisting.VisitorId;
                        LogVisit(dbExisting.VisitorId, visitorModel.PageName);
                    }
                }
                visitSuccessModel.Success = "ok";
            }
            catch (Exception ex) { visitSuccessModel.Success = Helpers.ErrorDetails(ex); }
            return visitSuccessModel;
        }

        [HttpPost]
        public LogVisitModel LogVisit(string visitorId, string pageName)
        {
            LogVisitModel visitSuccessModel = new LogVisitModel();
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    //Visitor dbExisting = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    bool logVisit = true;
                    Visit lastVisit = db.Visits.Where(v => v.VisitorId == visitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault();
                    if (lastVisit != null)
                    {
                        if ((DateTime.Now - lastVisit.VisitDate).TotalHours < 12)
                        {
                            logVisit = false;
                            //if()
                            visitSuccessModel.WelcomeMessage = "";
                        }
                    }
                    if (logVisit)
                    {
                        visitSuccessModel.WelcomeMessage = "Welcome back ";
                        {
                            Visitor visitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                            if (visitor != null)
                            {
                                if ((visitor.IpAddress != "68.203.90.183") && (visitor.IpAddress != "50.62.160.105"))
                                {
                                    Visit visit = new Visit() { VisitorId = visitorId, VisitDate = DateTime.Now };
                                    db.Visits.Add(visit);
                                    db.SaveChanges();
                                }
                                if (AppDomain.CurrentDomain.BaseDirectory != "F:\\Devl\\WebApi\\")
                                {
                                    using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                                    {
                                        if (visitor.UserName == "")
                                        {
                                            if ((visitor.IpAddress != "68.203.90.183") && (visitor.IpAddress != "50.62.160.105"))
                                            {
                                                godaddyEmail.SendEmail("VERY GOOD: Someone came back for another visit",
                                                pageName + " hit from " + visitor.City + "," + visitor.Region + " " + visitor.Country);
                                            }
                                            visitSuccessModel.WelcomeMessage = "Welcome back. Please Log in.";
                                        }
                                        else
                                        {
                                            if ((visitor.IpAddress != "68.203.90.183") && (visitor.IpAddress != "50.62.160.105"))
                                            {
                                                godaddyEmail.SendEmail("EXCELLENT! " + visitor.UserName + "came back for another visit",
                                                pageName + " hit from " + visitor.City + "," + visitor.Region + " " + visitor.Country);
                                            }
                                            visitSuccessModel.WelcomeMessage = "Welcome back " + visitor.UserName;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    visitSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex) { visitSuccessModel.Success = Helpers.ErrorDetails(ex); }
            return visitSuccessModel;
        }

        [HttpPut]
        public PageHitSuccessModel LogPageHit(PageHitModel pageHitModel)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                LogVisit(pageHitModel.VisitorId, pageHitModel.PageName);
                using (WebStatsContext db = new WebStatsContext())
                {
                    if ((pageHitModel.IpAddress != "68.203.90.183") && (pageHitModel.IpAddress != "50.62.160.105"))
                    {
                        PageHit hit = new PageHit();
                        hit.VisitorId = pageHitModel.VisitorId;
                        hit.HitDateTime = DateTime.Now;
                        hit.AppName = pageHitModel.AppName;
                        hit.PageName = pageHitModel.PageName;
                        db.PageHits.Add(hit);
                        db.SaveChanges();
                    }
                    pageHitSuccessModel.PageHits = db.PageHits.Where(h => h.PageName == pageHitModel.PageName).Count();
                    pageHitSuccessModel.UserHits = db.PageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();

                    if (pageHitModel.PageName == "Ranker")
                    {
                        if(AppDomain.CurrentDomain.BaseDirectory != "F:\\Devl\\WebApi\\")
                        {
                            using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                            {
                                godaddyEmail.SendEmail("ALRIGHT!. Somebody Visited Ranker", "Visitor " + pageHitModel.IpAddress + " visited: " + pageHitModel.PageName);
                            }
                        }
                    }                
                    else if (pageHitModel.Verbose)
                    {
                        using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        {
                            godaddyEmail.SendEmail("Page Visit", "Visitor " + pageHitModel.IpAddress + " visited: " + pageHitModel.PageName);
                        }
                    }

                }
                pageHitSuccessModel.Success= "ok";
            }
            catch (Exception ex) {
                pageHitSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return pageHitSuccessModel;
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
}