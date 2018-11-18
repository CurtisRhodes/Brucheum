using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Models
{
    public class ResumeModel
    {
        public int Id { get; set; }
        public string PersonId { get; set; }
        public string ResumeName { get; set; }
        public DateTime Created { get; set; }
    }
    public class SectionModel
    {
        public int Id { get; set; }
        public string ElementId { get; set; }
        public string PersonId { get; set; }
        //public string SectionType { get; set; }
        //public string SectionTypeDescription { get; set; }
        public string SectionTitle { get; set; }
        public string SectionContents { get; set; }
    }
    public class SkillModel
    {
        public int Id { get; set; }
        public string SkillName { get; set; }
        public string SkillCategory { get; set; }
        public string SkillCategoryDescription { get; set; }
        public string GenericNarrative { get; set; }
    }
    public class LostJobModel
    {
        public int Id { get; set; }
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
    }
    public class ResumeElementModel
    {
        public string ElementId { get; set; }
        public int ResumeId { get; set; }
        public string ElementType { get; set; }
        public int SortOrder { get; set; }
    }
}