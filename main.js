const $=s=>document.querySelector(s);

// Hiệu ứng chữ gõ máy (Typewriter effect)
(function(){
  const el=$('#typewriter'),text='Chúc Mừng Sinh Nhật',sleep=ms=>new Promise(r=>setTimeout(r,ms));
  (async function loop(){
    await sleep(1500);
    for(;;){
      for(let i=1;i<=text.length;i++){el.textContent=text.slice(0,i);await sleep(110+Math.random()*40-20);}
      await sleep(2000);
      for(let i=text.length;i>=0;i--){el.textContent=text.slice(0,i);await sleep(55);}
      await sleep(400);
    }
  })();
})();

// Hiệu ứng xuất hiện khi cuộn tới phần tử (Scroll reveal)
(function(){
  const els=document.querySelectorAll('[data-r]');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.15});
  els.forEach(e=>io.observe(e));
})();

// Hiệu ứng 3D nghiêng theo chuột / cử chỉ (3D Tilt effect)
(function(){
  const root=document.documentElement,tilts=[...document.querySelectorAll('.tilt')],clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  addEventListener('pointermove',e=>{
    root.style.setProperty('--mx',clamp(e.clientX/innerWidth-.5,-.5,.5).toFixed(3));
    root.style.setProperty('--my',clamp(e.clientY/innerHeight-.5,-.5,.5).toFixed(3));
    for(const t of tilts){
      const r=t.getBoundingClientRect();
      if(e.clientY<r.top-80||e.clientY>r.bottom+80||e.clientX<r.left-80||e.clientX>r.right+80){t.style.transform='';continue;}
      const px=clamp((e.clientX-r.left)/r.width-.5,-.5,.5),py=clamp((e.clientY-r.top)/r.height-.5,-.5,.5);
      t.style.transform=`perspective(900px) rotateY(${(px*16).toFixed(1)}deg) rotateX(${(-py*16).toFixed(1)}deg)`;
    }
  },{passive:true});
  addEventListener('pointerleave',()=>tilts.forEach(t=>t.style.transform=''));
  document.addEventListener('pointerup',e=>{if(e.pointerType==='touch')tilts.forEach(t=>t.style.transform='');});
})();

// Xem ảnh kỷ niệm (Polaroid Stack Gallery)
(function(){
  const cards=[...document.querySelectorAll('.polaroid')],n=cards.length,stack=$('#stack'),count=$('#count');
  let idx=0,timer;
  function render(){
    cards.forEach((c,i)=>{
      let o=((i-idx)%n+n)%n;if(o>n/2)o-=n;
      const a=Math.abs(o);
      c.style.zIndex=10-a;
      c.style.opacity=a>1?0:1;
      c.style.pointerEvents=a>1?'none':'auto';
      c.style.filter=a?'brightness(.6)':'none';
      c.style.transform=`translateX(${o*62}%) translateZ(${-a*170}px) rotateY(${-o*42}deg) rotateZ(${o*2}deg)`;
      c.dataset.o=o;
    });
    count.textContent=`${idx+1} / ${n}`;
  }
  const go=d=>{idx=((idx+d)%n+n)%n;render();};
  const user=d=>{go(d);clearInterval(timer);timer=setInterval(()=>go(1),5500);};
  $('#nextImg').onclick=()=>user(1);
  $('#prevImg').onclick=()=>user(-1);
  addEventListener('keydown',e=>{if(e.key==='ArrowRight')user(1);if(e.key==='ArrowLeft')user(-1);});
  let sx=null,target=null;
  stack.addEventListener('pointerdown',e=>{sx=e.clientX;target=e.target.closest('.polaroid');});
  stack.addEventListener('pointerup',e=>{
    if(sx===null)return;const d=e.clientX-sx;sx=null;
    if(Math.abs(d)>40)user(d<0?1:-1);
    else{const o=target?+target.dataset.o:0;user(o||1);}
  });
  stack.addEventListener('pointercancel',()=>sx=null);
  render();timer=setInterval(()=>go(1),5500);
})();

