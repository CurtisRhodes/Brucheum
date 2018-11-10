using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class JobController : ApiController
    {
        [HttpGet]
        public Job Get(int jobId)
        {
            using (GetaJobContext db = new GetaJobContext())
            {
                return db.Jobs.Where(j => j.Id == jobId).FirstOrDefault();
            }
        }

        [HttpGet]
        public List<LostJobModel> Get()
        {
            var lostJobs = new List<LostJobModel>();
            using (GetaJobContext db = new GetaJobContext())
            {
                var dbJobs = db.Jobs;
                foreach (Job lostjob in dbJobs)
                {
                    lostJobs.Add(new LostJobModel()
                    {
                        JobId = lostjob.Id.ToString(),
                        JobTitle = lostjob.JobTitle,
                        Employer = lostjob.Employer,
                        StartMonth=lostjob.StartMonth,
                        StartYear=lostjob.StartYear,
                        FiredMonth=lostjob.FiredMonth,
                        FiredYear=lostjob.FiredYear,
                        JobLocation=lostjob.JobLocation,
                        ReasonForLeaving=lostjob.ReasonForLeaving,
                        SecretNarative=lostjob.SecretNarative,
                        Summary=lostjob.Summary
                    });
                }
            }
            return lostJobs;
        }

        [HttpPost]
        public string Post(Job newJob)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    db.Jobs.Add(newJob);
                    db.SaveChanges();
                    success = newJob.Id.ToString();
                }
            }
            catch (DbEntityValidationException e)
            {
                foreach (var eve in e.EntityValidationErrors)
                {
                    success += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var ve in eve.ValidationErrors)
                    {
                        success += string.Format("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage);
                    }
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(Job editedJob)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var job = db.Jobs.Where(j => j.Id == editedJob.Id).FirstOrDefault();
                    if (job == null)
                        success = "record not found";
                    else
                    {
                        job.StartMonth = editedJob.StartMonth;
                        job.StartYear = editedJob.StartYear;
                        job.FiredMonth = editedJob.FiredMonth;
                        job.FiredYear = editedJob.FiredYear;
                        job.JobTitle = editedJob.JobTitle;
                        job.Employer = editedJob.Employer;
                        job.JobLocation = editedJob.JobLocation;
                        job.Summary = editedJob.Summary;
                        job.ReasonForLeaving = editedJob.ReasonForLeaving;
                        job.SecretNarative = editedJob.SecretNarative;
                    }
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class SkillsController : ApiController
    {
        [HttpGet]
        public Skill Get(int skillId)
        {
            using (GetaJobContext db = new GetaJobContext())
            {
                return db.Skills.Where(s => s.Id == skillId).FirstOrDefault();
            }
        }

        [HttpGet]
        public List<Skill> Get()
        {
            using (GetaJobContext db = new GetaJobContext())
            {
                return db.Skills.ToList();
            }
        }

        [HttpPost]
        public string Post(Skill newSkill)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    db.Skills.Add(newSkill);
                    db.SaveChanges();
                    success = newSkill.Id.ToString();
                }
            }
            catch (DbEntityValidationException e)
            {
                foreach (var eve in e.EntityValidationErrors)
                {
                    success += string.Format("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:", eve.Entry.Entity.GetType().Name, eve.Entry.State);
                    foreach (var ve in eve.ValidationErrors)
                    {
                        success += string.Format("- Property: \"{0}\", Error: \"{1}\"",
                            ve.PropertyName, ve.ErrorMessage);
                    }
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(Skill editedSkill)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var skill = db.Skills.Where(j => j.Id == editedSkill.Id).FirstOrDefault();
                    if (skill == null)
                        success = "record not found";
                    else
                    {
                        skill.SkillName = editedSkill.SkillName;
                        skill.SkillCategory = editedSkill.SkillCategory;
                    }
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

}
