"""
Gmail connector for interacting with Gmail API.

This script allows you_to_interact with your Gmail account via the command line.
It supports actions like fetching your profile, reading messages, sending emails,
forwarding, replying, and managing messages (trashing, untrashing, deleting).

Setup:
1. Enable the Gmail API in your Google Cloud Console.
2. Create OAuth 2.0 Client ID credentials (for Desktop application or Web application)
   and download the `credentials.json` file.
3. Place the `credentials.json` file in a secure location.
4. Set the `GMAIL_CREDENTIALS_FILE` environment variable to the path of your
   `credentials.json` file. For example, in your .env file:
   `GMAIL_CREDENTIALS_FILE=/path/to/your/credentials.json`
5. (Optional) Set `GMAIL_TOKEN_FILE` environment variable to specify where to
   store the authentication token (default: `token.pickle` in the script's directory).

Upon first run of any command, you will be prompted to authenticate via your web browser.
A `token.pickle` file will be created to store your authentication details for future use.

CLI Usage Examples:

# Get your Gmail profile
python gmail.py profile

# Get the latest 5 messages from your inbox, including their body
python gmail.py get-messages --max-results 5 --include-body

# Get messages matching a query
python gmail.py get-messages --query "from:someone@example.com subject:important"

# Get a specific message by ID
python gmail.py get-message --message-id <your_message_id>

# Get a specific message by ID in raw format
python gmail.py get-message --message-id <your_message_id> --format raw

# Send an email
python gmail.py send-message --to "recipient@example.com" --subject "Hello from script" --body "This is the email body."

# Send an email with CC, BCC, and HTML body
python gmail.py send-message --to "recipient@example.com" \\
    --cc "cc_recipient@example.com" \\
    --bcc "bcc_recipient@example.com" \\
    --subject "HTML Email" \\
    --body "This is plain text fallback." \\
    --html-body "<h1>Hello</h1><p>This is an HTML email.</p>"

# Send an email with attachments
python gmail.py send-message --to "recipient@example.com" \\
    --subject "Email with attachments" \\
    --body "Please find files attached." \\
    --attachments /path/to/file1.pdf /path/to/image.jpg

# Forward a message
python gmail.py forward-message --message-id <message_id_to_forward> \\
    --to "forward_recipient@example.com" \\
    --additional-body "FYI"

# Reply to a message
python gmail.py reply-to-message --message-id <message_id_to_reply_to> \\
    --body "Thanks for your email!"

# Trash a message
python gmail.py trash-message --message-id <message_id_to_trash>

# Untrash a message
python gmail.py untrash-message --message-id <message_id_to_untrash>

# Permanently delete a message (use with caution!)
python gmail.py delete-message --message-id <message_id_to_delete>
"""

