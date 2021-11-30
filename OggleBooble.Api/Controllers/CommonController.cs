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
                    Visitor dbVisitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                    if (dbVisitor == null)
                    {
                        pageHitSuccessModel.ReturnMessage = "VisitorId not found";
                    }
                    else
                    {
                        pageHitSuccessModel.VisitorCountry = dbVisitor.Country;
                        PageHit lastHit = null;
                        var pageHits = db.PageHits.Where(h => h.VisitorId == visitorId).FirstOrDefault();
                        if (pageHits == null)
                        {
                            lastHit = null;
                            pageHitSuccessModel.PageHits = 1;
                        }
                        else
                        {
                            var threeMinutesAgo = DateTime.Now.AddMinutes(-3);
                            lastHit = db.PageHits.Where(h => h.VisitorId == visitorId && h.PageId == folderId && h.Occured > threeMinutesAgo).FirstOrDefault();
                            pageHitSuccessModel.PageHits = db.PageHits.Where(h => h.VisitorId == visitorId && h.PageId == folderId).Count();
                        }
                        if (lastHit == null)
                        {
                            db.PageHits.Add(new PageHit()
                            {
                                VisitorId = visitorId,
                                PageId = folderId,
                                Occured = DateTime.Now
                            });
                            db.SaveChanges();
                            pageHitSuccessModel.ReturnMessage = "ok";
                        }
                        else
                        {
                            pageHitSuccessModel.ReturnMessage = "duplicate hit";
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
                        Occured = DateTime.Now,
                        OccuredDay = DateTime.Today
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

                    // "smtp.office365.com, 587"










                    smtpClient.Send(mailMessage);
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
        [Route("api/Common/VerifyConnection")]
        [EnableCors("*", "*", "*")]
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
                        CalledFrom = activityLogModel.CalledFrom,
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
        public FeedBackSuccessModel LogFeedback(FeedBackModel feedBackModel)
        {
            var feedbackSuccess = new FeedBackSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    //feedbackSuccess.FolderName = db.CategoryFolders.Where(f => f.Id == feedBackModel.FolderId).Select(f => f.FolderName).FirstOrDefault();
                    Visitor feedbackVisitor = db.Visitors.Where(v => v.VisitorId == feedBackModel.VisitorId).FirstOrDefault();
                    string visitorInfo = feedBackModel.VisitorId;
                    if (feedbackVisitor != null)
                    {
                        RegisteredUser registeredUser = db.RegisteredUsers.Where(r => r.VisitorId == feedBackModel.VisitorId).FirstOrDefault();
                        if (registeredUser != null)
                            visitorInfo = registeredUser.UserName;
                        else
                            visitorInfo = feedbackVisitor.City + ", " + feedbackVisitor.Region + ", " + feedbackVisitor.Region;
                    }

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
                    feedbackSuccess.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                feedbackSuccess.Success = Helpers.ErrorDetails(ex);
            }
            return feedbackSuccess;
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
