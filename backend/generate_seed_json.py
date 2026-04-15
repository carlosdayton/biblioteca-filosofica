"""
Gera o arquivo seed.json no formato do LocalStorageService.
"""
import json
from datetime import datetime

TAGS = [
    {"name": "Estoicismo",            "color": "#8B7355"},
    {"name": "Virtude",               "color": "#6B8E6B"},
    {"name": "Dicotomia do Controle", "color": "#7B6B8E"},
    {"name": "Memento Mori",          "color": "#8E6B6B"},
    {"name": "Amor Fati",             "color": "#8E7B4A"},
    {"name": "Razão",                 "color": "#4A7B8E"},
    {"name": "Ética",                 "color": "#6B8E7B"},
    {"name": "Existencialismo",       "color": "#8E6B7B"},
    {"name": "Sabedoria",             "color": "#7B8E4A"},
    {"name": "Felicidade",            "color": "#8E8A4A"},
    {"name": "Morte e Impermanência", "color": "#6B6B8E"},
    {"name": "Natureza",              "color": "#4A8E6B"},
]

QUOTES = [
    ("Você tem poder sobre sua mente, não sobre eventos externos. Perceba isso e encontrará força.", "Marco Aurélio", "Meditações", ["Estoicismo", "Dicotomia do Controle"], True),
    ("A felicidade de sua vida depende da qualidade de seus pensamentos.", "Marco Aurélio", "Meditações", ["Estoicismo", "Felicidade", "Razão"], True),
    ("Perca o tempo que você tem e você perderá o que não pode recuperar.", "Marco Aurélio", "Meditações", ["Estoicismo", "Memento Mori"], False),
    ("Quando você acorda de manhã, pense no precioso privilégio que é estar vivo — respirar, pensar, desfrutar, amar.", "Marco Aurélio", "Meditações", ["Estoicismo", "Amor Fati", "Felicidade"], True),
    ("O impedimento à ação avança a ação. O que está no caminho torna-se o caminho.", "Marco Aurélio", "Meditações", ["Estoicismo", "Amor Fati"], True),
    ("Tudo que ouvimos é uma opinião, não um fato. Tudo que vemos é uma perspectiva, não a verdade.", "Marco Aurélio", "Meditações", ["Estoicismo", "Razão", "Sabedoria"], True),
    ("Muito pouco é necessário para fazer uma vida feliz; está tudo dentro de você mesmo, em sua maneira de pensar.", "Marco Aurélio", "Meditações", ["Estoicismo", "Felicidade"], True),
    ("A melhor vingança é não ser como o teu inimigo.", "Marco Aurélio", "Meditações", ["Estoicismo", "Virtude", "Ética"], True),
    ("Recebe sem orgulho, abandona sem luta.", "Marco Aurélio", "Meditações", ["Estoicismo", "Amor Fati", "Dicotomia do Controle"], True),
    ("A alma torna-se tingida pela cor dos seus pensamentos.", "Marco Aurélio", "Meditações", ["Estoicismo", "Virtude", "Razão"], True),
    ("Faz cada acto da tua vida como se fosse o último.", "Marco Aurélio", "Meditações", ["Estoicismo", "Memento Mori", "Virtude"], True),
    ("Não é a morte que o homem deve temer, mas nunca ter começado a viver.", "Marco Aurélio", "Meditações", ["Estoicismo", "Memento Mori", "Morte e Impermanência"], True),
    ("Olha para dentro. Dentro de ti está a fonte do bem, e ela pode jorrar incessantemente, se continuares a escavar.", "Marco Aurélio", "Meditações", ["Estoicismo", "Virtude", "Sabedoria"], True),
    ("Não te perturbes com o futuro. Chegarás a ele, se for necessário, com a mesma razão que usas agora para o presente.", "Marco Aurélio", "Meditações", ["Estoicismo", "Dicotomia do Controle", "Razão"], True),
    ("Perde tempo quem faz outra coisa que não seja melhorar sua alma.", "Marco Aurélio", "Meditações", ["Estoicismo", "Virtude", "Sabedoria"], True),
    ("Não busque que os eventos que acontecem sejam como você deseja; mas deseje que os eventos sejam como são, e você encontrará tranquilidade.", "Epicteto", "Enchiridion", ["Estoicismo", "Dicotomia do Controle", "Amor Fati"], True),
    ("Homens não são perturbados pelas coisas, mas pelas opiniões que têm sobre as coisas.", "Epicteto", "Enchiridion", ["Estoicismo", "Dicotomia do Controle", "Razão"], True),
    ("Faça o melhor uso do que está em seu poder e tome o resto como acontece.", "Epicteto", "Enchiridion", ["Estoicismo", "Dicotomia do Controle"], True),
    ("Riqueza consiste não em ter grandes posses, mas em ter poucas necessidades.", "Epicteto", "Discursos", ["Estoicismo", "Felicidade", "Sabedoria"], True),
    ("Não é o que acontece com você, mas como você reage a isso que importa.", "Epicteto", "Enchiridion", ["Estoicismo", "Dicotomia do Controle"], True),
    ("Das coisas que existem, umas dependem de nós, outras não.", "Epicteto", "Enchiridion", ["Estoicismo", "Dicotomia do Controle"], True),
    ("A liberdade não é obtida pela satisfação dos desejos, mas pela eliminação do desejo.", "Epicteto", "Discursos", ["Estoicismo", "Felicidade", "Virtude"], True),
    ("Não é possível aprender o que já se pensa saber.", "Epicteto", "Discursos", ["Estoicismo", "Sabedoria", "Razão"], True),
    ("Tens duas orelhas e uma boca para ouvires o dobro do que falas.", "Epicteto", "Discursos", ["Estoicismo", "Sabedoria"], False),
    ("Omnia, Lucili, aliena sunt, tempus tantum nostrum est. — Tudo é alheio, Lucílio; só o tempo é nosso.", "Sêneca", "Cartas a Lucílio", ["Estoicismo", "Memento Mori"], True),
    ("Dum differtur vita transcurrit. — Enquanto adiamos, a vida passa.", "Sêneca", "Sobre a Brevidade da Vida", ["Estoicismo", "Memento Mori"], True),
    ("Não é que tenhamos pouco tempo, mas que desperdiçamos muito.", "Sêneca", "Sobre a Brevidade da Vida", ["Estoicismo", "Memento Mori", "Sabedoria"], True),
    ("Nenhum vento é favorável para quem não sabe para qual porto está navegando.", "Sêneca", "Cartas a Lucílio", ["Estoicismo", "Sabedoria", "Razão"], True),
    ("A vida é longa se souberes usá-la.", "Sêneca", "Sobre a Brevidade da Vida", ["Estoicismo", "Sabedoria", "Memento Mori"], True),
    ("Vivere militare est. — Viver é lutar.", "Sêneca", "Cartas a Lucílio", ["Estoicismo", "Amor Fati"], False),
    ("Nemo potest personam diu ferre. — Ninguém pode usar uma máscara por muito tempo.", "Sêneca", "Cartas a Lucílio", ["Estoicismo", "Virtude", "Ética"], True),
    ("A tranquilidade da alma vem de não desejar nada além do que se tem.", "Sêneca", "Sobre a Tranquilidade da Alma", ["Estoicismo", "Felicidade", "Sabedoria"], True),
    ("Retire-se para dentro de si mesmo tanto quanto puder; conviva com aqueles que podem torná-lo melhor.", "Sêneca", "Sobre a Tranquilidade da Alma", ["Estoicismo", "Virtude", "Sabedoria"], True),
    ("O homem tem dois ouvidos e uma boca para que possa ouvir o dobro do que fala.", "Zenão de Cítio", None, ["Estoicismo", "Sabedoria"], True),
    ("Seguir a natureza é o objetivo da vida.", "Zenão de Cítio", None, ["Estoicismo", "Natureza", "Virtude"], False),
    ("A virtude é suficiente para a felicidade.", "Crisipo de Solos", None, ["Estoicismo", "Virtude", "Felicidade"], False),
    ("Só sei que nada sei.", "Sócrates", None, ["Sabedoria", "Razão"], True),
    ("Uma vida não examinada não vale a pena ser vivida.", "Sócrates", "Apologia", ["Sabedoria", "Ética", "Razão"], True),
    ("Não posso ensinar nada a ninguém. Só posso fazê-los pensar.", "Sócrates", None, ["Sabedoria", "Razão"], True),
    ("Cuide de sua alma.", "Sócrates", "Apologia", ["Virtude", "Ética", "Sabedoria"], False),
    ("O começo é a parte mais importante do trabalho.", "Platão", "A República", ["Sabedoria", "Razão"], False),
    ("Bons homens não precisam de leis para dizer-lhes agir responsavelmente, enquanto homens ruins encontrarão uma maneira de contornar as leis.", "Platão", "A República", ["Ética", "Virtude"], False),
    ("Somos o que repetidamente fazemos. A excelência, portanto, não é um ato, mas um hábito.", "Aristóteles", "Ética a Nicômaco", ["Virtude", "Ética", "Sabedoria"], True),
    ("A felicidade é a atividade da alma de acordo com a virtude.", "Aristóteles", "Ética a Nicômaco", ["Felicidade", "Virtude", "Ética"], True),
    ("Educar a mente sem educar o coração não é educação alguma.", "Aristóteles", None, ["Virtude", "Ética", "Sabedoria"], True),
    ("Conhecer-se a si mesmo é o começo de toda sabedoria.", "Aristóteles", None, ["Sabedoria", "Razão"], True),
    ("O homem é por natureza um animal político.", "Aristóteles", "Política", ["Natureza", "Razão"], False),
    ("Não se pode entrar duas vezes no mesmo rio.", "Heráclito", None, ["Natureza", "Memento Mori", "Morte e Impermanência"], True),
    ("O caráter é o destino.", "Heráclito", None, ["Virtude", "Ética"], True),
    ("Tudo flui, nada permanece.", "Heráclito", None, ["Natureza", "Morte e Impermanência"], True),
    ("O homem mais rico é aquele cujos prazeres são os mais baratos.", "Diógenes de Sínope", None, ["Sabedoria", "Felicidade"], True),
    ("Não estrague o que você tem desejando o que não tem; lembre-se que o que você tem agora foi uma vez entre as coisas que você apenas esperava.", "Epicuro", None, ["Felicidade", "Sabedoria"], True),
    ("A morte não é nada para nós; quando existimos, a morte não está presente, e quando a morte está presente, então não existimos.", "Epicuro", "Carta a Meneceu", ["Morte e Impermanência", "Memento Mori"], True),
    ("O que não me mata me fortalece.", "Friedrich Nietzsche", "Crepúsculo dos Ídolos", ["Amor Fati", "Virtude"], True),
    ("Aquele que tem um porquê para viver pode suportar quase qualquer como.", "Friedrich Nietzsche", None, ["Existencialismo", "Amor Fati"], True),
    ("Amor fati: ame seu destino.", "Friedrich Nietzsche", "Ecce Homo", ["Amor Fati", "Existencialismo"], True),
    ("Sem música, a vida seria um erro.", "Friedrich Nietzsche", "Crepúsculo dos Ídolos", ["Felicidade", "Amor Fati"], True),
    ("Você deve ter caos dentro de você para dar à luz uma estrela dançante.", "Friedrich Nietzsche", "Assim Falou Zaratustra", ["Existencialismo", "Amor Fati"], False),
    ("A existência precede a essência.", "Jean-Paul Sartre", "O Existencialismo é um Humanismo", ["Existencialismo", "Razão"], True),
    ("O homem está condenado a ser livre.", "Jean-Paul Sartre", "O Existencialismo é um Humanismo", ["Existencialismo", "Ética"], True),
    ("Deve-se imaginar Sísifo feliz.", "Albert Camus", "O Mito de Sísifo", ["Existencialismo", "Amor Fati", "Felicidade"], True),
    ("No meio do inverno, descobri dentro de mim um verão invencível.", "Albert Camus", None, ["Existencialismo", "Amor Fati"], True),
    ("A paz não é a ausência de guerra; é uma virtude, um estado de espírito, uma disposição para a benevolência, confiança e justiça.", "Baruch Spinoza", "Tratado Político", ["Virtude", "Ética", "Razão"], True),
    ("Não rir, não lamentar, não detestar, mas compreender.", "Baruch Spinoza", "Tratado Político", ["Razão", "Sabedoria"], True),
    ("Age apenas segundo uma máxima tal que possas ao mesmo tempo querer que ela se torne uma lei universal.", "Immanuel Kant", "Fundamentação da Metafísica dos Costumes", ["Ética", "Razão", "Virtude"], True),
    ("Duas coisas me enchem de admiração e reverência crescentes: o céu estrelado acima de mim e a lei moral dentro de mim.", "Immanuel Kant", "Crítica da Razão Prática", ["Ética", "Razão", "Natureza"], True),
    ("Filosofar é aprender a morrer.", "Michel de Montaigne", "Ensaios", ["Morte e Impermanência", "Sabedoria", "Memento Mori"], True),
    ("O coração tem razões que a própria razão desconhece.", "Blaise Pascal", "Pensamentos", ["Razão", "Sabedoria"], True),
    ("Todo o infortúnio dos homens vem de uma única coisa: não saber ficar quieto em um quarto.", "Blaise Pascal", "Pensamentos", ["Sabedoria", "Razão"], True),
    ("Não importa quão devagar você vá, desde que não pare.", "Confúcio", None, ["Sabedoria", "Virtude"], True),
    ("Escolha um trabalho que você ame e não terá que trabalhar um único dia em sua vida.", "Confúcio", None, ["Felicidade", "Sabedoria"], True),
    ("Conhecer os outros é sabedoria; conhecer a si mesmo é iluminação.", "Lao-Tsé", "Tao Te Ching", ["Sabedoria", "Razão"], True),
    ("Uma jornada de mil milhas começa com um único passo.", "Lao-Tsé", "Tao Te Ching", ["Sabedoria", "Natureza"], True),
    ("A natureza não se apressa, mas tudo é realizado.", "Lao-Tsé", "Tao Te Ching", ["Natureza", "Sabedoria"], True),
]

