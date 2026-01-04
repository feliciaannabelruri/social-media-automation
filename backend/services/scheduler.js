const cron = require('node-cron');
const Account = require('../models/Account');
const { postToInstagram, postToTikTok } = require('./socialMedia');
const logger = require('../utils/logger');

class PostScheduler {
  constructor() {
    this.scheduledPosts = new Map();
  }

  schedulePost(postData, scheduleTime) {
    const postId = Date.now().toString();
    const cronTime = this.convertToCronTime(scheduleTime);

    const task = cron.schedule(cronTime, async () => {
      try {
        logger.info(`Executing scheduled post: ${postId}`);
        
        for (const accountId of postData.accountIds) {
          const account = await Account.findById(accountId);
          
          if (account.instagram.enabled) {
            await postToInstagram(accountId, postData.mediaPath, postData.caption);
          }
          
          if (account.tiktok.enabled) {
            await postToTikTok(accountId, postData.mediaPath, postData.caption);
          }
        }
        
        logger.success(`Scheduled post completed: ${postId}`);
        this.cancelSchedule(postId);
      } catch (error) {
        logger.error(`Scheduled post failed: ${error.message}`);
      }
    });

    this.scheduledPosts.set(postId, {
      task,
      postData,
      scheduleTime
    });

    return postId;
  }

  cancelSchedule(postId) {
    const scheduled = this.scheduledPosts.get(postId);
    if (scheduled) {
      scheduled.task.stop();
      this.scheduledPosts.delete(postId);
      logger.info(`Canceled scheduled post: ${postId}`);
    }
  }

  convertToCronTime(date) {
    const d = new Date(date);
    return `${d.getMinutes()} ${d.getHours()} ${d.getDate()} ${d.getMonth() + 1} *`;
  }

  getAllScheduled() {
    return Array.from(this.scheduledPosts.entries()).map(([id, data]) => ({
      id,
      scheduleTime: data.scheduleTime,
      caption: data.postData.caption
    }));
  }
}

module.exports = new PostScheduler();
