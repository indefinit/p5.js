precision mediump float;
#extension GL_OES_standard_derivatives : enable
varying vec4 vFillColor;
varying vec4 vStrokeColor;
varying vec3 vBC;

float edgeFactor(){
  vec3 d = fwidth(vBC);
  vec3 a3 = smoothstep(vec3(0.0), d*1.5, vBC);
  return min(min(a3.x, a3.y), a3.z);
}
// float edgeFactor() {
//   vec3 d = fwidth( vBC.xyz );
//   vec3 a3 = smoothstep( vec3( 0.0 ), d * 1.5, vBC.xyz );
//   return min( min( a3.x, a3.y ), a3.z );
// }

void main(void) {
  gl_FragColor.rgb = vec3(mix( vStrokeColor.rgb, vFillColor.rgb, edgeFactor() ));
  gl_FragColor.a = 1.0;
  //gl_FragColor.rgb = mix(vStrokeColor, vFillColor, edgeFactor());
  // if(gl_FrontFacing){
  //   gl_FragColor = vec4(0.0, 0.0, 0.0, (1.0-edgeFactor())*0.95);
  // }
  // else{
  //   gl_FragColor = vec4(0.0, 0.0, 0.0, (1.0-edgeFactor())*0.7);
  // }
  //gl_FragColor = vColor;
}