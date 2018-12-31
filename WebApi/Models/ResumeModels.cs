using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Resume.Models
{
    public class LostJobModel
    {
        public LostJobModel()
        {
            JobSkills = new List<GetaJob.Models.JobSkillModel>();
        }
        public string Id { get; set; }
        public string ElementId { get; set; }
        public string JobTitle { get; set; }
        public string Employer { get; set; }
        public string JobLocation { get; set; }
        public string StartMonth { get; set; }
        public string StartYear { get; set; }
        public string FiredMonth { get; set; }
        public string FiredYear { get; set; }
        public string Summary { get; set; }
        public string ReasonForLeaving { get; set; }
        public string SecretNarative { get; set; }
        public IList<GetaJob.Models.JobSkillModel> JobSkills { get; set; }
        public int SortOrder { get; set; }
    }

    public class ResumeModel
    {
        public ResumeModel()
        {
            TopSections = new List<ResumeSectionModel>();
            LostJobs = new List<LostJobModel>();
            BottomSections = new List<ResumeSectionModel>();
        }
        public string Id { get; set; }
        public string PersonId { get; set; }
        public string ResumeName { get; set; }
        public string Created { get; set; }
        public IList<ResumeSectionModel> TopSections { get; set; }
        public IList<LostJobModel> LostJobs { get; set; }
        public IList<ResumeSectionModel> BottomSections { get; set; }
    }

    public class ResumeSectionModel
    {
        public string Id { get; set; }
        public string PersonId { get; set; }
        public string SectionTitle { get; set; }
        public string SectionContents { get; set; }
        public int SortOrder { get; set; }
    }

    public class ResumeElementModel
    {
        public string ElementId { get; set; }
        public string ResumeId { get; set; }
        public string ElementType { get; set; }
        public string ElementName { get; set; }
        public int SortOrder { get; set; }
    }
}