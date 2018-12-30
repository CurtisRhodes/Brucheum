using System.Collections.Generic;

namespace WebApi.Book.Models
{
    public class DbBookModel {
        public DbBookModel() {
            Chapters = new List<ChapterModel>();
        }
        public int Id { get; set; }
        public string BookTitle { get; set; }
        public string Author { get; set; }
        public string Preface { get; set; }
        public string Introduction { get; set; }
        public IList<ChapterModel> Chapters { get; set; }
        public string success { get; set; }
    }
    public class ChapterModel
    {
        public ChapterModel() {
            Sections = new List<BookSectionModel>();
        }
        public int Id { get; set; }
        public int BookId { get; set; }
        public string BookTitle { get; set; }
        public string ChapterTitle { get; set; }
        public int ChapterOrder { get; set; }
        public string Preface { get; set; }
        public int Book { get; set; }
        public IList<BookSectionModel> Sections { get; set; }
        public string success { get; set; }
    }
    public class BookSectionModel
    {
        public BookSectionModel() {
            SubSections = new List<SubSectionModel>();
        }
        public int Id { get; set; }
        public string SectionTitle { get; set; }
        public int SectionOrder { get; set; }
        public string SectionContents { get; set; }
        public int Chapter { get; set; }
        public IList<SubSectionModel> SubSections { get; set; }
        public string success { get; set; }
    }
    public class SubSectionModel
    {
        public int Id { get; set; }
        public string SubSectionTitle { get; set; }
        public int SubSectionOrder { get; set; }
        public string SubSectionContents { get; set; }
        public int Section { get; set; }
        public int SectionId { get; set; }
        public string SectionTitle { get; set; }
        public int SectionOrder { get; set; }

        public string success { get; set; }
    }

}
