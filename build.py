"""Rebuild the offline HTML and optionally a ZIP: python3 build.py --zip /path/game.zip"""
from pathlib import Path
import argparse, base64, json, zipfile
root=Path(__file__).resolve().parent
args=argparse.ArgumentParser();args.add_argument('--zip');opt=args.parse_args()
assets={key:'data:image/png;base64,'+base64.b64encode((root/'assets'/name).read_bytes()).decode() for key,name in [('garden','jardim.png'),('pig','pudim-poses.png'),('sky','nuvens.png'),('night','noite.png'),('flight','pudim-guarda-chuva.png'),('sleep','pudim-dormindo.png')]}
(root/'assets.js').write_text('window.PudimAssets='+json.dumps(assets)+';\n')
page=(root/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>\n'+(root/'style.css').read_text()+'\n</style>')
for name in ['assets.js','renderer.js','worlds.js','engine.js','music.js','game.js']:
 page=page.replace(f'<script src="{name}"></script>','<script>\n'+(root/name).read_text()+'\n</script>')
favicon='data:image/x-icon;base64,'+base64.b64encode((root/'favicon.ico').read_bytes()).decode()
page=page.replace('href="favicon.ico"',f'href="{favicon}"')
assert '<script src=' not in page
(root/'Pudim nas Nuvens.html').write_text(page)
if opt.zip:
 with zipfile.ZipFile(opt.zip,'w',zipfile.ZIP_DEFLATED) as z:
  for f in sorted(root.rglob('*')):
   if f.is_file() and f.name!='.DS_Store' and f.resolve()!=Path(opt.zip).resolve():z.write(f,'pudim-nas-nuvens/'+str(f.relative_to(root)))
print('HTML offline atualizado com seis imagens incorporadas.')
