"""Generate original, lightweight SVG effect assets; no downloaded reference screenshots."""
import json, math
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'

def svg(name, body, box='0 0 100 100'):
    path = f'assets/{name}.svg'
    (ROOT / path).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{box}" width="160" height="160">{body}</svg>\n')
    return path

def pack(id, name, images, colors, motion, size=30, duration=2300, spread=75, lift=135):
    return dict(id=id, name=name, images=images, colors=colors, motion=motion, count=8, size=size, duration=duration, spread=spread, lift=lift, shape='circle', glow=0)

packs=[]
# Solid six-arm crystals: fill polygons, never outlines or emoji fonts.
for color,label,key in [('#000000','黑雪花','black'),('#ffffff','白雪花','white')]:
    images=[]
    for variant in range(3):
        branches=''
        for y in ([24,35] if variant==0 else [19,29,39] if variant==1 else [26,38]):
            width=8 if variant!=2 else 11
            branches+=f'<path d="M48 {y+2} L{49-width} {y-7} L{52-width} {y-9} L50 {y-2} L{48+width} {y-9} L{51+width} {y-7} L52 {y+2}Z"/>'
        arm='<path d="M48.2 49V10L50 7L51.8 10V49Z"/>'+branches
        body=f'<g fill="{color}">'+''.join(f'<g transform="rotate({a} 50 50)">{arm}</g>' for a in range(0,360,60))+'<path d="M50 44L55.2 47V53L50 56L44.8 53V47Z"/></g>'
        images.append(svg(f'snow-{key}-{variant+1}',body))
    packs.append(pack('lili-snow-'+key,label+' · 细雪微尘',images,[color],'snow',30,2400,80,90))
# Hand drawn filled notation: ♩ ♪ ♫ ♬ ¶ ♯ ♭. No platform font dependency.
notes=[
 '<ellipse cx="35" cy="72" rx="13" ry="9" transform="rotate(-20 35 72)"/><path d="M44 20H49V71H44Z"/>',
 '<ellipse cx="33" cy="74" rx="13" ry="9" transform="rotate(-20 33 74)"/><path d="M42 17H47V73H42Z M47 17C49 30 72 27 68 45C67 50 64 54 60 57C68 39 53 39 47 33Z"/>',
 '<ellipse cx="25" cy="76" rx="11" ry="8" transform="rotate(-20 25 76)"/><ellipse cx="66" cy="66" rx="11" ry="8" transform="rotate(-20 66 66)"/><path d="M33 28L74 18V66H69V29L38 37V76H33Z"/>',
 '<ellipse cx="25" cy="76" rx="11" ry="8" transform="rotate(-20 25 76)"/><ellipse cx="66" cy="66" rx="11" ry="8" transform="rotate(-20 66 66)"/><path d="M33 28L74 18V66H69V29L38 37V76H33Z M37 44L70 36V43L37 51Z"/>',
 '<path d="M69 20H41C13 20 13 53 40 53H46V83H53V27H62V83H69Z"/>',
 '<path d="M34 20H39V83H34Z M60 16H65V79H60Z M21 40L78 29V38L21 49Z M21 62L78 51V60L21 71Z"/>',
 '<path fill-rule="evenodd" d="M35 15H41V49C68 24 78 58 37 84L35 85ZM41 58V73C66 51 58 42 41 58Z"/>',
]
for color,label,key in [('#000000','黑音符','black'),('#ffffff','白音符','white')]:
    images=[svg(f'music-{key}-{i+1}',f'<g fill="{color}">{body}</g>') for i,body in enumerate(notes)]
    packs.append(pack('lili-music-'+key,label+' · 轻轻哼唱',images,[color],'music',29,2100,80,130))
