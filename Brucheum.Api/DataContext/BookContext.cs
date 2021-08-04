using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Bruchueum.Api
{
    public partial class BookDbContext : DbContext
    {
        public BookDbContext()
            : base("name=GoDaddy")
        {
        }

        public virtual DbSet<Book> Books { get; set; }
        public virtual DbSet<BookChapter> Chapters { get; set; }
        public virtual DbSet<BookSection> Sections { get; set; }
        public virtual DbSet<SubSection> SubSections { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //modelBuilder.Entity<Book>()
            //    .HasMany(e => e.Chapters)
            //    .WithOptional(e => e.Book)
            //    .HasForeignKey(e => e.BookId);

            //modelBuilder.Entity<BookChapter>()
            //    .HasMany(e => e.Sections)
            //    .WithOptional(e => e.Chapter)
            //    .HasForeignKey(e => e.ChapterId);

            //modelBuilder.Entity<BookSection>()
            //    .HasMany(e => e.SubSections)
            //    .WithOptional(e => e.BookSection)
            //    .HasForeignKey(e => e.SectionId);
        }
    }

    [Table("book.Book")]
    public partial class Book
    {
        //[System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        //public Book()
        //{
        //    Chapters = new HashSet<BookChapter>();
        //}

        [Key]
        public int Id { get; set; }
        public string BookTitle { get; set; }
        public string Author { get; set; }
        public string Preface { get; set; }
        public string Introduction { get; set; }

        //[System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        //public virtual ICollection<BookChapter> Chapters { get; set; }
    }

    [Table("book.Chapter")]
    public partial class BookChapter
    {
        //[System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        //public BookChapter()
        //{
        //    Sections = new HashSet<BookSection>();
        //}
        [Key]
        public int Id { get; set; }
        public string ChapterTitle { get; set; }
        public int ChapterOrder { get; set; }
        public string Preface { get; set; }
        public int? BookId { get; set; }
        //public virtual Book Book { get; set; }

        //[System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        //public virtual ICollection<BookSection> Sections { get; set; }
    }

    [Table("book.Section")]
    public partial class BookSection
    {
        //[System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        //public BookSection()
        //{
        //    SubSections = new HashSet<SubSection>();
        //}
        [Key]
        public int Id { get; set; }
        public string SectionTitle { get; set; }
        public int SectionOrder { get; set; }
        public string SectionContents { get; set; }
        public int BookId { get; set; }
        public int ChapterId { get; set; }
        //public virtual BookChapter Chapter { get; set; }

        //[System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        //public virtual ICollection<SubSection> SubSections { get; set; }
    }

    //SqlException: Invalid column name 'ChapterId'.

    [Table("book.SubSection")]
    public partial class SubSection
    {
        [Key]
        public int Id { get; set; }
        public string SubSectionTitle { get; set; }
        public int SubSectionOrder { get; set; }
        public string SubSectionContents { get; set; }
        public int BookId { get; set; }
        public int ChapterId { get; set; }
        public int SectionId { get; set; }
        //public virtual BookSection BookSection { get; set; }
    }
}

//SqlException: Invalid column name 'BookSectionId'.



