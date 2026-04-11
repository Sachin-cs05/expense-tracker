# Vercel Deployment Guide for Expense Tracker

## 1. Project structure समझो

इस project में दो main parts हैं:

- `dist/client` — frontend जो Vite से build होता है
- `api/` — Vercel serverless function जो आपके `server/src` Express backend को चलाती है

> Vercel पर `api/` folder में रखी files serverless functions की तरह चलती हैं।


## 2. MongoDB Atlas सेटअप करो

### 2.1 Atlas में cluster बनाओ

1. https://www.mongodb.com/cloud/atlas पर जाओ और login करो
2. नया project बनाओ
3. Free tier cluster बनाओ (Shared Cluster)

### 2.2 Database user बनाओ

- Project -> Database Access -> Add New Database User
- Username और Password डालो
- Role: `Read and write to any database` या `Atlas Admin` (dev/test के लिए ठीक है)

### 2.3 Network Access ठीक करो

- Project -> Network Access -> Add IP Address
- Vercel deploy करने के लिए easiest option है `0.0.0.0/0` add करना
- बाद में security tight करनी हो तो restrict कर लेना

### 2.4 Connection string लो

- Project -> Database -> Connect -> Connect your application
- वहां से निचे वाला URI copy करो और अपनी values डालो:

```bash
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

> ध्यान दो: `expense-tracker` database name है। अगर कोई दूसरा नाम डालोगे तो backend connect नहीं करेगा।


## 3. Vercel पर GitHub repo जोड़ो

### 3.1 Vercel में नया project बनाओ

1. https://vercel.com पर जाओ
2. `New Project` पर क्लिक करो
3. GitHub repo connect करो
4. अपना `Expense Tracker` repo चुनो

### 3.2 Build settings डालो

- Build Command: `npm install && npm run build`
- Output Directory: `dist/client`

> इसका मतलब है कि `package.json` पहले `npm run build` चलाएगा और build output `dist/client` में आएगा।


## 4. Vercel में Environment Variables डालो

Vercel dashboard में Project Settings -> Environment Variables में ये जोड़ो:

- `MONGODB_URI`
  - Atlas connection string
  - example:
    `mongodb+srv://user:password@cluster0.abcd.mongodb.net/expense-tracker?retryWrites=true&w=majority`
- `JWT_SECRET`
  - कोई लंबा और secure secret string डालो
- `JWT_EXPIRES_IN`
  - example: `7d`

> `.env` file local development के लिए है। Vercel पर ये values dashboard से डालो।


## 5. Vercel पर deploy करो

- Project page पर `Deploy` button दबाओ
- पहली बार deploy होने पर Vercel build करेगा
- कभी-कभी build 5-10 मिनट तक भी लग सकता है, पर अगर 10-15 मिनट से लंबा हो गया है तो Vercel logs जरूर चेक करो
- अगर कोई error आए तो Vercel logs देखो

### deploy successful होने के बाद

- आपका site URL कुछ ऐसा होगा: `https://your-project-name.vercel.app`
- backend check करने के लिए:
  - `https://your-project-name.vercel.app/api/health`
- अगर response में `ok` आये तो backend सही चल रहा है


## 6. Step-by-step test करो

1. अपने deployed URL को browser में खोलो
2. Register page पर जाओ और नया user बनाओ
3. अगर `Request failed.` दिखे तो API logs देखो
4. `https://your-project-name.vercel.app/api/auth/register` को Postman या curl से भी test कर सकते हो


## 7. Troubleshooting

### 7.1 अगर MongoDB connection error आये

- `MONGODB_URI` सही paste किया है?
- username/password ठीक है?
- Atlas में Network Access में `0.0.0.0/0` या आपकी IP add की है?
- cluster active है?
- URI में database नाम `expense-tracker` है?

### 7.2 अगर API route काम नहीं कर रहा

- `api/` folder में `index.js` और `_handler.js` हैं?
- `vercel.json` में build command सही है?
- `/api/health` URL से response आया?


## 8. Extra notes

- Frontend और backend दोनों same repo में हैं। Vercel frontend को `dist/client` से serve करेगा और backend `/api` से चलेगा।
- Local development में `.env` use करो, लेकिन Vercel पर env vars dashboard में डालो।
- Atlas के लिए generally `mongodb+srv://` URI Vercel के साथ ठीक काम करता है।


## 9. कब क्या use करो

- Local dev: `.env` + `npm run dev`
- Vercel deploy: `vercel.json` + Vercel env vars + Atlas URI


---

अगर चाहो तो मैं यह same guide `README.md` में भी add कर दूँ।