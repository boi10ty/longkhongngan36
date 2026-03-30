import json
import sys

data = {
    "en": {"key": "The password you've entered is incorrect"},
    "vi": {"key": "Mật khẩu bạn đã nhập không đúng"},
    "es": {"key": "La contraseña que ingresaste es incorrecta"},
    "fr": {"key": "Le mot de passe que vous avez saisi est incorrect"},
    "de": {"key": "Das eingegebene Passwort ist falsch"},
    "it": {"key": "La password che hai inserito non è corretta"},
    "zh": {"key": "您输入的密码不正确"},
    "ar": {"key": "كلمة المرور التي أدخلتها غير صحيحة"},
    "hi": {"key": "आपने जो पासवर्ड दर्ज किया है वह गलत है"},
    "pt": {"key": "A senha que você digitou está incorreta"},
    "ru": {"key": "Введенный вами пароль неверен"},
    "ja": {"key": "入力したパスワードが正しくありません"},
    "nl": {"key": "Het wachtwoord dat je hebt ingevoerd is onjuist"},
    "pl": {"key": "Hasło, które wpisałeś, jest niepoprawne"},
    "el": {"key": "Ο κωδικός πρόσβασης που εισαγάγατε είναι εσφαλμένος"}
}

print(json.dumps(data, ensure_ascii=False, indent=2))
