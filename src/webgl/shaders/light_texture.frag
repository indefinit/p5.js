//lightTextureFrag
precision mediump float;

uniform vec4 uMaterialColor;

#ifdef IS_TEXTURE
uniform sampler2D uSampler;
varying highp vec2 vVertTexCoord;
#endif

varying vec3 vLightWeighting;

void main(void) {
#ifdef IS_TEXTURE
  vec4 textureColor = texture2D(uSampler, vVertTexCoord);
  if(vLightWeighting == vec3(0., 0., 0.)){
    gl_FragColor = textureColor;
  }else{
    gl_FragColor = vec4(vec3(textureColor.rgb * vLightWeighting), textureColor.a); 
  }
#else
  gl_FragColor = vec4(vec3(uMaterialColor.rgb * vLightWeighting), uMaterialColor.a);
#endif
}