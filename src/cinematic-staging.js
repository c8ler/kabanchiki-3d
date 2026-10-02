const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
export function introStagingAt(t){
 const campX=[-2.6,2.7,-1.3,1.2],campZ=[7,7,5.3,6];
 const people=campX.map((x,i)=>{const exit=4.1+i*.22,w=ease((t-exit)/1.1),run=ease((t-9.1)/3),side=i%2?1:-1;return {visible:t>=exit,x:lerp(side*1.8,x,w)+side*run*(8+i),z:lerp(9,campZ[i],w)+run*8,yaw:run>0?Math.atan2(side*(8+i),8):Math.PI,spread:i===0?Math.sin(Math.PI*ease((t-6.1)/1.4)):0}});
 const h=ease((t-4.4)/1.8),hero={visible:t>=4.4,x:lerp(1.8,0,h),z:lerp(9,3,h)};
 const boars=[-4,3.8,6.2].map((x,i)=>{const sx=(i-1)*2,sz=-12-i*2,z=[6,6.7,5.7][i],a=ease((t-7.5)/5.5);return {visible:t>=7.5,x:lerp(sx,x,a),z:lerp(sz,z,a),yaw:Math.atan2(x-sx,z-sz)}});
 return {carZ:24-14*ease(t/4),people,hero,boars,blanketVisible:t>=6.1,blanketScale:.02+.98*ease((t-6.1)/1.4),foodVisible:t>=7.6};
}
