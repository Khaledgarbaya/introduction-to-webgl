function start () {
  // ==============================================
  // 1. Request Context
  // ==============================================
  var canvas = document.getElementById('glCanvas')
  // Try to grab the standard context. If it fails
  // fallback to experimental,because browsers ¯\_(ツ)_/¯
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  // Only continue if WebGL is available and working
  if (!gl) {
    return
  }
  // ==============================================
  // 2. Configure Context
  // ==============================================
  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  // Enable depth testing
  gl.enable(gl.DEPTH_TEST)
  // Near things obscure far things
  gl.depthFunc(gl.LEQUAL)
  // Clear the color as well as the depth buffer.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  // This is a very important step, most of the webgl newbies miss this
  // (x, y, width, height)
  gl.viewport(0, 0, canvas.width, canvas.height)
  // ==============================================
  // 3. Create Shaders & link Program
  // ==============================================
  var vsSrc = `
    attribute vec3 aVertexPosition;
    void main(void) {
      gl_Position = vec4(aVertexPosition, 1.0);
    }
  `
  var fsSrc = `
    void main(void) {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `
  var vShader = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vShader, vsSrc)
  gl.compileShader(vShader)
  // Same for the fragment shader
  var fShader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fShader, fsSrc)
  gl.compileShader(fShader)

  var program = gl.createProgram()
  gl.attachShader(program, vShader)
  gl.attachShader(program, fShader)
  gl.linkProgram(program)

  // ==============================================
  // 4. Create Buffer
  // ==============================================
  var triangleVertices = [
    // X, Y, Z
    0.0, 0.5, 0.0,
    -0.5, -0.5, 0.0,
    0.5, -0.5, 0.0
  ]

  var triangleVertexBufferObject = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW)

  var positionAttribLocation = gl.getAttribLocation(program, 'aVertexPosition')
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // Number of elements per attribute
    gl.FLOAT, // Type of elements
    gl.FALSE,
    3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
    0 // Offset from the beginning of a single vertex to this attribute
  )

  gl.enableVertexAttribArray(positionAttribLocation)

  // ==============================================
  // 5. Draw
  // ==============================================
  gl.useProgram(program)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}
window.addEventListener('load', start, false)
