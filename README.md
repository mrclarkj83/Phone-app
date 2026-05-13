# DragonMath Linear Equations

Firebase-backed Algebra I assignment app for the Doral roster.

## Pages

- `index.html` is the student assignment page.
- `teacher.html` is the live teacher dashboard.

## Features

- Google sign-in through Firebase Authentication.
- Assignment selector with 30 linear-equation problems and a 15-problem systems set.
- Different problem sets for each rostered student and assignment.
- Instant correct or try-again feedback while students type.
- Firestore progress saves and submitted grades.
- Firebase Storage JSON report for each submitted assignment.
- Teacher dashboard with live class metrics, roster status, report links, CSV export, and clear-submissions control.

## Firebase

The app uses project `dragonmath-f6f56`.

Firestore paths:

- `assignments/{assignmentId}/progress/{studentId}`
- `assignments/{assignmentId}/submissions/{studentId}`

Storage path:

- `assignments/{assignmentId}/submissions/{studentId}.json`

For GitHub Pages auth, add `mrclarkj83.github.io` to Firebase Authentication authorized domains.

Rule templates are included in `firestore.rules` and `storage.rules`. Deploy them with the Firebase CLI when ready:

```bash
firebase deploy --only firestore:rules,storage
```

## Local Test

Because the app uses browser modules, test from a local server:

```bash
python -m http.server 5173
```

Then open `http://localhost:5173/index.html` or `http://localhost:5173/teacher.html`.
