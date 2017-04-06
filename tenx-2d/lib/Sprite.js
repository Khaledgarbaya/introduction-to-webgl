const vertexShaderSrc = `attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
   vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
   }
   `
const fragmentShaderSrc = `precision mediump float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   gl_FragColor = texture2D(u_image, v_texCoord);
}`
export default class Sprite {
  constructor (gl, image, width = 200, height = 200) {
    this.image = image
    this.gl = gl
    this.x = 0
    this.y = 0
    this.width = width
    this.height = height
    this.init()
  }
  init () {
    this.program = this.createProgram(vertexShaderSrc, fragmentShaderSrc)
    // look up where the vertex data needs to go.
    this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position')
    this.texcoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord')

    // Create a buffer to put three 2d clip space points in
    this.positionBuffer = this.gl.createBuffer()

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
    // Set a rectangle the same size as the image.
    this.setRectangle(this.gl, this.x, this.y, this.width, this.height)

    // provide texture coordinates for the rectangle.
    this.texcoordBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]), this.gl.STATIC_DRAW)

    // Create a texture.
    this.texture = this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)

    // Set the parameters so we can render any size image.
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)

    // Upload the image into the texture.
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image)

    // lookup uniforms
    this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution')

    // Tell WebGL how to convert from clip space to pixels
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
  }

  render () {
    // Clear the canvas
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
    // Set a rectangle the same size as the image.
    this.setRectangle(this.gl, this.x, this.y, this.width, this.height)

    // Tell it to use our program (pair of shaders)
    this.gl.useProgram(this.program)

    // Turn on the position attribute
    this.gl.enableVertexAttribArray(this.positionLocation)

    // Bind the position buffer.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2          // 2 components per iteration
    var type = this.gl.FLOAT  // the data is 32bit floats
    var normalize = false // don't normalize the data
    var stride = 0        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0        // start at the beginning of the buffer
    this.gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset)

    // Turn on the teccord attribute
    this.gl.enableVertexAttribArray(this.texcoordLocation)

    // Bind the position buffer.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texcoordBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]), this.gl.STATIC_DRAW)
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    size = 2          // 2 components per iteration
    type = this.gl.FLOAT   // the data is 32bit floats
    normalize = false // don't normalize the data
    stride = 0       // 0 = move forward size * sizeof(type) each iteration to get the next position
    offset = 0       // start at the beginning of the buffer
    this.gl.vertexAttribPointer(this.texcoordLocation, size, type, normalize, stride, offset)

    // set the resolution
    this.gl.uniform2f(this.resolutionLocation, this.gl.canvas.width, this.gl.canvas.height)

    // Draw the rectangle.
    var primitiveType = this.gl.TRIANGLES
    offset = 0
    var count = 6
    this.gl.drawArrays(primitiveType, offset, count)
  }

  setRectangle (gl, x, y, width, height) {
    var x1 = x
    var x2 = x + width
    var y1 = y
    var y2 = y + height
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2
    ]), this.gl.STATIC_DRAW)
  }
  createProgram (vShaderSrc, fShaderSrc) {
    var vShader = this.gl.createShader(this.gl.VERTEX_SHADER)
    this.gl.shaderSource(vShader, vShaderSrc)
    this.gl.compileShader(vShader)
    // Same for the fragment shader
    var fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
    this.gl.shaderSource(fShader, fShaderSrc)
    this.gl.compileShader(fShader)

    var program = this.gl.createProgram()
    this.gl.attachShader(program, vShader)
    this.gl.attachShader(program, fShader)
    this.gl.linkProgram(program)
    return program
  }
}
