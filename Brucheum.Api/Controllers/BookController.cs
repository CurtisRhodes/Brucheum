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

                //var bookChapters = dbBook.Chapters.OrderBy(c => c.ChapterOrder).ToList();
                var bookChapters = db.Chapters.Where(c => c.BookId == bookId).OrderBy(c => c.ChapterOrder).ToList();

                foreach (BookChapter dbChapter in bookChapters)
                {
                    chapterModel = new ChapterModel();
                    chapterModel.Id = dbChapter.Id;
                    chapterModel.ChapterTitle = dbChapter.ChapterTitle;
                    chapterModel.ChapterOrder = dbChapter.ChapterOrder;
                    chapterModel.Preface = dbChapter.Preface;

                    //List<BookSection> chapterSections = dbChapter.Sections.OrderBy(s => s.SectionOrder).ToList();
                    var chapterSections = db.Sections.Where(s => s.BookId == bookId && s.ChapterId == dbChapter.Id).OrderBy(s => s.SectionOrder).ToList();
                    foreach (BookSection dbSection in chapterSections)
                    {
                        sectionModel = new BookSectionModel();
                        sectionModel.Id = dbSection.Id;
                        sectionModel.SectionTitle = dbSection.SectionTitle;
                        sectionModel.SectionOrder = dbSection.SectionOrder;
                        sectionModel.SectionContents = dbSection.SectionContents;

                        //var subSections = dbSection.SubSections.OrderBy(ss => ss.SubSectionOrder).ToList();
                        var subSections = db.SubSections.Where(ss => ss.BookId == bookId
                                && ss.ChapterId == dbSection.ChapterId
                                && ss.SectionId == dbSection.Id)
                                .OrderBy(ss => ss.SubSectionOrder).ToList();

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
        [HttpPost]
        public string AddChapter(InsertChapterModel newChapterModel)
        {
            string success;
            try
            {
                using (var db = new BookDbContext())
                {
                    var currentChapters = db.Chapters.Where(c => c.BookId == newChapterModel.BookId).ToList().OrderBy(c => c.ChapterOrder);
                    foreach (BookChapter chapter in currentChapters) {
                        if (chapter.ChapterOrder >= newChapterModel.NewChapterOrder) 
                        {
                            chapter.ChapterOrder += 1;
                        }                    
                    }
                    var newChapter = new BookChapter()
                    {
                        BookId=newChapterModel.BookId,
                        ChapterTitle = newChapterModel.NewChapterTitle,
                        ChapterOrder = newChapterModel.NewChapterOrder
                    };
                    db.Chapters.Add(newChapter);
                    db.SaveChanges();
                    success = "ok";
                }

            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
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

        [HttpPost]
        public string AddSection(InsertSectionModel newSectionModel)
        {
            string success;
            try
            {
                using (var db = new BookDbContext())
                {
                    // reOrder chapterSections
                    var currentSections = db.Sections.Where(sec => sec.BookId == newSectionModel.BookId && sec.ChapterId == newSectionModel.ChapterId)
                        .OrderBy(sec => sec.SectionOrder).ToList();
                    foreach (BookSection section in currentSections)
                    {
                        if (section.SectionOrder >= newSectionModel.NewSectionOrder)
                        {
                            section.SectionOrder += 1;
                        }
                    }
                    var bookSection = new BookSection()
                    {
                        BookId = newSectionModel.BookId,
                        ChapterId = newSectionModel.ChapterId,
                        SectionTitle = newSectionModel.NewSectionTitle,
                        SectionOrder = newSectionModel.NewSectionOrder
                    };
                    db.Sections.Add(bookSection);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        public string UpdateSection(UpdateSectionModel sectionModel)
        {
            string success = "";
            try
            {
                using (var db = new BookDbContext())
                {
                    if (sectionModel.ChapterId == 0)
                    {
                        if (sectionModel.SectionOrder == 0)
                        {
                            var book = db.Books.Where(b => b.Id == sectionModel.BookId).First();
                            book.Preface = sectionModel.SectionContents;
                        }
                        else
                        {
                            var book = db.Books.Where(b => b.Id == sectionModel.BookId).First();
                            book.Introduction = sectionModel.SectionContents;
                        }
                    }
                    else
                    {
                        if (sectionModel.SectionOrder == 0)
                        {
                            var chapter = db.Chapters.Where(c => c.Id == sectionModel.ChapterId).First();
                            chapter.Preface = sectionModel.SectionContents;
                        }
                        else
                        {
                            var bookSection = db.Sections.Where(sec => sec.Id == sectionModel.SectionId).FirstOrDefault();
                            if (bookSection == null)
                                return "not found";
                            else
                            {
                                bookSection.SectionTitle = sectionModel.SectionTitle;
                                bookSection.SectionContents = sectionModel.SectionContents;
                            }
                        }
                    }
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
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
                    //var bookSubSection = new SubSection()
                    var subSection = new SubSection()
                    {
                        //Id = subSectionModel.Id
                        BookId=subSectionModel.BookId,
                        ChapterId=subSectionModel.ChapterId,
                        SectionId=subSectionModel.SectionId,
                        SubSectionTitle = subSectionModel.SubSectionTitle,
                        SubSectionOrder = subSectionModel.SubSectionOrder,
                        SubSectionContents = subSectionModel.SubSectionContents,
                    };
                    db.SubSections.Add(subSection);
                    db.SaveChanges();
                    success = "ok";
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
