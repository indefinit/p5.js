'use strict';

var p5 = require('../core/core');
var shader = require('./shader');
require('../core/p5.Renderer');
require('./p5.Matrix');
var uMVMatrixStack = [];
var RESOLUTION = 1000;

//@TODO should implement public method
//to override these attributes
var attributes = {
  alpha: true,
  depth: true,
  stencil: true,
  antialias: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false
};

/**
 * @class p5.RendererGL
 * @constructor
 * @extends p5.Renderer
 * 3D graphics class.
 * @todo extend class to include public method for offscreen
 * rendering (FBO).
 *
 */
p5.RendererGL = function(elt, pInst, isMainCanvas) {
  p5.Renderer.call(this, elt, pInst, isMainCanvas);
  this._initContext();

  this.isP3D = true; //lets us know we're in 3d mode
  this.GL = this.drawingContext;
  //lights
  this.ambientLightCount = 0;
  this.directionalLightCount = 0;
  this.pointLightCount = 0;
  //camera
  this._isSetCamera = false;

  /**
   * Uniforms object. This is a key-value pair for storing data associated with
   * various uniforms. Use _getUniform and _setUniform to manipulate this.
   */
  this._uniforms = Object.create(null);
  this._setUniform('uResolution', RESOLUTION);
  this._setUniform('uModelViewMatrix', new p5.Matrix());
  this._setUniform('uProjectionMatrix', new p5.Matrix());
  this._setUniform('uNormalMatrix', new p5.Matrix('mat3'));
  //TODO: Possibly Normal Matrix doesn't work in immediate mode? Investigate.

  //Geometry & Material hashes
  this.gHash = {};
  this.mHash = {};
  //Imediate Mode
  //default drawing is done in Retained Mode
  this.isImmediateDrawing = false;
  this.immediateMode = {};
  this.curFillColor = [0.5,0.5,0.5,1.0];
  this.curStrokeColor = [0.5,0.5,0.5,1.0];
  this.pointSize = 5.0;//default point/stroke
  return this;
};

p5.RendererGL.prototype = Object.create(p5.Renderer.prototype);

//////////////////////////////////////////////
// Setting
//////////////////////////////////////////////

