using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web.Http;
using WebApi.Models;

namespace WebApi
{
    [System.Web.Http.Cors.EnableCors("*", "*", "*")]
    public class HitCounterController : ApiController
    {
        [HttpGet]
        public bool Verify(string ipAddress, string app)
        {
            bool exists = false;
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    VisitorModel visitor = (from visitors in db.Visitors
                                            where visitors.IPAddress == ipAddress && visitors.App == app
                                            select new VisitorModel() { IPAddress = visitors.IPAddress }).FirstOrDefault();
                    if (visitor != null)
                        exists = true;
                }
            }
            catch (Exception ex) { throw new Exception(ex.Message, ex.InnerException); }
            return exists;
        }

        [HttpGet]
        public string AddVisitor(string ipAddress, string app, string userId)
        {
            string success= "ohno";
            try
            {
                //var ipAddress = System.Text.Encoding.UTF32.GetString(bytes);
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    success = SendEmail(app, ipAddress);
                    if (success == "ok")
                    {
                        Visitor visitor = new Visitor();
                        visitor.App = app;
                        visitor.IPAddress = ipAddress;
                        visitor.VisitDate = DateTime.Now;
                        db.Visitors.Add(visitor);
                        db.SaveChanges();
                    }
                }
            }
            catch (DbEntityValidationException ve)
            {
                success = "ERROR: ";
                foreach (DbEntityValidationResult e in ve.EntityValidationErrors)
                {
                    foreach (var eve in ve.EntityValidationErrors)
                    {
                        //Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
                        success += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
                        foreach (var dbe in eve.ValidationErrors)
                        {
                            //Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
                            success += string.Format("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
                        }
                    }
                }
            }
            //catch (System.Data.SqlClient.SqlErrorCollection. eee)
            //{ }
            catch (Exception ex)
            {
                success = "ERROR: "+ ex.Message;
            }
            return success;
        }

        [HttpGet]
        public string AddPageHit(string ipAddress, string app, string page, string details)
        {
            string success = "ERROR: ohno";
            try
            {
                //var ipAddress = System.Text.Encoding.UTF32.GetString(bytes);
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Hit hit = new Hit();
                    hit.IPAddress = ipAddress;
                    hit.App = app;
                    hit.BeginView = DateTime.Now;
                    hit.PageName = page;
                    hit.Details = details;
                    db.Hits.Add(hit);
                    db.SaveChanges();

                    success = hit.Id.ToString();
                }
            }
            catch (DbEntityValidationException ve)
            {
                foreach (DbEntityValidationResult e in ve.EntityValidationErrors)
                {
                    foreach (var eve in ve.EntityValidationErrors)
                    {
                        //Console.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
                        success += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
                        foreach (var dbe in eve.ValidationErrors)
                        {
                            //Console.WriteLine("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
                            success += string.Format("- Property: \"{0}\", Error: \"{1}\"", dbe.PropertyName, dbe.ErrorMessage);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                success = "ERROR: " + ex.Message;
            }
            return success;
        }

        [HttpGet]
        public string EndVisit(int hitId)
        {
            var success = "on no";
            try
            {
                using (GoDaddyContext db = new GoDaddyContext())
                {
                    Hit hit = db.Hits.Where(h => h.Id == hitId).First();
                    hit.ViewDuration = (DateTime.Now - hit.BeginView).Value.TotalSeconds.ToString();
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


        private string SendEmail(string app, string ip)
        {
            string success = "onno";
            try
            {
                SmtpClient smtp = new SmtpClient("relay-hosting.secureserver.net", 25);

                //SmtpClient smtp = new SmtpClient("smtpout.secureserver.net");

                MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "Curtishrhodes@hotmail.com");
                mailMessage.Subject = "HOLY SHIT someone just visited your site";
                mailMessage.Body = "ip: " + ip + " visited: " + app;

                smtp.Send(mailMessage);
                success = "ok";
            }
            catch (Exception e)
            {
                success = "ERROR: " + e.Message;
            }
            return success;
        }

        [HttpGet]
        public string EmailTest()
        {
            string success = "onno";
            try
            {
                SmtpClient smtp = new SmtpClient();
                smtp.Host = "relay-hosting.secureserver.net";
                smtp.Port = 25;

                MailMessage mailMessage = new MailMessage("info@curtisrhodes.com", "Curtishrhodes@hotmail.com");
                mailMessage.Subject = "SendMail Test";
                mailMessage.Body = "someday we will be able to know when someone just visited your site";

                smtp.Send(mailMessage);
                success = "ok";
            }
            catch (Exception e)
            {
                success = "ERROR: " + e.Message;
                if (e.InnerException != null)
                {
                    success += " :" + e.InnerException.Message;
                    if (e.InnerException.InnerException != null)
                        success += " :" + e.InnerException.InnerException.Message;
                }
            }
            return success;
        }

    }
}
