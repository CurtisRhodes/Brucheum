using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.MySqDataContext;

namespace WebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    public class VisitorInfoController : ApiController
    {
        [HttpPost]
        [Route("api/VisitorInfo/LogPageHit")]
        public PageHitSuccessModel LogPageHit(string visitorId, int pageId)
        {
            PageHitSuccessModel pageHitSuccess = new PageHitSuccessModel();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    var twoMinutesAgo = DateTime.Now.AddMinutes(-2);
                    var lastHit = db.PageHits.Where(h => h.VisitorId == visitorId && h.PageId == pageId && h.Occured > twoMinutesAgo).FirstOrDefault();
                    if (lastHit == null)
                    {
                        db.PageHits.Add(new PageHit()
                        {
                            VisitorId = visitorId,
                            PageId = pageId,
                            Occured = DateTime.Now  //.AddMilliseconds(getrandom.Next())
                        });
                        db.SaveChanges();
                    }
                    pageHitSuccess.UserImageHits = db.ImageHits.Where(h => h.VisitorId == visitorId).Count();
                    pageHitSuccess.UserPageHits = db.PageHits.Where(h => h.VisitorId == visitorId).Count();
                    //pageHitSuccess.ImageHits = db.ImageHits.Where(h => h.ImageLinkId == logImageHItData.LinkId).Count();

                    pageHitSuccess.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                string err = Helpers.ErrorDetails(ex);
                if (err.Contains("Object reference not set to an instance of an object."))
                    err = "Null reference. PageId: " + pageId + " visId: " + visitorId;
                pageHitSuccess.Success = err;

            }
            return pageHitSuccess;
        }

        [HttpPost]
        [Route("api/VisitorInfo/AddVisitor")]
        public AddVisitorSuccessModel AddVisitor(AddVisitorModel visitorData)
        {
            var addVisitorSuccess = new AddVisitorSuccessModel();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == visitorData.PageId).FirstOrDefault();
                    if (categoryFolder != null)
                        addVisitorSuccess.PageName = categoryFolder.FolderName;

                    var existingVisitor = db.Visitors.Where(v => v.IpAddress == visitorData.IpAddress).FirstOrDefault();
                    if (existingVisitor != null)
                    {
                        addVisitorSuccess.VisitorId = existingVisitor.VisitorId;
                        addVisitorSuccess.IsNewVisitor = false;
                    }
                    else
                    {
                        // We have a new visitor!
                        //string dnsHostName = Dns.GetHostName();
                        //IPHostEntry ipEntry = Dns.GetHostEntry(dnsHostName);
                        //IPAddress[] iPAddresses = ipEntry.AddressList;
                        //string ipAddress = iPAddresses[iPAddresses.Length - 1].ToString();
                        string newVisitorId = Guid.NewGuid().ToString();
                        Visitor newVisitor = new Visitor()
                        {
                            VisitorId = newVisitorId,
                            InitialPage = visitorData.PageId,
                            City = visitorData.City,
                            Country = visitorData.Country,
                            GeoCode = visitorData.GeoCode,
                            Region = visitorData.Region,
                            InitialVisit = DateTime.Now,
                            IpAddress = visitorData.IpAddress
                        };
                        db.Visitors.Add(newVisitor);
                        db.SaveChanges();

                        addVisitorSuccess.VisitorId = newVisitorId;
                        addVisitorSuccess.IsNewVisitor = true;
                    }
                    addVisitorSuccess.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                addVisitorSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return addVisitorSuccess;
        }

        [HttpPost]
        [Route("api/VisitorInfo/LogVisit")]
        public LogVisitSuccessModel LogVisit(string visitorId)
        {
            LogVisitSuccessModel visitSuccessModel = new LogVisitSuccessModel();
            try
            {
                using (OggleBoobleMySqContext dbm = new OggleBoobleMySqContext())
                {
                    DateTime lastVisitDate = DateTime.MinValue;
                    List<Visit> visitorVisits = dbm.Visits.Where(v => v.VisitorId == visitorId).ToList();
                    if (visitorVisits.Count() > 0)
                    {
                        lastVisitDate = dbm.Visits.Where(v => v.VisitorId == visitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
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
                            visitSuccessModel.IsNewVisitor = true;
                            if (lastVisitDate == DateTime.MinValue)
                                visitSuccessModel.WelcomeMessage = "Welcome New Visitor";
                            else
                            {
                                //if(v)
                                visitSuccessModel.WelcomeMessage = "Welcome Back ";
                            }
                        }
                    }
                    visitSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                visitSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return visitSuccessModel;
        }

        [HttpGet]
        [Route("api/VisitorInfo/verifyVisitorId")]
        public VerifyVisitorSuccessModel verifyVisitorId(string visitorId)
        {
            VerifyVisitorSuccessModel visitorSuccessModel = new VerifyVisitorSuccessModel();
            try
            {
                using (OggleBoobleMySqContext db = new OggleBoobleMySqContext())
                {
                    var dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        visitorSuccessModel.Exists = false;
                    }
                    else
                    {
                        visitorSuccessModel.Exists = true;
                        visitorSuccessModel.IpAddress = dbVisitor.IpAddress;
                    }
                    visitorSuccessModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                visitorSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return visitorSuccessModel;
        }
    }
}


