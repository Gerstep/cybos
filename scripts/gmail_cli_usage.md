# Gmail CLI Tool (`gmail.py`) Usage Guide

This document provides detailed instructions on how to set up and use the Gmail CLI tool (`gmail.py`) to interact with your Gmail account from the command line.

## 1. Setup and Authentication

Before using the script, you need to configure access to the Gmail API:

### a. Enable Gmail API
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  Navigate to "APIs & Services" > "Library".
4.  Search for "Gmail API" and enable it for your project.

### b. Create OAuth 2.0 Credentials
1.  In the Google Cloud Console, go to "APIs & Services" > "Credentials".
2.  Click on "+ CREATE CREDENTIALS" and select "OAuth client ID".
3.  If prompted, configure the OAuth consent screen:
    *   **User Type**: Select "External" if you are using a personal Gmail account, or "Internal" if you are part of a Google Workspace organization and want to limit access.
    *   Provide an "App name" (e.g., "My Gmail CLI").
    *   Provide a "User support email" (your email).
    *   Add your email address under "Developer contact information".
    *   Save and continue.
    *   For "Scopes", you can leave this blank for now or add basic scopes like `openid`, `email`, `profile`. The script will request specific Gmail scopes later.
    *   For "Test users", add your Google account email address.
    *   Save and continue, then go back to the dashboard.
4.  Now, create the OAuth Client ID again:
    *   Select "Desktop app" as the "Application type".
    *   Give it a name (e.g., "Gmail CLI Desktop Client").
    *   Click "CREATE".
5.  A dialog will show your "Client ID" and "Client secret". Click "DOWNLOAD JSON" to download the credentials file. Rename this file to `credentials.json`.

### c. Configure Environment Variables
1.  Place the downloaded `credentials.json` file in a secure directory on your computer.
2.  Set the `GMAIL_CREDENTIALS_FILE` environment variable to the full path of this `credentials.json` file.
    *   You can do this by creating or editing a `.env` file in your project's root directory (where you run the script from, or your main project root) and adding the line:
        `GMAIL_CREDENTIALS_FILE=/path/to/your/credentials.json`
        (Replace `/path/to/your/credentials.json` with the actual path).
    *   Alternatively, you can set it system-wide or pass the path directly using the `--credentials-file` argument when running the script.
3.  (Optional) You can also set `GMAIL_TOKEN_FILE` to specify a custom path for the `token.pickle` file, which stores your OAuth token after successful authentication. If not set, it defaults to `token.pickle` in the same directory as the script or the directory specified by the CLI argument.
    *   In `.env`:
        `GMAIL_TOKEN_FILE=/path/to/your/token.pickle`

### d. First-time Authentication
When you run any command from `gmail.py` for the first time (or if `token.pickle` is invalid/deleted), your web browser will automatically open, prompting you to log in with your Google account and authorize the application to access your Gmail data.
After successful authorization, a `token.pickle` file will be created, storing your access and refresh tokens. Subsequent runs will use this token file, and you won't need to re-authenticate through the browser unless the token expires and cannot be refreshed, or the token file is deleted.

## 2. CLI Command Structure

The general structure for using the CLI is:

`python gmail.py [global_options] <command> [command_options]`

**Global Options:**
*   `--credentials-file /path/to/credentials.json`: Overrides the `GMAIL_CREDENTIALS_FILE` environment variable.
*   `--token-file /path/to/token.pickle`: Overrides the `GMAIL_TOKEN_FILE` environment variable.

To see all available commands and their general help:
`python gmail.py -h`

To see help for a specific command:
`python gmail.py <command> -h`

## 3. Available Commands and Examples

### `profile`
Retrieves and displays your Gmail user profile information.

**Usage:**
`python gmail.py profile`

**Example Output (JSON):**
```json
{
  "emailAddress": "user@example.com",
  "messagesTotal": 1234,
  "threadsTotal": 567,
  "historyId": "9876543"
}
```

### `get-messages`
Lists messages matching a specified query.

**Usage:**
`python gmail.py get-messages [options]`

**Options:**
*   `--query "your_query"`: Gmail search query (e.g., `"from:boss@work.com is:unread"`, `"subject:project update after:2023/10/01"`). Defaults to fetching all messages (usually latest).
*   `--max-results <number>`: Maximum number of messages to return (default: 10).
*   `--include-body`: If specified, includes the full message details (payload). Otherwise, only metadata is fetched.

**Examples:**
1.  Get the latest 5 messages:
    `python gmail.py get-messages --max-results 5`
2.  Get unread messages from "newsletter@example.com", including body:
    `python gmail.py get-messages --query "from:newsletter@example.com is:unread" --include-body`

**Example Output (JSON list of message objects):**
```json
[
  {
    "id": "message_id_1",
    "threadId": "thread_id_1",
    "snippet": "This is a short snippet of the email...",
    // ... other metadata or full payload if --include-body is used
  },
  // ... more messages
]
```

### `get-message`
Retrieves a specific message by its ID.

**Usage:**
`python gmail.py get-message <message_id> [options]`

**Arguments:**
*   `message_id`: The ID of the message to retrieve.

