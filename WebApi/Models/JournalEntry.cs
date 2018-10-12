using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Service1.Models
{
    public class JournalEntry
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string DateCreated { get; set; }
        public string SortDate { get; set; }
    }
}