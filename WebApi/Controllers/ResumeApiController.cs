using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Resume.DataContext;
using WebApi.Resume.Models;

namespace WebApi.Resume
{
    [EnableCors("*", "*", "*")]
    public class LostJobController : ApiController
    {
        [HttpGet]
        public LostJobModel Get(string jobId)
        {
            var lostJob = new LostJobModel();
            try
            {
                using (var db = new Resume.DataContext.ResumeContext())
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
            catch (Exception ex) { lostJob.Summary = Helpers.ErrorDetails(ex); }
            return lostJob;
        }

        [HttpGet]
        public List<LostJobModel> ManyGet(string personId)
        {
            var lostJobs = new List<LostJobModel>();
            using (var db = new ResumeContext())
            {
                var dbJobs = db.LostJobs.Where(j => j.PersonId == personId).OrderByDescending(j => j.StartYear).ThenByDescending(j => j.StartMonth).ToList();
                foreach (LostJob lostjob in dbJobs)
                {
                    lostJobs.Add(new LostJobModel()
                    {
                        Id = lostjob.Id,
                        ElementId = lostjob.Id,
                        JobTitle = lostjob.JobTitle,
                        Employer = lostjob.Employer,
                        StartMonth = Helpers.DateName(lostjob.StartMonth),
                        StartYear = lostjob.StartYear,
                        FiredMonth = Helpers.DateName(lostjob.FiredMonth),
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
        public string Post(Resume.DataContext.LostJob newJob)
        {
            string success = "";
            try
            {
                using (var db = new ResumeContext())
                {
                    newJob.Id = Guid.NewGuid().ToString();
                    db.LostJobs.Add(newJob);
                    db.SaveChanges();
                    success = newJob.Id.ToString();
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(LostJobModel editedJob)
        {
            string success = "";
            try
            {
                using (var db = new ResumeContext())
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
    public class ResumeSectionController : ApiController
    {
        [HttpGet]
        public ResumeSectionModel Get(string sectionId)
        {
            var section = new ResumeSectionModel();
            try
            {
                using (var db = new ResumeContext())
                {
                    var dbSection = db.ResumeSections.Where(s => s.Id == sectionId).FirstOrDefault();
                    if (dbSection != null)
                    {
                        section.Id = sectionId;
                        section.PersonId = dbSection.PersonId;
                        section.SectionTitle = dbSection.SectionTitle;
                        section.SectionContents = dbSection.SectionContents;
                    }
                }
            }
            catch (Exception ex) { section.SectionTitle = Helpers.ErrorDetails(ex); }
            return section;
        }

        [HttpGet]
        public List<ResumeSectionModel> GetMany(string personId)
        {
            var resumeSectionModels = new List<ResumeSectionModel>();
            try
            {
                using (var db = new ResumeContext())
                {
                    resumeSectionModels =
                        (from sections in db.ResumeSections
                         where (sections.PersonId == personId)
                         //join crefs in db.Refs on sections.SectionType equals crefs.RefCode into sr
                         //from xrefs in sr.DefaultIfEmpty()
                         select new ResumeSectionModel
                         {
                             Id = sections.Id,
                             SectionTitle = sections.SectionTitle,
                             //SectionType = sections.SectionType,
                             //SectionTypeDescription = xrefs.RefDescription == null ? "" : xrefs.RefDescription,
                         }).ToList();
                }
            }
            catch (Exception ex) { resumeSectionModels.Add(new ResumeSectionModel() { SectionTitle = Helpers.ErrorDetails(ex) }); }
            return resumeSectionModels;
        }

        [HttpPost]
        public string Post(ResumeSectionModel newSection)
        {
            string success = "ERROR: ";
            try
            {
                ResumeSection section = new ResumeSection();
                section.Id = Guid.NewGuid().ToString();
                section.PersonId = newSection.PersonId;
                section.SectionTitle = newSection.SectionTitle;
                //section.SectionType = "";
                section.SectionContents = newSection.SectionContents;
                using (var db = new ResumeContext())
                {
                    db.ResumeSections.Add(section);
                    db.SaveChanges();
                    success = section.Id.ToString();
                }
            }
            catch (Exception ex) { success += Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(ResumeSectionModel editedSection)
        {
            string success = "";
            try
            {
                using (var db = new ResumeContext())
                {
                    var Section = db.ResumeSections.Where(j => j.Id == editedSection.Id).FirstOrDefault();
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
            using (var db = new ResumeContext())
            {
                var dbResumes = db.Resumes.Where(r => r.PersonId == personId).ToList();
                foreach ( DataContext.Resume dbResume in dbResumes)
                {
                    rm.Add(new ResumeModel() { Id = dbResume.Id, ResumeName = dbResume.ResumeName, Created = dbResume.Created.ToShortDateString() });
                }
            }
            return rm;
        }

        [HttpPatch]
        public ResumeModel GetLoadedResume(string resumeId)
        {
            var fullyLoadedResume = new ResumeModel();
            fullyLoadedResume.Id = resumeId;
            using (var db = new ResumeContext())
            {
                var dbResume = db.Resumes.Where(r => r.Id == resumeId).FirstOrDefault();
                fullyLoadedResume.ResumeName = dbResume.ResumeName;

                fullyLoadedResume.TopSections = (from e in dbResume.ResumeElements.Where(e => e.ElementType == "1")
                                                 join dbSections in db.ResumeSections on e.ElementId equals dbSections.Id
                                                 orderby e.SortOrder
                                                 select new ResumeSectionModel()
                                                 {
                                                     SortOrder = e.SortOrder,
                                                     Id = e.ElementId,
                                                     SectionTitle = dbSections.SectionTitle,
                                                     SectionContents = dbSections.SectionContents
                                                 }).ToList();
                fullyLoadedResume.LostJobs = (from e in dbResume.ResumeElements.Where(e => e.ElementType == "2")
                                              join dbJob in db.LostJobs on e.ElementId equals dbJob.Id
                                              orderby e.SortOrder
                                              select new LostJobModel()
                                              {
                                                  SortOrder = e.SortOrder,
                                                  ElementId = dbJob.Id,
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
                                                    join dbResumeSections in db.ResumeSections on e.ElementId equals dbResumeSections.Id
                                                    orderby e.SortOrder
                                                    select new ResumeSectionModel()
                                                    {
                                                        SortOrder = e.SortOrder,
                                                        Id = e.ElementId,
                                                        SectionTitle = dbResumeSections.SectionTitle,
                                                        SectionContents = dbResumeSections.SectionContents
                                                    }).ToList();
            }
            return fullyLoadedResume;
        }

        [HttpGet]
        public DataContext.Resume GetOne(string resumeId)
        {
            using (var db = new ResumeContext())
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
                using (var db = new ResumeContext())
                {
                    var r = new DataContext.Resume();
                    r.ResumeName = newResume.ResumeName;
                    r.Created = DateTime.Now;
                    r.PersonId = newResume.PersonId;

                    db.Resumes.Add(r);
                    db.SaveChanges();
                    success = r.Id.ToString();
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(ResumeModel resumeModel)
        {
            string success = "";
            try
            {
                using (var db = new ResumeContext())
                {
                    DataContext.Resume resume = db.Resumes.Where(r => r.Id == resumeModel.Id).FirstOrDefault();
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
        public List<ResumeElementModel> Get(string resumeId)
        {
            var resumeElements = new List<ResumeElementModel>();
            using (var db = new ResumeContext())
            {
                var dbElements = db.ResumeElements.Where(e => e.ResumeId == resumeId).ToList();
                foreach (ResumeElement element in dbElements)
                {
                    var m = new ResumeElementModel();
                    if (element.ElementType == "2")
                    {
                        LostJob lostJob = db.LostJobs.Where(j => j.Id == element.ElementId).FirstOrDefault();
                        if (lostJob != null)
                            m.ElementName = lostJob.Employer;
                        else
                            m.ElementName = "??";
                    }
                    else
                    {
                        ResumeSection x = db.ResumeSections.Where(s => s.Id == element.ElementId).FirstOrDefault();
                        if (x != null)
                            m.ElementName = x.SectionTitle;
                        else
                            m.ElementName = "?";
                    }
                    m.ElementId = element.ElementId.ToString();
                    m.ElementType = element.ElementType;
                    m.SortOrder = element.SortOrder;
                    resumeElements.Add(m);
                }
            }
            return resumeElements.OrderBy(r => r.ElementType).ThenBy(r => r.SortOrder).ToList();
        }

        [HttpGet]
        public List<ResumeElementModel> GetAvailable(string personId, string resumeId)
        {
            List<ResumeElementModel> availableElements = new List<ResumeElementModel>();
            using (var db = new ResumeContext())
            {
                List<string> selectedElements = db.ResumeElements.Where(e => e.ElementId == resumeId).Select(e => e.ElementId).ToList();

                List<string> availableJobElementIds = db.LostJobs.Where(j => j.PersonId == personId).Select(j => j.Id).Except(selectedElements).ToList();
                availableElements = (from jobs in db.LostJobs
                                     where availableJobElementIds.Contains(jobs.Id)
                                     select new ResumeElementModel()
                                     {
                                         ElementId = jobs.Id,
                                         ElementName = jobs.Employer,
                                         ElementType = "JOB"
                                     }).ToList();

                var availableResumeSectionElemenIds = db.ResumeSections.Where(s => s.PersonId == personId).Select(s => s.Id).Except(selectedElements).ToList();
                var availableSections = (from sections in db.ResumeSections
                                         where availableResumeSectionElemenIds.Contains(sections.Id)
                                         select new ResumeElementModel()
                                         {
                                             ElementId = sections.Id,
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
            string success = "";
            try
            {
                var test = elementModel.ElementId.Replace("'", "");

                using (var db = new ResumeContext())
                {
                    db.ResumeElements.Add(new ResumeElement()
                    {
                        ElementId = elementModel.ElementId.Replace("'", ""),
                        ElementType = elementModel.ElementType,
                        SortOrder = elementModel.SortOrder,
                        ResumeId = elementModel.ResumeId
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(ResumeElementModel editedElement)
        {
            string success = "";
            try
            {
                using (var db = new ResumeContext())
                {
                    var element = db.ResumeElements.Where(e => e.ElementId == editedElement.ElementId && e.ResumeId == editedElement.ResumeId).FirstOrDefault();
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

        [HttpDelete]
        public string Delete(ResumeElementModel deleteElement)
        {
            string success = "";
            try
            {
                using (var db = new ResumeContext())
                {
                    var element = db.ResumeElements.Where(e => e.ElementId.ToString() == deleteElement.ElementId && e.ResumeId == deleteElement.ResumeId).FirstOrDefault();
                    if (element == null)
                        success = "record not found";
                    else
                    {
                        db.ResumeElements.Remove(element);
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
