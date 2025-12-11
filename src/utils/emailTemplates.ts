export const emailTemplates = {
	confirmationEmail: (confirmUrl: string, expiresIn: string = '24 hours'): string => {
		return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 5px 5px;
          }
          .expiry-warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 3px;
            margin: 10px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to FinTalks</h1>
          </div>
          <div class="content">
            <h2>Confirm Your Email Address</h2>
            <p>Thank you for signing up! To complete your registration, please confirm your email address by clicking the button below:</p>
            <center>
              <a href="${confirmUrl}" class="button">Confirm Email</a>
            </center>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;">
              <a href="${confirmUrl}">${confirmUrl}</a>
            </p>
            <div class="expiry-warning">
              <strong>Important:</strong> This confirmation link will expire in ${expiresIn}.
            </div>
            <p>If you did not sign up for this account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
			      <p>&copy; 2025 FinTalks. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;
	},
	passwordChangeEmail: (code: string, expiresIn: string = '15 minutes'): string => {
		return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .code-box {
            background-color: #e8f4f8;
            border: 2px solid #3498db;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
            font-family: monospace;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #2c3e50;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 5px 5px;
          }
          .expiry-warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 10px;
            border-radius: 3px;
            margin: 10px 0;
            font-size: 14px;
          }
          .security-note {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 10px;
            border-radius: 3px;
            margin: 10px 0;
            font-size: 13px;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Change Request</h1>
          </div>
          <div class="content">
            <h2>Confirm Password Change</h2>
            <p>You requested to change your FinTalks password. Use the confirmation code below to complete this action:</p>
            <div class="code-box">${code}</div>
            <p>Enter this code in the password change form to set your new password.</p>
            <div class="expiry-warning">
              <strong>Important:</strong> This code will expire in ${expiresIn}.
            </div>
            <div class="security-note">
              <strong>Security Alert:</strong> If you did not request this password change, please ignore this email and your password will remain unchanged.
            </div>
            <p>Never share this code with anyone. FinTalks support will never ask for this code.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 FinTalks. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;
	},
};
