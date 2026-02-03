# Contributing to Fayda Connect | Omo Bank S.C.

Thank you for your interest in contributing to **Fayda Connect**, Omo Bank S.C.’s digital identity harmonization platform.

This document defines the standards, processes, and responsibilities for contributing to the project. Due to the sensitive and regulated nature of banking and national identity systems, all contributions must comply with Omo Bank’s internal security, governance, and compliance requirements.

---

## 1. Scope of Contributions

Contributions may include, but are not limited to:

* Bug reports and defect fixes
* Feature enhancements and optimizations
* Documentation improvements
* Security hardening and performance improvements

All contributions are subject to review, approval, and, where applicable, security assessment.

---

## 2. Reporting Issues

### 2.1 Bug Reports

If you identify a defect, please open an issue in the GitHub repository and provide the following information:

* A clear and concise issue title
* Detailed steps to reproduce the problem
* Expected behavior versus actual behavior
* Relevant logs, screenshots, or recordings (where appropriate)
* Environment details (operating system, browser, Node.js version, etc.)

Do **not** include sensitive information such as customer data, credentials, tokens, or internal IP addresses.

### 2.2 Feature Requests

Feature requests and enhancement proposals should be submitted as issues prior to implementation. This enables technical, security, and business alignment before development begins.

---

## 3. Code Contribution Process

### 3.1 Repository Access

External contributors must work from a fork of the repository. Internal contributors may work directly on approved branches, subject to access controls.

### 3.2 Local Setup

Follow the setup instructions provided in the `README.md` to configure the development environment.

### 3.3 Branching Strategy

Create a dedicated branch for each change using a descriptive naming convention:

* `feature/<short-description>`
* `fix/<short-description>`
* `docs/<short-description>`
* `chore/<short-description>`

Example:

```bash
git checkout -b feature/customer-profile-sync
```

---

## 4. Coding Standards

* Follow existing project structure and conventions
* Write clear, maintainable, and well-documented code
* Ensure validation and error handling are implemented appropriately
* Security-sensitive logic must be explicitly reviewed and documented

---

## 5. Commit Message Convention

This project follows the **Conventional Commits** specification:

```
<type>: <short description>
```

### Allowed Types

* **feat** — New functionality
* **fix** — Bug fix
* **docs** — Documentation-only changes
* **style** — Formatting or stylistic changes (no functional impact)
* **refactor** — Code restructuring without behavior change
* **chore** — Build process, tooling, or dependency updates

Example:

```bash
git commit -m "feat: add Fayda response validation"
```

---

## 6. Testing and Validation

* All changes must be tested before submission
* Unit and integration tests should be updated or added where applicable
* Contributions that impact authentication, identity, or Core Banking integration require additional validation

---

## 7. Pull Request Requirements

When submitting a Pull Request (PR):

* Target the `main` branch unless instructed otherwise
* Provide a clear and professional title and description
* Reference related issues (e.g., `Closes #45`)
* Confirm that tests pass and no sensitive data is included
* Acknowledge that the contribution is subject to security and compliance review

Pull requests may be rejected or delayed if they do not meet security, quality, or compliance standards.

---

## 8. Security and Compliance

Given the nature of this system:

* Do not use real customer or production data in development or testing
* Do not commit secrets, credentials, certificates, or private keys
* Report security vulnerabilities responsibly through designated internal channels

Any suspected security issue must be escalated immediately and **must not** be disclosed publicly.

---

## 9. Code of Conduct

All contributors are expected to act professionally and respectfully. Harassment, discrimination, or unprofessional behavior will not be tolerated.

Violations should be reported to Omo Bank S.C. project administrators.

---

## 10. Legal Notice

By contributing to this repository, you acknowledge that:

* All contributions become the property of **Omo Bank S.C.**
* Contributions may be modified or removed at Omo Bank’s discretion
* No intellectual property rights are granted beyond those explicitly authorized

---

Thank you for supporting Fayda Connect and contributing to Omo Bank’s secure digital identity initiatives.
