using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Brucheum.Startup))]
namespace Brucheum
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
