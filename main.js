import gsap from 'gsap'
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import * as dat from 'dat.gui'
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'

const gui = new dat.GUI()
const world ={
  plane:{
    width: 20,
    height:20,
    widthSegments:25,
    heightSegments:25
  }
}

gui.add(world.plane, 'width', 1, 50).onChange(generatePlane)

gui.add(world.plane, 'height', 1, 50).onChange(generatePlane)

gui.add(world.plane, 'widthSegments', 1, 50).onChange(generatePlane)

gui.add(world.plane, 'heightSegments', 1, 50).onChange(generatePlane)

function generatePlane(){
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments)

  const {array} = planeMesh.geometry.attributes.position

  const randomValues =[]

  for ( let i=0; i<array.length; i++){

    if ( i%3 ===0){
      const x =array[i]
      const y =array[i+1]
      const z =array[i+2]

    array[i] = x+(Math.random()-0.5)
    array[i+1] = y+(Math.random()-0.5)
    array[i+2] = z+Math.random()

    }

    randomValues.push(Math.random()* Math.PI*2)
}

planeMesh.geometry.attributes.position.randomValues = randomValues

planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array

const colors = []
    for ( let i=0; i< planeMesh.geometry.attributes.position.count; i++){
      colors.push(0,0.19,0.4)
}

planeMesh.geometry.setAttribute('color',
  new THREE.BufferAttribute(new Float32Array(colors), 3))
}
const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)

document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)
camera.position.z = 5

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments)

const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true})

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(planeMesh)
generatePlane()

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)

const mouse ={
  x: undefined,
  y: undefined
}

let frame = 0

function animate(){
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  raycaster.setFromCamera(mouse, camera)
  frame +=0.01
  const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
  for (let i=0; i< array.length; i+=3){
    array[i] = originalPosition[i] + Math.cos(frame+ randomValues[i]) *0.002
  }

  planeMesh.geometry.attributes.position.needsUpdate = true
  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length>0){

    const {color} = intersects[0].object.geometry.attributes

    color.setX(intersects[0].face.a, 0.1)
    color.setY(intersects[0].face.a,0.5)
    color.setZ(intersects[0].face.a, 1)

    color.setX(intersects[0].face.b, 0.1)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 1)

    color.setX(intersects[0].face.c, 0.1)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 1)

    intersects[0].object.geometry.attributes.color.needsUpdate = true

    const initialColor ={
      r:0,
      g: .19,
      b:.4
    }

    const hoverColor ={
      r:.1,
      g: .5,
      b:1
    }
    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b:initialColor.b,
      onUpdate: ()=> {
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a,hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)

        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
        color.needsUpdate = true
      }
    })
  }
}

animate()

addEventListener('mousemove', (event)=>{
  mouse.x = (event.clientX /innerWidth)*2-1
  mouse.y = -(event.clientY /innerHeight) *2+1
})