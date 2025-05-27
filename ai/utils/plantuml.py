#utils/plantuml
import zlib

def validate_plantuml_code(code: str) -> bool:
    return (
        code.startswith("@startuml")
        and code.endswith("@enduml")
        and "participant" in code
        and any(arrow in code for arrow in ["->", "-->", "->>"])
    )


def plantuml_encode(plantuml_text: str) -> str:
    def encode6bit(b):
        if b < 10:
            return chr(48 + b)
        b -= 10
        if b < 26:
            return chr(65 + b)
        b -= 26
        if b < 26:
            return chr(97 + b)
        b -= 26
        if b == 0:
            return '-'
        if b == 1:
            return '_'
        return '?'

    def append3bytes(b1, b2, b3):
        c1 = (b1 >> 2) & 0x3F
        c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
        c3 = ((b2 & 0xF) << 2) | (b3 >> 6)
        c4 = b3 & 0x3F
        return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4)

    compressor = zlib.compressobj(level=9, wbits=-15)
    compressed = compressor.compress(plantuml_text.encode('utf-8')) + compressor.flush()
    encoded = ''
    i = 0
    while i < len(compressed):
        if i + 1 == len(compressed):
            encoded += append3bytes(compressed[i], 0, 0)
            break
        elif i + 2 == len(compressed):
            encoded += append3bytes(compressed[i], compressed[i + 1], 0)
            break
        else:
            encoded += append3bytes(compressed[i], compressed[i + 1], compressed[i + 2])
            i += 3
    return encoded
