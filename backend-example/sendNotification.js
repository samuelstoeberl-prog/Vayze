/**
 * Backend Example: Send Push Notifications with Firebase Admin SDK
 *
 * Setup:
 * 1. npm install firebase-admin
 * 2. Download serviceAccountKey.json from Firebase Console
 *    (Project Settings → Service Accounts → Generate new private key)
 * 3. Place serviceAccountKey.json in same folder
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Get all FCM tokens from Firestore
 */
async function getAllTokens() {
  const tokens = [];
  const usersSnapshot = await db.collection('users').get();

  for (const userDoc of usersSnapshot.docs) {
    const tokensSnapshot = await userDoc.ref.collection('tokens').get();
    tokensSnapshot.forEach((tokenDoc) => {
      tokens.push(tokenDoc.data().token);
    });
  }

  return tokens;
}

/**
 * Get tokens for a specific user
 */
async function getUserTokens(userId) {
  const tokens = [];
  const tokensSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('tokens')
    .get();

  tokensSnapshot.forEach((doc) => {
    tokens.push(doc.data().token);
  });

  return tokens;
}

/**
 * Send notification to all users
 */
async function sendToAllUsers(title, body, data = {}) {
  try {
    const tokens = await getAllTokens();

    if (tokens.length === 0) {
      console.log('❌ No tokens found');
      return;
    }

    console.log(`📤 Sending to ${tokens.length} devices...`);

    const message = {
      notification: {
        title: title,
        body: body,
      },
      data: data,
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);

    console.log(`✅ Successfully sent to ${response.successCount} devices`);
    console.log(`❌ Failed to send to ${response.failureCount} devices`);

    // Handle failed tokens
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error(`Failed: ${resp.error.message}`);
        }
      });

      // Clean up invalid tokens
      await cleanupInvalidTokens(failedTokens);
    }

    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification to specific user
 */
async function sendToUser(userId, title, body, data = {}) {
  try {
    const tokens = await getUserTokens(userId);

    if (tokens.length === 0) {
      console.log(`❌ No tokens found for user: ${userId}`);
      return;
    }

    const message = {
      notification: { title, body },
      data: data,
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log(`✅ Sent to user ${userId}: ${response.successCount} devices`);

    return response;
  } catch (error) {
    console.error('Error sending to user:', error);
    throw error;
  }
}

/**
 * Send notification to topic
 */
async function sendToTopic(topic, title, body, data = {}) {
  try {
    const message = {
      notification: { title, body },
      data: data,
      topic: topic,
    };

    const response = await admin.messaging().send(message);
    console.log(`✅ Sent to topic ${topic}:`, response);

    return response;
  } catch (error) {
    console.error('Error sending to topic:', error);
    throw error;
  }
}

/**
 * Clean up invalid tokens from Firestore
 */
async function cleanupInvalidTokens(invalidTokens) {
  console.log(`🗑️ Cleaning up ${invalidTokens.length} invalid tokens...`);

  for (const token of invalidTokens) {
    // Find and delete the token document
    const usersSnapshot = await db.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const tokenDoc = await userDoc.ref
        .collection('tokens')
        .doc(token)
        .get();

      if (tokenDoc.exists) {
        await tokenDoc.ref.delete();
        console.log(`🗑️ Deleted token from user ${userDoc.id}`);
      }
    }
  }
}

/**
 * Schedule notification for later
 */
async function scheduleNotification(userId, title, body, data, delayInSeconds) {
  try {
    const tokens = await getUserTokens(userId);

    if (tokens.length === 0) {
      console.log(`❌ No tokens found for user: ${userId}`);
      return;
    }

    // Note: FCM doesn't support scheduled messages directly
    // You need to use a scheduler like node-cron or cloud functions
    console.log(
      `⏰ Would schedule notification for ${delayInSeconds} seconds from now`
    );

    // Example with setTimeout (not production-ready):
    setTimeout(async () => {
      await sendToUser(userId, title, body, data);
    }, delayInSeconds * 1000);
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

// ========================================
// Example Usage
// ========================================

async function main() {
  console.log('🚀 Firebase Cloud Messaging Test\n');

  // Example 1: Send to all users
  await sendToAllUsers(
    '🎯 Neue Feature verfügbar!',
    'Entdecke die neue Board-Funktion in Vayze',
    {
      type: 'feature_announcement',
      screen: 'board',
    }
  );

  // Example 2: Send to specific user
  // await sendToUser(
  //   'user-email-here',
  //   '💡 Tägliche Erinnerung',
  //   'Hast du heute schon eine Entscheidung getroffen?',
  //   {
  //     type: 'daily_reminder',
  //     screen: 'assistant',
  //   }
  // );

  // Example 3: Send to topic
  // await sendToTopic(
  //   'all_users',
  //   '✨ Vayze Update',
  //   'Version 1.4.0 ist jetzt verfügbar!',
  //   {
  //     type: 'update',
  //     version: '1.4.0',
  //   }
  // );
}

// Run the examples
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

// Export functions for use in other files
module.exports = {
  sendToAllUsers,
  sendToUser,
  sendToTopic,
  scheduleNotification,
  getAllTokens,
  getUserTokens,
};
