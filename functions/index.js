/**
 * Decisio Cloud Functions
 * Minimale, kostenlose Push-Notification-Lösung
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all Expo Push Tokens for a user
 */
async function getUserTokens(userId) {
  try {
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

    return tokens;
  } catch (error) {
    console.error(`Error getting tokens for user ${userId}:`, error);
    return [];
  }
}

/**
 * Send Expo Push Notification
 */
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    const tokens = await getUserTokens(userId);

    if (tokens.length === 0) {
      console.log(`No valid tokens for user ${userId}`);
      return { success: false, reason: 'no_tokens' };
    }

    // Check rate limits
    const canSend = await checkRateLimits(userId);
    if (!canSend) {
      console.log(`Rate limit exceeded for user ${userId}`);
      return { success: false, reason: 'rate_limit' };
    }

    // Create messages
    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      priority: 'high',
    }));

    // Send in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending chunk:', error);
      }
    }

    // Log notification
    await logNotification(userId, title, body, data);

    // Update rate limit
    await updateRateLimits(userId);

    console.log(`✅ Sent notification to user ${userId}: ${title}`);
    return { success: true, tickets };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user can receive more notifications (Rate Limiting)
 */
async function checkRateLimits(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData || !userData.notificationSettings) {
      return true; // Allow if no settings exist yet
    }

    const rateLimits = userData.notificationSettings.rateLimits || {};
    const lastSentAt = rateLimits.lastSentAt
      ? new Date(rateLimits.lastSentAt)
      : null;
    const sentToday = rateLimits.sentToday || 0;

    // Check if last notification was sent today
    const now = new Date();
    const isToday =
      lastSentAt &&
      lastSentAt.toDateString() === now.toDateString();

    // Reset counter if new day
    if (!isToday) {
      return true;
    }

    // Max 2 notifications per day
    if (sentToday >= 2) {
      return false;
    }

    // Min 4 hours between notifications
    if (lastSentAt) {
      const hoursSince = (now - lastSentAt) / (1000 * 60 * 60);
      if (hoursSince < 4) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking rate limits:', error);
    return true; // Allow on error
  }
}

/**
 * Update rate limit counters
 */
async function updateRateLimits(userId) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const rateLimits = userData?.notificationSettings?.rateLimits || {};
    const lastSentAt = rateLimits.lastSentAt
      ? new Date(rateLimits.lastSentAt)
      : null;

    const now = new Date();
    const isToday =
      lastSentAt &&
      lastSentAt.toDateString() === now.toDateString();

    await userRef.set(
      {
        notificationSettings: {
          rateLimits: {
            lastSentAt: now.toISOString(),
            sentToday: isToday ? (rateLimits.sentToday || 0) + 1 : 1,
          },
        },
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error updating rate limits:', error);
  }
}

/**
 * Log notification to analytics
 */
async function logNotification(userId, title, body, data) {
  try {
    await db
      .collection('users')
      .doc(userId)
      .collection('notificationLog')
      .add({
        title,
        body,
        data,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        opened: false,
      });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

/**
 * Get user's last decision timestamp
 */
async function getLastDecisionTimestamp(userId) {
  try {
    const decisionsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('decisions')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (decisionsSnapshot.empty) {
      return null;
    }

    const lastDecision = decisionsSnapshot.docs[0].data();
    return new Date(lastDecision.createdAt);
  } catch (error) {
    console.error('Error getting last decision:', error);
    return null;
  }
}

/**
 * Calculate current streak from Firestore
 */
async function calculateStreak(userId) {
  try {
    const decisionsSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('decisions')
      .where('completedAt', '!=', null)
      .orderBy('completedAt', 'desc')
      .get();

    if (decisionsSnapshot.empty) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique dates
    const dates = new Set();
    decisionsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.completedAt) {
        const date = new Date(data.completedAt);
        dates.add(date.toDateString());
      }
    });

    const sortedDates = Array.from(dates).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      if (sortedDates.includes(checkDate.toDateString())) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const dayDiff = Math.floor(
        (prevDate - currDate) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    return { currentStreak, longestStreak };
  } catch (error) {
    console.error('Error calculating streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
}

// ============================================
// CLOUD FUNCTIONS
// ============================================

/**
 * 1. STREAK WARNING (täglich 20:00 Uhr UTC)
 * Warnt User deren Streak heute endet
 */
exports.streakWarningDaily = functions.pubsub
  .schedule('0 20 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('🔥 Running daily streak warning...');

    try {
      const usersSnapshot = await db.collection('users').get();
      let sentCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // Calculate streak
        const { currentStreak } = await calculateStreak(userId);

        if (currentStreak === 0) continue; // Skip users without streak

        // Check if user made a decision today
        const lastDecisionTime = await getLastDecisionTimestamp(userId);
        const today = new Date();

        const madeDecisionToday =
          lastDecisionTime &&
          lastDecisionTime.toDateString() === today.toDateString();

        if (madeDecisionToday) continue; // Streak is safe

        // Send warning
        const result = await sendPushNotification(
          userId,
          `🔥 Dein ${currentStreak}-Tage-Streak läuft heute ab!`,
          'Eine kleine Entscheidung reicht, um deinen Streak zu halten.',
          {
            type: 'streak_warning',
            streak: currentStreak,
            screen: 'assistant',
          }
        );

        if (result.success) {
          sentCount++;
        }
      }

      console.log(`✅ Sent ${sentCount} streak warnings`);
      return null;
    } catch (error) {
      console.error('Error in streakWarningDaily:', error);
      return null;
    }
  });

