﻿using OggleBooble.Api.MsSqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace OggleBooble.Api.Models
{

    public class DirTreeSuccessModel
    {
        public DirTreeSuccessModel()
        {
            SubDirs = new List<DirTreeModelNode>();
        }
        public List<DirTreeModelNode> SubDirs { get; set; }
        public TimeSpan TimeTook { get; set; }
        public string Success { get; set; }
    }

    public class DirTreeModelNode
    {
        public DirTreeModelNode()
        {
            SubDirs = new List<DirTreeModelNode>();
        }
        public List<DirTreeModelNode> SubDirs { get; set; }
        public VwDirTree vwDirTree { get; set; }
        public string DanniPath { get; set; }
    }

    public class RepairReportModel
    {
        public RepairReportModel()
        {
            Errors = new List<string>();
        }
        public int ImagesRenamed { get; set; }
        public int LinksEdited { get; set; }
        public int NewLinksAdded { get; set; }
        public int LinksRemoved { get; set; }
        public int ImagesDownLoaded { get; set; }
        public int DirNotFound { get; set; }
        public int CatLinksAdded { get; set; }
        public int RowsProcessed { get; set; }
        public int ImagesMoved { get; set; }
        public int BadFileNames { get; set; }
        public int BadLinks { get; set; }
        public bool isSubFolder { get; set; }

        public List<string> Errors { get; set; }
        public string Success { get; set; }
    }
}