namespace WebApi.DataContext
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class BookDbContext : DbContext
    {
        public BookDbContext()
            : base("name=GoDaddy")
        {
        }

        public virtual DbSet<Book> Books { get; set; }
        public virtual DbSet<Chapter> Chapters { get; set; }
        public virtual DbSet<BookSection> Sections { get; set; }
        public virtual DbSet<SubSection> SubSections { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Book>()
                .HasMany(e => e.Chapters)
                .WithOptional(e => e.Book1)
                .HasForeignKey(e => e.Book);

            modelBuilder.Entity<Chapter>()
                .HasMany(e => e.Sections)
                .WithOptional(e => e.Chapter1)
                .HasForeignKey(e => e.Chapter);

            modelBuilder.Entity<BookSection>()
                .HasMany(e => e.SubSections)
                .WithOptional(e => e.Section1)
                .HasForeignKey(e => e.Section);
        }
    }

    [Table("book.Book")]
    public partial class Book
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Book()
        {
            Chapters = new HashSet<Chapter>();
        }

        public int Id { get; set; }

        [Required]
        [StringLength(300)]
        public string BookTitle { get; set; }

        [StringLength(300)]
        public string Author { get; set; }

        public string Preface { get; set; }

        public string Introduction { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<Chapter> Chapters { get; set; }
    }

    [Table("book.Chapter")]
    public partial class Chapter
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Chapter()
        {
            Sections = new HashSet<BookSection>();
        }

        public int Id { get; set; }

        [Required]
        [StringLength(300)]
        public string ChapterTitle { get; set; }

        public int? ChapterOrder { get; set; }

        public string Preface { get; set; }

        public int? Book { get; set; }

        public virtual Book Book1 { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<BookSection> Sections { get; set; }
    }

    [Table("book.Section")]
    public partial class BookSection
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public BookSection()
        {
            SubSections = new HashSet<SubSection>();
        }

        public int Id { get; set; }

        [Required]
        [StringLength(300)]
        public string SectionTitle { get; set; }

        public int? SectionOrder { get; set; }

        public string SectionContents { get; set; }

        public int? Chapter { get; set; }

        public virtual Chapter Chapter1 { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<SubSection> SubSections { get; set; }
    }

    [Table("book.SubSection")]
    public partial class SubSection
    {
        public int Id { get; set; }

        [Required]
        [StringLength(300)]
        public string SubSectionTitle { get; set; }

        public int? SubSectionOrder { get; set; }

        public string SubSectionContents { get; set; }

        public int? Section { get; set; }

        public virtual BookSection Section1 { get; set; }
    }

}
