using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using WebApi.Articles.Models;
using WebApi.Home.Models;
using WebApi.WebSite.DataContext;

namespace WebApi.Home
{
    [EnableCors("*", "*", "*")]
    public class RefController : ApiController
    {
        [HttpGet]
        public JsonResult<List<RefModel>> Get(string refType)
        {
            var refs = new List<RefModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    IList<Ref> dbrefs = db.Refs.Where(r => r.RefType == refType).OrderBy(r => r.RefDescription).ToList();
                    foreach (Ref r in dbrefs)
                    {
                        refs.Add(new RefModel() { RefCode = r.RefCode, RefDescription = r.RefDescription });
                    }
                }
            }
            catch (Exception ex)
            {
                refs.Add(new RefModel() { RefCode = "ERR", RefType = "ERR", RefDescription = Helpers.ErrorDetails(ex) });
            }
            return Json(refs);
        }

        [HttpPost]
        public JsonResult<RefModel> Post(RefModel refModel)
        {
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Ref @ref = new Ref();
                    @ref.RefType = refModel.RefType;
                    @ref.RefCode = GetUniqueRefCode(refModel.RefDescription, db);
                    @ref.RefDescription = refModel.RefDescription;

                    db.Refs.Add(@ref);
                    db.SaveChanges();
                    refModel.RefCode = @ref.RefCode;
                    refModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                refModel.Success = ex.Message;
            }
            return Json(refModel);
        }

        [HttpPut]
        public JsonResult<string> Put(RefModel refModel)
        {
            string success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Ref @ref = db.Refs.Where(r => r.RefCode == refModel.RefCode).First();
                    @ref.RefDescription = refModel.RefDescription;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return Json(success);
        }

        /// helper apps
        private string GetUniqueRefCode(string refDescription,WebSiteContext db)
        {
            if (refDescription.Length < 3)
                refDescription = refDescription.PadRight(3, 'A');

            var refCode = refDescription.Substring(0, 3).ToUpper();
            Ref exists = new Ref();
            while (exists != null)
            {
                exists = db.Refs.Where(r => r.RefCode == refCode).FirstOrDefault();
                if (exists != null)
                {
                    char nextLastChar = refCode.Last();
                    if (nextLastChar == ' ') { nextLastChar = 'A'; }
                    if (nextLastChar == 'Z')
                        nextLastChar = 'A';
                    else
                        nextLastChar = (char)(((int)nextLastChar) + 1);
                    refCode = refCode.Substring(0, 2) + nextLastChar;
                }
            }
            return refCode;
        }
    }

    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpGet]
        public string LogVisit(string ipAddress, string app)
        {
            string success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Visitor existing = db.Visitors.Where(v => v.IPAddress == ipAddress && v.App == app).FirstOrDefault();

                    // ERROR: The entity or complex type 'WebApi.Visitor' cannot be constructed in a LINQ to Entities query.
                    // Visitor aVisitor = (from visitors in db.Visitors
                    //                        where visitors.IPAddress == ipAddress && visitors.App == app
                    //                        select new Visitor() { IPAddress = visitors.IPAddress }).FirstOrDefault();
                    if (existing == null)
                    {
                        // WE HAVE A NEW VISITOR
                        Visitor visitor = new Visitor();
                        visitor.App = app;
                        visitor.IPAddress = ipAddress;
                        visitor.CreateDate = DateTime.Now;

                        db.Visitors.Add(visitor);
                        db.SaveChanges();

                        success = new GodaddyEmailController().Post(new EmailMessageModel()
                        {
                            Subject = "CONGRATULATIONS: someone just visited your site",
                            Body = "ip: " + ipAddress + " visited: " + app
                        });
                        ////emailSuccess = Helpers.SendEmail("CONGRATULATIONS: someone just visited your site", "ip: " + ipAddress + " visited: " + app);
                        //if (emailSuccess != "ok")
                        //    success = "true but " + emailSuccess;
                        //else
                        //    success = "ok";
                    }
                    else
                    {
                        // add  Vist
                        Visit visit = new Visit();
                        visit.IPAddress = ipAddress;
                        visit.App = app;
                        visit.VisitDate = DateTime.Now;

                        db.Visits.Add(visit);
                        db.SaveChanges();

                        if (ipAddress != "50.62.160.105")  // could be something at Godaddy
                        {
                            success = new GodaddyEmailController().Post(new EmailMessageModel()
                            {
                                Subject = "Site Visit",
                                Body = "ip: " + ipAddress + " visited: " + app
                            });
                        }
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPost]
        public string LogPageHit(HitCounterModel hitCounterModel)
        {
            string success = "";
            try
            {
                //var ipAddress = System.Text.Encoding.UTF32.GetString(bytes);
                using (WebSiteContext db = new WebSiteContext())
                {
                    Hit hit = new Hit();
                    hit.IPAddress = hitCounterModel.IpAddress;
                    hit.App = hitCounterModel.AppName;
                    hit.BeginView = DateTime.Now;
                    hit.PageName = hitCounterModel.PageName;
                    hit.Details = hitCounterModel.Details;
                    db.Hits.Add(hit);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string EndVisit(int hitId)
        {
            var success = "on no";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Hit hit = db.Hits.Where(h => h.HitId == hitId).First();
                    hit.ViewDuration = (DateTime.Now - hit.BeginView).TotalSeconds.ToString();
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
 
 }



