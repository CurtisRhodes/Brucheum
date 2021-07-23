using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.IO;
using System.Configuration;

namespace Bruchueum.Api
{
    [EnableCors("*", "*", "*")]
    public class BookDbController : ApiController
    {
        [HttpGet]
        public IList<DbBookModel> GetBookList()
        {
            var books = new List<DbBookModel>();
            using (var db = new BookDbContext())
            {
                var dbBooks = db.Books.ToList();
                foreach (Book book in dbBooks)
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
        public DbBookModel GetBook(int bookId)
        {
            DbBookModel bookModel = new DbBookModel();
            ChapterModel chapterModel = null;
            BookSectionModel sectionModel = null;
            using (var db = new BookDbContext())
            {
                var dbBook = db.Books.Where(b => b.Id == bookId).FirstOrDefault();
                bookModel.Id = dbBook.Id;
                bookModel.BookTitle = dbBook.BookTitle;
                bookModel.Introduction = dbBook.Introduction;
                bookModel.Preface = dbBook.Preface;

                var bookChapters = dbBook.Chapters.OrderBy(c => c.ChapterOrder).ToList();

                foreach (BookChapter dbChapter in bookChapters)
                {
                    chapterModel = new ChapterModel();
                    chapterModel.Id = dbChapter.Id;
                    chapterModel.ChapterTitle = dbChapter.ChapterTitle;
                    chapterModel.ChapterOrder = dbChapter.ChapterOrder;
                    chapterModel.Preface = dbChapter.Preface;

                    List<BookSection> chapterSections = dbChapter.Sections.OrderBy(s => s.SectionOrder).ToList();
                    foreach (BookSection dbSection in chapterSections)
                    {
                        sectionModel = new BookSectionModel();
                        sectionModel.Id = dbSection.Id;
                        sectionModel.SectionTitle = dbSection.SectionTitle;
                        sectionModel.SectionOrder = dbSection.SectionOrder;
                        sectionModel.SectionContents = dbSection.SectionContents;
                        var subSections = dbSection.SubSections.OrderBy(ss => ss.SubSectionOrder).ToList();
                        foreach (SubSection dbSubSection in subSections)
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
                    bookModel.Chapters.Add(chapterModel);
                }
                bookModel.Success = "ok";
            }
            return bookModel;
        }
        [HttpPost]
        public string AddBook(DbBookModel bookModel)
        {
            string success = "";
            using (var db = new BookDbContext())
            {
                var dbBook = new Book();
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
        public string UpdateBook(DbBookModel bookModel)
        {
            string success = "";
            try
            {
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
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
        public ChapterModel GetChapter(int chapterId)
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
                }
            }
            return chapter;
        }
        [HttpGet]
        public IList<ChapterModel> GetChapters(int bookId)
        {
            var chapters = new List<ChapterModel>();
            using (var db = new BookDbContext())
            {
                List<BookChapter> dbChapters = db.Chapters.Where(c => c.BookId == bookId).ToList();
                foreach (BookChapter chapter in dbChapters)
                {
                    chapters.Add(new ChapterModel()
                    {
                        Id = chapter.Id,
                        ChapterTitle = chapter.ChapterTitle,
                        ChapterOrder = chapter.ChapterOrder,
                        Preface = chapter.Preface
                    });
                }
            }
            return chapters;
        }
        [HttpPost]
        public int AddChapter(ChapterModel chapterModel)
        {
            int success = 0;
            using (var db = new BookDbContext())
            {
                var chapter = new BookChapter()
                {
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
        public string UpdateChapter(ChapterModel chapterModel)
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

        [HttpGet]
        public BookSectionModel GetSection(int sectionId)
        {
            var sectionModel = new BookSectionModel();
            using (var db = new BookDbContext())
            {
                BookSection dbSection = db.Sections.Where(s => s.Id == sectionId).FirstOrDefault();
                if (dbSection != null)
                {
                    sectionModel.Id = dbSection.Id;
                    sectionModel.SectionTitle = dbSection.SectionTitle;
                    sectionModel.SectionOrder = dbSection.SectionOrder;
                    sectionModel.SectionContents = dbSection.SectionContents;
                }
            }
            return sectionModel;
        }
        [HttpPost]
        public int AddSection(BookSectionModel bookSectionModel)
        {
            int success = 0;
            using (var db = new BookDbContext())
            {
                var bookSection = new BookSection()
                {
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
        public string UpdateSection(BookSectionModel bookSectionModel)
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

        [HttpGet]
        public SubSectionModel GetSubSection(int subSectionId)
        {
            var subSectionModel = new SubSectionModel();
            using (var db = new BookDbContext())
            {
                var dbSubSection = db.SubSections.Where(s => s.Id == subSectionId).FirstOrDefault();
                if (dbSubSection != null)
                {
                    subSectionModel.Id = dbSubSection.Id;
                    subSectionModel.SubSectionTitle = dbSubSection.SubSectionTitle;
                    subSectionModel.SubSectionOrder = dbSubSection.SubSectionOrder;
                    subSectionModel.SubSectionContents = dbSubSection.SubSectionContents;
                }
            }
            return subSectionModel;
        }
        [HttpPost]
        public string AddSubSection(SubSectionModel subSectionModel)
        {
            string success = "";
            try
            {
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
                    success = bookSubSection.Id.ToString();
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
        [HttpPut]
        public string UpdateSubSection(SubSectionModel subSectionModel)
        {
            string success = "";
            try
            {
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
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}
