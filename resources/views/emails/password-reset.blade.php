<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            color: #333333;
        }
        .content p {
            line-height: 1.6;
            margin: 15px 0;
            font-size: 16px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 20px;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .reset-button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
        }
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .info-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .warning-box {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .warning-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            color: #666666;
            font-size: 13px;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .security-note {
            font-size: 12px;
            color: #999;
            margin-top: 20px;
            line-height: 1.5;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 20px;
            }
            .content {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
            .reset-button {
                padding: 12px 30px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🔐 Réinitialisation de mot de passe</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <p class="greeting">Bonjour {{ $userName }},</p>

            <p>
                Vous avez demandé à réinitialiser votre mot de passe pour votre compte <strong>VIVIAS SHOP</strong>.
            </p>

            <p>
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
            </p>

            <div class="button-container">
                <a href="{{ $resetUrl }}" class="reset-button">
                    Réinitialiser mon mot de passe
                </a>
            </div>

            <div class="info-box">
                <p><strong>⏱️ Ce lien est valide pendant 60 minutes.</strong></p>
                <p>Après ce délai, vous devrez faire une nouvelle demande de réinitialisation.</p>
            </div>

            <div class="warning-box">
                <p><strong>⚠️ Vous n'avez pas demandé cette réinitialisation ?</strong></p>
                <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email. Votre mot de passe actuel reste inchangé et sécurisé.</p>
            </div>

            <p class="security-note">
                <strong>Conseils de sécurité :</strong><br>
                • Choisissez un mot de passe fort (au moins 8 caractères)<br>
                • Mélangez majuscules, minuscules, chiffres et caractères spéciaux<br>
                • N'utilisez pas le même mot de passe sur plusieurs sites<br>
                • Ne partagez jamais votre mot de passe avec qui que ce soit
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>
                <strong>VIVIAS SHOP</strong><br>
                Votre boutique de mode africaine authentique
            </p>
            <p>
                📧 <a href="mailto:{{ config('mail.from.address') }}">{{ config('mail.from.address') }}</a><br>
                🌐 <a href="{{ config('app.url') }}">{{ config('app.url') }}</a>
            </p>
            <p style="margin-top: 20px; color: #999; font-size: 11px;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
            </p>
        </div>
    </div>
</body>
</html>