// Lật thiệp chúc mừng (Card flip)
(function(){
  const card=$('#card'),flip=()=>card.classList.toggle('flipped');
  $('#toggleButton').addEventListener('click',e=>{e.stopPropagation();flip();});
  $('#cardContainer').addEventListener('click',flip);
})();

// Nút ước & Pháo hoa Confetti (Wish button & Confetti)
(function(){
  const cols=['#ffd27a','#ff7eb6','#7fe7ff','#ffffff'];
  const msg=$('#wishMsg');
  const lines=[
    'Điều ước đã được gửi đến các vì sao, chắc chắn sẽ thành hiện thực! ✨',
    'Hãy nhắm mắt lại và ước nguyện những điều tuyệt vời nhất nhé 🌟',
    'Nến đã được thổi tắt, chúc mọi ước mơ của Cải đều bay cao bay xa! 🎂',
    'Tuổi mới luôn rạng rỡ, ngập tràn niềm vui và may mắn nhé Cải ơi! 💖'
  ];
  let k=0;
  $('#wishBtn').addEventListener('click',()=>{
    msg.textContent=lines[k++%lines.length];msg.classList.remove('pop');void msg.offsetWidth;msg.classList.add('pop');
    if(typeof confetti==='function')[0,1].forEach(s=>confetti({particleCount:90,angle:s?120:60,spread:65,origin:{x:s,y:.75},colors:cols}));
    const box=$('#lanterns');
    for(let i=0;i<8;i++){
      const l=document.createElement('span');l.className='lantern';
      l.style.left=(6+Math.random()*88)+'%';
      l.style.setProperty('--t',(5+Math.random()*4)+'s');
      l.style.setProperty('--x',((Math.random()-.5)*120)+'px');
      l.style.animationDelay=(Math.random()*1.2)+'s';
      box.appendChild(l);l.addEventListener('animationend',()=>l.remove());
    }
  });
})();

// Popup xác nhận mở quà & Tự động phát nhạc nền (Loop)
(function(){
  const overlay=$('#giftModalOverlay');
  const openBtn=$('#openGiftBtn');
  const giftModal=$('#giftModal');
  const bgMusic=$('#bgMusic');
  const musicToggle=$('#musicToggle');
  const musicIcon=$('#musicToggleIcon');
  const cols=['#ffd27a','#ff7eb6','#7fe7ff','#ffffff','#ff5e7e'];

  function startExperience(){
    if(!overlay||overlay.classList.contains('hidden'))return;
    overlay.classList.add('hidden');
    
    // Phát nhạc nền lặp lại
    if(bgMusic){
      bgMusic.loop=true;
      const playPromise=bgMusic.play();
      if(playPromise!==undefined){
        playPromise.then(()=>{
          if(musicToggle)musicToggle.classList.add('playing');
          if(musicIcon)musicIcon.textContent='🎵';
        }).catch(err=>{
          console.log('Autoplay audio blocked:',err);
        });
      }
    }

    // Hiệu ứng pháo hoa chào mừng rộn rã
    if(typeof confetti==='function'){
      confetti({particleCount:150,spread:100,origin:{y:.5},colors:cols});
      setTimeout(()=>{
        confetti({particleCount:120,angle:60,spread:80,origin:{x:0,y:.7},colors:cols});
        confetti({particleCount:120,angle:120,spread:80,origin:{x:1,y:.7},colors:cols});
      },400);
    }
  }

  if(openBtn)openBtn.addEventListener('click',startExperience);
  if(giftModal)giftModal.addEventListener('click',startExperience);

  // Nút điều khiển bật / tắt nhạc nổi
  if(musicToggle&&bgMusic){
    musicToggle.addEventListener('click',e=>{
      e.stopPropagation();
      if(bgMusic.paused){
        bgMusic.play().then(()=>{
          musicToggle.classList.add('playing');
          if(musicIcon)musicIcon.textContent='🎵';
        }).catch(err=>console.log(err));
      } else {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
        if(musicIcon)musicIcon.textContent='🔇';
      }
    });
  }
})();
