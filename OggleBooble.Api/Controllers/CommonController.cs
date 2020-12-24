using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.MSSqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Data.Entity.Validation;
using System.Runtime.InteropServices;
using System.Web;
using System.Net.Mail;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class VisitorController : ApiController
    {
        [HttpPost]
        [Route("api/Common/AddVisitor")]
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
                        InitialPage = visitorData.FolderId,
                        City = visitorData.City,
                        Country = visitorData.Country,
                        GeoCode = visitorData.GeoCode,
                        Region = visitorData.Region,
                        InitialVisit = DateTime.Now,
                        IpAddress = visitorData.IpAddress
                    };
                    db.Visitors.Add(newVisitor);
                    db.SaveChanges();
                    success= "ok";

                    var dbExistingIpVisitor = db.Visitors.Where(v => v.IpAddress == visitorData.IpAddress).FirstOrDefault();
                    if (dbExistingIpVisitor != null)
                    {
                        success = "existing Ip";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

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

        [HttpGet]
        [Route("api/Common/GetVisitor")]
        public SuccessModel GetVisitor(string visitorId)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                        successModel.Success = "not found";
                    else
                    {
                        successModel.ReturnValue = dbVisitor.IpAddress;
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
        [Route("api/Common/GetVisitorFromIp")]
        public SuccessModel GetVisitorFromIp (string ipAddress)
        {
            var successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    Visitor dbVisitor = db.Visitors.Where(v => v.IpAddress == ipAddress).FirstOrDefault();
                    if (dbVisitor == null)
                        successModel.Success = "not found";
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
    public class HitCounterController : ApiController
    {
        [HttpPost]
        [Route("api/Common/LogImageHit")]
        public ImageHitSuccessModel LogImageHit(LogImageHitDataModel logImageHItData)
        {
            ImageHitSuccessModel imageHitSuccess = new ImageHitSuccessModel();
            try
            {
                using (var dbm = new OggleBoobleMySqlContext())
                {
                    dbm.ImageHits.Add(new ImageHit()
                    {
                        VisitorId = logImageHItData.VisitorId,
                        PageId = logImageHItData.FolderId,
                        ImageLinkId = logImageHItData.LinkId,
                        HitDateTime = DateTime.Now
                    });
                    dbm.SaveChanges();
                    imageHitSuccess.UserImageHits = dbm.ImageHits.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                    imageHitSuccess.UserPageHits = dbm.PageHits.Where(h => h.VisitorId == logImageHItData.VisitorId).Count();
                    imageHitSuccess.ImageHits = dbm.ImageHits.Where(h => h.ImageLinkId == logImageHItData.LinkId).Count();

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

        [HttpPost]
        [Route("api/Common/LogPageHit")]
        public PageHitSuccessModel LogPageHit(string visitorId, int folderId)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var twoMinutesAgo = DateTime.Now.AddMinutes(-2);

                    var lastHit = db.PageHits.Where(h => h.VisitorId == visitorId && h.PageId == folderId && h.Occured > twoMinutesAgo).FirstOrDefault();
                    if (lastHit == null)
                    {
                        db.PageHits.Add(new PageHit()
                        {
                            VisitorId = visitorId,
                            PageId = folderId,
                            Occured = DateTime.Now  //.AddMilliseconds(getrandom.Next())
                        });
                        db.SaveChanges();
                    }
                    pageHitSuccessModel.PageHits = db.PageHits.Where(h => h.PageId == folderId).Count();
                    var dbPageHitTotals = db.PageHitTotal.Where(h => h.PageId == folderId).FirstOrDefault();
                    if (dbPageHitTotals != null)
                    {
                        pageHitSuccessModel.PageHits += dbPageHitTotals.Hits;
                    }
                    pageHitSuccessModel.UserPageHits = db.PageHits.Where(h => h.VisitorId == visitorId).Count();
                    pageHitSuccessModel.UserImageHits = db.ImageHits.Where(h => h.VisitorId == visitorId).Count();

                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
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
                pageHitSuccessModel.Success = "ok";
            }
            catch (Exception ex)
            {
                pageHitSuccessModel.Success = Helpers.ErrorDetails(ex);
            }
            return pageHitSuccessModel;
        }

        [HttpPost]
        [Route("api/Common/LogIpHit")]
        public string LogIpHit(IpHitModel ipHitModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.IpInfoHits.Add(new IpInfoHit()
                    {
                        VisitorId = ipHitModel.VisitorId,
                        IpAddress = ipHitModel.IpAddress,
                        FolderId = ipHitModel.FolderId,
                        Occured = DateTime.Now
                    });
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

        [HttpPost]
        [Route("api/Common/LogStaticPageHit")]
        public string LogStaticPageHit(string visitorId, int folderId, string calledFrom)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.StaticPageHits.Add(new StaticPageHit()
                    {
                        VisitorId = visitorId,
                        FolderId = folderId,
                        CalledFrom = calledFrom,
                        Occured = DateTime.Now
                    });
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
    }

    [EnableCors("*", "*", "*")]
    public class CommonController : ApiController
    {
        [HttpPut]
        [Route("api/Common/SendEmail")]
        public string SendEmail(EmailMessageModel message)
        {
            string success = "";
            try
            {
                using (SmtpClient smtpClient = new SmtpClient("relay-hosting.secureserver.net", 25))
                {
                    MailMessage mailMessage = new MailMessage(message.From, "CurtishRhodes@hotmail.com", message.Subject, message.Message);
                    //MailMessage mailMessage = new MailMessage("info@api.Ogglebooble.com", "CurtishRhodes@hotmail.com", message.Subject, message.Message);
                    mailMessage.IsBodyHtml = true;
                    smtpClient.Send(mailMessage);
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
        [Route("api/Common/VerifyConnection")]
        public VerifyConnectionSuccessModel VerifyConnection()
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            VerifyConnectionSuccessModel successModel = new VerifyConnectionSuccessModel() { ConnectionVerified = false };
            try
            {
                //using (var db = new OggleBoobleMSSqlContext())
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbTest = db.CategoryFolders.Where(f => f.Id == 1).FirstOrDefault();
                    successModel.ConnectionVerified = (dbTest != null);
                }
                timer.Stop();
                //successModel.ReturnValue = timer.Elapsed.ToString();
                System.Diagnostics.Debug.WriteLine("VerifyConnection took: " + timer.Elapsed);
                successModel.Success = "ok";
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }

        [HttpPost]
        [Route("api/Common/LogError")]
        public string LogError(LogErrorModel logErrorModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ErrorLogs.Add(new ErrorLog()
                    {
                        VisitorId = logErrorModel.VisitorId,
                        ErrorCode = logErrorModel.ErrorCode,
                        ErrorMessage = logErrorModel.ErrorMessage,
                        CalledFrom = logErrorModel.CalledFrom,
                        FolderId = logErrorModel.FolderId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
        
        [HttpPost]
        [Route("api/Common/LogEvent")]
        public string LogEvent(EventLogModel eventModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.EventLogs.Add(new EventLog()
                    {
                        FolderId = eventModel.FolderId,
                        EventCode = eventModel.EventCode,
                        EventDetail = eventModel.EventDetail,
                        CalledFrom = eventModel.CalledFrom,
                        VisitorId = eventModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPost]
        public string LogActivity(ActivityLogModel activityLogModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ActivityLogs.Add(new ActivityLog()
                    {
                        ActivityCode = activityLogModel.ActivityCode,
                        FolderId = activityLogModel.FolderId,
                        VisitorId = activityLogModel.VisitorId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
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
        [Route("api/Common/GetErrorDetails")]
        public ErrorDetailSuccessModel GetErrorDetails(string errorCode, string visitorId)
        {
            var errorDetails = new ErrorDetailSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    errorDetails.Results = db.ErrorLogs.Where(e => e.ErrorCode == errorCode && e.VisitorId == visitorId).ToList();
                }
                errorDetails.Success = "ok";
            }
            catch (Exception ex)
            {
                errorDetails.Success = Helpers.ErrorDetails(ex);
            }
            return errorDetails;
        }

        [HttpGet]
        [Route("api/Common/GetEventDetails")]
        public EventDetailSuccessModel GetEventDetails(string eventCode, string visitorId)
        {
            var eventDetails = new EventDetailSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    eventDetails.Results = db.EventLogs.Where(e => e.EventCode == eventCode && e.VisitorId == visitorId).ToList();
                }
                eventDetails.Success = "ok";
            }
            catch (Exception ex)
            {
                eventDetails.Success = Helpers.ErrorDetails(ex);
            }
            return eventDetails;
        }

        [HttpPost]
        //[Route("api/Common/LogDataActivity")]
        public string LogDataActivity(DataActivityModel dataActivity)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ChangeLogs.Add(new MySqlDataContext.ChangeLog()
                    {
                        VisitorId = dataActivity.VisitorId,
                        FolderId = dataActivity.FolderId,
                        ActivityCode = dataActivity.ActivityCode,
                        Details = dataActivity.Details,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPost]
        [Route("api/Common/LogFeedback")]
        public string LogFeedback(FeedBackModel feedBackModel)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.FeedBacks.Add(new FeedBack()
                    {
                        PageId = feedBackModel.FolderId,
                        FeedBackComment = feedBackModel.FeedBackComment,
                        FeedBackType = feedBackModel.FeedBackType,
                        FeedBackEmail = feedBackModel.FeedBackEmail,
                        VisitorId = feedBackModel.VisitorId,
                        Occured = DateTime.Now
                    });
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
    }

    [EnableCors("*", "*", "*")]
    public class EntityAttributeController : ApiController
    {
        [HttpGet]
        [Route("api/EntityAttribute/GetRefs")]
        public RefSuccessModel GetRefs(string refType)
        {
            RefSuccessModel refs = new RefSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbRefs = db.Refs.Where(r => r.RefType == refType).ToList();
                    foreach (Ref dbRef in dbRefs)
                    {
                        refs.RefItems.Add(new RefItemModel()
                        {
                            RefCode = dbRef.RefCode,
                            RefType = dbRef.RefType,
                            RefDescription = dbRef.RefDescription
                        });
                    }
                    refs.Success = "ok";
                }
            }
            catch (Exception ex) { refs.Success = Helpers.ErrorDetails(ex); }
            return refs;
        }

    }
}
