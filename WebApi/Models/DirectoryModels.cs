using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApi.Directory.Models
{
    public class FileModel
    {
        public string FileName { get; set; }
        public DateTime Created { get; set; }
        public long Length { get; set; }
        public string FullName { get; set; }
        public string Extension { get; set; }
    }
    public class FolderModel
    {
        public string DirectoryName { get; set; }
        public DateTime Created { get; set; }
        public long Length { get; set; }
        public string Path { get; set; }
        public string DanniPath { get; set; }
        public string Parent { get; set; }
        public string FirstImage { get; set; }
    }
}