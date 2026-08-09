DINGEL HAFIZIA MADRASA
PROFESSIONAL MADRASA ERP
========================================

PROJECT
-------
Dingel Hafizia Madrasa Management System

This project is designed as a professional responsive
Madrasa ERP for student management, fee collection,
due management and complete madrasa financial accounting.


MAIN FEATURES
-------------

1. Dashboard
   - Total Students
   - Fee Collection
   - Current Month Collection
   - Free Students
   - Total Due
   - Total Income
   - Total Expense
   - Current Balance

2. Admission
   - HIFZ
   - MOKTOB
   - ADNA ALIF
   - ADNA BA
   - General Student
   - Orphan / এতিম
   - Poor Student
   - Student Details
   - Guardian Details
   - Father / Mother
   - Phone
   - Date of Birth
   - Admission Date
   - Address
   - Monthly Fee
   - Student Aadhaar
   - Guardian Aadhaar
   - Notes

3. Student Management
   - Search Student
   - Filter by Class
   - Filter by Student Type
   - Student Profile
   - Edit Student
   - Delete Student
   - Student Fee History
   - Current Due
   - CSV Export

4. Fee Management
   - Monthly Fee
   - Fee Collection
   - Payment Method
   - Payment Reference
   - Auto Receipt Number
   - Fee History
   - Due Calculation
   - Professional Printable Receipt

5. Due Management
   - Current Month Due
   - Student-wise Due
   - Total Due
   - Due Collection

6. Income Management
   - Donation
   - Grant
   - Admission Fee
   - Zakat / Sadaqah
   - Other Income
   - Daily Income
   - Monthly Income
   - Yearly Income

7. Expense Management
   - Food
   - Salary
   - Electricity / Gas
   - Water
   - Medical
   - Education Supplies
   - Rent
   - Repair
   - Transport
   - Other Expense
   - Daily Expense
   - Monthly Expense
   - Yearly Expense

8. Madrasa Accounts
   - Daily Accounts
   - Monthly Accounts
   - Yearly Accounts
   - Total Income
   - Total Expense
   - Net Balance
   - Fee Income
   - Other Income
   - Expense Category Summary

9. Reports
   - Student Report
   - Fee Report
   - Due Report
   - Income Report
   - Expense Report
   - Monthly Financial Report
   - Yearly Financial Report
   - CSV Export
   - Printable Reports

10. Madrasa Profile
    - Madrasa Name
    - English Name
    - Address
    - Phone
    - Email
    - Academic Year
    - Currency
    - Opening Balance
    - Madrasa Logo


FILES
-----

index.html
Main application structure.

style.css
Premium responsive UI and mobile design.

app.js
Application logic including:
Firebase
Students
Admissions
Fees
Due
Income
Expenses
Accounts
Reports
CSV
Receipts
Settings

logo.png
Original Dingel Hafizia Madrasa logo.

students.json
Empty starter/fallback student data.

firebase-rules.txt
Current Firestore compatibility rules.

README.txt
Project setup and documentation.


GITHUB PAGES SETUP
------------------

Upload all required files to the repository ROOT.

Required files:

index.html
style.css
app.js
logo.png
students.json
firebase-rules.txt
README.txt


IMPORTANT:
Do not rename:

index.html
style.css
app.js
logo.png
students.json


LOGIN
-----

Current frontend login password:

123

IMPORTANT:
This is a frontend custom-password login.

It is NOT Firebase Authentication.


FIREBASE
--------

The Firebase configuration is included in app.js
for the current project setup.

The Firebase project must have Firestore enabled.

The current firebase-rules.txt is intentionally permissive
for compatibility/testing.


SECURITY WARNING
----------------

The current setup is NOT suitable for securely storing
real sensitive data.

In particular:

- Aadhaar
- Student photographs
- Guardian photographs
- Documents
- Other personal information

should not be stored in a real production environment
using the current permissive rules.

Before real production use:

1. Enable Firebase Authentication.
2. Replace the permissive Firestore rules.
3. Enable Firebase Storage if permanent photo/document
   storage is required.
4. Add restrictive Firebase Storage Rules.
5. Use authenticated-user access.
6. Validate user roles and permissions.
7. Avoid exposing sensitive information unnecessarily.


STUDENT PHOTOS AND DOCUMENTS
----------------------------

The current admission form can preview selected files
inside the browser.

It does NOT silently claim that files have been permanently
uploaded to Firebase Storage.

Permanent storage requires:

Firebase Storage
+
Authenticated users
+
Secure Storage Rules


OFFLINE / PWA
-------------

The project is designed to support responsive mobile use.

If manifest and service-worker files are included in the
final package, the application can also be prepared as
a Progressive Web App.

After GitHub Pages deployment, the website can be added
to a compatible phone home screen through the browser.


LANGUAGE
--------

The interface is designed to support:

Bangla
English


DATA
----

There are no demo students in students.json.

Students should be entered through the Admission module.


ACCOUNTING FORMULA
------------------

Total Income
=
Student Fee Income
+
Other Income

Net Balance
=
Total Income
-
Total Expense


ORPHAN / FREE STUDENT
---------------------

Students marked as:

Orphan

can have a monthly fee of:

0

This allows free/etim students to remain in the student
management system without being treated as normal paid
students.


BACKUP
------

Use the application's Backup function before making major
changes.

Keep backup JSON files in a safe location.

Do not upload real sensitive student backup files to a
public GitHub repository.


DEPLOYMENT
----------

For GitHub Pages:

1. Upload the files to the repository ROOT.
2. Open GitHub repository Settings.
3. Open Pages.
4. Select the required branch.
5. Select the repository ROOT folder.
6. Save.
7. Wait for GitHub Pages to publish.
8. Open the generated website address.


PRODUCTION CHECKLIST
--------------------

[ ] Firebase Authentication enabled
[ ] Secure Firestore Rules
[ ] Secure Storage Rules
[ ] Real logo checked
[ ] Madrasa profile completed
[ ] Student admission tested
[ ] Fee collection tested
[ ] Receipt printing tested
[ ] Due calculation tested
[ ] Income tested
[ ] Expense tested
[ ] Daily accounts tested
[ ] Monthly accounts tested
[ ] Yearly accounts tested
[ ] Reports tested
[ ] Backup tested
[ ] Restore tested
[ ] Mobile layout tested
[ ] Desktop layout tested


PROJECT STATUS
--------------

Professional ERP foundation.

Attendance module:
NOT INCLUDED

Exam module:
NOT INCLUDED

Library module:
NOT INCLUDED


DINGEL HAFIZIA MADRASA
Professional Madrasa Management System
========================================
