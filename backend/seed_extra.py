"""
Seed extra: citações adicionais das fontes primárias estoicas.
Baseado em Meditações (Marco Aurélio), Cartas a Lucílio, Sobre a Brevidade
da Vida, Sobre a Tranquilidade da Alma (Sêneca) e Discursos (Epicteto).

Uso:
    python seed_extra.py
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
PG_DSN = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

EXTRA_QUOTES = [
    # ── Marco Aurélio — Meditações ────────────────────────────────────────────
    (
        "Perde tempo quem faz outra coisa que não seja melhorar sua alma.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Virtude", "Sabedoria"], True,
    ),
    (
        "Não te perturbes com o futuro. Chegarás a ele, se for necessário, com a mesma razão que usas agora para o presente.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Dicotomia do Controle", "Razão"], True,
    ),
    (
        "Quando acordares de manhã, pensa nos privilégios de estar vivo: respirar, pensar, desfrutar, amar.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Amor Fati", "Felicidade"], True,
    ),
    (
        "Não te envergonhes de ser ajudado. Tens de cumprir a tarefa que te foi atribuída, como um soldado no assalto a uma muralha.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Virtude"], False,
    ),
    (
        "Olha para dentro. Dentro de ti está a fonte do bem, e ela pode jorrar incessantemente, se continuares a escavar.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Virtude", "Sabedoria"], True,
    ),
    (
        "Não te importes com o que os outros pensam de ti. Importa-te com o que tu pensas de ti mesmo.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Dicotomia do Controle", "Virtude"], False,
    ),
    (
        "Tudo o que ouves é uma opinião, não um facto. Tudo o que vês é uma perspectiva, não a verdade.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Razão", "Sabedoria"], True,
    ),
    (
        "A melhor vingança é não ser como o teu inimigo.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Virtude", "Ética"], True,
    ),
    (
        "Recebe sem orgulho, abandona sem luta.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Amor Fati", "Dicotomia do Controle"], True,
    ),
    (
        "Nunca estimes algo como lucrativo para ti se te obrigar a quebrar a tua palavra, a perder o respeito por ti mesmo, a odiar alguém.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Virtude", "Ética"], False,
    ),
    (
        "Quando te levantares relutante de manhã, deixa este pensamento estar presente: levanto-me para fazer o trabalho de um ser humano.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Virtude", "Amor Fati"], True,
    ),
    (
        "Não é a morte que o homem deve temer, mas nunca ter começado a viver.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Memento Mori", "Morte e Impermanência"], True,
    ),
    (
        "Perde o menor tempo possível com pessoas que não contribuem para o teu crescimento.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Sabedoria"], False,
    ),
    (
        "O universo é transformação; a vida é opinião.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Razão", "Natureza"], False,
    ),
    (
        "Faz cada acto da tua vida como se fosse o último.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Memento Mori", "Virtude"], True,
    ),
    (
        "Não te preocupes com o que os outros dizem de ti. Preocupa-te com o que fazes.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Dicotomia do Controle"], False,
    ),
    (
        "A alma torna-se tingida pela cor dos seus pensamentos.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Virtude", "Razão"], True,
    ),
    (
        "Tudo o que é harmonioso para ti, ó Universo, é harmonioso para mim.",
        "Marco Aurélio", "Meditações",
        ["Estoicismo", "Amor Fati", "Natureza"], False,
    ),

    # ── Sêneca — Cartas a Lucílio ─────────────────────────────────────────────
    (
        "Ita fac, mi Lucili: vindica te tibi. — Faz isso, meu Lucílio: reivindica-te para ti mesmo.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Dicotomia do Controle", "Sabedoria"], True,
    ),
    (
        "Omnia aliena sunt, tempus tantum nostrum est. — Tudo é alheio; só o tempo é nosso.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Memento Mori"], True,
    ),
    (
        "Recede in te ipse quantum potes. — Retira-te para dentro de ti mesmo tanto quanto possas.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Razão", "Sabedoria"], True,
    ),
    (
        "Dum differtur vita transcurrit. — Enquanto adiamos, a vida passa.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Memento Mori"], True,
    ),
    (
        "Nusquam est qui ubique est. — Quem está em todo lugar não está em lugar nenhum.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Sabedoria"], False,
    ),
    (
        "Hoc primum philosophia promittit: sensum communem, humanitatem et congregationem. — Isto é o que a filosofia promete primeiro: senso comum, humanidade e comunhão.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Virtude", "Ética"], False,
    ),
    (
        "Inimica est multorum conversatio. — A convivência com muitos é prejudicial.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Sabedoria"], False,
    ),
    (
        "Recede in te ipse cum his quibus dignus es. — Retira-te para dentro de ti mesmo com aqueles que são dignos de ti.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Sabedoria", "Virtude"], False,
    ),
    (
        "Vivere, Lucili, militare est. — Viver, Lucílio, é combater.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Amor Fati", "Virtude"], True,
    ),
    (
        "Nemo potest personam diu ferre. — Ninguém pode usar uma máscara por muito tempo.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Virtude", "Ética"], True,
    ),
    (
        "Dum differtur vita transcurrit. Nusquam est qui ubique est. — Enquanto adiamos, a vida passa. Quem está em todo lugar não está em lugar nenhum.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Memento Mori", "Sabedoria"], False,
    ),
    (
        "Cogita quantum temporis absumpserit. — Pensa em quanto tempo foi consumido.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Memento Mori"], False,
    ),
    (
        "Ita fac, mi Lucili: vindica te tibi, et tempus quod adhuc aut auferebatur aut subripiebatur aut excidebat collige et serva.",
        "Sêneca", "Cartas a Lucílio",
        ["Estoicismo", "Memento Mori", "Sabedoria"], True,
    ),

    # ── Sêneca — Sobre a Brevidade da Vida ───────────────────────────────────
    (
        "Ita est, Pauline: distringimur, nec vivere vacat. — É assim, Paulino: estamos ocupados demais e não temos tempo para viver.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Memento Mori", "Sabedoria"], True,
    ),
    (
        "Non exiguum temporis habemus, sed multum perdidimus. — Não temos pouco tempo; perdemos muito.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Memento Mori"], True,
    ),
    (
        "Omnia, Lucili, aliena sunt, tempus tantum nostrum est.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Memento Mori", "Dicotomia do Controle"], False,
    ),
    (
        "Dum differtur vita transcurrit. Nusquam est qui ubique est.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Memento Mori"], False,
    ),
    (
        "Recede in te ipse quantum potes; cum his versare qui te meliorem acturi sunt.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Virtude", "Sabedoria"], False,
    ),
    (
        "A vida é longa se souberes usá-la.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Sabedoria", "Memento Mori"], True,
    ),
    (
        "Os homens ocupados descobrem que a vida é curta; os ociosos provam que é longa.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Sabedoria", "Virtude"], True,
    ),
    (
        "Omnia, Lucili, aliena sunt, tempus tantum nostrum est. Ita fac, mi Lucili: vindica te tibi.",
        "Sêneca", "Sobre a Brevidade da Vida",
        ["Estoicismo", "Memento Mori", "Dicotomia do Controle"], False,
    ),

    # ── Sêneca — Sobre a Tranquilidade da Alma ───────────────────────────────
    (
        "Hoc primum philosophia promittit: sensum communem, humanitatem et congregationem.",
        "Sêneca", "Sobre a Tranquilidade da Alma",
        ["Estoicismo", "Virtude", "Ética"], False,
    ),
    (
        "Recede in te ipse quantum potes; cum his versare qui te meliorem acturi sunt; admitte quos potes reddere meliores.",
        "Sêneca", "Sobre a Tranquilidade da Alma",
        ["Estoicismo", "Virtude", "Sabedoria"], False,
    ),
    (
        "Nusquam est qui ubique est. Vitam in peregrinatione exigentibus hoc evenit, ut multa hospitia habeant, nullas amicitias.",
        "Sêneca", "Sobre a Tranquilidade da Alma",
        ["Estoicismo", "Sabedoria"], False,
    ),
    (
        "A tranquilidade da alma vem de não desejar nada além do que se tem.",
        "Sêneca", "Sobre a Tranquilidade da Alma",
        ["Estoicismo", "Felicidade", "Sabedoria"], True,
    ),
    (
        "Retire-se para dentro de si mesmo tanto quanto puder; conviva com aqueles que podem torná-lo melhor.",
        "Sêneca", "Sobre a Tranquilidade da Alma",
        ["Estoicismo", "Virtude", "Sabedoria"], True,
    ),

    # ── Epicteto — Discursos ──────────────────────────────────────────────────
    (
        "Não procures que os acontecimentos sejam como desejas; deseja que os acontecimentos sejam como são, e encontrarás tranquilidade.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Dicotomia do Controle", "Amor Fati"], True,
    ),
    (
        "Nunca digas sobre nada que o perdeste; diz que o devolveste.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Amor Fati", "Memento Mori"], True,
    ),
    (
        "Se alguém te entristece, sabe que és tu que te entristeces, não essa pessoa.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Dicotomia do Controle", "Razão"], True,
    ),
    (
        "Não é o que acontece que nos perturba, mas a nossa opinião sobre o que acontece.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Dicotomia do Controle", "Razão"], True,
    ),
    (
        "Primeiro dize a ti mesmo quem queres ser; depois faz o que tens de fazer.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Virtude", "Ética"], True,
    ),
    (
        "Não te preocupes com o que não podes controlar. Preocupa-te com o que podes.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Dicotomia do Controle"], True,
    ),
    (
        "A liberdade não é obtida pela satisfação dos desejos, mas pela eliminação do desejo.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Felicidade", "Virtude"], True,
    ),
    (
        "Não exijas que as coisas aconteçam como desejas; aceita-as como são e serás feliz.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Amor Fati", "Felicidade"], True,
    ),
    (
        "Quando alguém te insultar, lembra-te que é a opinião dessa pessoa que te insulta, não tu.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Dicotomia do Controle", "Razão"], False,
    ),
    (
        "Não é possível aprender o que já se pensa saber.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Sabedoria", "Razão"], True,
    ),
    (
        "O homem não é perturbado pelas coisas, mas pelas opiniões que tem sobre as coisas.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Dicotomia do Controle", "Razão"], True,
    ),
    (
        "Cuida do teu corpo, mas não te deixes escravizar por ele.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Virtude", "Dicotomia do Controle"], False,
    ),
    (
        "Tens duas orelhas e uma boca para ouvires o dobro do que falas.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Sabedoria"], False,
    ),
    (
        "Não procures que os acontecimentos sejam como desejas. Deseja que os acontecimentos sejam como são.",
        "Epicteto", "Discursos",
        ["Estoicismo", "Amor Fati", "Dicotomia do Controle"], True,
    ),

    # ── Epicteto — Enchiridion ────────────────────────────────────────────────
    (
        "Das coisas que existem, umas dependem de nós, outras não.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Dicotomia do Controle"], True,
    ),
    (
        "Não te preocupes com o que não podes controlar; preocupa-te com o que podes.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Dicotomia do Controle"], True,
    ),
    (
        "Se queres progredir, abandona raciocínios como: se negligenciar os meus negócios, não terei com que viver.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Virtude", "Sabedoria"], False,
    ),
    (
        "Nunca digas sobre nada que o perdeste; diz que o devolveste. O teu filho morreu? Foi devolvido. A tua mulher morreu? Foi devolvida.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Memento Mori", "Amor Fati"], True,
    ),
    (
        "Quando vires alguém a chorar de tristeza, não te deixes arrastar pela aparência e penses que ele está a sofrer por algo externo.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Dicotomia do Controle", "Razão"], False,
    ),
    (
        "Não procures que as coisas que acontecem sejam como desejas; mas deseja que as coisas que acontecem sejam como são.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Amor Fati"], True,
    ),
    (
        "Lembra-te que és actor numa peça cujo carácter é determinado pelo autor.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Amor Fati", "Dicotomia do Controle"], True,
    ),
    (
        "Se alguém te entregar o teu corpo a qualquer pessoa que encontrar, ficarias indignado. Mas entregas a tua mente a qualquer pessoa que encontras.",
        "Epicteto", "Enchiridion",
        ["Estoicismo", "Dicotomia do Controle", "Razão"], True,
    ),
]


async def seed_extra():
    print("Conectando ao banco de dados...")
    conn = await asyncpg.connect(PG_DSN)

    try:
        # Buscar tags existentes
        rows = await conn.fetch("SELECT id, name FROM tags")
        tag_ids = {row["name"]: str(row["id"]) for row in rows}

        # Inserir tags novas se necessário
        all_tags_needed = set()
        for _, _, _, tags, _ in EXTRA_QUOTES:
            all_tags_needed.update(tags)

        for tag_name in all_tags_needed:
            if tag_name not in tag_ids:
                row = await conn.fetchrow(
                    "INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id, name",
                    tag_name,
                )
                tag_ids[row["name"]] = str(row["id"])

        print(f"Inserindo {len(EXTRA_QUOTES)} citações adicionais...")
        inserted = 0
        skipped = 0

        for text, author, work, tag_names, is_favorite in EXTRA_QUOTES:
            existing = await conn.fetchrow(
                "SELECT id FROM quotes WHERE text = $1 AND author = $2",
                text, author,
            )
            if existing:
                skipped += 1
                continue

            quote_row = await conn.fetchrow(
                "INSERT INTO quotes (text, author, work, is_favorite) VALUES ($1, $2, $3, $4) RETURNING id",
                text, author, work, is_favorite,
            )
            quote_id = quote_row["id"]

            for tag_name in tag_names:
                if tag_name in tag_ids:
                    await conn.execute(
                        "INSERT INTO quote_tags (quote_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                        quote_id, tag_ids[tag_name],
                    )
            inserted += 1

        print(f"  ✓ {inserted} citações inseridas, {skipped} já existiam")
        print("\nSeed extra concluído!")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(seed_extra())