import os
import base64
import pickle
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import mimetypes
import argparse
import sys

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GmailConnector:
    """
    Connector for the Gmail API.
    
    This class provides methods to interact with the Gmail API for accessing
    and sending emails.
    """
    
    # Define the scopes (permissions) required by the Gmail API
    SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',  # Read emails
        'https://www.googleapis.com/auth/gmail.send',      # Send emails
        'https://www.googleapis.com/auth/gmail.compose',   # Create emails
        'https://www.googleapis.com/auth/gmail.modify',    # Modify emails
    ]
    
    def __init__(self, credentials_file: Optional[str] = None, token_file: Optional[str] = None):
        """
        Initialize the Gmail connector.
        
        Args:
            credentials_file (str, optional): Path to the credentials.json file.
                If not provided, will try to load from GMAIL_CREDENTIALS_FILE env variable.
            token_file (str, optional): Path to save/load the token file.
                If not provided, will try to load from GMAIL_TOKEN_FILE env variable
                or default to 'token.pickle' in the project root directory.
        
        Raises:
            ValueError: If credentials_file is not provided and 
                GMAIL_CREDENTIALS_FILE is not set, or if authentication fails.
        """
        self.credentials_file = credentials_file or os.getenv("GMAIL_CREDENTIALS_FILE")
        
        # Use absolute path to token.pickle in the project root directory
        if token_file:
            self.token_file = token_file
        else:
            # Get the absolute path to the root directory (parent of scripts directory)
            root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
            self.token_file = os.getenv("GMAIL_TOKEN_FILE", os.path.join(root_dir, "token.pickle"))
        
        if not self.credentials_file or not os.path.exists(self.credentials_file):
            print("Gmail credentials file (credentials.json) not found.")
            print("Please download it from https://console.cloud.google.com/apis/credentials for your project (OAuth 2.0 Client IDs) and set GMAIL_CREDENTIALS_FILE in your .env file.")
            raise ValueError("Missing credentials.json. Cannot proceed.")
        
        # Authenticate and build the Gmail service
        self.service = self._get_gmail_service()
        # Log initialization
        logging.info("Gmail connector initialized")
    
    def _get_gmail_service(self):
        """
        Authenticate and build the Gmail service.
        
        Returns:
            Resource: The Gmail API service resource.
            
        Raises:
            ValueError: If authentication fails.
        """
        creds = None
        
        # Load credentials from the token file if it exists
        if os.path.exists(self.token_file):
            try:
                with open(self.token_file, 'rb') as token:
                    creds = pickle.load(token)
                    
                # Verify the token contains necessary fields
                required_fields = ['refresh_token', 'token_uri', 'client_id', 'client_secret']
                if creds and not all(hasattr(creds, field) for field in required_fields):
                    logging.warning(f"Token file is missing required fields. Will regenerate credentials.")
                    creds = None
            except Exception as e:
                logging.warning(f"Error loading credentials from token file: {e}")
                creds = None
        
        # If credentials don't exist or are invalid, get new ones
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    logging.warning(f"Error refreshing credentials: {e}")
                    creds = None
            
            # If we still need credentials, initiate the OAuth flow
            if not creds:
                try:
                    # Load client config from credentials file
                    with open(self.credentials_file, 'r') as f:
                        client_config = json.load(f)
                    
                    # Check if it's a web client or desktop client format
                    if 'web' in client_config or 'installed' in client_config:
                        client_config_for_flow = client_config
                    else:
                        # If credentials.json is not in expected format, prompt for client_id/secret
                        client_config_for_flow = self._prompt_for_client_config()
                except Exception as e:
                    logging.warning(f"Error loading credentials file: {e}")
                    # If credentials.json is not readable, prompt for client_id/secret
                    client_config_for_flow = self._prompt_for_client_config()
                
                try:
                    flow = InstalledAppFlow.from_client_config(
                        client_config_for_flow, self.SCOPES)
                    flow.redirect_uri = 'http://localhost:8080'
                    creds = flow.run_local_server(port=8080)
                    
                    # Save the credentials for future use
                    with open(self.token_file, 'wb') as token:
                        pickle.dump(creds, token)
                        logging.info(f"New credentials saved to {self.token_file}")
                except Exception as e:
                    raise ValueError(f"Failed to authenticate: {e}")
        
        # Build the Gmail service
        try:
            return build('gmail', 'v1', credentials=creds)
        except Exception as e:
            raise ValueError(f"Failed to build Gmail service: {e}")
    
    def _prompt_for_client_config(self):
        print("\nEnter your Google OAuth client_id and client_secret (from Google Cloud Console > Credentials > OAuth 2.0 Client IDs):")
        client_id = input("client_id: ")
        client_secret = input("client_secret: ")
        return {
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": ["http://localhost:8080"]
            }
        }
    
    def get_profile(self) -> Dict:
        """
        Get information about the authenticated user's Gmail profile.
        
        Returns:
            Dict: User profile information
        """
        try:
            return self.service.users().getProfile(userId='me').execute()
        except HttpError as e:
            logging.error(f"Error retrieving Gmail profile: {e}")
            raise
    
    def get_messages(self, query: str = "", max_results: int = 10, 
                    include_body: bool = False) -> List[Dict]:
        """
        Get Gmail messages matching a search query.
        
        Args:
            query (str): Gmail search query (same format as the Gmail search box)
                Example: "from:example@gmail.com after:2023/01/01"
            max_results (int): Maximum number of messages to return
            include_body (bool): Whether to include the message body content
        
        Returns:
            List[Dict]: List of message objects
        """
        try:
            # First get the message IDs
            results = self.service.users().messages().list(
                userId='me', q=query, maxResults=max_results).execute()
            
            messages = results.get('messages', [])
            message_list = []
            
            # Get full message details for each ID
            for msg in messages:
                if include_body:
                    message_data = self.service.users().messages().get(
                        userId='me', id=msg['id'], format='full').execute()
                else:
                    message_data = self.service.users().messages().get(
                        userId='me', id=msg['id'], format='metadata').execute()
                message_list.append(message_data)
            
            return message_list
        except HttpError as e:
            logging.error(f"Error retrieving Gmail messages: {e}")
            raise
    
    def get_message(self, message_id: str, format: str = 'full') -> Dict:
        """
        Get a specific Gmail message by ID.
        
        Args:
            message_id (str): The ID of the message to retrieve
            format (str): The format to return the message in ('full', 'minimal', 'raw', 'metadata')
        
        Returns:
            Dict: The message object
        """
        try:
            return self.service.users().messages().get(userId='me', id=message_id, format=format).execute()
        except HttpError as e:
            logging.error(f"Error retrieving Gmail message: {e}")
            raise
    
    def get_message_body(self, message: Dict) -> str:
        """
        Extract the body text from a Gmail message.
        
        Args:
            message (Dict): The message object returned by get_message()
        
        Returns:
            str: The message body text
        """
        if 'payload' not in message:
            return ""
        
        parts = []
        if 'parts' in message['payload']:
            for part in message['payload']['parts']:
                if part['mimeType'] == 'text/plain' and 'data' in part['body']:
                    body_data = part['body']['data']
                    body_text = base64.urlsafe_b64decode(body_data).decode('utf-8')
                    parts.append(body_text)
        elif 'body' in message['payload'] and 'data' in message['payload']['body']:
            body_data = message['payload']['body']['data']
            body_text = base64.urlsafe_b64decode(body_data).decode('utf-8')
            parts.append(body_text)
        
        return '\n'.join(parts)
    
    def send_message(self, to: str, subject: str, body: str, cc: Optional[str] = None, 
                   bcc: Optional[str] = None, html_body: Optional[str] = None,
                   attachments: Optional[List[str]] = None) -> Dict:
        """
        Send an email message.
        
        Args:
            to (str): Recipient email address(es), comma-separated for multiple
            subject (str): Email subject
            body (str): Plain text email body
            cc (str, optional): CC email address(es), comma-separated for multiple
            bcc (str, optional): BCC email address(es), comma-separated for multiple
            html_body (str, optional): HTML formatted email body
            attachments (List[str], optional): List of file paths to attach
        
        Returns:
            Dict: The sent message object
        """
        try:
            # Create the message
            message = MIMEMultipart('alternative' if html_body else 'mixed')
            message['To'] = to
            message['Subject'] = subject
            
            if cc:
                message['Cc'] = cc
            if bcc:
                message['Bcc'] = bcc
            
            # Attach plain text and HTML body
            message.attach(MIMEText(body, 'plain'))
            if html_body:
                message.attach(MIMEText(html_body, 'html'))
            
            # Add attachments if any
            if attachments:
                for file_path in attachments:
                    if os.path.isfile(file_path):
                        # Guess the content type based on the file's extension
                        content_type, encoding = mimetypes.guess_type(file_path)
                        
                        if content_type is None or encoding is not None:
                            content_type = 'application/octet-stream'
                        
                        main_type, sub_type = content_type.split('/', 1)
                        
                        with open(file_path, 'rb') as fp:
                            attachment = MIMEBase(main_type, sub_type)
                            attachment.set_payload(fp.read())
                        
                        encoders.encode_base64(attachment)
                        attachment.add_header('Content-Disposition', 'attachment', 
                                             filename=os.path.basename(file_path))
                        message.attach(attachment)
            
            # Convert the message to a string and encode in base64
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            # Send the message
            message_body = {'raw': encoded_message}
            return self.service.users().messages().send(userId='me', body=message_body).execute()
        except HttpError as e:
            logging.error(f"Error sending Gmail message: {e}")
            raise
        except Exception as e:
            logging.error(f"Error creating or encoding message: {e}")
            raise
    
    def forward_message(self, message_id: str, to: str, additional_body: Optional[str] = None) -> Dict:
        """
        Forward an existing email message.
        
        Args:
            message_id (str): ID of the message to forward
            to (str): Recipient email address(es), comma-separated for multiple
            additional_body (str, optional): Additional text to add to the forwarded message
        
        Returns:
            Dict: The sent message object
        """
        try:
            # Get the original message
            original_message = self.get_message(message_id, format='raw')
            
            # Decode the raw message
            raw_message = base64.urlsafe_b64decode(original_message['raw']).decode('utf-8')
            
            # Create a new message with forwarded content
            message = MIMEMultipart()
            message['To'] = to
            
            # Extract subject from original and add "Fwd: " if needed
            headers = dict(line.split(':', 1) for line in raw_message.split('\n\n')[0].split('\n') 
                         if ':' in line)
            subject = headers.get('Subject', '').strip()
            if not subject.startswith('Fwd:'):
                subject = f"Fwd: {subject}"
            
            message['Subject'] = subject
            
            # Add additional body text if provided
            if additional_body:
                message.attach(MIMEText(additional_body + "\n\n---------- Forwarded Message ----------\n\n", 'plain'))
            else:
                message.attach(MIMEText("---------- Forwarded Message ----------\n\n", 'plain'))
            
            # Attach the original message content
            # Extract the body part
            body_parts = raw_message.split('\n\n', 1)
            if len(body_parts) > 1:
                message.attach(MIMEText(body_parts[1], 'plain'))
            
            # Convert the message to a string and encode in base64
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            # Send the message
            message_body = {'raw': encoded_message}
            return self.service.users().messages().send(userId='me', body=message_body).execute()
        except HttpError as e:
            logging.error(f"Error forwarding Gmail message: {e}")
            raise
        except Exception as e:
            logging.error(f"Error creating or encoding forwarded message: {e}")
            raise
    
    def reply_to_message(self, message_id: str, body: str, html_body: Optional[str] = None) -> Dict:
        """
        Reply to an existing email message.
        
        Args:
            message_id (str): ID of the message to reply to
            body (str): Plain text reply body
            html_body (str, optional): HTML formatted reply body
        
        Returns:
            Dict: The sent message object
        """
        try:
            # Get the original message
            original_message = self.get_message(message_id)
            
            # Extract headers we need
            headers = {header['name']: header['value'] for header in original_message['payload']['headers']}
            subject = headers.get('Subject', '')
            if not subject.startswith('Re:'):
                subject = f"Re: {subject}"
            
            from_email = headers.get('From', '').split('<')[-1].split('>')[0]
            message_id = headers.get('Message-ID', '')
            references = headers.get('References', '')
            if message_id:
                if references:
                    references = f"{references} {message_id}"
                else:
                    references = message_id
            
            # Create the reply message
            message = MIMEMultipart('alternative' if html_body else 'mixed')
            message['To'] = from_email
            message['Subject'] = subject
            message['In-Reply-To'] = message_id
            message['References'] = references
            
            # Add the reply text
            message.attach(MIMEText(body, 'plain'))
            if html_body:
                message.attach(MIMEText(html_body, 'html'))
            
            # Convert the message to a string and encode in base64
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            # Send the message
            message_body = {'raw': encoded_message}
            return self.service.users().messages().send(userId='me', body=message_body).execute()
        except HttpError as e:
            logging.error(f"Error replying to Gmail message: {e}")
            raise
        except Exception as e:
            logging.error(f"Error creating or encoding reply message: {e}")
            raise
    
    def trash_message(self, message_id: str) -> Dict:
        """
        Move a message to the trash.
        
        Args:
            message_id (str): ID of the message to trash
        
        Returns:
            Dict: The trashed message object
        """
        try:
            return self.service.users().messages().trash(userId='me', id=message_id).execute()
        except HttpError as e:
            logging.error(f"Error trashing Gmail message: {e}")
            raise
    
    def untrash_message(self, message_id: str) -> Dict:
        """
        Remove a message from the trash.
        
        Args:
            message_id (str): ID of the message to untrash
        
        Returns:
            Dict: The untrashed message object
        """
        try:
            return self.service.users().messages().untrash(userId='me', id=message_id).execute()
        except HttpError as e:
            logging.error(f"Error untrashing Gmail message: {e}")
            raise
    
    def delete_message(self, message_id: str) -> None:
        """
        Permanently delete a message.
        
        Args:
            message_id (str): ID of the message to delete
        """
        try:
            self.service.users().messages().delete(userId='me', id=message_id).execute()
        except HttpError as e:
            logging.error(f"Error deleting Gmail message: {e}")
            raise

