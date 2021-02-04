using System;
using System.Collections.Generic;
using System.Linq;

using Owin;
using Microsoft.AspNet.SignalR;
//using Microsoft.Owin;
//using Microsoft.Owin.Cors;
//using Microsoft.Owin.Security;
//using System.Security.Claims;
//using System.Web.Http;
//using NuGet;
using Microsoft.AspNetCore.Builder;
//using Microsoft.AspNetCore.Hosting;
//using Microsoft.AspNetCore.Http;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.Logging;


//[assembly: OwinStartup(typeof(WebApi.Startup))]
namespace WebApi
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //app.UseCors(CorsOptions.AllowAll);
            //app.MapSignalR();

            //app.Map("/signalr", map =>
            //{
            //    map.UseCors(CorsOptions.AllowAll);
            //    map.RunSignalR(new HubConfiguration { EnableJSONP = true });
            //});

            //app.UseStaticFiles();
            //IApplicationBuilder applicationBuilder = new IAppBuilder()
            //Configure(app);
        }

        //public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        public void Configure(IApplicationBuilder app)
        {
            //app.UseDefaultFiles();
            app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = new List<string> { "/Index.html" } });
            app.UseStaticFiles();
        }
    }


}

 

