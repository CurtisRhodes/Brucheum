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
            app.Map("/signalr", map =>
            {
                map.UseCors(CorsOptions.AllowAll);
                map.RunSignalR(new HubConfiguration { EnableJSONP = true });
            });
        }
    }

    public class ProgressHub : Hub
    {
        public static void PostToClient(string data)
        {
            try
            {
                var chat = GlobalHost.ConnectionManager.GetHubContext("ProgressHub");
                if (chat != null)
                    chat.Clients.All.postToClient(data);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }
        private static IHubContext hubContext =
            GlobalHost.ConnectionManager.GetHubContext<ProgressHub>();

        public static void GetStatus(string message)
        {
            hubContext.Clients.All.acknowledgeMessage(message);
        }
    }
}
