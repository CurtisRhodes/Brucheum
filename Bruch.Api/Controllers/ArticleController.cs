using Bruch.Api.DataContext;
using Bruch.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Bruch.Api.Controllers
{
    [System.Web.Http.Cors.EnableCors("*", "*", "*")]
    public class ArticleController : ApiController
    {
        [HttpGet]
        public ArticlesModel Get(int pageLen, int page, string filterType, string filter)
        {
            var articlesModel = new ArticlesModel();
            try
            {
                using (ArticleContext db = new ArticleContext())
                {
                    using (RefsContext rdb = new RefsContext())
                    {
                        IList<Article> dbArticles = null;
                        switch (filterType)
                        {
                            case "Category":
                                dbArticles = db.Articles.Where(a => a.CategoryRef == filter).OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                                break;
                            case "Byline":
                                dbArticles = db.Articles.Where(a => a.ByLineRef == filter).OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                                break;
                            default:
                                dbArticles = db.Articles.OrderByDescending(a => a.LastUpdated).Skip(page - 1).Take(pageLen).ToList();
                                break;
                        }

                        string byLineLabel = "";
                        string catLabel = "";
                        string subCatLabel = "";
                        foreach (Article dbArticle in dbArticles)
                        {
                            try { byLineLabel = rdb.Refs.Where(r => r.RefCode == dbArticle.ByLineRef).FirstOrDefault().RefDescription; }
                            catch (Exception) { byLineLabel = "0"; }
                            try { catLabel = rdb.Refs.Where(r => r.RefCode == dbArticle.CategoryRef).FirstOrDefault().RefDescription; }
                            catch (Exception ex) { catLabel = Helpers.ErrorDetails(ex); }
                            try { subCatLabel = rdb.Refs.Where(r => r.RefCode == dbArticle.SubCategoryRef).FirstOrDefault().RefDescription; }
                            catch (Exception ex) { subCatLabel = Helpers.ErrorDetails(ex); }

                            articlesModel.ArticleList.Add(new ArticleModel()
                            {
                                Id = dbArticle.Id.ToString(),
                                Title = dbArticle.Title,
                                ByLineRef = dbArticle.ByLineRef,
                                CategoryRef = dbArticle.CategoryRef,
                                SubCategoryRef = dbArticle.SubCategoryRef,
                                ByLineLabel = byLineLabel,
                                CategoryLabel = catLabel,
                                SubCategoryLabel = subCatLabel,
                                ImageName = dbArticle.ImageName,
                                Summary = dbArticle.Summary,
                                Contents = dbArticle.Content,
                                LastUpdated = dbArticle.LastUpdated.ToShortDateString()
                            });
                        }
                        articlesModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                articlesModel.Success = Helpers.ErrorDetails(ex);
            }
            return articlesModel;
        }

        [HttpGet]
        public ArticleModel Get(string articleId)
        {
            var articleModel = new ArticleModel();
            try
            {
                using (ArticleContext db = new ArticleContext())
                {
                    Article dbArticle = db.Articles.Where(a => a.Id.ToString() == articleId).FirstOrDefault();
                    if (dbArticle != null)
                    {
                        articleModel.Title = dbArticle.Title;

                        using (RefsContext rdb = new RefsContext())
                        {
                            try { articleModel.ByLineLabel = rdb.Refs.Where(r => r.RefCode == dbArticle.ByLineRef).FirstOrDefault().RefDescription; }
                            catch (Exception ex) { articleModel.ByLineLabel = Helpers.ErrorDetails(ex); }

                            try { articleModel.CategoryLabel = rdb.Refs.Where(r => r.RefCode == dbArticle.CategoryRef).FirstOrDefault().RefDescription; }
                            catch (Exception ex) { articleModel.CategoryLabel = Helpers.ErrorDetails(ex); }

                            //try { articleModel.SubCategoryLabel = db.Refs.Where(r => r.RefCode == dbArticle.SubCategoryRef).FirstOrDefault().RefDescription; }
                            //catch (Exception ex) { articleModel.SubCategoryLabel = Helpers.ErrorDetails(ex); }
                        }
                        articleModel.ByLineRef = dbArticle.ByLineRef;
                        articleModel.CategoryRef = dbArticle.CategoryRef;
                        articleModel.SubCategoryRef = dbArticle.SubCategoryRef;
                        articleModel.Contents = dbArticle.Content;
                        articleModel.Summary = dbArticle.Summary;
                        articleModel.Created = dbArticle.Created;
                        articleModel.Updated = dbArticle.LastUpdated;
                        articleModel.LastUpdated = dbArticle.LastUpdated.ToShortDateString();
                        articleModel.ImageName = dbArticle.ImageName;
                        //article.SortDate = dbArticle.LastUpdated.Value.ToString("yyyyMMdd");
                        foreach (ArticleTag tag in dbArticle.ArticleTags)
                        {
                            articleModel.Tags.Add(new DbArticleTagModel() { TagName = tag.TagName, Id = tag.Id, TagCategoryRef = tag.TagCategoryRef });
                        }
                        articleModel.Success = "ok";
                    }
                }
            }
            catch (Exception ex) { articleModel.Success = Helpers.ErrorDetails(ex); }
            return articleModel;
        }

        [HttpPost]
        public string Post(ArticleModel articleModel)
        {
            var success = "";
            try
            {
                Article newArticle = new Article();
                if (articleModel.Id == null)
                    newArticle.Id = Guid.NewGuid().ToString();
                else
                    newArticle.Id = articleModel.Id;
                newArticle.Title = articleModel.Title;
                newArticle.CategoryRef = articleModel.CategoryRef;
                newArticle.SubCategoryRef = articleModel.SubCategoryRef;
                newArticle.ImageName = articleModel.ImageName;
                newArticle.Created = DateTime.Now;
                newArticle.LastUpdated = DateTime.Parse(articleModel.LastUpdated);
                newArticle.Content = articleModel.Contents;
                newArticle.Summary = articleModel.Summary;
                newArticle.ByLineRef = articleModel.ByLineRef;

                foreach (DbArticleTagModel tag in articleModel.Tags)
                    if (tag.TagName != null)
                        newArticle.ArticleTags.Add(new ArticleTag() { TagName = tag.TagName, TagCategoryRef = tag.TagCategoryRef });
                using (ArticleContext db = new ArticleContext())
                {
                    db.Articles.Add(newArticle);
                    db.SaveChanges();
                    success = newArticle.Id.ToString();
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        public string Put(ArticleModel editArticle)
        {
            var success = "";
            try
            {
                using (ArticleContext db = new ArticleContext())
                {
                    Article article = db.Articles.Where(a => a.Id.ToString() == editArticle.Id).FirstOrDefault();
                    article.Title = editArticle.Title;
                    article.CategoryRef = editArticle.CategoryRef;
                    article.SubCategoryRef = editArticle.SubCategoryRef;
                    article.ImageName = editArticle.ImageName;
                    article.LastUpdated = DateTime.Parse(editArticle.LastUpdated);
                    article.ByLineRef = editArticle.ByLineRef;
                    article.Content = editArticle.Contents;
                    article.Summary = editArticle.Summary;

                    db.ArticleTags.RemoveRange(db.ArticleTags.Where(t => t.articleId.ToString() == editArticle.Id));
                    //article.ArticleTags = null;
                    foreach (DbArticleTagModel tagModel in editArticle.Tags)
                    {
                        article.ArticleTags.Add(new ArticleTag() { articleId = article.Id, Id = tagModel.Id, TagName = tagModel.TagName });
                    }

                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}
