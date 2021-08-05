using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Brucheum.Api
{
    public class IntelDesignContext : DbContext
    {
        public IntelDesignContext() : base("name=GoDaddy") { }

        //public virtual DbSet<Agency> Agencies { get; set; }
        //public virtual DbSet<Agent> Agents { get; set; }
        //public virtual DbSet<JobCompany> JobCompanies { get; set; }
        //public virtual DbSet<JobListing> JobListings { get; set; }
        //public virtual DbSet<JobListingRequirement> JobListingRequirements { get; set; }
        //public virtual DbSet<JobSearch> JobSearches { get; set; }
        public virtual DbSet<JobSkill> JobSkills { get; set; }
        //public virtual DbSet<Person> People { get; set; }
        public virtual DbSet<JobRef> JobRefs { get; set; }
        //public virtual DbSet<SearchActivity> SearchActivities { get; set; }

    }
    [Table("job.JobSkill")]
    public partial class JobSkill
    {
        [Key]
        public string Id { get; set; }
        public string SkillName { get; set; }
        public string SkillType { get; set; }
        public string Proficiency { get; set; }
        public string SortOrder { get; set; }
        public string Narrative { get; set; }
    }
    [Table("job.Ref")]
    public partial class JobRef
    {
        public string RefType { get; set; }
        [Key]
        public string RefCode { get; set; }
        public string RefDescription { get; set; }
    }

}
