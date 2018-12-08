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
        public List<LostJobModel> Get(string personId)
        {
            var lostJobs = new List<LostJobModel>();
            using (GetaJobContext db = new GetaJobContext())
            {
                var dbJobs = db.LostJobs.Where(j => j.PersonId == personId).OrderByDescending(j => j.StartYear).ThenByDescending(j => j.StartMonth).ToList();
                foreach (LostJob lostjob in dbJobs)
                {
                    lostJobs.Add(new LostJobModel()
                    {
                        Id = lostjob.Id,
                        ElementId = lostjob.ElementId.ToString(),
                        JobTitle = lostjob.JobTitle,
                        Employer = lostjob.Employer,
                        StartMonth = Helpers.DateName(lostjob.StartMonth),
                        StartYear = lostjob.StartYear,
                        FiredMonth = Helpers.DateName( lostjob.FiredMonth),
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
                             ElementId = sections.ElementId.ToString(),
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
    public class ResumeController : ApiController
    {
        [HttpGet]
        public List<ResumeModel> Get(string personId)
        {
            var rm = new List<ResumeModel>();
            using (GetaJobContext db = new GetaJobContext())
            {
                var dbResumes = db.Resumes.Where(r => r.PersonId == personId).ToList();
                foreach (Resume dbResume in dbResumes)
                {
                    rm.Add(new ResumeModel() { Id = dbResume.Id, ResumeName = dbResume.ResumeName, Created = dbResume.Created.Value.ToShortDateString() });
                }
            }
            return rm;
        }

        [HttpPatch]
        public ResumeModel GetLoadedResume(int resumeId)
        {
            var fullyLoadedResume = new ResumeModel();
            fullyLoadedResume.Id = resumeId;
            using (GetaJobContext db = new GetaJobContext())
            {
                var dbResume = db.Resumes.Where(r => r.Id == resumeId).FirstOrDefault();
                fullyLoadedResume.ResumeName = dbResume.ResumeName;

                fullyLoadedResume.TopSections = (from e in dbResume.ResumeElements.Where(e => e.ElementType == "1")
                                                 join dbSections in db.Sections on e.ElementId equals dbSections.ElementId
                                                 orderby e.SortOrder
                                                 select new SectionModel()
                                                 {
                                                     SortOrder = e.SortOrder,
                                                     ElementId = e.ElementId.ToString(),
                                                     SectionTitle = dbSections.SectionTitle,
                                                     SectionContents = dbSections.SectionContents
                                                 }).ToList();
                fullyLoadedResume.LostJobs = (from e in dbResume.ResumeElements.Where(e => e.ElementType == "2")
                                              join dbJob in db.LostJobs on e.ElementId equals dbJob.ElementId
                                              orderby e.SortOrder
                                              select new LostJobModel()
                                              {
                                                  SortOrder = e.SortOrder,
                                                  Id = dbJob.Id,
                                                  ElementId = dbJob.ElementId.ToString(),
                                                  Employer = dbJob.Employer,
                                                  JobLocation = dbJob.JobLocation,
                                                  StartMonth = Helpers.DateName(dbJob.StartMonth),
                                                  StartYear = dbJob.StartYear,
                                                  FiredMonth = Helpers.DateName(dbJob.FiredMonth),
                                                  FiredYear = dbJob.FiredYear,
                                                  JobTitle = dbJob.JobTitle,
                                                  Summary = dbJob.Summary
                                              }).ToList();
                fullyLoadedResume.BottomSections = (from e in dbResume.ResumeElements.Where(e => e.ElementType == "3")
                                                    join dbSections in db.Sections on e.ElementId equals dbSections.ElementId
                                                    orderby e.SortOrder
                                                    select new SectionModel()
                                                    {
                                                        SortOrder = e.SortOrder,
                                                        ElementId = e.ElementId.ToString(),
                                                        SectionTitle = dbSections.SectionTitle,
                                                        SectionContents = dbSections.SectionContents
                                                    }).ToList();
            }
            return fullyLoadedResume;
        }

        [HttpGet]
        public Resume Get(int resumeId)
        {
            using (GetaJobContext db = new GetaJobContext())
            {
                return db.Resumes.Where(r => r.Id == resumeId).FirstOrDefault();
            }
        }

        [HttpPost]
        public string Post(ResumeModel newResume)
        {
            string success = "ERROR: ";
            try
            {
                using (GetaJobContext db = new GetaJobContext())
                {
                    var r = new Resume();
                    r.ResumeName = newResume.ResumeName;
                    r.Created = DateTime.Now;
                    r.PersonId = newResume.PersonId;

                    db.Resumes.Add(r);
                    db.SaveChanges();
                    success = r.Id.ToString();
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
    public class ResumeElementController : ApiController
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
                    var m = new ResumeElementModel();
                    if (element.ElementType == "2")
                        m.ElementName = db.LostJobs.Where(j => j.ElementId == element.ElementId).FirstOrDefault().Employer;
                    else
                        m.ElementName = db.Sections.Where(s => s.ElementId == element.ElementId).FirstOrDefault().SectionTitle;
                    m.ElementId = element.ElementId.ToString();
                    m.ElementType = element.ElementType;
                    m.SortOrder = element.SortOrder;
                    resumeElements.Add(m);
                }
            }
            return resumeElements.OrderBy(r => r.ElementType).ThenBy(r => r.SortOrder).ToList();
        }

        [HttpGet]
        public List<ResumeElementModel> GetAvailable(string personId, int resumeId)
        {
            List<ResumeElementModel> availableElements = new List<ResumeElementModel>();
            using (GetaJobContext db = new GetaJobContext())
            {
                List<Guid> selectedElements = db.ResumeElements.Where(e => e.ResumeId == resumeId).Select(e => e.ElementId).ToList();

                List<Guid> availableJobElementIds = db.LostJobs.Where(j => j.PersonId == personId).Select(j => j.ElementId).Except(selectedElements).ToList();
                availableElements = (from jobs in db.LostJobs
                                     where availableJobElementIds.Contains(jobs.ElementId)
                                     select new ResumeElementModel()
                                     {
                                         ElementId = jobs.ElementId.ToString(),
                                         ElementName = jobs.Employer,
                                         ElementType = "JOB"
                                     }).ToList();

                var availableResumeSectionElemenIds = db.Sections.Where(s => s.PersonId == personId).Select(s => s.ElementId).Except(selectedElements).ToList();
                var availableSections = (from sections in db.Sections
                                         where availableResumeSectionElemenIds.Contains(sections.ElementId)
                                         select new ResumeElementModel()
                                         {
                                             ElementId = sections.ElementId.ToString(),
                                             ElementName = sections.SectionTitle,
                                             ElementType = "SEC"
                                         }).ToList();

                availableElements = availableElements.Concat(availableSections).ToList();
            }
            return availableElements.OrderByDescending(r => r.ElementType).ToList();
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
                    resumeElement.ElementId = Guid.Parse(elementModel.ElementId);
                    resumeElement.ResumeId = elementModel.ResumeId;
                    resumeElement.ElementType = elementModel.ElementType;
                    resumeElement.SortOrder = elementModel.SortOrder;
                    db.ResumeElements.Add(resumeElement);
                    db.SaveChanges();
                    success = "ok";
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
                    var element = db.ResumeElements.Where(e => e.ElementId.ToString() == editedElement.ElementId && e.ResumeId == editedElement.ResumeId).FirstOrDefault();
                    if (element == null)
                        success = "record not found";
                    else
                    {
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
