using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Book.DataContext;
using WebApi.Book.Models;

namespace WebApi.Book
{
    [EnableCors("*", "*", "*")]
    public class BookDbController : ApiController
    {
        [HttpGet]
        public IList<DbBookModel> Get()
        {
            var books = new List<DbBookModel>();
            using (var db = new BookDbContext())
            {
                var dbBooks = db.Books.ToList();
                foreach (DataContext.Book book in dbBooks)
                {
                    books.Add(new DbBookModel()
                    {
                        Id = book.Id,
                        BookTitle = book.BookTitle,
                        Introduction = book.Introduction,
                        Preface = book.Preface
                    });
                }
            }
            return books;
        }
        [HttpGet]
        public DbBookModel Get(int bookId)
        {
            DbBookModel book = new DbBookModel();
            ChapterModel chapterModel = null;
            BookSectionModel sectionModel = null;
            using (var db = new BookDbContext())
            {
                var dbBook = db.Books.Where(b => b.Id == bookId).FirstOrDefault();
                book.Id = dbBook.Id;
                book.BookTitle = dbBook.BookTitle;
                book.Introduction = dbBook.Introduction;
                book.Preface = dbBook.Preface;
                foreach (BookChapter dbChapter in dbBook.Chapters)
                {
                    chapterModel  = new ChapterModel();
                    chapterModel.Id = dbChapter.Id;
                    chapterModel.ChapterTitle = dbChapter.ChapterTitle;
                    chapterModel.ChapterOrder = dbChapter.ChapterOrder;
                    chapterModel.Preface = dbChapter.Preface;
                    foreach (BookSection dbSection in dbChapter.Sections)
                    {
                        sectionModel = new BookSectionModel();
                        sectionModel.Id = dbSection.Id;
                        sectionModel.SectionTitle = dbSection.SectionTitle;
                        sectionModel.SectionOrder = dbSection.SectionOrder;
                        sectionModel.SectionContents = dbSection.SectionContents;
                        foreach (SubSection dbSubSection in dbSection.SubSections)
                        {
                            sectionModel.SubSections.Add(new SubSectionModel()
                            {
                                Id = dbSubSection.Id,
                                SubSectionContents = dbSubSection.SubSectionContents,
                                SubSectionTitle = dbSubSection.SubSectionTitle,
                                SubSectionOrder = dbSubSection.SubSectionOrder
                            });
                        }
                        chapterModel.Sections.Add(sectionModel);                        
                    }
                    book.Chapters.Add(chapterModel);
                }
                book.success = "ok";
            }
            return book;
        }
        [HttpPost]
        public string Post(DbBookModel bookModel)
        {
            string success = "";
            using (var db = new BookDbContext())
            {
                var dbBook = new DataContext.Book();
                dbBook.BookTitle = bookModel.BookTitle;
                dbBook.Author = bookModel.Author;
                dbBook.Introduction = bookModel.Introduction;
                dbBook.Preface = bookModel.Preface;
                db.Books.Add(dbBook);
                db.SaveChanges();
                success = "ok";
            }
            return success;
        }
        [HttpPut]
        public string Put(DbBookModel bookModel)
        {
            string success = "";
            using (var db = new BookDbContext())
            {
                var dbBook = db.Books.Where(b => b.Id == bookModel.Id).FirstOrDefault();
                if (dbBook == null)
                    success = "not found";
                else
                {
                    dbBook.BookTitle = bookModel.BookTitle;
                    dbBook.Author = bookModel.Author;
                    dbBook.Introduction = bookModel.Introduction;
                    dbBook.Preface = bookModel.Preface;

                    db.SaveChanges();
                    success = "ok";
                }
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class ChapterController : ApiController
    {
        [HttpPatch]
        public ChapterModel Patch(int chapterId)
        {
            var chapter = new ChapterModel();
            using (var db = new BookDbContext())
            {
                var dbChapter = db.Chapters.Where(c => c.Id == chapterId).FirstOrDefault();
                if (dbChapter != null)
                {
                    chapter.Id = dbChapter.Id;
                    chapter.ChapterTitle = dbChapter.ChapterTitle;
                    chapter.ChapterOrder = dbChapter.ChapterOrder;
                    chapter.Preface = dbChapter.Preface;
                    chapter.BookTitle = dbChapter.Book.BookTitle;
                    chapter.BookId = dbChapter.BookId.Value;
                    chapter.success="ok";
                }
            }        
            return chapter;
        }
        [HttpGet]
        public IList<ChapterModel> Get(int bookId)
        {
            var chapters = new List<ChapterModel>();
            using (var db = new BookDbContext())
            {
                List<BookChapter> dbChapters = db.Chapters.Where(c => c.BookId == bookId).ToList();
                foreach (BookChapter chapter in dbChapters)
                {
                    chapters.Add(new ChapterModel()
                    {
                        Book = bookId,
                        Id = chapter.Id,
                        ChapterTitle = chapter.ChapterTitle,
                        ChapterOrder = chapter.ChapterOrder,
                        Preface = chapter.Preface,
                        success = "ok"
                    });
                }
            }
            return chapters;
        }
        [HttpPost]
        public int Post(ChapterModel chapterModel)
        {
            int success = 0;
            using (var db = new BookDbContext())
            {
                var chapter = new BookChapter()
                {
                    BookId = chapterModel.BookId,
                    ChapterTitle = chapterModel.ChapterTitle,
                    ChapterOrder = chapterModel.ChapterOrder,
                    Preface = chapterModel.Preface
                };
                db.Chapters.Add(chapter);
                db.SaveChanges();
                success = chapter.Id;
            }
            return success;
        }
        [HttpPut]
        public string Put(ChapterModel chapterModel)
        {
            string success = "";
            using (var db = new BookDbContext())
            {
                var chapter = db.Chapters.Where(c => c.Id == chapterModel.Id).FirstOrDefault();
                if (chapter == null)
                    success = "not found";
                else
                {
                    chapter.ChapterTitle = chapterModel.ChapterTitle;
                    chapter.ChapterOrder = chapterModel.ChapterOrder;
                    chapter.Preface = chapterModel.Preface;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class BookSectionController : ApiController
    {
        [HttpPatch]
        public BookSectionModel Patch(int sectionId)
        {
            var sectionModel = new BookSectionModel();
            using (var db = new BookDbContext())
            {
                BookSection dbSection = db.Sections.Where(s => s.Id == sectionId).FirstOrDefault();
                if (dbSection != null)
                {
                    sectionModel.Id = dbSection.Id;
                    sectionModel.ChapterOrder = dbSection.Chapter.ChapterOrder;
                    sectionModel.ChapterTitle = dbSection.Chapter.ChapterTitle;
                    sectionModel.SectionTitle = dbSection.SectionTitle;
                    sectionModel.SectionOrder = dbSection.SectionOrder;
                    sectionModel.SectionContents = dbSection.SectionContents;
                    sectionModel.success = "ok";
                }
            }
            return sectionModel;
        }
        [HttpGet]
        public IList<BookSectionModel> Get(int chapterId)
        {
            var sections = new List<BookSectionModel>();
            BookSectionModel section = null;
            using (var db = new BookDbContext())
            {
                var dbSections = db.Sections.Where(s => s.ChapterId == chapterId).ToList();
                foreach (BookSection dbSection in dbSections)
                {
                    section = new BookSectionModel();
                    section.Id = dbSection.Id;
                    section.SectionTitle = dbSection.SectionTitle;
                    section.SectionOrder = dbSection.SectionOrder;
                    section.SectionContents = dbSection.SectionContents;
                    foreach (SubSection dbSubSection in dbSection.SubSections)
                    {
                        section.SubSections.Add(new SubSectionModel()
                        {
                            Id = dbSubSection.Id,
                            SubSectionContents = dbSubSection.SubSectionContents,
                            SubSectionTitle = dbSubSection.SubSectionTitle,
                            SubSectionOrder = dbSubSection.SubSectionOrder
                        });
                    }
                    sections.Add(section);
                }
            }
            return sections;
        }
        [HttpPost]
        public int Post(BookSectionModel bookSectionModel)
        {
            int success = 0;
            using (var db = new BookDbContext())
            {
                var bookSection = new BookSection()
                {
                    ChapterId = bookSectionModel.ChapterId,
                    SectionTitle = bookSectionModel.SectionTitle,
                    SectionOrder = bookSectionModel.SectionOrder,
                    SectionContents = bookSectionModel.SectionContents
                };
                db.Sections.Add(bookSection);
                db.SaveChanges();
                success = bookSection.Id;
            }
            return success;
        }
        [HttpPut]
        public string Put(BookSectionModel bookSectionModel)
        {
            string success = "";
            using (var db = new BookDbContext())
            {
                var bookSection = db.Sections.Where(c => c.Id == bookSectionModel.Id).FirstOrDefault();
                if (bookSection == null)
                    success = "not found";
                else
                {
                    bookSection.SectionTitle = bookSectionModel.SectionTitle;
                    bookSection.SectionOrder = bookSectionModel.SectionOrder;
                    bookSection.SectionContents = bookSectionModel.SectionContents;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class SubSectionController : ApiController
    {
        [HttpPatch]
        public SubSectionModel Patch(int subSectionId)
        {
            var subSection = new SubSectionModel();
            using (var db = new BookDbContext())
            {
                var dbSubSection = db.SubSections.Where(s => s.Id == subSectionId).FirstOrDefault();
                if (dbSubSection != null)
                {
                    subSection.Id = dbSubSection.Id;
                    subSection.SubSectionTitle = dbSubSection.SubSectionTitle;
                    subSection.SubSectionOrder = dbSubSection.SubSectionOrder;
                    subSection.SubSectionContents = dbSubSection.SubSectionContents;
                    subSection.SectionTitle = dbSubSection.BookSection.SectionTitle;
                    subSection.SectionOrder = dbSubSection.BookSection.SectionOrder;
                    subSection.SectionId = dbSubSection.SectionId.Value;
                    subSection.success = "ok";
                }
            }
            return subSection;
        }
        [HttpGet]
        public IList<SubSectionModel> Get(int sectionId)
        {
            var subSections = new List<SubSectionModel>();
            using (var db = new BookDbContext())
            {
                var dbSubSections = db.SubSections.Where(c => c.Id == sectionId).ToList();
                foreach (SubSection dbSubSection in dbSubSections)
                {
                    subSections.Add(new SubSectionModel()
                    {
                        Id = dbSubSection.Id,
                        SubSectionTitle= dbSubSection.SubSectionTitle,
                        SubSectionOrder = dbSubSection.SubSectionOrder,
                       SubSectionContents= dbSubSection.SubSectionContents
                    });
                }
            }
            return subSections;
        }
        [HttpPost]
        public int Post(SubSectionModel subSectionModel)
        {
            int success = 0;
            using (var db = new BookDbContext())
            {
                var bookSubSection = new SubSection()
                {
                    Id = subSectionModel.Id,
                    SubSectionTitle = subSectionModel.SubSectionTitle,
                    SubSectionOrder = subSectionModel.SubSectionOrder,
                    SubSectionContents = subSectionModel.SubSectionContents,
                };
                db.SubSections.Add(bookSubSection);
                db.SaveChanges();
                success = bookSubSection.Id;
            }
            return success;
        }
        [HttpPut]
        public string Put(SubSectionModel subSectionModel)
        {
            string success = "";
            using (var db = new BookDbContext())
            {
                var bookSubSection = db.SubSections.Where(s => s.Id == subSectionModel.Id).FirstOrDefault();
                if (bookSubSection == null)
                    success = "not found";
                else
                {
                    bookSubSection.SubSectionTitle = subSectionModel.SubSectionTitle;
                    bookSubSection.SubSectionOrder = subSectionModel.SubSectionOrder;
                    bookSubSection.SubSectionContents = subSectionModel.SubSectionContents;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            return success;
        }
    }
}
