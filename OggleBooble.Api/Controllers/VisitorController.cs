using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.Models;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class VisitorController : ApiController
    {
        [HttpPost]
        [Route("api/Visitor/AddVisitor")]
        public AddVisitorSuccessModel AddVisitor(AddVisitorModel visitorData)
        {
            var addVisitorModel = new AddVisitorSuccessModel() { Success = "ono" };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbExistingIpVisitor = db.Visitors.Where(v => v.IpAddress == visitorData.IpAddress).FirstOrDefault();
                    if (dbExistingIpVisitor == null)
                        addVisitorModel.VisitorId = Guid.NewGuid().ToString();
                    else
                    {
                        //visitorData.IpAddress = visitorData.IpAddress + "." + new Random().Next(0, 4).ToString("0000");
                        if (visitorData.CalledFrom != "attempt Register")
                        {
                            addVisitorModel.VisitorId = dbExistingIpVisitor.VisitorId;
                            addVisitorModel.Success = "existing Ip";
                            return addVisitorModel;
                        }
                    }
                    var newVisitor = new Visitor()
                    {
                        VisitorId = addVisitorModel.VisitorId,
                        InitialPage = visitorData.InitialPage,
                        City = visitorData.City,
                        Country = visitorData.Country,
                        GeoCode = visitorData.GeoCode,
                        Region = visitorData.Region,
                        InitialVisit = DateTime.Now,
                        IpAddress = visitorData.IpAddress
                    };
                    db.Visitors.Add(newVisitor);
                    db.SaveChanges();
                    addVisitorModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                addVisitorModel.Success = Helpers.ErrorDetails(ex);
            }
            return addVisitorModel;
        }

        [HttpGet]
        [Route("api/Visitor/GetVisitorInfo")]
        public VisitorInfoSuccessModel GetVisitorInfo(string visitorId)
        {
            var visitorInfoModel = new VisitorInfoSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        visitorInfoModel.Success = "not found";
                    else
                    {
                        RegisteredUser dbRegisteredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                        if (dbRegisteredUser == null)
                        {
                            visitorInfoModel.IsRegisteredUser = false;
                        }
                        else
                        {
                            visitorInfoModel.IsRegisteredUser = true;
                            visitorInfoModel.RegisteredUser = dbRegisteredUser;
                        }
                        visitorInfoModel.IpAddress = dbVisitor.IpAddress;
                        visitorInfoModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                visitorInfoModel.Success = Helpers.ErrorDetails(ex);
            }
            return visitorInfoModel;
        }

        [HttpGet]
        [Route("api/Visitor/VerifyVisitor")]
        public string VerifyVisitor(string visitorId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        success = "not found";
                    else
                    {
                        var waistedIPs = db.ActivityLogs.Where(a => a.ActivityCode == "WIP" && a.VisitorId == visitorId).FirstOrDefault();
                        if (waistedIPs == null)
                            success = "ok";
                        else
                            success = "badVisitor";
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpGet]
        [Route("api/Visitor/GetVisitorFromIp")]
        public SuccessModel GetVisitorFromIp(string ipAddress)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.IpAddress == ipAddress).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        successModel.ReturnValue = "not found";
                        successModel.Success = "ok";
                    }
                    else
                    {
                        successModel.ReturnValue = dbVisitor.VisitorId;
                        successModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }
    }

    [EnableCors("*", "*", "*")]
    public class VisitController : ApiController
    {
        [HttpPost]
        [Route("api/Common/LogVisit")]
        public LogVisitSuccessModel LogVisit(string visitorId)
        {
            LogVisitSuccessModel visitSuccessModel = new LogVisitSuccessModel() { VisitAdded = false, IsNewVisitor = false };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        visitSuccessModel.Success = "VisitorId not found";
                        return visitSuccessModel;
                    }

                    //  { VisitAdded = false, IsNewVisitor = false }
                    DateTime lastVisitDate = DateTime.MinValue;
                    List<Visit> visitorVisits = db.Visits.Where(v => v.VisitorId == visitorId).ToList();
                    if (visitorVisits.Count() > 0)
                    {
                        visitSuccessModel.IsNewVisitor = false;
                        lastVisitDate = db.Visits.Where(v => v.VisitorId == visitorId).OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                    }
                    else
                        visitSuccessModel.IsNewVisitor = true;

                    if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                    {
                        db.Visits.Add(new Visit()
                        {
                            VisitorId = visitorId,
                            VisitDate = DateTime.Now
                        });
                        db.SaveChanges();
                        visitSuccessModel.VisitAdded = true;
                    }

                    if (visitSuccessModel.VisitAdded)
                    {
                        var registeredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
                        if (registeredUser != null)
                        {
                            visitSuccessModel.WelcomeMessage = "Welcome back " + registeredUser.UserName;
                        }
                        else
                        {
                            if (visitSuccessModel.IsNewVisitor)
                                visitSuccessModel.WelcomeMessage = "Welcome new visitor. Please log in";
                            else
                                visitSuccessModel.WelcomeMessage = "Welcome back. Please log in";
                        }
                    }
                }
                visitSuccessModel.Success = "ok";

            }
            catch (Exception ex)
            {
                visitSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return visitSuccessModel;
        }
    }
}


