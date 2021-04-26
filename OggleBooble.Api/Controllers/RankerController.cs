using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class RankerController : ApiController
    {
        [HttpGet]
        public ImageRankerModelContainer LoadRankerImages(string selectedRankerCategories, int skip, int take)
        {
            ImageRankerModelContainer imageRankerModelContainer = new ImageRankerModelContainer();
            try
            {
                string selectedCategories = "";
                if (selectedRankerCategories.Substring(0, 1) == "1") selectedCategories += "boobs";
                if (selectedRankerCategories.Substring(1, 1) == "1") { if (selectedCategories != "") selectedCategories += ","; selectedCategories += "archive"; }
                if (selectedRankerCategories.Substring(2, 1) == "1") { if (selectedCategories != "") selectedCategories += ","; selectedCategories += "centerfold"; }
                if (selectedRankerCategories.Substring(3, 1) == "1") { if (selectedCategories != "") selectedCategories += ","; selectedCategories += "cybergirl"; }
                if (selectedRankerCategories.Substring(4, 1) == "1") { if (selectedCategories != "") selectedCategories += ","; selectedCategories += "muses"; }
                if (selectedRankerCategories.Substring(5, 1) == "1") { if (selectedCategories != "") selectedCategories += ","; selectedCategories += "plus"; }
                if (selectedRankerCategories.Substring(6, 1) == "1") { if (selectedCategories != "") selectedCategories += ","; selectedCategories += "soft"; }
                if (selectedRankerCategories.Substring(7, 1) == "1") { if (selectedCategories != "") selectedCategories += ","; selectedCategories += "porn"; }
                if (selectedRankerCategories.Substring(8, 1) == "1") { if (selectedCategories != "") selectedCategories += ","; selectedCategories += "sluts"; }
                using (var db = new OggleBoobleMySqlContext())
                {
                    imageRankerModelContainer.RankerLinks =
                        (from i in db.VwLinks
                         where selectedCategories.Contains(i.RootFolder)
                         where i.Orientation == "P"
                         select new ImageRankerModel()
                         {
                             FolderId = i.FolderId,
                             LinkId = i.LinkId,
                             Link = i.FileName,
                             ImageType = i.RootFolder,
                             FolderName = i.SrcFolder
                         }).OrderBy(i => i.LinkId).Skip(skip).Take(take).ToList();
                    imageRankerModelContainer.Success = "ok";
                    if (skip == 0)
                        imageRankerModelContainer.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                imageRankerModelContainer.Success = Helpers.ErrorDetails(ex);
            }
            return imageRankerModelContainer;
        }

        [HttpPost]
        public string InsertVote(RankerVoteModel vote)
        {
            string success = "";
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.RankerVotes.Add(new RankerVote()
                    {
                        PkId = Guid.NewGuid().ToString(),
                        Winner = vote.Winner,
                        Looser = vote.Looser,
                        VisitorId = vote.VisitorId,
                        Occured = DateTime.Now
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}

