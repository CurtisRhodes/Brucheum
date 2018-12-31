using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.GetaJob.Models
{
    public class JobSearchModel
    {
        public string Id { get; set; }
        public string PersonId { get; set; }
        public string SearchName { get; set; }
        public string Initiated { get; set; }
        public string Abandoned { get; set; }
    }

    public class JobListingModel
    {
        public string Id { get; set; }
        public string JobSearchId { get; set; }
        public string PostedDate { get; set; }
        public string JobTitle { get; set; }
        public string AgentId { get; set; }
        public string AgencyId { get; set; }
        public string TargetCompanyId { get; set; }
        public string Comments { get; set; }
        public string Status { get; set; }
        public string StatusText { get; set; }
        public string Rate { get; set; }
        public string EmploymentType { get; set; }
        public string Distance { get; set; }
        public string Location { get; set; }
        public string ListingSource { get; set; }
        public string Desirability { get; set; }
        public string Fit { get; set; }
    }

    public class JobListingActivityModel
    {
        public string Id { get; set; }
        public string JobListingId { get; set; }
        public string ActivityType { get; set; }
        public string ActivityDate { get; set; }
        public string ActivityStatus { get; set; }
        public string Comments { get; set; }
    }

    public class AgentModel
    {
        public string Id { get; set; }
        public string AgencyId { get; set; }
        public string FName { get; set; }
        public string LName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Cell {get; set; }
    }

    public class AgencyModel
    {
        public AgencyModel() {
            Agents = new List<AgentModel>();
        }
        public string Id { get; set; }
        public string CompanyName { get; set; }
        public string CompanyType { get; set; }
        public string CompanyAddress { get; set; }
        public string CompanyZip { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Website { get; set; }
        public List<AgentModel> Agents { get; set; }
    }

    public class JobRefModel
    {
        public string RefType { get; set; }
        public string RefCode { get; set; }
        public string RefDescription { get; set; }
        public string Success { get; set; }
    }

    public class JobSkillModel
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string CategoryDescription { get; set; }
        public string Proficiency { get; set; }
        public string SortOrder { get; set; }
        public string Narrative { get; set; }
    }
}
