using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.DataContext;

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
                        blog.Color = dbBlog.Color;
                        blog.Owner = dbBlog.BlogOwner;
                    }
                }
            }
            catch (Exception ex) { blog.Name = Helpers.ErrorDetails(ex); }
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
                        blogs.Add(new BlogModel()
                        {
                            Id = blog.Id.ToString(),
                            Name = blog.BlogName,
                            Color = blog.Color,
                            Owner = blog.BlogOwner
                        });
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
                    blog.Color = newBlog.Color;
                    blog.BlogOwner = newBlog.Owner;

                    db.Blogs.Add(blog);
                    db.SaveChanges();
                    success = blog.Id.ToString();
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
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
                        blog.Color = editBlog.Color;
                        blog.BlogOwner = editBlog.Owner;
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class BlogEntryController : ApiController
    {
        [HttpGet]
        public IList<BlogEntryModel> GetAll()
        {
            var blogs = new List<BlogEntryModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBblogEntries = db.BlogEntries.ToList();
                    foreach (BlogEntry blog in dbBblogEntries)
                    {
                        blogs.Add(new BlogEntryModel()
                        {
                            BlogName = blog.Blog.BlogName,
                            BlogId = blog.Id.ToString(),
                            Id = blog.Id,
                            Title = blog.Title,
                            Created = blog.Created.ToShortDateString(),
                            Color = blog.Blog.Color
                        });
                    }
                }
            }
            catch (Exception ex) { blogs.Add(new BlogEntryModel() { Title = Helpers.ErrorDetails(ex) }); }
            return blogs;
        }

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
                        blogEntry.BlogName = dbBlogEntry.Blog.BlogName;
                        blogEntry.BlogId = dbBlogEntry.BlogId;
                        blogEntry.Title = dbBlogEntry.Title;
                        blogEntry.Summary = dbBlogEntry.Summary;
                        blogEntry.Content = dbBlogEntry.Content;
                        blogEntry.ImageName = dbBlogEntry.ImageName;
                    }
                }
            }
            catch (Exception ex) { blogEntry.Title = Helpers.ErrorDetails(ex); }
            return blogEntry;
        }

        [HttpPost]
        public string Post(BlogEntryModel newBlogEntry)
        {
            var success = "";
            try
            {
                BlogEntry blogEntry = new BlogEntry();
                blogEntry.BlogId = newBlogEntry.BlogId;
                blogEntry.Id = Guid.NewGuid().ToString();
                blogEntry.Title = newBlogEntry.Title;
                blogEntry.ImageName = newBlogEntry.ImageName;
                blogEntry.Summary = newBlogEntry.Summary;
                blogEntry.Content = newBlogEntry.Content;
                blogEntry.Created = DateTime.Now;
                blogEntry.LastUpdated = DateTime.Now;

                using (WebSiteContext db = new WebSiteContext())
                {
                    db.BlogEntries.Add(blogEntry);
                    db.SaveChanges();
                    success = blogEntry.Id.ToString();
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
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
                        blogEntry.Content = editBlogEntry.Content;
                        blogEntry.LastUpdated = DateTime.Now;
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class ListController : ApiController
    {
        [HttpGet]
        public ListModel GetBigOne(string listId)
        {
            var list = new ListModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    ToDoList dbList = db.Lists.Where(l => l.Id == listId).FirstOrDefault();
                    if (dbList != null)
                    {
                        list.Id = dbList.Id;
                        list.ListName = dbList.ListName;
                        list.ListOwner = dbList.ListOwner;

                        List<ListItem> items = db.ListItems.Where(i => i.ListId == listId).ToList();
                        foreach (ListItem listItem in items)
                        {
                            list.Items.Add(new ListItemModel()
                            {
                                Id = listItem.Id,
                                ParentId = listItem.ParentId,
                                AssignedTo = listItem.AssignedTo,
                                Created = listItem.Created.ToShortDateString(),
                                ItemName = listItem.ItemName,
                                ItemPriorityRef = listItem.ItemPriorityRef,
                                ItemStatusRef = listItem.ItemStatusRef,
                                Narrative = listItem.Narrative,
                                PercentComplete = listItem.PercentComplete,
                                ListId = listId
                            });
                        }
                    }
                }
            }
            catch (Exception ex) { list.ListName = Helpers.ErrorDetails(ex); }
            return list;
        }
        [HttpGet]
        public IList<ListModel> GetMany()
        {
            var lists = new List<ListModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbLists = db.Lists.ToList();
                    foreach (ToDoList list in dbLists)
                    {
                        lists.Add(new ListModel()
                        {
                            Id = list.Id,
                            ListName = list.ListName,
                            ListOwner = list.ListOwner,
                            Created = list.Created.ToShortDateString()
                        });
                    }
                }
            }
            catch (Exception ex) { lists.Add(new ListModel() { ListName = Helpers.ErrorDetails(ex) }); }
            return lists;
        }
        [HttpPost]
        public string Post(ListModel newList)
        {
            var success = "";
            try
            {
                ToDoList toDoList = new ToDoList()
                {
                    Id = Guid.NewGuid().ToString(),
                    Created = DateTime.Now,
                    ListName = newList.ListName,
                    ListOwner = newList.ListOwner
                };

                using (WebSiteContext db = new WebSiteContext())
                {
                    db.Lists.Add(toDoList);
                    db.SaveChanges();
                    success = toDoList.Id;
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
        [HttpPut]
        public string Put(ListModel editList)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    ToDoList list = db.Lists.Where(l => l.Id == editList.Id).FirstOrDefault();
                    if (list == null)
                        success = "list not found";
                    else
                    {
                        list.ListName = editList.ListName;
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class ListItemController : ApiController
    {
        [HttpGet]
        public IList<ListItemModel> GetMany(string listId)
        {
            var listItems = new List<ListItemModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbListItems = db.ListItems.Where(l => l.ListId == listId).ToList();
                    foreach (ListItem listItem in dbListItems)
                    {
                        listItems.Add(new ListItemModel()
                        {
                            Id = listItem.Id,
                            ItemName = listItem.ItemName
                        });
                    }
                }
            }
            catch (Exception ex) { listItems.Add(new ListItemModel() { ItemName = Helpers.ErrorDetails(ex) }); }
            return listItems;
        }

        [HttpPatch]
        public ListItemModel GetOne(string id)
        {
            var listItem = new ListItemModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbListItem = db.ListItems.Where(l => l.Id == id).FirstOrDefault();
                    listItem.Id = dbListItem.Id;
                    listItem.ListId = dbListItem.ListId;
                    listItem.ItemName = dbListItem.ItemName;
                    listItem.ParentId = dbListItem.ParentId;
                    listItem.ItemPriorityRef = dbListItem.ItemPriorityRef;
                    listItem.ItemStatusRef = dbListItem.ItemStatusRef;
                    listItem.AssignedTo = dbListItem.AssignedTo;
                    listItem.PercentComplete = dbListItem.PercentComplete;
                    listItem.Narrative = dbListItem.Narrative;
                    listItem.Created = dbListItem.Created.ToShortDateString();
                }
            }
            catch (Exception ex) { listItem.ItemName = Helpers.ErrorDetails(ex); }
            return listItem;
        }
        [HttpPost]
        public string Post(ListItemModel newItem)
        {
            var success = "";
            try
            {
                ListItem listItem = new ListItem()
                {
                    ListId = newItem.ListId,
                    Id = Guid.NewGuid().ToString(),
                    ParentId = newItem.ParentId,
                    ItemName = newItem.ItemName,
                    AssignedTo = newItem.AssignedTo,
                    ItemPriorityRef = newItem.ItemPriorityRef,
                    ItemStatusRef = newItem.ItemStatusRef,
                    PercentComplete = newItem.PercentComplete,
                    Narrative = newItem.Narrative,
                    Created = DateTime.Now
                };

                using (WebSiteContext db = new WebSiteContext())
                {
                    db.ListItems.Add(listItem);
                    db.SaveChanges();
                    success = listItem.Id;
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Put(ListItemModel editItem)
        {
            var success = "";
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    ListItem listItem = db.ListItems.Where(i => i.Id == editItem.Id).FirstOrDefault();
                    if (listItem == null)
                        success = "listItem not found";
                    else
                    {
                        listItem.ParentId = editItem.ParentId;
                        listItem.ItemName = editItem.ItemName;
                        listItem.ItemPriorityRef = editItem.ItemPriorityRef;
                        listItem.ItemStatusRef = editItem.ItemStatusRef;
                        listItem.AssignedTo = editItem.AssignedTo;
                        listItem.PercentComplete = editItem.PercentComplete;
                        listItem.Narrative = editItem.Narrative;
                        if (editItem.DateCompleted != null)
                            listItem.DateCompleted = DateTime.Parse(editItem.DateCompleted);

                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success =  Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class DialogSnipitController : ApiController
    {
        [HttpGet]
        public IList<BlogEntryModel> GetMany(string blogName, string kludge)
        {
            var blogs = new List<BlogEntryModel>();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBblogEntries = db.BlogEntries.Where(b => b.Blog.BlogName == blogName).ToList();
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
        public BlogEntryModel GetByTitle(string blogName)
        {
            var blogEntry = new BlogEntryModel();
            try
            {
                using (WebSiteContext db = new WebSiteContext())
                {
                    var dbBlogEntry = db.BlogEntries.Where(b => b.Title == blogName).FirstOrDefault();
                    if (dbBlogEntry != null)
                    {
                        blogEntry.BlogId = dbBlogEntry.BlogId;
                        blogEntry.Title = dbBlogEntry.Title;
                        blogEntry.Summary = dbBlogEntry.Summary;
                        blogEntry.Content = dbBlogEntry.Content;
                        blogEntry.ImageName = dbBlogEntry.ImageName;
                    }
                }
            }
            catch (Exception ex) { blogEntry.Title = Helpers.ErrorDetails(ex); }
            return blogEntry;
        }
    }
}
