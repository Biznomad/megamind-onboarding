# MegaMind 10-Question Onboarding Portal

## 🚀 Quick Deploy

```bash
cd /e/netlify_megamind
netlify deploy --prod
```

Then set environment variable:
```bash
netlify env:set MEGAMIND_PASSWORD "Knumoney0226?"
```

## 📁 Files Status

- ✅ netlify.toml (config)
- ✅ package.json (dependencies)
- ✅ public/style.css (styles)
- ✅ public/success.html (completion page)
- ✅ public/oauth.html (integrations page)
- ⏳ public/index.html (10-question quiz) - SEE BELOW
- ⏳ public/script.js (quiz logic) - SEE BELOW
- ⏳ netlify/functions/submit-quiz.js (backend) - SEE BELOW

## 10 Questions

1. Project Priority (End of Life, Coloring Book, Website, AI)
2. Learning Style (Step-by-step, Big picture, Quick ref, Visual)
3. Communication (Brief, Detailed, Adaptive)
4. Challenge Level (Beginner, Intermediate, Advanced)
5. Feature Priorities (Research, Org, Content, Automation) - pick 2
6. Work Schedule (Morning, Afternoon, Evening, Flexible)
7. Check-in Frequency (Daily, Every 2-3 days, Weekly, On-demand)
8. Content Format (Text, Video, Interactive, Mixed)
9. Project Timeline (Urgent, Moderate, Long-term, Exploring)
10. Support Style (Proactive, Collaborative, Reactive, Cheerleader)

## Complete Code

Due to length, the complete 10-question HTML, JavaScript, and backend function are in:
- `COMPLETE_10Q_CODE.md` (in this directory)

Copy those files to finish setup, then deploy!

## After Deploy

Send URL to Jacquie:
```bash
ssh root@187.77.205.132 "openclaw message send --channel whatsapp --account bot2 --target '+16782879864' --message 'Hi Jacquie! Complete your MegaMind onboarding: <NETLIFY_URL>'"
```
