<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Rise Social backend (Fastify 5 + Node.js). A singleton PostHog client was created at `src/config/posthog.js` with `enableExceptionAutocapture: true`. Event tracking was added across authentication, payments, RYLS registration, user profile management, and the global error handler. User identification via `posthog.identify()` is called on login and signup. The PostHog client is shut down gracefully on `SIGTERM`/`SIGINT`.

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User successfully registered a new account | `src/controllers/auth/authController.js` |
| `user_logged_in` | User successfully logged in | `src/controllers/auth/authController.js` |
| `user_logged_out` | User successfully logged out | `src/controllers/auth/authController.js` |
| `academy_checkout_started` | User initiated a payment transaction for an academy enrollment | `src/controllers/payments/academyPaymentController.js` |
| `ryls_checkout_started` | User initiated a payment transaction for a RYLS registration | `src/controllers/payments/rylsPaymentController.js` |
| `payment_completed` | Payment webhook confirmed as paid — fires for both academy and RYLS product types | `src/controllers/shared/webhookController.js` |
| `payment_expired` | Payment webhook confirmed as expired or failed | `src/controllers/shared/webhookController.js` |
| `ryls_registration_created` | User saved a RYLS registration draft | `src/controllers/user/rylsRegistrationController.js` |
| `ryls_registration_submitted` | User submitted a complete RYLS registration | `src/controllers/user/rylsRegistrationController.js` |
| `user_account_updated` | User updated their profile/account details | `src/controllers/user/userController.js` |
| `user_password_changed` | User successfully changed their password | `src/controllers/user/userController.js` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/678828)
- [New Signups & Logins over time](/insights/9BRzXTAB) — Trend of daily signups vs logins over the last 30 days
- [Academy Checkout → Payment Completed Funnel](/insights/OnqbKGMZ) — Conversion rate from checkout start to successful payment
- [RYLS Registration Funnel](/insights/qLjQWvUd) — Full RYLS funnel: draft → submitted → checkout → payment
- [Payments: Completed vs Expired](/insights/H4Yudu7R) — Daily completed vs expired/failed payments side-by-side
- [Weekly Active Users (Logins)](/insights/26qOJxaO) — WAU trend based on login events over 90 days

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
