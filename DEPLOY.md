
FIREBASE HOSTING DEPLOYMENT — NEXT.JS
=====================================

Project: ai-client-system

1. INSTALL FIREBASE CLI
-----------------------
npm install -g firebase-tools

2. LOGIN TO FIREBASE
--------------------
firebase login

3. LIST FIREBASE PROJECTS
-------------------------
firebase projects:list

4. SELECT FIREBASE PROJECT
--------------------------
firebase use --add

Choose the correct existing Firebase project and set an alias.

5. CONFIGURE next.config.ts
---------------------------
Add static export and disable incompatible features:

output: "export",
cacheComponents: false,
partialPrefetching: false,

6. CHECK firebase.json
----------------------
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}

7. BUILD NEXT.JS
----------------
npm run build

8. CHECK EXPORTED FILES
-----------------------
ls -la out
ls -la out/index.html

9. DEPLOY TO FIREBASE HOSTING
-----------------------------
firebase deploy --only hosting

10. CHECK CURRENT FIREBASE PROJECT
----------------------------------
firebase use

11. DEPLOY TO A SPECIFIC PROJECT
--------------------------------
firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID

Replace YOUR_FIREBASE_PROJECT_ID with your actual Firebase project ID.

12. IF THE FIREBASE WELCOME PAGE STILL APPEARS
----------------------------------------------
cat firebase.json
ls -la out
head -n 20 out/index.html

Confirm that firebase.json points to "out" and that out/index.html contains
your Next.js application, not the default Firebase welcome page.

13. REBUILD AND DEPLOY AGAIN
----------------------------
npm run build
firebase deploy --only hosting

IMPORTANT
---------
- Run commands from your ai-client-system project directory.
- Fix all build errors before deploying.
- Static Firebase Hosting serves exported frontend files only.
- Next.js API routes and server-side MT5 trading require a suitable backend.
- Never expose private API keys or broker credentials in client-side code.
