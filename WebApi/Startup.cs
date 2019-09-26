using System;
using System.Collections.Generic;
using System.Linq;

using Owin;
using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Microsoft.Owin.Cors;
using Microsoft.Owin.Security;
using System.Security.Claims;
using System.Web.Http;
using NuGet;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;


//[assembly: OwinStartup(typeof(WebApi.Startup))]
namespace WebApi
{
    public partial class Startup
    {
        //public void Configuration(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        public void Configuration(IAppBuilder app)
        {
            //app.MapSignalR();

            app.Map("/signalr", map =>
            {
                map.UseCors(CorsOptions.AllowAll);
                map.RunSignalR(new HubConfiguration { EnableJSONP = true });
            });

            //const string rootFolder = ".";
            //var fileSystem = new PhysicalFileSystem(rootFolder);
            //DefaultFilesOptions DefaultFile = new DefaultFilesOptions();
            //DefaultFile.DefaultFileNames.Clear();
            //DefaultFile.DefaultFileNames.Add("index.html");

            //app.UseMvc()

            //IApplicationBuilder applicationBuilder=new App

            //app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = new List<string> { "Index.html" } });


            //var options = new FileServerOptions
            //{
            //    EnableDefaultFiles = true,
            //};
            //app.UseFileServer(options);
            //app.UseStaticFiles();

        }


        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            //loggerFactory.AddConsole();

            DefaultFilesOptions DefaultFile = new DefaultFilesOptions();
            DefaultFile.DefaultFileNames.Clear();
            DefaultFile.DefaultFileNames.Add("Welcome.html");
            app.UseDefaultFiles(DefaultFile);
            app.UseStaticFiles();


            //if (env.IsDevelopment())
            //{
            //    app.UseDeveloperExceptionPage();
            //}

            //app.Run(async (context) =>
            //{
            //    await context.Response.WriteAsync("Hello World!");
            //});
        }
    }


}

 

