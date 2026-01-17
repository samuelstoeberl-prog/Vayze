# 🚀 Vayze Notification Backend

Backend für das Versenden von Push-Notifications an Vayze App-Nutzer.

---

## 📦 Setup

### 1. Dependencies installieren
```bash
cd backend-example
npm install
```

### 2. Service Account Key herunterladen
1. Gehe zu [Firebase Console](https://console.firebase.google.com)
2. Projekt **vayze-918fc** öffnen
3. **Projekt-Einstellungen** → **Service Accounts**
4. **"Generate new private key"** klicken
5. Datei als `serviceAccountKey.json` speichern
6. In `backend-example/` Ordner legen

### 3. Test
```bash
npm run test
```

✅ Sollte eine Test-Notification an alle User senden

---

## 🎯 Notifications senden

### An alle User
```bash
npm run send
```

### Tägliche Erinnerung (einmalig)
```bash
npm run send-daily
```

### Tägliche Erinnerung (automatisch jeden Tag um 19:00)
```bash
node schedules/dailyReminder.js --cron
```

---

## 📝 Eigene Notification senden

### Methode 1: Code bearbeiten

Bearbeite `sendNotification.js`:

```javascript
// Am Ende der Datei:
async function main() {
  await sendToAllUsers(
    '🎯 Dein Titel',
    'Dein Notification-Text',
    {
      type: 'custom',
      screen: 'board', // oder 'tracker', 'insights'
    }
  );
}
```

Dann ausführen:
```bash
node sendNotification.js
```

### Methode 2: Als Modul verwenden

Erstelle neue Datei `custom.js`:

```javascript
const { sendToAllUsers, sendToUser } = require('./sendNotification');

async function main() {
  // An alle
  await sendToAllUsers(
    '✨ Neues Update!',
    'Version 1.4.0 ist verfügbar'
  );

  // An bestimmten User
  await sendToUser(
    'user@example.com',
    '💡 Persönliche Nachricht',
    'Hallo! Hier ist deine personalisierte Notification'
  );
}

main();
```

---

## 🕐 Automatisierte Notifications

### Täglich um 19:00 Uhr
```bash
node schedules/dailyReminder.js --cron
```

### Mit PM2 (läuft permanent im Hintergrund)
```bash
npm install -g pm2
pm2 start schedules/dailyReminder.js --name "vayze-daily" -- --cron
pm2 logs vayze-daily
pm2 status
```

### Mit Systemd (Linux Server)

Erstelle `/etc/systemd/system/vayze-notifications.service`:

```ini
[Unit]
Description=Vayze Daily Notifications
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend-example
ExecStart=/usr/bin/node schedules/dailyReminder.js --cron
Restart=always

[Install]
WantedBy=multi-user.target
```

Dann:
```bash
sudo systemctl enable vayze-notifications
sudo systemctl start vayze-notifications
sudo systemctl status vayze-notifications
```

---

## 📡 API-Funktionen

### sendToAllUsers(title, body, data)
Sendet an alle registrierten User.

```javascript
await sendToAllUsers(
  '🎯 Titel',
  'Nachricht',
  { screen: 'board' }
);
```

### sendToUser(userId, title, body, data)
Sendet an spezifischen User (email als ID).

```javascript
await sendToUser(
  'user@example.com',
  '💡 Persönlich',
  'Nur für dich!',
  { type: 'personal' }
);
```

### sendToTopic(topic, title, body, data)
Sendet an Topic (z.B. 'all_users', 'premium_users').

```javascript
await sendToTopic(
  'all_users',
  '✨ Topic-Nachricht',
  'An alle Topic-Subscriber'
);
```

---

## 🎨 Notification-Typen

### 1. Daily Reminder
```javascript
{
  title: '🧠 Zeit für eine kluge Entscheidung',
  body: 'Treffe heute eine durchdachte Wahl',
  data: {
    type: 'daily_reminder',
    screen: 'assistant'
  }
}
```

### 2. Review Reminder
```javascript
{
  title: '🔄 Review anstehend',
  body: 'Wie lief deine Entscheidung?',
  data: {
    type: 'review_reminder',
    decisionId: '123',
    screen: 'tracker'
  }
}
```

### 3. Feature Announcement
```javascript
{
  title: '✨ Neues Feature!',
  body: 'Entdecke die Board-Funktion',
  data: {
    type: 'feature',
    screen: 'board'
  }
}
```

### 4. Streak Motivation
```javascript
{
  title: '🔥 5-Tage Streak!',
  body: 'Weiter so! Du bist auf Erfolgskurs',
  data: {
    type: 'streak',
    screen: 'tracker'
  }
}
```

---

## 🐛 Troubleshooting

### "Authentication error"
- Check: `serviceAccountKey.json` existiert
- Check: Firebase Admin SDK korrekt initialisiert

### "No tokens found"
- Check: User haben sich in der App angemeldet
- Check: FCM Token wurden in Firestore gespeichert
- Check: Firestore Collection: `users/{userId}/tokens/{token}`

### "Failed to send"
- Check: Internet-Verbindung
- Check: Firebase Cloud Messaging API aktiviert
- Check: Tokens noch gültig (alte Tokens löschen)

---

## 📊 Monitoring

### Firestore Console
Check gespeicherte Tokens:
```
users/
  └── user@example.com/
      └── tokens/
          └── ExponentPushToken[...]/
              ├── token: "ExponentPushToken[...]"
              ├── createdAt: "2025-01-08..."
              ├── platform: "android"
              └── appVersion: "1.3.0"
```

### Firebase Console
- **Cloud Messaging** → Statistiken
- **Analytics** → Events

---

## 🚀 Production Deployment

### Heroku
```bash
heroku create vayze-notifications
git add .
git commit -m "Add notification backend"
git push heroku main
heroku logs --tail
```

### Railway
```bash
railway login
railway init
railway up
railway logs
```

### Docker
```bash
docker build -t vayze-notifications .
docker run -d --name vayze-notifications vayze-notifications
docker logs -f vayze-notifications
```

---

## 🔒 Sicherheit

1. **Nie committen:**
   - ❌ `serviceAccountKey.json`
   - ❌ Firebase Server Keys
   - ❌ User Tokens

2. **.gitignore:**
```
serviceAccountKey.json
*.log
node_modules/
.env
```

3. **Environment Variables:**
```bash
export FIREBASE_PROJECT_ID="vayze-918fc"
export FIREBASE_CREDENTIALS="$(cat serviceAccountKey.json)"
```

---

## 📚 Weitere Beispiele

- `sendNotification.js` - Hauptfunktionen
- `schedules/dailyReminder.js` - Tägliche Erinnerungen
- `schedules/weeklyReview.js` - Wöchentliche Reviews (TODO)

---

🎉 **Viel Erfolg mit deinen Push-Notifications!**
