using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using WebApi.Models;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class RefController : ApiController
    {
        [HttpGet]
        public IList<Ref> Get(string refType)
        {
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    return db.Refs.Where(r => r.RefType == refType).OrderBy(r => r.RefDescription).ToList();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex.InnerException);
            }
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
                    @ref.RefCode = GetUniqueRefCode(refModel.RefDescription);
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
        public string Put(RefModel refModel)
        {
            string success = "ono";
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
            return success;
        }

        /// helper apps
        private string GetUniqueRefCode(string refDescription)
        {
            var refCode = refDescription.Substring(0, 3).ToUpper();
            ///todo: test for existing. go into newkey loop
            return refCode;
        }
    }

    [EnableCors("*", "*", "*")]
    public class CommentsController : ApiController
    {
        // GET: api/Comments
        public IQueryable<CommentsModel> Get(Guid articleId)
        {
            IQueryable<CommentsModel> results = Enumerable.Empty<CommentsModel>().AsQueryable();
            try
            {
                //string ARTICLEID = articleId.ToString().ToUpper();
                using (WebSiteContext db = new WebSiteContext())
                {
                    using (AspNetContext dbn = new AspNetContext())
                    {
                        results = (from comments in db.Comments
                                   join users in dbn.AspNetUsers on comments.UserId.ToString() equals users.Id
                                   where comments.ArticleId.ToString() == articleId.ToString().ToUpper()
                                   orderby comments.CreateDate ascending
                                   select new CommentsModel
                                   {
                                       UserName = users.UserName,
                                       CreateDate = comments.CreateDate,
                                       CommentTitle = comments.CommentTitle,
                                       CommentText = comments.CommentText
                                   }).ToList().AsQueryable();
                    }
                }
            }
            catch (Exception ex)
            {
                results = results.Concat(new[] { new CommentsModel() { Success = ex.Message } });
            }
            return results;
        }

        [HttpPost]
        public string Post(Comment newComment)
        {
            string success = "ERROR: oh no";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    newComment.CreateDate = DateTime.Now;
                    db.Comments.Add(newComment);
                    db.SaveChanges();
                    success = newComment.CommentId.ToString();
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + ex.Message;
            }
            return success;
        }

        [HttpPut]
        public string Put(Comment updateComment)
        {
            string success = "oh no";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Comment comment = db.Comments.Where(c => c.CommentId == updateComment.CommentId).First();
                    comment.CommentText = updateComment.CommentText;
                    comment.CommentTitle = updateComment.CommentTitle;

                    db.SaveChanges();
                    success = comment.CommentId.ToString();
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + ex.Message;
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpGet]
        public string LogVisit(string ipAddress, string app)
        {
            string rtn = "";
            try
            {
                string emailSuccess = "";
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
                        emailSuccess = Helpers.SendEmail("CONGRATULATIONS: someone just visited your site", "ip: " + ipAddress + " visited: " + app);
                        if (emailSuccess != "ok")
                            rtn = "true but " + emailSuccess;
                    }
                    else
                    {
                        rtn = "true";
                        // add  Vist
                        Visit visit = new Visit();
                        visit.IPAddress = ipAddress;
                        visit.App = app;
                        visit.VisitDate = DateTime.Now;

                        db.Visits.Add(visit);
                        db.SaveChanges();

                        if (ipAddress != "50.62.160.105")  // could be something at Godaddy
                        {
                            emailSuccess = Helpers.SendEmail("Site Visit", "ip: " + ipAddress + " visited: " + app);
                            if (emailSuccess != "ok")
                                rtn = "true but " + emailSuccess;
                        }
                    }
                }
            }
            catch (Exception ex) {

                rtn = Helpers.ErrorDetails(ex);
            }
            return rtn;
        }

        [HttpGet]
        public string AddPageHit(string ipAddress, string app, string page, string details)
        {
            string success = "ERROR: ohno";
            try
            {
                //var ipAddress = System.Text.Encoding.UTF32.GetString(bytes);
                using (WebSiteContext db = new WebSiteContext())
                {
                    Hit hit = new Hit();
                    hit.IPAddress = ipAddress;
                    hit.App = app;
                    hit.BeginView = DateTime.Now;
                    hit.PageName = page;
                    hit.Details = details;
                    db.Hits.Add(hit);
                    db.SaveChanges();

                    success = Helpers.SendEmail("Page Hit", "ip: " + ipAddress + " visited: " + app + " :" + details);
                    //success = hit.HitId.ToString();
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
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

    public class Helpers
    {
        public static string ErrorDetails(Exception ex)
        {
            var exceptionType = ex.GetBaseException();
            string msg = "ERROR: " + ex.Message;
            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
                msg = ex.Message;

            }
            //if(ex.GetBaseException)
            //msg + 
            //catch (DbEntityValidationException ve)
            //{
            //    success = "ERROR: ";
            //    foreach (DbEntityValidationResult e in ve.EntityValidationErrors)
            //    {
            //        foreach (var eve in ve.EntityValidationErrors)
            //        {
            //            //Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
            //            success += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
            //            foreach (var dbe in eve.ValidationErrors)
            //            {
            //                //Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
            //                success += string.Format("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
            //            }
            //        }
            //    }
            //}
            ////catch (System.Data.SqlClient.SqlErrorCollection. eee)
            //{ }

            return msg;
        }

        public static string SendEmail(string subjectLine, string message)
        {
            string success = "";
            try
            {
                SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25);
                MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "Curtishrhodes@hotmail.com");
                mailMessage.Subject = subjectLine;
                mailMessage.Body = message;
                smtp.Send(mailMessage);
                success = "ok";
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }

    }
}



