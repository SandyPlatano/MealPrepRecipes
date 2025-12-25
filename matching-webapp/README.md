# 🎲 Number Matching Webapp

A simple, real-time webapp for pairing people with matching numbers. Perfect for team building, secret santa, or any group pairing activity.

## Features

- 🔥 **Real-time sync** - Everyone sees updates instantly
- 📱 **Mobile-friendly** - Works on any device
- 🎯 **Auto-pairing** - Matches happen automatically when target is reached
- 🎨 **Clean UI** - Beautiful, modern design
- 🚀 **Zero setup** - Just open the HTML file in a browser

## How It Works

1. **Host creates session** → Sets number of participants (e.g., 50)
2. **Room code generated** → Share code with participants
3. **People join** → Each person enters room code + their name
4. **Auto-match** → When 50th person joins, everyone gets paired instantly
5. **See matches** → Everyone sees their matching number and partner

## Setup Instructions

### 1. Create Firebase Project (Free)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name your project (e.g., "number-matching")
4. Disable Google Analytics (not needed)
5. Click "Create Project"

### 2. Enable Realtime Database

1. In your Firebase project, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose location closest to your users
4. Start in **Test Mode** (we'll secure it next)
5. Click "Enable"

### 3. Configure Security Rules

In the Realtime Database "Rules" tab, paste:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true,
        "participants": {
          "$participantId": {
            ".write": true
          }
        }
      }
    }
  }
}
```

Click "Publish". This allows read/write only to session data.

### 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with a nickname (e.g., "Matching Webapp")
5. Copy the `firebaseConfig` object

### 5. Add Config to HTML File

1. Open `index.html` in a text editor
2. Find the Firebase configuration section (around line 330):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    // ...
};
```

3. Replace with your actual Firebase config
4. Save the file

### 6. Run the Webapp

**Option A: Open Locally**
- Just double-click `index.html`
- Share your screen or have everyone open the file

**Option B: Host Online (Recommended)**

Using GitHub Pages:
1. Create a GitHub repository
2. Push `index.html` to the repo
3. Enable GitHub Pages in repo settings
4. Share the GitHub Pages URL

Using Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Other options: Netlify, Vercel, or any static hosting service.

## Usage

### Creating a Session

1. Open the webapp
2. Click "Create New Session"
3. Enter number of participants (must be even)
4. Share the room code with participants

### Joining a Session

1. Open the webapp
2. Enter the room code
3. Click "Join Existing Session"
4. Enter your name
5. Wait for everyone to join

### Pairing

- Pairing happens **automatically** when everyone joins
- Everyone sees their number and match instantly
- View all pairs at the bottom of the screen

## Technical Details

### Data Structure

```
/sessions/{roomCode}
  - targetCount: 50
  - status: "waiting" | "paired"
  - participants: {
      {participantId}: {
        name: "John",
        number: 1,
        partnerId: {participantId},
        joinedAt: timestamp
      }
    }
```

### Pairing Algorithm

1. Wait for `participantCount === targetCount`
2. Shuffle all participant IDs randomly
3. Pair sequentially: `[0,1], [2,3], [4,5]...`
4. Assign matching numbers to each pair
5. Update status to "paired"

### Browser Support

Works on all modern browsers:
- Chrome/Edge (recommended)
- Safari
- Firefox
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

**"Firebase initialization error"**
- Make sure you replaced the Firebase config with your actual credentials
- Check that you copied the entire config object

**"Room code not found"**
- Verify the room code is correct (6 characters)
- Make sure Firebase Realtime Database is enabled

**Names not showing up**
- Check your internet connection
- Verify Firebase security rules are published
- Check browser console for errors (F12)

**Pairing not happening**
- Wait for exact target number (e.g., all 50 people)
- Refresh the page if stuck
- Check that target count was set to an even number

## Privacy & Data

- All data is stored in your Firebase project
- Sessions persist until you manually delete them
- To clear old sessions, go to Firebase Console → Realtime Database → Delete old session nodes
- No personal data is collected by this app

## Cost

Firebase free tier includes:
- 1 GB stored data
- 10 GB/month downloaded
- 100 concurrent connections

This is more than enough for typical use. Costs only apply if you exceed these limits.

## Customization

The app is a single HTML file - easy to customize:

**Colors:** Edit the CSS gradient values (lines 15-16, 53-54)
**Room code length:** Change `maxlength` in input and `generateRoomCode()` function
**Validation:** Add name length limits, profanity filters, etc.
**Styling:** Modify CSS classes for your brand

## License

Free to use and modify. No attribution required.

## Support

For issues or questions:
1. Check Firebase Console for database errors
2. Review browser console (F12) for JavaScript errors
3. Verify all setup steps were completed
4. Test with a smaller group (2-4 people) first

---

Made with ❤️ for easy group pairing
