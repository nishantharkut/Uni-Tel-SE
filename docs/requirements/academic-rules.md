# Academic Rules Baseline

Source: IIITM Gwalior, Undergraduate and Integrated Postgraduate Ordinance 2025, approved through the 62nd Board of Governors meeting on 21 May 2025.

Official PDF: https://www.iiitm.ac.in/public/uploads/media_uploads/1768561107_UP-IPG-ordinances-2025.pdf

## Implemented Application Rules

### Grades and Grade Points

The app stores minus grades in normalized form, so ordinance grades `A(-)`, `B(-)`, and `C(-)` are represented as `A-`, `B-`, and `C-`.

| Grade | Points | GPA-bearing |
| --- | ---: | --- |
| A | 10 | Yes |
| A- | 9 | Yes |
| B | 8 | Yes |
| B- | 7 | Yes |
| C | 6 | Yes |
| C- | 5 | Yes |
| D | 4 | Yes |
| F | 0 | Yes |
| I | None | No |
| S | None | No |
| X | None | No |

`E` is not an IIITM UG/IPG ordinance grade and must not be accepted for new application data.

### SGPA and CGPA

SGPA and CGPA are weighted averages over GPA-bearing courses:

```text
SGPA = sum(course credits * grade points) / sum(course credits)
CGPA = sum(all applicable course credits * grade points) / sum(all applicable course credits)
```

`F` is included in the denominator with 0 points. `I`, `S`, `X`, audit courses, and ungraded courses are not included in GPA denominators.

### Earned Credits

Credits are earned only for grades `D` or better. `F`, `I`, `NP`, and audit courses do not count as earned credits.

### Attendance

The minimum required attendance is 75 percent per course. UI status labels below 75 percent must be treated as below the ordinance minimum.

### Assessment Weightage

The instructor announces course assessment distribution, but the ordinance caps theory-course components as follows:

| Component | Maximum weightage |
| --- | ---: |
| Minor examination | 30% |
| Other internal assessment | 30% |
| Major examination | 50% |

The current implementation validates a single marks record against these caps. Full aggregate validation per subject and assessment category belongs in the database contract PR.

## Database Contract Status

The frontend, import edge function, and fresh Supabase baseline now share the same rule intent. The authoritative schema is `supabase/migrations/20260817000000_initial_schema.sql`; generated Supabase types should be regenerated from the new project after the baseline is applied.
