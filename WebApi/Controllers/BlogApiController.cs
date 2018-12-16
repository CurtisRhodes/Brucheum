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
        public BlogModel GetOne(string blogId)
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

                        //foreach (BlogEntry entry in dbBlog.BlogEntries)
                        //{
                        //    blog.Entries.Add(new BlogEntryModel()
                        //    {
                        //        Id = entry.Id.ToString(),
                        //        Title = entry.Title,
                        //        ImageName=entry.ImageName,
                        //        Summary = entry.Summary,
                        //        Contents = entry.Content,
                        //        Created=entry.Created.ToShortDateString()
                        //    });
                        //}
                    }
                }
            }
            catch (Exception ex) { blog.Name = "ERROR: " + Helpers.ErrorDetails(ex); }
            return blog;
        }
        [HttpGet]
        public IList<BlogModel> GetMany()
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
        [HttpPost]
        public string Post(BlogModel newBlog)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    Blog blog = new Blog();
                    blog.Id = Guid.NewGuid().ToString();
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
        [HttpGet]
        public IList<BlogEntryModel> GetMany(string blogId, string kludge)
        {
            var blogs = new List<BlogEntryModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBblogEntries = db.BlogEntries.Where(b => b.BlogId == blogId).ToList();
                    foreach (BlogEntry blog in dbBblogEntries)
                    {
                        blogs.Add(new BlogEntryModel() { Id = blog.Id.ToString(), Title = blog.Title, Created = blog.Created.ToShortDateString() });
                    }
                }
            }
            catch (Exception ex) { blogs.Add(new BlogEntryModel() { Title = Helpers.ErrorDetails(ex) }); }
            return blogs;
        }

        [HttpGet]
        public BlogEntryModel GetOne(string Id)
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
                BlogEntry blogEntry = new BlogEntry();
                blogEntry.Id = Guid.NewGuid().ToString();
                blogEntry.Title = newBlogEntry.Title;
                blogEntry.ImageName = newBlogEntry.ImageName;
                blogEntry.Summary = newBlogEntry.Summary;
                blogEntry.Content = newBlogEntry.Contents;
                blogEntry.Created = DateTime.Now;

                using (WebSiteContext db = new WebSiteContext())
                {
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
                        blogEntry.ImageName = editBlogEntry.ImageName;
                        blogEntry.Summary = editBlogEntry.Summary;
                        blogEntry.Content = editBlogEntry.Contents;
                        blogEntry.LastUpdated = DateTime.Now;
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
