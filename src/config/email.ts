import nodemailer from 'nodemailer';
import { env } from '../utils/envParser';

const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_SECURE || false,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
});

transporter.verify((error) => {
	if (error) {
		console.error('❌ Email transporter error:', error);
	} else {
		console.log('✅ Email transporter is ready');
	}
});

export default transporter;
