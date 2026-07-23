# Product Progress Presentation Template

## Purpose

Present actual product progress. Use the real deadline whenever
available; otherwise, display an estimated date.

------------------------------------------------------------------------

# Weekly Meeting

Focus: - 1 completed version - 1 ongoing version - Current blockers -
Next week's plan

Recommended slides:

1.  Title
2.  Executive Summary
3.  Version Progress
4.  Current Feature Status
5.  Problem / Blocking
6.  Next Week Plan
7.  Q&A

------------------------------------------------------------------------

# Monthly Meeting

Focus: - Progress over the last 2 months - Completed versions - Current
ongoing versions - Roadmap

Recommended slides:

1.  Title
2.  Executive Summary
3.  Progress (Last 2 Months)
4.  Version Timeline
5.  Feature Progress
6.  Current Sprint / Current Version
7.  Timeline / Gantt
8.  Problem / Blocking
9.  Difficulty Analysis
10. Upcoming Release
11. Q&A

------------------------------------------------------------------------

# Slide Details

## 1. Executive Summary

  Metric                Value
  ------------------- -------
  Completed Version         x
  Ongoing Version           x
  Total Features            x
  Closed                    x
  In Progress               x
  Blocking                  x

Project Health

-   🟢 On Track
-   🟡 At Risk
-   🔴 Delayed

------------------------------------------------------------------------

## 2. Version Timeline

  Version   Status          Deadline   Actual
  --------- --------------- ---------- -----------
  v2.x.x    Closed          18 Jul     18 Jul
  v2.x.x    In Progress     31 Jul     Estimated
  v3.x.x    Specification   15 Aug     Estimated

Rule:

-   Released version → show Actual Release Date.
-   Unreleased version → show Estimated Release Date.

------------------------------------------------------------------------

## 3. Feature Progress

  Feature     Status          Difficulty   PIC     Deadline
  ----------- --------------- ------------ ------- ----------
  Feature A   Closed          Medium       Dev A   18 Jul
  Feature B   In Testing      Hard         Dev B   28 Jul
  Feature C   Specification   Hard         Dev C   5 Aug

------------------------------------------------------------------------

## 4. Recommended Workflow Status

    New / Waiting
          ↓
    Specification
          ↓
    In Progress
          ↓
    In Testing
          ↓
    Tested
          ↓
    Closed

    (On Hold can occur at any stage)

### Status Definition

  Status          Description
  --------------- ------------------------------------------------------
  New / Waiting   Waiting for prioritization or resource allocation
  Specification   Requirement analysis or PRD preparation
  In Progress     Under development
  In Testing      Being tested by QA/UAT
  Tested          Testing completed and ready for release
  Closed          Released and completed
  On Hold         Temporarily paused due to blocker or priority change

------------------------------------------------------------------------

## 5. Current Sprint / Current Version

Example:

  Feature               Progress
  ------------------- ----------
  Ticket Assignment         100%
  Auto Tagging               80%
  SLA Policy                 65%
  CRM Integration            25%

Progress bars may be used for easier visualization.

------------------------------------------------------------------------

## 6. Timeline / Gantt

Example:

    Week1   Week2   Week3   Week4

    Feature A ███████

    Feature B      ███████

    Feature C            ███████

    Today ↑

------------------------------------------------------------------------

## 7. Problem / Blocking

  Issue                 Impact   Owner      ETA
  --------------------- -------- ---------- --------
  Waiting API           High     External   TBD
  Requirement Changed   Medium   Product    25 Jul
  Database Migration    High     Backend    27 Jul

Severity

-   🟢 Low
-   🟡 Medium
-   🔴 High

------------------------------------------------------------------------

## 8. Difficulty Distribution

  Difficulty     Count
  ------------ -------
  Easy               x
  Medium             x
  Hard               x

A pie chart or bar chart is recommended.

------------------------------------------------------------------------

## 9. Upcoming Release

### Next Version

-   Feature A
-   Feature B
-   Feature C

Target Release

15 August

------------------------------------------------------------------------

# Dashboard Recommendation

  --------------------------------------------------------------------------------------
  Feature       Version   Status          Difficulty     Progress Deadline   Actual
  ------------- --------- --------------- ------------ ---------- ---------- -----------
  Ticket        v2.9.0    In Progress     Hard                70% 31 Jul     Estimated
  Visibility                                                                 

  SLA Dashboard v2.8.0    Closed          Medium             100% 18 Jul     18 Jul

  CRM           v3.0.0    Specification   Hard                20% 15 Aug     Estimated
  Integration                                                                
  --------------------------------------------------------------------------------------

------------------------------------------------------------------------

# Design Principles

-   Present actual progress instead of planned progress whenever
    possible.
-   Use actual deadlines if available; otherwise, clearly label dates as
    **Estimated**.
-   Keep slides concise and management-friendly.
-   Highlight blockers and risks early.
-   Show difficulty to explain development effort.
-   Use consistent status terminology across all reports.
