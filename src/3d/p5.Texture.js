/**
 * TODO WIP, SORRY!!
 * 
 */
// 'use strict';

// var p5 = require('../core/core');

// p5.Texture = function(){
//   var image;
//   if(arguments[0] instanceof p5){

//   } else {
//     image = arguments[1];
//   }

//   var gl = this._graphics.GL;
//   var shaderProgram = this._graphics.getShader('normalVert',
//     'textureFrag');
//   gl.useProgram(shaderProgram);
//   //create a texture on the graphics card
//   var tex = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, tex);
//   if(!this._isPowerOf2(image.width) || !this._isPowerOf2(image.height)){
//     image.width = _nextHighestPOT(image.width);
//     image.height = _nextHighestPOT(image.height);
//   }
//   if (image instanceof p5.Image) {
//     image.loadPixels();
//     var data = new Uint8Array(image.pixels);
//     gl.texImage2D(gl.TEXTURE_2D, 0,
//       gl.RGBA, image.width, image.height,
//       0, gl.RGBA, gl.UNSIGNED_BYTE, data);
//   }
//   //if param is a video
//   else if (image instanceof p5.MediaElement){
//     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
//     gl.UNSIGNED_BYTE, image.elt);
//   }
//   else {
//     //@TODO handle following cases:
//     //- 2D canvas (p5 inst)
//   }
  
//   if (this._isPowerOf2(image.width) && this._isPowerOf2(image.height)) {
//     gl.generateMipmap(gl.TEXTURE_2D);
//   } else {
//     image.width = this._nextHighestPOT(image.width);
//     image.height = this._nextHighestPOT(image.height);
//     gl.texParameteri(gl.TETXURE_2D,
//       gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//     gl.texParameteri(gl.TETXURE_2D,
//       gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//     gl.texParameteri(gl.TETXURE_2D,
//       gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//   }

//   gl.bindTexture(gl.TEXTURE_2D, tex);
//   gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uSampler'), 0);
//   return this;
// };

// /**
//  * Helper functions; Checks whether val is a pot
//  * more info on power of 2 here:
//  * https://www.opengl.org/wiki/NPOT_Texture
//  * @param  {Number}  value
//  * @return {Boolean}
 
// p5.Texture.prototype._isPowerOf2 = function(value){
//   return (value & (value - 1)) === 0;
// };

// /**
//  * returns the next highest power of 2 value
//  * @param  {Number} value [description]
//  * @return {Number}       [description]
//  */
// p5.Texture.prototype._nextHighestPOT = function(value){
//     --value;
//     for (var i = 1; i < 32; i <<= 1) {
//         value = value | value >> i;
//     }
//     return value + 1;
// };

// module.exports = p5.Texture;