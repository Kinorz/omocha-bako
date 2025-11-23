using Microsoft.AspNetCore.Identity;

namespace BackendApi.Models;

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
}