**Options:**
*   `--format <format_type>`: The format for the returned message. Choices: `full` (default), `minimal`, `raw`, `metadata`.

**Examples:**
1.  Get full details of a message:
    `python gmail.py get-message 18abc9xyzdef0123`
2.  Get the raw content of a message:
    `python gmail.py get-message 18abc9xyzdef0123 --format raw`

**Example Output (JSON object of the message):**
```json
{
  "id": "18abc9xyzdef0123",
  "threadId": "thread_id_abc",
  "labelIds": ["INBOX", "IMPORTANT", "UNREAD"],
  "snippet": "Hello, this is an important email...",
  "payload": { /* ... full message payload ... */ }
  // ... or other formats based on --format
}
```

### `send-message`
Sends a new email message.

**Usage:**
`python gmail.py send-message [options]`

**Options:**
*   `--to "recipient(s)"` (Required): Recipient email address(es), comma-separated for multiple.
*   `--subject "your_subject"` (Required): Email subject.
*   `--body "your_email_body"` (Required): Plain text email body.
*   `--cc "recipient(s)"`: CC email address(es), comma-separated.
*   `--bcc "recipient(s)"`: BCC email address(es), comma-separated.
*   `--html-body "your_html_body"`: HTML formatted email body. If provided, the email will be multipart/alternative.
*   `--attachments /path/to/file1 /path/to/file2 ...`: List of file paths to attach to the email.

**Examples:**
1.  Send a simple text email:
    `python gmail.py send-message --to "friend@example.com" --subject "Quick Update" --body "Just wanted to say hi!"`
2.  Send an email with CC, HTML body, and an attachment:
    `python gmail.py send-message --to "colleague@work.com" --cc "manager@work.com" --subject "Project Report" --body "Please find the report attached." --html-body "<h1>Project Report</h1><p>Please find the report attached.</p>" --attachments ./reports/report.pdf`

**Example Output (JSON of the sent message confirmation):**
```
Message sent successfully. ID: 18fedcba98765432
{
  "id": "18fedcba98765432",
  "threadId": "thread_id_xyz",
  "labelIds": ["SENT"]
}
```

### `forward-message`
Forwards an existing email message.

**Usage:**
`python gmail.py forward-message <message_id> [options]`

**Arguments:**
*   `message_id`: The ID of the message to forward.

**Options:**
*   `--to "recipient(s)"` (Required): Recipient email address(es) for the forwarded email.
*   `--additional-body "your_text"`: Optional text to add to the beginning of the forwarded message body.

**Example:**
`python gmail.py forward-message 17abc123def456 --to "team@example.com" --additional-body "FYI - please see below."`

**Example Output (JSON of the sent message confirmation):**
```
Message forwarded successfully. ID: 18zyxwvu54321098
{
  "id": "18zyxwvu54321098",
  "threadId": "thread_id_pqr",
  "labelIds": ["SENT"]
}
```

### `reply-to-message`
Replies to an existing email message.

**Usage:**
`python gmail.py reply-to-message <message_id> [options]`

**Arguments:**
*   `message_id`: The ID of the message to reply to.

**Options:**
*   `--body "your_reply_body"` (Required): Plain text reply body.
*   `--html-body "your_html_reply_body"`: HTML formatted reply body.

**Example:**
`python gmail.py reply-to-message 16def098abc765 --body "Thanks for the update! I'll look into it."`

**Example Output (JSON of the sent message confirmation):**
```
Reply sent successfully. ID: 18kjihgf98765012
{
  "id": "18kjihgf98765012",
  "threadId": "thread_id_of_original_message",
  "labelIds": ["SENT"]
}
```

### `trash-message`
Moves a message to the trash.

**Usage:**
`python gmail.py trash-message <message_id>`

**Arguments:**
*   `message_id`: The ID of the message to move to trash.

**Example:**
`python gmail.py trash-message 15abc876def345`

**Example Output:**
```
Message 15abc876def345 moved to trash.
{
  "id": "15abc876def345",
  "threadId": "thread_id_mno",
  "labelIds": ["TRASH", "INBOX"] // LabelIds will be updated
}
```

### `untrash-message`
Removes a message from the trash (moves it back to the inbox).

**Usage:**
`python gmail.py untrash-message <message_id>`

**Arguments:**
*   `message_id`: The ID of the message to remove from trash.

**Example:**
`python gmail.py untrash-message 15abc876def345`

**Example Output:**
```
Message 15abc876def345 removed from trash.
{
  "id": "15abc876def345",
  "threadId": "thread_id_mno",
  "labelIds": ["INBOX"] // LabelIds will be updated
}
```

### `delete-message`
Permanently deletes a message. **Use with extreme caution, as this action cannot be undone.** The message must typically be in trash first or it might fail, depending on API behavior.

**Usage:**
`python gmail.py delete-message <message_id>`

**Arguments:**
*   `message_id`: The ID of the message to permanently delete.

**Example:**
`python gmail.py delete-message 15abc876def345`

**Example Output:**
`Message 15abc876def345 permanently deleted.`
(No JSON output as the message is gone)

---

This guide should help you get started with the Gmail CLI tool. For any issues or further assistance, refer to the script's internal documentation or the Google Gmail API documentation. 