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
        [HttpPut]
        public PageHitSuccessModel LogPageHit(PageHitRequestModel pageHitModel)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                if (Helpers.IsNullorUndefined(pageHitModel.VisitorId))
                {
                    if (Helpers.IsNullorUndefined(pageHitModel.IpAddress))
                    {
                        pageHitSuccessModel.Success = "VisitorId fail";
                        return pageHitSuccessModel;
                    }
                }
                using (WebStatsContext db = new WebStatsContext())
                {
                    /// LOG VISIT
                    DateTime lastVisitDate;
                    if (!Helpers.IsNullorUndefined(pageHitModel.VisitorId))
                        lastVisitDate = db.Visits.Where(v => v.VisitorId == pageHitModel.VisitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                    else
                    {
                        IPVisitLookup iPVisitLookup = (from v in db.Visitors
                                                       join vi in db.Visits on v.VisitorId equals vi.VisitorId
                                                       select new IPVisitLookup() { VisitDate = vi.VisitDate }).OrderByDescending(v => v).FirstOrDefault();
                        lastVisitDate = iPVisitLookup.VisitDate;
                    }
                    if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                    {
                        pageHitSuccessModel.WelcomeMessage = "Welcome Back ";
                        Visitor visitor = db.Visitors.Where(v => v.VisitorId == pageHitModel.VisitorId).FirstOrDefault();
                        //if ((visitor.IpAddress != "68.203.90.183") && (visitor.IpAddress != "50.62.160.105"))
                        {
                            db.Visits.Add(new Visit() { VisitorId = pageHitModel.VisitorId, VisitDate = DateTime.Now });
                            db.SaveChanges();
                        }

                    }

                    string pageName = "";
                    using (OggleBoobleContext odb = new OggleBoobleContext())
                    {
                        pageName = odb.CategoryFolders.Where(f => f.Id == pageHitModel.PageId).First().FolderName;
                    }

                    // SEND VISIT EMAIL
                    if (pageHitModel.Verbose > 4)
                    {
                        if (AppDomain.CurrentDomain.BaseDirectory != "F:\\Devl\\WebApi\\")
                        {
                            if ((pageHitModel.IpAddress != "68.203.90.183") && (pageHitModel.IpAddress != "50.62.160.105"))
                            {
                                //if (pageHitModel.PageName != "Julie Woodson" &&
                                //    pageHitModel.PageName != "Teri Peterson" &&
                                //    pageHitModel.PageName != "Alana Soares" &&
                                //    pageHitModel.PageName != "Ola Ray")
                                //{
                                using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                                {

                                    Visitor visitor = db.Visitors.Where(v => v.VisitorId == pageHitModel.VisitorId).First();

                                    if (Helpers.IsNullorUndefined(pageHitModel.UserName))
                                    {
                                        godaddyEmail.SendEmail("VERY GOOD: Someone came back for another visit",
                                        pageName + " hit from " + visitor.City + "," + visitor.Region + " " + visitor.Country + " Ip: " + pageHitModel.IpAddress);
                                        pageHitSuccessModel.WelcomeMessage = "Welcome back. Please Log in.";
                                    }
                                    else
                                    {
                                        godaddyEmail.SendEmail("EXCELLENT! " + visitor.UserName + " came back for another visit ",
                                        pageName + " hit from " + visitor.City + "," + visitor.Region + " " + visitor.Country);
                                        pageHitSuccessModel.WelcomeMessage = "Welcome back " + visitor.UserName;
                                    }
                                }
                            }
                        }
                    }

                    pageHitSuccessModel.PageHits = db.PageHits.Where(h => h.PageName == pageName).Count();
                    pageHitSuccessModel.UserHits = db.PageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();

                    /// LOG PAGE HIT
                    if ((pageHitModel.IpAddress != "68.203.90.183") && (pageHitModel.IpAddress != "50.62.160.105"))
                    {
                        PageHit hit = new PageHit();
                        hit.VisitorId = pageHitModel.VisitorId;
                        hit.HitDateTime = DateTime.Now;
                        hit.AppName = pageHitModel.AppName;
                        hit.PageName = pageName;
                        db.PageHits.Add(hit);
                        db.SaveChanges();

                        if (pageName == "Ranker")
                        {
                            if (AppDomain.CurrentDomain.BaseDirectory != "F:\\Devl\\WebApi\\")
                            {
                                using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                                {
                                    godaddyEmail.SendEmail("ALRIGHT!. Somebody Visited Ranker", "Visitor " + pageHitModel.IpAddress + " visited: " + pageName);
                                }
                            }
                        }

                        if (pageHitModel.Verbose > 8)
                        {
                            using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                            {
                                godaddyEmail.SendEmail("Page Visit", "Visitor " + pageHitModel.IpAddress + " visited: " + pageName);
                            }
                        }
                    }
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
        public VisitorSuccessModel LogVisitor(VisitorModel visitorModel)
        {
            VisitorSuccessModel visitorSuccess = new VisitorSuccessModel();
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
                        dbVisitor.UserName = visitorModel.UserName;
                        dbVisitor.AppName = visitorModel.AppName;
                        dbVisitor.IpAddress = visitorModel.IpAddress;
                        dbVisitor.City = visitorModel.City;
                        dbVisitor.Region = visitorModel.Region;
                        dbVisitor.Country = visitorModel.Country;
                        dbVisitor.GeoCode = visitorModel.GeoCode;
                        dbVisitor.InitialVisit = DateTime.Now;

                        db.Visitors.Add(dbVisitor);
                        db.SaveChanges();
                        visitorSuccess.WelcomeMessage = "Welcome new visitor!";
                        visitorSuccess.VisitorId = dbVisitor.VisitorId;

                        using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        {
                            godaddyEmail.SendEmail("CONGRATULATIONS: someone new just visited your site",
                             "viewed " + visitorModel.PageName + " from " + visitorModel.City + "," + visitorModel.Region + " " + visitorModel.Country + "   ip:" + visitorModel.IpAddress);
                        }
                    }
                    else
                    {
                        visitorSuccess.VisitorId = dbExisting.VisitorId;
                    }

                    PageHit hit = new PageHit();
                    hit.VisitorId = visitorSuccess.VisitorId;
                    hit.HitDateTime = DateTime.Now;
                    hit.AppName = visitorModel.AppName;
                    hit.PageName = visitorModel.PageName;
                    db.PageHits.Add(hit);

                    db.Visits.Add(new Visit() { VisitorId = visitorSuccess.VisitorId, VisitDate = DateTime.Now });

                    db.SaveChanges();

                }
                visitorSuccess.Success = "ok";
            }
            catch (Exception ex) { visitorSuccess.Success = Helpers.ErrorDetails(ex); }
            return visitorSuccess;
        }
        
        [HttpPost]
        public string LogImageHit(string visitorId, string linkId)
        {
            string success = "";
            try
            {
                using (WebStatsContext db = new WebStatsContext())
                {
                    db.ImageHits.Add(new ImageHit() { HitDateTime = DateTime.Now, VisitorId = visitorId, ImageLinkId = linkId });
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
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