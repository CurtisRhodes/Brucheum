using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Blogs.Models
{
    public class BlogModel
    {
        public BlogModel()
        {
            Entries = new List<BlogEntryModel>();
        }
        public string Id { get; set; }
        public string Name { get; set; }
        public string Owner { get; set; }
        public string Color { get; set; }
        public List<BlogEntryModel> Entries { get; set; }
    }

    public class BlogEntryModel
    {
        public string Id { get; set; }
        public string BlogId { get; set; }
        public string Title { get; set; }
        public string ImageName { get; set; }
        public string Created { get; set; }
        public string LastUpdated { get; set; }
        public string Content { get; set; }
        public string Summary { get; set; }
        public string BlogName { get; set; }
        public string Color { get; set; }
    }

    public class ListModel
    {
        public ListModel()
        {
            Items = new List<ListItemModel>();
        }
        public string Id { get; set; }
        public string ListName { get; set; }
        public string ListOwner { get; set; }
        public List<ListItemModel> Items { get; set; }
        public string Created { get; set; }
    }

    public class ListItemModel
    {
        public string ListId { get; set; }
        public string Id { get; set; }
        public string ParentId { get; set; }
        public string ItemName { get; set; }
        public string ItemPriorityRef { get; set; }
        public string AssignedTo { get; set; }
        public string ItemStatusRef { get; set; }
        public string PercentComplete { get; set; }
        public string Narrative { get; set; }
        public string DateCompleted { get; set; }
        public string Created { get; set; }
    }
}