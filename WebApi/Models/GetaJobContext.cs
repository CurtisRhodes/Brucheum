namespace WebApi
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class GetaJobContext : DbContext
    {
        public GetaJobContext() : base("name=GoDaddy") { }

        public virtual DbSet<Agent> Agents { get; set; }
        public virtual DbSet<JobSearch> JobSearches { get; set; }
        public virtual DbSet<JobSkill> JobSkills { get; set; }
        public virtual DbSet<Listing> Listings { get; set; }
        public virtual DbSet<ListingRequirement> ListingRequirements { get; set; }
        public virtual DbSet<LostJob> LostJobs { get; set; }
        public virtual DbSet<Resume> Resumes { get; set; }
        public virtual DbSet<ResumeElement> ResumeElements { get; set; }
        public virtual DbSet<SearchActivity> SearchActivities { get; set; }
        public virtual DbSet<Section> Sections { get; set; }
        public virtual DbSet<Skill> Skills { get; set; }
        public virtual DbSet<gajRef> Refs { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Listing>()
                .Property(e => e.JobTitle)
                .IsUnicode(false);

            modelBuilder.Entity<Listing>()
                .Property(e => e.Comments)
                .IsUnicode(false);

            modelBuilder.Entity<Listing>()
                .Property(e => e.Rate)
                .IsUnicode(false);

            modelBuilder.Entity<Listing>()
                .Property(e => e.Distance)
                .IsUnicode(false);

            modelBuilder.Entity<Listing>()
                .HasMany(e => e.ListingRequirements)
                .WithOptional(e => e.Listing)
                .HasForeignKey(e => e.JobListingId);

            modelBuilder.Entity<Listing>()
                .HasMany(e => e.SearchActivities)
                .WithOptional(e => e.Listing)
                .HasForeignKey(e => e.JobListingId);

            modelBuilder.Entity<LostJob>()
                .HasMany(e => e.JobSkills)
                .WithRequired(e => e.LostJob)
                .HasForeignKey(e => e.JobId)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<Resume>()
                .HasMany(e => e.ResumeElements)
                .WithRequired(e => e.Resume)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<SearchActivity>()
                .Property(e => e.Comments)
                .IsUnicode(false);

            modelBuilder.Entity<Skill>()
                .Property(e => e.SkillCategory)
                .IsFixedLength();

            modelBuilder.Entity<Skill>()
                .HasMany(e => e.JobSkills)
                .WithRequired(e => e.Skill)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<Skill>()
                .HasMany(e => e.ListingRequirements)
                .WithOptional(e => e.Skill)
                .HasForeignKey(e => e.JobSkillId);
        }
    }

    [Table("gaj.Agent")]
    public partial class Agent
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Agent()
        {
            Listings = new HashSet<Listing>();
        }

        public int AgentId { get; set; }

        public Guid? PersonId { get; set; }

        public Guid? CompanyId { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Listing> Listings { get; set; }
    }
    [Table("gaj.JobSearch")]
    public partial class JobSearch
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public JobSearch()
        {
            Listings = new HashSet<Listing>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        [StringLength(128)]
        public string PersonId { get; set; }

        public DateTime? Initiated { get; set; }

        public DateTime? Abandoned { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Listing> Listings { get; set; }
    }
    [Table("gaj.JobSkill")]
    public partial class JobSkill
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int JobId { get; set; }

        [Key]
        [Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int SkillId { get; set; }

        public string Narrative { get; set; }

        public virtual LostJob LostJob { get; set; }

        public virtual Skill Skill { get; set; }
    }
    [Table("gaj.Listing")]
    public partial class Listing
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Listing()
        {
            ListingRequirements = new HashSet<ListingRequirement>();
            SearchActivities = new HashSet<SearchActivity>();
        }

        public int Id { get; set; }

        public int? JobSearchId { get; set; }

        [Column(TypeName = "date")]
        public DateTime? PostedDate { get; set; }

        [StringLength(250)]
        public string JobTitle { get; set; }

        public int? AgentId { get; set; }

        public Guid? TargetCompanyId { get; set; }

        [Column(TypeName = "text")]
        public string Comments { get; set; }

        public byte? ListingStatus { get; set; }

        [StringLength(50)]
        public string Rate { get; set; }

        public byte? EmploymentType { get; set; }

        [StringLength(150)]
        public string Distance { get; set; }

        public byte? ListingSource { get; set; }

        public byte? Desirability { get; set; }

        public byte? Fit { get; set; }

        public virtual Agent Agent { get; set; }

        public virtual JobSearch JobSearch { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ListingRequirement> ListingRequirements { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SearchActivity> SearchActivities { get; set; }
    }
    [Table("gaj.ListingRequirement")]
    public partial class ListingRequirement
    {
        [Key]
        public int JobListingRequirementId { get; set; }

        public int? JobListingId { get; set; }

        public int? JobSkillId { get; set; }

        public byte? RequirementImportance { get; set; }

        public byte? SkillLevelRequired { get; set; }

        public virtual Listing Listing { get; set; }

        public virtual Skill Skill { get; set; }
    }
    [Table("gaj.LostJob")]
    public partial class LostJob
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public LostJob()
        {
            JobSkills = new HashSet<JobSkill>();
        }

        public Guid ElementId { get; set; }

        public int Id { get; set; }

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
        [StringLength(10)]
        public string StartMonth { get; set; }

        [Required]
        [StringLength(4)]
        public string StartYear { get; set; }

        [Required]
        [StringLength(10)]
        public string FiredMonth { get; set; }

        [Required]
        [StringLength(4)]
        public string FiredYear { get; set; }

        public string Summary { get; set; }

        public string ReasonForLeaving { get; set; }

        public string SecretNarative { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<JobSkill> JobSkills { get; set; }
    }
    [Table("gaj.Resume")]
    public partial class Resume
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Resume()
        {
            ResumeElements = new HashSet<ResumeElement>();
        }

        [Key]
        public int Id { get; set; }

        [StringLength(128)]
        public string PersonId { get; set; }

        [StringLength(300)]
        public string ResumeName { get; set; }

        public DateTime? Created { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ResumeElement> ResumeElements { get; set; }
    }
    [Table("gaj.ResumeElement")]
    public partial class ResumeElement
    {
        [Key]
        [Column(Order = 0)]
        public Guid ElementId { get; set; }

        [Key]
        [Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ResumeId { get; set; }

        public string ElementType { get; set; }

        public int SortOrder { get; set; }

        public virtual Resume Resume { get; set; }
    }
    [Table("gaj.SearchActivity")]
    public partial class SearchActivity
    {
        [Key]
        public int JobSearchActivityId { get; set; }

        public int? JobListingId { get; set; }

        public byte? ActivityType { get; set; }

        [Column(TypeName = "date")]
        public DateTime ActivityDate { get; set; }

        public byte? ActivityStatus { get; set; }

        [StringLength(600)]
        public string Comments { get; set; }

        public virtual Listing Listing { get; set; }
    }
    [Table("gaj.Section")]
    public partial class Section
    {
        public Guid ElementId { get; set; }

        public int Id { get; set; }

        [StringLength(128)]
        public string PersonId { get; set; }

        //[Required]
        //[StringLength(3)]
        //public string SectionType { get; set; }

        [Required]
        [StringLength(500)]
        public string SectionTitle { get; set; }

        public string SectionContents { get; set; }
    }
    [Table("gaj.Skill")]
    public partial class Skill
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Skill()
        {
            JobSkills = new HashSet<JobSkill>();
            ListingRequirements = new HashSet<ListingRequirement>();
        }

        public int Id { get; set; }

        [StringLength(300)]
        public string SkillName { get; set; }

        [StringLength(3)]
        public string SkillCategory { get; set; }

        public string GenericNarrative { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<JobSkill> JobSkills { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ListingRequirement> ListingRequirements { get; set; }
    }
    [Table("gaj.Ref")]
    public partial class gajRef
    {
        [StringLength(3)]
        public string RefType { get; set; }

        [Key]
        [StringLength(3)]
        public string RefCode { get; set; }

        [Required]
        [StringLength(250)]
        public string RefDescription { get; set; }
    }
}
