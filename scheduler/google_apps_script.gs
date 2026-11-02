/**
 * Free external daily trigger for the Serial Recap Bot (Google Apps Script)
 *
 * WHY USE THIS INSTEAD OF GITHUB CRON:
 * GitHub Actions `schedule` cron frequently delays jobs by 30-90 minutes or drops runs under load.
 * Google Apps Script runs on Google's infrastructure in your exact timezone (`Asia/Kolkata` IST)
 * for 100% free and triggers GitHub Actions via REST API at 12:00 AM IST sharp.
 *
 * HOW TO SET UP (Takes 2 minutes, 100% Free):
 * 1. Go to https://script.google.com -> click "New Project".
 * 2. Paste this entire file into `Code.gs`.
 * 3. Fill in `GITHUB_PAT` (a GitHub Personal Access Token with `repo` and `workflow` scope).
 * 4. In the top toolbar, select `setupTriggers` from the function dropdown and click "Run" once.
 *    - It will automatically create:
 *      a) A 12:00 AM IST midnight trigger (`triggerNightly12AM`) to start all 8 shows.
 */

const GITHUB_OWNER = "lawkushwrites";
const GITHUB_REPO  = "serial-recap-bot";
const GITHUB_PAT   = "";
const WORKFLOW_FILE = "recap.yml";
const BRANCH        = "main";

/**
 * Run this function ONCE in Google Apps Script editor to install the daily 12:00 AM IST trigger.
 */
function setupTriggers() {
  // Remove any old duplicate triggers first
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // 1. Exact 12:00 AM IST (Midnight) Nightly Trigger
  ScriptApp.newTrigger("triggerNightly12AM")
    .timeBased()
    .atHour(0)
    .nearMinute(1)
    .everyDays(1)
    .inTimezone("Asia/Kolkata")
    .create();

  Logger.log("Installed 12:00 AM IST nightly trigger.");
}

/**
 * Fires at 12:00 AM IST every night to generate all 8 videos for their 4:00 PM through 9:00 AM IST slots.
 */
function triggerNightly12AM() {
  dispatchWorkflow("all");
}

function dispatchWorkflow(onlyShow) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
  const payload = {
    ref: BRANCH,
    inputs: {
      only_show: onlyShow,
      video_id: "",
      test_mode: "false",
      upload: "true",
      publish_now: "false"
    }
  };
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    headers: ghHeaders(),
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  Logger.log(`Dispatched workflow (only_show=${onlyShow}): HTTP ${res.getResponseCode()}`);
}

function ghHeaders() {
  return {
    "Authorization": "Bearer " + GITHUB_PAT,
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}
