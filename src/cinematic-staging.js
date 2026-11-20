const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
export function introStagingAt(t){
 const campX=[-12.4,-6.0,-10.0,-7.3],campZ=[7.4,7.0,4.9,5.7];
 const walk=(x,z,exit,side)=>{
  const points=[[side*1.65,10.2],[side*2.25,13.1],[-4.1,13.1],[x,z]];
  const elapsed=Math.max(0,t-exit);
  const leg=Math.min(2,Math.floor(elapsed/.95));
  const fraction=ease((elapsed-leg*.95)/.95);
  const [ax,az]=points[leg], [bx,bz]=points[leg+1];
  return {x:lerp(ax,bx,fraction),z:lerp(az,bz,fraction),yaw:Math.atan2(bx-ax,bz-az),walking:t>=exit&&elapsed<2.85};
 };
 const people=campX.map((x,i)=>{
  const exit=4.05+i*.24;
  const position=walk(x,campZ[i],exit,i%2?1:-1);
  const side=i%2?1:-1,dx=side*(20+i*3),dz=12+i*2;
  const runTime=Math.max(0,t-9.2);
  const run=runTime<2.8?ease(runTime/4.4):ease(2.8/4.4)+(runTime-2.8)*.31;
  const yaw=run>0?Math.atan2(dx,dz):position.walking?position.yaw:Math.atan2(-11.2-x,8-campZ[i]);
  return {...position,visible:t>=exit&&t<15.5,x:position.x+run*dx,z:position.z+run*dz,yaw,spread:0,running:run>0};
 });
 const hero={...walk(-8,6,4.55,-1),visible:t>=4.55};
 const boars=[-4,3.8,6.2].map((x,i)=>{const sx=[-9,0,10][i],sz=[-23,-26,-24][i],z=[6,6.7,5.7][i],enter=ease((t-(8+i*.18))/3.9),run=ease((t-12)/3.2),side=i===0?-1:1,dx=side*(25+i*3),dz=-16-i*2;return {visible:t>=8+i*.18&&t<15.5,x:lerp(sx,x,enter)+run*dx,z:lerp(sz,z,enter)+run*dz,yaw:run>0?Math.atan2(dx,dz):Math.atan2(x-sx,z-sz),scale:.82+.18*enter}});
 return {carZ:24-14*ease(t/4),headlights:t<4.1,people,hero,boars,blanketVisible:t>=6.1,blanketScale:.02+.98*ease((t-6.1)/1.4),foodVisible:t>=7.6};
}

export function outroStagingAt(t){
 const walk=ease((t-6)/3),xs=[-2.6,2.7,-1.3,1.2],zs=[7,7,5.3,6],endX=[-2.4,2.5,-3.8,3.9],endZ=[9.5,10.1,8.3,8.3];
 return {carZ:10,hero:{x:lerp(0,0,walk),z:lerp(3,6.5,walk)},people:xs.map((x,i)=>({x:lerp(x,endX[i],walk),z:lerp(zs[i],endZ[i],walk),yaw:walk<1?Math.atan2(endX[i]-x,endZ[i]-zs[i]):Math.atan2(-endX[i],6.5-endZ[i]),walking:t>6&&t<9}))};
}
