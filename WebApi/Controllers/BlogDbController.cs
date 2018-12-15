using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.DataContext;
using WebApi.Models;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class BlogController : ApiController
    {
        [HttpGet]
        public IList<BlogModel> Get()
        {
            var blogs = new List<BlogModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBblogs = db.Blogs.ToList();
                    foreach (Blog blog in dbBblogs)
                    {
                        blogs.Add(new BlogModel() { Id = blog.Id.ToString(), Name = blog.BlogName, Owner = blog.BlogOwner });
                    }
                }
            }
            catch (Exception ex) { blogs.Add(new BlogModel() { Name = Helpers.ErrorDetails(ex) }); }
            return blogs;
        }

        [HttpGet]
        public BlogModel Get(string blogId)
        {
            var blog = new BlogModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBlog = db.Blogs.Where(b => b.Id.ToString() == blogId).FirstOrDefault();
                    if (dbBlog != null)
                    {
                        blog.Id = dbBlog.Id.ToString();
                        blog.Name = dbBlog.BlogName;
                        blog.Owner = dbBlog.BlogOwner;
                        foreach (BlogEntry entry in dbBlog.BlogEntries)
                        {
                            blog.Entries.Add(new BlogEntryModel()
                            {
                                Id = entry.Id.ToString(),
                                Summary = entry.Summary,
                                Contents = entry.Content,
                                Title = entry.Title

                            });

                        }
                    }
                }
            }
            catch (Exception ex) { blog.Name = "ERROR: " + Helpers.ErrorDetails(ex); }
            return blog;
        }

        [HttpPost]
        public string Post(BlogModel newBlog)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Blog blog = new Blog();
                    blog.BlogName = newBlog.Name;
                    blog.BlogOwner = newBlog.Owner;
                    db.Blogs.Add(blog);
                    db.SaveChanges();
                    success = blog.Id.ToString();
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(BlogModel editBlog)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Blog blog = db.Blogs.Where(b => b.Id.ToString() == editBlog.Id).FirstOrDefault();
                    if (blog == null)
                        success = "article not found";
                    else
                    {
                        blog.BlogName = editBlog.Name;
                        blog.BlogOwner = editBlog.Owner;
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class BlogEntryController : ApiController
    {
        //[HttpGet]
        //public IList<BlogEntryModel> Get(string blogId)
        //{
        //    var blogs = new List<BlogEntryModel>();
        //    try
        //    {
        //        using (WebSiteContext db = new WebSiteContext())
        //        {
        //            var dbBblogEntries = db.Blogs.ToList();
        //            foreach (Blog blog in dbBblogs)
        //            {
        //                blogs.Add(new BlogModel() { Id = blog.Id.ToString(), Name = blog.BlogName, Owner = blog.BlogOwner });
        //            }
        //        }
        //    }
        //    catch (Exception ex) { blogs.Add(new BlogModel() { Name = Helpers.ErrorDetails(ex) }); }
        //    return blogs;
        //}

        [HttpGet]
        public BlogEntryModel Get(string Id)
        {
            var blogEntry = new BlogEntryModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBlogEntry = db.BlogEntries.Where(b => b.Id.ToString() == Id).FirstOrDefault();
                    if (dbBlogEntry != null)
                    {
                        blogEntry.Title = dbBlogEntry.Title;
                        blogEntry.Summary = dbBlogEntry.Summary;
                        blogEntry.Contents = dbBlogEntry.Content;
                        blogEntry.ImageName = dbBlogEntry.ImageName;
                    }
                }
            }
            catch (Exception ex) { blogEntry.Title = "ERROR: " + Helpers.ErrorDetails(ex); }
            return blogEntry;
        }

        [HttpPost]
        public string Post(BlogEntryModel newBlogEntry)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    BlogEntry blogEntry = new BlogEntry();
                    blogEntry.Title = newBlogEntry.Title;
                    db.BlogEntries.Add(blogEntry);
                    db.SaveChanges();
                    success = blogEntry.Id.ToString();
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(BlogEntryModel editBlogEntry)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    BlogEntry blogEntry = db.BlogEntries.Where(b => b.Id.ToString() == editBlogEntry.Id).FirstOrDefault();
                    if (blogEntry == null)
                        success = "article not found";
                    else
                    {
                        blogEntry.Title = editBlogEntry.Title;


                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = "ERROR: " + Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}
