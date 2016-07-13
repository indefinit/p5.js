attribute vec3 aPosition;
attribute vec3 aBaryCentric;
attribute vec4 aVertexFillColor;
attribute vec4 aVertexStrokeColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uResolution;
uniform float uPointSize;

varying vec4 vFillColor;
varying vec4 vStrokeColor;
varying vec3 vBC;

void main(void) {
  vec4 positionVec4 = vec4(aPosition / uResolution *vec3(1.0, -1.0, 1.0), 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
  vFillColor = aVertexFillColor;
  vStrokeColor = aVertexStrokeColor;
  vBC = aBaryCentric;
  gl_PointSize = uPointSize;
}
