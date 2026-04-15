"""
Seed script: popula o banco com citações filosóficas e estoicas reais.

Uso:
    python seed.py

Requer DATABASE_URL no .env ou como variável de ambiente.
"""

import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

import asyncpg

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://journal:journal@localhost:5432/philosophical_journal",
)
# asyncpg usa formato sem o prefixo sqlalchemy
PG_DSN = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

# ─── Tags ─────────────────────────────────────────────────────────────────────
TAGS = [
    {"name": "Estoicismo",          "color": "#8B7355"},
    {"name": "Virtude",             "color": "#6B8E6B"},
    {"name": "Dicotomia do Controle","color": "#7B6B8E"},
    {"name": "Memento Mori",        "color": "#8E6B6B"},
    {"name": "Amor Fati",           "color": "#8E7B4A"},
    {"name": "Razão",               "color": "#4A7B8E"},
    {"name": "Ética",               "color": "#6B8E7B"},
    {"name": "Existencialismo",     "color": "#8E6B7B"},
    {"name": "Sabedoria",           "color": "#7B8E4A"},
    {"name": "Felicidade",          "color": "#8E8A4A"},
    {"name": "Morte e Impermanência","color": "#6B6B8E"},
    {"name": "Natureza",            "color": "#4A8E6B"},
]

