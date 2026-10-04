const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
export function introStagingAt(t){
 const campX=[-12.4,-6.0,-10.0,-7.3],campZ=[7.4,7.0,4.9,5.7];
 const people=campX.map((x,i)=>{const startX=[-3.4,3.7,-1.5,1.6][i],startZ=[10.4,10.1,8.8,9.3][i],exit=4.0+i*.34,w=ease((t-exit)/1.25),run=ease((t-9.2)/4.4),side=i%2?1:-1,dx=side*(20+i*3),dz=12+i*2;return {visible:t>=exit&&t<15.5,x:lerp(startX,x,w)+run*dx,z:lerp(startZ,campZ[i],w)+run*dz,yaw:run>0?Math.atan2(dx,dz):i===0?Math.atan2(-11.2-x,8-campZ[i]):Math.PI,spread:0,running:run>0}});
 const h=ease((t-4.55)/1.9),hero={visible:t>=4.55,x:lerp(.1,-8,h),z:lerp(10.6,6,h)};
 const boars=[-4,3.8,6.2].map((x,i)=>{const sx=[-9,0,10][i],sz=[-23,-26,-24][i],z=[6,6.7,5.7][i],enter=ease((t-(7.35+i*.18))/3.9),run=ease((t-12)/3.2),side=i===0?-1:1,dx=side*(25+i*3),dz=-16-i*2;return {visible:t>=7.35+i*.18&&t<15.5,x:lerp(sx,x,enter)+run*dx,z:lerp(sz,z,enter)+run*dz,yaw:run>0?Math.atan2(dx,dz):Math.atan2(x-sx,z-sz),scale:.82+.18*enter}});
 return {carZ:24-14*ease(t/4),headlights:t<4.1,people,hero,boars,blanketVisible:t>=6.1,blanketScale:.02+.98*ease((t-6.1)/1.4),foodVisible:t>=7.6};
}
