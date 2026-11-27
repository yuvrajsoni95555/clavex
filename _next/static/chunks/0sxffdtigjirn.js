(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,1624,t=>{"use strict";var e=t.i(43476),r=t.i(71645),i=t.i(98903),o=t.i(31067),a=t.i(90072),n=t.i(48823),s=t.i(38408),l=t.i(96812);class c extends a.Zg{constructor(){super({uniforms:{time:{value:0},pixelRatio:{value:1}},vertexShader:`
        uniform float pixelRatio;
        uniform float time;
        attribute float size;  
        attribute float speed;  
        attribute float opacity;
        attribute vec3 noise;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          modelPosition.y += sin(time * speed + modelPosition.x * noise.x * 100.0) * 0.2;
          modelPosition.z += cos(time * speed + modelPosition.x * noise.y * 100.0) * 0.2;
          modelPosition.x += cos(time * speed + modelPosition.x * noise.z * 100.0) * 0.2;
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPostion = projectionMatrix * viewPosition;
          gl_Position = projectionPostion;
          gl_PointSize = size * 25. * pixelRatio;
          gl_PointSize *= (1.0 / - viewPosition.z);
          vColor = color;
          vOpacity = opacity;
        }
      `,fragmentShader:`
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          gl_FragColor = vec4(vColor, strength * vOpacity);
          #include <tonemapping_fragment>
          #include <${l.f>=154?"colorspace_fragment":"encodings_fragment"}>
        }
      `})}get time(){return this.uniforms.time.value}set time(t){this.uniforms.time.value=t}get pixelRatio(){return this.uniforms.pixelRatio.value}set pixelRatio(t){this.uniforms.pixelRatio.value=t}}let u=t=>t&&t.constructor===Float32Array,f=t=>t instanceof a.wq||t instanceof a.cE||t instanceof a.$i,m=t=>Array.isArray(t)?t:f(t)?t.toArray():[t,t,t];function p(t,e,i){return r.useMemo(()=>{if(void 0!==e)if(u(e))return e;else{if(e instanceof a.Es){let r=Array.from({length:3*t},()=>[e.r,e.g,e.b]).flat();return Float32Array.from(r)}if(f(e)||Array.isArray(e)){let r=Array.from({length:3*t},()=>m(e)).flat();return Float32Array.from(r)}return Float32Array.from({length:t},()=>e)}return Float32Array.from({length:t},i)},[e])}let d=r.forwardRef(({noise:t=1,count:e=100,speed:l=1,opacity:f=1,scale:d=1,size:v,color:g,children:y,...h},x)=>{r.useMemo(()=>(0,n.f)({SparklesImplMaterial:c}),[]);let b=r.useRef(null),A=(0,s.f)(t=>t.viewport.dpr),P=m(d),E=r.useMemo(()=>Float32Array.from(Array.from({length:e},()=>P.map(a.rB.randFloatSpread)).flat()),[e,...P]),R=p(e,v,Math.random),j=p(e,f),z=p(e,l),C=p(3*e,t),M=p(void 0===g?3*e:e,u(g)?g:new a.Es(g),()=>1);return(0,i.f)(t=>{b.current&&b.current.material&&(b.current.material.time=t.clock.elapsedTime)}),r.useImperativeHandle(x,()=>b.current,[]),r.createElement("points",(0,o.f)({key:`particle-${e}-${JSON.stringify(d)}`},h,{ref:b}),r.createElement("bufferGeometry",null,r.createElement("bufferAttribute",{attach:"attributes-position",args:[E,3]}),r.createElement("bufferAttribute",{attach:"attributes-size",args:[R,1]}),r.createElement("bufferAttribute",{attach:"attributes-opacity",args:[j,1]}),r.createElement("bufferAttribute",{attach:"attributes-speed",args:[z,1]}),r.createElement("bufferAttribute",{attach:"attributes-color",args:[M,3]}),r.createElement("bufferAttribute",{attach:"attributes-noise",args:[C,3]})),y||r.createElement("sparklesImplMaterial",{transparent:!0,pixelRatio:A,depthWrite:!1}))});var v=t.i(17530),g=t.i(84984),y=t.i(26919),h=t.i(37493);let x=a.rB.damp;function b(){let t=(0,r.useRef)(new a.cE);return(0,i.f)(({camera:e,size:r},i)=>{let o=y.S.reduced?0:y.S.progress,a=o*Math.PI*.6,n=r.width/r.height<.8,s=(n?11.5:8.2)-3*o+(1-y.S.intro)*1.4;e.position.x=x(e.position.x,Math.sin(a)*s,4,i),e.position.z=x(e.position.z,Math.cos(a)*s,4,i),e.position.y=x(e.position.y,.6+.9*o,4,i),t.current.set(0,(n?.75:.15)+o*(g.y-.6),0),e.lookAt(t.current)}),null}function A({lite:t}){let o=(0,r.useRef)(null),a=(0,r.useRef)(null);return(0,i.f)((t,e)=>{if(!o.current||!a.current)return;let{pointer:r,intro:i,reduced:n}=y.S;n||(a.current.rotation.y+=.22*e),o.current.rotation.x=x(o.current.rotation.x,.12-.18*r.y,2.5,e),o.current.rotation.z=x(o.current.rotation.z,-(.12*r.x),2.5,e),o.current.position.y=-.35+(n?0:.05*Math.sin(.7*t.clock.elapsedTime)),o.current.scale.setScalar(.88+.12*i)}),(0,e.jsxs)("group",{ref:o,children:[(0,e.jsxs)("group",{ref:a,children:[(0,e.jsx)(g.L,{metal:"yellow",stone:"diamond",lite:t}),(0,e.jsx)(d,{count:t?14:28,position:[0,g.y-.1,0],scale:[1.1,.7,1.1],size:t?2.5:3.5,speed:.35,opacity:.9,color:"#FFF6E0"})]}),(0,e.jsx)(h.I,{})]})}t.s(["default",0,function({active:t,lite:r,reduced:i,onReady:o}){return(0,e.jsxs)(v.f,{active:t,onDemand:i,camera:{position:[0,.6,9.6],fov:30},onCreated:()=>o(),children:[(0,e.jsx)(b,{}),(0,e.jsx)(A,{lite:r}),(0,e.jsx)(h.g,{}),!r&&(0,e.jsx)(d,{count:40,scale:[9,5,4],size:1.6,speed:.15,opacity:.5,color:"#C9A96E"})]})}],1624)},47730,function(t){t.n(t.i(1624))}]);