# Construir mapa de tags
tag_map = {}
tags_out = []
for i, t in enumerate(TAGS, 1):
    tid = f"tag-{i}"
    tag_map[t["name"]] = tid
    tags_out.append({"id": tid, "name": t["name"], "color": t["color"], "quoteCount": 0})

# Construir citações
quotes_out = []
tag_counts = {t["id"]: 0 for t in tags_out}
now = datetime.utcnow().isoformat() + "Z"

for i, (text, author, work, tag_names, is_favorite) in enumerate(QUOTES, 1):
    qid = f"quote-{i}"
    tags = []
    for tn in tag_names:
        if tn in tag_map:
            tid = tag_map[tn]
            tag_obj = next(t for t in tags_out if t["id"] == tid)
            tags.append({"id": tid, "name": tag_obj["name"], "color": tag_obj["color"], "quoteCount": 0})
            tag_counts[tid] += 1

    quotes_out.append({
        "id": qid,
        "text": text,
        "author": author,
        "work": work,
        "reflection": None,
        "tags": tags,
        "isFavorite": is_favorite,
        "createdAt": now,
        "updatedAt": now,
    })

# Atualizar contadores de tags
for t in tags_out:
    t["quoteCount"] = tag_counts[t["id"]]

# Montar estrutura final
data = {
    "quotes": quotes_out,
    "tags": tags_out,
    "nextQuoteId": len(QUOTES) + 1,
    "nextTagId": len(TAGS) + 1,
    "version": "1.0.0",
    "lastModified": now,
    "exportedAt": now,
    "exportVersion": "1.0.0"
}

output_path = "frontend/public/seed-data.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Gerado: {output_path}")
print(f"  {len(quotes_out)} citações")
print(f"  {len(tags_out)} tags")
print(f"  Autores: {len(set(q[1] for q in QUOTES))}")
