# Security Policy — Fayda Connect

Omo Bank S.C. takes the security of Fayda Connect seriously. This document outlines security practices, reporting procedures, and responsible disclosure expectations for this project.

---

## 1. Supported Versions

Only actively maintained versions of Fayda Connect are supported for security updates.

| Version                         | Supported |
| ------------------------------- | --------- |
| Main / Production Branch        | ✅ Yes     |
| Deprecated or Archived Versions | ❌ No      |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability, **do not disclose it publicly**.

### Responsible Disclosure Process

* Report the issue privately to the Omo Bank S.C. Digital Banking & Integration Team
* Provide detailed steps to reproduce the issue
* Include logs, screenshots, or proof-of-concept where appropriate

Public GitHub issues must **not** be used for reporting security vulnerabilities.

---

## 3. Security Expectations for Contributors

Contributors must adhere to the following security requirements:

* Do not commit secrets, credentials, tokens, certificates, or private keys
* Do not use real customer or production data in development or testing
* Ensure authentication, authorization, and validation logic is not bypassed
* Follow secure coding practices aligned with OWASP recommendations

Any violation may result in immediate rejection of the contribution.

---

## 4. Authentication and Identity Security

Fayda Connect implements:

* OIDC-compliant authentication with PKCE
* Secure session handling and token management
* Rate limiting and brute-force protection
* Comprehensive audit logging for sensitive operations

Security-related code changes require additional review and approval.

---

## 5. Dependency and Infrastructure Security

* Dependencies should be kept up to date and free of known vulnerabilities
* Infrastructure access must be restricted to authorized personnel
* Oracle Core Banking connectivity must remain within trusted network boundaries

---

## 6. Compliance and Audit

This project is subject to internal security audits and regulatory compliance reviews. All contributors acknowledge that their changes may be audited.

---

## 7. Legal Notice

This security policy is part of Omo Bank S.C.’s internal governance framework. Failure to comply may result in revocation of access and further action.

---

© 2026 Omo Bank S.C. All rights reserved.