# ─── Citações ─────────────────────────────────────────────────────────────────
# Formato: (text, author, work, tags[], is_favorite)
QUOTES = [
    # Marco Aurélio — Meditações
    (
        "Você tem poder sobre sua mente, não sobre eventos externos. Perceba isso e encontrará força.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Dicotomia do Controle"], True,
    ),
    (
        "A felicidade de sua vida depende da qualidade de seus pensamentos.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Felicidade", "Razão"], True,
    ),
    (
        "Perca o tempo que você tem e você perderá o que não pode recuperar.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Memento Mori"], False,
    ),
    (
        "Nunca estime algo como lucrativo para você que o force a quebrar sua palavra, a perder seu respeito por si mesmo, a odiar alguém, a suspeitar, a amaldiçoar, a fingir, a desejar algo que precisa de paredes e cortinas.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Virtude", "Ética"], False,
    ),
    (
        "Quando você acorda de manhã, pense no precioso privilégio que é estar vivo — respirar, pensar, desfrutar, amar.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Amor Fati", "Felicidade"], True,
    ),
    (
        "O impedimento à ação avança a ação. O que está no caminho torna-se o caminho.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Amor Fati"], True,
    ),
    (
        "Aceite as coisas às quais o destino as une, e ame as pessoas com quem o destino te trouxe juntos.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Amor Fati"], False,
    ),
    (
        "Não desperdice o restante de sua vida em pensamentos sobre outras pessoas quando não está pensando em relação ao bem comum.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Razão"], False,
    ),
    (
        "Tudo que ouvimos é uma opinião, não um fato. Tudo que vemos é uma perspectiva, não a verdade.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Razão", "Sabedoria"], True,
    ),
    (
        "Muito pouco é necessário para fazer uma vida feliz; está tudo dentro de você mesmo, em sua maneira de pensar.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Felicidade"], True,
    ),

    # Epicteto — Enchiridion / Discursos
    (
        "Não busque que os eventos que acontecem sejam como você deseja; mas deseje que os eventos sejam como são, e você encontrará tranquilidade.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Dicotomia do Controle", "Amor Fati"], True,
    ),
    (
        "Homens não são perturbados pelas coisas, mas pelas opiniões que têm sobre as coisas.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Dicotomia do Controle", "Razão"], True,
    ),
    (
        "Primeiro diga a si mesmo o que você seria; então faça o que você tem que fazer.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Virtude", "Ética"], False,
    ),
    (
        "Faça o melhor uso do que está em seu poder e tome o resto como acontece.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Dicotomia do Controle"], True,
    ),
    (
        "Riqueza consiste não em ter grandes posses, mas em ter poucas necessidades.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Felicidade", "Sabedoria"], True,
    ),
    (
        "Não é o que acontece com você, mas como você reage a isso que importa.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Dicotomia do Controle"], True,
    ),
    (
        "Se alguém é capaz de mostrar-me que o que penso ou faço não é correto, eu mudarei de bom grado.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Razão", "Virtude"], False,
    ),
    (
        "Nunca diga sobre nada que perdi isso; diga que o devolvi.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Memento Mori", "Amor Fati"], False,
    ),

    # Sêneca — Cartas a Lucílio / Sobre a Brevidade da Vida
    (
        "Omnia, Lucili, aliena sunt, tempus tantum nostrum est. — Tudo é alheio, Lucílio; só o tempo é nosso.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Memento Mori"], True,
    ),
    (
        "Dum differtur vita transcurrit. — Enquanto adiamos, a vida passa.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Memento Mori"], True,
    ),
    (
        "Nusquam est qui ubique est. — Quem está em todo lugar não está em lugar nenhum.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Sabedoria"], False,
    ),
    (
        "Recede in te ipse quantum potes. — Retire-se para dentro de si mesmo tanto quanto puder.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Razão"], False,
    ),
    (
        "Não é que tenhamos pouco tempo, mas que desperdiçamos muito.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Memento Mori", "Sabedoria"], True,
    ),
    (
        "Comece a ser agora o que você será quando mais velho.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Virtude"], False,
    ),
    (
        "A sorte não tem nada a ver com isso. Eu me preparei para isso por muito tempo.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Virtude"], False,
    ),
    (
        "Vivere militare est. — Viver é lutar.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Amor Fati"], False,
    ),
    (
        "Nenhum vento é favorável para quem não sabe para qual porto está navegando.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Sabedoria", "Razão"], True,
    ),

    # Zenão de Cítio
    (
        "O homem tem dois ouvidos e uma boca para que possa ouvir o dobro do que fala.",
        "Zenão de Cítio", None,
        ["Estoicismo", "Sabedoria"], True,
    ),
    (
        "Melhor tropeçar com os pés do que com a língua.",
        "Zenão de Cítio", None,
        ["Estoicismo", "Sabedoria"], False,
    ),
    (
        "Seguir a natureza é o objetivo da vida.",
        "Zenão de Cítio", None,
        ["Estoicismo", "Natureza", "Virtude"], False,
    ),

    # Cleantes de Assos
    (
        "Conduze-me, Zeus, e tu também, Destino, para onde quer que me tenhas designado.",
        "Cleantes de Assos", "Hino a Zeus",
        ["Estoicismo", "Amor Fati", "Natureza"], False,
    ),

    # Crisipo de Solos
    (
        "A virtude é suficiente para a felicidade.",
        "Crisipo de Solos", None,
        ["Estoicismo", "Virtude", "Felicidade"], False,
    ),

    # Sócrates (via Platão)
    (
        "Só sei que nada sei.",
        "Sócrates", None,
        ["Sabedoria", "Razão"], True,
    ),
    (
        "Uma vida não examinada não vale a pena ser vivida.",
        "Sócrates", "Apologia",
        ["Sabedoria", "Ética", "Razão"], True,
    ),
    (
        "Seja a mudança que você deseja ver no mundo.",
        "Sócrates", None,
        ["Virtude", "Ética"], False,
    ),
    (
        "Cuide de sua alma.",
        "Sócrates", "Apologia",
        ["Virtude", "Ética", "Sabedoria"], False,
    ),
    (
        "Não posso ensinar nada a ninguém. Só posso fazê-los pensar.",
        "Sócrates", None,
        ["Sabedoria", "Razão"], True,
    ),

    # Platão
    (
        "O começo é a parte mais importante do trabalho.",
        "Platão", "A República",
        ["Sabedoria", "Razão"], False,
    ),
    (
        "A necessidade é a mãe da invenção.",
        "Platão", "A República",
        ["Razão", "Sabedoria"], False,
    ),
    (
        "Bons homens não precisam de leis para dizer-lhes agir responsavelmente, enquanto homens ruins encontrarão uma maneira de contornar as leis.",
        "Platão", "A República",
        ["Ética", "Virtude"], False,
    ),
    (
        "A música dá asas à mente, voo à imaginação, e vida a tudo.",
        "Platão", None,
        ["Felicidade", "Natureza"], False,
    ),

    # Aristóteles
    (
        "Somos o que repetidamente fazemos. A excelência, portanto, não é um ato, mas um hábito.",
        "Aristóteles", "Ética a Nicômaco",
        ["Virtude", "Ética", "Sabedoria"], True,
    ),
    (
        "A felicidade é a atividade da alma de acordo com a virtude.",
        "Aristóteles", "Ética a Nicômaco",
        ["Felicidade", "Virtude", "Ética"], True,
    ),
    (
        "O homem é por natureza um animal político.",
        "Aristóteles", "Política",
        ["Natureza", "Razão"], False,
    ),
    (
        "Educar a mente sem educar o coração não é educação alguma.",
        "Aristóteles", None,
        ["Virtude", "Ética", "Sabedoria"], True,
    ),
    (
        "O todo é maior do que a soma de suas partes.",
        "Aristóteles", "Metafísica",
        ["Razão", "Natureza"], False,
    ),
    (
        "Conhecer-se a si mesmo é o começo de toda sabedoria.",
        "Aristóteles", None,
        ["Sabedoria", "Razão"], True,
    ),

    # Heráclito
    (
        "Não se pode entrar duas vezes no mesmo rio.",
        "Heráclito", None,
        ["Natureza", "Memento Mori", "Morte e Impermanência"], True,
    ),
    (
        "O caráter é o destino.",
        "Heráclito", None,
        ["Virtude", "Ética"], True,
    ),
    (
        "A guerra é o pai de todas as coisas.",
        "Heráclito", None,
        ["Natureza", "Amor Fati"], False,
    ),
    (
        "Tudo flui, nada permanece.",
        "Heráclito", None,
        ["Natureza", "Morte e Impermanência"], True,
    ),

    # Diógenes de Sínope
    (
        "O homem mais rico é aquele cujos prazeres são os mais baratos.",
        "Diógenes de Sínope", None,
        ["Sabedoria", "Felicidade"], True,
    ),
    (
        "Estou procurando um homem honesto.",
        "Diógenes de Sínope", None,
        ["Virtude", "Ética"], False,
    ),

    # Epicuro
    (
        "Não estrague o que você tem desejando o que não tem; lembre-se que o que você tem agora foi uma vez entre as coisas que você apenas esperava.",
        "Epicuro", None,
        ["Felicidade", "Sabedoria"], True,
    ),
    (
        "A morte não é nada para nós; quando existimos, a morte não está presente, e quando a morte está presente, então não existimos.",
        "Epicuro", "Carta a Meneceu",
        ["Morte e Impermanência", "Memento Mori"], True,
    ),
    (
        "De todas as coisas que a sabedoria fornece para tornar a vida completamente feliz, a maior é a posse da amizade.",
        "Epicuro", None,
        ["Felicidade", "Sabedoria"], False,
    ),

    # Nietzsche
    (
        "O que não me mata me fortalece.",
        "Friedrich Nietzsche", "Crepúsculo dos Ídolos",
        ["Amor Fati", "Virtude"], True,
    ),
    (
        "Sem música, a vida seria um erro.",
        "Friedrich Nietzsche", "Crepúsculo dos Ídolos",
        ["Felicidade", "Amor Fati"], True,
    ),
    (
        "Aquele que tem um porquê para viver pode suportar quase qualquer como.",
        "Friedrich Nietzsche", None,
        ["Existencialismo", "Amor Fati"], True,
    ),
    (
        "Você deve ter caos dentro de você para dar à luz uma estrela dançante.",
        "Friedrich Nietzsche", "Assim Falou Zaratustra",
        ["Existencialismo", "Amor Fati"], False,
    ),
    (
        "Deus está morto. Deus permanece morto. E nós o matamos.",
        "Friedrich Nietzsche", "A Gaia Ciência",
        ["Existencialismo", "Razão"], False,
    ),
    (
        "Amor fati: ame seu destino.",
        "Friedrich Nietzsche", "Ecce Homo",
        ["Amor Fati", "Existencialismo"], True,
    ),

    # Sartre
    (
        "A existência precede a essência.",
        "Jean-Paul Sartre", "O Existencialismo é um Humanismo",
        ["Existencialismo", "Razão"], True,
    ),
    (
        "O homem está condenado a ser livre.",
        "Jean-Paul Sartre", "O Existencialismo é um Humanismo",
        ["Existencialismo", "Ética"], True,
    ),
    (
        "O inferno são os outros.",
        "Jean-Paul Sartre", "Entre Quatro Paredes",
        ["Existencialismo"], False,
    ),

    # Camus
    (
        "Deve-se imaginar Sísifo feliz.",
        "Albert Camus", "O Mito de Sísifo",
        ["Existencialismo", "Amor Fati", "Felicidade"], True,
    ),
    (
        "No meio do inverno, descobri dentro de mim um verão invencível.",
        "Albert Camus", None,
        ["Existencialismo", "Amor Fati"], True,
    ),
    (
        "A luta em direção ao topo é suficiente para preencher o coração de um homem.",
        "Albert Camus", "O Mito de Sísifo",
        ["Existencialismo", "Amor Fati"], False,
    ),

    # Spinoza
    (
        "A paz não é a ausência de guerra; é uma virtude, um estado de espírito, uma disposição para a benevolência, confiança e justiça.",
        "Baruch Spinoza", "Tratado Político",
        ["Virtude", "Ética", "Razão"], True,
    ),
    (
        "Não rir, não lamentar, não detestar, mas compreender.",
        "Baruch Spinoza", "Tratado Político",
        ["Razão", "Sabedoria"], True,
    ),

    # Kant
    (
        "Age apenas segundo uma máxima tal que possas ao mesmo tempo querer que ela se torne uma lei universal.",
        "Immanuel Kant", "Fundamentação da Metafísica dos Costumes",
        ["Ética", "Razão", "Virtude"], True,
    ),
    (
        "Duas coisas me enchem de admiração e reverência crescentes: o céu estrelado acima de mim e a lei moral dentro de mim.",
        "Immanuel Kant", "Crítica da Razão Prática",
        ["Ética", "Razão", "Natureza"], True,
    ),

    # Montaigne
    (
        "Filosofar é aprender a morrer.",
        "Michel de Montaigne", "Ensaios",
        ["Morte e Impermanência", "Sabedoria", "Memento Mori"], True,
    ),
    (
        "Cada homem carrega a forma inteira da condição humana.",
        "Michel de Montaigne", "Ensaios",
        ["Sabedoria", "Razão"], False,
    ),

    # Pascal
    (
        "O coração tem razões que a própria razão desconhece.",
        "Blaise Pascal", "Pensamentos",
        ["Razão", "Sabedoria"], True,
    ),
    (
        "Todo o infortúnio dos homens vem de uma única coisa: não saber ficar quieto em um quarto.",
        "Blaise Pascal", "Pensamentos",
        ["Sabedoria", "Razão"], True,
    ),

    # Confúcio
    (
        "Não importa quão devagar você vá, desde que não pare.",
        "Confúcio", None,
        ["Sabedoria", "Virtude"], True,
    ),
    (
        "Escolha um trabalho que você ame e não terá que trabalhar um único dia em sua vida.",
        "Confúcio", None,
        ["Felicidade", "Sabedoria"], True,
    ),
    (
        "Quando você sabe uma coisa, reconhecer que você a sabe; e quando não sabe uma coisa, reconhecer que não a sabe — isso é conhecimento.",
        "Confúcio", "Analectos",
        ["Sabedoria", "Razão"], False,
    ),

    # Lao-Tsé
    (
        "Uma jornada de mil milhas começa com um único passo.",
        "Lao-Tsé", "Tao Te Ching",
        ["Sabedoria", "Natureza"], True,
    ),
    (
        "Conhecer os outros é sabedoria; conhecer a si mesmo é iluminação.",
        "Lao-Tsé", "Tao Te Ching",
        ["Sabedoria", "Razão"], True,
    ),
    (
        "A natureza não se apressa, mas tudo é realizado.",
        "Lao-Tsé", "Tao Te Ching",
        ["Natureza", "Sabedoria"], True,
    ),
]


