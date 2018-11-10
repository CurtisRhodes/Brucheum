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

        public virtual DbSet<Job> Jobs { get; set; }
        public virtual DbSet<Job_Skill> Job_Skill { get; set; }
        public virtual DbSet<Resume> Resumes { get; set; }
        public virtual DbSet<ResumeSection> ResumeSections { get; set; }
        public virtual DbSet<Skill> Skills { get; set; }
        public virtual DbSet<Resume_ResumeSection> Resume_ResumeSection { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Job>()
                .HasMany(e => e.Job_Skill)
                .WithRequired(e => e.Job)
                .WillCascadeOnDelete(false);

            //modelBuilder.Entity<Resume>()
            //    .HasMany(e => e.ResumeSections)
            //    .WithMany(e => e.Resumes)
            //    .Map(m => m.ToTable("Resume_ResumeSection", "job").MapLeftKey("ResumeId").MapRightKey("SectionId"));

            modelBuilder.Entity<Skill>()
                .Property(e => e.SkillCategory)
                .IsFixedLength();

            modelBuilder.Entity<Skill>()
                .HasMany(e => e.Job_Skill)
                .WithRequired(e => e.Skill)
                .WillCascadeOnDelete(false);

            //System.Data.Entity.ModelConfiguration.ModelValidationException
            //  HResult = 0x80131500
            //  Message=One or more validation errors were detected during model generation:

            //ResumeResumeSection: Name: The EntitySet 'ResumeResumeSection' with schema 'job' and table 'Resume_ResumeSection' was already defined.Each EntitySet must refer to a unique schema and table.

            // Source=EntityFramework
            // StackTrace:

            //  at System.Data.Entity.Core.Metadata.Edm.EdmModel.Validate()
            //  at System.Data.Entity.DbModelBuilder.Build(DbProviderManifest providerManifest, DbProviderInfo providerInfo)
            //  at System.Data.Entity.DbModelBuilder.Build(DbConnection providerConnection)
            //  at System.Data.Entity.Internal.LazyInternalContext.CreateModel(LazyInternalContext internalContext)
            //  at System.Data.Entity.Internal.RetryLazy`2.GetValue(TInput input)
            //  at System.Data.Entity.Internal.LazyInternalContext.InitializeContext()
            //  at System.Data.Entity.Internal.InternalContext.Initialize()
            //  at System.Data.Entity.Internal.InternalContext.GetEntitySetAndBaseTypeForType(Type entityType)
            //  at System.Data.Entity.Internal.Linq.InternalSet`1.Initialize()
            //  at System.Data.Entity.Internal.Linq.InternalSet`1.GetEnumerator()
            //  at System.Data.Entity.Infrastructure.DbQuery`1.System.Collections.Generic.IEnumerable<TResult>.GetEnumerator()
            //  at WebApi.JobController.Get() in F:\Devl\WebApi\Controllers\GetaJobController.cs:line 32

            //  at System.Web.Http.Controllers.ReflectedHttpActionDescriptor.ActionExecutor.<>c__DisplayClass6_1.<GetExecutor>b__3(Object instance, Object[] methodParameters)
            //  at System.Web.Http.Controllers.ReflectedHttpActionDescriptor.ActionExecutor.Execute(Object instance, Object[] arguments)
            //  at System.Web.Http.Controllers.ReflectedHttpActionDescriptor.ExecuteAsync(HttpControllerContext controllerContext, IDictionary`2 arguments, CancellationToken cancellationToken)
        }
    }

    [Table("job.Job")]
    public partial class Job
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Job()
        {
            Job_Skill = new HashSet<Job_Skill>();
        }

        public int Id { get; set; }

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
        public virtual ICollection<Job_Skill> Job_Skill { get; set; }
    }

    [Table("job.Job_Skill")]
    public partial class Job_Skill
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

        public virtual Job Job { get; set; }

        public virtual Skill Skill { get; set; }
    }

    [Table("job.Resume")]
    public partial class Resume
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Resume()
        {
            ResumeSections = new HashSet<ResumeSection>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        [StringLength(128)]
        public string PersonId { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<ResumeSection> ResumeSections { get; set; }
    }

    [Table("job.ResumeSection")]
    public partial class ResumeSection
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public ResumeSection()
        {
            Resumes = new HashSet<Resume>();
        }

        public int Id { get; set; }

        [Required]
        [StringLength(500)]
        public string SectionName { get; set; }

        [Required]
        [StringLength(500)]
        public string SectionTitle { get; set; }

        public string SectionContents { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Resume> Resumes { get; set; }
    }

    [Table("job.Skill")]
    public partial class Skill
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Skill()
        {
            Job_Skill = new HashSet<Job_Skill>();
        }

        public int Id { get; set; }

        [StringLength(300)]
        public string SkillName { get; set; }

        [StringLength(3)]
        public string SkillCategory { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Job_Skill> Job_Skill { get; set; }
    }

    [Table("job.Resume_ResumeSection")]
    public partial class Resume_ResumeSection
    {
        [Key]
        [Column(Order = 0)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ResumeId { get; set; }

        [Key]
        [Column(Order = 1)]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int SectionId { get; set; }
    }
}
