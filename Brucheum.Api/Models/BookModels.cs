using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Bruchueum.Api
{
    public class DbBookModel
    {
        public DbBookModel()
        {
            Chapters = new List<ChapterModel>();
        }
        public int Id { get; set; }
        public string BookTitle { get; set; }
        public string Author { get; set; }
        public string Preface { get; set; }
        public string Introduction { get; set; }
        public IList<ChapterModel> Chapters { get; set; }
        public string Success { get; set; }
    }
    public class ChapterModel
    {
        public ChapterModel()
        {
            Sections = new List<BookSectionModel>();
        }
        public int Id { get; set; }
        public string ChapterTitle { get; set; }
        public int ChapterOrder { get; set; }
        public string Preface { get; set; }
        public IList<BookSectionModel> Sections { get; set; }
    }
    public class BookSectionModel
    {
        public BookSectionModel()
        {
            SubSections = new List<SubSectionModel>();
        }
        public int Id { get; set; }
        public string SectionTitle { get; set; }
        public int SectionOrder { get; set; }
        public string SectionContents { get; set; }
        public IList<SubSectionModel> SubSections { get; set; }
    }
    public class SubSectionModel
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        public int ChapterId { get; set; }
        public int SectionId { get; set; }
        public string SubSectionTitle { get; set; }
        public int SubSectionOrder { get; set; }
        public string SubSectionContents { get; set; }
    }

    public class InsertChapterModel
    {
        public int BookId { get; set; }
        public string NewChapterTitle { get; set; }
        public int NewChapterOrder { get; set; }
    }
    public class UpdateChapterModel
    {
        public int BookId { get; set; }
        public int ChapterId { get; set; }
        public int SectionId { get; set; }
        public string ChapterTitle { get; set; }
        public int ChapterOrder { get; set; }
    }
    public class InsertSectionModel
    {
        public int BookId { get; set; }
        public int ChapterId { get; set; }
        public string NewSectionTitle { get; set; }
        public int NewSectionOrder { get; set; }
    }
    public class UpdateSectionModel
    {
        public int BookId { get; set; }
        public int ChapterId { get; set; }
        public int SectionId { get; set; }
        public string SectionTitle { get; set; }
        public int SectionOrder { get; set; }
        public string SectionContents { get; set; }
    }
}
