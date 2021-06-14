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
        public string AddVisitor(AddVisitorModel visitorData)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var newVisitor = new Visitor()
                    {
                        VisitorId = visitorData.VisitorId,
                        IpAddress = visitorData.IpAddress,
                        City = visitorData.City,
                        Country = visitorData.Country,
                        GeoCode = visitorData.GeoCode,
                        Region = visitorData.Region,
                        InitialPage = visitorData.InitialPage,
                        InitialVisit = DateTime.Now
                    };
                    db.Visitors.Add(newVisitor);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
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
        public SuccessModel VerifyVisitor(string visitorId)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                if (visitorId == "not found")
                {
                    successModel.ReturnValue = "not found";
                }
                else
                {
                    using (var db = new OggleBoobleMySqlContext())
                    {
                        Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        if (dbVisitor == null)
                            successModel.ReturnValue = "not found in Visitor table";
                        else
                            successModel.ReturnValue = "ok";
                    }
                }
                successModel.Success = "ok";
            }
            catch (Exception ex) { successModel.Success = Helpers.ErrorDetails(ex); }
            return successModel;
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

        [HttpGet]
        [Route("api/Visitor/CheckForRepeatBadVisitorId")]
        public SuccessModel CheckForRepeatBadVisitorId(string visitorId)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                //select* from ActivityLog where ActivityCode = "VV7" and Occured > curdate() order by Occured desc;
                //checkForRepeatBadVisitorId(visitorId);
                using (var db = new OggleBoobleMySqlContext())
                {
                    var repeatOffender = db.ActivityLogs.Where(a => a.ActivityCode == "VV7" && a.VisitorId == visitorId).FirstOrDefault();
                    if (repeatOffender == null)
                        successModel.ReturnValue = "ok";
                    else
                        successModel.ReturnValue = "repeatOffender";

                    successModel.Success = "ok";
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
        public SuccessModel LogVisit(string visitorId)
        {
            //LogVisitSuccessModel visitSuccessModel = new LogVisitSuccessModel() { VisitAdded = false, IsNewVisitor = false };
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        successModel.ReturnValue = "VisitorId not found";
                    }
                    else
                    {
                        //  { VisitAdded = false, IsNewVisitor = false }
                        DateTime lastVisitDate = DateTime.MinValue;
                        List<Visit> visitorVisits = db.Visits.Where(v => v.VisitorId == visitorId).ToList();
                        if (visitorVisits.Count() > 0)
                        {
                            lastVisitDate = visitorVisits.OrderByDescending(v => v.VisitDate).FirstOrDefault().VisitDate;
                        }
                        else
                        {
                            if ((lastVisitDate == DateTime.MinValue) || ((DateTime.Now - lastVisitDate).TotalHours > 12))
                            {
                                db.Visits.Add(new Visit()
                                {
                                    VisitorId = visitorId,
                                    VisitDate = DateTime.Now
                                });
                                db.SaveChanges();
                                if (visitorVisits.Count() == 0)
                                    successModel.ReturnValue = "new visitor logged";
                                else
                                    successModel.ReturnValue = "return visit logged";
                            }
                            else
                                successModel.ReturnValue = "no visit recorded";
                        }
                    }
                    successModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }
    }
}


