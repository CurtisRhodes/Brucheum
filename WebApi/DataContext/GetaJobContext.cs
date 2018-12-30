namespace WebApi.GetaJob.DataContext
{ 
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class GetaJobContext : DbContext
    {
        public GetaJobContext() : base("name=Godaddy") { }

        public virtual DbSet<Agency> Agencies { get; set; }
        public virtual DbSet<Agent> Agents { get; set; }
        public virtual DbSet<JobCompany> JobCompanies { get; set; }
        public virtual DbSet<JobListing> JobListings { get; set; }
        public virtual DbSet<JobListingRequirement> JobListingRequirements { get; set; }
        public virtual DbSet<JobSearch> JobSearches { get; set; }
        public virtual DbSet<JobSkill> JobSkills { get; set; }
        public virtual DbSet<Person> People { get; set; }
        public virtual DbSet<JobRef> JobRefs { get; set; }
        public virtual DbSet<SearchActivity> SearchActivities { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<JobCompany>()
                .HasMany(e => e.Agencies)
                .WithOptional(e => e.JobCompany)
                .HasForeignKey(e => e.CompanyId);

            modelBuilder.Entity<JobCompany>()
                .HasMany(e => e.JobListings)
                .WithOptional(e => e.JobCompany)
                .HasForeignKey(e => e.TargetCompanyId);

        }
    }
    [Table("job.Agency")]
    public partial class Agency
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Agency()
        {
            Agents = new HashSet<Agent>();
        }

        public string Id { get; set; }

        [StringLength(128)]
        public string CompanyId { get; set; }

        public virtual JobCompany JobCompany { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Agent> Agents { get; set; }
    }
    [Table("job.Agent")]
    public partial class Agent
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Agent()
        {
            JobListings = new HashSet<JobListing>();
        }
        public string Id { get; set; }
        [StringLength(128)]
        public string AgencyId { get; set; }
        [StringLength(128)]
        public string PersonId { get; set; }
        public virtual Agency Agency { get; set; }
        public virtual Person Person { get; set; }
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<JobListing> JobListings { get; set; }
    }
    [Table("job.JobCompany")]
    public partial class JobCompany
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public JobCompany()
        {
            Agencies = new HashSet<Agency>();
            JobListings = new HashSet<JobListing>();
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

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Agency> Agencies { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<JobListing> JobListings { get; set; }
    }
    [Table("job.JobListing")]
    public partial class JobListing
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public JobListing()
        {
            JobListingRequirements = new HashSet<JobListingRequirement>();
            SearchActivities = new HashSet<SearchActivity>();
        }

        public string Id { get; set; }

        [StringLength(128)]
        public string JobSearchId { get; set; }

        [Column(TypeName = "date")]
        public DateTime PostedDate { get; set; }

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

        public virtual Agent Agent { get; set; }

        public virtual JobCompany JobCompany { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<JobListingRequirement> JobListingRequirements { get; set; }

        public virtual JobSearch JobSearch { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SearchActivity> SearchActivities { get; set; }
    }
    [Table("job.JobListingRequirement")]
    public partial class JobListingRequirement
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

        public virtual JobListing JobListing { get; set; }

        public virtual JobSkill JobSkill { get; set; }
    }
    [Table("job.JobSearch")]
    public partial class JobSearch
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public JobSearch()
        {
            JobListings = new HashSet<JobListing>();
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

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<JobListing> JobListings { get; set; }
    }
    [Table("job.JobSkill")]
    public partial class JobSkill
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public JobSkill()
        {
            JobListingRequirements = new HashSet<JobListingRequirement>();
        }

        public string Id { get; set; }

        [StringLength(50)]
        public string SkillName { get; set; }

        [StringLength(3)]
        public string SkillType { get; set; }

        public string Narrative { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<JobListingRequirement> JobListingRequirements { get; set; }
    }
    [Table("job.Person")]
    public partial class Person
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Person()
        {
            Agents = new HashSet<Agent>();
        }

        public string Id { get; set; }

        [StringLength(150)]
        public string FName { get; set; }

        [StringLength(150)]
        public string LName { get; set; }

        [StringLength(150)]
        public string Email { get; set; }

        [StringLength(150)]
        public string OfficePhone { get; set; }

        [StringLength(150)]
        public string CellPhone { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Agent> Agents { get; set; }
    }
    [Table("job.Ref")]
    public partial class JobRef
    {
        [StringLength(3)]
        public string RefType { get; set; }

        [Key]
        [StringLength(3)]
        public string RefCode { get; set; }

        [StringLength(300)]
        public string RefDescription { get; set; }
    }
    [Table("job.SearchActivity")]
    public partial class SearchActivity
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

        public virtual JobListing JobListing { get; set; }
    }
}
