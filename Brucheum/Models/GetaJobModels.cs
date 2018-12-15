using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace Brucheum.Models
{
    public class AgencyModel
    {
        public AgencyModel()
        {
            Agents = new HashSet<AgentModel>();
        }
        public string Id { get; set; }
        [StringLength(128)]
        public string CompanyId { get; set; }
        public virtual JobCompanyModel JobCompany { get; set; }
        public virtual ICollection<AgentModel> Agents { get; set; }
    }
    public class AgentModel
    {
        public AgentModel()
        {
            JobListings = new HashSet<JobListingModel>();
        }
        public string Id { get; set; }
        [StringLength(128)]
        public string AgencyId { get; set; }
        [StringLength(128)]
        public string PersonId { get; set; }
        public virtual AgencyModel Agency { get; set; }
        //public virtual PersonModel Person { get; set; }
        public virtual ICollection<JobListingModel> JobListings { get; set; }
    }
    public class JobCompanyModel
    {
        public JobCompanyModel()
        {
            Agencies = new HashSet<AgencyModel>();
            JobListings = new HashSet<JobListingModel>();
        }
        public string Id { get; set; }
        [StringLength(250)]
        public string CompanyName { get; set; }
        [StringLength(250)]
        public string CompanyAddress { get; set; }
        [StringLength(25)]
        public string CompanyZip { get; set; }
        [StringLength(3)]
        public string CompanyTypeRef { get; set; }
        [StringLength(150)]
        public string Email { get; set; }
        [StringLength(250)]
        public string Website { get; set; }
        [StringLength(150)]
        public string OfficePhone { get; set; }
        public virtual ICollection<AgencyModel> Agencies { get; set; }
        public virtual ICollection<JobListingModel> JobListings { get; set; }
    }
    public class JobSearchModel
    {
        public JobSearchModel()
        {
            JobListings = new HashSet<JobListingModel>();
        }

        public string Id { get; set; }

        [Required]
        [StringLength(128)]
        public string PersonId { get; set; }

        [Required]
        [StringLength(300)]
        public string SearchName { get; set; }

        public DateTime Initiated { get; set; }

        public DateTime? Abandoned { get; set; }

        public virtual ICollection<JobListingModel> JobListings { get; set; }
    }
    public class JobListingRequirementModel
    {
        public string Id { get; set; }

        [StringLength(128)]
        public string JobListingId { get; set; }

        [StringLength(128)]
        public string JobSkillId { get; set; }

        [StringLength(3)]
        public string ImportanceRef { get; set; }

        [StringLength(3)]
        public string SkillLevelRequiredRef { get; set; }

        public virtual JobListingModel JobListing { get; set; }

        public virtual JobSkillModel JobSkill { get; set; }
    }
    public class JobListingModel
    {
        public JobListingModel()
        {
            JobListingRequirements = new HashSet<JobListingRequirementModel>();
            SearchActivities = new HashSet<SearchActivityModel>();
        }

        public string Id { get; set; }

        [StringLength(128)]
        public string JobSearchId { get; set; }

        [Column(TypeName = "date")]
        public DateTime? PostedDate { get; set; }

        [StringLength(250)]
        public string JobTitle { get; set; }

        [StringLength(128)]
        public string AgentId { get; set; }

        [StringLength(128)]
        public string TargetCompanyId { get; set; }

        public string Comments { get; set; }

        [StringLength(50)]
        public string Rate { get; set; }

        [StringLength(300)]
        public string JobLocation { get; set; }

        [StringLength(150)]
        public string Distance { get; set; }

        [StringLength(3)]
        public string ListingStatusRef { get; set; }

        [StringLength(3)]
        public string EmploymentTypeRef { get; set; }

        [StringLength(3)]
        public string ListingSourceRef { get; set; }

        [StringLength(3)]
        public string DesirabilityRef { get; set; }

        [StringLength(3)]
        public string FitnessRef { get; set; }

        public virtual AgentModel Agent { get; set; }

        public virtual JobCompanyModel JobCompany { get; set; }

        public virtual ICollection<JobListingRequirementModel> JobListingRequirements { get; set; }

        public virtual JobSearchModel JobSearch { get; set; }

        public virtual ICollection<SearchActivityModel> SearchActivities { get; set; }
    }
    public class SearchActivityModel
    {
        public string Id { get; set; }

        [StringLength(128)]
        public string JobListingId { get; set; }

        [Column(TypeName = "date")]
        public DateTime ActivityDate { get; set; }

        [StringLength(3)]
        public string ActivityTypeRef { get; set; }

        [StringLength(3)]
        public string ActivityStatusRef { get; set; }

        public string Narrative { get; set; }

        public virtual JobListingModel JobListing { get; set; }
    }
    public class JobSkillModel
    {
        public JobSkillModel()
        {
            JobListingRequirements = new HashSet<JobListingRequirementModel>();
        }
        public string Id { get; set; }
        [StringLength(50)]
        public string SkillName { get; set; }
        [StringLength(3)]
        public string SkillType { get; set; }
        public string Narrative { get; set; }
        public virtual ICollection<JobListingRequirementModel> JobListingRequirements { get; set; }
    }
    public class LostJobModel
    {
        public LostJobModel()
        {
            JobSkills = new HashSet<JobSkillModel>();
        }

        public string Id { get; set; }

        [Required]
        [StringLength(128)]
        public string PersonId { get; set; }

        [Required]
        [StringLength(300)]
        public string JobTitle { get; set; }

        [Required]
        [StringLength(300)]
        public string Employer { get; set; }

        [Required]
        [StringLength(300)]
        public string JobLocation { get; set; }

        [Required]
        [StringLength(2)]
        public string StartMonth { get; set; }

        [Required]
        [StringLength(4)]
        public string StartYear { get; set; }

        [StringLength(2)]
        public string FiredMonth { get; set; }

        [StringLength(4)]
        public string FiredYear { get; set; }

        public string Summary { get; set; }

        public string ReasonForLeaving { get; set; }

        public string SecretNarative { get; set; }

        public virtual ICollection<JobSkillModel> JobSkills { get; set; }
    }

}