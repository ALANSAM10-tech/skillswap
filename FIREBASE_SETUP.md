# Firebase Setup Guide for SkillSwap

To activate the Firebase Firestore database for your SkillSwap backend, follow these step-by-step instructions to create a project and add the credentials to your environment.

---

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter a project name (e.g., `skillswap-app`), accept the terms, and click **Continue**.
4. (Optional) You can enable or disable Google Analytics for this project, then click **Continue**.
5. Click **Create project** and wait for it to compile. Click **Continue** once ready.

---

## Step 2: Enable Cloud Firestore Database

1. In the Firebase Console left-sidebar menu, click **Build** -> **Firestore Database**.
2. Click the **Create database** button.
3. Select your Database Location (nearest to you) and click **Next**.
4. Start in **Test mode** (or production mode) and click **Create**. This initializes your cloud Firestore collections.

---

## Step 3: Generate Service Account Key Credentials

1. In the Firebase Console, click the **Gear Icon** (Project Settings) next to *Project Overview* in the top left-sidebar.
2. Select **Project settings**.
3. Go to the **Service accounts** tab at the top.
4. Select **Node.js** as the configuration option, and click the **Generate new private key** button at the bottom of the page.
5. In the warning pop-up, click **Generate key**.
6. A `.json` file containing your credentials will automatically download to your computer.

---

## Step 4: Add Credentials to server/.env

Open the downloaded `.json` credentials file, and copy the corresponding values into [server/.env](file:///d:/web%20app/server/.env):

1. **`FIREBASE_PROJECT_ID`**: Copy the value of `"project_id"` from the JSON.
2. **`FIREBASE_CLIENT_EMAIL`**: Copy the value of `"client_email"` from the JSON.
3. **`FIREBASE_PRIVATE_KEY`**: Copy the entire value of `"private_key"` (including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` strings). 
   *Note: In the `.env` file, keep it on a single line or make sure newline characters are preserved as `\n`.*

Example format inside [server/.env](file:///d:/web%20app/server/.env):
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
```

---

## Step 5: Start the Server

Start your development server:
```bash
cmd /c "npm run dev"
```
The backend will automatically detect the three environment variables, connect to your cloud database, and print:
`Successfully connected to Firebase Firestore!`

All database operations (creating users, search matchmaker, sending swap requests, reviews, sessions, messaging) will now execute directly against your cloud Firestore database!
