# Event Model Reference

Event names are past-tense facts: `opportunity.discovered`, `opportunity.researched`, `opportunity.scored`, `opportunity.rejected`, `opportunity.approved`, `project.created`, `design.started`, `design.completed`, `design.review_failed`, `design.approved`, `build.started`, `build.completed`, `build.failed`, `qa.started`, `qa.failed`, `qa.passed`, `deployment.requested`, `deployment.approved`, `deployment.completed`, `deployment.failed`, `seo.issue_detected`, `seo.change_proposed`, `seo.change_applied`, `experiment.started`, `experiment.completed`, `learning.proposed`, `learning.validated`, and `learning.deprecated`.

Also emit workflow lifecycle, agent status, approval, policy, provider availability, cost, and audit events. The envelope is versioned and sanitized; consumers must accept unknown fields and reject unsupported major versions.