/**
 * 2. STREAK MILESTONE (Firestore Trigger)
 * Feuert bei jedem Streak Milestone (7, 14, 21, 30, etc.)
 */
exports.onStreakMilestone = functions.firestore
  .document('users/{userId}/decisions/{decisionId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const decision = snap.data();

    if (!decision.completedAt) return; // Only for completed decisions

    try {
      // Calculate new streak
      const { currentStreak } = await calculateStreak(userId);

      // Check if milestone (every 7 days)
      if (currentStreak > 0 && currentStreak % 7 === 0) {
        await sendPushNotification(
          userId,
          `🎉 Wow! ${currentStreak} Tage Streak!`,
          'Du bist ein Entscheidungs-Profi! Weiter so!',
          {
            type: 'streak_milestone',
            streak: currentStreak,
            screen: 'tracker',
          }
        );

        console.log(`✅ Sent milestone notification for user ${userId}`);
      }

      // Update user's streak in Firestore
      await db
        .collection('users')
        .doc(userId)
        .set(
          {
            activity: {
              currentStreak,
              lastDecisionAt: decision.completedAt,
            },
          },
          { merge: true }
        );
    } catch (error) {
      console.error('Error in onStreakMilestone:', error);
    }
  });

/**
 * 3. RE-ENGAGEMENT (täglich 10:00 Uhr UTC)
 * Sendet Notification an inaktive User (7 Tage keine Aktivität)
 */
exports.reEngagementDaily = functions.pubsub
  .schedule('0 10 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('👋 Running re-engagement check...');

    try {
      const usersSnapshot = await db.collection('users').get();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let sentCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        // Check if already sent re-engagement recently
        const lastReEngagement = userData.activity?.lastReEngagementAt;
        if (lastReEngagement) {
          const lastReEngagementDate = new Date(lastReEngagement);
          const daysSince =
            (new Date() - lastReEngagementDate) / (1000 * 60 * 60 * 24);
          if (daysSince < 14) continue; // Only every 14 days
        }

        // Get last decision
        const lastDecisionTime = await getLastDecisionTimestamp(userId);

        if (!lastDecisionTime || lastDecisionTime < sevenDaysAgo) {
          // User is inactive
          const result = await sendPushNotification(
            userId,
            'Hey 👋 Wir vermissen dich!',
            'Bereit für die nächste klare Entscheidung?',
            {
              type: 're_engagement',
              screen: 'assistant',
            }
          );

          if (result.success) {
            sentCount++;

            // Mark re-engagement sent
            await db
              .collection('users')
              .doc(userId)
              .set(
                {
                  activity: {
                    lastReEngagementAt: new Date().toISOString(),
                  },
                },
                { merge: true }
              );
          }
        }
      }

      console.log(`✅ Sent ${sentCount} re-engagement notifications`);
      return null;
    } catch (error) {
      console.error('Error in reEngagementDaily:', error);
      return null;
    }
  });

/**
 * 4. MANUAL BROADCAST (HTTPS Callable Function)
 * Ermöglicht manuelles Senden von Notifications an alle User
 */
exports.sendBroadcast = functions.https.onCall(async (data, context) => {
  // Security: Only allow authenticated admin users
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
    );
  }

  const { title, body, screen = 'home', userIds = null } = data;

  if (!title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Title and body are required'
    );
  }

  try {
    let targetUsers;

    if (userIds && Array.isArray(userIds)) {
      // Send to specific users
      targetUsers = userIds;
    } else {
      // Send to all users
      const usersSnapshot = await db.collection('users').get();
      targetUsers = usersSnapshot.docs.map((doc) => doc.id);
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const userId of targetUsers) {
      const result = await sendPushNotification(userId, title, body, {
        type: 'broadcast',
        screen: screen,
      });

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    console.log(
      `✅ Broadcast sent to ${sentCount} users, ${failedCount} failed`
    );

    return {
      success: true,
      sentCount,
      failedCount,
    };
  } catch (error) {
    console.error('Error in sendBroadcast:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * 5. SYNC STREAK TO FIRESTORE (HTTPS Callable)
 * Allows app to manually sync streak when needed
 */
exports.syncStreak = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated'
    );
  }

  const userId = context.auth.uid;

  try {
    const streakData = await calculateStreak(userId);

    await db
      .collection('users')
      .doc(userId)
      .set(
        {
          activity: {
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak,
            lastSyncedAt: new Date().toISOString(),
          },
        },
        { merge: true }
      );

    return {
      success: true,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
    };
  } catch (error) {
    console.error('Error syncing streak:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
