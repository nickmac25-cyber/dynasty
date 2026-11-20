# Setup, step by step

Use a **computer** for this. It takes about 25 minutes. Part A gets the tool working. Part B adds news and scheme matchups, and you can skip it and come back later.

You need a free GitHub account. If you don't have one, make one at github.com first.

---

## Part A: Put the tool online

**1. Make a new repository**
- Go to github.com and sign in.
- Click the **+** at the top right, then **New repository**.
- Repository name: type `dynasty`
- Choose **Public**. (It must be public so the page can read its own data.)
- Tick **Add a README file**.
- Click **Create repository**.

**2. Upload the files**
- Unzip `dynasty-desk.zip` on your computer. You'll get a folder called `dynasty-desk`.
- In your new repo, click **Add file**, then **Upload files**.
- Open the unzipped folder and drag in **everything inside it**: `index.html`, `config.json`, `README.md`, `SETUP-STEP-BY-STEP.md`, `.gitignore`, the `scripts` folder, and the `copy-paste-workflows` folder.
- If it asks about replacing README.md, that's fine.
- Scroll down and click **Commit changes**.

**3. Turn on the website**
- In your repo, click **Settings** (top row).
- In the left menu click **Pages**.
- Under **Build and deployment**, set **Source** to **Deploy from a branch**.
- Under **Branch**, pick **main** and **/ (root)**, then click **Save**.
- Wait 1 to 2 minutes and refresh that page. It will show: "Your site is live at https://YOURNAME.github.io/dynasty/"

**4. Test it**
- Open that link.
- Type your Sleeper username, pick the season, and click the load button.
- You should see your leagues, then your roster and values.
- If you see red error text, copy it and send it to me.

You now have a working tool. Stop here if you want. Part B adds news and scheme matchups.

---

## Part B: Turn on news and scheme matchups

GitHub hides folders that start with a dot, so you'll create two small files by hand.

**5. Create the first job file**
- In your repo, click **Add file**, then **Create new file**.
- In the name box at the top, type exactly: `.github/workflows/update.yml`
  (When you type each `/`, GitHub turns it into a folder. That's right.)
- Open `copy-paste-workflows/update.yml.txt` from the unzipped folder in any text editor, select all, copy.
- Paste it into the big text box in GitHub.
- Click **Commit changes**, then **Commit changes** again.

**6. Create the second job file**
- Click **Add file**, then **Create new file**.
- Name: `.github/workflows/matchups.yml`
- Copy everything from `copy-paste-workflows/matchups.yml.txt`, paste it in.
- Click **Commit changes**, then **Commit changes** again.

**7. Put in your details**
- Click `config.json` in the file list, then the **pencil icon** (Edit).
- Replace `YOUR_SLEEPER_USERNAME` with your Sleeper username.
- Replace `YOUR_LEAGUE_ID` with your league's ID. To find it, open your league on sleeper.com. The long number at the end of the web address is the ID.
- Your league format is already set to 1QB, 1 PPR, 12 teams. If yours is different, change `"numQbs"` to 2 for superflex, `"ppr"` to 0.5 or 0, and `"teams"` to your team count.
- Click **Commit changes**.

**8. Let the jobs save files**
- Go to **Settings**, then **Actions** in the left menu, then **General**.
- Scroll to **Workflow permissions**.
- Choose **Read and write permissions**.
- Click **Save**.

**9. Run both jobs once**
- Click the **Actions** tab.
- If you see a green button asking you to enable workflows, click it.
- In the left list click **update-data**, then **Run workflow** (right side), then the green **Run workflow** button.
- Wait about a minute. A **green check** means it worked.
- Do the same for **update-matchups**. This one can take up to 10 minutes the first time.
- If either shows a **red X**, click it, open the failed step, and copy the error to send me.

**10. Check the data exists**
- Go back to the **Code** tab.
- Click the branch dropdown (it says **main**). You should see a branch called **data**.
- Switch to it. You should see `news.json` and `matchups.json`.

**11. Connect the tool**
- Open your website.
- Go to the **Start/Sit** tab.
- In the box that says "data repo", type `YOURNAME/dynasty` (your GitHub name, a slash, the repo name).
- Press **Optimize lineup**. Reasoning for receivers should now mention things like "BUF plays 70% zone" or "allows X points per game to WR2s."

---

## Check that it's accurate

I couldn't test the tool against your real league, so check these:
1. **Roster** matches what you see in Sleeper.
2. **Start/Sit** summary does **not** say projections were unavailable. If it does, tell me.
3. **Injury alerts** match Sleeper's app for a few players.
4. **Draft picks** all show values.
5. **Scheme notes** appear for some receivers after step 11.

## Things to know

- **Scheme data is from last season.** The man/zone data is published only after a season ends. Points allowed by position update weekly this season.
- **Cornerback shadow coverage is not available for free.** The points-allowed split by WR1, WR2 and WR3 is the closest signal.
- **Keep it public.** Your Sleeper username and league ID will be visible, and no passwords are stored in the repo.
- **If news stops updating:** GitHub turns off scheduled jobs after 60 days with no repo activity. Open Actions and re-enable it.
- **News can be empty at first.** Some of the news feed addresses in `config.json` came from memory. Open the update-data run and look for lines starting "Feed failed", then send them to me.
- **Optional phone alerts:** add a Discord webhook as a repo secret named `DISCORD_WEBHOOK` (Settings, Secrets and variables, Actions).

## How the repo stays small

| What | Limit |
|---|---|
| Data branch history | One commit, rewritten each run |
| news.json | Newest 150 items, nothing older than 14 days |
| Value history | 120 daily snapshots, then Sundays only up to 3 years, 8 MB cap per file |
| matchups.json | About 30 KB, replaced weekly |

## If something goes wrong

- **Page shows 404:** wait 2 minutes after step 3, and check the file is named `index.html`.
- **Job fails with a permissions error:** redo step 8.
- **Tool loads but shows no leagues:** check the username spelling and the season dropdown.
- **Anything else:** send me the exact text on screen.
