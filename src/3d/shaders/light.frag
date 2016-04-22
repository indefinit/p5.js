//lightFrag
precision mediump float;

uniform vec4 uMaterialColor;
uniform sampler2D uSampler;
uniform bool isTexture;

varying vec3 vLightWeighting;
varying highp vec2 vVertTexCoord;

void main(void) {
  gl_FragColor = vec4(vec3(uMaterialColor.rgb * vLightWeighting), uMaterialColor.a);
}