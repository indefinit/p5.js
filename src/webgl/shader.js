var fs = require('fs');
var p5 = require('../core/core');

/**
 * Creates a shader program
 * @param {String} vertexShader a vertex shader
 * @param {String} fragmentShader a frag shader
 * @return {p5.Shader} [description]
 */
p5.prototype.createShader = function(){
  var args = new Array(arguments.length);
  for (var i = 0; i < args.length; ++i) {
    args[i] = arguments[i];
  }
  return new p5.Shader(args);
};
//@todo
p5.prototype.loadShader = function(vert,frag){
  return this;
};
//@todo
p5.prototype.shader = function(shaderProgram){
  return this;
};

p5.Shader = function(){
  //@todo
  return this;
};

/**
 * @todo
 */
p5.Shader.prototype.setUniform = function(){};

/**
 * @todo
 */
p5.Shader.prototype.setDefine = function(){};

module.exports = {
  immediateVert:
    fs.readFileSync(__dirname + '/shaders/immediate.vert', 'utf-8'),
  vertexColorVert:
    fs.readFileSync(__dirname + '/shaders/vertexColor.vert', 'utf-8'),
  vertexColorFrag:
    fs.readFileSync(__dirname + '/shaders/vertexColor.frag', 'utf-8'),
  normalVert:
    fs.readFileSync(__dirname + '/shaders/normal.vert', 'utf-8'),
  normalFrag:
    fs.readFileSync(__dirname + '/shaders/normal.frag', 'utf-8'),
  basicFrag:
    fs.readFileSync(__dirname + '/shaders/basic.frag', 'utf-8'),
  lightVert:
    fs.readFileSync(__dirname + '/shaders/light.vert', 'utf-8'),
  lightTextureFrag:
    fs.readFileSync(__dirname + '/shaders/light_texture.frag', 'utf-8'),
  lightFrag:
    fs.readFileSync(__dirname + '/shaders/light.frag', 'utf-8')
};