<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message de VIVIAS SHOP</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #000000;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FDFBF7;
        }
        .header {
            background-color: #000000;
            padding: 30px 40px;
            text-align: center;
        }
        .logo {
            color: #FDFBF7;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #000000;
            margin-bottom: 20px;
        }
        .message-content {
            font-size: 15px;
            line-height: 1.8;
            color: #333333;
            margin-bottom: 30px;
            white-space: pre-wrap;
        }
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background-color: #000000;
            color: #FDFBF7 !important;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            border-radius: 2px;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background-color: #333333;
        }
        .divider {
            height: 1px;
            background-color: #E5E5E5;
            margin: 30px 0;
        }
        .contact-info {
            background-color: #F8F8F8;
            padding: 25px;
            border-left: 3px solid #000000;
            margin-top: 30px;
        }
        .contact-title {
            font-size: 16px;
            font-weight: 600;
            color: #000000;
            margin-bottom: 15px;
        }
        .contact-item {
            font-size: 14px;
            color: #555555;
            margin: 8px 0;
        }
        .contact-link {
            color: #000000;
            text-decoration: none;
            font-weight: 500;
        }
        .footer {
            background-color: #F8F8F8;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #E5E5E5;
        }
        .footer-text {
            font-size: 13px;
            color: #777777;
            margin-bottom: 10px;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #000000;
            text-decoration: none;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">VIVIAS SHOP</div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Bonjour {{ $clientName ?? 'Cher(e) Client(e)' }},
            </div>

            <div class="message-content">{{ $messageText }}</div>

            <div class="cta-section">
                <a href="http://192.168.1.5:8000" class="cta-button">Visiter Notre Boutique</a>
            </div>

            <div class="divider"></div>

            <div class="contact-info">
                <div class="contact-title">Besoin d'aide ?</div>
                <div class="contact-item">
                    📧 Email : <a href="mailto:contact@vivias-shop.com" class="contact-link">contact@vivias-shop.com</a>
                </div>
                <div class="contact-item">
                    📱 WhatsApp : <a href="https://wa.me/221784661412" class="contact-link">+221 78 466 14 12</a>
                </div>
                <div class="contact-item">
                    🌐 Site Web : <a href="http://192.168.1.5:8000" class="contact-link">vivias-shop.com</a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                Merci de faire partie de la famille VIVIAS SHOP
            </p>
            <p class="footer-text">
                © {{ date('Y') }} VIVIAS SHOP - Tous droits réservés
            </p>
            <div class="divider" style="margin: 20px auto; width: 50%;"></div>
            <p class="footer-text" style="font-size: 12px;">
                Vous recevez cet email car vous êtes client(e) chez VIVIAS SHOP.<br>
                Pour toute question, contactez-nous sur WhatsApp au +221 78 466 14 12
            </p>
        </div>
    </div>
</body>
</html>