if __name__ == "__main__":
    # Configure basic logging for CLI feedback if not already configured
    if not logging.getLogger().hasHandlers():
        logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

    parser = argparse.ArgumentParser(
        description="Gmail CLI Tool: Manage your Gmail account from the command line.",
        epilog="For detailed instructions on setup and commands, refer to the script's documentation or gmail_cli_usage.md."
    )
    # Add a top-level argument for the credentials file, overriding env var if provided
    parser.add_argument(
        "--credentials-file",
        help="Path to the credentials.json file. Overrides GMAIL_CREDENTIALS_FILE env variable.",
        default=os.getenv("GMAIL_CREDENTIALS_FILE")
    )
    
    # Get the absolute path to the root directory (parent of scripts directory)
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    default_token_path = os.path.join(root_dir, "token.pickle")
    
    parser.add_argument(
        "--token-file",
        help="Path to the token.pickle file. Overrides GMAIL_TOKEN_FILE env variable.",
        default=os.getenv("GMAIL_TOKEN_FILE", default_token_path)
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands", required=True)

    # Profile command
    profile_parser = subparsers.add_parser("profile", help="Get the authenticated user's Gmail profile.")

    # Get messages command
    get_messages_parser = subparsers.add_parser("get-messages", help="List messages matching a query.")
    get_messages_parser.add_argument("--query", default="", help="Gmail search query (e.g., 'from:user@example.com').")
    get_messages_parser.add_argument("--max-results", type=int, default=10, help="Maximum number of messages to return.")
    get_messages_parser.add_argument("--include-body", action='store_true', help="Include the full message body.")

    # Get message command
    get_message_parser = subparsers.add_parser("get-message", help="Get a specific message by ID.")
    get_message_parser.add_argument("message_id", help="The ID of the message to retrieve.")
    get_message_parser.add_argument(
        "--format",
        default='full',
        choices=['full', 'minimal', 'raw', 'metadata'],
        help="Format to return the message in (default: full)."
    )

    # Send message command
    send_message_parser = subparsers.add_parser("send-message", help="Send a new email message.")
    send_message_parser.add_argument("--to", required=True, help="Recipient email address(es), comma-separated.")
    send_message_parser.add_argument("--subject", required=True, help="Email subject.")
    send_message_parser.add_argument("--body", required=True, help="Plain text email body.")
    send_message_parser.add_argument("--cc", help="CC email address(es), comma-separated.")
    send_message_parser.add_argument("--bcc", help="BCC email address(es), comma-separated.")
    send_message_parser.add_argument("--html-body", help="HTML formatted email body.")
    send_message_parser.add_argument("--attachments", nargs="*", help="List of file paths to attach.")

    # Forward message command
    forward_message_parser = subparsers.add_parser("forward-message", help="Forward an existing email message.")
    forward_message_parser.add_argument("message_id", help="ID of the message to forward.")
    forward_message_parser.add_argument("--to", required=True, help="Recipient email address(es) for the forwarded mail.")
    forward_message_parser.add_argument("--additional-body", help="Additional text to add to the forwarded message.", default="")

    # Reply to message command
    reply_message_parser = subparsers.add_parser("reply-to-message", help="Reply to an existing email message.")
    reply_message_parser.add_argument("message_id", help="ID of the message to reply to.")
    reply_message_parser.add_argument("--body", required=True, help="Plain text reply body.")
    reply_message_parser.add_argument("--html-body", help="HTML formatted reply body.")

    # Trash message command
    trash_message_parser = subparsers.add_parser("trash-message", help="Move a message to trash.")
    trash_message_parser.add_argument("message_id", help="ID of the message to trash.")

    # Untrash message command
    untrash_message_parser = subparsers.add_parser("untrash-message", help="Remove a message from trash.")
    untrash_message_parser.add_argument("message_id", help="ID of the message to untrash.")

    # Delete message command
    delete_message_parser = subparsers.add_parser("delete-message", help="Permanently delete a message (use with caution!).")
    delete_message_parser.add_argument("message_id", help="ID of the message to delete.")

    args = parser.parse_args()

    try:
        # Pass explicitly provided credentials/token file paths to the constructor
        connector = GmailConnector(credentials_file=args.credentials_file, token_file=args.token_file)
    except ValueError as e:
        # This catch is specifically for the credentials_file issue from __init__
        print(f"Error initializing GmailConnector: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred during initialization: {e}", file=sys.stderr)
        sys.exit(1)

    result = None
    success_message = None

    try:
        if args.command == "profile":
            result = connector.get_profile()
        elif args.command == "get-messages":
            result = connector.get_messages(
                query=args.query,
                max_results=args.max_results,
                include_body=args.include_body
            )
        elif args.command == "get-message":
            result = connector.get_message(message_id=args.message_id, format=args.format)
        elif args.command == "send-message":
            result = connector.send_message(
                to=args.to,
                subject=args.subject,
                body=args.body,
                cc=args.cc,
                bcc=args.bcc,
                html_body=args.html_body,
                attachments=args.attachments
            )
            success_message = f"Message sent successfully. ID: {result.get('id')}"
        elif args.command == "forward-message":
            result = connector.forward_message(
                message_id=args.message_id,
                to=args.to,
                additional_body=args.additional_body
            )
            success_message = f"Message forwarded successfully. ID: {result.get('id')}"
        elif args.command == "reply-to-message":
            result = connector.reply_to_message(
                message_id=args.message_id,
                body=args.body,
                html_body=args.html_body
            )
            success_message = f"Reply sent successfully. ID: {result.get('id')}"
        elif args.command == "trash-message":
            result = connector.trash_message(message_id=args.message_id)
            success_message = f"Message {args.message_id} moved to trash."
        elif args.command == "untrash-message":
            result = connector.untrash_message(message_id=args.message_id)
            success_message = f"Message {args.message_id} removed from trash."
        elif args.command == "delete-message":
            connector.delete_message(message_id=args.message_id) # Returns None
            success_message = f"Message {args.message_id} permanently deleted."
            # For delete_message, result remains None, so we only print success_message

        if success_message:
            print(success_message)
        if result: # Only print result if it's not None (e.g. delete_message)
            print(json.dumps(result, indent=2))

    except HttpError as e:
        error_details = json.loads(e.content.decode())
        error_message = error_details.get('error', {}).get('message', 'An API error occurred.')
        print(f"Gmail API Error: {error_message} (Code: {e.resp.status})", file=sys.stderr)
        # More detailed error for developers/debugging:
        # print(f"Full API Error details: {json.dumps(error_details, indent=2)}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e: # Catch other ValueErrors, e.g. from token refresh or service build
        print(f"Configuration or Authentication Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)