p5.RendererGL.prototype._initContext = function() {
  try {
    this.drawingContext = this.canvas.getContext('webgl', attributes) ||
      this.canvas.getContext('experimental-webgl', attributes);
    if (this.drawingContext === null) {
      throw new Error('Error creating webgl context');
    } else {
      console.log('p5.RendererGL: enabled webgl context');
      var gl = this.drawingContext;
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
  } catch (er) {
    throw new Error(er);
  }
};
//detect if user didn't set the camera
//then call this function below
p5.RendererGL.prototype._setDefaultCamera = function(){
  if(!this._isSetCamera){
    var _w = this.width;
    var _h = this.height;
    this._setUniform('uProjectionMatrix', p5.Matrix.identity());
    this._getUniform('uProjectionMatrix').perspective(60 / 180 * Math.PI,
                                                      _w / _h, 0.1, 100);
    this._isSetCamera = true;
  }
};

p5.RendererGL.prototype._update = function() {
  this._setUniform('uModelViewMatrix', p5.Matrix.identity());
  this.translate(0, 0, -800);
  this.ambientLightCount = 0;
  this.directionalLightCount = 0;
  this.pointLightCount = 0;
};

/**
 * [background description]
 * @return {[type]} [description]
 */
p5.RendererGL.prototype.background = function() {
  var gl = this.GL;
  var _col = this._pInst.color.apply(this._pInst, arguments);
  var _r = (_col.levels[0]) / 255;
  var _g = (_col.levels[1]) / 255;
  var _b = (_col.levels[2]) / 255;
  var _a = (_col.levels[3]) / 255;
  gl.clearColor(_r, _g, _b, _a);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

//@TODO implement this
// p5.RendererGL.prototype.clear = function() {
//@TODO
// };

//////////////////////////////////////////////
// SHADER
//////////////////////////////////////////////

/**
 * [_initShaders description]
 * @param  {string} vertId [description]
 * @param  {string} fragId [description]
 * @return {[type]}        [description]
 */
p5.RendererGL.prototype._initShaders =
function(vertId, fragId, isImmediateMode) {
  var gl = this.GL;
  //set up our default shaders by:
  // 1. create the shader,
  // 2. load the shader source,
  // 3. compile the shader
  var _vertShader = gl.createShader(gl.VERTEX_SHADER);
  //load in our default vertex shader
  gl.shaderSource(_vertShader, shader[vertId]);
  gl.compileShader(_vertShader);
  // if our vertex shader failed compilation?
  if (!gl.getShaderParameter(_vertShader, gl.COMPILE_STATUS)) {
    alert('Yikes! An error occurred compiling the shaders:' +
      gl.getShaderInfoLog(_vertShader));
    return null;
  }

  var _fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  //load in our material frag shader
  gl.shaderSource(_fragShader, shader[fragId]);
  gl.compileShader(_fragShader);
  // if our frag shader failed compilation?
  if (!gl.getShaderParameter(_fragShader, gl.COMPILE_STATUS)) {
    alert('Darn! An error occurred compiling the shaders:' +
      gl.getShaderInfoLog(_fragShader));
    return null;
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, _vertShader);
  gl.attachShader(shaderProgram, _fragShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Snap! Error linking shader program');
  }
  //END SHADERS SETUP

  this._getLocation(shaderProgram, isImmediateMode);

  return shaderProgram;
};

p5.RendererGL.prototype._getLocation =
function(shaderProgram, isImmediateMode) {
  var gl = this.GL;
  gl.useProgram(shaderProgram);

  //@TODO: figure out a better way instead of if statement
  if(isImmediateMode === undefined){
    shaderProgram.samplerUniform =
    gl.getUniformLocation(shaderProgram, 'uSampler');
  }
};

/**
 * @param {Object} [uniformsObj] An optional object where the uniform data is
 *                               saved. Default is the RendererGL global
 *                               uniforms object.
 * @param {String} name The name of the uniform.
 */
p5.RendererGL.prototype._getUniform = function()
{
  var uObj;
  var uName;
  if(typeof arguments[0] === 'object') {
    uObj = arguments[0];
    uName = arguments[1];
  } else {
    uObj = this._uniforms;
    uName = arguments[0];
  }
  return uObj[uName].data;
};

/**
 * @param {Object} [uniformsObj] An optional object where the uniform data will
 *                               be saved. Default is the RendererGL global
 *                               uniforms object.
 * @param {String} name The name of the uniform.
 * @param {any} data The data to set in the uniform. This can take many
 *                   different forms. See p5.Shader.setUniform for full
 *                   documentation.
 */
p5.RendererGL.prototype._setUniform = function()
{
  var args = Array.prototype.slice.call(arguments);
  var uObj;

  if(typeof args[0] === 'object') {
    uObj = args.shift();
  } else {
    uObj = this._uniforms;
  }

  var uName = args.shift();
  var uData = args.length === 1 ? args[0] : args;
  var uType;

  if(typeof uData === 'number') { // If this is a floating point number
    uType = '1f';
  } else if(Array.isArray(uData) && uData.length <= 4) {
    uType = uData.length + 'fv';
  } else if(uData instanceof p5.Matrix) {
    if('mat3' in uData) {
      uType = 'Matrix3fv';
    } else {
      uType = 'Matrix4fv';
    }
  } else {
    console.error('Didn\'t recognize the type of this uniform.');
  }

  if(!(uName in uObj)) {
    uObj[uName] = {};
    uObj[uName].type = uType;
    uObj[uName].data = uData;
  } else {
    uObj[uName].data = uData;
  }
};

/**
 * Apply saved uniforms to specified shader.
 */
p5.RendererGL.prototype._applyUniforms = function(shaderKey, uniformsObj)
{
  var gl = this.GL;
  var shaderProgram = this.mHash[shaderKey];
  var uObj = uniformsObj !== undefined ? uniformsObj : this._uniforms;

  for(var uName in uObj) {
    //TODO: eventually, we should probably cache this
    var location = gl.getUniformLocation(shaderProgram, uName);
    var data;

    var type = uObj[uName].type;
    var functionName = 'uniform' + type;
    if(type.substring(0, 6) === 'Matrix') {
      if(type === 'Matrix3fv') {
        data = uObj[uName].data.mat3;
      } else {
        data = uObj[uName].data.mat4;
      }
      gl[functionName](location, false, data);
    } else {
      data = uObj[uName].data;
      gl[functionName](location, data);
    }
  }
};
//////////////////////////////////////////////
// GET CURRENT | for shader and color
//////////////////////////////////////////////
p5.RendererGL.prototype._getShader = function(vertId, fragId, isImmediateMode) {
  var mId = vertId + '|' + fragId;
  //create it and put it into hashTable
  if(!this.materialInHash(mId)){
    var shaderProgram = this._initShaders(vertId, fragId, isImmediateMode);
    this.mHash[mId] = shaderProgram;
  }
  this.curShaderId = mId;

  return this.mHash[this.curShaderId];
};

p5.RendererGL.prototype._getCurShaderId = function(){
  //if the shader ID is not yet defined
  var mId, shaderProgram;
  if(this.drawMode !== 'fill' && this.curShaderId === undefined){
    //default shader: normalMaterial()
    mId = 'normalVert|normalFrag';
    shaderProgram = this._initShaders('normalVert', 'normalFrag');
    this.mHash[mId] = shaderProgram;
    this.curShaderId = mId;
  } else if(this.isImmediateDrawing && this.drawMode === 'fill'){
    mId = 'immediateVert|vertexColorFrag';
    shaderProgram = this._initShaders('immediateVert', 'vertexColorFrag');
    this.mHash[mId] = shaderProgram;
    this.curShaderId = mId;
  }
  return this.curShaderId;
};

//////////////////////////////////////////////
// COLOR
//////////////////////////////////////////////
/**
 * Basic fill material for geometry with a given color
 * @method  fill
 * @param  {Number|Array|String|p5.Color} v1  gray value,
 * red or hue value (depending on the current color mode),
 * or color Array, or CSS color string
 * @param  {Number}            [v2] optional: green or saturation value
 * @param  {Number}            [v3] optional: blue or brightness value
 * @param  {Number}            [a]  optional: opacity
 * @return {p5}                the p5 object
 * @example
 * <div>
 * <code>
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 * }
 *
 * function draw(){
 *  background(0);
 *  fill(250, 0, 0);
 *  rotateX(frameCount * 0.01);
 *  rotateY(frameCount * 0.01);
 *  rotateZ(frameCount * 0.01);
 *  box(200, 200, 200);
 * }
 * </code>
 * </div>
 */
p5.RendererGL.prototype.fill = function(v1, v2, v3, a) {
  var gl = this.GL;
  var shaderProgram;
  //see material.js for more info on color blending in webgl
  var colors = this._applyColorBlend(v1,v2,v3,a);
  this.curFillColor = colors;
  this.drawMode = 'fill';
  if(this.isImmediateDrawing){
    shaderProgram =
    this._getShader('immediateVert','vertexColorFrag');
    gl.useProgram(shaderProgram);
  } else {
    shaderProgram =
    this._getShader('normalVert', 'basicFrag');
    gl.useProgram(shaderProgram);
    //RetainedMode uses a webgl uniform to pass color vals
    //in ImmediateMode, we want access to each vertex so therefore
    //we cannot use a uniform.
    shaderProgram.uMaterialColor = gl.getUniformLocation(
      shaderProgram, 'uMaterialColor' );
    gl.uniform4f( shaderProgram.uMaterialColor,
      colors[0],
      colors[1],
      colors[2],
      colors[3]);
  }
  return this;
};
p5.RendererGL.prototype.stroke = function(r, g, b, a) {
  var color = this._pInst.color.apply(this._pInst, arguments);
  var colorNormalized = color._array;
  this.curStrokeColor = colorNormalized;
  this.drawMode = 'stroke';
  return this;
};

//@TODO
p5.RendererGL.prototype._strokeCheck = function(){
  if(this.drawMode === 'stroke'){
    throw new Error(
      'stroke for shapes in 3D not yet implemented, use fill for now :('
    );
  }
};

/**
 * [strokeWeight description]
 * @param  {Number} pointSize stroke point size
 * @return {[type]}           [description]
 * @todo  strokeWeight currently works on points only.
 * implement on all wireframes and strokes.
 */
p5.RendererGL.prototype.strokeWeight = function(pointSize) {
  this.pointSize = pointSize;
  return this;
};
//////////////////////////////////////////////
// HASH | for material and geometry
//////////////////////////////////////////////

p5.RendererGL.prototype.geometryInHash = function(gId){
  return this.gHash[gId] !== undefined;
};

p5.RendererGL.prototype.materialInHash = function(mId){
  return this.mHash[mId] !== undefined;
};

/**
 * [resize description]
 * @param  {[type]} w [description]
 * @param  {[tyoe]} h [description]
 * @return {[type]}   [description]
 */
p5.RendererGL.prototype.resize = function(w,h) {
  var gl = this.GL;
  p5.Renderer.prototype.resize.call(this, w, h);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
};

/**
 * clears color and depth buffers
 * with r,g,b,a
 * @param {Number} r normalized red val.
 * @param {Number} g normalized green val.
 * @param {Number} b normalized blue val.
 * @param {Number} a normalized alpha val.
 */
p5.RendererGL.prototype.clear = function() {
  var gl = this.GL;
  gl.clearColor(arguments[0],
    arguments[1],
    arguments[2],
    arguments[3]);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

/**
 * [translate description]
 * @param  {[type]} x [description]
 * @param  {[type]} y [description]
 * @param  {[type]} z [description]
 * @return {[type]}   [description]
 * @todo implement handle for components or vector as args
 */
p5.RendererGL.prototype.translate = function(x, y, z) {
  //@TODO: figure out how to fit the resolution
  x = x / RESOLUTION;
  y = -y / RESOLUTION;
  z = z / RESOLUTION;
  this._getUniform('uModelViewMatrix').translate([x,y,z]);
  return this;
};

/**
 * Scales the Model View Matrix by a vector
 * @param  {Number | p5.Vector | Array} x [description]
 * @param  {Number} [y] y-axis scalar
 * @param  {Number} [z] z-axis scalar
 * @return {this}   [description]
 */
p5.RendererGL.prototype.scale = function(x,y,z) {
  this._getUniform('uModelViewMatrix').scale([x,y,z]);
  return this;
};

/**
 * [rotate description]
 * @param  {Number} rad  angle in radians
 * @param  {p5.Vector | Array} axis axis to rotate around
 * @return {p5.RendererGL}      [description]
 */
p5.RendererGL.prototype.rotate = function(rad, axis){
  this._getUniform('uModelViewMatrix').rotate(rad, axis);
  this._getUniform('uNormalMatrix').inverseTranspose(
                                      this._getUniform('uModelViewMatrix'));
  return this;
};

/**
 * [rotateX description]
 * @param  {Number} rad radians to rotate
 * @return {[type]}     [description]
 */
p5.RendererGL.prototype.rotateX = function(rad) {
  this.rotate(rad, [1,0,0]);
  return this;
};

/**
 * [rotateY description]
 * @param  {Number} rad rad radians to rotate
 * @return {[type]}     [description]
 */
p5.RendererGL.prototype.rotateY = function(rad) {
  this.rotate(rad, [0,1,0]);
  return this;
};

/**
 * [rotateZ description]
 * @param  {Number} rad rad radians to rotate
 * @return {[type]}     [description]
 */
p5.RendererGL.prototype.rotateZ = function(rad) {
  this.rotate(rad, [0,0,1]);
  return this;
};

/**
 * pushes a copy of the model view matrix onto the
 * MV Matrix stack.
 * NOTE to self: could probably make this more readable
 * @return {[type]} [description]
 */
p5.RendererGL.prototype.push = function() {
  uMVMatrixStack.push(this._getUniform('uModelViewMatrix').copy());
};

/**
 * [pop description]
 * @return {[type]} [description]
 */
p5.RendererGL.prototype.pop = function() {
  if (uMVMatrixStack.length === 0) {
    throw new Error('Invalid popMatrix!');
  }
  this._setUniform('uModelViewMatrix', uMVMatrixStack.pop());
};

p5.RendererGL.prototype.resetMatrix = function() {
  this._setUniform('uModelViewMatrix', p5.Matrix.identity());
  this.translate(0, 0, -800);
  return this;
};

// Text/Typography
// @TODO:
p5.RendererGL.prototype._applyTextProperties = function() {
  //@TODO finish implementation
  console.error('text commands not yet implemented in webgl');
};
module.exports = p5.RendererGL;
