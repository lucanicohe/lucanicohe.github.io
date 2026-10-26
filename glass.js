const $=s=>[...document.querySelectorAll(s)];
function lang(l){document.documentElement.lang=l;document.documentElement.classList.toggle('ja',l=='ja');$('.i').forEach(e=>e.innerHTML=e.dataset[l]);document.getElementById('lt').textContent=l=='ja'?'EN':'日本語';window.L=l}
document.getElementById('lt').onclick=()=>lang(window.L=='ja'?'en':'ja');lang('ja');
addEventListener('pointermove',e=>{const g=e.target.closest&&e.target.closest('.g');if(g){const r=g.getBoundingClientRect();g.style.setProperty('--mx',e.clientX-r.left+'px');g.style.setProperty('--my',e.clientY-r.top+'px')}},{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{const t=e.target;if(t.tagName=='VIDEO'){if(e.isIntersecting){if(!t.src)t.src=t.dataset.src;t.muted=true;t.play().catch(()=>{})}else t.pause()}else if(e.isIntersecting)t.classList.add('in')}),{rootMargin:'120px',threshold:.05});
$('.rv,video').forEach(v=>io.observe(v));
