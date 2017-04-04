export default class Stage {
  constructor (canvas) {
    this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    this.gl.viewport(0, 0, canvas.width, canvas.height)
    this.children = []
  }

  render () {
    this.children.forEach((child) => child.render(this.gl))
  }

  addChild (child) {
    this.children.push(child)
  }

  removeChild (child) {
    this.children.slice()
  }

}
