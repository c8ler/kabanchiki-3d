const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
export function introStagingAt(t){
 const campX=[-11.6,-6.3,-10.3,-7.8],campZ=[7,7,5.3,6];
 const people=campX.map((x,i)=>{const exit=4.1+i*.22,w=ease((t-exit)/1.1),run=ease((t-9.1)/4.6),side=i%2?1:-1,dx=side*(20+i*3),dz=12+i*2;return {visible:t>=exit&&t<15.5,x:lerp(side*1.8,x,w)+run*dx,z:lerp(9,campZ[i],w)+run*dz,yaw:run>0?Math.atan2(dx,dz):i===0?Math.atan2(-11.2-x,8-campZ[i]):Math.PI,spread:i===0?Math.sin(Math.PI*ease((t-6.1)/1.4)):0,running:run>0}});
 const h=ease((t-4.4)/1.8),hero={visible:t>=4.4,x:lerp(1.8,-8,h),z:lerp(9,6,h)};
 const boars=[-4,3.8,6.2].map((x,i)=>{const sx=(i-1)*2,sz=-12-i*2,z=[6,6.7,5.7][i],a=ease((t-7.5)/5.5),run=ease((t-12)/3.2),side=i===0?-1:1,dx=side*(25+i*3),dz=-16-i*2;return {visible:t>=7.5&&t<15.5,x:lerp(sx,x,a)+run*dx,z:lerp(sz,z,a)+run*dz,yaw:run>0?Math.atan2(dx,dz):Math.atan2(x-sx,z-sz)}});
 return {carZ:24-14*ease(t/4),headlights:t<4.1,people,hero,boars,blanketVisible:t>=6.1,blanketScale:.02+.98*ease((t-6.1)/1.4),foodVisible:t>=7.6};
}
