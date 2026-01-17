/**
 * Admin Tool: Send Broadcast Notification
 *
 * Usage:
 * node admin-broadcast.js "Title" "Body" "screen"
 *
 * Example:
 * node admin-broadcast.js "🎯 Neue Features!" "Check out the new Insights!" "insights"
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
// Option 1: Use application default credentials (if deployed on Google Cloud)
// admin.initializeApp();

// Option 2: Use service account key
const serviceAccount = require('../google-services.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'vayze-918fc',
});

const db = admin.firestore();

// Get command line arguments
const args = process.argv.slice(2);
const title = args[0] || '🎯 Wichtige Nachricht';
const body = args[1] || 'Schau dir die neusten Updates an!';
const screen = args[2] || 'home';

async function sendBroadcast() {
  console.log('\n🚀 Sending broadcast notification...\n');
  console.log(`Title: ${title}`);
  console.log(`Body: ${body}`);
  console.log(`Screen: ${screen}\n`);

  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const userCount = usersSnapshot.size;

    console.log(`📤 Sending to ${userCount} users...\n`);

    // Import the send function from deployed cloud function
    // Note: This requires the function to be deployed first
    const { Expo } = require('expo-server-sdk');
    const expo = new Expo();

    let sentCount = 0;
    let failedCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;

      try {
        // Get user tokens
        const tokensSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('tokens')
          .get();

        const tokens = [];
        tokensSnapshot.forEach((doc) => {
          const token = doc.data().token;
          if (Expo.isExpoPushToken(token)) {
            tokens.push(token);
          }
        });

        if (tokens.length === 0) {
          console.log(`⚠️  No tokens for user ${userId}`);
          failedCount++;
          continue;
        }

        // Create messages
        const messages = tokens.map((token) => ({
          to: token,
          sound: 'default',
          title: title,
          body: body,
          data: { type: 'broadcast', screen: screen },
          priority: 'high',
        }));

        // Send
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }

        // Log to Firestore
        await db
          .collection('users')
          .doc(userId)
          .collection('notificationLog')
          .add({
            title,
            body,
            data: { type: 'broadcast', screen },
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            opened: false,
          });

        console.log(`✅ Sent to user ${userId}`);
        sentCount++;
      } catch (error) {
        console.error(`❌ Failed for user ${userId}:`, error.message);
        failedCount++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`✅ Success: ${sentCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`\n✨ Done!\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run
sendBroadcast();