# Curled, translucent petals with varied silhouettes, a central fold and a tiny notch.
petal_shapes=[
 'M48 91C38 70 21 48 28 27C32 14 44 10 50 20C59 8 70 18 73 30C76 50 60 76 48 91Z',
 'M17 65C23 28 49 13 80 22C76 27 74 30 74 32C78 32 82 31 86 32C70 68 43 80 17 65Z',
 'M16 66C22 34 53 19 80 29C67 38 68 55 52 66C40 73 27 75 16 66Z',
 'M27 82C7 48 34 20 72 18C67 33 80 57 58 72C47 80 36 76 27 82Z',
]
for key,label,colors in [
 ('pink','粉樱',['#fff0f5','#ffc5d9','#ef81ab']),
 ('red','玫瑰',['#ffe0e6','#ff829f','#d73861']),
 ('white','白花',['#ffffff','#f7f6fb','#d8dbe7']),
 ('black','墨瓣',['#62616c','#2d2c38','#111016'])]:
    images=[]
    for i,path in enumerate(petal_shapes):
        body=f'''<defs><radialGradient id="p" cx=".28" cy=".22" r=".85"><stop stop-color="{colors[0]}"/><stop offset=".42" stop-color="{colors[1]}"/><stop offset="1" stop-color="{colors[2]}"/></radialGradient><linearGradient id="fold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{colors[0]}" stop-opacity=".75"/><stop offset="1" stop-color="{colors[0]}" stop-opacity="0"/></linearGradient><clipPath id="clip"><path d="{path}"/></clipPath></defs><path d="{path}" fill="url(#p)"/><g clip-path="url(#clip)"><path d="M29 14Q68 39 45 92Q77 48 53 9Z" fill="url(#fold)"/><path d="M16 66Q51 69 81 26Q62  70 16 66" fill="{colors[0]}" opacity=".26"/></g>'''
        images.append(svg(f'petal-{key}-{i+1}',body))
    for variant in range(2):
        body=f'<defs><radialGradient id="p"><stop stop-color="{colors[2]}"/><stop offset=".4" stop-color="{colors[1]}"/><stop offset="1" stop-color="{colors[0]}"/></radialGradient></defs><g transform="translate(50 50) rotate({variant*24}) scale(1 {1 if variant==0 else .66})">'
        for a in range(0,360,72):
            body+=f'<path transform="rotate({a})" d="M0 3C-27-8-23-38-7-40L0-34L7-40C24-38 27-8 0 3Z" fill="url(#p)"/>'
        for a in range(0,360,36):
            x,y=math.cos(a*math.pi/180)*9,math.sin(a*math.pi/180)*9
            body+=f'<circle cx="{x:.2f}" cy="{y:.2f}" r="1.5" fill="{colors[0]}"/>'
        body+=f'<circle r="3" fill="{colors[2]}"/></g>'
        images.append(svg(f'petal-{key}-flower-{variant+1}',body))
    packs.append(pack('lili-petal-'+key,label+' · 风里落花',images,colors,'fall',31,2500,85,85))
# Soap films: almost clear center, separate spectral crescents, broken white specular arcs.
images=[]
for i in range(3):
    body='''<defs>
    <radialGradient id="film" cx=".38" cy=".3" r=".68"><stop stop-color="#e2faff" stop-opacity=".01"/><stop offset=".72" stop-color="#fff" stop-opacity=".015"/><stop offset=".92" stop-color="#c9d8ff" stop-opacity=".09"/><stop offset="1" stop-color="#fce1ff" stop-opacity=".2"/></radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="#87f6ff"/><stop offset=".24" stop-color="#e6afff"/><stop offset=".44" stop-color="#ff8dbd"/><stop offset=".62" stop-color="#ffdb83"/><stop offset=".78" stop-color="#b2fff0"/><stop offset="1" stop-color="#b0c8ff"/></linearGradient>
    <linearGradient id="pink"><stop stop-color="#ff8bbe" stop-opacity="0"/><stop offset=".45" stop-color="#ff9ddc" stop-opacity=".9"/><stop offset="1" stop-color="#ffdc7d" stop-opacity=".05"/></linearGradient>
    <linearGradient id="blue"><stop stop-color="#93ffeb" stop-opacity=".05"/><stop offset=".5" stop-color="#94f5ff" stop-opacity=".9"/><stop offset="1" stop-color="#c6b0ff" stop-opacity="0"/></linearGradient>
    </defs>
    <circle cx="50" cy="50" r="42" fill="url(#film)"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="url(#rim)" stroke-width=".72" opacity=".78"/>
    <path d="M13 39C19 10 57 1 79 23C59 10 30 11 13 39Z" fill="url(#pink)"/>
    <path d="M17 36C31 13 59 8 77 24C51 13 36 21 17 36Z" fill="url(#blue)"/>
    <path d="M88 58C82 85 52 100 26  80 C54 92  70 83 88 58Z" fill="url(#blue)"/>
    <path d="M82 76C67 91 39 94 22 77C44 88  60 88 82 76Z" fill="url(#pink)"/>
    <path d="M12  40 C13 27 24 17 34 14M40 11L48 10M65 88Q76 84 81 77" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity=".86"/>
    <ellipse cx="23" cy="25" rx="3.4" ry="1.6" fill="#fff" opacity=".87" transform="rotate(-42 23 25)"/>
    <ellipse cx="84" cy="67" rx="1" ry="2.2" fill="#fff" opacity=".78"/>
    '''
    images.append(svg(f'bubble-rainbow-{i+1}',f'<g transform="rotate({i*110} 50 50)">{body}</g>'))
packs.append(pack('lili-bubble-rainbow','虹彩泡泡 · 透明薄光',images,['#a8efff','#ffb5da','#ffe9a8','#c1b8ff'],'bubble', 40,2500,80,180))
(ROOT/'seasonal.js').write_text('const asset = path => new URL(path, import.meta.url).href;\nexport const seasonalPacks = '+json.dumps(packs,ensure_ascii=False,indent=2)+'.map(pack => ({...pack, images: pack.images.map(asset)}));\n')
print('Generated',len(packs),'seasonal packs with',sum(len(p['images']) for p in packs),'SVG assets.')
