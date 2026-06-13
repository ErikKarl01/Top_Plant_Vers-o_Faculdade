import re

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
        val_str = re.sub(r'[^0-9]+', '', val_str)
        return val_str

    def alphaNumeric(self, val: str) -> str:
        '''Return uppercase letters'''
        val_str = str(val or '').strip()
        val_str = re.sub(r'[^A-Za-z0-9]+', '', val_str)
        val_str = val_str.upper()
        return val_str

    def personName(self, val: str) -> str:
        val_str = str(val or '').strip()
        val_str = re.sub(r"[^A-Za-zÀ-ÖØ-öø-ÿ'\s-]+", '', val_str)
        val_str = re.sub(r'\s+', ' ', val_str)
        return val_str

    def email(self, val: str) -> str:
        val_str = str(val or '').strip()
        return val_str

    def enums(self, val: str):
        val_str = str(val or '').strip().upper()
        return val_str

    def addressText(self, val: str):
        val_str = str(val or '').strip()
        val_str = re.sub(r"[^A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,-]+", '', val_str)
        val_str = re.sub(r'\s+', ' ', val_str)
        return val_str