# TalkBuddy Chat Backend

This is a secure Node.js/Express backend service that proxies chat requests to the DeepSeek API, keeping your API key private and safely handling errors. For use with the React frontend or the vanilla JS chat.html UI.

---

## Setup & Installation

1. **Install dependencies**

```sh
cd chat-backend
npm install
```

2. **Configure your DeepSeek API Key**

- Copy `.env` to a new file named `.env` (if not already present):

```sh
cp .env .env
```

- Edit `.env` and set your DeepSeek key:

```
DEEPSEEK_API_KEY=your_deepseek_key_here
```
  *Never commit `.env`!*

3. **Start the backend server**

```sh
npm start
```
- By default, this runs on **http://localhost:12147**. Set `PORT` in `.env` to override.

## API Endpoint

- **POST /chat**
  - Request: `{ "message": "Your chat message text" }`
  - Response: `{ "reply": "AI response text" }`
- Invalid requests or errors return a user-friendly error: `{ "error": "Description here" }`

## CORS (Cross-Origin Resource Sharing)

CORS is enabled for development with these origins:

- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:3000
- http://127.0.0.1:5173

This allows the React dev server, Vite, or opening `chat.html` via local server/static host to call the backend. No credentials are required.

You can open `chatmate/standalone-chat/chat.html` in your browser (file:// works for most modern browsers, Chrome/Edge recommended for full features) or run the React app.

---

## Running Frontend & Backend Locally

- Start the backend (see above):  
  ```sh
  cd chat-backend
  npm install
  npm start
  # Listens on http://localhost:12147
  ```

- For React frontend:  
  ```sh
  cd chatmate
  npm install
  npm start
  # Opens at http://localhost:3000
  ```

- Or open the vanilla JS chat (no build needed):  
  ```
  open chatmate/standalone-chat/chat.html
  ```
  (Or drag it to your browser, or serve with `python3 -m http.server` from `chatmate/`.)

- The chat UI POSTs your prompt to the backend at `/chat`. Replies stream/scripted via backend proxy, not exposed to browser.

## Ports

- **Backend:** 12147 (settable via `.env`)
- **React frontend:** 3000 (default Create React App)
- **Vanilla standalone (chat.html):** file:// or static server, any port

## Logs & Errors

- Server prints errors and request logs in terminal.
- Errors and exceptions do NOT leak sensitive info to the browser.

## Secure Key Management

Your DeepSeek API key stays in `.env` (never exposed client-side!). Rotate or update it anytime by editing the file and restarting the backend.

---

## Troubleshooting

- Run `npm install` in both frontend and backend folders if you hit missing dependency errors.
- If chat.html or React UI can't connect, check:  
  - Backend is running and shows "listening at http://localhost:12147"  
  - CORS errors in browser? Make sure port matches frontend origin, or adjust CORS origination as needed in `server.js`.

---

## Questions?

See comments in `server.js` for further details. For OpenAI/DeepSeek API changes, update as needed.

---
