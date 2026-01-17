/**
 * Daily Reminder - Sends motivational notifications every day at 7 PM
 *
 * Usage:
 * node schedules/dailyReminder.js
 *
 * Or with cron (runs continuously):
 * npm install node-cron
 * node schedules/dailyReminder.js --cron
 */

const cron = require('node-cron');
const { sendToTopic } = require('../sendNotification');

const MOTIVATIONAL_MESSAGES = [
  {
    title: '🧠 Zeit für eine kluge Entscheidung',
    body: 'Treffe heute eine durchdachte Wahl mit Vayze',
  },
  {
    title: '✨ Deine beste Entscheidung wartet',
    body: 'Klarheit beginnt mit dem ersten Schritt',
  },
  {
    title: '🎯 Bereit für Klarheit?',
    body: 'Nutze Vayze für deine nächste wichtige Entscheidung',
  },
  {
    title: '💡 Entscheidungen mit Zuversicht',
    body: 'Analysiere deine Optionen und triff die richtige Wahl',
  },
  {
    title: '🌟 Dein Entscheidungs-Moment',
    body: 'Finde heraus, was wirklich zählt',
  },
  {
    title: '🚀 Fortschritt beginnt jetzt',
    body: 'Eine gute Entscheidung kann alles verändern',
  },
  {
    title: '🎨 Gestalte dein Leben',
    body: 'Jede Entscheidung ist ein Schritt in die richtige Richtung',
  },
  {
    title: '🔮 Klarheit finden',
    body: 'Vayze hilft dir, die richtige Wahl zu treffen',
  },
  {
    title: '💪 Selbstbewusst entscheiden',
    body: 'Du hast die Kontrolle über deine Entscheidungen',
  },
  {
    title: '🌈 Mach es möglich',
    body: 'Zeit, eine Entscheidung zu treffen, auf die du stolz bist',
  },
];

async function sendDailyReminder() {
  try {
    // Pick random message
    const message =
      MOTIVATIONAL_MESSAGES[
        Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)
      ];

    console.log(`📤 Sending daily reminder: "${message.title}"`);

    await sendToTopic('all_users', message.title, message.body, {
      type: 'daily_reminder',
      screen: 'assistant',
      timestamp: new Date().toISOString(),
    });

    console.log('✅ Daily reminder sent successfully!');
  } catch (error) {
    console.error('❌ Error sending daily reminder:', error);
  }
}

// Check if running with --cron flag
const useCron = process.argv.includes('--cron');

if (useCron) {
  console.log('🕐 Starting cron scheduler...');
  console.log('📅 Daily reminder will be sent every day at 7:00 PM');

  // Schedule for 7:00 PM every day (19:00)
  cron.schedule('0 19 * * *', async () => {
    console.log(`\n⏰ ${new Date().toLocaleString()} - Running daily reminder...`);
    await sendDailyReminder();
  });

  console.log('✅ Cron scheduler started. Press Ctrl+C to stop.\n');
} else {
  // Run once immediately
  console.log('📤 Sending one-time daily reminder...\n');
  sendDailyReminder()
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}
