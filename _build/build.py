"""Poskladá podstránky: hlavička a pätička sa berú z index.html,
obsah z _build/pages/*.html. Spustenie z priečinka v3:
    python _build/build.py . _build/pages
"""
import re, sys, pathlib

root = pathlib.Path(sys.argv[1]); pages = pathlib.Path(sys.argv[2])
idx = (root / 'index.html').read_text(encoding='utf-8')
head, rest = idx.split('<main id="obsah">', 1)
_, tail = rest.split('</main>', 1)
for p in sorted(pages.glob('*.html')):
    body = p.read_text(encoding='utf-8')
    meta = dict(re.findall(r'<!--(\w+):(.*?)-->', body))
    body = re.sub(r'<!--\w+:.*?-->\n', '', body)
    h = re.sub(r'<title>.*?</title>', f"<title>{meta['title']}</title>", head)
    h = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + meta['desc'], h)
    if meta['nav']:
        h = h.replace(f'<li><a href="{meta["nav"]}">', f'<li><a href="{meta["nav"]}" aria-current="page">', 1)
    (root / p.name).write_text(h + '<main id="obsah">\n' + body + '\n</main>' + tail, encoding='utf-8')
    print('built', p.name)
