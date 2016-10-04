'use strict';

var p5 = require('../core/core');
require('./p5.RendererGL');

/**
 * p5 Shader class
 * @constructor
 * @param  {String} fragShader Source code of a fragment shader as
 * @param  {String} vertShader Source code of a vertex shader as a string
 *
 */
p5.Shader = function(fragSource, vertSource){
  this._uniforms = {};
  this.defines = {};
  this.fragSource = fragSource;
  this.vertSource = vertSource;
};

/**
 * @param {String} name The name of the define.
 * @param {String | Boolean} data The data to set in the define.
 */
p5.Shader.prototype.setDefine = function(key, val){
  this.defines[key] = val;
  return this;
};

/**
 * @param {String} name The name of the uniform.
 * @param {Number | String | Object} data The data to set in the uniform.
 *                  This can take many
 *                   different forms.
 */
p5.Shader.prototype.setUniform = function() {
  var args = new Array(arguments.length);
  for (var i = 0; i < args.length; ++i) {
    args[i] = arguments[i];
  }
  var uName = args.shift();
  var uType;
  if(typeof args[args.length - 1] === 'string') {
    uType = args.pop();
  }
  var uData = args.length === 1 ? args[0] : args;

  if(typeof uData === 'number') { // If this is a floating point number
    uType = uType || '1f';
  } else if(Array.isArray(uData) && uData.length <= 4) {
    uType = uData.length + 'fv';
  } else if(uData instanceof p5.Vector) {
    uType = '3fv';
  } else if(uData instanceof p5.Color) {
    uType = '4fv';
  } else if(uData instanceof p5.Matrix) {
    if('mat3' in uData) {
      uType = 'Matrix3fv';
    } else {
      uType = 'Matrix4fv';
    }
  } else if(uData instanceof p5.Graphics ||
            uData instanceof p5.Image ||
            (typeof p5.MediaElement !== 'undefined' &&
             uData instanceof p5.MediaElement)) {
    uType = 'texture';
  } else {
    console.error('Didn\'t recognize the type of this uniform.');
  }

  if(!(uName in this._uniforms)) {
    this._uniforms[uName] = {};
    this._uniforms[uName].type = uType;
    this._uniforms[uName].data = uData;
    this._uniforms[uName].location = [];
  } else {
    this._uniforms[uName].data = uData;
  }
  return this;
};

/**
 * @param {String} name The name of the uniform.
 */
p5.Shader.prototype.getUniform = function(uName)
{
  return this._uniforms[uName].data || false;
};

module.exports = p5.Shader;