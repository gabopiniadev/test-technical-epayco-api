import * as nodemailer from 'nodemailer';

export class EmailService {

    private transporter: {
        sendMail: (arg0: {
            from: string;
            to: string;
            subject: string; text: string;
        }) => any;
    };

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'gaboenvironment@gmail.com',
                pass: 'ldhb jgrh qrrh uhoh',
            },
        });
    }

    async sendPaymentCode(email: string, sessionId: string, code: string) {
        const mailOptions = {
            from: 'gaboenvironment@gmail.com',
            to: email,
            subject: 'Confirmación de Pago',
            text: `Tu código para confirmación de pago es: ${code}\n\nTu SessionID es: ${sessionId}\n\n\nNo compartas este código con nadie.`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Correo enviado exitosamente a:', email);
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw new Error('No se pudo enviar el correo.');
        }
    }
}
