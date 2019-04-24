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

[assembly: OwinStartup(typeof(WebApi.Startup))]
namespace WebApi
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //app.MapSignalR();

            app.Map("/signalr", map =>
            {
                map.UseCors(CorsOptions.AllowAll);
                map.RunSignalR(new HubConfiguration { EnableJSONP = true });
            });
        }
    }
}

 

