(function(mt){const it=`vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;i=mod(i,289.0);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`,xt=`precision highp float;
uniform float uTime,uPR,uNight,uSize,uCamZ,uFogB,uOpen,uGustT,uGA,uGB,uBeamN,uBeamReach; uniform vec3 uFog; uniform vec2 uGustDir; uniform vec3 uBeams[8];
/* uMoon/uMoonRim drive the moonlit stretch of the journey. Both default to 0 when a material does
   not supply them, so _tree-viewer.html keeps its daylight look without needing to know about them. */
uniform float uMoon,uMoonRim;
attribute vec3 aColor; attribute float aRnd,aTrunk,aSz,aTz; varying vec3 vColor;
${it}
float cx(float z){return 3.2*sin(z*0.045)+1.6*sin(z*0.11);}
void main(){
  float L=42.0; float t=uTime;
  float lz=position.z;
  float wz=lz + L*floor((uCamZ+6.0-lz)/L);
  float wzT=aTz + L*floor((uCamZ+6.0-aTz)/L);
  float edge=-250.0-fract(sin(aTz*12.9898)*43758.5)*12.0;
  if(wzT<edge || wz<edge-3.0){ gl_Position=vec4(2.0,2.0,2.0,1.0); gl_PointSize=0.0; return; }
  float leaf=1.0-clamp(aTrunk,0.0,1.0);
  vec2 xy=vec2(cx(wz)+position.x, position.y);
  float ga=t-uGustT, sdir=dot(xy,uGustDir);
  float f0=-9.0+ga*3.2;
  float g0=exp(-pow(sdir-f0,2.0)/2.4), g1=exp(-pow(sdir-f0+3.1,2.0)/2.4)*0.75, g2=exp(-pow(sdir-f0+6.4,2.0)/2.4)*0.5;
  float genv=smoothstep(0.0,1.4,ga)*(1.0-smoothstep(5.5,7.5,ga));
  float gust=min(1.0,g0+g1+g2)*genv;
  gust=max(gust, smoothstep(uGA,uGB,snoise(vec3(xy*0.10+vec2(0.0,-t*0.07),t*0.14)))*0.4);
  gust*=leaf;
  float cyc=t*0.55+aRnd*17.0; float kk=floor(cyc);
  float h1=fract(sin(aRnd*7.1+kk*0.37)*43758.5), h2=fract(sin(aRnd*3.7+kk*0.91)*43758.5);
  xy+=(vec2(h1,h2)-0.5)*1.6*gust;
  xy+=vec2(snoise(vec3(xy*0.2,t*0.05)),snoise(vec3(xy*0.2,t*0.05+9.0)))*0.06*leaf;
  vec3 wp=vec3(xy,wz);
  vec4 mv=modelViewMatrix*vec4(wp,1.0); gl_Position=projectionMatrix*mv; float dist=-mv.z;
  float fade=1.0-smoothstep(0.55,0.9,uOpen);
  if(fade<0.01){ gl_Position=vec4(2.0,2.0,2.0,1.0); gl_PointSize=0.0; return; }
  float bot=1.0-0.78*smoothstep(-0.62,-1.04,gl_Position.y/max(0.0001,gl_Position.w));
  gl_PointSize=uSize*aSz*fade*uPR*clamp(20.0/max(2.0,dist),0.3,2.7)*bot*smoothstep(1.2,4.6,dist)*(1.0-smoothstep(uFogB*0.84,uFogB,dist));
  vec3 c=aColor;
  c*=1.0+0.16*snoise(vec3(wp.xz*0.3+vec2(t*0.05,0.0),wp.y*0.2))*(0.4+0.6*leaf);
  float bg2=0.0;
  for(int i=0;i<8;i++){ if(float(i)>=uBeamN) break;
    vec3 B=uBeams[i];
    float bx=B.x-0.13*(xy.y-11.0);
    float ddx=xy.x-bx, ddz=wz-B.y;
    bg2+=B.z*exp(-ddx*ddx/(7.0*uBeamReach)-ddz*ddz/(18.0*uBeamReach)); }   /* uBeamReach widens how far the shaft's glow spills onto foliage */
  /* the shaft glow spilling onto foliage has to die with the shafts themselves, or the canopy keeps
     glowing warm in the exact places the beams used to be and the night looks half-finished */
  c*=1.0+min(1.1,bg2)*(0.35+0.65*leaf)*0.85*(1.0-uMoon);
  c*=0.76+0.24*smoothstep(0.3,4.0,wp.y);
  c=mix(c,c*vec3(0.5,0.68,0.66),uNight*0.4);
  /* THE BULK OF THE CANOPY GOES BLUE-DARK FIRST. Adding rim light without this was the mistake in the
     first pass: readback said the scene was 15% darker but still warm-dominant (R-B +7.9), which reads
     as overcast rather than moonlit. Multiplying red and green down while keeping blue nearly intact
     both darkens AND shifts hue, so night is a different colour and not just a lower exposure. Must
     come BEFORE the rim, so the rim lands as highlight on a dark base rather than lifting a lit one. */
  c*=mix(vec3(1.0),vec3(0.34,0.46,0.72),uMoon);
  /* MOONLIGHT FROM ABOVE. Sunlight in this scene arrives through the side of the canopy as warm
     pools; moonlight only ever lands on what faces the sky. So the same dapple noise gets biased
     hard by height and recoloured cool: canopy tops silver, understory stays dark. That vertical
     split is what makes it read as overhead light rather than a blue filter over the whole forest. */
  float sky=smoothstep(2.0,11.0,wp.y);
  float rim=sky*(0.40+0.60*snoise(vec3(wp.xz*0.28,wp.y*0.16)))*(0.35+0.65*leaf);
  c+=vec3(0.26,0.36,0.55)*max(0.0,rim)*uMoon*uMoonRim;
  c=mix(c,uFog,smoothstep(uFogB*0.34,uFogB,dist));
  vColor=c;
}`,ut="precision highp float;varying vec3 vColor;void main(){vec2 q=gl_PointCoord-vec2(0.5);if(dot(q,q)>0.25)discard;gl_FragColor=vec4(vColor,1.0);}",Q=new Map;function ct(d,t){const B=(d.src||"?")+"|"+t;if(Q.has(B))return Q.get(B);const R=d.width&&d.height?d.width/d.height:1,q=document.createElement("canvas");q.width=t,q.height=t;const P=q.getContext("2d");P.drawImage(d,0,0,t,t);const z=P.getImageData(0,0,t,t).data,N=(a,s)=>{if(a<0||s<0||a>=t||s>=t)return 0;const e=(s*t+a)*4;if(z[e+3]<70)return 0;const o=z[e],i=z[e+1],c=z[e+2];if(i>130&&i-o>60&&i-c>55)return 0;const l=Math.max(o,i,c),r=Math.min(o,i,c);return r>246&&l-r<8?0:1},v=t*t,T=new Float32Array(v),C=new Float32Array(v),F=new Float32Array(v),y=new Uint8Array(v),tt=new Uint8Array(v),U=new Uint8Array(v);for(let a=0;a<t;a++)for(let s=0;s<t;s++){if(!N(s,a))continue;const e=(a*t+s)*4,o=a*t+s;let i=z[e]/255,c=z[e+1]/255,l=z[e+2]/255;const r=Math.min(1,Math.max(0,(Math.min(i,c,l)-.55)/.37)),u=1+1.25*r*r;i=Math.max(0,1-(1-i)*u),c=Math.max(0,1-(1-c)*u),l=Math.max(0,1-(1-l)*u),T[o]=i,C[o]=c,F[o]=l,y[o]=1,tt[o]=c>i+.02&&c>l+.02&&c-Math.min(i,l)>.05?1:0,U[o]=c<i-.05&&c<l-.05?1:0}const h=new Float32Array(v);for(let a=0;a<v;a++)h[a]=y[a]?1e4:0;for(let a=0;a<t;a++)for(let s=0;s<t;s++){const e=a*t+s;if(!y[e])continue;let o=h[e];(s===0||a===0||s===t-1||a===t-1)&&(o=1),s>0&&(o=Math.min(o,h[e-1]+1)),a>0&&(o=Math.min(o,h[e-t]+1)),s>0&&a>0&&(o=Math.min(o,h[e-t-1]+1.414)),s<t-1&&a>0&&(o=Math.min(o,h[e-t+1]+1.414)),h[e]=o}for(let a=t-1;a>=0;a--)for(let s=t-1;s>=0;s--){const e=a*t+s;if(!y[e])continue;let o=h[e];s<t-1&&(o=Math.min(o,h[e+1]+1)),a<t-1&&(o=Math.min(o,h[e+t]+1)),s<t-1&&a<t-1&&(o=Math.min(o,h[e+t+1]+1.414)),s>0&&a<t-1&&(o=Math.min(o,h[e+t-1]+1.414)),h[e]=o}const O=t*.06,H=new Float32Array(v),K=new Float32Array(v),I=new Float32Array(v),G=2;for(let a=0;a<t;a++)for(let s=0;s<t;s++){const e=a*t+s;if(!y[e])continue;let o=0,i=0,c=0,l=0;for(let b=-G;b<=G;b++)for(let M=-G;M<=G;M++){const k=s+M,S=a+b;if(k<0||S<0||k>=t||S>=t)continue;const w=S*t+k;y[w]&&(o+=T[w],i+=C[w],c+=F[w],l++)}const r=Math.min(1,h[e]/O),u=r*r;H[e]=T[e]+(o/l-T[e])*u,K[e]=C[e]+(i/l-C[e])*u,I[e]=F[e]+(c/l-F[e])*u}const j=[];for(let a=0;a<t;a++)for(let s=0;s<t;s++){const e=a*t+s;if(!y[e])continue;let o=0,i=0,c=0,l=0,r=0,u=0,b=0;for(let w=-2;w<=2;w++)for(let E=-2;E<=2;E++){const V=s+E,D=a+w,et=V>=0&&D>=0&&V<t&&D<t;if(E===0&&w===0||(i++,et&&(o+=y[D*t+V])),et){const L=D*t+V;if(c+=tt[L],l+=U[L],y[L]&&Math.abs(E)<=1&&Math.abs(w)<=1){const Y=.3*T[L]+.55*C[L]+.15*F[L];r+=Y,u+=Y*Y,b++}}}const M=b>1?Math.max(0,u/b-r/b*(r/b)):0,k=Math.min(1,Math.sqrt(M)/.16),S=Math.min(1,h[e]/O);j.push([(s/(t-1)-.5)*R,.5-a/(t-1),T[e],C[e],F[e],o/i,c,l,S,k,H[e],K[e],I[e]])}return Q.set(B,j),j}function pt(){Q.clear()}function vt(d,t){const B=ct(d,t.grid),R=t.height,q=t.flip||1,P=!!t.still,z=t.colVar||0,N=t.xScale==null?1:t.xScale,v=t.density==null?1:t.density,T=t.tint==null?1:t.tint,C=t.dark==null?.3:t.dark,F=t.lite==null?.85:t.lite,y=t.tintRGB||[.43,.56,.33],tt=1.7-(t.hiSpread==null?.6:t.hiSpread)*1.3,U=t.trunkDark==null?.4:t.trunkDark,h=t.trunkLite==null?1:t.trunkLite,O=t.trunkRGB||[.85,.83,.79],H=[],K=[],I=[],G=[],j=[],a=[],s=(n,f,m,x)=>{const A=.3*n+.55*f+.15*m||.001,g=Math.min(1,Math.max(0,(A-.14)/.62)),lt=Math.pow(Math.max(0,x),tt)*g,Z=C*(.72+.55*g)+(F-C)*lt,_=.55,ot=n/A*(1-_)+y[0]*_,W=f/A*(1-_)+y[1]*_,nt=m/A*(1-_)+y[2]*_;return[Math.min(1,ot*Z*(1+.14*z)),Math.min(1,W*Z*(1+.05*z)),Math.min(1,nt*Z*(1-.12*z))]},e=(n,f,m)=>{const x=.34*n+.33*f+.33*m||.001,A=Math.min(1,Math.max(0,(x-.12)/.72)),g=Math.min(1,U*(.75+.5*A)+(h-U)*Math.pow(A,1.25));return[Math.min(1,O[0]*g),Math.min(1,O[1]*g),Math.min(1,O[2]*g)]};let o=1,i=-1,c=.001;for(const n of B){n[1]<o&&(o=n[1]),n[1]>i&&(i=n[1]);const f=Math.abs(n[0]);f>c&&(c=f)}const l=Math.max(.001,i-o);let r=0,u=0;const b=o+l*.14;for(const n of B)n[1]<=b&&(r+=n[0],u++);r=u>3?r/u:0;const M=26,k=new Array(M).fill(0);for(const n of B){const f=Math.min(M-1,(n[1]-o)/l*M|0),m=Math.abs(n[0]);m>k[f]&&(k[f]=m)}for(let n=0;n<2;n++){const f=k.slice();for(let m=1;m<M-1;m++)k[m]=(f[m-1]+f[m]*2+f[m+1])/4}const S=R/t.grid*1.1,w=c*R*(t.depth==null?.5:t.depth),E=t.grnMin==null?5:t.grnMin,D=(d.width&&d.height?d.width/d.height:1)*Math.abs(N)*R*R/(t.grid*t.grid),et=D*B.length,L=(t.dens0==null?150:t.dens0)*v*D,Y=Math.max(t.windStill||0,Math.max(0,.85-R*.085));for(const n of B){const f=Math.min(M-1,(n[1]-o)/l*M|0),m=n[3]>n[2]+.02&&n[3]>n[4]+.02&&n[3]-Math.min(n[2],n[4])>.05&&n[7]<E;let x;P?x=0:t.allLeaf||m?x=1:x=0;const A=x?0:.5*(1-n[8])+.9*n[9],g=Math.max(0,Math.min(1,(A-.55)/.45)),Z=1-.42*(g*g*(3-2*g)),_=.55+1.5*n[8],ot=.6,W=Math.max(ot,_*Z),nt=1.35,yt=nt*nt/(W*W),ht=L*(x?1:1.9*yt);let at=Math.floor(ht);if(Math.random()<ht-at&&at++,at<1)continue;const rt=x?S:S*1.25,dt=k[f]+.03,ft=Math.max(-1,Math.min(1,n[0]/dt));let X=n[2],$=n[3],J=n[4];if(x){const p=s(X,$,J,1-n[5]);X=p[0],$=p[1],J=p[2]}else if(P&&!t.barkClamp){const p=T||1;X*=p,$*=p,J*=p}else{const p=e(n[10],n[11],n[12]);X=p[0],$=p[1],J=p[2]}const Mt=Math.min(1,X),wt=Math.min(1,$),zt=Math.min(1,J),bt=(n[0]-r)*R*q*N,kt=Math.max(.05,(n[1]-o)*R);for(let p=0;p<at;p++){const st=w*(1-ft*ft)*(.5+.5*n[5]),gt=x?st+(Math.random()-.5)*S*1.8:(P&&!t.barkClamp?st:Math.min(st,.16))+(Math.random()-.5)*.05;H.push(bt+(Math.random()-.5)*rt,kt+(Math.random()-.5)*rt,gt),K.push(Mt,wt,zt),I.push(Math.random()),G.push(x?Y:1),a.push(x?1:0),j.push(x?Math.max(.3,(.45+1.05*n[5])*(.6+(.3+1.15*n[5])*Math.pow(Math.random(),2.2))):Math.max(ot,W*(.9+Math.random()*.2)))}}return{n:I.length,P:H,C:K,R:I,Tk:G,Sz:j,Lf:a,area:et}}mt.TL={SNOISE:it,FOLIAGE_VERT:xt,FOLIAGE_FRAG:ut,sampleTree:ct,buildTree:vt,clearCache:pt}})(window);
