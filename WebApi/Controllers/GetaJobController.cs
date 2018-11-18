﻿using System;
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
                    var dbJob = db.LostJobs.Where(j => j.Id == jobId).FirstOrDefault();
                    if (dbJob != null)
                    {
                        lostJob.Id = jobId;
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
            catch (Exception ex) { lostJob.Summary = "ERROR: "+ Helpers.ErrorDetails(ex); }
            return lostJob;
        }

        [HttpGet]
        public List<LostJobModel> Get()
        {
            var lostJobs = new List<LostJobModel>();
            using (GetaJobContext db = new GetaJobContext())
            {
                var dbJobs = db.LostJobs.ToList();
                foreach (LostJob lostjob in dbJobs)
                {
                    lostJobs.Add(new LostJobModel()
                    {
                        Id = lostjob.Id,
                        JobTitle = lostjob.JobTitle,
                        Employer = lostjob.Employer,
                        StartMonth = lostjob.StartMonth,
                        StartYear = lostjob.StartYear,
                        FiredMonth = lostjob.FiredMonth,
                        FiredYear = lostjob.FiredYear,
                        JobLocation = lostjob.JobLocation,
                        ReasonForLeaving = lostjob.ReasonForLeaving,
                        SecretNarative = lostjob.SecretNarative,
                        Summary = lostjob.Summary
                    });
                }
            }
            return lostJobs;
        }

        [HttpPost]
        public string Post(LostJob newJob)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    newJob.ElementId = Guid.NewGuid();
                    db.LostJobs.Add(newJob);
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
        public string Put(LostJobModel editedJob)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var job = db.LostJobs.Where(j => j.Id == editedJob.Id).FirstOrDefault();
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
                        skill.Id = skillId;
                        skill.SkillName = dbSkill.SkillName;
                        skill.SkillCategory = dbSkill.SkillCategory;
                        skill.GenericNarrative = dbSkill.GenericNarrative;
                    }
                }
            }
            catch (Exception ex) { skill.SkillName = "ERROR: " + Helpers.ErrorDetails(ex); }
            return skill;
        }

        [HttpGet]
        public List<SkillModel> Get()
        {
            var skillModels = new List<SkillModel>();
            try
            {
                using (var db = new GetaJobContext())
                {
                    skillModels =
                        (from skils in db.Skills
                         join crefs in db.Refs on skils.SkillCategory equals crefs.RefCode into sr
                         from xrefs in sr.DefaultIfEmpty()
                         select new SkillModel
                         {
                             Id = skils.Id,
                             SkillName = skils.SkillName,
                             SkillCategory = skils.SkillCategory,
                             SkillCategoryDescription = xrefs.RefDescription == null ? "" : xrefs.RefDescription,
                             GenericNarrative = skils.GenericNarrative
                         }).ToList();
                }
            }
            catch (Exception ex) { skillModels.Add(new SkillModel() { SkillName = Helpers.ErrorDetails(ex) }); }
            return skillModels;
        }

        [HttpPost]
        public string Post(Skill newSkill)
        {
            string success = "ERROR: ";
            try
            {
                if (newSkill.SkillName == null)
                    success = "bad data";
                else
                {
                    using (GetaJobContext db = new GetaJobContext())
                    {
                        db.Skills.Add(newSkill);
                        db.SaveChanges();
                        success = newSkill.Id.ToString();
                    }
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
        public SectionModel Get(int sectionId)
        {
            var section = new SectionModel();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var dbSection = db.Sections.Where(s => s.Id == sectionId).FirstOrDefault();
                    if (dbSection != null)
                    {
                        section.Id = sectionId;
                        section.PersonId = dbSection.PersonId;
                        section.SectionTitle = dbSection.SectionTitle;
                        section.SectionContents = dbSection.SectionContents;
                    }
                }
            }
            catch (Exception ex) { section.SectionTitle = "ERROR: " + Helpers.ErrorDetails(ex); }
            return section;
        }

        [HttpGet]
        public List<SectionModel> Get(string personId)
        {
            var sectionModels = new List<SectionModel>();
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    sectionModels =
                        (from sections in db.Sections
                         where (sections.PersonId == personId)
                         //join crefs in db.Refs on sections.SectionType equals crefs.RefCode into sr
                         //from xrefs in sr.DefaultIfEmpty()
                         select new SectionModel
                         {
                             Id = sections.Id,
                             SectionTitle = sections.SectionTitle,
                             //SectionType = sections.SectionType,
                             //SectionTypeDescription = xrefs.RefDescription == null ? "" : xrefs.RefDescription,
                         }).ToList();
                }
            }
            catch (Exception ex) { sectionModels.Add(new SectionModel() { SectionTitle = Helpers.ErrorDetails(ex) }); }
            return sectionModels;
        }

        [HttpPost]
        public string Post(SectionModel newSection)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    Section section = new Section();
                    section.ElementId = Guid.NewGuid();
                    section.PersonId = newSection.PersonId;
                    section.SectionTitle = newSection.SectionTitle;
                    //section.SectionType = "";
                    section.SectionContents = newSection.SectionContents;
                    db.Sections.Add(section);
                    db.SaveChanges();
                    success = section.Id.ToString();
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
            catch (Exception ex) { success += Helpers.ErrorDetails(ex); }
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
                    var Section = db.Sections.Where(j => j.Id == editedSection.Id).FirstOrDefault();
                    if (Section == null)
                        success = "record not found";
                    else
                    {
                        //Section.SectionType = editedSection.SectionType;
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

    [EnableCors("*", "*", "*")]
    public class ResumeController
    {
        [HttpGet]
        public Resume Get(int resumeId)
        {
            //var resume = new ResumeModel();
            //try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    //if (dbRresume != null)
                    //{
                    //    resume.Id = resumeId;
                    //    resume.ResumeName = dbRresume.ResumeName;
                    //    dbRresume..Id = resumeId;
                    //}

                    //var x = new Resume();
                    //x.ResumeElements. // Ienumeral

                    return db.Resumes.Where(r => r.Id == resumeId).FirstOrDefault();
                }
            }
            //catch (Exception ex) { lostJob.Summary = "ERROR: " + Helpers.ErrorDetails(ex); }
            //return resume;
        }

        [HttpPost]
        public string Post(Resume newResume)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    db.Resumes.Add(newResume);
                    db.SaveChanges();
                    success = newResume.Id.ToString();
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
        public string Put(ResumeModel resumeModel)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    Resume resume = db.Resumes.Where(r => r.Id == resumeModel.Id).FirstOrDefault();
                    if (resume != null)
                    {
                        resume.ResumeName = resumeModel.ResumeName;
                        db.SaveChanges();
                        success = "ok";
                    }
                    else
                        success = "Resume not found";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

    }

    [EnableCors("*", "*", "*")]
    public class ResumeElementController
    {
        [HttpGet]
        public List<ResumeElementModel> Get(int resumeId)
        {
            var resumeElements = new List<ResumeElementModel>();
            using (GetaJobContext db = new GetaJobContext())
            {
                var dbElements = db.ResumeElements.Where(e => e.ResumeId == resumeId).ToList(); ;
                foreach (ResumeElement element in dbElements)
                {
                    resumeElements.Add(new ResumeElementModel()
                    {
                        ElementId = element.ElementId.ToString(),
                        ElementType = element.ElementType,
                        SortOrder = element.SortOrder
                    });
                }
            }
            return resumeElements;
        }

        [HttpPost]
        public string Post(ResumeElementModel elementModel)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var resumeElement = new ResumeElement();
                    resumeElement.ElementId = Guid.NewGuid();
                    resumeElement.ResumeId = elementModel.ResumeId;
                    resumeElement.ElementType = elementModel.ElementType;
                    resumeElement.SortOrder = elementModel.SortOrder;
                    db.ResumeElements.Add(resumeElement);
                    db.SaveChanges();
                    success = resumeElement.ElementId.ToString();
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
        public string Put(ResumeElementModel editedElement)
        {
            string success = "";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var element = db.ResumeElements.Where(e => e.ElementId.ToString() == editedElement.ElementId).FirstOrDefault();
                    if (element == null)
                        success = "record not found";
                    else
                    {
                        element.ResumeId = editedElement.ResumeId;
                        element.ElementType = editedElement.ElementType;
                        element.SortOrder = editedElement.SortOrder;
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
    public class GAJRefController : ApiController
    {
        [HttpGet]
        public List<RefModel> Get(string refType)
        {
            var refs = new List<RefModel>();
            try
            {
                using (var db = new GetaJobContext())
                {
                    IList<gajRef> dbrefs = db.Refs.Where(r => r.RefType == refType).OrderBy(r => r.RefDescription).ToList();
                    foreach (gajRef r in dbrefs)
                    {
                        refs.Add(new RefModel() { RefCode = r.RefCode, RefDescription = r.RefDescription });
                    }
                }
            }
            catch (Exception ex)
            {
                refs.Add(new RefModel() { RefCode = "ERR", RefType = "ERR", RefDescription = Helpers.ErrorDetails(ex) });
            }
            return refs;
        }

        [HttpPost]
        public RefModel Post(RefModel refModel)
        {
            try
            {
                using (var db = new GetaJobContext())
                {
                    var @ref = new gajRef();
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
            return refModel;
        }

        [HttpPut]
        public string Put(RefModel refModel)
        {
            string success = "";
            try
            {
                using (var db = new GetaJobContext())
                {
                    gajRef @ref = db.Refs.Where(r => r.RefCode == refModel.RefCode).First();
                    @ref.RefDescription = refModel.RefDescription;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = ex.Message; }
            return success;
        }

        /// helper apps
        private string GetUniqueRefCode(string refDescription, GetaJobContext db)
        {
            if (refDescription.Length < 3)
                refDescription = refDescription.PadRight(3, 'A');

            var refCode = refDescription.Substring(0, 3).ToUpper();
            gajRef exists = new gajRef();
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


}
