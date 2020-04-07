using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{
    public class TestResults
    {
        public TestResults()
        {
            Items = new List<TestResultsItem>();
        }
        public string Success { get; set; }
        public List<TestResultsItem> Items { get; set; }
    }
    public class TestResultsItem
    {
        public int Id { get; set; }
        public string FolderName { get; set; }
    }
}