async def seed():
    print("Conectando ao banco de dados...")
    conn = await asyncpg.connect(PG_DSN)

    try:
        # ── Inserir tags ──────────────────────────────────────────────────────
        print(f"Inserindo {len(TAGS)} tags...")
        tag_ids: dict[str, str] = {}
        for tag in TAGS:
            row = await conn.fetchrow(
                """
                INSERT INTO tags (name, color)
                VALUES ($1, $2)
                ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color
                RETURNING id, name
                """,
                tag["name"], tag["color"],
            )
            tag_ids[row["name"]] = str(row["id"])
        print(f"  ✓ {len(tag_ids)} tags prontas")

        # ── Inserir citações ──────────────────────────────────────────────────
        print(f"Inserindo {len(QUOTES)} citações...")
        inserted = 0
        skipped = 0
        for text, author, work, tag_names, is_favorite in QUOTES:
            # Verificar se já existe
            existing = await conn.fetchrow(
                "SELECT id FROM quotes WHERE text = $1 AND author = $2",
                text, author,
            )
            if existing:
                skipped += 1
                continue

            # Inserir citação
            quote_row = await conn.fetchrow(
                """
                INSERT INTO quotes (text, author, work, is_favorite)
                VALUES ($1, $2, $3, $4)
                RETURNING id
                """,
                text, author, work, is_favorite,
            )
            quote_id = quote_row["id"]

            # Associar tags
            for tag_name in tag_names:
                if tag_name in tag_ids:
                    await conn.execute(
                        """
                        INSERT INTO quote_tags (quote_id, tag_id)
                        VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                        """,
                        quote_id, tag_ids[tag_name],
                    )

            inserted += 1

        print(f"  ✓ {inserted} citações inseridas, {skipped} já existiam")
        print("\nSeed concluído com sucesso!")
        print(f"  Tags: {len(tag_ids)}")
        print(f"  Citações: {inserted}")
        print("\nAutores incluídos:")
        authors = sorted(set(q[1] for q in QUOTES))
        for a in authors:
            count = sum(1 for q in QUOTES if q[1] == a)
            print(f"  • {a} ({count} citações)")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed())
