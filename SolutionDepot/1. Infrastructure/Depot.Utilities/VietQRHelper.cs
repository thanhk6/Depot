using System;
using System.Text;

namespace Depot.Utilities
{
    public static class VietQRHelper
    {
        public static string GenerateVietQRContent(string accountNumber, string bankBin, decimal amount, string referenceCode)
        {
            // Standard Napas 247 VietQR payload format generator
            var memo = $"DEPOT {referenceCode}";
            return $"https://img.vietqr.io/image/{bankBin}-{accountNumber}-compact2.png?amount={amount}&addInfo={Uri.EscapeDataString(memo)}&accountName=DEPOT%20CONTAINER%20JSC";
        }

        public static string GenerateTicketNo(string prefix, long idSequence)
        {
            return $"{prefix}-{DateTime.Now:yyyyMMdd}-{idSequence:D5}";
        }
    }
}
