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
        public LostJobModel Get(int jobId)
        {
            var lostJob = new LostJobModel();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbJob = db.Jobs.Where(j => j.Id == jobId).FirstOrDefault();
                    if (dbJob != null)
                    {
                        lostJob.Id = jobId.ToString();
                        lostJob.Employer = dbJob.Employer;
                        lostJob.JobLocation = dbJob.JobLocation;
                        lostJob.StartMonth = dbJob.StartMonth;
                        lostJob.StartYear = dbJob.StartYear;
                        lostJob.FiredMonth = dbJob.FiredMonth;
                        lostJob.FiredYear = dbJob.FiredYear;
                        lostJob.JobTitle = dbJob.JobTitle;
                        lostJob.Summary = dbJob.Summary;
                        lostJob.SecretNarative = dbJob.SecretNarative;
                        lostJob.ReasonForLeaving = dbJob.ReasonForLeaving;
                    }
                }
            }
            catch (Exception ex) { lostJob.Id = "ERROR: "+ Helpers.ErrorDetails(ex); }
            return lostJob;
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
                        Id = lostjob.Id.ToString(),
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

                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class SkillController : ApiController
    {
        [HttpGet]
        public SkillModel Get(int skillId)
        {
            var skill = new SkillModel();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbSkill = db.Skills.Where(s => s.Id == skillId).FirstOrDefault();
                    if (dbSkill != null)
                    {
                        skill.Id = skillId.ToString();
                        skill.SkillName = dbSkill.SkillName;
                        skill.SkillCategory = dbSkill.SkillCategory;
                    }
                }
            }
            catch (Exception ex) { skill.Id = "ERROR: " + Helpers.ErrorDetails(ex); }
            return skill;
        }

        [HttpGet]
        public List<SkillModel> Get()
        {
            var skills = new List<SkillModel>();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbSkills = db.Skills;
                    foreach (Skill _skill in dbSkills)
                    {
                        skills.Add(new SkillModel() { Id = _skill.Id.ToString(), SkillName = _skill.SkillName, SkillCategory = _skill.SkillCategory });
                    }
                }
            }
            catch (Exception ex) { skills.Add(new SkillModel() { Id = Helpers.ErrorDetails(ex) }); }
            return skills;
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

                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class SectionController : ApiController
    {
        [HttpGet]
        public SectionModel Get(int SectionId)
        {
            var Section = new SectionModel();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbSection = db.ResumeSections.Where(s => s.Id == SectionId).FirstOrDefault();
                    if (dbSection != null)
                    {
                        Section.Id = SectionId;
                        Section.SectionName = dbSection.SectionName;
                        Section.SectionTitle = dbSection.SectionTitle;
                        Section.SectionContents = dbSection.SectionContents;
                    }
                }
            }
            catch (Exception ex) { Section.SectionName = "ERROR: " + Helpers.ErrorDetails(ex); }
            return Section;
        }

        [HttpGet]
        public List<SectionModel> Get()
        {
            var Sections = new List<SectionModel>();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbSections = db.ResumeSections;
                    foreach (ResumeSection _Section in dbSections)
                    {
                        Sections.Add(new SectionModel() {
                            Id = _Section.Id,
                            SectionName = _Section.SectionName,
                            SectionTitle = _Section.SectionTitle,
                            SectionContents=_Section.SectionContents
                        });
                    }
                }
            }
            catch (Exception ex) { Sections.Add(new SectionModel() {  SectionTitle = Helpers.ErrorDetails(ex) }); }
            return Sections;
        }

        [HttpPost]
        public string Post(SectionModel newSection)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    ResumeSection resumeSection = new ResumeSection();
                    resumeSection.SectionTitle = newSection.SectionTitle;
                    resumeSection.SectionName = newSection.SectionName;
                    resumeSection.SectionContents = newSection.SectionContents;
                    db.ResumeSections.Add(resumeSection);
                    db.SaveChanges();
                    success = newSection.Id.ToString();
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
        public string Put(SectionModel editedSection)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var Section = db.ResumeSections.Where(j => j.Id == editedSection.Id).FirstOrDefault();
                    if (Section == null)
                        success = "record not found";
                    else
                    {
                        Section.SectionName = editedSection.SectionName;
                        Section.SectionTitle = editedSection.SectionTitle;
                        Section.SectionContents = editedSection.SectionContents;

                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

}
