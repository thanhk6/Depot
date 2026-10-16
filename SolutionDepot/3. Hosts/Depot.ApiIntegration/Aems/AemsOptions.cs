using Microsoft.Extensions.Configuration;

namespace Depot.ApiIntegration.Aems
{
    /// <summary>
    /// Cấu hình 1 hãng tàu dùng Maersk AEMS — khai báo trên server của Depot.ApiIntegration (appsettings hoặc
    /// biến môi trường), KHÔNG để trong code / Git:
    /// <code>
    /// CarrierIntegrations:{MÃ_HÃNG}:Adapter          = MAERSK_AEMS
    /// CarrierIntegrations:{MÃ_HÃNG}:Environment      = STAGE | PRODUCTION   (mặc định STAGE)
    /// CarrierIntegrations:{MÃ_HÃNG}:ConsumerKey      = Consumer-Key Maersk cấp
    /// CarrierIntegrations:{MÃ_HÃNG}:Secret           = Client Secret
    /// CarrierIntegrations:{MÃ_HÃNG}:ShopCode         = mã shop 3 ký tự (khi báo giá không chọn Shop Code)
    /// CarrierIntegrations:{MÃ_HÃNG}:Enabled          = true | false
    /// CarrierIntegrations:{MÃ_HÃNG}:TimeoutSeconds   = 30
    /// CarrierIntegrations:{MÃ_HÃNG}:StatusPollMinutes= 15  (0 = không tự hỏi trạng thái)
    /// CarrierIntegrations:{MÃ_HÃNG}:ApiBaseUrl       = (chỉ dùng khi test với máy chủ giả lập)
    /// </code>
    /// Đường dẫn theo đặc tả AEMS v1.0 (docs/maersk/): token /customer-identity/oauth/v2/access_token,
    /// order /aems/orders, file /aems/blob-manager, identity /aems/identity.
    /// </summary>
    public sealed record AemsCarrierOptions(
        string CarrierCode,
        string Environment,
        string ApiBaseUrl,
        string? ConsumerKey,
        string? ClientSecret,
        string? ShopCode,
        bool Enabled,
        int TimeoutSeconds,
        int StatusPollMinutes)
    {
        public const string AdapterName = "MAERSK_AEMS";

        public bool HasCredentials => !string.IsNullOrWhiteSpace(ConsumerKey) && !string.IsNullOrWhiteSpace(ClientSecret);
        public string TokenUrl => $"{ApiBaseUrl}/customer-identity/oauth/v2/access_token";
        public string OrdersUrl => $"{ApiBaseUrl}/aems/orders/api/maintenance-orders";
        public string UploadUrl(string shopCode) => $"{ApiBaseUrl}/aems/blob-manager/api/manage/{Uri.EscapeDataString(shopCode)}/upload";
        public string UserDetailsUrl => $"{ApiBaseUrl}/aems/identity/api/identity/user-details";

        public static IReadOnlyList<AemsCarrierOptions> ReadAll(IConfiguration configuration)
        {
            var list = new List<AemsCarrierOptions>();
            foreach (var s in configuration.GetSection("CarrierIntegrations").GetChildren())
            {
                if (!string.Equals(s["Adapter"]?.Trim(), AdapterName, StringComparison.OrdinalIgnoreCase)) continue;
                var env = string.Equals(s["Environment"]?.Trim(), "PRODUCTION", StringComparison.OrdinalIgnoreCase) ? "PRODUCTION" : "STAGE";
                var baseUrl = !string.IsNullOrWhiteSpace(s["ApiBaseUrl"])
                    ? s["ApiBaseUrl"]!.Trim().TrimEnd('/')
                    : env == "PRODUCTION" ? "https://api.maersk.com" : "https://api-stage.maersk.com";
                list.Add(new AemsCarrierOptions(
                    s.Key.Trim().ToUpperInvariant(),
                    env,
                    baseUrl,
                    s["ConsumerKey"]?.Trim(),
                    s["Secret"]?.Trim(),
                    string.IsNullOrWhiteSpace(s["ShopCode"]) ? null : s["ShopCode"]!.Trim().ToUpperInvariant(),
                    !bool.TryParse(s["Enabled"], out var enabled) || enabled,
                    int.TryParse(s["TimeoutSeconds"], out var t) && t > 0 ? Math.Min(t, 120) : 30,
                    int.TryParse(s["StatusPollMinutes"], out var p) && p >= 0 ? p : 15));
            }
            return list;
        }

        public static AemsCarrierOptions? Find(IConfiguration configuration, string carrierCode) =>
            ReadAll(configuration).FirstOrDefault(x => string.Equals(x.CarrierCode, carrierCode?.Trim(), StringComparison.OrdinalIgnoreCase));
    }
}
