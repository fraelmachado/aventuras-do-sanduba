"""Rebuild the offline HTML and optionally a ZIP: python3 build.py --zip /path/game.zip"""
from pathlib import Path
import argparse, base64, json, shutil, subprocess, tempfile, zipfile
root=Path(__file__).resolve().parent
args=argparse.ArgumentParser();args.add_argument('--zip');opt=args.parse_args()
if not shutil.which('cwebp'):raise SystemExit('cwebp não encontrado. Instale com: brew install webp')
# Backgrounds tolerate lossy compression. Green-keyed sprites use high quality plus sharp_yuv
# so chroma bleed does not leave fringes after the runtime color key. 'lossless' is the escape hatch.
IMAGES=[('garden','jardim.png','82'),('sky','nuvens.png','82'),('night','noite.png','82'),('reef','recife.png','82'),
        ('pig','sanduba-poses.png','96'),('flight','sanduba-guarda-chuva.png','96'),('swim','sanduba-nadando.png','96'),('swimKick','sanduba-nadando-2.png','96'),
        ('fish','peixe-recife.png','82'),('jelly','agua-viva.png','82')]
def webp(name,quality):
 flags=['-lossless'] if quality=='lossless' else ['-q',quality,'-sharp_yuv']
 with tempfile.NamedTemporaryFile(suffix='.webp') as out:
  subprocess.run(['cwebp','-quiet','-metadata','none',*flags,str(root/'assets'/name),'-o',out.name],check=True)
  return 'data:image/webp;base64,'+base64.b64encode(Path(out.name).read_bytes()).decode()
assets={key:webp(name,quality) for key,name,quality in IMAGES}
(root/'assets.js').write_text('window.SandubaAssets='+json.dumps(assets)+';\n')
page=(root/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>\n'+(root/'style.css').read_text()+'\n</style>')
for name in ['assets.js','renderer.js','worlds.js','engine.js','music.js','game.js']:
 page=page.replace(f'<script src="{name}"></script>','<script>\n'+(root/name).read_text()+'\n</script>')
favicon='data:image/x-icon;base64,'+base64.b64encode((root/'favicon.ico').read_bytes()).decode()
page=page.replace('href="favicon.ico"',f'href="{favicon}"')
assert '<script src=' not in page
target=root/'Sanduba nas Nuvens.html';target.write_text(page)
size=target.stat().st_size
assert size<4_000_000,f'HTML offline com {size/1e6:.1f} MB; esperado abaixo de 4 MB'
print(f'HTML offline atualizado: {size/1e6:.1f} MB, {len(IMAGES)} imagens WebP incorporadas.')
if opt.zip:
 # Only what someone needs to play. Sources, tests and reference art stay in the folder.
 with zipfile.ZipFile(opt.zip,'w',zipfile.ZIP_DEFLATED) as z:
  for name in ['Sanduba nas Nuvens.html','LEIA-ME.md']:z.write(root/name,'Sanduba nas Nuvens/'+name)
 print(f'ZIP gerado em {opt.zip} com {len(z.namelist())} arquivos.')
