# Privacy, safety, and commercial controls

- **Location:** The app requests browser geolocation only after the user selects the approximate-location action. Coordinates are rounded before storage or sharing, are used for the active trip only, and are cleared when the trip is completed. Manual addresses remain available.
- **Phone numbers and OTP:** A customer enters a phone number voluntarily. Booking requires a successful OTP verification through the configured Twilio Verify service. OTPs are never generated for, or sent to, imported contacts; there is no OTP bypass or test code in production.
- **Consent and retention:** Booking requires explicit consent for approximate location, temporary trip tracking, and limited booking/payment processing. Verification tokens expire after 30 minutes, and active trip location is cleared at completion. Operators must provide deletion/withdrawal handling through their configured data process.
- **Maps and navigation:** No Google Maps SDK or scraped map data is used. If Google Maps or another navigation provider is added, it must use an approved API key, comply with the provider terms, and avoid storing more location data than necessary.
- **Pricing and commissions:** The fare preview discloses the total, platform commission, driver payout, taxes, and applicable commission rule before booking. Admin pricing must be configured with legitimate payment-provider credentials; the UI must not hide platform fees.

Required server environment variables for phone verification:

```text
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
```
