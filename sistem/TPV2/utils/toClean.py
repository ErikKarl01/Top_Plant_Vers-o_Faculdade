import re
from datetime import datetime

'''
| Símbolo | Significado                                 |
| ------- | ------------------------------------------- |
| `^`     | Início da string                            |
| `$`     | Fim da string                               |
| `.`     | Qualquer caractere (exceto quebra de linha) |
| `*`     | Zero ou mais ocorrências                    |
| `+`     | Uma ou mais ocorrências                     |
| `?`     | Zero ou uma ocorrência                      |
| `{n}`   | Exatamente n ocorrências                    |
| `{n,m}` | Entre n e m ocorrências                     |
| `[]`    | Conjunto de caracteres permitidos           |
| `[^]`   | Conjunto de caracteres proibidos            |
| `()`    | Grupo                                       |
| `\|`    | Operador OU                                 |
| `\`     | Escape ou sequência especial                |
| `\s`    | Qualquer caractere de espaço em branco      |

'''

class ToClean:
    def onlyDigits(self, val: str) -> str:
        val_str = str(val or '').strip()
        return re.sub(r'\D', '', val_str)

    def alphaNumeric(self, val: str) -> str:
        '''Return uppercase letters'''
        val_str = str(val or '').strip()
        val_str = val_str.upper()
        return val_str

    def name(self, val: str) -> str:
        val_str = str(val or '').strip()
        val_str = re.sub(r'[ \t]+', ' ', val_str)
        return val_str

    def email(self, val: str) -> str:
        val_str = str(val or '').strip()
        return val_str

    def enums(self, val: str):
        val_str = str(val or '').strip()
        return val_str

    def text(self, val: str):
        val_str = str(val or '').strip()
        val_str = re.sub(r'\s+', ' ', val_str)
        return val_str
    
    def date(self, val: str):
        val_str = str(val or '').strip()
        if not val_str:
            return ''
        day = val_str[0:2]
        mounth = val_str[3:5]
        year = val_str[6:]
        date_ = f"{year}/{mounth}/{day}" 
        return datetime.strptime(date_, "%Y/%m/%d").date()